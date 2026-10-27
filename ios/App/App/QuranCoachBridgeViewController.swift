import Capacitor
import UIKit

final class QuranCoachBridgeViewController: CAPBridgeViewController {
    static var pendingWidgetPath: String?
    private var isVisible = false
    private let layoutPlugin = QuranCoachLayoutPlugin()

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(QuranCoachCarPlugin())
        bridge?.registerPluginInstance(SpeechRecognition())
        bridge?.registerPluginInstance(layoutPlugin)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        layoutPlugin.layoutDidChange()
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        layoutPlugin.layoutDidChange()
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

/// Only UIKit's active reserved regions identify a physical fold. No device-name
/// or orientation inference is used, and older iOS releases return empty regions.
@objc(QuranCoachLayoutPlugin)
final class QuranCoachLayoutPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "QuranCoachLayoutPlugin"
    let jsName = "QuranCoachLayout"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getLayout", returnType: CAPPluginReturnPromise)
    ]
    private var lastSnapshot: NSDictionary?

    @objc func getLayout(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            call.resolve(self?.snapshot() ?? [:])
        }
    }

    func layoutDidChange() {
        guard bridge != nil else { return }
        let value = snapshot()
        let comparable = value as NSDictionary
        guard lastSnapshot?.isEqual(comparable) != true else { return }
        lastSnapshot = comparable
        notifyListeners("layoutChanged", data: value)
    }

    private func snapshot() -> JSObject {
        guard let content = bridge?.webView else { return [:] }
        var divisions: [JSObject] = []
        var occlusions: [JSObject] = []
        if #available(iOS 27.1, *) {
            func frames(_ kind: UIView.ReservedRegion.Kind) -> [JSObject] {
                content.reservedRegions(kind: kind).filter(\.isActive).map { region in
                    let frame = region.frame
                    return ["x": Double(frame.minX), "y": Double(frame.minY),
                            "width": Double(frame.width), "height": Double(frame.height)]
                }
            }
            divisions = frames(.division)
            occlusions = frames(.occlusion)
        }
        return ["width": Double(content.bounds.width), "height": Double(content.bounds.height),
                "divisions": divisions, "occlusions": occlusions]
    }
}
