import { t } from '../i18n.js';
import { createSpinner } from './Spinner.js';
import { CloseIcon, ChevronRightIcon } from './Icons.js';

// Data for the 99 Names of Allah
const ASMA_UL_HUSNA = [
    { "id": 1, "name_ar": "ٱلْرَّحْمَـٰنُ", "transliteration": "Ar-Rahmaan", "translation_en": "The Beneficent", "description_en": "He who wills goodness and mercy for all His creatures.", "verses": [{ "surah": 1, "ayah": 3 }, { "surah": 55, "ayah": 1 }] },
    { "id": 2, "name_ar": "ٱلْرَّحِيْمُ", "transliteration": "Ar-Raheem", "translation_en": "The Merciful", "description_en": "He who acts with extreme kindness.", "verses": [{ "surah": 1, "ayah": 3 }, { "surah": 2, "ayah": 163 }] },
    { "id": 3, "name_ar": "ٱلْمَلِكُ", "transliteration": "Al-Malik", "translation_en": "The King", "description_en": "The Sovereign Lord, The One with the complete Dominion, the One Whose Dominion is clear from imperfection.", "verses": [{ "surah": 20, "ayah": 114 }, { "surah": 59, "ayah": 23 }] },
    { "id": 4, "name_ar": "ٱلْقُدُّوْسُ", "transliteration": "Al-Quddus", "translation_en": "The Most Sacred", "description_en": "The One who is pure from any imperfection and clear from children and adversaries.", "verses": [{ "surah": 59, "ayah": 23 }, { "surah": 62, "ayah": 1 }] },
    { "id": 5, "name_ar": "ٱلْسَّلَامُ", "transliteration": "As-Salaam", "translation_en": "The Giver of Peace", "description_en": "The One who is free from every imperfection.", "verses": [{ "surah": 59, "ayah": 23 }] },
    { "id": 6, "name_ar": "ٱلْمُؤْمِنُ", "transliteration": "Al-Mu'min", "translation_en": "The Giver of Faith", "description_en": "The One who witnessed for Himself that no one is God but Him. And He witnessed for His believers that they are truthful in their belief that no one is God but Him.", "verses": [{ "surah": 59, "ayah": 23 }] },
    { "id": 7, "name_ar": "ٱلْمُهَيْمِنُ", "transliteration": "Al-Muhaymin", "translation_en": "The Guardian", "description_en": "The One who witnesses the saying and deeds of His creatures.", "verses": [{ "surah": 59, "ayah": 23 }] },
    { "id": 8, "name_ar": "ٱلْعَزِيْزُ", "transliteration": "Al-Azeez", "translation_en": "The Almighty", "description_en": "The Strong, The Defeater who is not defeated.", "verses": [{ "surah": 3, "ayah": 62 }, { "surah": 59, "ayah": 23 }] },
    { "id": 9, "name_ar": "ٱلْجَبَّارُ", "transliteration": "Al-Jabbaar", "translation_en": "The Compeller", "description_en": "The One that nothing happens in His Dominion except that which He willed.", "verses": [{ "surah": 59, "ayah": 23 }] },
    { "id": 10, "name_ar": "ٱلْمُتَكَبِّرُ", "transliteration": "Al-Mutakabbir", "translation_en": "The Majestic", "description_en": "The One who is clear from the attributes of the creatures and from resembling them.", "verses": [{ "surah": 59, "ayah": 23 }] },
    { "id": 11, "name_ar": "ٱلْخَالِقُ", "transliteration": "Al-Khaaliq", "translation_en": "The Creator", "description_en": "The One who brings everything from non-existence to existence.", "verses": [{ "surah": 6, "ayah": 102 }, { "surah": 39, "ayah": 62 }] },
    { "id": 12, "name_ar": "ٱلْبَارِئُ", "transliteration": "Al-Baari'", "translation_en": "The Maker of Order", "description_en": "The Creator who has the Power to turn the entities.", "verses": [{ "surah": 59, "ayah": 24 }] },
    { "id": 13, "name_ar": "ٱلْمُصَوِّرُ", "transliteration": "Al-Musawwir", "translation_en": "The Shaper of Beauty", "description_en": "The One who forms His creatures in different pictures.", "verses": [{ "surah": 59, "ayah": 24 }] },
    { "id": 14, "name_ar": "ٱلْغَفَّارُ", "transliteration": "Al-Ghaffaar", "translation_en": "The Forgiving", "description_en": "The One who forgives the sins of His slaves time and time again.", "verses": [{ "surah": 20, "ayah": 82 }, { "surah": 38, "ayah": 66 }] },
    { "id": 15, "name_ar": "ٱلْقَهَّارُ", "transliteration": "Al-Qahhaar", "translation_en": "The Subduer", "description_en": "The Dominant, The One who has the perfect Power and is not unable over anything.", "verses": [{ "surah": 13, "ayah": 16 }, { "surah": 14, "ayah": 48 }] },
    { "id": 16, "name_ar": "ٱلْوَهَّابُ", "transliteration": "Al-Wahhaab", "translation_en": "The Giver of All", "description_en": "The One who is Generous in giving plenty without any return. He is everything that benefits.", "verses": [{ "surah": 3, "ayah": 8 }, { "surah": 38, "ayah": 9 }] },
    { "id": 17, "name_ar": "ٱلْرَّزَّاقُ", "transliteration": "Ar-Razzaaq", "translation_en": "The Sustainer", "description_en": "The One who provides everything His creatures need.", "verses": [{ "surah": 51, "ayah": 58 }] },
    { "id": 18, "name_ar": "ٱلْفَتَّاحُ", "transliteration": "Al-Fattaah", "translation_en": "The Opener", "description_en": "The One who opens for His slaves the closed worldly and religious matters.", "verses": [{ "surah": 34, "ayah": 26 }] },
    { "id": 19, "name_ar": "ٱلْعَلِيْمُ", "transliteration": "Al-Aleem", "translation_en": "The Knower of All", "description_en": "The One who knows the details of matters, big and small, open and secret.", "verses": [{ "surah": 2, "ayah": 158 }, { "surah": 24, "ayah": 41 }] },
    { "id": 20, "name_ar": "ٱلْقَابِضُ", "transliteration": "Al-Qaabid", "translation_en": "The Constrictor", "description_en": "The One who constricts the sustenance by His wisdom and expands and widens it with His Generosity and Mercy.", "verses": [{ "surah": 2, "ayah": 245 }] },
    { "id": 21, "name_ar": "ٱلْبَاسِطُ", "transliteration": "Al-Baasit", "translation_en": "The Reliever", "description_en": "The One who expands and widens sustenance with His Generosity and Mercy.", "verses": [{ "surah": 2, "ayah": 245 }] },
    { "id": 22, "name_ar": "ٱلْخَافِضُ", "transliteration": "Al-Khaafid", "translation_en": "The Abaser", "description_en": "The One who lowers whoever He willed by His Destruction and raises whoever He willed by His Endowment.", "verses": [{ "surah": 56, "ayah": 3 }] },
    { "id": 23, "name_ar": "ٱلْرَّافِعُ", "transliteration": "Ar-Raafi'", "translation_en": "The Exalter", "description_en": "The One who raises whoever He willed by His Endowment.", "verses": [{ "surah": 56, "ayah": 3 }, { "surah": 58, "ayah": 11 }] },
    { "id": 24, "name_ar": "ٱلْمُعِزُّ", "transliteration": "Al-Mu'izz", "translation_en": "The Bestower of Honors", "description_en": "He gives esteem to whoever He willed, hence there is no one to humble him.", "verses": [{ "surah": 3, "ayah": 26 }] },
    { "id": 25, "name_ar": "ٱلْمُذِلُّ", "transliteration": "Al-Muzil", "translation_en": "The Humiliator", "description_en": "He degrades whoever He willed, hence there is no one to give him esteem.", "verses": [{ "surah": 3, "ayah": 26 }] },
    { "id": 26, "name_ar": "ٱلْسَّمِيْعُ", "transliteration": "As-Samee'", "translation_en": "The Hearer of All", "description_en": "The One who Hears all things that are heard by His Eternal Hearing without an ear, instrument or organ.", "verses": [{ "surah": 2, "ayah": 127 }, { "surah": 49, "ayah": 1 }] },
    { "id": 27, "name_ar": "ٱلْبَصِيْرُ", "transliteration": "Al-Baseer", "translation_en": "The Seer of All", "description_en": "The One who Sees all things that are seen by His Eternal Seeing without a pupil or any other instrument.", "verses": [{ "surah": 4, "ayah": 58 }, { "surah": 42, "ayah": 27 }] },
    { "id": 28, "name_ar": "ٱلْحَكَمُ", "transliteration": "Al-Hakam", "translation_en": "The Judge", "description_en": "He is the Ruler and His judgment is His Word. The One who judges between His creatures in justice.", "verses": [{ "surah": 6, "ayah": 114 }] },
    { "id": 29, "name_ar": "ٱلْعَدْلُ", "transliteration": "Al-Adl", "translation_en": "The Just", "description_en": "The One who is entitled to do what He does.", "verses": [{ "surah": 6, "ayah": 115 }] },
    { "id": 30, "name_ar": "ٱلْلَّطِيْفُ", "transliteration": "Al-Lateef", "translation_en": "The Subtle One", "description_en": "The One who is kind to His slaves and endows upon them.", "verses": [{ "surah": 6, "ayah": 103 }, { "surah": 67, "ayah": 14 }] },
    { "id": 31, "name_ar": "ٱلْخَبِيْرُ", "transliteration": "Al-Khabeer", "translation_en": "The All-Aware", "description_en": "The One who knows the truth of things.", "verses": [{ "surah": 6, "ayah": 18 }, { "surah": 34, "ayah": 1 }] },
    { "id": 32, "name_ar": "ٱلْحَلِيْمُ", "transliteration": "Al-Haleem", "translation_en": "The Forbearing", "description_en": "The One who delays the punishment for those who deserve it and then He might forgive them.", "verses": [{ "surah": 2, "ayah": 235 }, { "surah": 17, "ayah": 44 }] },
    { "id": 33, "name_ar": "ٱلْعَظِيْمُ", "transliteration": "Al-Azeem", "translation_en": "The Magnificent", "description_en": "The One deserving the attributes of Exaltment, Glory, Extolment, and Purity from all imperfection.", "verses": [{ "surah": 2, "ayah": 255 }, { "surah": 42, "ayah": 4 }] },
    { "id": 34, "name_ar": "ٱلْغَفُوْرُ", "transliteration": "Al-Ghafoor", "translation_en": "The Great Forgiver", "description_en": "The One who forgives a lot.", "verses": [{ "surah": 8, "ayah": 69 }, { "surah": 35, "ayah": 28 }] },
    { "id": 35, "name_ar": "ٱلْشَّكُوْرُ", "transliteration": "Ash-Shakoor", "translation_en": "The Rewarder of Thankfulness", "description_en": "The One who gives a great reward for a little obedience.", "verses": [{ "surah": 35, "ayah": 30 }, { "surah": 64, "ayah": 17 }] },
    { "id": 36, "name_ar": "ٱلْعَلِيُّ", "transliteration": "Al-Aliyy", "translation_en": "The Highest", "description_en": "The One who is clear from the attributes of the creatures.", "verses": [{ "surah": 2, "ayah": 255 }, { "surah": 31, "ayah": 30 }] },
    { "id": 37, "name_ar": "ٱلْكَبِيْرُ", "transliteration": "Al-Kabeer", "translation_en": "The Greatest", "description_en": "The One who is greater than everything in status.", "verses": [{ "surah": 13, "ayah": 9 }, { "surah": 31, "ayah": 30 }] },
    { "id": 38, "name_ar": "ٱلْحَفِيْظُ", "transliteration": "Al-Hafeez", "translation_en": "The Preserver", "description_en": "The One who protects whatever and whoever He willed to protect.", "verses": [{ "surah": 11, "ayah": 57 }, { "surah": 42, "ayah": 6 }] },
    { "id": 39, "name_ar": "ٱلْمُقِيْتُ", "transliteration": "Al-Muqeet", "translation_en": "The Nourisher", "description_en": "The One who has the Power.", "verses": [{ "surah": 4, "ayah": 85 }] },
    { "id": 40, "name_ar": "ٱلْحَسِيْبُ", "transliteration": "Al-Haseeb", "translation_en": "The Accounter", "description_en": "The One who gives the satisfaction.", "verses": [{ "surah": 4, "ayah": 6 }, { "surah": 33, "ayah": 39 }] },
    { "id": 41, "name_ar": "ٱلْجَلِيْلُ", "transliteration": "Al-Jaleel", "translation_en": "The Mighty", "description_en": "The One who is attributed with greatness of Power and Glory of status.", "verses": [{ "surah": 55, "ayah": 27 }] },
    { "id": 42, "name_ar": "ٱلْكَرِيْمُ", "transliteration": "Al-Kareem", "translation_en": "The Generous", "description_en": "The One who is clear from abjectness.", "verses": [{ "surah": 27, "ayah": 40 }, { "surah": 82, "ayah": 6 }] },
    { "id": 43, "name_ar": "ٱلْرَّقِيْبُ", "transliteration": "Ar-Raqeeb", "translation_en": "The Watchful One", "description_en": "The One that nothing is absent from Him. Hence it is said the Watcher.", "verses": [{ "surah": 4, "ayah": 1 }, { "surah": 5, "ayah": 117 }] },
    { "id": 44, "name_ar": "ٱلْمُجِيْبُ", "transliteration": "Al-Mujeeb", "translation_en": "The Responder to Prayer", "description_en": "The One who answers the one in need if he asks Him and rescues the yearner if he calls upon Him.", "verses": [{ "surah": 11, "ayah": 61 }] },
    { "id": 45, "name_ar": "ٱلْوَاسِعُ", "transliteration": "Al-Waasi'", "translation_en": "The All-Comprehending", "description_en": "The One with the vast dominion.", "verses": [{ "surah": 2, "ayah": 268 }, { "surah": 3, "ayah": 73 }] },
    { "id": 46, "name_ar": "ٱلْحَكِيْمُ", "transliteration": "Al-Hakeem", "translation_en": "The Perfectly Wise", "description_en": "The One who is correct in His doings.", "verses": [{ "surah": 2, "ayah": 129 }, { "surah": 31, "ayah": 27 }] },
    { "id": 47, "name_ar": "ٱلْوَدُوْدُ", "transliteration": "Al-Wadood", "translation_en": "The Loving One", "description_en": "The One who loves His believing slaves and His believing slaves love Him.", "verses": [{ "surah": 11, "ayah": 90 }, { "surah": 85, "ayah": 14 }] },
    { "id": 48, "name_ar": "ٱلْمَجِيْدُ", "transliteration": "Al-Majeed", "translation_en": "The Majestic One", "description_en": "The One who is with perfect Power, High Status, Compassion, Generosity and Kindness.", "verses": [{ "surah": 11, "ayah": 73 }] },
    { "id": 49, "name_ar": "ٱلْبَاعِثُ", "transliteration": "Al-Baa'ith", "translation_en": "The Resurrector", "description_en": "The One who resurrects His slaves after death for reward and punishment.", "verses": [{ "surah": 22, "ayah": 7 }] },
    { "id": 50, "name_ar": "ٱلْشَّهِيْدُ", "transliteration": "Ash-Shaheed", "translation_en": "The Witness", "description_en": "The One who nothing is absent from His knowledge.", "verses": [{ "surah": 4, "ayah": 79 }, { "surah": 41, "ayah": 53 }] },
    { "id": 51, "name_ar": "ٱلْحَقُّ", "transliteration": "Al-Haqq", "translation_en": "The Truth", "description_en": "The One who truly exists.", "verses": [{ "surah": 6, "ayah": 62 }, { "surah": 22, "ayah": 6 }] },
    { "id": 52, "name_ar": "ٱلْوَكِيْلُ", "transliteration": "Al-Wakeel", "translation_en": "The Trustee", "description_en": "The One who gives the satisfaction and is relied upon.", "verses": [{ "surah": 3, "ayah": 173 }, { "surah": 28, "ayah": 28 }] },
    { "id": 53, "name_ar": "ٱلْقَوِيُّ", "transliteration": "Al-Qawiyy", "translation_en": "The Possessor of All Strength", "description_en": "The One with the perfect Power.", "verses": [{ "surah": 22, "ayah": 40 }, { "surah": 57, "ayah": 25 }] },
    { "id": 54, "name_ar": "ٱلْمَتِيْنُ", "transliteration": "Al-Mateen", "translation_en": "The Forceful One", "description_en": "The One with extreme Power which is un-interrupted and He does not get tired.", "verses": [{ "surah": 51, "ayah": 58 }] },
    { "id": 55, "name_ar": "ٱلْوَلِيُّ", "transliteration": "Al-Waliyy", "translation_en": "The Governor", "description_en": "The One who owns things and manages them.", "verses": [{ "surah": 4, "ayah": 45 }, { "surah": 7, "ayah": 196 }] },
    { "id": 56, "name_ar": "ٱلْحَمِيْدُ", "transliteration": "Al-Hameed", "translation_en": "The Praised One", "description_en": "The praised One who deserves to be praised.", "verses": [{ "surah": 14, "ayah": 8 }, { "surah": 31, "ayah": 12 }] },
    { "id": 57, "name_ar": "ٱلْمُحْصِيْ", "transliteration": "Al-Muhsee", "translation_en": "The Appraiser", "description_en": "The One who the count of things are known to him.", "verses": [{ "surah": 72, "ayah": 28 }, { "surah": 78, "ayah": 29 }] },
    { "id": 58, "name_ar": "ٱلْمُبْدِئُ", "transliteration": "Al-Mubdi'", "translation_en": "The Originator", "description_en": "The One who started the human being. That is, He created him.", "verses": [{ "surah": 10, "ayah": 34 }, { "surah": 85, "ayah": 13 }] },
    { "id": 59, "name_ar": "ٱلْمُعِيْدُ", "transliteration": "Al-Mu'eed", "translation_en": "The Restorer", "description_en": "The One who brings back the creatures after death.", "verses": [{ "surah": 10, "ayah": 34 }, { "surah": 85, "ayah": 13 }] },
    { "id": 60, "name_ar": "ٱلْمُحْيِيْ", "transliteration": "Al-Muhyee", "translation_en": "The Giver of Life", "description_en": "The One who took out a living human from semen that does not have a soul. He gives life by giving the souls back to the worn out bodies on the resurrection day and He makes the hearts alive by the light of knowledge.", "verses": [{ "surah": 7, "ayah": 158 }, { "surah": 30, "ayah": 50 }] },
    { "id": 61, "name_ar": "ٱلْمُمِيْتُ", "transliteration": "Al-Mumeet", "translation_en": "The Taker of Life", "description_en": "The One who renders the living dead.", "verses": [{ "surah": 3, "ayah": 156 }, { "surah": 7, "ayah": 158 }] },
    { "id": 62, "name_ar": "ٱلْحَيُّ", "transliteration": "Al-Hayy", "translation_en": "The Ever Living One", "description_en": "The One attributed with a life that is unlike our life and is not that of a combination of soul, flesh or blood.", "verses": [{ "surah": 2, "ayah": 255 }, { "surah": 25, "ayah": 58 }] },
    { "id": 63, "name_ar": "ٱلْقَيُّوْمُ", "transliteration": "Al-Qayyoom", "translation_en": "The Self-Existing One", "description_en": "The One who remains and does not end.", "verses": [{ "surah": 2, "ayah": 255 }, { "surah": 20, "ayah": 111 }] },
    { "id": 64, "name_ar": "ٱلْوَاجِدُ", "transliteration": "Al-Waajid", "translation_en": "The Finder", "description_en": "The One who is Rich and is never poor. Al-Wajd is Richness.", "verses": [{ "surah": 38, "ayah": 44 }] },
    { "id": 65, "name_ar": "ٱلْمَاجِدُ", "transliteration": "Al-Maajid", "translation_en": "The Glorious", "description_en": "The One who is with perfect Power, High Status, Compassion, Generosity and Kindness.", "verses": [{ "surah": 11, "ayah": 73 }] },
    { "id": 66, "name_ar": "ٱلْوَاحِدُ", "transliteration": "Al-Waahid", "translation_en": "The One, the All Inclusive, The Indivisible", "description_en": "The One without a partner.", "verses": [{ "surah": 2, "ayah": 163 }, { "surah": 13, "ayah": 16 }] },
    { "id": 67, "name_ar": "ٱلْأَحَدُ", "transliteration": "Al-Ahad", "translation_en": "The One", "description_en": "The One who has no-second, indivisible.", "verses": [{ "surah": 112, "ayah": 1 }] },
    { "id": 68, "name_ar": "ٱلْصَّمَدُ", "transliteration": "As-Samad", "translation_en": "The Satisfier of All Needs", "description_en": "The Master who is relied upon in matters and reverted to in ones needs.", "verses": [{ "surah": 112, "ayah": 2 }] },
    { "id": 69, "name_ar": "ٱلْقَادِرُ", "transliteration": "Al-Qaadir", "translation_en": "The All-Powerful", "description_en": "The One attributed with Power.", "verses": [{ "surah": 6, "ayah": 65 }, { "surah": 46, "ayah": 33 }] },
    { "id": 70, "name_ar": "ٱلْمُقْتَدِرُ", "transliteration": "Al-Muqtadir", "translation_en": "The Creator of All Power", "description_en": "The One with the perfect Power that nothing is withheld from Him.", "verses": [{ "surah": 18, "ayah": 45 }, { "surah": 54, "ayah": 42 }] },
    { "id": 71, "name_ar": "ٱلْمُقَدِّمُ", "transliteration": "Al-Muqaddim", "translation_en": "The Expediter", "description_en": "He makes ahead what He wills and delays what He wills.", "verses": [{ "surah": 16, "ayah": 61 }] },
    { "id": 72, "name_ar": "ٱلْمُؤَخِّرُ", "transliteration": "Al-Mu'akhkhir", "translation_en": "The Delayer", "description_en": "The One who delays what He wills.", "verses": [{ "surah": 14, "ayah": 42 }] },
    { "id": 73, "name_ar": "ٱلْأَوَّلُ", "transliteration": "Al-Awwal", "translation_en": "The First", "description_en": "The One whose Existence is without a beginning.", "verses": [{ "surah": 57, "ayah": 3 }] },
    { "id": 74, "name_ar": "ٱلْآخِرُ", "transliteration": "Al-Aakhir", "translation_en": "The Last", "description_en": "The One whose Existence is without an end.", "verses": [{ "surah": 57, "ayah": 3 }] },
    { "id": 75, "name_ar": "ٱلْظَّاهِرُ", "transliteration": "Az-Zaahir", "translation_en": "The Manifest One", "description_en": "The One that nothing is above Him and nothing is underneath Him, hence He exists without a place.", "verses": [{ "surah": 57, "ayah": 3 }] },
    { "id": 76, "name_ar": "ٱلْبَاطِنُ", "transliteration": "Al-Baatin", "translation_en": "The Hidden One", "description_en": "The One that nothing is above Him and nothing is underneath Him, hence He exists without a place. He is Exalted for His Existence is clear.", "verses": [{ "surah": 57, "ayah": 3 }] },
    { "id": 77, "name_ar": "ٱلْوَالِي", "transliteration": "Al-Waali", "translation_en": "The Protecting Friend", "description_en": "The One who owns things and manages them.", "verses": [{ "surah": 13, "ayah": 11 }] },
    { "id": 78, "name_ar": "ٱلْمُتَعَالِي", "transliteration": "Al-Muta'aali", "translation_en": "The Supreme One", "description_en": "The One who is clear from the attributes of the creation.", "verses": [{ "surah": 13, "ayah": 9 }] },
    { "id": 79, "name_ar": "ٱلْبَرُّ", "transliteration": "Al-Barr", "translation_en": "The Doer of Good", "description_en": "The One who is kind to His creatures, who covered them with His sustenance and specified whoever He willed among them by His support, protection, and special mercy.", "verses": [{ "surah": 52, "ayah": 28 }] },
    { "id": 80, "name_ar": "ٱلْتَّوَّابُ", "transliteration": "At-Tawwaab", "translation_en": "The Guide to Repentance", "description_en": "The One who grants repentance to whoever He willed among His creatures and accepts his repentance.", "verses": [{ "surah": 2, "ayah": 128 }, { "surah": 49, "ayah": 12 }] },
    { "id": 81, "name_ar": "ٱلْمُنْتَقِمُ", "transliteration": "Al-Muntaqim", "translation_en": "The Avenger", "description_en": "The One who victoriously prevails over His enemies and punishes them for their sins.", "verses": [{ "surah": 32, "ayah": 22 }, { "surah": 44, "ayah": 16 }] },
    { "id": 82, "name_ar": "ٱلْعَفُوُّ", "transliteration": "Al-Afuww", "translation_en": "The Forgiver", "description_en": "The One with wide forgiveness.", "verses": [{ "surah": 4, "ayah": 99 }, { "surah": 22, "ayah": 60 }] },
    { "id": 83, "name_ar": "ٱلْرَّؤُوْفُ", "transliteration": "Ar-Ra'oof", "translation_en": "The Clement", "description_en": "The One with extreme Mercy. The Mercy of Allah is His will to endow upon whoever He willed among His creatures.", "verses": [{ "surah": 3, "ayah": 30 }, { "surah": 57, "ayah": 9 }] },
    { "id": 84, "name_ar": "مَالِكُ ٱلْمُلْكُ", "transliteration": "Maalik-ul-Mulk", "translation_en": "The Owner of All", "description_en": "The One who controls the Dominion and gives dominion to whoever He willed.", "verses": [{ "surah": 3, "ayah": 26 }] },
    { "id": 85, "name_ar": "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامُ", "transliteration": "Zul-Jalaali-wal-Ikram", "translation_en": "The Lord of Majesty and Bounty", "description_en": "The One who deserves to be Exalted and not denied.", "verses": [{ "surah": 55, "ayah": 27 }, { "surah": 55, "ayah": 78 }] },
    { "id": 86, "name_ar": "ٱلْمُقْسِطُ", "transliteration": "Al-Muqsit", "translation_en": "The Equitable One", "description_en": "The One who is Just in His judgment.", "verses": [{ "surah": 3, "ayah": 18 }] },
    { "id": 87, "name_ar": "ٱلْجَامِعُ", "transliteration": "Al-Jaami'", "translation_en": "The Gatherer", "description_en": "The One who gathers the creatures on a day that there is no doubt about, that is the Day of Judgment.", "verses": [{ "surah": 3, "ayah": 9 }] },
    { "id": 88, "name_ar": "ٱلْغَنِيُّ", "transliteration": "Al-Ghaniyy", "translation_en": "The Rich One", "description_en": "The One who does not need the creation.", "verses": [{ "surah": 2, "ayah": 263 }, { "surah": 35, "ayah": 15 }] },
    { "id": 89, "name_ar": "ٱلْمُغْنِيُّ", "transliteration": "Al-Mughni", "translation_en": "The Enricher", "description_en": "The One who satisfies the necessities of the creatures.", "verses": [{ "surah": 9, "ayah": 28 }] },
    { "id": 90, "name_ar": "ٱلْمَانِعُ", "transliteration": "Al-Maani'", "translation_en": "The Preventer of Harm", "description_en": "The Supporter who protects and gives victory to His pious believers.", "verses": [{ "surah": 67, "ayah": 21 }] },
    { "id": 91, "name_ar": "ٱلْضَّارُ", "transliteration": "Ad-Daarr", "translation_en": "The Creator of The Harmful", "description_en": "The One who makes harm reach to whoever He willed.", "verses": [{ "surah": 6, "ayah": 17 }] },
    { "id": 92, "name_ar": "ٱلْنَّافِعُ", "transliteration": "An-Naafi'", "translation_en": "The Creator of Good", "description_en": "The One who makes good reach to whoever He willed.", "verses": [{ "surah": 6, "ayah": 17 }] },
    { "id": 93, "name_ar": "ٱلْنُّوْرُ", "transliteration": "An-Noor", "translation_en": "The Light", "description_en": "The One who guides.", "verses": [{ "surah": 24, "ayah": 35 }] },
    { "id": 94, "name_ar": "ٱلْهَادِي", "transliteration": "Al-Haadi", "translation_en": "The Guide", "description_en": "The One whom with His Guidance His believers were guided, and with His Guidance the living beings have been guided to what is beneficial for them and protected from what is harmful to them.", "verses": [{ "surah": 25, "ayah": 31 }] },
    { "id": 95, "name_ar": "ٱلْبَدِيْعُ", "transliteration": "Al-Badee", "translation_en": "The Incomparable", "description_en": "The One who created the creation and formed it without any preceding example.", "verses": [{ "surah": 2, "ayah": 117 }] },
    { "id": 96, "name_ar": "ٱلْبَاقِي", "transliteration": "Al-Baaqi", "translation_en": "The Everlasting One", "description_en": "The One that the state of non-existence is impossible for Him.", "verses": [{ "surah": 55, "ayah": 27 }] },
    { "id": 97, "name_ar": "ٱلْوَارِثُ", "transliteration": "Al-Waaris", "translation_en": "The Inheritor of All", "description_en": "The One whose Existence remains.", "verses": [{ "surah": 15, "ayah": 23 }] },
    { "id": 98, "name_ar": "ٱلْرَّشِيْدُ", "transliteration": "Ar-Rasheed", "translation_en": "The Righteous Teacher", "description_en": "The One who guides.", "verses": [{ "surah": 11, "ayah": 87 }] },
    { "id": 99, "name_ar": "ٱلْصَّبُوْرُ", "transliteration": "As-Saboor", "translation_en": "The Patient One", "description_en": "The One who does not quickly punish the sinners.", "verses": [{ "surah": 8, "ayah": 66 }] }
];


export const renderAsmaUlHusna = (container, { navigateTo }) => {
    let state = {
        selectedName: null,
        isModalOpen: false,
    };

    const render = () => {
        container.innerHTML = `
            <div class="space-y-6">
                <h2 class="text-3xl font-bold text-theme-700 dark:text-theme-400 font-amiri">${t('asmaUlHusna')}</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    ${ASMA_UL_HUSNA.map(renderNameCard).join('')}
                </div>
            </div>
            <div id="asma-modal-container"></div>
        `;
        attachEventListeners();
    };

    const setState = (newState) => {
        Object.assign(state, newState);
        renderModal();
    };

    const renderNameCard = (name) => `
        <div data-name-id="${name.id}" class="name-card text-center p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <h3 class="font-amiri text-2xl font-bold text-slate-800 dark:text-slate-200">${name.name_ar}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${name.transliteration}</p>
            <p class="text-xs text-slate-500 dark:text-slate-500">${name.translation_en}</p>
        </div>
    `;

    const attachEventListeners = () => {
        container.querySelectorAll('.name-card').forEach(card => {
            card.addEventListener('click', () => {
                const nameId = parseInt(card.dataset.nameId, 10);
                const selected = ASMA_UL_HUSNA.find(n => n.id === nameId);
                setState({ selectedName: selected, isModalOpen: true });
            });
        });
    };

    const closeModal = () => {
        const modalContainer = document.getElementById('asma-modal-container');
        if (!modalContainer) return;
        
        const overlay = modalContainer.querySelector('#asma-overlay');
        const panel = modalContainer.querySelector('#asma-panel');

        overlay?.classList.remove('opacity-100');
        panel?.classList.add('translate-y-full');

        panel?.addEventListener('transitionend', () => {
            setState({ isModalOpen: false, selectedName: null });
        }, { once: true });
    };

    const renderModal = () => {
        const modalContainer = document.getElementById('asma-modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = ''; // Clear previous modal
        if (!state.isModalOpen || !state.selectedName) return;

        const { name_ar, transliteration, translation_en, description_en, verses } = state.selectedName;
        
        modalContainer.innerHTML = `
            <div id="asma-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 opacity-0 transition-opacity duration-300"></div>
            <div id="asma-panel" class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col translate-y-full transition-transform duration-300 ease-out">
                <header class="p-4 border-b dark:border-slate-700 flex-shrink-0 text-center relative">
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100 font-amiri">${name_ar}</h3>
                    <p class="text-slate-600 dark:text-slate-400">${transliteration} - ${translation_en}</p>
                    <button id="close-asma-modal-btn" class="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">${CloseIcon()}</button>
                </header>
                <main class="p-6 overflow-y-auto space-y-4">
                    <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${description_en}</p>
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2">${t('relatedVerses')}</h4>
                        <div class="space-y-2">
                            ${verses.map(v => `
                                <a href="#" class="verse-link block p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50" data-surah="${v.surah}" data-ayah="${v.ayah}">
                                    ${t('surah')} ${v.surah}, ${t('ayah')} ${v.ayah} <span class="text-theme-600 dark:text-theme-400 float-right">${ChevronRightIcon()}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        const overlay = modalContainer.querySelector('#asma-overlay');
        const panel = modalContainer.querySelector('#asma-panel');

        requestAnimationFrame(() => {
            overlay.classList.add('opacity-100');
            panel.classList.remove('translate-y-full');
        });

        overlay.addEventListener('click', closeModal);
        modalContainer.querySelector('#close-asma-modal-btn').addEventListener('click', closeModal);

        modalContainer.querySelectorAll('.verse-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const surahNumber = parseInt(link.dataset.surah, 10);
                const ayahNumber = parseInt(link.dataset.ayah, 10);
                navigateTo({ surahNumber, ayahNumber });
            });
        });
    };

    render();
};
