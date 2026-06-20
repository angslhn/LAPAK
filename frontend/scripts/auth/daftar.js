const form = document.getElementById('form-daftar');
const btnDaftar = document.getElementById('btn-daftar');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const alertError = document.getElementById('alert-error');

// ── Modal sukses daftar (Akun Berhasil Dibuat) ──
const successModalOverlay = document.getElementById('success-modal-overlay');
const successModalBtn = document.getElementById('success-modal-btn');

function showSuccessModal() {
  if (successModalOverlay) successModalOverlay.classList.add('is-visible');
}

function goToLogin() {
  window.location.href = '/masuk?registered=1';
}

if (successModalBtn) successModalBtn.addEventListener('click', goToLogin);

// ── Eye Toggle ──
document.querySelectorAll('.eye-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const showIcon = btn.querySelector('.eye-show');
    const hideIcon = btn.querySelector('.eye-hide');
    if (showIcon) showIcon.style.display = isPassword ? 'none' : 'block';
    if (hideIcon) hideIcon.style.display = isPassword ? 'block' : 'none';
  });
});

// ── Validasi ──
function showFieldError(id, msg) {
  const el = document.getElementById('error-' + id);
  const input = document.getElementById(id);
  if (el) el.textContent = msg || '';
  if (input) {
    if (msg) input.classList.add('error');
    else input.classList.remove('error');
  }
}

function clearAllErrors() {
  [
    'nama',
    'toko',
    'email',
    'telepon',
    'password',
    'konfirmasi',
    'syarat',
  ].forEach((id) => showFieldError(id, ''));
  alertError.style.display = 'none';
}

function showAlert(msg) {
  alertError.textContent = msg;
  alertError.style.display = '';
}

// ── Loading ──
function setLoading(on) {
  btnDaftar.disabled = on;
  btnText.style.display = on ? 'none' : '';
  btnLoader.style.display = on ? '' : 'none';
}

// ── Submit ──
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();

  const nama = document.getElementById('nama').value.trim();
  const toko = document.getElementById('toko').value.trim();
  const email = document.getElementById('email').value.trim();
  const telepon = document.getElementById('telepon').value.trim();
  const password = document.getElementById('password').value;
  const konfirmasi = document.getElementById('konfirmasi').value;
  const syarat = document.getElementById('syarat').checked;

  let valid = true;

  // Validasi nama
  if (!nama) {
    showFieldError('nama', 'Nama lengkap wajib diisi.');
    valid = false;
  } else if (nama.length < 1 || nama.length > 100) {
    showFieldError('nama', 'Nama harus 1–100 karakter.');
    valid = false;
  }

  // Validasi nama toko (optional, tapi kalau diisi minimal 2 karakter)
  if (toko && toko.length < 2) {
    showFieldError('toko', 'Nama toko minimal 2 karakter.');
    valid = false;
  }

  // Validasi email
  if (!email) {
    showFieldError('email', 'Email wajib diisi.');
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    showFieldError('email', 'Format email tidak valid.');
    valid = false;
  }

  // Validasi telepon (optional, tapi kalau diisi harus diawali 0, min 7 digit)
  if (telepon && (!/^0/.test(telepon) || telepon.length < 7)) {
    showFieldError(
      'telepon',
      'Nomor telepon harus diawali 0, minimal 7 digit.'
    );
    valid = false;
  }

  // Validasi password
  if (!password) {
    showFieldError('password', 'Kata sandi wajib diisi.');
    valid = false;
  } else if (password.length < 8) {
    showFieldError('password', 'Kata sandi minimal 8 karakter.');
    valid = false;
  } else if (!/[A-Z]/.test(password)) {
    showFieldError(
      'password',
      'Kata sandi harus mengandung minimal 1 huruf besar.'
    );
    valid = false;
  } else if (!/[a-z]/.test(password)) {
    showFieldError(
      'password',
      'Kata sandi harus mengandung minimal 1 huruf kecil.'
    );
    valid = false;
  } else if (!/[0-9]/.test(password)) {
    showFieldError('password', 'Kata sandi harus mengandung minimal 1 angka.');
    valid = false;
  } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    showFieldError('password', 'Kata sandi harus mengandung minimal 1 simbol.');
    valid = false;
  }

  // Validasi konfirmasi kata sandi
  if (!konfirmasi) {
    showFieldError('konfirmasi', 'Konfirmasi kata sandi wajib diisi.');
    valid = false;
  } else if (password !== konfirmasi) {
    showFieldError('konfirmasi', 'Konfirmasi kata sandi tidak cocok.');
    valid = false;
  }

  // Validasi syarat & ketentuan
  if (!syarat) {
    showFieldError('syarat', 'Anda harus menyetujui syarat dan ketentuan.');
    valid = false;
  }

  if (!valid) return;

  // ── Kirim ke API ──
  setLoading(true);

  try {
    const body = {
      name: nama,
      email: email,
      password: password,
    };

    if (toko) body.store_name = toko;
    if (telepon) body.phone = telepon;

    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json || !json.success) {
      const msg =
        (json && json.message) || 'Pendaftaran gagal. Silakan coba lagi.';
      const code = json && json.code;

      // Mapping error ke field spesifik
      if (code === 'AUTH_EMAIL_ALREADY_EXISTS') {
        showFieldError('email', msg);
      } else if (msg.toLowerCase().includes('email')) {
        showFieldError('email', msg);
      } else if (
        msg.toLowerCase().includes('password') ||
        msg.toLowerCase().includes('kata sandi')
      ) {
        showFieldError('password', msg);
      } else if (
        msg.toLowerCase().includes('nama') ||
        msg.toLowerCase().includes('name')
      ) {
        showFieldError('nama', msg);
      } else if (
        msg.toLowerCase().includes('telepon') ||
        msg.toLowerCase().includes('phone')
      ) {
        showFieldError('telepon', msg);
      } else if (
        msg.toLowerCase().includes('toko') ||
        msg.toLowerCase().includes('store')
      ) {
        showFieldError('toko', msg);
      } else {
        showAlert(msg);
      }
      return;
    }

    // Sukses → tampilkan modal sukses, redirect ke /masuk saat tombol diklik
    showSuccessModal();
  } catch (err) {
    showAlert('Terjadi kesalahan jaringan. Silakan coba lagi.');
  } finally {
    setLoading(false);
  }
});

// ── Google Register ──
document.getElementById('btn-google').addEventListener('click', () => {
  window.location.href = '/api/v1/auth/google';
});
