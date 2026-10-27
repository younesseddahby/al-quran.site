
import { t, getCurrentLanguage } from '../i18n.js';
import { SEERAH_CHAPTERS, SEERAH_CONTENT } from '../src/data/seerahData.js';
import { BookOpenIcon, ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon, SearchIcon, ShareIcon, BookmarkIcon } from './Icons.js';

export const renderSeerah = (container, props) => {
    let state = {
        view: 'toc', // 'toc', 'content'
        selectedChapter: localStorage.getItem('last_seerah_chapter') || null,
        searchQuery: '',
        bookmark: props.bookmarks.seerah.length > 0 ? props.bookmarks.seerah[props.bookmarks.seerah.length - 1].id : null,
    };

    const render = () => {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'max-w-4xl mx-auto px-4 py-6 space-y-8 fade-in';

        if (state.view === 'toc') {
            renderTOC(wrapper);
        } else {
            renderContent(wrapper);
        }

        container.appendChild(wrapper);
    };

    const renderTOC = (wrapper) => {
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';

        wrapper.innerHTML = `
            <div class="space-y-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">${t('seerah')}</h2>
                        <p class="text-slate-500 dark:text-slate-400 mt-1">${t('seerahDesc')}</p>
                    </div>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-500 transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input id="seerah-search" type="text" value="${state.searchQuery}" placeholder="${t('searchSeerah')}" class="w-full pl-10 pr-4 py-2.5 glass rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-theme-500/50 focus:border-theme-500 transition-all dark:text-white shadow-sm text-sm">
                    </div>
                </div>

                ${state.bookmark ? `
                    <button id="continue-reading-seerah" class="w-full p-4 bg-theme-500 text-white rounded-2xl shadow-lg flex items-center justify-between group hover:bg-theme-600 transition-all active:scale-[0.98]">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                ${BookOpenIcon({className: "w-6 h-6"})}
                            </div>
                            <div class="text-left ${isRtl ? 'text-right' : ''}">
                                <p class="text-xs font-bold opacity-80 uppercase tracking-wider">${t('continueReadingSeerah')}</p>
                                <p class="text-lg font-bold">${t(SEERAH_CHAPTERS.find(c => c.id === state.bookmark)?.titleKey)}</p>
                            </div>
                        </div>
                        ${ChevronRightIcon({className: `w-6 h-6 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`})}
                    </button>
                ` : ''}

                <div class="divide-y divide-slate-200/70 dark:divide-slate-800">
                    ${SEERAH_CHAPTERS.filter(c => t(c.titleKey).toLowerCase().includes(state.searchQuery.toLowerCase())).map((chapter, index) => `
                        <button data-chapter-id="${chapter.id}" class="py-3 flex items-center justify-between group relative overflow-hidden">
                            
                            <div class="flex items-center gap-5 relative z-10">
                                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm font-display font-bold text-xl">
                                    ${(index + 1).toString().padStart(2, '0')}
                                </div>
                                <span class="font-bold text-lg text-slate-800 dark:text-slate-200 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors text-left rtl:text-right">${t(chapter.titleKey)}</span>
                            </div>
                            <div class="relative z-10 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 flex-shrink-0">
                                ${ChevronRightIcon({className: `w-5 h-5 ${isRtl ? 'rotate-180' : ''}`})}
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        wrapper.querySelector('#seerah-search')?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            render();
        });

        wrapper.querySelector('#continue-reading-seerah')?.addEventListener('click', () => {
            state.selectedChapter = state.bookmark;
            state.view = 'content';
            render();
        });

        wrapper.querySelectorAll('[data-chapter-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedChapter = btn.dataset.chapterId;
                state.view = 'content';
                localStorage.setItem('last_seerah_chapter', state.selectedChapter);
                render();
            });
        });
    };

    const renderContent = (wrapper) => {
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;
        const chapter = SEERAH_CHAPTERS.find(c => c.id === state.selectedChapter);
        const content = SEERAH_CONTENT[lang]?.[state.selectedChapter] || SEERAH_CONTENT['en']?.[state.selectedChapter];

        wrapper.innerHTML = `
            <div class="space-y-8">
                <div class="flex items-center justify-between">
                    <button id="seerah-back" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 transition-all active:scale-90 flex items-center gap-2 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">
                        ${BackIcon({className: "w-5 h-5"})}
                        <span class="text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                    </button>
                    <div class="flex items-center gap-2">
                        <button id="seerah-bookmark" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${(props.bookmarks?.seerah || []).some(b => b.id === state.selectedChapter) ? 'text-theme-500 bg-theme-50 dark:bg-theme-900/20' : 'text-slate-400'}">
                            ${BookmarkIcon({className: "w-5 h-5"})}
                        </button>
                        <button id="seerah-share" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
                            ${ShareIcon({className: "w-5 h-5"})}
                        </button>
                    </div>
                </div>

                <div class="glass-card rounded-2xl p-6 md:p-10 shadow-md border border-slate-100 dark:border-slate-800 space-y-6">
                    <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight">${t(chapter.titleKey)}</h1>
                    <div class="w-20 h-1.5 bg-theme-500 rounded-full"></div>
                    <div class="prose prose-slate dark:prose-invert max-w-none">
                        <div class="space-y-6 text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                            ${content.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-4 pt-6">
                    ${getPrevChapter() ? `
                        <button id="seerah-prev" class="flex-1 p-4 glass-card rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-theme-500/30 transition-all text-left ${isRtl ? 'text-right' : ''}">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">${t('previous') || 'Previous'}</p>
                            <p class="font-bold text-slate-700 dark:text-slate-200 truncate">${t(getPrevChapter().titleKey)}</p>
                        </button>
                    ` : '<div class="flex-1"></div>'}
                    
                    ${getNextChapter() ? `
                        <button id="seerah-next" class="flex-1 p-4 glass-card rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-theme-500/30 transition-all text-right ${isRtl ? 'text-left' : ''}">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">${t('next') || 'Next'}</p>
                            <p class="font-bold text-slate-700 dark:text-slate-200 truncate">${t(getNextChapter().titleKey)}</p>
                        </button>
                    ` : '<div class="flex-1"></div>'}
                </div>
            </div>
        `;

        wrapper.querySelector('#seerah-back')?.addEventListener('click', () => {
            state.view = 'toc';
            render();
        });

        wrapper.querySelector('#seerah-bookmark')?.addEventListener('click', () => {
            const isBookmarked = (props.bookmarks?.seerah || []).some(b => b.id === state.selectedChapter);
            if (isBookmarked) {
                props.toggleBookmark('seerah', { id: state.selectedChapter });
            } else {
                props.toggleBookmark('seerah', { 
                    id: state.selectedChapter,
                    title: t(chapter.titleKey),
                    subtitle: t('seerah'),
                    text: content.substring(0, 150) + '...',
                    lang: lang
                });
            }
            render();
        });

        wrapper.querySelector('#seerah-share')?.addEventListener('click', () => {
            const text = `${t(chapter.titleKey)}\n\n${content}\n\n${t('appName')}`;
            if (navigator.share) {
                navigator.share({ title: t('seerah'), text: text, url: window.location.href });
            } else {
                navigator.clipboard.writeText(text);
                alert(t('copySuccess'));
            }
        });

        wrapper.querySelector('#seerah-prev')?.addEventListener('click', () => {
            state.selectedChapter = getPrevChapter().id;
            render();
        });

        wrapper.querySelector('#seerah-next')?.addEventListener('click', () => {
            state.selectedChapter = getNextChapter().id;
            render();
        });
    };

    const getPrevChapter = () => {
        const index = SEERAH_CHAPTERS.findIndex(c => c.id === state.selectedChapter);
        return index > 0 ? SEERAH_CHAPTERS[index - 1] : null;
    };

    const getNextChapter = () => {
        const index = SEERAH_CHAPTERS.findIndex(c => c.id === state.selectedChapter);
        return index < SEERAH_CHAPTERS.length - 1 ? SEERAH_CHAPTERS[index + 1] : null;
    };

    render();
};
