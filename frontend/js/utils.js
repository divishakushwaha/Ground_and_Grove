// Small helpers shared by every script.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatPrice(n) {
  const num = Number(n);
  return '\u20B9' + (Number.isInteger(num) ? num : num.toFixed(2));
}

let toastTimer;
function showToast(message, type = 'ok') {
  const el = $('#toast');
  el.textContent = message;
  el.className = 'toast toast-' + type;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
}

function showError(id, message) {
  const el = $('#' + id);
  el.textContent = message;
  el.hidden = false;
}

function clearError(id) {
  const el = $('#' + id);
  el.textContent = '';
  el.hidden = true;
}
