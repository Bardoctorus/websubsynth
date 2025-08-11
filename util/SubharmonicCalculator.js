export class SubharmonicCalculator {
  constructor() {
    // Extended subharmonic divisions (1 through 16)
    this.divisionRatios = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    
    // Cache for performance
    this.frequencyCache = new Map();
  }
  
  calculateSubharmonicFreq(fundamentalFreq, division) {
    // Validate inputs
    if (typeof fundamentalFreq !== 'number' || !isFinite(fundamentalFreq) || fundamentalFreq <= 0) {
      console.warn(`SubharmonicCalculator: Invalid fundamental frequency: ${fundamentalFreq}`);
      return 440; // Return a safe default
    }
    
    if (typeof division !== 'number' || !isFinite(division) || division <= 0) {
      console.warn(`SubharmonicCalculator: Invalid division: ${division}`);
      return fundamentalFreq; // Return fundamental as fallback
    }
    
    // Create cache key
    const cacheKey = `${fundamentalFreq}_${division}`;
    
    // Check cache first
    if (this.frequencyCache.has(cacheKey)) {
      return this.frequencyCache.get(cacheKey);
    }
    
    // Calculate subharmonic frequency
    const subharmonicFreq = fundamentalFreq / division;
    
    // Cache the result
    this.frequencyCache.set(cacheKey, subharmonicFreq);
    
    return subharmonicFreq;
  }
  
  // Get all available division ratios
  getAvailableDivisions() {
    return [...this.divisionRatios];
  }
  
  // Check if a division is valid
  isValidDivision(division) {
    return this.divisionRatios.includes(division);
  }
  
  // Calculate multiple subharmonics at once
  calculateMultipleSubharmonics(fundamentalFreq, divisions) {
    return divisions.map(division => ({
      division,
      frequency: this.calculateSubharmonicFreq(fundamentalFreq, division)
    }));
  }
  
  // Get musically interesting division combinations
  getMusicalDivisions() {
    return {
      octaves: [1, 2, 4, 8, 16],          // Perfect octaves
      fifths: [1, 3, 6, 12],              // Perfect fifths and compounds
      thirds: [1, 5, 10, 15],             // Major thirds and compounds
      sevenths: [1, 7, 14],               // Natural sevenths
      exotic: [9, 11, 13],                // More dissonant intervals
      chromatic: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    };
  }
  
  // Get the musical interval name for a division (approximation)
  getIntervalName(division) {
    const intervalNames = {
      1: 'Unison',
      2: 'Octave',
      3: 'Perfect Fifth',
      4: 'Double Octave', 
      5: 'Major Third',
      6: 'Compound Fifth',
      7: 'Natural Seventh',
      8: 'Triple Octave',
      9: 'Major Second',
      10: 'Compound Third',
      11: 'Eleventh',
      12: 'Double Fifth',
      13: 'Thirteenth', 
      14: 'Double Seventh',
      15: 'Double Third',
      16: 'Quadruple Octave'
    };
    
    return intervalNames[division] || `/${division}`;
  }
  
  // Clear cache (useful for memory management)
  clearCache() {
    this.frequencyCache.clear();
  }
  
  // Get cache size (for debugging)
  getCacheSize() {
    return this.frequencyCache.size;
  }
}