// Wait for main.js to load and set up window.synth
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for main.js to initialize, then check repeatedly
  const checkAndInit = () => {
    if (window.synth) {
      initializeControls();
    } else {
      setTimeout(checkAndInit, 50);
    }
  };
  checkAndInit();
});

function initializeControls() {
  if (!window.synth) {
    console.error('Synth modules not available');
    return;
  }

  const {
    audioCtxManager,
    oscillator,
    gainStage,
    filter,
    vca,
    masterGain
  } = window.synth;

  // Get all UI elements
  const powerToggle = document.getElementById('powerToggle');
  const midiToggle = document.getElementById('midiToggle');
  const frequencySlider = document.getElementById('frequencySlider');
  const waveformSelect = document.getElementById('waveformSelect');
  const gainSlider = document.getElementById('gainSlider');
  const masterSlider = document.getElementById('masterSlider');
  
  // Filter controls
  const filterCutoffSlider = document.getElementById('filterCutoffSlider');
  const filterResSlider = document.getElementById('filterResSlider');
  
  // VCA envelope controls
  const attackSlider = document.getElementById('attackSlider');
  const decaySlider = document.getElementById('decaySlider');
  const sustainSlider = document.getElementById('sustainSlider');
  const releaseSlider = document.getElementById('releaseSlider');

  // Display elements
  const freqDisplay = document.getElementById('freqDisplay');
  const gainDisplay = document.getElementById('gainDisplay');
  const masterDisplay = document.getElementById('masterDisplay');
  const cutoffDisplay = document.getElementById('cutoffDisplay');
  const resDisplay = document.getElementById('resDisplay');
  const attackDisplay = document.getElementById('attackDisplay');
  const decayDisplay = document.getElementById('decayDisplay');
  const sustainDisplay = document.getElementById('sustainDisplay');
  const releaseDisplay = document.getElementById('releaseDisplay');

  // Power toggle handler
  powerToggle?.addEventListener('change', async (e) => {
    console.log('Power toggle changed:', e.target.checked);
    
    if (e.target.checked) {
      await audioCtxManager.start();
      window.synth.synthPowered = true;
      
      // Restore the actual gain values (don't change them, just unmute)
      const currentGain = parseFloat(gainSlider.value);
      const currentMaster = parseFloat(masterSlider.value);
      
      gainStage.setGain(currentGain);
      masterGain.setGain(currentMaster);
      
      console.log("Synth powered on - Gain:", currentGain, "Master:", currentMaster);
    } else {
      window.synth.synthPowered = false;
      
      // Mute by setting gains to 0, but don't change slider values
      gainStage.setGain(0);
      masterGain.setGain(0);
      
      console.log("Synth powered off");
    }
    
    updateModuleStatus();
  });

  // MIDI keyboard toggle
  midiToggle?.addEventListener('change', (e) => {
    window.synth.midiActive = e.target.checked;
    console.log('Virtual keyboard:', e.target.checked ? 'ON' : 'OFF');
  });

  // Frequency control
  frequencySlider?.addEventListener('input', (e) => {
    const freq = parseFloat(e.target.value);
    oscillator.setBaseFrequency(freq);
    freqDisplay.textContent = freq;
    updateOscillatorDisplay();
  });

  // Waveform control
  waveformSelect?.addEventListener('change', (e) => {
    oscillator.setWaveform(e.target.value);
    updateOscillatorDisplay();
  });

  // Gain stage control
  gainSlider?.addEventListener('input', (e) => {
    const gainValue = parseFloat(e.target.value);
    gainDisplay.textContent = gainValue.toFixed(2);
    
    // Only apply gain if synth is powered on
    if (window.synth.synthPowered) {
      gainStage.setGain(gainValue);
    }
    updateGainDisplay();
  });

  // Master volume control
  masterSlider?.addEventListener('input', (e) => {
    const masterValue = parseFloat(e.target.value);
    masterDisplay.textContent = masterValue.toFixed(2);
    
    // Only apply gain if synth is powered on
    if (window.synth.synthPowered) {
      masterGain.setGain(masterValue);
    }
    updateMasterDisplay();
  });

  // Filter cutoff control
  filterCutoffSlider?.addEventListener('input', (e) => {
    const cutoff = parseFloat(e.target.value);
    filter.setCutoff(cutoff);
    cutoffDisplay.textContent = cutoff;
    updateFilterDisplay();
  });

  // Filter resonance control
  filterResSlider?.addEventListener('input', (e) => {
    const resonance = parseFloat(e.target.value);
    filter.setResonance(resonance);
    resDisplay.textContent = resonance.toFixed(1);
    updateFilterDisplay();
  });

  // VCA Attack control
  attackSlider?.addEventListener('input', (e) => {
    const attack = parseFloat(e.target.value);
    vca.setAttack(attack);
    attackDisplay.textContent = attack.toFixed(3);
    updateVCADisplay();
  });

  // VCA Decay control
  decaySlider?.addEventListener('input', (e) => {
    const decay = parseFloat(e.target.value);
    vca.setDecay(decay);
    decayDisplay.textContent = decay.toFixed(3);
    updateVCADisplay();
  });

  // VCA Sustain control
  sustainSlider?.addEventListener('input', (e) => {
    const sustain = parseFloat(e.target.value);
    vca.setSustain(sustain);
    sustainDisplay.textContent = sustain.toFixed(2);
    updateVCADisplay();
  });

  // VCA Release control
  releaseSlider?.addEventListener('input', (e) => {
    const release = parseFloat(e.target.value);
    vca.setRelease(release);
    releaseDisplay.textContent = release.toFixed(3);
    updateVCADisplay();
  });

  // Initialize display values
  updateModuleStatus();
  updateOscillatorDisplay();
  updateGainDisplay();
  updateMasterDisplay();
  updateFilterDisplay();
  updateVCADisplay();
}

// Visual feedback functions
function updateModuleStatus() {
  const isPowered = window.synth?.synthPowered || false;
  const status = isPowered ? 'ON' : 'OFF';
  
  console.log('Updating module status:', status);
  
  // Update all module status indicators
  const modules = ['oscModule', 'gainModule', 'filterModule', 'vcaModule', 'masterModule'];
  
  modules.forEach(moduleId => {
    const moduleEl = document.getElementById(moduleId);
    if (moduleEl) {
      const statusEl = moduleEl.querySelector('.module-status');
      if (statusEl) statusEl.textContent = status;
    }
  });
  
  // Add visual styling based on power state
  const moduleBoxes = document.querySelectorAll('.module-box:not(.speakers)');
  moduleBoxes.forEach(module => {
    if (isPowered) {
      module.classList.add('powered');
    } else {
      module.classList.remove('powered');
    }
  });
}

function updateOscillatorDisplay() {
  const freqSlider = document.getElementById('frequencySlider');
  const waveSelect = document.getElementById('waveformSelect');
  
  if (freqSlider) {
    document.getElementById('oscFreq').textContent = freqSlider.value;
  }
  
  if (waveSelect) {
    document.getElementById('oscWave').textContent = waveSelect.value;
  }
}

function updateGainDisplay() {
  const gainSlider = document.getElementById('gainSlider');
  if (gainSlider) {
    document.getElementById('gainValue').textContent = parseFloat(gainSlider.value).toFixed(2);
  }
}

function updateMasterDisplay() {
  const masterSlider = document.getElementById('masterSlider');
  if (masterSlider) {
    document.getElementById('masterValue').textContent = parseFloat(masterSlider.value).toFixed(2);
  }
}

function updateFilterDisplay() {
  const cutoffSlider = document.getElementById('filterCutoffSlider');
  const resSlider = document.getElementById('filterResSlider');
  
  if (cutoffSlider) {
    document.getElementById('filterCutoff').textContent = cutoffSlider.value;
  }
  
  if (resSlider) {
    document.getElementById('filterRes').textContent = parseFloat(resSlider.value).toFixed(1);
  }
}

function updateVCADisplay() {
  // Get actual VCA gate status instead of inferring from keyboard
  const gateOpen = window.synth?.vca?.getGateStatus() || false;
  const gateStatus = gateOpen ? 'OPEN' : 'CLOSED';
  
  const gateElement = document.getElementById('vcaGate');
  if (gateElement) {
    gateElement.textContent = gateStatus;
  }
  
  // Show envelope timing info (this part was working correctly)
  const attackSlider = document.getElementById('attackSlider');
  const decaySlider = document.getElementById('decaySlider');
  
  if (attackSlider && decaySlider) {
    const attack = parseFloat(attackSlider.value).toFixed(2);
    const decay = parseFloat(decaySlider.value).toFixed(2);
    const envElement = document.getElementById('vcaEnv');
    if (envElement) {
      envElement.textContent = `A:${attack} D:${decay}`;
    }
  }
}

// Separate function specifically for gate status updates
window.updateVCAGateStatus = function(isOpen) {
  const gateElement = document.getElementById('vcaGate');
  if (gateElement) {
    gateElement.textContent = isOpen ? 'OPEN' : 'CLOSED';
  }
};