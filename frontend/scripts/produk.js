const API_BASE = '/api/v1';

// ── State ──
let allProducts = [];
let allCategories = [];
let activeCategory = null;
let searchQuery = '';
let viewMode = 'grid'; // 'grid' | 'list'

// ── Formatter ──
const rupiahFormatter = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

// ── Stock Status (sesuai spec API: ok / low / critical / out) ──
const stockStatus = (stock, minimum) => {
  if (stock <= 0) {
    return { label: 'Habis', cls: 'dot-habis', labelCls: 'lbl-habis' };
  }
  if (stock <= minimum / 2) {
    return { label: 'Kritis', cls: 'dot-kritis', labelCls: 'lbl-kritis' };
  }
  if (stock <= minimum) {
    return { label: 'Menipis', cls: 'dot-sedang', labelCls: 'lbl-sedang' };
  }
  return { label: 'Aman', cls: 'dot-aman', labelCls: 'lbl-aman' };
};

// ── Stock Icon ──
const stockIcon = (stock, minimum) => {
  if (stock > minimum) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2.25 15C1.8375 15 1.48438 14.8531 1.19062 14.5594C0.896875 14.2656 0.75 13.9125 0.75 13.5V5.04375C0.525 4.90625 0.34375 4.72813 0.20625 4.50938C0.06875 4.29063 0 4.0375 0 3.75V1.5C0 1.0875 0.146875 0.734375 0.440625 0.440625C0.734375 0.146875 1.0875 0 1.5 0H13.5C13.9125 0 14.2656 0.146875 14.5594 0.440625C14.8531 0.734375 15 1.0875 15 1.5V3.75C15 4.0375 14.9312 4.29063 14.7937 4.50938C14.6562 4.72813 14.475 4.90625 14.25 5.04375V13.5C14.25 13.9125 14.1031 14.2656 13.8094 14.5594C13.5156 14.8531 13.1625 15 12.75 15H2.25ZM2.25 5.25V13.5H12.75V5.25H2.25ZM1.5 3.75H13.5V1.5H1.5V3.75ZM5.25 9H9.75V7.5H5.25V9Z" fill="#595F67"/>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 17 15" fill="none">
    <path d="M0 14.25L8.25 0L16.5 14.25H0ZM2.5875 12.75H13.9125L8.25 3L2.5875 12.75ZM8.25 12C8.4625 12 8.64062 11.9281 8.78438 11.7844C8.92813 11.6406 9 11.4625 9 11.25C9 11.0375 8.92813 10.8594 8.78438 10.7156C8.64062 10.5719 8.4625 10.5 8.25 10.5C8.0375 10.5 7.85938 10.5719 7.71562 10.7156C7.57187 10.8594 7.5 11.0375 7.5 11.25C7.5 11.4625 7.57187 11.6406 7.71562 11.7844C7.85938 11.9281 8.0375 12 8.25 12ZM7.5 9.75H9V6H7.5V9.75Z" fill="#BA1A1A"/>
  </svg>`;
};

// ── Unit Label ──
const unitLabel = (stock, unit) => `${stock} ${unit ?? 'Pcs'}`;

// ── Render: Grid Card ──
const renderGridCard = (p) => {
  const status = stockStatus(p.stock, p.minimum_stock);
  const isCritical = p.stock <= p.minimum_stock;
  const imgContent = p.image_url
    ? `<img src="${p.image_url}" alt="${p.name}" class="prod-img" loading="lazy" />`
    : `<div class="prod-img-placeholder">📦</div>`;

  return `
    <div class="prod-card" data-id="${p.id}">
      <div class="prod-img-wrap">
        ${imgContent}
        <span class="cat-tag">${p.category_name ?? '—'}</span>
      </div>
      <div class="prod-body">
        <div class="prod-name">${p.name}</div>
        ${p.sku ? `<div class="prod-sku">SKU: ${p.sku}</div>` : ''}
        <div class="price-row">
          <span class="price-label">Harga Beli</span>
          <span class="price-val-normal">${rupiahFormatter(p.purchase_price)}</span>
        </div>
        <div class="price-row">
          <span class="price-label">Harga Jual</span>
          <span class="price-val-jual">${rupiahFormatter(p.selling_price)}</span>
        </div>
      </div>
      <div class="prod-footer">
        <div class="stok-info">
          <span class="${isCritical ? 'warn-ico' : 'stok-ico'}">${stockIcon(p.stock, p.minimum_stock)}</span>
          <span class="stok-num" ${isCritical ? 'style="color:#e05252"' : ''}>${unitLabel(p.stock, p.unit)}</span>
        </div>
        <div class="status-dot">
          <span class="dot ${status.cls}"></span>
          <span class="${status.labelCls}">${status.label}</span>
        </div>
      </div>
    </div>`;
};

// ── Render: List Row ──
const renderListRow = (p) => {
  const status = stockStatus(p.stock, p.minimum_stock);
  const isCritical = p.stock <= p.minimum_stock;
  const imgContent = p.image_url
    ? `<img src="${p.image_url}" alt="${p.name}" class="list-prod-img" loading="lazy" />`
    : `<div class="list-prod-img-placeholder">📦</div>`;

  return `
    <div class="prod-list-row" data-id="${p.id}">
      <div class="list-img-wrap">${imgContent}</div>
      <div class="list-info">
        <div class="prod-name">${p.name}</div>
        ${p.sku ? `<div class="prod-sku">SKU: ${p.sku}</div>` : ''}
        <span class="cat-tag">${p.category_name ?? '—'}</span>
      </div>
      <div class="list-prices">
        <div class="price-row">
          <span class="price-label">Harga Beli</span>
          <span class="price-val-normal">${rupiahFormatter(p.purchase_price)}</span>
        </div>
        <div class="price-row">
          <span class="price-label">Harga Jual</span>
          <span class="price-val-jual">${rupiahFormatter(p.selling_price)}</span>
        </div>
      </div>
      <div class="list-stock">
        <div class="stok-info">
          <span class="${isCritical ? 'warn-ico' : 'stok-ico'}">${stockIcon(p.stock, p.minimum_stock)}</span>
          <span class="stok-num" ${isCritical ? 'style="color:#e05252"' : ''}>${unitLabel(p.stock, p.unit)}</span>
        </div>
        <div class="status-dot">
          <span class="dot ${status.cls}"></span>
          <span class="${status.labelCls}">${status.label}</span>
        </div>
      </div>
    </div>`;
};

// ── Render: Empty State ──
const renderEmpty = () => `
  <div class="empty-state">
    <div class="empty-ico">
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 18 18" fill="none">
        <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#595F67"></path>
      </svg>
    </div>
    <div class="empty-title">Produk tidak ditemukan</div>
    <div class="empty-desc">Coba ubah kata kunci pencarian atau pilih kategori lain.</div>
  </div>`;

// ── Filter & Render ──
const getFiltered = () => {
  const q = searchQuery.trim().toLowerCase();
  return allProducts.filter((p) => {
    const matchCat =
      activeCategory === null || p.category_id === activeCategory;
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });
};

const renderProducts = () => {
  const grid = document.querySelector('.prod-grid');
  if (!grid) return;

  const filtered = getFiltered();

  if (filtered.length === 0) {
    grid.innerHTML = renderEmpty();
    grid.className = 'prod-grid';
    return;
  }

  if (viewMode === 'list') {
    grid.className = 'prod-grid prod-list-view';
    grid.innerHTML = filtered.map(renderListRow).join('');
  } else {
    grid.className = 'prod-grid';
    grid.innerHTML = filtered.map(renderGridCard).join('');
  }
};

// ── Categories Dropdown ──
let dropdownOpen = false;

const buildDropdown = () => {
  document.querySelector('.cat-dropdown')?.remove();

  const dropdown = document.createElement('div');
  dropdown.className = 'cat-dropdown';

  // Opsi "Semua Kategori"
  const allOpt = document.createElement('div');
  allOpt.className = 'cat-option' + (activeCategory === null ? ' active' : '');
  allOpt.textContent = 'Semua Kategori';
  allOpt.addEventListener('click', () => {
    activeCategory = null;
    updateFilterBtn();
    renderProducts();
    closeDropdown();
  });
  dropdown.appendChild(allOpt);

  // Opsi per kategori
  allCategories.forEach((cat) => {
    const opt = document.createElement('div');
    opt.className = 'cat-option' + (activeCategory === cat.id ? ' active' : '');
    opt.innerHTML = `${cat.name} <span class="cat-count">${cat.product_count}</span>`;
    opt.addEventListener('click', () => {
      activeCategory = cat.id;
      updateFilterBtn();
      renderProducts();
      closeDropdown();
    });
    dropdown.appendChild(opt);
  });

  return dropdown;
};

const updateFilterBtn = () => {
  const btn = document.querySelector('.filter-btn');
  if (!btn) return;
  const cat = allCategories.find((c) => c.id === activeCategory);
  // Update teks tanpa hapus arrow SVG
  const textNode = btn.childNodes[0];
  if (textNode && textNode.nodeType === 3) {
    textNode.textContent = (cat ? cat.name : 'Semua Kategori') + ' ';
  }
};

const openDropdown = () => {
  const btn = document.querySelector('.filter-btn');
  if (!btn) return;
  const dropdown = buildDropdown();
  btn.style.position = 'relative';
  btn.appendChild(dropdown);
  dropdownOpen = true;
};

const closeDropdown = () => {
  document.querySelector('.cat-dropdown')?.remove();
  dropdownOpen = false;
};

// ── API Calls ──
const fetchProducts = async () => {
  const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Products API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
};

// Endpoint 4.2: /categories/product-count — mengembalikan { id, name, product_count }
const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories/product-count`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Categories API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
};

// ── Loading / Error UI ──
const showLoading = () => {
  const grid = document.querySelector('.prod-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-ico spin">
          <svg xmlns="http://www.w3.org/2000/svg" fill="#191c1e" width="42" height="42" viewBox="0 0 64 64">
            <path d="M50,16v-6h4c1.104,0,2-0.896,2-2V2c0-1.104-0.896-2-2-2H10C8.896,0,8,0.896,8,2v6c0,1.104,0.896,2,2,2h4v6c0,6.967,3.986,13.01,9.792,16C17.986,34.99,14,41.033,14,48v6h-4c-1.104,0-2,0.896-2,2v6c0,1.104,0.896,2,2,2h44c1.104,0,2-0.896,2-2v-6c0-1.104-0.896-2-2-2h-4v-6c0-6.967-3.986-13.01-9.792-16C46.014,29.01,50,22.967,50,16z M12,4h40v2H12V4z M52,60H12v-2h40V60z M46,48v6H18v-6c0-7.72,6.28-14,14-14S46,40.28,46,48z M32,30c-7.72,0-14-6.28-14-14v-6h28v6C46,23.72,39.72,30,32,30z"/>
          </svg>
        </div>
        <div class="empty-title">Memuat produk…</div>
      </div>`;
  }
};

const showError = (msg) => {
  const grid = document.querySelector('.prod-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-ico">
          <svg width="30" height="30" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 19L11 0L22 19H0ZM3.45 17H18.55L11 4L3.45 17ZM11 16C11.2833 16 11.5208 15.9042 11.7125 15.7125C11.9042 15.5208 12 15.2833 12 15C12 14.7167 11.9042 14.4792 11.7125 14.2875C11.5208 14.0958 11.2833 14 11 14C10.7167 14 10.4792 14.0958 10.2875 14.2875C10.0958 14.4792 10 14.7167 10 15C10 15.2833 10.0958 15.5208 10.2875 15.7125C10.4792 15.9042 10.7167 16 11 16ZM10 13H12V8H10V13Z" fill="#BA1A1A"></path>
          </svg>
        </div>
        <div class="empty-title">Gagal memuat data</div>
        <div class="empty-desc">${msg}</div>
        <button class="btn-retry" onclick="init()">Coba lagi</button>
      </div>`;
  }
};

// ── Event Binding ──
const bindEvents = () => {
  // Search
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Filter button dropdown
  const filterBtn = document.querySelector('.filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdownOpen) closeDropdown();
      else openDropdown();
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (
      dropdownOpen &&
      !e.target.closest('.filter-btn') &&
      !e.target.closest('.cat-dropdown')
    ) {
      closeDropdown();
    }
  });

  // View toggle (grid/list)
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      viewBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Update icon colors
      viewBtns.forEach((b) => {
        b.querySelectorAll('path').forEach((path) =>
          path.setAttribute('fill', '#595F67')
        );
      });
      btn
        .querySelectorAll('path')
        .forEach((path) => path.setAttribute('fill', '#006049'));

      viewMode = i === 0 ? 'grid' : 'list';
      renderProducts();
    });
  });
};

// ── Init ──
const init = async () => {
  bindEvents();
  showLoading();

  try {
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);
    allProducts = products;
    allCategories = categories;
    renderProducts();
  } catch (err) {
    console.error(err);
    showError(err.message || 'Terjadi kesalahan saat menghubungi server.');
  }
};

// Expose untuk tombol retry
window.init = init;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
