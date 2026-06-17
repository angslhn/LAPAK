const formLupa = document.getElementById('form-lupa-password');
const kirimBtn = document.getElementById('kirim-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const alertError = document.getElementById('alert-error');
const alertSuccess = document.getElementById('alert-success');
const successMessage = document.getElementById('success-message');
const emailInput = document.getElementById('email');
const errorEmail = document.getElementById('error-email');

if (formLupa) {
  // ── Clear error on input ──
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('error');
    if (errorEmail) errorEmail.textContent = '';
  });

  // ── Submit ──
  formLupa.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear all alerts
    if (alertError) {
      alertError.style.display = 'none';
      alertError.textContent = '';
    }
    if (alertSuccess) {
      alertSuccess.style.display = 'none';
    }
    if (errorEmail) errorEmail.textContent = '';
    emailInput.classList.remove('error');

    const email = emailInput.value.trim();

    // Validasi
    if (!email) {
      if (errorEmail) errorEmail.textContent = 'Email tidak boleh kosong.';
      emailInput.classList.add('error');
      emailInput.focus();
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      if (errorEmail) errorEmail.textContent = 'Format email tidak valid.';
      emailInput.classList.add('error');
      emailInput.focus();
      return;
    }

    // Loading
    kirimBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = '';

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.message || 'Gagal mengirim email. Silakan coba lagi.';
        if (alertError) {
          alertError.textContent = msg;
          alertError.style.display = '';
        }
        return;
      }

      // Sukses — tampilkan alert success
      if (successMessage) {
        successMessage.textContent =
          json.message ||
          'Email untuk perubahan kata sandi telah dikirim. Silakan cek kotak masuk Anda.';
      }
      if (alertSuccess) {
        alertSuccess.style.display = '';
      }
      emailInput.value = '';
    } catch (err) {
      if (alertError) {
        alertError.textContent =
          'Terjadi kesalahan jaringan. Silakan coba lagi.';
        alertError.style.display = '';
      }
    } finally {
      kirimBtn.disabled = false;
      btnText.style.display = '';
      btnLoader.style.display = 'none';
    }
  });
}
