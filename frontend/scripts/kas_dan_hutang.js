// ── Formatter ──
const rupiahFormatter = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
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

// ── Format Currency Input ──
function formatCurrencyInput(input) {
  let value = input.value.replace(/[^0-9]/g, '');
  input.value = value ? Number(value).toLocaleString('id-ID') : '';
}
function parseFormattedCurrency(str) {
  return parseInt(String(str).replace(/\./g, ''), 10) || 0;
}

// ── Trend ──
function renderTrend(val) {
  if (val > 0) return `<span class="stat-sub up">↑ +${val}%</span>`;
  if (val < 0)
    return `<span class="stat-sub" style="color:#e05252">↓ -${Math.abs(val)}%</span>`;
  return `<span class="stat-sub">→ 0%</span>`;
}

// ── Avatar ──
const avatarColors = [
  'avatar-green',
  'avatar-blue',
  'avatar-yellow',
  'avatar-teal',
  'avatar-purple',
];
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase().slice(0, 2);
};
const getAvatarClass = (i) => avatarColors[i % avatarColors.length];

// ── State ──
let loadedTabs = {};
let allSuppliers = [];
let currentEditingTransaction = null;
let currentPiutangData = null;
let currentHutangData = null;
let pendingDeleteId = null;

// ══════════════════════════════════════
// AUTO-CLOSE MODAL (data-close attribute)
// ══════════════════════════════════════
document.querySelectorAll('[data-close]').forEach((el) => {
  el.addEventListener('click', () => {
    const modalId = el.dataset.close;
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  });
});

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});

// ══════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════
const tabs = document.querySelectorAll('.tab-item');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('panel-' + target).classList.add('active');
    if (target === 'kas-harian' && !loadedTabs['kas-harian']) {
      loadedTabs['kas-harian'] = true;
      fetchKasHarian();
    } else if (target === 'piutang' && !loadedTabs['piutang']) {
      loadedTabs['piutang'] = true;
      fetchPiutang();
    } else if (target === 'hutang' && !loadedTabs['hutang']) {
      loadedTabs['hutang'] = true;
      fetchHutang();
      fetchSuppliers();
    }
  });
});

// ── Fetch Suppliers ──
async function fetchSuppliers() {
  try {
    const res = await fetch('/api/v1/suppliers', { credentials: 'include' });
    const json = await res.json();
    if (json.success) allSuppliers = json.data || [];
  } catch (err) {
    console.error('Gagal fetch suppliers:', err);
  }
}
function populateSupplierSelect() {
  ['hutangSupplier', 'editHutangSupplier'].forEach((id) => {
    const s = document.getElementById(id);
    if (s)
      s.innerHTML =
        '<option value="">Pilih supplier...</option>' +
        allSuppliers
          .map((sup) => `<option value="${sup.id}">${sup.name}</option>`)
          .join('');
  });
}

// ── Generic Pagination ──
function renderPagination(ctrlId, totalPages, onPageChange, current) {
  const ctrl = document.getElementById(ctrlId);
  if (!ctrl || totalPages <= 1) {
    if (ctrl) ctrl.innerHTML = '';
    return;
  }
  const delta = 2,
    left = Math.max(1, current - delta),
    right = Math.min(totalPages, current + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);
  let html = `<button class="page-btn nav-arrow" data-page="prev" ${current === 1 ? 'disabled' : ''}>‹</button>`;
  if (left > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (left > 2) html += `<span class="page-ellipsis">…</span>`;
  }
  range.forEach((p) => {
    html += `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`;
  });
  if (right < totalPages) {
    if (right < totalPages - 1) html += `<span class="page-ellipsis">…</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }
  html += `<button class="page-btn nav-arrow" data-page="next" ${current === totalPages ? 'disabled' : ''}>›</button>`;
  ctrl.innerHTML = html;
  ctrl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.page;
      if (p === 'prev') onPageChange(current - 1);
      else if (p === 'next') onPageChange(current + 1);
      else onPageChange(Number(p));
    });
  });
}

// ── Dropdown Helpers ──
function hideAllDropdowns() {
  document.querySelectorAll('.action-dropdown').forEach((d) => d.remove());
}
document.addEventListener('click', hideAllDropdowns);

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
    const opt = select.options[select.selectedIndex];
    trigger.textContent = opt ? opt.text : select.options[0]?.text || '';
    if (!select.value) trigger.classList.add('placeholder');
    else trigger.classList.remove('placeholder');
  };
  updateTriggerText();
  wrapper.appendChild(trigger);

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'custom-select-options';

  Array.from(select.options).forEach((option) => {
    const optionEl = document.createElement('div');
    optionEl.className = 'custom-select-option';
    if (option.selected) optionEl.classList.add('selected');
    optionEl.textContent = option.text;
    optionEl.addEventListener('click', (e) => {
      e.stopPropagation();
      select.value = option.value;
      optionsContainer
        .querySelectorAll('.custom-select-option')
        .forEach((o) => o.classList.remove('selected'));
      optionEl.classList.add('selected');
      updateTriggerText();
      closeCustomDD();
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    optionsContainer.appendChild(optionEl);
  });

  wrapper.appendChild(optionsContainer);

  const openCustomDD = () => {
    optionsContainer.classList.add('open');
    trigger.classList.add('open');
  };
  const closeCustomDD = () => {
    optionsContainer.classList.remove('open');
    trigger.classList.remove('open');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (optionsContainer.classList.contains('open')) closeCustomDD();
    else {
      document
        .querySelectorAll('.custom-select-options.open')
        .forEach((o) => o.classList.remove('open'));
      document
        .querySelectorAll('.custom-select-trigger.open')
        .forEach((t) => t.classList.remove('open'));
      openCustomDD();
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) closeCustomDD();
  });
}

// ══════════════════════════════════════
// TAB 1: KAS HARIAN
// ══════════════════════════════════════
const kasPage = { current: 1, perPage: 10, data: [] };

async function fetchKasHarian() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(`/api/v1/cash?date=${today}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderKasSummary(json.data.summary);
    kasPage.data = json.data.mutations || [];
    kasPage.current = 1;
    renderKasPage();
  } catch (err) {
    document.getElementById('kas-table-body').innerHTML =
      `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal: ${err.message}</td></tr>`;
  }
}

function renderKasSummary(s) {
  const opening = s?.opening_balance || 0,
    income = s?.income || 0,
    expense = s?.expense || 0;
  document.getElementById('kas-saldo-awal').textContent =
    rupiahFormatter(opening);
  document.getElementById('kas-masuk').textContent = rupiahFormatter(income);
  document.getElementById('kas-keluar').textContent = rupiahFormatter(expense);
  document.getElementById('kas-saldo-akhir').textContent = rupiahFormatter(
    s?.closing_balance || opening + income - expense
  );
  const mt = document.getElementById('kas-masuk-trend');
  if (mt && s?.income_trend_percentage !== undefined)
    mt.innerHTML = renderTrend(s.income_trend_percentage);
  const kt = document.getElementById('kas-keluar-trend');
  if (kt && s?.expense_trend_percentage !== undefined)
    kt.innerHTML = renderTrend(s.expense_trend_percentage);
}

function renderKasPage() {
  const { data, current, perPage } = kasPage;
  const total = data.length,
    pages = Math.max(1, Math.ceil(total / perPage));
  if (current > pages) kasPage.current = pages;
  const start = (current - 1) * perPage,
    slice = data.slice(start, start + perPage);
  const tbody = document.getElementById('kas-table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Belum ada transaksi kas hari ini</td></tr>`;
  } else {
    tbody.innerHTML = slice
      .map((m, i) => {
        const idx = start + i;
        const tc = m.type === 'income' ? 'badge-masuk' : 'badge-keluar';
        const tl = m.type === 'income' ? 'Masuk' : 'Keluar';
        const nc = m.type === 'income' ? 'nominal-masuk' : 'nominal-keluar';
        const pfx = m.type === 'income' ? '+ ' : '− ';
        return `<tr style="position:relative">
        <td><span class="waktu-val">${fmtTime(m.created_at || m.date)}</span></td>
        <td><span class="ket-val">${m.note || '—'}</span></td>
        <td><span class="badge ${tc}">${tl}</span></td>
        <td class="right"><span class="${nc}">${pfx}${rupiahFormatter(m.amount)}</span></td>
        <td class="center"><button class="aksi-btn kas-action-btn" data-idx="${idx}">⋮</button></td>
      </tr>`;
      })
      .join('');
    tbody.querySelectorAll('.kas-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showKasDropdown(parseInt(btn.dataset.idx), btn);
      });
    });
  }
  document.getElementById('kas-pagination-info').textContent =
    `Menampilkan ${start + 1}–${Math.min(start + perPage, total)} dari ${total} transaksi`;
  renderPagination(
    'kas-pagination-ctrl',
    pages,
    (p) => {
      kasPage.current = p;
      renderKasPage();
    },
    current
  );
}

function showKasDropdown(idx, btn) {
  hideAllDropdowns();
  const data = kasPage.data[idx];
  if (!data) return;

  const rect = btn.getBoundingClientRect();
  const dd = document.createElement('div');
  dd.className = 'action-dropdown';
  dd.style.display = 'block';
  dd.style.position = 'fixed';
  dd.style.right = window.innerWidth - rect.right + 'px';
  dd.style.zIndex = '999';

  // Flip logic
  const ddHeight = 3 * 44 + 8;
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow >= ddHeight + 8) {
    dd.style.top = rect.bottom + 4 + 'px';
  } else {
    dd.style.top = rect.top - ddHeight - 4 + 'px';
  }

  dd.innerHTML = `
    <div class="action-item" data-action="detail">
      <svg width="17" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 12C12.25 12 13.3125 11.5625 14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12ZM11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2ZM11 15C8.56667 15 6.35 14.3208 4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15ZM11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13Z" fill="#3E4944"/>
      </svg>
      Lihat Detail
    </div>
    <div class="action-item" data-action="edit">
      <svg width="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 16H3.425L13.2 6.225L11.775 4.8L2 14.575V16ZM0 18V13.75L13.2 0.575C13.4 0.391667 13.6208 0.25 13.8625 0.15C14.1042 0.05 14.3583 0 14.625 0C14.8917 0 15.15 0.05 15.4 0.15C15.65 0.25 15.8667 0.4 16.05 0.6L17.425 2C17.625 2.18333 17.7708 2.4 17.8625 2.65C17.9542 2.9 18 3.15 18 3.4C18 3.66667 17.9542 3.92083 17.8625 4.1625C17.7708 4.40417 17.625 4.625 17.425 4.825L4.25 18H0ZM16 3.4L14.6 2L16 3.4ZM12.475 5.525L11.775 4.8L13.2 6.225L12.475 5.525Z" fill="#3E4944"/>
      </svg>
      Edit Transaksi
    </div>
    <div class="action-item delete" data-action="delete">
      <svg width="12" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14ZM3 3V16V3Z" fill="#BA1A1A"/>
      </svg>
      Hapus Transaksi
    </div>`;

  document.body.appendChild(dd);

  dd.querySelector('[data-action="detail"]').addEventListener('click', () => {
    dd.remove();
    openDetailCashModal(data);
  });
  dd.querySelector('[data-action="edit"]').addEventListener('click', () => {
    dd.remove();
    openEditCashModal(data);
  });
  dd.querySelector('[data-action="delete"]').addEventListener('click', () => {
    dd.remove();
    openDeleteCashModal(data.id);
  });

  setTimeout(() => {
    document.addEventListener('click', function closeDD(e) {
      if (!dd.contains(e.target) && e.target !== btn) {
        dd.remove();
        document.removeEventListener('click', closeDD);
      }
    });
  }, 10);
}

// ── Modal: Catat Manual ──
function openManualCashModal() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('manualDate').value = today;
  document.getElementById('manualTime').value = new Date()
    .toTimeString()
    .slice(0, 5);
  document.getElementById('manualAmount').value = '';
  document.getElementById('manualNote').value = '';
  document.getElementById('typeIncome').checked = true;
  document.getElementById('manualCashModal').style.display = 'flex';
}
document
  .getElementById('btnOpenManualCash')
  ?.addEventListener('click', openManualCashModal);
document
  .getElementById('btnSubmitManualCash')
  ?.addEventListener('click', async () => {
    const type = document.querySelector('input[name="cashType"]:checked').value;
    const amount = parseFormattedCurrency(
      document.getElementById('manualAmount').value
    );
    const date = document.getElementById('manualDate').value;
    const note = document.getElementById('manualNote').value.trim();
    if (amount <= 0) return showToast('Nominal harus > 0', 'error');
    if (!date) return showToast('Tanggal wajib diisi', 'error');
    if (!note) return showToast('Keterangan wajib diisi', 'error');
    const endpoint =
      type === 'income' ? '/api/v1/cash/income' : '/api/v1/cash/expense';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, amount, note }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Catatan kas berhasil disimpan', 'success');
      document.getElementById('manualCashModal').style.display = 'none';
      fetchKasHarian();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// ── Modal: Detail Transaksi ──
function openDetailCashModal(t) {
  currentEditingTransaction = t;
  document.getElementById('detailTotalNominal').textContent = rupiahFormatter(
    t.amount
  );
  document.getElementById('detailDate').textContent = fmtDate(
    t.date || t.created_at
  );
  document.getElementById('detailTime').textContent =
    fmtTime(t.created_at) + ' WIB';
  document.getElementById('detailNote').textContent = t.note || '—';
  document.getElementById('detailId').textContent = t.id ? `TRX-${t.id}` : '—';
  document.getElementById('detailTypeBadge').textContent =
    t.type === 'income' ? 'Masuk' : 'Keluar';
  document.getElementById('detailCategoryLabel').textContent =
    t.category === 'sale'
      ? 'Penjualan'
      : t.category === 'purchase'
        ? 'Pembelian'
        : t.category === 'credit_payment'
          ? 'Bayar Piutang'
          : 'Operasional';
  document.getElementById('detailCashModal').style.display = 'flex';
}

// ── Modal: Edit Transaksi ──
function openEditCashModal(t) {
  currentEditingTransaction = t;
  document.getElementById('editAmount').value = Number(t.amount).toLocaleString(
    'id-ID'
  );
  document.getElementById('editDate').value = new Date()
    .toISOString()
    .slice(0, 10);
  document.getElementById('editNote').value = t.note || '';
  document.getElementById('editCategory').value = t.category || 'operational';
  document.getElementById('editCashModal').style.display = 'flex';

  setTimeout(() => {
    const wrapper = document.getElementById('editCategoryWrapper');
    if (wrapper) initCustomSelect(wrapper);
  }, 80);
}

document
  .getElementById('btnSubmitEditCash')
  ?.addEventListener('click', async () => {
    if (!currentEditingTransaction) return;
    const amount = parseFormattedCurrency(
      document.getElementById('editAmount').value
    );
    const date = document.getElementById('editDate').value;
    const note = document.getElementById('editNote').value.trim();
    const category = document.getElementById('editCategory').value;
    if (amount <= 0) return showToast('Nominal harus > 0', 'error');
    if (!date) return showToast('Tanggal wajib diisi', 'error');
    try {
      const res = await fetch(`/api/v1/cash/${currentEditingTransaction.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          category,
          date,
          note: note || null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Transaksi berhasil diperbarui', 'success');
      document.getElementById('editCashModal').style.display = 'none';
      fetchKasHarian();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// ── Modal: Hapus Transaksi Kas ──
function openDeleteCashModal(id) {
  pendingDeleteId = id;
  document.getElementById('deleteCashModal').style.display = 'flex';
}
document
  .getElementById('btnConfirmDeleteCash')
  ?.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    try {
      const res = await fetch(`/api/v1/cash/${pendingDeleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Transaksi berhasil dihapus', 'success');
      document.getElementById('deleteCashModal').style.display = 'none';
      pendingDeleteId = null;
      fetchKasHarian();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Format currency on input
document
  .getElementById('manualAmount')
  ?.addEventListener('input', (e) => formatCurrencyInput(e.target));
document
  .getElementById('editAmount')
  ?.addEventListener('input', (e) => formatCurrencyInput(e.target));

// ══════════════════════════════════════
// TAB 2: PIUTANG PELANGGAN
// ══════════════════════════════════════
const piutangPage = { current: 1, perPage: 10, data: [] };

async function fetchPiutang() {
  try {
    const res = await fetch('/api/v1/debts/customers', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderPiutangSummary(json.data);
    const flat = [];
    json.data.forEach((c) => {
      (c.transactions || []).forEach((t) => {
        flat.push({
          ...t,
          customer_name: c.customer_name,
          customer_id: c.customer_id,
          customer_phone: c.customer_phone,
          customer_address: c.customer_address,
        });
      });
    });
    piutangPage.data = flat;
    piutangPage.current = 1;
    renderPiutangPage();
  } catch (err) {
    document.getElementById('piutang-table-body').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05252">Gagal: ${err.message}</td></tr>`;
  }
}

function renderPiutangSummary(customers) {
  const total = customers.reduce((sum, c) => sum + (c.total_debt || 0), 0);
  const jatuh = customers.reduce(
    (sum, c) =>
      sum +
      (c.transactions || [])
        .filter((t) => t.status === 'unpaid')
        .reduce((s, t) => s + (t.remaining || t.total || 0), 0),
    0
  );
  document.getElementById('piutang-total').textContent = rupiahFormatter(total);
  document.getElementById('piutang-jatuh-tempo').textContent =
    rupiahFormatter(jatuh);
  document.getElementById('piutang-pelanggan').textContent = customers.length;
}

function renderPiutangPage() {
  const { data, current, perPage } = piutangPage;
  const total = data.length,
    pages = Math.max(1, Math.ceil(total / perPage));
  if (current > pages) piutangPage.current = pages;
  const start = (current - 1) * perPage,
    slice = data.slice(start, start + perPage);
  const tbody = document.getElementById('piutang-table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#aaa">Tidak ada piutang</td></tr>`;
  } else {
    tbody.innerHTML = slice
      .map((t, i) => {
        const idx = start + i,
          dueDate = fmtDate(t.due_date);
        const isUrgent =
          t.status === 'unpaid' &&
          t.due_date &&
          new Date(t.due_date) < new Date();
        const isPaid = t.status === 'paid';
        const isPartial = (t.paid || 0) > 0 && (t.remaining || 0) > 0;
        const sc = isPaid
          ? 'status-lunas'
          : isPartial
            ? 'status-sebagian'
            : isUrgent
              ? 'status-terlambat'
              : 'status-belum';
        const sl = isPaid
          ? 'LUNAS'
          : isPartial
            ? 'SEBAGIAN'
            : isUrgent
              ? 'TERLAMBAT'
              : 'BELUM LUNAS';
        const name = t.customer_name || '—';
        return `<tr style="position:relative">
        <td><div class="entity-cell"><div class="avatar ${getAvatarClass(i)}">${getInitials(name)}</div><div class="entity-name">${name}</div></div></td>
        <td class="muted">${t.invoice_number || '—'}</td>
        <td class="${isUrgent ? 'jatuh-urgent' : ''}">${dueDate}</td>
        <td class="right" style="font-weight:700">${rupiahFormatter(t.total)}</td>
        <td class="center"><span class="status-badge ${sc}">${sl}</span></td>
        <td class="center"><button class="aksi-btn piutang-action-btn" data-idx="${idx}">⋮</button></td>
      </tr>`;
      })
      .join('');
    tbody.querySelectorAll('.piutang-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPiutangDropdown(parseInt(btn.dataset.idx), btn);
      });
    });
  }
  document.getElementById('piutang-pagination-info').textContent =
    `Menampilkan ${start + 1}–${Math.min(start + perPage, total)} dari ${total} piutang`;
  renderPagination(
    'piutang-pagination-ctrl',
    pages,
    (p) => {
      piutangPage.current = p;
      renderPiutangPage();
    },
    current
  );
}

function showPiutangDropdown(idx, btn) {
  hideAllDropdowns();
  const data = piutangPage.data[idx];
  if (!data) return;

  const isPaid = data.status === 'paid';
  const rect = btn.getBoundingClientRect();
  const dd = document.createElement('div');
  dd.className = 'action-dropdown';
  dd.style.display = 'block';
  dd.style.position = 'fixed';
  dd.style.right = window.innerWidth - rect.right + 'px';
  dd.style.zIndex = '999';

  const itemCount = isPaid ? 3 : 4;
  const ddHeight = itemCount * 44 + 8;
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow >= ddHeight + 8) {
    dd.style.top = rect.bottom + 4 + 'px';
  } else {
    dd.style.top = rect.top - ddHeight - 4 + 'px';
  }

  dd.innerHTML = `
    <div class="action-item" data-action="detail">
      <svg width="17" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 12C12.25 12 13.3125 11.5625 14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12ZM11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2ZM11 15C8.56667 15 6.35 14.3208 4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15ZM11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13Z" fill="#3E4944"/>
      </svg>
      Lihat Detail
    </div>
    <div class="action-item ${isPaid ? 'disabled' : ''}" data-action="bayar">
      <svg width="14" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.75 11.6667C1.26389 11.6667 0.850694 11.4965 0.510417 11.1562C0.170139 10.816 0 10.4028 0 9.91667V8.16667H1.75V0L2.625 0.875L3.5 0L4.375 0.875L5.25 0L6.125 0.875L7 0L7.875 0.875L8.75 0L9.625 0.875L10.5 0V9.91667C10.5 10.4028 10.3299 10.816 9.98958 11.1562C9.64931 11.4965 9.23611 11.6667 8.75 11.6667H1.75ZM8.75 10.5C8.91528 10.5 9.05382 10.4441 9.16562 10.3323C9.27743 10.2205 9.33333 10.0819 9.33333 9.91667V1.75H2.91667V8.16667H8.16667V9.91667C8.16667 10.0819 8.22257 10.2205 8.33438 10.3323C8.44618 10.4441 8.58472 10.5 8.75 10.5ZM3.5 4.08333V2.91667H7V4.08333H3.5ZM3.5 5.83333V4.66667H7V5.83333H3.5ZM8.16667 4.08333C8.00139 4.08333 7.86285 4.02743 7.75104 3.91563C7.63924 3.80382 7.58333 3.66528 7.58333 3.5C7.58333 3.33472 7.63924 3.19618 7.75104 3.08437C7.86285 2.97257 8.00139 2.91667 8.16667 2.91667C8.33194 2.91667 8.47049 2.97257 8.58229 3.08437C8.6941 3.19618 8.75 3.33472 8.75 3.5C8.75 3.66528 8.6941 3.80382 8.58229 3.91563C8.47049 4.02743 8.33194 4.08333 8.16667 4.08333ZM8.16667 5.83333C8.00139 5.83333 7.86285 5.77743 7.75104 5.66563C7.63924 5.55382 7.58333 5.41528 7.58333 5.25C7.58333 5.08472 7.63924 4.94618 7.75104 4.83437C7.86285 4.72257 8.00139 4.66667 8.16667 4.66667C8.33194 4.66667 8.47049 4.72257 8.58229 4.83437C8.6941 4.94618 8.75 5.08472 8.75 5.25C8.75 5.41528 8.6941 5.55382 8.58229 5.66563C8.47049 5.77743 8.33194 5.83333 8.16667 5.83333ZM1.75 10.5H7V9.33333H1.16667V9.91667C1.16667 10.0819 1.22257 10.2205 1.33438 10.3323C1.44618 10.4441 1.58472 10.5 1.75 10.5ZM1.16667 10.5C1.16667 10.5 1.16667 10.4441 1.16667 10.3323C1.16667 10.2205 1.16667 10.0819 1.16667 9.91667V9.33333V10.5Z" fill="#3E4944"></path>
      </svg>
      Bayar Cicilan
    </div>
    <div class="action-item" data-action="edit">
      <svg width="14" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 16H3.425L13.2 6.225L11.775 4.8L2 14.575V16ZM0 18V13.75L13.2 0.575C13.4 0.391667 13.6208 0.25 13.8625 0.15C14.1042 0.05 14.3583 0 14.625 0C14.8917 0 15.15 0.05 15.4 0.15C15.65 0.25 15.8667 0.4 16.05 0.6L17.425 2C17.625 2.18333 17.7708 2.4 17.8625 2.65C17.9542 2.9 18 3.15 18 3.4C18 3.66667 17.9542 3.92083 17.8625 4.1625C17.7708 4.40417 17.625 4.625 17.425 4.825L4.25 18H0ZM16 3.4L14.6 2L16 3.4ZM12.475 5.525L11.775 4.8L13.2 6.225L12.475 5.525Z" fill="#3E4944"/>
      </svg>
      Edit Data
    </div>
    <div class="action-item delete" data-action="delete">
      <svg width="13" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14ZM3 3V16V3Z" fill="#BA1A1A"/>
      </svg>
      Hapus Piutang
    </div>
    `;

  document.body.appendChild(dd);

  dd.querySelector('[data-action="detail"]').addEventListener('click', () => {
    dd.remove();
    openDetailPiutangModal(data);
  });
  if (!isPaid)
    dd.querySelector('[data-action="bayar"]')?.addEventListener('click', () => {
      dd.remove();
      openBayarCicilanModal(data);
    });
  dd.querySelector('[data-action="edit"]').addEventListener('click', () => {
    dd.remove();
    openEditPiutangModal(data);
  });
  dd.querySelector('[data-action="delete"]').addEventListener('click', () => {
    dd.remove();
    openDeletePiutangModal(data);
  });

  setTimeout(() => {
    document.addEventListener('click', function closeDD(e) {
      if (!dd.contains(e.target) && e.target !== btn) {
        dd.remove();
        document.removeEventListener('click', closeDD);
      }
    });
  }, 10);
}

// Detail Piutang
function openDetailPiutangModal(data) {
  currentPiutangData = data;
  document.getElementById('detailPiutangId').textContent =
    `#${data.invoice_number || 'TRX-XXXX'}`;
  document.getElementById('detailCustomerName').textContent =
    data.customer_name || '—';
  document.getElementById('detailCustomerPhone').textContent =
    data.customer_phone || '—';
  document.getElementById('detailCustomerAddress').textContent =
    data.customer_address || '—';
  document.getElementById('detailInvoiceNumber').textContent =
    data.invoice_number || '—';
  document.getElementById('detailTransactionDate').textContent = fmtDate(
    data.date || data.created_at
  );
  document.getElementById('detailDueDate').textContent = fmtDate(data.due_date);
  document.getElementById('detailTotalPiutang').textContent = rupiahFormatter(
    data.total
  );
  document.getElementById('detailPaidAmount').textContent = rupiahFormatter(
    data.paid || 0
  );
  document.getElementById('detailRemainingAmount').textContent =
    rupiahFormatter(data.remaining || data.total);
  document.getElementById('historyTotalPaid').textContent = rupiahFormatter(
    data.paid || 0
  );
  document.getElementById('detailPiutangModal').style.display = 'flex';
}

// Bayar Cicilan
function openBayarCicilanModal(data) {
  currentPiutangData = data || currentPiutangData;
  if (!currentPiutangData) return;
  const today = new Date().toISOString().slice(0, 10);
  const remaining = currentPiutangData.remaining || currentPiutangData.total;
  document.getElementById('cicilanPiutangId').textContent =
    `#${currentPiutangData.invoice_number || 'TRX-XXXX'}`;
  document.getElementById('cicilanCustomerName').textContent =
    currentPiutangData.customer_name || '—';
  document.getElementById('cicilanCustomerInitial').textContent = getInitials(
    currentPiutangData.customer_name || '?'
  );
  document.getElementById('cicilanRemainingAmount').textContent =
    rupiahFormatter(remaining);
  document.getElementById('cicilanAmount').value = '';
  document.getElementById('cicilanDate').value = today;
  document.getElementById('cicilanNote').value = '';
  if (currentPiutangData.due_date) {
    const daysLeft = Math.ceil(
      (new Date(currentPiutangData.due_date) - new Date()) /
        (1000 * 60 * 60 * 24)
    );
    document.getElementById('cicilanDueInfo').innerHTML = `
       <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="5" stroke="#e05252" stroke-width="1.5"/>
        <path d="M6 3v3l2 1" stroke="#e05252" stroke-width="1.5"/>
       </svg>
       <span>Jatuh tempo dalam ${daysLeft} hari</span>
      `;
  }
  document.getElementById('bayarCicilanModal').style.display = 'flex';
}
document
  .getElementById('btnOpenBayarCicilan')
  ?.addEventListener('click', () => openBayarCicilanModal());
document
  .getElementById('btnSubmitBayarCicilan')
  ?.addEventListener('click', async () => {
    const amount = parseFormattedCurrency(
      document.getElementById('cicilanAmount').value
    );
    const date = document.getElementById('cicilanDate').value;
    const method =
      document.querySelector('input[name="cicilanMethod"]:checked')?.value ||
      'cash';
    const note = document.getElementById('cicilanNote').value.trim();
    const remaining = currentPiutangData.remaining || currentPiutangData.total;
    if (amount > remaining)
      return showToast('Nominal melebihi sisa piutang', 'error');
    if (!date) return showToast('Tanggal wajib diisi', 'error');
    if (!currentPiutangData) return;
    try {
      const res = await fetch(
        `/api/v1/debts/customers/${currentPiutangData.id}/pay`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_amount: amount,
            payment_date: date,
            payment_method: method,
            note: note || null,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Pembayaran berhasil', 'success');
      document.getElementById('bayarCicilanModal').style.display = 'none';
      document.getElementById('detailPiutangModal').style.display = 'none';
      fetchPiutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Edit Piutang
function openEditPiutangModal(data) {
  currentPiutangData = data;
  document.getElementById('editPiutangName').value = data.customer_name || '';
  document.getElementById('editPiutangPhone').value = data.customer_phone || '';
  document.getElementById('editPiutangDueDate').value =
    data.due_date?.slice(0, 10) || new Date().toISOString().slice(0, 10);
  document.getElementById('editPiutangNote').value = data.note || '';
  document.getElementById('editPiutangModal').style.display = 'flex';
}
document
  .getElementById('btnSubmitEditPiutang')
  ?.addEventListener('click', async () => {
    const name = document.getElementById('editPiutangName').value.trim();
    const phone = document.getElementById('editPiutangPhone').value.trim();
    const dueDate = document.getElementById('editPiutangDueDate').value;
    const note = document.getElementById('editPiutangNote').value.trim();
    if (!name) return showToast('Nama wajib diisi', 'error');
    if (!dueDate) return showToast('Jatuh tempo wajib diisi', 'error');
    try {
      const res = await fetch(
        `/api/v1/debts/customers/${currentPiutangData.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: name,
            customer_phone: phone,
            due_date: dueDate,
            note: note || null,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Piutang berhasil diperbarui', 'success');
      document.getElementById('editPiutangModal').style.display = 'none';
      fetchPiutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Delete Piutang
function openDeletePiutangModal(data) {
  currentPiutangData = data;
  document.getElementById('deletePiutangModal').style.display = 'flex';
}
document
  .getElementById('btnConfirmDeletePiutang')
  ?.addEventListener('click', async () => {
    if (!currentPiutangData) return;
    try {
      const res = await fetch(
        `/api/v1/debts/customers/${currentPiutangData.id}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Piutang berhasil dihapus', 'success');
      document.getElementById('deletePiutangModal').style.display = 'none';
      fetchPiutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Format currency
document
  .getElementById('cicilanAmount')
  ?.addEventListener('input', (e) => formatCurrencyInput(e.target));

// ══════════════════════════════════════
// TAB 3: HUTANG DAGANG
// ══════════════════════════════════════
const hutangPage = { current: 1, perPage: 10, data: [] };

async function fetchHutang() {
  try {
    const res = await fetch('/api/v1/supplier-debts', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderHutangSummary(json.data);
    hutangPage.data = json.data;
    hutangPage.current = 1;
    renderHutangPage();
    renderInsight(json.data);
  } catch (err) {
    document.getElementById('hutang-table-body').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05252">Gagal: ${err.message}</td></tr>`;
  }
}

function renderHutangSummary(debts) {
  const total = debts.reduce((s, d) => s + (d.total || 0), 0);
  const jatuh = debts
    .filter(
      (d) =>
        d.status !== 'paid' && d.due_date && new Date(d.due_date) < new Date()
    )
    .reduce((s, d) => s + (d.remaining || d.total || 0), 0);
  document.getElementById('hutang-total').textContent = rupiahFormatter(total);
  document.getElementById('hutang-jatuh-tempo').textContent =
    rupiahFormatter(jatuh);
  document.getElementById('hutang-supplier').textContent = new Set(
    debts.map((d) => d.supplier_id)
  ).size;
}

function renderHutangPage() {
  const { data, current, perPage } = hutangPage;
  const total = data.length,
    pages = Math.max(1, Math.ceil(total / perPage));
  if (current > pages) hutangPage.current = pages;
  const start = (current - 1) * perPage,
    slice = data.slice(start, start + perPage);
  const tbody = document.getElementById('hutang-table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#aaa">Tidak ada hutang</td></tr>`;
  } else {
    tbody.innerHTML = slice
      .map((d, i) => {
        const idx = start + i,
          dueDate = fmtDate(d.due_date);
        const isUrgent =
          d.status !== 'paid' &&
          d.due_date &&
          new Date(d.due_date) < new Date();
        const isPartial = (d.paid || 0) > 0 && (d.remaining || 0) > 0;
        const sc =
          d.status === 'paid'
            ? 'status-lunas'
            : isPartial
              ? 'status-sebagian'
              : isUrgent
                ? 'status-terlambat'
                : 'status-belum';
        const sl =
          d.status === 'paid'
            ? 'Lunas'
            : isPartial
              ? 'Sebagian'
              : isUrgent
                ? 'Terlambat'
                : 'Belum Lunas';
        const name = d.supplier_name || '—';
        return `<tr style="position:relative">
        <td><div class="entity-cell"><div class="avatar ${getAvatarClass(i)}">${getInitials(name)}</div><div class="entity-name">${name}</div></div></td>
        <td class="muted">${d.receipt_number || '—'}</td>
        <td class="${isUrgent ? 'jatuh-urgent' : ''}">${dueDate}</td>
        <td class="right" style="font-weight:700">${rupiahFormatter(d.total)}</td>
        <td class="center"><span class="status-badge ${sc}">${sl}</span></td>
        <td class="center"><button class="aksi-btn hutang-action-btn" data-idx="${idx}">⋮</button></td>
      </tr>`;
      })
      .join('');
    tbody.querySelectorAll('.hutang-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showHutangDropdown(parseInt(btn.dataset.idx), btn);
      });
    });
  }
  document.getElementById('hutang-pagination-info').textContent =
    `Menampilkan ${start + 1}–${Math.min(start + perPage, total)} dari ${total} entri`;
  renderPagination(
    'hutang-pagination-ctrl',
    pages,
    (p) => {
      hutangPage.current = p;
      renderHutangPage();
    },
    current
  );
}

function showHutangDropdown(idx, btn) {
  hideAllDropdowns();
  const data = hutangPage.data[idx];
  if (!data) return;

  const isPaid = data.status === 'paid';
  const rect = btn.getBoundingClientRect();
  const dd = document.createElement('div');
  dd.className = 'action-dropdown';
  dd.style.display = 'block';
  dd.style.position = 'fixed';
  dd.style.right = window.innerWidth - rect.right + 'px';
  dd.style.zIndex = '999';

  const itemCount = isPaid ? 3 : 4;
  const ddHeight = itemCount * 44 + 8;
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow >= ddHeight + 8) {
    dd.style.top = rect.bottom + 4 + 'px';
  } else {
    dd.style.top = rect.top - ddHeight - 4 + 'px';
  }

  dd.innerHTML = `
    <div class="action-item" data-action="detail">
      <svg width="17" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 12C12.25 12 13.3125 11.5625 14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12ZM11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2ZM11 15C8.56667 15 6.35 14.3208 4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15ZM11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13Z" fill="#3E4944"/>
      </svg>
      Lihat Detail
    </div>
    <div class="action-item ${isPaid ? 'disabled' : ''}" data-action="bayar">
      <svg width="14" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.75 11.6667C1.26389 11.6667 0.850694 11.4965 0.510417 11.1562C0.170139 10.816 0 10.4028 0 9.91667V8.16667H1.75V0L2.625 0.875L3.5 0L4.375 0.875L5.25 0L6.125 0.875L7 0L7.875 0.875L8.75 0L9.625 0.875L10.5 0V9.91667C10.5 10.4028 10.3299 10.816 9.98958 11.1562C9.64931 11.4965 9.23611 11.6667 8.75 11.6667H1.75ZM8.75 10.5C8.91528 10.5 9.05382 10.4441 9.16562 10.3323C9.27743 10.2205 9.33333 10.0819 9.33333 9.91667V1.75H2.91667V8.16667H8.16667V9.91667C8.16667 10.0819 8.22257 10.2205 8.33438 10.3323C8.44618 10.4441 8.58472 10.5 8.75 10.5ZM3.5 4.08333V2.91667H7V4.08333H3.5ZM3.5 5.83333V4.66667H7V5.83333H3.5ZM8.16667 4.08333C8.00139 4.08333 7.86285 4.02743 7.75104 3.91563C7.63924 3.80382 7.58333 3.66528 7.58333 3.5C7.58333 3.33472 7.63924 3.19618 7.75104 3.08437C7.86285 2.97257 8.00139 2.91667 8.16667 2.91667C8.33194 2.91667 8.47049 2.97257 8.58229 3.08437C8.6941 3.19618 8.75 3.33472 8.75 3.5C8.75 3.66528 8.6941 3.80382 8.58229 3.91563C8.47049 4.02743 8.33194 4.08333 8.16667 4.08333ZM8.16667 5.83333C8.00139 5.83333 7.86285 5.77743 7.75104 5.66563C7.63924 5.55382 7.58333 5.41528 7.58333 5.25C7.58333 5.08472 7.63924 4.94618 7.75104 4.83437C7.86285 4.72257 8.00139 4.66667 8.16667 4.66667C8.33194 4.66667 8.47049 4.72257 8.58229 4.83437C8.6941 4.94618 8.75 5.08472 8.75 5.25C8.75 5.41528 8.6941 5.55382 8.58229 5.66563C8.47049 5.77743 8.33194 5.83333 8.16667 5.83333ZM1.75 10.5H7V9.33333H1.16667V9.91667C1.16667 10.0819 1.22257 10.2205 1.33438 10.3323C1.44618 10.4441 1.58472 10.5 1.75 10.5ZM1.16667 10.5C1.16667 10.5 1.16667 10.4441 1.16667 10.3323C1.16667 10.2205 1.16667 10.0819 1.16667 9.91667V9.33333V10.5Z" fill="#3E4944"></path>
      </svg>
      Bayar Hutang
    </div>
    <div class="action-item" data-action="edit">
      <svg width="14" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 16H3.425L13.2 6.225L11.775 4.8L2 14.575V16ZM0 18V13.75L13.2 0.575C13.4 0.391667 13.6208 0.25 13.8625 0.15C14.1042 0.05 14.3583 0 14.625 0C14.8917 0 15.15 0.05 15.4 0.15C15.65 0.25 15.8667 0.4 16.05 0.6L17.425 2C17.625 2.18333 17.7708 2.4 17.8625 2.65C17.9542 2.9 18 3.15 18 3.4C18 3.66667 17.9542 3.92083 17.8625 4.1625C17.7708 4.40417 17.625 4.625 17.425 4.825L4.25 18H0ZM16 3.4L14.6 2L16 3.4ZM12.475 5.525L11.775 4.8L13.2 6.225L12.475 5.525Z" fill="#3E4944"/>
      </svg>
      Edit Data
    </div>
    <div class="action-item delete" data-action="delete">
      <svg width="13" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14ZM3 3V16V3Z" fill="#BA1A1A"/>
      </svg>
      Hapus Hutang
    </div>
    `;

  document.body.appendChild(dd);

  dd.querySelector('[data-action="detail"]').addEventListener('click', () => {
    dd.remove();
    openDetailHutangModal(data);
  });
  if (!isPaid)
    dd.querySelector('[data-action="bayar"]')?.addEventListener('click', () => {
      dd.remove();
      openBayarHutangModal(data);
    });
  dd.querySelector('[data-action="edit"]').addEventListener('click', () => {
    dd.remove();
    openEditHutangModal(data);
  });
  dd.querySelector('[data-action="delete"]').addEventListener('click', () => {
    dd.remove();
    openDeleteHutangModal(data);
  });

  setTimeout(() => {
    document.addEventListener('click', function closeDD(e) {
      if (!dd.contains(e.target) && e.target !== btn) {
        dd.remove();
        document.removeEventListener('click', closeDD);
      }
    });
  }, 10);
}

// Insight
function renderInsight(debts) {
  const unpaid = debts.filter((d) => d.status !== 'paid');
  const urgent = unpaid.filter(
    (d) => d.due_date && new Date(d.due_date) < new Date()
  );
  const totalUnpaid = unpaid.reduce(
    (s, d) => s + (d.remaining || d.total || 0),
    0
  );
  const totalUrgent = urgent.reduce(
    (s, d) => s + (d.remaining || d.total || 0),
    0
  );
  document.getElementById('insight-list').innerHTML = `
    <div class="insight-item"><div class="insight-dot"></div><div>Total hutang belum lunas: <strong>${rupiahFormatter(totalUnpaid)}</strong></div></div>
    <div class="insight-item"><div class="insight-dot"></div><div>Hutang jatuh tempo: <strong class="red">${rupiahFormatter(totalUrgent)}</strong> (${urgent.length} supplier)</div></div>
    <div class="insight-item"><div class="insight-dot"></div><div>Total supplier dengan hutang aktif: <strong>${new Set(unpaid.map((d) => d.supplier_id)).size}</strong></div></div>`;
}

// Hutang Baru
document.getElementById('btnOpenHutangBaru')?.addEventListener('click', () => {
  const due = new Date();
  due.setDate(due.getDate() + 30);
  document.getElementById('hutangTanggal').value = new Date()
    .toISOString()
    .slice(0, 10);
  document.getElementById('hutangJatuhTempo').value = due
    .toISOString()
    .slice(0, 10);
  document.getElementById('hutangTotal').value = '';
  document.getElementById('hutangNota').value = '';
  document.getElementById('hutangKeterangan').value = '';
  document.getElementById('hutangSupplier').value = '';
  populateSupplierSelect();
  document.getElementById('hutangBaruModal').style.display = 'flex';

  setTimeout(() => {
    const wrapper = document.getElementById('hutangSupplierWrapper');
    if (wrapper) initCustomSelect(wrapper);
  }, 80);
});
document
  .getElementById('btnSubmitHutangBaru')
  ?.addEventListener('click', async () => {
    const supplierId = document.getElementById('hutangSupplier').value;
    const date = document.getElementById('hutangTanggal').value;
    const dueDate = document.getElementById('hutangJatuhTempo').value;
    const total = parseFormattedCurrency(
      document.getElementById('hutangTotal').value
    );
    const receiptNumber = document.getElementById('hutangNota').value.trim();
    const note = document.getElementById('hutangKeterangan').value.trim();
    if (!supplierId) return showToast('Pilih supplier', 'error');
    if (!date) return showToast('Tanggal wajib diisi', 'error');
    if (!dueDate) return showToast('Jatuh tempo wajib diisi', 'error');
    if (total <= 0) return showToast('Total harus > 0', 'error');
    try {
      const res = await fetch('/api/v1/supplier-debts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: parseInt(supplierId),
          date,
          due_date: dueDate,
          total,
          receipt_number: receiptNumber || null,
          note: note || null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Hutang berhasil disimpan', 'success');
      document.getElementById('hutangBaruModal').style.display = 'none';
      fetchHutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Edit Hutang
function openEditHutangModal(data) {
  currentHutangData = data;

  document.getElementById('editHutangSupplier').value = data.supplier_id || '';
  document.getElementById('editHutangJatuhTempo').value =
    data.due_date?.slice(0, 10) || '';
  document.getElementById('editHutangCatatan').value = data.note || '';

  populateSupplierSelect();

  document.getElementById('editHutangSupplier').value = data.supplier_id || '';
  document.getElementById('editHutangModal').style.display = 'flex';

  setTimeout(() => {
    const wrapper = document.getElementById('editHutangSupplierWrapper');
    if (wrapper) {
      wrapper.querySelector('.custom-select-trigger')?.remove();
      wrapper.querySelector('.custom-select-options')?.remove();
      initCustomSelect(wrapper);
    }
  }, 100);
}
document
  .getElementById('btnSubmitEditHutang')
  ?.addEventListener('click', async () => {
    const supplierId = document.getElementById('editHutangSupplier').value;
    const dueDate = document.getElementById('editHutangJatuhTempo').value;
    const note = document.getElementById('editHutangCatatan').value.trim();
    if (!supplierId) return showToast('Pilih supplier', 'error');
    if (!dueDate) return showToast('Jatuh tempo wajib diisi', 'error');
    try {
      const res = await fetch(
        `/api/v1/supplier-debts/${currentHutangData.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplier_id: parseInt(supplierId),
            due_date: dueDate,
            note: note || null,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Hutang berhasil diperbarui', 'success');
      document.getElementById('editHutangModal').style.display = 'none';
      fetchHutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Bayar Hutang
function openBayarHutangModal(data) {
  currentHutangData = data;
  const remaining = data.remaining || data.total;
  document.getElementById('bayarHutangSupplier').textContent =
    data.supplier_name || '—';
  document.getElementById('bayarHutangRemaining').textContent =
    rupiahFormatter(remaining);
  document.getElementById('bayarHutangAmount').value =
    Number(remaining).toLocaleString('id-ID');
  document.getElementById('bayarHutangNote').value = '';
  document.querySelector(
    'input[name="bayarHutangMethod"][value="cash"]'
  ).checked = true;
  document.getElementById('bayarHutangModal').style.display = 'flex';
}
document
  .getElementById('btnSubmitBayarHutang')
  ?.addEventListener('click', async () => {
    const amount = parseFormattedCurrency(
      document.getElementById('bayarHutangAmount').value
    );
    const method =
      document.querySelector('input[name="bayarHutangMethod"]:checked')
        ?.value || 'cash';
    const note = document.getElementById('bayarHutangNote').value.trim();
    const remaining = currentHutangData.remaining || currentHutangData.total;
    if (amount > remaining)
      return showToast('Nominal melebihi sisa hutang', 'error');
    try {
      const res = await fetch(
        `/api/v1/debts/suppliers/${currentHutangData.id}/pay`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_amount: amount,
            payment_method: method,
            note: note || null,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Pembayaran berhasil', 'success');
      document.getElementById('bayarHutangModal').style.display = 'none';
      fetchHutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Detail Hutang
function openDetailHutangModal(data) {
  currentHutangData = data;
  document.getElementById('detailHutangSupplierName').textContent =
    data.supplier_name || '—';
  document.getElementById('detailHutangInvoice').textContent =
    data.receipt_number || '—';
  document.getElementById('detailHutangDueDate').textContent = fmtDate(
    data.due_date
  );
  document.getElementById('detailTotalHutang').textContent = rupiahFormatter(
    data.total
  );
  document.getElementById('detailPaidHutang').textContent = rupiahFormatter(
    data.paid || 0
  );
  document.getElementById('detailRemainingHutang').textContent =
    rupiahFormatter(data.remaining || data.total);
  document.getElementById('detailPaidPercentage').textContent =
    data.total > 0
      ? (((data.paid || 0) / data.total) * 100).toFixed(1) + '%'
      : '0%';
  document.getElementById('detailDaysLeft').textContent = data.due_date
    ? Math.ceil((new Date(data.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : '—';
  document.getElementById('detailSupplierName').textContent =
    data.supplier_name || '—';
  document.getElementById('detailSupplierPhone').textContent =
    data.supplier_phone || '—';
  document.getElementById('detailSupplierInitial').textContent = getInitials(
    data.supplier_name || '?'
  );
  document.getElementById('detailDocInvoiceNumber').textContent =
    data.receipt_number || '—';
  document.getElementById('detailPurchaseDate').textContent = fmtDate(
    data.date
  );
  document.getElementById('detailDueDateDoc').textContent = fmtDate(
    data.due_date
  );
  document.getElementById('detailNoteDoc').textContent = data.note || '—';
  document.getElementById('detailHutangModal').style.display = 'flex';
}
document
  .getElementById('btnOpenBayarHutangFromDetail')
  ?.addEventListener('click', () => {
    document.getElementById('detailHutangModal').style.display = 'none';
    openBayarHutangModal(currentHutangData);
  });
document
  .getElementById('btnOpenEditHutangFromDetail')
  ?.addEventListener('click', () => {
    document.getElementById('detailHutangModal').style.display = 'none';
    openEditHutangModal(currentHutangData);
  });
document
  .getElementById('btnOpenDeleteHutang')
  ?.addEventListener('click', () => {
    document.getElementById('detailHutangModal').style.display = 'none';
    openDeleteHutangModal(currentHutangData);
  });

// Delete Hutang
function openDeleteHutangModal(data) {
  currentHutangData = data;
  document.getElementById('deleteHutangModal').style.display = 'flex';
}
document
  .getElementById('btnConfirmDeleteHutang')
  ?.addEventListener('click', async () => {
    if (!currentHutangData) return;
    try {
      const res = await fetch(
        `/api/v1/supplier-debts/${currentHutangData.id}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Hutang berhasil dihapus', 'success');
      document.getElementById('deleteHutangModal').style.display = 'none';
      fetchHutang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// Format currency
document
  .getElementById('hutangTotal')
  ?.addEventListener('input', (e) => formatCurrencyInput(e.target));
document
  .getElementById('bayarHutangAmount')
  ?.addEventListener('input', (e) => formatCurrencyInput(e.target));

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
loadedTabs['kas-harian'] = true;
fetchKasHarian();
