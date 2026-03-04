import { renderErrorState } from './UI.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { ArrowLeftIcon, ArrowRightIcon, ShareIcon, BookOpenIcon } from './Icons.js';

const COLLECTIONS = [
  { slug: 'bukhari', name_en: 'Sahih al-Bukhari', name_ar: 'صحيح البخاري', desc_en: 'Compiled by Imam al-Bukhari', desc_ar: 'جمعه الإمام البخاري' },
  { slug: 'muslim', name_en: 'Sahih Muslim', name_ar: 'صحيح مسلم', desc_en: 'Compiled by Imam Muslim', desc_ar: 'جمعه الإمام مسلم' },
  { slug: 'nasai', name_en: 'Sunan an-Nasa\'i', name_ar: 'سنن النسائي', desc_en: 'Compiled by Imam an-Nasa\'i', desc_ar: 'جمعه الإمام النسائي' },
  { slug: 'abudawud', name_en: 'Sunan Abi Dawud', name_ar: 'سنن أبي داود', desc_en: 'Compiled by Imam Abu Dawud', desc_ar: 'جمعه الإمام أبو داود' },
  { slug: 'tirmidhi', name_en: 'Jami at-Tirmidhi', name_ar: 'جامع الترمذي', desc_en: 'Compiled by Imam at-Tirmidhi', desc_ar: 'جمعه الإمام الترمذي' },
  { slug: 'ibnmajah', name_en: 'Sunan Ibn Majah', name_ar: 'سنن ابن ماجه', desc_en: 'Compiled by Imam Ibn Majah', desc_ar: 'جمعه الإمام ابن ماجه' },
  { slug: 'malik', name_en: 'Muwatta Malik', name_ar: 'موطأ مالك', desc_en: 'Compiled by Imam Malik', desc_ar: 'جمعه الإمام مالك' },
  { slug: 'nawawi', name_en: '40 Hadith Nawawi', name_ar: 'الأربعون النووية', desc_en: 'Compiled by Imam an-Nawawi', desc_ar: 'جمعه الإمام النووي' },
  { slug: 'qudsi', name_en: 'Hadith Qudsi', name_ar: 'الأحاديث القدسية', desc_en: 'Sacred Hadiths', desc_ar: 'أحاديث قدسية' },
];

export const renderHadithViewer = (container, props = {}) => {
  const isRtl = getCurrentLanguage() === 'ar';
  const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

  let state = {
    view: 'collections', // 'collections', 'sections', or 'hadiths'
    selectedCollection: null,
    selectedSection: null,
    sections: [],
    allHadiths: [],
    hadiths: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true
  };

  const render = () => {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-6 fade-in';

    if (state.view === 'collections') {
      renderCollectionsView(wrapper);
    } else if (state.view === 'sections') {
      renderSectionsView(wrapper);
    } else {
      renderHadithsView(wrapper);
    }

    container.appendChild(wrapper);
  };

  const renderCollectionsView = (wrapper) => {
    const lang = getCurrentLanguage();
    
    wrapper.innerHTML = `
      <div class="flex items-center gap-3 mb-8">
        <button id="hadith-main-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1">
          ${BackIcon({className: "w-6 h-6"})}
          <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
        </button>
        <div>
          <h2 class="text-2xl md:text-3xl font-bold font-display text-ink dark:text-cream tracking-tight">${t('hadithCollection')}</h2>
          <p class="text-sm text-ink/60 dark:text-cream/60 mt-1">${t('selectCollection') || 'Select a collection to read'}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${COLLECTIONS.map(col => `
          <button data-collection="${col.slug}" class="group text-left ${isRtl ? 'text-right' : ''} p-6 bg-white dark:bg-slate-800 rounded-2xl border border-line dark:border-line-dark shadow-sm hover:shadow-md hover:border-theme-500/50 transition-all flex flex-col gap-4 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-theme-50 dark:bg-theme-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="w-12 h-12 rounded-xl bg-theme-50 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400 flex items-center justify-center relative z-10">
              ${BookOpenIcon({className: "w-6 h-6"})}
            </div>
            <div class="relative z-10">
              <h3 class="text-lg font-bold text-ink dark:text-cream font-display">${lang === 'ar' ? col.name_ar : col.name_en}</h3>
              <p class="text-sm text-ink/60 dark:text-cream/60 mt-1">${lang === 'ar' ? col.desc_ar : col.desc_en}</p>
            </div>
          </button>
        `).join('')}
      </div>
    `;

    wrapper.querySelector('#hadith-main-back-btn')?.addEventListener('click', () => {
      if (props.onBack) props.onBack();
    });

    wrapper.querySelectorAll('[data-collection]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedCollection = COLLECTIONS.find(c => c.slug === btn.dataset.collection);
        state.view = 'sections';
        state.sections = [];
        state.allHadiths = [];
        state.hadiths = [];
        state.page = 1;
        state.hasMore = true;
        render();
        fetchCollectionData();
      });
    });
  };

  const renderSectionsView = (wrapper) => {
    const lang = getCurrentLanguage();
    
    wrapper.innerHTML = `
      <div class="flex items-center gap-3 mb-8">
        <button id="sections-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1">
          ${BackIcon({className: "w-6 h-6"})}
          <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
        </button>
        <div>
          <h2 class="text-2xl md:text-3xl font-bold font-display text-ink dark:text-cream tracking-tight">${lang === 'ar' ? state.selectedCollection.name_ar : state.selectedCollection.name_en}</h2>
          <p class="text-sm text-ink/60 dark:text-cream/60 mt-1">${t('selectSection') || 'Select a section'}</p>
        </div>
      </div>
      
      <div id="sections-list" class="grid grid-cols-1 gap-3">
        ${state.loading ? `
          ${Array(6).fill(0).map(() => `
            <div class="h-16 bg-white dark:bg-slate-800 rounded-xl border border-line animate-pulse"></div>
          `).join('')}
        ` : state.error ? `
          <div class="col-span-full">${renderErrorState(state.error, () => fetchCollectionData())}</div>
        ` : state.sections.map(sec => `
          <button data-section="${sec.id}" class="group text-left ${isRtl ? 'text-right' : ''} p-4 bg-white dark:bg-slate-800 rounded-xl border border-line dark:border-line-dark shadow-sm hover:shadow-md hover:border-theme-500 transition-all flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-lg bg-theme-50 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400 flex items-center justify-center text-xs font-bold">
                    ${sec.id}
                </div>
                <span class="text-sm font-bold text-ink dark:text-cream group-hover:text-theme-600 transition-colors">${sec.title || t('section') + ' ' + sec.id}</span>
            </div>
            <div class="text-[10px] font-bold text-ink/40 dark:text-cream/40 uppercase tracking-widest">
                ${sec.hadithCount} ${t('hadiths') || 'Hadiths'}
            </div>
          </button>
        `).join('')}
      </div>
    `;

    wrapper.querySelector('#sections-back-btn')?.addEventListener('click', () => {
      state.view = 'collections';
      render();
    });

    wrapper.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const secId = btn.dataset.section;
        state.selectedSection = state.sections.find(s => s.id === secId);
        state.view = 'hadiths';
        state.hadiths = [];
        state.page = 1;
        state.hasMore = true;
        render();
        paginateHadiths(false);
      });
    });
  };

  const renderHadithsView = (wrapper) => {
    const lang = getCurrentLanguage();
    
    wrapper.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky top-16 md:top-20 z-30 bg-parchment/90 dark:bg-night/90 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div class="flex items-center gap-3">
          <button id="hadith-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1">
            ${BackIcon({className: "w-6 h-6"})}
            <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
          </button>
          <div>
            <h2 class="text-xl md:text-2xl font-bold font-display text-ink dark:text-cream">${state.selectedSection?.title || (lang === 'ar' ? state.selectedCollection.name_ar : state.selectedCollection.name_en)}</h2>
          </div>
        </div>
      </div>
      
      <div id="hadith-list-container" class="space-y-6"></div>
      <div id="load-more-container" class="flex justify-center py-8"></div>
    `;

    wrapper.querySelector('#hadith-back-btn')?.addEventListener('click', () => {
      state.view = 'sections';
      render();
    });

    updateHadithsList(wrapper);
  };

  const updateHadithsList = (wrapper) => {
    const listContainer = wrapper.querySelector('#hadith-list-container');
    const loadMoreContainer = wrapper.querySelector('#load-more-container');

    if (!listContainer) return;

    if (state.loading && state.page === 1) {
      listContainer.innerHTML = Array(3).fill(0).map(() => `
        <div class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-line dark:border-line-dark shadow-sm animate-pulse">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
            <div class="space-y-3">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
            </div>
        </div>
      `).join('');
      loadMoreContainer.innerHTML = '';
    } else {
      if (state.page === 1) listContainer.innerHTML = '';
      
      const startIndex = (state.page - 1) * 10;
      const newHadiths = state.hadiths.slice(startIndex);
      
      newHadiths.forEach(hadith => {
          listContainer.appendChild(createHadithCard(hadith));
      });

      if (state.hasMore && state.hadiths.length > 0) {
        loadMoreContainer.innerHTML = `
          <button id="load-more-btn" class="px-6 py-3 bg-white dark:bg-slate-800 text-theme-600 dark:text-theme-400 text-sm font-bold rounded-xl border border-line dark:border-line-dark hover:border-theme-500 transition-all shadow-sm flex items-center gap-2">
            ${t('loadMore')}
          </button>
        `;
        loadMoreContainer.querySelector('#load-more-btn')?.addEventListener('click', () => paginateHadiths(true));
      } else {
        loadMoreContainer.innerHTML = '';
      }
    }
  };

  const createHadithCard = (hadith) => {
    const card = document.createElement('div');
    card.className = 'p-6 md:p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-theme-500/30 transition-all duration-300 relative group overflow-hidden z-0';
    
    const lang = getCurrentLanguage();
    const isAr = lang === 'ar';
    const isId = lang === 'id';
    
    const textDir = isAr ? 'rtl' : 'ltr';
    const textAlign = isAr ? 'text-right' : 'text-left';
    
    let hadithText = '';
    let arabicText = hadith.arab || '';
    
    if (isAr) {
        hadithText = arabicText || hadith.text || '';
    } else {
        // For non-Arabic languages, show translation
        hadithText = hadith.text || '';
        
        // If still no translation found for non-Arabic, show Arabic as fallback
        if (!hadithText) {
            hadithText = arabicText;
        }
    }

    const hadithNumber = hadith.hadithNumber || hadith.hadithnumber || hadith.number || '';

    // Clean up HTML tags if any
    hadithText = hadithText.replace(/<[^>]*>?/gm, '');

    card.innerHTML = `
        <div class="absolute top-0 right-0 w-32 h-32 bg-theme-50 dark:bg-theme-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
        <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-theme-50 dark:bg-theme-900/30 flex items-center justify-center text-theme-600 dark:text-theme-400 font-bold font-display shadow-inner">
                    ${hadithNumber}
                </div>
                <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white capitalize">${state.selectedCollection.slug.replace('-', ' ')}</h4>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${t('hadith')} ${hadithNumber}</p>
                </div>
            </div>
            <button class="share-btn p-2.5 rounded-xl hover:bg-theme-50 dark:hover:bg-theme-900/30 text-slate-400 hover:text-theme-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                ${ShareIcon({className: "w-5 h-5"})}
            </button>
        </div>
        <div class="relative">
            <span class="absolute -top-4 -left-2 text-6xl text-slate-100 dark:text-slate-800 font-serif opacity-50 select-none">"</span>
            <p class="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-serif ${textAlign} relative z-10" dir="${textDir}">
                ${hadithText}
            </p>
        </div>
    `;

    card.querySelector('.share-btn')?.addEventListener('click', () => {
        const textToShare = `${hadithText}\n\n[${state.selectedCollection.slug} - ${hadithNumber}]\n${t('appName')}`;
        if (navigator.share) {
            navigator.share({
                title: t('hadith'),
                text: textToShare,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(textToShare);
            alert(t('copySuccess'));
        }
    });

    return card;
  };

  const fetchCollectionData = async () => {
    if (state.loading) return;
    state.loading = true;
    state.error = null;
    render();

    try {
      const lang = getCurrentLanguage();
      const book = state.selectedCollection.slug;
      const langMap = { 'en': 'eng', 'ar': 'ara', 'id': 'ind', 'fr': 'fra', 'ur': 'urd', 'tr': 'tur' };
      const langCode = langMap[lang] || 'eng';
      
      const edition = `${langCode}-${book}`;
      const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}.json`;
      const arabicUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}.json`;

      const [res, araRes] = await Promise.all([
          fetch(url),
          langCode !== 'ara' ? fetch(arabicUrl) : Promise.resolve(null)
      ]);

      if (!res.ok) throw new Error(`Failed to fetch Hadiths: ${res.status}`);
      
      const data = await res.json();
      const araData = araRes && araRes.ok ? await araRes.json() : null;
      
      let allHadiths = data.hadiths || [];
      
      if (araData && araData.hadiths) {
          allHadiths = allHadiths.map((h, i) => ({
              ...h,
              arab: araData.hadiths[i]?.text || '',
              hadithNumber: h.hadithnumber || h.number || (i + 1)
          }));
      } else {
          allHadiths = allHadiths.map((h, i) => ({
              ...h,
              hadithNumber: h.hadithnumber || h.number || (i + 1)
          }));
      }

      state.allHadiths = allHadiths;
      
      // Extract sections from metadata
      const sections = [];
      const metadata = data.metadata || {};
      const sectionNames = metadata.sections || {};
      const sectionDetails = metadata.section_details || {};
      
      Object.keys(sectionNames).forEach(id => {
          if (id === '0' && !sectionNames[id]) return; // Skip empty section 0
          const details = sectionDetails[id] || {};
          sections.push({
              id,
              title: sectionNames[id],
              first: details.hadithnumber_first || details.hadithnumber_last || 0,
              last: details.hadithnumber_last || 0,
              hadithCount: (details.hadithnumber_last - details.hadithnumber_first + 1) || 0
          });
      });

      // If no sections found, create a default one
      if (sections.length === 0) {
          sections.push({
              id: '1',
              title: lang === 'ar' ? 'الكل' : 'All',
              first: 1,
              last: allHadiths.length,
              hadithCount: allHadiths.length
          });
      }

      state.sections = sections;
      
      // If only one section, skip to hadiths
      if (sections.length === 1) {
          state.selectedSection = sections[0];
          state.view = 'hadiths';
          paginateHadiths(false);
      }

    } catch (err) {
      console.error('Error fetching collection data:', err);
      state.error = err.message;
    } finally {
      state.loading = false;
      render();
    }
  };

  const paginateHadiths = (append = false) => {
    if (append) state.page += 1;
    
    const limit = 10;
    const section = state.selectedSection;
    
    // Filter hadiths by section range
    const sectionHadiths = state.allHadiths.filter(h => {
        const num = h.hadithNumber;
        return num >= section.first && num <= section.last;
    });

    const start = (state.page - 1) * limit;
    const end = start + limit;
    const newPageHadiths = sectionHadiths.slice(start, end);
    
    if (append) {
        state.hadiths = [...state.hadiths, ...newPageHadiths];
    } else {
        state.hadiths = newPageHadiths;
    }
    
    state.hasMore = end < sectionHadiths.length;
    
    const wrapper = container.querySelector('.space-y-6');
    if (wrapper && state.view === 'hadiths') updateHadithsList(wrapper);
  };

  render();
};
