
import { t, getCurrentLanguage } from '../i18n.js';
import { SAHABA_LIST, SAHABA_CONTENT } from '../src/data/sahabaData.js';
import { BookOpenIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, SearchIcon, MoonIcon } from './Icons.js';

export const renderSahabaStories = (container, props) => {
    const { onBack } = props;
    const lang = getCurrentLanguage();
    
    const initialSahabaId = localStorage.getItem('last_sahaba_story');
    const initialSahaba = initialSahabaId ? SAHABA_LIST.find(s => s.id === initialSahabaId) : null;

    let state = {
        view: initialSahaba ? 'story' : 'list',
        activeSahaba: initialSahaba,
        searchQuery: ''
    };

    const render = () => {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'max-w-4xl mx-auto space-y-6 fade-in pb-20';

        if (state.view === 'list') {
            renderListView(wrapper);
        } else {
            renderStoryView(wrapper);
        }

        container.appendChild(wrapper);
    };

    const renderListView = (wrapper) => {
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        const filteredSahaba = SAHABA_LIST.filter(s => {
            const name = isRtl ? s.nameAr : t(s.nameKey);
            const title = t(s.titleKey);
            return name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                   title.toLowerCase().includes(state.searchQuery.toLowerCase());
        });

        wrapper.innerHTML = `
            <div class="flex items-center justify-between mb-8">
                <button id="sahaba-back-btn" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                    ${BackIcon({className: "w-5 h-5"})}
                    <span class="text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                </button>
                <h2 class="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white">${t('sahabaStories') || 'Sahaba Stories'}</h2>
                <div class="w-10"></div>
            </div>

            <div class="relative mb-8">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    ${SearchIcon({className: 'w-5 h-5'})}
                </div>
                <input type="text" id="sahaba-search" placeholder="${t('searchSahaba') || 'Search Sahaba...'}" value="${state.searchQuery}" class="w-full pl-12 pr-4 py-4 glass border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500 transition-all shadow-lg text-slate-800 dark:text-white placeholder:text-slate-400">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                ${filteredSahaba.map(sahaba => `
                    <button data-sahaba-id="${sahaba.id}" class="story-card group p-6 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-theme-500/10 hover:border-theme-500/30 hover:-translate-y-1 transition-all duration-500 text-left rtl:text-right flex items-center justify-between relative overflow-hidden">
                        <div class="absolute -right-8 -top-8 w-32 h-32 bg-theme-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div class="flex items-center gap-4 relative z-10">
                            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm">
                                ${BookOpenIcon({className: 'w-6 h-6'})}
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${isRtl ? sahaba.nameAr : t(sahaba.nameKey)}</h3>
                                <p class="text-[10px] text-theme-600 dark:text-theme-400 font-bold uppercase tracking-wider mt-0.5">${t(sahaba.titleKey)}</p>
                            </div>
                        </div>
                        <div class="relative z-10 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500">
                            ${ChevronRightIcon({className: 'w-5 h-5 rtl:rotate-180'})}
                        </div>
                    </button>
                `).join('')}
            </div>
            
            ${filteredSahaba.length === 0 ? `
                <div class="text-center py-20">
                    <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        ${SearchIcon({className: 'w-10 h-10'})}
                    </div>
                    <p class="text-slate-500 dark:text-slate-400">${t('noResultsFound') || 'No results found.'}</p>
                </div>
            ` : ''}
        `;

        wrapper.querySelector('#sahaba-back-btn').onclick = onBack;
        
        const searchInput = wrapper.querySelector('#sahaba-search');
        searchInput.oninput = (e) => {
            state.searchQuery = e.target.value;
            render();
            const input = wrapper.querySelector('#sahaba-search');
            input.focus();
            const val = input.value;
            input.value = '';
            input.value = val;
        };

        wrapper.querySelectorAll('[data-sahaba-id]').forEach(btn => {
            btn.onclick = () => {
                state.activeSahaba = SAHABA_LIST.find(s => s.id === btn.dataset.sahabaId);
                state.view = 'story';
                localStorage.setItem('last_sahaba_story', btn.dataset.sahabaId);
                render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        });
    };

    const renderStoryView = (wrapper) => {
        const sahaba = state.activeSahaba;
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;
        const content = SAHABA_CONTENT[lang][sahaba.id] || SAHABA_CONTENT.en[sahaba.id];

        // Split content by double newlines to create paragraphs
        const paragraphs = content.split('\n\n');

        wrapper.innerHTML = `
            <div class="flex items-center justify-between mb-8">
                <button id="story-back-btn" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                    ${BackIcon({className: "w-5 h-5"})}
                    <span class="text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                </button>
                <div class="w-10"></div>
            </div>

            <article class="glass-card rounded-[2.5rem] p-6 md:p-16 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-96 h-96 bg-theme-500/5 rounded-bl-[15rem] -mr-32 -mt-32"></div>
                
                <div class="relative z-10 space-y-10">
                    <header class="text-center space-y-6">
                        <div class="w-24 h-24 glass rounded-[2rem] flex items-center justify-center text-theme-600 dark:text-theme-400 mx-auto shadow-inner">
                            ${MoonIcon ? MoonIcon({className: 'w-12 h-12'}) : BookOpenIcon({className: 'w-12 h-12'})}
                        </div>
                        <div class="space-y-2">
                             <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight">${isRtl ? sahaba.nameAr : t(sahaba.nameKey)}</h2>
                             <p class="text-sm md:text-lg text-theme-600 dark:text-theme-400 font-bold uppercase tracking-[0.3em]">${t(sahaba.titleKey)}</p>
                        </div>
                        <div class="flex items-center justify-center gap-4">
                            <div class="h-px w-12 bg-slate-200 dark:bg-slate-800"></div>
                            <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">${t('sahabaStories') || 'Sahaba Stories'}</span>
                            <div class="h-px w-12 bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                    </header>

                    <div class="space-y-8 text-slate-700 dark:text-slate-300">
                        ${paragraphs.map((p, i) => `
                            <p class="text-lg md:text-2xl leading-relaxed md:leading-loose text-justify ${i === 0 ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-theme-600 first-letter:mr-3 first-letter:float-left rtl:first-letter:float-none rtl:first-letter:mr-0' : ''}">
                                ${p.trim()}
                            </p>
                        `).join('')}
                    </div>
                </div>
            </article>

            <div class="flex justify-center pt-12">
                <button id="story-finish-btn" class="px-10 py-5 bg-theme-600 text-white rounded-3xl font-bold shadow-xl shadow-theme-500/30 hover:bg-theme-700 transition-all active:scale-95 flex items-center gap-3">
                    ${t('done') || 'Done'}
                    ${ChevronRightIcon({className: 'w-5 h-5 rtl:rotate-180'})}
                </button>
            </div>
        `;

        wrapper.querySelector('#story-back-btn').onclick = () => {
            state.view = 'list';
            localStorage.removeItem('last_sahaba_story');
            render();
        };

        wrapper.querySelector('#story-finish-btn').onclick = () => {
            state.view = 'list';
            localStorage.removeItem('last_sahaba_story');
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    };

    render();
};
