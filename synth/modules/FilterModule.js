export class FilterModule {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.filter = this.audioCtx.createBiquadFilter();
    
    // Simple low-pass filter
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(2000, this.audioCtx.currentTime); // 2kHz cutoff
    this.filter.Q.setValueAtTime(1, this.audioCtx.currentTime); // Mild resonance
  }

  get input() {
    return this.filter;
  }

  get output() {
    return this.filter;
  }

  // Set cutoff frequency in Hz
  setCutoff(frequency) {
    this.filter.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
  }

  // Set resonance (Q factor)
  setResonance(q) {
    this.filter.Q.setValueAtTime(q, this.audioCtx.currentTime);
  }

  // Get current cutoff for UI display
  getCutoff() {
    return this.filter.frequency.value;
  }

  // Get current resonance for UI display
  getResonance() {
    return this.filter.Q.value;
  }

  connect(destination) {
    this.filter.connect(destination);
  }

  disconnect(destination = null) {
    if (destination) {
      this.filter.disconnect(destination);
    } else {
      this.filter.disconnect();
    }
  }
}