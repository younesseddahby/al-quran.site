import { t } from '../i18n.js';
import { 
    SendIcon, SparklesIcon, UserIcon, BotIcon, 
    ArrowLeftIcon, QuranIcon, BookOpenIcon, 
    ClockIcon, TrashIcon
} from './Icons.js';
import { GoogleGenAI } from "@google/genai";

export const renderAIAssistant = (container, props) => {
    const { onBack, navigateTo } = props;
    
    let messages = JSON.parse(localStorage.getItem('ai_chat_history') || '[]');
    let isTyping = false;

    const pageContainer = document.createElement('div');
    pageContainer.className = "flex flex-col h-full max-w-4xl mx-auto animate-fade p-4 md:p-6";

    // Header
    const header = document.createElement('div');
    header.className = "flex items-center justify-between mb-4 px-2";
    header.innerHTML = `
        <div class="flex items-center gap-3">
            <button id="ai-back-btn" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90">
                ${ArrowLeftIcon({className: "w-5 h-5 text-slate-600 dark:text-slate-400"})}
            </button>
            <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    ${SparklesIcon({className: "w-5 h-5 text-theme-500"})}
                    ${t('aiAssistant') || 'AI Islamic Assistant'}
                </h2>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Powered by Gemini & Quran.com</p>
            </div>
        </div>
        <button id="clear-chat-btn" class="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all active:scale-90" title="Clear Chat">
            ${TrashIcon({className: "w-5 h-5"})}
        </button>
    `;
    pageContainer.appendChild(header);

    // Chat Area
    const chatArea = document.createElement('div');
    chatArea.className = "flex-1 overflow-y-auto px-2 space-y-4 mb-4 scrollbar-hide flex flex-col";
    pageContainer.appendChild(chatArea);

    // Suggestions Area
    const suggestionsArea = document.createElement('div');
    suggestionsArea.className = "flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide px-2";
    const suggestions = [
        t('aiSuggestion1') || "How to perform wudu?",
        t('aiSuggestion2') || "What breaks fasting?",
        t('aiSuggestion3') || "What does Islam say about patience?",
        t('aiSuggestion4') || "Meaning of Surah Al-Fatiha?",
        t('aiSuggestion5') || "Dua for anxiety",
        t('aiSuggestion6') || "How to pray Tahajjud?"
    ];
    suggestionsArea.innerHTML = suggestions.map(s => `
        <button class="suggestion-btn whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-theme-500/10 hover:text-theme-600 dark:hover:text-theme-400 transition-all border border-slate-200/50 dark:border-slate-700/50">
            ${s}
        </button>
    `).join('');
    pageContainer.appendChild(suggestionsArea);

    // Input Area
    const inputArea = document.createElement('div');
    inputArea.className = "px-2 pb-2";
    inputArea.innerHTML = `
        <div class="relative flex items-center gap-2">
            <input type="text" id="ai-input" placeholder="${t('askPlaceholder') || 'Ask about a verse or a topic...'}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-500/20 dark:text-white transition-all pr-12 shadow-sm">
            <button id="ai-send-btn" class="absolute right-2 p-2 rounded-xl bg-theme-500 text-white hover:bg-theme-600 transition-all active:scale-90 shadow-lg shadow-theme-500/20">
                ${SendIcon({className: "w-5 h-5"})}
            </button>
        </div>
    `;
    pageContainer.appendChild(inputArea);

    container.appendChild(pageContainer);

    const renderMessages = () => {
        chatArea.innerHTML = '';
        
        if (messages.length === 0) {
            const welcome = document.createElement('div');
            welcome.className = "flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60";
            welcome.innerHTML = `
                <div class="w-16 h-16 rounded-3xl bg-theme-500/10 flex items-center justify-center text-theme-500 mb-4">
                    ${SparklesIcon({className: "w-8 h-8"})}
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white mb-2">${t('welcome') || 'Welcome'}!</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs">${t('aiAssistantDesc') || 'I am your AI Islamic Assistant. Ask me anything about Islam or the Quran.'}</p>
            `;
            chatArea.appendChild(welcome);
            return;
        }

        messages.forEach((msg, idx) => {
            const msgEl = document.createElement('div');
            msgEl.className = `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`;
            msgEl.style.animationDelay = `${idx * 0.05}s`;
            
            const content = msg.role === 'assistant' ? formatAssistantResponse(msg.text) : msg.text;
            
            msgEl.innerHTML = `
                <div class="flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}">
                    <div class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-theme-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
                        ${msg.role === 'user' ? UserIcon({className: "w-4 h-4"}) : BotIcon({className: "w-4 h-4"})}
                    </div>
                    <div class="p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-theme-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none'}">
                        ${content}
                    </div>
                </div>
            `;
            chatArea.appendChild(msgEl);
        });

        if (isTyping) {
            const typingEl = document.createElement('div');
            typingEl.className = "flex justify-start animate-fade";
            typingEl.innerHTML = `
                <div class="flex gap-3 max-w-[85%]">
                    <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        ${BotIcon({className: "w-4 h-4"})}
                    </div>
                    <div class="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none flex items-center gap-1">
                        <span class="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                        <span class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                        <span class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                    </div>
                </div>
            `;
            chatArea.appendChild(typingEl);
        }

        chatArea.scrollTop = chatArea.scrollHeight;
    };

    const formatAssistantResponse = (text) => {
        // Detect Quran verses: (Surah Name X:Y)
        const verseRegex = /\(Surah\s+([A-Za-z\s-]+)\s+(\d+):(\d+)\)/g;
        
        let formatted = text.replace(verseRegex, (match, surahName, surahNum, ayahNum) => {
            return `<button class="verse-link text-theme-600 dark:text-theme-400 font-bold hover:underline" data-surah="${surahNum}" data-ayah="${ayahNum}">${match}</button>`;
        });

        // Simple markdown-like bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // New lines to br
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    };

    const sendMessage = async (text) => {
        if (!text.trim() || isTyping) return;

        const userMsg = { role: 'user', text: text.trim() };
        messages.push(userMsg);
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
        
        isTyping = true;
        renderMessages();

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY is not configured. Please add it in the settings.");
            }

            // 1. Search Quran.com API for relevant verses
            const quranSearchUrl = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(text.trim())}&size=5&language=en`;
            const searchResponse = await fetch(quranSearchUrl);
            const searchData = await searchResponse.json();
            
            let context = "";
            if (searchData.search && searchData.search.results) {
                context = searchData.search.results.map((result) => {
                    return `[Surah ${result.surah}, Verse ${result.verse}]: ${result.text}`;
                }).join("\n\n");
            }

            // 2. Call Gemini API with context
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: text.trim(),
                config: {
                    systemInstruction: `You are a powerful AI Islamic Assistant. Your goal is to provide reliable, authentic Islamic information based on the Quran.
                    
                    Rules:
                    1. Answer Islamic questions respectfully and clearly.
                    2. Base answers on the Quran whenever possible.
                    3. Include Surah name and verse number when referencing Quran (e.g., Surah Al-Baqarah 2:153).
                    4. Never invent Quran verses.
                    5. If unsure, say that scholars should be consulted.
                    6. If a topic has multiple scholarly opinions, explain that briefly.
                    7. Keep explanations simple and educational.
                    
                    Response Format for Quran references:
                    “Indeed, Allah is with the patient.”
                    (Surah Al-Baqarah 2:153)
                    
                    Retrieved Quranic Context:
                    ${context || "No specific verses found for this query. Use your internal knowledge but be cautious."}`
                }
            });

            const assistantMsg = { role: 'assistant', text: response.text };
            messages.push(assistantMsg);
            localStorage.setItem('ai_chat_history', JSON.stringify(messages));
        } catch (error) {
            console.error('AI Error:', error);
            let errorMsg = "I'm sorry, I encountered an error. Please try again later.";
            if (error.message.includes("API key not valid")) {
                errorMsg = "The API key configured is invalid. Please check your GEMINI_API_KEY in the settings.";
            } else if (error.message.includes("not configured")) {
                errorMsg = error.message;
            }
            messages.push({ role: 'assistant', text: errorMsg });
        } finally {
            isTyping = false;
            renderMessages();
        }
    };

    // Event Listeners
    const input = pageContainer.querySelector('#ai-input');
    const sendBtn = pageContainer.querySelector('#ai-send-btn');
    const backBtn = pageContainer.querySelector('#ai-back-btn');
    const clearBtn = pageContainer.querySelector('#clear-chat-btn');

    sendBtn.addEventListener('click', () => {
        const text = input.value;
        input.value = '';
        sendMessage(text);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = input.value;
            input.value = '';
            sendMessage(text);
        }
    });

    backBtn.addEventListener('click', onBack);

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear chat history?')) {
            messages = [];
            localStorage.removeItem('ai_chat_history');
            renderMessages();
        }
    });

    pageContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.textContent.trim());
        });
    });

    // Handle verse link clicks
    chatArea.addEventListener('click', (e) => {
        const verseBtn = e.target.closest('.verse-link');
        if (verseBtn) {
            const surah = parseInt(verseBtn.dataset.surah);
            const ayah = parseInt(verseBtn.dataset.ayah);
            navigateTo({ surahNumber: surah, ayahNumber: ayah });
        }
    });

    renderMessages();

    // Check for initial prompt
    if (window.aiAssistantInitialPrompt) {
        const prompt = window.aiAssistantInitialPrompt;
        window.aiAssistantInitialPrompt = null;
        setTimeout(() => sendMessage(prompt), 300);
    }

    return () => {
        // Cleanup if needed
    };
};
