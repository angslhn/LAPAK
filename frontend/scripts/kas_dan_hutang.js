const rupiahFormatter = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
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

// ── TREND BADGES (dari beranda.js) ──
function profit(value) {
  return `<span class="badge up">
            <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.583333 5L0 4.41667L3.08333 1.3125L4.75 2.97917L6.91667 0.833333H5.83333V0H8.33333V2.5H7.5V1.41667L4.75 4.16667L3.08333 2.5L0.583333 5Z" fill="#4CAF50"/>
            </svg>
            +${value}% dari kemarin
          </span>`;
}

function loss(value) {
  return `<span class="badge down">
            <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.83333 5V4.16667H6.91667L4.75 2.02083L3.08333 3.6875L0 0.583333L0.583333 0L3.08333 2.5L4.75 0.833333L7.5 3.58333V2.5H8.33333V5H5.83333Z" fill="#BA1A1A"/>
            </svg>
            -${value}% dari kemarin
          </span>`;
}

function neutral() {
  return `<span class="badge neutral">
            <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 2.5H9" stroke="#757575" stroke-width="1.5"/>
            </svg>
            0% dari kemarin
          </span>`;
}

// ── Render Trend ──
function renderTrend(val) {
  if (val > 0) return profit(val);
  if (val < 0) return loss(Math.abs(val));
  return neutral();
}

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

// ── Tab Switching ──
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
    }
  });
});

// ── Trend Helper ──
function renderTrend(val) {
  if (val > 0) return profit(val);
  if (val < 0) return loss(val);
  return neutral();
}

// ═══ TAB 1: KAS HARIAN ═══
async function fetchKasHarian() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(`/api/v1/cash?date=${today}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderKasSummary(json.data.summary);
    renderKasTable(json.data.mutations || []);
  } catch (err) {
    document.getElementById('kas-table-body').innerHTML =
      `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat kas harian: ${err.message}</td></tr>`;
  }
}

function renderKasSummary(summary) {
  const opening = summary?.opening_balance || 0;
  const income = summary?.income || 0;
  const expense = summary?.expense || 0;
  const closing = summary?.closing_balance || opening + income - expense;
  const incomeTrend = summary?.income_trend_percentage;
  const expenseTrend = summary?.expense_trend_percentage;

  document.getElementById('kas-saldo-awal').textContent =
    rupiahFormatter(opening);
  document.getElementById('kas-masuk').textContent = rupiahFormatter(income);
  document.getElementById('kas-keluar').textContent = rupiahFormatter(expense);
  document.getElementById('kas-saldo-akhir').textContent =
    rupiahFormatter(closing);

  const masukTrendEl = document.getElementById('kas-masuk-trend');
  if (masukTrendEl && incomeTrend !== undefined) {
    masukTrendEl.innerHTML = renderTrend(incomeTrend);
    masukTrendEl.classList.remove('up', 'down', 'neutral');
    if (incomeTrend > 0) {
      masukTrendEl.classList.add('up');
    } else if (incomeTrend < 0) {
      masukTrendEl.classList.add('down');
    } else {
      masukTrendEl.classList.add('neutral');
    }
  }

  const keluarTrendEl = document.getElementById('kas-keluar-trend');
  if (keluarTrendEl && expenseTrend !== undefined) {
    keluarTrendEl.innerHTML = renderTrend(expenseTrend);
    keluarTrendEl.classList.remove('up', 'down', 'neutral');
    if (expenseTrend > 0) {
      keluarTrendEl.classList.add('up');
    } else if (expenseTrend < 0) {
      keluarTrendEl.classList.add('down');
    } else {
      keluarTrendEl.classList.add('neutral');
    }
  }
}

const kasPage = { current: 1, perPage: 10, data: [] };

function renderKasTable(mutations) {
  kasPage.data = mutations;
  kasPage.current = 1;
  renderKasPage();
}

function renderKasPage() {
  const { data, current, perPage } = kasPage;
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (current > pages) kasPage.current = pages;
  const start = (current - 1) * perPage;
  const slice = data.slice(start, start + perPage);

  const tbody = document.getElementById('kas-table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Belum ada transaksi kas hari ini</td></tr>`;
  } else {
    tbody.innerHTML = slice
      .map((m) => {
        const tipeClass = m.type === 'income' ? 'badge-masuk' : 'badge-keluar';
        const tipeLabel = m.type === 'income' ? 'Masuk' : 'Keluar';
        const nominalClass =
          m.type === 'income' ? 'nominal-masuk' : 'nominal-keluar';
        const prefix = m.type === 'income' ? '+ ' : '− ';
        return `
      <tr>
        <td><span class="waktu-val">${fmtTime(m.created_at || m.date)}</span></td>
        <td><span class="ket-val">${m.note || '—'}</span></td>
        <td><span class="badge ${tipeClass}">${tipeLabel}</span></td>
        <td class="right"><span class="${nominalClass}">${prefix}${rupiahFormatter(m.amount)}</span></td>
        <td class="center"><button class="aksi-btn">⋮</button></td>
      </tr>`;
      })
      .join('');
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

// ═══ TAB 2: PIUTANG PELANGGAN ═══
async function fetchPiutang() {
  try {
    const res = await fetch('/api/v1/debts/customers', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderPiutangSummary(json.data);
    renderPiutangTable(json.data);
  } catch (err) {
    document.getElementById('piutang-table-body').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05252">Gagal memuat piutang: ${err.message}</td></tr>`;
  }
}

function renderPiutangSummary(customers) {
  const total = customers.reduce((sum, c) => sum + (c.total_debt || 0), 0);
  const jatuhTempo = customers.reduce((sum, c) => {
    return (
      sum +
      (c.transactions || [])
        .filter((t) => t.status === 'unpaid')
        .reduce((s, t) => s + (t.total || 0), 0)
    );
  }, 0);
  document.getElementById('piutang-total').textContent = rupiahFormatter(total);
  document.getElementById('piutang-jatuh-tempo').textContent =
    rupiahFormatter(jatuhTempo);
  document.getElementById('piutang-pelanggan').textContent = customers.length;
}

const piutangPage = { current: 1, perPage: 10, data: [] };

function renderPiutangTable(customers) {
  const flat = [];
  customers.forEach((c) => {
    (c.transactions || []).forEach((t) => {
      flat.push({
        ...t,
        customer_name: c.customer_name,
        customer_id: c.customer_id,
      });
    });
  });
  piutangPage.data = flat;
  piutangPage.current = 1;
  renderPiutangPage();
}

function renderPiutangPage() {
  const { data, current, perPage } = piutangPage;
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (current > pages) piutangPage.current = pages;
  const start = (current - 1) * perPage;
  const slice = data.slice(start, start + perPage);

  const tbody = document.getElementById('piutang-table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#aaa">Tidak ada piutang</td></tr>`;
  } else {
    tbody.innerHTML = slice
      .map((t, i) => {
        const dueDate = fmtDate(t.due_date);
        const isUrgent =
          t.status === 'unpaid' &&
          t.due_date &&
          new Date(t.due_date) < new Date();
        const statusClass =
          t.status === 'paid'
            ? 'status-lunas'
            : isUrgent
              ? 'status-terlambat'
              : 'status-belum';
        const statusLabel =
          t.status === 'paid'
            ? 'LUNAS'
            : isUrgent
              ? 'TERLAMBAT'
              : 'BELUM LUNAS';
        const name = t.customer_name || '—';
        return `
      <tr>
        <td><div class="entity-cell"><div class="avatar ${getAvatarClass(i)}">${getInitials(name)}</div><div class="entity-name">${name}</div></div></td>
        <td style="color:#888;font-size:12.5px">${t.invoice_number || '—'}</td>
        <td class="${isUrgent ? 'jatuh-urgent' : ''}">${dueDate}</td>
        <td class="right" style="font-weight:700">${rupiahFormatter(t.total)}</td>
        <td class="center"><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td class="center"><button class="aksi-btn">⋮</button></td>
      </tr>`;
      })
      .join('');
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

// ═══ TAB 3: HUTANG DAGANG ═══
async function fetchHutang() {
  try {
    const res = await fetch('/api/v1/debts/suppliers', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderHutangSummary(json.data);
    renderHutangTable(json.data);
  } catch (err) {
    document.getElementById('hutang-table-body').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05252">Gagal memuat hutang: ${err.message}</td></tr>`;
  }
}

function renderHutangSummary(debts) {
  const total = debts.reduce((sum, d) => sum + (d.total || 0), 0);
  const jatuhTempo = debts
    .filter(
      (d) =>
        d.status === 'unpaid' && d.due_date && new Date(d.due_date) < new Date()
    )
    .reduce((sum, d) => sum + (d.total || 0), 0);
  const suppliers = new Set(debts.map((d) => d.supplier_id)).size;
  document.getElementById('hutang-total').textContent = rupiahFormatter(total);
  document.getElementById('hutang-jatuh-tempo').textContent =
    rupiahFormatter(jatuhTempo);
  document.getElementById('hutang-supplier').textContent = suppliers;
}

const hutangPage = { current: 1, perPage: 10, data: [] };

function renderHutangTable(debts) {
  hutangPage.data = debts;
  hutangPage.current = 1;
  renderHutangPage();
}

function renderHutangPage() {
  const { data, current, perPage } = hutangPage;
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (current > pages) hutangPage.current = pages;
  const start = (current - 1) * perPage;
  const slice = data.slice(start, start + perPage);

  const tbody = document.getElementById('hutang-table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#aaa">Tidak ada hutang</td></tr>`;
  } else {
    tbody.innerHTML = slice
      .map((d, i) => {
        const dueDate = fmtDate(d.due_date);
        const isUrgent =
          d.status === 'unpaid' &&
          d.due_date &&
          new Date(d.due_date) < new Date();
        const statusClass =
          d.status === 'paid'
            ? 'status-lunas'
            : isUrgent
              ? 'status-terlambat'
              : 'status-belum';
        const statusLabel =
          d.status === 'paid'
            ? 'Lunas'
            : isUrgent
              ? 'Terlambat'
              : 'Belum Lunas';
        const name = d.supplier_name || '—';
        const isPaid = d.status === 'paid';
        return `
      <tr>
        <td><div class="entity-cell"><div class="avatar ${getAvatarClass(i)}">${getInitials(name)}</div><div class="entity-name">${name}</div></div></td>
        <td style="color:#888;font-size:12px">${d.receipt_number || '—'}</td>
        <td class="${isUrgent ? 'jatuh-urgent' : ''}">${dueDate}</td>
        <td class="right" style="font-weight:700">${rupiahFormatter(d.total)}</td>
        <td class="center"><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td class="center">
          <div class="aksi-cell-multi">
            <button class="aksi-icon-btn" title="Bayar" ${isPaid ? 'disabled' : ''}>💳</button>
            <button class="aksi-btn">⋮</button>
          </div>
        </td>
      </tr>`;
      })
      .join('');
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

// ── Generic Pagination ──
function renderPagination(ctrlId, totalPages, onPageChange, current) {
  const ctrl = document.getElementById(ctrlId);
  if (!ctrl || totalPages <= 1) {
    if (ctrl) ctrl.innerHTML = '';
    return;
  }

  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(totalPages, current + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);

  let html = `<button class="page-btn nav-arrow" data-page="prev" ${current === 1 ? 'disabled' : ''}>‹</button>`;
  if (left > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (left > 2)
      html += `<span style="padding:0 4px;color:#aaa;align-self:center">…</span>`;
  }
  range.forEach((p) => {
    html += `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`;
  });
  if (right < totalPages) {
    if (right < totalPages - 1)
      html += `<span style="padding:0 4px;color:#aaa;align-self:center">…</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }
  html += `<button class="page-btn nav-arrow" data-page="next" ${current === totalPages ? 'disabled' : ''}>›</button>`;

  ctrl.innerHTML = html;

  ctrl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'prev') onPageChange(current - 1);
      else if (page === 'next') onPageChange(current + 1);
      else onPageChange(Number(page));
    });
  });
}

// ── Init ──
loadedTabs['kas-harian'] = true;
fetchKasHarian();
