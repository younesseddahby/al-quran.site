
import { t, getCurrentLanguage } from '../i18n.js';
import { RefreshIcon, BeadsIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons.js';

const PREDEFINED_TASBIH = [
    { ar: "سُبْحَانَ ٱللَّٰهِ", en: "SubhanAllah", translation: "Glory be to Allah" },
    { ar: "ٱلْحَمْدُ لِلَّٰهِ", en: "Alhamdulillah", translation: "All praise is due to Allah" },
    { ar: "ٱللَّٰهُ أَكْبَرُ", en: "Allahu Akbar", translation: "Allah is the Greatest" },
    { ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", en: "La ilaha illa Allah", translation: "There is no god but Allah" },
    { ar: "أَسْتَغْفِرُ ٱللَّٰهَ", en: "Astaghfirullah", translation: "I seek forgiveness from Allah" },
    { ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ", en: "La hawla wa la quwwata illa billah", translation: "There is no power and no strength except with Allah" },
    { ar: "سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ", en: "SubhanAllahi wa bihamdihi", translation: "Glory be to Allah and His is the praise" },
    { ar: "سُبْحَانَ ٱللَّٰهِ ٱلْعَظِيمِ", en: "SubhanAllahil Azeem", translation: "Glory be to Allah, the Supreme" },
    { ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", en: "Allahumma salli 'ala Muhammad", translation: "O Allah, send prayers upon Muhammad" },
];

export const renderTasbih = (container, props = {}) => {
    const isRtl = getCurrentLanguage() === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;
    let state = {
        count: parseInt(localStorage.getItem('tasbihCount') || '0', 10),
        target: parseInt(localStorage.getItem('tasbihTarget') || '33', 10), // 0 means infinity
        selectedPhraseIndex: parseInt(localStorage.getItem('tasbihPhraseIndex') || '0', 10),
    };

    const saveState = () => {
        localStorage.setItem('tasbihCount', state.count);
        localStorage.setItem('tasbihTarget', state.target);
        localStorage.setItem('tasbihPhraseIndex', state.selectedPhraseIndex);
    };

    const render = () => {
        const lang = getCurrentLanguage();
        const phrase = PREDEFINED_TASBIH[state.selectedPhraseIndex];
        const progress = state.target > 0 ? Math.min((state.count / state.target) * 100, 100) : 0;
        
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center space-y-8 fade-in p-4">
                <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-2">
                            <button id="tasbih-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                ${BackIcon({className: "w-6 h-6"})}
                                <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                            </button>
                            <div class="flex items-center gap-2 text-theme-600 dark:text-theme-400">
                                ${BeadsIcon()}
                                <h2 class="text-xl font-bold font-amiri">${t('tasbih')}</h2>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <select id="target-select" class="text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-theme-500 cursor-pointer">
                                <option value="33" ${state.target === 33 ? 'selected' : ''}>33</option>
                                <option value="99" ${state.target === 99 ? 'selected' : ''}>99</option>
                                <option value="100" ${state.target === 100 ? 'selected' : ''}>100</option>
                                <option value="1000" ${state.target === 1000 ? 'selected' : ''}>1000</option>
                                <option value="0" ${state.target === 0 ? 'selected' : ''}>∞</option>
                            </select>
                            <button id="reset-btn" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300" title="${t('reset')}">
                                ${RefreshIcon()}
                            </button>
                        </div>
                    </div>

                    <div class="relative mb-8">
                        <select id="phrase-select" class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-amiri appearance-none cursor-pointer focus:ring-2 focus:ring-theme-500 focus:outline-none dark:text-white">
                            ${PREDEFINED_TASBIH.map((p, i) => `<option value="${i}" ${i === state.selectedPhraseIndex ? 'selected' : ''} class="dark:bg-slate-900 dark:text-white">${p.ar}</option>`).join('')}
                        </select>
                        <div class="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                            ${phrase.translation}
                        </div>
                    </div>

                    <div class="flex justify-center mb-8">
                        <button id="counter-btn" class="relative w-64 h-64 rounded-full bg-gradient-to-br from-theme-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#1e293b] flex items-center justify-center group active:scale-95 transition-all duration-300 select-none outline-none ring-4 ring-slate-100 dark:ring-slate-800">
                            <!-- Progress Glow -->
                            <div class="absolute inset-4 rounded-full bg-theme-500/10 dark:bg-theme-500/20 transition-all duration-500 blur-xl" style="transform: scale(${progress / 100}); opacity: ${progress > 0 ? 1 : 0}"></div>
                            
                            <!-- Progress Ring -->
                            <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4" class="text-slate-100 dark:text-slate-800" />
                                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="289" stroke-dashoffset="${289 - (289 * progress / 100)}" class="text-theme-500 transition-all duration-300 ease-out" stroke-linecap="round" />
                            </svg>
                            
                            <div class="flex flex-col items-center z-10">
                                <span class="text-6xl font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tighter transition-colors">${state.count}</span>
                                ${state.target > 0 ? `<span class="text-xs text-slate-400 mt-1 uppercase tracking-widest">${t('target')}: ${state.target}</span>` : ''}
                            </div>
                        </button>
                    </div>

                    <div class="flex justify-center mb-6">
                        <button id="reset-btn-large" class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 font-bold text-sm border border-slate-200 dark:border-slate-700">
                            ${RefreshIcon({className: "w-4 h-4"})}
                            ${t('reset')}
                        </button>
                    </div>
                    
                    <p class="text-center text-xs text-slate-400">${t('tapToCount')}</p>
                </div>
            </div>
        `;

        const counterBtn = container.querySelector('#counter-btn');
        const resetBtn = container.querySelector('#reset-btn');
        const resetBtnLarge = container.querySelector('#reset-btn-large');
        const targetSelect = container.querySelector('#target-select');
        const phraseSelect = container.querySelector('#phrase-select');
        const backBtn = container.querySelector('#tasbih-back-btn');

        backBtn?.addEventListener('click', () => {
            if (props.onBack) props.onBack();
        });

        const handleReset = () => {
            state.count = 0;
            saveState();
            render();
        };

        counterBtn?.addEventListener('click', () => {
            state.count++;
            if (state.target > 0 && state.count > state.target) {
                state.count = 1; // Reset to 1 on loop
            }
            saveState();
            
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(10);
            
            render(); // Re-render to update UI
        });

        resetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(t('confirmReset'))) handleReset();
        });
        resetBtnLarge?.addEventListener('click', handleReset);

        targetSelect.addEventListener('change', (e) => {
            state.target = parseInt(e.target.value, 10);
            state.count = 0;
            saveState();
            render();
        });

        phraseSelect.addEventListener('change', (e) => {
            state.selectedPhraseIndex = parseInt(e.target.value, 10);
            state.count = 0; // Start from 0 when choosing another tasbih
            saveState();
            render();
        });
    };

    render();
};
