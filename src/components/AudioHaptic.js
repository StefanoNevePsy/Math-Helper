let audioCtx = null;

export const playHapticAudioFeedback = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Un "pop/click" legnoso: rapido decadimento della frequenza e del volume
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    
    // Frequenza da 600Hz a 40Hz in 0.05 secondi (slap/pop effect)
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
    
    // Volume decade quasi subito
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    console.error("Audio API error:", e);
  }

  // Haptic feedback per i device supportati
  if (navigator.vibrate) {
    navigator.vibrate(20); // 20ms snap tacticle feedback
  }
};
