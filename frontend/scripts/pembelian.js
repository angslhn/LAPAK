// ─────────────────────────────────────
// PEMBELIAN.JS — Pembelian LAPAK
// Fetch GET /api/v1/purchases & /api/v1/suppliers
// ─────────────────────────────────────

// ── State ──
let allPurchases = [];
let allSuppliers = [];
let currentPage = 1;
let activeFilter = 'semua'; // 'semua' | 'paid' | 'unpaid'
let searchQuery = '';
const PER_PAGE = 10;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const paginationInfo = document.getElementById('pagination-info');
const paginationCtrl = document.getElementById('pagination-ctrl');
const searchInput = document.getElementById('search-input');
const filterBtn = document.getElementById('filter-btn');
const totalPurchasesEl = document.getElementById('total-purchases');
const totalUnpaidEl = document.getElementById('total-unpaid');
const totalSuppliersEl = document.getElementById('total-suppliers');

// ── Formatter ──
const fmtRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const formatDate = (isoStr) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ── Fetch Purchases ──
async function fetchPurchases() {
  try {
    const res = await fetch('/api/v1/purchases', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allPurchases = json.data;
    updateStats();
    renderAll();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat pembelian: ${err.message}</td></tr>`;
  }
}

// ── Fetch Suppliers (untuk hitung supplier aktif) ──
async function fetchSuppliers() {
  try {
    const res = await fetch('/api/v1/suppliers', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allSuppliers = json.data;
    updateStats();
  } catch {
    /* silent */
  }
}

// ── Update Stat Cards ──
function updateStats() {
  // Total pembelian bulan ini (semua)
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthPurchases = allPurchases.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalPurchase = monthPurchases.reduce(
    (sum, p) => sum + Number(p.total),
    0
  );

  // Hutang belum lunas
  const unpaid = allPurchases.filter((p) => p.status === 'unpaid');
  const totalUnpaid = unpaid.reduce((sum, p) => sum + Number(p.total), 0);

  if (totalPurchasesEl) totalPurchasesEl.textContent = fmtRp(totalPurchase);
  if (totalUnpaidEl) totalUnpaidEl.textContent = fmtRp(totalUnpaid);
  if (totalSuppliersEl) totalSuppliersEl.textContent = allSuppliers.length;
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
      <tr data-id="${p.id}">
        <td><span class="tgl-val">${formatDate(p.date)}</span></td>
        <td><span class="nota-val">${p.receipt_number || '—'}</span></td>
        <td><span class="supplier-name">${p.supplier_name || '—'}</span></td>
        <td class="center"><span class="total-val">${fmtRp(p.total)}</span></td>
        <td class="center">${badge}</td>
      </tr>`;
    })
    .join('');
}

// ── Pagination Info ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} pembelian`;
}

// ── Pagination Ctrl ──
function renderPaginationCtrl(totalPages) {
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);

  let html = `<button class="page-btn nav-arrow" id="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

  if (left > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (left > 2)
      html += `<span style="padding:0 4px;color:#aaa;align-self:center">…</span>`;
  }

  range.forEach((p) => {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  });

  if (right < totalPages) {
    if (right < totalPages - 1)
      html += `<span style="padding:0 4px;color:#aaa;align-self:center">…</span>`;
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

// ── Filter Dropdown ──
const FILTER_OPTIONS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'paid', label: 'Lunas' },
  { value: 'unpaid', label: 'Belum Lunas' },
];

let dropdownOpen = false;

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
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  currentPage = 1;
  renderAll();
});

filterBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (dropdownOpen) closeDropdown();
  else openDropdown();
});

document.addEventListener('click', (e) => {
  if (
    dropdownOpen &&
    !e.target.closest('.filter-dropdown') &&
    !e.target.closest('#filter-btn')
  ) {
    closeDropdown();
  }
});

// ── Init ──
Promise.all([fetchPurchases(), fetchSuppliers()]);
