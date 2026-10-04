// Local mono PCM capture. Fractional box resampling preserves phase across blocks.
class QuranPcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.acc = 0;
    this.weight = 0;
    this.chunk = new Float32Array(7680);
    this.offset = 0;
    this.finished = false;
    this.port.onmessage = ({ data }) => {
      if (data !== "flush") return;
      this.finished = true;
      if (this.weight > 0) this.chunk[this.offset++] = this.acc / this.weight;
      if (this.offset) {
        const tail = this.chunk.slice(0, this.offset);
        this.port.postMessage(tail, [tail.buffer]);
      }
      this.offset = 0;
      this.weight = 0;
      this.port.postMessage("flushed");
    };
  }
  process(inputs) {
    if (this.finished) return true;
    const channels = inputs[0];
    if (!channels?.length) return true;
    const ratio = sampleRate / 16000;
    for (let i = 0; i < channels[0].length; i++) {
      let sample = 0;
      for (const channel of channels) sample += channel[i] / channels.length;
      let remaining = 1;
      while (remaining > 1e-8) {
        const take = Math.min(remaining, ratio - this.weight);
        this.acc += sample * take;
        this.weight += take;
        remaining -= take;
        if (this.weight >= ratio - 1e-8) {
          this.chunk[this.offset++] = this.acc / ratio;
          this.acc = 0;
          this.weight = 0;
          if (this.offset === this.chunk.length) {
            this.port.postMessage(this.chunk, [this.chunk.buffer]);
            this.chunk = new Float32Array(7680);
            this.offset = 0;
          }
        }
      }
    }
    return true;
  }
}
registerProcessor("quran-pcm-capture", QuranPcmCapture);
