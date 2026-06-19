// ── State ──
let currentTab = 'current';
let stockData = null;
let isSubmitting = false;
let currentPage = 1;
const PER_PAGE = 10;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const tableTitle = document.getElementById('table-title');
const headStock = document.getElementById('table-head-stock');
const headHistory = document.getElementById('table-head-history');
const totalProductEl = document.getElementById('total-product');
const lowStockEl = document.getElementById('low-stock');
const criticalStockEl = document.getElementById('critical-stock');
const tabItems = document.querySelectorAll('.tab-item');

// Modal refs
const stockModal = document.getElementById('stockModal');
const stockProductInput = document.getElementById('stockProductInput');
const stockProductDatalist = document.getElementById('stock-product-datalist');
const stockQuantityInput = document.getElementById('stockQuantity');
const stockNoteInput = document.getElementById('stockNote');
const submitStockBtn = document.getElementById('submitStockBtn');

// ── Loading state ──
function showLoading(message = 'Memuat data...') {
  tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#aaa">${message}</td></tr>`;
}

// ── Fetch Stock Saat Ini ──
async function fetchStock() {
  showLoading('Memuat data stok...');
  try {
    const res = await fetch('/api/v1/stock', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    stockData = json.data;
    renderSummary(stockData.summary_metrics);
    if (currentTab === 'current') {
      renderStockTable(stockData.stock_items);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat stok: ${err.message}</td></tr>`;
  }
}

function renderPaginationInfo(from, to, total) {
  const infoEl = document.getElementById('stock-pagination-info');
  if (infoEl) infoEl.textContent = `Menampilkan ${from}–${to} dari ${total}`;
}

function renderPaginationCtrl(totalPages, onPageChange) {
  const ctrl = document.getElementById('stock-pagination-ctrl');

  if (!ctrl) return;

  if (totalPages <= 1) {
    ctrl.innerHTML = '';
    return;
  }

  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);

  let html = `<button class="page-btn nav-arrow" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
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
  html += `<button class="page-btn nav-arrow" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

  ctrl.innerHTML = html;
  ctrl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.page;
      if (p === 'prev') onPageChange(currentPage - 1);
      else if (p === 'next') onPageChange(currentPage + 1);
      else onPageChange(Number(p));
    });
  });
}

// ── Fetch Riwayat Mutasi ──
async function fetchMutations() {
  showLoading('Memuat riwayat mutasi...');
  try {
    const res = await fetch('/api/v1/stock/mutations', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderMutationTable(json.data);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat riwayat: ${err.message}</td></tr>`;
  }
}

// ── Render Summary Metrics ──
function renderSummary(metrics) {
  if (totalProductEl) totalProductEl.textContent = metrics.total_product || 0;
  if (lowStockEl) lowStockEl.textContent = metrics.low_stock || 0;
  if (criticalStockEl)
    criticalStockEl.textContent = metrics.critical_stock || 0;
}

// ── Render Tabel Stok ──
function renderStockTable(items) {
  if (!items || !items.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Tidak ada data stok</td></tr>`;
    renderPaginationInfo(0, 0, 0);
    document.getElementById('stock-pagination-ctrl').innerHTML = '';
    return;
  }

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (currentPage > pages) currentPage = pages;
  const start = (currentPage - 1) * PER_PAGE;
  const slice = items.slice(start, start + PER_PAGE);

  tableBody.innerHTML = slice
    .map((item) => {
      const status = item.status;
      const stockClass = status === 'ok' ? 'stok-normal' : 'stok-danger';
      const badge = getStatusBadge(status);
      return `
      <tr>
        <td><span class="produk-name">${item.name}</span></td>
        <td>${item.category_name || '—'}</td>
        <td class="center"><span class="${stockClass}">${item.stock}</span></td>
        <td class="center"><span class="batas-val">${item.minimum_stock}</span></td>
        <td class="center">${badge}</td>
      </tr>`;
    })
    .join('');

  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages, (page) => {
    currentPage = page;
    renderStockTable(items);
  });
}

// ── Render Tabel Mutasi ──
function renderMutationTable(mutations) {
  if (!mutations || !mutations.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Belum ada riwayat mutasi stok</td></tr>`;
    renderPaginationInfo(0, 0, 0);
    document.getElementById('stock-pagination-ctrl').innerHTML = '';
    return;
  }

  const total = mutations.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (currentPage > pages) currentPage = pages;
  const start = (currentPage - 1) * PER_PAGE;
  const slice = mutations.slice(start, start + PER_PAGE);

  tableBody.innerHTML = slice
    .map((m) => {
      const typeLabel = m.type === 'in' ? 'Masuk' : 'Keluar';
      const typeClass = m.type === 'in' ? 'mutation-in' : 'mutation-out';
      const note = m.note || '—';
      return `
      <tr>
        <td><span class="produk-name">${m.product_name || `Produk #${m.product_id}`}</span></td>
        <td class="center"><span class="${typeClass}">${typeLabel}</span></td>
        <td class="center">${m.quantity}</td>
        <td class="center">${m.stock_after}</td>
        <td class="center">${note}</td>
      </tr>`;
    })
    .join('');

  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages, (page) => {
    currentPage = page;
    renderMutationTable(mutations);
  });
}

// ── Status Badge Helper ──
function getStatusBadge(status) {
  switch (status) {
    case 'ok':
      return '<span class="badge-aman">Aman</span>';
    case 'low':
      return '<span class="badge-menipis">Menipis</span>';
    case 'critical':
    case 'out':
      return '<span class="badge-kritis">Kritis</span>';
    default:
      return `<span class="badge-aman">${status}</span>`;
  }
}

// ── Tab Switching ──
function switchTab(tab) {
  if (currentTab === tab) return;
  currentTab = tab;

  tabItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  if (tab === 'current') {
    headStock.style.display = '';
    headHistory.style.display = 'none';
    tableTitle.textContent = 'Daftar Stok Produk';
    if (stockData) {
      renderStockTable(stockData.stock_items);
    } else {
      fetchStock();
    }
  } else {
    headStock.style.display = 'none';
    headHistory.style.display = '';
    tableTitle.textContent = 'Riwayat Mutasi Stok';
    fetchMutations();
  }
}

// ── MODAL LOGIC ──
function openStockModal() {
  stockProductInput.value = '';
  stockQuantityInput.value = 1;
  stockNoteInput.value = '';
  document.querySelector('input[name="stockType"][value="in"]').checked = true;

  if (stockData && stockData.stock_items) {
    stockProductDatalist.innerHTML = stockData.stock_items
      .map(
        (item) =>
          `<option value="${item.name} (Stok Tersedia: ${item.stock})"></option>`
      )
      .join('');
  }

  stockModal.style.display = 'flex';
  setTimeout(() => stockProductInput.focus(), 100);
}

function closeStockModal() {
  stockModal.style.display = 'none';
}

async function submitStockAdjustment() {
  if (isSubmitting) return;

  const productNameRaw = stockProductInput.value.trim();
  const type = document.querySelector('input[name="stockType"]:checked').value;
  const quantity = parseInt(stockQuantityInput.value) || 0;
  const note = stockNoteInput.value.trim();

  if (!productNameRaw)
    return showToast('Pilih produk terlebih dahulu', 'error');
  if (quantity < 1) return showToast('Jumlah harus minimal 1', 'error');

  // Regex match format "Nama Produk (Stok tersedia: 10)"
  const productName = productNameRaw
    .replace(/\s*\(Stok Tersedia:.*\)$/, '')
    .trim();

  const product = stockData.stock_items.find(
    (p) => p.name.toLowerCase() === productName.toLowerCase()
  );
  if (!product)
    return showToast('Produk tidak valid. Silakan pilih dari daftar.', 'error');

  isSubmitting = true;
  submitStockBtn.disabled = true;
  submitStockBtn.textContent = 'Menyimpan...';

  try {
    const res = await fetch(`/api/v1/stock/${product.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, quantity, note: note || undefined }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal mengubah stok');

    showToast(`Stok ${product.name} berhasil diperbarui`);
    closeStockModal();
    await fetchStock();
    if (currentTab === 'history') await fetchMutations();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    isSubmitting = false;
    submitStockBtn.disabled = false;
    submitStockBtn.textContent = 'Simpan';
  }
}

// ── Event: Tab click ──
tabItems.forEach((item) => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

// ── Event: Modal ──
document
  .getElementById('btnTambahStok')
  .addEventListener('click', openStockModal);
document
  .getElementById('closeStockModalBtn')
  .addEventListener('click', closeStockModal);
document
  .getElementById('cancelStockModalBtn')
  .addEventListener('click', closeStockModal);
submitStockBtn.addEventListener('click', submitStockAdjustment);

stockModal.addEventListener('click', (e) => {
  if (e.target === stockModal) closeStockModal();
});

// ── Init ──
fetchStock();
