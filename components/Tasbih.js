
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
        totalCount: parseInt(localStorage.getItem('tasbihTotalCount') || '0', 10),
        sessions: parseInt(localStorage.getItem('tasbihSessions') || '0', 10),
        showSettings: false,
        showAddPhrase: false,
        showPhraseDropdown: false
    };

    const saveState = () => {
        localStorage.setItem('tasbihCount', state.count);
        localStorage.setItem('tasbihTarget', state.target);
        localStorage.setItem('tasbihPhraseIndex', state.selectedPhraseIndex);
        localStorage.setItem('tasbihCustomPhrases', JSON.stringify(state.customPhrases));
        localStorage.setItem('tasbihHaptic', state.hapticEnabled);
        localStorage.setItem('tasbihTotalCount', state.totalCount);
        localStorage.setItem('tasbihSessions', state.sessions);
    };

    const getAllPhrases = () => [...PREDEFINED_TASBIH, ...state.customPhrases];

    const render = () => {
        const lang = getCurrentLanguage();
        const allPhrases = getAllPhrases();
        const phrase = allPhrases[state.selectedPhraseIndex] || allPhrases[0];
        const progress = state.target > 0 ? Math.min(state.count / state.target, 1) : 0;
        
        container.innerHTML = `
            <div class="flex flex-col h-full max-w-2xl mx-auto fade-in">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 md:p-6 pb-2">
                    <div class="flex items-center gap-3">
                        <button id="tasbih-back-btn" class="w-9 h-9 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-500 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-950/20 transition-all">
                            ${BackIcon({className: "w-5 h-5"})}
                        </button>
                        <div>
                            <h2 class="text-lg font-bold text-slate-800 dark:text-white leading-tight">${t('tasbih')}</h2>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${t('dailyDhikr')}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="tasbih-settings-btn" class="w-9 h-9 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-500 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-950/20 transition-all">
                            ${SettingsIcon({className: "w-4 h-4"})}
                        </button>
                        <button id="reset-btn" class="w-9 h-9 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                            ${RefreshIcon({className: "w-4 h-4"})}
                        </button>
                    </div>
                </div>

                <!-- Main Counter Area -->
                <div class="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative">
                    <!-- Phrase Selection -->
                    <div class="w-full max-w-sm mb-6 relative z-10">
                        <button id="phrase-select-btn" class="w-full p-4 md:p-5 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between group hover:border-theme-500/30 transition-all duration-300">
                            <div class="text-left min-w-0 flex-grow pr-2">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">${t('currentPhrase')}</p>
                                <h3 class="font-amiri text-2xl md:text-3xl text-slate-800 dark:text-white truncate leading-[1.6]">${phrase.ar}</h3>
                                <p class="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-1">${phrase.en || phrase.translation || ''}</p>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-theme-600 transition-colors ml-3 flex-shrink-0">
                                ${ArrowRightIcon({className: `w-4 h-4 transition-transform duration-300 ${state.showPhraseDropdown ? 'rotate-90' : 'rotate-0'}`})}
                            </div>
                        </button>

                        <!-- Phrase Dropdown -->
                        <div id="phrase-dropdown" class="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl z-50 ${state.showPhraseDropdown ? 'block' : 'hidden'} max-h-[280px] overflow-y-auto custom-scrollbar">
                            <div class="p-1.5 space-y-1">
                                ${allPhrases.map((p, i) => `
                                    <button data-index="${i}" class="phrase-option w-full p-2.5 rounded-xl text-left transition-all ${state.selectedPhraseIndex === i ? 'bg-theme-500/10 border border-theme-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}">
                                        <p class="font-amiri text-base text-slate-800 dark:text-white leading-tight">${p.ar}</p>
                                        <p class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">${p.en || p.translation || ''}</p>
                                    </button>
                                `).join('')}
                                <button id="add-custom-phrase-btn" class="w-full p-2.5 rounded-xl text-left border border-dashed border-slate-300 dark:border-slate-700 hover:border-theme-500/50 hover:bg-theme-50/50 dark:hover:bg-theme-900/10 transition-all group">
                                    <div class="flex items-center gap-2 text-theme-600 dark:text-theme-400">
                                        ${PlusIcon({className: "w-3.5 h-3.5"})}
                                        <span class="text-[10px] font-bold uppercase tracking-wider">${t('addCustomPhrase')}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Counter Circle -->
                    <div id="tasbih-tap-area" class="relative w-60 h-60 md:w-64 md:h-64 flex items-center justify-center cursor-pointer group active:scale-[0.98] transition-transform duration-150">
                        <!-- Progress Ring -->
                        <svg viewBox="0 0 100 100" class="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="45" class="stroke-slate-100 dark:stroke-slate-800/50 fill-none" stroke-width="6"></circle>
                            <circle id="tasbih-progress-ring" cx="50" cy="50" r="45" class="stroke-theme-500 fill-none transition-all duration-500" stroke-width="6" stroke-dasharray="282.7" stroke-dashoffset="${282.7 * (1 - progress)}" stroke-linecap="round" style="opacity: ${state.count === 0 ? 0 : 1}"></circle>
                        </svg>

                        <!-- Inner Circle -->
                        <div class="w-[88%] h-[88%] rounded-full glass-card border border-slate-200/50 dark:border-slate-700/50 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group-hover:border-theme-500/30 transition-colors">
                            <div class="absolute inset-0 bg-theme-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1">${t('count')}</span>
                            <span id="tasbih-count" class="text-6xl md:text-7xl font-display font-bold text-slate-800 dark:text-white tabular-nums tracking-tighter">${state.count}</span>
                            <div class="mt-1 flex flex-col items-center">
                                <span class="text-[10px] font-bold text-theme-600 dark:text-theme-400">${Math.floor(progress * 100)}%</span>
                                <span class="text-[9px] text-slate-400 font-medium uppercase tracking-wider">${t('target')}: ${state.target}</span>
                            </div>
                        </div>

                        <!-- Tap Ripple Effect Container -->
                        <div id="ripple-container" class="absolute inset-0 pointer-events-none overflow-hidden rounded-full"></div>
                    </div>

                    <!-- Total Stats -->
                    <div class="mt-10 flex items-center gap-8">
                        <div class="text-center">
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">${t('total')}</p>
                            <p class="text-base font-bold text-slate-700 dark:text-slate-300">${state.totalCount.toLocaleString()}</p>
                        </div>
                        <div class="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
                        <div class="text-center">
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">${t('sessions')}</p>
                            <p class="text-base font-bold text-slate-700 dark:text-slate-300">${state.sessions.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <!-- Settings Overlay -->
                <div id="tasbih-settings-overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 ${state.showSettings ? 'flex' : 'hidden'}">
                    <div class="w-full max-w-md glass-card rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-xl font-bold text-slate-800 dark:text-white">${t('tasbihSettings')}</h3>
                                <button id="close-settings-btn" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    ${XMarkIcon({className: "w-5 h-5"})}
                                </button>
                            </div>

                            <div class="space-y-6">
                                <!-- Target Selection -->
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">${t('targetCount')}</label>
                                    <div class="grid grid-cols-4 gap-2 mb-3">
                                        ${[33, 99, 100, 1000].map(val => `
                                            <button data-target="${val}" class="target-option py-2 rounded-xl border transition-all font-bold text-sm ${state.target === val ? 'bg-theme-500 border-theme-500 text-white shadow-lg shadow-theme-500/30' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-theme-500/50'}">
                                                ${val}
                                            </button>
                                        `).join('')}
                                    </div>
                                    <div class="relative">
                                        <input id="custom-target-input" type="number" value="${state.target}" class="w-full p-3 pl-10 glass rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 text-sm font-bold" placeholder="${t('enterCustomTarget')}">
                                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            ${BeadsIcon({className: "w-4 h-4"})}
                                        </div>
                                    </div>
                                </div>

                                <!-- Haptic Feedback -->
                                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-xl bg-theme-500/10 flex items-center justify-center text-theme-600 dark:text-theme-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-slate-800 dark:text-white">${t('hapticFeedback')}</p>
                                            <p class="text-[10px] text-slate-500 dark:text-slate-400">${t('vibrateOnTap')}</p>
                                        </div>
                                    </div>
                                    <button id="haptic-toggle" class="w-12 h-6 rounded-full relative transition-colors ${state.hapticEnabled ? 'bg-theme-500' : 'bg-slate-300 dark:bg-slate-700'}">
                                        <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${state.hapticEnabled ? 'translate-x-6' : ''}"></div>
                                    </button>
                                </div>

                                <!-- Custom Phrases Management -->
                                <div>
                                    <div class="flex items-center justify-between mb-3">
                                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${t('customPhrases')}</label>
                                        <button id="add-phrase-inline-btn" class="text-[10px] font-bold text-theme-600 dark:text-theme-400 uppercase tracking-wider hover:underline">${t('add')}</button>
                                    </div>
                                    <div class="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                        ${state.customPhrases.length === 0 ? `
                                            <p class="text-xs text-slate-400 italic text-center py-4">${t('noCustomPhrases')}</p>
                                        ` : state.customPhrases.map((p, i) => `
                                            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 group">
                                                <div class="min-w-0">
                                                    <p class="font-amiri text-sm text-slate-800 dark:text-white truncate">${p.ar}</p>
                                                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${p.en || ''}</p>
                                                </div>
                                                <button data-delete-phrase="${i}" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    ${TrashIcon({className: "w-4 h-4"})}
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <button id="settings-done-btn" class="w-full mt-8 py-3 bg-theme-600 hover:bg-theme-700 text-white font-bold rounded-2xl shadow-lg shadow-theme-500/30 transition-all active:scale-95">
                                ${t('done')}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add Phrase Overlay -->
                <div id="add-phrase-overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center p-4 ${state.showAddPhrase ? 'flex' : 'hidden'}">
                    <div class="w-full max-w-md glass-card rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-6">${t('addCustomPhrase')}</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">${t('arabicText')}</label>
                                    <textarea id="new-phrase-arabic" class="w-full p-4 glass rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 font-amiri text-xl text-right" rows="2" placeholder="سبحان الله"></textarea>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">${t('translation')}</label>
                                    <input id="new-phrase-translation" type="text" class="w-full p-4 glass rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 text-sm" placeholder="Glory be to Allah">
                                </div>
                            </div>
                            <div class="flex gap-3 mt-8">
                                <button id="cancel-add-phrase-btn" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                    ${t('cancel')}
                                </button>
                                <button id="save-phrase-btn" class="flex-1 py-3 bg-theme-600 hover:bg-theme-700 text-white font-bold rounded-2xl shadow-lg shadow-theme-500/30 transition-all">
                                    ${t('save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners
        container.querySelector('#tasbih-back-btn')?.addEventListener('click', () => props.onBack?.());
        
        const tapArea = container.querySelector('#tasbih-tap-area');
        tapArea?.addEventListener('click', (e) => {
            state.count++;
            state.totalCount++;
            
            // Ripple effect
            const rippleContainer = container.querySelector('#ripple-container');
            const ripple = document.createElement('div');
            ripple.className = 'absolute rounded-full bg-theme-500/20 animate-ripple pointer-events-none';
            const rect = tapArea.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            rippleContainer.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            if (state.target > 0 && state.count >= state.target) {
                state.sessions++;
                state.count = 0;
                if (state.hapticEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
            } else if (state.hapticEnabled && navigator.vibrate) {
                navigator.vibrate(20);
            }
            
            saveState();
            render();
        });

        container.querySelector('#reset-btn')?.addEventListener('click', () => {
            state.count = 0;
            saveState();
            render();
        });

        container.querySelector('#phrase-select-btn')?.addEventListener('click', () => {
            state.showPhraseDropdown = !state.showPhraseDropdown;
            render();
        });

        container.querySelectorAll('.phrase-option').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedPhraseIndex = parseInt(btn.dataset.index, 10);
                state.count = 0;
                state.showPhraseDropdown = false;
                saveState();
                render();
            });
        });

        container.querySelector('#tasbih-settings-btn')?.addEventListener('click', () => {
            state.showSettings = true;
            render();
        });

        container.querySelector('#close-settings-btn')?.addEventListener('click', () => {
            state.showSettings = false;
            render();
        });

        container.querySelector('#settings-done-btn')?.addEventListener('click', () => {
            state.showSettings = false;
            render();
        });

        container.querySelectorAll('.target-option').forEach(btn => {
            btn.addEventListener('click', () => {
                state.target = parseInt(btn.dataset.target, 10);
                state.count = 0;
                saveState();
                render();
            });
        });

        container.querySelector('#custom-target-input')?.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) {
                state.target = val;
                state.count = 0;
                saveState();
                render();
            }
        });

        container.querySelector('#haptic-toggle')?.addEventListener('click', () => {
            state.hapticEnabled = !state.hapticEnabled;
            saveState();
            render();
        });

        container.querySelector('#add-custom-phrase-btn')?.addEventListener('click', () => {
            state.showPhraseDropdown = false;
            state.showAddPhrase = true;
            render();
        });

        container.querySelector('#add-phrase-inline-btn')?.addEventListener('click', () => {
            state.showAddPhrase = true;
            render();
        });

        container.querySelector('#cancel-add-phrase-btn')?.addEventListener('click', () => {
            state.showAddPhrase = false;
            render();
        });

        container.querySelector('#save-phrase-btn')?.addEventListener('click', () => {
            const ar = container.querySelector('#new-phrase-arabic').value.trim();
            const en = container.querySelector('#new-phrase-translation').value.trim();
            if (ar) {
                state.customPhrases.push({ ar, en });
                state.showAddPhrase = false;
                state.selectedPhraseIndex = getAllPhrases().length - 1;
                state.count = 0;
                saveState();
                render();
            }
        });

        container.querySelectorAll('[data-delete-phrase]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.deletePhrase, 10);
                state.customPhrases.splice(idx, 1);
                const predefinedCount = PREDEFINED_TASBIH.length;
                if (state.selectedPhraseIndex >= predefinedCount + idx) {
                    state.selectedPhraseIndex = Math.max(0, state.selectedPhraseIndex - 1);
                }
                saveState();
                render();
            });
        });
    };

    render();
};
