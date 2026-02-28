
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
                ind: "Ya Allah, dengan-Mu kami memasuki pagi, dengan-Mu kami memasuki sore, dengan-Mu kami hidup, dengan-Mu kami mati dan kepada-Mu tempat kembali.",
                tr: "Allah'ım! Senin yardımınla sabaha erdik, Senin yardımınla akşama erdik. Senin yardımınla yaşar, Senin yardımınla ölürüz. Dönüş Sanadır.",
                reference: "At-Tirmidhi 3:142"
            },
            {
                id: 2,
                arabic: "أَصْبَحْنا وَأَصْبَحَ المُلْكُ لله وَالحَمدُ لله، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير.",
                transliteration: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh walḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa `alā kulli shay'in qadīr.",
                translation: "We have entered a new morning and with it all dominion is Allah's, and praise is due to Allah. None has the right to be worshiped but Allah alone, He has no partner. To Him belongs the dominion, and to Him is the praise and He is able to do all things.",
                ind: "Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya puji-pujian dan Dia Maha Kuasa atas segala sesuatu.",
                tr: "Sabaha erdik, mülk de Allah'ın olarak sabaha erdi. Hamd Allah'adır. Allah'tan başka ilah yoktur, O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır ve O her şeye kadirdir.",
                reference: "Muslim 4:2088"
            },
            {
                id: 3,
                arabic: "اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـmَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ.",
                transliteration: "Allāhumma `āfinī fī badanī, Allāhumma `āfinī fī sam`ī, Allāhumma `āfinī fī baṣarī, lā ilāha illā Ant.",
                translation: "O Allah, make me healthy in my body. O Allah, make me healthy in my hearing. O Allah, make me healthy in my sight. There is no god but You.",
                ind: "Ya Allah, sehatkanlah badanku, Ya Allah, sehatkanlah pendengaranku, Ya Allah, sehatkanlah penglihatanku. Tidak ada Tuhan selain Engkau.",
                tr: "Allah'ım! Bedenime afiyet ver. Allah'ım! Kulağıma afiyet ver. Allah'ım! Gözüme afiyet ver. Senden başka ilah yoktur.",
                reference: "Abu Dawud 4:324"
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
                arabic: "اللّهُـمَّ بِكَ أَمْسَـينا وَبِكَ أَصْـبَحْنا، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ الْمَصِير.",
                transliteration: "Allāhumma bika amsaynā wa bika aṣbaḥnā, wa bika naḥyā wa bika namūtu wa ilaykal-maṣīr.",
                translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the Final Return.",
                ind: "Ya Allah, dengan-Mu kami memasuki sore, dengan-Mu kami memasuki pagi, dengan-Mu kami hidup, dengan-Mu kami mati dan kepada-Mu tempat kembali.",
                tr: "Allah'ım! Senin yardımınla akşama erdik, Senin yardımınla sabaha erdik. Senin yardımınla yaşar, Senin yardımınla ölürüz. Dönüş Sanadır.",
                reference: "At-Tirmidhi 3:142"
            },
            {
                id: 2,
                arabic: "أَمْسَيْنا وَأَمْسَى الْمُلْكُ للهِ رَبِّ الْعَالَمَيْن، اللَّهُمَّ إِنِّي أسْأَلُكَ خَيْرَ هَذَه اللَّيْلَةِ فَتْحَهَا ونَصْرَهَا، ونُوْرَهَا وبَرَكَتهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فيهَا وَشَرِّ مَا بَعْدَهَا.",
                transliteration: "Amsaynā wa amsal-mulku lillāhi Rabbil-`ālamīn. Allāhumma innī as'aluka khayra hādhihil-laylah: fatḥahā, wa naṣrahā, wa nūrahā, wa barakatahā, wa hudāhā, wa a`ūdhu bika min sharri mā fīhā wa sharri mā ba`dahā.",
                translation: "We have entered the evening and at this very time all dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the goodness of this night: its victory, its help, its light, its blessings, and its guidance. I seek refuge in You from the evil it contains and the evil that comes after it.",
                ind: "Kami memasuki waktu sore dan kerajaan hanya milik Allah, Tuhan semesta alam. Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan malam ini: kemenangannya, pertolongannya, cahayanya, keberkahannya, dan petunjuknya. Dan aku berlindung kepada-Mu dari keburukan yang ada di dalamnya dan keburukan setelahnya.",
                tr: "Akşama erdik, mülk de âlemlerin Rabbi Allah'ın olarak akşama erdi. Allah'ım! Senden bu gecenin hayrını; fethini, zaferini, nurunu, bereketini ve hidayetini dilerim. Bu gecenin şerrinden ve sonrasının şerrinden Sana sığınırım.",
                reference: "Abu Dawud 4:322"
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
                arabic: "بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي ، وَبِكَ أَرْفَعُـه، فَإِن أَمْسَـكْتَ نَفْسـي فَارْحَـmْها ، وَإِنْ أَرْسَلْتَـها فَاحْفَظْـها بِمـا تَحْفَـظُ بِه عِبـادَكَ الصّـالِحـين.",
                transliteration: "Bismika Rabbī waḍa`tu janbī, wa bika arfa`uh, fa'in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihi `ibādakaṣ-ṣāliḥīn.",
                translation: "In Your Name my Lord, I lay myself down and I get up again. If You take my soul, have mercy on it, and if You send it back, protect it as You protect Your righteous slaves.",
                ind: "Dengan nama-Mu, wahai Tuhanku, aku meletakkan lambungku dan dengan nama-Mu aku mengangkatnya. Jika Engkau menahan nyawaku, maka berilah rahmat kepadanya, dan jika Engkau melepaskannya, maka peliharalah ia sebagaimana Engkau memelihara hamba-hamba-Mu yang shalih.",
                tr: "Senin adınla Rabbim, yanımı (başımı yastığa) koydum ve Senin adınla onu kaldırırım. Eğer ruhumu alırsan ona merhamet et. Eğer onu geri gönderirsen (yaşatırsan), salih kullarını koruduğun gibi onu da koru.",
                reference: "Al-Bukhari 11:126"
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
                ind: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami dan kepada-Nya lah tempat kembali.",
                tr: "Bizi öldürdükten sonra dirilten Allah'a hamdolsun. Dönüş ancak O'nadır.",
                reference: "Al-Bukhari 11:113"
            }
        ]
    },
    {
        id: 'food',
        title_ar: 'أذكار الطعام',
        title_en: 'Food & Drink',
        duas: [
            {
                id: 1,
                arabic: "بِسْمِ اللهِ.",
                transliteration: "Bismillāh.",
                translation: "In the Name of Allah.",
                ind: "Dengan nama Allah.",
                tr: "Allah'ın adıyla.",
                reference: "Abu Dawud 3:347"
            },
            {
                id: 2,
                arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ.",
                transliteration: "Alḥamdu lillāhil-ladhī aṭ`amanī hādhā, wa razaqanīhi, min ghayri ḥawlin minnī wa lā quwwah.",
                translation: "Praise is to Allah Who has given me this food and sustained me with it though I was unable to do it and powerless.",
                ind: "Segala puji bagi Allah yang telah memberiku makanan ini dan memberiku rezeki dengannya tanpa daya dan kekuatan dariku.",
                tr: "Bana bu yemeği yediren ve benden bir güç ve kuvvet olmaksızın beni onunla rızıklandıran Allah'a hamdolsun.",
                reference: "Abu Dawud, At-Tirmidhi"
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
                id: "Aku memohon ampun kepada Allah (3x). Ya Allah, Engkau adalah Keselamatan dan dari-Mu keselamatan. Maha Suci Engkau wahai Pemilik Keagungan dan Kemuliaan.",
                tr: "Allah'tan bağışlanma dilerim (3 defa). Allah'ım! Sen Selam'sın, selamet de Sendendir. Ey celal ve ikram sahibi! Sen ne yücesin.",
                reference: "Muslim 1:414"
            }
        ]
    },
    {
        id: 'distress',
        title_ar: 'أذكار الكرب',
        title_en: 'Dua for Distress',
        duas: [
            {
                id: 1,
                arabic: "لا إلهَ إلاّ اللّهُ العَظيمُ الحَليم، لا إلهَ إلاّ اللّهُ رَبُّ العَرْشِ العَظيم، لا إلهَ إلاّ اللّهُ رَبُّ السَّمواتِ وَرَبُّ الأَرْضِ وَرَبُّ العَرْشِ الكَريم.",
                transliteration: "Lā ilāha illallāhul-`Aẓīmul-Ḥalīm, lā ilāha illallāhu Rabbul-`Arshil-`Aẓīm, lā ilāha illallāhu Rabbus-samāwāti wa Rabbul-arḍi wa Rabbul-`Arshil-Karīm.",
                translation: "There is no god but Allah, the Magnificent, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens and Lord of the earth, and Lord of the Noble Throne.",
                id: "Tidak ada Tuhan selain Allah Yang Maha Agung lagi Maha Penyantun. Tidak ada Tuhan selain Allah, Tuhan Arsy yang agung. Tidak ada Tuhan selain Allah, Tuhan langit dan Tuhan bumi dan Tuhan Arsy yang mulia.",
                tr: "Azîm ve Halîm olan Allah'tan başka ilah yoktur. Büyük Arş'ın Rabbi olan Allah'tan başka ilah yoktur. Göklerin Rabbi, yerin Rabbi ve kerem sahibi Arş'ın Rabbi olan Allah'tan başka ilah yoktur.",
                reference: "Al-Bukhari 8:154"
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
                id: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya. Dan sesungguhnya kami akan kembali kepada Tuhan kami.",
                tr: "Bunu bizim hizmetimize veren Allah'ı tenzih ederiz, yoksa biz buna güç yetiremezdik. Şüphesiz biz Rabbimize döneceğiz.",
                reference: "Muslim 2:998"
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
                ind: "Aku memohon ampun kepada Allah (3x). Ya Allah, Engkau adalah Keselamatan dan dari-Mu keselamatan. Maha Suci Engkau wahai Pemilik Keagungan dan Kemuliaan.",
                tr: "Allah'tan bağışlanma dilerim (3 defa). Allah'ım! Sen Selam'sın, selamet de Sendendir. Ey celal ve ikram sahibi! Sen ne yücesin.",
                reference: "Muslim 1:414"
            }
        ]
    },
    {
        id: 'distress',
        title_ar: 'أذكار الكرب',
        title_en: 'Dua for Distress',
        duas: [
            {
                id: 1,
                arabic: "لا إلهَ إلاّ اللّهُ العَظيمُ الحَليم، لا إلهَ إلاّ اللّهُ رَبُّ العَرْشِ العَظيم، لا إلهَ إلاّ اللّهُ رَبُّ السَّمواتِ وَرَبُّ الأَرْضِ وَرَبُّ العَرْشِ الكَريم.",
                transliteration: "Lā ilāha illallāhul-`Aẓīmul-Ḥalīm, lā ilāha illallāhu Rabbul-`Arshil-`Aẓīm, lā ilāha illallāhu Rabbus-samāwāti wa Rabbul-arḍi wa Rabbul-`Arshil-Karīm.",
                translation: "There is no god but Allah, the Magnificent, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens and Lord of the earth, and Lord of the Noble Throne.",
                ind: "Tidak ada Tuhan selain Allah Yang Maha Agung lagi Maha Penyantun. Tidak ada Tuhan selain Allah, Tuhan Arsy yang agung. Tidak ada Tuhan selain Allah, Tuhan langit dan Tuhan bumi dan Tuhan Arsy yang mulia.",
                tr: "Azîm ve Halîm olan Allah'tan başka ilah yoktur. Büyük Arş'ın Rabbi olan Allah'tan başka ilah yoktur. Göklerin Rabbi, yerin Rabbi ve kerem sahibi Arş'ın Rabbi olan Allah'tan başka ilah yoktur.",
                reference: "Al-Bukhari 8:154"
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
                ind: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya. Dan sesungguhnya kami akan kembali kepada Tuhan kami.",
                tr: "Bunu bizim hizmetimize veren Allah'ı tenzih ederiz, yoksa biz buna güç yetiremezdik. Şüphesiz biz Rabbimize döneceğiz.",
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
                    <button id="hisn-back-btn" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-all active:scale-90 flex items-center gap-1">
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
                                ${lang !== 'ar' ? `
                                    <hr class="border-slate-100 dark:border-slate-800" />
                                    <p class="text-sm text-slate-500 dark:text-slate-400 italic">${dua.transliteration}</p>
                                    <p class="text-base text-slate-700 dark:text-slate-300 leading-relaxed">${dua[lang === 'id' ? 'ind' : lang] || dua.translation}</p>
                                ` : ''}
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
