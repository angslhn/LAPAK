const PPN_RATE = 0.11;

// ── State ──
let allProducts = [];
let cart = [];
let activeCategory = 'Semua Produk';

// ── DOM refs ──
const prodGrid = document.querySelector('.prod-grid');
const catRow = document.querySelector('.cat-row');
const orderItems = document.querySelector('.order-items');
const kosongkanBtn = document.querySelector('.kosongkan-btn');
const searchInput = document.querySelector('.search-input');

const elSubtotal = document.querySelector('.sum-row:nth-child(1) .sum-val');
const elDiskon = document.querySelector('.sum-row:nth-child(2) .sum-val');
const elPajak = document.querySelector('.sum-row:nth-child(3) .sum-val');
const elTotal = document.querySelector('.total-val');

// ── FETCH PRODUK ──
async function fetchProducts() {
  try {
    const res = await fetch('/api/v1/products', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allProducts = json.data;
    buildCategoryPills();
    filterAndRender();
  } catch (err) {
    prodGrid.innerHTML = `<p style="color:#e05252;grid-column:1/-1;padding:12px">Gagal memuat produk: ${err.message}</p>`;
  }
}

// ── TANGGAL SAAT INI ──
function getLocalDate() {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

document.getElementById('date').textContent = getLocalDate();

// ── CATEGORY PILLS ──
function buildCategoryPills() {
  const categories = [
    'Semua Produk',
    ...new Set(allProducts.map((p) => p.category_name)),
  ];
  catRow.innerHTML = '';
  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill' + (cat === 'Semua Produk' ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.cat-pill')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = cat;
      filterAndRender();
    });
    catRow.appendChild(btn);
  });
}

// ── FILTER + RENDER GRID ──
function filterAndRender() {
  const query = searchInput.value.toLowerCase().trim();
  let filtered = allProducts;
  if (activeCategory !== 'Semua Produk') {
    filtered = filtered.filter((p) => p.category_name === activeCategory);
  }
  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))
    );
  }
  renderGrid(filtered);
}

function renderGrid(products) {
  if (!products.length) {
    prodGrid.innerHTML = `<p style="color:#aaa;grid-column:1/-1;padding:12px;text-align:center">Produk tidak ditemukan</p>`;
    return;
  }
  prodGrid.innerHTML = products
    .map((p) => {
      const isLow = p.stock <= p.minimum_stock;
      const badgeCls = isLow ? 'stok-badge low' : 'stok-badge';
      const imgEl = p.image_url
        ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />`
        : `<span style="font-size:42px">📦</span>`;
      return `
      <div class="prod-card" data-id="${p.id}">
        <span class="${badgeCls}">STOK: ${p.stock}</span>
        <div class="prod-img-wrap">${imgEl}</div>
        <div class="prod-info">
          <div class="prod-name">${p.name}</div>
          <div class="prod-footer">
            <span class="prod-price">${rupiahFormatter(p.selling_price)}</span>
            <button class="add-btn" data-id="${p.id}">+</button>
          </div>
        </div>
      </div>`;
    })
    .join('');
  prodGrid.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
  });
}

// ── CART LOGIC ──
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((c) => c.product.id === productId);
  if (existing) {
    if (existing.qty >= product.stock) return;
    existing.qty++;
  } else {
    if (product.stock === 0) return;
    cart.push({ product, qty: 1 });
  }
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((c) => c.product.id !== productId);
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find((c) => c.product.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  if (item.qty > item.product.stock) item.qty = item.product.stock;
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

// ── RENDER CART ──
function renderCart() {
  if (!cart.length) {
    orderItems.innerHTML = `
      <div style="text-align:center;padding:32px 16px;color:#bbb;font-size:13px">
        <div style="font-size:32px;margin-bottom:8px">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill="none">
            <path d="M6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18C4 17.45 4.19583 16.9792 4.5875 16.5875C4.97917 16.1958 5.45 16 6 16C6.55 16 7.02083 16.1958 7.4125 16.5875C7.80417 16.9792 8 17.45 8 18C8 18.55 7.80417 19.0208 7.4125 19.4125C7.02083 19.8042 6.55 20 6 20ZM16 20C15.45 20 14.9792 19.8042 14.5875 19.4125C14.1958 19.0208 14 18.55 14 18C14 17.45 14.1958 16.9792 14.5875 16.5875C14.9792 16.1958 15.45 16 16 16C16.55 16 17.0208 16.1958 17.4125 16.5875C17.8042 16.9792 18 17.45 18 18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20ZM5.15 4L7.55 9H14.55L17.3 4H5.15ZM4.2 2H18.95C19.3333 2 19.625 2.17083 19.825 2.5125C20.025 2.85417 20.0333 3.2 19.85 3.55L16.3 9.95C16.1167 10.2833 15.8708 10.5417 15.5625 10.725C15.2542 10.9083 14.9167 11 14.55 11H7.1L6 13H18V15H6C5.25 15 4.68333 14.6708 4.3 14.0125C3.91667 13.3542 3.9 12.7 4.25 12.05L5.6 9.6L2 2H0V0H3.25L4.2 2ZM7.55 9H14.55H7.55Z" fill="#bbb"></path>
          </svg>
        </div>
        Belum ada produk dipilih
      </div>`;
    updateSummary(0);
    return;
  }
  orderItems.innerHTML = cart
    .map(
      ({ product, qty }) => `
    <div class="order-item" data-id="${product.id}">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div class="item-name">${product.name}</div>
        <button class="remove-btn" data-id="${product.id}" style="background:none;border:none;color:#ccc;cursor:pointer;font-size:16px;line-height:1;padding:0 0 0 8px">×</button>
      </div>
      <div class="item-price-unit">${rupiahFormatter(product.selling_price)}</div>
      <div class="item-row">
        <div class="qty-ctrl">
          <button class="qty-btn qty-minus" data-id="${product.id}">−</button>
          <span class="qty-val">${qty}</span>
          <button class="qty-btn qty-plus" data-id="${product.id}">+</button>
        </div>
        <span class="item-subtotal">${rupiahFormatter(product.selling_price * qty)}</span>
      </div>
    </div>`
    )
    .join('');
  orderItems
    .querySelectorAll('.qty-minus')
    .forEach((btn) =>
      btn.addEventListener('click', () => updateQty(Number(btn.dataset.id), -1))
    );
  orderItems
    .querySelectorAll('.qty-plus')
    .forEach((btn) =>
      btn.addEventListener('click', () => updateQty(Number(btn.dataset.id), +1))
    );
  orderItems
    .querySelectorAll('.remove-btn')
    .forEach((btn) =>
      btn.addEventListener('click', () =>
        removeFromCart(Number(btn.dataset.id))
      )
    );
  const subtotal = cart.reduce(
    (sum, { product, qty }) => sum + product.selling_price * qty,
    0
  );
  updateSummary(subtotal);
}

// ── UPDATE SUMMARY ──
function updateSummary(subtotal) {
  const diskon = 0;
  const pajak = Math.round((subtotal - diskon) * PPN_RATE);
  const total = subtotal - diskon + pajak;
  elSubtotal.textContent = rupiahFormatter(subtotal);
  elDiskon.textContent = `- ${rupiahFormatter(diskon)}`;
  elPajak.textContent = rupiahFormatter(pajak);
  elTotal.textContent = rupiahFormatter(total);
}

// ── PAYMENT METHOD TOGGLE ──
document.querySelectorAll('.pay-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.pay-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── KOSONGKAN ──
kosongkanBtn.addEventListener('click', () => {
  if (!cart.length) return;
  if (confirm('Kosongkan semua pesanan?')) clearCart();
});

// ── SEARCH ──
searchInput.addEventListener('input', filterAndRender);

// ── UTILS ──
function rupiahFormatter(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// ── INIT ──
fetchProducts();
renderCart();
