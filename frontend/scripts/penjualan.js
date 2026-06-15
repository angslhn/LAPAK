const PPN_RATE = 0;

// ── State ──
let allProducts = [];
let cart = [];
let activeCategory = 'Semua Produk';
let selectedPaymentMethod = 'cash';
let customers = [];
let currentTotal = 0;

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

// ── FETCH CUSTOMERS ──
async function fetchCustomers() {
  try {
    const res = await fetch('/api/v1/customers', { credentials: 'include' });
    const json = await res.json();
    if (json.success) {
      customers = json.data;
    }
  } catch (err) {
    console.error('Gagal memuat pelanggan:', err);
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
  if (activeCategory !== 'Semua Produk')
    filtered = filtered.filter((p) => p.category_name === activeCategory);
  if (query)
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))
    );
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
        : `<span style="font-size:42px">
             <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M37.3333 53.3333C32.8889 53.3333 29.1111 51.7778 26 48.6667C22.8889 45.5556 21.3333 41.7778 21.3333 37.3333C21.3333 32.8889 22.8889 29.1111 26 26C29.1111 22.8889 32.8889 21.3333 37.3333 21.3333C41.7778 21.3333 45.5556 22.8889 48.6667 26C51.7778 29.1111 53.3333 32.8889 53.3333 37.3333C53.3333 41.7778 51.7778 45.5556 48.6667 48.6667C45.5556 51.7778 41.7778 53.3333 37.3333 53.3333ZM37.3333 48C40.2667 48 42.7778 46.9556 44.8667 44.8667C46.9556 42.7778 48 40.2667 48 37.3333C48 34.4 46.9556 31.8889 44.8667 29.8C42.7778 27.7111 40.2667 26.6667 37.3333 26.6667C34.4 26.6667 31.8889 27.7111 29.8 29.8C27.7111 31.8889 26.6667 34.4 26.6667 37.3333C26.6667 40.2667 27.7111 42.7778 29.8 44.8667C31.8889 46.9556 34.4 48 37.3333 48ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V22.4C0 22.0444 0.0333333 21.6889 0.1 21.3333C0.166667 20.9778 0.266667 20.6222 0.4 20.2667L5.73333 8H5.33333C4.57778 8 3.94444 7.74444 3.43333 7.23333C2.92222 6.72222 2.66667 6.08889 2.66667 5.33333V2.66667C2.66667 1.91111 2.92222 1.27778 3.43333 0.766667C3.94444 0.255556 4.57778 0 5.33333 0H24C24.7556 0 25.3889 0.255556 25.9 0.766667C26.4111 1.27778 26.6667 1.91111 26.6667 2.66667V5.33333C26.6667 6.08889 26.4111 6.72222 25.9 7.23333C25.3889 7.74444 24.7556 8 24 8H23.6L28 18.1333C27.1556 18.5778 26.3556 19.0444 25.6 19.5333C24.8444 20.0222 24.1333 20.5778 23.4667 21.2L17.8667 8H11.4667L5.33333 22.4V42.6667H16.6667C16.8889 43.6 17.1889 44.5222 17.5667 45.4333C17.9444 46.3444 18.4 47.2 18.9333 48H5.33333ZM37.3333 18.6667C35.4667 18.6667 33.8889 18.0222 32.6 16.7333C31.3111 15.4444 30.6667 13.8667 30.6667 12C30.6667 10.1333 31.3111 8.55556 32.6 7.26667C33.8889 5.97778 35.4667 5.33333 37.3333 5.33333V18.6667C37.3333 16.8 37.9778 15.2222 39.2667 13.9333C40.5556 12.6444 42.1333 12 44 12C45.8667 12 47.4444 12.6444 48.7333 13.9333C50.0222 15.2222 50.6667 16.8 50.6667 18.6667H37.3333Z" fill="#595F67" fill-opacity="0.3"/>
             </svg>
           </span>
          `;
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

  prodGrid
    .querySelectorAll('.add-btn')
    .forEach((btn) =>
      btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)))
    );
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
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill="none"><path d="M6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18C4 17.45 4.19583 16.9792 4.5875 16.5875C4.97917 16.1958 5.45 16 6 16C6.55 16 7.02083 16.1958 7.4125 16.5875C7.80417 16.9792 8 17.45 8 18C8 18.55 7.80417 19.0208 7.4125 19.4125C7.02083 19.8042 6.55 20 6 20ZM16 20C15.45 20 14.9792 19.8042 14.5875 19.4125C14.1958 19.0208 14 18.55 14 18C14 17.45 14.1958 16.9792 14.5875 16.5875C14.9792 16.1958 15.45 16 16 16C16.55 16 17.0208 16.1958 17.4125 16.5875C17.8042 16.9792 18 17.45 18 18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20ZM5.15 4L7.55 9H14.55L17.3 4H5.15ZM4.2 2H18.95C19.3333 2 19.625 2.17083 19.825 2.5125C20.025 2.85417 20.0333 3.2 19.85 3.55L16.3 9.95C16.1167 10.2833 15.8708 10.5417 15.5625 10.725C15.2542 10.9083 14.9167 11 14.55 11H7.1L6 13H18V15H6C5.25 15 4.68333 14.6708 4.3 14.0125C3.91667 13.3542 3.9 12.7 4.25 12.05L5.6 9.6L2 2H0V0H3.25L4.2 2ZM7.55 9H14.55H7.55Z" fill="#bbb"></path></svg>
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
  currentTotal = subtotal - diskon + pajak;

  elSubtotal.textContent = rupiahFormatter(subtotal);
  elDiskon.textContent = `- ${rupiahFormatter(diskon)}`;
  elPajak.textContent = rupiahFormatter(pajak);
  elTotal.textContent = rupiahFormatter(currentTotal);
}

// ── PAYMENT METHOD TOGGLE ──
function setPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.pay-btn').forEach((b) => {
    if (b.dataset.method === method) b.classList.add('active');
    else b.classList.remove('active');
  });
}

document.querySelectorAll('.pay-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    // Stop propagation biar gak nutup modal
    e.stopPropagation();
    const method = btn.dataset.method;
    if (!method) return;
    setPaymentMethod(method);

    // Jika modal terbuka, render ulang isi modal
    if (document.getElementById('paymentModal').style.display === 'flex') {
      renderModalBody();
    }
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

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── MODAL LOGIC ──
function openPaymentModal() {
  if (!cart.length) {
    showToast('Keranjang masih kosong', 'error');
    return;
  }

  const modal = document.getElementById('paymentModal');
  modal.style.display = 'flex';
  document.getElementById('modalTotalAmount').textContent =
    rupiahFormatter(currentTotal);

  // Pastikan tombol aktif sinkron
  document.querySelectorAll('.pay-btn').forEach((b) => {
    if (b.dataset.method === selectedPaymentMethod) b.classList.add('active');
    else b.classList.remove('active');
  });

  renderModalBody();
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

// ── CUSTOM SELECT (Dropdown Styling) ──
function initCustomSelect(wrapper) {
  const select = wrapper.querySelector('select');
  if (!select) return;

  // Hapus custom select lama kalo ada
  const oldTrigger = wrapper.querySelector('.custom-select-trigger');
  const oldOptions = wrapper.querySelector('.custom-select-options');
  if (oldTrigger) oldTrigger.remove();
  if (oldOptions) oldOptions.remove();

  // Buat trigger
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

  updateTriggerText();
  wrapper.appendChild(trigger);

  // Buat options container
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

      // Update selected state
      optionsContainer
        .querySelectorAll('.custom-select-option')
        .forEach((o) => o.classList.remove('selected'));
      optionEl.classList.add('selected');

      updateTriggerText();
      closeDropdown();

      // Trigger change event di select asli
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    optionsContainer.appendChild(optionEl);
  });

  wrapper.appendChild(optionsContainer);

  // Toggle dropdown
  const openDropdown = () => {
    optionsContainer.classList.add('open');
    trigger.classList.add('open');
  };

  const closeDropdown = () => {
    optionsContainer.classList.remove('open');
    trigger.classList.remove('open');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (optionsContainer.classList.contains('open')) {
      closeDropdown();
    } else {
      // Tutup semua dropdown lain dulu
      document
        .querySelectorAll('.custom-select-options.open')
        .forEach((o) => o.classList.remove('open'));
      document
        .querySelectorAll('.custom-select-trigger.open')
        .forEach((t) => t.classList.remove('open'));
      openDropdown();
    }
  });

  // Tutup dropdown kalo klik di luar
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      closeDropdown();
    }
  });
}

function renderModalBody() {
  const body = document.getElementById('modalBody');

  if (selectedPaymentMethod === 'cash') {
    body.innerHTML = `
      <div class="cash-section">
        <div class="cash-input-group">
          <label>Uang Diterima (Rp)</label>
          <input type="number" class="cash-input" id="cashReceivedInput" placeholder="0" min="0">
        </div>
        <div class="quick-cash-btns">
          <button class="quick-cash-btn" data-amount="50000">50.000</button>
          <button class="quick-cash-btn" data-amount="100000">100.000</button>
          <button class="quick-cash-btn" data-amount="150000">150.000</button>
          <button class="quick-cash-btn" data-amount="200000">200.000</button>
          <button class="quick-cash-btn" data-amount="250000">250.000</button>
          <button class="quick-cash-btn" data-amount="500000">500.000</button>
        </div>
        <div class="cash-change" id="cashChangeBox">
          <span>KEMBALIAN</span>
          <span id="cashChangeAmount">Rp0</span>
        </div>
      </div>`;

    const cashInput = document.getElementById('cashReceivedInput');
    const changeAmount = document.getElementById('cashChangeAmount');
    const changeBox = document.getElementById('cashChangeBox');

    const updateChange = () => {
      const received = Number(cashInput.value) || 0;
      const change = received - currentTotal;
      if (change < 0) {
        changeBox.classList.add('negative');
        changeAmount.textContent = `- ${rupiahFormatter(Math.abs(change))}`;
      } else {
        changeBox.classList.remove('negative');
        changeAmount.textContent = rupiahFormatter(change);
      }
    };

    cashInput.addEventListener('input', updateChange);
    body.querySelectorAll('.quick-cash-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cashInput.value = btn.dataset.amount;
        updateChange();
      });
    });

    // Auto focus ke input cash
    setTimeout(() => cashInput.focus(), 100);
  } else if (selectedPaymentMethod === 'qris') {
    body.innerHTML = `
      <div class="qris-section">
        <p style="font-size:13px;color:#666;font-weight:600;">SCAN DISINI</p>
        <div class="qris-placeholder"><span>QRIS PLACEHOLDER</span></div>
        <p style="font-size:12px;color:#888;">Pastikan pembayaran berhasil sebelum menyelesaikan transaksi.</p>
      </div>`;
  } else if (selectedPaymentMethod === 'transfer') {
    body.innerHTML = `
      <div class="transfer-section">
        <p>Silahkan Transfer Ke Rekening Dibawah Ini</p>
        <div class="bank-list">
          <div class="bank-item">
            <div class="bank-info"><span class="bank-name">BCA</span><span class="bank-account">240160121013</span><span class="bank-owner">a.n Berkah Djaya</span></div>
            <button class="copy-btn" data-copy="240160121013">Salin</button>
          </div>
          <div class="bank-item">
            <div class="bank-info"><span class="bank-name">Mandiri</span><span class="bank-account">901465977432</span><span class="bank-owner">a.n Berkah Djaya</span></div>
            <button class="copy-btn" data-copy="901465977432">Salin</button>
          </div>
          <div class="bank-item">
            <div class="bank-info"><span class="bank-name">BRI</span><span class="bank-account">25080774537</span><span class="bank-owner">a.n CV Berkah Djaya</span></div>
            <button class="copy-btn" data-copy="25080774537">Salin</button>
          </div>
        </div>
      </div>`;

    body.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Tersalin!';
        setTimeout(() => (btn.textContent = 'Salin'), 2000);
      });
    });
  } else if (selectedPaymentMethod === 'credit') {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    let customerOptions = '';
    if (customers.length === 0) {
      customerOptions =
        '<option value="" disabled>Belum ada pelanggan — tambahkan di halaman Pelanggan terlebih dahulu</option>';
    } else {
      customerOptions = customers
        .map(
          (c) =>
            `<option value="${c.id}">${c.name} ${c.phone ? `(${c.phone})` : ''}</option>`
        )
        .join('');
    }

    body.innerHTML = `
      <div class="piutang-form">
        <div class="form-group">
          <label>Nama Pelanggan*</label>
          <div class="custom-select-wrapper" id="customerSelectWrapper">
            <select class="form-select" id="customerSelect" required>
              <option value="">${customers.length === 0 ? 'Tidak ada pelanggan tersedia' : 'Pilih Pelanggan'}</option>
              ${customerOptions}
            </select>
          </div>
          ${
            customers.length === 0
              ? '<small style="color:#e05252;font-size:11px;margin-top:4px;display:block">Silakan tambahkan pelanggan terlebih dahulu di menu <a href="/pelanggan" style="color:#006049;font-weight:600;">Pelanggan</a> sebelum membuat transaksi piutang.</small>'
              : ''
          }
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal Piutang*</label>
            <input type="date" class="form-input" id="creditDate" value="${today}" required>
          </div>
          <div class="form-group">
            <label>Tanggal Jatuh Tempo*</label>
            <input type="date" class="form-input" id="dueDate" value="${dueDateStr}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Nominal Piutang*</label>
          <input type="text" class="form-input" value="${rupiahFormatter(currentTotal)}" readonly style="background:#f5f6fa;font-weight:700;color:#006049;">
        </div>
        <div class="form-group">
          <label>Catatan</label>
          <textarea class="form-textarea" id="creditNote" placeholder="Tambahkan keterangan opsional..."></textarea>
        </div>
      </div>`;

    // 🔥 Init custom select setelah render
    setTimeout(() => {
      const wrapper = document.getElementById('customerSelectWrapper');
      if (wrapper) initCustomSelect(wrapper);
    }, 50);

    // Disable submit kalo gak ada pelanggan
    const submitBtn = document.getElementById('submitTransactionBtn');
    if (customers.length === 0) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.title = 'Tambahkan pelanggan terlebih dahulu';
    } else {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.title = '';
    }
  } else {
    // Reset submit button untuk metode non-credit
    const submitBtn = document.getElementById('submitTransactionBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.title = '';
    }
  }
}

// ── SUBMIT TRANSAKSI ──
document
  .getElementById('submitTransactionBtn')
  .addEventListener('click', async (e) => {
    e.stopPropagation();

    const payload = {
      payment_method: selectedPaymentMethod,
      items: cart.map((c) => ({ product_id: c.product.id, quantity: c.qty })),
      discount: 0,
      tax: PPN_RATE,
    };

    if (selectedPaymentMethod === 'credit') {
      const customerSelect = document.getElementById('customerSelect');
      const dueDateInput = document.getElementById('dueDate');
      const noteInput = document.getElementById('creditNote');

      if (!customerSelect || !customerSelect.value)
        return showToast('Pilih pelanggan terlebih dahulu', 'error');
      if (!dueDateInput || !dueDateInput.value)
        return showToast('Tanggal jatuh tempo wajib diisi', 'error');

      payload.customer_id = Number(customerSelect.value);
      payload.due_date = dueDateInput.value;
      if (noteInput && noteInput.value) payload.note = noteInput.value;
    }

    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Transaksi Berhasil Disimpan');
        closePaymentModal();
        clearCart();
        fetchProducts();
      } else {
        showToast(json.message || 'Gagal memproses transaksi', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan pada server', 'error');
    }
  });

// ── EVENT LISTENERS TOMBOL PROSES & MODAL ──
document.querySelector('.btn-proses').addEventListener('click', (e) => {
  e.stopPropagation();
  openPaymentModal();
});

document.getElementById('closeModalBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  closePaymentModal();
});

// FIX: Tutup modal hanya kalau klik OVERLAY (bukan isi modal)
document.getElementById('paymentModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('paymentModal')) {
    closePaymentModal();
  }
});

// ── INIT ──
fetchProducts();
fetchCustomers(); // Fetch pelanggan pas inisialisasi
renderCart();
