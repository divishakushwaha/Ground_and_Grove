// Starts everything and keeps the "server online/offline" indicators up to date.
function setServerStatus(online) {
  $('#server-banner').hidden = online;
  $('#server-status').classList.toggle('is-online', online);
  $('#server-status-text').textContent = online ? 'Server connected' : 'Server offline';
}

async function checkServer() {
  try {
    await apiRequest('/health');
    setServerStatus(true);
  } catch (err) {
    setServerStatus(false);
  }
}

function initNav() {
  const toggle = $('#nav-toggle');
  const nav = $('#main-nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  Menu.init();
  Cart.init();
  Forms.init();
  initNav();
  checkServer();
  setInterval(checkServer, 8000);
});
