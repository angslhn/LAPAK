// ── TOGGLE PASSWORD ──
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const showIcon = btn.querySelector('svg[id^="ico-show"]');
  const hideIcon = btn.querySelector('svg[id^="ico-hide"]');

  if (input.type === 'password') {
    input.type = 'text';
    if (showIcon) showIcon.style.display = 'none';
    if (hideIcon) hideIcon.style.display = 'block';
  } else {
    input.type = 'password';
    if (showIcon) showIcon.style.display = 'block';
    if (hideIcon) hideIcon.style.display = 'none';
  }
}

// ── TOAST ──
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    // Fallback kalau container belum ada
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
      background: ${type === 'error' ? '#e05252' : '#006049'};
      color: #fff; padding: 12px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 600; z-index: 3000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: toastIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── FORM SUBMIT ──
document
  .getElementById('changePasswordForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok', 'error');
      return;
    }

    const submitBtn = document.querySelector('.btn-save-password');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      showToast('Kata sandi berhasil diubah', 'success');
      document.getElementById('changePasswordForm').reset();

      setTimeout(() => {
        window.location.href = '/pengaturan';
      }, 1500);
    } catch (err) {
      showToast('Gagal: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Simpan Kata Sandi
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.33333 8H12.6667M12.6667 8L8 3.33333M12.6667 8L8 12.6667" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
  });
