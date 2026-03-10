import { createSpinner } from './Spinner.js';
import { renderErrorState, renderSkeletonGrid } from './UI.js';
import { CloseIcon, SkipBackwardIcon, SkipForwardIcon, SlidersHorizontalIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, MinusIcon, PlusIcon, AiIcon, BookmarkIcon, BookmarkSolidIcon, ArrowUpIcon } from './Icons.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { fetchWithRetry } from '../utils/fetchUtils.js';

const TAFSIR_CACHE = new Map();

export const renderQuranReader = (container, cache, props) => {
    const { setReaderMode, isReaderMode, readerConfig } = props;

    let state = {
        view: cache.readerView || 'list',
        searchQuery: '',
        surahs: cache.surahs || [],
        selectedSurah: cache.selectedSurah || null,
        pageData: cache.readerPageData || null,
        loading: false,
        processing: false, // New state to handle heavy rendering
        activeAyah: cache.activeAyahForNav || 1,
        isJumpModal: false,
        isSettingsModal: cache.isSettingsModalOpen || false,
        isTafsirModal: false,
        loadingTafsir: false,
        tafsirData: null,
        activeTafsirAyah: null,
        error: null
    };

    let contentArea = container.querySelector('.quran-reader-inner');
    if (!contentArea) {
        contentArea = document.createElement('div');
        contentArea.className = 'quran-reader-inner min-h-full transition-opacity duration-300';
        container.innerHTML = '';
        container.appendChild(contentArea);
        
        contentArea.addEventListener('touchstart', e => { 
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        contentArea.addEventListener('touchend', e => { 
            const distX = e.changedTouches[0].screenX - touchStartX;
            const distY = e.changedTouches[0].screenY - touchStartY;
            handleSwipe(distX, distY);
        }, { passive: true });
    }

    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 70;

    const setState = (newState) => {
        Object.assign(state, newState);
        
        // Persist to cache
        cache.readerView = state.view;
        cache.selectedSurah = state.selectedSurah;
        cache.readerPageData = state.pageData;
        cache.activeAyahForNav = state.activeAyah;
        cache.isSettingsModalOpen = state.isSettingsModal;

        render();
    };

    const render = () => {
        // Handle Modals first (z-index managed)
        if (state.isTafsirModal || state.loadingTafsir) renderTafsirModal();
        else document.getElementById('tafsir-panel')?.remove();

        if (state.isJumpModal) renderJumpToModal();
        else document.getElementById('jump-modal')?.remove();

        if (state.isSettingsModal) renderSettingsModal();
        else document.getElementById('reader-settings-modal')?.remove();

        if (state.view === 'list') {
            renderListView();
        } else {
            renderReaderView();
        }
    };

    const fetchSurahList = async () => {
        if (state.surahs.length > 0) return;
        setState({ loading: true, error: null });
        try {
            const res = await fetchWithRetry('https://api.alquran.cloud/v1/surah');
            const data = await res.json();
            const surahs = data.data.map(s => ({
                number: s.number, 
                name: s.name, 
                englishName: s.englishName,
                numberOfAyahs: s.numberOfAyahs, 
                revelationType: s.revelationType,
            }));
            cache.surahs = surahs;
            setState({ surahs, loading: false });
        } catch (e) { 
            console.error(e);
            setState({ loading: false, error: t('fetchSurahListError') });
        }
    };

    const fetchPage = async (num, ayah = 1) => {
        if (num < 1 || num > 114) return;
        
        const lang = getCurrentLanguage();
        const displayMode = props.readerDisplayMode || 'both';
        
        // Use cached page data if available and correct surah
        if (state.pageData?.number === num && state.pageData?.lang === lang) {
            setState({ view: 'reader', activeAyah: ayah });
            requestAnimationFrame(() => {
                const container = contentArea.querySelector('#ayah-container');
                if (container && container.children.length === 0) {
                    renderAyahsBatch(state.pageData.ayahs, ayah);
                } else {
                    scrollToAyah(ayah);
                }
            });
            return;
        }

        setState({ loading: true, view: 'reader', error: null, activeAyah: ayah, pageData: null });
        
        try {
            const editionMap = {
                'en': 'en.sahih',
                'id': 'id.indonesian',
                'tr': 'tr.ates'
            };
            
            const edition = editionMap[lang] || 'en.sahih';
            
            // Fetch Arabic and Translation in parallel
            const [resAr, resTr] = await Promise.all([
                fetchWithRetry(`https://api.alquran.cloud/v1/surah/${num}`),
                lang !== 'ar' ? fetchWithRetry(`https://api.alquran.cloud/v1/surah/${num}/${edition}`) : Promise.resolve(null)
            ]);

            const dataAr = await resAr.json();
            const dataTr = resTr ? await resTr.json() : null;
            
            const surah = state.surahs.find(s => s.number === num) || dataAr.data;
            
            const combinedAyahs = dataAr.data.ayahs.map((a, i) => ({
                ...a,
                translation: dataTr ? dataTr.data.ayahs[i].text : null
            }));

            const pageData = { ...dataAr.data, ayahs: combinedAyahs, lang };
            
            // Update cache before calling setReaderMode to ensure new instance sees it
            cache.readerPageData = pageData;
            cache.selectedSurah = surah;

            if (setReaderMode) {
                setReaderMode({ back: () => setState({ view: 'list', pageData: null }), surah });
            }
            
            // Update local state
            setState({ 
                pageData: pageData, 
                selectedSurah: surah, 
                loading: false,
                processing: true, 
                error: null
            });

            // Heavy rendering optimization: yield to main thread
            requestAnimationFrame(() => {
                renderAyahsBatch(combinedAyahs, ayah);
            });
            
        } catch (e) { 
            console.error(e);
            setState({ loading: false, processing: false, error: t('pageLoadError') }); 
        }
    };

    const renderAyahsBatch = (ayahs, jumpTo) => {
        const container = contentArea.querySelector('#ayah-container');
        if (!container) {
            requestAnimationFrame(() => {
                const retryContainer = contentArea.querySelector('#ayah-container');
                if (retryContainer) renderAyahsBatch(ayahs, jumpTo);
            });
            return;
        }

        const lang = getCurrentLanguage();
        const displayMode = props.readerDisplayMode || 'both';
        const isArabicOnly = lang === 'ar';

        // If we already have ayahs and we're not in a fresh processing state, don't re-render
        if (container.querySelectorAll('.ayah-item').length > 0 && !state.processing) {
            if (jumpTo) scrollToAyah(jumpTo);
            return;
        }

        // Render in batches of 30 to keep UI responsive
        const batchSize = 30;
        let index = 0;

        const renderNextBatch = () => {
            if (!contentArea.querySelector('#ayah-container')) return;

            const batch = ayahs.slice(index, index + batchSize);
            
            let html = '';
            if (isArabicOnly || (displayMode === 'both' && !lang.includes('en') && !lang.includes('id') && !lang.includes('tr'))) {
                // Mushaf style (inline)
                html = batch.map((a, i) => `
                    <span class="ayah-item ayah-span cursor-pointer hover:text-theme-600 dark:hover:text-theme-400 transition-colors inline fade-in ${state.activeAyah == a.numberInSurah ? 'active-ayah-span' : ''}" 
                          style="animation-delay: ${i * 30}ms"
                          data-num="${a.numberInSurah}" 
                          data-ayah-number="${a.numberInSurah}">
                        ${a.text} 
                        <span class="ayah-marker inline-flex items-center justify-center relative mx-1.5 translate-y-[-0.15em] select-none group/ayah">
                            <svg class="w-9 h-9 text-theme-600/30 dark:text-theme-500/30 group-hover/ayah:text-theme-500 transition-all duration-700 group-hover/ayah:rotate-180" viewBox="0 0 32 32" fill="none">
                                <path d="M16 2L19 7L24 7L24 12L29 15L24 18L24 23L19 23L16 28L13 23L8 23L8 18L3 15L8 12L8 7L13 7L16 2Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 6L18 10L22 10L20 13L22 16L19 19L16 23L13 19L10 16L12 13L10 10L13 10L16 6Z" fill="currentColor" fill-opacity="0.15" />
                                <circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="0.3" stroke-dasharray="2 2" class="opacity-50" />
                            </svg>
                            <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-sans text-theme-700 dark:text-theme-300 group-hover/ayah:text-theme-600 dark:group-hover:text-theme-400 group-hover/ayah:scale-110 transition-all">
                                ${a.numberInSurah.toLocaleString('ar-EG')}
                            </span>
                        </span>
                    </span>`).join(' ');
            } else {
                // Block style for translations
                container.classList.remove('quran-arabic-text');
                container.classList.add('space-y-8');
                
                html = batch.map((a, i) => {
                    const isBookmarked = props.bookmarks.quran.some(b => b.id === `${state.pageData.number}:${a.numberInSurah}`);
                    return `
                    <div class="ayah-item group p-3 md:p-6 rounded-2xl md:rounded-3xl border border-transparent hover:border-theme-500/20 hover:bg-theme-50/30 dark:hover:bg-theme-900/10 transition-all cursor-pointer fade-in ${state.activeAyah == a.numberInSurah ? 'bg-theme-50 dark:bg-theme-900/20 border-theme-500/30' : ''}" 
                         style="animation-delay: ${i * 30}ms"
                         data-num="${a.numberInSurah}" 
                         data-ayah-number="${a.numberInSurah}">
                        <div class="flex items-start justify-between gap-3 md:gap-6 mb-3 md:mb-4">
                            <div class="flex items-center gap-2 md:gap-3">
                                <span class="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold text-slate-500 group-hover:bg-theme-600 group-hover:text-white transition-all">${a.numberInSurah}</span>
                                <button class="bookmark-ayah-btn p-1.5 md:p-2 rounded-lg hover:bg-theme-100 dark:hover:bg-theme-800 text-slate-400 hover:text-theme-600 transition-all" data-surah="${state.pageData.number}" data-ayah="${a.numberInSurah}">
                                    ${isBookmarked ? BookmarkSolidIcon({className: "w-4 h-4 md:w-5 md:h-5 text-theme-600"}) : BookmarkIcon({className: "w-4 h-4 md:w-5 md:h-5"})}
                                </button>
                            </div>
                            ${displayMode !== 'translation' ? `
                                <p class="quran-arabic-text text-right text-xl md:text-3xl leading-loose text-slate-800 dark:text-slate-100">${a.text}</p>
                            ` : ''}
                        </div>
                        ${displayMode !== 'arabic' ? `
                            <p class="text-base md:text-lg text-slate-600 dark:text-slate-400 font-serif leading-relaxed ${isArabicOnly ? 'text-right' : 'text-left'}">
                                ${a.translation || ''}
                            </p>
                        ` : ''}
                    </div>
                `}).join('');
            }
            
            if (index === 0) container.innerHTML = html;
            else container.insertAdjacentHTML('beforeend', html);

            index += batchSize;
            if (index < ayahs.length) {
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(renderNextBatch);
                } else {
                    setTimeout(renderNextBatch, 16);
                }
            } else {
                setState({ processing: false });
                if (jumpTo) scrollToAyah(jumpTo);
            }
        };

        renderNextBatch();
    };

    const scrollToAyah = (num, retryCount = 0) => {
        const el = contentArea.querySelector(`[data-ayah-number="${num}"]`);
        if (el) {
            // Remove existing highlights
            contentArea.querySelectorAll('.active-ayah-span, .bg-theme-50').forEach(x => {
                x.classList.remove('active-ayah-span', 'bg-theme-50', 'dark:bg-theme-900/20', 'border-theme-500/30');
            });

            // Apply new highlight
            if (el.classList.contains('ayah-span')) {
                el.classList.add('active-ayah-span');
            } else {
                el.classList.add('bg-theme-50', 'dark:bg-theme-900/20', 'border-theme-500/30');
            }

            // Smooth scroll with fallback for better reliability
            try {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {
                // Fallback for older browsers or edge cases
                const top = el.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2);
                window.scrollTo({ top, behavior: 'smooth' });
            }
            
            // Update local state and UI without full re-render
            state.activeAyah = num;
            const jumpTrigger = contentArea.querySelector('#jump-trigger');
            if (jumpTrigger) {
                jumpTrigger.innerHTML = `${t('surah')} ${state.pageData.number} • ${t('ayah')} ${num}`;
            }
        } else if (retryCount < 10) {
            // If element not found, retry after a short delay (useful during batch rendering)
            setTimeout(() => scrollToAyah(num, retryCount + 1), 150);
        }
    };

    const handleSwipe = (distX, distY) => {
        if (state.loading || state.processing || state.view !== 'reader') return;
        if (state.isSettingsModal || state.isTafsirModal || state.isJumpModal) return;
        if (Math.abs(distY) > Math.abs(distX)) return;
        if (Math.abs(distX) < SWIPE_THRESHOLD) return;
        const currentNum = state.pageData?.number || 0;
        if (distX < 0) {
            if (currentNum < 114) fetchPage(currentNum + 1);
        } else {
            if (currentNum > 1) fetchPage(currentNum - 1);
        }
    };

    const renderListView = () => {
        const isRtl = getCurrentLanguage() === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        if (state.loading && state.surahs.length === 0) {
            contentArea.innerHTML = `<div class="max-w-7xl mx-auto px-4 py-8">${renderSkeletonGrid(12).outerHTML}</div>`;
            return;
        }

        if (state.error && state.surahs.length === 0) {
            contentArea.innerHTML = '';
            contentArea.appendChild(renderErrorState(state.error, fetchSurahList));
            return;
        }

        const filtered = state.surahs.filter(s => 
            s.englishName.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
            s.name.includes(state.searchQuery) ||
            s.number.toString().includes(state.searchQuery)
        );

        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-6 md:py-10 fade-in">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div class="flex items-center gap-4">
                        <button id="reader-list-back" class="p-2.5 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 transition-all active:scale-90 flex items-center gap-2 text-slate-600 dark:text-slate-300 border border-white/20 shadow-lg group">
                            ${BackIcon({className: "w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform"})}
                            <span class="text-xs font-bold uppercase tracking-wider pr-1">${t('back')}</span>
                        </button>
                        <div>
                            <h1 class="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white mb-2 tracking-tight">${t('read')}</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium opacity-80">${t('exploreQuranDescription') || 'Explore the divine message of the Holy Quran'}</p>
                        </div>
                    </div>
                    <div class="relative w-full max-w-md group">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-500 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input id="surah-search" type="text" value="${state.searchQuery}" placeholder="${t('searchSurahPlaceholder')}" class="w-full pl-12 pr-5 py-4 glass rounded-2xl border border-white/20 outline-none focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all dark:text-white shadow-xl placeholder:text-slate-400 font-medium">
                    </div>
                </div>
                <div id="surah-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${filtered.map(s => `
                        <div data-num="${s.number}" class="surah-card p-6 glass-card rounded-[2.5rem] border border-white/20 cursor-pointer hover:border-theme-500/40 hover:shadow-[0_20px_50px_rgba(var(--theme-color-500-rgb),0.15)] transition-all duration-500 active:scale-[0.98] group relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-theme-500/10 to-transparent rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700"></div>
                            <div class="flex items-center justify-between mb-8 relative z-10">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 flex items-center justify-center glass rounded-2xl font-bold text-slate-700 dark:text-slate-200 group-hover:bg-theme-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                        <span class="text-lg">${s.number}</span>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300">${s.englishName}</h3>
                                        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-0.5">${s.revelationType}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-amiri text-3xl text-slate-800 dark:text-slate-100 leading-none group-hover:scale-110 transition-transform duration-500">${s.name}</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-4 pt-5 border-t border-white/10 relative z-10">
                                <div class="flex items-center gap-2">
                                    <span class="px-3 py-1 rounded-full glass text-[10px] font-bold text-theme-600 dark:text-theme-400 uppercase tracking-wider border border-theme-500/20">${s.numberOfAyahs} ${t('ayahs')}</span>
                                </div>
                                <div class="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 group-hover:bg-theme-500 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500">
                                    ${ChevronRightIcon({className: "w-5 h-5"})}
                                </div>
                            </div>
                        </div>`).join('')}
                </div>
            </div>`;
        
        contentArea.querySelector('#reader-list-back')?.addEventListener('click', () => {
            if (props.onBack) props.onBack();
        });

        contentArea.querySelector('#surah-search')?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            const searchVal = e.target.value.toLowerCase();
            contentArea.querySelectorAll('.surah-card').forEach(card => {
                const s = state.surahs.find(x => x.number == card.dataset.num);
                const matches = s.englishName.toLowerCase().includes(searchVal) || s.name.includes(searchVal) || card.dataset.num.includes(searchVal);
                card.style.display = matches ? 'block' : 'none';
            });
        });

        contentArea.querySelectorAll('.surah-card').forEach(c => c.addEventListener('click', () => fetchPage(parseInt(c.dataset.num))));
    };

    const renderReaderView = () => {
        if (state.loading) { 
            contentArea.innerHTML = `<div class="flex h-[70vh] flex-col items-center justify-center">${createSpinner(t('loadingPage')).outerHTML}</div>`; 
            contentArea.dataset.surahId = '';
            return; 
        }

        if (state.error) {
            contentArea.innerHTML = '';
            contentArea.dataset.surahId = '';
            contentArea.appendChild(renderErrorState(state.error, () => fetchPage(state.selectedSurah?.number || 1)));
            return;
        }

        if (!state.pageData) return;
        
        const s = state.pageData;

        // If we are already showing this surah, don't re-render the whole shell
        // This prevents wiping out the ayahs rendered by renderAyahsBatch
        if (contentArea.dataset.surahId == s.number && contentArea.querySelector('#ayah-container')) {
            const jumpTrigger = contentArea.querySelector('#jump-trigger');
            if (jumpTrigger) {
                jumpTrigger.innerHTML = `${t('surah')} ${s.number} • ${t('ayah')} ${state.activeAyah}`;
            }
            
            // Remove spinner if processing is done
            if (!state.processing) {
                contentArea.querySelector('.processing-spinner-wrap')?.remove();
            }
            return;
        }

        contentArea.dataset.surahId = s.number;
        const isRtl = getCurrentLanguage() === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;
        const fontSizeClass = `font-size-${props.fontSize || 'medium'}`;
        const fontClass = props.arabicFont || 'font-noto-naskh-arabic';

        const percentageRead = (state.activeAyah / s.numberOfAyahs) * 100;
        contentArea.innerHTML = `
            <div id="reader-header" class="fixed top-0 inset-x-0 h-16 md:h-20 glass z-[60] border-b border-white/10 flex items-center px-4 md:px-8 justify-between transition-all duration-500 transform -translate-y-full shadow-2xl backdrop-blur-2xl">
                <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-theme-500 to-indigo-500 transition-all duration-500 shadow-[0_0_15px_rgba(var(--theme-color-500-rgb),0.5)]" style="width: ${percentageRead}%"></div>
                
                <button id="reader-back" class="p-2.5 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-200 flex items-center gap-2 transition-all active:scale-90 border border-white/20 shadow-lg group">
                    ${BackIcon({className: "w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform"})}
                    <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider pr-1">${t('back')}</span>
                </button>

                <div class="text-center flex flex-col items-center">
                    <h2 class="font-amiri text-2xl md:text-4xl font-bold leading-none text-slate-900 dark:text-white drop-shadow-sm">${s.name}</h2>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-bold">${s.englishName}</span>
                        <span class="w-1 h-1 rounded-full bg-theme-500/40"></span>
                        <span class="text-[8px] md:text-[10px] text-theme-600 dark:text-theme-400 uppercase tracking-[0.2em] font-bold">${t('surah')} ${s.number}</span>
                    </div>
                </div>

                <button id="settings-trigger" class="p-2.5 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-200 transition-all active:scale-90 border border-white/20 shadow-lg group">
                    ${SlidersHorizontalIcon({className: "w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-500"})}
                </button>
            </div>
            
            <div class="pt-20 pb-24 md:pt-28 md:pb-36 max-w-5xl mx-auto px-4 md:px-6 ${fontSizeClass} ${fontClass}" id="reader-scroll-container">
                <div class="glass-card rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 lg:p-16 shadow-2xl page-texture border border-white/10 transition-all duration-500 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-theme-500/5 to-transparent pointer-events-none"></div>
                    
                    <div class="text-center mb-8 relative z-10">
                        <p class="text-[10px] font-bold text-theme-600/60 dark:text-theme-400/60 uppercase tracking-[0.3em] animate-pulse">
                            ${t('clickAyahForTafsir') || (getCurrentLanguage() === 'ar' ? 'انقر على الآية لعرض التفسير' : 'Click on any verse to view its Tafsir')}
                        </p>
                    </div>

                    <div class="text-center mb-12 md:mb-20 relative z-10">
                         ${(s.number !== 1 && s.number !== 9) ? `
                            <div class="mb-8 md:mb-12">
                                <p class="font-amiri text-4xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white leading-relaxed drop-shadow-sm">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                                <div class="w-24 h-1 bg-gradient-to-r from-transparent via-theme-500/30 to-transparent mx-auto mt-4"></div>
                            </div>
                         ` : ''}
                         <div class="inline-flex items-center gap-4 px-8 py-3 glass rounded-full border border-white/20 shadow-xl">
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">${s.revelationType}</span>
                            <div class="w-2 h-2 rounded-full bg-theme-500 shadow-[0_0_10px_rgba(var(--theme-color-500-rgb),0.6)]"></div>
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">${s.numberOfAyahs} ${t('ayahs')}</span>
                         </div>
                    </div>

                    <div class="quran-arabic-text select-none text-slate-800 dark:text-slate-100 relative z-10" id="ayah-container">
                        ${state.processing ? '<div class="processing-spinner-wrap flex justify-center py-20">' + createSpinner(t('loading')).innerHTML + '</div>' : ''}
                    </div>
                </div>
            </div>

            <div class="fixed bottom-6 md:bottom-10 inset-x-4 md:inset-x-8 z-[60] pointer-events-none">
                <div class="max-w-xl mx-auto flex items-center justify-between glass shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full p-2 border border-white/20 pointer-events-auto transition-all backdrop-blur-2xl">
                    <button id="reader-prev-surah" class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full text-slate-400 hover:text-theme-600 hover:bg-white/10 transition-all ${s.number === 1 ? 'opacity-10 cursor-not-allowed' : ''}" ${s.number === 1 ? 'disabled' : ''}>
                        ${SkipBackwardIcon({className: "w-6 h-6"})}
                    </button>
                    
                    <button id="jump-trigger" class="flex-grow mx-2 px-6 py-3 md:py-4 bg-gradient-to-r from-theme-600 to-indigo-600 text-white rounded-full font-bold shadow-xl shadow-theme-500/20 active:scale-95 hover:shadow-theme-500/40 transition-all text-xs md:text-sm uppercase tracking-widest border border-white/10">
                        <span class="sm:hidden">${s.number}:${state.activeAyah}</span>
                        <span class="hidden sm:inline">${t('surah')} ${s.number} • ${t('ayah')} ${state.activeAyah}</span>
                    </button>
                    
                    <button id="reader-next-surah" class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full text-slate-400 hover:text-theme-600 hover:bg-white/10 transition-all ${s.number === 114 ? 'opacity-10 cursor-not-allowed' : ''}" ${s.number === 114 ? 'disabled' : ''}>
                        ${SkipForwardIcon({className: "w-6 h-6"})}
                    </button>
                </div>
            </div>`;

        // If not already processing, trigger the batch render for the ayahs
        if (!state.processing) {
            requestAnimationFrame(() => {
                renderAyahsBatch(s.ayahs, state.activeAyah);
            });
        }

        // Create back-to-top button and append to body to ensure it's truly fixed
        let btt = document.getElementById('back-to-top');
        if (!btt) {
            btt = document.createElement('button');
            btt.id = 'back-to-top';
            btt.className = 'fixed bottom-24 left-4 md:left-6 z-[9999] p-3 bg-theme-600 text-white rounded-full shadow-2xl transition-all duration-500 hover:scale-110 animate-float flex items-center justify-center pointer-events-auto opacity-0 translate-y-10';
            btt.innerHTML = ArrowUpIcon({className: "w-5 h-5"});
            document.body.appendChild(btt);
        }
            
        contentArea.querySelector('#reader-back').onclick = () => {
            setState({ view: 'list', pageData: null });
            if (setReaderMode) setReaderMode(false);
            document.getElementById('back-to-top')?.remove();
        };
        
        if (btt) {
            btt.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
        contentArea.querySelector('#ayah-container').onclick = (e) => {
            const bookmarkBtn = e.target.closest('.bookmark-ayah-btn');
            if (bookmarkBtn) {
                e.stopPropagation();
                const surahNum = parseInt(bookmarkBtn.dataset.surah);
                const ayahNum = parseInt(bookmarkBtn.dataset.ayah);
                const surah = state.pageData;
                const ayah = surah.ayahs.find(a => a.numberInSurah === ayahNum);
                
                props.toggleBookmark('quran', {
                    id: `${surahNum}:${ayahNum}`,
                    surahNum,
                    ayahNum,
                    title: `${t('surah')} ${surahNum}: ${surah.englishName}`,
                    subtitle: `${t('ayah')} ${ayahNum}`,
                    text: ayah.text,
                    lang: 'ar'
                });
                return;
            }

            const item = e.target.closest('.ayah-item');
            if (item) {
                const ayahNum = parseInt(item.dataset.num);
                contentArea.querySelectorAll('.active-ayah-span, .bg-theme-50').forEach(x => {
                    x.classList.remove('active-ayah-span', 'bg-theme-50', 'dark:bg-theme-900/20', 'border-theme-500/30');
                });
                if (item.classList.contains('ayah-span')) {
                    item.classList.add('active-ayah-span');
                } else {
                    item.classList.add('bg-theme-50', 'dark:bg-theme-900/20', 'border-theme-500/30');
                }
                setState({ activeAyah: ayahNum, isTafsirModal: true });
                fetchTafsir(s.number, ayahNum);
            }
        };
        contentArea.querySelector('#jump-trigger').onclick = () => setState({ isJumpModal: true });
        contentArea.querySelector('#settings-trigger').onclick = () => setState({ isSettingsModal: true });
        contentArea.querySelector('#reader-prev-surah').onclick = () => fetchPage(s.number - 1);
        contentArea.querySelector('#reader-next-surah').onclick = () => fetchPage(s.number + 1);

        // Add scroll listener to update active ayah and progress
        const scrollHandler = () => {
            if (state.view !== 'reader' || !state.pageData) return;
            const ayahs = contentArea.querySelectorAll('.ayah-item');
            let currentAyah = state.activeAyah;
            const viewportMiddle = window.innerHeight / 3;

            for (const ayah of ayahs) {
                const rect = ayah.getBoundingClientRect();
                if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
                    currentAyah = parseInt(ayah.dataset.num);
                    break;
                }
            }

            if (currentAyah !== state.activeAyah) {
                state.activeAyah = currentAyah;
                const jumpTrigger = contentArea.querySelector('#jump-trigger');
                if (jumpTrigger) {
                    jumpTrigger.innerHTML = `
                        <span class="sm:hidden">${s.number}:${state.activeAyah}</span>
                        <span class="hidden sm:inline">${t('surah')} ${s.number} • ${t('ayah')} ${state.activeAyah}</span>
                    `;
                }
                const progressBar = contentArea.querySelector('#reader-header > div:first-child');
                const percentage = (state.activeAyah / s.numberOfAyahs) * 100;
                
                if (progressBar) progressBar.style.width = `${percentage}%`;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        contentArea._scrollHandler = scrollHandler;
    };

    const fetchTafsir = async (surah, ayah) => {
        const lang = getCurrentLanguage();
        const cacheKey = `${surah}:${ayah}:${lang}`;
        const cached = TAFSIR_CACHE.get(cacheKey);
        setState({ isTafsirModal: true, loadingTafsir: !cached, activeTafsirAyah: { surah, ayah }, tafsirData: cached || null });
        if (cached) return;
        try {
            const tafsirEditions = {
                'ar': 'ar.muyassar',
                'en': 'en.asad',
                'id': 'id.indonesian',
                'tr': 'tr.diyanet'
            };
            const edition = tafsirEditions[lang] || 'en.asad';
            const res = await fetchWithRetry(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${edition}`);
            const data = await res.json();
            TAFSIR_CACHE.set(cacheKey, data.data);
            if (state.activeTafsirAyah?.ayah == ayah) setState({ tafsirData: data.data, loadingTafsir: false });
        } catch (e) { setState({ loadingTafsir: false, tafsirData: { text: t('tafsirNotFound') } }); }
    };

    const renderTafsirModal = () => {
        let modal = document.getElementById('tafsir-panel');
        if (!state.isTafsirModal && !state.loadingTafsir) { modal?.remove(); return; }
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tafsir-panel';
            modal.className = 'fixed inset-0 z-[110] flex items-end justify-center pointer-events-none';
            document.body.appendChild(modal);
        }
        const surahName = state.selectedSurah?.englishName || '';
        const ayahNum = state.activeTafsirAyah?.ayah || '';
        const lang = getCurrentLanguage();
        const isAr = lang === 'ar';

        const isBookmarked = props.bookmarks.quran.some(b => b.id === `${state.pageData.number}:${ayahNum}`);

        modal.innerHTML = `
            <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto" id="tafsir-backdrop"></div>
            <div class="panel-content w-full max-w-2xl glass rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] p-8 md:p-12 translate-y-0 transition-transform duration-500 pointer-events-auto max-h-[90vh] overflow-y-auto border-t border-white/20 relative z-10">
                <div class="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-10"></div>
                
                <div class="flex justify-between items-start mb-8">
                    <div class="space-y-1">
                        <h3 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">${t('tafsir')}</h3>
                        <p class="text-xs font-bold text-theme-600 dark:text-theme-400 uppercase tracking-widest">${surahName} • ${t('ayah')} ${ayahNum}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="tafsir-bookmark-btn" class="w-12 h-12 flex items-center justify-center rounded-full glass border border-white/10 text-slate-400 hover:text-theme-600 transition-all active:scale-90">
                            ${isBookmarked ? BookmarkSolidIcon({className: "w-6 h-6 text-theme-600"}) : BookmarkIcon({className: "w-6 h-6"})}
                        </button>
                        <button id="close-tafsir" class="w-12 h-12 flex items-center justify-center rounded-full glass border border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90">
                            ${CloseIcon({className: "w-6 h-6"})}
                        </button>
                    </div>
                </div>

                <div class="tafsir-body ${isAr ? 'text-right font-amiri' : 'text-left'} text-xl md:text-2xl leading-relaxed text-slate-700 dark:text-slate-200 mb-10" dir="${isAr ? 'rtl' : 'ltr'}">
                    ${state.loadingTafsir ? `
                        <div class="flex flex-col items-center justify-center py-12 space-y-4">
                            ${createSpinner().outerHTML}
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">${t('loadingTafsir') || 'Loading Tafsir...'}</p>
                        </div>
                    ` : (state.tafsirData?.text || t('tafsirNotFound'))}
                </div>

                ${!state.loadingTafsir && state.tafsirData ? `
                <button id="tafsir-ai-btn" class="w-full p-6 bg-gradient-to-r from-theme-600 to-indigo-600 text-white rounded-[2rem] flex items-center justify-center gap-4 font-bold shadow-xl shadow-theme-500/20 hover:shadow-theme-500/40 transition-all group border border-white/10">
                    <span class="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">${AiIcon({className: "w-6 h-6"})}</span> 
                    <span class="text-sm uppercase tracking-widest">${t('askAIAboutAyah')}</span>
                </button>` : ''}
            </div>`;
        
        modal.querySelector('#close-tafsir').onclick = () => setState({ isTafsirModal: false, loadingTafsir: false });
        modal.querySelector('#tafsir-bookmark-btn')?.addEventListener('click', () => {
            const surahNum = state.pageData.number;
            const ayahNum = state.activeTafsirAyah.ayah;
            const surah = state.pageData;
            const ayah = surah.ayahs.find(a => a.numberInSurah === ayahNum);
            
            props.toggleBookmark('quran', {
                id: `${surahNum}:${ayahNum}`,
                surahNum,
                ayahNum,
                title: `${t('surah')} ${surahNum}: ${surah.englishName}`,
                subtitle: `${t('ayah')} ${ayahNum}`,
                text: ayah.text,
                lang: 'ar'
            });
            renderTafsirModal(); // Re-render to update icon
        });
        modal.querySelector('#tafsir-backdrop').onclick = () => setState({ isTafsirModal: false, loadingTafsir: false });
        modal.querySelector('#tafsir-ai-btn')?.addEventListener('click', () => {
            const currentAyah = state.pageData?.ayahs.find(a => a.numberInSurah == state.activeTafsirAyah.ayah);
            const prompt = getCurrentLanguage() === 'ar' ? `تفسير: ${state.selectedSurah.name} آية ${state.activeTafsirAyah.ayah}` : `Tafsir: ${state.selectedSurah.englishName} Ayah ${state.activeTafsirAyah.ayah}`;
            document.dispatchEvent(new CustomEvent('ask-ai-tafsir', { detail: { prompt: `${prompt}. Text: "${currentAyah?.text}". Simple Tafsir: "${state.tafsirData?.text}"` } }));
            setState({ isTafsirModal: false });
        });
    };

    const renderJumpToModal = () => {
        let modal = document.getElementById('jump-modal');
        if (!state.isJumpModal) { modal?.remove(); return; }
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'jump-modal';
            modal.className = 'fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md';
            document.body.appendChild(modal);
        }

        const currentSurahNum = state.pageData?.number || 1;
        const currentAyahNum = state.activeAyah || 1;

        modal.innerHTML = `
            <div class="glass rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-sm p-8 md:p-10 fade-in border border-white/20 relative z-10 overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-theme-500/10 to-transparent pointer-events-none"></div>
                
                <div class="flex justify-between items-center mb-8 relative z-10">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">${t('jumpToAyah')}</h3>
                    <button id="close-jump-modal" class="w-10 h-10 flex items-center justify-center rounded-full glass border border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90">
                        ${CloseIcon({className: "w-5 h-5"})}
                    </button>
                </div>

                <div class="space-y-8 relative z-10">
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('selectSurah')}</label>
                        <div class="relative">
                            <select id="jump-surah-select" class="w-full p-5 bg-white/5 dark:bg-slate-900/50 rounded-2xl border border-white/10 outline-none text-slate-900 dark:text-white focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all appearance-none font-medium">
                                ${state.surahs.map(s => `<option value="${s.number}" ${s.number === currentSurahNum ? 'selected' : ''} class="bg-slate-900">${s.number}. ${s.englishName}</option>`).join('')}
                            </select>
                            <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('ayahNumber')}</label>
                        <input id="jump-ayah-input" type="number" min="1" value="${currentAyahNum}" class="w-full p-5 bg-white/5 dark:bg-slate-900/50 rounded-2xl border border-white/10 outline-none text-slate-900 dark:text-white focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all font-medium">
                    </div>

                    <button id="jump-confirm-btn" class="w-full py-5 bg-gradient-to-r from-theme-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-theme-500/20 hover:shadow-theme-500/40 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs border border-white/10">
                        ${t('goTo')}
                    </button>
                </div>
            </div>`;

        const surahSelect = modal.querySelector('#jump-surah-select');
        const ayahInput = modal.querySelector('#jump-ayah-input');
        const updateMax = () => {
            const s = state.surahs.find(x => x.number == surahSelect.value);
            if (s) ayahInput.max = s.numberOfAyahs;
        };
        surahSelect.onchange = updateMax;
        updateMax();

        modal.querySelector('#close-jump-modal').onclick = () => setState({ isJumpModal: false });
        modal.querySelector('#jump-confirm-btn').onclick = () => {
            const s = parseInt(surahSelect.value);
            const a = parseInt(ayahInput.value);
            setState({ isJumpModal: false });
            fetchPage(s, a);
        };
    };

    const renderSettingsModal = () => {
        let modal = document.getElementById('reader-settings-modal');
        if (!state.isSettingsModal) { modal?.remove(); return; }
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'reader-settings-modal';
            modal.className = 'fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md';
            document.body.appendChild(modal);
        }

        const fontOptions = [
            { id: 'noto_naskh_arabic', name: t('font_noto_naskh_arabic') },
            { id: 'amiri', name: t('font_amiri') },
            { id: 'scheherazade', name: t('font_scheherazade') },
            { id: 'vazirmatn', name: 'Vazirmatn' },
            { id: 'cairo', name: t('font_cairo') },
            { id: 'almarai', name: t('font_almarai') },
            { id: 'tajawal', name: t('font_tajawal') },
            { id: 'lateef', name: t('font_lateef') },
            { id: 'reem_kufi', name: t('font_reem_kufi') },
            { id: 'alkalami', name: t('font_alkalami') },
            { id: 'gulzar', name: t('font_gulzar') },
            { id: 'el_messiri', name: t('font_el_messiri') },
            { id: 'changa', name: t('font_changa') },
            { id: 'mada', name: t('font_mada') },
            { id: 'harmattan', name: t('font_harmattan') },
            { id: 'lalezar', name: t('font_lalezar') },
            { id: 'kufam', name: t('font_kufam') },
            { id: 'aref_ruqaa', name: t('font_aref_ruqaa') },
            { id: 'mirza', name: t('font_mirza') },
        ];

        const sizeOptions = [
            { id: 'x-small', name: t('fontSizeXSmall') },
            { id: 'small', name: t('fontSizeSmall') },
            { id: 'medium', name: t('fontSizeMedium') },
            { id: 'large', name: t('fontSizeLarge') },
            { id: 'x-large', name: t('fontSizeXLarge') },
            { id: 'xx-large', name: t('fontSizeXXLarge') || (getCurrentLanguage() === 'ar' ? 'ضخم' : 'XX-Large') },
            { id: 'xxx-large', name: t('fontSizeXXXLarge') || (getCurrentLanguage() === 'ar' ? 'ضخم جداً' : 'XXX-Large') },
        ];

        modal.innerHTML = `
            <div class="absolute inset-0" id="reader-settings-backdrop"></div>
            <div class="glass rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-md p-8 md:p-10 fade-in border-t sm:border border-white/20 relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div class="w-12 h-1.5 bg-slate-200/20 rounded-full mx-auto mb-8 sm:hidden"></div>
                
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">${t('displaySettings')}</h3>
                    <button id="close-reader-settings" class="w-10 h-10 flex items-center justify-center rounded-full glass border border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90">
                        ${CloseIcon({className: "w-5 h-5"})}
                    </button>
                </div>

                <div class="space-y-10">
                    <div class="space-y-4">
                        <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('fontSize')}</label>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            ${sizeOptions.map(opt => `
                                <button data-size="${opt.id}" class="size-btn px-4 py-3 text-[10px] font-bold rounded-2xl border transition-all active:scale-95 ${props.fontSize === opt.id ? 'bg-theme-600 border-theme-600 text-white shadow-xl shadow-theme-500/20' : 'glass border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/10'}">
                                    ${opt.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('arabicFont')}</label>
                        <div class="grid grid-cols-1 gap-3">
                            ${fontOptions.map(opt => `
                                <button data-font="${opt.id}" class="font-btn w-full px-5 py-4 text-sm font-bold rounded-2xl border flex justify-between items-center transition-all active:scale-[0.98] ${props.arabicFont === opt.id ? 'bg-theme-600 border-theme-600 text-white shadow-xl shadow-theme-500/20' : 'glass border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/10'}">
                                    <span class="preview-${opt.id} text-2xl md:text-3xl">${opt.id === 'noto_naskh_arabic' ? 'بِسْمِ اللهِ' : 'بِسْمِ اللهِ'}</span>
                                    <span class="text-[10px] opacity-60 uppercase tracking-widest">${opt.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <button id="done-reader-settings" class="w-full py-5 bg-gradient-to-r from-theme-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-theme-500/20 hover:shadow-theme-500/40 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs border border-white/10">
                        ${t('done') || (getCurrentLanguage() === 'ar' ? 'تم' : 'Done')}
                    </button>
                </div>
            </div>`;

        modal.querySelector('#close-reader-settings').onclick = () => setState({ isSettingsModal: false });
        modal.querySelector('#done-reader-settings').onclick = () => setState({ isSettingsModal: false });
        modal.querySelector('#reader-settings-backdrop').onclick = () => setState({ isSettingsModal: false });
        
        const updateActiveClasses = (container, selector, activeValue, dataAttr) => {
            container.querySelectorAll(selector).forEach(btn => {
                const isActive = btn.getAttribute(dataAttr) === activeValue;
                const activeClasses = ['bg-theme-600', 'border-theme-600', 'text-white', 'shadow-xl', 'shadow-theme-500/20'];
                const inactiveClasses = ['glass', 'border-white/10', 'text-slate-600', 'dark:text-slate-400', 'hover:bg-white/10'];
                
                if (isActive) {
                    btn.classList.remove(...inactiveClasses);
                    btn.classList.add(...activeClasses);
                } else {
                    btn.classList.remove(...activeClasses);
                    btn.classList.add(...inactiveClasses);
                }
            });
        };

        modal.querySelectorAll('.size-btn').forEach(btn => btn.onclick = () => {
            const newSize = btn.dataset.size;
            props.setFontSize(newSize);
            updateActiveClasses(modal, '.size-btn', newSize, 'data-size');
        });
        
        modal.querySelectorAll('.font-btn').forEach(btn => btn.onclick = () => {
            const newFont = btn.dataset.font;
            props.setArabicFont(newFont);
            updateActiveClasses(modal, '.font-btn', newFont, 'data-font');
        });
    };

    // Initialize
    fetchSurahList().then(() => {
        if (isReaderMode && readerConfig?.surah && !state.pageData) {
            fetchPage(readerConfig.surah.number, readerConfig.ayah || 1);
        } else {
            render();
        }
    });

    let lastScrollY = 0;
    const handleScroll = (e) => {
        const header = document.getElementById('reader-header');
        const btt = document.getElementById('back-to-top');
        if (!header) return;
        
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Header logic
        if (scrollTop > lastScrollY && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
            if (scrollTop > 50) {
                header.classList.add('shadow-xl');
            } else {
                header.classList.remove('shadow-xl');
            }
        }

        // Back to top logic
        if (btt) {
            if (scrollTop > 150) {
                btt.style.opacity = '1';
                btt.style.transform = 'translateY(0) scale(1)';
                btt.style.pointerEvents = 'auto';
            } else {
                btt.style.opacity = '0';
                btt.style.transform = 'translateY(20px) scale(0.8)';
                btt.style.pointerEvents = 'none';
            }
        }

        lastScrollY = scrollTop;
    };
    
    // We attach to window as fallback, but also to the container if it exists
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => { 
        document.getElementById('tafsir-panel')?.remove(); 
        document.getElementById('jump-modal')?.remove(); 
        document.getElementById('back-to-top')?.remove();
        window.removeEventListener('scroll', handleScroll, { capture: true });
    };
};