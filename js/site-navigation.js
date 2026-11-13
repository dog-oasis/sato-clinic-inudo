/* 全ページ共通。既存のリンク・本文・個別ページのJavaScriptには介入しない。 */
(() => {
  if (document.querySelector('.back-to-top')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.hidden = true;
  button.setAttribute('aria-label', 'このページの先頭へ戻る');
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 12 6-6 6 6M12 6v13"/></svg><span>上へ</span>';
  document.body.append(button);
  const footer = document.querySelector('.site-footer');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;

  function update() {
    queued = false;
    if (window.scrollY < 400) {
      button.hidden = true;
      return;
    }
    const size = 54;
    const gap = 12;
    const height = window.innerHeight;
    const right = parseFloat(getComputedStyle(button).right) || 20;
    const left = document.documentElement.clientWidth - right - size;
    let bottom = Math.max(20, height - (window.visualViewport?.height || height) + 20);
    if (footer) {
      const rect = footer.getBoundingClientRect();
      if (rect.top < height && rect.bottom > 0) bottom = Math.max(bottom, height - rect.top + gap);
    }
    const obstacles = [...document.querySelectorAll('.pill, .news-arrow, .news-playback, .news-dots, .news-index-card')]
      .filter(element => !element.closest('[inert], [hidden]'))
      .map(element => element.getBoundingClientRect())
      .filter(rect => rect.width && rect.height && rect.right > left - gap && rect.left < left + size + gap && rect.bottom > 0 && rect.top < height)
      .sort((a, b) => b.top - a.top);
    for (const rect of obstacles) {
      const top = height - bottom - size;
      if (top < rect.bottom + gap && top + size > rect.top - gap) bottom = Math.max(bottom, height - rect.top + gap);
    }
    // フッター等が画面を埋め、安全な余白を確保できない場合は重ねて表示しない。
    button.hidden = height - bottom - size < 12;
    button.style.setProperty('--back-to-top-bottom', `${Math.ceil(bottom)}px`);
  }

  function requestUpdate() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, left: window.scrollX, behavior: reduced.matches ? 'instant' : 'smooth' });
    document.querySelector('.site-header .brand')?.focus({ preventScroll: true });
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
  document.addEventListener('transitionend', requestUpdate);
  window.visualViewport?.addEventListener('resize', requestUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(requestUpdate);
    document.querySelectorAll('.site-header, main, .site-footer').forEach(element => observer.observe(element));
  }
  requestUpdate();
})();
