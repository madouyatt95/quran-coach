import Foundation

enum QuranCoachWidgetRoute {
    static func path(for url: URL) -> String? {
        guard url.scheme?.lowercased() == "qurancoach", url.user == nil, url.password == nil else { return nil }
        switch url.host?.lowercased() {
        case "home": return "/"
        case "prayers": return "/prayers"
        case "read": return "/read?widget=resume"
        case "adhkar": return "/adhkar?widget=moment"
        case "hifdh":
            let review = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?.contains { $0.name == "resume" && $0.value == "reviews" } == true
            return review ? "/hifdh?resume=reviews" : "/hifdh?widget=resume"
        default: return nil
        }
    }

    static func appURL(base: URL, path: String) -> URL? {
        guard let route = URLComponents(string: path), route.scheme == nil, route.host == nil,
              ["/", "/prayers", "/read", "/adhkar", "/hifdh"].contains(route.path),
              var components = URLComponents(url: base, resolvingAgainstBaseURL: false) else { return nil }
        components.path = route.path
        components.percentEncodedQuery = route.percentEncodedQuery
        components.fragment = nil
        return components.url
    }
}

struct ReadingWidgetData: Codable, Equatable {
    let available: Bool
    let chapter: String
    let detail: String
    let page: Int
}
struct InvocationWidgetItem: Codable, Equatable {
    let title: String
    let arabic: String
    let source: String
}
struct InvocationWidgetPeriod: Codable, Equatable {
    let completed: Int
    let total: Int
    let next: InvocationWidgetItem
    let first: InvocationWidgetItem
}
struct InvocationWidgetData: Codable, Equatable {
    let day: String
    let morning: InvocationWidgetPeriod
    let evening: InvocationWidgetPeriod
}
struct WidgetReviewBucket: Codable, Equatable { let day: String; let count: Int }
struct MemorizationWidgetData: Codable, Equatable {
    let available: Bool
    let chapter: String
    let detail: String
    let reviews: [WidgetReviewBucket]

    // SRS currently stores its review dates in UTC. Keep the widget on the same convention.
    func dueCount(at date: Date) -> Int {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0)!
        let day = ActivityWidgetSnapshot.dayString(date, calendar: calendar)
        return reviews.filter { $0.day <= day }.reduce(0) { $0 + $1.count }
    }
}
struct ActivityWidgetSnapshot: Codable, Equatable {
    static let storageKey = "widget.activities.v1"
    let version: Int
    let updatedAt: Double
    let reading: ReadingWidgetData
    let invocations: InvocationWidgetData
    let memorization: MemorizationWidgetData

    var isValid: Bool {
        let items = [invocations.morning, invocations.evening]
        return version == 1 && updatedAt.isFinite && updatedAt > 0 &&
            reading.chapter.count <= 120 && reading.detail.count <= 180 &&
            (reading.available ? (1...604).contains(reading.page) : reading.page == 0) &&
            Self.isDay(invocations.day) && items.allSatisfy { period in
                (0...300).contains(period.total) && (0...period.total).contains(period.completed) &&
                [period.next, period.first].allSatisfy { $0.title.count <= 300 && $0.arabic.count <= 16000 && $0.source.count <= 1000 }
            } && memorization.chapter.count <= 120 && memorization.detail.count <= 180 &&
            memorization.reviews.count <= 10000 && memorization.reviews.allSatisfy { Self.isDay($0.day) && (1...10000).contains($0.count) } &&
            memorization.reviews.reduce(0) { $0 + $1.count } <= 10000
    }

    static func read(defaults: UserDefaults?) -> ActivityWidgetSnapshot? {
        guard let data = defaults?.data(forKey: storageKey), data.count <= 200000,
              let snapshot = try? JSONDecoder().decode(Self.self, from: data), snapshot.isValid else { return nil }
        return snapshot
    }

    static func dayString(_ date: Date, calendar: Calendar = .current) -> String {
        var gregorian = Calendar(identifier: .gregorian); gregorian.timeZone = calendar.timeZone
        let c = gregorian.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
    }
    private static func isDay(_ day: String) -> Bool {
        guard day.count == 10, day.range(of: #"^\d{4}-\d{2}-\d{2}$"#, options: .regularExpression) != nil else { return false }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.isLenient = false
        return formatter.date(from: day).map { formatter.string(from: $0) == day } ?? false
    }

    func invocation(at date: Date, calendar: Calendar = .current) -> (morning: Bool, completed: Int, total: Int, item: InvocationWidgetItem) {
        let hour = calendar.component(.hour, from: date)
        let morning = hour >= 4 && hour < 16
        let period = morning ? invocations.morning : invocations.evening
        let today = Self.dayString(date, calendar: calendar) == invocations.day
        return (morning, today ? period.completed : 0, period.total, today ? period.next : period.first)
    }

    static let empty: ActivityWidgetSnapshot = {
        let item = InvocationWidgetItem(title: "Une invocation après l’autre", arabic: "", source: "")
        let period = InvocationWidgetPeriod(completed: 0, total: 0, next: item, first: item)
        return Self(version: 1, updatedAt: 1, reading: ReadingWidgetData(available: false, chapter: "", detail: "", page: 0),
                    invocations: InvocationWidgetData(day: "1970-01-01", morning: period, evening: period),
                    memorization: MemorizationWidgetData(available: false, chapter: "", detail: "", reviews: []))
    }()
}
