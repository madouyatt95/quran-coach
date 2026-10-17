import Foundation

@main struct VerifyWidgetData {
    static func main() throws {
        var checks = 0
        func expect(_ condition: @autoclosure () -> Bool, _ message: String) {
            guard condition() else { fatalError(message) }; checks += 1
        }
        let fixture = URL(fileURLWithPath: CommandLine.arguments[1])
        let data = try Data(contentsOf: fixture)
        let snapshot = try JSONDecoder().decode(ActivityWidgetSnapshot.self, from: data)
        expect(snapshot.isValid, "The TypeScript snapshot must pass the native validation")
        var calendar = Calendar(identifier: .gregorian); calendar.timeZone = TimeZone(identifier: "Europe/Paris")!
        let date = ISO8601DateFormatter()
        expect(snapshot.invocation(at: date.date(from: "2026-10-16T01:59:00Z")!, calendar: calendar).morning == false, "Before 04:00: evening")
        expect(snapshot.invocation(at: date.date(from: "2026-10-16T02:00:00Z")!, calendar: calendar).morning, "At 04:00: morning")
        expect(snapshot.invocation(at: date.date(from: "2026-10-16T13:59:00Z")!, calendar: calendar).morning, "Before 16:00: morning")
        expect(snapshot.invocation(at: date.date(from: "2026-10-16T14:00:00Z")!, calendar: calendar).morning == false, "At 16:00: evening")
        expect(snapshot.memorization.dueCount(at: date.date(from: "2026-10-16T23:59:00Z")!) == 1, "SRS before UTC midnight")
        expect(snapshot.memorization.dueCount(at: date.date(from: "2026-10-17T00:00:00Z")!) == 2, "SRS at UTC midnight")
        let item = InvocationWidgetItem(title: "Test suivant", arabic: "", source: "")
        let period = InvocationWidgetPeriod(completed: 3, total: 10, next: item, first: InvocationWidgetItem(title: "Test premier", arabic: "", source: ""))
        let changed = ActivityWidgetSnapshot(version: 1, updatedAt: snapshot.updatedAt, reading: snapshot.reading,
            invocations: InvocationWidgetData(day: "2026-10-16", morning: period, evening: period), memorization: snapshot.memorization)
        let nextDay = changed.invocation(at: date.date(from: "2026-10-16T22:00:00Z")!, calendar: calendar)
        expect(nextDay.completed == 0 && nextDay.item.title == "Test premier", "Local midnight resets counts and restores the first entry")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://read")!) == "/read?widget=resume", "Reading route")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://adhkar")!) == "/adhkar?widget=moment", "Invocation route")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://hifdh?resume=reviews")!) == "/hifdh?resume=reviews", "Review queue route")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://hifdh")!) == "/hifdh?widget=resume", "Session route")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "https://read")!) == nil, "Reject another scheme")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://unknown")!) == nil, "Reject unknown route")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://user:password@read")!) == nil, "Reject embedded credentials")
        let base = URL(string: "capacitor://localhost/")!
        expect(QuranCoachWidgetRoute.appURL(base: base, path: "/read?widget=resume")?.absoluteString == "capacitor://localhost/read?widget=resume", "Query remains a query, not an encoded path")
        expect(QuranCoachWidgetRoute.appURL(base: base, path: "https://example.com/read") == nil, "Reject external origin")
        expect(QuranCoachWidgetRoute.appURL(base: base, path: "//example.com/read") == nil, "Reject protocol-relative URL")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://prayers")!) == "/prayers", "Existing prayer link preserved")
        expect(QuranCoachWidgetRoute.path(for: URL(string: "qurancoach://home")!) == "/", "Existing hadith link preserved")
        print("\(checks) native widget checks passed (TypeScript payload, period boundaries, midnight, SRS dates and deep links).")
    }
}
