
import { t, getCurrentLanguage } from '../i18n.js';
import { ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, CopyIcon, ShieldIcon } from './Icons.js';

const HISN_DATA = [
    {
        id: 'morning',
        title_ar: 'أذكار الصباح',
        title_en: 'Morning Adhkar',
        duas: [
            {
                id: 1,
                arabic: "اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ النُّـشُور.",
                transliteration: "Allāhumma bika aṣbaḥnā wa bika amsaynā, wa bika naḥyā wa bika namūtu wa ilaykan-nushūr.",
                translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Final Return.",
                reference: "At-Tirmidhi 3:142"
            },
            {
                id: 2,
                arabic: "أَصْبَحْنا وَأَصْبَحَ المُلْكُ لله وَالحَمدُ لله، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير.",
                transliteration: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh walḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa `alā kulli shay'in qadīr.",
                translation: "We have entered a new morning and with it all dominion is Allah's, and praise is due to Allah. None has the right to be worshiped but Allah alone, He has no partner. To Him belongs the dominion, and to Him is the praise and He is able to do all things.",
                reference: "Muslim 4:2088"
            },
            {
                id: 3,
                arabic: "اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ.",
                transliteration: "Allāhumma `āfinī fī badanī, Allāhumma `āfinī fī sam`ī, Allāhumma `āfinī fī baṣarī, lā ilāha illā Ant.",
                translation: "O Allah, make me healthy in my body. O Allah, make me healthy in my hearing. O Allah, make me healthy in my sight. There is no god but You.",
                reference: "Abu Dawud 4:324"
            },
            {
                id: 4,
                arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلامِ، وَعَلَى كَلِمَةِ الإِخْلاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.",
                transliteration: "Aṣbaḥnā `alā fiṭratil-Islām, wa `alā kalimatil-ikhlāṣ, wa `alā dīni nabiyyinā Muḥammadin (ṣallallāhu `alayhi wa sallam), wa `alā millati abīnā Ibrāhīma ḥanīfan musliman wa mā kāna minal-mushrikīn.",
                translation: "We have entered a new morning upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace and blessings of Allah be upon him), and the faith of our father Ibrahim, a man of pure belief (and a Muslim), and he was not of those who associate others with Allah.",
                reference: "Ahmad 3:406"
            },
            {
                id: 5,
                arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
                transliteration: "Yā Ḥayyu yā Qayyūm, biraḥmatika astaghīth, aṣliḥ lī sha'nī kullahu wa lā takilnī ilā nafsī ṭarfata `ayn.",
                translation: "O Ever Living One, O Self-Sustaining One, in Your mercy I seek relief. Set all my affairs right and do not leave me to myself even for the blink of an eye.",
                reference: "Al-Hakim 1:545"
            }
        ]
    },
    {
        id: 'evening',
        title_ar: 'أذكار المساء',
        title_en: 'Evening Adhkar',
        duas: [
            {
                id: 1,
                arabic: "اللّهُـmَّ بِكَ أَمْسَـينا وَبِكَ أَصْـبَحْنا، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ الْمَصِير.",
                transliteration: "Allāhumma bika amsaynā wa bika aṣbaḥnā, wa bika naḥyā wa bika namūtu wa ilaykal-maṣīr.",
                translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the Final Return.",
                reference: "At-Tirmidhi 3:142"
            },
            {
                id: 2,
                arabic: "أَمْسَيْنا وَأَمْسَى الْمُلْكُ للهِ رَبِّ الْعَالَمَيْن، اللَّهُمَّ إِنِّي أسْأَلُكَ خَيْرَ هَذَه اللَّيْلَةِ فَتْحَهَا ونَصْرَهَا، ونُوْرَهَا وبَرَكَتهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فيهَا وَشَرِّ مَا بَعْدَهَا.",
                transliteration: "Amsaynā wa amsal-mulku lillāhi Rabbil-`ālamīn. Allāhumma innī as'aluka khayra hādhihil-laylah: fatḥahā, wa naṣrahā, wa nūrahā, wa barakatahā, wa hudāhā, wa a`ūdhu bika min sharri mā fīhā wa sharri mā ba`dahā.",
                translation: "We have entered the evening and at this very time all dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the goodness of this night: its victory, its help, its light, its blessings, and its guidance. I seek refuge in You from the evil it contains and the evil that comes after it.",
                reference: "Abu Dawud 4:322"
            },
            {
                id: 3,
                arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
                transliteration: "A`ūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq.",
                translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
                reference: "Muslim 4:2080"
            },
            {
                id: 4,
                arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ.",
                transliteration: "Allāhumma innī a`ūdhu bika minal-hammi wal-ḥazan, wal-`ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala`id-dayni wa ghalabatir-rijāl.",
                translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
                reference: "Al-Bukhari 7:158"
            }
        ]
    },
    {
        id: 'sleeping',
        title_ar: 'أذكار النوم',
        title_en: 'Before Sleeping',
        duas: [
            {
                id: 1,
                arabic: "بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي ، وَبِكَ أَرْفَعُـه، فَإِن أَمْسَـكْتَ نَفْسـي فَارْحَـمْها ، وَإِنْ أَرْسَلْتَـها فَاحْفَظْـها بِمـا تَحْفَـظُ بِه عِبـادَكَ الصّـالِحـين.",
                transliteration: "Bismika Rabbī waḍa`tu janbī, wa bika arfa`uh, fa'in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihi `ibādakaṣ-ṣāliḥīn.",
                translation: "In Your Name my Lord, I lay myself down and I get up again. If You take my soul, have mercy on it, and if You send it back, protect it as You protect Your righteous slaves.",
                reference: "Al-Bukhari 11:126"
            },
            {
                id: 2,
                arabic: "اللّهُـمَّ إِنَّـكَ خَلَـقْتَ نَفْسـي وَأَنْـتَ تَوَفّـاهـا لَكَ ممَـاتُـها وَمَحْـياها ، إِنْ أَحْيَيْـتَها فَاحْفَظْـها ، وَإِنْ أَمَتَّـها فَاغْفِـرْ لَـها . اللّهُـمَّ إِنَّـي أَسْـأَلُـكَ العـافِـيَة.",
                transliteration: "Allāhumma innaka khalaqta nafsī wa Anta tawaffāhā, laka mamātuhā wa maḥyāhā, in aḥyaytahā faḥfaẓhā, wa in amattahā faghfir lahā. Allāhumma innī as'alukal-`āfiyah.",
                translation: "O Allah, You have created my soul and You take it back. Unto You is its death and its life. If You give it life then protect it, and if You cause it to die then forgive it. O Allah, I ask You for strength.",
                reference: "Muslim 4:2083"
            },
            {
                id: 3,
                arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
                transliteration: "Allāhumma qinī `adhābaka yawma tab`athu `ibādak.",
                translation: "O Allah, save me from Your punishment on the Day that You resurrect Your slaves.",
                reference: "Abu Dawud 4:311"
            }
        ]
    },
    {
        id: 'waking',
        title_ar: 'أذكار الاستيقاظ',
        title_en: 'Waking Up',
        duas: [
            {
                id: 1,
                arabic: "الحَمْـدُ لِلّهِ الّذي أَحْـيانا بَعْـدَ ما أَماتَـنا وَإليه النُّـشور.",
                transliteration: "Alḥamdu lillāhil-ladhī aḥyānā ba`da mā amātanā wa ilayhin-nushūr.",
                translation: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the return.",
                reference: "Al-Bukhari 11:113"
            },
            {
                id: 2,
                arabic: "لا إلهَ إلاّ اللّهُ وَحْـدَهُ لا شَـريكَ له، لهُ المُلـكُ ولهُ الحَمـد، وهُوَ على كُلّ شَيءٍ قَدير، سُبْحانَ اللهِ، والحمْدُ لله ، ولا إلهَ إلاّ اللهُ واللهُ أكْبَر، وَلا حَولَ وَلا قوّة إلاّ باللّهِ العليّ العظيم.",
                transliteration: "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa `alā kulli shay'in qadīr. Subḥānallāhi, walḥamdu lillāhi, wa lā ilāha illallāhu, wallāhu akbar, wa lā ḥawla wa lā quwwata illā billāhil-`aliyyil-`aẓīm.",
                translation: "None has the right to be worshiped but Allah alone, He has no partner. To Him belongs the dominion, and to Him is the praise and He is able to do all things. Glory is to Allah. Praise is to Allah. None has the right to be worshiped but Allah. Allah is the Greatest. There is no power and no strength except by Allah, the Exalted, the Mighty.",
                reference: "Al-Bukhari, Ibn Majah"
            },
            {
                id: 3,
                arabic: "الحَمْدُ للهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
                transliteration: "Alḥamdu lillāhil-ladhī `āfānī fī jasadī, wa radda `alayya rūḥī, wa adhina lī bidhikrih.",
                translation: "Praise is to Allah Who has given my body health, and restored my soul to me, and permitted me to remember Him.",
                reference: "At-Tirmidhi 5:473"
            }
        ]
    },
    {
        id: 'prayer',
        title_ar: 'أذكار الصلاة',
        title_en: 'Prayer Adhkar',
        duas: [
            {
                id: 1,
                arabic: "أَسْـتَغْفِرُ الله، أَسْـتَغْفِرُ الله، أَسْـتَغْفِرُ الله. اللّهُـمَّ أَنْـتَ السَّلامُ ، وَمِـنْكَ السَّلام ، تَبارَكْتَ يا ذا الجَـلالِ وَالإِكْـرام.",
                transliteration: "Astaghfirullāh, Astaghfirullāh, Astaghfirullāh. Allāhumma Antas-Salām wa minkas-salām, tabārakta yā Dhal-Jalāli wal-Ikrām.",
                translation: "I ask Allah for forgiveness (three times). O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honor.",
                reference: "Muslim 1:414"
            },
            {
                id: 2,
                arabic: "لا إلهَ إلاّ اللّهُ وحدَهُ لا شريكَ لهُ، لهُ المُـلْكُ ولهُ الحَمْد، وهوَ على كلّ شَيءٍ قَدير، اللّهُـمَّ لا مانِعَ لِما أَعْطَـيْت، وَلا مُعْطِـيَ لِما مَنَـعْت، وَلا يَنْفَـعُ ذا الجَـدِّ مِنْـكَ الجَـد.",
                transliteration: "Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa `alā kulli shay'in qadīr. Allāhumma lā māni`a limā a`ṭayta, wa lā mu`ṭiya limā mana`ta, wa lā yanfa`u dhal-jaddi minkal-jadd.",
                translation: "None has the right to be worshiped but Allah alone, He has no partner. To Him belongs the dominion, and to Him is the praise and He is able to do all things. O Allah, there is none who can withhold what You give, and none may give what You have withheld; and the might of the mighty person cannot benefit him against You.",
                reference: "Al-Bukhari 1:255"
            },
            {
                id: 3,
                arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.",
                transliteration: "Allāhumma a`innī `alā dhikrika, wa shukrika, wa ḥusni `ibādatik.",
                translation: "O Allah, help me to remember You, to give You thanks, and to perform Your worship in the best manner.",
                reference: "Abu Dawud 2:86"
            }
        ]
    },
    {
        id: 'distress',
        title_ar: 'أذكار الكرب',
        title_en: 'Distress & Anxiety',
        duas: [
            {
                id: 1,
                arabic: "لَا إِلَهَ إِلَّا اللهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ.",
                transliteration: "Lā ilāha illallāhul-`Aẓīmul-Ḥalīm, lā ilāha illallāhu Rabbul-`Arshil-`Aẓīm, lā ilāha illallāhu Rabbus-samāwāti wa Rabbul-arḍi wa Rabbul-`Arshil-Karīm.",
                translation: "There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens and Lord of the earth, and Lord of the Noble Throne.",
                reference: "Al-Bukhari 7:154"
            },
            {
                id: 2,
                arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ.",
                transliteration: "Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata `ayn, wa aṣliḥ lī sha'nī kullahu lā ilāha illā Ant.",
                translation: "O Allah, I hope for Your mercy. Do not leave me to myself even for the blink of an eye, and set all my affairs right for me. There is no god but You.",
                reference: "Abu Dawud 4:324"
            },
            {
                id: 3,
                arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.",
                transliteration: "Lā ilāha illā Anta subḥānaka innī kuntu minaẓ-ẓālimīn.",
                translation: "There is no god but You, Glory is to You, surely I have been of the wrongdoers.",
                reference: "At-Tirmidhi 5:529"
            }
        ]
    },
    {
        id: 'travel',
        title_ar: 'أذكار السفر',
        title_en: 'Travel Adhkar',
        duas: [
            {
                id: 1,
                arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ.",
                transliteration: "Subḥānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā Rabbinā lamunqalibūn.",
                translation: "Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning.",
                reference: "Muslim 2:998"
            },
            {
                id: 2,
                arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى.",
                transliteration: "Allāhumma innā nas'aluka fī safarinā hādhā al-birra wat-taqwā, wa minal-`amali mā tarḍā.",
                translation: "O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You.",
                reference: "Muslim 2:998"
            }
        ]
    }
];

export const renderHisnMuslim = (container) => {
    const lang = getCurrentLanguage();
    let state = {
        view: 'categories', // 'categories' or 'details'
        selectedCategory: null
    };

    const render = () => {
        if (state.view === 'categories') {
            renderCategories();
        } else {
            renderDetails();
        }
    };

    const setState = (newState) => {
        Object.assign(state, newState);
        render();
    };

    const renderCategories = () => {
        container.innerHTML = `
            <div class="space-y-6 fade-in">
                <div class="flex items-center gap-3">
                    <h2 class="text-3xl font-bold text-theme-700 dark:text-theme-400 font-amiri">${t('hisnMuslim')}</h2>
                </div>
                <p class="text-slate-600 dark:text-slate-400">${t('hisnMuslimDesc')}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    ${HISN_DATA.map(category => `
                        <div data-category-id="${category.id}" class="category-card p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md hover:border-theme-500 transition-all duration-200 group">
                            <div class="flex justify-between items-center mb-3">
                                <div class="w-10 h-10 rounded-full bg-theme-100 dark:bg-theme-900/50 flex items-center justify-center text-theme-600 dark:text-theme-400">
                                    ${ShieldIcon()}
                                </div>
                                <span class="text-slate-400 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                                    ${lang === 'ar' ? ArrowLeftIcon() : ChevronRightIcon()}
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 font-amiri">${category.title_ar}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${category.title_en}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = HISN_DATA.find(c => c.id === card.dataset.categoryId);
                setState({ view: 'details', selectedCategory: category });
                window.scrollTo(0, 0);
            });
        });
    };

    const renderDetails = () => {
        if (!state.selectedCategory) return;
        const cat = state.selectedCategory;
        const isRtl = lang === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        container.innerHTML = `
            <div class="space-y-6 fade-in">
                <div class="flex items-center gap-4 mb-6">
                    <button id="hisn-back-btn" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        ${BackIcon()}
                        <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                    </button>
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 font-amiri">${cat.title_ar}</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${cat.title_en}</p>
                    </div>
                </div>

                <div class="space-y-6">
                    ${cat.duas.map((dua, index) => `
                        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div class="p-6 space-y-4">
                                <p class="text-right font-amiri text-2xl md:text-3xl leading-[2.2] text-slate-800 dark:text-slate-200">${dua.arabic}</p>
                                <hr class="border-slate-100 dark:border-slate-800" />
                                <p class="text-sm text-slate-500 dark:text-slate-400 italic">${dua.transliteration}</p>
                                <p class="text-base text-slate-700 dark:text-slate-300 leading-relaxed">${dua.translation}</p>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                                <span class="text-xs font-bold text-theme-600 dark:text-theme-400 bg-theme-100 dark:bg-theme-900/30 px-2 py-1 rounded">${dua.reference}</span>
                                <button class="copy-btn p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400" data-text="${dua.arabic}" title="${t('copy')}">
                                    ${CopyIcon()}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.querySelector('#hisn-back-btn').addEventListener('click', () => {
            setState({ view: 'categories', selectedCategory: null });
        });

        container.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = btn.dataset.text;
                navigator.clipboard.writeText(text).then(() => {
                    window.showToast(t('copySuccess'));
                });
            });
        });
    };

    render();
};
