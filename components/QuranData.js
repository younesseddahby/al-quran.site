// Mapping of Surah number to its starting page in a standard 604-page Mushaf.
export const surahPageMap = {
    1: 1,   // Al-Fatihah
    2: 2,   // Al-Baqarah
    3: 50,  // Aal-E-Imran
    4: 77,  // An-Nisa
    5: 106, // Al-Ma'idah
    6: 128, // Al-An'am
    7: 151, // Al-A'raf
    8: 177, // Al-Anfal
    9: 187, // At-Tawbah
    10: 208, // Yunus
    11: 221, // Hud
    12: 235, // Yusuf
    13: 249, // Ar-Ra'd
    14: 255, // Ibrahim
    15: 262, // Al-Hijr
    16: 267, // An-Nahl
    17: 282, // Al-Isra
    18: 293, // Al-Kahf
    19: 305, // Maryam
    20: 312, // Taha
    21: 322, // Al-Anbiya
    22: 332, // Al-Hajj
    23: 342, // Al-Mu'minun
    24: 350, // An-Nur
    25: 359, // Al-Furqan
    26: 367, // Ash-Shu'ara
    27: 377, // An-Naml
    28: 385, // Al-Qasas
    29: 396, // Al-Ankabut
    30: 404, // Ar-Rum
    31: 411, // Luqman
    32: 415, // As-Sajdah
    33: 418, // Al-Ahzab
    34: 428, // Saba
    35: 434, // Fatir
    36: 440, // Ya-Sin
    37: 446, // As-Saffat
    38: 453, // Sad
    39: 458, // Az-Zumar
    40: 467, // Ghafir
    41: 477, // Fussilat
    42: 483, // Ash-Shura
    43: 489, // Az-Zukhruf
    44: 496, // Ad-Dukhan
    45: 499, // Al-Jathiyah
    46: 502, // Al-Ahqaf
    47: 507, // Muhammad
    48: 511, // Al-Fath
    49: 515, // Al-Hujurat
    50: 518, // Qaf
    51: 520, // Adh-Dhariyat
    52: 523, // At-Tur
    53: 526, // An-Najm
    54: 528, // Al-Qamar
    55: 531, // Ar-Rahman
    56: 534, // Al-Waqi'ah
    57: 537, // Al-Hadid
    58: 542, // Al-Mujadila
    59: 545, // Al-Hashr
    60: 549, // Al-Mumtahanah
    61: 551, // As-Saff
    62: 553, // Al-Jumu'ah
    63: 554, // Al-Munafiqun
    64: 556, // At-Taghabun
    65: 558, // At-Talaq
    66: 560, // At-Tahrim
    67: 562, // Al-Mulk
    68: 564, // Al-Qalam
    69: 566, // Al-Haqqah
    70: 568, // Al-Ma'arij
    71: 570, // Nuh
    72: 572, // Al-Jinn
    73: 574, // Al-Muzzammil
    74: 575, // Al-Muddaththir
    75: 577, // Al-Qiyamah
    76: 578, // Al-Insan
    77: 580, // Al-Mursalat
    78: 582, // An-Naba
    79: 583, // An-Nazi'at
    80: 585, // Abasa
    81: 586, // At-Takwir
    82: 587, // Al-Infitar
    83: 587, // Al-Mutaffifin
    84: 589, // Al-Inshiqaq
    85: 590, // Al-Buruj
    86: 591, // At-Tariq
    87: 591, // Al-A'la
    88: 592, // Al-Ghashiyah
    89: 593, // Al-Fajr
    90: 594, // Al-Balad
    91: 595, // Ash-Shams
    92: 595, // Al-Layl
    93: 596, // Ad-Duhaa
    94: 596, // Ash-Sharh
    95: 597, // At-Tin
    96: 597, // Al-Alaq
    97: 598, // Al-Qadr
    98: 598, // Al-Bayyinah
    99: 599, // Az-Zalzalah
    100: 599, // Al-Adiyat
    101: 600, // Al-Qari'ah
    102: 600, // At-Takathur
    103: 601, // Al-Asr
    104: 601, // Al-Humazah
    105: 601, // Al-Fil
    106: 602, // Quraysh
    107: 602, // Al-Ma'un
    108: 602, // Al-Kawthar
    109: 603, // Al-Kafirun
    110: 603, // An-Nasr
    111: 603, // Al-Masad
    112: 604, // Al-Ikhlas
    113: 604, // Al-Falaq
    114: 604, // An-Nas
};

// A Juz' is typically 20 pages.
export const juzPageMap = Array.from({ length: 30 }, (_, i) => i + 1).reduce((acc, juz) => {
    acc[juz] = 2 + (juz - 1) * 20;
    return acc;
}, {});

// A Hizb is half a Juz'. There are 60 Hizbs.
export const hizbPageMap = Array.from({ length: 60 }, (_, i) => i + 1).reduce((acc, hizb) => {
    const juz = Math.floor((hizb + 1) / 2);
    const isSecondHizbOfJuz = hizb % 2 === 0;
    const juzStartPage = juzPageMap[juz];
    acc[hizb] = juzStartPage + (isSecondHizbOfJuz ? 10 : 0);
    return acc;
}, {});

export const RECITERS = [
    { identifier: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد', englishName: 'Abdul Basit Abdus Samad', downloadId: 'Abdul_Basit_Mujawwad_128kbps' },
    { identifier: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس', englishName: 'Abdul Rahman Al-Sudais', downloadId: 'Abdurrahmaan_As-Sudais_192kbps' },
    { identifier: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي', englishName: 'Ahmed Al-Ajmi', downloadId: 'ahmed_ibn_ali_al_ajamy_128kbps_ketaballah.net' },
    { identifier: 'ar.hanirifai', name: 'هاني الرفاعي', englishName: 'Hani Ar-Rifai', downloadId: 'Hani_Rifai_192kbps' },
    { identifier: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', englishName: 'Maher Al-Muaiqly', downloadId: 'Maher_AlMuaiqly_64kbps' },
    { identifier: 'ar.husary', name: 'محمود خليل الحصري', englishName: 'Mahmoud Khalil Al-Husary', downloadId: 'Husary_128kbps' },
    { identifier: 'ar.alafasy', name: 'مشاري راشد العفاسي', englishName: 'Mishary Rashid Alafasy', downloadId: 'Alafasy_128kbps' },
    { identifier: 'ar.minshawi', name: 'محمد صديق المنشاوي', englishName: 'Mohamed Siddiq El-Minshawi', downloadId: 'Minshawy_Murattal_128kbps' },
    { identifier: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجود)', englishName: 'Mohamed Siddiq El-Minshawi (Mujawwad)', downloadId: 'Minshawy_Mujawwad_192kbps' },
    { identifier: 'ar.saadghamdi', name: 'سعد الغامدي', englishName: 'Saad Al-Ghamdi', downloadId: 'Ghamadi_40kbps' },
    { identifier: 'ar.saoodshuraym', name: 'سعود الشريم', englishName: 'Saud Al-Shuraim', downloadId: 'Saood_ash-Shuraym_128kbps' },
    { identifier: 'ar.yasserdossari', name: 'ياسر الدوسري', englishName: 'Yasser Ad-Dussary', downloadId: 'Yasser_Ad-Dussary_128kbps' },
].sort((a, b) => a.englishName.localeCompare(b.englishName));


// Curated list of famous reciters for full surah playback.
// Data is from mp3quran.net API, but hardcoded for speed and curation.
export const FAMOUS_RECITERS = [
    { "id": 7, "name_en": "Mishari Rashid al-`Afasy", "name_ar": "مشاري راشد العفاسي", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server8.mp3quran.net/afs/" },
    { "id": 11, "name_en": "Youcef Al Aydarouss", "name_ar": "يوسف العيدروس", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server15.mp3quran.net/aydr/" },
    { "id": 4, "name_en": "Abdur-Rahman as-Sudais", "name_ar": "عبدالرحمن السديس", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server11.mp3quran.net/sds/" },
    { "id": 5, "name_en": "Sa`ud ash-Shuraym", "name_ar": "سعود الشريم", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server7.mp3quran.net/shur/" },
    { "id": 1, "name_en": "Maher al-Mu`ayqali", "name_ar": "ماهر المعيقلي", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server12.mp3quran.net/maher/" },
    { "id": 8, "name_en": "Mahmud Khalil al-Husary", "name_ar": "محمود خليل الحصري", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server13.mp3quran.net/husr/" },
    { "id": 10, "name_en": "Yasser ad-Dussary", "name_ar": "ياسر الدوسري", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server11.mp3quran.net/yasser/" },
    { "id": 9, "name_en": "Saad al-Ghamdi", "name_ar": "سعد الغامدي", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server7.mp3quran.net/s_gmd/" },
    { "id": 3, "name_en": "Ahmad al-Ajmy", "name_ar": "أحمد بن علي العجمي", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server10.mp3quran.net/ajm/" },
    { "id": 12, "name_en": "Islam Sobhi", "name_ar": "إسلام صبحي", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/" },
    { "id": 13, "name_en": "Khalid Al Jalil", "name_ar": "خالد الجليل", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server10.mp3quran.net/jleel/" },
    { "id": 14, "name_en": "Abdul Basit 'Abd us-Samad", "name_ar": "عبد الباسط عبد الصمد", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server7.mp3quran.net/basit/" },
    { "id": 15, "name_en": "Abu Bakr al-Shatri", "name_ar": "أبو بكر الشاطري", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server11.mp3quran.net/shatri/" },
    { "id": 16, "name_en": "Fares Abbad", "name_ar": "فارس عباد", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server8.mp3quran.net/frs_a/" },
    { "id": 17, "name_en": "Muhammad Siddiq al-Minshawi", "name_ar": "محمد صديق المنشاوي", "rewaya_en": "Hafs an-Asim", "rewaya_ar": "حفص عن عاصم", "url": "https://server10.mp3quran.net/minsh/" }
];


// Cache for MP3QURAN reciters to avoid re-fetching
let mp3quranRecitersCache = null;

export const getMp3QuranReciters = async () => {
    if (mp3quranRecitersCache) {
        return mp3quranRecitersCache;
    }
    try {
        // Updated to a more stable API endpoint
        const response = await fetch('https://www.mp3quran.net/api/v3/reciters?language=eng');
        if (!response.ok) {
            throw new Error('Failed to fetch reciters from MP3Quran.net');
        }
        const data = await response.json();
        
        mp3quranRecitersCache = data.reciters;
        return data.reciters;
    } catch (error) {
        console.error("Error fetching MP3Quran reciters:", error);
        throw error;
    }
};