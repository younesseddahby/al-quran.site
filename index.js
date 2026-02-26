
// Initialize the global toast helper before importing App
window.showToast = window.showToast || ((message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.warn('Toast container not found, logging to console:', message);
    return;
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  // Simple check for error/success styling if needed
  if (type === 'error') toast.style.borderLeft = '4px solid #ef4444';
  if (type === 'success') toast.style.borderLeft = '4px solid #10b981';
  
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  // Auto-remove
  const timeoutId = setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);

  // Allow clicking to dismiss
  toast.onclick = () => {
    clearTimeout(timeoutId);
    toast.remove();
  };
});

import App from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize the application
App(rootElement);
