// iOS PWA Audio Unlock Utility
// Fixes audio issues in standalone PWA mode on iOS
// Must be triggered on first user interaction (touch/click)

let audioUnlocked = false;
let audioContext: AudioContext | null = null;

/**
 * Check if running as PWA standalone on iOS
 */
export function isIOSPWA(): boolean {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
    return isIOS && isStandalone;
}

/**
 * Get or create shared AudioContext
 * Reuses the same context to avoid iOS limits
 */
export function getSharedAudioContext(): AudioContext {
    if (!audioContext || audioContext.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
    }
    return audioContext;
}

/**
 * Unlock audio on iOS by playing silent audio
 * Call this on first user interaction (click/touch)
 */
export async function unlockAudio(): Promise<boolean> {
    if (audioUnlocked) return true;

    try {
        const ctx = getSharedAudioContext();

        // Resume if suspended (iOS requirement)
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        // Play silent buffer to unlock audio
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        // Also try to unlock via HTML5 Audio element
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audio.volume = 0.01;

        try {
            await audio.play();
            audio.pause();
        } catch {
            // Ignore - not critical
        }

        audioUnlocked = true;
        console.log('[AudioUnlock] Audio unlocked successfully');
        return true;
    } catch (error) {
        console.error('[AudioUnlock] Failed to unlock audio:', error);
        return false;
    }
}

/**
 * Check if audio is unlocked
 */
export function isAudioUnlocked(): boolean {
    return audioUnlocked;
}

/**
 * Get best supported MIME type for recording
 */
export function getSupportedMimeType(): string {
    // iOS Safari doesn't support webm
    if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
            return 'audio/mp4';
        }
        if (MediaRecorder.isTypeSupported('audio/webm')) {
            return 'audio/webm';
        }
        if (MediaRecorder.isTypeSupported('audio/aac')) {
            return 'audio/aac';
        }
    }
    // Fallback
    return 'audio/mp4';
}

/**
 * Create MediaRecorder with best available options for iOS
 */
export function createMediaRecorder(stream: MediaStream): MediaRecorder {
    const mimeType = getSupportedMimeType();

    try {
        return new MediaRecorder(stream, { mimeType });
    } catch {
        // Fallback without mime type specification
        return new MediaRecorder(stream);
    }
}
