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
if CommandLine.arguments.count > 1 {
    let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
    let library = CarAudioData.unique(try JSONDecoder().decode([CarRecording].self, from: data))
    let books = try json("src/data/bookCatalog.json", [CarBook].self)
    let available = books.filter { !$0.recordings(library).isEmpty }
    check(!available.isEmpty, "livres publiés disponibles")
    print("Catalogue public : \(library.count) segments, \(available.count) livres reconnus.")
}
print("CarPlay : \(checks) contrôles réussis.")
