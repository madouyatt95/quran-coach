import UIKit
import Capacitor
import AVFAudio

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure the category without activating audio until the user starts playback.
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        } catch {
            NSLog("Quran Coach: playback audio category unavailable: %@", error.localizedDescription)
        }
        return true
    }

    // Keep these entry points for integrations that forward to the application
    // delegate. Normal scene URL events use the same router below.
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        let controller = app.connectedScenes.compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows).compactMap { $0.rootViewController as? QuranCoachBridgeViewController }.first
        return QuranCoachAppLinks.open(url, options: options, controller: controller)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

/// UIKit owns the storyboard window and keeps its Capacitor controller when the
/// scene changes size or the device folds. A second web session is not created.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard scene is UIWindowScene else { return }
        open(connectionOptions.urlContexts)
        for activity in connectionOptions.userActivities {
            self.scene(scene, continue: activity)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        open(URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }

    private func open(_ contexts: Set<UIOpenURLContext>) {
        for context in contexts {
            var options: [UIApplication.OpenURLOptionsKey: Any] = [.openInPlace: context.options.openInPlace]
            if let source = context.options.sourceApplication { options[.sourceApplication] = source }
            if let annotation = context.options.annotation { options[.annotation] = annotation }
            _ = QuranCoachAppLinks.open(context.url, options: options,
                controller: window?.rootViewController as? QuranCoachBridgeViewController)
        }
    }
}

private enum QuranCoachAppLinks {
    static func open(_ url: URL, options: [UIApplication.OpenURLOptionsKey: Any], controller: QuranCoachBridgeViewController?) -> Bool {
        if let path = QuranCoachWidgetRoute.path(for: url) {
            QuranCoachBridgeViewController.pendingWidgetPath = path
            controller?.openWidgetPath(path)
            return true
        }
        return ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: options)
    }
}

// Shortcuts use the same cold-start-safe router as widgets.
import AppIntents

@available(iOS 18.0, *)
struct ResumeQuranCoachBookIntent: AppIntent {
    static var title: LocalizedStringResource = "Reprendre mon livre"
    static var description = IntentDescription("Ouvre le dernier livre écouté à sa position enregistrée.")
    static var openAppWhenRun = true
    @MainActor func perform() async throws -> some IntentResult & OpensIntent {
        .result(opensIntent: OpenURLIntent(URL(string: "qurancoach://book")!))
    }
}
@available(iOS 18.0, *)
struct OpenQuranCoachKhatmIntent: AppIntent {
    static var title: LocalizedStringResource = "Ouvrir mon Khatm"
    static var openAppWhenRun = true
    @MainActor func perform() async throws -> some IntentResult & OpensIntent {
        .result(opensIntent: OpenURLIntent(URL(string: "qurancoach://khatm")!))
    }
}
@available(iOS 18.0, *)
struct OpenQuranCoachIqamaIntent: AppIntent {
    static var title: LocalizedStringResource = "Afficher ma prochaine Iqama"
    static var description = IntentDescription("Affiche les horaires publiés par votre mosquée dans Quran Coach.")
    static var openAppWhenRun = true
    @MainActor func perform() async throws -> some IntentResult & OpensIntent {
        .result(opensIntent: OpenURLIntent(URL(string: "qurancoach://prayers")!))
    }
}
@available(iOS 18.0, *)
struct QuranCoachShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: ResumeQuranCoachBookIntent(), phrases: ["Reprends mon livre dans \(.applicationName)"], shortTitle: "Reprendre mon livre", systemImageName: "book")
        AppShortcut(intent: OpenQuranCoachKhatmIntent(), phrases: ["Ouvre mon Khatm dans \(.applicationName)"], shortTitle: "Mon Khatm", systemImageName: "book.pages")
        AppShortcut(intent: OpenQuranCoachIqamaIntent(), phrases: ["Affiche ma prochaine Iqama dans \(.applicationName)"], shortTitle: "Prochaine Iqama", systemImageName: "clock")
    }
}
