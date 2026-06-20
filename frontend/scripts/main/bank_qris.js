let editingBankId = null;
let pendingDeleteBankId = null;
let currentQRIS = null;

// ── FETCH QRIS ──
async function fetchQRIS() {
  try {
    const res = await fetch('/api/v1/bank-accounts/qris', {
      credentials: 'include',
    });
    const json = await res.json();
    if (json.success && json.data) {
      currentQRIS = json.data;
      renderQRIS(json.data);
    } else {
      renderQRIS(null);
    }
  } catch (err) {
    renderQRIS(null);
  }
}

function renderQRIS(data) {
  const preview = document.getElementById('qrisPreview');
  const btnDelete = document.getElementById('btnDeleteQRIS');

  if (data && data.image_url) {
    preview.innerHTML = `<img src="${data.image_url}" alt="QRIS" class="qris-image" />`;

    if (btnDelete) btnDelete.style.display = 'flex';
  } else {
    preview.innerHTML = `
      <div class="qris-placeholder-large">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 20 20" fill="none"><path d="M0 5V0H5V2H2V5H0ZM0 20V15H2V18H5V20H0ZM15 20V18H18V15H20V20H15ZM18 5V2H15V0H20V5H18ZM15.5 15.5H17V17H15.5V15.5ZM15.5 12.5H17V14H15.5V12.5ZM14 14H15.5V15.5H14V14ZM12.5 15.5H14V17H12.5V15.5ZM11 14H12.5V15.5H11V14ZM14 11H15.5V12.5H14V11ZM12.5 12.5H14V14H12.5V12.5ZM11 11H12.5V12.5H11V11ZM17 3V9H11V3H17ZM9 11V17H3V11H9ZM9 3V9H3V3H9ZM7.5 15.5V12.5H4.5V15.5H7.5ZM7.5 7.5V4.5H4.5V7.5H7.5ZM15.5 7.5V4.5H12.5V7.5H15.5Z" fill="#ccc"></path></svg>
        <p>Belum ada QRIS</p>
      </div>`;

    if (btnDelete) btnDelete.style.display = 'none';
  }
}

// ── UPLOAD QRIS ──
document.getElementById('btnUploadQRIS').addEventListener('click', () => {
  document.getElementById('qrisInput').click();
});

document.getElementById('qrisInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type))
    return showToast('Format: JPG, PNG, WEBP', 'error');
  if (file.size > 4 * 1024 * 1024) return showToast('Maksimal 4MB', 'error');

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/v1/bank-accounts/qris', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    showToast('QRIS berhasil diupload', 'success');
    fetchQRIS();
  } catch (err) {
    showToast(err.message, 'error');
  }
  e.target.value = '';
});

// ── FETCH BANKS ──
async function fetchBanks() {
  try {
    const res = await fetch('/api/v1/bank-accounts', {
      credentials: 'include',
    });
    const json = await res.json();
    if (json.success) renderBankTable(json.data);
  } catch (err) {
    document.getElementById('bankTableBody').innerHTML =
      `<tr><td colspan="5" style="text-align:center;padding:24px;color:#e05252">Gagal memuat data</td></tr>`;
  }
}

function renderBankTable(banks) {
  const tbody = document.getElementById('bankTableBody');
  if (!banks.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#aaa">Belum ada rekening</td></tr>`;
    return;
  }
  tbody.innerHTML = banks
    .map(
      (b) => `
    <tr>
      <td class="center"><span class="bank-name-cell">${b.bank_name}</span></td>
      <td class="center"><span class="bank-number-cell">${b.account_number}</span></td>
      <td class="center"><span class="bank-owner-cell">${b.account_owner}</span></td>
      <td class="center"><span class="status-badge-sm ${b.is_active ? 'active' : 'inactive'}">${b.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td class="center">
        <button class="aksi-link-sm edit-btn" data-id="${b.id}" data-name="${b.bank_name}" data-number="${b.account_number}" data-owner="${b.account_owner}" data-active="${b.is_active}">Edit</button>
        <button class="aksi-link-sm delete delete-btn" data-id="${b.id}">Hapus</button>
      </td>
    </tr>
  `
    )
    .join('');

  tbody.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      editBank(
        btn.dataset.id,
        btn.dataset.name,
        btn.dataset.number,
        btn.dataset.owner,
        btn.dataset.active === 'true'
      );
    });
  });

  tbody.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteBank(btn.dataset.id));
  });
}

// ── TAMBAH / EDIT BANK ──
document.getElementById('btnTambahBank').addEventListener('click', () => {
  editingBankId = null;
  document.getElementById('bankModalTitle').textContent = 'Tambah Rekening';
  document.getElementById('bankName').value = '';
  document.getElementById('bankNumber').value = '';
  document.getElementById('bankOwner').value = '';
  document.getElementById('bankModal').style.display = 'flex';
});

function editBank(id, name, number, owner, isActive) {
  editingBankId = id;
  document.getElementById('bankModalTitle').textContent = 'Edit Rekening';
  document.getElementById('bankName').value = name;
  document.getElementById('bankNumber').value = number;
  document.getElementById('bankOwner').value = owner;
  document.getElementById('bankModal').style.display = 'flex';
}

document.getElementById('btnSubmitBank').addEventListener('click', async () => {
  const bank_name = document.getElementById('bankName').value.trim();
  const account_number = document.getElementById('bankNumber').value.trim();
  const account_owner = document.getElementById('bankOwner').value.trim();
  if (!bank_name || !account_number || !account_owner)
    return showToast('Semua field wajib diisi', 'error');

  const url = editingBankId
    ? `/api/v1/bank-accounts/${editingBankId}`
    : '/api/v1/bank-accounts';
  const method = editingBankId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bank_name,
        account_number,
        account_owner,
        is_active: true,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    showToast(
      editingBankId ? 'Rekening diperbarui' : 'Rekening ditambahkan',
      'success'
    );
    document.getElementById('bankModal').style.display = 'none';
    fetchBanks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ── DELETE BANK ──
async function deleteBank(id) {
  pendingDeleteBankId = id;
  document.getElementById('deleteBankModal').style.display = 'flex';
}

document
  .getElementById('btnConfirmDeleteBank')
  .addEventListener('click', async () => {
    if (!pendingDeleteBankId) return;
    try {
      const res = await fetch(`/api/v1/bank-accounts/${pendingDeleteBankId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('Rekening dihapus', 'success');
      document.getElementById('deleteBankModal').style.display = 'none';
      pendingDeleteBankId = null;
      fetchBanks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// ── DELETE QRIS ──
document.getElementById('btnDeleteQRIS').addEventListener('click', () => {
  document.getElementById('deleteQRISModal').style.display = 'flex';
});

document
  .getElementById('btnConfirmDeleteQRIS')
  .addEventListener('click', async () => {
    try {
      const res = await fetch('/api/v1/bank-accounts/qris', {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast('QRIS berhasil dihapus', 'success');
      document.getElementById('deleteQRISModal').style.display = 'none';
      fetchQRIS();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

// ── Auto-close modal ──
document.querySelectorAll('[data-close]').forEach((el) => {
  el.addEventListener(
    'click',
    () => (document.getElementById(el.dataset.close).style.display = 'none')
  );
});
document.querySelectorAll('.modal-overlay').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});

// ── Init ──
fetchQRIS();
fetchBanks();
