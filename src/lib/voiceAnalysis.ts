// Local voice analysis utilities using Web Audio API
// All processing is done on-device, no data sent to servers

export interface VoiceAnalysisState {
    isRecording: boolean;
    amplitude: number;
    isSilent: boolean;
    silenceDuration: number;
    voiceDuration: number;
}

export interface RecitationEvent {
    type: 'start' | 'hesitation' | 'silence' | 'resume' | 'stop';
    timestamp: number;
    duration?: number;
}

const SILENCE_THRESHOLD = 0.02; // Amplitude below this is considered silence
const HESITATION_DURATION = 2000; // 2 seconds of silence = hesitation
const LONG_PAUSE_DURATION = 5000; // 5 seconds = long pause

export class VoiceAnalyzer {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaStream: MediaStream | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private animationFrame: number | null = null;

    private onStateChange: ((state: VoiceAnalysisState) => void) | null = null;
    private onEvent: ((event: RecitationEvent) => void) | null = null;


    private isCurrentlySilent: boolean = true;
    private silenceStartTime: number = 0;
    private recordingStartTime: number = 0;

    constructor() { }

    async start(
        onStateChange: (state: VoiceAnalysisState) => void,
        onEvent: (event: RecitationEvent) => void
    ): Promise<boolean> {
        this.onStateChange = onStateChange;
        this.onEvent = onEvent;

        try {
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            // Create audio context and analyser
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            // Connect microphone to analyser
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.sourceNode.connect(this.analyser);

            this.recordingStartTime = Date.now();
            this.silenceStartTime = Date.now();

            this.onEvent?.({ type: 'start', timestamp: Date.now() });

            // Start analysis loop
            this.analyze();

            return true;
        } catch (error) {
            console.error('Failed to start voice analysis:', error);
            return false;
        }
    }

    private analyze = () => {
        if (!this.analyser) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const amplitude = sum / dataArray.length / 255;

        const now = Date.now();
        const isSilent = amplitude < SILENCE_THRESHOLD;

        // Track silence/voice transitions
        if (isSilent && !this.isCurrentlySilent) {
            // Voice stopped
            this.isCurrentlySilent = true;
            this.silenceStartTime = now;
        } else if (!isSilent && this.isCurrentlySilent) {
            // Voice started
            this.isCurrentlySilent = false;

            const silenceDuration = now - this.silenceStartTime;
            if (silenceDuration > HESITATION_DURATION) {
                this.onEvent?.({ type: 'resume', timestamp: now });
            }
        }

        // Detect hesitations
        const silenceDuration = this.isCurrentlySilent ? now - this.silenceStartTime : 0;

        if (silenceDuration >= HESITATION_DURATION && silenceDuration < HESITATION_DURATION + 100) {
            this.onEvent?.({
                type: 'hesitation',
                timestamp: now,
                duration: silenceDuration
            });
        }

        if (silenceDuration >= LONG_PAUSE_DURATION && silenceDuration < LONG_PAUSE_DURATION + 100) {
            this.onEvent?.({
                type: 'silence',
                timestamp: now,
                duration: silenceDuration
            });
        }

        // Report state
        this.onStateChange?.({
            isRecording: true,
            amplitude,
            isSilent,
            silenceDuration,
            voiceDuration: now - this.recordingStartTime,
        });

        this.animationFrame = requestAnimationFrame(this.analyze);
    };

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;

        this.onEvent?.({ type: 'stop', timestamp: Date.now() });
        this.onStateChange?.({
            isRecording: false,
            amplitude: 0,
            isSilent: true,
            silenceDuration: 0,
            voiceDuration: 0,
        });
    }
}

// Singleton instance
export const voiceAnalyzer = new VoiceAnalyzer();
