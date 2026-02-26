

import { createSpinner } from './Spinner.js';
import { renderErrorState } from './UI.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { QiblaIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons.js';
import { fetchWithRetry } from '../utils/fetchUtils.js';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;
const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const renderAdhanTimes = (container, props = {}) => {
    const savedLocation = JSON.parse(localStorage.getItem('prayerLocation'));
    const isRtl = getCurrentLanguage() === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

    let state = {
        location: savedLocation || null,
        prayerTimes: null,
        loading: false,
        error: null,
        highlightedPrayer: null,
        currentTime: new Date(),
        citySuggestions: [],
        isSuggestionsLoading: false,
        // Qibla State
        isQiblaVisible: false,
        qiblaPermissionState: 'prompt', // 'prompt', 'granted', 'denied'
        isIOS: typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function',
        qiblaError: null,
        isQiblaLoading: false,
        qiblaLocation: null, // { lat, lon, city, country }
        qiblaDirection: 0,
        deviceHeading: 0,
    };

    let debounceTimer;
    let clockInterval;
    let orientationListener = null;
    let compassElement = null;

    // --- One-Time Structure Setup ---
    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center gap-3">
                <button id="adhan-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1">
                    ${BackIcon({className: "w-6 h-6"})}
                    <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                </button>
                <h2 class="text-3xl font-bold text-theme-700 dark:text-theme-400 font-amiri">${t('adhanAndPrayerTimes')}</h2>
            </div>
            <div class="space-y-4">
                <form id="location-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <div class="relative sm:col-span-2">
                        <label for="city" class="block text-sm font-medium text-slate-700 dark:text-slate-300">${t('city')}</label>
                        <input type="text" id="city" value="${state.location ? state.location.city : ''}" placeholder="${t('cityExample')}" class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-theme-500 focus:border-theme-500 sm:text-sm" autocomplete="off">
                        <div id="city-suggestions" class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 rounded-md shadow-lg hidden max-h-60 overflow-auto"></div>
                    </div>
                    <div>
                        <label for="country" class="block text-sm font-medium text-slate-700 dark:text-slate-300">${t('country')}</label>
                        <input type="text" id="country" value="${state.location ? state.location.country : ''}" placeholder="${t('countryExample')}" class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-theme-500 focus:border-theme-500 sm:text-sm">
                    </div>
                    <button type="submit" class="w-full px-5 py-2.5 bg-theme-600 text-white rounded-md hover:bg-theme-700 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 shadow-lg shadow-theme-500/20">${t('showTimes')}</button>
                </form>
                 <div class="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                     <button id="show-qibla-btn" class="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 transition-all transform active:scale-95">
                        ${QiblaIcon()} ${t('showQiblaDirection')}
                    </button>
                </div>
            </div>
            <div id="prayer-times-container" class="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6"></div>
            <div id="qibla-container" class="mt-6"></div>
        </div>
    `;

    const contentContainer = container.querySelector('#prayer-times-container');
    const locationForm = container.querySelector('#location-form');
    const cityInput = container.querySelector('#city');
    const countryInput = container.querySelector('#country');
    const citySuggestionsContainer = container.querySelector('#city-suggestions');
    const qiblaContainer = container.querySelector('#qibla-container');
    const showQiblaBtn = container.querySelector('#show-qibla-btn');

    const getNextPrayerInfo = () => {
        if (!state.prayerTimes) return null;

        const now = state.currentTime;
        const timings = state.prayerTimes.timings;

        let nextPrayerName = null;
        let nextPrayerTime = Infinity;

        // Create Date objects for today's prayer times
        const prayerTimesToday = prayerOrder.map(name => {
            const [hours, minutes] = timings[name].split(':').map(Number);
            const date = new Date(now);
            date.setHours(hours, minutes, 0, 0);
            return { name, date };
        });

        // Find the next prayer for today
        for (const prayer of prayerTimesToday) {
            if (prayer.date > now && prayer.date < nextPrayerTime) {
                nextPrayerTime = prayer.date;
                nextPrayerName = prayer.name;
            }
        }

        // If it's past Isha, the next prayer is Fajr of the next day
        if (!nextPrayerName) {
            nextPrayerName = 'Fajr';
            const fajrTime = prayerTimesToday.find(p => p.name === 'Fajr');
            if(fajrTime) {
                nextPrayerTime = new Date(fajrTime.date);
                nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
            } else {
                return null; // Should not happen
            }
        }
        
        return { name: nextPrayerName, time: nextPrayerTime };
    };

    const updateCountdown = () => {
        const countdownContainer = container.querySelector('#countdown-container');
        if (!countdownContainer) return;

        const nextPrayerInfo = getNextPrayerInfo();
        if (!nextPrayerInfo) {
            countdownContainer.innerHTML = '';
            return;
        }

        const { name, time } = nextPrayerInfo;
        
        if (name !== state.highlightedPrayer) {
            highlightPrayer(name);
        }

        const diff = time - state.currentTime;
        if (diff < 0) return;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const countdownText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        countdownContainer.innerHTML = `
            <p class="text-lg text-slate-600 dark:text-slate-400">
                ${t('nextPrayerIn', { prayer: t(`prayer_${name}`) })}
                <span class="font-bold text-xl text-theme-700 dark:text-theme-400 font-mono tracking-wider">${countdownText}</span>
            </p>
        `;
    };

    const highlightPrayer = (nextPrayerName) => {
        if (!nextPrayerName || state.highlightedPrayer === nextPrayerName) return;

        // Reset previous card
        if (state.highlightedPrayer) {
            const previousCard = container.querySelector(`#prayer-${state.highlightedPrayer}`);
            if (previousCard) {
                previousCard.classList.remove('bg-gradient-to-br', 'from-theme-500', 'to-theme-600', 'transform', 'scale-105', '-translate-y-1', 'shadow-xl', 'shadow-theme-500/40');
                previousCard.classList.add('bg-white', 'dark:bg-slate-900');
                previousCard.querySelectorAll('p').forEach(p => p.classList.remove('text-white', 'dark:text-white'));
            }
        }

        // Highlight the new one
        const highlightedCard = container.querySelector(`#prayer-${nextPrayerName}`);
        if (highlightedCard) {
            highlightedCard.classList.add('bg-gradient-to-br', 'from-theme-500', 'to-theme-600', 'transform', 'scale-105', '-translate-y-1', 'shadow-xl', 'shadow-theme-500/40');
            highlightedCard.classList.remove('bg-white', 'dark:bg-slate-900');
            highlightedCard.querySelectorAll('p').forEach(p => p.classList.add('text-white', 'dark:text-white'));
        }
        
        state.highlightedPrayer = nextPrayerName;
    };

    const renderContent = () => {
        contentContainer.innerHTML = '';
        if (state.loading) {
            contentContainer.appendChild(createSpinner(t('loading')));
        } else if (state.error) {
            contentContainer.appendChild(renderErrorState(state.error, () => fetchPrayerTimes(state.location)));
        } else if (state.prayerTimes) {
            renderPrayerTimes();
        } else {
            contentContainer.innerHTML = `<p class="text-center text-slate-500">${t('enterCityCountry')}</p>`;
        }
    };

    const renderPrayerTimes = () => {
        const { timings, meta } = state.prayerTimes;
        const locationString = `${state.location.city}, ${state.location.country}`;

        contentContainer.innerHTML = `
            <div class="fade-in">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200">${t('prayerTimesFor', { location: locationString })}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${t('calculationMethod', { method: meta.method.name })}</p>
                    <div id="countdown-container" class="mt-4 h-8"></div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    ${prayerOrder.map(prayer => `
                        <div id="prayer-${prayer}" class="prayer-card p-4 rounded-xl text-center transition-all duration-500 ease-out bg-white dark:bg-slate-900 shadow-md">
                            <p class="font-semibold text-slate-700 dark:text-slate-300">${t(`prayer_${prayer}`)}</p>
                            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">${timings[prayer]}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        updateCountdown();
    };
    
    const fetchPrayerTimes = async ({ city, country }) => {
        if (!city || !country) {
            state.error = t('enterBothCityCountry');
            renderContent();
            return;
        }

        state.loading = true;
        state.error = null;
        state.prayerTimes = null;
        renderContent();
        
        try {
            const response = await fetchWithRetry(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
            const data = await response.json();
            if (data.code !== 200 || !data.data) throw new Error(t('findPrayerTimesError'));
            
            state.prayerTimes = data.data;
            state.location = { city, country };
            localStorage.setItem('prayerLocation', JSON.stringify({ city, country }));

        } catch (err) {
            state.error = err.message;
        } finally {
            state.loading = false;
            renderContent();
        }
    };

    const fetchCitySuggestions = async (query) => {
        if (query.length < 3) {
            state.citySuggestions = [];
            renderCitySuggestions();
            return;
        }
        state.isSuggestionsLoading = true;

        try {
            const response = await fetchWithRetry(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&format=json&accept-language=en&limit=5`);
            const data = await response.json();
            state.citySuggestions = data.map(item => {
                const parts = item.display_name.split(', ');
                const city = parts[0];
                const country = parts[parts.length - 1];
                return { city, country, displayName: item.display_name };
            });
        } catch (error) {
            console.error('City suggestion error:', error);
            state.citySuggestions = [];
        } finally {
            state.isSuggestionsLoading = false;
            renderCitySuggestions();
        }
    };
    
    const renderCitySuggestions = () => {
        if (state.citySuggestions.length > 0) {
            citySuggestionsContainer.classList.remove('hidden');
            citySuggestionsContainer.innerHTML = state.citySuggestions.map(s =>
                `<div class="suggestion-item p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" data-city="${s.city}" data-country="${s.country}">${s.displayName}</div>`
            ).join('');
        } else {
            citySuggestionsContainer.classList.add('hidden');
        }
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        const country = countryInput.value.trim();
        fetchPrayerTimes({ city, country });
    };

    const handleCityInput = (e) => {
        const query = e.target.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fetchCitySuggestions(query), 300);
    };

    const handleSuggestionClick = (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            cityInput.value = item.dataset.city;
            countryInput.value = item.dataset.country;
            citySuggestionsContainer.classList.add('hidden');
            state.citySuggestions = [];
        }
    };

    const startClock = () => {
        clearInterval(clockInterval);
        clockInterval = setInterval(() => {
            state.currentTime = new Date();
            updateCountdown();
        }, 1000); // Update every second for the countdown
    };
    
    const closeSuggestionsOnClickOutside = (event) => {
        if (citySuggestionsContainer && !citySuggestionsContainer.contains(event.target) && event.target !== cityInput) {
            citySuggestionsContainer.classList.add('hidden');
        }
    };

    // --- QIBLA LOGIC ---
    
    const renderQibla = () => {
        qiblaContainer.innerHTML = '';
        if (!state.isQiblaVisible) return;

        switch (state.qiblaPermissionState) {
            case 'granted':
                if (state.isQiblaLoading) {
                    qiblaContainer.appendChild(createSpinner(t('findingLocation')));
                } else if (state.qiblaError) {
                    qiblaContainer.appendChild(renderErrorState(state.qiblaError, handlePermissionsRequest));
                } else {
                    qiblaContainer.appendChild(renderCompassView());
                }
                break;
            case 'denied':
                const errorMsg = `${t('errorOrientation')} ${state.isIOS ? t('errorIOSInstruction') : ''}`;
                qiblaContainer.appendChild(renderErrorState(errorMsg, handlePermissionsRequest));
                break;
            case 'prompt':
            default:
                qiblaContainer.appendChild(createSpinner(t('loading')));
                break;
        }
    };

    const renderCompassView = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'fade-in p-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm space-y-6 flex flex-col items-center';
        wrapper.innerHTML = `
            <div class="flex justify-between items-center w-full mb-2">
                <div class="w-8"></div> <!-- spacer -->
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">${t('qiblaCompass')}</h3>
                <button id="close-qibla-btn" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    ${CloseIcon()}
                </button>
            </div>
            <div class="relative w-64 h-64 md:w-80 md:h-80" id="compass-container">
                <!-- Compass Rose -->
                <div class="absolute inset-0 transition-transform duration-100 ease-linear">
                    <div class="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 shadow-inner flex items-center justify-center relative">
                        <span class="absolute top-2 text-lg font-bold text-theme-600 dark:text-theme-400">${t('north')}</span>
                        <span class="absolute bottom-2 text-lg font-bold text-slate-500">S</span>
                        <span class="absolute left-4 text-lg font-bold text-slate-500">W</span>
                        <span class="absolute right-4 text-lg font-bold text-slate-500">E</span>
                        <div class="w-2 h-2 rounded-full bg-slate-500"></div>
                    </div>
                </div>
                <!-- Qibla Pointer -->
                <div class="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-linear" style="transform: rotate(${state.qiblaDirection}deg);">
                     <svg class="w-4/5 h-4/5 text-theme-500 drop-shadow-lg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 0 L60 20 L52 20 L50 15 L48 20 L40 20 Z" fill="currentColor"/>
                     </svg>
                </div>
            </div>
            <div class="text-center">
                <p class="text-slate-500 dark:text-slate-400">${t('yourLocation')}</p>
                <p class="font-semibold text-lg">${state.qiblaLocation.city || '...'}, ${state.qiblaLocation.country || '...'}</p>
            </div>
             <div class="text-center">
                <p class="text-slate-500 dark:text-slate-400">${t('qiblaDirection')}</p>
                <p class="font-semibold text-lg font-mono">${state.qiblaDirection.toFixed(2)}°</p>
            </div>
        `;
        compassElement = wrapper.querySelector('#compass-container');
        if(compassElement) compassElement.style.transform = `rotate(${-state.deviceHeading}deg)`;
        
        wrapper.querySelector('#close-qibla-btn').addEventListener('click', handleHideQibla);

        return wrapper;
    };
    
    const handlePermissionsRequest = async () => {
        state.isQiblaLoading = true;
        state.qiblaError = null;
        renderQibla();

        if (state.isIOS) {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') throw new Error('Permission denied');
            } catch (error) {
                state.qiblaPermissionState = 'denied';
                state.isQiblaLoading = false;
                renderQibla();
                return;
            }
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                state.qiblaLocation = { lat: latitude, lon: longitude };
                state.qiblaDirection = calculateQiblaDirection(latitude, longitude);
                
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`)
                    .then(res => res.json())
                    .then(data => {
                        state.qiblaLocation.city = data.address.city || data.address.town || data.address.village;
                        state.qiblaLocation.country = data.address.country;
                    })
                    .finally(() => {
                        state.isQiblaLoading = false;
                        state.qiblaPermissionState = 'granted';
                        startOrientationListener();
                        renderQibla();
                    });
            },
            (error) => {
                state.qiblaError = t('errorLocation');
                state.isQiblaLoading = false;
                renderQibla();
            }
        );
    };

    const calculateQiblaDirection = (lat, lon) => {
        const toRad = (deg) => deg * Math.PI / 180;
        const latRad = toRad(lat);
        const lonRad = toRad(lon);
        const kaabaLatRad = toRad(KAABA_LAT);
        const kaabaLonRad = toRad(KAABA_LON);

        const y = Math.sin(kaabaLonRad - lonRad);
        const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(kaabaLonRad - lonRad);
        let angle = Math.atan2(y, x);
        
        angle = angle * 180 / Math.PI;
        return (angle + 360) % 360;
    };
    
    const handleOrientation = (event) => {
        let heading = event.webkitCompassHeading || event.alpha;
        if (typeof heading !== 'number') return;
        state.deviceHeading = heading;
        if (compassElement) {
            compassElement.style.transform = `rotate(${-heading}deg)`;
        }
    };
    
    const stopOrientationListener = () => {
        if (orientationListener) {
            const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
            window.removeEventListener(eventName, orientationListener);
            orientationListener = null;
        }
    };

    const startOrientationListener = () => {
        stopOrientationListener(); // Ensure no duplicates
        const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
        const listener = handleOrientation;
        window.addEventListener(eventName, listener);
        orientationListener = listener;
    };

    const handleShowQibla = () => {
        state.isQiblaVisible = true;
        showQiblaBtn.disabled = true;
        handlePermissionsRequest();
    };

    const handleHideQibla = () => {
        state.isQiblaVisible = false;
        stopOrientationListener();
        qiblaContainer.innerHTML = '';
        showQiblaBtn.disabled = false;
    };

    const cleanup = () => {
        clearInterval(clockInterval);
        document.removeEventListener('click', closeSuggestionsOnClickOutside);
        stopOrientationListener();
    };
    
    // --- Initial setup ---
    container.querySelector('#adhan-back-btn')?.addEventListener('click', () => {
        if (props.onBack) props.onBack();
    });
    locationForm.addEventListener('submit', handleFormSubmit);
    cityInput.addEventListener('input', handleCityInput);
    citySuggestionsContainer.addEventListener('click', handleSuggestionClick);
    showQiblaBtn.addEventListener('click', handleShowQibla);
    document.addEventListener('click', closeSuggestionsOnClickOutside);

    if (state.location) {
        fetchPrayerTimes(state.location);
    } else {
        renderContent();
    }
    startClock();

    return cleanup;
};