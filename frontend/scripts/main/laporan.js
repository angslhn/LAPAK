let currentPeriod = 'week';
let omzetChart = null;
let donutChart = null;

const fmtRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtShort = (n) => {
  if (Math.abs(n) >= 1_000_000_000)
    return `${+(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)} Jt`;
  if (Math.abs(n) >= 1_000) return `${+(n / 1_000).toFixed(1)} Rb`;
  return String(n);
};

// Format tanggal lengkap Indonesia, contoh: "Senin, 17 Juni 2026"
const fmtTanggalLengkap = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const categoryBadge = (cat) => {
  const map = {
    Minuman: 'badge-minuman',
    Makanan: 'badge-makanan',
    Snack: 'badge-snack',
  };
  return map[cat] || 'badge-minuman';
};

// ── Fetch Revenue ──
async function fetchRevenue() {
  try {
    const params = new URLSearchParams({ period: currentPeriod });
    const res = await fetch(`/api/v1/reports/revenue?${params}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderOmzetChart(json.data);
  } catch (err) {
    console.error('Gagal memuat revenue:', err.message);
  }
}

// ── Fetch Top Products ──
async function fetchTopProducts() {
  try {
    const params = new URLSearchParams({ limit: '10', period: currentPeriod });
    const res = await fetch(`/api/v1/reports/top-products?${params}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderTopProducts(json.data);
  } catch (err) {
    document.getElementById('top-products-body').innerHTML =
      `<tr><td colspan="4" style="text-align:center;padding:24px;color:#e05252">Gagal memuat produk terlaris</td></tr>`;
  }
}

// ── Fetch Categories Revenue ──
async function fetchCategoriesRevenue() {
  try {
    const res = await fetch('/api/v1/reports/categories/revenue', {
      credentials: 'include',
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

// ── Fetch Categories Quantity ──
async function fetchCategoriesQuantity() {
  try {
    const res = await fetch('/api/v1/reports/categories/quantity', {
      credentials: 'include',
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

// ── Render Omzet Chart ──
function renderOmzetChart(data) {
  const canvas = document.getElementById('omzetChart');
  if (!canvas) return;

  // Destroy existing chart properly
  if (omzetChart) {
    omzetChart.destroy();
    omzetChart = null;
  }

  const ctx = canvas.getContext('2d');

  const labels = (data.labels || []).map((l) => l.dayname || l.date || '');
  // Tanggal ISO mentah per titik, indexnya paralel dengan `labels`.
  // Dipakai khusus di tooltip (title callback) supaya tetap bisa
  // menampilkan tanggal lengkap meski sumbu-X cuma nama hari singkat.
  const isoDates = (data.labels || []).map((l) => l.date || '');
  const revenue = (data.revenue || []).map((r) => r.total || 0);
  const netProfit = (data.net_profit || []).map((p) => p.value || 0);

  // Gradients harus dibuat SETELAH canvas ada di DOM dan berukuran wajar
  const gradOmzet = ctx.createLinearGradient(0, 0, 0, 260);
  gradOmzet.addColorStop(0, 'rgba(26, 71, 49, 0.22)');
  gradOmzet.addColorStop(1, 'rgba(26, 71, 49, 0.00)');

  const gradLaba = ctx.createLinearGradient(0, 0, 0, 260);
  gradLaba.addColorStop(0, 'rgba(245, 166, 35, 0.18)');
  gradLaba.addColorStop(1, 'rgba(245, 166, 35, 0.00)');

  omzetChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Omzet Kotor',
          data: revenue,
          borderColor: '#1a4731',
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#1a4731',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          backgroundColor: gradOmzet,
          tension: 0.45,
        },
        {
          label: 'Laba Bersih',
          data: netProfit,
          borderColor: '#f5a623',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#f5a623',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          backgroundColor: gradLaba,
          tension: 0.45,
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
          backgroundColor: '#fff',
          borderColor: '#e0e3eb',
          borderWidth: 1,
          titleColor: '#1a1a2e',
          bodyColor: '#555',
          padding: 12,
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const iso = isoDates[items[0].dataIndex];
              return fmtTanggalLengkap(iso) || items[0].label;
            },
            label: (ctx) => ` ${ctx.dataset.label}: ${fmtRp(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#aaa',
            font: { size: 12 },
            maxRotation: 0,
          },
        },
        y: {
          border: { display: false },
          ticks: {
            color: '#aaa',
            font: { size: 12 },
            callback: (v) => fmtShort(v),
            maxTicksLimit: 5,
          },
          grid: { color: '#f0f0f5' },
        },
      },
    },
  });
}

// ── Render Top Products ──
function renderTopProducts(products) {
  const tbody = document.getElementById('top-products-body');
  if (!products.length) {
    tbody.innerHTML = `<tr>
    <td colspan="4" style="text-align:center;padding:60px 24px;color:#aaa;height:180px;vertical-align:middle">
      Belum ada data produk terlaris
    </td>
  </tr>`;
    return;
  }

  const thumbDefault = `
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.66667 15C1.20833 15 0.815972 14.8368 0.489583 14.5104C0.163194 14.184 0 13.7917 0 13.3333V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0H13.3333C13.7917 0 14.184 0.163194 14.5104 0.489583C14.8368 0.815972 15 1.20833 15 1.66667V13.3333C15 13.7917 14.8368 14.184 14.5104 14.5104C14.184 14.8368 13.7917 15 13.3333 15H1.66667ZM1.66667 13.3333H13.3333V1.66667H1.66667V13.3333ZM2.5 11.6667H12.5L9.375 7.5L6.875 10.8333L5 8.33333L2.5 11.6667ZM1.66667 13.3333V1.66667V13.3333Z" fill="#3E4944"/>
    </svg>
  `;

  tbody.innerHTML = products
    .map(
      (p) => `
    <tr>
      <td>
        <div class="produk-cell">
          <div class="produk-thumb">${
            p.image_url
              ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />`
              : thumbDefault
          }</div>
          <div>
            <div class="produk-name">${p.name}</div>
            <div class="produk-sku">SKU: ${p.sku || '—'}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-kategori ${categoryBadge(p.category)}">${p.category || '—'}</span></td>
      <td><span class="terjual-val">${p.qty_sold} pcs</span></td>
      <td class="right">${fmtRp(p.total_revenue)}</td>
    </tr>`
    )
    .join('');
}

// ── Render Donut Chart ──
async function renderDonutChart() {
  const [revenueData, quantityData] = await Promise.all([
    fetchCategoriesRevenue(),
    fetchCategoriesQuantity(),
  ]);

  const totalQuantity = quantityData.reduce(
    (sum, c) => sum + (c.total_quantity || 0),
    0
  );
  document.getElementById('donut-total').textContent =
    totalQuantity.toLocaleString('id-ID');

  const labels = revenueData.map((c) => c.category_name);
  const values = revenueData.map((c) => c.total);
  const colors = [
    '#1a4731',
    '#d4af37',
    '#9ca3af',
    '#48c78e',
    '#e05252',
    '#8899aa',
  ];

  const canvas = document.getElementById('distribusiChart');
  if (!canvas) return;

  if (donutChart) {
    donutChart.destroy();
    donutChart = null;
  }

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 4, // Jarak antar segmen
          borderColor: '#fff',
          hoverOffset: 8,
          hoverBorderWidth: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // true agar tetap bulat dalam container square
      cutout: '70%', // Tebal donut ring
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 600,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          borderColor: '#e0e3eb',
          borderWidth: 1,
          titleColor: '#1a1a2e',
          bodyColor: '#555',
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${fmtRp(ctx.raw)}`,
          },
        },
      },
    },
  });

  // Render legend manual
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const legend = document.getElementById('distribusi-legend');
  legend.innerHTML = revenueData
    .map(
      (c, i) => `
    <div class="legend-row">
      <div class="legend-left">
        <div class="legend-dot" style="background:${colors[i] || '#aaa'}"></div>
        ${c.category_name}
      </div>
      <span class="legend-pct">${Math.round((values[i] / total) * 100)}%</span>
    </div>`
    )
    .join('');
}

// ── Period Dropdown ──
const PERIOD_OPTIONS = [
  { value: 'week', label: 'Mingguan' },
  { value: 'month', label: 'Bulanan' },
  { value: 'year', label: 'Tahunan' },
];

let dropdownOpen = false;
const periodBtn = document.getElementById('period-btn');

function buildDropdown() {
  const dropdown = document.createElement('div');
  dropdown.style.cssText =
    'position:absolute;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid #e0e3eb;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.1);z-index:100;min-width:150px;overflow:hidden;display:none;';
  dropdown.className = 'period-dropdown';

  PERIOD_OPTIONS.forEach((opt) => {
    const item = document.createElement('div');
    item.textContent = opt.label;
    item.style.cssText = `padding:10px 16px;font-size:13px;cursor:pointer;color:#333;transition:background 0.1s;${opt.value === currentPeriod ? 'font-weight:600;color:#2d9e6b;' : ''}`;
    item.addEventListener(
      'mouseenter',
      () => (item.style.background = '#f5f6fa')
    );
    item.addEventListener('mouseleave', () => (item.style.background = ''));
    item.addEventListener('click', () => {
      currentPeriod = opt.value;
      periodBtn.childNodes[0].textContent = opt.label + ' ';
      closeDropdown();
      fetchRevenue();
      fetchTopProducts();
    });
    dropdown.appendChild(item);
  });
  return dropdown;
}

function openDropdown() {
  const dropdown = buildDropdown();
  periodBtn.style.position = 'relative';
  periodBtn.appendChild(dropdown);
  dropdown.style.display = 'block';
  dropdownOpen = true;
}

function closeDropdown() {
  document.querySelector('.period-dropdown')?.remove();
  dropdownOpen = false;
}

periodBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (dropdownOpen) closeDropdown();
  else openDropdown();
});

document.addEventListener('click', (e) => {
  if (
    dropdownOpen &&
    !e.target.closest('.period-dropdown') &&
    !e.target.closest('#period-btn')
  ) {
    closeDropdown();
  }
});

// ── Toggle Legend Dataset ──
function toggleDataset(index) {
  if (!omzetChart) return;

  const meta = omzetChart.getDatasetMeta(index);
  meta.hidden = !meta.hidden;
  omzetChart.update();

  // Update tampilan legend (dim kalau hidden)
  if (index === 0) {
    const dot = document.getElementById('legend-omzet-dot');
    const label = document.getElementById('legend-omzet');
    if (dot) dot.style.opacity = meta.hidden ? '0.3' : '1';
    if (label) label.style.opacity = meta.hidden ? '0.4' : '1';
  } else {
    const line = document.getElementById('legend-laba-line');
    const label = document.getElementById('legend-laba');
    if (line) line.style.opacity = meta.hidden ? '0.3' : '1';
    if (label) label.style.opacity = meta.hidden ? '0.4' : '1';
  }
}

// ── Legend Click ──
document
  .getElementById('legend-omzet')
  ?.addEventListener('click', () => toggleDataset(0));
document
  .getElementById('legend-laba')
  ?.addEventListener('click', () => toggleDataset(1));

// ── Init ──
fetchRevenue();
fetchTopProducts();
renderDonutChart();
