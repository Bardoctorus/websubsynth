import { GainModule } from './GainModule.js';
import { SubharmonicVoice } from './SubharmonicVoice.js';

export class SubharmonicMixer {
  constructor(audioCtx, mainOscillator) {
    this.audioCtx = audioCtx;
    this.mainOscillator = mainOscillator;
    
    // Create mixer node (this becomes our output)
    this.mixer = new GainModule(audioCtx);
    this.mixer.setGain(1.0);
    
    // Create main oscillator level control (analog-style)
    this.mainLevel = new GainModule(audioCtx);
    this.mainLevel.setGain(0.5); // Main oscillator level
    
    // Create subharmonic voices with classic Subharmonicon divisions
    this.voices = [
      new SubharmonicVoice(audioCtx, mainOscillator, 2, 0.3),   // Sub 1: /2
      new SubharmonicVoice(audioCtx, mainOscillator, 3, 0.25),  // Sub 2: /3  
      new SubharmonicVoice(audioCtx, mainOscillator, 4, 0.2),   // Sub 3: /4
      new SubharmonicVoice(audioCtx, mainOscillator, 6, 0.15)   // Sub 4: /6
    ];
    
    // Route main oscillator: main osc → main level → mixer
    this.mainOscillator.connect(this.mainLevel.input);
    this.mainLevel.connect(this.mixer.input);
    
    // Route all subharmonic voices: sub voice → mixer
    this.voices.forEach(voice => {
      voice.connect(this.mixer.input);
    });
  }
  
  // No input - this is a sound source like your oscillator
  get input() {
    return null;
  }
  
  get output() {
    return this.mixer.output;
  }
  
  // Update all subharmonic frequencies when main frequency changes
  updateAllFrequencies() {
    this.voices.forEach(voice => {
      voice.updateFrequency();
    });
  }
  
  // Voice control methods
  getVoice(index) {
    return this.voices[index];
  }
  
  setVoiceLevel(index, level) {
    if (this.voices[index]) {
      this.voices[index].setLevel(level);
    }
  }
  
  setVoiceDivision(index, division) {
    if (this.voices[index]) {
      this.voices[index].setDivision(division);
    }
  }
  
  setVoiceEnabled(index, enabled) {
    if (this.voices[index]) {
      this.voices[index].setEnabled(enabled);
    }
  }
  
  setVoiceWaveform(index, waveform) {
    if (this.voices[index]) {
      this.voices[index].setWaveform(waveform);
    }
  }
  
  // Main oscillator level control
  setMainLevel(level) {
    this.mainLevel.setGain(level);
  }
  
  getMainLevel() {
    return this.mainLevel.gain || 0.5;
  }
  
  // Mixer control
  setMixerGain(gain) {
    this.mixer.setGain(gain);
  }
  
  // Routing methods
  connect(destination) {
    this.mixer.connect(destination);
  }
  
  disconnect(destination = null) {
    if (destination) {
      this.mixer.disconnect(destination);
    } else {
      this.mixer.disconnect();
    }
  }
  
  // Future routing flexibility: get individual voice outputs
  getVoiceOutput(index) {
    return this.voices[index]?.output;
  }
  
  // Future routing: bypass mixer and get array of all outputs
  getAllVoiceOutputs() {
    return this.voices.map(voice => voice.output);
  }
  
  getMainOscillatorOutput() {
    return this.mainLevel.output;
  }
}