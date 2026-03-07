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
                html = batch.map(a => `
                    <span class="ayah-item ayah-span cursor-pointer hover:text-theme-600 dark:hover:text-theme-400 transition-colors inline ${state.activeAyah == a.numberInSurah ? 'active-ayah-span' : ''}" 
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
                
                html = batch.map(a => {
                    const isBookmarked = props.bookmarks.quran.some(b => b.id === `${state.pageData.number}:${a.numberInSurah}`);
                    return `
                    <div class="ayah-item group p-3 md:p-6 rounded-2xl md:rounded-3xl border border-transparent hover:border-theme-500/20 hover:bg-theme-50/30 dark:hover:bg-theme-900/10 transition-all cursor-pointer ${state.activeAyah == a.numberInSurah ? 'bg-theme-50 dark:bg-theme-900/20 border-theme-500/30' : ''}" 
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
                        <button id="reader-list-back" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            ${BackIcon({className: "w-6 h-6"})}
                            <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                        </button>
                        <div>
                            <h1 class="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white mb-2 tracking-tight">${t('read')}</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-sm md:text-base">${t('exploreQuranDescription') || 'Explore the divine message of the Holy Quran'}</p>
                        </div>
                    </div>
                    <div class="relative w-full max-w-md group">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-500 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input id="surah-search" type="text" value="${state.searchQuery}" placeholder="${t('searchSurahPlaceholder')}" class="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all dark:text-white shadow-sm backdrop-blur-sm">
                    </div>
                </div>
                <div id="surah-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    ${filtered.map(s => `
                        <div data-num="${s.number}" class="surah-card p-6 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 cursor-pointer hover:border-theme-500/50 hover:shadow-2xl hover:shadow-theme-500/10 transition-all duration-500 active:scale-[0.97] group relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-24 h-24 bg-theme-500/5 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                            <div class="flex items-center justify-between mb-6">
                                <div class="flex items-center gap-4">
                                    <span class="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 rounded-2xl font-bold text-slate-700 dark:text-slate-300 group-hover:bg-theme-600 group-hover:text-white transition-all duration-300 shadow-sm">${s.number}</span>
                                    <div>
                                        <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${s.englishName}</h3>
                                        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">${s.revelationType}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-amiri text-3xl text-slate-800 dark:text-slate-200 leading-none mb-1">${s.name}</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded-md bg-theme-50 dark:bg-theme-900/20 text-[9px] font-bold text-theme-600 dark:text-theme-400 uppercase tracking-wider border border-theme-100 dark:border-theme-900/30">${s.numberOfAyahs} ${t('ayahs')}</span>
                                </div>
                                <div class="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500 group-hover:text-white transition-all duration-300">
                                    ${ChevronRightIcon({className: "w-4 h-4"})}
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

        contentArea.innerHTML = `
            <div id="reader-header" class="fixed top-0 inset-x-0 h-14 md:h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-30 border-b border-slate-200 dark:border-slate-800 flex items-center px-3 md:px-4 justify-between transition-all duration-300 transform -translate-y-full shadow-lg">
                <button id="reader-back" class="p-1.5 md:p-2 -ml-1 md:-ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-all active:scale-90">
                    ${BackIcon({className: "w-5 h-5 md:w-6 md:h-6"})}
                    <span class="hidden sm:inline text-sm font-bold">${t('backToList')}</span>
                </button>
                <div class="text-center overflow-hidden">
                    <h2 class="font-amiri text-xl md:text-3xl font-bold leading-none dark:text-slate-100 truncate max-w-[120px] md:max-w-none">${s.name}</h2>
                    <p class="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">${s.englishName}</p>
                </div>
                <button id="settings-trigger" class="p-1.5 md:p-2 -mr-1 md:-mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90">${SlidersHorizontalIcon({className: "w-5 h-5 md:w-6 md:h-6"})}</button>
            </div>
            
            <button id="back-to-top" class="fixed bottom-24 right-4 md:right-8 z-40 p-3 md:p-4 bg-theme-600 text-white rounded-full shadow-2xl transition-all duration-300 opacity-0 translate-y-10 pointer-events-none active:scale-90">
                ${ArrowUpIcon({className: "w-6 h-6"})}
            </button>
            
            <div class="pt-14 pb-20 md:pt-20 md:pb-32 max-w-7xl mx-auto px-1 md:px-4 lg:px-8 ${fontSizeClass} ${fontClass}" id="reader-scroll-container">
                <div class="bg-white dark:bg-slate-900 rounded-xl md:rounded-[2.5rem] p-3 md:p-8 lg:p-12 shadow-xl page-texture border border-slate-100 dark:border-slate-800 transition-colors">
                    <div class="text-center mb-4">
                        <p class="text-[10px] font-bold text-theme-600/60 dark:text-theme-400/60 uppercase tracking-widest animate-pulse">
                            ${t('clickAyahForTafsir') || (getCurrentLanguage() === 'ar' ? 'انقر على الآية لعرض التفسير' : 'Click on any verse to view its Tafsir')}
                        </p>
                    </div>
                    <div class="text-center mb-6 md:mb-12">
                         ${(s.number !== 1 && s.number !== 9) ? '<p class="font-amiri text-3xl md:text-5xl lg:text-6xl text-theme-600 dark:text-theme-400 mb-4 md:mb-10 leading-relaxed block w-full">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>' : ''}
                         <div class="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">${s.revelationType}</span>
                            <span class="w-1.5 h-1.5 rounded-full bg-theme-500 shadow-[0_0_8px_rgba(var(--theme-500-rgb),0.5)]"></span>
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">${s.numberOfAyahs} ${t('ayahs')}</span>
                         </div>
                    </div>
                    <div class="quran-arabic-text select-none text-slate-800 dark:text-slate-100" id="ayah-container">
                        ${state.processing ? '<div class="processing-spinner-wrap flex justify-center py-10">' + createSpinner(t('loading')).innerHTML + '</div>' : ''}
                    </div>
                </div>
            </div>

            <div class="fixed bottom-4 md:bottom-6 inset-x-2 md:inset-x-4 z-30 pointer-events-none">
                <div class="max-w-lg mx-auto flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-full p-1 md:p-2 border border-slate-200 dark:border-slate-800 pointer-events-auto transition-all">
                    <button id="reader-prev-surah" class="p-2 md:p-4 text-slate-400 hover:text-theme-600 ${s.number === 1 ? 'opacity-10 cursor-not-allowed' : ''}" ${s.number === 1 ? 'disabled' : ''}>${SkipBackwardIcon({className: "w-5 h-5 md:w-6 md:h-6"})}</button>
                    <button id="jump-trigger" class="flex-grow px-3 py-2 md:px-4 md:py-3 bg-theme-600 text-white rounded-full font-bold shadow-lg shadow-theme-500/20 active:scale-95 transition-all text-[10px] md:text-sm">
                        <span class="sm:hidden">${s.number}:${state.activeAyah}</span>
                        <span class="hidden sm:inline">${t('surah')} ${s.number} • ${t('ayah')} ${state.activeAyah}</span>
                    </button>
                    <button id="reader-next-surah" class="p-2 md:p-4 text-slate-400 hover:text-theme-600 ${s.number === 114 ? 'opacity-10 cursor-not-allowed' : ''}" ${s.number === 114 ? 'disabled' : ''}>${SkipForwardIcon({className: "w-5 h-5 md:w-6 md:h-6"})}</button>
                </div>
            </div>`;

        // If not already processing, trigger the batch render for the ayahs
        if (!state.processing) {
            requestAnimationFrame(() => {
                renderAyahsBatch(s.ayahs, state.activeAyah);
            });
        }
            
        contentArea.querySelector('#reader-back').onclick = () => {
            setState({ view: 'list', pageData: null });
            if (setReaderMode) setReaderMode(false);
        };
        
        const btt = contentArea.querySelector('#back-to-top');
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
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto" id="tafsir-backdrop"></div>
            <div class="panel-content w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl p-6 md:p-10 translate-y-0 transition-transform duration-500 pointer-events-auto max-h-[85vh] overflow-y-auto border-t border-slate-200 dark:border-slate-800">
                <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-xl md:text-2xl font-bold dark:text-white">${t('tafsirFor', { surahName, ayahNumber: ayahNum })}</h3>
                    <div class="flex items-center gap-2">
                        <button id="tafsir-bookmark-btn" class="p-2 text-slate-400 hover:text-theme-600 transition-colors">
                            ${isBookmarked ? BookmarkSolidIcon({className: "w-6 h-6 text-theme-600"}) : BookmarkIcon({className: "w-6 h-6"})}
                        </button>
                        <button id="close-tafsir" class="p-2 text-slate-400">${CloseIcon()}</button>
                    </div>
                </div>
                <div class="tafsir-body ${isAr ? 'text-right font-amiri' : 'text-left'} text-xl md:text-2xl leading-relaxed dark:text-slate-200" dir="${isAr ? 'rtl' : 'ltr'}">
                    ${state.loadingTafsir ? createSpinner().outerHTML : (state.tafsirData?.text || t('tafsirNotFound'))}
                </div>
                ${!state.loadingTafsir && state.tafsirData ? `
                <button id="tafsir-ai-btn" class="w-full mt-8 p-5 bg-theme-50 dark:bg-theme-950/20 text-theme-700 dark:text-theme-400 rounded-2xl flex items-center justify-center gap-3 font-bold border border-theme-100 dark:border-theme-900/50 hover:bg-theme-600 hover:text-white transition-all group">
                    <span class="group-hover:text-white">${AiIcon()}</span> ${t('askAIAboutAyah')}
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
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm p-6 md:p-8 fade-in border border-slate-100 dark:border-slate-800 relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold dark:text-white">${t('jumpToAyah')}</h3>
                    <button id="close-jump-modal" class="p-2 text-slate-400">${CloseIcon()}</button>
                </div>
                <div class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t('selectSurah')}</label>
                        <select id="jump-surah-select" class="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none outline-none dark:text-white focus:ring-2 focus:ring-theme-500">
                            ${state.surahs.map(s => `<option value="${s.number}" ${s.number === currentSurahNum ? 'selected' : ''}>${s.number}. ${s.englishName}</option>`).join('')}
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t('ayahNumber')}</label>
                        <input id="jump-ayah-input" type="number" min="1" value="${currentAyahNum}" class="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none outline-none dark:text-white focus:ring-2 focus:ring-theme-500">
                    </div>
                    <button id="jump-confirm-btn" class="w-full py-4 bg-theme-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">${t('goTo')}</button>
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
            <div class="bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-sm p-6 md:p-8 fade-in border-t sm:border border-slate-100 dark:border-slate-800 relative z-10 max-h-[90vh] overflow-y-auto">
                <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden"></div>
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold dark:text-white">${t('displaySettings')}</h3>
                    <button id="close-reader-settings" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">${CloseIcon()}</button>
                </div>
                <div class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t('fontSize')}</label>
                        <div class="grid grid-cols-3 gap-2">
                            ${sizeOptions.map(opt => `
                                <button data-size="${opt.id}" class="size-btn px-2 py-3 text-[10px] font-bold rounded-xl border transition-all ${props.fontSize === opt.id ? 'bg-theme-600 border-theme-600 text-white shadow-lg shadow-theme-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}">
                                    ${opt.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t('arabicFont')}</label>
                        <div class="grid grid-cols-1 gap-2">
                            ${fontOptions.map(opt => `
                                <button data-font="${opt.id}" class="font-btn w-full px-4 py-3 text-sm font-bold rounded-xl border flex justify-between items-center transition-all ${props.arabicFont === opt.id ? 'bg-theme-600 border-theme-600 text-white shadow-lg shadow-theme-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}">
                                    <span class="preview-${opt.id} text-xl md:text-2xl">${opt.id === 'noto_naskh_arabic' ? 'بِسْمِ اللهِ' : 'بِسْمِ اللهِ'}</span>
                                    <span class="text-xs opacity-70">${opt.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <button id="done-reader-settings" class="w-full py-4 bg-theme-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all mt-4">${t('done') || (getCurrentLanguage() === 'ar' ? 'تم' : 'Done')}</button>
                </div>
            </div>`;

        modal.querySelector('#close-reader-settings').onclick = () => setState({ isSettingsModal: false });
        modal.querySelector('#done-reader-settings').onclick = () => setState({ isSettingsModal: false });
        modal.querySelector('#reader-settings-backdrop').onclick = () => setState({ isSettingsModal: false });
        
        const updateActiveClasses = (container, selector, activeValue, dataAttr) => {
            container.querySelectorAll(selector).forEach(btn => {
                const isActive = btn.getAttribute(dataAttr) === activeValue;
                const activeClasses = ['bg-theme-600', 'border-theme-600', 'text-white', 'shadow-lg', 'shadow-theme-500/20'];
                const inactiveClasses = ['bg-slate-50', 'dark:bg-slate-800', 'border-slate-100', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400'];
                
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
            if (scrollTop > 500) {
                btt.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                btt.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            } else {
                btt.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                btt.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        }

        lastScrollY = scrollTop;
    };
    
    // We attach to window as fallback, but also to the container if it exists
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => { 
        document.getElementById('tafsir-panel')?.remove(); 
        document.getElementById('jump-modal')?.remove(); 
        window.removeEventListener('scroll', handleScroll, { capture: true });
    };
};