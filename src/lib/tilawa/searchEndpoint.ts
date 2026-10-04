/** Conservative endpointing for short searches, never used by the continuous coach. */
export class SearchEndpoint {
  private elapsed = 0;
  private voiced = 0;
  private quiet = 0;
  private ended = false;
  push(samples: Float32Array): boolean {
    if (this.ended || !samples.length) return false;
    const duration = samples.length / 16000;
    this.elapsed += duration;
    let energy = 0;
    for (const sample of samples) energy += sample * sample;
    const speaking = Math.sqrt(energy / samples.length) >= 0.012;
    if (speaking) { this.voiced += duration; this.quiet = 0; }
    else this.quiet += duration;
    this.ended = this.elapsed >= 30 || (this.voiced >= 0.3 && this.quiet >= 2.5) || (this.voiced < 0.3 && this.elapsed >= 12);
    return this.ended;
  }
}
