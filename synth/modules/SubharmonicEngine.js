import { OscillatorModule } from './OscillatorModule.js';
import { GainModule } from './GainModule.js';
import { SubharmonicVoice } from './SubharmonicVoice.js';

export class SubharmonicEngine {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    
    // Create two main VCOs (like authentic Subharmonicon)
    this.vco1 = new OscillatorModule(audioCtx);
    this.vco2 = new OscillatorModule(audioCtx);
    
    // Initialize with default frequencies
    this.vco1.setBaseFrequency(440); // A4
    this.vco2.setBaseFrequency(440); // A4 (can be different)
    
    // Create individual level controls for each VCO
    this.vco1Level = new GainModule(audioCtx);
    this.vco2Level = new GainModule(audioCtx);
    this.vco1Level.setGain(0.5);
    this.vco2Level.setGain(0.5);
    
    // Create four subharmonic voices (authentic Subharmonicon config)
    this.subVoices = [
      new SubharmonicVoice(audioCtx, this.vco1, 2, 0.3),   // Sub 1: follows VCO1, /2
      new SubharmonicVoice(audioCtx, this.vco1, 3, 0.25),  // Sub 2: follows VCO1, /3
      new SubharmonicVoice(audioCtx, this.vco2, 2, 0.3),   // Sub 3: follows VCO2, /2
      new SubharmonicVoice(audioCtx, this.vco2, 4, 0.2)    // Sub 4: follows VCO2, /4
    ];
    
    // Create main mixer for final output
    this.mainMixer = new GainModule(audioCtx);
    this.mainMixer.setGain(1.0);
    
    // Default routing: VCOs → their levels → mixer, Subs → mixer
    this.setupDefaultRouting();
    
    // Routing matrix for future flexibility
    this.routingMatrix = {
      // Track which VCO each sub voice follows
      subVoiceParents: [0, 0, 1, 1], // Sub1&2 follow VCO1, Sub3&4 follow VCO2
      
      // Future: could track any routing combinations
      // e.g., subs following other subs, FM routing, etc.
    };
  }
  
  setupDefaultRouting() {
    // Route VCO1: vco1 → vco1Level → mixer
    this.vco1.connect(this.vco1Level.input);
    this.vco1Level.connect(this.mainMixer.input);
    
    // Route VCO2: vco2 → vco2Level → mixer  
    this.vco2.connect(this.vco2Level.input);
    this.vco2Level.connect(this.mainMixer.input);
    
    // Route all subs to mixer
    this.subVoices.forEach(voice => {
      voice.connect(this.mainMixer.input);
    });
  }
  
  // Module interface
  get input() {
    return null; // This is a sound source
  }
  
  get output() {
    return this.mainMixer.output;
  }
  
  // VCO Control Methods
  setVCO1Frequency(freq) {
    this.vco1.setBaseFrequency(freq);
    this.updateSubharmonicsForVCO(0); // Update subs that follow VCO1
  }
  
  setVCO2Frequency(freq) {
    this.vco2.setBaseFrequency(freq);
    this.updateSubharmonicsForVCO(1); // Update subs that follow VCO2
  }
  
  setVCO1Waveform(waveform) {
    this.vco1.setWaveform(waveform);
  }
  
  setVCO2Waveform(waveform) {
    this.vco2.setWaveform(waveform);
  }
  
  setVCO1Level(level) {
    this.vco1Level.setGain(level);
  }
  
  setVCO2Level(level) {
    this.vco2Level.setGain(level);
  }
  
  // Update subharmonics that follow a specific VCO
  updateSubharmonicsForVCO(vcoIndex) {
    this.subVoices.forEach((voice, subIndex) => {
      if (this.routingMatrix.subVoiceParents[subIndex] === vcoIndex) {
        voice.updateFrequency();
      }
    });
  }
  
  // Update all subharmonics (when both VCOs might have changed)
  updateAllSubharmonics() {
    this.subVoices.forEach(voice => {
      voice.updateFrequency();
    });
  }
  
  // Sub Voice Control Methods
  setSubVoiceLevel(index, level) {
    if (this.subVoices[index]) {
      this.subVoices[index].setLevel(level);
    }
  }
  
  setSubVoiceDivision(index, division) {
    if (this.subVoices[index]) {
      this.subVoices[index].setDivision(division);
    }
  }
  
  setSubVoiceEnabled(index, enabled) {
    if (this.subVoices[index]) {
      this.subVoices[index].setEnabled(enabled);
    }
  }
  
  setSubVoiceWaveform(index, waveform) {
    if (this.subVoices[index]) {
      this.subVoices[index].setWaveform(waveform);
    }
  }
  
  // FUTURE ROUTING FLEXIBILITY METHODS
  
  // Change which VCO a sub voice follows
  setSubVoiceParent(subIndex, vcoIndex) {
    if (subIndex >= 0 && subIndex < this.subVoices.length && (vcoIndex === 0 || vcoIndex === 1)) {
      const oldParent = this.routingMatrix.subVoiceParents[subIndex];
      this.routingMatrix.subVoiceParents[subIndex] = vcoIndex;
      
      // Update the sub voice's parent reference
      const newParent = vcoIndex === 0 ? this.vco1 : this.vco2;
      this.subVoices[subIndex].mainOscillator = newParent;
      this.subVoices[subIndex].updateFrequency();
      
      console.log(`Sub ${subIndex + 1} now follows VCO${vcoIndex + 1}`);
    }
  }
  
  // Get individual outputs for future complex routing
  getVCO1Output() {
    return this.vco1Level.output;
  }
  
  getVCO2Output() {
    return this.vco2Level.output;
  }
  
  getSubVoiceOutput(index) {
    return this.subVoices[index]?.output;
  }
  
  getAllSubVoiceOutputs() {
    return this.subVoices.map(voice => voice.output);
  }
  
  // Future: could add FM routing, sub-following-sub routing, etc.
  
  // Standard routing methods
  connect(destination) {
    this.mainMixer.connect(destination);
  }
  
  disconnect(destination = null) {
    if (destination) {
      this.mainMixer.disconnect(destination);
    } else {
      this.mainMixer.disconnect();
    }
  }
  
  // Utility methods
  getRoutingMatrix() {
    return { ...this.routingMatrix }; // Return copy for debugging
  }
  
  getSubVoiceParent(subIndex) {
    return this.routingMatrix.subVoiceParents[subIndex];
  }
}