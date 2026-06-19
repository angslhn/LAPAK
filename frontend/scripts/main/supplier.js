// ── State ──
let allSuppliers = [];
let currentPage = 1;
const PER_PAGE = 10;
let editingId = null;

// ── DOM refs ──
const tableBody = document.getElementById('table-body');
const paginationInfo = document.getElementById('pagination-info');
const paginationCtrl = document.getElementById('pagination-ctrl');
const btnTambah = document.querySelector('.btn-primary');

// Modal refs
const supplierModal = document.getElementById('supplierModal');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitSupplierBtn');
const detailModal = document.getElementById('detailSupplierModal');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');

// ── SVG Icons ──
const ICON_EDIT = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.66667 13.3333H2.85417L11 5.1875L9.8125 4L1.66667 12.1458V13.3333ZM0 15V11.4583L11 0.479167C11.1667 0.326389 11.3507 0.208333 11.5521 0.125C11.7535 0.0416667 11.9653 0 12.1875 0C12.4097 0 12.625 0.0416667 12.8333 0.125C13.0417 0.208333 13.2222 0.333333 13.375 0.5L14.5208 1.66667C14.6875 1.81944 14.809 2 14.8854 2.20833C14.9618 2.41667 15 2.625 15 2.83333C15 3.05556 14.9618 3.26736 14.8854 3.46875C14.809 3.67014 14.6875 3.85417 14.5208 4.02083L3.54167 15H0ZM13.3333 2.83333L12.1667 1.66667L13.3333 2.83333ZM10.3958 4.60417L9.8125 4L11 5.1875L10.3958 4.60417Z" fill="#3E4944"/></svg>`;

const ICON_DELETE = `<svg width="14" height="15" viewBox="0 0 14 15" fill="none"><path d="M2.5 15C2.04167 15 1.64931 14.8368 1.32292 14.5104C0.996528 14.184 0.833333 13.7917 0.833333 13.3333V2.5H0V0.833333H4.16667V0H9.16667V0.833333H13.3333V2.5H12.5V13.3333C12.5 13.7917 12.3368 14.184 12.0104 14.5104C11.684 14.8368 11.2917 15 10.8333 15H2.5ZM10.8333 2.5H2.5V13.3333H10.8333V2.5ZM4.16667 11.6667H5.83333V4.16667H4.16667V11.6667ZM7.5 11.6667H9.16667V4.16667H7.5V11.6667ZM2.5 2.5V13.3333V2.5Z" fill="#3E4944"/></svg>`;

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
      const lastDate = s.created_at
        ? new Date(s.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

      return `
      <tr data-id="${s.id}" style="cursor:pointer;">
        <td class="center"><span class="supplier-name">${s.name}</span></td>
        <td class="center"><span class="phone-val">${s.phone || '—'}</span></td>
        <td class="center"><span class="alamat-val">${s.address || '—'}</span></td>
        <td class="center"><span class="tgl-val">${lastDate}</span></td>
        <td class="center" onclick="event.stopPropagation();">
          <div class="aksi-cell">
            <button class="aksi-btn edit" title="Edit" data-id="${s.id}">${ICON_EDIT}</button>
            <button class="aksi-btn delete" title="Hapus" data-id="${s.id}" data-name="${s.name}">${ICON_DELETE}</button>
          </div>
        </td>
      </tr>`;
    })
    .join('');

  // Klik baris → Detail
  tableBody.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', () => {
      const id = Number(row.dataset.id);
      const supplier = allSuppliers.find((s) => s.id === id);
      if (supplier) openDetailModal(supplier);
    });
  });

  // Edit
  tableBody.querySelectorAll('.aksi-btn.edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const supplier = allSuppliers.find((s) => s.id === id);
      if (supplier) openFormModal(true, supplier);
    });
  });

  // Delete
  tableBody.querySelectorAll('.aksi-btn.delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const name = btn.dataset.name;
      openDeleteConfirmModal(id, name);
    });
  });
}

// ── Pagination ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} supplier`;
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

// ── FORM MODAL (Tambah/Edit) ──
function openFormModal(isEdit = false, supplier = null) {
  if (isEdit && supplier) {
    editingId = supplier.id;
    modalTitle.textContent = 'Edit Supplier';
    document.getElementById('supplierName').value = supplier.name || '';
    document.getElementById('supplierPhone').value = supplier.phone || '';
    document.getElementById('supplierEmail').value = supplier.email || '';
    document.getElementById('supplierContactPerson').value =
      supplier.contact_person || '';
    document.getElementById('supplierAddress').value = supplier.address || '';
    document.getElementById('supplierNote').value = supplier.note || '';
    submitBtn.textContent = 'Perbarui';
    setTimeout(() => {
      document.getElementById('supplierName').focus();
      const len = document.getElementById('supplierName').value.length;
      document.getElementById('supplierName').setSelectionRange(len, len);
    }, 100);
  } else {
    editingId = null;
    modalTitle.textContent = 'Tambah Supplier';
    document.getElementById('supplierName').value = '';
    document.getElementById('supplierPhone').value = '';
    document.getElementById('supplierEmail').value = '';
    document.getElementById('supplierContactPerson').value = '';
    document.getElementById('supplierAddress').value = '';
    document.getElementById('supplierNote').value = '';
    submitBtn.textContent = 'Simpan';
    setTimeout(() => document.getElementById('supplierName').focus(), 100);
  }
  supplierModal.style.display = 'flex';
}

function closeFormModal() {
  supplierModal.style.display = 'none';
  editingId = null;
}

async function submitSupplier() {
  const name = document.getElementById('supplierName').value.trim();
  const phone = document.getElementById('supplierPhone').value.trim();
  const email = document.getElementById('supplierEmail').value.trim();
  const contactPerson = document
    .getElementById('supplierContactPerson')
    .value.trim();
  const address = document.getElementById('supplierAddress').value.trim();
  const note = document.getElementById('supplierNote').value.trim();

  if (!name) return showToast('Nama supplier wajib diisi', 'error');
  if (name.length < 2) return showToast('Nama minimal 2 karakter', 'error');

  const isEdit = editingId !== null;
  const url = isEdit ? `/api/v1/suppliers/${editingId}` : '/api/v1/suppliers';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone: phone || undefined,
        email: email || undefined,
        contact_person: contactPerson || undefined,
        address: address || undefined,
        note: note || undefined,
      }),
    });

    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || 'Gagal menyimpan supplier');

    showToast(
      isEdit
        ? 'Supplier berhasil diperbarui'
        : 'Supplier baru berhasil ditambahkan'
    );
    closeFormModal();
    fetchSuppliers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? 'Perbarui' : 'Simpan';
  }
}

// ── DETAIL MODAL ──
function openDetailModal(supplier) {
  document.getElementById('detailName').textContent = supplier.name || '—';
  document.getElementById('detailPhone').textContent = supplier.phone || '—';
  document.getElementById('detailEmail').textContent = supplier.email || '—';
  document.getElementById('detailContactPerson').textContent =
    supplier.contact_person || '—';
  document.getElementById('detailAddress').textContent =
    supplier.address || '—';
  document.getElementById('detailNote').textContent = supplier.note || '—';
  detailModal.style.display = 'flex';
}

function closeDetailModal() {
  detailModal.style.display = 'none';
}

// ── DELETE CONFIRM MODAL ──
async function openDeleteConfirmModal(id, name) {
  let hasDebt = false;
  let totalDebt = 0;

  try {
    const res = await fetch(`/api/v1/debts/suppliers`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (json.success && json.data) {
      const debt = json.data.find(
        (d) => d.supplier_id === id && d.status === 'unpaid'
      );
      if (debt) {
        hasDebt = true;
        totalDebt = debt.total || 0;
      }
    }
  } catch (err) {
    console.error('Error checking debt:', err);
  }

  const dialog = document.getElementById('deleteConfirmDialog');

  if (hasDebt) {
    dialog.innerHTML = `
      <div class="confirm-icon danger">
        <svg width="25" viewBox="0 0 20 20" fill="none"><path d="M10 15C10.2833 15 10.5208 14.9042 10.7125 14.7125C10.9042 14.5208 11 14.2833 11 14C11 13.7167 10.9042 13.4792 10.7125 13.2875C10.5208 13.0958 10.2833 13 10 13C9.71667 13 9.47917 13.0958 9.2875 13.2875C9.09583 13.4792 9 13.7167 9 14C9 14.2833 9.09583 14.5208 9.2875 14.7125C9.47917 14.9042 9.71667 15 10 15ZM9 11H11V5H9V11ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#BA1A1A"/></svg>
      </div>
      <h3 class="confirm-title">Tindakan Ditolak</h3>
      <p class="confirm-message">Supplier <strong>${name}</strong> tidak dapat dihapus karena masih memiliki hutang aktif yang belum diselesaikan pada sistem.</p>
      <div class="confirm-debt-box">Total Hutang Berjalan: Rp ${Number(totalDebt).toLocaleString('id-ID')}</div>
      <div class="confirm-actions">
        <button class="btn-confirm-secondary" id="btnTutupDebt">Tutup</button>
      </div>`;

    // Event listener
    setTimeout(() => {
      document
        .getElementById('btnTutupDebt')
        ?.addEventListener('click', closeDeleteConfirmModal);
    }, 50);
  } else {
    dialog.innerHTML = `
      <div class="confirm-icon danger">
        <svg width="25" viewBox="0 0 22 19" fill="none"><path d="M0 19L11 0L22 19H0ZM11 16C11.2833 16 11.5208 15.9042 11.7125 15.7125C11.9042 15.5208 12 15.2833 12 15C12 14.7167 11.9042 14.4792 11.7125 14.2875C11.5208 14.0958 11.2833 14 11 14C10.7167 14 10.4792 14.0958 10.2875 14.2875C10.0958 14.4792 10 14.7167 10 15C10 15.2833 10.0958 15.5208 10.2875 15.7125C10.4792 15.9042 10.7167 16 11 16ZM10 13H12V8H10V13Z" fill="#BA1A1A"/></svg>
      </div>
      <h3 class="confirm-title">Hapus Supplier?</h3>
      <p class="confirm-message">Apakah Anda yakin ingin menghapus pemasok <strong>"${name}"</strong>? Seluruh riwayat transaksi yang terselesaikan akan tetap disimpan sebagai arsip, namun profil pemasok akan dihilangkan.</p>
      <div class="confirm-actions">
        <button class="btn-confirm-secondary" id="btnBatalHapus">Batal</button>
        <button class="btn-confirm-danger" id="confirmDeleteBtn">Hapus</button>
      </div>`;

    // Event listener
    setTimeout(() => {
      document
        .getElementById('btnBatalHapus')
        ?.addEventListener('click', closeDeleteConfirmModal);
      document
        .getElementById('confirmDeleteBtn')
        ?.addEventListener('click', async () => {
          closeDeleteConfirmModal();
          await deleteSupplier(id);
        });
    }, 50);
  }

  deleteConfirmModal.style.display = 'flex';
}

function closeDeleteConfirmModal() {
  deleteConfirmModal.style.display = 'none';
}

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
    showToast('Supplier berhasil dihapus');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Events ──
btnTambah?.addEventListener('click', () => openFormModal(false));
document
  .getElementById('closeModalBtn')
  ?.addEventListener('click', closeFormModal);
document
  .getElementById('cancelModalBtn')
  ?.addEventListener('click', closeFormModal);
submitBtn?.addEventListener('click', submitSupplier);
document
  .getElementById('closeDetailModalBtn')
  ?.addEventListener('click', closeDetailModal);

supplierModal?.addEventListener('click', (e) => {
  if (e.target === supplierModal) closeFormModal();
});
detailModal?.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetailModal();
});
deleteConfirmModal?.addEventListener('click', (e) => {
  if (e.target === deleteConfirmModal) closeDeleteConfirmModal();
});

// ── Init ──
fetchSuppliers();
