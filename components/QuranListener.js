import { createSpinner } from './Spinner.js';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackwardIcon, DownloadIcon, SaveIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon, Backward10Icon, Forward10Icon } from './Icons.js';
import { renderErrorState } from './UI.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { FAMOUS_RECITERS } from './QuranData.js';
import { downloadFullSurah, deleteFullSurah, getFullSurahDownloads, saveSurahToDevice } from './DownloadManager.js';
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
        
        downloadedSurahs: {}, // { 'reciterId_surahNum': true }
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
                        <button id="listener-reciters-back" class="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 flex items-center gap-2 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            ${BackIcon({className: "w-4 h-4"})}
                            <span class="text-xs font-bold">${t('back')}</span>
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
                        <input id="reciter-search-input" type="text" value="${state.reciterSearchQuery}" placeholder="${t('searchReciterPlaceholder')}" class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all dark:text-white shadow-sm text-sm">
                    </div>
                </div>

                <div id="reciter-list-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                </div>
            </div>
        `;

        const gridContainer = contentContainer.querySelector('#reciter-list-grid');
        if (filteredReciters.length > 0) {
            gridContainer.innerHTML = filteredReciters.map(r => `
                <div data-reciter-id="${r.id}" class="reciter-card group cursor-pointer p-6 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:border-theme-500/50 hover:shadow-2xl hover:shadow-theme-500/10 transition-all duration-500 active:scale-[0.97] relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-theme-500/5 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-theme-600 dark:text-theme-400 group-hover:bg-theme-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <span class="text-2xl font-bold">${(lang === 'ar' ? r.name_ar : r.name_en).charAt(0)}</span>
                        </div>
                        <div class="flex-grow">
                            <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${lang === 'ar' ? r.name_ar : r.name_en}</h3>
                            <p class="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">${lang === 'ar' ? r.rewaya_ar : r.rewaya_en}</p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500 group-hover:text-white transition-all duration-300">
                            ${ChevronRightIcon({className: "w-4 h-4"})}
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
                        <button id="back-to-reciters" class="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 flex items-center gap-2 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            ${BackIcon({className: "w-4 h-4"})}
                            <span class="text-xs font-bold">${t('back')}</span>
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
                        <input id="surah-search-input" type="text" placeholder="${t('searchSurahPlaceholder')}" class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all dark:text-white text-sm">
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
                const isDownloaded = !!state.downloadedSurahs[downloadKey];
                const isDownloading = !!state.downloadingProgress[downloadKey];

                let buttonHtml = '';
                if (isDownloading) {
                    buttonHtml = `<div class="w-5 h-5 border-2 border-slate-300 border-t-theme-500 rounded-full animate-spin"></div>`;
                } else if (isDownloaded) {
                    buttonHtml = `
                        <button data-action="save-device" title="${t('saveToDevice') || 'Save to Device'}" class="download-btn p-2 rounded-xl text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-950/20 transition-colors">${SaveIcon({className: "w-5 h-5"})}</button>
                        <button data-action="delete" title="${t('delete')}" class="download-btn p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">${TrashIcon({className: "w-5 h-5"})}</button>
                    `;
                } else {
                    buttonHtml = `
                        <button data-action="save-device" title="${t('saveToDevice') || 'Save to Device'}" class="download-btn p-2 rounded-xl text-slate-400 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-950/20 transition-colors">${SaveIcon({className: "w-5 h-5"})}</button>
                        <button data-action="download" title="${t('download')}" class="download-btn p-2 rounded-xl text-slate-400 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-950/20 transition-colors">${DownloadIcon({className: "w-5 h-5"})}</button>
                    `;
                }

                return `
                    <div data-surah-id="${s.number}" class="surah-row group flex items-center justify-between p-3 md:p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-theme-500/30 hover:shadow-lg transition-all duration-300">
                         <div class="flex items-center gap-3 md:gap-5 flex-grow cursor-pointer play-area min-w-0">
                            <div class="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm md:text-base text-slate-500 group-hover:bg-theme-600 group-hover:text-white transition-all duration-300">
                                ${s.number}
                            </div>
                            <div class="flex-grow min-w-0">
                                <h4 class="font-bold text-slate-900 dark:text-slate-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors truncate text-sm md:text-base">${s.englishName}</h4>
                                <div class="flex items-center gap-1.5 md:gap-2 mt-1 overflow-hidden">
                                    <span class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[7px] md:text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold whitespace-nowrap border border-slate-200/50 dark:border-slate-700/50">${s.revelationType}</span>
                                    <span class="px-1.5 py-0.5 rounded-md bg-theme-50 dark:bg-theme-900/20 text-[7px] md:text-[9px] text-theme-600 dark:text-theme-400 uppercase tracking-wider font-bold whitespace-nowrap border border-theme-100 dark:border-theme-900/30">${s.numberOfAyahs} ${t('ayahs')}</span>
                                </div>
                            </div>
                            <div class="text-right mr-2 md:mr-4 rtl:mr-0 rtl:ml-2 md:rtl:ml-4 flex-shrink-0">
                                <p class="font-amiri text-xl md:text-2xl text-slate-800 dark:text-slate-200 leading-none">${s.name}</p>
                            </div>
                         </div>
                         <div class="download-action-area flex items-center gap-1 md:gap-2 flex-shrink-0">
                            ${buttonHtml}
                            <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500 group-hover:text-white transition-all duration-300 ml-1 md:ml-2 rtl:ml-0 rtl:mr-1 md:rtl:mr-2">
                                ${ChevronRightIcon({className: "w-3 h-3 md:w-4 md:h-4"})}
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
                        if (action === 'download') {
                            handleDownload(surah);
                        } else if (action === 'delete') {
                            handleDelete(surah);
                        } else if (action === 'save-device') {
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
            <div class="fade-in min-h-[75vh] md:min-h-[80vh] flex flex-col items-center justify-center p-3 md:p-4 relative overflow-hidden">
                <!-- Immersive Background -->
                <div class="absolute inset-0 z-0">
                    <div class="absolute inset-0 bg-gradient-to-br from-theme-900/20 via-slate-950 to-slate-950"></div>
                    <div class="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-theme-600/10 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>
                    <div class="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-indigo-600/10 rounded-full blur-[60px] md:blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
                </div>

                <div class="w-full max-w-lg z-10 space-y-4 md:space-y-12">
                    <div class="flex items-center justify-between">
                         <button id="back-to-surah-list" class="p-2 md:p-4 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-90 flex items-center gap-2 group" title="${t('backToSurahList')}">
                            ${BackIcon({className: "w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform"})}
                            <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest">${t('back')}</span>
                        </button>
                        <div class="text-right min-w-0">
                            <span class="text-[8px] md:text-[10px] font-bold text-theme-400 uppercase tracking-[0.2em] md:tracking-[0.3em] block mb-0.5 truncate">${t('nowPlaying') || 'NOW PLAYING'}</span>
                            <h3 class="text-white font-bold text-[10px] md:text-sm tracking-tight truncate">${lang === 'ar' ? selectedReciter.name_ar : selectedReciter.name_en}</h3>
                        </div>
                    </div>

                    <div class="text-center space-y-3 md:space-y-6">
                        <div class="relative inline-block">
                            <div class="w-28 h-28 md:w-64 md:h-64 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-theme-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-theme-500/20 relative z-10 overflow-hidden group">
                                <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                <span class="text-4xl md:text-9xl font-bold text-white/20 select-none">${currentSurah.number}</span>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="w-14 h-14 md:w-32 md:h-32 rounded-full border-2 border-white/10 flex items-center justify-center">
                                        <div class="w-8 h-8 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center animate-spin-slow">
                                            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Decorative Rings -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] md:w-[120%] h-[110%] md:h-[120%] border border-white/5 rounded-full pointer-events-none"></div>
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] md:w-[140%] h-[125%] md:h-[140%] border border-white/5 rounded-full pointer-events-none animate-spin-slow"></div>
                        </div>

                        <div class="space-y-0.5 md:space-y-2 px-4">
                            <h2 class="text-2xl md:text-6xl font-bold text-white font-display tracking-tight truncate">${currentSurah.englishName}</h2>
                            <p class="font-amiri text-xl md:text-4xl text-theme-400 leading-relaxed truncate">${currentSurah.name}</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4 md:space-y-8 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-white/10 shadow-2xl mx-1 md:mx-0">
                        <div class="space-y-2 md:space-y-4">
                            <div class="relative h-1 rounded-full bg-white/10 group cursor-pointer" id="progress-container">
                                <div id="progress-fill" class="absolute h-full rounded-full bg-gradient-to-r from-theme-500 to-indigo-500 shadow-[0_0_15px_rgba(var(--theme-500-rgb),0.5)]" style="${progressFillStyle}"></div>
                                <input type="range" id="progress-bar" class="absolute w-full h-6 -top-2.5 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-theme-500" min="0" max="${duration || 100}" value="${currentTime}" step="0.1" />
                            </div>
                            <div class="flex justify-between text-[7px] md:text-[10px] font-bold font-mono text-white/40 uppercase tracking-widest">
                                <span id="player-current-time">${formatTime(currentTime)}</span>
                                <span id="player-duration">${formatTime(duration)}</span>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center px-1 md:px-4">
                            <button id="player-mute-btn" class="p-2 md:p-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                                ${volumeIcon}
                            </button>

                            <div class="flex items-center gap-1 md:gap-8">
                                <button id="player-prev-surah-btn" ${isFirstSurah ? 'disabled' : ''} class="p-1.5 text-white/40 hover:text-white disabled:opacity-10 transition-all transform active:scale-90" title="${t('prevSurah')}">${SkipBackwardIcon({className: 'w-5 h-5 md:w-8 md:h-8'})}</button>
                                <button id="player-skip-back-btn" class="p-1.5 text-white/60 hover:text-white transition-all transform active:scale-90" title="-10s">${Backward10Icon({className: 'w-5 h-5 md:w-8 md:h-8'})}</button>
                                
                                <button id="player-play-pause-btn" class="w-14 h-14 md:w-24 md:h-24 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all duration-500 group">
                                    <div class="group-hover:scale-110 transition-transform">${playPauseIcon}</div>
                                </button>

                                <button id="player-skip-forward-btn" class="p-1.5 text-white/60 hover:text-white transition-all transform active:scale-90" title="+10s">${Forward10Icon({className: 'w-5 h-5 md:w-8 md:h-8'})}</button>
                                <button id="player-next-surah-btn" ${isLastSurah ? 'disabled' : ''} class="p-1.5 text-white/40 hover:text-white disabled:opacity-10 transition-all transform active:scale-90" title="${t('nextSurah')}">${SkipForwardIcon({className: 'w-5 h-5 md:w-8 md:h-8'})}</button>
                            </div>

                            <div class="w-8 md:w-14"></div> <!-- Spacer for symmetry -->
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
             audio.currentTime = seekTime;
             updateProgressUI();
        };

        if (progressBar) {
            progressBar.addEventListener('input', handleSeek);
            progressBar.addEventListener('mousedown', () => { isScrubbing = true; });
            progressBar.addEventListener('mouseup', () => { isScrubbing = false; });
            progressBar.addEventListener('touchstart', () => { isScrubbing = true; });
            progressBar.addEventListener('touchend', () => { isScrubbing = false; });
        }

        const muteBtn = contentContainer.querySelector('#player-mute-btn');
        if (muteBtn) muteBtn.addEventListener('click', handleMuteToggle);
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
    const handleDownload = async (surah) => {
        const key = `${state.selectedReciter.id}_${surah.number}`;
        setState({ downloadingProgress: { ...state.downloadingProgress, [key]: true } });

        try {
            window.showToast?.(t('downloadStarting', { surahName: surah.englishName }), 'success');
            await downloadFullSurah(state.selectedReciter, surah);
            setState({
                downloadedSurahs: { ...state.downloadedSurahs, [key]: true },
                downloadingProgress: { ...state.downloadingProgress, [key]: false }
            });
            window.showToast?.(t('downloadSuccess', { surahName: surah.englishName }), 'success');
        } catch (e) {
            console.error("Download failed:", e);
            window.showToast?.(t('downloadError', { surahName: surah.englishName }), 'error');
            setState({ downloadingProgress: { ...state.downloadingProgress, [key]: false } });
        }
    };

    const handleDelete = async (surah) => {
        const key = `${state.selectedReciter.id}_${surah.number}`;
        try {
            await deleteFullSurah(state.selectedReciter, surah);
            const newDownloaded = { ...state.downloadedSurahs };
            delete newDownloaded[key];
            setState({ downloadedSurahs: newDownloaded });
            window.showToast?.(t('deleteSuccess', { surahName: surah.englishName }), 'success');
        } catch(e) {
            console.error("Delete failed:", e);
        }
    };

    const handleSaveToDevice = async (surah) => {
        try {
            window.showToast?.(t('downloadStarting', { surahName: surah.englishName }), 'success');
            await saveSurahToDevice(state.selectedReciter, surah);
            window.showToast?.(t('downloadSuccess', { surahName: surah.englishName }), 'success');
        } catch (e) {
            console.error("Save to device failed:", e);
            window.showToast?.(t('downloadError', { surahName: surah.englishName }), 'error');
        }
    };

    // --- Audio Event Listeners ---
    const onPlay = () => setState({ isPlaying: true, isLoadingAudio: false });
    const onPause = () => setState({ isPlaying: false, isLoadingAudio: false });
    const onEnded = () => playAdjacentSurah('next');
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
        const [_, downloaded] = await Promise.all([
            fetchSurahList(),
            getFullSurahDownloads()
        ]);
        state.downloadedSurahs = downloaded;
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
