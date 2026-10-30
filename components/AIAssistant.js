import { t, getCurrentLanguage } from '../i18n.js';
import {
    SendIcon, SparklesIcon,
    ArrowLeftIcon, ArrowRightIcon,
    TrashIcon
} from './Icons.js';
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';

export const renderAIAssistant = (container, props) => {
    const { onBack, navigateTo } = props;
    const isRtl = getCurrentLanguage() === 'ar';

    // The modal shell itself lives in App.js (glass panel, giant radius,
    // scale-in pop) and is NOT part of this file — but it is half of what
    // the user sees, so normalize it here on every open: solid white,
    // normal radius, no entrance animation. Guarded so a future App.js
    // restructure fails silently instead of restyling the wrong element.
    const overlay = document.getElementById('ai-modal-overlay');
    if (overlay) {
        overlay.classList.remove('animate-fade');
        const panel = overlay.querySelector('#ai-modal-content')?.parentElement;
        if (panel && panel.classList.contains('glass')) {
            panel.classList.remove('glass', 'rounded-[2.5rem]', 'animate-scale-in', 'border-white/20');
            panel.classList.add('bg-white', 'rounded-2xl', 'border-slate-200');
        }
    }

    let messages = JSON.parse(localStorage.getItem('ai_chat_history') || '[]');
    let isTyping = false;

    const pageContainer = document.createElement('div');
    pageContainer.className = "flex flex-col h-full max-w-3xl mx-auto px-4 py-4";
    if (isRtl) pageContainer.dir = 'rtl';

    // Header: back, title, quiet attribution, clear chat. No animation, no scale pops.
    const header = document.createElement('div');
    header.className = "flex items-center justify-between pb-4 mb-2 border-b border-slate-200";
    header.innerHTML = `
        <div class="flex items-center gap-3">
            <button id="ai-back-btn" class="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="${t('back')}">
                ${isRtl ? ArrowRightIcon({className: "w-5 h-5 text-slate-700"}) : ArrowLeftIcon({className: "w-5 h-5 text-slate-700"})}
            </button>
            <div>
                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                    ${SparklesIcon({className: "w-5 h-5 text-theme-600"})}
                    ${t('aiAssistant')}
                </h2>
                <p class="text-xs text-slate-400 mt-0.5">${t('poweredBy')}</p>
            </div>
        </div>
        <button id="clear-chat-btn" class="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="${t('clearChat')}">
            ${TrashIcon({className: "w-5 h-5"})}
        </button>
    `;
    pageContainer.appendChild(header);

    // Chat Area: plain scrolling column, no entrance animations.
    const chatArea = document.createElement('div');
    chatArea.className = "flex-1 overflow-y-auto py-2 space-y-3 scrollbar-hide flex flex-col";
    pageContainer.appendChild(chatArea);

    // Suggestions live only on the empty state, as calm divider rows
    // (the app's list language) — not a permanent chip cloud over the input.
    const suggestions = [
        t('aiSuggestion1') || "How to perform wudu?",
        t('aiSuggestion2') || "What breaks fasting?",
        t('aiSuggestion3') || "What does Islam say about patience?",
        t('aiSuggestion4') || "Meaning of Surah Al-Fatiha?",
        t('aiSuggestion5') || "Dua for anxiety",
        t('aiSuggestion6') || "How to pray Tahajjud?"
    ];

    // Input Area: one bordered bar, input + send button side by side.
    const inputArea = document.createElement('div');
    inputArea.className = "pt-3";
    inputArea.innerHTML = `
        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl pl-4 pr-2 py-2 focus-within:border-theme-600 transition-colors">
            <input type="text" id="ai-input" placeholder="${t('askPlaceholder') || 'Ask about a verse or a topic...'}" class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none">
            <button id="ai-send-btn" class="shrink-0 w-10 h-10 rounded-xl bg-theme-600 text-white hover:bg-theme-700 transition-colors flex items-center justify-center" aria-label="Send">
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
            welcome.className = "flex-1 flex flex-col justify-center py-6";
            welcome.innerHTML = `
                <div class="text-center mb-6">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-theme-600/10 flex items-center justify-center text-theme-600 mb-4">
                        ${SparklesIcon({className: "w-6 h-6"})}
                    </div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">${t('welcome') || 'Welcome'}!</h3>
                    <p class="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">${t('aiAssistantDesc') || 'I am your AI Islamic Assistant. Ask me anything about Islam or the Quran.'}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                    ${suggestions.map(s => `
                        <button class="suggestion-btn w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-start">
                            <span>${s}</span>
                            ${isRtl ? ArrowLeftIcon({className: "w-4 h-4 shrink-0 text-slate-300"}) : ArrowRightIcon({className: "w-4 h-4 shrink-0 text-slate-300"})}
                        </button>
                    `).join('')}
                </div>
            `;
            chatArea.appendChild(welcome);
            return;
        }

        messages.forEach((msg) => {
            const msgEl = document.createElement('div');
            msgEl.className = `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`;

            const content = msg.role === 'assistant' ? formatAssistantResponse(msg.text) : msg.text;

            msgEl.innerHTML = `
                <div class="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed markdown-content ${msg.role === 'user' ? 'bg-theme-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}">
                    ${content}
                </div>
            `;
            chatArea.appendChild(msgEl);
        });

        if (isTyping) {
            const typingEl = document.createElement('div');
            typingEl.className = "flex justify-start";
            typingEl.innerHTML = `
                <div class="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-400">
                    ${t('loading') || 'Loading'}…
                </div>
            `;
            chatArea.appendChild(typingEl);
        }

        chatArea.scrollTop = chatArea.scrollHeight;
    };

    const formatAssistantResponse = (text) => {
        // Use marked for markdown
        let formatted = marked.parse(text);

        // Detect Quran verses: (Surah Name X:Y)
        const verseRegex = /\(Surah\s+([A-Za-z\s-]+)\s+(\d+):(\d+)\)/g;

        formatted = formatted.replace(verseRegex, (match, surahName, surahNum, ayahNum) => {
            return `<button class="verse-link text-theme-600 font-bold hover:underline" data-surah="${surahNum}" data-ayah="${ayahNum}">${match}</button>`;
        });

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
            const lang = getCurrentLanguage();
            const langMap = {
                'ar': 'Arabic',
                'en': 'English',
                'id': 'Indonesian',
                'tr': 'Turkish'
            };
            const targetLang = langMap[lang] || 'English';

            const refusalMessage = t('aiOffTopicRefusal');

            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: text.trim(),
                config: {
                    systemInstruction: `You are a powerful AI Islamic Assistant. Your goal is to provide reliable, authentic Islamic information based on the Quran and Sunnah.

                    CRITICAL SCOPE RULE:
                    - You MUST ONLY answer questions related to Islam, the Quran, Hadith, Islamic history, and Islamic jurisprudence (Fiqh).
                    - If a user asks about ANY other topic (e.g., general science, politics, sports, entertainment, coding, math, etc.) that is NOT directly related to an Islamic perspective or teaching, you MUST politely refuse to answer.
                    - If the question is off-topic, respond ONLY with this message: "${refusalMessage}"

                    CRITICAL LANGUAGE RULE:
                    - You MUST respond in ${targetLang} language, regardless of the language of the user's question.

                    General Rules:
                    1. Answer Islamic questions respectfully and clearly.
                    2. Base answers on the Quran whenever possible.
                    3. Include Surah name and verse number when referencing Quran (e.g., Surah Al-Baqarah 2:153).
                    4. Never invent Quran verses.
                    5. If unsure, say that scholars should be consulted.
                    6. If a topic has multiple scholarly opinions, explain that briefly.
                    7. Keep explanations simple and educational.
                    8. Use Markdown for formatting (headers, bold, lists, etc.).

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
        if (confirm(t('confirmClearChat'))) {
            messages = [];
            localStorage.removeItem('ai_chat_history');
            renderMessages();
        }
    });

    // Suggestions render inside the welcome screen, so clicks are delegated
    // (they do not exist yet when this setup code runs).
    pageContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.suggestion-btn');
        if (btn) sendMessage(btn.textContent.trim());
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
