
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
                arabic: "أَصْبَحْنا عَلَى فِطْرَةِ الإِسْلامِ، وَعَلَى كَلِمَةِ الإِخْلاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.",
                transliteration: "Aṣbaḥnā `alā fiṭratil-islām, wa `alā kalimatil-ikhlāṣ, wa `alā dīni nabiyyinā Muḥammadin ṣallallāhu `alayhi wa sallam, wa `alā millati abīnā Ibrāhīma ḥanīfan musliman wa mā kāna minal-mushrikīn.",
                translation: "We have entered a new morning upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace and blessings of Allah be upon him), and the faith of our father Ibrahim, a believer in the Oneness of Allah, a Muslim, and he was not of the idolaters.",
                ind: "Di waktu pagi kami memegang teguh agama Islam, kalimat ikhlas, agama Nabi kami Muhammad shallallahu 'alaihi wa sallam, dan agama bapak kami Ibrahim yang hanif (lurus) lagi berserah diri kepada Allah dan dia tidak termasuk orang-orang musyrik.",
                tr: "İslam fıtratı üzere, ihlas kelimesi üzere, Peygamberimiz Muhammed (s.a.v.)'in dini üzere ve hanif bir Müslüman olan babamız İbrahim'in milleti üzere sabaha erdik. O, müşriklerden değildi.",
                reference: "Ahmad 3:406"
            },
            {
                id: 4,
                arabic: "اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ.",
                transliteration: "Allāhumma `āfinī fī badanī, Allāhumma `āfinī fī sam`ī, Allāhumma `āfinī fī baṣarī, lā ilāha illā Ant.",
                translation: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no god but You.",
                ind: "Ya Allah, sehatkanlah badanku. Ya Allah, sehatkanlah pendengaranku. Ya Allah, sehatkanlah penglihatanku. Tidak ada Tuhan yang berhak disembah selain Engkau.",
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
                arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
                transliteration: "Amsaynā wa amsal-mulku lillāh, walḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa `alā kulli shay'in qadīr.",
                translation: "We have entered the evening and at this very time the whole kingdom belongs to Allah, and all praise is due to Allah. There is no god but Allah, the One, Who has no partner with Him. His is the Sovereignty and His is the Praise, and He is Omnipotent.",
                ind: "Kami telah memasuki waktu sore dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya puji-pujian dan Dia Maha Kuasa atas segala sesuatu.",
                tr: "Akşama erdik, mülk de Allah'ın olarak akşama erdi. Hamd Allah'adır. Allah'tan başka ilah yoktur, O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır ve O her şeye kadirdir.",
                reference: "Muslim 4:2088"
            },
            {
                id: 3,
                arabic: "اللّهُـمَّ ما أَمسى بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر.",
                transliteration: "Allāhumma mā amsā bī min ni`matin aw bi-aḥadin min khalqik, faminka waḥdaka lā sharīka lak, falakal-ḥamdu wa lakash-shukr.",
                translation: "O Allah, whatever blessing has been received by me or by any one of Your creation this evening is from You alone, You have no partner. So to You is all praise and all thanks.",
                ind: "Ya Allah, nikmat apa pun yang aku rasakan di waktu sore ini atau yang dirasakan oleh salah seorang dari makhluk-Mu, maka itu adalah dari-Mu semata, tidak ada sekutu bagi-Mu. Maka bagi-Mu segala puji dan bagi-Mu segala syukur.",
                tr: "Allah'ım! Bu akşam benimle veya mahlukatından herhangi biriyle olan nimet Sen'dendir. Sen teksin, ortağın yoktur. Hamd Sana, şükür Sanadır.",
                reference: "Abu Dawud 4:318"
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
                arabic: "بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبي ، وَبِكَ أَرْفَعُـه، فَإِن أَمْسَـكْتَ نَفْسـي فَارْحَمْها ، وَإِنْ أَرْسَلْتَـها فَاحْفَظْـها بِمـا تَحْفَـظُ بِه عِبـادَكَ الصّـالِحـين.",
                transliteration: "Bismika Rabbī waḍa`tu janbī, wa bika arfa`uh, fa'in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihi `ibādakaṣ-ṣāliḥīn.",
                translation: "In Your Name my Lord, I lay myself down and I get up again. If You take my soul, have mercy on it, and if You send it back, protect it as You protect Your righteous slaves.",
                ind: "Dengan nama-Mu, wahai Tuhanku, aku meletakkan lambungku dan dengan nama-Mu aku mengangkatnya. Jika Engkau menahan nyawaku, maka berilah rahmat kepadanya, dan jika Engkau melepaskannya, maka peliharalah ia sebagaimana Engkau memelihara hamba-hamba-Mu yang shalih.",
                tr: "Senin adınla Rabbim, yanımı (başımı yastığa) koydum ve Senin adınla onu kaldırırım. Eğer ruhumu alırsan ona merhamet et. Eğer onu geri gönderirsen (yaşatırsan), salih kullarını koruduğun gibi onu da koru.",
                reference: "Al-Bukhari 11:126"
            },
            {
                id: 2,
                arabic: "اللّهُـمَّ إِنَّـكَ خَلَـقْتَ نَفْسـي وَأَنْتَ تَوَفّـاهـا لَكَ مَمـاتُهـا وَمَحْـياها ، إِنْ أَحْيَيْـتَها فاحْفَظْـها ، وَإِنْ أَمَتَّـها فَاغْفِـرْ لَها . اللّهُـمَّ إِنَّـي أَسْـأَلُكَ العـافِـيَة.",
                transliteration: "Allāhumma innaka khalaqta nafsī wa Anta tawaffāhā, laka mamātuhā wa maḥyāhā, in aḥyaytahā faḥfaẓhā, wa in amattahā faghfir lahā. Allāhumma innī as'alukal-`āfiyah.",
                translation: "O Allah, You have created my soul and You take it back. Unto You is its death and its life. If You give it life, protect it, and if You cause it to die, forgive it. O Allah, I ask You for health.",
                ind: "Ya Allah, sesungguhnya Engkau yang menciptakan nyawaku dan Engkau pula yang mematikannya. Mati dan hidupnya hanya milik-Mu. Jika Engkau menghidupkannya, maka peliharalah ia, dan jika Engkau mematikannya, maka ampunilah ia. Ya Allah, sesungguhnya aku memohon kesehatan kepada-Mu.",
                tr: "Allah'ım! Ruhumu Sen yarattın, onu Sen öldürürsün. Onun ölümü de hayatı da Sana aittir. Eğer onu yaşatırsan koru, eğer öldürürsen bağışla. Allah'ım! Senden afiyet dilerim.",
                reference: "Muslim 4:2083"
            },
            {
                id: 3,
                arabic: "اللّهُـمَّ قِنـي عَذابَـكَ يَوْمَ تَبْعَـثُ عِبادَك.",
                transliteration: "Allāhumma qinī `adhābaka yawma tab`athu `ibādak.",
                translation: "O Allah, protect me from Your punishment on the Day You resurrect Your slaves.",
                ind: "Ya Allah, jagalah aku dari siksa-Mu pada hari Engkau membangkitkan hamba-hamba-Mu.",
                tr: "Allah'ım! Kullarını dirilteceğin gün beni azabından koru.",
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
                ind: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami dan kepada-Nya lah tempat kembali.",
                tr: "Bizi öldürdükten sonra dirilten Allah'a hamdolsun. Dönüş ancak O'nadır.",
                reference: "Al-Bukhari 11:113"
            },
            {
                id: 2,
                arabic: "لا إِلهَ إِلاّ اللهُ وَحْدَهُ لا شَريكَ لَه، لَهُ المُلْكُ وَلَهُ الحَمْد، وَهُوَ عَلى كُلِّ شَيءٍ قَدير، سُبْحانَ الله، وَالحَمْدُ لله، وَلا إِلهَ إِلاّ الله، وَاللهُ أَكْبَر، وَلا حَوْلَ وَلا قُوَّةَ إِلاّ بِاللهِ العَلِيِّ العَظيم، رَبِّ اغْفِرْ لي.",
                transliteration: "Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu, wa huwa `alā kulli shay'in qadīr, Subḥānallāhi, walḥamdu lillāhi, wa lā ilāha illallāhu, wallāhu akbar, wa lā ḥawla wa lā quwwata illā billāhil-`Aliyyil-`Aẓīm, Rabbigh-fir lī.",
                translation: "None has the right to be worshiped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. Glory is to Allah. Praise is to Allah. There is no god but Allah. Allah is the Most Great. There is no might and no power except by Allah's help, the Most High, the Magnificent. O my Lord, forgive me.",
                ind: "Tidak ada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya puji-pujian dan Dia Maha Kuasa atas segala sesuatu. Maha Suci Allah, segala puji bagi Allah, tidak ada Tuhan selain Allah, Allah Maha Besar, tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung. Wahai Tuhanku, ampunilah aku.",
                tr: "Allah'tan başka ilah yoktur, O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır ve O her şeye kadirdir. Allah'ı tesbih ederim, hamd Allah'adır, Allah'tan başka ilah yoktur, Allah en büyüktür. Güç ve kuvvet ancak yüce ve azim olan Allah'ın yardımıyladır. Rabbim beni bağışla.",
                reference: "Al-Bukhari 11:113"
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
            },
            {
                id: 2,
                arabic: "اللّهُـمَّ أَعِـنِّي عَلَى ذِكْـرِكَ وَشُكْـرِكَ وَحُسْـنِ عِبـادَتِـكَ.",
                transliteration: "Allāhumma a`innī `alā dhikrika wa shukrika wa ḥusni `ibādatik.",
                translation: "O Allah, help me to remember You, to give You thanks, and to perform Your worship in the best manner.",
                ind: "Ya Allah, bantulah aku untuk berdzikir kepada-Mu, bersyukur kepada-Mu dan beribadah dengan baik kepada-Mu.",
                tr: "Allah'ım! Seni zikretmek, Sana şükretmek ve Sana güzelce ibadet etmek için bana yardım et.",
                reference: "Abu Dawud 2:86"
            },
            {
                id: 3,
                arabic: "سُبْـحانَ الله (33)، الحَمْـدُ لله (33)، اللهُ أَكْـبَر (33)، لا إلهَ إلاّ اللّهُ وَحْدَهُ لا شريكَ لهُ، لهُ المُلكُ ولهُ الحَمد، وهوَ على كلّ شيءٍ قدير.",
                transliteration: "Subḥānallāh (33), Alḥamdu lillāh (33), Allāhu akbar (33), Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa `alā kulli shay'in qadīr.",
                translation: "Glory is to Allah (33 times). Praise is to Allah (33 times). Allah is the Most Great (33 times). None has the right to be worshiped but Allah alone, He has no partner. His is the dominion and His is the praise and He is Able to do all things.",
                ind: "Maha Suci Allah (33x), segala puji bagi Allah (33x), Allah Maha Besar (33x). Tidak ada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya puji-pujian dan Dia Maha Kuasa atas segala sesuatu.",
                tr: "Sübhânallah (33), Elhamdülillah (33), Allahüekber (33). Allah'tan başka ilah yoktur, O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır ve O her şeye kadirdir.",
                reference: "Muslim 1:418"
            }
        ]
    },
    {
        id: 'anxiety',
        title_ar: 'دعاء الهم والحزن',
        title_en: 'Anxiety & Sorrow',
        duas: [
            {
                id: 1,
                arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ.",
                transliteration: "Allāhumma innī a`ūdhu bika minal-hammi wal-ḥazan, wal-`ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala`id-dayn, wa ghalabatir-rijāl.",
                translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
                ind: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari keluh kesah dan kesedihan, kelemahan dan kemalasan, sifat bakhil dan penakut, lilitan hutang dan penguasaan orang lain.",
                tr: "Allah'ım! Kederden ve hüzünden, acizlikten ve tembellikten, cimrilikten ve korkaklıktan, borç yükünden ve insanların kahrından Sana sığınırım.",
                reference: "Al-Bukhari 7:158"
            },
            {
                id: 2,
                arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.",
                transliteration: "Allāhumma innī `abduk, ibnu `abdik, ibnu amatik, nāṣiyatī biyadik, māḍin fiyya ḥukmuk, `adlun fiyya qaḍā'uk, as'aluka bikulli ismin huwa laka sammayta bihi nafsak, aw anzaltahu fī kitābik, aw `allamtahu aḥadan min khalqik, awista'tharta bihi fī `ilmil-ghaybi `indak, an taj`alal-Qur'āna rabī`a qalbī, wa nūra ṣadrī, wa jalā'a ḥuznī, wa dhahāba hammī.",
                translation: "O Allah, I am Your slave and the son of Your male slave and the son of your female slave. My forehead is in Your Hand (i.e. you have control over me). Your Judgment upon me is assured and Your Decree concerning me is just. I ask You by every Name that You have named Yourself with, revealed in Your Book, taught any one of Your creation or kept unto Yourself in the knowledge of the unseen that is with You, to make the Qur'an the spring of my heart, and the light of my chest, the banisher of my sadness and the reliever of my distress.",
                ind: "Ya Allah, sesungguhnya aku adalah hamba-Mu, anak hamba laki-laki-Mu, dan anak hamba perempuan-Mu. Ubun-ubunku berada di tangan-Mu, hukum-Mu berlaku padaku, dan ketetapan-Mu adil bagiku. Aku memohon kepada-Mu dengan setiap nama yang Engkau miliki, yang Engkau namakan diri-Mu dengannya, atau yang Engkau turunkan dalam kitab-Mu, atau yang Engkau ajarkan kepada salah seorang makhluk-Mu, atau yang Engkau simpan dalam ilmu ghaib di sisi-Mu, agar Engkau menjadikan Al-Qur'an sebagai penyejuk hatiku, cahaya dadaku, penghilang kesedihanku, dan pelenyap kegelisahanku.",
                tr: "Allah'ım! Ben Senin kulunum, kulu olan bir babanın ve kulu olan bir annenin çocuğuyum. Perçemim Senin elindedir. Hakkımdaki hükmün geçerlidir. Hakkımdaki takdirin adalettir. Kendini isimlendirdiğin veya kitabında indirdiğin veya mahlukatından birine öğrettiğin veya katındaki gayb ilminde kendine has kıldığın her isminle Senden; Kur'an'ı kalbimin baharı, göğsümün nuru, hüznümün cilası ve kederimin gidericisi kılmanı dilerim.",
                reference: "Ahmad 1:391"
            }
        ]
    },
    {
        id: 'protection',
        title_ar: 'دعاء الحماية',
        title_en: 'Protection',
        duas: [
            {
                id: 1,
                arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
                transliteration: "Bismillāhil-ladhī lā yaḍurru ma`as-mihi shay'un fil-arḍi wa lā fis-samā'i wa Huwas-Samī`ul-`Alīm.",
                translation: "In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
                ind: "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, Dialah Yang Maha Mendengar lagi Maha Mengetahui.",
                tr: "İsmiyle yerde ve gökte hiçbir şeyin zarar veremeyeceği Allah'ın adıyla. O, hakkıyla işiten ve hakkıyla bilendir.",
                reference: "Abu Dawud 4:323"
            },
            {
                id: 2,
                arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
                transliteration: "A`ūdhu bikalimātil-lāhit-tāmmāti min sharri mā khalaq.",
                translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
                ind: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang diciptakan-Nya.",
                tr: "Yarattıklarının şerrinden Allah'ın tam kelimelerine sığınırım.",
                reference: "Muslim 4:2080"
            },
            {
                id: 3,
                arabic: "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
                transliteration: "Allāhummaḥ-faẓnī min bayni yadayya, wa min khalfī, wa `an yamīnī, wa `an shimālī, wa min fawqī, wa a`ūdhu bi`aẓamatika an ughtāla min taḥtī.",
                translation: "O Allah, protect me from my front and from my back, from my right and from my left, and from above me, and I seek refuge in Your Magnificence from being swallowed up from beneath me.",
                ind: "Ya Allah, jagalah aku dari depan, belakang, kanan, kiri, dan atas. Aku berlindung dengan keagungan-Mu agar aku tidak disergap dari bawahku.",
                tr: "Allah'ım! Beni önümden, arkamdan, sağımdan, solumdan ve üstümden koru. Altımdan yere batırılarak helak edilmekten Senin azametine sığınırım.",
                reference: "Abu Dawud 4:324"
            }
        ]
    },
    {
        id: 'parents',
        title_ar: 'دعاء للوالدين',
        title_en: 'For Parents',
        duas: [
            {
                id: 1,
                arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا.",
                transliteration: "Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā.",
                translation: "My Lord, have mercy upon them as they brought me up [when I was] small.",
                ind: "Wahai Tuhanku, kasihilah mereka keduanya, sebagaimana mereka berdua telah mendidik aku waktu kecil.",
                tr: "Rabbim! Onlar beni küçükken bagaimana terbiye ettilerse, Sen de onlara öylece merhamet et.",
                reference: "Quran 17:24"
            },
            {
                id: 2,
                arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ.",
                transliteration: "Rabbanaghfir lī wa liwālidayya wa lil-mu'minīna yawma yaqūmul-ḥisāb.",
                translation: "Our Lord, forgive me and my parents and the believers the Day the account is established.",
                ind: "Ya Tuhan kami, beri ampunlah aku dan kedua ibu bapakku dan sekalian orang-orang mukmin pada hari terjadinya hisab (hari kiamat).",
                tr: "Rabbimiz! Hesabın görüleceği gün beni, anamı, babamı ve müminleri bağışla.",
                reference: "Quran 14:41"
            },
            {
                id: 3,
                arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ.",
                transliteration: "Rabbigh-fir lī wa liwālidayya.",
                translation: "My Lord, forgive me and my parents.",
                ind: "Wahai Tuhanku, ampunilah aku dan kedua orang tuaku.",
                tr: "Rabbim! Beni ve ana-babamı bağışla.",
                reference: "Quran 71:28"
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
            },
            {
                id: 2,
                arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى.",
                transliteration: "Allāhumma innā nas'aluka fī safarinā hādhā al-birra wat-taqwā, wa minal-`amali mā tarḍā.",
                translation: "O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You.",
                ind: "Ya Allah, sesungguhnya kami memohon kebaikan dan takwa dalam perjalanan kami ini, dan amal yang Engkau ridhai.",
                tr: "Allah'ım! Bu yolculuğumuzda Senden iyilik ve takva, bir de razı olacağın ameller dileriz.",
                reference: "Muslim 2:998"
            },
            {
                id: 3,
                arabic: "اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ.",
                transliteration: "Allāhumma Antaṣ-Ṣāḥibu fis-safar, wal-Khalīfatu fil-ahl.",
                translation: "O Allah, You are our Companion on the journey and the One in Whose care we leave our family.",
                ind: "Ya Allah, Engkau adalah teman dalam perjalanan dan pengganti (yang menjaga) keluarga.",
                tr: "Allah'ım! Yolculukta arkadaşımız, ailemizde vekilimiz Sensin.",
                reference: "Muslim 2:998"
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
            },
            {
                id: 2,
                arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ.",
                transliteration: "Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata `ayn, wa aṣliḥ lī sha'nī kullahu lā ilāha illā Ant.",
                translation: "O Allah, I hope for Your mercy. Do not leave me to myself even for the blinking of an eye, and correct all of my affairs for me. There is no god but You.",
                ind: "Ya Allah, rahmat-Mu yang aku harapkan, maka janganlah Engkau serahkan aku kepada diriku sendiri meski sekejap mata pun. Perbaikilah seluruh urusanku, tidak ada Tuhan selain Engkau.",
                tr: "Allah'ım! Senin rahmetini umarım. Beni göz açıp kapayıncaya kadar bile nefsime bırakma. Bütün işlerimi düzelt. Senden başka ilah yoktur.",
                reference: "Abu Dawud 4:324"
            },
            {
                id: 3,
                arabic: "لا إلهَ إلاّ أَنْتَ سُبْحانَكَ إِنِّي كُنْتُ مِنَ الظّالِمين.",
                transliteration: "Lā ilāha illā Anta Subḥānaka innī kuntu minal-ẓālimīn.",
                translation: "None has the right to be worshiped but You, glory be to You. Truly, I have been among the wrongdoers.",
                ind: "Tidak ada Tuhan selain Engkau, Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zhalim.",
                tr: "Senden başka ilah yoktur. Seni tenzih ederim. Şüphesiz ben zalimlerden oldum.",
                reference: "At-Tirmidhi 5:529"
            }
        ]
    },
    {
        id: 'forgiveness',
        title_ar: 'دعاء الاستغفار',
        title_en: 'Forgiveness',
        duas: [
            {
                id: 1,
                arabic: "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي ، فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ.",
                transliteration: "Allāhumma Anta Rabbī lā ilāha illā Ant, khalaqtanī wa ana `abduk, wa ana `alā `ahdika wa wa`dika mastaṭa`t, a`ūdhu bika min sharri mā ṣana`t, abū'u laka bini`matika `alayya wa abū'u laka bidhanbī faghfir lī, fa'innahu lā yaghfiru-dhunūba illā Ant.",
                translation: "O Allah, You are my Lord, there is no god but You. You created me and I am Your slave, and I am faithful to my covenant and my promise as much as I can. I seek refuge in You from all the evil I have done. I acknowledge before You all the blessings You have bestowed upon me, and I confess to You all my sins. So forgive me, for nobody can forgive sins except You.",
                ind: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan selain Engkau. Engkau yang menciptakan aku dan aku adalah hamba-Mu. Aku menetapi janji-Mu dan janji setia kepada-Mu semampuku. Aku berlindung kepada-Mu dari keburukan apa yang aku perbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Sebab tidak ada yang mengampuni dosa selain Engkau.",
                tr: "Allah'ım! Sen benim Rabbimsin. Senden başka ilah yoktur. Beni Sen yarattın ve ben Senin kulunum. Gücüm yettiğince Sana verdiğim söz ve vaad üzereyim. İşlediğim günahların şerrinden Sana sığınırım. Bana olan nimetini itiraf ederim, günahımı da itiraf ederim. Beni bağışla, karena tidak ada yang mengampuni dosa selain Engkau.",
                reference: "Al-Bukhari 7:150"
            },
            {
                id: 2,
                arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ.",
                transliteration: "Rabbigh-fir lī wa tub `alayya innaka Antat-Tawwābur-Raḥīm.",
                translation: "My Lord, forgive me and accept my repentance, for You are the Oft-Returning, the Most Merciful.",
                ind: "Wahai Tuhanku, ampunilah aku dan terimalah taubatku, sesungguhnya Engkau Maha Penerima Taubat lagi Maha Penyayang.",
                tr: "Rabbim beni bağışla ve tövbemi kabul et. Şüphesiz Sen tövbeleri çokça kabul eden ve çok merhametli olansın.",
                reference: "Abu Dawud 2:85"
            },
            {
                id: 3,
                arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ.",
                transliteration: "Astaghfirullāhal-`Aẓīmal-ladhī lā ilāha illā Huwal-Ḥayyul-Qayyūmu wa atūbu ilayh.",
                translation: "I seek the forgiveness of Allah the Magnificent, whom there is no god but Him, the Living, the Sustainer, and I turn to Him in repentance.",
                ind: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tiada Tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya.",
                tr: "Kendisinden başka ilah olmayan, Hayy ve Kayyum olan Azîm Allah'tan bağışlanma diler ve O'na tövbe ederim.",
                reference: "Abu Dawud 2:85"
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
                <div class="flex flex-col gap-1">
                    <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">${t('hisnMuslim')}</h2>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">${t('hisnMuslimDesc')}</p>
                </div>
                <div class="divide-y divide-slate-200/70 dark:divide-slate-800">
                    ${HISN_DATA.map(category => `
                        <div data-category-id="${category.id}" class="category-card py-3 cursor-pointer group relative overflow-hidden">
                            
                            <div class="flex justify-between items-start mb-2 relative z-10">
                                <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm">
                                    ${ShieldIcon({className: 'w-4.5 h-4.5'})}
                                </div>
                                <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${category.duas.length} ${t('duas') || 'Duas'}</span>
                            </div>
                            <div class="relative z-10">
                                <h3 class="text-base font-bold text-slate-900 dark:text-white font-amiri group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors leading-tight">${category.title_ar}</h3>
                                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold uppercase tracking-wider opacity-80">${category.title_en}</p>
                            </div>
                            <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                <div class="w-6 h-6 rounded-full bg-theme-500/10 flex items-center justify-center text-theme-600 dark:text-theme-400">
                                    ${ChevronRightIcon({className: "w-3 h-3"})}
                                </div>
                            </div>
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
                <div class="flex items-center gap-3 mb-6 sticky top-16 md:top-20 z-30 glass py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200/50 dark:border-slate-800/50">
                    <button id="hisn-back-btn" class="p-1.5 rounded-xl glass hover:bg-theme-100 dark:hover:bg-theme-900/30 text-slate-900 dark:text-white transition-all active:scale-90 flex items-center gap-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                        ${BackIcon({className: 'w-4 h-4'})}
                        <span class="text-[9px] font-bold uppercase tracking-wider pr-1">${t('back')}</span>
                    </button>
                    <div class="min-w-0">
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white font-amiri leading-tight truncate">${cat.title_ar}</h2>
                        <p class="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">${cat.title_en}</p>
                    </div>
                </div>

                <div class="space-y-4">
                    ${cat.duas.map((dua, index) => `
                        <div class="glass-card rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden group hover:border-theme-500/30 transition-all duration-300">
                            <div class="p-4 md:p-5 space-y-4">
                                <div class="flex justify-between items-center">
                                    <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 dark:text-slate-500 group-hover:bg-theme-500/10 group-hover:text-theme-600 transition-colors">
                                        ${index + 1}
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="copy-btn p-1.5 rounded-lg glass border border-slate-200 dark:border-slate-800 hover:bg-theme-500 hover:text-white text-slate-400 transition-all active:scale-90" data-text="${dua.arabic}" title="${t('copy')}">
                                            ${CopyIcon({className: 'w-3.5 h-3.5'})}
                                        </button>
                                    </div>
                                </div>
                                <p class="text-right font-amiri text-xl md:text-2xl leading-[1.8] text-slate-800 dark:text-slate-200">${dua.arabic}</p>
                                ${lang !== 'ar' ? `
                                    <div class="space-y-2 pt-1">
                                        <p class="text-[13px] text-slate-500 dark:text-slate-400 italic leading-relaxed">${dua.transliteration}</p>
                                        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">${dua[lang === 'id' ? 'ind' : lang] || dua.translation}</p>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800/50">
                                <span class="text-[9px] font-bold text-theme-600 dark:text-theme-400 bg-theme-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">${dua.reference}</span>
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
