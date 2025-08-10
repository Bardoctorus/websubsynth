import { OscillatorModule } from './OscillatorModule.js';
import { GainModule } from './GainModule.js';
import { SubharmonicCalculator } from '../../util/SubharmonicCalculator.js';

export class SubharmonicVoice {
  constructor(audioCtx, mainOscillator, division = 2, initialLevel = 0.5) {
    this.audioCtx = audioCtx;
    this.mainOscillator = mainOscillator;
    this.division = division;
    this.calculator = new SubharmonicCalculator();
    
    // Create this voice's pure oscillator (always on, like yours)
    this.oscillator = new OscillatorModule(audioCtx);
    
    // Create level control for this voice (separate from VCA)
    this.levelControl = new GainModule(audioCtx);
    this.levelControl.setGain(initialLevel);
    this.initialLevel = initialLevel; // Store for enable/disable
    
    // Internal routing: oscillator → level control
    this.oscillator.connect(this.levelControl.input);
    
    // Initialize frequency
    this.updateFrequency();
    
    // Voice properties
    this.isEnabled = true;
  }
  
  updateFrequency() {
    // Get frequency directly from main oscillator's current baseFrequency
    const mainFreq = this.mainOscillator.baseFrequency;
    
    // Defensive check - don't update if main frequency isn't set yet
    if (typeof mainFreq !== 'number' || !isFinite(mainFreq) || mainFreq <= 0) {
      return;
    }
    
    const subFreq = this.calculator.calculateSubharmonicFreq(mainFreq, this.division);
    
    // Double-check the calculated frequency is valid
    if (isFinite(subFreq) && subFreq > 0) {
      this.oscillator.setBaseFrequency(subFreq);
    }
  }
  
  // Module interface for routing flexibility
  get input() {
    return this.oscillator.input; // Could route to this voice's oscillator
  }
  
  get output() {
    return this.levelControl.output; // Output after level control
  }
  
  // Voice controls
  setDivision(newDivision) {
    this.division = newDivision;
    this.updateFrequency();
  }
  
  setLevel(level) {
    this.levelControl.setGain(level);
  }
  
  setWaveform(waveform) {
    this.oscillator.setWaveform(waveform);
  }
  
  setEnabled(enabled) {
    this.isEnabled = enabled;
    // Mute/unmute by setting gain to 0 or restoring original level
    this.levelControl.setGain(enabled ? this.initialLevel : 0);
  }
  
  getLevel() {
    return this.initialLevel;
  }
  
  getDivision() {
    return this.division;
  }
  
  getEnabled() {
    return this.isEnabled;
  }
  
  // Routing methods
  connect(destination) {
    this.output.connect(destination);
  }
  
  disconnect(destination = null) {
    if (destination) {
      this.output.disconnect(destination);
    } else {
      this.output.disconnect();
    }
  }
}