

import { t } from '../i18n.js';

export const createSpinner = (text = t('loading')) => {
  const spinnerContainer = document.createElement('div');
  spinnerContainer.className = 'flex flex-col items-center justify-center p-8 space-y-4';

  spinnerContainer.innerHTML = `
    <div class="w-12 h-12 border-4 border-t-4 border-slate-200 dark:border-slate-700 border-t-theme-600 dark:border-t-theme-400 rounded-full animate-spin"></div>
    <p class="text-lg text-slate-500 dark:text-slate-400">${text}</p>
  `;
  
  return spinnerContainer;
};