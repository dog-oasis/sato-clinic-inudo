/* news.htmlの.news-rowを唯一の記事データ元として、日付順に最大5件表示する。 */
(() => {
  const root = document.querySelector('.news-carousel');
  if (!root) return;
  const track = root.querySelector('.home-news-list');
  const viewport = root.querySelector('.news-viewport');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  async function loadNews() {
    if (!/^https?:$/.test(location.protocol)) return;
    try {
      const response = await fetch('./news.html', { cache: 'no-cache', signal: AbortSignal.timeout(4000) });
      if (!response.ok) return;
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const rows = [...doc.querySelectorAll('.news-row[id]')]
        .filter(row => row.querySelector('time[datetime]') && row.querySelector('.news-row-title'))
        .sort((a, b) => b.querySelector('time').dateTime.localeCompare(a.querySelector('time').dateTime))
        .slice(0, 5);
      if (!rows.length) return;
      track.replaceChildren(...rows.map(row => {
        const card = document.createElement('li');
        card.className = 'home-news-item';
        const title = document.createElement('h3');
        title.className = 'home-news-name';
        title.textContent = row.querySelector('.news-row-title').textContent;
        const link = document.createElement('a');
        link.className = 'news-card-link';
        link.href = `./news.html#${encodeURIComponent(row.id)}`;
        link.setAttribute('aria-label', `${title.textContent}：詳しくはこちら`);
        link.innerHTML = '詳しくはこちら<span aria-hidden="true"> ›</span>';
        card.append(row.querySelector('time').cloneNode(true), title, link);
        return card;
      }));
    } catch {
      // 通信に失敗しても、HTMLに記載済みの記事とリンクは利用できる。
    }
  }

  function start() {
    const originals = [...track.children];
    const count = originals.length;
    if (!count) return;
    const pad = Math.min(3, count);
    let position = pad;
    let moving = false;
    let timer;
    let animationTimer;
    let paused = reduced.matches;
    let hovering = false;
    const playback = root.querySelector('.news-playback');
    const note = root.querySelector('.news-playback-note');
    const dots = root.querySelector('.news-dots');
    const status = root.querySelector('.news-status');
    const columns = () => Math.min(count, Number(getComputedStyle(root).getPropertyValue('--news-columns')));
    const current = () => ((position - pad) % count + count) % count;
    originals.forEach((card, i) => card.classList.toggle('news-card-cream', i % 2 === 1));
    track.prepend(...originals.slice(-pad).map(card => card.cloneNode(true)));
    track.append(...originals.slice(0, pad).map(card => card.cloneNode(true)));
    root.classList.add('is-ready');
    root.querySelectorAll('.news-arrow, .news-carousel-controls').forEach(el => { el.hidden = false; });

    originals.forEach((card, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `${i + 1}件目から表示：${card.querySelector('h3').textContent}`);
      button.addEventListener('click', () => move(i - current(), true));
      dots.append(button);
    });

    function paint(animate = false) {
      const gap = parseFloat(getComputedStyle(track).columnGap);
      const step = (viewport.clientWidth + gap) / columns();
      track.style.transition = animate && !reduced.matches ? 'transform 550ms ease' : 'none';
      track.style.transform = `translateX(${-position * step}px)`;
      [...track.children].forEach((card, i) => {
        card.style.flexBasis = `${step - gap}px`;
        const visible = i >= position && i < position + columns();
        card.inert = !visible;
        card.setAttribute('aria-hidden', String(!visible));
        card.setAttribute('aria-label', `${((i - pad) % count + count) % count + 1} / ${count}`);
      });
      [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === current())));
    }

    function finish() {
      if (!moving) return;
      clearTimeout(animationTimer);
      moving = false;
      position = pad + current();
      paint();
    }

    function schedule() {
      clearTimeout(timer);
      const focused = root.contains(document.activeElement);
      const running = !paused && !reduced.matches && !hovering && !focused && !document.hidden && count > columns();
      if (running) timer = setTimeout(() => move(1), 5000);
      note.textContent = reduced.matches ? '動きを減らす設定により自動再生は停止中です' : paused ? '自動再生は停止中です' : hovering || focused ? '操作中は自動再生を停止します' : '5秒ごとに自動で切り替わります';
      playback.textContent = paused ? '自動再生を開始' : '自動再生を一時停止';
      playback.setAttribute('aria-pressed', String(paused));
      playback.disabled = reduced.matches || count <= columns();
    }

    function move(amount, manual = false) {
      if (moving || !amount || count <= columns()) return;
      position += amount;
      moving = true;
      paint(true);
      if (manual) status.textContent = `${count}件中${current() + 1}件目から表示`;
      if (reduced.matches) finish();
      // transitionendが発生しない背景タブ等でもロックを解除する。
      else animationTimer = setTimeout(finish, 600);
      schedule();
    }

    track.addEventListener('transitionend', finish);
    root.querySelector('.news-prev').addEventListener('click', () => move(-1, true));
    root.querySelector('.news-next').addEventListener('click', () => move(1, true));
    playback.addEventListener('click', () => { paused = !paused; schedule(); });
    root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; schedule(); } });
    root.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    root.addEventListener('focusin', schedule);
    root.addEventListener('focusout', () => setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => { paused = reduced.matches; finish(); paint(); schedule(); });
    new ResizeObserver(() => {
      finish();
      paint();
      root.querySelectorAll('.news-arrow').forEach(button => { button.disabled = count <= columns(); });
      schedule();
    }).observe(viewport);
    paint();
    schedule();
  }

  // 取得が遅い場合でも操作できるよう、待ち時間に上限を設ける。
  loadNews().then(start);
})();
