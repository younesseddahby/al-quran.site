
import { t, getCurrentLanguage } from '../i18n.js';
import { ChevronRightIcon, ArrowLeftIcon, TrophyIcon, TimerIcon, BrainIcon, CheckCircleIcon, XCircleIcon, PlayIcon, RefreshIcon } from './Icons.js';

const QUIZ_DATA = {
    ar: {
        easy: {
            quran: [
                { q: "كم عدد سور القرآن الكريم؟", a: ["114", "110", "120", "104"], c: 0 },
                { q: "ما هي أطول سورة في القرآن؟", a: ["البقرة", "آل عمران", "النساء", "المائدة"], c: 0 },
                { q: "ما هي السورة التي تسمى 'قلب القرآن'؟", a: ["يس", "الفاتحة", "الإخلاص", "الملك"], c: 0 },
                { q: "كم عدد أجزاء القرآن الكريم؟", a: ["30", "20", "40", "25"], c: 0 },
                { q: "ما هي السورة التي يجب قراءتها في كل صلاة؟", a: ["الفاتحة", "الإخلاص", "الفلق", "الناس"], c: 0 },
                { q: "ما هي أول كلمة نزلت من القرآن؟", a: ["اقرأ", "باسم الله", "الحمد لله", "قل"], c: 0 },
                { q: "من هو أول من جمع القرآن في مصحف واحد؟", a: ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"], c: 0 }
            ],
            hadith: [
                { q: "من هو أشهر رواة الحديث؟", a: ["أبو هريرة", "عمر بن الخطاب", "علي بن أبي طالب", "عائشة بنت أبي بكر"], c: 0 },
                { q: "عن ماذا يتحدث أول كتاب في صحيح البخاري؟", a: ["بدء الوحي", "الصلاة", "الزكاة", "الصيام"], c: 0 },
                { q: "كم عدد أركان الإسلام؟", a: ["5", "4", "6", "7"], c: 0 },
                { q: "ما معنى كلمة 'حديث'؟", a: ["الكلام أو الخبر", "التاريخ", "القصة", "القانون"], c: 0 }
            ],
            sunnah: [
                { q: "أي يد يجب على المسلم استخدامها للأكل؟", a: ["اليمنى", "اليسرى", "كلتاهما", "أي منهما"], c: 0 },
                { q: "ما هي طريقة النوم المسنونة؟", a: ["على الجانب الأيمن", "على الجانب الأيسر", "على البطن", "جالساً"], c: 0 },
                { q: "كم مرة حج النبي صلى الله عليه وسلم؟", a: ["مرة واحدة", "مرتين", "ثلاث مرات", "لم يحج"], c: 0 }
            ],
            adhkar: [
                { q: "ماذا نقول قبل الأكل؟", a: ["باسم الله", "الحمد لله", "سبحان الله", "الله أكبر"], c: 0 },
                { q: "ماذا يقول المسلم بعد العطس؟", a: ["الحمد لله", "يرحمكم الله", "باسم الله", "أستغفر الله"], c: 0 },
                { q: "ما هو أفضل الذكر؟", a: ["لا إله إلا الله", "الحمد لله", "سبحان الله", "الله أكبر"], c: 0 }
            ]
        },
        medium: {
            quran: [
                { q: "ما هي السورة التي لا تبدأ بالبسملة؟", a: ["التوبة", "النمل", "الفاتحة", "الإخلاص"], c: 0 },
                { q: "في أي شهر نزل القرآن لأول مرة؟", a: ["رمضان", "رجب", "شعبان", "محرم"], c: 0 },
                { q: "من هو النبي الذي ذكر أكثر في القرآن؟", a: ["موسى عليه السلام", "إبراهيم عليه السلام", "عيسى عليه السلام", "محمد صلى الله عليه وسلم"], c: 0 },
                { q: "كم سنة استغرق نزول القرآن كاملاً؟", a: ["23 سنة", "20 سنة", "25 سنة", "13 سنة"], c: 0 }
            ],
            hadith: [
                { q: "من الذي جمع أصح مجموعة من الأحاديث؟", a: ["الإمام البخاري", "الإمام مسلم", "الإمام مالك", "الإمام أحمد"], c: 0 },
                { q: "ماذا تعني كلمة 'صحيح' في مصطلح الحديث؟", a: ["موثوق", "ضعيف", "موضوع", "حسن"], c: 0 },
                { q: "كم عدد الأحاديث في صحيح البخاري (بدون تكرار)؟", a: ["حوالي 2600", "حوالي 7000", "حوالي 10000", "حوالي 1000"], c: 0 }
            ],
            sunnah: [
                { q: "ما اسم ناقة النبي صلى الله عليه وسلم؟", a: ["القصواء", "العضباء", "الجدعاء", "البراق"], c: 0 }
            ],
            adhkar: [
                { q: "أي ذكر هو 'ثقيل في الميزان وخفيف على اللسان'؟", a: ["سبحان الله وبحمده سبحان الله العظيم", "لا إله إلا الله", "الحمد لله", "الله أكبر"], c: 0 }
            ]
        },
        hard: {
            quran: [
                { q: "ما هي السورة التي تحتوي على بسملتين؟", a: ["النمل", "البقرة", "الإسراء", "الكهف"], c: 0 },
                { q: "كم عدد السجدات في القرآن الكريم؟", a: ["15", "12", "14", "10"], c: 0 },
                { q: "ما هي السورة التي تسمى 'عروس القرآن'؟", a: ["الرحمن", "يس", "الواقعة", "الملك"], c: 0 }
            ],
            hadith: [
                { q: "ما هو 'الحديث القدسي'؟", a: ["كلام الله يرويه النبي", "كلام الصحابة", "كلام التابعين", "حديث ضعيف"], c: 0 },
                { q: "ما هو الحديث 'المرسل'؟", a: ["ما رفعه التابعي إلى النبي مباشرة", "حديث منقطع السلسلة", "حديث رواه الكثير", "حديث موضوع"], c: 0 }
            ]
        }
    },
    en: {
        easy: {
            quran: [
                { q: "How many Surahs are in the Holy Quran?", a: ["114", "110", "120", "104"], c: 0 },
                { q: "Which is the longest Surah in the Quran?", a: ["Al-Baqarah", "Al-Imran", "An-Nisa", "Al-Ma'idah"], c: 0 },
                { q: "Which Surah is known as the 'Heart of the Quran'?", a: ["Yaseen", "Al-Fatiha", "Al-Ikhlas", "Al-Mulk"], c: 0 },
                { q: "How many Juz are in the Quran?", a: ["30", "20", "40", "25"], c: 0 },
                { q: "Which Surah must be recited in every prayer?", a: ["Al-Fatiha", "Al-Ikhlas", "Al-Falaq", "An-Nas"], c: 0 },
                { q: "What is the first word revealed of the Quran?", a: ["Iqra", "Bismillah", "Alhamdulillah", "Qul"], c: 0 },
                { q: "Who was the first person to compile the Quran into a book?", a: ["Abu Bakr (RA)", "Umar (RA)", "Uthman (RA)", "Ali (RA)"], c: 0 }
            ],
            hadith: [
                { q: "Who is the most famous narrator of Hadith?", a: ["Abu Hurairah", "Umar ibn al-Khattab", "Ali ibn Abi Talib", "Aisha bint Abi Bakr"], c: 0 },
                { q: "What is the first book of Sahih al-Bukhari about?", a: ["Revelation", "Prayer", "Zakat", "Fasting"], c: 0 },
                { q: "How many pillars of Islam are there?", a: ["5", "4", "6", "7"], c: 0 },
                { q: "What is the meaning of 'Hadith'?", a: ["Speech or news", "History", "Story", "Law"], c: 0 }
            ],
            sunnah: [
                { q: "Which hand should a Muslim use for eating?", a: ["Right", "Left", "Both", "Either"], c: 0 },
                { q: "What is the Sunnah way of sleeping?", a: ["On the right side", "On the left side", "On the stomach", "Sitting up"], c: 0 },
                { q: "How many times did the Prophet (PBUH) perform Hajj?", a: ["Once", "Twice", "Three times", "Never"], c: 0 }
            ],
            adhkar: [
                { q: "What should we say before eating?", a: ["Bismillah", "Alhamdulillah", "SubhanAllah", "Allahu Akbar"], c: 0 },
                { q: "What should we say after sneezing?", a: ["Alhamdulillah", "YarhamukAllah", "Bismillah", "Astaghfirullah"], c: 0 },
                { q: "What is the best Dhikr?", a: ["La ilaha illAllah", "Alhamdulillah", "SubhanAllah", "Allahu Akbar"], c: 0 }
            ]
        },
        medium: {
            quran: [
                { q: "Which Surah does not start with Bismillah?", a: ["At-Tawbah", "Al-Naml", "Al-Fatiha", "Al-Ikhlas"], c: 0 },
                { q: "In which month was the Quran first revealed?", a: ["Ramadan", "Rajab", "Sha'ban", "Muharram"], c: 0 },
                { q: "Which Prophet is mentioned most in the Quran?", a: ["Musa (AS)", "Ibrahim (AS)", "Isa (AS)", "Muhammad (PBUH)"], c: 0 },
                { q: "How many years did it take for the full revelation of the Quran?", a: ["23 years", "20 years", "25 years", "13 years"], c: 0 }
            ],
            hadith: [
                { q: "Who compiled the most authentic collection of Hadith?", a: ["Imam Bukhari", "Imam Muslim", "Imam Malik", "Imam Ahmad"], c: 0 },
                { q: "What does 'Sahih' mean in Hadith terminology?", a: ["Authentic", "Weak", "Fabricated", "Good"], c: 0 },
                { q: "How many Hadith are in Sahih al-Bukhari (without repetitions)?", a: ["Approx. 2,600", "Approx. 7,000", "Approx. 10,000", "Approx. 1,000"], c: 0 }
            ],
            sunnah: [
                { q: "What was the name of the Prophet's (PBUH) camel?", a: ["Al-Qaswa", "Al-Adba", "Al-Jada", "Al-Burraq"], c: 0 }
            ],
            adhkar: [
                { q: "Which Dhikr is 'heavy on the scale and light on the tongue'?", a: ["SubhanAllahi wa bihamdihi, SubhanAllahil Azeem", "La ilaha illAllah", "Alhamdulillah", "Allahu Akbar"], c: 0 }
            ]
        },
        hard: {
            quran: [
                { q: "Which Surah contains two Bismillahs?", a: ["Al-Naml", "Al-Baqarah", "Al-Isra", "Al-Kahf"], c: 0 },
                { q: "How many Sajdahs (prostrations) are in the Quran?", a: ["15", "12", "14", "10"], c: 0 },
                { q: "Which Surah is called 'The Bride of the Quran'?", a: ["Ar-Rahman", "Yaseen", "Al-Waqi'ah", "Al-Mulk"], c: 0 }
            ],
            hadith: [
                { q: "What is a 'Hadith Qudsi'?", a: ["Words of Allah narrated by the Prophet", "Words of the Sahaba", "Words of the Tabi'un", "A weak hadith"], c: 0 },
                { q: "What is a 'Mursal' Hadith?", a: ["A hadith where a Tabi'i narrates directly from the Prophet", "A hadith with a broken chain", "A hadith narrated by many people", "A fabricated hadith"], c: 0 }
            ]
        }
    }
};

export const renderQuiz = (container, props) => {
    const { onBack } = props;
    
    let state = {
        view: 'landing', // 'landing', 'quiz', 'results'
        level: 'easy',
        category: 'quran',
        currentQuestionIndex: 0,
        score: 0,
        questions: [],
        userAnswers: [],
        timer: 0,
        timerInterval: null,
        savedProgress: null
    };

    const saveProgress = () => {
        const progress = {
            level: state.level,
            category: state.category,
            currentQuestionIndex: state.currentQuestionIndex,
            score: state.score,
            questions: state.questions,
            userAnswers: state.userAnswers,
            lang: getCurrentLanguage()
        };
        localStorage.setItem('islamic_quiz_progress', JSON.stringify(progress));
    };

    const clearProgress = () => {
        localStorage.removeItem('islamic_quiz_progress');
    };

    const loadProgress = () => {
        const saved = localStorage.getItem('islamic_quiz_progress');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.lang === getCurrentLanguage()) {
                state.savedProgress = parsed;
            }
        }
    };

    const resumeQuiz = () => {
        if (!state.savedProgress) return;
        
        state.level = state.savedProgress.level;
        state.category = state.savedProgress.category;
        state.currentQuestionIndex = state.savedProgress.currentQuestionIndex;
        state.score = state.savedProgress.score;
        state.questions = state.savedProgress.questions;
        state.userAnswers = state.savedProgress.userAnswers;
        state.view = 'quiz';
        
        state.timer = state.level === 'hard' ? 15 : (state.level === 'medium' ? 30 : 0);
        if (state.timer > 0) startTimer();
        
        render();
    };

    const init = () => {
        loadProgress();
        render();
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const startQuiz = (level, category) => {
        const lang = getCurrentLanguage();
        const langData = QUIZ_DATA[lang] || QUIZ_DATA.en;
        const levelData = langData[level];
        const categoryQuestions = levelData[category] || levelData['quran'];
        
        state.level = level;
        state.category = category;
        
        // Shuffle questions and for each question, shuffle answers
        state.questions = shuffleArray([...categoryQuestions])
            .slice(0, 10)
            .map(q => {
                const originalCorrectAnswer = q.a[q.c];
                const shuffledAnswers = shuffleArray([...q.a]);
                const newCorrectIndex = shuffledAnswers.indexOf(originalCorrectAnswer);
                return {
                    ...q,
                    a: shuffledAnswers,
                    c: newCorrectIndex
                };
            });

        state.view = 'quiz';
        state.currentQuestionIndex = 0;
        state.score = 0;
        state.userAnswers = [];
        state.timer = state.level === 'hard' ? 15 : (state.level === 'medium' ? 30 : 0);
        
        saveProgress();
        
        if (state.timer > 0) {
            startTimer();
        }
        
        render();
    };

    const startTimer = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            state.timer--;
            const timerEl = container.querySelector('#quiz-timer');
            if (timerEl) {
                timerEl.textContent = state.timer;
                if (state.timer <= 5) {
                    timerEl.classList.add('text-red-500', 'animate-pulse');
                }
            }
            if (state.timer <= 0) {
                handleAnswer(-1); // Time out
            }
        }, 1000);
    };

    const handleAnswer = (answerIndex) => {
        clearInterval(state.timerInterval);
        const currentQuestion = state.questions[state.currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.c;
        
        if (isCorrect) state.score++;
        state.userAnswers.push({
            question: currentQuestion.q,
            userAnswer: answerIndex === -1 ? t('timeout') : currentQuestion.a[answerIndex],
            correctAnswer: currentQuestion.a[currentQuestion.c],
            isCorrect
        });

        const options = container.querySelectorAll('.quiz-option');
        options.forEach((opt, idx) => {
            opt.disabled = true;
            if (idx === currentQuestion.c) {
                opt.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500', 'ring-4', 'ring-emerald-500/20');
            } else if (idx === answerIndex) {
                opt.classList.add('bg-red-500', 'text-white', 'border-red-500', 'ring-4', 'ring-red-500/20');
            }
        });

        saveProgress();

        setTimeout(() => {
            state.currentQuestionIndex++;
            if (state.currentQuestionIndex < state.questions.length) {
                state.timer = state.level === 'hard' ? 15 : (state.level === 'medium' ? 30 : 0);
                if (state.timer > 0) startTimer();
                render();
            } else {
                clearProgress();
                state.view = 'results';
                render();
            }
        }, 1500);
    };

    const renderLanding = () => {
        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 fade-in">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-4">
                        <button id="quiz-back-btn" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all">
                            ${ArrowLeftIcon({className: "w-6 h-6"})}
                        </button>
                        <h2 class="text-3xl font-bold font-display text-slate-900 dark:text-white">${t('islamicQuiz')}</h2>
                    </div>
                    ${state.savedProgress ? `
                        <button id="resume-quiz-btn" class="flex items-center gap-2 px-4 py-2 bg-theme-100 dark:bg-theme-900/30 text-theme-700 dark:text-theme-400 font-bold rounded-full hover:bg-theme-200 dark:hover:bg-theme-900/50 transition-all animate-bounce">
                            ${PlayIcon({className: 'w-4 h-4'})} ${t('resumeQuiz') || 'Resume Quiz'}
                        </button>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-6">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            ${BrainIcon({className: 'w-6 h-6 text-theme-500'})} ${t('selectLevel')}
                        </h3>
                        <div class="grid grid-cols-1 gap-4">
                            ${['easy', 'medium', 'hard'].map((lvl, idx) => `
                                <button data-level="${lvl}" class="level-btn p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-left transition-all hover:border-theme-500 hover:shadow-xl group relative overflow-hidden">
                                    <div class="absolute top-0 right-0 w-24 h-24 bg-theme-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                                    <div class="flex justify-between items-center relative z-10">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-theme-600 group-hover:text-white transition-all">
                                                ${idx + 1}
                                            </div>
                                            <div>
                                                <h4 class="font-bold text-lg capitalize text-slate-900 dark:text-white group-hover:text-theme-600">${t(lvl)}</h4>
                                                <p class="text-sm text-slate-500 dark:text-slate-400">${t(lvl + 'Desc')}</p>
                                            </div>
                                        </div>
                                        <div class="text-slate-300 group-hover:text-theme-500 transition-all">
                                            ${ChevronRightIcon({className: 'w-6 h-6'})}
                                        </div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="space-y-6">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            ${TrophyIcon({className: 'w-6 h-6 text-theme-500'})} ${t('selectCategory')}
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            ${['quran', 'hadith', 'sunnah', 'adhkar'].map(cat => `
                                <button data-category="${cat}" class="category-btn p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center transition-all hover:border-theme-500 hover:shadow-xl group">
                                    <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-theme-50 dark:bg-theme-900/20 flex items-center justify-center text-theme-600 dark:text-theme-400 group-hover:bg-theme-600 group-hover:text-white transition-all">
                                        ${cat === 'quran' ? BrainIcon({className: 'w-8 h-8'}) : TrophyIcon({className: 'w-8 h-8'})}
                                    </div>
                                    <h4 class="font-bold capitalize text-slate-900 dark:text-white">${t(cat)}</h4>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#quiz-back-btn').onclick = onBack;
        container.querySelector('#resume-quiz-btn')?.addEventListener('click', resumeQuiz);
        
        let selectedLevel = 'easy';
        let selectedCategory = 'quran';

        const levelBtns = container.querySelectorAll('.level-btn');
        const catBtns = container.querySelectorAll('.category-btn');

        const updateSelection = () => {
            levelBtns.forEach(b => {
                if (b.dataset.level === selectedLevel) b.classList.add('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]');
                else b.classList.remove('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]');
            });
            catBtns.forEach(b => {
                if (b.dataset.category === selectedCategory) b.classList.add('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]');
                else b.classList.remove('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]');
            });
        };

        updateSelection();

        levelBtns.forEach(btn => btn.onclick = () => {
            selectedLevel = btn.dataset.level;
            updateSelection();
            renderStartButton();
        });

        catBtns.forEach(btn => btn.onclick = () => {
            selectedCategory = btn.dataset.category;
            updateSelection();
            renderStartButton();
        });

        const renderStartButton = () => {
            let startBtn = container.querySelector('#start-quiz-btn');
            if (!startBtn) {
                startBtn = document.createElement('button');
                startBtn.id = 'start-quiz-btn';
                startBtn.className = 'w-full mt-8 py-5 bg-theme-600 text-white font-bold rounded-2xl shadow-xl shadow-theme-500/30 hover:bg-theme-700 transition-all active:scale-95 flex items-center justify-center gap-3 fade-in';
                startBtn.innerHTML = `${PlayIcon({className: 'w-5 h-5'})} ${t('startQuiz')}`;
                container.querySelector('.max-w-4xl').appendChild(startBtn);
            }
            startBtn.onclick = () => startQuiz(selectedLevel, selectedCategory);
        };
        
        renderStartButton();
    };

    const renderQuizView = () => {
        const question = state.questions[state.currentQuestionIndex];
        const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-8 fade-in">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <button id="quit-quiz-btn" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-red-500 transition-all" title="${t('quitAndSave') || 'Quit and Save'}">
                            ${XCircleIcon({className: 'w-6 h-6'})}
                        </button>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-theme-600 dark:text-theme-400 uppercase tracking-[0.2em]">${t(state.level)} • ${t(state.category)}</p>
                            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400">${t('question')} ${state.currentQuestionIndex + 1} ${t('of')} ${state.questions.length}</h3>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        ${state.timer > 0 ? `
                            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold border border-slate-200 dark:border-slate-700">
                                ${TimerIcon({className: 'w-4 h-4'})}
                                <span id="quiz-timer">${state.timer}</span>
                            </div>
                        ` : ''}
                        <div class="px-4 py-2 rounded-full bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-400 font-bold text-sm border border-theme-100 dark:border-theme-900/30">
                            ${state.score} ${t('points') || 'pts'}
                        </div>
                    </div>
                </div>

                <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div class="h-full bg-theme-600 rounded-full transition-all duration-700 ease-out shadow-sm" style="width: ${progress}%"></div>
                </div>

                <div class="p-8 md:p-16 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-theme-500/5 rounded-bl-full -mr-16 -mt-16"></div>
                    <h2 class="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white text-center leading-tight mb-12 relative z-10">${question.q}</h2>
                    
                    <div class="grid grid-cols-1 gap-4 relative z-10">
                        ${question.a.map((ans, idx) => `
                            <button data-index="${idx}" class="quiz-option w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-left font-bold text-slate-700 dark:text-slate-300 hover:border-theme-500 hover:bg-theme-50/50 dark:hover:bg-theme-900/10 transition-all active:scale-[0.98] group">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-sm text-slate-400 group-hover:bg-theme-600 group-hover:text-white transition-all">
                                            ${String.fromCharCode(65 + idx)}
                                        </div>
                                        <span class="text-lg">${ans}</span>
                                    </div>
                                    <div class="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-theme-500 transition-all"></div>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#quit-quiz-btn').onclick = () => {
            saveProgress();
            state.view = 'landing';
            render();
        };

        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.onclick = () => handleAnswer(parseInt(btn.dataset.index));
        });
    };

    const renderResults = () => {
        const percentage = (state.score / state.questions.length) * 100;
        let message = t('quizResultGood');
        let colorClass = 'text-theme-600 dark:text-theme-400';
        
        if (percentage < 50) {
            message = t('quizResultTryAgain');
            colorClass = 'text-amber-600 dark:text-amber-400';
        } else if (percentage === 100) {
            message = t('quizResultPerfect');
            colorClass = 'text-emerald-600 dark:text-emerald-400';
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-8 fade-in text-center">
                <div class="p-12 md:p-20 rounded-[4rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-theme-500/5 rounded-full -mt-48"></div>
                    
                    <div class="relative z-10 space-y-8">
                        <div class="w-28 h-28 mx-auto bg-theme-100 dark:bg-theme-900/30 rounded-full flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-inner">
                            ${TrophyIcon({className: 'w-14 h-14'})}
                        </div>
                        
                        <div class="space-y-3">
                            <h2 class="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">${t('quizCompleted')}</h2>
                            <p class="text-xl md:text-2xl ${colorClass} font-bold">${message}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-8 py-10 border-y border-slate-100 dark:border-slate-800">
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${t('score')}</p>
                                <p class="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white font-display">${state.score}<span class="text-2xl text-slate-400">/${state.questions.length}</span></p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${t('accuracy')}</p>
                                <p class="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white font-display">${Math.round(percentage)}%</p>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button id="retry-quiz-btn" class="flex-1 px-8 py-5 bg-theme-600 text-white font-bold rounded-2xl shadow-xl shadow-theme-500/30 hover:bg-theme-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                                ${RefreshIcon({className: 'w-5 h-5'})} ${t('tryAgain')}
                            </button>
                            <button id="finish-quiz-btn" class="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                                ${t('backToHome')}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-6 text-left rtl:text-right">
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200 px-6">${t('reviewAnswers')}</h3>
                    <div class="space-y-4">
                        ${state.userAnswers.map((ans, idx) => `
                            <div class="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border ${ans.isCorrect ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-red-100 dark:border-red-900/20'} shadow-sm hover:shadow-md transition-shadow">
                                <div class="flex gap-6">
                                    <div class="mt-1 flex-shrink-0">
                                        ${ans.isCorrect ? CheckCircleIcon({className: 'w-8 h-8 text-emerald-500'}) : XCircleIcon({className: 'w-8 h-8 text-red-500'})}
                                    </div>
                                    <div class="space-y-4 flex-grow">
                                        <p class="text-lg font-bold text-slate-900 dark:text-white leading-tight">${idx + 1}. ${ans.question}</p>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div class="p-4 rounded-2xl ${ans.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-red-50 dark:bg-red-900/10'}">
                                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">${t('yourAnswer')}</p>
                                                <p class="font-bold ${ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}">${ans.userAnswer}</p>
                                            </div>
                                            ${!ans.isCorrect ? `
                                                <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10">
                                                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">${t('correctAnswer')}</p>
                                                    <p class="font-bold text-emerald-700 dark:text-emerald-400">${ans.correctAnswer}</p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#retry-quiz-btn').onclick = () => {
            state.view = 'landing';
            render();
        };
        container.querySelector('#finish-quiz-btn').onclick = onBack;
    };

    const render = () => {
        if (state.view === 'landing') renderLanding();
        else if (state.view === 'quiz') renderQuizView();
        else if (state.view === 'results') renderResults();
    };

    init();
};
