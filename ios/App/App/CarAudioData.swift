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
    var listening: CarListeningReference? = nil

    static func audioURL(_ raw: String) -> URL? {
        // No arbitrary remote hosts, credentials, javascript URLs or local files from a catalogue.
        let absolute = raw.hasPrefix("/audio/") ? "https://www.quran-coach.fr\(raw)" : raw
        guard let url = URL(string: absolute), url.scheme == "https", url.user == nil, url.password == nil, url.port == nil, let host = url.host?.lowercased() else { return nil }
        if ["www.quran-coach.fr", "quran-coach-audio.madouyatt95.workers.dev", "cdn.islamic.network"].contains(host) { return url }
        if host.range(of: "^server[0-9]+\\.mp3quran\\.net$", options: .regularExpression) != nil && url.path.lowercased().hasSuffix(".mp3") { return url }
        if host == "cdn.mp3quran.net" && url.path.range(of: "^/audio/[a-zA-Z0-9_-]+/r[0-9]+/[0-9]{3}\\.mp3$", options: .regularExpression) != nil { return url }
        if host == "archive.org" && url.path.range(of: "^/download/(Coran_Arabe_Franais_HoudeyfaInconnu|omar-hisham-al-arabi)/[0-9]{3}\\.mp3$", options: .regularExpression) != nil { return url }
        return nil
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
    var published: Bool? = nil
    var source: String? = nil
}

struct CarListeningReference: Codable, Equatable {
    struct Verse: Codable, Equatable {
        let number: Int
        let globalNumber: Int
        let text: String
        let translation: String
    }
    let surahNumber: Int
    let surahName: String
    let reciterId: String
    let reciterName: String
    let audioUrl: String
    let totalAyahs: Int
    var verse: Verse? = nil
    var valid: Bool { (1...114).contains(surahNumber) && reciterId.range(of: "^[a-zA-Z0-9_.-]{1,80}$", options: .regularExpression) != nil && CarTrack.audioURL(audioUrl) != nil }
}
struct CarListeningResume: Codable {
    let tracks: [CarTrack]
    let index: Int
    let position: Double
    let updatedAt: Double
    var valid: Bool { tracks.indices.contains(index) && tracks.count <= 500 && position.isFinite && position >= 0 && tracks.allSatisfy { track in
        guard let reference = track.listening, reference.valid else { return false }
        return CarTrack.audioURL(track.url.absoluteString) != nil && URL(string: reference.audioUrl) == track.url
    } }
}
struct CarListeningSnapshot: Codable {
    let favorites: [String]
    let recent: [CarListeningResume]
    let bookmarks: [CarListeningResume]
    let resume: CarListeningResume?
    static func read(_ defaults: UserDefaults) -> CarListeningSnapshot? {
        guard let data = defaults.data(forKey: "car.listening"), data.count < 4_000_000 else { return nil }
        return try? JSONDecoder().decode(Self.self, from: data)
    }
}
struct CarListeningEdition: Decodable {
    let id: Int
    let name: String
    let server: String
    let surah_total: Int
    let moshaf_type: Int
    let surah_list: String
    var surahs: [Int] { Array(Set(surah_list.split(separator: ",").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }.filter { (1...114).contains($0) })).sorted() }
    func tracks(reciter: String, name: String, surahs all: [CarSurah]) -> [CarTrack] {
        surahs.compactMap { id in CarListeningCatalog.track(reciter: reciter, name: name, server: server, surah: all.first { $0.id == id }) }
    }
}
struct CarListeningReciter: Decodable {
    let id: Int
    let name: String
    let moshaf: [CarListeningEdition]
    var best: CarListeningEdition? { moshaf.filter { $0.moshaf_type == 11 }.max { $0.surah_total < $1.surah_total } ?? moshaf.max { $0.surah_total < $1.surah_total } }
}
struct CarListeningCatalog: Decodable {
    struct Collection: Decodable { let id: String; let name: String; let server: String; let surahs: [Int] }
    let names: [String: String]
    let collections: [Collection]
    static let url = URL(string: "https://mp3quran.net/api/v3/reciters?language=fr")!
    static func track(reciter: String, name: String, server: String, surah: CarSurah?) -> CarTrack? {
        guard let surah, let url = CarTrack.audioURL(server + (server.hasSuffix("/") ? "" : "/") + String(format: "%03d.mp3", surah.id)) else { return nil }
        let reference = CarListeningReference(surahNumber: surah.id, surahName: surah.latin, reciterId: reciter, reciterName: name, audioUrl: url.absoluteString, totalAyahs: surah.count)
        return CarTrack(id: "listen:\(reciter):\(surah.id):\(url.path)", title: surah.latin, artist: name, url: url, duration: 0, path: "/listen/\(reciter)?surah=\(surah.id)", chapter: String(surah.id), listening: reference)
    }
}

struct CarPrayerSnapshot: Codable {
    var mosque: String
    var mosqueId: String
    var lat: Double?
    var lng: Double?
    var source: String
    var sourceUpdatedAt: Double
    var updatedAt: Double
    var refreshURL: String?
    var events: [CarPrayerEvent]
    var timezone: String? = nil
    var hasDestination: Bool { guard let lat, let lng else { return false }; return lat.isFinite && lng.isFinite && (-90...90).contains(lat) && (-180...180).contains(lng) }
    func upcoming(now: Date = Date()) -> [CarPrayerEvent] { CarPrayerData.upcoming(try? JSONEncoder().encode(events), updatedAt: updatedAt, now: now) }
    var refreshEndpoint: URL? {
        guard let raw = refreshURL, let url = URLComponents(string: raw), url.scheme == "https", url.host == "www.quran-coach.fr", url.port == nil,
              url.user == nil, url.password == nil, url.path == "/api/mosques", url.fragment == nil,
              let query = url.queryItems, query.count == 2,
              query.first(where: { $0.name == "action" })?.value == "published",
              let slug = query.first(where: { $0.name == "slug" })?.value,
              slug.range(of: "^[a-zA-Z0-9][a-zA-Z0-9_-]{1,179}$", options: .regularExpression) != nil else { return nil }
        return url.url
    }
    var selectionID: String { mosqueId.isEmpty ? mosque : mosqueId }
    func time(_ at: Double) -> String {
        let formatter = DateFormatter(); formatter.locale = Locale(identifier: "fr_FR"); formatter.dateFormat = "HH:mm"
        if let timezone { formatter.timeZone = TimeZone(identifier: timezone) }
        return formatter.string(from: Date(timeIntervalSince1970: at / 1000))
    }
    struct Prayer {
        let id: String
        let label: String
        let adhan: CarPrayerEvent?
        let iqama: CarPrayerEvent?
        let next: CarPrayerEvent
    }
    func prayers(now: Date = Date()) -> [Prayer] {
        guard !upcoming(now: now).isEmpty else { return [] }
        var calendar = Calendar(identifier: .gregorian)
        if let timezone, let zone = TimeZone(identifier: timezone) { calendar.timeZone = zone }
        let ms = now.timeIntervalSince1970 * 1000
        let valid = events.filter { ["adhan", "iqama"].contains($0.kind) && $0.at.isFinite && $0.at > ms - 43_200_000 && $0.at <= ms + 86_400_000 }
        let grouped = Dictionary(grouping: valid) { "\($0.label):\(calendar.startOfDay(for: Date(timeIntervalSince1970: $0.at / 1000)).timeIntervalSince1970)" }
        return grouped.compactMap { key, values in
            guard let next = values.filter({ $0.at > ms }).min(by: { $0.at < $1.at }) else { return nil }
            return Prayer(id: key, label: next.label, adhan: values.first { $0.kind == "adhan" }, iqama: values.first { $0.kind == "iqama" }, next: next)
        }.sorted { $0.next.at < $1.next.at }
    }
    static func read(_ defaults: UserDefaults) -> Self {
        if let data = defaults.data(forKey: "car.prayerSnapshot"), let value = try? JSONDecoder().decode(Self.self, from: data) { return value }
        return Self(mosque: defaults.string(forKey: "car.mosque") ?? "", mosqueId: "", source: defaults.string(forKey: "car.source") ?? "", sourceUpdatedAt: 0, updatedAt: defaults.double(forKey: "car.updatedAt"), events: (try? JSONDecoder().decode([CarPrayerEvent].self, from: defaults.data(forKey: "car.events") ?? Data())) ?? [])
    }
    func countdown(_ event: CarPrayerEvent, now: Date = Date()) -> String {
        let seconds = max(0, Int(ceil(event.at / 1000 - now.timeIntervalSince1970))), minutes = seconds / 60
        return minutes >= 60 ? "dans \(minutes / 60) h \(minutes % 60) min" : "dans \(minutes) min \(seconds % 60) s"
    }
    func reminder(now: Date, lead: Int, seen: Set<String>) -> (key: String, text: String)? {
        let ms = now.timeIntervalSince1970 * 1000
        guard [5,10,15].contains(lead), sourceUpdatedAt > 0, ms - sourceUpdatedAt >= -60_000, ms - sourceUpdatedAt < 3_600_000 else { return nil }
        for event in upcoming(now: now) where event.kind == "iqama" && event.published == true {
            let key = "\(mosqueId):\(event.label):\(Int(event.at))", delay = ms - (event.at - Double(lead) * 60_000)
            if delay >= 0 && delay <= 45_000 && !seen.contains(key) { return (key, "L’iqama de \(event.label) est dans \(lead) minutes.") }
        }
        return nil
    }
}

/// Only explicit instants returned by the existing mosque provider are accepted.
struct CarPublishedTimetable: Decodable {
    struct Envelope: Decodable { let timetable: CarPublishedTimetable }
    struct Day: Decodable {
        struct Prayer: Decodable { let key: String; let adhanAt: Double?; let iqamaAt: Double? }
        struct Friday: Decodable { let at: Double }
        let date: String; let prayers: [Prayer]; let jumua: [Friday]
    }
    let source: String
    let fetchedAt: Double
    let timezone: String
    let days: [Day]
    func applying(to snapshot: CarPrayerSnapshot, now: Date = Date()) -> CarPrayerSnapshot? {
        let ms = now.timeIntervalSince1970 * 1000
        guard source == "MAWAQIT", fetchedAt.isFinite, ms - fetchedAt >= -60_000, ms - fetchedAt < 3_600_000,
              TimeZone(identifier: timezone) != nil, !days.isEmpty else { return nil }
        let labels = ["fajr": "Fajr", "dhuhr": "Dhuhr", "asr": "Asr", "maghrib": "Maghrib", "isha": "Isha"]
        var result = snapshot; var events: [CarPrayerEvent] = []
        func add(_ kind: String, _ label: String, _ at: Double?) {
            guard let at, at.isFinite, at > ms - 43_200_000, at <= ms + 86_400_000 else { return }
            events.append(CarPrayerEvent(kind: kind, label: label, at: at, published: true, source: "Horaire publié · MAWAQIT"))
        }
        for day in days {
            for prayer in day.prayers {
                guard let label = labels[prayer.key] else { continue }
                add("adhan", label, prayer.adhanAt)
                if prayer.key != "dhuhr" || day.jumua.isEmpty { add("iqama", label, prayer.iqamaAt) }
            }
            for (index, friday) in day.jumua.enumerated() { add("iqama", "Jumu’a\(day.jumua.count > 1 ? " · \(index + 1)" : "")", friday.at) }
        }
        result.events = events.sorted { $0.at < $1.at }; result.timezone = timezone
        result.updatedAt = ms; result.sourceUpdatedAt = fetchedAt; result.source = "Horaire publié · MAWAQIT"
        return result
    }
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
