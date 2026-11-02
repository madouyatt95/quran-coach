import Capacitor
import Foundation
import WidgetKit
import MediaPlayer

@objc(QuranCoachCarPlugin)
public final class QuranCoachCarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "QuranCoachCarPlugin"
    public let jsName = "QuranCoachCar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updatePrayerSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateWidgetContent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateActivityWidgets", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setNowPlaying", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearNowPlaying", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCarPlayback", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "carPlaybackCommand", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateCarPreferences", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateListeningSnapshot", returnType: CAPPluginReturnPromise)
    ]

    private let suite = "group.com.qurancoach.app"
    public override func load() {
        Task { @MainActor [weak self] in
            let audio = CarAudioPlayer.shared
            audio.install()
            audio.webCommand = { [weak self] action, seconds in
                var data: JSObject = ["action": action]
                if let seconds { data["seconds"] = seconds }
                self?.notifyListeners("remoteCommand", data: data)
            }
            audio.onChange = { [weak self] state in self?.notifyListeners("nativePlayback", data: state) }
        }
    }

    @objc func getCarPlayback(_ call: CAPPluginCall) {
        Task { @MainActor in call.resolve(CarAudioPlayer.shared.state) }
    }
    @objc func carPlaybackCommand(_ call: CAPPluginCall) {
        let action = call.getString("action") ?? ""
        let seconds = call.getDouble("seconds")
        Task { @MainActor in CarAudioPlayer.shared.command(action, seconds: seconds); call.resolve(CarAudioPlayer.shared.state) }
    }
    @objc func updateCarPreferences(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: suite)
        if let reciter = call.getString("reciter"), CarReciter.all.contains(where: { $0.id == reciter }) { defaults?.set(reciter, forKey: "car.reciter") }
        if let autoNext = call.getBool("autoNextBook") { defaults?.set(autoNext, forKey: "car.autoNextBook") }
        if let enabled = call.getBool("iqamaReminderEnabled") { defaults?.set(enabled, forKey: "car.iqamaReminderEnabled") }
        if let minutes = call.getInt("iqamaMinutes"), [5,10,15].contains(minutes) { defaults?.set(minutes, forKey: "car.iqamaMinutes") }
        NotificationCenter.default.post(name: .carPrayerChanged, object: nil)
        call.resolve()
    }

    @objc func updateListeningSnapshot(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: suite), let options = call.options, JSONSerialization.isValidJSONObject(options), let data = try? JSONSerialization.data(withJSONObject: options), data.count <= 4_000_000,
              let snapshot = try? JSONDecoder().decode(CarListeningSnapshot.self, from: data), snapshot.resume?.valid != false else { call.reject("Données d’écoute invalides"); return }
        defaults.set(try? JSONEncoder().encode(snapshot), forKey: "car.listening")
        if let raw = call.getArray("catalog", JSObject.self), let data = try? JSONSerialization.data(withJSONObject: raw), data.count <= 3_000_000,
           let reciters = try? JSONDecoder().decode([CarListeningReciter].self, from: data), !reciters.isEmpty { defaults.set(data, forKey: "car.listeningCatalog") }
        NotificationCenter.default.post(name: .carListeningChanged, object: nil)
        call.resolve()
    }

    @objc func updatePrayerSnapshot(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: suite) else {
            call.reject("App Group inaccessible")
            return
        }
        // The selected mosque destination stays in the App Group; no live GPS history.
        for key in ["mosque", "adhanName", "iqamaName", "source"] {
            let value = String((call.getString(key) ?? "").prefix(90))
            defaults.set(value, forKey: "car.\(key)")
        }
        for key in ["adhanAt", "iqamaAt", "updatedAt"] {
            let value = call.getDouble(key) ?? 0
            defaults.set(value.isFinite && value > 0 ? value : 0, forKey: "car.\(key)")
        }
        let raw = call.getArray("events", JSObject.self) ?? []
        let events: [[String: Any]] = raw.prefix(40).compactMap { event in
            guard let kind = event["kind"] as? String, ["adhan", "iqama"].contains(kind),
                  let label = event["label"] as? String, let at = event["at"] as? Double,
                  at.isFinite, at > 0 else { return nil }
            return ["kind": kind, "label": String(label.prefix(90)), "at": at, "published":event["published"] as? Bool ?? false,"source":String((event["source"] as? String ?? "").prefix(90))]
        }
        if let data = try? JSONSerialization.data(withJSONObject: events) { defaults.set(data, forKey: "car.events") }
        var snapshot: [String:Any] = ["mosque":defaults.string(forKey:"car.mosque") ?? "","mosqueId":String((call.getString("mosqueId") ?? "").prefix(180)),"source":defaults.string(forKey:"car.source") ?? "","updatedAt":defaults.double(forKey:"car.updatedAt"),"sourceUpdatedAt":call.getDouble("sourceUpdatedAt") ?? 0,"events":events]
        if let timezone=call.getString("timezone"),TimeZone(identifier:timezone) != nil { snapshot["timezone"]=timezone }
        if let lat=call.getDouble("lat"),let lng=call.getDouble("lng"),lat.isFinite,lng.isFinite,(-90...90).contains(lat),(-180...180).contains(lng){snapshot["lat"]=lat;snapshot["lng"]=lng}
        if let raw=call.getString("refreshURL"),let u=URL(string:raw),u.scheme=="https",u.host=="www.quran-coach.fr",u.path=="/api/mosques",u.user==nil,u.password==nil {snapshot["refreshURL"]=raw}
        if let data=try? JSONSerialization.data(withJSONObject:snapshot),var parsed=try? JSONDecoder().decode(CarPrayerSnapshot.self,from:data){if parsed.refreshEndpoint == nil { parsed.refreshURL=nil };defaults.set(try? JSONEncoder().encode(parsed),forKey:"car.prayerSnapshot")}
        WidgetCenter.shared.reloadTimelines(ofKind: "PrayerWidget")
        NotificationCenter.default.post(name: .carPrayerChanged, object: nil)
        call.resolve()
    }

    @objc func updateWidgetContent(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: suite) else { call.reject("App Group inaccessible"); return }
        let fields = ["hadithText": "widgetHadithText", "hadithSource": "widgetHadithSource",
                      "nextPrayerName": "widgetNextPrayerName", "nextPrayerTime": "widgetNextPrayerTime",
                      "sentinelWordAr": "widgetSentinelWordAr", "sentinelWordFr": "widgetSentinelWordFr"]
        for (field, key) in fields {
            if let value = call.getString(field) { defaults.set(String(value.prefix(field == "hadithText" ? 6000 : 160)), forKey: key) }
        }
        if let updated = call.getDouble("updatedAt"), updated.isFinite, updated > 0 { defaults.set(updated, forKey: "widgetHadithUpdatedAt") }
        WidgetCenter.shared.reloadTimelines(ofKind: "HadithWidget")
        call.resolve()
    }

    @objc func updateActivityWidgets(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: suite), let object = call.getObject("snapshot"),
              JSONSerialization.isValidJSONObject(object),
              let data = try? JSONSerialization.data(withJSONObject: object), data.count <= 200000,
              let snapshot = try? JSONDecoder().decode(ActivityWidgetSnapshot.self, from: data), snapshot.isValid else {
            call.reject("Données des widgets invalides")
            return
        }
        let previous = ActivityWidgetSnapshot.read(defaults: defaults)
        defaults.set(data, forKey: ActivityWidgetSnapshot.storageKey)
        if previous?.reading != snapshot.reading { WidgetCenter.shared.reloadTimelines(ofKind: "ReadingResumeWidget") }
        if previous?.invocations != snapshot.invocations { WidgetCenter.shared.reloadTimelines(ofKind: "MomentInvocationsWidget") }
        if previous?.memorization != snapshot.memorization { WidgetCenter.shared.reloadTimelines(ofKind: "MemorizationWidget") }
        call.resolve()
    }

    @objc func setNowPlaying(_ call: CAPPluginCall) {
        let title = String((call.getString("title") ?? "Quran Coach").prefix(120))
        let artist = String((call.getString("artist") ?? "Quran Coach").prefix(100))
        let playing = call.getBool("playing") ?? false
        let elapsed = max(0, call.getDouble("elapsed") ?? 0)
        let duration = max(0, call.getDouble("duration") ?? 0)
        Task { @MainActor in
        // A paused web player must not clear or replace active CarPlay metadata.
        if CarAudioPlayer.shared.current != nil {
            guard playing else { call.resolve(); return }
            CarAudioPlayer.shared.stop()
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: title,
            MPMediaItemPropertyArtist: artist,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: elapsed,
            MPMediaItemPropertyPlaybackDuration: duration,
            MPNowPlayingInfoPropertyPlaybackRate: playing ? 1.0 : 0.0
        ]
        MPNowPlayingInfoCenter.default().playbackState = playing ? .playing : .paused
        call.resolve()
        }
    }

    @objc func clearNowPlaying(_ call: CAPPluginCall) {
        Task { @MainActor in
            if CarAudioPlayer.shared.current == nil {
                MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
                MPNowPlayingInfoCenter.default().playbackState = .stopped
            }
            call.resolve()
        }
    }
}
