import { renderErrorState } from './UI.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { ArrowLeftIcon, ArrowRightIcon, ShareIcon } from './Icons.js';

const COLLECTIONS = [
  { slug: 'bukhari', name_en: 'Sahih al-Bukhari', name_ar: 'صحيح البخاري' },
  { slug: 'muslim', name_en: 'Sahih Muslim', name_ar: 'صحيح مسلم' },
  { slug: 'nasai', name_en: 'Sunan an-Nasa\'i', name_ar: 'سنن النسائي' },
  { slug: 'abu-daud', name_en: 'Sunan Abi Dawud', name_ar: 'سنن أبي داود' },
  { slug: 'tirmidhi', name_en: 'Jami` at-Tirmidhi', name_ar: 'جامع الترمذي' },
  { slug: 'ibn-majah', name_en: 'Sunan Ibn Majah', name_ar: 'سنن ابن ماجه' },
  { slug: 'ahmad', name_en: 'Musnad Ahmad', name_ar: 'مسند أحمد' },
  { slug: 'darimi', name_en: 'Sunan ad-Darimi', name_ar: 'سنن الدارمي' },
  { slug: 'malik', name_en: 'Muwatta Malik', name_ar: 'موطأ مالك' },
];

export const renderHadithViewer = (container, props = {}) => {
  const isRtl = getCurrentLanguage() === 'ar';
  const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

  let state = {
    hadiths: [],
    loading: true,
    error: null,
    selectedCollection: localStorage.getItem('selectedHadithCollection') || 'bukhari',
    page: 1,
    hasMore: true
  };

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <button id="hadith-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1">
            ${BackIcon({className: "w-6 h-6"})}
            <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
          </button>
          <h2 class="text-xl md:text-2xl font-bold font-display text-ink dark:text-cream">${t('hadithCollection')}</h2>
        </div>
      </div>
      <div class="space-y-2">
        <label for="collection-select" class="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 dark:text-cream/40 px-1">${t('selectCollection')}</label>
        <div class="flex flex-col sm:flex-row gap-3 items-stretch">
          <div class="relative flex-grow">
            <select id="collection-select" class="appearance-none w-full pl-4 pr-10 py-3 text-sm font-bold border border-line dark:border-line-dark bg-white dark:bg-slate-800 text-ink dark:text-cream rounded-xl shadow-sm focus:ring-2 focus:ring-theme-500 focus:border-theme-500 cursor-pointer transition-all hover:border-theme-500"></select>
            <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-ink/40 dark:text-cream/40">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button id="refresh-hadith-btn" class="px-6 py-3 bg-theme-600 text-white text-sm font-bold rounded-xl hover:bg-theme-700 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
            ${t('showAnotherHadith')}
          </button>
        </div>
      </div>
      <div id="hadith-list-container" class="space-y-6 mt-6"></div>
      <div id="load-more-container" class="flex justify-center py-8"></div>
    </div>
  `;

  const listContainer = container.querySelector('#hadith-list-container');
  const loadMoreContainer = container.querySelector('#load-more-container');
  const refreshBtn = container.querySelector('#refresh-hadith-btn');
  const collectionSelect = container.querySelector('#collection-select');

  const renderContent = (append = false) => {
    if (refreshBtn) {
        refreshBtn.disabled = state.loading;
        refreshBtn.classList.toggle('opacity-50', state.loading);
    }

    if (!append) {
        listContainer.innerHTML = '';
    }

    if (state.loading && !append) {
      renderSkeletons();
    } else if (state.error && !append) {
      listContainer.appendChild(renderErrorState(state.error, () => fetchHadiths(false)));
    } else {
      state.hadiths.forEach((hadith, index) => {
          if (append && index < (state.page - 1) * 10) return;
          const card = createHadithCard(hadith);
          listContainer.appendChild(card);
      });
      renderLoadMore();
    }
  };
  
  const renderCollectionSelect = () => {
    const lang = getCurrentLanguage();
    collectionSelect.innerHTML = COLLECTIONS.map(col => 
        `<option value="${col.slug}" ${state.selectedCollection === col.slug ? 'selected' : ''}>
            ${lang === 'ar' ? col.name_ar : col.name_en}
        </option>`
    ).join('');
  };

  const renderSkeletons = () => {
    listContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="p-6 rounded-lg bg-parchment dark:bg-night animate-pulse border border-line dark:border-line-dark">
        <div class="h-4 bg-line dark:bg-line-dark rounded w-1/4 mb-6"></div>
        <div class="space-y-3 mb-8">
            <div class="h-5 bg-line dark:bg-line-dark rounded w-full"></div>
            <div class="h-5 bg-line dark:bg-line-dark rounded w-5/6"></div>
        </div>
        <div class="h-4 bg-line dark:bg-line-dark rounded w-1/3"></div>
      </div>
    `).join('');
  };

  const createHadithCard = (hadith) => {
      const div = document.createElement('div');
      div.className = "p-6 rounded-xl bg-parchment dark:bg-night border border-line dark:border-line-dark fade-in shadow-sm hover:shadow-md transition-shadow";
      
      const { id, ar, translation, book } = hadith;
      const collection = COLLECTIONS.find(c => c.slug === state.selectedCollection);
      const bookName = getCurrentLanguage() === 'ar' ? collection.name_ar : collection.name_en;

      div.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-bold text-theme-600 dark:text-theme-400 bg-theme-100 dark:bg-theme-900/30 px-2 py-1 rounded uppercase tracking-wider">
                ${bookName} #${id}
            </span>
            <button class="share-btn p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-ink/60 dark:text-cream/60" title="${t('share')}">
                ${ShareIcon({className: 'w-4 h-4'})}
            </button>
          </div>
          
          <div class="space-y-6">
            <p dir="rtl" class="text-right quran-arabic-text leading-loose text-ink dark:text-cream text-xl md:text-2xl">${ar}</p>
            ${getCurrentLanguage() !== 'ar' ? `
              <hr class="border-line dark:border-line-dark opacity-50" />
              <p class="text-ink/90 dark:text-cream/90 leading-relaxed text-left body-text italic" dir="ltr">${translation}</p>
            ` : ''}
          </div>

          <div class="mt-6 pt-4 border-t border-line dark:border-line-dark flex justify-between items-center">
             <p class="text-[10px] text-ink/40 dark:text-cream/40 uppercase tracking-widest" dir="ltr">
               ${t('reference', {id: `${state.selectedCollection.toUpperCase()} ${id}`})}
             </p>
          </div>
      `;
      
      div.querySelector('.share-btn').addEventListener('click', () => handleShare(hadith));
      return div;
  };

  const renderLoadMore = () => {
      if (!state.hasMore) {
          loadMoreContainer.innerHTML = '';
          return;
      }
      
      loadMoreContainer.innerHTML = `
          <button id="load-more-btn" class="px-8 py-3 bg-white dark:bg-night border border-line dark:border-line-dark text-ink dark:text-cream rounded-full hover:bg-theme-50 dark:hover:bg-theme-900/20 transition-all font-bold text-sm shadow-sm flex items-center gap-2">
            ${state.loading ? '<svg class="animate-spin h-4 w-4 text-theme-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>' : ''}
            ${state.loading ? t('loading') : t('viewAll')}
          </button>
      `;
      
      loadMoreContainer.querySelector('#load-more-btn')?.addEventListener('click', () => {
          if (!state.loading) {
              state.page++;
              fetchHadiths(true);
          }
      });
  };

  const handleShare = async (hadith) => {
    const collection = COLLECTIONS.find(c => c.slug === state.selectedCollection);
    const bookName = collection.name_en;
    const shareText = `${bookName} #${hadith.id}\n\n${hadith.ar}\n\n${hadith.translation}\n\n${t('reference', {id: hadith.id})}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookName,
          text: shareText,
        });
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      window.showToast?.(t('copySuccess'), 'success');
    });
  };

  const HADITH_CACHE = new Map();

  const fetchHadiths = async (append = false) => {
    state.loading = true;
    state.error = null;
    renderContent(append);
    
    try {
      const lang = getCurrentLanguage();
      const collectionSlug = state.selectedCollection; // e.g., 'bukhari', 'muslim'
      
      // Map our slugs to the API's collection names if they differ
      const apiCollectionMap = {
        'bukhari': 'bukhari',
        'muslim': 'muslim',
        'nasai': 'nasai',
        'abu-daud': 'abudawud',
        'tirmidhi': 'tirmidhi',
        'ibn-majah': 'ibnmajah',
        'ahmad': 'ahmad',
        'darimi': 'darimi',
        'malik': 'malik'
      };
      
      const apiCollection = apiCollectionMap[collectionSlug] || collectionSlug;
      
      const editionMap = {
        'ar': `ara-${apiCollection}`,
        'en': `eng-${apiCollection}`,
        'id': `ind-${apiCollection}`,
        'tr': `tur-${apiCollection}`
      };
      
      const targetEdition = editionMap[lang] || `eng-${apiCollection}`;
      const arabicEdition = `ara-${apiCollection}`;
      
      const cacheKey = `${targetEdition}-${arabicEdition}`;
      
      let dataTarget, dataAr;
      
      if (HADITH_CACHE.has(cacheKey)) {
        const cached = HADITH_CACHE.get(cacheKey);
        dataTarget = cached.target;
        dataAr = cached.arabic;
      } else {
        const [resTarget, resAr] = await Promise.all([
          fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${targetEdition}.min.json`),
          lang !== 'ar' ? fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${arabicEdition}.min.json`) : Promise.resolve(null)
        ]);

        if (!resTarget.ok) throw new Error(t('fetchHadithError'));
        
        dataTarget = await resTarget.json();
        dataAr = resAr ? await resAr.json() : dataTarget;
        
        HADITH_CACHE.set(cacheKey, { target: dataTarget, arabic: dataAr });
      }

      const allHadiths = dataTarget.hadiths;
      const allArHadiths = dataAr.hadiths;

      // Pagination
      const start = (state.page - 1) * 10;
      const end = state.page * 10;
      const batch = allHadiths.slice(start, end);
      
      const newHadiths = batch.map((h, i) => ({
          id: h.hadithnumber || (start + i + 1),
          ar: allArHadiths[start + i]?.text || '',
          translation: h.text || '',
          book: dataTarget.metadata.name
      }));

      if (append) {
          state.hadiths = [...state.hadiths, ...newHadiths];
      } else {
          state.hadiths = newHadiths;
      }
      
      state.hasMore = end < allHadiths.length;

    } catch (err) {
      console.error("Hadith Fetch Error:", err);
      state.error = err instanceof Error ? err.message : t('unknownError');
    } finally {
      state.loading = false;
      renderContent(append);
    }
  };

  const handleCollectionChange = (e) => {
    state.selectedCollection = e.target.value;
    state.page = 1;
    state.hadiths = [];
    localStorage.setItem('selectedHadithCollection', state.selectedCollection);
    fetchHadiths();
  };

  // --- Initial setup ---
  container.querySelector('#hadith-back-btn')?.addEventListener('click', () => {
    if (props.onBack) props.onBack();
  });
  refreshBtn.addEventListener('click', () => {
      state.page = 1;
      state.hadiths = [];
      fetchHadiths();
  });
  collectionSelect.addEventListener('change', handleCollectionChange);
  
  const init = () => {
    renderCollectionSelect();
    fetchHadiths();
  };
  
  init();
};
