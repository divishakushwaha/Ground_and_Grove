// Cart + placing an order. "Place order" sends the cart to the SQL backend (POST /api/orders).
const Cart = (() => {
  const STORAGE_KEY = 'gg_cart_v1';
  let lines = [];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) lines = saved;
    } catch (err) { /* ignore */ }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch (err) { /* ignore */ }
  }

  function total() {
    return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  }

  function count() {
    return lines.reduce((sum, l) => sum + l.qty, 0);
  }

  function render() {
    $('#cart-count').textContent = count();
    $('#cart-list').innerHTML = lines.map((l) =>
      '<li class="cart-line">' +
        '<div class="cart-line-info"><strong>' + escapeHtml(l.name) + '</strong><span>' + formatPrice(l.price) + ' each</span></div>' +
        '<div class="qty">' +
          '<button type="button" data-dec="' + escapeHtml(l.id) + '" aria-label="One less ' + escapeHtml(l.name) + '">&minus;</button>' +
          '<span>' + l.qty + '</span>' +
          '<button type="button" data-inc="' + escapeHtml(l.id) + '" aria-label="One more ' + escapeHtml(l.name) + '">+</button>' +
        '</div>' +
        '<span class="cart-line-total">' + formatPrice(l.price * l.qty) + '</span>' +
      '</li>'
    ).join('');
    $('#cart-total').textContent = formatPrice(total());
    $('#cart-empty').hidden = lines.length > 0;
    $('#order-form').hidden = lines.length === 0;
  }

  function open() {
    $('#overlay').hidden = false;
    const drawer = $('#cart-drawer');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    $('#cart-close').focus();
  }

  function close() {
    $('#overlay').hidden = true;
    const drawer = $('#cart-drawer');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function add(item) {
    const existing = lines.find((l) => l.id === item.id);
    if (existing) existing.qty += 1;
    else lines.push({ id: item.id, name: item.name, price: Number(item.price), qty: 1 });
    $('#order-success').hidden = true;
    save();
    render();
    showToast(item.name + ' added to your order.');
  }

  function change(id, delta) {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty < 1) lines = lines.filter((l) => l.id !== id);
    save();
    render();
  }

  async function placeOrder(event) {
    event.preventDefault();
    clearError('order-error');

    const form = event.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    if (!name) return showError('order-error', 'Enter your name.');
    if (!phone) return showError('order-error', 'Enter a phone number so we can reach you.');

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
      const result = await apiPost('/orders', {
        name,
        phone,
        orderType: form.orderType.value,
        notes: form.notes.value.trim(),
        items: lines.map((l) => ({ name: l.name, price: l.price, quantity: l.qty }))
      });

      lines = [];
      save();
      render();
      form.reset();

      const box = $('#order-success');
      box.innerHTML = '<strong>Order #' + result.id + ' received.</strong> Total ' + formatPrice(result.total) + '. We are on it, ' + escapeHtml(name) + '.';
      box.hidden = false;
      showToast('Order placed.');
    } catch (err) {
      showError('order-error', err.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Place order';
    }
  }

  function init() {
    load();
    render();
    $('#cart-toggle').addEventListener('click', open);
    $('#cart-close').addEventListener('click', close);
    $('#overlay').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    $('#cart-list').addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      if (inc) change(inc.dataset.inc, 1);
      if (dec) change(dec.dataset.dec, -1);
    });
    $('#order-form').addEventListener('submit', placeOrder);
  }

  return { init, add, open, close };
})();
