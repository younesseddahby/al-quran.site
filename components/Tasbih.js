
import { t, getCurrentLanguage } from '../i18n.js';
import { RefreshIcon, BeadsIcon, ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon, SettingsIcon, XMarkIcon } from './Icons.js';

const PREDEFINED_TASBIH = [
    { ar: "سُبْحَانَ ٱللَّٰهِ", en: "SubhanAllah", translation: "Glory be to Allah", id: "Maha Suci Allah", tr: "Allah'ı tüm eksikliklerden tenzih ederim" },
    { ar: "ٱلْحَمْدُ لِلَّٰهِ", en: "Alhamdulillah", translation: "All praise is due to Allah", id: "Segala puji bagi Allah", tr: "Hamd Allah'adır" },
    { ar: "ٱللَّٰهُ أَكْبَرُ", en: "Allahu Akbar", translation: "Allah is the Greatest", id: "Allah Maha Besar", tr: "Allah en büyüktür" },
    { ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", en: "La ilaha illa Allah", translation: "There is no god but Allah", id: "Tidak ada Tuhan selain Allah", tr: "Allah'tan başka ilah yoktur" },
    { ar: "أَسْتَغْفِرُ ٱللَّٰهَ", en: "Astaghfirullah", translation: "I seek forgiveness from Allah", id: "Aku memohon ampun kepada Allah", tr: "Allah'tan bağışlanma dilerim" },
    { ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ", en: "La hawla wa la quwwata illa billah", translation: "There is no power and no strength except with Allah", id: "Tidak ada daya dan upaya kecuali dengan kekuatan Allah", tr: "Güç ve kuvvet ancak Allah'ındır" },
];

export const renderTasbih = (container, props = {}) => {
    const isRtl = getCurrentLanguage() === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;
    
    let state = {
        count: parseInt(localStorage.getItem('tasbihCount') || '0', 10),
        target: parseInt(localStorage.getItem('tasbihTarget') || '33', 10),
        selectedPhraseIndex: parseInt(localStorage.getItem('tasbihPhraseIndex') || '0', 10),
        customPhrases: JSON.parse(localStorage.getItem('tasbihCustomPhrases') || '[]'),
        hapticEnabled: localStorage.getItem('tasbihHaptic') !== 'false',
        showSettings: false,
        showAddPhrase: false,
    };

    const saveState = () => {
        localStorage.setItem('tasbihCount', state.count);
        localStorage.setItem('tasbihTarget', state.target);
        localStorage.setItem('tasbihPhraseIndex', state.selectedPhraseIndex);
        localStorage.setItem('tasbihCustomPhrases', JSON.stringify(state.customPhrases));
        localStorage.setItem('tasbihHaptic', state.hapticEnabled);
    };

    const getAllPhrases = () => [...PREDEFINED_TASBIH, ...state.customPhrases];

    const render = () => {
        const lang = getCurrentLanguage();
        const allPhrases = getAllPhrases();
        const phrase = allPhrases[state.selectedPhraseIndex] || allPhrases[0];
        const progress = state.target > 0 ? Math.min((state.count / state.target) * 100, 100) : 0;
        
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center space-y-8 fade-in p-4 relative">
                <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-2">
                            <button id="tasbih-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1 text-slate-900 dark:text-white">
                                ${BackIcon({className: "w-6 h-6"})}
                                <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                            </button>
                            <div class="flex items-center gap-2 text-theme-600 dark:text-theme-400">
                                ${BeadsIcon()}
                                <h2 class="text-xl font-bold font-amiri">${t('tasbih')}</h2>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button id="tasbih-settings-btn" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                                ${SettingsIcon({className: "w-5 h-5"})}
                            </button>
                            <button id="reset-btn" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300" title="${t('reset')}">
                                ${RefreshIcon()}
                            </button>
                        </div>
                    </div>

                    <div class="relative mb-8">
                        <div class="flex items-center gap-2">
                            <select id="phrase-select" class="flex-grow p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-amiri cursor-pointer focus:ring-2 focus:ring-theme-500 focus:outline-none text-slate-900 dark:text-white">
                                ${allPhrases.map((p, i) => `<option value="${i}" ${i === state.selectedPhraseIndex ? 'selected' : ''} class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">${p.ar}</option>`).join('')}
                            </select>
                            <button id="add-phrase-btn" class="p-3 rounded-xl bg-theme-50 dark:bg-theme-950/20 text-theme-600 dark:text-theme-400 hover:bg-theme-100 dark:hover:bg-theme-900/30 transition-colors">
                                ${PlusIcon({className: "w-6 h-6"})}
                            </button>
                        </div>
                        <div class="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                            ${phrase.en || phrase.translation || ''}
                        </div>
                    </div>

                    <div class="flex justify-center mb-8">
                        <button id="counter-btn" class="relative w-64 h-64 rounded-full bg-gradient-to-br from-theme-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#1e293b] flex items-center justify-center group active:scale-95 transition-all duration-300 select-none outline-none ring-4 ring-slate-100 dark:ring-slate-800">
                            <div class="absolute inset-4 rounded-full bg-theme-500/10 dark:bg-theme-500/20 transition-all duration-500 blur-xl" style="transform: scale(${progress / 100}); opacity: ${progress > 0 ? 1 : 0}"></div>
                            
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

                    <!-- Settings Overlay -->
                    ${state.showSettings ? `
                    <div class="absolute inset-0 bg-white dark:bg-slate-900 z-20 p-6 fade-in flex flex-col">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('tasbihSettings') || 'Tasbih Settings'}</h3>
                            <button id="close-settings" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                ${XMarkIcon({className: "w-5 h-5"})}
                            </button>
                        </div>
                        
                        <div class="space-y-6 flex-grow overflow-y-auto pr-2">
                            <div class="space-y-3">
                                <label class="text-sm font-bold text-slate-500 uppercase tracking-wider">${t('target')}</label>
                                <div class="grid grid-cols-3 gap-2">
                                    ${[33, 99, 100, 1000, 0].map(val => `
                                        <button data-target="${val}" class="target-btn py-2 rounded-xl border ${state.target === val ? 'bg-theme-600 text-white border-theme-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'} text-sm font-bold transition-all">
                                            ${val === 0 ? '∞' : val}
                                        </button>
                                    `).join('')}
                                    <button id="custom-target-btn" class="py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all">
                                        ${t('custom') || 'Custom'}
                                    </button>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-900 dark:text-white">${t('hapticFeedback') || 'Haptic Feedback'}</span>
                                    <span class="text-xs text-slate-500">${t('vibrateOnTap') || 'Vibrate on every tap'}</span>
                                </div>
                                <button id="haptic-toggle" class="w-12 h-6 rounded-full relative transition-colors ${state.hapticEnabled ? 'bg-theme-600' : 'bg-slate-300 dark:bg-slate-700'}">
                                    <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${state.hapticEnabled ? 'translate-x-6' : ''}"></div>
                                </button>
                            </div>

                            <div class="space-y-3">
                                <label class="text-sm font-bold text-slate-500 uppercase tracking-wider">${t('managePhrases') || 'Custom Phrases'}</label>
                                <div class="space-y-2">
                                    ${state.customPhrases.map((p, i) => {
                                        const isSelected = state.selectedPhraseIndex === (PREDEFINED_TASBIH.length + i);
                                        return `
                                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border ${isSelected ? 'border-theme-500 ring-1 ring-theme-500' : 'border-slate-200 dark:border-slate-700'}">
                                            <div class="flex flex-col">
                                                <span class="font-amiri text-slate-900 dark:text-white">${p.ar}</span>
                                                ${p.en ? `<span class="text-[10px] text-slate-400">${p.en}</span>` : ''}
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <button data-select-phrase="${PREDEFINED_TASBIH.length + i}" class="px-2 py-1 text-[10px] font-bold uppercase rounded bg-theme-100 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400 hover:bg-theme-200 transition-colors">
                                                    ${t('select')}
                                                </button>
                                                <button data-delete-phrase="${i}" class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors">
                                                    ${TrashIcon({className: "w-4 h-4"})}
                                                </button>
                                            </div>
                                        </div>
                                    `}).join('')}
                                    ${state.customPhrases.length === 0 ? `<p class="text-xs text-slate-400 text-center py-4 italic">${t('noCustomPhrases') || 'No custom phrases added'}</p>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="pt-4 mt-auto">
                            <button id="done-settings-btn" class="w-full py-3 bg-theme-600 text-white rounded-xl font-bold shadow-lg shadow-theme-600/20 active:scale-95 transition-all">
                                ${t('done')}
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Add Phrase Overlay -->
                    ${state.showAddPhrase ? `
                    <div class="absolute inset-0 bg-white dark:bg-slate-900 z-30 p-6 fade-in flex flex-col">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('addCustomPhrase') || 'Add Custom Phrase'}</h3>
                            <button id="close-add-phrase" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                ${XMarkIcon({className: "w-5 h-5"})}
                            </button>
                        </div>
                        <div class="space-y-4 flex-grow">
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-500 uppercase">${t('arabicText') || 'Arabic Text'}</label>
                                <input id="new-phrase-ar" type="text" dir="rtl" class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right font-amiri text-xl outline-none focus:ring-2 focus:ring-theme-500 text-slate-900 dark:text-white placeholder:text-slate-400" placeholder="سُبْحَانَ ٱللَّٰهِ">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-500 uppercase">${t('translation') || 'Translation (Optional)'}</label>
                                <input id="new-phrase-en" type="text" class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-theme-500 text-slate-900 dark:text-white placeholder:text-slate-400" placeholder="Glory be to Allah">
                            </div>
                            <button id="save-new-phrase" class="w-full py-3 bg-theme-600 text-white rounded-xl font-bold shadow-lg shadow-theme-600/20 active:scale-95 transition-all mt-4">
                                ${t('save') || 'Save Phrase'}
                            </button>
                        </div>
                        <div class="pt-4">
                            <button id="done-add-phrase-btn" class="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold active:scale-95 transition-all">
                                ${t('done')}
                            </button>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Event Listeners
        const backBtn = container.querySelector('#tasbih-back-btn');
        const counterBtn = container.querySelector('#counter-btn');
        const resetBtn = container.querySelector('#reset-btn');
        const resetBtnLarge = container.querySelector('#reset-btn-large');
        const phraseSelect = container.querySelector('#phrase-select');
        const settingsBtn = container.querySelector('#tasbih-settings-btn');
        const addPhraseBtn = container.querySelector('#add-phrase-btn');

        backBtn?.addEventListener('click', () => props.onBack?.());
        
        counterBtn?.addEventListener('click', () => {
            state.count++;
            if (state.target > 0 && state.count > state.target) {
                state.count = 1;
                if (state.hapticEnabled && navigator.vibrate) navigator.vibrate([20, 50, 20]); // Double pulse on target
            } else if (state.hapticEnabled && navigator.vibrate) {
                navigator.vibrate(15);
            }
            saveState();
            render();
        });

        const handleReset = (e) => {
            if (e) e.preventDefault();
            state.count = 0;
            saveState();
            render();
        };
        resetBtn?.addEventListener('click', handleReset);
        resetBtnLarge?.addEventListener('click', handleReset);

        phraseSelect?.addEventListener('change', (e) => {
            state.selectedPhraseIndex = parseInt(e.target.value, 10);
            state.count = 0;
            saveState();
            render();
        });

        settingsBtn?.addEventListener('click', () => {
            state.showSettings = true;
            render();
        });

        addPhraseBtn?.addEventListener('click', () => {
            state.showAddPhrase = true;
            render();
        });

        // Settings Listeners
        if (state.showSettings) {
            container.querySelector('#close-settings')?.addEventListener('click', () => {
                state.showSettings = false;
                render();
            });

            container.querySelector('#done-settings-btn')?.addEventListener('click', () => {
                state.showSettings = false;
                render();
            });

            container.querySelectorAll('.target-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.target = parseInt(btn.dataset.target, 10);
                    state.count = 0;
                    saveState();
                    render();
                });
            });

            container.querySelector('#custom-target-btn')?.addEventListener('click', () => {
                const val = prompt(t('enterCustomTarget') || 'Enter custom target:', state.target);
                if (val !== null) {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 0) {
                        state.target = num;
                        state.count = 0;
                        saveState();
                        render();
                    }
                }
            });

            container.querySelector('#haptic-toggle')?.addEventListener('click', () => {
                state.hapticEnabled = !state.hapticEnabled;
                saveState();
                render();
            });

            container.querySelectorAll('[data-select-phrase]').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.selectedPhraseIndex = parseInt(btn.dataset.selectPhrase, 10);
                    state.count = 0;
                    saveState();
                    render();
                });
            });

            container.querySelectorAll('[data-delete-phrase]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.deletePhrase, 10);
                    state.customPhrases.splice(idx, 1);
                    // Adjust selected index if needed
                    const predefinedCount = PREDEFINED_TASBIH.length;
                    if (state.selectedPhraseIndex >= predefinedCount + idx) {
                        state.selectedPhraseIndex = Math.max(0, state.selectedPhraseIndex - 1);
                    }
                    saveState();
                    render();
                });
            });
        }

        // Add Phrase Listeners
        if (state.showAddPhrase) {
            container.querySelector('#close-add-phrase')?.addEventListener('click', () => {
                state.showAddPhrase = false;
                render();
            });

            container.querySelector('#done-add-phrase-btn')?.addEventListener('click', () => {
                state.showAddPhrase = false;
                render();
            });

            container.querySelector('#save-new-phrase')?.addEventListener('click', () => {
                const ar = container.querySelector('#new-phrase-ar').value.trim();
                const en = container.querySelector('#new-phrase-en').value.trim();
                if (ar) {
                    state.customPhrases.push({ ar, en });
                    state.showAddPhrase = false;
                    state.selectedPhraseIndex = getAllPhrases().length - 1;
                    state.count = 0;
                    saveState();
                    render();
                } else {
                    alert(t('pleaseEnterArabicText') || 'Please enter Arabic text');
                }
            });
        }
    };

    render();
};
