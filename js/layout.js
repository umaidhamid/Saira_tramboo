/* Shared site chrome (announcement, header, menus, footer, overlays). Runs before app.js. */
(() => {
  'use strict';
  const page = document.body.dataset.page || '';
  const cols = window.SR_CATALOG.collections;
  const ico = {
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="17" cy="7" r="1" fill="currentColor"/></svg>',
  };
  const colLinks = cols.map(c => `<a href="collection.html?c=${c.slug}">${c.title}</a>`).join('');
  const cur = k => (page === k ? ' aria-current="page"' : '');

  const top = `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="announce" id="announce"><p>Free shipping on orders above ₹1999</p>
    <button class="announce__close" id="announceClose" aria-label="Dismiss announcement"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
  <header class="header" id="header"><div class="header__inner">
    <button class="icon-btn header__burger" id="menuOpen" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
    <a class="wordmark" href="index.html" aria-label="Saira tramboo — home"><span class="wordmark__name">Saira tramboo</span><span class="wordmark__tag">Women's Ethnic Wear</span></a>
    <nav class="nav" aria-label="Primary">
      <a href="index.html"${cur('home')}>Home</a>
      <a href="shop.html"${cur('shop')}>Shop</a>
      <a href="collection.html?c=new-arrivals">New Arrivals</a>
      <div class="nav__item">
        <a href="collections.html"${page === 'collections' || page === 'collection' ? ' aria-current="page"' : ''}>Collections</a>
        <div class="mega"><div class="mega__inner"><p class="mega__title">Collections</p><div class="mega__links">${colLinks}</div><a class="mega__all" href="collections.html">View all collections →</a></div></div>
      </div>
      <a href="index.html#story">About</a>
    </nav>
    <div class="header__actions">
      <button class="icon-btn" id="searchOpen" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <button class="icon-btn header__account" id="accountBtn" aria-label="Account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 20c.6-4 3.8-6 7.5-6s6.9 2 7.5 6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <button class="icon-btn header__wish" id="wishOpen" aria-label="Wishlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.7-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.5-7.5 10.2-7.5 10.2z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span class="badge" id="wishCount" hidden>0</span></button>
      <button class="icon-btn" id="bagOpen" aria-label="Shopping bag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span class="badge" id="bagCount" hidden>0</span></button>
    </div></div></header>
  <div class="mobile-nav" id="mobileNav" aria-hidden="true">
    <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="mobile-nav__top"><span class="wordmark__name">Saira tramboo</span><button class="icon-btn" id="menuClose" aria-label="Close menu">${ico.x}</button></div>
      <nav aria-label="Mobile">
        <a href="index.html">Home</a>
        <a href="shop.html">Shop</a>
        <a href="collection.html?c=new-arrivals">New Arrivals</a>
        <a href="collections.html">Collections</a>
        <div class="mobile-nav__sub">${colLinks}</div>
        <a href="index.html#story">About</a>
      </nav>
      <div class="mobile-nav__foot"><button class="link-btn" data-open="wish">Wishlist</button><button class="link-btn" data-open="account">Account</button><a href="index.html#follow">Instagram</a></div>
    </div><div class="scrim" data-close-menu></div></div>`;

  const bottom = `
  <footer class="footer"><div class="footer__grid">
    <div class="footer__brand"><span class="wordmark__name">Saira tramboo</span><span class="wordmark__tag">Women's Ethnic Wear</span>
      <p>Elegant ethnic wear for celebrations, occasions and everyday moments.</p>
      <div class="social"><a href="index.html#follow" aria-label="Instagram">${ico.insta}</a>
        <a href="index.html#follow" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.5h2.5V5H14c-2.2 0-3.5 1.5-3.5 3.6V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9c0-.3.2-.5.5-.5z" fill="currentColor"/></svg></a>
        <a href="index.html#follow" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4A8 8 0 1 1 8.2 19L4 20z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l.8-1.7-2-1-.9.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.9-1-2L9 8.5z" fill="currentColor"/></svg></a>
        <a href="index.html#follow" aria-label="Pinterest"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a8.5 8.5 0 0 0-3 16.4c-.1-.7-.1-1.8.1-2.600l1-4.200s-.3-.5-.3-1.300c0-1.200.7-2.100 1.600-2.100.7 0 1.100.6 1.100 1.200 0 .8-.5 1.900-.7 2.900-.2.900.4 1.600 1.300 1.600 1.600 0 2.800-1.700 2.800-4.100 0-2.200-1.600-3.700-3.800-3.700-2.600 0-4.100 1.900-4.100 3.900 0 .8.300 1.600.7 2.100" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></a></div></div>
    <nav class="footer__col" aria-label="Shop links"><h3>Shop</h3><a href="collection.html?c=new-arrivals">New Arrivals</a><a href="shop.html?sort=best">Best Sellers</a><a href="collections.html">Collections</a><a href="shop.html">All Products</a><a href="collection.html?c=sale">Sale</a></nav>
    <nav class="footer__col" aria-label="Help links"><h3>Help</h3><a href="#contact">Contact Us</a><a href="#contact">Shipping</a><a href="#contact">Returns</a><a href="#contact">Size Guide</a><a href="#contact">FAQs</a></nav>
    <nav class="footer__col" aria-label="About links"><h3>About</h3><a href="index.html#story">Our Story</a><a href="index.html#follow">Instagram</a><a href="#contact">Contact</a></nav>
    <div class="footer__col" id="contact"><h3>Customer Care</h3><a href="#contact">WhatsApp</a><a href="#contact">hello@sairaramboo.example</a><a href="#contact">+91 00000 00000</a><p class="footer__small">Mon–Sat, 10am – 7pm IST</p></div>
  </div><div class="footer__bottom"><p>© 2026 Saira tramboo. All rights reserved.</p><p>Design concept — not a live store.</p></div></footer>

  <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search products" hidden>
    <div class="search__bar"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.4"/></svg>
      <input id="searchInput" type="search" placeholder="Search kurta, embroidered, red…" aria-label="Search products" autocomplete="off">
      <button class="icon-btn" id="searchClose" aria-label="Close search">${ico.x}</button></div>
    <div class="search__body"><p class="search__hint" id="searchHint" role="status"></p><div class="search__results" id="searchResults"></div></div></div>

  <aside class="drawer" id="bagDrawer" role="dialog" aria-modal="true" aria-labelledby="bagTitle" aria-hidden="true">
    <div class="drawer__head"><h2 id="bagTitle">Shopping Bag</h2><button class="icon-btn" data-close aria-label="Close bag">${ico.x}</button></div>
    <div class="drawer__body" id="bagBody"></div><div class="drawer__foot" id="bagFoot"></div></aside>
  <aside class="drawer" id="wishDrawer" role="dialog" aria-modal="true" aria-labelledby="wishTitle" aria-hidden="true">
    <div class="drawer__head"><h2 id="wishTitle">Wishlist</h2><button class="icon-btn" data-close aria-label="Close wishlist">${ico.x}</button></div>
    <div class="drawer__body" id="wishBody"></div></aside>
  <div class="scrim scrim--drawer" id="drawerScrim"></div>
  <div class="modal" id="qv" role="dialog" aria-modal="true" aria-labelledby="qvName" aria-hidden="true"><div class="modal__box" id="qvBox"></div><div class="scrim" data-close-modal></div></div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

  document.getElementById('chrome-top').outerHTML = top;
  document.getElementById('chrome-bottom').outerHTML = bottom;
})();
