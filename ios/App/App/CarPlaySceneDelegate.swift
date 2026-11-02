import CarPlay
import UIKit
import MapKit

@MainActor
final class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    private weak var interface: CPInterfaceController?
    private weak var carScene: CPTemplateApplicationScene?
    private let surahs = CarAudioData.bundled("surahs", as: [CarSurah].self) ?? []
    private let books = CarAudioData.bundled("books", as: [CarBook].self) ?? []
    private let listeningCatalog = CarAudioData.bundled("listening", as: CarListeningCatalog.self)
    private var recordings: [CarRecording] = []
    private var reciters: [CarListeningReciter] = []
    private var homeTemplate: CPListTemplate?
    private var listeningTemplate: CPListTemplate?
    private var libraryTemplate: CPListTemplate?
    private var prayerTemplate: CPListTemplate?
    private var prayerDetail: (template: CPListTemplate, id: String)?
    private var observers: [NSObjectProtocol] = []
    private var tasks: [Task<Void, Never>] = []
    private var prayerTimer: Timer?
    private var pinnedMosque: CarPrayerSnapshot?
    private var lastPrayerRequest: [String: Date] = [:]
    private var prayerLoading = false
    private var prayerError = ""
    private var listeningLoading = false
    private var listeningError = ""
    private var lastPlaybackSignature = ""
    private let defaults = UserDefaults(suiteName: "group.com.qurancoach.app") ?? .standard
    private var cacheURL: URL { FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("car-audio-catalog.json") }
    private var listening: CarListeningSnapshot? { CarListeningSnapshot.read(defaults) }
    private var mosque: CarPrayerSnapshot { pinnedMosque ?? CarPrayerSnapshot.read(defaults) }

    func templateApplicationScene(_ scene: CPTemplateApplicationScene, didConnect controller: CPInterfaceController) {
        interface = controller; carScene = scene
        CarAudioPlayer.shared.install()
        pinnedMosque = CarPrayerSnapshot.read(defaults)
        CarIqamaAnnouncer.shared.snapshot = pinnedMosque
        CarIqamaAnnouncer.shared.connected = true
        if let data = try? Data(contentsOf: cacheURL), let items = try? JSONDecoder().decode([CarRecording].self, from: data) { recordings = CarAudioData.unique(items) }
        readReciterCache()
        let home = CPListTemplate(title: "Mon trajet", sections: homeSections())
        home.tabTitle = "Mon trajet"; home.tabImage = UIImage(systemName: "car"); homeTemplate = home
        let listen = CPListTemplate(title: "Écoute", sections: listeningSections())
        listen.tabTitle = "Écoute"; listen.tabImage = UIImage(systemName: "headphones"); listeningTemplate = listen
        let library = CPListTemplate(title: "Livres audio", sections: librarySections())
        library.tabTitle = "Livres"; library.tabImage = UIImage(systemName: "books.vertical"); libraryTemplate = library
        let prayers = CPListTemplate(title: "Adhan et Iqama", sections: prayerSections())
        prayers.tabTitle = "Prières"; prayers.tabImage = UIImage(systemName: "moon.stars"); prayerTemplate = prayers
        controller.setRootTemplate(CPTabBarTemplate(templates: Array([home, listen, library, prayers].prefix(CPTabBarTemplate.maximumTabCount))), animated: false, completion: nil)
        observe(.carPrayerChanged) { scene in scene.acceptPhoneMosque(); scene.refreshPrayers() }
        observe(.carListeningChanged) { scene in scene.readReciterCache(); scene.refreshListeningSections() }
        observe(.carAudioChanged) { scene in
            let audio = CarAudioPlayer.shared
            let signature = "\(audio.current?.id ?? ""):\(audio.isPlaying):\(audio.error)"
            guard signature != scene.lastPlaybackSignature else { return }
            scene.lastPlaybackSignature = signature
            scene.homeTemplate?.updateSections(scene.homeSections())
            scene.refreshListeningSections()
        }
        prayerTimer = Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self else { return }
                self.refreshPrayers(); CarIqamaAnnouncer.shared.tick()
                await self.refreshTimetable()
            }
        }
        tasks.append(Task { [weak self] in await self?.refreshLibrary() })
        tasks.append(Task { [weak self] in await self?.refreshListening() })
        tasks.append(Task { [weak self] in await self?.refreshTimetable() })
    }

    func templateApplicationScene(_ scene: CPTemplateApplicationScene, didDisconnectInterfaceController controller: CPInterfaceController) {
        tasks.forEach { $0.cancel() }; tasks = []
        prayerTimer?.invalidate(); prayerTimer = nil
        observers.forEach(NotificationCenter.default.removeObserver); observers = []
        CarIqamaAnnouncer.shared.connected = false
        interface = nil; carScene = nil; homeTemplate = nil; listeningTemplate = nil
        libraryTemplate = nil; prayerTemplate = nil; prayerDetail = nil; pinnedMosque = nil
        // The queue continues on the phone after disconnecting the car.
    }

    private func observe(_ name: Notification.Name, action: @escaping @MainActor (CarPlaySceneDelegate) -> Void) {
        observers.append(NotificationCenter.default.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
            Task { @MainActor in if let self { action(self) } }
        })
    }
    private func item(_ text: String, detail: String? = nil, symbol: String? = nil, action: (() -> Void)? = nil) -> CPListItem {
        let row = CPListItem(text: text, detailText: detail, image: symbol.flatMap(UIImage.init(systemName:)))
        row.isEnabled = action != nil
        if let action { row.handler = { _, complete in action(); complete() } }
        return row
    }
    private func show(_ template: CPTemplate) { interface?.pushTemplate(template, animated: true, completion: nil) }
    private func showPlaying() { if interface?.topTemplate !== CPNowPlayingTemplate.shared { show(CPNowPlayingTemplate.shared) } }
    private func play(_ resume: CarListeningResume) {
        guard resume.valid else { return }
        CarAudioPlayer.shared.play(resume.tracks, index: resume.index, position: resume.position); showPlaying()
    }
    private func resume() {
        let audio = CarAudioPlayer.shared
        if audio.current != nil { audio.resume() }
        else if let saved = listening?.resume, saved.valid, saved.updatedAt > audio.savedUpdatedAt || !audio.hasSaved { play(saved); return }
        else { audio.resumeSaved() }
        showPlaying()
    }
    private func homeSections() -> [CPListSection] {
        let audio = CarAudioPlayer.shared, phone = listening?.resume
        var rows: [CPListItem] = []
        if audio.current != nil || audio.hasSaved || phone?.valid == true {
            let title = audio.current?.title ?? (phone?.valid == true && (phone!.updatedAt > audio.savedUpdatedAt || !audio.hasSaved) ? phone!.tracks[phone!.index].title : audio.savedTitle)
            rows.append(item(audio.isPlaying ? "À l’écoute" : "Reprendre", detail: title, symbol: "play.circle") { [weak self] in self?.resume() })
        }
        rows.append(item("Mes récitateurs favoris", detail: "\(listening?.favorites.count ?? 0) dans Écoute", symbol: "heart") { [weak self] in self?.showFavorites() })
        if let next = mosque.prayers().first {
            let event = next.iqama ?? next.next
            rows.append(item("\(next.label) · \(event.kind == "iqama" ? "Iqama" : "Adhan") \(mosque.time(event.at))", detail: mosque.countdown(event), symbol: "moon.stars") { [weak self] in self?.showPrayer(next.id) })
        } else {
            rows.append(item("Mes horaires de prière", detail: "Consulter la mosquée et actualiser", symbol: "moon.stars") { [weak self] in
                guard let self else { return }; self.show(CPListTemplate(title: "Adhan et Iqama", sections: self.prayerSections()))
            })
        }
        if mosque.hasDestination { rows.append(routeItem()) }
        return [CPListSection(items: rows)]
    }

    // MARK: Same catalogue and complete recordings as the phone's Écoute screen
    private func readReciterCache() {
        if let data = defaults.data(forKey: "car.listeningCatalog"), data.count <= 5_000_000,
           let values = try? JSONDecoder().decode([CarListeningReciter].self, from: data) {
            reciters = values.filter { $0.id > 0 && !$0.moshaf.isEmpty }
        }
    }
    private func name(_ reciter: CarListeningReciter) -> String { listeningCatalog?.names[String(reciter.id)] ?? reciter.name }
    private func refreshListeningSections() {
        listeningTemplate?.updateSections(listeningSections()); homeTemplate?.updateSections(homeSections())
    }
    private func listeningSections() -> [CPListSection] {
        var rows: [CPListItem] = []
        if let saved = listening?.resume, saved.valid {
            rows.append(item("Reprendre mon écoute", detail: "\(saved.tracks[saved.index].title) · \(saved.tracks[saved.index].artist)", symbol: "play.circle") { [weak self] in
                guard let self else { return }
                if CarAudioPlayer.shared.current?.listening != nil { self.resume() } else { self.play(saved) }
            })
        }
        rows.append(item("Mes récitateurs favoris", symbol: "heart") { [weak self] in self?.showFavorites() })
        if let recent = listening?.recent.filter(\.valid), !recent.isEmpty {
            rows.append(item("Écoutes récentes", detail: "\(recent.count) écoutes", symbol: "clock") { [weak self] in self?.showShortcuts(recent, title: "Écoutes récentes") })
        }
        if let bookmarks = listening?.bookmarks.filter(\.valid), !bookmarks.isEmpty {
            rows.append(item("Mes signets audio", detail: "\(bookmarks.count) passages", symbol: "bookmark") { [weak self] in self?.showShortcuts(bookmarks, title: "Signets audio") })
        }
        for collection in listeningCatalog?.collections ?? [] {
            rows.append(item(collection.name, detail: "\(collection.surahs.count) sourates", symbol: "headphones") { [weak self] in self?.showCollection(collection) })
        }
        let sorted = reciters.sorted { name($0).localizedStandardCompare(name($1)) == .orderedAscending }
        for start in stride(from: 0, to: sorted.count, by: 20) {
            let group = Array(sorted[start..<min(start + 20, sorted.count)])
            rows.append(item("Récitateurs · \(start + 1)–\(start + group.count)", detail: "\(name(group.first!)) – \(name(group.last!))", symbol: "person.wave.2") { [weak self] in
                guard let self else { return }
                self.show(CPListTemplate(title: "Récitateurs", sections: [CPListSection(items: group.map(self.reciterItem))]))
            })
        }
        if reciters.isEmpty { rows.append(item(listeningLoading ? "Chargement des récitateurs…" : "Catalogue indisponible", detail: listeningError.isEmpty ? "Connectez l’iPhone à Internet pour le premier chargement." : listeningError)) }
        rows.append(item("Actualiser les récitateurs", symbol: "arrow.clockwise") { [weak self] in self?.tasks.append(Task { [weak self] in await self?.refreshListening(force: true) }) })
        return [CPListSection(items: rows)]
    }
    private func reciterItem(_ reciter: CarListeningReciter) -> CPListItem {
        item(name(reciter), detail: "\(reciter.moshaf.count) édition\(reciter.moshaf.count > 1 ? "s" : "")", symbol: "person.wave.2") { [weak self] in self?.showReciter(reciter) }
    }
    private func showReciter(_ reciter: CarListeningReciter) {
        if reciter.moshaf.count == 1, let edition = reciter.best { showEdition(edition, reciter: reciter); return }
        let editions = reciter.moshaf.sorted { ($0.id == reciter.best?.id ? 0 : 1, $0.id) < ($1.id == reciter.best?.id ? 0 : 1, $1.id) }
        let rows = editions.map { edition in item(edition.name, detail: "\(edition.surahs.count) sourates", symbol: "headphones") { [weak self] in self?.showEdition(edition, reciter: reciter) } }
        show(CPListTemplate(title: name(reciter), sections: [CPListSection(items: rows)]))
    }
    private func showEdition(_ edition: CarListeningEdition, reciter: CarListeningReciter) {
        showSurahs(edition.tracks(reciter: String(reciter.id), name: name(reciter), surahs: surahs), title: name(reciter), edition: edition.name)
    }
    private func showCollection(_ collection: CarListeningCatalog.Collection) {
        let tracks = collection.surahs.compactMap { id in CarListeningCatalog.track(reciter: collection.id, name: collection.name, server: collection.server, surah: surahs.first { $0.id == id }) }
        showSurahs(tracks, title: collection.name, edition: nil)
    }
    private func showFavorites() {
        let ids = listening?.favorites ?? []
        let rows = ids.compactMap { id -> CPListItem? in
            if let reciter = reciters.first(where: { String($0.id) == id }) { return reciterItem(reciter) }
            if let collection = listeningCatalog?.collections.first(where: { $0.id == id }) { return item(collection.name, symbol: "heart.fill") { [weak self] in self?.showCollection(collection) } }
            return nil
        }
        show(CPListTemplate(title: "Mes favoris", sections: [CPListSection(items: rows.isEmpty ? [item("Aucun récitateur favori disponible", detail: "Ajoutez vos favoris dans le menu Écoute de l’iPhone.")] : rows)]))
    }
    private func showShortcuts(_ values: [CarListeningResume], title: String) {
        let rows = values.filter(\.valid).prefix(20).map { saved in
            let track = saved.tracks[saved.index], seconds = max(0, Int(saved.position))
            return item(track.title, detail: "\(track.artist) · \(seconds / 60):\(String(format: "%02d", seconds % 60))", symbol: "play.circle") { [weak self] in self?.play(saved) }
        }
        show(CPListTemplate(title: title, sections: [CPListSection(items: rows)]))
    }
    private func showSurahs(_ tracks: [CarTrack], title: String, edition: String?) {
        guard !tracks.isEmpty else {
            show(CPListTemplate(title: title, sections: [CPListSection(items: [item("Enregistrements indisponibles", detail: "Actualisez le catalogue puis réessayez.")])]))
            return
        }
        let rows = stride(from: 0, to: tracks.count, by: 20).map { start -> CPListItem in
            let group = Array(tracks[start..<min(start + 20, tracks.count)])
            return item("Sourates \(group.first!.chapter) à \(group.last!.chapter)", detail: "\(group.first!.title) – \(group.last!.title)", symbol: "book") { [weak self] in
                guard let self else { return }
                let items = group.map { track in self.item("\(track.chapter). \(track.title)", symbol: "play.circle") { [weak self] in
                    guard let index = tracks.firstIndex(where: { $0.id == track.id }) else { return }
                    CarAudioPlayer.shared.play(tracks, index: index); self?.showPlaying()
                } }
                self.show(CPListTemplate(title: title, sections: [CPListSection(items: items)]))
            }
        }
        show(CPListTemplate(title: title, sections: [CPListSection(items: rows, header: edition, sectionIndexTitle: nil)]))
    }
    private func refreshListening(force: Bool = false) async {
        guard !listeningLoading else { return }
        if !force, !reciters.isEmpty, Date().timeIntervalSince1970 - defaults.double(forKey: "car.listeningFetchedAt") < 86400 { return }
        listeningLoading = true; listeningError = ""; refreshListeningSections()
        defer { listeningLoading = false; refreshListeningSections() }
        do {
            struct Response: Decodable { let reciters: [CarListeningReciter] }
            var request = URLRequest(url: CarListeningCatalog.url); request.timeoutInterval = 15
            let (data, response) = try await URLSession.shared.data(for: request)
            guard !Task.isCancelled, let response = response as? HTTPURLResponse, response.statusCode == 200, data.count <= 5_000_000 else { throw URLError(.badServerResponse) }
            let decoded = try JSONDecoder().decode(Response.self, from: data).reciters.filter { $0.id > 0 && !$0.moshaf.isEmpty }
            guard !decoded.isEmpty else { throw URLError(.cannotParseResponse) }
            // Cache only public metadata, never audio downloads or private data.
            if let raw = try JSONSerialization.jsonObject(with: data) as? [String: Any], let values = raw["reciters"] { defaults.set(try JSONSerialization.data(withJSONObject: values), forKey: "car.listeningCatalog") }
            reciters = decoded; defaults.set(Date().timeIntervalSince1970, forKey: "car.listeningFetchedAt")
        } catch { if !Task.isCancelled { listeningError = "Vérifiez la connexion puis réessayez. Les favoris en cache restent disponibles." } }
    }

    // MARK: Published narrated books (existing editions and continuous queue preserved)
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
        else if CarAudioPlayer.shared.hasSaved { rows.insert(item("Reprendre l’écoute", symbol: "play.circle") { [weak self] in self?.resume() }, at: 0) }
        if rows.isEmpty { rows.append(item("Bibliothèque en cours de chargement", detail: "Une connexion est nécessaire au premier chargement.")) }
        rows.append(item("Actualiser la bibliothèque", symbol: "arrow.clockwise") { [weak self] in self?.tasks.append(Task { [weak self] in await self?.refreshLibrary() }) })
        return [CPListSection(items: rows)]
    }
    private func showBookRows(_ selected: [CarBook], title: String) {
        let rows = selected.map { book in item(book.title, detail: "\(book.chapters.count) chapitres", symbol: "play.circle") { [weak self] in
            guard let self else { return }
            let own = book.recordings(self.recordings)
            let following = self.defaults.object(forKey: "car.autoNextBook") as? Bool ?? true
            let later = following ? self.books.drop(while: { $0.id != book.id }).dropFirst().flatMap { $0.recordings(self.recordings) } : []
            let tracks = Array((own + later).prefix(2000))
            var chapters = [self.item("Écouter le livre", symbol: "play.fill") { [weak self] in CarAudioPlayer.shared.play(tracks); self?.showPlaying() }]
            chapters += book.chapters.compactMap { chapter -> CPListItem? in
                guard let index = own.firstIndex(where: { $0.chapter == chapter.id }) else { return nil }
                return self.item(chapter.title, symbol: "play.circle") { [weak self] in CarAudioPlayer.shared.play(tracks, index: index); self?.showPlaying() }
            }
            self.show(CPListTemplate(title: book.title, sections: [CPListSection(items: chapters)]))
        } }
        show(CPListTemplate(title: title, sections: [CPListSection(items: rows)]))
    }
    private func refreshLibrary() async {
        do {
            var request = URLRequest(url: CarAudioData.catalogURL); request.timeoutInterval = 12
            request.setValue("https://www.quran-coach.fr", forHTTPHeaderField: "Origin")
            request.setValue("QuranCoach/1.5.3 CarPlay", forHTTPHeaderField: "User-Agent")
            let (data, response) = try await URLSession.shared.data(for: request)
            guard !Task.isCancelled, let response = response as? HTTPURLResponse, response.statusCode == 200, data.count <= 12_000_000 else { return }
            recordings = CarAudioData.unique(try JSONDecoder().decode([CarRecording].self, from: data))
            try? data.write(to: cacheURL, options: .atomic)
            libraryTemplate?.updateSections(librarySections())
        } catch {
            guard !Task.isCancelled, recordings.isEmpty else { return }
            libraryTemplate?.updateSections([CPListSection(items: [item("Bibliothèque indisponible", detail: "Vérifiez la connexion puis actualisez."), item("Réessayer", symbol: "arrow.clockwise") { [weak self] in self?.tasks.append(Task { [weak self] in await self?.refreshLibrary() }) }])])
        }
    }

    // MARK: Stable mosque, useful prayer details and directions on the CarPlay scene
    private func acceptPhoneMosque() {
        let incoming = CarPrayerSnapshot.read(defaults), current = mosque
        guard incoming.selectionID == current.selectionID || current.selectionID.isEmpty else { return }
        // A less recent phone cache cannot overwrite a freshly fetched timetable in the car.
        if current.sourceUpdatedAt > incoming.sourceUpdatedAt && Date().timeIntervalSince1970 * 1000 - current.sourceUpdatedAt < 3_600_000 { return }
        pinnedMosque = incoming; CarIqamaAnnouncer.shared.snapshot = incoming
    }
    private func refreshPrayers() {
        prayerTemplate?.updateSections(prayerSections()); homeTemplate?.updateSections(homeSections())
        if let detail = prayerDetail, interface?.topTemplate === detail.template { detail.template.updateSections(prayerDetailSections(detail.id)) }
        CarIqamaAnnouncer.shared.snapshot = mosque
    }
    private func prayerSummary(_ prayer: CarPrayerSnapshot.Prayer) -> String {
        let times = "Adhan \(prayer.adhan.map { mosque.time($0.at) } ?? "—") · Iqama \(prayer.iqama.map { mosque.time($0.at) } ?? "non renseignée")"
        let event = prayer.iqama ?? prayer.next
        return "\(times) · \(mosque.countdown(event))"
    }
    private func routeItem() -> CPListItem {
        item("Rejoindre la mosquée", detail: mosque.mosque, symbol: "location") { [weak self] in self?.openDirections() }
    }
    private func prayerSections() -> [CPListSection] {
        let snapshot = mosque
        var rows = snapshot.prayers().prefix(12).map { prayer in item(prayer.label, detail: prayerSummary(prayer), symbol: "moon.stars") { [weak self] in self?.showPrayer(prayer.id) } }
        if rows.isEmpty { rows.append(item("Aucun horaire récent disponible", detail: "Ouvrez Prières sur l’iPhone pour sélectionner une mosquée.")) }
        if !snapshot.upcoming().contains(where: { $0.kind == "iqama" }) { rows.append(item("Horaires d’Iqama non renseignés")) }
        if snapshot.hasDestination { rows.append(routeItem()) }
        let incoming = CarPrayerSnapshot.read(defaults)
        if incoming.selectionID != snapshot.selectionID, !incoming.selectionID.isEmpty {
            rows.append(item("Utiliser la mosquée de l’iPhone", detail: incoming.mosque, symbol: "arrow.triangle.2.circlepath") { [weak self] in
                guard let self else { return }; self.pinnedMosque = incoming; self.prayerError = ""; self.refreshPrayers()
                self.tasks.append(Task { [weak self] in await self?.refreshTimetable() })
            })
        }
        rows.append(item("Source et actualisation", detail: sourceSummary(snapshot), symbol: "info.circle") { [weak self] in self?.showPrayerSource() })
        if snapshot.refreshEndpoint != nil {
            rows.append(item(prayerLoading ? "Actualisation en cours…" : "Actualiser les horaires", detail: prayerError.isEmpty ? nil : prayerError, symbol: "arrow.clockwise", action: prayerLoading ? nil : { [weak self] in self?.tasks.append(Task { [weak self] in await self?.refreshTimetable(force: true) }) }))
        }
        rows.append(item("Écouter l’Adhan", detail: "Ahmed Khalaf · à la demande", symbol: "speaker.wave.2") { [weak self] in
            guard let url = Bundle.main.url(forResource: "ahmed-1", withExtension: "mp3", subdirectory: "public/audio/adhan") else { return }
            CarAudioPlayer.shared.play([CarTrack(id: "adhan:ahmed-1", title: "Adhan", artist: "Ahmed Khalaf", url: url, duration: 145, path: "/prayers", chapter: "adhan")]); self?.showPlaying()
        })
        return [CPListSection(items: rows, header: snapshot.mosque.isEmpty ? "Mes prières" : snapshot.mosque, sectionIndexTitle: nil)]
    }
    private func showPrayer(_ id: String) {
        let template = CPListTemplate(title: mosque.prayers().first { $0.id == id }?.label ?? "Ma prière", sections: prayerDetailSections(id))
        prayerDetail = (template, id); show(template)
    }
    private func prayerDetailSections(_ id: String) -> [CPListSection] {
        let snapshot = mosque
        guard let prayer = snapshot.prayers().first(where: { $0.id == id }) else { return [CPListSection(items: [item("Cet horaire est passé", detail: "Retrouvez la prochaine prière dans l’onglet Prières.")])] }
        let event = prayer.iqama ?? prayer.next
        var rows = [item("\(event.kind == "iqama" ? "Iqama" : "Adhan") \(snapshot.countdown(event))", detail: snapshot.time(event.at)),
                    item("Adhan", detail: prayer.adhan.map { "\(snapshot.time($0.at)) · \($0.source ?? "Horaire enregistré")" } ?? "Non renseigné"),
                    item("Iqama", detail: prayer.iqama.map { "\(snapshot.time($0.at)) · \($0.source ?? "Horaire enregistré")" } ?? "Horaires d’Iqama non renseignés")]
        if snapshot.hasDestination { rows.append(routeItem()) }
        rows.append(item("Source et actualisation", detail: sourceSummary(snapshot), symbol: "info.circle") { [weak self] in self?.showPrayerSource() })
        return [CPListSection(items: rows, header: snapshot.mosque.isEmpty ? "Mes prières" : snapshot.mosque, sectionIndexTitle: nil)]
    }
    private func sourceSummary(_ snapshot: CarPrayerSnapshot) -> String {
        let at = snapshot.sourceUpdatedAt > 0 ? snapshot.sourceUpdatedAt : snapshot.updatedAt
        guard at > 0 else { return "À actualiser sur l’iPhone" }
        return "\(snapshot.source) · \(Date(timeIntervalSince1970: at / 1000).formatted(date: .abbreviated, time: .shortened))"
    }
    private func showPrayerSource() {
        let reminder = defaults.bool(forKey: "car.iqamaReminderEnabled") ? "\(defaults.object(forKey: "car.iqamaMinutes") as? Int ?? 5) minutes avant" : "Désactivée"
        show(CPListTemplate(title: "Ma mosquée", sections: [CPListSection(items: [item(mosque.mosque.isEmpty ? "Aucune mosquée sélectionnée" : mosque.mosque, detail: sourceSummary(mosque)), item("Annonce d’Iqama", detail: "\(reminder) · réglable sur l’iPhone"), item("Horaires d’Iqama publiés uniquement", detail: "Aucun délai d’Iqama n’est calculé.")])]))
    }
    private func openDirections() {
        let snapshot = mosque
        guard snapshot.hasDestination, let lat = snapshot.lat, let lng = snapshot.lng, let carScene else { return }
        let destination = MKMapItem(placemark: MKPlacemark(coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)))
        destination.name = snapshot.mosque
        destination.openInMaps(launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving], from: carScene) { [weak self] success in
            if !success { Task { @MainActor in self?.show(CPListTemplate(title: "Itinéraire", sections: [CPListSection(items: [CPListItem(text: "Plans n’a pas pu s’ouvrir", detailText: "Réessayez une fois la connexion rétablie.")])])) } }
        }
    }
    private func refreshTimetable(force: Bool = false) async {
        let original = mosque, now = Date()
        guard !prayerLoading, let endpoint = original.refreshEndpoint else { return }
        // Manual retries are also bounded. No GPS polling or directory-wide requests.
        let minimum: TimeInterval = force ? 30 : 15 * 60
        if let last = lastPrayerRequest[endpoint.absoluteString], now.timeIntervalSince(last) < minimum { return }
        lastPrayerRequest[endpoint.absoluteString] = now; prayerLoading = true; prayerError = ""; refreshPrayers()
        defer { prayerLoading = false; refreshPrayers() }
        do {
            var request = URLRequest(url: endpoint); request.timeoutInterval = 12
            let (data, response) = try await URLSession.shared.data(for: request)
            guard !Task.isCancelled, interface != nil, mosque.selectionID == original.selectionID, mosque.refreshEndpoint == endpoint,
                  let response = response as? HTTPURLResponse, response.statusCode == 200, data.count <= 500_000,
                  let result = try JSONDecoder().decode(CarPublishedTimetable.Envelope.self, from: data).timetable.applying(to: original) else { throw URLError(.badServerResponse) }
            pinnedMosque = result; CarIqamaAnnouncer.shared.snapshot = result
            if CarPrayerSnapshot.read(defaults).selectionID == result.selectionID { defaults.set(try JSONEncoder().encode(result), forKey: "car.prayerSnapshot") }
        } catch { if !Task.isCancelled { prayerError = "Connexion indisponible. Derniers horaires conservés avec leur date." } }
    }
}
