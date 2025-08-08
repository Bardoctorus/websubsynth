export class AudioContextManager {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.initialized = false;
  }

  get context() {
    return this.audioCtx;
  }

  async start() {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    this.initialized = true;
  }
}
