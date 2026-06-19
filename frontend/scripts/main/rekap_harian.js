const rupiahFormatter = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
const fmtDateLong = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
const fmtDateShort = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const todayStr = new Date().toISOString().slice(0, 10);
const PER_PAGE = 10;

// ── Pagination State ──
let expensePage = 1;
let laporanPage = 1;

// ── Pagination Helpers ──
function renderPaginationInfo(from, to, total, elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = `Menampilkan ${from}–${to} dari ${total}`;
}

function renderPaginationCtrl(totalPages, current, ctrlId, onPageChange) {
  const ctrl = document.getElementById(ctrlId);
  if (!ctrl) return;
  if (totalPages <= 1) {
    ctrl.innerHTML = '';
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
    if (left > 2) html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
  }
  range.forEach((p) => {
    html += `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`;
  });
  if (right < totalPages) {
    if (right < totalPages - 1)
      html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
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

// ── Fetch Daily Report Today ──
async function fetchDailyReport() {
  try {
    const res = await fetch('/api/v1/daily-reports/today', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderStats(json.data);
  } catch (err) {
    console.error('Gagal memuat rekap harian:', err.message);
  }
}

function renderStats(data) {
  document.getElementById('topbar-date').textContent = fmtDateLong(
    data.date || todayStr
  );
  document.getElementById('stat-transaksi').textContent =
    data.transaction_count || 0;
  document.getElementById('stat-omzet').textContent = rupiahFormatter(
    data.total_revenue || 0
  );
  document.getElementById('stat-pengeluaran').textContent = rupiahFormatter(
    data.total_expense || 0
  );
  document.getElementById('stat-laba').textContent = rupiahFormatter(
    data.net_profit || 0
  );
}

// ── Fetch Cash ──
async function fetchCash() {
  try {
    const res = await fetch(`/api/v1/cash?date=${todayStr}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderCashSummary(json.data);
    expensePage = 1;
    renderExpenseTable(json.data.mutations || []);
  } catch (err) {
    document.getElementById('pengeluaran-table-body').innerHTML =
      `<tr><td colspan="4" style="text-align:center;padding:24px;color:#e05252">Gagal memuat pengeluaran</td></tr>`;
  }
}

function renderCashSummary(data) {
  const opening = data.summary?.opening_balance || 0;
  const income = data.summary?.income || 0;
  const expense = data.summary?.expense || 0;
  const closing = data.summary?.closing_balance || opening + income - expense;

  document.getElementById('kas-awal').textContent = rupiahFormatter(opening);
  document.getElementById('kas-masuk').textContent =
    `+ ${rupiahFormatter(income)}`;
  document.getElementById('kas-keluar').textContent =
    `- ${rupiahFormatter(expense)}`;
  document.getElementById('kas-akhir').textContent = rupiahFormatter(closing);
}

function renderExpenseTable(mutations) {
  const expenses = mutations.filter((m) => m.type === 'expense');
  const tbody = document.getElementById('pengeluaran-table-body');

  if (!expenses.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#aaa">Belum ada pengeluaran hari ini</td></tr>`;
    document.getElementById('expense-pagination-info').textContent =
      'Menampilkan 0–0 dari 0';
    document.getElementById('expense-pagination-ctrl').innerHTML = '';
    return;
  }

  const total = expenses.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (expensePage > pages) expensePage = pages;
  const start = (expensePage - 1) * PER_PAGE;
  const slice = expenses.slice(start, start + PER_PAGE);

  const categoryMap = {
    operational: 'badge-operasional',
    konsumsi: 'badge-konsumsi',
    logistik: 'badge-logistik',
    purchase: 'badge-operasional',
  };
  const catLabels = {
    operational: 'Operasional',
    konsumsi: 'Konsumsi',
    logistik: 'Logistik',
    purchase: 'Pembelian',
    credit_payment: 'Bayar Hutang',
  };

  tbody.innerHTML = slice
    .map((e) => {
      const cat = e.category || 'operasional';
      const catClass = categoryMap[cat] || 'badge-operasional';
      const catLabel = catLabels[cat] || cat;
      return `
      <tr>
        <td><span class="waktu-val">${fmtTime(e.created_at || e.date)}</span></td>
        <td><span class="ket-val">${e.note || '—'}</span></td>
        <td><span class="badge-kategori ${catClass}">${catLabel}</span></td>
        <td class="right"><span class="nominal-val">${rupiahFormatter(e.amount)}</span></td>
      </tr>`;
    })
    .join('');

  renderPaginationInfo(
    start + 1,
    Math.min(start + PER_PAGE, total),
    total,
    'expense-pagination-info'
  );
  renderPaginationCtrl(
    pages,
    expensePage,
    'expense-pagination-ctrl',
    (page) => {
      expensePage = page;
      renderExpenseTable(mutations);
    }
  );
}

// ── Fetch All Daily Reports ──
async function fetchAllDailyReports() {
  try {
    const res = await fetch('/api/v1/daily-reports', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    laporanPage = 1;
    renderLaporanTable(json.data);
  } catch (err) {
    document.getElementById('laporan-table-body').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05252">Gagal memuat daftar laporan</td></tr>`;
  }
}

function renderLaporanTable(reports) {
  const tbody = document.getElementById('laporan-table-body');

  if (!reports || !reports.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#aaa">Belum ada laporan harian</td></tr>`;
    if (infoHeader) infoHeader.textContent = '0 laporan';
    document.getElementById('laporan-pagination-info').textContent =
      'Menampilkan 0–0 dari 0';
    document.getElementById('laporan-pagination-ctrl').innerHTML = '';
    return;
  }

  const openCount = reports.filter((r) => r.status === 'open').length;

  const btnCloseAll = document.getElementById('btnCloseAllFromList');
  if (btnCloseAll) btnCloseAll.style.display = openCount > 0 ? 'flex' : 'none';

  const total = reports.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (laporanPage > pages) laporanPage = pages;
  const start = (laporanPage - 1) * PER_PAGE;
  const slice = reports.slice(start, start + PER_PAGE);

  tbody.innerHTML = slice
    .map((r) => {
      const statusBadge =
        r.status === 'closed'
          ? '<span class="status-badge status-lunas">Ditutup</span>'
          : '<span class="status-badge status-belum">Terbuka</span>';
      const closeBtn =
        r.status === 'open'
          ? `<button class="aksi-link tutup" onclick="tutupBukuPerTanggal('${r.date}')">Tutup</button>`
          : '';

      return `
      <tr>
        <td class="center"><span class="laporan-tgl">${fmtDateShort(r.date)}</span></td>
        <td class="center"><span class="laporan-nominal">${rupiahFormatter(r.total_revenue || 0)}</span></td>
        <td class="center"><span class="laporan-nominal">${rupiahFormatter(r.total_expense || 0)}</span></td>
        <td class="center"><span class="laporan-nominal">${rupiahFormatter(r.net_profit || 0)}</span></td>
        <td class="center">${statusBadge}</td>
        <td class="center">
          <button class="aksi-link detail-btn" data-id="${r.id}">Detail</button>
          ${closeBtn}
        </td>
      </tr>`;
    })
    .join('');

  tbody.querySelectorAll('.detail-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      openDetailLaporan(id);
    });
  });

  tbody.querySelectorAll('.aksi-link.tutup').forEach((btn) => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      tutupBukuPerTanggal(date);
    });
  });

  renderPaginationInfo(
    start + 1,
    Math.min(start + PER_PAGE, total),
    total,
    'laporan-pagination-info'
  );
  renderPaginationCtrl(
    pages,
    laporanPage,
    'laporan-pagination-ctrl',
    (page) => {
      laporanPage = page;
      renderLaporanTable(reports);
    }
  );
}

// ── Tutup Buku Per Tanggal ──
async function tutupBukuPerTanggal(date) {
  showConfirm(
    `Tutup Buku?`,
    `Tutup buku untuk tanggal ${fmtDateShort(date)}?`,
    async () => {
      try {
        const res = await fetch('/api/v1/daily-reports/close', {
          method: 'POST',
          credentials: 'include',
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        showToast(`Laporan ${fmtDateShort(date)} berhasil ditutup!`, 'success');
        fetchAllDailyReports();
        fetchCash();
      } catch (err) {
        showToast('Gagal menutup buku: ' + err.message, 'error');
      }
    }
  );
}

// ── Detail Laporan ──
async function openDetailLaporan(id) {
  try {
    const res = await fetch(`/api/v1/daily-reports/${id}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const data = json.data;
    document.getElementById('detailLaporanTanggal').textContent = fmtDateShort(
      data.date
    );
    document.getElementById('detailHeroProfit').textContent = rupiahFormatter(
      data.net_profit || 0
    );
    document.getElementById('detailHeroStatus').textContent =
      data.status === 'closed' ? 'Ditutup' : 'Terbuka';
    document.getElementById('detailHeroStatus').style.background =
      data.status === 'closed'
        ? 'rgba(72, 199, 142, 0.3)'
        : 'rgba(255, 138, 138, 0.3)';
    document.getElementById('detailRevenue').textContent = rupiahFormatter(
      data.total_revenue || 0
    );
    document.getElementById('detailExpense').textContent = rupiahFormatter(
      data.total_expense || 0
    );
    document.getElementById('detailTransactionCount').textContent =
      data.transaction_count || 0;
    document.getElementById('detailNetProfit').textContent = rupiahFormatter(
      data.net_profit || 0
    );
    document.getElementById('detailOpeningBalance').textContent =
      rupiahFormatter(data.opening_balance || 0);
    document.getElementById('detailClosingBalance').textContent =
      rupiahFormatter(data.closing_balance || 0);

    console.log(data);

    const closedInfo = document.getElementById('detailClosedInfo');
    if (data.closed_by && data.status === 'closed') {
      closedInfo.style.display = 'block';
      const userName =
        data.closed_by === 1 ? 'Admin' : `User #${data.closed_by}`;
      document.getElementById('detailClosedBy').textContent =
        `Ditutup oleh ${userName} pada ${fmtDateLong(data.closed_at)}`;
    } else {
      closedInfo.style.display = 'none';
    }

    document.getElementById('detailLaporanModal').style.display = 'flex';
  } catch (err) {
    showToast('Gagal memuat detail laporan: ' + err.message, 'error');
  }
}

// ── Tutup Buku (Hari Ini) ──
document.getElementById('btn-tutup-buku').addEventListener('click', () => {
  document.getElementById('tutupBukuModal').style.display = 'flex';
});

document
  .getElementById('btnConfirmTutupBuku')
  .addEventListener('click', async () => {
    const btn = document.getElementById('btnConfirmTutupBuku');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
      const res = await fetch('/api/v1/daily-reports/close', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Buku berhasil ditutup!', 'success');
      document.getElementById('tutupBukuModal').style.display = 'none';
      fetchDailyReport();
      fetchCash();
      fetchAllDailyReports();
    } catch (err) {
      showToast('Gagal menutup buku: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Ya, Tutup Buku';
    }
  });

// ── Tutup Semua (dari list) ──
document
  .getElementById('btnCloseAllFromList')
  .addEventListener('click', async () => {
    showConfirm(
      'Tutup Semua?',
      'Tutup semua laporan yang masih terbuka?',
      async () => {
        const btn = document.getElementById('btnCloseAllFromList');
        btn.disabled = true;
        btn.textContent = 'Memproses...';

        try {
          const res = await fetch('/api/v1/daily-reports/close-all', {
            method: 'POST',
            credentials: 'include',
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message);
          showToast('Semua laporan berhasil ditutup!', 'success');
          fetchAllDailyReports();
          fetchCash();
        } catch (err) {
          showToast('Gagal menutup semua: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = `<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.16667 12.25C0.845833 12.25 0.571181 12.1358 0.342708 11.9073C0.114236 11.6788 0 11.4042 0 11.0833V5.25C0 4.92917 0.114236 4.65451 0.342708 4.42604C0.571181 4.19757 0.845833 4.08333 1.16667 4.08333H1.75V2.91667C1.75 2.10972 2.03438 1.42188 2.60313 0.853125C3.17188 0.284375 3.85972 0 4.66667 0C5.47361 0 6.16146 0.284375 6.73021 0.853125C7.29896 1.42188 7.58333 2.10972 7.58333 2.91667V4.08333H8.16667C8.4875 4.08333 8.76215 4.19757 8.99063 4.42604C9.2191 4.65451 9.33333 4.92917 9.33333 5.25V11.0833C9.33333 11.4042 9.2191 11.6788 8.99063 11.9073C8.76215 12.1358 8.4875 12.25 8.16667 12.25H1.16667ZM1.16667 11.0833H8.16667V5.25H1.16667V11.0833ZM4.66667 9.33333C4.9875 9.33333 5.26215 9.2191 5.49062 8.99063C5.7191 8.76215 5.83333 8.4875 5.83333 8.16667C5.83333 7.84583 5.7191 7.57118 5.49062 7.34271C5.26215 7.11424 4.9875 7 4.66667 7C4.34583 7 4.07118 7.11424 3.84271 7.34271C3.61424 7.57118 3.5 7.84583 3.5 8.16667C3.5 8.4875 3.61424 8.76215 3.84271 8.99063C4.07118 9.2191 4.34583 9.33333 4.66667 9.33333ZM2.91667 4.08333H6.41667V2.91667C6.41667 2.43056 6.24653 2.01736 5.90625 1.67708C5.56597 1.33681 5.15278 1.16667 4.66667 1.16667C4.18056 1.16667 3.76736 1.33681 3.42708 1.67708C3.08681 2.01736 2.91667 2.43056 2.91667 2.91667V4.08333ZM1.16667 11.0833V5.25V11.0833Z" fill="white"/></svg>Tutup Semua yang Terlewat`;
        }
      }
    );
  });

// ── Auto-close modal ──
document.querySelectorAll('[data-close]').forEach((el) => {
  el.addEventListener('click', () => {
    const modalId = el.dataset.close;
    document.getElementById(modalId).style.display = 'none';
  });
});

document.querySelectorAll('.modal-overlay').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});

// ── Init ──
fetchDailyReport();
fetchCash();
fetchAllDailyReports();
