import { createSpinner } from './Spinner.js';
import { renderErrorState, renderSkeletonGrid } from './UI.js';
import { CloseIcon, SkipBackwardIcon, SkipForwardIcon, SettingsIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, MinusIcon, PlusIcon, BookmarkIcon, BookmarkSolidIcon, ArrowUpIcon, SparklesIcon, ShareIcon, SearchIcon, QuranIcon, CheckCircleIcon } from './Icons.js';
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
        jumpTab: 'surah',
        listTab: 'surah',
        isSettingsModal: cache.isSettingsModalOpen || false,
        isTafsirModal: false,
        loadingTafsir: false,
        tafsirData: null,
        activeTafsirAyah: null,
        verseSearchQuery: '',
        verseSearchResults: [],
        searchingVerses: false,
        error: null
    };

    let contentArea = container.querySelector('.quran-reader-inner');
    if (!contentArea) {
        contentArea = document.createElement('div');
        contentArea.className = 'quran-reader-inner min-h-full transition-opacity duration-300';
        container.innerHTML = '';
        container.appendChild(contentArea);
    }

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

    const searchVerses = async (query) => {
        if (!query || query.length < 3) {
            setState({ verseSearchResults: [], searchingVerses: false });
            return;
        }
        
        setState({ searchingVerses: true });
        const lang = getCurrentLanguage();
        const editionMap = {
            'en': 'en.sahih',
            'id': 'id.indonesian',
            'tr': 'tr.ates'
        };
        const edition = editionMap[lang] || 'en.sahih';
        
        try {
            const res = await fetchWithRetry(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${edition}`);
            const data = await res.json();
            
            if (data.status === 'OK') {
                // Also fetch Arabic for matches
                const results = data.data.matches.slice(0, 20); // Limit to 20 results
                const resultsWithArabic = await Promise.all(results.map(async (res) => {
                    const arRes = await fetchWithRetry(`https://api.alquran.cloud/v1/ayah/${res.surah.number}:${res.numberInSurah}`);
                    const arData = await arRes.json();
                    return {
                        ...res,
                        text: arData.data.text,
                        translation: res.text
                    };
                }));
                
                setState({ verseSearchResults: resultsWithArabic, searchingVerses: false });
            } else {
                setState({ verseSearchResults: [], searchingVerses: false });
            }
        } catch (e) {
            console.error(e);
            setState({ verseSearchResults: [], searchingVerses: false });
        }
    };

    const shareAyah = async (surahNum, ayahNum) => {
        const surah = state.surahs.find(s => s.number === surahNum) || state.pageData;
        const ayah = state.pageData?.ayahs.find(a => a.numberInSurah === ayahNum);
        
        if (!ayah) return;
        
        const shareText = `"${ayah.text}"\n\n${ayah.translation || ''}\n\n— Quran ${surah.englishName} (${surahNum}:${ayahNum})\n\nRead more at: ${window.location.origin}/surah/${surahNum}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${t('surah')} ${surah.englishName} ${surahNum}:${ayahNum}`,
                    text: shareText,
                    url: `${window.location.origin}/surah/${surahNum}`
                });
            } catch (e) {
                console.error('Error sharing:', e);
                copyToClipboard(shareText);
            }
        } else {
            copyToClipboard(shareText);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            if (window.showToast) window.showToast(t('ayahCopied'), 'success');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
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
                container.classList.add('space-y-1');
                
                html = batch.map((a, i) => {
                    const isBookmarked = props.bookmarks.quran.some(b => b.id === `${state.pageData.number}:${a.numberInSurah}`);
                    return `
                    <div class="ayah-item group p-0 md:p-0.5 rounded-md border border-transparent hover:border-theme-500/20 hover:bg-theme-50/30 dark:hover:bg-theme-900/10 transition-all cursor-pointer fade-in ${state.activeAyah == a.numberInSurah ? 'bg-theme-50 dark:bg-theme-900/20 border-theme-500/30' : ''}" 
                         style="animation-delay: ${i * 30}ms"
                         data-num="${a.numberInSurah}" 
                         data-ayah-number="${a.numberInSurah}">
                        <div class="flex items-start justify-between gap-1 mb-0.5">
                            <div class="flex items-center gap-1">
                                <span class="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-md text-[7px] md:text-[9px] font-bold text-slate-500 group-hover:bg-theme-600 group-hover:text-white transition-all">${a.numberInSurah}</span>
                                <button class="bookmark-ayah-btn p-0.5 md:p-1 rounded-md hover:bg-theme-100 dark:hover:bg-theme-800 text-slate-400 hover:text-theme-600 transition-all" data-surah="${state.pageData.number}" data-ayah="${a.numberInSurah}">
                                    ${isBookmarked ? BookmarkSolidIcon({className: "w-3 h-3 md:w-3.5 h-3.5 text-theme-600"}) : BookmarkIcon({className: "w-3 h-3 md:w-3.5 h-3.5"})}
                                </button>
                                <button class="share-ayah-btn p-0.5 md:p-1 rounded-md hover:bg-theme-100 dark:hover:bg-theme-800 text-slate-400 hover:text-theme-600 transition-all" data-surah="${state.pageData.number}" data-ayah="${a.numberInSurah}">
                                    ${ShareIcon({className: "w-3 h-3 md:w-3.5 h-3.5"})}
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
                
                // Attach share listeners
                container.querySelectorAll('.share-ayah-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        const surahNum = parseInt(btn.dataset.surah);
                        const ayahNum = parseInt(btn.dataset.ayah);
                        shareAyah(surahNum, ayahNum);
                    };
                });
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
            
            // Save last read
            if (state.pageData) {
                localStorage.setItem('quran_last_read', JSON.stringify({
                    surah: state.pageData.number,
                    ayah: num,
                    surahName: state.pageData.englishName,
                    totalAyahs: state.pageData.numberOfAyahs
                }));
            }

            const jumpTrigger = contentArea.querySelector('#jump-trigger');
            if (jumpTrigger) {
                jumpTrigger.innerHTML = `${t('surah')} ${state.pageData.number} • ${t('ayah')} ${num}`;
            }
        } else if (retryCount < 10) {
            // If element not found, retry after a short delay (useful during batch rendering)
            setTimeout(() => scrollToAyah(num, retryCount + 1), 150);
        }
    };

    const renderListView = () => {
        const isRtl = getCurrentLanguage() === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        // Continue Reading Section removed as per user request
        let continueReadingHtml = '';

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
        
        const searchPlaceholder = state.listTab === 'verses' ? t('searchVersesPlaceholder') : t('searchSurahPlaceholder');

        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-6 md:py-10 fade-in">
                ${continueReadingHtml}
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
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
                            ${SearchIcon({className: "w-5 h-5"})}
                        </div>
                        <input id="surah-search" type="text" value="${state.listTab === 'verses' ? state.verseSearchQuery : state.searchQuery}" placeholder="${searchPlaceholder}" class="w-full pl-12 pr-5 py-4 glass rounded-2xl border border-white/20 outline-none focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all dark:text-white shadow-xl placeholder:text-slate-400 font-medium">
                        ${state.searchingVerses ? `
                            <div class="absolute right-4 top-1/2 -translate-y-1/2">
                                <div class="w-5 h-5 border-2 border-theme-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl mb-8 w-fit">
                    <button data-tab="surah" class="list-tab-btn px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${state.listTab === 'surah' ? 'bg-white dark:bg-slate-800 text-theme-600 shadow-sm' : 'text-slate-500'}">${t('surah')}</button>
                    <button data-tab="juz" class="list-tab-btn px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${state.listTab === 'juz' ? 'bg-white dark:bg-slate-800 text-theme-600 shadow-sm' : 'text-slate-500'}">${t('juz')}</button>
                    <button data-tab="verses" class="list-tab-btn px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${state.listTab === 'verses' ? 'bg-white dark:bg-slate-800 text-theme-600 shadow-sm' : 'text-slate-500'}">${t('verses')}</button>
                </div>

                <div id="surah-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    ${state.listTab === 'surah' ? filtered.map(s => `
                        <div data-num="${s.number}" class="surah-card p-3.5 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-theme-500/10 hover:border-theme-500/30 hover:-translate-y-1 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                            <div class="absolute -right-8 -top-8 w-24 h-24 bg-theme-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div class="flex items-center justify-between mb-2 relative z-10">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm font-display relative">
                                        <span class="text-sm relative z-10">${s.number}</span>
                                        <div class="absolute inset-0 bg-theme-500/20 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                                    </div>
                                    <div class="min-w-0">
                                        <h3 class="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300 truncate tracking-tight">${s.englishName}</h3>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">${s.revelationType}</p>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <p class="font-amiri text-lg text-slate-800 dark:text-slate-200 leading-none group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-500">${s.name}</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 relative z-10">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">${s.numberOfAyahs} ${t('ayahs')}</span>
                                </div>
                                <div class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500">
                                    ${ChevronRightIcon({className: `w-3 h-3 ${isRtl ? 'rotate-180' : ''}`})}
                                </div>
                            </div>
                        </div>`).join('') : state.listTab === 'juz' ? Array.from({length: 30}, (_, i) => i + 1).map(j => {
                            const mapping = JUZ_MAPPING.find(m => m.juz === j);
                            const surah = state.surahs.find(s => s.number === mapping.surah);
                            return `
                            <div data-juz="${j}" class="juz-card p-3.5 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-theme-500/10 hover:border-theme-500/30 hover:-translate-y-1 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                                <div class="absolute -right-8 -top-8 w-24 h-24 bg-theme-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div class="flex items-center gap-3 relative z-10">
                                    <div class="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm font-display relative">
                                        <span class="text-sm relative z-10">${j}</span>
                                    </div>
                                    <div class="min-w-0">
                                        <h3 class="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300 truncate tracking-tight">${t('juz')} ${j}</h3>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">${surah ? surah.englishName : ''} • ${t('ayah')} ${mapping.ayah}</p>
                                    </div>
                                </div>
                            </div>`;
                        }).join('') : `
                            <div class="col-span-full space-y-4">
                                ${state.verseSearchResults.length > 0 ? state.verseSearchResults.map(res => `
                                    <div data-surah="${res.surah.number}" data-ayah="${res.numberInSurah}" class="verse-search-result p-4 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-theme-500/30 transition-all cursor-pointer group">
                                        <div class="flex justify-between items-start mb-2">
                                            <span class="px-2 py-1 bg-theme-500/10 text-theme-600 dark:text-theme-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">${res.surah.englishName} ${res.surah.number}:${res.numberInSurah}</span>
                                            <p class="font-amiri text-lg text-right text-slate-800 dark:text-slate-200 group-hover:text-theme-600 transition-colors">${res.text}</p>
                                        </div>
                                        <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">${res.translation || ''}</p>
                                    </div>
                                `).join('') : `
                                    <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                                        ${SearchIcon({className: "w-12 h-12 mb-4 opacity-20"})}
                                        <p class="font-medium">${state.verseSearchQuery ? t('noVersesFound') : t('searchVersesPlaceholder')}</p>
                                    </div>
                                `}
                            </div>
                        `}
                </div>
            </div>`;
        
        contentArea.querySelector('#reader-list-back')?.addEventListener('click', () => {
            if (props.onBack) props.onBack();
        });

        contentArea.querySelectorAll('.list-tab-btn').forEach(btn => {
            btn.onclick = () => {
                state.listTab = btn.dataset.tab;
                renderListView();
            };
        });

        contentArea.querySelector('#surah-search')?.addEventListener('input', (e) => {
            const searchVal = e.target.value.toLowerCase();
            if (state.listTab === 'surah') {
                state.searchQuery = e.target.value;
                contentArea.querySelectorAll('.surah-card').forEach(card => {
                    const s = state.surahs.find(x => x.number == card.dataset.num);
                    const matches = s.englishName.toLowerCase().includes(searchVal) || s.name.includes(searchVal) || card.dataset.num.includes(searchVal);
                    card.style.display = matches ? 'block' : 'none';
                });
            } else if (state.listTab === 'juz') {
                state.searchQuery = e.target.value;
                contentArea.querySelectorAll('.juz-card').forEach(card => {
                    const matches = card.innerText.toLowerCase().includes(searchVal);
                    card.style.display = matches ? 'block' : 'none';
                });
            } else {
                state.verseSearchQuery = e.target.value;
                // Debounce verse search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => searchVerses(state.verseSearchQuery), 600);
            }
        });

        // Removed continue-reading-card event listener as per user request

        contentArea.querySelectorAll('.verse-search-result').forEach(c => c.addEventListener('click', () => {
            fetchPage(parseInt(c.dataset.surah), parseInt(c.dataset.ayah));
        }));

        contentArea.querySelectorAll('.surah-card').forEach(c => c.addEventListener('click', () => fetchPage(parseInt(c.dataset.num))));
        contentArea.querySelectorAll('.juz-card').forEach(c => c.addEventListener('click', () => {
            const juzNum = parseInt(c.dataset.juz);
            const mapping = JUZ_MAPPING.find(m => m.juz === juzNum);
            fetchPage(mapping.surah, mapping.ayah);
        }));
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
        if (contentArea.dataset.surahId == s.number && contentArea.querySelector('#reader-topbar')) {
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
            <div id="reader-topbar-hover-zone" class="fixed top-0 inset-x-0 h-4 z-[70] pointer-events-auto"></div>
            <div id="reader-topbar" class="fixed top-0 inset-x-0 h-14 md:h-16 glass z-[60] border-b border-white/10 flex items-center px-2 md:px-4 justify-between transition-all duration-500 transform shadow-xl backdrop-blur-2xl">
                <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-theme-500 to-indigo-500 transition-all duration-500 shadow-[0_0_10px_rgba(var(--theme-color-500-rgb),0.5)]" style="width: ${percentageRead}%"></div>
                
                <button id="reader-back" class="p-2 rounded-xl glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-200 flex items-center gap-2 transition-all active:scale-90 border border-white/10 shadow-sm group">
                    ${BackIcon({className: "w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform"})}
                    <span class="hidden sm:inline text-[10px] font-bold uppercase tracking-wider pr-1">${t('back')}</span>
                </button>

                <div class="text-center flex flex-col items-center">
                    <div class="flex items-center gap-3">
                        <h2 class="font-amiri text-xl md:text-2xl font-bold leading-none text-slate-900 dark:text-white drop-shadow-sm">${s.name}</h2>
                        <button id="jump-trigger" class="px-3 py-1 bg-theme-600 text-white rounded-full font-bold shadow-lg shadow-theme-500/20 active:scale-95 hover:shadow-theme-500/40 transition-all text-[9px] uppercase tracking-widest border border-white/10">
                            ${s.number}:${state.activeAyah}
                        </button>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[7px] md:text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-bold">${s.englishName}</span>
                        <span class="w-1 h-1 rounded-full bg-theme-500/40"></span>
                        <span class="text-[7px] md:text-[8px] text-theme-600 dark:text-theme-400 uppercase tracking-[0.2em] font-bold">${t('surah')} ${s.number}</span>
                    </div>
                </div>

                <button id="settings-trigger" class="p-2 rounded-xl glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-200 transition-all active:scale-90 border border-white/10 shadow-sm group">
                    ${SettingsIcon({className: "w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-500"})}
                </button>
            </div>
            
            <div class="pt-14 pb-20 md:pt-16 md:pb-28 w-full mx-auto px-1 ${fontSizeClass} ${fontClass}" id="reader-scroll-container">
                <div class="glass-card rounded-none p-0 shadow-none border-0 transition-all duration-500 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-theme-500/5 to-transparent pointer-events-none"></div>
                    
                    <div class="text-center mb-1 relative z-10">
                        <p class="text-[7px] font-bold text-theme-600/40 dark:text-theme-400/40 uppercase tracking-[0.2em]">
                            ${t('clickAyahForTafsir') || (getCurrentLanguage() === 'ar' ? 'انقر على الآية لعرض التفسير' : 'Click on any verse to view its Tafsir')}
                        </p>
                    </div>

                    <div class="text-center mb-2 md:mb-4 relative z-10">
                         ${(s.number !== 1 && s.number !== 9) ? `
                            <div class="mb-1 md:mb-2">
                                <p class="font-amiri text-xl md:text-3xl text-slate-900 dark:text-white leading-relaxed">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                            </div>
                         ` : ''}
                         <div class="inline-flex items-center gap-1.5 px-3 py-1 glass rounded-full border border-white/5 opacity-80">
                            <span class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">${s.revelationType}</span>
                            <div class="w-1 h-1 rounded-full bg-theme-500/50"></div>
                            <span class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">${s.numberOfAyahs} ${t('ayahs')}</span>
                         </div>
                    </div>

                    <div class="quran-arabic-text select-none text-slate-800 dark:text-slate-100 relative z-10" id="ayah-container">
                        ${state.processing ? '<div class="processing-spinner-wrap flex justify-center py-20">' + createSpinner(t('loading')).innerHTML + '</div>' : ''}
                    </div>
                </div>
            </div>

            <div class="fixed bottom-4 md:bottom-8 inset-x-4 md:inset-x-8 z-[60] pointer-events-none">
                <div id="reader-bottom-nav" class="max-w-[200px] mx-auto flex items-center justify-between glass shadow-[0_15px_40px_rgba(0,0,0,0.3)] rounded-full p-1.5 border border-white/10 pointer-events-auto transition-all duration-500 backdrop-blur-2xl">
                    <button id="reader-prev-surah" class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-slate-400 hover:text-theme-600 hover:bg-white/5 transition-all ${s.number === 1 ? 'opacity-10 cursor-not-allowed' : ''}" ${s.number === 1 ? 'disabled' : ''}>
                        ${SkipBackwardIcon({className: "w-5 h-5"})}
                    </button>
                    
                    <div class="w-px h-6 bg-white/10 mx-1"></div>
                    
                    <button id="reader-next-surah" class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-slate-400 hover:text-theme-600 hover:bg-white/5 transition-all ${s.number === 114 ? 'opacity-10 cursor-not-allowed' : ''}" ${s.number === 114 ? 'disabled' : ''}>
                        ${SkipForwardIcon({className: "w-5 h-5"})}
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
            
        contentArea.querySelector('#reader-topbar-hover-zone').onmouseenter = () => {
            const header = document.getElementById('reader-topbar');
            if (header) header.style.transform = 'translateY(0)';
        };
        
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
                
                // Save last read
                localStorage.setItem('quran_last_read', JSON.stringify({
                    surah: s.number,
                    ayah: currentAyah,
                    surahName: s.englishName,
                    totalAyahs: s.numberOfAyahs
                }));

                const jumpTrigger = contentArea.querySelector('#jump-trigger');
                if (jumpTrigger) {
                    jumpTrigger.innerHTML = `
                        <span class="sm:hidden">${s.number}:${state.activeAyah}</span>
                        <span class="hidden sm:inline">${t('surah')} ${s.number} • ${t('ayah')} ${state.activeAyah}</span>
                    `;
                }
                const progressBar = contentArea.querySelector('#reader-topbar > div:first-child');
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
            modal.className = 'fixed inset-0 z-[110] flex items-end justify-center';
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

                <div class="flex flex-col gap-4">
                    <button id="save-progress-btn" class="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20">
                        ${CheckCircleIcon({className: "w-5 h-5"})}
                        ${t('saveProgress') || 'Save Progress'}
                    </button>
                    <button id="tafsir-ai-btn" class="w-full py-4 rounded-2xl bg-theme-500 text-white font-bold flex items-center justify-center gap-3 hover:bg-theme-600 transition-all active:scale-[0.98] shadow-lg shadow-theme-500/20">
                        ${SparklesIcon({className: "w-5 h-5"})}
                        ${t('askAiAboutVerse') || 'Ask AI about this verse'}
                    </button>
                </div>
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
            window.dispatchEvent(new CustomEvent('ask-ai-tafsir', { 
                detail: { 
                    surahName: state.selectedSurah?.englishName || state.pageData?.englishName || 'Unknown',
                    ayahNum: state.activeTafsirAyah?.ayah || '?',
                    text: currentAyah?.text || ''
                } 
            }));
            setState({ isTafsirModal: false });
        });

        modal.querySelector('#save-progress-btn')?.addEventListener('click', () => {
            const surahNum = state.pageData.number;
            const ayahNum = state.activeTafsirAyah.ayah;
            const surah = state.pageData;
            
            localStorage.setItem('quran_last_read', JSON.stringify({
                surah: surahNum,
                ayah: ayahNum,
                surahName: surah.englishName,
                totalAyahs: surah.numberOfAyahs
            }));
            
            // Show feedback
            const btn = modal.querySelector('#save-progress-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                ${t('saved') || 'Saved'}
            `;
            btn.classList.replace('bg-emerald-600', 'bg-emerald-500');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-500', 'bg-emerald-600');
            }, 2000);
        });
    };

    const JUZ_MAPPING = [
        { juz: 1, surah: 1, ayah: 1 }, { juz: 2, surah: 2, ayah: 142 }, { juz: 3, surah: 2, ayah: 253 },
        { juz: 4, surah: 3, ayah: 93 }, { juz: 5, surah: 4, ayah: 24 }, { juz: 6, surah: 4, ayah: 148 },
        { juz: 7, surah: 5, ayah: 82 }, { juz: 8, surah: 6, ayah: 111 }, { juz: 9, surah: 7, ayah: 88 },
        { juz: 10, surah: 8, ayah: 41 }, { juz: 11, surah: 9, ayah: 93 }, { juz: 12, surah: 11, ayah: 6 },
        { juz: 13, surah: 12, ayah: 53 }, { juz: 14, surah: 15, ayah: 1 }, { juz: 15, surah: 17, ayah: 1 },
        { juz: 16, surah: 18, ayah: 75 }, { juz: 17, surah: 21, ayah: 1 }, { juz: 18, surah: 23, ayah: 1 },
        { juz: 19, surah: 25, ayah: 21 }, { juz: 20, surah: 27, ayah: 56 }, { juz: 21, surah: 29, ayah: 46 },
        { juz: 22, surah: 33, ayah: 31 }, { juz: 23, surah: 36, ayah: 28 }, { juz: 24, surah: 39, ayah: 32 },
        { juz: 25, surah: 41, ayah: 47 }, { juz: 26, surah: 46, ayah: 1 }, { juz: 27, surah: 51, ayah: 31 },
        { juz: 28, surah: 58, ayah: 1 }, { juz: 29, surah: 67, ayah: 1 }, { juz: 30, surah: 78, ayah: 1 }
    ];

    const HIZB_MAPPING = [
        { hizb: 1, surah: 1, ayah: 1 }, { hizb: 2, surah: 2, ayah: 75 }, { hizb: 3, surah: 2, ayah: 142 }, { hizb: 4, surah: 2, ayah: 203 },
        { hizb: 5, surah: 2, ayah: 253 }, { hizb: 6, surah: 3, ayah: 15 }, { hizb: 7, surah: 3, ayah: 93 }, { hizb: 8, surah: 3, ayah: 171 },
        { hizb: 9, surah: 4, ayah: 24 }, { hizb: 10, surah: 4, ayah: 88 }, { hizb: 11, surah: 4, ayah: 148 }, { hizb: 12, surah: 5, ayah: 27 },
        { hizb: 13, surah: 5, ayah: 82 }, { hizb: 14, surah: 6, ayah: 36 }, { hizb: 15, surah: 6, ayah: 111 }, { hizb: 16, surah: 7, ayah: 1 },
        { hizb: 17, surah: 7, ayah: 88 }, { hizb: 18, surah: 7, ayah: 171 }, { hizb: 19, surah: 8, ayah: 41 }, { hizb: 20, surah: 9, ayah: 34 },
        { hizb: 21, surah: 9, ayah: 93 }, { hizb: 22, surah: 10, ayah: 26 }, { hizb: 23, surah: 11, ayah: 6 }, { hizb: 24, surah: 11, ayah: 84 },
        { hizb: 25, surah: 12, ayah: 53 }, { hizb: 26, surah: 13, ayah: 19 }, { hizb: 27, surah: 15, ayah: 1 }, { hizb: 28, surah: 16, ayah: 51 },
        { hizb: 29, surah: 17, ayah: 1 }, { hizb: 30, surah: 17, ayah: 105 }, { hizb: 31, surah: 18, ayah: 75 }, { hizb: 32, surah: 20, ayah: 1 },
        { hizb: 33, surah: 21, ayah: 1 }, { hizb: 34, surah: 22, ayah: 38 }, { hizb: 35, surah: 23, ayah: 1 }, { hizb: 36, surah: 24, ayah: 21 },
        { hizb: 37, surah: 25, ayah: 21 }, { hizb: 38, surah: 27, ayah: 1 }, { hizb: 39, surah: 27, ayah: 56 }, { hizb: 40, surah: 28, ayah: 51 },
        { hizb: 41, surah: 29, ayah: 46 }, { hizb: 42, surah: 31, ayah: 22 }, { hizb: 43, surah: 33, ayah: 31 }, { hizb: 44, surah: 35, ayah: 1 },
        { hizb: 45, surah: 36, ayah: 28 }, { hizb: 46, surah: 37, ayah: 145 }, { hizb: 47, surah: 39, ayah: 32 }, { hizb: 48, surah: 40, ayah: 41 },
        { hizb: 49, surah: 41, ayah: 47 }, { hizb: 50, surah: 43, ayah: 24 }, { hizb: 51, surah: 46, ayah: 1 }, { hizb: 52, surah: 48, ayah: 18 },
        { hizb: 53, surah: 51, ayah: 31 }, { hizb: 54, surah: 54, ayah: 9 }, { hizb: 55, surah: 58, ayah: 1 }, { hizb: 56, surah: 62, ayah: 10 },
        { hizb: 57, surah: 67, ayah: 1 }, { hizb: 58, surah: 72, ayah: 1 }, { hizb: 59, surah: 78, ayah: 1 }, { hizb: 60, surah: 87, ayah: 1 }
    ];

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
            <div class="glass rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-sm p-6 md:p-8 fade-in border border-white/20 relative z-10 overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-theme-500/10 to-transparent pointer-events-none"></div>
                
                <div class="flex justify-between items-center mb-6 relative z-10">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">${t('jumpTo')}</h3>
                    <button id="close-jump-modal" class="w-8 h-8 flex items-center justify-center rounded-full glass border border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90">
                        ${CloseIcon({className: "w-4 h-4"})}
                    </button>
                </div>

                <div class="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl mb-6 relative z-10">
                    <button data-tab="surah" class="jump-tab-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${state.jumpTab === 'surah' ? 'bg-white dark:bg-slate-800 text-theme-600 shadow-sm' : 'text-slate-500'}">${t('surah')}</button>
                    <button data-tab="juz" class="jump-tab-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${state.jumpTab === 'juz' ? 'bg-white dark:bg-slate-800 text-theme-600 shadow-sm' : 'text-slate-500'}">${t('juz')}</button>
                    <button data-tab="hizb" class="jump-tab-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${state.jumpTab === 'hizb' ? 'bg-white dark:bg-slate-800 text-theme-600 shadow-sm' : 'text-slate-500'}">${t('hizb')}</button>
                </div>

                <div class="space-y-6 relative z-10">
                    ${state.jumpTab === 'surah' ? `
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('selectSurah')}</label>
                                <div class="relative">
                                    <select id="jump-surah-select" class="w-full p-4 bg-white/5 dark:bg-slate-900/50 rounded-xl border border-white/10 outline-none text-slate-900 dark:text-white focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all appearance-none font-medium text-sm">
                                        ${state.surahs.map(s => `<option value="${s.number}" ${s.number === currentSurahNum ? 'selected' : ''} class="bg-slate-900">${s.number}. ${s.englishName}</option>`).join('')}
                                    </select>
                                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('ayahNumber')}</label>
                                <input id="jump-ayah-input" type="number" min="1" value="${currentAyahNum}" class="w-full p-4 bg-white/5 dark:bg-slate-900/50 rounded-xl border border-white/10 outline-none text-slate-900 dark:text-white focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all font-medium text-sm">
                            </div>
                        </div>
                    ` : state.jumpTab === 'juz' ? `
                        <div class="space-y-2">
                            <label class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('selectJuz')}</label>
                            <div class="relative">
                                <select id="jump-juz-select" class="w-full p-4 bg-white/5 dark:bg-slate-900/50 rounded-xl border border-white/10 outline-none text-slate-900 dark:text-white focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all appearance-none font-medium text-sm">
                                    ${Array.from({length: 30}, (_, i) => i + 1).map(j => `<option value="${j}" class="bg-slate-900">${t('juz')} ${j}</option>`).join('')}
                                </select>
                                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="space-y-2">
                            <label class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">${t('selectHizb')}</label>
                            <div class="relative">
                                <select id="jump-hizb-select" class="w-full p-4 bg-white/5 dark:bg-slate-900/50 rounded-xl border border-white/10 outline-none text-slate-900 dark:text-white focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500/50 transition-all appearance-none font-medium text-sm">
                                    ${Array.from({length: 60}, (_, i) => i + 1).map(h => `<option value="${h}" class="bg-slate-900">${t('hizb')} ${h}</option>`).join('')}
                                </select>
                                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    `}

                    <button id="jump-confirm-btn" class="w-full py-4 bg-gradient-to-r from-theme-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-theme-500/20 hover:shadow-theme-500/40 active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px] border border-white/10">
                        ${t('goTo')}
                    </button>
                </div>
            </div>`;

        modal.querySelectorAll('.jump-tab-btn').forEach(btn => {
            btn.onclick = () => {
                setState({ jumpTab: btn.dataset.tab });
                renderJumpToModal();
            };
        });

        const surahSelect = modal.querySelector('#jump-surah-select');
        const ayahInput = modal.querySelector('#jump-ayah-input');
        const juzSelect = modal.querySelector('#jump-juz-select');
        const hizbSelect = modal.querySelector('#jump-hizb-select');

        if (surahSelect && ayahInput) {
            const updateMax = () => {
                const s = state.surahs.find(x => x.number == surahSelect.value);
                if (s) ayahInput.max = s.numberOfAyahs;
            };
            surahSelect.onchange = updateMax;
            updateMax();
        }

        modal.querySelector('#close-jump-modal').onclick = () => setState({ isJumpModal: false });
        modal.querySelector('#jump-confirm-btn').onclick = () => {
            let s, a;
            if (state.jumpTab === 'surah') {
                s = parseInt(surahSelect.value);
                a = parseInt(ayahInput.value);
            } else if (state.jumpTab === 'juz') {
                const juzNum = parseInt(juzSelect.value);
                const mapping = JUZ_MAPPING.find(m => m.juz === juzNum);
                s = mapping.surah;
                a = mapping.ayah;
            } else {
                const hizbNum = parseInt(hizbSelect.value);
                const mapping = HIZB_MAPPING.find(m => m.hizb === hizbNum);
                s = mapping.surah;
                a = mapping.ayah;
            }
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
        const header = document.getElementById('reader-topbar');
        const btt = document.getElementById('back-to-top');
        if (!header) return;
        
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Header logic: hide on scroll down, show on scroll up
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