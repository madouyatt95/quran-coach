import WidgetKit
import SwiftUI

// Struct de Données lues depuis Capacitor Preferences
struct QuranWidgetData: TimelineEntry {
    let date: Date
    let nextPrayerName: String
    let nextPrayerTime: String
    let hadithText: String
    let hadithSource: String
    let sentinelWordAr: String
    let sentinelWordFr: String
}

// Fournisseur et synchronisation UserDefaults
struct Provider: TimelineProvider {
    // Déclaration du App Group utilisé dans Capacitor
    let userDefaults = UserDefaults(suiteName: "group.com.qurancoach.app")
    
    func placeholder(in context: Context) -> QuranWidgetData {
        QuranWidgetData(date: Date(), nextPrayerName: "Fajr", nextPrayerTime: "05:30", hadithText: "La religion, c'est le bon comportement.", hadithSource: "Al-Bukhari", sentinelWordAr: "صَبْر", sentinelWordFr: "Patience et persévérance")
    }

    func getSnapshot(in context: Context, completion: @escaping (QuranWidgetData) -> ()) {
        let entry = getCurrentData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // Rafraîchissement régulier, idéalement toutes les heures pour check
        let entry = getCurrentData()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    // Récupération des données depuis le pont Javascript-Capacitor
    private func getCurrentData() -> QuranWidgetData {
        let prayerName = userDefaults?.string(forKey: "widgetNextPrayerName") ?? "Prochaine prière..."
        let prayerTime = userDefaults?.string(forKey: "widgetNextPrayerTime") ?? "--:--"
        let hText = userDefaults?.string(forKey: "widgetHadithText") ?? "Ouvrez l'application pour synchroniser les données."
        let hSource = userDefaults?.string(forKey: "widgetHadithSource") ?? "Quran Coach"
        let sWordAr = userDefaults?.string(forKey: "widgetSentinelWordAr") ?? "🕌"
        let sWordFr = userDefaults?.string(forKey: "widgetSentinelWordFr") ?? "Rappel Quotidien"
        
        return QuranWidgetData(date: Date(), nextPrayerName: prayerName, nextPrayerTime: prayerTime, hadithText: hText, hadithSource: hSource, sentinelWordAr: sWordAr, sentinelWordFr: sWordFr)
    }
}

// ---------------------------------------------
// VUE WIDGET 1 : PROCHAINE PRIERE (Medium/Small)
// ---------------------------------------------
struct PrayerWidgetEntryView : View {
    var entry: Provider.Entry
    var body: some View {
        ZStack {
            Color(red: 0.1, green: 0.1, blue: 0.2) // Fond Sombre
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("🕌").font(.title2)
                    Text("Prochaine Prière")
                        .font(.headline)
                        .foregroundColor(Color(red: 0.8, green: 0.7, blue: 0.3)) // Doré
                }
                Spacer()
                Text(entry.nextPrayerName)
                    .font(.title2).bold()
                    .foregroundColor(.white)
                Text(entry.nextPrayerTime)
                    .font(.largeTitle).bold()
                    .foregroundColor(.white)
            }
            .padding()
        }
    }
}

// ---------------------------------------------
// VUE WIDGET 2 : HADITH DU JOUR (Medium/Large)
// ---------------------------------------------
struct HadithWidgetEntryView : View {
    var entry: Provider.Entry
    var body: some View {
        ZStack {
            Color(red: 0.05, green: 0.05, blue: 0.1) // Fond Nuit
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("📜 Hadith du Jour")
                        .font(.subheadline)
                        .foregroundColor(Color(red: 0.8, green: 0.7, blue: 0.3))
                        .textCase(.uppercase)
                }
                Text(entry.hadithText)
                    .font(.system(size: 15, weight: .regular, design: .serif))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.leading)
                    .lineLimit(4)
                Spacer()
                Text("— \(entry.hadithSource)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding()
        }
    }
}

// ---------------------------------------------
// LES 2 WIDGETS DECLARATION
// ---------------------------------------------
struct PrayerWidget: Widget {
    let kind: String = "PrayerWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PrayerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prochaine Prière")
        .description("Affiche fièrement l'heure de la prochaine prière.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct HadithWidget: Widget {
    let kind: String = "HadithWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HadithWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Hadith du Jour")
        .description("Un rappel prophétique spirituel sur votre écran.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// Bundle pour l'installation des 2 Widgets en même temps
@main
struct QuranCoachWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerWidget()
        HadithWidget()
    }
}
