export class VCAModule {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.vca = this.audioCtx.createGain();
    
    // Start with no output (VCA closed)
    this.vca.gain.setValueAtTime(0, this.audioCtx.currentTime);
    
    // Envelope parameters (in seconds)
    this.attackTime = 0.01;  // Fast attack (10ms)
    this.decayTime = 0.5;    // 500ms decay
    this.sustainLevel = 0.3; // 30% sustain level
    this.releaseTime = 0.1;  // 100ms release
    
    this.isGateOpen = false;
  }

  get input() {
    return this.vca;
  }

  get output() {
    return this.vca;
  }

  // Gate on - start attack phase
  gateOn() {
    if (this.isGateOpen) return; // Prevent retriggering
    
    const now = this.audioCtx.currentTime;
    this.isGateOpen = true;
    
    // Cancel any previous envelope
    this.vca.gain.cancelScheduledValues(now);
    
    // Attack: ramp from 0 to 1
    this.vca.gain.setValueAtTime(0, now);
    this.vca.gain.linearRampToValueAtTime(1.0, now + this.attackTime);
    
    // Decay: ramp from 1 to sustain level
    this.vca.gain.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
    
    // Update UI to show gate is open
    if (typeof updateVCAGateStatus === 'function') {
      updateVCAGateStatus(true);
    }
  }

  // Gate off - start release phase
  gateOff() {
    if (!this.isGateOpen) return;
    
    const now = this.audioCtx.currentTime;
    this.isGateOpen = false;
    
    // Cancel scheduled values and start release from current level
    this.vca.gain.cancelScheduledValues(now);
    this.vca.gain.setValueAtTime(this.vca.gain.value, now);
    this.vca.gain.linearRampToValueAtTime(0, now + this.releaseTime);
    
    // Update UI to show gate is closed
    if (typeof updateVCAGateStatus === 'function') {
      updateVCAGateStatus(false);
    }
  }

  // Set envelope parameters
  setAttack(timeInSeconds) {
    this.attackTime = Math.max(0.001, timeInSeconds); // Minimum 1ms
  }

  setDecay(timeInSeconds) {
    this.decayTime = Math.max(0.001, timeInSeconds);
  }

  setSustain(level) {
    this.sustainLevel = Math.max(0, Math.min(1, level)); // Clamp 0-1
  }

  setRelease(timeInSeconds) {
    this.releaseTime = Math.max(0.001, timeInSeconds);
  }

  // Get current envelope parameters for UI
  getAttack() { return this.attackTime; }
  getDecay() { return this.decayTime; }
  getSustain() { return this.sustainLevel; }
  getRelease() { return this.releaseTime; }
  
  // Get gate status for UI
  getGateStatus() { return this.isGateOpen; }

  connect(destination) {
    this.vca.connect(destination);
  }

  disconnect(destination = null) {
    if (destination) {
      this.vca.disconnect(destination);
    } else {
      this.vca.disconnect();
    }
  }
}