// Run by compiling this file after ios/App/App/CarAudioData.swift as main.swift.
import Foundation

var checks = 0
func check(_ condition: @autoclosure () -> Bool, _ message: String) {
    guard condition() else { fatalError("CarPlay: \(message)") }; checks += 1
}
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
func json<T: Decodable>(_ path: String, _ type: T.Type) throws -> T {
    try JSONDecoder().decode(type, from: Data(contentsOf: root.appendingPathComponent(path)))
}
let surahs = try json("src/lib/interactiveMushaf/chapters.json", [CarSurah].self)
check(surahs.count == 114, "114 sourates")
check(surahs.reduce(0) { $0 + $1.count } == 6236, "6236 versets")
var offset = 0
for (index, surah) in surahs.enumerated() {
    check(surah.id == index + 1 && surah.offset == offset, "identité et position de la sourate \(index + 1)")
    offset += surah.count
}
let reciter = CarReciter.all[0]
let tracks = reciter.tracks(surahs[1])
check(tracks.count == 286, "file continue d’Al-Baqarah")
check(tracks[16].url.absoluteString == "https://cdn.islamic.network/quran/audio/128/ar.alafasy/24.mp3", "audio exact de 2:17")
check(tracks[16].path == "/read?surah=2&ayah=17", "retour au verset")
for url in ["http://cdn.islamic.network/audio.mp3", "https://evil.example/test.mp3", "https://www.quran-coach.fr@evil.example/test.mp3", "file:///tmp/audio.mp3", "javascript:alert(1)"] {
    check(CarTrack.audioURL(url) == nil, "URL non autorisée refusée")
}
let book = try JSONDecoder().decode(CarBook.self, from: Data("""
{"id":"test","title":"Titre","version":"test-v2","category":"story","chapters":[{"id":"one","title":"Premier"},{"id":"two","title":"Deuxième","audioVersion":"test-v1","audioTitle":"Ancien titre"}]}
""".utf8))
func recording(_ id: String, _ title: String, _ reference: String) -> CarRecording {
    CarRecording(id: id, title: title, reference: reference, url: "https://quran-coach-audio.madouyatt95.workers.dev/media/\(id).mp3", duration: 100, narrator: "George")
}
let items = [recording("b", "Titre · Premier", "Références vérifiées · Manuscrit test-v2, chapitre one, segment 2/2"),
             recording("a", "Titre · Premier", "Manuscrit test-v2, chapitre one, segment 1/2"),
             recording("c", "Ancien titre · Deuxième", "Manuscrit test-v1, chapitre two, segment 1/1"),
             recording("old", "Titre · Premier", "Manuscrit test-v1, chapitre one, segment 1/2"),
             recording("wrong", "Autre titre", "Manuscrit test-v2, chapitre one, segment 1/2")]
check(book.recordings(items).map(\.id) == ["a", "b", "c"], "édition active, ordre des segments et chapitres réutilisés")
check(CarAudioData.unique(items + [items[0]]).count == items.count, "doublons exclus")
let now = Date(timeIntervalSince1970: 1_800_000_000), ms = now.timeIntervalSince1970 * 1000
let events = try JSONEncoder().encode([CarPrayerEvent(kind: "adhan", label: "Asr", at: ms + 60_000), CarPrayerEvent(kind: "iqama", label: "Asr", at: ms + 120_000), CarPrayerEvent(kind: "iqama", label: "Passée", at: ms - 1), CarPrayerEvent(kind: "unknown", label: "Invalide", at: ms + 1000)])
check(CarPrayerData.upcoming(events, updatedAt: ms, now: now).map(\.kind) == ["adhan", "iqama"], "événements publiés à venir uniquement")
check(CarPrayerData.upcoming(events, updatedAt: ms - 86_400_001, now: now).isEmpty, "horaires périmés masqués")
check(CarPrayerData.upcoming(nil, updatedAt: ms, now: now).isEmpty, "aucune Iqama inventée")
let listening = try json("src/data/carListeningCatalog.json", CarListeningCatalog.self)
check(listening.collections.count == 2, "deux collections Écoute partagées")
for collection in listening.collections {
    check(Set(collection.surahs).count == collection.surahs.count, "pas de doublon de sourate")
    let complete = collection.surahs.compactMap { id in CarListeningCatalog.track(reciter: collection.id, name: collection.name, server: collection.server, surah: surahs.first { $0.id == id }) }
    check(complete.count == collection.surahs.count, "chaque enregistrement de la collection est utilisable")
    check(complete.allSatisfy { $0.path.hasPrefix("/listen/") && !$0.path.hasPrefix("/read") && $0.listening?.valid == true }, "navigation vers Écoute, texte inchangé")
}
let nativeReciter = try JSONDecoder().decode(CarListeningReciter.self, from: Data("""
{"id":123,"name":"Alafasy","moshaf":[{"id":1,"name":"Autre lecture","server":"https://server8.mp3quran.net/other/","surah_total":114,"moshaf_type":2,"surah_list":"1,2,3"},{"id":2,"name":"Hafs","server":"https://server8.mp3quran.net/afs/","surah_total":114,"moshaf_type":11,"surah_list":"2,1,2,3,115,0"}]}
""".utf8))
check(nativeReciter.best?.id == 2, "même préférence Hafs que le menu Écoute")
let complete = nativeReciter.best!.tracks(reciter: "123", name: "Alafasy", surahs: surahs)
check(complete.map(\.chapter) == ["1","2","3"], "sourates exactes, ordre, doublons et indices invalides exclus")
check(complete[1].url.absoluteString == "https://server8.mp3quran.net/afs/002.mp3", "même fichier complet que le menu Écoute")
let narration = book.recordings(items)[0]
check(complete[1].surahArtworkNumber == 2, "pochette de la sourate entière Écoute")
check(tracks[16].surahArtworkNumber == 2, "pochette de la sourate pour une ancienne file par versets")
check(narration.surahArtworkNumber == nil, "un livre ne reçoit pas de pochette coranique")
let invalidArt = CarTrack(id: "quran:invalid", title: "", artist: "", url: tracks[0].url, duration: 0, path: "/read", chapter: "115")
check(invalidArt.surahArtworkNumber == nil, "aucun médaillon pour un numéro hors du Coran")
check(narration.afterCall(position: 12.75, rewindBooks: true) == 7.75, "reprise du livre cinq secondes avant")
check(narration.afterCall(position: 2, rewindBooks: true) == 0, "reprise limitée au début du segment")
check(narration.afterCall(position: 12.75, rewindBooks: false) == 12.75, "position exacte du livre sur demande")
check(complete[1].afterCall(position: 12.75, rewindBooks: true) == 12.75, "sourate entière sans repère de verset")
check(tracks[16].afterCall(position: 12.75, rewindBooks: true) == 0, "début du verset lorsque la piste est un verset")
let saved = CarListeningResume(tracks: complete, index: 1, position: 467.25, updatedAt: ms)
check(saved.valid && saved.tracks[saved.index].listening?.surahNumber == 2, "reprise exacte avec file continue")
let decodedResume = try JSONDecoder().decode(CarListeningResume.self, from: JSONEncoder().encode(saved))
check(decodedResume.position == 467.25, "position décimale préservée au stockage")
check(!CarListeningResume(tracks: complete, index: 4, position: 0, updatedAt: ms).valid, "index invalide refusé")
check(!CarListeningResume(tracks: complete, index: 1, position: .nan, updatedAt: ms).valid, "position non finie refusée")
for raw in ["https://server8.mp3quran.net.evil.example/002.mp3","https://server8.mp3quran.net:444/002.mp3","https://archive.org/download/unrelated/001.mp3"] { check(CarTrack.audioURL(raw) == nil, "hôtes audio approuvés uniquement") }
var schedule = CarPrayerSnapshot(mosque: "Mosquée", mosqueId: "selected", lat: 48.8, lng: 2.3, source: "Horaire publié", sourceUpdatedAt: ms - 60_000, updatedAt: ms, refreshURL: "https://www.quran-coach.fr/api/mosques?action=published&slug=selected", events: [CarPrayerEvent(kind: "adhan", label: "Asr", at: ms - 60_000, published: true, source: "Horaire publié"), CarPrayerEvent(kind: "iqama", label: "Asr", at: ms + 300_000, published: true, source: "Horaire publié")], timezone: "Europe/Paris")
let beforeAdhan = now.addingTimeInterval(-90)
var phases = schedule
phases.updatedAt = beforeAdhan.timeIntervalSince1970 * 1000
phases.events.append(CarPrayerEvent(kind: "adhan", label: "Maghrib", at: ms + 3_600_000))
check(phases.prayers(now: beforeAdhan).first?.next.kind == "adhan", "avant l’Adhan")
check(phases.prayers(now: now).first?.next.kind == "iqama", "entre Adhan et Iqama")
check(phases.prayers(now: now.addingTimeInterval(300)).first?.label == "Maghrib", "bascule après l’Iqama")
check(schedule.hasDestination && schedule.refreshEndpoint != nil, "destination valide et endpoint de la seule mosquée choisie")
check(schedule.prayers(now: now).first?.adhan?.at == ms - 60_000, "Adhan passé conservé dans la fiche de sa prochaine Iqama")
check(schedule.upcoming(now: now).count == 1, "Adhan passé exclu du prochain événement")
check(schedule.countdown(schedule.events[1], now: now) == "dans 5 min 0 s", "compte à rebours exact")
let reminder = schedule.reminder(now: now, lead: 5, seen: [])!
check(reminder.text.contains("Asr") && reminder.text.contains("5 minutes"), "annonce courte avec la bonne prière")
check(schedule.reminder(now: now, lead: 5, seen: [reminder.key]) == nil, "pas de double annonce après reconnexion")
check(schedule.reminder(now: now.addingTimeInterval(46), lead: 5, seen: []) == nil, "pas d’annonce de rattrapage au réveil")
check(schedule.reminder(now: now.addingTimeInterval(-1), lead: 5, seen: []) == nil, "pas d’annonce prématurée")
check(schedule.reminder(now: now, lead: 10, seen: []) == nil, "respect du délai choisi")
var stale = schedule; stale.sourceUpdatedAt = ms - 3_600_001
check(stale.reminder(now: now, lead: 5, seen: []) == nil, "pas d’annonce à partir d’un fournisseur périmé")
var personal = schedule; personal.events[1].published = false
check(personal.reminder(now: now, lead: 5, seen: []) == nil, "pas d’annonce d’Iqama déduite ou personnelle")
var empty = schedule; empty.events = []
check(empty.reminder(now: now, lead: 5, seen: []) == nil && empty.prayers(now: now).isEmpty, "absence d’Iqama respectée")
for endpoint in ["https://evil.example/api/mosques?action=published&slug=selected", "https://www.quran-coach.fr/api/mosques?action=automatic&slug=selected", "https://www.quran-coach.fr/api/mosques?action=published&slug=selected&latitude=48.8", "https://www.quran-coach.fr:444/api/mosques?action=published&slug=selected"] {
    var invalid = schedule; invalid.refreshURL = endpoint
    check(invalid.refreshEndpoint == nil, "requête détournée ou recherche GPS refusée")
}
schedule.lat = .infinity
check(!schedule.hasDestination, "coordonnées invalides refusées")
let published = CarPublishedTimetable(source: "MAWAQIT", fetchedAt: ms, timezone: "Europe/Paris", days: [CarPublishedTimetable.Day(date: "2027-01-15", prayers: [.init(key: "dhuhr", adhanAt: ms + 120_000, iqamaAt: ms + 300_000), .init(key: "asr", adhanAt: ms + 3_600_000, iqamaAt: nil)], jumua: [.init(at: ms + 180_000), .init(at: ms + 900_000)])])
let updated = published.applying(to: schedule, now: now)!
check(updated.events.filter { $0.kind == "iqama" }.map(\.label) == ["Jumu’a · 1", "Jumu’a · 2"], "vendredi : plusieurs séances conservées, Dhuhr non dupliqué")
check(!updated.events.contains { $0.kind == "iqama" && $0.label == "Asr" }, "aucune Iqama inventée à partir de l’Adhan")
check(updated.timezone == "Europe/Paris" && updated.sourceUpdatedAt == ms, "source, fuseau et fraîcheur conservés")
check(CarPublishedTimetable(source: "MAWAQIT", fetchedAt: ms - 3_600_001, timezone: "Europe/Paris", days: published.days).applying(to: schedule, now: now) == nil, "fournisseur périmé refusé")
check(CarPublishedTimetable(source: "unknown", fetchedAt: ms, timezone: "Europe/Paris", days: published.days).applying(to: schedule, now: now) == nil, "source inconnue refusée")
if CommandLine.arguments.count > 1 {
    let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
    let library = CarAudioData.unique(try JSONDecoder().decode([CarRecording].self, from: data))
    let books = try json("src/data/bookCatalog.json", [CarBook].self)
    let available = books.filter { !$0.recordings(library).isEmpty }
    check(!available.isEmpty, "livres publiés disponibles")
    print("Catalogue public : \(library.count) segments, \(available.count) livres reconnus.")
}
if CommandLine.arguments.count > 2 {
    struct Response: Decodable { let reciters: [CarListeningReciter] }
    let catalogue = try JSONDecoder().decode(Response.self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[2]))).reciters
    check(catalogue.count > 4, "catalogue réel Écoute, au-delà des quatre voix du Mushaf")
    var editions = 0, files = 0
    for reciter in catalogue {
        for edition in reciter.moshaf {
            let generated = edition.tracks(reciter: String(reciter.id), name: reciter.name, surahs: surahs)
            check(generated.count == edition.surahs.count, "tous les fichiers de l’édition \(edition.id) sont autorisés")
            check(generated.allSatisfy { $0.listening?.valid == true }, "références complètes du récitateur \(reciter.id)")
            editions += 1; files += generated.count
        }
    }
    print("Catalogue Écoute réel : \(catalogue.count) récitateurs, \(editions) éditions, \(files) références audio validées (sans téléchargement intégral).")
}
print("CarPlay : \(checks) contrôles réussis.")
