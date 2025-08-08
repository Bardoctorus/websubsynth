export class GainModule {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.gainNode = this.audioCtx.createGain();
    
    // Set default gain to 1.0 (unity gain - no change to signal)
    this.gainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
  }

  // Standardized input/output pattern
  get input() {
    return this.gainNode;
  }

  get output() {
    return this.gainNode;
  }

  // Add the missing setGain method for consistency with MasterGainModule
  setGain(value) {
    this.gainNode.gain.setValueAtTime(value, this.audioCtx.currentTime);
  }

  connect(destination) {
    this.gainNode.connect(destination);
  }

 disconnect(destination = null) {
  if (destination) {
    this.gainNode.disconnect(destination);
  } else {
    this.gainNode.disconnect(); // Disconnect from everything
  }
}
}