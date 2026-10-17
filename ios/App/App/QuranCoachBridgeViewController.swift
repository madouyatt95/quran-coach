import Capacitor

final class QuranCoachBridgeViewController: CAPBridgeViewController {
    static var pendingWidgetPath: String?
    private var isVisible = false

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(QuranCoachCarPlugin())
        bridge?.registerPluginInstance(SpeechRecognition())
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        isVisible = true
        openPendingWidgetPath()
    }

    func openWidgetPath(_ path: String) {
        Self.pendingWidgetPath = path
        if isVisible { openPendingWidgetPath() }
    }

    private func openPendingWidgetPath() {
        guard let path = Self.pendingWidgetPath,
              let base = bridge?.config.appStartServerURL,
              let destination = QuranCoachWidgetRoute.appURL(base: base, path: path) else { return }
        Self.pendingWidgetPath = nil
        webView?.load(URLRequest(url: destination))
    }
}
