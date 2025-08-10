export class SubharmonicCalculator {
  constructor() {
    // Common Subharmonicon divisions
    this.divisionRatios = [1, 2, 3, 4, 6, 8, 12, 16];
    
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
  
  // Clear cache (useful for memory management)
  clearCache() {
    this.frequencyCache.clear();
  }
  
  // Get cache size (for debugging)
  getCacheSize() {
    return this.frequencyCache.size;
  }
}