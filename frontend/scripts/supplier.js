// ── State ──
let allSuppliers = [];
let currentPage = 1;
const PER_PAGE = 10;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const paginationInfo = document.getElementById('pagination-info');
const paginationCtrl = document.getElementById('pagination-ctrl');

// ── SVG Icons ──
const ICON_EDIT = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.66667 13.3333H2.85417L11 5.1875L9.8125 4L1.66667 12.1458V13.3333ZM0 15V11.4583L11 0.479167C11.1667 0.326389 11.3507 0.208333 11.5521 0.125C11.7535 0.0416667 11.9653 0 12.1875 0C12.4097 0 12.625 0.0416667 12.8333 0.125C13.0417 0.208333 13.2222 0.333333 13.375 0.5L14.5208 1.66667C14.6875 1.81944 14.809 2 14.8854 2.20833C14.9618 2.41667 15 2.625 15 2.83333C15 3.05556 14.9618 3.26736 14.8854 3.46875C14.809 3.67014 14.6875 3.85417 14.5208 4.02083L3.54167 15H0ZM13.3333 2.83333L12.1667 1.66667L13.3333 2.83333ZM10.3958 4.60417L9.8125 4L11 5.1875L10.3958 4.60417Z" fill="#3E4944"/></svg>`;

const ICON_DELETE = `<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 15C2.04167 15 1.64931 14.8368 1.32292 14.5104C0.996528 14.184 0.833333 13.7917 0.833333 13.3333V2.5H0V0.833333H4.16667V0H9.16667V0.833333H13.3333V2.5H12.5V13.3333C12.5 13.7917 12.3368 14.184 12.0104 14.5104C11.684 14.8368 11.2917 15 10.8333 15H2.5ZM10.8333 2.5H2.5V13.3333H10.8333V2.5ZM4.16667 11.6667H5.83333V4.16667H4.16667V11.6667ZM7.5 11.6667H9.16667V4.16667H7.5V11.6667ZM2.5 2.5V13.3333V2.5Z" fill="#3E4944"/></svg>`;

// ── Fetch ──
async function fetchSuppliers() {
  try {
    const res = await fetch('/api/v1/suppliers', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allSuppliers = json.data;
    renderAll();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat supplier: ${err.message}</td></tr>`;
  }
}

// ── Render All ──
function renderAll() {
  const total = allSuppliers.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PER_PAGE;
  const slice = allSuppliers.slice(start, start + PER_PAGE);

  renderTable(slice);
  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages);
}

// ── Render Table ──
function renderTable(data) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Belum ada supplier</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map((s) => {
      // Format tanggal terakhir (created_at sebagai fallback)
      const lastDate = s.created_at
        ? new Date(s.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

      return `
      <tr data-id="${s.id}">
        <td><span class="supplier-name">${s.name}</span></td>
        <td><span class="phone-val">${s.phone || '—'}</span></td>
        <td><span class="alamat-val">${s.address || '—'}</span></td>
        <td class="center"><span class="tgl-val">${lastDate}</span></td>
        <td class="center">
          <div class="aksi-cell">
            <button class="aksi-btn edit" title="Edit" data-id="${s.id}" data-name="${s.name}">
              ${ICON_EDIT}
            </button>
            <button class="aksi-btn delete" title="Hapus" data-id="${s.id}" data-name="${s.name}">
              ${ICON_DELETE}
            </button>
          </div>
        </td>
      </tr>`;
    })
    .join('');

  // Event: Edit (TODO: modal edit, GET only for now)
  tableBody.querySelectorAll('.aksi-btn.edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      console.log('Edit supplier:', id, name);
    });
  });

  // Event: Delete
  tableBody.querySelectorAll('.aksi-btn.delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (!confirm(`Hapus supplier "${name}"?`)) return;
      await deleteSupplier(id);
    });
  });
}

// ── Delete ──
async function deleteSupplier(id) {
  try {
    const res = await fetch(`/api/v1/suppliers/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allSuppliers = allSuppliers.filter((s) => s.id !== Number(id));
    renderAll();
  } catch (err) {
    alert('Gagal menghapus supplier: ' + err.message);
  }
}

// ── Pagination Info ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} supplier`;
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

// ── Init ──
fetchSuppliers();
