

import { t } from '../i18n.js';

export const renderSkeletonGrid = (count = 12, isTall = false) => {
    const grid = document.createElement('div');
    grid.className = `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-4`;
    
    let skeletonHTML = '';
    for (let i = 0; i < count; i++) {
        skeletonHTML += `
            <div class="bg-slate-200 dark:bg-slate-800/50 rounded-lg p-3 animate-pulse">
                <div class="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-2"></div>
                <div class="h-5 rounded bg-slate-300 dark:bg-slate-700 w-3/4 mx-auto"></div>
                <div class="h-4 rounded bg-slate-300 dark:bg-slate-700 w-1/2 mx-auto mt-2"></div>
                ${isTall ? '<div class="h-16 rounded bg-slate-300 dark:bg-slate-700 w-full mt-3"></div>' : '<div class="h-3 rounded bg-slate-300 dark:bg-slate-700 w-1/3 mx-auto mt-2"></div>'}
            </div>
        `;
    }
    grid.innerHTML = skeletonHTML;
    return grid;
};

export const renderErrorState = (message, onRetry) => {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'text-center p-8 bg-red-50 dark:bg-red-900/50 rounded-lg mt-6 border border-red-200 dark:border-red-800 flex flex-col items-center gap-4';
    
    errorContainer.innerHTML = `
        <svg class="w-12 h-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700 dark:text-red-300">${message}</p>
    `;

    if (onRetry && typeof onRetry === 'function') {
        const retryButton = document.createElement('button');
        retryButton.className = 'px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors transform active:scale-95';
        retryButton.textContent = t('retry');
        retryButton.addEventListener('click', onRetry);
        errorContainer.appendChild(retryButton);
    }
    
    return errorContainer;
};