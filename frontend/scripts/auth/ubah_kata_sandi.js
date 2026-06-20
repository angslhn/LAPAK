const form = document.getElementById('form-ubah-password');
const ubahBtn = document.getElementById('ubah-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const alertError = document.getElementById('alert-error');

// ── Ambil token dari URL ──
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

// ── Success Modal (Password Berhasil Diperbarui) ──
const successModalOverlay = document.getElementById('success-modal-overlay');
const successModalMessage = document.getElementById('success-modal-message');

const REDIRECT_DELAY_MS = 10000;

function showSuccessModal(message) {
  if (successModalMessage && message) {
    successModalMessage.textContent = message;
  }
  if (successModalOverlay) successModalOverlay.classList.add('is-visible');
}

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

function clearAll() {
  ['password', 'konfirmasi'].forEach((id) => showFieldError(id, ''));
  if (alertError) {
    alertError.style.display = 'none';
    alertError.textContent = '';
  }
}

function showError(msg) {
  if (alertError) {
    alertError.textContent = msg;
    alertError.style.display = '';
  }
}

// ── Loading ──
function setLoading(on) {
  ubahBtn.disabled = on;
  btnText.style.display = on ? 'none' : '';
  btnLoader.style.display = on ? '' : 'none';
}

// ── Cek token ──
if (!token) {
  showError(
    'Token tidak valid atau sudah kadaluarsa. Silakan request ulang dari halaman lupa kata sandi.'
  );
  ubahBtn.disabled = true;
}

// ── Submit ──
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAll();

  if (!token) {
    showError('Token tidak valid.');
    return;
  }

  const password = document.getElementById('password').value;
  const konfirmasi = document.getElementById('konfirmasi').value;
  let valid = true;

  if (!password) {
    showFieldError('password', 'Kata sandi baru wajib diisi.');
    valid = false;
  } else if (password.length < 8) {
    showFieldError('password', 'Kata sandi minimal 8 karakter.');
    valid = false;
  }

  if (!konfirmasi) {
    showFieldError('konfirmasi', 'Konfirmasi kata sandi wajib diisi.');
    valid = false;
  } else if (password !== konfirmasi) {
    showFieldError('konfirmasi', 'Konfirmasi kata sandi tidak cocok.');
    valid = false;
  }

  if (!valid) return;

  setLoading(true);

  try {
    const res = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json || !json.success) {
      const msg = (json && json.message) || 'Gagal mengubah kata sandi';
      const code = json && json.code;
      if (code === 'AUTH_INVALID_RESET_TOKEN') {
        showError(
          'Token tidak valid atau sudah kadaluarsa. Silakan request ulang.'
        );
        ubahBtn.disabled = true;
      } else {
        showError(msg);
      }
      return;
    }

    const pesan =
      json.message ||
      'Password akun Anda telah berhasil diperbarui. Silakan login menggunakan password baru.';

    showSuccessModal(pesan);
    document.getElementById('password').value = '';
    document.getElementById('konfirmasi').value = '';

    setTimeout(() => {
      window.location.href = '/masuk?reset=1';
    }, REDIRECT_DELAY_MS);
  } catch (err) {
    showError('Terjadi kesalahan jaringan. Silakan coba lagi.');
  } finally {
    setLoading(false);
  }
});
