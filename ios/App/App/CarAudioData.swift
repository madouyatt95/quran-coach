import Foundation

/// Public catalogue metadata only. Quranic text is never generated or rewritten here.
struct CarSurah: Codable {
    let id: Int
    let name: String
    let latin: String
    let count: Int
    let offset: Int
}

struct CarBook: Decodable {
    struct Chapter: Decodable {
        let id: String
        let title: String
        let audioVersion: String?
        let audioTitle: String?
    }
    let id: String
    let title: String
    let version: String
    let category: String
    let collection: String?
    let chapters: [Chapter]

    func recordings(_ library: [CarRecording]) -> [CarTrack] {
        chapters.flatMap { chapter -> [CarTrack] in
            let marker = "Manuscrit \(chapter.audioVersion ?? version), chapitre \(chapter.id), segment "
            let titles = [title, chapter.audioTitle].compactMap { $0 }
            return library.filter { recording in
                let cleanTitle = recording.title.replacingOccurrences(of: "Édition chronologique · ", with: "")
                return recording.reference.contains(marker) && titles.contains { cleanTitle.hasPrefix("\($0) · ") }
            }.sorted { $0.segment < $1.segment }.compactMap { recording -> CarTrack? in
                guard let url = CarTrack.audioURL(recording.url) else { return nil }
                return CarTrack(id: recording.id, title: "\(title) · \(chapter.title)", artist: recording.narrator,
                    url: url, duration: recording.duration, path: "/books/\(id)?chapter=\(chapter.id)", chapter: chapter.id)
            }
        }
    }
}

struct CarRecording: Decodable {
    let id: String
    let title: String
    let reference: String
    let url: String
    let duration: Double
    let narrator: String
    var segment: Int {
        guard let range = reference.range(of: ", segment "), let value = reference[range.upperBound...].split(separator: "/").first else { return 0 }
        return Int(value) ?? 0
    }
}

struct CarTrack: Codable, Equatable {
    let id: String
    let title: String
    let artist: String
    let url: URL
    let duration: Double
    let path: String
    let chapter: String

    static func audioURL(_ raw: String) -> URL? {
        // No arbitrary remote hosts, credentials, javascript URLs or local files from a catalogue.
        let absolute = raw.hasPrefix("/audio/") ? "https://www.quran-coach.fr\(raw)" : raw
        guard let url = URL(string: absolute), url.scheme == "https", url.user == nil, url.password == nil,
              ["www.quran-coach.fr", "quran-coach-audio.madouyatt95.workers.dev", "cdn.islamic.network"].contains(url.host?.lowercased() ?? "") else { return nil }
        return url
    }
}

struct CarReciter {
    let id: String
    let name: String
    let edition: String
    let bitrate: Int
    static let all = [
        CarReciter(id: "ar.alafasy", name: "Mishary Al-Afasy", edition: "ar.alafasy", bitrate: 128),
        CarReciter(id: "ar.abdulbasit", name: "Abdul Basit Abdul Samad", edition: "ar.abdulbasitmurattal", bitrate: 192),
        CarReciter(id: "ar.husary", name: "Mahmoud Al-Husary", edition: "ar.husary", bitrate: 128),
        CarReciter(id: "ar.minshawi", name: "Mohamed Al-Minshawi", edition: "ar.minshawi", bitrate: 128)
    ]
    func tracks(_ surah: CarSurah) -> [CarTrack] {
        (1...surah.count).map { verse in
            CarTrack(id: "quran:\(id):\(surah.id):\(verse)", title: "\(surah.latin) · \(surah.id):\(verse)", artist: name,
                url: URL(string: "https://cdn.islamic.network/quran/audio/\(bitrate)/\(edition)/\(surah.offset + verse).mp3")!,
                duration: 0, path: "/read?surah=\(surah.id)&ayah=\(verse)", chapter: "\(surah.id)")
        }
    }
}

enum CarAudioData {
    static let catalogURL = URL(string: "https://quran-coach-audio.madouyatt95.workers.dev/catalog")!
    static func bundled<T: Decodable>(_ file: String, as: T.Type) -> T? {
        guard let url = Bundle.main.url(forResource: file, withExtension: "json", subdirectory: "public/carplay"),
              let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
    static func unique(_ recordings: [CarRecording]) -> [CarRecording] {
        var seen = Set<String>()
        return recordings.filter { seen.insert($0.id).inserted && $0.duration.isFinite && $0.duration > 0 && CarTrack.audioURL($0.url) != nil }
    }
}

struct CarPrayerEvent: Codable, Equatable {
    let kind: String
    let label: String
    let at: Double
}

enum CarPrayerData {
    static func upcoming(_ data: Data?, updatedAt: Double, now: Date = Date()) -> [CarPrayerEvent] {
        let milliseconds = now.timeIntervalSince1970 * 1000
        // Do not present yesterday's mosque timetable as today's reliable schedule.
        guard updatedAt > 0, milliseconds - updatedAt >= -60_000, milliseconds - updatedAt < 86_400_000,
              let data, let events = try? JSONDecoder().decode([CarPrayerEvent].self, from: data) else { return [] }
        return Array(events.filter { ["adhan", "iqama"].contains($0.kind) && $0.at.isFinite && $0.at > milliseconds && $0.at <= milliseconds + 86_400_000 }
            .sorted { $0.at < $1.at }.prefix(24))
    }
}
