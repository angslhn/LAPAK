// ── TOAST ──
let activeToast = null;

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');

  if (!container) return;

  if (activeToast) {
    activeToast.remove();
    clearTimeout(activeToast._timeout);
  }

  const toast = document.createElement('div');

  toast.className = `toast ${type}`;

  const iconSuccess = `<svg width="22" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.6 21L5.7 17.8L2.1 17L2.45 13.3L0 10.5L2.45 7.7L2.1 4L5.7 3.2L7.6 0L11 1.45L14.4 0L16.3 3.2L19.9 4L19.55 7.7L22 10.5L19.55 13.3L19.9 17L16.3 17.8L14.4 21L11 19.55L7.6 21ZM8.45 18.45L11 17.35L13.6 18.45L15 16.05L17.75 15.4L17.5 12.6L19.35 10.5L17.5 8.35L17.75 5.55L15 4.95L13.55 2.55L11 3.65L8.4 2.55L7 4.95L4.25 5.55L4.5 8.35L2.65 10.5L4.5 12.6L4.25 15.45L7 16.05L8.45 18.45ZM9.95 14.05L15.6 8.4L14.2 6.95L9.95 11.2L7.8 9.1L6.4 10.5L9.95 14.05Z" fill="white"/></svg>`;
  const iconError = `<svg xmlns="http://www.w3.org/2000/svg" width="22" fill="none" viewBox="0 0 640 640"><path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM348 444L292 444L292 388L348 388L348 444zM339.2 352L300.8 352L288 192L352 192L339.2 352z" fill="white"/></svg>`;

  toast.innerHTML = `
    <span style="display:flex;align-items:center;gap:4px;flex-shrink:0">
      ${type === 'error' ? iconError : iconSuccess}
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  activeToast = toast;

  activeToast._timeout = setTimeout(() => {
    toast.remove();
    if (activeToast === toast) activeToast = null;
  }, 3000);
}
