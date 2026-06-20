const API_BASE = '/api/v1';

// ── State ──
let allProducts = [];
let allCategories = [];
let activeCategory = null;
let searchQuery = '';
let viewMode = 'grid';
let editingProduct = null;
let selectedImageFile = null;
let isSubmitting = false;

// ── Formatter ──
const rupiahFormatter = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const parseRupiah = (str) => {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
};

// ── Stock Status (spec API: ok / low / critical / out) ──
const stockStatus = (stock, minimum) => {
  if (stock <= 0) {
    return { label: 'Habis', cls: 'dot-habis', labelCls: 'lbl-habis' };
  }
  if (stock <= minimum / 2 || stock === 0) {
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
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.25 15C1.8375 15 1.48438 14.8531 1.19062 14.5594C0.896875 14.2656 0.75 13.9125 0.75 13.5V5.04375C0.525 4.90625 0.34375 4.72813 0.20625 4.50938C0.06875 4.29063 0 4.0375 0 3.75V1.5C0 1.0875 0.146875 0.734375 0.440625 0.440625C0.734375 0.146875 1.0875 0 1.5 0H13.5C13.9125 0 14.2656 0.146875 14.5594 0.440625C14.8531 0.734375 15 1.0875 15 1.5V3.75C15 4.0375 14.9312 4.29063 14.7937 4.50938C14.6562 4.72813 14.475 4.90625 14.25 5.04375V13.5C14.25 13.9125 14.1031 14.2656 13.8094 14.5594C13.5156 14.8531 13.1625 15 12.75 15H2.25ZM2.25 5.25V13.5H12.75V5.25H2.25ZM1.5 3.75H13.5V1.5H1.5V3.75ZM5.25 9H9.75V7.5H5.25V9Z" fill="#595F67"/></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 17 15" fill="none"><path d="M0 14.25L8.25 0L16.5 14.25H0ZM2.5875 12.75H13.9125L8.25 3L2.5875 12.75ZM8.25 12C8.4625 12 8.64062 11.9281 8.78438 11.7844C8.92813 11.6406 9 11.4625 9 11.25C9 11.0375 8.92813 10.8594 8.78438 10.7156C8.64062 10.5719 8.4625 10.5 8.25 10.5C8.0375 10.5 7.85938 10.5719 7.71562 10.7156C7.57187 10.8594 7.5 11.0375 7.5 11.25C7.5 11.4625 7.57187 11.6406 7.71562 11.7844C7.85938 11.9281 8.0375 12 8.25 12ZM7.5 9.75H9V6H7.5V9.75Z" fill="#BA1A1A"/></svg>`;
};

// ── Unit Label ──
const unitLabel = (stock, unit) => `${stock} ${unit ?? 'Pcs'}`;

// ── Render: Grid Card ──
const renderGridCard = (p) => {
  const status = stockStatus(p.stock, p.minimum_stock);
  const isCritical = p.stock <= p.minimum_stock;
  const imgContent = p.image_url
    ? `<img src="${p.image_url}" alt="${p.name}" class="prod-img" loading="lazy" />`
    : `<div class="prod-img-placeholder">
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M37.3333 53.3333C32.8889 53.3333 29.1111 51.7778 26 48.6667C22.8889 45.5556 21.3333 41.7778 21.3333 37.3333C21.3333 32.8889 22.8889 29.1111 26 26C29.1111 22.8889 32.8889 21.3333 37.3333 21.3333C41.7778 21.3333 45.5556 22.8889 48.6667 26C51.7778 29.1111 53.3333 32.8889 53.3333 37.3333C53.3333 41.7778 51.7778 45.5556 48.6667 48.6667C45.5556 51.7778 41.7778 53.3333 37.3333 53.3333ZM37.3333 48C40.2667 48 42.7778 46.9556 44.8667 44.8667C46.9556 42.7778 48 40.2667 48 37.3333C48 34.4 46.9556 31.8889 44.8667 29.8C42.7778 27.7111 40.2667 26.6667 37.3333 26.6667C34.4 26.6667 31.8889 27.7111 29.8 29.8C27.7111 31.8889 26.6667 34.4 26.6667 37.3333C26.6667 40.2667 27.7111 42.7778 29.8 44.8667C31.8889 46.9556 34.4 48 37.3333 48ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V22.4C0 22.0444 0.0333333 21.6889 0.1 21.3333C0.166667 20.9778 0.266667 20.6222 0.4 20.2667L5.73333 8H5.33333C4.57778 8 3.94444 7.74444 3.43333 7.23333C2.92222 6.72222 2.66667 6.08889 2.66667 5.33333V2.66667C2.66667 1.91111 2.92222 1.27778 3.43333 0.766667C3.94444 0.255556 4.57778 0 5.33333 0H24C24.7556 0 25.3889 0.255556 25.9 0.766667C26.4111 1.27778 26.6667 1.91111 26.6667 2.66667V5.33333C26.6667 6.08889 26.4111 6.72222 25.9 7.23333C25.3889 7.74444 24.7556 8 24 8H23.6L28 18.1333C27.1556 18.5778 26.3556 19.0444 25.6 19.5333C24.8444 20.0222 24.1333 20.5778 23.4667 21.2L17.8667 8H11.4667L5.33333 22.4V42.6667H16.6667C16.8889 43.6 17.1889 44.5222 17.5667 45.4333C17.9444 46.3444 18.4 47.2 18.9333 48H5.33333ZM37.3333 18.6667C35.4667 18.6667 33.8889 18.0222 32.6 16.7333C31.3111 15.4444 30.6667 13.8667 30.6667 12C30.6667 10.1333 31.3111 8.55556 32.6 7.26667C33.8889 5.97778 35.4667 5.33333 37.3333 5.33333V18.6667C37.3333 16.8 37.9778 15.2222 39.2667 13.9333C40.5556 12.6444 42.1333 12 44 12C45.8667 12 47.4444 12.6444 48.7333 13.9333C50.0222 15.2222 50.6667 16.8 50.6667 18.6667H37.3333Z" fill="#595F67" fill-opacity="0.3"/>
        </svg>
      </div>
      `;

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
    : `<div class="list-prod-img-placeholder">
        <svg width="30" height="30" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M37.3333 53.3333C32.8889 53.3333 29.1111 51.7778 26 48.6667C22.8889 45.5556 21.3333 41.7778 21.3333 37.3333C21.3333 32.8889 22.8889 29.1111 26 26C29.1111 22.8889 32.8889 21.3333 37.3333 21.3333C41.7778 21.3333 45.5556 22.8889 48.6667 26C51.7778 29.1111 53.3333 32.8889 53.3333 37.3333C53.3333 41.7778 51.7778 45.5556 48.6667 48.6667C45.5556 51.7778 41.7778 53.3333 37.3333 53.3333ZM37.3333 48C40.2667 48 42.7778 46.9556 44.8667 44.8667C46.9556 42.7778 48 40.2667 48 37.3333C48 34.4 46.9556 31.8889 44.8667 29.8C42.7778 27.7111 40.2667 26.6667 37.3333 26.6667C34.4 26.6667 31.8889 27.7111 29.8 29.8C27.7111 31.8889 26.6667 34.4 26.6667 37.3333C26.6667 40.2667 27.7111 42.7778 29.8 44.8667C31.8889 46.9556 34.4 48 37.3333 48ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V22.4C0 22.0444 0.0333333 21.6889 0.1 21.3333C0.166667 20.9778 0.266667 20.6222 0.4 20.2667L5.73333 8H5.33333C4.57778 8 3.94444 7.74444 3.43333 7.23333C2.92222 6.72222 2.66667 6.08889 2.66667 5.33333V2.66667C2.66667 1.91111 2.92222 1.27778 3.43333 0.766667C3.94444 0.255556 4.57778 0 5.33333 0H24C24.7556 0 25.3889 0.255556 25.9 0.766667C26.4111 1.27778 26.6667 1.91111 26.6667 2.66667V5.33333C26.6667 6.08889 26.4111 6.72222 25.9 7.23333C25.3889 7.74444 24.7556 8 24 8H23.6L28 18.1333C27.1556 18.5778 26.3556 19.0444 25.6 19.5333C24.8444 20.0222 24.1333 20.5778 23.4667 21.2L17.8667 8H11.4667L5.33333 22.4V42.6667H16.6667C16.8889 43.6 17.1889 44.5222 17.5667 45.4333C17.9444 46.3444 18.4 47.2 18.9333 48H5.33333ZM37.3333 18.6667C35.4667 18.6667 33.8889 18.0222 32.6 16.7333C31.3111 15.4444 30.6667 13.8667 30.6667 12C30.6667 10.1333 31.3111 8.55556 32.6 7.26667C33.8889 5.97778 35.4667 5.33333 37.3333 5.33333V18.6667C37.3333 16.8 37.9778 15.2222 39.2667 13.9333C40.5556 12.6444 42.1333 12 44 12C45.8667 12 47.4444 12.6444 48.7333 13.9333C50.0222 15.2222 50.6667 16.8 50.6667 18.6667H37.3333Z" fill="#595F67" fill-opacity="0.3"/>
        </svg>
       </div>
      `;

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
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 18 18" fill="none"><path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#595F67"></path></svg>
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
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));
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

  grid.querySelectorAll('.prod-card, .prod-list-row').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      const id = Number(card.dataset.id);
      const product = allProducts.find((p) => p.id === id);
      if (product) openProductModal(product);
    });
  });
};

// ── Categories Dropdown ──
let dropdownOpen = false;

const buildDropdown = () => {
  document.querySelector('.cat-dropdown')?.remove();

  const dropdown = document.createElement('div');
  dropdown.className = 'cat-dropdown';

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

  allCategories.forEach((cat) => {
    const opt = document.createElement('div');
    opt.className = 'cat-option' + (activeCategory === cat.id ? ' active' : '');
    opt.innerHTML = `${cat.name} <span class="cat-count">${cat.product_count ?? 0}</span>`;
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

// ── Custom Select Dropdown ──
const initCustomSelect = (wrapper) => {
  const select = wrapper.querySelector('select');
  if (!select) return;

  const oldTrigger = wrapper.querySelector('.custom-select-trigger');
  const oldOptions = wrapper.querySelector('.custom-select-options');
  if (oldTrigger) oldTrigger.remove();
  if (oldOptions) oldOptions.remove();

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-select-trigger';

  const updateTriggerText = () => {
    const selectedOption = select.options[select.selectedIndex];
    trigger.textContent = selectedOption
      ? selectedOption.text
      : select.options[0]?.text || '';
    if (!select.value || selectedOption?.disabled) {
      trigger.classList.add('placeholder');
    } else {
      trigger.classList.remove('placeholder');
    }
  };

  // 🔥 PENTING: Update text SEKARANG
  updateTriggerText();
  wrapper.appendChild(trigger);

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'custom-select-options';

  Array.from(select.options).forEach((option) => {
    const optionEl = document.createElement('div');
    optionEl.className = 'custom-select-option';
    if (option.disabled) optionEl.classList.add('disabled');
    if (option.selected && !option.disabled) optionEl.classList.add('selected');
    optionEl.textContent = option.text;

    optionEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (option.disabled) return;

      select.value = option.value;
      optionsContainer
        .querySelectorAll('.custom-select-option')
        .forEach((o) => o.classList.remove('selected'));
      optionEl.classList.add('selected');
      updateTriggerText();
      closeCustomDropdown();
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    optionsContainer.appendChild(optionEl);
  });

  wrapper.appendChild(optionsContainer);

  const openCustomDropdown = () => {
    optionsContainer.classList.add('open');
    trigger.classList.add('open');
  };

  const closeCustomDropdown = () => {
    optionsContainer.classList.remove('open');
    trigger.classList.remove('open');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (optionsContainer.classList.contains('open')) {
      closeCustomDropdown();
    } else {
      document
        .querySelectorAll('.custom-select-options.open')
        .forEach((o) => o.classList.remove('open'));
      document
        .querySelectorAll('.custom-select-trigger.open')
        .forEach((t) => t.classList.remove('open'));
      openCustomDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      closeCustomDropdown();
    }
  });
};

// ── MODAL LOGIC ──
const resetModalForm = () => {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal('productName', '');
  setVal('productSku', '');
  setVal('productBarcode', '');
  setVal('purchasePrice', '');
  setVal('sellingPrice', '');
  setVal('initialStock', '0');
  setVal('minStock', '0');
  setVal('unitSelect', 'pcs');
  setVal('productWeight', '');
  setVal('categorySelect', '');

  const uploadArea = document.getElementById('uploadArea');
  const previewContainer = document.getElementById('previewContainer');
  const imageInput = document.getElementById('imageInput');
  const uploadError = document.getElementById('uploadError');

  if (uploadArea) uploadArea.style.display = 'block';
  if (previewContainer) previewContainer.style.display = 'none';
  if (imageInput) imageInput.value = '';
  if (uploadError) uploadError.style.display = 'none';

  selectedImageFile = null;
};

const openProductModal = (product = null) => {
  editingProduct = product;
  const modal = document.getElementById('productModal');
  const title = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitProductBtn');

  resetModalForm();

  // Isi dropdown kategori
  const catSelect = document.getElementById('categorySelect');
  catSelect.innerHTML =
    '<option value="">Pilih Kategori</option>' +
    allCategories
      .map((c) => `<option value="${c.id}">${c.name}</option>`)
      .join('');

  if (product) {
    title.textContent = 'Edit Produk';
    submitBtn.textContent = 'Perbarui';

    document.getElementById('productName').value = product.name || '';
    document.getElementById('productSku').value = product.sku || '';
    document.getElementById('productBarcode').value = product.barcode || '';
    document.getElementById('purchasePrice').value = rupiahFormatter(
      product.purchase_price
    );
    document.getElementById('sellingPrice').value = rupiahFormatter(
      product.selling_price
    );
    document.getElementById('initialStock').value = product.stock;
    document.getElementById('minStock').value = product.minimum_stock;
    document.getElementById('unitSelect').value = product.unit || 'pcs';
    document.getElementById('productWeight').value = product.weight ?? '';

    catSelect.value = product.category_id;

    if (product.image_url) {
      document.getElementById('imagePreview').src = product.image_url;
      document.getElementById('previewContainer').style.display = 'block';
      document.getElementById('uploadArea').style.display = 'none';
    }
  } else {
    title.textContent = 'Tambah Produk Baru';
    submitBtn.textContent = 'Simpan';
  }

  modal.style.display = 'flex';

  setTimeout(() => {
    const categoryWrapper = document.getElementById('categorySelectWrapper');
    if (categoryWrapper) initCustomSelect(categoryWrapper);

    const unitWrapper = document.getElementById('unitSelectWrapper');
    if (unitWrapper) initCustomSelect(unitWrapper);

    document.getElementById('productName')?.focus();
  }, 80);
};

const closeModal = () => {
  document.getElementById('productModal').style.display = 'none';
  editingProduct = null;
  resetModalForm();
};

// ── API Calls ──
const fetchProducts = async () => {
  const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Products API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
};

const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories/product-count`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Categories API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
};

// ── Submit Product ──
const submitProduct = async () => {
  if (isSubmitting) return;

  const productName = document.getElementById('productName').value.trim();
  const categoryId = document.getElementById('categorySelect').value;
  const sku = document.getElementById('productSku').value.trim();
  const barcode = document.getElementById('productBarcode').value.trim();
  const purchasePrice = parseRupiah(
    document.getElementById('purchasePrice').value
  );
  const sellingPrice = parseRupiah(
    document.getElementById('sellingPrice').value
  );
  const initialStock =
    parseInt(document.getElementById('initialStock').value) || 0;
  const minStock = parseInt(document.getElementById('minStock').value) || 0;
  const unit = document.getElementById('unitSelect').value;
  const weight =
    parseFloat(document.getElementById('productWeight').value) || null;

  if (!productName) return showToast('Nama produk wajib diisi', 'error');
  if (productName.length > 150)
    return showToast('Nama produk maksimal 150 karakter', 'error');
  if (!categoryId) return showToast('Kategori wajib dipilih', 'error');
  if (purchasePrice <= 0)
    return showToast('Harga beli harus lebih dari 0', 'error');
  if (sellingPrice <= 0)
    return showToast('Harga jual harus lebih dari 0', 'error');

  if (selectedImageFile && selectedImageFile.size > 4 * 1024 * 1024) {
    return showToast('Ukuran gambar maksimal 4MB', 'error');
  }

  isSubmitting = true;

  const submitBtn = document.getElementById('submitProductBtn');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Menyimpan...';

  const isEdit = !!editingProduct;

  try {
    if (isEdit && selectedImageFile) {
      const imageFormData = new FormData();

      imageFormData.append('image', selectedImageFile);

      const imageRes = await fetch(
        `${API_BASE}/products/${editingProduct.id}/image`,
        {
          method: 'PATCH',
          credentials: 'include',
          body: imageFormData,
        }
      );

      const imageJson = await imageRes.json();

      if (!imageJson.success)
        throw new Error(imageJson.message || 'Gagal mengunggah gambar');
    }

    const payload = {
      category_id: parseInt(categoryId),
      name: productName,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      stock: initialStock,
      minimum_stock: minStock,
      unit: unit,
    };

    if (sku) payload.sku = sku;
    if (barcode) payload.barcode = barcode;
    if (weight !== null && !isNaN(weight)) payload.weight = weight;

    if (isEdit) {
      const res = await fetch(`${API_BASE}/products/${editingProduct.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success)
        throw new Error(json.message || 'Gagal memperbarui produk');

      showToast('Produk berhasil diperbarui');
    } else {
      const formData = new FormData();

      formData.append('data', JSON.stringify(payload));

      if (selectedImageFile) formData.append('image', selectedImageFile);

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();

      if (!json.success)
        throw new Error(json.message || 'Gagal menambahkan produk');

      showToast('Produk baru berhasil ditambahkan');
    }

    closeModal();
    init();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? 'Perbarui' : 'Simpan';
  }
};

// ── Loading / Error UI ──
const showLoading = () => {
  const grid = document.querySelector('.prod-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-ico spin">
          <svg xmlns="http://www.w3.org/2000/svg" fill="#191c1e" width="42" height="42" viewBox="0 0 64 64"><path d="M50,16v-6h4c1.104,0,2-0.896,2-2V2c0-1.104-0.896-2-2-2H10C8.896,0,8,0.896,8,2v6c0,1.104,0.896,2,2,2h4v6c0,6.967,3.986,13.01,9.792,16C17.986,34.99,14,41.033,14,48v6h-4c-1.104,0-2,0.896-2,2v6c0,1.104,0.896,2,2,2h44c1.104,0,2-0.896,2-2v-6c0-1.104-0.896-2-2-2h-4v-6c0-6.967-3.986-13.01-9.792-16C46.014,29.01,50,22.967,50,16z M12,4h40v2H12V4z M52,60H12v-2h40V60z M46,48v6H18v-6c0-7.72,6.28-14,14-14S46,40.28,46,48z M32,30c-7.72,0-14-6.28-14-14v-6h28v6C46,23.72,39.72,30,32,30z"/></svg>
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
          <svg width="30" height="30" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 19L11 0L22 19H0ZM3.45 17H18.55L11 4L3.45 17ZM11 16C11.2833 16 11.5208 15.9042 11.7125 15.7125C11.9042 15.5208 12 15.2833 12 15C12 14.7167 11.9042 14.4792 11.7125 14.2875C11.5208 14.0958 11.2833 14 11 14C10.7167 14 10.4792 14.0958 10.2875 14.2875C10.0958 14.4792 10 14.7167 10 15C10 15.2833 10.0958 15.5208 10.2875 15.7125C10.4792 15.9042 10.7167 16 11 16ZM10 13H12V8H10V13Z" fill="#BA1A1A"></path></svg>
        </div>
        <div class="empty-title">Gagal memuat data</div>
        <div class="empty-desc">${msg}</div>
        <button class="btn-retry" onclick="init()">Coba lagi</button>
      </div>`;
  }
};

// ── Event Binding ──
const bindEvents = () => {
  const btnTambah = document.querySelector('.btn-tambah');
  if (btnTambah) btnTambah.addEventListener('click', () => openProductModal());

  const searchInput = document.querySelector('.search-input');
  if (searchInput)
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });

  const filterBtn = document.querySelector('.filter-btn');
  if (filterBtn)
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownOpen ? closeDropdown() : openDropdown();
    });

  document.addEventListener('click', (e) => {
    if (
      dropdownOpen &&
      !e.target.closest('.filter-btn') &&
      !e.target.closest('.cat-dropdown')
    )
      closeDropdown();
  });

  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      viewBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      viewMode = i === 0 ? 'grid' : 'list';
      renderProducts();
    });
  });

  document
    .getElementById('closeModalBtn')
    .addEventListener('click', closeModal);
  document
    .getElementById('cancelModalBtn')
    .addEventListener('click', closeModal);
  document
    .getElementById('submitProductBtn')
    .addEventListener('click', submitProduct);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') closeModal();
  });

  // Upload Image
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageInput');
  const previewContainer = document.getElementById('previewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImgBtn = document.getElementById('removeImgBtn');
  const uploadError = document.getElementById('uploadError');

  if (uploadArea)
    uploadArea.addEventListener('click', () => imageInput?.click());

  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (uploadError) uploadError.style.display = 'none';
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          if (uploadError) {
            uploadError.textContent =
              'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.';
            uploadError.style.display = 'block';
          }
          imageInput.value = '';
          return;
        }
        if (file.size > 4 * 1024 * 1024) {
          if (uploadError) {
            uploadError.textContent = 'Ukuran file maksimal 4MB.';
            uploadError.style.display = 'block';
          }
          imageInput.value = '';
          return;
        }
        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (imagePreview) imagePreview.src = ev.target.result;
          if (uploadArea) uploadArea.style.display = 'none';
          if (previewContainer) previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeImgBtn) {
    removeImgBtn.addEventListener('click', () => {
      if (imageInput) imageInput.value = '';
      selectedImageFile = null;
      if (previewContainer) previewContainer.style.display = 'none';
      if (uploadArea) uploadArea.style.display = 'block';
      if (uploadError) uploadError.style.display = 'none';
    });
  }

  ['purchasePrice', 'sellingPrice'].forEach((id) => {
    const input = document.getElementById(id);
    if (input)
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) e.target.value = rupiahFormatter(value);
      });
  });

  const generateSkuBtn = document.getElementById('generateSkuBtn');
  if (generateSkuBtn) {
    generateSkuBtn.addEventListener('click', () => {
      const name = document.getElementById('productName').value.trim();
      if (!name) return;
      document.getElementById('productSku').value =
        name.substring(0, 3).toUpperCase() +
        '-' +
        Math.random().toString(36).slice(2, 7).toUpperCase();
    });
  }
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
    showError(err.message || 'Terjadi kesalahan saat menghubungi server.');
  }
};

window.init = init;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
