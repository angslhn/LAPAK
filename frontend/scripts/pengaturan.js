const DEFAULT_AVATAR =
  'https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg';

// ── Fetch User Profile ──
async function fetchProfile() {
  try {
    const res = await fetch('/api/v1/users/me', { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderProfile(json.data);
  } catch (err) {
    console.error('Gagal memuat profil:', err.message);
    document.getElementById('profile-name').textContent = 'Gagal memuat';
  }
}

function renderProfile(user) {
  // Avatar
  const avatarImg = document.getElementById('avatar-img');
  avatarImg.src = user.avatar_url || DEFAULT_AVATAR;

  // Nama
  document.getElementById('profile-name').textContent =
    user.store_name || user.name || '—';

  // Deskripsi (role + address)
  const role = user.role === 'owner' ? 'Owner' : 'Kasir';
  const desc = user.address
    ? `Bertanggung jawab atas manajemen inventaris, laporan harian, dan koordinasi supplier. (${role} — ${user.address})`
    : `Bertanggung jawab atas manajemen inventaris, laporan harian, dan koordinasi supplier. (${role})`;
  document.getElementById('profile-desc').textContent = desc;

  // Verified badge
  const verifiedEl = document.getElementById('verified-badge');
  if (user.email) {
    verifiedEl.textContent = `Akun Terverifikasi — ${user.email}`;
  }

  // Terakhir login (pakai timestamp saat ini sebagai fallback)
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  document.getElementById('footer-login').innerHTML =
    `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.975 11.025L11.025 9.975L8.25 7.2V3.75H6.75V7.8L9.975 11.025ZM7.5 15C6.4625 15 5.4875 14.8031 4.575 14.4094C3.6625 14.0156 2.86875 13.4812 2.19375 12.8062C1.51875 12.1312 0.984375 11.3375 0.590625 10.425C0.196875 9.5125 0 8.5375 0 7.5C0 6.4625 0.196875 5.4875 0.590625 4.575C0.984375 3.6625 1.51875 2.86875 2.19375 2.19375C2.86875 1.51875 3.6625 0.984375 4.575 0.590625C5.4875 0.196875 6.4625 0 7.5 0C8.5375 0 9.5125 0.196875 10.425 0.590625C11.3375 0.984375 12.1312 1.51875 12.8062 2.19375C13.4812 2.86875 14.0156 3.6625 14.4094 4.575C14.8031 5.4875 15 6.4625 15 7.5C15 8.5375 14.8031 9.5125 14.4094 10.425C14.0156 11.3375 13.4812 12.1312 12.8062 12.8062C12.1312 13.4812 11.3375 14.0156 10.425 14.4094C9.5125 14.8031 8.5375 15 7.5 15ZM7.5 13.5C9.1625 13.5 10.5781 12.9156 11.7469 11.7469C12.9156 10.5781 13.5 9.1625 13.5 7.5C13.5 5.8375 12.9156 4.42188 11.7469 3.25312C10.5781 2.08437 9.1625 1.5 7.5 1.5C5.8375 1.5 4.42188 2.08437 3.25312 3.25312C2.08437 4.42188 1.5 5.8375 1.5 7.5C1.5 9.1625 2.08437 10.5781 3.25312 11.7469C4.42188 12.9156 5.8375 13.5 7.5 13.5Z" fill="#999999"/>
    </svg>
    Terakhir login: Hari ini, ${timeStr} WIB
    `;
}

// ── Ganti Foto (Upload Avatar) ──
document.getElementById('btn-ganti-foto').addEventListener('click', () => {
  document.getElementById('avatar-input').click();
});

document.getElementById('avatar-edit-btn').addEventListener('click', () => {
  document.getElementById('avatar-input').click();
});

document
  .getElementById('avatar-input')
  .addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Format gambar harus JPG, PNG, atau WEBP');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file maksimal 4MB');
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

      // Update avatar di halaman
      document.getElementById('avatar-img').src = json.data.avatar_url;
      alert('Avatar berhasil diperbarui!');
    } catch (err) {
      alert('Gagal mengupload avatar: ' + err.message);
    }

    // Reset input
    e.target.value = '';
  });

// ── Edit Profil (TODO: modal) ──
document.getElementById('btn-edit-profil').addEventListener('click', () => {
  alert('Fitur edit profil akan segera hadir.');
});

// ── Ubah Password (TODO: modal) ──
document.getElementById('btn-ubah-password').addEventListener('click', () => {
  alert('Fitur ubah password akan segera hadir.');
});

// ── Sign Out ──
document.getElementById('btn-signout').addEventListener('click', async () => {
  if (!confirm('Anda yakin ingin keluar?')) return;
  try {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/masuk';
  } catch (err) {
    alert('Gagal logout: ' + err.message);
  }
});

// ── Init ──
fetchProfile();
