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
    subharmonicEngine,
    gainStage,
    filter,
    vca,
    masterGain
  } = window.synth;

  // Get all UI elements
  const powerToggle = document.getElementById('powerToggle');
  const midiToggle = document.getElementById('midiToggle');
  
  // VCO controls
  const vco1FrequencySlider = document.getElementById('vco1FrequencySlider');
  const vco1WaveformSelect = document.getElementById('vco1WaveformSelect');
  const vco1LevelSlider = document.getElementById('vco1LevelSlider');
  const vco2FrequencySlider = document.getElementById('vco2FrequencySlider');
  const vco2WaveformSelect = document.getElementById('vco2WaveformSelect');
  const vco2LevelSlider = document.getElementById('vco2LevelSlider');
  
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

  // VCO display elements
  const vco1FreqDisplay = document.getElementById('vco1FreqDisplay');
  const vco1LevelDisplay = document.getElementById('vco1LevelDisplay');
  const vco2FreqDisplay = document.getElementById('vco2FreqDisplay');
  const vco2LevelDisplay = document.getElementById('vco2LevelDisplay');
  const freqDisplay = document.getElementById('freqDisplay'); // Keep for backward compatibility
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

  // VCO 1 Controls
  vco1FrequencySlider?.addEventListener('input', (e) => {
    const freq = parseFloat(e.target.value);
    if (subharmonicEngine) {
      subharmonicEngine.setVCO1Frequency(freq);
    }
    vco1FreqDisplay.textContent = freq;
    updateVCODisplays();
  });

  vco1WaveformSelect?.addEventListener('change', (e) => {
    if (subharmonicEngine) {
      subharmonicEngine.setVCO1Waveform(e.target.value);
    }
    updateVCODisplays();
  });

  vco1LevelSlider?.addEventListener('input', (e) => {
    const level = parseFloat(e.target.value);
    if (subharmonicEngine) {
      subharmonicEngine.setVCO1Level(level);
    }
    vco1LevelDisplay.textContent = level.toFixed(2);
  });

  // VCO 2 Controls
  vco2FrequencySlider?.addEventListener('input', (e) => {
    const freq = parseFloat(e.target.value);
    if (subharmonicEngine) {
      subharmonicEngine.setVCO2Frequency(freq);
    }
    vco2FreqDisplay.textContent = freq;
    updateVCODisplays();
  });

  vco2WaveformSelect?.addEventListener('change', (e) => {
    if (subharmonicEngine) {
      subharmonicEngine.setVCO2Waveform(e.target.value);
    }
    updateVCODisplays();
  });

  vco2LevelSlider?.addEventListener('input', (e) => {
    const level = parseFloat(e.target.value);
    if (subharmonicEngine) {
      subharmonicEngine.setVCO2Level(level);
    }
    vco2LevelDisplay.textContent = level.toFixed(2);
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

  // NEW: Subharmonic controls
  
  // Main oscillator level in the mix
  const mainOscLevelSlider = document.getElementById('mainOscLevelSlider');
  const mainOscLevelDisplay = document.getElementById('mainOscLevelDisplay');
  
  mainOscLevelSlider?.addEventListener('input', (e) => {
    const level = parseFloat(e.target.value);
    if (window.synth.subharmonicMixer) {
      window.synth.subharmonicMixer.setMainLevel(level);
    }
    mainOscLevelDisplay.textContent = level.toFixed(2);
  });

  // Subharmonic voice controls
  const subVoiceGroups = document.querySelectorAll('.sub-voice-group');
  subVoiceGroups.forEach((group, index) => {
    const enableCheckbox = group.querySelector('.sub-enable');
    const divisionSelect = group.querySelector('.sub-division');
    const levelSlider = group.querySelector('.sub-level');
    const levelDisplay = group.querySelector('.sub-level-display');
    const waveformSelect = group.querySelector('.sub-waveform');

    // Enable/disable voice
    enableCheckbox?.addEventListener('change', (e) => {
      if (subharmonicEngine) {
        subharmonicEngine.setSubVoiceEnabled(index, e.target.checked);
      }
    });

    // Division control
    divisionSelect?.addEventListener('change', (e) => {
      const division = parseInt(e.target.value);
      if (subharmonicEngine) {
        subharmonicEngine.setSubVoiceDivision(index, division);
      }
      // Update the header to show current division and parent
      const header = group.querySelector('h3');
      const parentSelect = group.querySelector('.sub-parent');
      const parentIndex = parentSelect ? parseInt(parentSelect.value) : Math.floor(index / 2);
      const parentName = parentIndex === 0 ? 'VCO1' : 'VCO2';
      if (header) {
        header.textContent = `Sub Osc ${index + 1} (${parentName} /${division})`;
      }
    });

    // Level control
    levelSlider?.addEventListener('input', (e) => {
      const level = parseFloat(e.target.value);
      if (subharmonicEngine) {
        subharmonicEngine.setSubVoiceLevel(index, level);
      }
      levelDisplay.textContent = level.toFixed(2);
    });

    // Waveform control
    waveformSelect?.addEventListener('change', (e) => {
      if (subharmonicEngine) {
        subharmonicEngine.setSubVoiceWaveform(index, e.target.value);
      }
    });

    // Parent control (FUTURE ROUTING FLEXIBILITY)
    const parentSelect = group.querySelector('.sub-parent');
    parentSelect?.addEventListener('change', (e) => {
      const newParentIndex = parseInt(e.target.value);
      if (subharmonicEngine) {
        subharmonicEngine.setSubVoiceParent(index, newParentIndex);
      }
      // Update header to show new parent
      const header = group.querySelector('h3');
      const division = group.querySelector('.sub-division').value;
      const parentName = newParentIndex === 0 ? 'VCO1' : 'VCO2';
      if (header) {
        header.textContent = `Sub Osc ${index + 1} (${parentName} /${division})`;
      }
    });
  });

  // Initialize display values
  updateModuleStatus();
  updateOscillatorDisplay();
  updateGainDisplay();
  updateMasterDisplay();
  updateFilterDisplay();
  updateVCADisplay();
  updateSubharmonicDisplays(); // NEW
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

function updateVCODisplays() {
  const vco1FreqSlider = document.getElementById('vco1FrequencySlider');
  const vco1WaveSelect = document.getElementById('vco1WaveformSelect');
  const vco2FreqSlider = document.getElementById('vco2FrequencySlider');
  const vco2WaveSelect = document.getElementById('vco2WaveformSelect');
  
  // Update VCO1 displays
  if (vco1FreqSlider) {
    const vco1FreqDisplay = document.getElementById('vco1FreqDisplay');
    if (vco1FreqDisplay) vco1FreqDisplay.textContent = vco1FreqSlider.value;
    
    // Update legacy display for backward compatibility
    const freqDisplay = document.getElementById('freqDisplay');
    if (freqDisplay) freqDisplay.textContent = vco1FreqSlider.value;
  }
  
  if (vco1WaveSelect) {
    const oscWaveDisplay = document.getElementById('oscWave');
    if (oscWaveDisplay) oscWaveDisplay.textContent = vco1WaveSelect.value;
  }
  
  // Update VCO2 displays
  if (vco2FreqSlider) {
    const vco2FreqDisplay = document.getElementById('vco2FreqDisplay');
    if (vco2FreqDisplay) vco2FreqDisplay.textContent = vco2FreqSlider.value;
  }
}

function updateOscillatorDisplay() {
  // Keep this for backward compatibility, but redirect to updateVCODisplays
  updateVCODisplays();
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

// NEW: VCO and Subharmonic display updates
function updateSubharmonicDisplays() {
  // Update VCO level displays
  const vco1LevelSlider = document.getElementById('vco1LevelSlider');
  const vco1LevelDisplay = document.getElementById('vco1LevelDisplay');
  const vco2LevelSlider = document.getElementById('vco2LevelSlider');
  const vco2LevelDisplay = document.getElementById('vco2LevelDisplay');
  
  if (vco1LevelSlider && vco1LevelDisplay) {
    vco1LevelDisplay.textContent = parseFloat(vco1LevelSlider.value).toFixed(2);
  }
  
  if (vco2LevelSlider && vco2LevelDisplay) {
    vco2LevelDisplay.textContent = parseFloat(vco2LevelSlider.value).toFixed(2);
  }
  
  // Update all subharmonic voice displays
  const subVoiceGroups = document.querySelectorAll('.sub-voice-group');
  subVoiceGroups.forEach((group, index) => {
    const levelSlider = group.querySelector('.sub-level');
    const levelDisplay = group.querySelector('.sub-level-display');
    
    if (levelSlider && levelDisplay) {
      levelDisplay.textContent = parseFloat(levelSlider.value).toFixed(2);
    }
  });
}

// Separate function specifically for gate status updates
window.updateVCAGateStatus = function(isOpen) {
  const gateElement = document.getElementById('vcaGate');
  if (gateElement) {
    gateElement.textContent = isOpen ? 'OPEN' : 'CLOSED';
  }
};