const form = document.getElementById('form-masuk');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const btnMasuk = document.getElementById('btn-masuk');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const btnGoogle = document.getElementById('btn-google');
const alertError = document.getElementById('alert-error');
const togglePw = document.getElementById('toggle-pw');
const icoShow = document.getElementById('ico-show');
const icoHide = document.getElementById('ico-hide');
const errorEmail = document.getElementById('error-email');
const errorPass = document.getElementById('error-password');

// ── Toggle Password Visibility ──
togglePw.addEventListener('click', () => {
  const isPassword = passInput.type === 'password';
  passInput.type = isPassword ? 'text' : 'password';
  icoShow.style.display = isPassword ? 'none' : 'block';
  icoHide.style.display = isPassword ? 'block' : 'none';
});

// ── Validasi ──
function validateEmail(val) {
  if (!val.trim()) return 'Email tidak boleh kosong.';
  if (!/\S+@\S+\.\S+/.test(val)) return 'Format email tidak valid.';
  return '';
}

function validatePassword(val) {
  if (!val) return 'Password tidak boleh kosong.';
  if (val.length < 6) return 'Password minimal 6 karakter.';
  return '';
}

function setFieldError(inputEl, errorEl, msg) {
  errorEl.textContent = msg;
  if (msg) inputEl.classList.add('error');
  else inputEl.classList.remove('error');
}

function clearAlerts() {
  alertError.style.display = 'none';
  alertError.textContent = '';
  setFieldError(emailInput, errorEmail, '');
  setFieldError(passInput, errorPass, '');
}

// Real-time clear error
emailInput.addEventListener('input', () =>
  setFieldError(emailInput, errorEmail, '')
);
passInput.addEventListener('input', () =>
  setFieldError(passInput, errorPass, '')
);

// ── Loading State ──
function setLoading(on) {
  btnMasuk.disabled = on;
  btnText.style.display = on ? 'none' : '';
  btnLoader.style.display = on ? '' : 'none';
}

function showAlert(msg) {
  alertError.textContent = msg;
  alertError.style.display = '';
}

// ── Submit Login ──
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlerts();

  const email = emailInput.value.trim();
  const password = passInput.value;

  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  setFieldError(emailInput, errorEmail, emailErr);
  setFieldError(passInput, errorPass, passErr);
  if (emailErr || passErr) return;

  setLoading(true);

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      const msg = json.message || 'Email atau password salah.';
      if (msg.toLowerCase().includes('email')) {
        setFieldError(emailInput, errorEmail, msg);
      } else if (
        msg.toLowerCase().includes('kata sandi') ||
        msg.toLowerCase().includes('password')
      ) {
        setFieldError(passInput, errorPass, msg);
      } else {
        showAlert(msg);
      }
      return;
    }

    window.location.href = '/beranda';
  } catch (err) {
    showAlert('Terjadi kesalahan jaringan. Silakan coba lagi.');
  } finally {
    setLoading(false);
  }
});

// ── Google Login ──
btnGoogle.addEventListener('click', () => {
  window.location.href = '/api/v1/auth/google';
});

// ── Cek Query Error (dari OAuth redirect) ──
(function checkQueryError() {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  if (!err) return;

  const MESSAGES = {
    oauth_failed: 'Login dengan Google gagal. Silakan coba lagi.',
    account_exists:
      'Akun dengan email ini sudah terdaftar. Silakan masuk dengan email & password.',
    unauthorized: 'Sesi Anda telah berakhir. Silakan masuk kembali.',
  };

  showAlert(MESSAGES[err] || 'Terjadi kesalahan. Silakan coba lagi.');
  window.history.replaceState({}, '', window.location.pathname);
})();
