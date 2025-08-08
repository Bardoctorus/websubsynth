export class MasterGainModule {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.gainNode = this.audioCtx.createGain();
    
    // Start with low volume for safety
    this.gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
  }

  // Standardized input/output pattern
  get input() {
    return this.gainNode;
  }

  get output() {
    return this.gainNode;
  }

  setGain(value) {
    this.gainNode.gain.setValueAtTime(value, this.audioCtx.currentTime);
  }

  connect(destination) {
    this.gainNode.connect(destination);
  }

  // For future modulation matrix
  disconnect(destination = null) {
  if (destination) {
    this.gainNode.disconnect(destination);
  } else {
    this.gainNode.disconnect(); // Disconnect from everything
  }
}
}