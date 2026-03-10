import { createSpinner } from './Spinner.js';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackwardIcon, DownloadIcon, SaveIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon, Backward10Icon, Forward10Icon } from './Icons.js';
import { renderErrorState } from './UI.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { FAMOUS_RECITERS } from './QuranData.js';
import { fetchWithRetry } from '../utils/fetchUtils.js';

export const renderQuranListener = (container, cache, props) => {
    let isScrubbing = false;

    let state = {
        view: 'reciter-selection', // 'reciter-selection', 'surah-list', 'player'
        surahs: cache.surahs || [],
        loadingSurahs: !cache.surahs,
        error: null,
        
        reciters: FAMOUS_RECITERS,
        selectedReciter: null,
        reciterSearchQuery: '',
        
        currentSurah: null,
        isPlaying: false,
        isLoadingAudio: false,
        audio: new Audio(),
        currentTime: 0,
        duration: 0,
        volume: parseFloat(localStorage.getItem('quranPlayerVolume') || '0.75'),
        isMuted: false,
        
        isMemorizationMode: false,
        repeatCount: 1,
        currentRepeat: 0,
        verseDelay: 0,
        hideArabic: false,
        hideTranslation: false,
        
        downloadingProgress: {}, // { 'reciterId_surahNum': true }
    };

    const { audio } = state;
    audio.volume = state.volume;
    audio.preload = "auto"; // Optimize loading

    container.innerHTML = `<div id="quran-listener-content" class="space-y-6"></div>`;
    const contentContainer = container.querySelector('#quran-listener-content');
    
    const render = () => {
        if (state.loadingSurahs && (state.view === 'surah-list' || state.view === 'reciter-selection')) {
            contentContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    ${createSpinner(t('loading')).outerHTML}
                    <p class="text-slate-500 animate-pulse">${t('preparingYourExperience') || 'Preparing your experience...'}</p>
                </div>
            `;
            return;
        }
        if (state.error) {
            contentContainer.innerHTML = renderErrorState(state.error, () => {
                state.error = null;
                init();
            }).outerHTML;
            return;
        }

        switch(state.view) {
            case 'surah-list':
                renderSurahListView();
                break;
            case 'player':
                renderPlayerView();
                break;
            case 'reciter-selection':
            default:
                renderReciterSelectionView();
                break;
        }
    };

    const setState = (newState) => {
        const oldView = state.view;
        Object.assign(state, newState);

        if (oldView !== state.view) {
            render();
        } else if (state.view === 'player') {
            if (newState.currentTime === undefined) {
                renderPlayerView();
            }
        } else if (state.view === 'surah-list') {
            renderSurahListView();
        } else if (state.view === 'reciter-selection') {
            renderReciterSelectionView();
        }
    };

    const fetchSurahList = async () => {
        if (cache.surahs && cache.surahs.length > 0) {
            state.surahs = cache.surahs;
            state.loadingSurahs = false;
            return;
        }
        setState({ loadingSurahs: true });
        try {
            const response = await fetchWithRetry('https://api.alquran.cloud/v1/surah');
            const data = await response.json();
            const surahs = data.data.map(s => ({
                number: s.number, 
                name: s.name, 
                englishName: s.englishName,
                englishNameTranslation: s.englishNameTranslation, 
                numberOfAyahs: s.numberOfAyahs,
                revelationType: s.revelationType
            }));
            state.surahs = surahs;
            cache.surahs = surahs;
        } catch (err) {
            state.error = err.message;
        } finally {
            setState({ loadingSurahs: false });
        }
    };
    
    const renderReciterSelectionView = () => {
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        const lowerQuery = state.reciterSearchQuery.toLowerCase();
        const filteredReciters = state.reciters.filter(r => 
            r.name_en.toLowerCase().includes(lowerQuery) || 
            r.name_ar.toLowerCase().includes(lowerQuery)
        );

        contentContainer.innerHTML = `
            <div class="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-10 fade-in">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <button id="listener-reciters-back" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 transition-all active:scale-90 flex items-center gap-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            ${BackIcon({className: "w-5 h-5"})}
                            <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                        </button>
                        <div class="min-w-0">
                            <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight truncate">${t('listen')}</h2>
                            <p class="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs mt-0.5 truncate">${t('selectReciterDescription') || 'Choose your favorite reciter to begin listening'}</p>
                        </div>
                    </div>
                    <div class="relative group max-w-md w-full">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-500 transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input id="reciter-search-input" type="text" value="${state.reciterSearchQuery}" placeholder="${t('searchReciterPlaceholder')}" class="w-full pl-10 pr-4 py-2.5 glass rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all dark:text-white shadow-sm text-sm">
                    </div>
                </div>

                <div id="reciter-list-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                </div>
            </div>
        `;

        const gridContainer = contentContainer.querySelector('#reciter-list-grid');
        if (filteredReciters.length > 0) {
            gridContainer.innerHTML = filteredReciters.map(r => `
                <div data-reciter-id="${r.id}" class="reciter-card group cursor-pointer p-6 glass rounded-[2.5rem] border border-white/10 hover:border-theme-500/50 hover:shadow-[0_20px_50px_rgba(var(--theme-500-rgb),0.15)] transition-all duration-500 active:scale-[0.97] relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-theme-500/10 to-transparent rounded-bl-[4rem] -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                    <div class="flex items-center gap-6 relative z-10">
                        <div class="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center text-theme-600 dark:text-theme-400 group-hover:bg-theme-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <span class="text-2xl font-bold">${(lang === 'ar' ? r.name_ar : r.name_en).charAt(0)}</span>
                        </div>
                        <div class="flex-grow min-w-0">
                            <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors truncate">${lang === 'ar' ? r.name_ar : r.name_en}</h3>
                            <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-1 truncate">${lang === 'ar' ? r.rewaya_ar : r.rewaya_en}</p>
                        </div>
                        <div class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-theme-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
                            ${ChevronRightIcon({className: "w-5 h-5"})}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            gridContainer.innerHTML = `
                <div class="col-span-full py-20 text-center space-y-4">
                    <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p class="text-slate-500 font-medium">${t('noRecitersMatch')}</p>
                </div>
            `;
        }

        contentContainer.querySelector('#listener-reciters-back')?.addEventListener('click', () => {
            if (props.onBack) props.onBack();
        });

        contentContainer.querySelector('#reciter-search-input').addEventListener('input', (e) => {
            state.reciterSearchQuery = e.target.value;
            renderReciterSelectionView();
        });

        contentContainer.querySelectorAll('.reciter-card').forEach(card => card.addEventListener('click', () => {
            const reciterId = parseInt(card.dataset.reciterId, 10);
            const reciter = state.reciters.find(r => r.id === reciterId);
            setState({ selectedReciter: reciter, view: 'surah-list' });
        }));
    };

    const renderSurahListView = () => {
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        contentContainer.innerHTML = `
            <div class="max-w-5xl mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8 fade-in">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3 md:gap-5">
                        <button id="back-to-reciters" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 transition-all active:scale-90 flex items-center gap-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            ${BackIcon({className: "w-5 h-5"})}
                            <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                        </button>
                        <div class="min-w-0">
                            <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight truncate">${lang === 'ar' ? state.selectedReciter.name_ar : state.selectedReciter.name_en}</h2>
                            <p class="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs mt-0.5 truncate">${lang === 'ar' ? state.selectedReciter.rewaya_ar : state.selectedReciter.rewaya_en}</p>
                        </div>
                    </div>
                    <div class="relative group max-w-xs w-full">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-500 transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input id="surah-search-input" type="text" placeholder="${t('searchSurahPlaceholder')}" class="w-full pl-10 pr-4 py-2.5 glass rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all dark:text-white text-sm">
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2 md:gap-3" id="surah-list-container">
                </div>
            </div>
        `;

        const listContainer = contentContainer.querySelector('#surah-list-container');
        const renderList = (query = '') => {
            const lowerQuery = query.toLowerCase();
            const filtered = state.surahs.filter(s => 
                s.englishName.toLowerCase().includes(lowerQuery) || 
                s.name.includes(query) ||
                s.number.toString().includes(query)
            );

            if (filtered.length === 0) {
                listContainer.innerHTML = `
                    <div class="py-20 text-center text-slate-500">
                        <p>${t('noSurahsFound') || 'No Surahs found matching your search'}</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = filtered.map(s => {
                const downloadKey = `${state.selectedReciter.id}_${s.number}`;
                const isDownloading = !!state.downloadingProgress[downloadKey];

                let buttonHtml = '';
                if (isDownloading) {
                    buttonHtml = `<div class="w-5 h-5 border-2 border-slate-300 border-t-theme-500 rounded-full animate-spin"></div>`;
                } else {
                    buttonHtml = `
                        <button data-action="save-device" title="${t('download') || 'Download'}" class="download-btn w-10 h-10 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-400 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-950/20 transition-all active:scale-90">${DownloadIcon({className: "w-5 h-5"})}</button>
                    `;
                }

                return `
                    <div data-surah-id="${s.number}" class="surah-row group flex items-center justify-between p-4 md:p-5 glass rounded-[2rem] border border-white/10 hover:border-theme-500/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
                         <div class="flex items-center gap-4 md:gap-6 flex-grow cursor-pointer play-area min-w-0">
                            <div class="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center glass rounded-2xl font-bold text-sm md:text-lg text-slate-500 group-hover:bg-theme-600 group-hover:text-white transition-all duration-300 border border-white/10">
                                ${s.number}
                            </div>
                            <div class="flex-grow min-w-0">
                                <h4 class="font-bold text-slate-900 dark:text-slate-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors truncate text-base md:text-lg tracking-tight">${s.englishName}</h4>
                                <div class="flex items-center gap-2 mt-1.5 overflow-hidden">
                                    <span class="px-2 py-0.5 rounded-lg glass border border-white/10 text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold whitespace-nowrap">${s.revelationType}</span>
                                    <span class="px-2 py-0.5 rounded-lg bg-theme-500/10 text-[8px] md:text-[10px] text-theme-600 dark:text-theme-400 uppercase tracking-[0.2em] font-bold whitespace-nowrap border border-theme-500/20">${s.numberOfAyahs} ${t('ayahs')}</span>
                                </div>
                            </div>
                            <div class="text-right mr-4 md:mr-6 rtl:mr-0 rtl:ml-4 md:rtl:ml-6 flex-shrink-0">
                                <p class="font-amiri text-2xl md:text-3xl text-slate-800 dark:text-slate-200 leading-none">${s.name}</p>
                            </div>
                         </div>
                         <div class="download-action-area flex items-center gap-2 md:gap-3 flex-shrink-0">
                            ${buttonHtml}
                            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-theme-500 group-hover:text-white transition-all duration-300 ml-2 md:ml-3 rtl:ml-0 rtl:mr-2 md:rtl:mr-3">
                                ${ChevronRightIcon({className: "w-5 h-5"})}
                            </div>
                         </div>
                    </div>
                `;
            }).join('');

            listContainer.querySelectorAll('.surah-row').forEach(row => {
                const surahId = row.dataset.surahId;
                const surah = state.surahs.find(s => s.number == surahId);

                row.querySelector('.play-area').addEventListener('click', () => {
                    playFullSurah(surah);
                    setState({ view: 'player' });
                });
                
                // Attach listeners to all download buttons (Download, Save to Device, Delete)
                row.querySelectorAll('.download-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = btn.dataset.action;
                        if (action === 'save-device') {
                            handleSaveToDevice(surah);
                        }
                    });
                });
            });
        };

        renderList();

        contentContainer.querySelector('#surah-search-input').addEventListener('input', (e) => {
            renderList(e.target.value);
        });

        contentContainer.querySelector('#back-to-reciters').addEventListener('click', () => {
            setState({ view: 'reciter-selection', selectedReciter: null });
        });
    };
    
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const renderPlayerView = () => {
        const { currentSurah, isPlaying, duration, currentTime, selectedReciter, isLoadingAudio } = state;
        if (!currentSurah || !selectedReciter) {
            setState({ view: 'surah-list' });
            return;
        }

        const progressPercent = (currentTime / duration) * 100 || 0;
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        const progressFillStyle = isRtl
            ? `right: 0; width: ${progressPercent}%;`
            : `left: 0; width: ${progressPercent}%;`;

        const isFirstSurah = currentSurah.number === 1;
        const isLastSurah = currentSurah.number === 114;
        
        const playPauseIcon = isLoadingAudio 
            ? `<div class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>`
            : (isPlaying ? PauseIcon({className: 'w-12 h-12'}) : PlayIcon({className: 'w-12 h-12'}));
            
        const volumeIcon = state.isMuted ? SpeakerXMarkIcon({className: 'w-6 h-6'}) : SpeakerWaveIcon({className: 'w-6 h-6'});

        contentContainer.innerHTML = `
            <div class="fade-in min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
                <!-- Immersive Background -->
                <div class="absolute inset-0 z-0">
                    <div class="absolute inset-0 bg-gradient-to-br from-theme-900/40 via-slate-950 to-slate-950"></div>
                    <div class="absolute top-1/4 left-1/4 w-64 md:w-[30rem] h-64 md:h-[30rem] bg-theme-600/20 rounded-full blur-[80px] md:blur-[150px] animate-pulse"></div>
                    <div class="absolute bottom-1/4 right-1/4 w-64 md:w-[30rem] h-64 md:h-[30rem] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[150px] animate-pulse" style="animation-delay: 2s"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
                </div>

                <div class="w-full max-w-xl z-10 space-y-8 md:space-y-16">
                    <!-- Header Controls -->
                    <div class="flex items-center justify-between px-2">
                         <button id="back-to-surah-list" class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl glass border border-white/10 text-white transition-all active:scale-90 group" title="${t('backToSurahList')}">
                            ${BackIcon({className: "w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform"})}
                        </button>
                        <div class="text-center flex-grow px-6">
                            <span class="text-[9px] md:text-[11px] font-bold text-theme-400 uppercase tracking-[0.3em] block mb-1 animate-pulse">${t('nowPlaying') || 'NOW PLAYING'}</span>
                            <h3 class="text-white font-bold text-sm md:text-lg tracking-tight truncate max-w-[200px] md:max-w-xs mx-auto">${lang === 'ar' ? selectedReciter.name_ar : selectedReciter.name_en}</h3>
                        </div>
                        <button id="mem-mode-toggle" class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all ${state.isMemorizationMode ? 'bg-theme-600 text-white shadow-xl shadow-theme-500/40 border-theme-500' : 'glass text-white/40 hover:bg-white/10 border border-white/10'}" title="${t('memorizationMode')}">
                            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </button>
                    </div>

                    <!-- Visualizer/Art Area -->
                    <div class="text-center space-y-6 md:space-y-10">
                        <div class="relative inline-block">
                            <div class="w-40 h-40 md:w-72 md:h-72 rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-theme-600 to-indigo-700 flex items-center justify-center shadow-[0_30px_100px_rgba(var(--theme-500-rgb),0.3)] relative z-10 overflow-hidden group">
                                <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700"></div>
                                <span class="text-6xl md:text-[10rem] font-bold text-white/10 select-none tracking-tighter">${currentSurah.number}</span>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="w-20 h-20 md:w-40 md:h-40 rounded-full border-2 border-white/5 flex items-center justify-center">
                                        <div class="w-12 h-12 md:w-24 md:h-24 rounded-full border border-white/10 flex items-center justify-center animate-spin-slow">
                                            <div class="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                                        </div>
                                    </div>
                                </div>
                                <!-- Inner Glow -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                            </div>
                            <!-- Decorative Rings -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] md:w-[125%] h-[115%] md:h-[125%] border border-white/5 rounded-full pointer-events-none"></div>
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] md:w-[150%] h-[130%] md:h-[150%] border border-white/5 rounded-full pointer-events-none animate-spin-slow opacity-50"></div>
                        </div>

                        <div class="space-y-2 md:space-y-4 px-6">
                            <h2 class="text-3xl md:text-7xl font-bold text-white font-display tracking-tight transition-all duration-700 ${state.hideArabic ? 'blur-2xl opacity-10 scale-90' : 'opacity-100'}">${currentSurah.englishName}</h2>
                            <p class="font-amiri text-2xl md:text-5xl text-theme-400 leading-relaxed transition-all duration-700 ${state.hideArabic ? 'blur-2xl opacity-10 scale-90' : 'opacity-100'}">${currentSurah.name}</p>
                        </div>
                    </div>

                    <!-- Memorization Controls -->
                    ${state.isMemorizationMode ? `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass rounded-[2.5rem] border border-white/10 shadow-xl fade-in mx-2">
                        <div class="space-y-2 text-left">
                            <label class="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">${t('autoRepeat')}</label>
                            <select id="repeat-select" class="w-full bg-white/5 text-white rounded-xl px-4 py-3 text-xs border border-white/10 focus:ring-2 focus:ring-theme-500 outline-none appearance-none cursor-pointer">
                                ${[1, 2, 3, 5, 10].map(n => `<option value="${n}" ${state.repeatCount == n ? 'selected' : ''} class="bg-slate-900">${n}x</option>`).join('')}
                            </select>
                        </div>
                        <div class="space-y-2 text-left">
                            <label class="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">${t('verseDelay')}</label>
                            <select id="delay-select" class="w-full bg-white/5 text-white rounded-xl px-4 py-3 text-xs border border-white/10 focus:ring-2 focus:ring-theme-500 outline-none appearance-none cursor-pointer">
                                ${[0, 1, 2, 3, 5].map(n => `<option value="${n}" ${state.verseDelay == n ? 'selected' : ''} class="bg-slate-900">${n}s</option>`).join('')}
                            </select>
                        </div>
                        <button id="hide-arabic-btn" class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${state.hideArabic ? 'bg-theme-600 text-white shadow-lg shadow-theme-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'}">
                            <span class="text-[9px] font-bold uppercase tracking-widest">${t('hideArabic')}</span>
                        </button>
                        <button id="hide-trans-btn" class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${state.hideTranslation ? 'bg-theme-600 text-white shadow-lg shadow-theme-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'}">
                            <span class="text-[9px] font-bold uppercase tracking-widest">${t('hideTranslation')}</span>
                        </button>
                    </div>
                    ` : ''}
                    
                    <!-- Main Player Controls -->
                    <div class="space-y-8 md:space-y-12 glass rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] mx-2 relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-500/50 to-transparent"></div>
                        
                        <!-- Progress Bar -->
                        <div class="space-y-4 md:space-y-6">
                            <div class="relative h-2 rounded-full bg-white/5 group cursor-pointer" id="progress-container">
                                <div id="progress-fill" class="absolute h-full rounded-full bg-gradient-to-r from-theme-500 to-indigo-500 shadow-[0_0_20px_rgba(var(--theme-500-rgb),0.6)]" style="${progressFillStyle}"></div>
                                <input type="range" id="progress-bar" class="absolute w-full h-10 -top-4 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-theme-600 transition-all active:[&::-webkit-slider-thumb]:scale-125" min="0" max="${duration || 100}" value="${currentTime}" step="0.1" />
                            </div>
                            <div class="flex justify-between text-[10px] md:text-sm font-bold font-mono text-white/40 uppercase tracking-[0.2em]">
                                <span id="player-current-time">${formatTime(currentTime)}</span>
                                <span id="player-duration">${formatTime(duration)}</span>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-8 md:gap-12">
                            <!-- Playback Buttons -->
                            <div class="flex items-center justify-center gap-4 md:gap-12">
                                <button id="player-prev-surah-btn" ${isFirstSurah ? 'disabled' : ''} class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-5 transition-all transform active:scale-90 hover:scale-110" title="${t('prevSurah')}">${SkipBackwardIcon({className: 'w-7 h-7 md:w-10 md:h-10'})}</button>
                                <button id="player-skip-back-btn" class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white/50 hover:text-white transition-all transform active:scale-90 hover:scale-110" title="-10s">${Backward10Icon({className: 'w-7 h-7 md:w-10 md:h-10'})}</button>
                                
                                <button id="player-play-pause-btn" class="w-20 h-20 md:w-32 md:h-32 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-90 transition-all duration-500 group relative">
                                    <div class="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20 ${isPlaying ? 'block' : 'hidden'}"></div>
                                    <div class="group-hover:scale-110 transition-transform relative z-10">${playPauseIcon}</div>
                                </button>
    
                                <button id="player-skip-forward-btn" class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white/50 hover:text-white transition-all transform active:scale-90 hover:scale-110" title="+10s">${Forward10Icon({className: 'w-7 h-7 md:w-10 md:h-10'})}</button>
                                <button id="player-next-surah-btn" ${isLastSurah ? 'disabled' : ''} class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-5 transition-all transform active:scale-90 hover:scale-110" title="${t('nextSurah')}">${SkipForwardIcon({className: 'w-7 h-7 md:w-10 md:h-10'})}</button>
                            </div>

                            <!-- Volume Control -->
                            <div class="flex items-center justify-center gap-6 max-w-sm mx-auto w-full px-4">
                                <button id="player-mute-btn" class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl glass border border-white/10 text-white/50 hover:text-white transition-all active:scale-90">
                                    ${volumeIcon}
                                </button>
                                <div class="flex-grow flex items-center bg-white/5 rounded-full px-4 h-10 border border-white/10 relative group">
                                    <input type="range" id="volume-slider" class="w-full h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg transition-all" min="0" max="1" step="0.01" value="${state.volume}" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachPlayerListeners();
    };

    const handleMuteToggle = () => {
        const newMutedState = !state.isMuted;
        audio.muted = newMutedState;
        setState({ isMuted: newMutedState });
    };

    const attachPlayerListeners = () => {
        const backBtn = contentContainer.querySelector('#back-to-surah-list');
        if (backBtn) backBtn.addEventListener('click', () => {
            setState({ view: 'surah-list' });
        });

        const playPauseBtn = contentContainer.querySelector('#player-play-pause-btn');
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => {
            if (!audio.src || audio.src === window.location.href) return;
            if (state.isPlaying) {
                audio.pause();
            } else {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name !== 'AbortError') {
                          console.warn("Audio play blocked/failed:", e.message);
                          window.showToast?.(t('pageLoadError'), 'error');
                        }
                    });
                }
            }
        });

        const prevBtn = contentContainer.querySelector('#player-prev-surah-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => playAdjacentSurah('prev'));

        const nextBtn = contentContainer.querySelector('#player-next-surah-btn');
        if (nextBtn) nextBtn.addEventListener('click', () => playAdjacentSurah('next'));

        const skipBackBtn = contentContainer.querySelector('#player-skip-back-btn');
        if (skipBackBtn) skipBackBtn.addEventListener('click', () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
            updateProgressUI();
        });

        const skipForwardBtn = contentContainer.querySelector('#player-skip-forward-btn');
        if (skipForwardBtn) skipForwardBtn.addEventListener('click', () => {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
            updateProgressUI();
        });
        
        const progressBar = contentContainer.querySelector('#progress-bar');
        
        const handleSeek = (e) => {
             if (!audio.duration || isNaN(audio.duration)) return;
             const seekTime = parseFloat(e.target.value);
             
             // Update UI immediately while scrubbing
             const currentTimeEl = document.getElementById('player-current-time');
             const progressFill = document.getElementById('progress-fill');
             if (currentTimeEl) currentTimeEl.textContent = formatTime(seekTime);
             if (progressFill) {
                const percent = (seekTime / audio.duration) * 100;
                progressFill.style.width = `${percent}%`;
             }

             if (!isScrubbing) {
                audio.currentTime = seekTime;
             }
        };

        const handleSeekEnd = (e) => {
            if (!audio.duration || isNaN(audio.duration)) return;
            const seekTime = parseFloat(e.target.value);
            audio.currentTime = seekTime;
            isScrubbing = false;
            updateProgressUI();
        };

        if (progressBar) {
            progressBar.addEventListener('input', handleSeek);
            progressBar.addEventListener('change', handleSeekEnd);
            progressBar.addEventListener('mousedown', () => { isScrubbing = true; });
            progressBar.addEventListener('mouseup', () => { /* handled by change */ });
            progressBar.addEventListener('touchstart', () => { isScrubbing = true; });
            progressBar.addEventListener('touchend', () => { /* handled by change */ });
        }

        const muteBtn = contentContainer.querySelector('#player-mute-btn');
        if (muteBtn) muteBtn.addEventListener('click', handleMuteToggle);

        const volumeSlider = contentContainer.querySelector('#volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                audio.volume = vol;
                state.volume = vol;
                state.isMuted = vol === 0;
                localStorage.setItem('quranPlayerVolume', vol.toString());
                // Update icon without full re-render for performance
                const muteBtn = contentContainer.querySelector('#player-mute-btn');
                if (muteBtn) {
                    muteBtn.innerHTML = state.isMuted ? SpeakerXMarkIcon({className: 'w-6 h-6'}) : SpeakerWaveIcon({className: 'w-6 h-6'});
                }
            });
        }

        // Memorization Mode Listeners
        const memToggle = contentContainer.querySelector('#mem-mode-toggle');
        if (memToggle) memToggle.onclick = () => {
            setState({ isMemorizationMode: !state.isMemorizationMode });
        };

        if (state.isMemorizationMode) {
            contentContainer.querySelector('#repeat-select').onchange = (e) => {
                setState({ repeatCount: parseInt(e.target.value), currentRepeat: 0 });
            };
            contentContainer.querySelector('#delay-select').onchange = (e) => {
                setState({ verseDelay: parseInt(e.target.value) });
            };
            contentContainer.querySelector('#hide-arabic-btn').onclick = () => {
                setState({ hideArabic: !state.hideArabic });
            };
            contentContainer.querySelector('#hide-trans-btn').onclick = () => {
                setState({ hideTranslation: !state.hideTranslation });
            };
        }
    };

    const updateProgressUI = () => {
        if (state.view !== 'player' || isScrubbing) return;

        state.currentTime = audio.currentTime;
        state.duration = audio.duration;
        const progressPercent = (state.currentTime / state.duration) * 100 || 0;

        const progressBar = document.getElementById('progress-bar');
        const currentTimeEl = document.getElementById('player-current-time');
        const durationEl = document.getElementById('player-duration');
        const progressFill = document.getElementById('progress-fill');
        
        if (progressBar) {
            progressBar.max = state.duration || 100;
            progressBar.value = state.currentTime;
        }
        if (currentTimeEl) currentTimeEl.textContent = formatTime(state.currentTime);
        if (durationEl) durationEl.textContent = formatTime(state.duration);
        if (progressFill) {
            const lang = getCurrentLanguage();
            if (lang === 'ar') {
                progressFill.style.left = 'auto';
                progressFill.style.right = '0';
            } else {
                progressFill.style.right = 'auto';
                progressFill.style.left = '0';
            }
            progressFill.style.width = `${progressPercent}%`;
        }
    };

    const playFullSurah = (surah) => {
        if (!surah || !state.selectedReciter || !state.selectedReciter.url) return;
        const audioUrl = `${state.selectedReciter.url}${String(surah.number).padStart(3, '0')}.mp3`;
        
        if (audio.src === audioUrl && !audio.error) {
            audio.play().catch(e => {
               if (e.name !== 'AbortError') console.error("Audio play error:", e);
            });
            return;
        }

        state.currentSurah = surah;
        state.currentTime = 0;
        state.duration = 0;
        
        audio.pause();
        audio.src = audioUrl;
        audio.load(); // Explicitly call load() after setting src
        audio.volume = state.volume;
        audio.muted = state.isMuted;
        
        setState({ isLoadingAudio: true, isPlaying: false });

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
              // Playback started successfully
            }).catch(e => {
                if (e.name !== 'AbortError') {
                    console.warn("Audio play start error:", e.message); 
                    setState({ isPlaying: false, isLoadingAudio: false });
                }
            });
        }
    };

    const playAdjacentSurah = (direction) => {
        if (!state.currentSurah) return;
        const surahsList = state.surahs;
        const currentIndex = surahsList.findIndex(s => s.number === state.currentSurah.number);
        
        let nextIndex;
        if (direction === 'next') {
            if (currentIndex === surahsList.length - 1) return;
            nextIndex = currentIndex + 1;
        } else {
            if (currentIndex === 0) return;
            nextIndex = currentIndex - 1;
        }
        
        const nextSurah = surahsList[nextIndex];
        if (nextSurah) {
            playFullSurah(nextSurah);
        }
    };
    
    // Download Handlers
    const handleSaveToDevice = async (surah) => {
        try {
            window.showToast?.(t('downloadStarting', { surahName: surah.englishName }), 'success');
            
            const audioUrl = `${state.selectedReciter.url}${String(surah.number).padStart(3, '0')}.mp3`;
            const fileName = `${surah.englishName}_${state.selectedReciter.name_en}.mp3`;
            
            const response = await fetch(audioUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            window.showToast?.(t('downloadSuccess', { surahName: surah.englishName }), 'success');
        } catch (e) {
            console.error("Save to device failed:", e);
            window.showToast?.(t('downloadError', { surahName: surah.englishName }), 'error');
        }
    };

    // --- Audio Event Listeners ---
    const onPlay = () => setState({ isPlaying: true, isLoadingAudio: false });
    const onPause = () => setState({ isPlaying: false, isLoadingAudio: false });
    const onEnded = async () => {
        if (state.isMemorizationMode && state.currentRepeat < state.repeatCount - 1) {
            setState({ currentRepeat: state.currentRepeat + 1 });
            audio.currentTime = 0;
            if (state.verseDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, state.verseDelay * 1000));
            }
            audio.play();
        } else {
            setState({ currentRepeat: 0 });
            if (state.verseDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, state.verseDelay * 1000));
            }
            playAdjacentSurah('next');
        }
    };
    const onLoadedMetadata = () => updateProgressUI();
    const onTimeUpdate = () => updateProgressUI();
    const onWaiting = () => setState({ isLoadingAudio: true });
    const onPlaying = () => setState({ isLoadingAudio: false });
    
    const onError = (e) => {
        // Only report error if we actually have a source and it wasn't just cleared during cleanup
        if (audio.src && audio.src !== "" && !audio.src.endsWith(window.location.pathname) && audio.src !== window.location.href) {
            const error = audio.error;
            let msg = t('pageLoadError');
            if (error) {
                console.error("Audio internal error:", {
                    code: error.code,
                    message: error.message,
                    src: audio.src
                });
                if (error.code === 4) msg = "Format not supported or server error";
            }
            setState({ 
                isPlaying: false, 
                isLoadingAudio: false, 
                error: msg
            });
        }
    };
    
    const attachAudioListeners = () => {
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('error', onError);
    };
    
    const detachAudioListeners = () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('waiting', onWaiting);
        audio.removeEventListener('playing', onPlaying);
        audio.removeEventListener('error', onError);
    };

    const handleGlobalMouseUp = () => {
        if (isScrubbing) isScrubbing = false;
    };

    const init = async () => {
        await fetchSurahList();
        render();
    };
    
    init();
    attachAudioListeners();
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
        detachAudioListeners();
        audio.pause();
        audio.src = ''; // Clear source to stop buffering
        try { audio.load(); } catch(e) {} // Force state reset
        document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
};
