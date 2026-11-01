import CarPlay
import UIKit

@MainActor
final class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    private weak var interface: CPInterfaceController?
    private let surahs = CarAudioData.bundled("surahs", as: [CarSurah].self) ?? []
    private let books = CarAudioData.bundled("books", as: [CarBook].self) ?? []
    private var recordings: [CarRecording] = []
    private var libraryTemplate: CPListTemplate?
    private var prayerTemplate: CPListTemplate?
    private var observers: [NSObjectProtocol] = []
    private var refreshTask: Task<Void, Never>?
    private var prayerTimer: Timer?
    private let defaults = UserDefaults(suiteName: "group.com.qurancoach.app") ?? .standard
    private var cacheURL: URL { FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("car-audio-catalog.json") }

    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didConnect interfaceController: CPInterfaceController) {
        interface = interfaceController
        CarAudioPlayer.shared.install()
        if let data = try? Data(contentsOf: cacheURL), let items = try? JSONDecoder().decode([CarRecording].self, from: data) { recordings = CarAudioData.unique(items) }
        let quran = quranMenu(); quran.tabTitle = "Coran"; quran.tabImage = UIImage(systemName: "book.closed")
        let library = CPListTemplate(title: "Livres audio", sections: librarySections())
        library.tabTitle = "Livres"; library.tabImage = UIImage(systemName: "books.vertical"); libraryTemplate = library
        let prayers = CPListTemplate(title: "Adhan et Iqama", sections: prayerSections())
        prayers.tabTitle = "Prières"; prayers.tabImage = UIImage(systemName: "moon.stars"); prayerTemplate = prayers
        interfaceController.setRootTemplate(CPTabBarTemplate(templates: [quran, library, prayers]), animated: false, completion: nil)
        observers.append(NotificationCenter.default.addObserver(forName: .carPrayerChanged, object: nil, queue: .main) { [weak self] _ in
            Task { @MainActor in self?.refreshPrayers() }
        })
        prayerTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in Task { @MainActor in self?.refreshPrayers() } }
        refreshTask = Task { await refreshLibrary() }
    }

    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        refreshTask?.cancel(); refreshTask = nil; prayerTimer?.invalidate(); prayerTimer = nil
        observers.forEach(NotificationCenter.default.removeObserver); observers = []
        interface = nil; libraryTemplate = nil; prayerTemplate = nil
        // Disconnecting a display must not destroy an ongoing queue.
    }

    private func item(_ text: String, detail: String? = nil, symbol: String? = nil, action: (() -> Void)? = nil) -> CPListItem {
        let row = CPListItem(text: text, detailText: detail, image: symbol.flatMap(UIImage.init(systemName:)))
        row.isEnabled = action != nil
        if let action { row.handler = { _, complete in action(); complete() } }
        return row
    }
    private func show(_ template: CPTemplate) { interface?.pushTemplate(template, animated: true, completion: nil) }
    private func showPlaying() { if interface?.topTemplate !== CPNowPlayingTemplate.shared { show(CPNowPlayingTemplate.shared) } }
    private var reciter: CarReciter { CarReciter.all.first { $0.id == defaults.string(forKey: "car.reciter") } ?? CarReciter.all[0] }

    private func quranMenu() -> CPListTemplate {
        var items: [CPListItem] = []
        if CarAudioPlayer.shared.current != nil {
            items.append(item("À l’écoute", detail: CarAudioPlayer.shared.current?.title, symbol: "play.circle") { [weak self] in self?.showPlaying() })
        } else if CarAudioPlayer.shared.hasSaved {
            items.append(item("Reprendre l’écoute", symbol: "play.circle") { [weak self] in CarAudioPlayer.shared.resumeSaved(); self?.showPlaying() })
        }
        items.append(item("Choisir le récitateur", detail: reciter.name, symbol: "person.wave.2") { [weak self] in self?.showReciters() })
        // Short lists remain usable in cars that limit the item count while driving.
        for start in stride(from: 0, to: surahs.count, by: 20) {
            let group = Array(surahs[start..<min(start + 20, surahs.count)])
            items.append(item("Sourates \(group.first!.id) à \(group.last!.id)", detail: "\(group.first!.latin) – \(group.last!.latin)", symbol: "book") { [weak self] in
                guard let self else { return }
                let rows = group.map { surah in self.item("\(surah.id). \(surah.latin)", detail: "\(surah.count) versets", action: { [weak self] in
                    guard let self else { return }; CarAudioPlayer.shared.play(self.reciter.tracks(surah)); self.showPlaying()
                }) }
                self.show(CPListTemplate(title: "Sourates", sections: [CPListSection(items: rows)]))
            })
        }
        return CPListTemplate(title: "Quran Coach", sections: [CPListSection(items: items)])
    }
    private func showReciters() {
        let rows = CarReciter.all.map { voice in item(voice.name, detail: voice.id == reciter.id ? "Sélectionné" : nil) { [weak self] in
            self?.defaults.set(voice.id, forKey: "car.reciter")
            self?.interface?.popTemplate(animated: true, completion: nil)
        } }
        show(CPListTemplate(title: "Récitateurs", sections: [CPListSection(items: rows)]))
    }

    private func librarySections() -> [CPListSection] {
        let available = books.filter { !$0.recordings(recordings).isEmpty }
        let collections: [(String, (CarBook) -> Bool)] = [
            ("Le Prophète", { $0.collection == "prophet-life" || $0.id.hasPrefix("prophete-") }),
            ("Prophètes", { $0.category == "prophet" && !$0.id.hasPrefix("prophete-") }),
            ("Compagnons", { $0.collection == "companions" }),
            ("Histoires et moralités", { $0.category == "story" && $0.collection != "companions" }),
            ("Académie", { $0.category == "academy" })
        ]
        var rows = collections.flatMap { title, matches -> [CPListItem] in
            let selected = available.filter(matches)
            return stride(from: 0, to: selected.count, by: 20).map { start in
                let group = Array(selected[start..<min(start + 20, selected.count)])
                let label = selected.count > 20 ? "\(title) · \(start + 1)–\(start + group.count)" : title
                return item(label, detail: "\(group.count) livres", symbol: "books.vertical") { [weak self] in self?.showBookRows(group, title: title) }
            }
        }
        if CarAudioPlayer.shared.current != nil { rows.insert(item("À l’écoute", symbol: "play.circle") { [weak self] in self?.showPlaying() }, at: 0) }
        else if CarAudioPlayer.shared.hasSaved { rows.insert(item("Reprendre l’écoute", symbol: "play.circle") { [weak self] in CarAudioPlayer.shared.resumeSaved(); self?.showPlaying() }, at: 0) }
        if rows.isEmpty { rows.append(item("Bibliothèque en cours de chargement", detail: "Une connexion est nécessaire au premier chargement.")) }
        rows.append(item("Actualiser la bibliothèque", symbol: "arrow.clockwise") { [weak self] in self?.refreshTask = Task { guard let self else { return }; await self.refreshLibrary() } })
        return [CPListSection(items: rows)]
    }
    private func showBookRows(_ selected: [CarBook], title: String) {
        let rows = selected.map { book in item(book.title, detail: "\(book.chapters.count) chapitres", symbol: "play.circle") { [weak self] in
            guard let self else { return }
            let ownTracks = book.recordings(self.recordings)
            let following = self.defaults.object(forKey: "car.autoNextBook") as? Bool ?? true
            let laterBooks = following ? self.books.drop(while: { $0.id != book.id }).dropFirst().flatMap { $0.recordings(self.recordings) } : []
            let tracks = Array((ownTracks + laterBooks).prefix(2000))
            var chapters = [self.item("Écouter le livre", symbol: "play.fill") { [weak self] in CarAudioPlayer.shared.play(tracks); self?.showPlaying() }]
            chapters += book.chapters.compactMap { chapter -> CPListItem? in
                guard let index = ownTracks.firstIndex(where: { $0.chapter == chapter.id }) else { return nil }
                return self.item(chapter.title, symbol: "play.circle") { [weak self] in CarAudioPlayer.shared.play(tracks, index: index); self?.showPlaying() }
            }
            self.show(CPListTemplate(title: book.title, sections: [CPListSection(items: chapters)]))
        } }
        show(CPListTemplate(title: title, sections: [CPListSection(items: rows)]))
    }
    private func refreshLibrary() async {
        do {
            var request = URLRequest(url: CarAudioData.catalogURL); request.timeoutInterval = 12
            let (data, response) = try await URLSession.shared.data(for: request)
            guard !Task.isCancelled, let response = response as? HTTPURLResponse, response.statusCode == 200,
                  data.count <= 12_000_000 else { return }
            let items = CarAudioData.unique(try JSONDecoder().decode([CarRecording].self, from: data))
            recordings = items
            try? data.write(to: cacheURL, options: .atomic)
            libraryTemplate?.updateSections(librarySections())
        } catch {
            guard !Task.isCancelled, recordings.isEmpty else { return }
            libraryTemplate?.updateSections([CPListSection(items: [item("Bibliothèque indisponible", detail: "Vérifiez la connexion puis actualisez."), item("Réessayer", symbol: "arrow.clockwise") { [weak self] in self?.refreshTask = Task { guard let self else { return }; await self.refreshLibrary() } }])])
        }
    }

    private func refreshPrayers() { prayerTemplate?.updateSections(prayerSections()) }
    private func prayerSections() -> [CPListSection] {
        let updated = defaults.double(forKey: "car.updatedAt")
        let events = CarPrayerData.upcoming(defaults.data(forKey: "car.events"), updatedAt: updated)
        let dateFormat = DateFormatter(); dateFormat.locale = Locale(identifier: "fr_FR"); dateFormat.dateFormat = "HH:mm"
        let source = defaults.string(forKey: "car.source") ?? ""
        var rows = events.prefix(12).map { event in
            item("\(event.label) · \(event.kind == "iqama" ? "Iqama" : "Adhan")", detail: "\(dateFormat.string(from: Date(timeIntervalSince1970: event.at / 1000)))\(event.kind == "iqama" && !source.isEmpty ? " · \(source)" : "")")
        }
        if !events.contains(where: { $0.kind == "iqama" }) { rows.append(item("Horaires d’Iqama non renseignés")) }
        if events.isEmpty { rows.insert(item("Actualisez les prières sur l’iPhone", detail: "Aucun horaire récent disponible."), at: 0) }
        if updated > 0 { rows.append(item("Dernière actualisation", detail: Date(timeIntervalSince1970: updated / 1000).formatted(date: .abbreviated, time: .shortened))) }
        rows.append(item("Écouter l’Adhan", detail: "Ahmed Khalaf", symbol: "speaker.wave.2") { [weak self] in
            guard let url = Bundle.main.url(forResource: "ahmed-1", withExtension: "mp3", subdirectory: "public/audio/adhan") else { return }
            CarAudioPlayer.shared.play([CarTrack(id: "adhan:ahmed-1", title: "Adhan", artist: "Ahmed Khalaf", url: url, duration: 145, path: "/prayers", chapter: "adhan")]); self?.showPlaying()
        })
        let mosque = defaults.string(forKey: "car.mosque") ?? ""
        return [CPListSection(items: rows, header: mosque.isEmpty ? "Mes prières" : mosque, sectionIndexTitle: nil)]
    }
}
