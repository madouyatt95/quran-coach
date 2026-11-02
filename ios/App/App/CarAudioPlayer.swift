import AVFoundation
import MediaPlayer
import UIKit

/// The car can launch without a WKWebView scene. Its queue must therefore run natively.
@MainActor
final class CarAudioPlayer {
    static let shared = CarAudioPlayer()
    let player = AVPlayer()
    var webCommand: ((String, Double?) -> Void)?
    var onChange: (([String: Any]) -> Void)?
    private(set) var queue: [CarTrack] = []
    private(set) var index = 0
    private(set) var error = ""
    private var installed = false
    private var observations: [NSObjectProtocol] = []
    private var status: NSKeyValueObservation?
    private var playbackStatus: NSKeyValueObservation?
    private var timer: Any?
    private var interruption: (track: CarTrack, position: Double)?
    private var lastSave: TimeInterval = 0
    private var autoPlay = false
    private var pendingPosition: Double?
    var current: CarTrack? { queue.indices.contains(index) ? queue[index] : nil }
    var isPlaying: Bool { player.rate > 0 || autoPlay && player.timeControlStatus == .waitingToPlayAtSpecifiedRate }
    var elapsed: Double { if let pendingPosition { return pendingPosition }; let value = player.currentTime().seconds; return value.isFinite ? max(0, value) : 0 }
    var duration: Double { let value = player.currentItem?.duration.seconds ?? 0; return value.isFinite && value > 0 ? value : current?.duration ?? 0 }
    var state: [String: Any] {
        var value: [String: Any] = ["active": current != nil, "id": current?.id ?? "", "title": current?.title ?? "", "path": current?.path ?? "",
         "playing": isPlaying, "position": elapsed, "duration": duration, "error": error]
        if let reference = current?.listening, let data = try? JSONEncoder().encode(reference), let object = try? JSONSerialization.jsonObject(with: data) { value["listening"] = object }
        return value
    }

    func install() {
        guard !installed else { return }; installed = true
        let center = MPRemoteCommandCenter.shared()
        for (command, action) in [(center.playCommand, "play"), (center.pauseCommand, "pause"),
            (center.togglePlayPauseCommand, "toggle"), (center.nextTrackCommand, "next"), (center.previousTrackCommand, "previous")] {
            command.addTarget { [weak self] _ in
                Task { @MainActor in self?.command(action) }
                return .success
            }
        }
        center.skipForwardCommand.preferredIntervals = [15]
        center.skipBackwardCommand.preferredIntervals = [15]
        center.skipForwardCommand.addTarget { [weak self] _ in Task { @MainActor in self?.command("forward") }; return .success }
        center.skipBackwardCommand.addTarget { [weak self] _ in Task { @MainActor in self?.command("backward") }; return .success }
        center.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let change = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            Task { @MainActor in self?.command("seek", seconds: change.positionTime) }; return .success
        }
        timer = player.addPeriodicTimeObserver(forInterval: CMTime(seconds: 1, preferredTimescale: 600), queue: .main) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self, self.current != nil else { return }
                if Date.timeIntervalSinceReferenceDate - self.lastSave >= 5 { self.save() }
                CarIqamaAnnouncer.shared.tick()
                self.publish()
            }
        }
        playbackStatus = player.observe(\.timeControlStatus, options: [.new]) { [weak self] _, _ in
            Task { @MainActor in self?.publish() }
        }
        observations.append(NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: nil, queue: .main) { [weak self] note in
            MainActor.assumeIsolated {
                guard let self, let item = note.object as? AVPlayerItem, item === self.player.currentItem else { return }
                self.save(); self.advance(1, automatically: true)
            }
        })
        observations.append(NotificationCenter.default.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
            MainActor.assumeIsolated {
                guard let self, let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                      let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
                if type == .began {
                    guard self.autoPlay, let track = self.current else { return }
                    let position = self.elapsed
                    self.pause()
                    self.interruption = (track, position)
                } else if let interruption = self.interruption {
                    self.interruption = nil
                    let options = AVAudioSession.InterruptionOptions(rawValue: note.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0)
                    guard options.contains(.shouldResume), self.current == interruption.track else { return }
                    let rewind = UserDefaults.standard.object(forKey: "car.bookRewind") as? Bool ?? true
                    self.seek(interruption.track.afterCall(position: interruption.position, rewindBooks: rewind))
                    self.resume()
                }
            }
        })
        observations.append(NotificationCenter.default.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { [weak self] note in
            if note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue {
                Task { @MainActor in self?.pause() }
            }
        })
    }

    func play(_ tracks: [CarTrack], index: Int = 0, position: Double = 0) {
        guard tracks.indices.contains(index), tracks.count <= 2000,
              tracks.allSatisfy({ $0.url.isFileURL ? $0.url.standardizedFileURL.path.hasPrefix(Bundle.main.bundlePath + "/") : CarTrack.audioURL($0.url.absoluteString) != nil }) else { return }
        install(); save(); queue = tracks; self.index = index
        // Retained by the bridge until its web listeners are attached.
        NotificationCenter.default.post(name: .carAudioWillPlay, object: nil)
        load(position: position, autoplay: true)
    }

    private func load(position: Double = 0, autoplay: Bool) {
        guard let track = current else { return }
        interruption = nil
        if let reference = track.listening, let data = try? JSONEncoder().encode(reference) {
            UserDefaults.standard.set(data, forKey: "car.voice")
            UserDefaults.standard.set(Date().timeIntervalSince1970 * 1000, forKey: "car.voice.at")
        }
        autoPlay = autoplay; error = ""; status = nil
        pendingPosition = position.isFinite && position > 0 ? position : nil
        player.pause()
        let item = AVPlayerItem(url: track.url)
        player.replaceCurrentItem(with: item)
        status = item.observe(\.status, options: [.new]) { [weak self, weak item] _, _ in
            Task { @MainActor in
                guard let self, let item, self.player.currentItem === item else { return }
                if item.status == .failed {
                    self.error = "Lecture indisponible. Vérifiez la connexion puis réessayez."
                    self.autoPlay = false; self.publish()
                }
            }
        }
        if position.isFinite && position > 0 {
            player.seek(to: CMTime(seconds: position, preferredTimescale: 600)) { [weak self, weak item] finished in
                Task { @MainActor in
                    guard finished, let self, let item, self.player.currentItem === item else { return }
                    self.pendingPosition = nil; self.save(); self.publish()
                }
            }
        }
        if autoplay { resume() } else { publish() }
    }

    func resume() {
        interruption = nil
        guard current != nil else { return }
        if player.currentItem?.status == .failed { load(position: elapsed, autoplay: true); return }
        do {
            try AVAudioSession.sharedInstance().setActive(true)
            autoPlay = true; player.play(); publish()
        } catch { self.error = "La sortie audio est indisponible."; autoPlay = false; publish() }
    }
    func pause() { interruption = nil; CarIqamaAnnouncer.shared.cancel(); autoPlay = false; player.pause(); save(); publish() }
    func stop() {
        interruption = nil
        CarIqamaAnnouncer.shared.cancel()
        save(); autoPlay = false; player.pause(); player.replaceCurrentItem(with: nil)
        queue = []; index = 0; error = ""; pendingPosition = nil
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        onChange?(state)
        NotificationCenter.default.post(name: .carAudioChanged, object: nil)
    }
    func advance(_ delta: Int, automatically: Bool = false) {
        guard !queue.isEmpty else { return }
        if delta < 0 && elapsed > 3 { seek(0); return }
        let next = index + delta
        guard queue.indices.contains(next) else { if automatically { pause() }; return }
        save(); index = next; load(autoplay: true)
    }
    func seek(_ value: Double) {
        interruption = nil
        guard value.isFinite else { return }
        let maximum = duration > 0 ? max(0, duration - 0.1) : max(0, value)
        let item = player.currentItem
        let target = min(maximum, max(0, value)); pendingPosition = target
        player.seek(to: CMTime(seconds: target, preferredTimescale: 600), toleranceBefore: .zero, toleranceAfter: .zero) { [weak self] finished in
            Task { @MainActor in
                guard finished, let self, self.player.currentItem === item else { return }
                self.pendingPosition = nil; self.save(); self.publish()
            }
        }
    }
    func command(_ action: String, seconds: Double? = nil) {
        guard current != nil else { webCommand?(action, seconds); return }
        switch action {
        case "play": resume()
        case "pause": pause()
        case "toggle": (isPlaying || interruption != nil) ? pause() : resume()
        case "next": advance(1)
        case "previous": advance(-1)
        case "forward": seek(elapsed + 15)
        case "backward": seek(elapsed - 15)
        case "seek": if let seconds { seek(seconds) }
        case "stop": stop()
        default: break
        }
    }

    func resumeSaved() {
        guard let data = UserDefaults.standard.data(forKey: "car.resume.queue"),
              let saved = try? JSONDecoder().decode([CarTrack].self, from: data) else { return }
        play(saved, index: UserDefaults.standard.integer(forKey: "car.resume.index"), position: UserDefaults.standard.double(forKey: "car.resume.seconds"))
    }
    var savedTracks: [CarTrack] {
        guard let data = UserDefaults.standard.data(forKey: "car.resume.queue"), data.count < 8_000_000,
              let tracks = try? JSONDecoder().decode([CarTrack].self, from: data), tracks.count <= 2000,
              tracks.indices.contains(UserDefaults.standard.integer(forKey: "car.resume.index")),
              tracks.allSatisfy({ $0.url.isFileURL ? $0.url.standardizedFileURL.path.hasPrefix(Bundle.main.bundlePath + "/") : CarTrack.audioURL($0.url.absoluteString) != nil }) else { return [] }
        return tracks
    }
    var hasSaved: Bool { !savedTracks.isEmpty }
    var savedUpdatedAt: Double { UserDefaults.standard.double(forKey: "car.resume.updatedAt") }
    var savedTitle: String? { let tracks = savedTracks, index = UserDefaults.standard.integer(forKey: "car.resume.index"); return tracks.indices.contains(index) ? tracks[index].title : nil }
    private func save() {
        guard current != nil, let data = try? JSONEncoder().encode(queue) else { return }
        UserDefaults.standard.set(data, forKey: "car.resume.queue")
        UserDefaults.standard.set(index, forKey: "car.resume.index")
        UserDefaults.standard.set(elapsed, forKey: "car.resume.seconds")
        UserDefaults.standard.set(Date().timeIntervalSince1970 * 1000, forKey: "car.resume.updatedAt")
        lastSave = Date.timeIntervalSinceReferenceDate
    }
    private func publish() {
        guard let track = current else { return }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: track.title, MPMediaItemPropertyArtist: track.artist,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: elapsed, MPMediaItemPropertyPlaybackDuration: duration,
            MPNowPlayingInfoPropertyPlaybackRate: isPlaying ? 1.0 : 0.0,
            MPNowPlayingInfoPropertyDefaultPlaybackRate: 1.0,
            MPNowPlayingInfoPropertyMediaType: MPNowPlayingInfoMediaType.audio.rawValue
        ]
        MPNowPlayingInfoCenter.default().playbackState = isPlaying ? .playing : .paused
        onChange?(state)
        NotificationCenter.default.post(name: .carAudioChanged, object: nil)
    }
}

extension Notification.Name {
    static let carAudioChanged = Notification.Name("QuranCoachCarAudioChanged")
    static let carAudioWillPlay = Notification.Name("QuranCoachCarAudioWillPlay")
    static let carPrayerChanged = Notification.Name("QuranCoachCarPrayerChanged")
    static let carListeningChanged = Notification.Name("QuranCoachCarListeningChanged")
}

/// A short system announcement over this app's native audio, never synthetic recitation.
/// Audio keeps its exact playhead and queue; only its volume is temporarily lowered.
@MainActor
final class CarIqamaAnnouncer: NSObject, AVSpeechSynthesizerDelegate {
    static let shared = CarIqamaAnnouncer()
    private let speech = AVSpeechSynthesizer()
    private let defaults = UserDefaults(suiteName: "group.com.qurancoach.app") ?? .standard
    private var originalVolume: Float?
    private var speechTimeout: Task<Void, Never>?
    private var lastTick: TimeInterval = 0
    var snapshot: CarPrayerSnapshot?
    var connected = false { didSet { if !connected { cancel(); snapshot = nil } } }
    override init() { super.init(); speech.delegate = self }
    func tick(now: Date = Date()) {
        guard connected, now.timeIntervalSince1970 - lastTick >= 3 else { return }
        lastTick = now.timeIntervalSince1970
        guard defaults.bool(forKey: "car.iqamaReminderEnabled") else { cancel(); return }
        guard CarAudioPlayer.shared.isPlaying, !speech.isSpeaking, let snapshot else { return }
        let stored = defaults.stringArray(forKey: "car.iqamaAnnounced") ?? []
        let lead = defaults.object(forKey: "car.iqamaMinutes") as? Int ?? 5
        guard let reminder = snapshot.reminder(now: now, lead: lead, seen: Set(stored)) else { return }
        defaults.set(Array((stored + [reminder.key]).suffix(100)), forKey: "car.iqamaAnnounced")
        originalVolume = CarAudioPlayer.shared.player.volume
        CarAudioPlayer.shared.player.volume = (originalVolume ?? 1) * 0.18
        let utterance = AVSpeechUtterance(string: reminder.text)
        utterance.voice = AVSpeechSynthesisVoice(language: "fr-FR")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.94
        speech.speak(utterance)
        // Restore the recitation even if the system voice fails to finish its callback.
        speechTimeout = Task { [weak self] in
            try? await Task.sleep(for: .seconds(15))
            guard !Task.isCancelled else { return }
            self?.cancel()
        }
    }
    func cancel() {
        if speech.isSpeaking || speech.isPaused { speech.stopSpeaking(at: .immediate) }
        restoreVolume()
    }
    private func restoreVolume() {
        speechTimeout?.cancel(); speechTimeout = nil
        if let originalVolume { CarAudioPlayer.shared.player.volume = originalVolume; self.originalVolume = nil }
    }
    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) { Task { @MainActor in self.restoreVolume() } }
    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) { Task { @MainActor in self.restoreVolume() } }
}
