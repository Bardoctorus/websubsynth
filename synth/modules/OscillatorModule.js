export class OscillatorModule {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.oscillator = this.audioCtx.createOscillator();
    
    this.baseFrequency = 440;
    this.noteOffsetSemitones = 0;

    // Pure oscillator - always running, no gain control
    this.oscillator.type = 'sine';
    this.updateFrequency();
    this.oscillator.start();
  }

  // Pure oscillators don't have inputs - they generate signal
  get input() {
    return null;
  }

  get output() {
    return this.oscillator;
  }

  setBaseFrequency(freq) {
    this.baseFrequency = freq;
    this.updateFrequency();
  }

  setNoteOffset(semitones) {
    this.noteOffsetSemitones = semitones;
    this.updateFrequency();
  }

  setWaveform(type) {
    this.oscillator.type = type;
  }

  updateFrequency() {
    const freq = this.baseFrequency * Math.pow(2, this.noteOffsetSemitones / 12);
    this.oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
  }

  connect(destination) {
    this.oscillator.connect(destination);
  }

  disconnect(destination = null) {
    if (destination) {
      this.oscillator.disconnect(destination);
    } else {
      this.oscillator.disconnect();
    }
  }
}