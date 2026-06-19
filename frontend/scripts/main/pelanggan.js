// ── State ──
let allCustomers = [];
let currentPage = 1;
const PER_PAGE = 10;
let editingId = null;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const paginationInfo = document.getElementById('pagination-info');
const paginationCtrl = document.getElementById('pagination-ctrl');
const btnTambah = document.querySelector('.btn-primary');

// Modal refs
const modal = document.getElementById('customerModal');
const modalTitle = document.getElementById('modalTitle');
const customerNameInput = document.getElementById('customerName');
const customerPhoneInput = document.getElementById('customerPhone');
const submitBtn = document.getElementById('submitCustomerBtn');

// ── SVG Icons ──
const ICON_EDIT = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.66667 13.3333H2.85417L11 5.1875L9.8125 4L1.66667 12.1458V13.3333ZM0 15V11.4583L11 0.479167C11.1667 0.326389 11.3507 0.208333 11.5521 0.125C11.7535 0.0416667 11.9653 0 12.1875 0C12.4097 0 12.625 0.0416667 12.8333 0.125C13.0417 0.208333 13.2222 0.333333 13.375 0.5L14.5208 1.66667C14.6875 1.81944 14.809 2 14.8854 2.20833C14.9618 2.41667 15 2.625 15 2.83333C15 3.05556 14.9618 3.26736 14.8854 3.46875C14.809 3.67014 14.6875 3.85417 14.5208 4.02083L3.54167 15H0ZM13.3333 2.83333L12.1667 1.66667L13.3333 2.83333ZM10.3958 4.60417L9.8125 4L11 5.1875L10.3958 4.60417Z" fill="#3E4944"/></svg>`;

// ── Fetch ──
async function fetchCustomers() {
  try {
    const res = await fetch('/api/v1/customers', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    allCustomers = json.data;
    renderAll();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#e05252">Gagal memuat pelanggan: ${err.message}</td></tr>`;
  }
}

// ── Render All ──
function renderAll() {
  const total = allCustomers.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PER_PAGE;
  const slice = allCustomers.slice(start, start + PER_PAGE);

  renderTable(slice, start);
  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages);
}

// ── Render Table ──
function renderTable(data, offset) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#aaa">Belum ada pelanggan</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (c, i) => `
    <tr data-id="${c.id}">
      <td class="no-val center">${offset + i + 1}</td>
      <td class="nama-val center">${c.name}</td>
      <td class="telp-val center">${c.phone || '—'}</td>
      <td class="center">
        <div class="aksi-cell">
          <button class="aksi-btn edit" title="Edit" data-id="${c.id}" data-name="${c.name}" data-phone="${c.phone || ''}">
            ${ICON_EDIT}
          </button>
        </div>
      </td>
    </tr>`
    )
    .join('');

  // Event: Edit
  tableBody.querySelectorAll('.aksi-btn.edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const name = btn.dataset.name;
      const phone = btn.dataset.phone;
      openModal(true, { id, name, phone });
    });
  });
}

// ── Pagination ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} pelanggan`;
}

function renderPaginationCtrl(totalPages) {
  if (totalPages <= 1) {
    paginationCtrl.innerHTML = '';
    return;
  }

  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);

  let html = `<button class="page-btn nav-arrow" id="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  if (left > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (left > 2) html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
  }
  range.forEach((p) => {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  });
  if (right < totalPages) {
    if (right < totalPages - 1)
      html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
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

// ── MODAL LOGIC ──
function openModal(isEdit = false, customer = null) {
  if (isEdit && customer) {
    editingId = customer.id;
    modalTitle.textContent = 'Edit Pelanggan';
    customerNameInput.value = customer.name;
    customerPhoneInput.value = customer.phone || '';
    submitBtn.textContent = 'Perbarui';
  } else {
    editingId = null;
    modalTitle.textContent = 'Tambah Pelanggan';
    customerNameInput.value = '';
    customerPhoneInput.value = '';
    submitBtn.textContent = 'Simpan';
  }
  modal.style.display = 'flex';
  setTimeout(() => customerNameInput.focus(), 100);
}

function closeModal() {
  modal.style.display = 'none';
  editingId = null;
  customerNameInput.value = '';
  customerPhoneInput.value = '';
}

async function submitCustomer() {
  const name = customerNameInput.value.trim();
  const phone = customerPhoneInput.value.trim();

  // Validasi
  if (!name) return showToast('Nama pelanggan wajib diisi', 'error');
  if (name.length < 2) return showToast('Nama minimal 2 karakter', 'error');
  if (name.length > 150)
    return showToast('Nama maksimal 150 karakter', 'error');
  if (!/^[a-zA-Z\s.]+$/.test(name))
    return showToast('Nama hanya boleh huruf, spasi, dan titik', 'error');

  if (phone) {
    if (!/^0\d{6,14}$/.test(phone))
      return showToast('Nomor telepon harus diawali 0, 7-15 digit', 'error');
  }

  const isEdit = editingId !== null;
  const url = isEdit ? `/api/v1/customers/${editingId}` : '/api/v1/customers';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone || undefined }),
    });

    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || 'Gagal menyimpan pelanggan');

    showToast(
      isEdit
        ? 'Pelanggan berhasil diperbarui'
        : 'Pelanggan baru berhasil ditambahkan'
    );
    closeModal();
    fetchCustomers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? 'Perbarui' : 'Simpan';
  }
}

// ── Events ──
btnTambah?.addEventListener('click', () => openModal(false));
document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
document
  .getElementById('cancelModalBtn')
  ?.addEventListener('click', closeModal);
submitBtn?.addEventListener('click', submitCustomer);

modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

customerNameInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitCustomer();
});
customerPhoneInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitCustomer();
});

// ── Init ──
fetchCustomers();
