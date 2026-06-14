// ── FETCH DATA ──
async function fetchData() {
  try {
    const response = await fetch('/api/v1/dashboard', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) throw new Error(json.message);

    return json.data;
  } catch (err) {
    console.error('Gagal memuat dashboard:', err.message);
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

function getLocalDate() {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    weekday: 'long',
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
  return `<span class="badge neutral">
            <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 2.5H9" stroke="#757575" stroke-width="1.5"/>
            </svg>
            0%
          </span>`;
}

function checkTrendPercentage(value) {
  if (value > 0) return profit(value);
  if (value < 0) return loss(Math.abs(value));
  return neutral();
}

// ── RENDER SEMUA ──
async function setValues() {
  const data = await fetchData();
  if (!data) return;

  const {
    summary_metrics,
    daily_summary,
    chart_weekly_revenue,
    low_stock_products,
    top_selling_products,
  } = data;

  // ── Date ──
  const dateElement = document.getElementById('date');
  if (dateElement) dateElement.textContent = getLocalDate();

  // ── Summary Metrics ──
  const revenueElement = document.getElementById('revenue');
  const revenuePercentageElement =
    document.getElementById('revenue-percentage');
  const transactionTotalElement = document.getElementById('transaction-total');
  const transactionTotalPercentageElement = document.getElementById(
    'transaction-total-percentage'
  );
  const netProfitElement = document.getElementById('net-profit');
  const netProfitPercentageElement = document.getElementById(
    'net-profit-percentage'
  );
  const productSoldElement = document.getElementById('products-sold');
  const productSoldPercentageElement = document.getElementById(
    'products-sold-percentage'
  );

  // Revenue
  if (revenueElement) {
    revenueElement.textContent = rupiahFormatter(summary_metrics.revenue.value);
  }
  if (revenuePercentageElement) {
    revenuePercentageElement.innerHTML = checkTrendPercentage(
      summary_metrics.revenue.trend_percentage
    );
  }

  // Transaction Total
  if (transactionTotalElement) {
    transactionTotalElement.textContent =
      summary_metrics.transaction_count.value;
  }
  if (transactionTotalPercentageElement) {
    transactionTotalPercentageElement.innerHTML = checkTrendPercentage(
      summary_metrics.transaction_count.trend_percentage
    );
  }

  // Net Profit
  if (netProfitElement) {
    netProfitElement.textContent = rupiahFormatter(
      summary_metrics.net_profit.value
    );
  }
  if (netProfitPercentageElement) {
    netProfitPercentageElement.innerHTML = checkTrendPercentage(
      summary_metrics.net_profit.trend_percentage
    );
  }

  // Products Sold
  if (productSoldElement) {
    productSoldElement.textContent = summary_metrics.products_sold.value;
  }
  if (productSoldPercentageElement) {
    productSoldPercentageElement.innerHTML = checkTrendPercentage(
      summary_metrics.products_sold.trend_percentage
    );
  }

  // ── Chart Weekly Revenue ──
  renderChart(chart_weekly_revenue);

  // ── Low Stock Products ──
  renderLowStock(low_stock_products);

  // ── Top Selling Products ──
  renderTopSelling(top_selling_products);

  // ── Daily Summary ──
  renderDailySummary(daily_summary);
}

// ── RENDER CHART ──
function renderChart(chart_weekly_revenue) {
  const W = 600,
    H = 160;
  const PAD_L = 36,
    PAD_R = 20,
    PAD_T = 14,
    PAD_B = 8;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;

  const maxVal = Math.max(...chart_weekly_revenue.map((d) => d.total));
  const ceiling = maxVal === 0 ? 4000 : Math.ceil(maxVal / 1000) * 1000 * 1.25;

  function toX(i) {
    return PAD_L + (i / (chart_weekly_revenue.length - 1)) * PLOT_W;
  }
  function toY(v) {
    return PAD_T + PLOT_H - (v / ceiling) * PLOT_H;
  }

  function niceSteps(max, count) {
    const raw = max / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const nice = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((f) => f >= raw);
    return nice || raw;
  }

  const step = niceSteps(ceiling, 4);
  const ticks = [];
  for (let v = step; v <= ceiling; v += step) ticks.push(v);

  const pts = chart_weekly_revenue.map((d, i) => ({
    x: toX(i),
    y: toY(d.total),
    v: d.total,
    day: d.day,
  }));

  const svg = document.getElementById('chart');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  // Gradient
  const defs = el('defs', {});
  const grad = el('linearGradient', {
    id: 'cg',
    x1: '0',
    y1: '0',
    x2: '0',
    y2: '1',
  });
  const s1 = el('stop', {
    offset: '0%',
    'stop-color': '#00604a',
    'stop-opacity': '0.18',
  });
  const s2 = el('stop', {
    offset: '100%',
    'stop-color': '#00604a',
    'stop-opacity': '0',
  });
  grad.append(s1, s2);
  defs.append(grad);
  svg.append(defs);

  function fmtShort(v) {
    if (v === 0) return '0';
    const abs = Math.abs(v);
    if (abs >= 1_000_000_000) return `${+(v / 1_000_000_000).toPrecision(3)} M`;
    if (abs >= 1_000_000) return `${+(v / 1_000_000).toPrecision(3)} Jt`;
    if (abs >= 1_000) return `${+(v / 1_000).toPrecision(3)} Rb`;
    return String(v);
  }
  function fmtFull(v) {
    return 'Rp ' + v.toLocaleString('id-ID');
  }

  // Grid & Y labels
  ticks.forEach((v) => {
    const y = toY(v);
    svg.append(
      el('line', {
        x1: PAD_L,
        y1: y,
        x2: W - PAD_R,
        y2: y,
        stroke: '#f0f0f5',
        'stroke-width': '1',
      })
    );
    const t = el('text', {
      x: PAD_L - 4,
      y: y + 4,
      'font-size': '10',
      fill: '#ccc',
      'text-anchor': 'end',
    });
    t.textContent = fmtShort(v);
    svg.append(t);
  });

  // Baseline
  svg.append(
    el('line', {
      x1: PAD_L,
      y1: PAD_T + PLOT_H,
      x2: W - PAD_R,
      y2: PAD_T + PLOT_H,
      stroke: '#e8eaf0',
      'stroke-width': '1',
    })
  );

  // Area fill
  const areaBase = PAD_T + PLOT_H;
  const areaPts = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const lastX = pts[pts.length - 1].x;
  const firstX = pts[0].x;
  svg.append(
    el('polygon', {
      points: `${areaPts} ${lastX},${areaBase} ${firstX},${areaBase}`,
      fill: 'url(#cg)',
    })
  );

  // Line
  svg.append(
    el('polyline', {
      points: areaPts,
      fill: 'none',
      stroke: '#00604a',
      'stroke-width': '2.5',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    })
  );

  // Dots + hit areas
  const tooltip = document.getElementById('tooltip');
  const chartWrap = document.querySelector('.chart-wrap');

  pts.forEach((p, i) => {
    const isPeak = p.v === maxVal && maxVal > 0;

    const dot = el('circle', {
      cx: p.x,
      cy: p.y,
      r: isPeak ? 5 : 4,
      fill: isPeak ? '#00604a' : '#fff',
      stroke: '#00604a',
      'stroke-width': '2',
    });
    svg.append(dot);

    const hit = el('circle', {
      cx: p.x,
      cy: p.y,
      r: 14,
      fill: 'transparent',
      style: 'cursor:pointer',
    });
    hit.addEventListener('mouseenter', () => {
      const rect = chartWrap.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const scaleX = svgRect.width / W;
      const scaleY = svgRect.height / H;
      const px = svgRect.left - rect.left + p.x * scaleX;
      const py = svgRect.top - rect.top + p.y * scaleY;
      tooltip.textContent = `${p.day}: ${fmtFull(p.v)}`;
      tooltip.style.left = px + 'px';
      tooltip.style.top = py + 'px';
      tooltip.classList.add('visible');
      dot.setAttribute('r', isPeak ? 6 : 5);
      dot.setAttribute('fill', '#00604a');
    });
    hit.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
      dot.setAttribute('r', isPeak ? 5 : 4);
      dot.setAttribute('fill', isPeak ? '#00604a' : '#fff');
    });
    svg.append(hit);
  });

  // Day labels
  const labelsEl = document.getElementById('labels');
  labelsEl.innerHTML = '';
  chart_weekly_revenue.forEach((d) => {
    const s = document.createElement('span');
    s.textContent = d.day;
    labelsEl.append(s);
  });
}

// ── RENDER LOW STOCK ──
function renderLowStock(low_stock_products) {
  const stockListElement = document.getElementById('stok-list');
  if (!stockListElement || !low_stock_products) return;

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

  tableProductElement.innerHTML = top_selling_products
    .map((product, index) => productElement(product, index))
    .join('');
}

// ── RENDER DAILY SUMMARY ──
function renderDailySummary(daily_summary) {
  const transactionCountDailyElement = document.getElementById(
    'transaction-count-daily'
  );
  const grossRevenueDailyElement = document.getElementById(
    'gross-revenue-daily'
  );
  const totalExpensesDailyElement = document.getElementById(
    'total-expenses-daily'
  );
  const netProfitDailyElement = document.getElementById('net-profit-daily');

  if (transactionCountDailyElement) {
    transactionCountDailyElement.textContent = daily_summary.transaction_count;
  }
  if (grossRevenueDailyElement) {
    grossRevenueDailyElement.textContent = rupiahFormatter(
      daily_summary.gross_revenue
    );
  }
  if (totalExpensesDailyElement) {
    totalExpensesDailyElement.textContent = rupiahFormatter(
      daily_summary.total_expenses
    );
  }
  if (netProfitDailyElement) {
    netProfitDailyElement.textContent = rupiahFormatter(
      daily_summary.net_profit
    );
  }
}

// ── INIT ──
setValues();
