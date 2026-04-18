import { renderQuranReader } from './QuranReader.js';
import { renderQuranListener } from './QuranListener.js';
import { QuranIcon, ListenIcon } from './Icons.js';
import { t } from '../i18n.js';

export const renderQuranHub = (container, cache, props) => {
    // Keep track of internal mode and sub-components via cache to prevent "reloading"
    let mode = cache.hubMode || props.initialMode || 'read';
    let currentCleanup = null;
    let isInitialized = false;

    const render = () => {
        const isReaderView = cache.readerView === 'reader';
        
        // Only clear the container if we haven't rendered the toggle skeleton yet
        if (!isInitialized) {
            container.innerHTML = `
                <div class="space-y-1 md:space-y-2 fade-in">
                    <div id="quran-mode-toggle-wrap" class="flex justify-center pt-2 ${isReaderView ? 'hidden' : ''}">
                        <div class="inline-flex p-1 glass rounded-[2rem] shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                            <button data-mode="read" class="mode-btn px-4 sm:px-8 py-2 md:py-3 text-xs md:text-sm font-bold rounded-[1.5rem] flex items-center gap-2 md:gap-2.5 transition-all duration-500 transform active:scale-95">
                                ${QuranIcon({className: "w-4 h-4 md:w-5 md:h-5"})} <span>${t('read')}</span>
                            </button>
                            <button data-mode="listen" class="mode-btn px-4 sm:px-8 py-2 md:py-3 text-xs md:text-sm font-bold rounded-[1.5rem] flex items-center gap-2 md:gap-2.5 transition-all duration-500 transform active:scale-95">
                                ${ListenIcon({className: "w-4 h-4 md:w-5 md:h-5"})} <span>${t('listen')}</span>
                            </button>
                        </div>
                    </div>
                    <div id="hub-content-area" class="fade-in"></div>
                </div>
            `;
            isInitialized = true;
            
            container.querySelectorAll('.mode-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newMode = btn.dataset.mode;
                    if (mode !== newMode) {
                        mode = newMode;
                        cache.hubMode = mode;
                        updateView();
                    }
                });
            });
        }

        updateView();
    };

    const updateView = () => {
        const contentArea = container.querySelector('#hub-content-area');
        if (!contentArea) return;

        // Update Toggle visibility
        const toggleWrap = container.querySelector('#quran-mode-toggle-wrap');
        const isReaderView = cache.readerView === 'reader';
        if (toggleWrap) {
            if (isReaderView) toggleWrap.classList.add('hidden');
            else toggleWrap.classList.remove('hidden');
        }
        
        // Update Toggle Styling
        container.querySelectorAll('.mode-btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.className = `mode-btn px-4 sm:px-8 py-2 md:py-3 text-xs md:text-sm font-bold rounded-[1.5rem] flex items-center gap-2 md:gap-2.5 transition-all duration-500 transform active:scale-95 ${
                isActive ? 'glass text-theme-700 dark:text-theme-300 shadow-xl shadow-slate-200/50 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`;
        });

        // If we are already in the correct mode and have content, don't re-render everything
        // This prevents scroll position loss when App.js re-renders
        if (contentArea.dataset.renderedMode === mode) {
            return;
        }
        contentArea.dataset.renderedMode = mode;

        // Cleanup previous sub-component
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }

        contentArea.innerHTML = '';

        if (mode === 'read') {
            currentCleanup = renderQuranReader(contentArea, cache, {
                ...props,
                setReaderMode: (cfg) => {
                    // Cache the current view state before potentially triggering a full App render
                    cache.hubMode = 'read';
                    props.setReaderMode(cfg);
                }
            });
        } else {
            currentCleanup = renderQuranListener(contentArea, cache, {
                ...props
            });
        }
    };
    
    render();

    return () => {
        if (currentCleanup) currentCleanup();
        isInitialized = false;
    };
};