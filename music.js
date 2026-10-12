(() => {
  'use strict';
  const audio = document.getElementById('backgroundMusic');
  const button = document.getElementById('musicButton');
  const preferenceKey = 'luca-oracle-music-enabled-v1';
  let wanted = true;
  let loading = false;
  let requestId = 0;
  try { wanted = localStorage.getItem(preferenceKey) !== 'false'; } catch {}
  audio.volume = 0.32;
  function savePreference() {
    try { localStorage.setItem(preferenceKey, String(wanted)); } catch {}
  }
  function setState(state) {
    button.dataset.state = state;
    button.textContent = state === 'playing' ? '暫停音樂' : state === 'loading' ? '音樂載入中' : state === 'error' ? '重試音樂' : '播放音樂';
    button.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    button.setAttribute('aria-label', state === 'playing' ? '暫停背景音樂' : '播放背景音樂');
    button.title = 'The Oracle’s Breath · 循環背景音樂';
  }
  async function playMusic(manual) {
    if (!wanted || loading || !audio.paused) return;
    const currentRequest = ++requestId;
    loading = true;
    setState('loading');
    try {
      await audio.play();
      if (currentRequest === requestId && wanted && !audio.paused) setState('playing');
    } catch (error) {
      if (currentRequest !== requestId || !wanted || error?.name === 'AbortError') return;
      const blocked = error?.name === 'NotAllowedError';
      setState(blocked ? 'paused' : 'error');
      if (manual || blocked) toast(blocked ? '請點「播放音樂」開啟背景音樂。' : '音樂暫時無法播放，請稍後再試。');
    } finally {
      if (currentRequest === requestId) loading = false;
    }
  }
  button.addEventListener('click', () => {
    if (!audio.paused || loading) {
      wanted = false;
      ++requestId;
      loading = false;
      audio.pause();
      setState('paused');
      savePreference();
    } else {
      wanted = true;
      savePreference();
      void playMusic(true);
    }
  });
  document.getElementById('readingForm').addEventListener('submit', () => void playMusic(false));
  audio.addEventListener('playing', () => {
    if (!wanted) { audio.pause(); return; }
    setState('playing');
  });
  audio.addEventListener('pause', () => setState('paused'));
  audio.addEventListener('error', () => { loading = false; setState('error'); });
  setState('paused');
})();
