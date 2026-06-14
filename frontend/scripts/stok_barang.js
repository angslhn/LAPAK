// ── State ──
let currentTab = 'current'; // 'current' | 'history'
let stockData = null;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const tableTitle = document.getElementById('table-title');
const headStock = document.getElementById('table-head-stock');
const headHistory = document.getElementById('table-head-history');
const totalProductEl = document.getElementById('total-product');
const lowStockEl = document.getElementById('low-stock');
const criticalStockEl = document.getElementById('critical-stock');
const tabItems = document.querySelectorAll('.tab-item');

// ── Fetch Stock Saat Ini ──
async function fetchStock() {
  try {
    const res = await fetch('/api/v1/stock', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    stockData = json.data;
    renderSummary(stockData.summary_metrics);
    renderStockTable(stockData.stock_items);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat stok: ${err.message}</td></tr>`;
  }
}

// ── Fetch Riwayat Mutasi ──
async function fetchMutations() {
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
    return;
  }

  tableBody.innerHTML = items
    .map((item) => {
      const status = item.status; // 'ok' | 'low' | 'critical' | 'out'
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
}

// ── Render Tabel Mutasi ──
function renderMutationTable(mutations) {
  if (!mutations || !mutations.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Belum ada riwayat mutasi stok</td></tr>`;
    return;
  }

  tableBody.innerHTML = mutations
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

  // Update active tab
  tabItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  // Update table header
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

// ── Event: Tab click ──
tabItems.forEach((item) => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

// ── Init ──
fetchStock();
