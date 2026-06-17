// ── State ──
let allPurchases = [];
let allSuppliers = [];
let allProducts = [];
let currentPage = 1;
let activeFilter = 'semua';
let searchQuery = '';
const PER_PAGE = 10;

let purchaseItems = [];
let currentDetailPurchase = null;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const paginationInfo = document.getElementById('pagination-info');
const paginationCtrl = document.getElementById('pagination-ctrl');
const searchInput = document.getElementById('search-input');
const filterBtn = document.getElementById('filter-btn');
const totalPurchasesEl = document.getElementById('total-purchases');
const totalUnpaidEl = document.getElementById('total-unpaid');
const totalSuppliersEl = document.getElementById('total-suppliers');

// Modal refs
const purchaseModal = document.getElementById('purchaseModal');
const detailModal = document.getElementById('detailModal');

// ── Formatter ──
const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const formatDate = (isoStr) => {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ── Toast ──
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Fetch Data ──
async function fetchPurchases() {
  try {
    const res = await fetch('/api/v1/purchases', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allPurchases = json.data || [];
    updateStats();
    renderAll();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat pembelian: ${err.message}</td></tr>`;
  }
}

async function fetchSuppliers() {
  try {
    const res = await fetch('/api/v1/suppliers', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allSuppliers = json.data || [];
    updateStats();
    populateSupplierSelect();
  } catch (err) {
    console.error('Error fetching suppliers:', err);
  }
}

async function fetchProducts() {
  try {
    const res = await fetch('/api/v1/products', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allProducts = json.data || [];
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

// ── Update Stats ──
function updateStats() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthPurchases = allPurchases.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalPurchase = monthPurchases.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const unpaid = allPurchases.filter((p) => p.status === 'unpaid');
  const totalUnpaid = unpaid.reduce((sum, p) => sum + Number(p.total || 0), 0);

  if (totalPurchasesEl) totalPurchasesEl.textContent = fmtRp(totalPurchase);
  if (totalUnpaidEl) totalUnpaidEl.textContent = fmtRp(totalUnpaid);
  if (totalSuppliersEl) totalSuppliersEl.textContent = allSuppliers.length;
}

// ── Populate Supplier Select ──
function populateSupplierSelect() {
  const select = document.getElementById('supplierSelect');
  if (!select) return;
  select.innerHTML =
    '<option value="">Pilih Supplier</option>' +
    allSuppliers
      .map((s) => `<option value="${s.id}">${s.name}</option>`)
      .join('');
}

// ── Filter & Search ──
function getFiltered() {
  const q = searchQuery.trim().toLowerCase();
  return allPurchases.filter((p) => {
    const matchStatus = activeFilter === 'semua' || p.status === activeFilter;
    const matchSearch =
      !q ||
      (p.receipt_number && p.receipt_number.toLowerCase().includes(q)) ||
      (p.supplier_name && p.supplier_name.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });
}

// ── Render All ──
function renderAll() {
  const data = getFiltered();
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PER_PAGE;
  const slice = data.slice(start, start + PER_PAGE);

  renderTable(slice);
  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages);
}

// ── Render Table ──
function renderTable(data) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Tidak ada pembelian ditemukan</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map((p) => {
      const badge =
        p.status === 'paid'
          ? '<span class="badge-lunas">Lunas</span>'
          : '<span class="badge-belum">Belum Lunas</span>';
      return `
      <tr data-id="${p.id}" style="cursor:pointer;">
        <td><span class="tgl-val">${formatDate(p.date)}</span></td>
        <td><span class="nota-val">${p.receipt_number || '—'}</span></td>
        <td><span class="supplier-name">${p.supplier_name || '—'}</span></td>
        <td class="center"><span class="total-val">${fmtRp(p.total)}</span></td>
        <td class="center">${badge}</td>
      </tr>`;
    })
    .join('');

  tableBody.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', async () => {
      const id = Number(row.dataset.id);
      try {
        const res = await fetch(`/api/v1/purchases/${id}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        openDetailModal(json.data);
      } catch (err) {
        showToast('Gagal memuat detail pembelian', 'error');
      }
    });
  });
}

// ── Pagination ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} pembelian`;
}

function renderPaginationCtrl(totalPages) {
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);

  let html = `<button class="page-btn nav-arrow" id="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  if (left > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (left > 2) html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
  }
  range.forEach((p) => {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  });
  if (right < totalPages) {
    if (right < totalPages - 1)
      html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }
  html += `<button class="page-btn nav-arrow" id="next-btn" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

  paginationCtrl.innerHTML = html;

  paginationCtrl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      renderAll();
    });
  });
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderAll();
    }
  });
  document.getElementById('next-btn')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderAll();
    }
  });
}

// ─────────────────────────────────────
// PURCHASE MODAL (TAMBAH)
// ─────────────────────────────────────
function openPurchaseModal() {
  purchaseItems = [];
  document.getElementById('purchaseDate').value = new Date()
    .toISOString()
    .slice(0, 10);
  document.getElementById('supplierSelect').value = '';
  document.getElementById('discountInput').value = '0';
  document.getElementById('taxInput').value = '0';
  document.getElementById('purchaseNote').value = '';
  document.getElementById('paymentStatusSelect').value = 'paid';
  document.getElementById('dueDateField').style.display = 'none';
  document.getElementById('dueDateInput').value = '';

  renderItemsList();
  updatePurchaseSummary();
  purchaseModal.style.display = 'flex';

  setTimeout(() => {
    document
      .querySelectorAll('.custom-select-wrapper')
      .forEach((wrapper) => initCustomSelect(wrapper));

    const due = new Date();
    due.setDate(due.getDate() + 30);
    document.getElementById('dueDateInput').value = due
      .toISOString()
      .slice(0, 10);
  }, 80);
}

function closePurchaseModal() {
  purchaseModal.style.display = 'none';
}

function renderItemsList() {
  const container = document.getElementById('itemsList');
  if (!purchaseItems.length) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa;">Belum ada barang. Klik "Tambah Barang".</td></tr>`;
    return;
  }
  container.innerHTML = purchaseItems
    .map(
      (item, idx) => `
    <tr>
      <td style="text-align:center;">${item.product_name}</td>
      <td>${item.sku || '—'}</td>
      <td>${fmtRp(item.purchase_price)}</td>
      <td>
        <div class="product-qty-wrap">
          <button class="btn-qty-icon btn-minus" data-index="${idx}">
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none"><path d="M0 1.33333V0H9.33333V1.33333H0Z" fill="#595F67"/></svg>
          </button>
          <span style="min-width:24px;text-align:center;font-weight:600;">${item.quantity}</span>
          <button class="btn-qty-icon btn-plus" data-index="${idx}">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M4 5.33333H0V4H4V0H5.33333V4H9.33333V5.33333H5.33333V9.33333H4V5.33333Z" fill="#595F67"/></svg>
          </button>
        </div>
      </td>
      <td style="text-align:left;font-weight:700;color:#006049;">${fmtRp(item.subtotal)}</td>
    </tr>`
    )
    .join('');

  container.querySelectorAll('.btn-minus').forEach((btn) => {
    btn.addEventListener('click', () =>
      updateItemQty(parseInt(btn.dataset.index), -1)
    );
  });
  container.querySelectorAll('.btn-plus').forEach((btn) => {
    btn.addEventListener('click', () =>
      updateItemQty(parseInt(btn.dataset.index), 1)
    );
  });
}

function updateItemQty(index, delta) {
  const item = purchaseItems[index];
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeItem(index);
    return;
  }
  item.subtotal = item.purchase_price * item.quantity;
  renderItemsList();
  updatePurchaseSummary();
}

function removeItem(index) {
  purchaseItems.splice(index, 1);
  renderItemsList();
  updatePurchaseSummary();
}

function updatePurchaseSummary() {
  const totalItems = new Set(purchaseItems.map((i) => i.product_id)).size;
  const totalQuantity = purchaseItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);
  const discount =
    parseInt(document.getElementById('discountInput')?.value || 0) || 0;
  const taxRate =
    parseInt(document.getElementById('taxInput')?.value || 0) || 0;
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + tax;

  document.getElementById('totalItems').textContent = `${totalItems} Jenis`;
  document.getElementById('totalQuantity').textContent = `${totalQuantity} Pcs`;
  document.getElementById('subtotalAmount').textContent = fmtRp(subtotal);
  document.getElementById('totalPurchase').textContent = fmtRp(total);
}

// ── Custom Select Dropdown ──
function initCustomSelect(wrapper) {
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
    if (!select.value || selectedOption?.disabled)
      trigger.classList.add('placeholder');
    else trigger.classList.remove('placeholder');
  };

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

      if (select.id === 'paymentStatusSelect') {
        const dueDateField = document.getElementById('dueDateField');
        if (dueDateField) {
          if (select.value === 'unpaid') {
            dueDateField.style.display = 'block';
          } else {
            dueDateField.style.display = 'none';
          }
        }
      }
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
    if (!wrapper.contains(e.target)) closeCustomDropdown();
  });
}

// ── Product Selector ──
function openProductSelector() {
  if (!allProducts.length) {
    showToast('Belum ada produk. Tambahkan di menu Produk.', 'error');
    return;
  }
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'productSelectorModal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="width:600px;max-height:80vh;overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
      <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #f0f0f5;">
        <h2 style="font-size:16px;font-weight:700;">Pilih Produk</h2>
        <button class="modal-close-btn" id="closeProductSelectorBtn" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
      </div>
      <div style="padding:20px 24px;">
        <input type="text" id="productSearchInput" class="form-input" placeholder="Cari produk..." style="margin-bottom:16px;width:100%;" />
        <div id="productListContainer" style="max-height:350px;overflow-y:auto;"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document
    .getElementById('closeProductSelectorBtn')
    .addEventListener('click', closeProductSelector);
  renderProductList(allProducts);
  document
    .getElementById('productSearchInput')
    .addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderProductList(
        allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.sku && p.sku.toLowerCase().includes(q))
        )
      );
    });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProductSelector();
  });
}

function renderProductList(products) {
  const container = document.getElementById('productListContainer');
  if (!container) return;
  if (!products.length) {
    container.innerHTML =
      '<div style="padding:20px;text-align:center;color:#aaa;">Produk tidak ditemukan</div>';
    return;
  }
  container.innerHTML = products
    .map(
      (p) => `
    <div class="product-select-item" data-id="${p.id}" style="padding:12px;border:1px solid #e0e3eb;border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:all 0.15s;background:#fff;">
      <div><div style="font-weight:600;">${p.name}</div><div style="font-size:11px;color:#888;">SKU: ${p.sku || '-'} | Stok: ${p.stock} ${p.unit || 'pcs'}</div></div>
      <div style="font-weight:700;color:#006049;">${fmtRp(p.purchase_price)}</div>
    </div>`
    )
    .join('');

  container.querySelectorAll('.product-select-item').forEach((item) => {
    item.addEventListener('click', () =>
      selectProduct(parseInt(item.dataset.id))
    );
    item.addEventListener('mouseenter', () => {
      item.style.background = '#f0faf5';
      item.style.borderColor = '#006049';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = '#fff';
      item.style.borderColor = '#e0e3eb';
    });
  });
}

function selectProduct(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;
  const existing = purchaseItems.find((i) => i.product_id === productId);
  if (existing) {
    existing.quantity++;
    existing.subtotal = existing.purchase_price * existing.quantity;
  } else {
    purchaseItems.push({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      purchase_price: product.purchase_price,
      quantity: 1,
      subtotal: product.purchase_price,
    });
  }
  renderItemsList();
  updatePurchaseSummary();
  closeProductSelector();
  showToast(`${product.name} ditambahkan`);
}

function closeProductSelector() {
  document.getElementById('productSelectorModal')?.remove();
}

// ── Submit Purchase ──
async function submitPurchase() {
  const supplierId = document.getElementById('supplierSelect').value;
  const date = document.getElementById('purchaseDate').value;
  const note = document.getElementById('purchaseNote').value;
  const paymentStatus = document.getElementById('paymentStatusSelect').value;

  if (!supplierId) return showToast('Pilih supplier terlebih dahulu', 'error');
  if (!date) return showToast('Tanggal wajib diisi', 'error');
  if (!purchaseItems.length)
    return showToast('Tambahkan minimal satu barang', 'error');

  const payload = {
    supplier_id: parseInt(supplierId),
    date: date,
    items: purchaseItems.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      purchase_price: i.purchase_price,
    })),
    note: note || null,
    payment_status: paymentStatus,
  };

  if (paymentStatus === 'unpaid') {
    const dueDate = document.getElementById('dueDateInput').value;

    if (!dueDate) return showToast('Tanggal jatuh tempo wajib diisi', 'error');

    payload.due_date = dueDate;
  } else {
    payload.due_date = null;
  }

  const btn = document.getElementById('submitPurchaseBtn');

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    const res = await fetch('/api/v1/purchases', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    const message =
      paymentStatus === 'paid'
        ? 'Pembelian tunai berhasil disimpan'
        : 'Pembelian hutang berhasil disimpan';

    showToast(message);

    closePurchaseModal();

    await fetchPurchases();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Pembelian';
  }
}

// ─────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────
function openDetailModal(purchase) {
  currentDetailPurchase = purchase;

  document.getElementById('detailModalSubtitle').textContent =
    purchase.receipt_number || '—';
  document.getElementById('detailReceiptNumber').textContent =
    purchase.receipt_number || '—';
  document.getElementById('detailDate').textContent = formatDate(purchase.date);

  const supplier = allSuppliers.find((s) => s.id === purchase.supplier_id);
  document.getElementById('detailSupplierName').textContent = supplier
    ? supplier.name
    : '—';

  const itemsBody = document.getElementById('detailItemsBody');
  if (purchase.items?.length) {
    itemsBody.innerHTML = purchase.items
      .map((item, idx) => {
        const product = allProducts.find((p) => p.id === item.product_id);
        const productName = product
          ? product.name
          : `Produk #${item.product_id}`;
        const sku = product ? product.sku : '—';
        const subtotal = item.purchase_price * item.quantity;
        return `<tr><td>${idx + 1}</td><td><strong>${productName}</strong><br><small style="color:#888;">SKU: ${sku}</small></td><td>${fmtRp(item.purchase_price)}</td><td>${item.quantity}</td><td>${fmtRp(subtotal)}</td></tr>`;
      })
      .join('');
  }

  const subtotal =
    purchase.items?.reduce(
      (sum, i) => sum + i.purchase_price * i.quantity,
      0
    ) || 0;
  const total = purchase.total || subtotal;
  const paid = purchase.status === 'paid' ? total : 0;
  const remaining = purchase.status === 'unpaid' ? total : 0;
  const totalItems = new Set(purchase.items.map((i) => i.product_id)).size;

  document.getElementById('detailTotalItems').textContent =
    `${purchase.items.length} barang (${totalItems} SKU)`;
  document.getElementById('detailSubtotal').textContent = fmtRp(subtotal);
  document.getElementById('detailTotal').textContent = fmtRp(total);
  document.getElementById('detailPaid').textContent = fmtRp(paid);
  document.getElementById('detailRemaining').textContent = fmtRp(remaining);

  const btnViewDebt = document.getElementById('btnViewDebt');
  btnViewDebt.style.display = purchase.status === 'unpaid' ? 'flex' : 'none';

  detailModal.style.display = 'flex';
}

function closeDetailModal() {
  detailModal.style.display = 'none';
}

// ── Confirm Modal ──
function openConfirmModal(purchase) {
  currentDetailPurchase = purchase;
  document.getElementById('confirmMessage').textContent =
    'Tandai pembelian ini sebagai lunas?';
  document.getElementById('confirmDetail').innerHTML = `
    <div class="confirm-row"><span>Supplier</span><strong>${purchase.supplier_name || '—'}</strong></div>
    <div class="confirm-row"><span>Nota</span><strong>${purchase.receipt_number || '—'}</strong></div>
    <div class="confirm-row"><span>Total</span><strong>${fmtRp(purchase.total)}</strong></div>`;
  document.getElementById('confirmModal').style.display = 'flex';
}

function closeConfirmModal() {
  document.getElementById('confirmModal').style.display = 'none';
  currentDetailPurchase = null;
}

async function submitConfirmPayment() {
  if (!currentDetailPurchase) return;
  const btn = document.getElementById('submitConfirmBtn');
  btn.disabled = true;
  btn.textContent = 'Memproses...';
  try {
    const res = await fetch(
      `/api/v1/purchases/${currentDetailPurchase.id}/paid`,
      { method: 'PATCH', credentials: 'include' }
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    showToast('Pembayaran berhasil dikonfirmasi!');
    closeConfirmModal();
    closeDetailModal();
    await fetchPurchases();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ya, Tandai Lunas';
  }
}

// ── Filter Dropdown ──
let dropdownOpen = false;
const FILTER_OPTIONS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'paid', label: 'Lunas' },
  { value: 'unpaid', label: 'Hutang Dagang' },
];

function buildDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'filter-dropdown';
  FILTER_OPTIONS.forEach((opt) => {
    const item = document.createElement('div');
    item.className =
      'filter-option' + (activeFilter === opt.value ? ' active' : '');
    item.textContent = opt.label;
    item.addEventListener('click', () => {
      activeFilter = opt.value;
      currentPage = 1;
      closeDropdown();
      renderAll();
    });
    dropdown.appendChild(item);
  });
  return dropdown;
}

function openDropdown() {
  const dropdown = buildDropdown();
  filterBtn.style.position = 'relative';
  filterBtn.appendChild(dropdown);
  dropdown.style.display = 'block';
  dropdownOpen = true;
}

function closeDropdown() {
  document.querySelector('.filter-dropdown')?.remove();
  dropdownOpen = false;
}

// ── Events ──
document
  .querySelector('.btn-primary')
  ?.addEventListener('click', openPurchaseModal);
document
  .getElementById('closePurchaseModal')
  ?.addEventListener('click', closePurchaseModal);
document
  .getElementById('cancelPurchaseBtn')
  ?.addEventListener('click', closePurchaseModal);
document
  .getElementById('submitPurchaseBtn')
  ?.addEventListener('click', submitPurchase);
document
  .getElementById('btnAddItem')
  ?.addEventListener('click', openProductSelector);
document
  .getElementById('discountInput')
  ?.addEventListener('input', updatePurchaseSummary);
document
  .getElementById('taxInput')
  ?.addEventListener('input', updatePurchaseSummary);
document
  .getElementById('closeDetailModal')
  ?.addEventListener('click', closeDetailModal);
document
  .getElementById('printDetailBtn')
  ?.addEventListener('click', () =>
    showToast('Fitur cetak sedang dikembangkan')
  );
document.getElementById('btnViewDebt')?.addEventListener('click', () => {
  if (currentDetailPurchase) {
    closeDetailModal();
    openConfirmModal(currentDetailPurchase);
  }
});
document
  .getElementById('cancelConfirmBtn')
  ?.addEventListener('click', closeConfirmModal);
document
  .getElementById('submitConfirmBtn')
  ?.addEventListener('click', submitConfirmPayment);
document.getElementById('confirmModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('confirmModal')) closeConfirmModal();
});

searchInput?.addEventListener('input', () => {
  searchQuery = searchInput.value;
  currentPage = 1;
  renderAll();
});

filterBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownOpen ? closeDropdown() : openDropdown();
});

document.addEventListener('click', (e) => {
  if (
    dropdownOpen &&
    !e.target.closest('.filter-dropdown') &&
    !e.target.closest('#filter-btn')
  )
    closeDropdown();
});

purchaseModal?.addEventListener('click', (e) => {
  if (e.target === purchaseModal) closePurchaseModal();
});
detailModal?.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetailModal();
});

// ── Init ──
Promise.all([fetchPurchases(), fetchSuppliers(), fetchProducts()]);
