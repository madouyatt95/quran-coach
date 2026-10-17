import WidgetKit
import SwiftUI

private let group = "group.com.qurancoach.app"
private let gold = Color(red: 0.85, green: 0.73, blue: 0.39)
private let violet = Color(red: 0.10, green: 0.09, blue: 0.19)
private struct SharedPrayerEvent: Decodable { let kind: String; let label: String; let at: Double; var date: Date { Date(timeIntervalSince1970: at / 1000) } }
struct TravelPrayerEntry: TimelineEntry {
    let date: Date
    let mosque: String
    let adhanName: String
    let adhanAt: Date?
    let iqamaName: String
    let iqamaAt: Date?
}
struct TravelPrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> TravelPrayerEntry {
        TravelPrayerEntry(date: Date(), mosque: "", adhanName: "", adhanAt: nil, iqamaName: "", iqamaAt: nil)
    }
    func getSnapshot(in context: Context, completion: @escaping (TravelPrayerEntry) -> Void) { completion(readEntry(at: Date())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<TravelPrayerEntry>) -> Void) {
        let now = Date(), defaults = UserDefaults(suiteName: group)
        let expiry = Date(timeIntervalSince1970: (defaults?.double(forKey: "car.updatedAt") ?? 0) / 1000).addingTimeInterval(86400)
        let changes = readEvents().map { $0.date.addingTimeInterval(1) }.filter { $0 > now && $0 < expiry }
        let dates = ([now] + changes + (expiry > now ? [expiry] : [])).sorted()
        completion(Timeline(entries: dates.map { readEntry(at: $0) }, policy: .after(max(expiry, now.addingTimeInterval(20 * 60)))))
    }
    private func readEvents() -> [SharedPrayerEvent] {
        guard let data = UserDefaults(suiteName: group)?.data(forKey: "car.events"), let values = try? JSONDecoder().decode([SharedPrayerEvent].self, from: data) else { return [] }
        return values.filter { ["adhan", "iqama"].contains($0.kind) && $0.at.isFinite && $0.at > 0 }.sorted { $0.at < $1.at }
    }
    private func readEntry(at date: Date) -> TravelPrayerEntry {
        let defaults = UserDefaults(suiteName: group)
        let updated = Date(timeIntervalSince1970: (defaults?.double(forKey: "car.updatedAt") ?? 0) / 1000)
        let fresh = date.timeIntervalSince(updated) >= -60 && date.timeIntervalSince(updated) < 86400
        let events = fresh ? readEvents().filter { $0.date > date } : []
        let adhan = events.first { $0.kind == "adhan" }, iqama = events.first { $0.kind == "iqama" }
        return TravelPrayerEntry(date: date, mosque: fresh ? defaults?.string(forKey: "car.mosque") ?? "" : "", adhanName: adhan?.label ?? "", adhanAt: adhan?.date, iqamaName: iqama?.label ?? "", iqamaAt: iqama?.date)
    }
}
struct TravelPrayerView: View {
    let entry: TravelPrayerEntry
    private var next: Date? { [entry.adhanAt, entry.iqamaAt].compactMap { $0 }.min() }
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Image(systemName: "moon.stars.fill").foregroundStyle(gold)
                Text("Quran Coach").font(.caption.weight(.bold)).foregroundStyle(gold)
            }
            if let adhan = entry.adhanAt {
                HStack(alignment: .firstTextBaseline) {
                    Text("Adhan · \(entry.adhanName)").font(.caption.weight(.semibold)).lineLimit(1)
                    Spacer(minLength: 4)
                    Text(adhan, style: .time).font(.headline.monospacedDigit())
                }
            } else { Text("Horaires à actualiser").font(.caption.weight(.semibold)) }
            if let iqama = entry.iqamaAt {
                HStack {
                    Text("Iqama · \(entry.iqamaName)").lineLimit(1)
                    Spacer(minLength: 4)
                    Text(iqama, style: .time).monospacedDigit()
                }.font(.caption)
            } else { Text("Iqama non renseignée").font(.caption).opacity(0.75) }
            if let next = next {
                HStack(spacing: 5) { Text("Dans"); Text(next, style: .timer).monospacedDigit() }.font(.caption.weight(.medium)).foregroundStyle(gold)
            }
            if !entry.mosque.isEmpty { Text(entry.mosque).lineLimit(1).font(.caption2).opacity(0.7) }
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(URL(string: "qurancoach://prayers"))
        .containerBackground(violet, for: .widget)
    }
}
/** Preserve the kind used by widgets already installed from the App Store. */
struct PrayerWidget: Widget {
    let kind = "PrayerWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TravelPrayerProvider()) { TravelPrayerView(entry: $0) }
            .configurationDisplayName("Adhan et Iqama")
            .description("La prochaine prière et l’Iqama connue de votre mosquée.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
struct HadithEntry: TimelineEntry { let date: Date; let text: String; let source: String }
struct HadithProvider: TimelineProvider {
    func placeholder(in context: Context) -> HadithEntry { HadithEntry(date: Date(), text: "Le rappel du jour apparaîtra après l’ouverture de Quran Coach.", source: "") }
    func getSnapshot(in context: Context, completion: @escaping (HadithEntry) -> Void) { completion(entry(at: Date())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<HadithEntry>) -> Void) {
        let now = Date(), midnight = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: now))!
        completion(Timeline(entries: [entry(at: now), entry(at: midnight)], policy: .after(midnight)))
    }
    private func entry(at date: Date) -> HadithEntry {
        let defaults = UserDefaults(suiteName: group)
        let updated = Date(timeIntervalSince1970: (defaults?.double(forKey: "widgetHadithUpdatedAt") ?? 0) / 1000)
        let fresh = Calendar.current.isDate(date, inSameDayAs: updated)
        return HadithEntry(date: date, text: fresh ? defaults?.string(forKey: "widgetHadithText") ?? "Ouvrez Quran Coach pour retrouver le rappel du jour." : "Ouvrez Quran Coach pour retrouver le rappel du jour.", source: fresh ? defaults?.string(forKey: "widgetHadithSource") ?? "" : "")
    }
}
struct HadithView: View {
    @Environment(\.widgetFamily) private var family
    let entry: HadithEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Hadith du jour", systemImage: "text.book.closed").font(.caption.weight(.bold)).foregroundStyle(gold)
            Text(entry.text).font(.system(size: family == .systemLarge ? 17 : 14, design: .serif)).lineLimit(family == .systemLarge ? 12 : 4)
            Spacer(minLength: 0)
            if !entry.source.isEmpty { Text(entry.source).font(.caption2).lineLimit(1).foregroundStyle(.secondary) }
        }.foregroundStyle(.white).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(URL(string: "qurancoach://home"))
        .containerBackground(violet, for: .widget)
    }
}
struct HadithWidget: Widget {
    let kind = "HadithWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HadithProvider()) { HadithView(entry: $0) }
            .configurationDisplayName("Hadith du jour")
            .description("Le même rappel que sur l’accueil de Quran Coach, avec sa référence.")
            .supportedFamilies([.systemMedium, .systemLarge])
    }
}
@main
struct QuranCoachWidgetBundle: WidgetBundle {
    var body: some Widget { PrayerWidget(); HadithWidget(); ReadingResumeWidget(); MomentInvocationsWidget(); MemorizationWidget() }
}

private struct ActivityEntry: TimelineEntry {
    let date: Date
    let snapshot: ActivityWidgetSnapshot
}
private struct ActivityProvider: TimelineProvider {
    let changesWithTime: Bool
    private func read() -> ActivityWidgetSnapshot { ActivityWidgetSnapshot.read(defaults: UserDefaults(suiteName: group)) ?? .empty }
    func placeholder(in context: Context) -> ActivityEntry { ActivityEntry(date: Date(), snapshot: .empty) }
    func getSnapshot(in context: Context, completion: @escaping (ActivityEntry) -> Void) { completion(ActivityEntry(date: Date(), snapshot: read())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<ActivityEntry>) -> Void) {
        let now = Date(), snapshot = read()
        guard changesWithTime else { completion(Timeline(entries: [ActivityEntry(date: now, snapshot: snapshot)], policy: .never)); return }
        var dates = [now]
        let calendar = Calendar.current
        // Local morning/evening boundaries, local midnight, and the SRS midnight in UTC.
        for offset in 0...2 {
            let day = calendar.date(byAdding: .day, value: offset, to: calendar.startOfDay(for: now))!
            for hour in [0, 4, 16] {
                if let date = calendar.date(bySettingHour: hour, minute: 0, second: 0, of: day), date > now { dates.append(date) }
            }
        }
        var utc = Calendar(identifier: .gregorian); utc.timeZone = TimeZone(secondsFromGMT: 0)!
        let utcMidnight = utc.date(byAdding: .day, value: 1, to: utc.startOfDay(for: now))!
        dates.append(utcMidnight)
        completion(Timeline(entries: Array(Set(dates)).sorted().map { ActivityEntry(date: $0, snapshot: snapshot) }, policy: .after(min(utcMidnight, calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: now))!))))
    }
}

private struct ActivitySurface: ViewModifier {
    @Environment(\.widgetFamily) private var family
    func body(content: Content) -> some View {
        content.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .foregroundStyle(family == .accessoryRectangular ? Color.primary : Color.white)
            .containerBackground(for: .widget) {
                if family == .accessoryRectangular { Color.clear }
                else { LinearGradient(colors: [Color(red: 0.18, green: 0.14, blue: 0.29), violet], startPoint: .topLeading, endPoint: .bottomTrailing) }
            }
    }
}
private struct ActivityHeading: View {
    let title: String
    let icon: String
    var body: some View {
        Label(title, systemImage: icon).font(.system(size: 10, weight: .bold)).tracking(0.8).foregroundStyle(gold).lineLimit(1)
    }
}
private struct ActivityFooter: View {
    let title: String
    var body: some View {
        HStack { Text(title).lineLimit(1); Spacer(minLength: 3); Image(systemName: "arrow.up.right").font(.system(size: 10, weight: .bold)) }
            .font(.caption2.weight(.semibold)).foregroundStyle(gold)
    }
}
private struct ReadingResumeView: View {
    @Environment(\.widgetFamily) private var family
    let entry: ActivityEntry
    private var data: ReadingWidgetData { entry.snapshot.reading }
    var body: some View {
        Group {
            if family == .accessoryRectangular {
                VStack(alignment: .leading, spacing: 3) {
                    Label("Reprendre ma lecture", systemImage: "bookmark.fill").font(.caption.weight(.semibold))
                    Text(data.available ? "\(data.chapter) · p. \(data.page)" : "Ouvrir le Mushaf").font(.headline).lineLimit(1)
                    if data.available { Text(data.detail).font(.caption2).lineLimit(1) }
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ActivityHeading(title: "MA LECTURE", icon: "bookmark.fill")
                    Spacer(minLength: 0)
                    HStack(alignment: .center, spacing: 12) {
                        VStack(alignment: .leading, spacing: 5) {
                            Text(data.available ? data.chapter : "Ouvrir le Mushaf").font(.system(size: 21, weight: .semibold, design: .serif)).lineLimit(2).minimumScaleFactor(0.8)
                            Text(data.available ? data.detail : "Retrouver le plaisir de lire").font(.caption).foregroundStyle(.white.opacity(0.7)).lineLimit(2)
                        }
                        if family == .systemMedium {
                            Spacer(minLength: 0)
                            ZStack(alignment: .topTrailing) {
                                RoundedRectangle(cornerRadius: 9).fill(gold.opacity(0.12)).overlay(RoundedRectangle(cornerRadius: 9).stroke(gold.opacity(0.35)))
                                Image(systemName: "bookmark.fill").foregroundStyle(gold).font(.system(size: 23)).padding(.trailing, 11).offset(y: -2)
                                Image(systemName: "book.closed").font(.system(size: 29, weight: .ultraLight)).foregroundStyle(gold).frame(maxWidth: .infinity, maxHeight: .infinity)
                            }.frame(width: 65, height: 77).accessibilityHidden(true)
                        }
                    }
                    Spacer(minLength: 0)
                    ActivityFooter(title: data.available ? "Page \(data.page) · reprendre" : "Commencer ma lecture")
                }
            }
        }.modifier(ActivitySurface()).widgetURL(URL(string: "qurancoach://read"))
    }
}
struct ReadingResumeWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ReadingResumeWidget", provider: ActivityProvider(changesWithTime: false)) { ReadingResumeView(entry: $0) }
            .configurationDisplayName("Reprendre ma lecture")
            .description("Votre signet ou votre dernière position, directement dans le Mushaf.")
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}
private struct MomentInvocationsView: View {
    @Environment(\.widgetFamily) private var family
    let entry: ActivityEntry
    private var moment: (morning: Bool, completed: Int, total: Int, item: InvocationWidgetItem) { entry.snapshot.invocation(at: entry.date) }
    private var title: String { moment.morning ? "Invocations du matin" : "Invocations du soir" }
    var body: some View {
        Group {
            if family == .accessoryRectangular {
                VStack(alignment: .leading, spacing: 3) {
                    Label(title, systemImage: moment.morning ? "sunrise.fill" : "moon.stars.fill").font(.caption.weight(.semibold))
                    Text(moment.total > 0 ? "\(moment.completed) / \(moment.total) terminées" : "Ouvrir ma séance").font(.headline).lineLimit(1)
                    if moment.total > 0 { Text(moment.item.title).font(.caption2).lineLimit(1) }
                }
            } else {
                VStack(alignment: .leading, spacing: 7) {
                    ActivityHeading(title: moment.morning ? "MON MOMENT DU MATIN" : "MON MOMENT DU SOIR", icon: moment.morning ? "sunrise.fill" : "moon.stars.fill")
                    Text(moment.total > 0 ? moment.item.title : title).font(.system(size: family == .systemMedium ? 16 : 18, weight: .semibold, design: .serif)).lineLimit(2).minimumScaleFactor(0.85)
                    if family == .systemMedium && !moment.item.arabic.isEmpty {
                        Text(moment.item.arabic).font(.system(size: 23, design: .serif)).lineLimit(1).frame(maxWidth: .infinity, alignment: .trailing).environment(\.layoutDirection, .rightToLeft).environment(\.locale, Locale(identifier: "ar"))
                    }
                    Spacer(minLength: 0)
                    if moment.total > 0 {
                        ProgressView(value: Double(moment.completed), total: Double(moment.total)).tint(gold).accessibilityLabel("Invocations terminées aujourd’hui")
                        HStack {
                            Text("\(moment.completed) / \(moment.total)").monospacedDigit()
                            Spacer()
                            Text(moment.completed == moment.total ? "Relire" : moment.completed > 0 ? "Continuer" : "Commencer")
                            Image(systemName: "arrow.up.right")
                        }.font(.caption2.weight(.semibold)).foregroundStyle(gold)
                    } else { ActivityFooter(title: "Ouvrir ma séance") }
                    if family == .systemMedium && !moment.item.source.isEmpty { Text(moment.item.source).font(.system(size: 9)).lineLimit(1).foregroundStyle(.white.opacity(0.55)) }
                }
            }
        }.modifier(ActivitySurface()).widgetURL(URL(string: "qurancoach://adhkar"))
    }
}
struct MomentInvocationsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MomentInvocationsWidget", provider: ActivityProvider(changesWithTime: true)) { MomentInvocationsView(entry: $0) }
            .configurationDisplayName("Invocations du moment")
            .description("Votre séance du matin ou du soir, sa progression et la prochaine invocation.")
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}
private struct MemorizationView: View {
    @Environment(\.widgetFamily) private var family
    let entry: ActivityEntry
    private var data: MemorizationWidgetData { entry.snapshot.memorization }
    private var due: Int { data.dueCount(at: entry.date) }
    private var reviewLabel: String { due > 0 ? "\(due) verset\(due > 1 ? "s" : "") à réviser" : "Pas de révision prévue" }
    var body: some View {
        Group {
            if family == .accessoryRectangular {
                VStack(alignment: .leading, spacing: 3) {
                    Label("Ma mémorisation", systemImage: "mic.fill").font(.caption.weight(.semibold))
                    Text(data.available ? data.chapter : due > 0 ? "Mes révisions" : "Choisir un passage").font(.headline).lineLimit(1)
                    Text(reviewLabel).font(.caption2).lineLimit(1)
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ActivityHeading(title: "MA MÉMORISATION", icon: "mic.fill")
                    Spacer(minLength: 0)
                    Text(data.available ? data.chapter : due > 0 ? "Un rappel à consolider" : "Un verset à la fois").font(.system(size: 21, weight: .semibold, design: .serif)).lineLimit(2).minimumScaleFactor(0.8)
                    Text(data.available ? data.detail : "Une séance à votre rythme").font(.caption).foregroundStyle(.white.opacity(0.7)).lineLimit(2)
                    Spacer(minLength: 0)
                    if family == .systemMedium && due > 0 {
                        Link(destination: URL(string: "qurancoach://hifdh?resume=reviews")!) {
                            HStack { Image(systemName: "arrow.clockwise"); Text(reviewLabel); Spacer(); Image(systemName: "chevron.right") }
                                .font(.caption.weight(.semibold)).foregroundStyle(gold).padding(.vertical, 7).padding(.horizontal, 10).background(gold.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
                        }
                    } else { ActivityFooter(title: due > 0 ? reviewLabel : data.available ? "Reprendre ma séance" : "Choisir mon passage") }
                }
            }
        }.modifier(ActivitySurface()).widgetURL(URL(string: "qurancoach://hifdh"))
    }
}
struct MemorizationWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MemorizationWidget", provider: ActivityProvider(changesWithTime: true)) { MemorizationView(entry: $0) }
            .configurationDisplayName("Ma mémorisation")
            .description("Votre passage à reprendre et les versets arrivés à échéance de révision.")
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}
