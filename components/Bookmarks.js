import { t, getCurrentLanguage } from '../i18n.js';
import { QuranIcon, HadithIcon, BookmarkIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon } from './Icons.js';

export const renderBookmarks = (container, props) => {
    const { bookmarks, toggleBookmark, setActiveTab, setReaderMode } = props;
    const lang = getCurrentLanguage();
    const isRtl = lang === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

    let state = {
        activeFilter: 'all' // 'all', 'quran', 'hadith'
    };

    const render = () => {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'max-w-5xl mx-auto px-4 py-8 space-y-8 fade-in';

        const quranCount = bookmarks.quran.length;
        const hadithCount = bookmarks.hadith.length;
        const totalCount = quranCount + hadithCount;

        wrapper.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                <div class="flex items-center gap-5">
                    <button id="bookmarks-back-btn" class="p-3 -ml-2 rounded-2xl glass hover:bg-theme-500 hover:text-white transition-all active:scale-90 flex items-center gap-2 border border-white/10 shadow-lg">
                        ${BackIcon({className: "w-5 h-5"})}
                        <span class="hidden sm:inline text-xs font-bold uppercase tracking-widest">${t('back')}</span>
                    </button>
                    <div>
                        <h1 class="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white tracking-tight">${t('bookmarks') || 'Bookmarks'}</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-2 leading-relaxed">${t('bookmarksDescription') || 'Your saved verses and hadiths'}</p>
                    </div>
                </div>
                
                <div class="flex glass p-1.5 rounded-[2rem] border border-white/10 shadow-2xl">
                    <button data-filter="all" class="filter-btn px-6 py-3 rounded-[1.5rem] text-xs font-bold transition-all ${state.activeFilter === 'all' ? 'bg-gradient-to-br from-theme-600 to-indigo-600 text-white shadow-lg shadow-theme-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('all') || 'All'} (${totalCount})</button>
                    <button data-filter="quran" class="filter-btn px-6 py-3 rounded-[1.5rem] text-xs font-bold transition-all ${state.activeFilter === 'quran' ? 'bg-gradient-to-br from-theme-600 to-indigo-600 text-white shadow-lg shadow-theme-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('quran')} (${quranCount})</button>
                    <button data-filter="hadith" class="filter-btn px-6 py-3 rounded-[1.5rem] text-xs font-bold transition-all ${state.activeFilter === 'hadith' ? 'bg-gradient-to-br from-theme-600 to-indigo-600 text-white shadow-lg shadow-theme-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('hadith')} (${hadithCount})</button>
                </div>
            </div>

            <div id="bookmarks-list" class="space-y-6">
                ${renderList()}
            </div>
        `;

        container.appendChild(wrapper);

        wrapper.querySelector('#bookmarks-back-btn')?.addEventListener('click', () => props.onBack());
        wrapper.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeFilter = btn.dataset.filter;
                render();
            });
        });

        attachItemListeners(wrapper);
    };

    const renderList = () => {
        let items = [];
        if (state.activeFilter === 'all' || state.activeFilter === 'quran') {
            items = [...items, ...bookmarks.quran.map(b => ({ ...b, type: 'quran' }))];
        }
        if (state.activeFilter === 'all' || state.activeFilter === 'hadith') {
            items = [...items, ...bookmarks.hadith.map(b => ({ ...b, type: 'hadith' }))];
        }

        // Sort by date added (assuming we added a timestamp, but for now just reverse)
        items.reverse();

        if (items.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        ${BookmarkIcon({className: "w-10 h-10"})}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('noBookmarks') || 'No bookmarks yet'}</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">${t('noBookmarksDescription') || 'Verses and hadiths you bookmark will appear here'}</p>
                    </div>
                </div>
            `;
        }

        return items.map(item => `
            <div class="group p-8 glass rounded-[2.5rem] border border-white/10 hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-theme-500/5 rounded-bl-[3rem] blur-3xl -z-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl ${item.type === 'quran' ? 'glass text-emerald-600 dark:text-emerald-400' : 'glass text-amber-600 dark:text-amber-400'} flex items-center justify-center border border-white/10 shadow-sm group-hover:scale-110 transition-transform">
                            ${item.type === 'quran' ? QuranIcon({className: "w-6 h-6"}) : HadithIcon({className: "w-6 h-6"})}
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 dark:text-white text-base tracking-tight">${item.title}</h4>
                            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">${item.subtitle}</p>
                        </div>
                    </div>
                    <button data-id="${item.id}" data-type="${item.type}" class="remove-bookmark-btn p-3 rounded-2xl glass border border-white/10 hover:bg-rose-500 hover:text-white text-slate-400 transition-all active:scale-90">
                        ${TrashIcon({className: "w-5 h-5"})}
                    </button>
                </div>
                <div class="relative cursor-pointer bookmark-content" data-id="${item.id}" data-type="${item.type}" data-surah="${item.surahNum}" data-ayah="${item.ayahNum}">
                    <p class="text-xl leading-relaxed text-slate-800 dark:text-slate-200 font-serif ${item.lang === 'ar' ? 'text-right font-amiri' : 'text-left'}" dir="${item.lang === 'ar' ? 'rtl' : 'ltr'}">
                        ${item.text.length > 250 ? item.text.substring(0, 250) + '...' : item.text}
                    </p>
                    <div class="mt-6 flex items-center justify-end text-theme-600 dark:text-theme-400 text-xs font-bold gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <span class="uppercase tracking-widest">${t('viewDetails') || 'View Details'}</span>
                        ${ChevronRightIcon({className: "w-4 h-4"})}
                    </div>
                </div>
            </div>
        `).join('');
    };

    const attachItemListeners = (wrapper) => {
        wrapper.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const type = btn.dataset.type;
                toggleBookmark(type, { id });
                render();
            });
        });

        wrapper.querySelectorAll('.bookmark-content').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                if (type === 'quran') {
                    const surahNum = parseInt(item.dataset.surah);
                    const ayahNum = parseInt(item.dataset.ayah);
                    setReaderMode({ surah: { number: surahNum }, ayah: ayahNum });
                    setActiveTab('quran');
                } else if (type === 'hadith') {
                    // For hadith, we might need more logic to jump to specific one
                    // For now just go to hadith tab
                    setActiveTab('hadith');
                }
            });
        });
    };

    render();
};
