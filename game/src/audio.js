// Synthesised WebAudio sounds only — no audio files.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    click() { tone(660, 0.07, 'square', 0.06); },
    pickup() { tone(880, 0.1, 'sine', 0.12); setTimeout(() => tone(1320, 0.14, 'sine', 0.1), 70); },
    emp() { tone(220, 0.35, 'sawtooth', 0.1, 60); },
    noise() { tone(300, 0.18, 'triangle', 0.12, 900); },
    spotted() { tone(520, 0.16, 'square', 0.1, 780); },
    alarm() { tone(440, 0.3, 'sawtooth', 0.09, 880); },
    caught() { tone(330, 0.5, 'sawtooth', 0.12, 110); },
    win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'sine', 0.11), i * 110)); },
  };
}
