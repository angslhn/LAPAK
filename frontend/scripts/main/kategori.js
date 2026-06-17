// ── State ──
let allCategories = [];
let currentPage = 1;
const PER_PAGE = 10;
let editingId = null;

// ── DOM refs ──
const tbody = document.querySelector('tbody');
const paginationInfo = document.querySelector('.pagination-info');
const paginationCtrl = document.querySelector('.pagination-ctrl');
const btnTambah = document.getElementById('btnTambahKategori');

const modal = document.getElementById('categoryModal');
const modalTitle = document.getElementById('modalTitle');
const categoryNameInput = document.getElementById('categoryName');
const submitBtn = document.getElementById('submitCategoryBtn');

// ── SVG icons (reusable) ──
const ICON_EDIT = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.66667 13.3333H2.85417L11 5.1875L9.8125 4L1.66667 12.1458V13.3333ZM0 15V11.4583L11 0.479167C11.1667 0.326389 11.3507 0.208333 11.5521 0.125C11.7535 0.0416667 11.9653 0 12.1875 0C12.4097 0 12.625 0.0416667 12.8333 0.125C13.0417 0.208333 13.2222 0.333333 13.375 0.5L14.5208 1.66667C14.6875 1.81944 14.809 2 14.8854 2.20833C14.9618 2.41667 15 2.625 15 2.83333C15 3.05556 14.9618 3.26736 14.8854 3.46875C14.809 3.67014 14.6875 3.85417 14.5208 4.02083L3.54167 15H0ZM13.3333 2.83333L12.1667 1.66667L13.3333 2.83333ZM10.3958 4.60417L9.8125 4L11 5.1875L10.3958 4.60417Z" fill="#3E4944"/>
</svg>`;

// ── FETCH ──
async function fetchCategories(preservePage = false) {
  try {
    // Loading state
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#aaa">
      <span class="spinner"></span>Memuat kategori...</td></tr>`;

    const currentPageBefore = currentPage;
    const res = await fetch('/api/v1/categories/product-count', {
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    allCategories = json.data;

    // Preserve page setelah edit
    if (!preservePage) {
      currentPage = Math.min(
        currentPageBefore,
        Math.max(1, Math.ceil(allCategories.length / PER_PAGE))
      );
    }

    renderAll();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#e05252">
      Gagal memuat kategori: ${err.message}</td></tr>`;
  }
}

// ── RENDER SEMUA ──
function renderAll() {
  const total = allCategories.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PER_PAGE;
  const slice = allCategories.slice(start, start + PER_PAGE);

  renderTable(slice, start);
  renderPaginationInfo(start + 1, Math.min(start + PER_PAGE, total), total);
  renderPaginationCtrl(pages);
}

// ── RENDER TABLE ──
function renderTable(data, offset) {
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#aaa">
      Belum ada kategori</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (cat, i) => `
    <tr data-id="${cat.id}">
      <td class="no-val center">${offset + i + 1}</td>
      <td class="center"><span class="kat-name">${cat.name}</span></td>
      <td class="center">
        <span class="jumlah-badge">${cat.product_count ?? 0} produk</span>
      </td>
      <td class="center">
        <div class="aksi-cell">
          <button class="aksi-btn edit" title="Edit" data-id="${cat.id}" data-name="${cat.name}">
            ${ICON_EDIT}
          </button>
        </div>
      </td>
    </tr>`
    )
    .join('');

  // ── Event: Edit kategori ──
  tbody.querySelectorAll('.aksi-btn.edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const name = btn.dataset.name;
      openModal(true, { id, name });
    });
  });
}

// ── PAGINATION INFO ──
function renderPaginationInfo(from, to, total) {
  paginationInfo.textContent = `Menampilkan ${from}–${to} dari ${total} kategori`;
}

// ── PAGINATION CTRL ──
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

  // Event: klik nomor halaman
  paginationCtrl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      renderAll();
    });
  });

  // Event: prev
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderAll();
    }
  });

  // Event: next
  document.getElementById('next-btn')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderAll();
    }
  });
}

// ── MODAL LOGIC ──
function openModal(isEdit = false, category = null) {
  if (isEdit && category) {
    editingId = category.id;
    modalTitle.textContent = 'Edit Kategori';
    categoryNameInput.value = category.name;
    submitBtn.textContent = 'Perbarui';

    setTimeout(() => {
      categoryNameInput.focus();
      const len = categoryNameInput.value.length;
      categoryNameInput.setSelectionRange(len, len);
    }, 100);
  } else {
    editingId = null;
    modalTitle.textContent = 'Tambah Kategori';
    categoryNameInput.value = '';
    submitBtn.textContent = 'Simpan';

    setTimeout(() => categoryNameInput.focus(), 100);
  }
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
  editingId = null;
  categoryNameInput.value = '';
}

async function submitCategory() {
  const name = categoryNameInput.value.trim();

  if (!name) {
    showToast('Nama kategori tidak boleh kosong', 'error');
    return;
  }

  if (name.length < 3) {
    showToast('Nama kategori minimal 3 karakter', 'error');
    return;
  }

  if (name.length > 100) {
    showToast('Nama kategori maksimal 100 karakter', 'error');
    return;
  }

  // Validasi duplikat client-side (case-insensitive)
  const isDuplicate = allCategories.some(
    (cat) =>
      cat.name.toLowerCase() === name.toLowerCase() && cat.id !== editingId
  );
  if (isDuplicate) {
    showToast('Kategori dengan nama ini sudah ada', 'error');
    return;
  }

  const isEdit = editingId !== null;
  const url = isEdit ? `/api/v1/categories/${editingId}` : '/api/v1/categories';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Gagal menyimpan kategori');
    }

    showToast(
      isEdit
        ? 'Kategori berhasil diperbarui'
        : 'Kategori baru berhasil ditambahkan'
    );

    closeModal();

    // Preserve page: tetap di halaman saat ini setelah edit
    // Kalo tambah baru, arahkan ke halaman terakhir biar kategori baru keliatan
    if (!isEdit) {
      const totalAfterAdd = allCategories.length + 1;
      currentPage = Math.ceil(totalAfterAdd / PER_PAGE);
      fetchCategories(true);
    } else {
      fetchCategories(true);
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  }
}

// ── EVENT LISTENERS ──
btnTambah.addEventListener('click', () => openModal(false));
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
submitBtn.addEventListener('click', submitCategory);

// Tutup modal jika klik di luar area modal
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Validasi maxlength real-time
categoryNameInput.addEventListener('input', () => {
  if (categoryNameInput.value.length > 100) {
    categoryNameInput.value = categoryNameInput.value.slice(0, 100);
    showToast('Nama kategori maksimal 100 karakter', 'error');
  }
});

// Submit otomatis jika tekan Enter di input
categoryNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitCategory();
});

// ── INIT ──
fetchCategories();
