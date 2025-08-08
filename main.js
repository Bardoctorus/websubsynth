import { AudioContextManager } from './synth/core/AudioContextManager.js';
import { OscillatorModule } from './synth/modules/OscillatorModule.js';
import { GainModule } from './synth/modules/GainModule.js';
import { FilterModule } from './synth/modules/FilterModule.js';
import { VCAModule } from './synth/modules/VCAModule.js';
import { MasterGainModule } from './synth/modules/MasterGainModule.js';

// Create audio context
const audioCtxManager = new AudioContextManager();
const audioCtx = audioCtxManager.context;

// Create synth modules - true analog signal chain
const oscillator = new OscillatorModule(audioCtx);
const gainStage = new GainModule(audioCtx);
const filter = new FilterModule(audioCtx);
const vca = new VCAModule(audioCtx);
const masterGain = new MasterGainModule(audioCtx);

// Create signal chain: Oscillator -> Gain -> Filter -> VCA -> Master -> Speakers
oscillator.connect(gainStage.input);
gainStage.connect(filter.input);
filter.connect(vca.input);
vca.connect(masterGain.input);
masterGain.connect(audioCtx.destination);

// Global state
let synthPowered = false;
let midiActive = false;
let currentKey = null;

// Note frequency mapping (QWERTY keyboard layout)
const noteFreqs = {
  'a': 261.63, // C4
  'w': 277.18, // C#4
  's': 293.66, // D4
  'e': 311.13, // D#4
  'd': 329.63, // E4
  'f': 349.23, // F4
  't': 369.99, // F#4
  'g': 392.00, // G4
  'y': 415.30, // G#4
  'h': 440.00, // A4
  'u': 466.16, // A#4
  'j': 493.88, // B4
  'k': 523.25, // C5
};

// Export modules and state for UI to access
window.synth = {
  audioCtxManager,
  oscillator,
  gainStage,
  filter,
  vca,
  masterGain,
  get synthPowered() { return synthPowered; },
  set synthPowered(value) { synthPowered = value; },
  get midiActive() { return midiActive; },
  set midiActive(value) { midiActive = value; },
  get currentKey() { return currentKey; },
  set currentKey(value) { currentKey = value; },
  noteFreqs
};

// Keyboard event handlers
document.addEventListener('keydown', (e) => {
  if (!window.synth.midiActive || !window.synth.synthPowered) return;
  if (e.repeat) return;

  const key = e.key.toLowerCase();
  if (!(key in noteFreqs)) return;

  window.synth.currentKey = key;
  const freq = noteFreqs[key];
  oscillator.setBaseFrequency(freq);
  
  // Use VCA gate instead of oscillator noteOn
  vca.gateOn();
  
  // Update UI to show active note
  updateActiveNote(key);
});

document.addEventListener('keyup', (e) => {
  if (!window.synth.midiActive || !window.synth.synthPowered) return;

  const key = e.key.toLowerCase();
  if (key === window.synth.currentKey) {
    // Use VCA gate instead of oscillator noteOff
    vca.gateOff();
    window.synth.currentKey = null;
    updateActiveNote(null);
  }
});

function updateActiveNote(key) {
  const noteDisplay = document.getElementById('activeNote');
  if (noteDisplay) {
    noteDisplay.textContent = key ? `Playing: ${key.toUpperCase()}` : 'No note playing';
  }
}