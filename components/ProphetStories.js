
import { t, getCurrentLanguage } from '../i18n.js';
import { PROPHET_STORIES } from '../src/data/prophetStoriesData.js';
import { BookOpenIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, SearchIcon } from './Icons.js';

export const renderProphetStories = (container, props) => {
    const { onBack } = props;
    const lang = getCurrentLanguage();
    const stories = PROPHET_STORIES[lang] || PROPHET_STORIES.en;
    
    let state = {
        view: 'list', // 'list' or 'story'
        activeStory: null,
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

        const filteredStories = stories.filter(s => 
            s.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            s.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        );

        wrapper.innerHTML = `
            <div class="flex items-center justify-between mb-8">
                <button id="stories-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-2">
                    ${BackIcon({className: "w-6 h-6"})}
                    <span class="text-sm font-bold">${t('back')}</span>
                </button>
                <h2 class="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white">${t('prophetStories') || 'Prophet Stories'}</h2>
                <div class="w-10"></div>
            </div>

            <div class="relative mb-8">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    ${SearchIcon({className: 'w-5 h-5'})}
                </div>
                <input type="text" id="stories-search" placeholder="${t('searchStories') || 'Search stories...'}" value="${state.searchQuery}" class="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-theme-500/50 transition-all shadow-sm">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${filteredStories.map(story => `
                    <button data-story-id="${story.id}" class="story-card group p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left rtl:text-right flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-theme-50 dark:bg-theme-900/20 flex items-center justify-center text-theme-600 dark:text-theme-400 group-hover:bg-theme-600 group-hover:text-white transition-colors">
                                ${BookOpenIcon({className: 'w-6 h-6'})}
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-slate-900 dark:text-white">${story.name}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400">${t('readStory') || 'Read Story'}</p>
                            </div>
                        </div>
                        ${ChevronRightIcon({className: 'w-5 h-5 text-slate-300 group-hover:text-theme-500 transition-colors rtl:rotate-180'})}
                    </button>
                `).join('')}
            </div>
            
            ${filteredStories.length === 0 ? `
                <div class="text-center py-20">
                    <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        ${SearchIcon({className: 'w-10 h-10'})}
                    </div>
                    <p class="text-slate-500 dark:text-slate-400">${t('noStoriesFound') || 'No stories found.'}</p>
                </div>
            ` : ''}
        `;

        wrapper.querySelector('#stories-back-btn').onclick = onBack;
        
        const searchInput = wrapper.querySelector('#stories-search');
        searchInput.oninput = (e) => {
            state.searchQuery = e.target.value;
            // Debounce or immediate? Immediate for small list
            render();
            wrapper.querySelector('#stories-search').focus();
            // Set cursor to end
            const val = wrapper.querySelector('#stories-search').value;
            wrapper.querySelector('#stories-search').value = '';
            wrapper.querySelector('#stories-search').value = val;
        };

        wrapper.querySelectorAll('[data-story-id]').forEach(btn => {
            btn.onclick = () => {
                state.activeStory = stories.find(s => s.id === btn.dataset.storyId);
                state.view = 'story';
                render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        });
    };

    const renderStoryView = (wrapper) => {
        const story = state.activeStory;
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        // Split content by double newlines to create paragraphs
        const paragraphs = story.content.split('\n\n');

        wrapper.innerHTML = `
            <div class="flex items-center justify-between mb-8">
                <button id="story-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-2">
                    ${BackIcon({className: "w-6 h-6"})}
                    <span class="text-sm font-bold">${t('back')}</span>
                </button>
                <div class="w-10"></div>
            </div>

            <article class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-16 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-96 h-96 bg-theme-500/5 rounded-bl-[15rem] -mr-32 -mt-32"></div>
                
                <div class="relative z-10 space-y-10">
                    <header class="text-center space-y-6">
                        <div class="w-24 h-24 bg-theme-50 dark:bg-theme-900/20 rounded-[2rem] flex items-center justify-center text-theme-600 dark:text-theme-400 mx-auto shadow-inner">
                            ${BookOpenIcon({className: 'w-12 h-12'})}
                        </div>
                        <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight">${story.title}</h2>
                        <div class="flex items-center justify-center gap-4">
                            <div class="h-px w-12 bg-slate-200 dark:bg-slate-800"></div>
                            <span class="text-theme-600 dark:text-theme-400 font-bold uppercase tracking-widest text-xs">${t('prophetStories') || 'Prophet Stories'}</span>
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
            render();
        };

        wrapper.querySelector('#story-finish-btn').onclick = () => {
            state.view = 'list';
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    };

    render();
};
