import { AudioContextManager } from './synth/core/AudioContextManager.js';
import { GainModule } from './synth/modules/GainModule.js';
import { FilterModule } from './synth/modules/FilterModule.js';
import { VCAModule } from './synth/modules/VCAModule.js';
import { MasterGainModule } from './synth/modules/MasterGainModule.js';
import { SubharmonicEngine } from './synth/modules/SubharmonicEngine.js'; // New import

// Create audio context
const audioCtxManager = new AudioContextManager();
const audioCtx = audioCtxManager.context;

// Create synth modules - true analog signal chain
const gainStage = new GainModule(audioCtx);
const filter = new FilterModule(audioCtx);
const vca = new VCAModule(audioCtx);
const masterGain = new MasterGainModule(audioCtx);

// Create subharmonic engine (contains VCO1, VCO2, and all sub oscillators)
const subharmonicEngine = new SubharmonicEngine(audioCtx);

// Create signal chain: SubharmonicEngine -> Gain -> Filter -> VCA -> Master -> Speakers
subharmonicEngine.connect(gainStage.input);
gainStage.connect(filter.input);
filter.connect(vca.input);
vca.connect(masterGain.input);
masterGain.connect(audioCtx.destination);

// Global state
let synthPowered = false;
let midiActive = false;
let currentKey = null;

// Note to semitone mapping (QWERTY keyboard layout)
// Using A4 (440Hz) as reference (0 semitones)
const noteSemitones = {
  'a': -9,  // C4 (9 semitones below A4)
  'w': -8,  // C#4
  's': -7,  // D4
  'e': -6,  // D#4
  'd': -5,  // E4
  'f': -4,  // F4
  't': -3,  // F#4
  'g': -2,  // G4
  'y': -1,  // G#4
  'h': 0,   // A4 (reference)
  'u': 1,   // A#4
  'j': 2,   // B4
  'k': 3,   // C5
};

// Keep the old noteFreqs for reference/display purposes
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

// Helper function to convert semitones to frequency ratio
function semitonesToRatio(semitones) {
  return Math.pow(2, semitones / 12);
}

// Export modules and state for UI to access
window.synth = {
  audioCtxManager,
  subharmonicEngine, // Main oscillator control now through engine
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
  noteFreqs,
  noteSemitones
};

// Keyboard event handlers
document.addEventListener('keydown', (e) => {
  if (!window.synth.midiActive || !window.synth.synthPowered) return;
  if (e.repeat) return;

  const key = e.key.toLowerCase();
  if (!(key in noteSemitones)) return;

  window.synth.currentKey = key;
  const semitones = noteSemitones[key];
  
  // Set note offset for both VCOs (this works with their base frequency)
  subharmonicEngine.setVCO1NoteOffset(semitones);
  subharmonicEngine.setVCO2NoteOffset(semitones);
  
  // Use VCA gate instead of oscillator noteOn
  vca.gateOn();
  
  // Update UI to show active note
  updateActiveNote(key);
});

document.addEventListener('keyup', (e) => {
  if (!window.synth.midiActive || !window.synth.synthPowered) return;

  const key = e.key.toLowerCase();
  if (key === window.synth.currentKey) {
    // Don't change frequency on release - just gate off
    // The oscillators should stay at their base frequency (slider position)
    
    // Use VCA gate instead of oscillator noteOff
    vca.gateOff();
    window.synth.currentKey = null;
    updateActiveNote(null);
  }
});

function updateActiveNote(key) {
  const noteDisplay = document.getElementById('activeNote');
  if (noteDisplay) {
    if (key) {
      const noteName = getNoteNameFromKey(key);
      const freq = noteFreqs[key];
      noteDisplay.textContent = `Playing: ${noteName} (${freq.toFixed(1)}Hz)`;
    } else {
      noteDisplay.textContent = 'No note playing';
    }
  }
}

// Helper function to get musical note name from keyboard key
function getNoteNameFromKey(key) {
  const noteNames = {
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    'k': 'C5'
  };
  return noteNames[key] || key.toUpperCase();
}

// --- Oscilloscope Setup ---
const oscilloscopeCanvas = document.getElementById('oscilloscope');
const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');

// Create an analyser node and connect it to the master output
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 1024;
const bufferLength = analyser.fftSize;
const dataArray = new Uint8Array(bufferLength);

// Connect analyser after masterGain, before destination
masterGain.output.disconnect();
masterGain.output.connect(analyser);
analyser.connect(audioCtx.destination);

function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);

  analyser.getByteTimeDomainData(dataArray);

  oscilloscopeCtx.clearRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

  oscilloscopeCtx.lineWidth = 2;
  oscilloscopeCtx.strokeStyle = '#00FF88';
  oscilloscopeCtx.beginPath();

  const width = oscilloscopeCanvas.width;
  const height = oscilloscopeCanvas.height;
  const sliceWidth = width / bufferLength;

  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;
    if (i === 0) {
      oscilloscopeCtx.moveTo(x, y);
    } else {
      oscilloscopeCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  oscilloscopeCtx.lineTo(width, height / 2);
  oscilloscopeCtx.stroke();
}

// Start drawing
drawOscilloscope();