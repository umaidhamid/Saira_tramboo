/* Core storefront behaviour shared by every page: cart, wishlist, quick view, search, overlays. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const FREE_SHIP = 1999;
  const { collections, featured } = window.SR_CATALOG;
  const products = window.SR_PRODUCTS;
  const byId = id => products.find(p => p.id === id);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '₹' + n.toLocaleString('en-IN');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- persisted state ---------- */
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
  let cart = load('sr_cart', []).filter(l => byId(l.id));
  let wish = load('sr_wish', []).filter(byId);

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 2400);
  }

  /* ---------- product card ---------- */
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.7-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.5-7.5 10.2-7.5 10.2z"/></svg>';

  function cardHTML(p) {
    const on = wish.includes(p.id);
    const tags = [];
    if (!p.inStock) tags.push('<span class="tag tag--out">Sold out</span>');
    else {
      if (p.discount) tags.push(`<span class="tag tag--sale">−${p.discount}%</span>`);
      if (p.isNew) tags.push('<span class="tag">New</span>');
      else if (p.isBest) tags.push('<span class="tag tag--best">Bestseller</span>');
    }
    return `
    <article class="card${p.inStock ? '' : ' is-out'}" data-id="${p.id}">
      <div class="card__media">
        <button class="card__hit" data-qv="${p.id}" aria-label="Quick view: ${esc(p.name)}" tabindex="-1"></button>
        <img src="${p.image}" width="600" height="800" loading="lazy" alt="${esc(p.name)} in ${esc(p.colorName.toLowerCase())}">
        <img src="${p.image2}" width="600" height="800" loading="lazy" alt="" aria-hidden="true">
        <div class="tags">${tags.join('')}</div>
        <button class="wish" data-wish="${p.id}" aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Add to'} wishlist: ${esc(p.name)}">${heart}</button>
        ${p.inStock ? `<div class="quickadd"><p>Quick add</p><div>${p.sizes.map(s => `<button data-add="${p.id}" data-size="${s}" aria-label="Add size ${s} to bag">${s === 'Free Size' ? 'Free size' : s}</button>`).join('')}</div></div>` : ''}
      </div>
      <div class="card__info">
        <span class="card__cat">${esc(p.category)} · ${esc(p.fabric)}</span>
        <h3 class="card__name"><button data-qv="${p.id}">${esc(p.name)}</button></h3>
        <span class="price">${money(p.price)}${p.oldPrice ? `<s aria-label="Original price">${money(p.oldPrice)}</s><em class="off">${p.discount}% off</em>` : ''}</span>
        <span class="rating" aria-label="Rated ${p.rating} out of 5 from ${p.reviews} reviews"><span aria-hidden="true">★ ${p.rating.toFixed(1)}</span> <i aria-hidden="true">(${p.reviews})</i></span>
        <button class="card__qv" data-qv="${p.id}">Quick View</button>
      </div>
    </article>`;
  }

  /* ---------- cart ---------- */
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => cart.reduce((n, l) => n + l.qty * byId(l.id).price, 0);
  const setBadge = (sel, n) => { const b = $(sel); b.textContent = n; b.hidden = n === 0; };

  function persist() {
    save('sr_cart', cart);
    save('sr_wish', wish);
    setBadge('#bagCount', cartCount());
    setBadge('#wishCount', wish.length);
  }

  function addToCart(id, size, qty = 1) {
    const line = cart.find(l => l.id === id && l.size === size);
    if (line) line.qty = Math.min(10, line.qty + qty); else cart.push({ id, size, qty });
    persist(); renderBag();
    toast('Added to your bag');
  }

  function renderBag() {
    const body = $('#bagBody'), foot = $('#bagFoot');
    if (!cart.length) {
      body.innerHTML = '<div class="drawer__empty"><h3>Your bag is empty</h3><p>Discover something you will love.</p></div>';
      foot.innerHTML = '<button class="btn btn--line btn--block" data-close>Continue Shopping</button>';
      return;
    }
    body.innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<div class="line">
        <img src="${p.image}" width="84" height="112" alt="${esc(p.name)}">
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="line__meta">${esc(p.colorName)} · Size ${l.size}</p>
          <div class="line__row">
            <div class="qty" role="group" aria-label="Quantity">
              <button data-qty="${i}" data-d="-1" aria-label="Decrease quantity">−</button>
              <span aria-live="polite">${l.qty}</span>
              <button data-qty="${i}" data-d="1" aria-label="Increase quantity">+</button>
            </div>
            <span class="price">${money(p.price * l.qty)}</span>
          </div>
          <button class="line__rm" data-rm="${i}">Remove</button>
        </div></div>`;
    }).join('');
    const total = cartTotal(), left = FREE_SHIP - total;
    foot.innerHTML = `
      <div><p class="ship-note">${left > 0 ? `Add ${money(left)} more for free shipping` : 'You have unlocked free shipping'}</p><div class="ship-bar"><i style="width:${Math.min(100, total / FREE_SHIP * 100)}%"></i></div></div>
      <div class="subtotal"><span>Subtotal</span><strong>${money(total)}</strong></div>
      <button class="btn btn--solid btn--block" id="checkout">Checkout</button>
      <p class="demo-note" id="demoNote" role="status"></p>
      <button class="btn btn--line btn--block" data-close>Continue Shopping</button>`;
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    const i = wish.indexOf(id);
    if (i > -1) { wish.splice(i, 1); toast('Removed from wishlist'); } else { wish.push(id); toast('Saved to wishlist'); }
    persist(); renderWish();
    $$(`[data-wish="${id}"].wish`).forEach(b => {
      const on = wish.includes(id);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} wishlist: ${byId(id).name}`);
    });
    const qvBtn = $('#qvWish');
    if (qvBtn && +qvBtn.dataset.id === id) qvBtn.textContent = wish.includes(id) ? 'Saved to wishlist' : 'Add to wishlist';
  }
  function renderWish() {
    $('#wishBody').innerHTML = wish.length ? wish.map(id => {
      const p = byId(id);
      return `<div class="line"><img src="${p.image}" width="84" height="112" alt="${esc(p.name)}"><div>
        <h3>${esc(p.name)}</h3><p class="line__meta">${esc(p.colorName)}</p>
        <span class="price">${money(p.price)}</span><br>
        <button class="line__rm" data-qv="${p.id}">Choose size</button> &nbsp; <button class="line__rm" data-wish="${p.id}">Remove</button></div></div>`;
    }).join('') : '<div class="drawer__empty"><h3>Nothing saved yet</h3><p>Tap the heart on any piece to save it here.</p></div>';
  }

  /* ---------- overlays ---------- */
  let lastFocus = null, openName = null;
  const layers = {
    bag: { el: $('#bagDrawer'), scrim: true },
    wish: { el: $('#wishDrawer'), scrim: true },
    qv: { el: $('#qv') },
    menu: { el: $('#mobileNav') },
    search: { el: $('#search') },
    filters: { el: $('#filterPanel'), scrim: true },
  };
  function openLayer(name) {
    const L = layers[name];
    if (name === 'filters') L.el = $('#filterPanel');
    if (!L || !L.el) return;
    if (openName) closeLayer(true);
    lastFocus = document.activeElement;
    openName = name;
    if (name === 'search') L.el.hidden = false;
    void L.el.offsetWidth;
    L.el.classList.add('is-open');
    L.el.setAttribute('aria-hidden', 'false');
    if (L.scrim) $('#drawerScrim').classList.add('is-open');
    document.body.classList.add('is-locked');
    $('#menuOpen').setAttribute('aria-expanded', name === 'menu');
    const focusTarget = name === 'search' ? $('#searchInput') : $('button, [href], input', L.el);
    setTimeout(() => focusTarget && focusTarget.focus({ preventScroll: true }), 60);
  }
  function closeLayer(keepFocus) {
    if (!openName) return;
    const L = layers[openName];
    L.el.classList.remove('is-open');
    L.el.setAttribute('aria-hidden', 'true');
    if (openName === 'search') setTimeout(() => { if (!L.el.classList.contains('is-open')) L.el.hidden = true; }, 350);
    $('#drawerScrim').classList.remove('is-open');
    document.body.classList.remove('is-locked');
    $('#menuOpen').setAttribute('aria-expanded', 'false');
    openName = null;
    if (!keepFocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- quick view ---------- */
  function openQuickView(id) {
    const p = byId(id);
    let size = p.sizes.length === 1 ? p.sizes[0] : null, qty = 1;
    const box = $('#qvBox');
    const isFree = p.sizes.length === 1;
    box.innerHTML = `
      <button class="icon-btn qv__close" data-close-modal aria-label="Close quick view"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <div class="qv__gallery">
        <img id="qvMain" src="${p.image}" width="600" height="800" alt="${esc(p.name)}">
        <div class="qv__thumbs">
          <button class="is-active" data-thumb="${p.image}" aria-label="Show front view"><img src="${p.image}" width="56" height="75" alt=""></button>
          <button data-thumb="${p.image2}" aria-label="Show detail view"><img src="${p.image2}" width="56" height="75" alt=""></button>
        </div>
      </div>
      <div class="qv__info">
        <span class="card__cat">${esc(p.category)} · ${esc(p.colorName)}</span>
        <h2 id="qvName">${esc(p.name)}</h2>
        <span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s><em class="off">${p.discount}% off</em>` : ''}</span>
        <span class="rating">★ ${p.rating.toFixed(1)} <i>(${p.reviews} reviews)</i></span>
        <p class="qv__desc">${esc(p.desc)}</p>
        <dl class="qv__specs"><div><dt>Fabric</dt><dd>${esc(p.fabric)}</dd></div><div><dt>Work</dt><dd>${esc(p.work.join(', '))}</dd></div><div><dt>Occasion</dt><dd>${esc(p.occasion.join(', '))}</dd></div></dl>
        <div class="qv__label">Size <span>${isFree ? 'One size fits all' : 'Select a size'}</span></div>
        <div class="sizes" role="radiogroup" aria-label="Size">${p.sizes.map(s => `<button role="radio" aria-checked="${isFree}" data-size="${s}"${p.inStock ? '' : ' disabled'}>${s}</button>`).join('')}</div>
        <p class="qv__err" id="qvErr" role="alert"></p>
        <div class="qv__buy">
          <div class="qty" role="group" aria-label="Quantity"><button data-q="-1" aria-label="Decrease quantity">−</button><span id="qvQty" aria-live="polite">1</span><button data-q="1" aria-label="Increase quantity">+</button></div>
          <button class="btn btn--solid" id="qvAdd"${p.inStock ? '' : ' disabled'}>${p.inStock ? 'Add to Bag' : 'Sold out'}</button>
        </div>
        <button class="qv__wish" id="qvWish" data-id="${p.id}">${wish.includes(p.id) ? 'Saved to wishlist' : 'Add to wishlist'}</button>
        <div class="qv__list"><span>Free shipping above ₹1,999 · Pan-India delivery</span><span>Easy 7-day returns</span></div>
      </div>`;

    box.onclick = e => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.thumb) {
        $('#qvMain').src = t.dataset.thumb;
        $$('.qv__thumbs button', box).forEach(b => b.classList.toggle('is-active', b === t));
      } else if (t.dataset.size) {
        size = t.dataset.size;
        $$('.sizes button', box).forEach(b => b.setAttribute('aria-checked', b === t));
        $('#qvErr').textContent = '';
      } else if (t.dataset.q) {
        qty = Math.max(1, Math.min(10, qty + +t.dataset.q));
        $('#qvQty').textContent = qty;
      } else if (t.id === 'qvAdd') {
        if (!size) { $('#qvErr').textContent = 'Please select a size.'; return; }
        addToCart(p.id, size, qty);
        closeLayer(true);
        openLayer('bag');
      } else if (t.id === 'qvWish') {
        toggleWish(p.id);
      }
    };
    openLayer('qv');
  }

  /* ---------- search ---------- */
  const searchHay = p => `${p.name} ${p.categories.join(' ')} ${p.colorName} ${p.color} ${p.fabric} ${p.work.join(' ')} ${p.occasion.join(' ')} ${p.desc}`.toLowerCase();
  function runSearch(q) {
    q = q.trim().toLowerCase();
    const out = $('#searchResults'), hint = $('#searchHint');
    if (!q) {
      hint.textContent = 'Popular searches';
      out.innerHTML = `<div class="search__tags" style="grid-column:1/-1">${['Kurta', 'Saree', 'Embroidered', 'Red', 'Green', 'Festive', 'Lehenga', 'Silk'].map(t => `<button class="chip" data-term="${t}">${t}</button>`).join('')}</div>`;
      return;
    }
    const words = q.split(/\s+/);
    const res = products.filter(p => { const h = searchHay(p); return words.every(w => h.includes(w)); });
    hint.textContent = res.length ? `${res.length} result${res.length > 1 ? 's' : ''} for “${q}”` : `No results for “${q}”`;
    out.innerHTML = res.length ? res.slice(0, 8).map(p => `
      <button class="sr" data-qv="${p.id}"><img src="${p.image}" width="64" height="85" alt="${esc(p.name)}">
        <div><strong>${esc(p.name)}</strong><span>${esc(p.category)} · ${esc(p.colorName)}</span><span class="sr__price">${money(p.price)}</span></div></button>`).join('')
      + (res.length > 8 ? `<a class="btn btn--line" style="grid-column:1/-1;justify-self:center" href="shop.html?q=${encodeURIComponent(q)}">View all ${res.length} results</a>` : '')
      : '<p class="empty" style="grid-column:1/-1">Try “kurta”, “saree”, “embroidered” or a colour.</p>';
  }
  function submitSearch(v) {
    v = v.trim();
    if (!v) return;
    if (window.SR.onSearch) { closeLayer(true); window.SR.onSearch(v); } else location.href = 'shop.html?q=' + encodeURIComponent(v);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const q = sel => e.target.closest(sel);
    let el;
    if ((el = q('[data-add]'))) { addToCart(+el.dataset.add, el.dataset.size); return; }
    if ((el = q('[data-wish]'))) { toggleWish(+el.dataset.wish); return; }
    if ((el = q('[data-qv]'))) { if (openName === 'wish' || openName === 'search') closeLayer(true); openQuickView(+el.dataset.qv); return; }
    if ((el = q('[data-qty]'))) {
      const i = +el.dataset.qty, l = cart[i]; l.qty += +el.dataset.d;
      if (l.qty < 1) cart.splice(i, 1); else l.qty = Math.min(l.qty, 10);
      persist(); renderBag(); return;
    }
    if ((el = q('[data-rm]'))) { cart.splice(+el.dataset.rm, 1); persist(); renderBag(); return; }
    if (q('#checkout')) { $('#demoNote').textContent = 'Demo checkout — connect payment gateway in production.'; return; }
    if ((el = q('[data-term]'))) { $('#searchInput').value = el.dataset.term; runSearch(el.dataset.term); return; }
    if (q('[data-close], [data-close-modal], [data-close-menu]')) { closeLayer(); return; }
    if (q('[data-open="wish"]')) { openLayer('wish'); return; }
    if (q('[data-open="account"]')) { closeLayer(true); toast('Sign-in is not part of this demo'); return; }
    if (q('.mobile-nav a')) closeLayer(true);
  });

  $('#menuOpen').addEventListener('click', () => openLayer('menu'));
  $('#menuClose').addEventListener('click', () => closeLayer());
  $('#searchOpen').addEventListener('click', () => { openLayer('search'); runSearch($('#searchInput').value); });
  $('#searchClose').addEventListener('click', () => closeLayer());
  $('#searchInput').addEventListener('input', e => runSearch(e.target.value));
  $('#searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') submitSearch(e.target.value); });
  $('#bagOpen').addEventListener('click', () => openLayer('bag'));
  $('#wishOpen').addEventListener('click', () => openLayer('wish'));
  $('#accountBtn').addEventListener('click', () => toast('Sign-in is not part of this demo'));
  $('#drawerScrim').addEventListener('click', () => closeLayer());
  $('#announceClose').addEventListener('click', () => $('#announce').remove());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLayer(); return; }
    if (e.key !== 'Tab' || !openName) return;
    const f = $$('button:not([disabled]), [href], input, select', layers[openName].el).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-small', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- home page sections ---------- */
  const sig = $('#signatureGrid');
  if (sig) sig.innerHTML = featured.map(id => cardHTML(byId(id))).join('');
  const fresh = $('#newGrid');
  if (fresh) fresh.innerHTML = [...products].filter(p => p.inStock).sort((a, b) => a.added - b.added).slice(0, 4).map(cardHTML).join('');

  const news = $('#newsForm');
  if (news) news.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#newsEmail'), msg = $('#newsMsg'), form = e.currentTarget;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    form.classList.toggle('is-error', !ok);
    msg.className = 'news__msg ' + (ok ? 'is-ok' : 'is-error');
    msg.textContent = ok ? 'Thank you — you are on the list.' : 'Please enter a valid email address.';
    input.setAttribute('aria-invalid', !ok);
    if (ok) form.reset(); else input.focus();
  });

  /* scroll reveal */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: .12 }) : null;
  const reveal = () => $$('.reveal:not(.is-in)').forEach((el, i) => {
    el.style.setProperty('--rd', (i % 4) * 90 + 'ms');
    io ? io.observe(el) : el.classList.add('is-in');
  });
  reveal();

  window.SR = { products, byId, money, esc, cardHTML, searchHay, openLayer, closeLayer, toast, reveal, collections, onSearch: null };
  renderBag(); renderWish(); persist(); runSearch('');
})();
