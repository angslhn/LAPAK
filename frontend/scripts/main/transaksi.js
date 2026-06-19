// ── State ──
let allTransactions = [];
let activeStatus = 'semua';
let currentPage = 1;

const PER_PAGE = 10;

// ── DOM refs ──
const tbody = document.querySelector('tbody');
const paginationInfo = document.querySelector('.pagination-info');
const paginationCtrl = document.querySelector('.pagination-ctrl');
const statusBtn = document.querySelector(
  '.topbar-actions .filter-btn:first-child'
);

// ── FETCH ──
async function fetchTransactions() {
  try {
    const res = await fetch('/api/v1/transactions', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allTransactions = json.data;
    renderAll();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#e05252">
      Gagal memuat transaksi: ${err.message}</td></tr>`;
  }
}

// ── FILTER ──
function filtered() {
  if (activeStatus === 'semua') return allTransactions;
  return allTransactions.filter((t) => t.status === activeStatus);
}

// ── RENDER SEMUA ──
function renderAll() {
  const data = filtered();
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PER_PAGE;
  const slice = data.slice(start, start + PER_PAGE);

  renderTable(slice);
  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages);
}

// ── CONSTANTS ──
const METHOD_ICON = {
  cash: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="12" viewBox="0 0 17 12" fill="none">
           <path d="M9.75 6.75C9.125 6.75 8.59375 6.53125 8.15625 6.09375C7.71875 5.65625 7.5 5.125 7.5 4.5C7.5 3.875 7.71875 3.34375 8.15625 2.90625C8.59375 2.46875 9.125 2.25 9.75 2.25C10.375 2.25 10.9062 2.46875 11.3438 2.90625C11.7812 3.34375 12 3.875 12 4.5C12 5.125 11.7812 5.65625 11.3438 6.09375C10.9062 6.53125 10.375 6.75 9.75 6.75ZM4.5 9C4.0875 9 3.73438 8.85312 3.44062 8.55937C3.14687 8.26562 3 7.9125 3 7.5V1.5C3 1.0875 3.14687 0.734375 3.44062 0.440625C3.73438 0.146875 4.0875 0 4.5 0H15C15.4125 0 15.7656 0.146875 16.0594 0.440625C16.3531 0.734375 16.5 1.0875 16.5 1.5V7.5C16.5 7.9125 16.3531 8.26562 16.0594 8.55937C15.7656 8.85312 15.4125 9 15 9H4.5ZM6 7.5H13.5C13.5 7.0875 13.6469 6.73438 13.9406 6.44063C14.2344 6.14688 14.5875 6 15 6V3C14.5875 3 14.2344 2.85313 13.9406 2.55938C13.6469 2.26562 13.5 1.9125 13.5 1.5H6C6 1.9125 5.85312 2.26562 5.55937 2.55938C5.26562 2.85313 4.9125 3 4.5 3V6C4.9125 6 5.26562 6.14688 5.55937 6.44063C5.85312 6.73438 6 7.0875 6 7.5ZM14.25 12H1.5C1.0875 12 0.734375 11.8531 0.440625 11.5594C0.146875 11.2656 0 10.9125 0 10.5V2.25H1.5V10.5H14.25V12ZM4.5 7.5V1.5V7.5Z" fill="#3E4944"/>
         </svg>`,
  qris: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
           <path d="M0 3.75V0H3.75V1.5H1.5V3.75H0ZM0 15V11.25H1.5V13.5H3.75V15H0ZM11.25 15V13.5H13.5V11.25H15V15H11.25ZM13.5 3.75V1.5H11.25V0H15V3.75H13.5ZM11.625 11.625H12.75V12.75H11.625V11.625ZM11.625 9.375H12.75V10.5H11.625V9.375ZM10.5 10.5H11.625V11.625H10.5V10.5ZM9.375 11.625H10.5V12.75H9.375V11.625ZM8.25 10.5H9.375V11.625H8.25V10.5ZM10.5 8.25H11.625V9.375H10.5V8.25ZM9.375 9.375H10.5V10.5H9.375V9.375ZM8.25 8.25H9.375V9.375H8.25V8.25ZM12.75 2.25V6.75H8.25V2.25H12.75ZM6.75 8.25V12.75H2.25V8.25H6.75ZM6.75 2.25V6.75H2.25V2.25H6.75ZM5.625 11.625V9.375H3.375V11.625H5.625ZM5.625 5.625V3.375H3.375V5.625H5.625ZM11.625 5.625V3.375H9.375V5.625H11.625Z" fill="#3E4944"/>
         </svg>`,
  transfer: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
               <path d="M2.25 12V6.75H3.75V12H2.25ZM6.75 12V6.75H8.25V12H6.75ZM0 15V13.5H15V15H0ZM11.25 12V6.75H12.75V12H11.25ZM0 5.25V3.75L7.5 0L15 3.75V5.25H0ZM3.3375 3.75H11.6625L7.5 1.6875L3.3375 3.75Z" fill="#3E4944"/>
             </svg>`,
  credit: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
             <path d="M12.5 2.5V5H10V2.5H12.5ZM7.5 2.5V5H5V2.5H7.5ZM2.5 2.5V5H0V2.5H2.5ZM12.5 7.5V10H10V7.5H12.5ZM7.5 7.5V10H5V7.5H7.5ZM2.5 7.5V10H0V7.5H2.5ZM12.5 12.5V15H10V12.5H12.5ZM7.5 12.5V15H5V12.5H7.5ZM2.5 12.5V15H0V12.5H2.5Z" fill="#3E4944"/>
           </svg>`,
  debit: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M0 12V10.5H15V12H0ZM0 6V4.5H15V6H0ZM0 9V7.5H15V9H0Z" fill="#3E4944"/>
          </svg>`,
};

const METHOD_LABEL = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
  credit: 'Kredit',
  debit: 'Debit',
};

const STATUS_BADGE = {
  paid: '<span class="badge-lunas">Lunas</span>',
  unpaid: '<span class="badge-belum">Belum Lunas</span>',
  cancelled: '<span class="badge-pending">Dibatalkan</span>',
};

// ── FORMATTERS ──
function formatDate(isoStr) {
  const d = new Date(isoStr);
  return {
    date: d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time:
      d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB',
  };
}

function formatRp(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// ── RENDER TABLE ──
function renderTable(data) {
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#aaa">
      Tidak ada transaksi ditemukan</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((t) => {
      const { date, time } = formatDate(t.date);
      const customer = t.customer_name || 'Pelanggan Umum';
      const method = t.payment_method?.toLowerCase() || 'cash';
      const icon = METHOD_ICON[method] || METHOD_ICON.cash;
      const label = METHOD_LABEL[method] || t.payment_method;
      const badge =
        STATUS_BADGE[t.status] ||
        `<span class="badge-pending">${t.status}</span>`;

      return `
      <tr data-id="${t.id}" style="cursor:pointer">
        <td class="center"><a class="trx-id">${t.invoice_number}</a></td>
        <td class="center">
          <div class="tgl-main">${date}</div>
          <div class="tgl-time">${time}</div>
        </td>
        <td class="center">${customer}</td>
        <td>
          <div class="metode-cell">
            <span class="metode-ico">${icon}</span>
            <span class="metode-lbl">${label}</span>
          </div>
        </td>
        <td class="center"><span class="total-val">${formatRp(t.total)}</span></td>
        <td class="center">${badge}</td>
      </tr>`;
    })
    .join('');

  // Klik row → detail transaksi (bisa disambung ke halaman detail)
  tbody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('click', () => {
      const id = row.dataset.id;
      console.log('Klik transaksi id:', id);
      // window.location.href = `/transaksi/${id}`;
    });
  });
}

// ── PAGINATION INFO ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} transaksi`;
}

// ── PAGINATION CTRL ──
function renderPaginationCtrl(totalPages) {
  if (totalPages <= 1) {
    paginationCtrl.innerHTML = '';
    return;
  }

  const range = [];
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);

  for (let i = left; i <= right; i++) range.push(i);

  let html = `<button class="page-btn nav-arrow" id="prev-btn" ${
    currentPage === 1 ? 'disabled' : ''
  }>‹</button>`;

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

  html += `<button class="page-btn nav-arrow" id="next-btn" ${
    currentPage === totalPages ? 'disabled' : ''
  }>›</button>`;

  paginationCtrl.innerHTML = html;

  // Event page buttons
  paginationCtrl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      renderAll();
    });
  });

  // Event prev/next
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

// ── STATUS FILTER DROPDOWN ──
const STATUS_OPTIONS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'paid', label: 'Lunas' },
  { value: 'unpaid', label: 'Belum Lunas' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

let dropdownOpen = false;
const dropdown = document.createElement('div');
dropdown.style.cssText = `
  position:absolute; top:100%; right:0; margin-top:4px;
  background:#fff; border:1px solid #e0e3eb; border-radius:8px;
  box-shadow:0 4px 16px rgba(0,0,0,0.1); z-index:100;
  min-width:160px; overflow:hidden; display:none;
`;

STATUS_OPTIONS.forEach((opt) => {
  const item = document.createElement('div');
  item.textContent = opt.label;
  item.style.cssText = `padding:10px 16px;font-size:13px;cursor:pointer;color:#333;transition:background 0.1s`;
  item.addEventListener(
    'mouseenter',
    () => (item.style.background = '#f5f6fa')
  );
  item.addEventListener('mouseleave', () => (item.style.background = ''));
  item.addEventListener('click', () => {
    activeStatus = opt.value;
    currentPage = 1;
    // Update button text (keep arrow SVG)
    const textNode = statusBtn.childNodes[0];
    if (textNode && textNode.nodeType === 3) {
      textNode.textContent = opt.label + ' ';
    } else {
      statusBtn.childNodes[0].textContent = opt.label + ' ';
    }
    dropdown.style.display = 'none';
    dropdownOpen = false;
    renderAll();
  });
  dropdown.appendChild(item);
});

statusBtn.style.position = 'relative';
statusBtn.appendChild(dropdown);

statusBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownOpen = !dropdownOpen;
  dropdown.style.display = dropdownOpen ? 'block' : 'none';
});

document.addEventListener('click', () => {
  dropdown.style.display = 'none';
  dropdownOpen = false;
});

// ── INIT ──
fetchTransactions();
