let weeklyChart = null;

// ── FETCH DATA ──
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (err) {
    console.error('Gagal memuat data:', err.message);
    return null;
  }
}

// ── FORMATTERS ──
function rupiahFormatter(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function fmtShort(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${+(n / 1_000_000_000).toFixed(1)} M`;
  if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)} Jt`;
  if (abs >= 1_000) return `${+(n / 1_000).toFixed(1)} Rb`;
  return String(n);
}

function getLocalDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function fmtDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── TREND BADGES ──
function profit(value) {
  return `<span class="badge up">
    <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.583333 5L0 4.41667L3.08333 1.3125L4.75 2.97917L6.91667 0.833333H5.83333V0H8.33333V2.5H7.5V1.41667L4.75 4.16667L3.08333 2.5L0.583333 5Z" fill="#4CAF50"/>
    </svg>
    +${value}%
  </span>`;
}

function loss(value) {
  return `<span class="badge down">
    <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.83333 5V4.16667H6.91667L4.75 2.02083L3.08333 3.6875L0 0.583333L0.583333 0L3.08333 2.5L4.75 0.833333L7.5 3.58333V2.5H8.33333V5H5.83333Z" fill="#BA1A1A"/>
    </svg>
    -${value}%
  </span>`;
}

function neutral() {
  return `<span class="badge neutral">— 0%</span>`;
}

function checkTrendPercentage(value) {
  if (value > 0) return profit(value);
  if (value < 0) return loss(Math.abs(value));
  return neutral();
}

// ── RENDER CHART (Chart.js) ──
function renderChart(chart_weekly_revenue) {
  const chartWrap = document.querySelector('.chart-wrap');
  if (!chartWrap) return;

  chartWrap.innerHTML = '';

  const oldLabels = document.getElementById('labels');
  if (oldLabels) oldLabels.remove();

  const canvasWrap = document.createElement('div');
  canvasWrap.style.cssText = 'position:relative;width:100%;height:180px;';

  const canvas = document.createElement('canvas');
  canvas.id = 'weeklyChart';
  canvasWrap.appendChild(canvas);
  chartWrap.appendChild(canvasWrap);

  if (weeklyChart) {
    weeklyChart.destroy();
    weeklyChart = null;
  }

  const ctx = canvas.getContext('2d');
  const labels = chart_weekly_revenue.map((d) => d.day);
  const values = chart_weekly_revenue.map((d) => d.total);

  const maxVal = Math.max(...values);

  const grad = ctx.createLinearGradient(0, 0, 0, 180);
  grad.addColorStop(0, 'rgba(0, 96, 74, 0.15)');
  grad.addColorStop(1, 'rgba(0, 96, 74, 0.00)');

  weeklyChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: values,
          borderColor: '#00604a',
          borderWidth: 2.5,
          pointRadius: values.map((v) => (v === maxVal && maxVal > 0 ? 5 : 4)),
          pointHoverRadius: values.map((v) =>
            v === maxVal && maxVal > 0 ? 6 : 5
          ),
          pointBackgroundColor: values.map((v) =>
            v === maxVal && maxVal > 0 ? '#00604a' : '#fff'
          ),
          pointBorderColor: '#00604a',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#00604a',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          backgroundColor: grad,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a2e22',
          titleColor: 'rgba(255,255,255,0.6)',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => rupiahFormatter(item.raw),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#aaa',
            font: { size: 11 },
            maxRotation: 0,
          },
        },
        y: {
          border: { display: false },
          grid: { color: '#f0f0f5' },
          ticks: {
            color: '#ccc',
            font: { size: 10 },
            callback: (v) => fmtShort(v),
            maxTicksLimit: 4,
          },
        },
      },
    },
  });
}

// ── RENDER LOW STOCK ──
function renderLowStock(low_stock_products) {
  const stockListElement = document.getElementById('stok-list');
  if (!stockListElement || !low_stock_products) return;

  if (!low_stock_products.length) {
    stockListElement.innerHTML = `<p style="font-size:12px;color:#aaa;text-align:center;padding:16px 0">Tidak ada produk stok kritis</p>`;
    return;
  }

  const stockElement = (product) => `
    <div class="stok-item">
      <div class="stok-info">
        <div class="stok-ico">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.75 11.6667C1.42917 11.6667 1.15451 11.5524 0.926042 11.324C0.697569 11.0955 0.583333 10.8208 0.583333 10.5V3.92292C0.408333 3.81597 0.267361 3.67743 0.160417 3.50729C0.0534722 3.33715 0 3.14028 0 2.91667V1.16667C0 0.845833 0.114236 0.571181 0.342708 0.342708C0.571181 0.114236 0.845833 0 1.16667 0H10.5C10.8208 0 11.0955 0.114236 11.324 0.342708C11.5524 0.571181 11.6667 0.845833 11.6667 1.16667V2.91667C11.6667 3.14028 11.6132 3.33715 11.5063 3.50729C11.3993 3.67743 11.2583 3.81597 11.0833 3.92292V10.5C11.0833 10.8208 10.9691 11.0955 10.7406 11.324C10.5122 11.5524 10.2375 11.6667 9.91667 11.6667H1.75ZM1.75 4.08333V10.5H9.91667V4.08333H1.75ZM1.16667 2.91667H10.5V1.16667H1.16667V2.91667ZM4.08333 7H7.58333V5.83333H4.08333V7Z" fill="#3E4944"/>
          </svg>
        </div>
        <div>
          <div class="stok-name">${product.name}</div>
          <div class="stok-price">${rupiahFormatter(product.price)}</div>
        </div>
      </div>
      <div>
        <div class="stok-qty">${product.stock}</div>
        <div class="stok-sisa">Sisa</div>
      </div>
    </div>`;

  stockListElement.innerHTML = low_stock_products
    .map((product) => stockElement(product))
    .join('');
}

// ── RENDER TOP SELLING ──
function renderTopSelling(top_selling_products) {
  const tableProductElement = document.getElementById(
    'top-selling-product-list'
  );
  if (!tableProductElement || !top_selling_products) return;

  if (!top_selling_products.length) {
    tableProductElement.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#aaa">Belum ada data produk terlaris hari ini</td></tr>`;
    return;
  }

  const top5 = top_selling_products.slice(0, 5);

  const productElement = (product, index) => {
    const initial = product.name
      ? product.name.substring(0, 2).toUpperCase()
      : 'PR';
    const rank = index + 1;
    const badgeClass = rank <= 5 ? `b${rank}` : 'b5';
    return `
      <tr>
        <td>
          <div class="prod-cell">
            <span class="prod-badge ${badgeClass}">${initial}</span>
            ${product.name}
          </div>
        </td>
        <td><span class="cat-pill">${product.category}</span></td>
        <td>${product.qty_sold}</td>
        <td>${rupiahFormatter(product.total_revenue)}</td>
      </tr>`;
  };

  tableProductElement.innerHTML = top5
    .map((product, index) => productElement(product, index))
    .join('');
}

// ── RENDER DAILY SUMMARY ──
function renderDailySummary(daily_summary) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('transaction-count-daily', daily_summary.transaction_count);
  set('gross-revenue-daily', rupiahFormatter(daily_summary.gross_revenue));
  set('total-expenses-daily', rupiahFormatter(daily_summary.total_expenses));
  set('net-profit-daily', rupiahFormatter(daily_summary.net_profit));
}

// ── RENDER CLOSURE BANNER ──
function renderClosureBanner(daily_closure) {
  const banner = document.getElementById('closureBanner');
  if (!banner || !daily_closure) return;

  // Cek localStorage buat dismiss
  const dismissed = localStorage.getItem('closureBannerDismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const now = Date.now();
    // Sembunyiin 24 jam
    if (now - dismissedTime < 24 * 60 * 60 * 1000) {
      banner.style.display = 'none';
      return;
    } else {
      localStorage.removeItem('closureBannerDismissed');
    }
  }

  if (!daily_closure.hasPendingClosures) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = 'flex';

  document.getElementById('closureBannerTitle').textContent =
    `Ada ${daily_closure.count} hari buku kas yang belum ditutup`;
  document.getElementById('closureBannerSub').textContent =
    `Mulai dari tanggal ${fmtDateShort(daily_closure.earliestDate)}`;

  // Handler tombol
  document.getElementById('btnClosureDismiss').onclick = () => {
    localStorage.setItem('closureBannerDismissed', Date.now().toString());
    banner.style.display = 'none';
  };

  document.getElementById('btnClosureCloseAll').onclick = async () => {
    const btn = document.getElementById('btnClosureCloseAll');
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
      banner.style.display = 'none';
      localStorage.removeItem('closureBannerDismissed');
      // Refresh dashboard
      // setTimeout(() => location.reload(), 500);
    } catch (err) {
      showToast('Gagal menutup buku: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.16667 12.25C0.845833 12.25 0.571181 12.1358 0.342708 11.9073C0.114236 11.6788 0 11.4042 0 11.0833V5.25C0 4.92917 0.114236 4.65451 0.342708 4.42604C0.571181 4.19757 0.845833 4.08333 1.16667 4.08333H1.75V2.91667C1.75 2.10972 2.03438 1.42188 2.60313 0.853125C3.17188 0.284375 3.85972 0 4.66667 0C5.47361 0 6.16146 0.284375 6.73021 0.853125C7.29896 1.42188 7.58333 2.10972 7.58333 2.91667V4.08333H8.16667C8.4875 4.08333 8.76215 4.19757 8.99063 4.42604C9.2191 4.65451 9.33333 4.92917 9.33333 5.25V11.0833C9.33333 11.4042 9.2191 11.6788 8.99063 11.9073C8.76215 12.1358 8.4875 12.25 8.16667 12.25H1.16667ZM1.16667 11.0833H8.16667V5.25H1.16667V11.0833ZM4.66667 9.33333C4.9875 9.33333 5.26215 9.2191 5.49062 8.99063C5.7191 8.76215 5.83333 8.4875 5.83333 8.16667C5.83333 7.84583 5.7191 7.57118 5.49062 7.34271C5.26215 7.11424 4.9875 7 4.66667 7C4.34583 7 4.07118 7.11424 3.84271 7.34271C3.61424 7.57118 3.5 7.84583 3.5 8.16667C3.5 8.4875 3.61424 8.76215 3.84271 8.99063C4.07118 9.2191 4.34583 9.33333 4.66667 9.33333ZM2.91667 4.08333H6.41667V2.91667C6.41667 2.43056 6.24653 2.01736 5.90625 1.67708C5.56597 1.33681 5.15278 1.16667 4.66667 1.16667C4.18056 1.16667 3.76736 1.33681 3.42708 1.67708C3.08681 2.01736 2.91667 2.43056 2.91667 2.91667V4.08333ZM1.16667 11.0833V5.25V11.0833Z" fill="white"/></svg>Tutup Semua`;
    }
  };
}

// ── RENDER TODAY STATUS ──
async function renderTodayStatus() {
  const statusEl = document.getElementById('ringkasanStatus');
  if (!statusEl) return;

  const todayData = await fetchData('/api/v1/daily-reports/today');
  if (!todayData) {
    statusEl.textContent = '';
    return;
  }

  if (todayData.status === 'closed') {
    statusEl.textContent = 'Buku Kas Sudah Ditutup';
    statusEl.className = 'ringkasan-status closed';
  } else {
    statusEl.textContent = 'Buku Kas Belum Ditutup';
    statusEl.className = 'ringkasan-status open';
  }
}

// ── RENDER SEMUA ──
async function setValues() {
  const data = await fetchData('/api/v1/dashboard');
  if (!data) return;

  const {
    summary_metrics,
    daily_summary,
    chart_weekly_revenue,
    low_stock_products,
    top_selling_products,
    daily_closure,
  } = data;

  // Date
  const dateEl = document.getElementById('date');
  if (dateEl) dateEl.textContent = getLocalDate();

  // Summary Metrics
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  };
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('revenue', rupiahFormatter(summary_metrics.revenue.value));
  set(
    'revenue-percentage',
    checkTrendPercentage(summary_metrics.revenue.trend_percentage)
  );

  setText('transaction-total', summary_metrics.transaction_count.value);
  set(
    'transaction-total-percentage',
    checkTrendPercentage(summary_metrics.transaction_count.trend_percentage)
  );

  setText('net-profit', rupiahFormatter(summary_metrics.net_profit.value));
  set(
    'net-profit-percentage',
    checkTrendPercentage(summary_metrics.net_profit.trend_percentage)
  );

  setText('products-sold', summary_metrics.products_sold.value);
  set(
    'products-sold-percentage',
    checkTrendPercentage(summary_metrics.products_sold.trend_percentage)
  );

  // Chart
  renderChart(chart_weekly_revenue);

  // Sections
  renderLowStock(low_stock_products);
  renderTopSelling(top_selling_products);
  renderDailySummary(daily_summary);
  renderClosureBanner(daily_closure);

  await renderTodayStatus();
}

document.querySelector('.btn-restok').addEventListener('click', () => {
  window.location.href = '/stok-barang';
});

// ── INIT ──
setValues();
