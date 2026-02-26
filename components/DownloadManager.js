// This module handles all the logic for downloading, caching, and managing offline audio files.

const AUDIO_CACHE_NAME = 'al-quran-app-audio-v1';
const FULL_SURAHS_KEY = 'downloadedFullSurahs';

// --- Private Helper Functions ---
const getFullSurahDownloadedList = () => {
    try {
        const list = localStorage.getItem(FULL_SURAHS_KEY);
        return list ? JSON.parse(list) : {}; // Returns an object like { 'reciterId_surahNum': true }
    } catch (e) {
        console.error("Failed to parse full downloaded surahs list:", e);
        return {};
    }
};

const saveFullSurahDownloadedList = (list) => {
    localStorage.setItem(FULL_SURAHS_KEY, JSON.stringify(list));
};


// --- Public API for Full Surah ---

/**
 * Gets a map of all surahs that have been downloaded for full-surah playback.
 * @returns {Promise<Object>} A promise that resolves to an object like { 'reciterId_surahNum': true }.
 */
export const getFullSurahDownloads = async () => {
    // This is synchronous but we keep it async in case we move to IndexedDB later
    return getFullSurahDownloadedList();
};

/**
 * Downloads a full surah MP3 for a given reciter.
 * @param {object} reciter The full reciter object from FAMOUS_RECITERS.
 * @param {object} surah The surah object.
 */
export const downloadFullSurah = async (reciter, surah) => {
    const audioCache = await caches.open(AUDIO_CACHE_NAME);
    // Correctly construct URL from the FAMOUS_RECITERS structure
    const audioUrl = `${reciter.url}${String(surah.number).padStart(3, '0')}.mp3`;
    const key = `${reciter.id}_${surah.number}`;
    
    const response = await fetch(audioUrl);
    if (!response.ok) {
        throw new Error(`Failed to download Surah ${surah.englishName} by ${reciter.name_en}. HTTP status: ${response.status}`);
    }
    
    await audioCache.put(audioUrl, response);
    
    const downloadedList = getFullSurahDownloadedList();
    downloadedList[key] = true;
    saveFullSurahDownloadedList(downloadedList);
};

/**
 * Deletes a cached full surah MP3 file.
 * @param {object} reciter The full reciter object.
 * @param {object} surah The surah object.
 */
export const deleteFullSurah = async (reciter, surah) => {
    const audioCache = await caches.open(AUDIO_CACHE_NAME);
    // Correctly construct URL from the FAMOUS_RECITERS structure
    const audioUrl = `${reciter.url}${String(surah.number).padStart(3, '0')}.mp3`;
    const key = `${reciter.id}_${surah.number}`;
    
    await audioCache.delete(audioUrl);
    
    const downloadedList = getFullSurahDownloadedList();
    delete downloadedList[key];
    saveFullSurahDownloadedList(downloadedList);
};