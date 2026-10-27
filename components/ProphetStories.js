
import { t, getCurrentLanguage } from '../i18n.js';
import { PROPHET_STORIES } from '../src/data/prophetStoriesData.js';
import { BookOpenIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, SearchIcon } from './Icons.js';

export const renderProphetStories = (container, props) => {
    const { onBack } = props;
    const lang = getCurrentLanguage();
    const stories = PROPHET_STORIES[lang] || PROPHET_STORIES.en;
    
    const initialStoryId = localStorage.getItem('last_prophet_story');
    const initialStory = initialStoryId ? stories.find(s => s.id === initialStoryId) : null;

    let state = {
        view: initialStory ? 'story' : 'list',
        activeStory: initialStory,
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
                <button id="stories-back-btn" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                    ${BackIcon({className: "w-5 h-5"})}
                    <span class="text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                </button>
                <h2 class="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white">${t('prophetStories') || 'Prophet Stories'}</h2>
                <div class="w-10"></div>
            </div>

            <div class="relative mb-8">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    ${SearchIcon({className: 'w-5 h-5'})}
                </div>
                <input type="text" id="stories-search" placeholder="${t('searchStories') || 'Search stories...'}" value="${state.searchQuery}" class="w-full pl-12 pr-4 py-4 glass border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-theme-500/20 focus:border-theme-500 transition-all shadow-lg text-slate-800 dark:text-white placeholder:text-slate-400">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                ${filteredStories.map(story => `
                    <button data-story-id="${story.id}" class="story-card group p-6 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover: hover:border-theme-500/30 hover:-translate-y-1 transition-all duration-500 text-left rtl:text-right flex items-center justify-between relative overflow-hidden">
                        
                        <div class="flex items-center gap-4 relative z-10">
                            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm">
                                ${BookOpenIcon({className: 'w-6 h-6'})}
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${story.name}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">${t('readStory') || 'Read Story'}</p>
                            </div>
                        </div>
                        <div class="relative z-10 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500">
                            ${ChevronRightIcon({className: 'w-5 h-5 rtl:rotate-180'})}
                        </div>
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

        const isBookmarked = (props.bookmarks?.stories || []).some(b => b.id === story.id);

        // Split content by double newlines to create paragraphs
        const paragraphs = story.content.split('\n\n');

        wrapper.innerHTML = `
            <div class="flex items-center justify-between mb-8">
                <button id="story-back-btn" class="p-2 -ml-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                    ${BackIcon({className: "w-5 h-5"})}
                    <span class="text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                </button>
                <button id="story-bookmark-btn" class="p-3 rounded-2xl glass border border-slate-200 dark:border-slate-800 transition-all active:scale-95 ${isBookmarked ? 'bg-theme-500/10 text-theme-600 dark:text-theme-400 border-theme-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}">
                    <svg class="w-6 h-6" fill="${isBookmarked ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                </button>
            </div>

            <article class="glass-card rounded-[2.5rem] p-6 md:p-16 shadow-md border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-96 h-96 bg-theme-500/5 rounded-bl-[15rem] -mr-32 -mt-32"></div>
                
                <div class="relative z-10 space-y-10">
                    <header class="text-center space-y-6">
                        <div class="w-24 h-24 glass rounded-[2rem] flex items-center justify-center text-theme-600 dark:text-theme-400 mx-auto shadow-inner">
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
                <button id="story-finish-btn" class="px-10 py-5 bg-theme-600 text-white rounded-2xl font-bold shadow-md hover:bg-theme-700 transition-all active:scale-95 flex items-center gap-3">
                    ${t('done') || 'Done'}
                    ${ChevronRightIcon({className: 'w-5 h-5 rtl:rotate-180'})}
                </button>
            </div>
        `;

        wrapper.querySelector('#story-back-btn').onclick = () => {
            state.view = 'list';
            localStorage.removeItem('last_prophet_story');
            render();
        };

        wrapper.querySelector('#story-bookmark-btn').onclick = () => {
            props.toggleBookmark('stories', {
                id: story.id,
                title: story.title,
                subtitle: t('prophetStories'),
                text: story.content.substring(0, 150) + '...',
                lang: lang
            });
            render();
        };

        wrapper.querySelector('#story-finish-btn').onclick = () => {
            state.view = 'list';
            localStorage.removeItem('last_prophet_story');
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    };

    render();
};
