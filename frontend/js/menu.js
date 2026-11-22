// Menu: shows the items with pictures, filters by category, and lets you add new items.
// The menu lives in the browser (localStorage). Only orders go to the SQL backend.
const DEFAULT_MENU = [
  { id: 'd1',  name: 'Espresso',          price: 120, category: 'Coffee',  emoji: '\u2615',     color: '#4a3223', desc: 'A double shot with a thick golden crema.' },
  { id: 'd2',  name: 'Cappuccino',        price: 160, category: 'Coffee',  emoji: '\u2615',     color: '#7a5640', desc: 'Espresso, steamed milk and a cloud of foam.' },
  { id: 'd3',  name: 'Caramel Latte',     price: 190, category: 'Coffee',  emoji: '\uD83E\uDD64', color: '#a9794a', desc: 'Smooth latte with house-made caramel.' },
  { id: 'd4',  name: 'Cold Brew',         price: 180, category: 'Coffee',  emoji: '\uD83E\uDDCA', color: '#2b1d14', desc: 'Steeped for 18 hours, served over ice.' },
  { id: 'd5',  name: 'Matcha Latte',      price: 200, category: 'Tea',     emoji: '\uD83C\uDF75', color: '#4f7a58', desc: 'Ceremonial matcha whisked with oat milk.' },
  { id: 'd6',  name: 'Masala Chai',       price: 110, category: 'Tea',     emoji: '\uD83E\uDED6', color: '#8a5a36', desc: 'Strong tea simmered with ginger and cardamom.' },
  { id: 'd7',  name: 'Butter Croissant',  price: 130, category: 'Bakery',  emoji: '\uD83E\uDD50', color: '#b88a4f', desc: 'Flaky, golden and baked every morning.' },
  { id: 'd8',  name: 'Blueberry Muffin',  price: 120, category: 'Bakery',  emoji: '\uD83E\uDDC1', color: '#5b5a7a', desc: 'Soft crumb loaded with blueberries.' },
  { id: 'd9',  name: 'Avocado Toast',     price: 260, category: 'Brunch',  emoji: '\uD83E\uDD51', color: '#3f6b4a', desc: 'Sourdough, smashed avocado, chilli and lime.' },
  { id: 'd10', name: 'Paneer Sandwich',   price: 220, category: 'Brunch',  emoji: '\uD83E\uDD6A', color: '#8c6a3f', desc: 'Grilled paneer, mint chutney, toasted bread.' },
  { id: 'd11', name: 'Chocolate Brownie', price: 150, category: 'Dessert', emoji: '\uD83C\uDF6B', color: '#3a2519', desc: 'Dense, fudgy and served warm.' },
  { id: 'd12', name: 'Baked Cheesecake',  price: 240, category: 'Dessert', emoji: '\uD83C\uDF70', color: '#9c7a52', desc: 'Creamy slice on a buttery biscuit base.' }
];

const Menu = (() => {
  const STORAGE_KEY = 'gg_menu_v1';
  let items = [];
  let activeCategory = 'All';

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (err) { /* ignore */ }
    return DEFAULT_MENU.map((i) => ({ ...i }));
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (err) {
      return false;
    }
  }

  // A drawn picture used when an item has no image (or its link is broken).
  function placeholderImage(item) {
    const emoji = item.emoji || '\uD83C\uDF7D\uFE0F';
    const color = item.color || '#5a3e2b';
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + color + '"/><stop offset="1" stop-color="#1f3d2e"/></linearGradient></defs>' +
      '<rect width="400" height="300" fill="url(#g)"/>' +
      '<circle cx="200" cy="150" r="96" fill="#ffffff" fill-opacity="0.12"/>' +
      '<text x="200" y="185" font-size="110" text-anchor="middle">' + emoji + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function imageFor(item) {
    return item.image || placeholderImage(item);
  }

  function categories() {
    return ['All', ...new Set(items.map((i) => i.category))];
  }

  function renderChips() {
    const wrap = $('#category-chips');
    if (!categories().includes(activeCategory)) activeCategory = 'All';
    wrap.innerHTML = categories().map((c) =>
      '<button type="button" class="chip' + (c === activeCategory ? ' is-active' : '') + '" data-category="' + escapeHtml(c) + '" aria-pressed="' + (c === activeCategory) + '">' + escapeHtml(c) + '</button>'
    ).join('');
    $('#category-list').innerHTML = categories().filter((c) => c !== 'All')
      .map((c) => '<option value="' + escapeHtml(c) + '"></option>').join('');
  }

  function renderGrid() {
    const shown = items.filter((i) => activeCategory === 'All' || i.category === activeCategory);
    const grid = $('#menu-grid');
    if (!shown.length) {
      grid.innerHTML = '<p class="empty">Nothing in this category yet. Use "Add a menu item" to create something.</p>';
      return;
    }
    grid.innerHTML = shown.map((i) =>
      '<article class="dish">' +
        '<div class="dish-img"><img src="' + escapeHtml(imageFor(i)) + '" alt="' + escapeHtml(i.name) + '" loading="lazy" data-id="' + escapeHtml(i.id) + '"></div>' +
        '<div class="dish-body">' +
          '<span class="dish-cat">' + escapeHtml(i.category) + '</span>' +
          '<h3>' + escapeHtml(i.name) + '</h3>' +
          (i.desc ? '<p>' + escapeHtml(i.desc) + '</p>' : '') +
          '<div class="dish-foot">' +
            '<strong class="price">' + formatPrice(i.price) + '</strong>' +
            '<div class="dish-actions">' +
              (i.custom ? '<button type="button" class="link-btn" data-remove="' + escapeHtml(i.id) + '">Remove</button>' : '') +
              '<button type="button" class="btn btn-small btn-primary" data-add="' + escapeHtml(i.id) + '">Add to order</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    ).join('');

    // Broken image link? Fall back to the drawn picture.
    $$('img[data-id]', grid).forEach((img) => {
      img.addEventListener('error', () => {
        const item = items.find((i) => i.id === img.dataset.id);
        if (item) img.src = placeholderImage(item);
      }, { once: true });
    });
  }

  function render() {
    renderChips();
    renderGrid();
  }

  // Shrinks an uploaded picture so it fits comfortably in browser storage.
  function resizeImage(file, maxSize = 600) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read that file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('That file is not a valid image.'));
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleAdd(event) {
    event.preventDefault();
    clearError('add-error');

    const name = $('#add-name').value.trim();
    const price = Number($('#add-price').value);
    const category = $('#add-category').value.trim();
    const url = $('#add-image-url').value.trim();
    const file = $('#add-image-file').files[0];

    if (!name) return showError('add-error', 'Give the item a name.');
    if ($('#add-price').value === '' || !Number.isFinite(price) || price < 0) return showError('add-error', 'Enter a price of 0 or more.');
    if (!category) return showError('add-error', 'Choose or type a category.');

    let image = '';
    try {
      if (file) image = await resizeImage(file);
      else if (url) image = url;
    } catch (err) {
      return showError('add-error', err.message);
    }

    const newItem = { id: 'c' + Date.now(), name, price, category, image, custom: true };
    items.push(newItem);
    if (!save()) {
      items.pop();
      return showError('add-error', 'Browser storage is full. Try a smaller picture or an image link.');
    }

    activeCategory = category;
    render();
    $('#add-dialog').close();
    $('#add-form').reset();
    showToast(name + ' added to the menu.');
  }

  function init() {
    items = load();
    render();

    $('#category-chips').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-category]');
      if (!chip) return;
      activeCategory = chip.dataset.category;
      render();
    });

    $('#menu-grid').addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      const removeBtn = e.target.closest('[data-remove]');
      if (addBtn) {
        const item = items.find((i) => i.id === addBtn.dataset.add);
        if (item) Cart.add(item);
      }
      if (removeBtn) {
        items = items.filter((i) => i.id !== removeBtn.dataset.remove);
        save();
        render();
      }
    });

    $('#open-add').addEventListener('click', () => {
      clearError('add-error');
      $('#add-dialog').showModal();
      $('#add-name').focus();
    });
    $('#add-cancel').addEventListener('click', () => $('#add-dialog').close());
    $('#add-form').addEventListener('submit', handleAdd);
  }

  return { init };
})();
