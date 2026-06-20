const formLupa = document.getElementById('form-lupa-password');
const kirimBtn = document.getElementById('kirim-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const alertError = document.getElementById('alert-error');
const emailInput = document.getElementById('email');
const errorEmail = document.getElementById('error-email');

// ── Success Modal (Email Berhasil Dikirim) ──
const successModalOverlay = document.getElementById('success-modal-overlay');
const successModalMessage = document.getElementById('success-modal-message');

function showSuccessModal(message) {
  if (successModalMessage && message) {
    successModalMessage.textContent = message;
  }
  if (successModalOverlay) successModalOverlay.classList.add('is-visible');
}

if (formLupa) {
  // ── Clear error on input ──
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('error');
    if (errorEmail) errorEmail.textContent = '';
  });

  // ── Submit ──
  formLupa.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear alert error
    if (alertError) {
      alertError.style.display = 'none';
      alertError.textContent = '';
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
    btnLoader.style.display = 'flex';
    btnLoader.style.justifyContent = 'center';
    btnLoader.style.alignItems = 'center';
    btnLoader.style.gap = '6px';

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json || !json.success) {
        const msg =
          (json && json.message) || 'Gagal mengirim email. Silakan coba lagi.';
        if (alertError) {
          alertError.textContent = msg;
          alertError.style.display = '';
        }
        return;
      }

      const pesan =
        json.message ||
        'Kami telah mengirimkan tautan perubahan kata sandi ke email Anda. Silakan periksa kotak masuk atau folder spam.';

      showSuccessModal(pesan);
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
