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

const todayStr = new Date().toISOString().slice(0, 10);

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

// ── Fetch Cash (pengeluaran + ringkasan kas laci) ──
async function fetchCash() {
  try {
    const res = await fetch(`/api/v1/cash?date=${todayStr}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderCashSummary(json.data);
    renderExpenseTable(json.data.mutations || []);
  } catch (err) {
    document.getElementById('pengeluaran-table-body').innerHTML =
      `<tr><td colspan="4" style="text-align:center;padding:24px;color:#e05252">Gagal memuat pengeluaran</td></tr>`;
  }
}

function renderCashSummary(data) {
  const income = data.summary?.income || 0;
  const expense = data.summary?.expense || 0;
  document.getElementById('kas-masuk').textContent =
    `+ ${rupiahFormatter(income)}`;
  document.getElementById('kas-keluar').textContent =
    `- ${rupiahFormatter(expense)}`;
  document.getElementById('kas-akhir').textContent = rupiahFormatter(
    income - expense
  );
}

function renderExpenseTable(mutations) {
  const expenses = mutations.filter((m) => m.type === 'expense');
  const tbody = document.getElementById('pengeluaran-table-body');

  if (!expenses.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#aaa">Belum ada pengeluaran hari ini</td></tr>`;
    return;
  }

  const categoryMap = {
    operational: 'badge-operasional',
    konsumsi: 'badge-konsumsi',
    logistik: 'badge-logistik',
  };

  tbody.innerHTML = expenses
    .map((e) => {
      const cat = e.category || 'operational';
      const catClass = categoryMap[cat] || 'badge-operasional';
      const catLabel =
        {
          operational: 'Operasional',
          konsumsi: 'Konsumsi',
          logistik: 'Logistik',
        }[cat] || cat;
      return `
      <tr>
        <td><span class="waktu-val">${fmtTime(e.created_at || e.date)}</span></td>
        <td><span class="ket-val">${e.note || '—'}</span></td>
        <td><span class="badge-kategori ${catClass}">${catLabel}</span></td>
        <td class="right"><span class="nominal-val">${rupiahFormatter(e.amount)}</span></td>
      </tr>`;
    })
    .join('');
}

// ── Tutup Buku ──
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

// ── Tutup Buku ──
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
    } catch (err) {
      showToast('Gagal menutup buku: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Ya, Tutup Buku';
    }
  });

// ── Auto-close modal ──
document.querySelectorAll('[data-close]').forEach((el) => {
  el.addEventListener('click', () => {
    const modalId = el.dataset.close;
    document.getElementById(modalId).style.display = 'none';
  });
});

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});

// ── Init ──
fetchDailyReport();
fetchCash();
