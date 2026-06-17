// ── FETCH USER PROFILE ──
async function fetchUserProfile() {
  try {
    const res = await fetch('/api/v1/users/me', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const user = json.data;

    document.getElementById('fullName').value = user.name || '';
    document.getElementById('storeName').value = user.store_name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('storeAddress').value = user.address || '';

    if (user.avatar_url) {
      document.getElementById('profileAvatar').src = user.avatar_url;
    }

    document.getElementById('profileStoreName').textContent =
      user.store_name || '—';
  } catch (err) {
    console.error('Gagal memuat profil:', err.message);
    showToast('Gagal memuat data profil', 'error');
  }
}

// ── AVATAR UPLOAD ──
document
  .getElementById('avatarUpload')
  .addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Format gambar harus JPG, PNG, atau WEBP', 'error');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran file maksimal 4MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/v1/users/me/avatar', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      document.getElementById('profileAvatar').src = json.data.avatar_url;
      showToast('Foto profil berhasil diperbarui', 'success');
    } catch (err) {
      showToast('Gagal mengupload foto: ' + err.message, 'error');
    }

    e.target.value = '';
  });

// ── FORM SUBMIT ──
document
  .getElementById('editProfileForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btnSaveProfile');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 0.8s linear infinite"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z" fill="none" stroke="white" stroke-width="1.5"/></svg> Menyimpan...`;

    const payload = {
      name: document.getElementById('fullName').value.trim(),
      store_name: document.getElementById('storeName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address: document.getElementById('storeAddress').value.trim(),
    };

    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // Update nama toko di sidebar
      document.getElementById('profileStoreName').textContent =
        payload.store_name || '—';

      showToast('Profil berhasil diperbarui', 'success');

      setTimeout(() => {
        window.location.href = '/pengaturan';
      }, 1500);
    } catch (err) {
      showToast('Gagal: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });

document.querySelector('.btn-cancel').addEventListener('click', () => {
  window.location.href = '/pengaturan';
});

// ── INIT ──
fetchUserProfile();
