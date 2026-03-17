
import { t, getCurrentLanguage } from '../i18n.js';
import { ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon, TrophyIcon, TimerIcon, BrainIcon, CheckCircleIcon, XCircleIcon, PlayIcon, RefreshIcon } from './Icons.js';

const QUIZ_DATA = {
    ar: {
        easy: {
            quran: [
                { q: "كم عدد سور القرآن الكريم؟", a: ["114", "110", "120", "104"], c: 0, e: "يتكون القرآن الكريم من 114 سورة، تبدأ بالفاتحة وتنتهي بالناس." },
                { q: "ما هي أطول سورة في القرآن؟", a: ["البقرة", "آل عمران", "النساء", "المائدة"], c: 0, e: "سورة البقرة هي أطول سورة في القرآن الكريم وعدد آياتها 286 آية." },
                { q: "ما هي السورة التي تسمى 'قلب القرآن'؟", a: ["يس", "الفاتحة", "الإخلاص", "الملك"], c: 0, e: "اشتهرت سورة يس بلقب 'قلب القرآن' في بعض الأحاديث والآثار." },
                { q: "كم عدد أجزاء القرآن الكريم؟", a: ["30", "20", "40", "25"], c: 0, e: "ينقسم القرآن الكريم إلى 30 جزءاً متساوياً تقريباً لتسهيل القراءة والحفظ." },
                { q: "ما هي السورة التي يجب قراءتها في كل صلاة؟", a: ["الفاتحة", "الإخلاص", "الفلق", "الناس"], c: 0, e: "سورة الفاتحة هي ركن من أركان الصلاة ولا تصح الصلاة بدونها." },
                { q: "ما هي أول كلمة نزلت من القرآن؟", a: ["اقرأ", "باسم الله", "الحمد لله", "قل"], c: 0, e: "أول ما نزل على النبي صلى الله عليه وسلم هو قوله تعالى 'اقرأ باسم ربك الذي خلق'." },
                { q: "من هو أول من جمع القرآن في مصحف واحد؟", a: ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"], c: 0, e: "تم جمع القرآن لأول مرة في عهد أبي بكر الصديق رضي الله عنه بعد معركة اليمامة." },
                { q: "ما هي أقصر سورة في القرآن الكريم؟", a: ["الكوثر", "الإخلاص", "العصر", "الناس"], c: 0, e: "سورة الكوثر هي أقصر سورة في القرآن الكريم وتتكون من 3 آيات." },
                { q: "ما هي السورة التي تسمى 'عروس القرآن'؟", a: ["الرحمن", "يس", "الواقعة", "الملك"], c: 0, e: "تسمى سورة الرحمن 'عروس القرآن' لجمال أسلوبها وموضوعاتها." },
                { q: "كم عدد السجدات في القرآن الكريم؟", a: ["15", "12", "14", "10"], c: 0, e: "يوجد في القرآن الكريم 15 موضعاً للسجود (سجدات التلاوة)." }
            ],
            hadith: [
                { q: "من هو أشهر رواة الحديث؟", a: ["أبو هريرة", "عمر بن الخطاب", "علي بن أبي طالب", "عائشة بنت أبي بكر"], c: 0, e: "أبو هريرة رضي الله عنه هو أكثر الصحابة رواية للحديث النبوي." },
                { q: "عن ماذا يتحدث أول كتاب في صحيح البخاري؟", a: ["بدء الوحي", "الصلاة", "الزكاة", "الصيام"], c: 0, e: "بدأ الإمام البخاري كتابه بـ 'كتاب بدء الوحي' لبيان أصل الشريعة." },
                { q: "كم عدد أركان الإسلام؟", a: ["5", "4", "6", "7"], c: 0, e: "أركان الإسلام خمسة: الشهادتان، الصلاة، الزكاة، الصوم، وحج البيت." },
                { q: "ما معنى كلمة 'حديث'؟", a: ["الكلام أو الخبر", "التاريخ", "القصة", "القانون"], c: 0, e: "الحديث في اللغة هو الجديد، وفي الاصطلاح هو ما أضيف للنبي من قول أو فعل أو تقرير." },
                { q: "ما هو الكتاب الذي يعتبر أصح كتاب بعد القرآن؟", a: ["صحيح البخاري", "صحيح مسلم", "موطأ مالك", "سنن أبي داود"], c: 0, e: "أجمع العلماء على أن صحيح البخاري هو أصح الكتب بعد كتاب الله تعالى." }
            ],
            sunnah: [
                { q: "أي يد يجب على المسلم استخدامها للأكل؟", a: ["اليمنى", "اليسرى", "كلتاهما", "أي منهما"], c: 0, e: "من السنة الأكل باليد اليمنى، وقد نهى النبي عن الأكل بالشمال." },
                { q: "ما هي طريقة النوم المسنونة؟", a: ["على الجانب الأيمن", "على الجانب الأيسر", "على البطن", "جالساً"], c: 0, e: "كان النبي صلى الله عليه وسلم ينام على شقه الأيمن ويضع يده تحت خده." },
                { q: "كم مرة حج النبي صلى الله عليه وسلم؟", a: ["مرة واحدة", "مرتين", "ثلاث مرات", "لم يحج"], c: 0, e: "حج النبي صلى الله عليه وسلم مرة واحدة وهي 'حجة الوداع'." },
                { q: "ما هو السواك؟", a: ["عود لتنظيف الأسنان", "نوع من العطر", "لباس للصلاة", "نوع من الطعام"], c: 0, e: "السواك هو عود من شجر الأراك يستخدم لتنظيف الفم والأسنان وهو سنة مؤكدة." }
            ],
            adhkar: [
                { q: "ماذا نقول قبل الأكل؟", a: ["باسم الله", "الحمد لله", "سبحان الله", "الله أكبر"], c: 0, e: "السنة أن يبدأ المسلم طعامه بقول 'باسم الله'." },
                { q: "ماذا يقول المسلم بعد العطس؟", a: ["الحمد لله", "يرحمكم الله", "باسم الله", "أستغفر الله"], c: 0, e: "إذا عطس المسلم فليقل 'الحمد لله'، ويرد عليه السامع 'يرحمكم الله'." },
                { q: "ما هو أفضل الذكر؟", a: ["لا إله إلا الله", "الحمد لله", "سبحان الله", "الله أكبر"], c: 0, e: "قال النبي صلى الله عليه وسلم: 'أفضل الذكر لا إله إلا الله'." },
                { q: "ماذا نقول عند دخول المسجد؟", a: ["اللهم افتح لي أبواب رحمتك", "اللهم اغفر لي", "باسم الله توكلت على الله", "الحمد لله"], c: 0, e: "من السنة قول 'اللهم افتح لي أبواب رحمتك' عند دخول المسجد." }
            ]
        },
        medium: {
            quran: [
                { q: "ما هي السورة التي لا تبدأ بالبسملة؟", a: ["التوبة", "النمل", "الفاتحة", "الإخلاص"], c: 0, e: "سورة التوبة هي الوحيدة التي لا تبدأ بالبسملة، ولها أسباب ذكرها المفسرون." },
                { q: "في أي شهر نزل القرآن لأول مرة؟", a: ["رمضان", "رجب", "شعبان", "محرم"], c: 0, e: "نزل القرآن في ليلة القدر من شهر رمضان المبارك." },
                { q: "من هو النبي الذي ذكر أكثر في القرآن؟", a: ["موسى عليه السلام", "إبراهيم عليه السلام", "عيسى عليه السلام", "محمد صلى الله عليه وسلم"], c: 0, e: "ذكر نبي الله موسى عليه السلام في القرآن الكريم أكثر من 130 مرة." },
                { q: "كم سنة استغرق نزول القرآن كاملاً؟", a: ["23 سنة", "20 سنة", "25 سنة", "13 سنة"], c: 0, e: "نزل القرآن منجماً على النبي صلى الله عليه وسلم طوال فترة نبوته التي استمرت 23 عاماً." },
                { q: "ما هي السورة التي تسمى 'سنام القرآن'؟", a: ["البقرة", "يس", "الكهف", "آل عمران"], c: 0, e: "تسمى سورة البقرة سنام القرآن لعظم شأنها وطولها." }
            ],
            hadith: [
                { q: "من الذي جمع أصح مجموعة من الأحاديث؟", a: ["الإمام البخاري", "الإمام مسلم", "الإمام مالك", "الإمام أحمد"], c: 0, e: "الإمام البخاري هو صاحب 'الجامع الصحيح' الذي يعتبر أصح كتب الحديث." },
                { q: "ماذا تعني كلمة 'صحيح' في مصطلح الحديث؟", a: ["موثوق", "ضعيف", "موضوع", "حسن"], c: 0, e: "الحديث الصحيح هو ما اتصل سنده بنقل العدل الضابط عن مثله إلى منتهاه من غير شذوذ ولا علة." },
                { q: "كم عدد الأحاديث في صحيح البخاري (بدون تكرار)؟", a: ["حوالي 2600", "حوالي 7000", "حوالي 10000", "حوالي 1000"], c: 0, e: "يحتوي صحيح البخاري على حوالي 2602 حديثاً بدون المكررات." }
            ],
            sunnah: [
                { q: "ما اسم ناقة النبي صلى الله عليه وسلم؟", a: ["القصواء", "العضباء", "الجدعاء", "البراق"], c: 0, e: "القصواء هي الناقة التي هاجر عليها النبي صلى الله عليه وسلم." },
                { q: "ما هي 'العمرة'؟", a: ["زيارة الكعبة في أي وقت", "زيارة الكعبة في وقت الحج فقط", "الصلاة في المسجد النبوي", "الصيام في مكة"], c: 0, e: "العمرة هي زيارة البيت الحرام والقيام بمناسك مخصوصة في أي وقت من العام." }
            ],
            adhkar: [
                { q: "أي ذكر هو 'ثقيل في الميزان وخفيف على اللسان'؟", a: ["سبحان الله وبحمده سبحان الله العظيم", "لا إله إلا الله", "الحمد لله", "الله أكبر"], c: 0, e: "قال النبي: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن: سبحان الله وبحمده سبحان الله العظيم'." }
            ]
        },
        hard: {
            quran: [
                { q: "ما هي السورة التي تحتوي على بسملتين؟", a: ["النمل", "البقرة", "الإسراء", "الكهف"], c: 0, e: "سورة النمل تحتوي على بسملة في بدايتها وبسملة في الآية 30 'إنه من سليمان وإنه بسم الله الرحمن الرحيم'." },
                { q: "ما هي السورة التي تسمى 'الفاضحة'؟", a: ["التوبة", "المنافقون", "الأحزاب", "الفتح"], c: 0, e: "تسمى سورة التوبة 'الفاضحة' لأنها فضحت المنافقين وأظهرت نواياهم." },
                { q: "كم عدد السور المكية في القرآن؟", a: ["86", "28", "114", "90"], c: 0, e: "عدد السور المكية 86 سورة، والمدنية 28 سورة." }
            ],
            hadith: [
                { q: "ما هو 'الحديث القدسي'؟", a: ["كلام الله يرويه النبي", "كلام الصحابة", "كلام التابعين", "حديث ضعيف"], c: 0, e: "الحديث القدسي هو ما رواه النبي صلى الله عليه وسلم عن ربه عز وجل بلفظه هو." },
                { q: "ما هو الحديث 'المرسل'؟", a: ["ما رفعه التابعي إلى النبي مباشرة", "حديث منقطع السلسلة", "حديث رواه الكثير", "حديث موضوع"], c: 0, e: "المرسل هو ما سقط من آخره من بعد التابعي، أي أن التابعي يروي عن النبي مباشرة." },
                { q: "من هو واضع علم مصطلح الحديث؟", a: ["الرامهرمزي", "البخاري", "مسلم", "ابن الصلاح"], c: 0, e: "يعتبر القاضي أبو محمد الرامهرمزي أول من صنف في علم المصطلح في كتابه 'المحدث الفاصل'." }
            ]
        }
    },
    en: {
        easy: {
            quran: [
                { q: "How many Surahs are in the Holy Quran?", a: ["114", "110", "120", "104"], c: 0, e: "The Holy Quran consists of 114 Surahs, starting with Al-Fatiha and ending with An-Nas." },
                { q: "Which is the longest Surah in the Quran?", a: ["Al-Baqarah", "Al-Imran", "An-Nisa", "Al-Ma'idah"], c: 0, e: "Surah Al-Baqarah is the longest Surah in the Quran with 286 verses." },
                { q: "Which Surah is known as the 'Heart of the Quran'?", a: ["Yaseen", "Al-Fatiha", "Al-Ikhlas", "Al-Mulk"], c: 0, e: "Surah Yaseen is often referred to as the 'Heart of the Quran' based on some traditions." },
                { q: "How many Juz are in the Quran?", a: ["30", "20", "40", "25"], c: 0, e: "The Quran is divided into 30 equal parts called Juz to facilitate reading and memorization." },
                { q: "Which Surah must be recited in every prayer?", a: ["Al-Fatiha", "Al-Ikhlas", "Al-Falaq", "An-Nas"], c: 0, e: "Al-Fatiha is a pillar of prayer; the prayer is not valid without its recitation." },
                { q: "What is the first word revealed of the Quran?", a: ["Iqra", "Bismillah", "Alhamdulillah", "Qul"], c: 0, e: "The first word revealed to Prophet Muhammad (PBUH) was 'Iqra', which means 'Read'." },
                { q: "Who was the first person to compile the Quran into a book?", a: ["Abu Bakr (RA)", "Umar (RA)", "Uthman (RA)", "Ali (RA)"], c: 0, e: "The first compilation was done during the caliphate of Abu Bakr (RA) after the Battle of Yamama." },
                { q: "What is the shortest Surah in the Quran?", a: ["Al-Kawthar", "Al-Ikhlas", "Al-Asr", "An-Nas"], c: 0, e: "Surah Al-Kawthar is the shortest Surah with only 3 verses." },
                { q: "Which Surah is called 'The Bride of the Quran'?", a: ["Ar-Rahman", "Yaseen", "Al-Waqi'ah", "Al-Mulk"], c: 0, e: "Surah Ar-Rahman is called 'The Bride of the Quran' due to its beautiful style and content." },
                { q: "How many Sajdahs (prostrations) are in the Quran?", a: ["15", "12", "14", "10"], c: 0, e: "There are 15 places in the Quran where prostration (Sajdah al-Tilawah) is required." }
            ],
            hadith: [
                { q: "Who is the most famous narrator of Hadith?", a: ["Abu Hurairah", "Umar ibn al-Khattab", "Ali ibn Abi Talib", "Aisha bint Abi Bakr"], c: 0, e: "Abu Hurairah (RA) narrated the highest number of Hadiths from the Prophet (PBUH)." },
                { q: "What is the first book of Sahih al-Bukhari about?", a: ["Revelation", "Prayer", "Zakat", "Fasting"], c: 0, e: "Imam Bukhari started his collection with the 'Book of Revelation'." },
                { q: "How many pillars of Islam are there?", a: ["5", "4", "6", "7"], c: 0, e: "The five pillars are: Shahada, Salah, Zakat, Sawm, and Hajj." },
                { q: "What is the meaning of 'Hadith'?", a: ["Speech or news", "History", "Story", "Law"], c: 0, e: "In Islamic terminology, Hadith refers to the sayings, actions, or approvals of the Prophet (PBUH)." },
                { q: "Which book is considered most authentic after the Quran?", a: ["Sahih al-Bukhari", "Sahih Muslim", "Muwatta Malik", "Sunan Abi Dawud"], c: 0, e: "Sahih al-Bukhari is universally accepted as the most authentic book after the Quran." }
            ],
            sunnah: [
                { q: "Which hand should a Muslim use for eating?", a: ["Right", "Left", "Both", "Either"], c: 0, e: "It is Sunnah to eat with the right hand, and the Prophet (PBUH) forbade eating with the left." },
                { q: "What is the Sunnah way of sleeping?", a: ["On the right side", "On the left side", "On the stomach", "Sitting up"], c: 0, e: "The Prophet (PBUH) used to sleep on his right side with his hand under his cheek." },
                { q: "How many times did the Prophet (PBUH) perform Hajj?", a: ["Once", "Twice", "Three times", "Never"], c: 0, e: "The Prophet (PBUH) performed Hajj only once, known as the 'Farewell Hajj'." },
                { q: "What is a Siwak?", a: ["A tooth-cleaning twig", "A type of perfume", "A prayer garment", "A type of food"], c: 0, e: "Siwak is a twig from the Arak tree used for cleaning teeth, which is a highly recommended Sunnah." }
            ],
            adhkar: [
                { q: "What should we say before eating?", a: ["Bismillah", "Alhamdulillah", "SubhanAllah", "Allahu Akbar"], c: 0, e: "It is Sunnah to start eating by saying 'Bismillah' (In the name of Allah)." },
                { q: "What should we say after sneezing?", a: ["Alhamdulillah", "YarhamukAllah", "Bismillah", "Astaghfirullah"], c: 0, e: "A Muslim should say 'Alhamdulillah' after sneezing, and the listener should reply 'YarhamukAllah'." },
                { q: "What is the best Dhikr?", a: ["La ilaha illAllah", "Alhamdulillah", "SubhanAllah", "Allahu Akbar"], c: 0, e: "The Prophet (PBUH) said: 'The best Dhikr is La ilaha illAllah'." },
                { q: "What do we say when entering a Mosque?", a: ["O Allah, open for me the gates of Your mercy", "O Allah, forgive me", "In the name of Allah, I trust in Allah", "Alhamdulillah"], c: 0, e: "The Sunnah is to say 'Allahumma-ftah li abwaba rahmatik' when entering the mosque." }
            ]
        },
        medium: {
            quran: [
                { q: "Which Surah does not start with Bismillah?", a: ["At-Tawbah", "Al-Naml", "Al-Fatiha", "Al-Ikhlas"], c: 0, e: "Surah At-Tawbah is the only Surah that does not begin with Bismillah." },
                { q: "In which month was the Quran first revealed?", a: ["Ramadan", "Rajab", "Sha'ban", "Muharram"], c: 0, e: "The Quran was first revealed during the night of Laylat al-Qadr in the month of Ramadan." },
                { q: "Which Prophet is mentioned most in the Quran?", a: ["Musa (AS)", "Ibrahim (AS)", "Isa (AS)", "Muhammad (PBUH)"], c: 0, e: "Prophet Musa (AS) is mentioned by name more than 130 times in the Quran." },
                { q: "How many years did it take for the full revelation of the Quran?", a: ["23 years", "20 years", "25 years", "13 years"], c: 0, e: "The Quran was revealed gradually over a period of 23 years." },
                { q: "Which Surah is called 'The Peak of the Quran'?", a: ["Al-Baqarah", "Yaseen", "Al-Kahf", "Al-Imran"], c: 0, e: "Surah Al-Baqarah is called the 'Sanam' (Peak) of the Quran." }
            ],
            hadith: [
                { q: "Who compiled the most authentic collection of Hadith?", a: ["Imam Bukhari", "Imam Muslim", "Imam Malik", "Imam Ahmad"], c: 0, e: "Imam Bukhari is the author of 'Al-Jami' al-Sahih', the most authentic Hadith collection." },
                { q: "What does 'Sahih' mean in Hadith terminology?", a: ["Authentic", "Weak", "Fabricated", "Good"], c: 0, e: "A Sahih Hadith is one with a connected chain of narrators, all of whom are reliable and accurate." },
                { q: "How many Hadith are in Sahih al-Bukhari (without repetitions)?", a: ["Approx. 2,600", "Approx. 7,000", "Approx. 10,000", "Approx. 1,000"], c: 0, e: "Sahih al-Bukhari contains approximately 2,602 Hadiths without repetitions." }
            ],
            sunnah: [
                { q: "What was the name of the Prophet's (PBUH) camel?", a: ["Al-Qaswa", "Al-Adba", "Al-Jada", "Al-Burraq"], c: 0, e: "Al-Qaswa was the camel the Prophet (PBUH) rode during the Hijra." },
                { q: "What is 'Umrah'?", a: ["Visiting the Kaaba at any time", "Visiting the Kaaba only during Hajj", "Praying in the Prophet's Mosque", "Fasting in Mecca"], c: 0, e: "Umrah is a pilgrimage to the Kaaba that can be performed at any time of the year." }
            ],
            adhkar: [
                { q: "Which Dhikr is 'heavy on the scale and light on the tongue'?", a: ["SubhanAllahi wa bihamdihi, SubhanAllahil Azeem", "La ilaha illAllah", "Alhamdulillah", "Allahu Akbar"], c: 0, e: "The Prophet said: 'Two words are light on the tongue, heavy on the scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil Azeem'." }
            ]
        },
        hard: {
            quran: [
                { q: "Which Surah contains two Bismillahs?", a: ["Al-Naml", "Al-Baqarah", "Al-Isra", "Al-Kahf"], c: 0, e: "Surah Al-Naml has Bismillah at the start and another in verse 30." },
                { q: "Which Surah is called 'The Exposer' (Al-Fadihah)?", a: ["At-Tawbah", "Al-Munafiqun", "Al-Ahzab", "Al-Fath"], c: 0, e: "Surah At-Tawbah is called 'Al-Fadihah' because it exposed the hypocrites." },
                { q: "How many Meccan Surahs are in the Quran?", a: ["86", "28", "114", "90"], c: 0, e: "There are 86 Meccan Surahs and 28 Medinan Surahs." }
            ],
            hadith: [
                { q: "What is a 'Hadith Qudsi'?", a: ["Words of Allah narrated by the Prophet", "Words of the Sahaba", "Words of the Tabi'un", "A weak hadith"], c: 0, e: "A Hadith Qudsi is a revelation from Allah expressed in the words of the Prophet (PBUH)." },
                { q: "What is a 'Mursal' Hadith?", a: ["A hadith where a Tabi'i narrates directly from the Prophet", "A hadith with a broken chain", "A hadith narrated by many people", "A fabricated hadith"], c: 0, e: "A Mursal Hadith is one where a Tabi'i (successor) narrates directly from the Prophet, omitting the Sahabi." },
                { q: "Who was the first to write a book on Hadith terminology?", a: ["Al-Ramahurmuzi", "Bukhari", "Muslim", "Ibn al-Salah"], c: 0, e: "Al-Ramahurmuzi is considered the first to write a dedicated book on Hadith terminology." }
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
        savedProgress: null,
        streak: 0,
        maxStreak: 0,
        hintUsed: false,
        hiddenAnswers: [],
        showExplanation: false
    };

    const LEADERBOARD_KEY = 'islamic_quiz_leaderboard';

    const saveToLeaderboard = (score, level, category) => {
        const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        const entry = {
            score,
            level,
            category,
            date: new Date().toISOString(),
            name: localStorage.getItem('userName') || 'User'
        };
        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard.slice(0, 10)));
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

    const renderLeaderboard = () => {
        const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        if (leaderboard.length === 0) {
            return `<div class="text-center opacity-60 py-8 glass-card rounded-3xl border border-slate-100 dark:border-slate-800">${t('noLeaderboardData')}</div>`;
        }

        return `
            <div class="space-y-6">
                <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3 px-2">
                    <span class="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                        ${TrophyIcon({className: 'w-6 h-6'})}
                    </span>
                    ${t('leaderboard')}
                </h3>
                <div class="glass-card rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left rtl:text-right">
                            <thead class="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th class="px-6 py-4">${t('rank')}</th>
                                    <th class="px-6 py-4">${t('name')}</th>
                                    <th class="px-6 py-4">${t('score')}</th>
                                    <th class="px-6 py-4">${t('date')}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${leaderboard.map((entry, index) => `
                                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td class="px-6 py-4">
                                            <span class="w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
                                                ${index + 1}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">${entry.name}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 rounded-full bg-theme-50 dark:bg-theme-900/20 text-theme-600 dark:text-theme-400 font-bold">
                                                ${entry.score}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-slate-400">${new Date(entry.date).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    };

    const startQuiz = (level, category) => {
        const lang = getCurrentLanguage();
        const langData = QUIZ_DATA[lang] || QUIZ_DATA.en;
        const levelData = langData[level];
        const categoryQuestions = levelData[category] || levelData['quran'];
        
        state.level = level;
        state.category = category;
        state.streak = 0;
        state.maxStreak = 0;
        state.hintUsed = false;
        state.hiddenAnswers = [];
        state.showExplanation = false;
        
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
        state.timer = state.level === 'hard' ? 15 : (state.level === 'medium' ? 20 : 30);
        
        saveProgress();
        
        if (state.timer > 0) {
            startTimer();
        }
        
        render();
    };

    const useHint = () => {
        if (state.hintUsed || state.view !== 'quiz') return;
        
        const currentQuestion = state.questions[state.currentQuestionIndex];
        const incorrectIndices = [];
        currentQuestion.a.forEach((ans, idx) => {
            if (idx !== currentQuestion.c) incorrectIndices.push(idx);
        });

        // Randomly pick 2 incorrect answers to hide
        state.hiddenAnswers = shuffleArray([...incorrectIndices]).slice(0, 2);
        state.hintUsed = true;
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
        
        if (isCorrect) {
            state.score += 10 + (state.streak * 2);
            state.streak++;
            state.maxStreak = Math.max(state.maxStreak, state.streak);
        } else {
            state.streak = 0;
        }

        state.userAnswers.push({
            question: currentQuestion.q,
            userAnswer: answerIndex === -1 ? t('timeout') : currentQuestion.a[answerIndex],
            correctAnswer: currentQuestion.a[currentQuestion.c],
            isCorrect,
            explanation: currentQuestion.e
        });

        state.showExplanation = true;
        render();

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
            state.hiddenAnswers = [];
            state.showExplanation = false;
            if (state.currentQuestionIndex < state.questions.length) {
                state.timer = state.level === 'hard' ? 15 : (state.level === 'medium' ? 20 : 30);
                if (state.timer > 0) startTimer();
                render();
            } else {
                saveToLeaderboard(state.score, state.level, state.category);
                clearProgress();
                state.view = 'results';
                render();
            }
        }, 3000);
    };

    const renderLanding = () => {
        const lang = getCurrentLanguage();
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 fade-in">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-4">
                        <button id="quiz-back-btn" class="p-2 rounded-full glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-800">
                            ${BackIcon({className: "w-5 h-5"})}
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
                                <button data-level="${lvl}" class="level-btn p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 glass-card text-left transition-all hover:border-theme-500 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
                                    <div class="absolute top-0 right-0 w-24 h-24 bg-theme-500/5 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div class="flex justify-between items-center relative z-10">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm">
                                                ${idx + 1}
                                            </div>
                                            <div>
                                                <h4 class="font-bold text-lg capitalize text-slate-800 dark:text-slate-200 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${t(lvl)}</h4>
                                                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">${t(lvl + 'Desc')}</p>
                                            </div>
                                        </div>
                                        <div class="text-slate-300 dark:text-slate-600 group-hover:text-theme-500 dark:group-hover:text-theme-400 transition-all transform group-hover:translate-x-1">
                                            ${ChevronRightIcon({className: `w-6 h-6 ${isRtl ? 'rotate-180' : ''}`})}
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
                                <button data-category="${cat}" class="category-btn p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 glass-card text-center transition-all hover:border-theme-500 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
                                    <div class="absolute inset-0 bg-gradient-to-br from-theme-500/0 to-theme-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div class="relative z-10">
                                        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm group-hover:scale-110">
                                            ${cat === 'quran' ? BrainIcon({className: 'w-8 h-8'}) : TrophyIcon({className: 'w-8 h-8'})}
                                        </div>
                                        <h4 class="font-bold capitalize text-slate-800 dark:text-slate-200 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${t(cat)}</h4>
                                    </div>
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
                if (b.dataset.level === selectedLevel) b.classList.add('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]', 'ring-2', 'ring-theme-500/20');
                else b.classList.remove('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]', 'ring-2', 'ring-theme-500/20');
            });
            catBtns.forEach(b => {
                if (b.dataset.category === selectedCategory) b.classList.add('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]', 'ring-2', 'ring-theme-500/20');
                else b.classList.remove('border-theme-500', 'bg-theme-50/50', 'dark:bg-theme-900/10', 'scale-[1.02]', 'ring-2', 'ring-theme-500/20');
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

        // Append Leaderboard
        const leaderboardContainer = document.createElement('div');
        leaderboardContainer.className = 'mt-12';
        leaderboardContainer.innerHTML = renderLeaderboard();
        container.querySelector('.max-w-4xl').appendChild(leaderboardContainer);
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
                        ${state.streak > 1 ? `
                            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold animate-bounce">
                                ${TrophyIcon({className: 'w-3.5 h-3.5'})}
                                <span>${state.streak} ${t('streak')}</span>
                            </div>
                        ` : ''}
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

                <div class="p-8 md:p-16 rounded-[3rem] glass-card border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-theme-500/5 rounded-bl-full -mr-16 -mt-16"></div>
                    <h2 class="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white text-center leading-tight mb-12 relative z-10">${question.q}</h2>
                    
                    <div class="grid grid-cols-1 gap-4 relative z-10">
                        ${question.a.map((ans, idx) => {
                            const isHidden = state.hiddenAnswers.includes(idx);
                            return `
                                <button data-index="${idx}" class="quiz-option w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-left font-bold text-slate-700 dark:text-slate-300 hover:border-theme-500 hover:bg-theme-50/50 dark:hover:bg-theme-900/10 transition-all active:scale-[0.98] group ${isHidden ? 'opacity-0 pointer-events-none' : ''}">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-xl glass flex items-center justify-center text-sm text-slate-400 group-hover:bg-theme-600 group-hover:text-white transition-all">
                                                ${String.fromCharCode(65 + idx)}
                                            </div>
                                            <span class="text-lg">${ans}</span>
                                        </div>
                                        <div class="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-theme-500 transition-all"></div>
                                    </div>
                                </button>
                            `;
                        }).join('')}
                    </div>

                    <div class="mt-8 flex justify-center">
                        <button id="hint-btn" class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/20 transition-all disabled:opacity-30 disabled:grayscale" ${state.hintUsed ? 'disabled' : ''}>
                            ${BrainIcon({className: 'w-5 h-5'})}
                            <span>${t('hint5050')}</span>
                        </button>
                    </div>

                    ${state.showExplanation ? `
                        <div class="mt-8 p-6 bg-theme-50 dark:bg-theme-900/20 border border-theme-100 dark:border-theme-900/30 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
                            <p class="text-sm font-bold mb-2 text-theme-600 dark:text-theme-400 uppercase tracking-wider">${t('explanation')}</p>
                            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${question.e || ''}</p>
                        </div>
                    ` : ''}
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

        container.querySelector('#hint-btn').onclick = useHint;
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
                <div class="p-12 md:p-20 rounded-[4rem] glass-card border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-theme-500/5 rounded-full -mt-48"></div>
                    
                    <div class="relative z-10 space-y-8">
                        <div class="w-28 h-28 mx-auto glass rounded-full flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-inner">
                            ${TrophyIcon({className: 'w-14 h-14'})}
                        </div>
                        
                        <div class="space-y-3">
                            <h2 class="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">${t('quizCompleted')}</h2>
                            <p class="text-xl md:text-2xl ${colorClass} font-bold">${message}</p>
                        </div>

                        <div class="grid grid-cols-3 gap-8 py-10 border-y border-slate-100 dark:border-slate-800">
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${t('score')}</p>
                                <p class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white font-display">${state.score}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${t('accuracy')}</p>
                                <p class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white font-display">${Math.round(percentage)}%</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${t('streak')}</p>
                                <p class="text-4xl md:text-5xl font-bold text-orange-500 font-display">${state.maxStreak}</p>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button id="retry-quiz-btn" class="flex-1 px-8 py-5 bg-theme-600 text-white font-bold rounded-2xl shadow-xl shadow-theme-500/30 hover:bg-theme-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                                ${RefreshIcon({className: 'w-5 h-5'})} ${t('tryAgain')}
                            </button>
                            <button id="finish-quiz-btn" class="flex-1 px-8 py-5 glass text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                                ${t('backToHome')}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-6 text-left rtl:text-right">
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200 px-6">${t('reviewAnswers')}</h3>
                    <div class="space-y-4">
                        ${state.userAnswers.map((ans, idx) => `
                            <div class="p-8 rounded-[2.5rem] glass-card border ${ans.isCorrect ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-red-100 dark:border-red-900/20'} shadow-sm hover:shadow-md transition-shadow">
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
