import { GoogleGenAI } from "@google/genai";
import { t, getCurrentLanguage } from '../i18n.js';

const markdownToHtml = (text) => {
    if (!text) return '';
    // Basic markdown-like formatting
    return text
        .replace(/### (.*?)\n/g, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
        .replace(/## (.*?)\n/g, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-theme-600 dark:text-theme-400">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .split('\n').map(line => {
            if (line.trim().startsWith('<h') || line.trim().startsWith('<li')) return line;
            return line.trim() ? `<p class="mb-3 leading-relaxed">${line}</p>` : '';
        }).join('');
};

export const renderAITafsir = (container, { onClose, initialPrompt }) => {
    let state = { 
        isLoading: false, 
        conversation: JSON.parse(sessionStorage.getItem('aiConversation') || '[]'),
        streamingText: ''
    };
    let isPrompting = false;

    const render = () => {
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';

        container.innerHTML = `
            <div id="ai-overlay" class="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 transition-opacity duration-500 opacity-0"></div>
            <div id="ai-panel" class="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:max-w-lg h-full md:h-[80vh] bg-white dark:bg-slate-900 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden translate-y-full md:translate-y-10 md:opacity-0 transition-all duration-500 ease-out">
                
                <!-- Header -->
                <header class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-theme-600 flex items-center justify-center text-white shadow-lg shadow-theme-600/20">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-900 dark:text-white">${t('aiTafsirTitle')}</h3>
                            <div class="flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online Assistant</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="clear-ai" class="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all" title="${t('newChat')}">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button id="close-ai" class="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>
                </header>

                <!-- Messages Area -->
                <div id="ai-msgs" class="flex-grow p-6 overflow-y-auto space-y-6 scroll-smooth bg-slate-50/50 dark:bg-slate-950/20">
                    ${state.conversation.length === 0 ? `
                        <div class="flex flex-col items-center justify-center h-full text-center space-y-6 fade-in">
                            <div class="w-20 h-20 rounded-full bg-theme-50 dark:bg-theme-900/20 flex items-center justify-center text-theme-600 dark:text-theme-400">
                                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <div class="space-y-2">
                                <h4 class="text-xl font-bold text-slate-900 dark:text-white">${t('aiWelcomeTitle')}</h4>
                                <p class="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">${t('aiDisclaimer')}</p>
                            </div>
                            <div class="grid grid-cols-1 gap-2 w-full max-w-xs">
                                <button class="suggested-q p-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-theme-500 hover:text-theme-600 transition-all text-left" data-q="${t('exampleQ1')}">${t('exampleQ1')}</button>
                                <button class="suggested-q p-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-theme-500 hover:text-theme-600 transition-all text-left" data-q="${t('exampleQ2')}">${t('exampleQ2')}</button>
                                <button class="suggested-q p-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-theme-500 hover:text-theme-600 transition-all text-left" data-q="${t('exampleQ3')}">${t('exampleQ3')}</button>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Input Area -->
                <footer class="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div class="relative group">
                        <input id="ai-input" class="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl outline-none border border-slate-100 dark:border-slate-700 focus:border-theme-500 focus:ring-4 focus:ring-theme-500/10 transition-all dark:text-white text-sm" placeholder="${t('askPlaceholder')}">
                        <button id="ai-send" class="absolute right-2 top-2 bottom-2 px-4 bg-theme-600 text-white rounded-xl disabled:opacity-50 hover:bg-theme-700 transition-all shadow-lg shadow-theme-600/20 flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14m-7-7l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>
                </footer>
            </div>`;
        
        // Animate in
        setTimeout(() => {
            container.querySelector('#ai-overlay').classList.remove('opacity-0');
            container.querySelector('#ai-panel').classList.remove('translate-y-full', 'md:translate-y-10', 'md:opacity-0');
        }, 10);

        const attach = () => {
            container.querySelector('#close-ai').onclick = () => {
                container.querySelector('#ai-overlay').classList.add('opacity-0');
                container.querySelector('#ai-panel').classList.add('translate-y-full', 'md:translate-y-10', 'md:opacity-0');
                setTimeout(onClose, 500);
            };
            container.querySelector('#ai-overlay').onclick = container.querySelector('#close-ai').onclick;
            container.querySelector('#ai-send').onclick = () => handleAsk();
            container.querySelector('#ai-input').onkeydown = (e) => e.key === 'Enter' && handleAsk();
            container.querySelector('#clear-ai').onclick = () => {
                state.conversation = [];
                sessionStorage.removeItem('aiConversation');
                render();
            };
            container.querySelectorAll('.suggested-q').forEach(btn => {
                btn.onclick = () => handleAsk(btn.dataset.q);
            });
        };
        attach();
        updateMsgs();
        if (initialPrompt && !isPrompting) { isPrompting = true; handleAsk(initialPrompt); }
    };

    const updateMsgs = () => {
        const list = container.querySelector('#ai-msgs');
        if (!list) return;

        const msgsHtml = state.conversation.map(m => `
            <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in">
                <div class="p-4 rounded-2xl max-w-[90%] shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-theme-600 text-white rounded-tr-none' 
                    : m.role === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                }">
                    <div class="text-sm prose dark:prose-invert max-w-none">
                        ${markdownToHtml(m.content)}
                    </div>
                </div>
            </div>`).join('');

        const streamingHtml = state.streamingText ? `
            <div class="flex justify-start fade-in">
                <div class="p-4 rounded-2xl max-w-[90%] shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700">
                    <div class="text-sm prose dark:prose-invert max-w-none">
                        ${markdownToHtml(state.streamingText)}
                        <span class="inline-block w-1.5 h-4 bg-theme-500 ml-1 animate-pulse"></span>
                    </div>
                </div>
            </div>` : '';

        const loadingHtml = (state.isLoading && !state.streamingText) ? `
            <div class="flex justify-start fade-in">
                <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div class="flex gap-1.5">
                        <div class="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
                        <div class="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        <div class="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>` : '';

        // Only update if content changed to avoid flickering
        const newHtml = msgsHtml + streamingHtml + loadingHtml;
        if (list.innerHTML !== newHtml) {
            list.innerHTML = newHtml;
            list.scrollTop = list.scrollHeight;
        }
    };

    const handleAsk = async (text) => {
        const input = container.querySelector('#ai-input');
        const query = text || input?.value.trim();
        if (!query || state.isLoading) return;
        if (input) input.value = '';

        state.conversation.push({ role: 'user', content: query });
        state.isLoading = true;
        state.streamingText = '';
        updateMsgs();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const lang = getCurrentLanguage();
            const system = lang === 'ar' 
                ? "أنت مساعد عالم إسلامي خبير في التفسير والحديث. أجب بالعربية الفصحى بأسلوب تعليمي وودود. استخدم التنسيق المناسب (عناوين، قوائم) لتنظيم إجابتك." 
                : "You are an expert Islamic scholar assistant specializing in Tafsir and Hadith. Answer in English with an educational and friendly tone. Use proper formatting (headings, lists) to organize your response.";
            
            // Build history for multi-turn
            const history = state.conversation
                .filter(m => m.role !== 'error')
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));

            const result = await ai.models.generateContentStream({
                model: 'gemini-3.1-pro-preview',
                contents: history,
                config: { 
                    systemInstruction: system,
                    tools: [{ googleSearch: {} }]
                }
            });

            let fullText = '';
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    state.streamingText = fullText;
                    updateMsgs();
                }
            }

            state.conversation.push({ role: 'model', content: fullText });
            state.streamingText = '';
        } catch (e) {
            console.error("AI Error:", e);
            state.conversation.push({ role: 'error', content: t('aiError') });
        } finally {
            state.isLoading = false;
            sessionStorage.setItem('aiConversation', JSON.stringify(state.conversation));
            updateMsgs();
        }
    };

    render();
};