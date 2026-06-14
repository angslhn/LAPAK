const form = document.getElementById('form-ubah-password');
const ubahBtn = document.getElementById('ubah-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const alertError = document.getElementById('alert-error');
const alertSuccess = document.getElementById('alert-success');
const successMessage = document.getElementById('success-message');

// ── Ambil token dari URL ──
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

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
  if (alertSuccess) alertSuccess.style.display = 'none';
}

function showError(msg) {
  if (alertError) {
    alertError.textContent = msg;
    alertError.style.display = '';
  }
}

function showSuccess(msg) {
  if (successMessage) successMessage.textContent = msg;
  if (alertSuccess) alertSuccess.style.display = '';
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
    showFieldError('password', 'Password baru wajib diisi.');
    valid = false;
  } else if (password.length < 8) {
    showFieldError('password', 'Password minimal 8 karakter.');
    valid = false;
  }

  if (!konfirmasi) {
    showFieldError('konfirmasi', 'Konfirmasi password wajib diisi.');
    valid = false;
  } else if (password !== konfirmasi) {
    showFieldError('konfirmasi', 'Konfirmasi password tidak cocok.');
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

    const json = await res.json();

    if (!res.ok || !json.success) {
      const msg = json.message || 'Gagal mengubah password.';
      if (json.code === 'AUTH_INVALID_RESET_TOKEN') {
        showError(
          'Token tidak valid atau sudah kadaluarsa. Silakan request ulang.'
        );
        ubahBtn.disabled = true;
      } else {
        showError(msg);
      }
      return;
    }

    // Sukses
    showSuccess(json.message || 'Password berhasil diperbarui!');
    document.getElementById('password').value = '';
    document.getElementById('konfirmasi').value = '';

    // Redirect ke masuk setelah 2 detik
    setTimeout(() => {
      window.location.href = '/masuk?reset=1';
    }, 2000);
  } catch (err) {
    showError('Terjadi kesalahan jaringan. Silakan coba lagi.');
  } finally {
    setLoading(false);
  }
});
