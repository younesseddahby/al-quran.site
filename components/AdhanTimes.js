
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
    const isAutoLocation = localStorage.getItem('isAutoLocation') === 'true';
    const isRtl = getCurrentLanguage() === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

    let state = {
        location: savedLocation || null,
        isAutoLocation: isAutoLocation,
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
        qiblaLocation: null, 
        qiblaDirection: 0,
        deviceHeading: 0,
    };

    let debounceTimer;
    let clockInterval;
    let orientationListener = null;
    let compassElement = null;

    const render = () => {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <button id="adhan-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-all active:scale-90 flex items-center gap-1">
                            ${BackIcon({className: "w-6 h-6"})}
                            <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                        </button>
                        <h2 class="text-3xl font-bold text-theme-700 dark:text-theme-400 font-amiri">${t('adhanAndPrayerTimes')}</h2>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-theme-100 dark:bg-theme-900/30 flex items-center justify-center text-theme-600 dark:text-theme-400">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-900 dark:text-white">${t('autoLocation')}</p>
                                <p class="text-[10px] text-slate-500 dark:text-slate-400">${state.isAutoLocation ? t('currentLocation') : t('manualLocation')}</p>
                            </div>
                        </div>
                        <button id="auto-location-toggle" class="w-12 h-6 rounded-full transition-colors relative ${state.isAutoLocation ? 'bg-theme-600' : 'bg-slate-300 dark:bg-slate-700'}">
                            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${state.isAutoLocation ? 'translate-x-6' : ''}"></div>
                        </button>
                    </div>

                    ${!state.isAutoLocation ? `
                        <form id="location-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end animate-in">
                            <div class="relative sm:col-span-2">
                                <label for="city" class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">${t('city')}</label>
                                <input type="text" id="city" value="${state.location ? state.location.city : ''}" placeholder="${t('cityExample')}" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-theme-500/50 transition-all dark:text-white text-sm">
                                <div id="city-suggestions" class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden max-h-60 overflow-auto"></div>
                            </div>
                            <div>
                                <label for="country" class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">${t('country')}</label>
                                <input type="text" id="country" value="${state.location ? state.location.country : ''}" placeholder="${t('countryExample')}" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-theme-500/50 transition-all dark:text-white text-sm">
                            </div>
                            <button type="submit" class="w-full px-5 py-3 bg-theme-600 text-white rounded-xl font-bold hover:bg-theme-700 transition-all active:scale-95 shadow-lg shadow-theme-500/20">${t('showTimes')}</button>
                        </form>
                    ` : ''}

                    <button id="show-qibla-btn" class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                        ${QiblaIcon()} ${t('showQiblaDirection')}
                    </button>
                </div>

                <div id="prayer-times-container" class="mt-6"></div>
                <div id="qibla-container" class="mt-6"></div>
            </div>
        `;

        attachEventListeners();
        renderContent();
    };

    const attachEventListeners = () => {
        container.querySelector('#adhan-back-btn')?.addEventListener('click', () => {
            if (props.onBack) props.onBack();
        });

        container.querySelector('#auto-location-toggle')?.addEventListener('click', () => {
            state.isAutoLocation = !state.isAutoLocation;
            localStorage.setItem('isAutoLocation', state.isAutoLocation);
            if (state.isAutoLocation) {
                detectLocation();
            } else {
                render();
            }
        });

        const locationForm = container.querySelector('#location-form');
        if (locationForm) {
            locationForm.addEventListener('submit', handleFormSubmit);
            const cityInput = container.querySelector('#city');
            cityInput.addEventListener('input', handleCityInput);
            const citySuggestionsContainer = container.querySelector('#city-suggestions');
            citySuggestionsContainer.addEventListener('click', handleSuggestionClick);
        }

        container.querySelector('#show-qibla-btn')?.addEventListener('click', handleShowQibla);
    };

    const detectLocation = () => {
        state.loading = true;
        state.error = null;
        render();

        if (!navigator.geolocation) {
            state.error = "Geolocation is not supported by your browser.";
            state.isAutoLocation = false;
            state.loading = false;
            render();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                // Fetch prayer times immediately using coordinates
                state.location = { city: t('currentLocation') || "Current Location", country: "", lat: latitude, lon: longitude };
                fetchPrayerTimes(state.location);

                // Perform reverse geocoding in background to get city name
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
                    const data = await res.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || "Current Location";
                    const country = data.address.country || "";
                    
                    state.location = { city, country, lat: latitude, lon: longitude };
                    localStorage.setItem('prayerLocation', JSON.stringify(state.location));
                    
                    // Update UI with city name if prayer times are already loaded
                    if (state.prayerTimes) {
                        render();
                    }
                } catch (e) {
                    console.error("Reverse geocoding error:", e);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                state.error = t('locationPermissionDenied') || "Location permission denied.";
                state.isAutoLocation = false;
                state.loading = false;
                render();
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const fetchPrayerTimes = async (loc) => {
        if (!loc || (!loc.city && !loc.lat)) {
            state.error = t('enterBothCityCountry');
            renderContent();
            return;
        }

        state.loading = true;
        state.error = null;
        renderContent();
        
        try {
            let url = '';
            if (loc.lat && loc.lon) {
                url = `https://api.aladhan.com/v1/timings?latitude=${loc.lat}&longitude=${loc.lon}&method=2`;
            } else {
                url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(loc.city)}&country=${encodeURIComponent(loc.country)}&method=2`;
            }

            const response = await fetchWithRetry(url);
            const data = await response.json();
            if (data.code !== 200 || !data.data) throw new Error(t('findPrayerTimesError'));
            
            state.prayerTimes = data.data;
            render();
        } catch (err) {
            state.error = err.message;
            renderContent();
        } finally {
            state.loading = false;
        }
    };

    const getNextPrayerInfo = () => {
        if (!state.prayerTimes) return null;

        const now = state.currentTime;
        const timings = state.prayerTimes.timings;

        let nextPrayerName = null;
        let nextPrayerTime = Infinity;

        const prayerTimesToday = prayerOrder.map(name => {
            const [hours, minutes] = timings[name].split(':').map(Number);
            const date = new Date(now);
            date.setHours(hours, minutes, 0, 0);
            return { name, date };
        });

        for (const prayer of prayerTimesToday) {
            if (prayer.date > now && prayer.date < nextPrayerTime) {
                nextPrayerTime = prayer.date;
                nextPrayerName = prayer.name;
            }
        }

        if (!nextPrayerName) {
            nextPrayerName = 'Fajr';
            const fajrTime = prayerTimesToday.find(p => p.name === 'Fajr');
            if(fajrTime) {
                nextPrayerTime = new Date(fajrTime.date);
                nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
            } else {
                return null;
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

        if (state.highlightedPrayer) {
            const previousCard = container.querySelector(`#prayer-${state.highlightedPrayer}`);
            if (previousCard) {
                previousCard.classList.remove('bg-gradient-to-br', 'from-theme-500', 'to-theme-600', 'transform', 'scale-105', '-translate-y-1', 'shadow-xl', 'shadow-theme-500/40');
                previousCard.classList.add('bg-white', 'dark:bg-slate-900');
                previousCard.querySelectorAll('p').forEach(p => p.classList.remove('text-white', 'dark:text-white'));
            }
        }

        const highlightedCard = container.querySelector(`#prayer-${nextPrayerName}`);
        if (highlightedCard) {
            highlightedCard.classList.add('bg-gradient-to-br', 'from-theme-500', 'to-theme-600', 'transform', 'scale-105', '-translate-y-1', 'shadow-xl', 'shadow-theme-500/40');
            highlightedCard.classList.remove('bg-white', 'dark:bg-slate-900');
            highlightedCard.querySelectorAll('p').forEach(p => p.classList.add('text-white', 'dark:text-white'));
        }
        
        state.highlightedPrayer = nextPrayerName;
    };

    const renderContent = () => {
        const contentContainer = container.querySelector('#prayer-times-container');
        if (!contentContainer) return;

        contentContainer.innerHTML = '';
        if (state.loading) {
            contentContainer.appendChild(createSpinner(t('loading')));
        } else if (state.error) {
            contentContainer.appendChild(renderErrorState(state.error, () => state.isAutoLocation ? detectLocation() : fetchPrayerTimes(state.location)));
        } else if (state.prayerTimes) {
            renderPrayerTimes(contentContainer);
        } else {
            contentContainer.innerHTML = `<p class="text-center text-slate-500 py-10">${t('enterCityCountry')}</p>`;
        }
    };

    const renderPrayerTimes = (contentContainer) => {
        const { timings, meta } = state.prayerTimes;
        const locationString = state.location && state.location.city ? `${state.location.city}${state.location.country ? ', ' + state.location.country : ''}` : t('currentLocation');

        contentContainer.innerHTML = `
            <div class="fade-in space-y-6">
                <div class="text-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200">${t('prayerTimesFor', { location: locationString })}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">${t('calculationMethod', { method: meta.method.name })}</p>
                    <div id="countdown-container" class="mt-6"></div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    ${prayerOrder.map(prayer => `
                        <div id="prayer-${prayer}" class="prayer-card p-5 rounded-2xl text-center transition-all duration-500 ease-out bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">${t(`prayer_${prayer}`)}</p>
                            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono">${timings[prayer]}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        updateCountdown();
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
        const citySuggestionsContainer = container.querySelector('#city-suggestions');
        if (!citySuggestionsContainer) return;

        if (state.citySuggestions.length > 0) {
            citySuggestionsContainer.classList.remove('hidden');
            citySuggestionsContainer.innerHTML = state.citySuggestions.map(s =>
                `<div class="suggestion-item p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-sm border-b border-slate-50 dark:border-slate-700 last:border-0" data-city="${s.city}" data-country="${s.country}">${s.displayName}</div>`
            ).join('');
        } else {
            citySuggestionsContainer.classList.add('hidden');
        }
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const cityInput = container.querySelector('#city');
        const countryInput = container.querySelector('#country');
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
            const cityInput = container.querySelector('#city');
            const countryInput = container.querySelector('#country');
            cityInput.value = item.dataset.city;
            countryInput.value = item.dataset.country;
            const citySuggestionsContainer = container.querySelector('#city-suggestions');
            citySuggestionsContainer.classList.add('hidden');
            state.citySuggestions = [];
        }
    };

    const startClock = () => {
        clearInterval(clockInterval);
        clockInterval = setInterval(() => {
            state.currentTime = new Date();
            updateCountdown();
        }, 1000);
    };
    
    const closeSuggestionsOnClickOutside = (event) => {
        const citySuggestionsContainer = container.querySelector('#city-suggestions');
        const cityInput = container.querySelector('#city');
        if (citySuggestionsContainer && !citySuggestionsContainer.contains(event.target) && event.target !== cityInput) {
            citySuggestionsContainer.classList.add('hidden');
        }
    };

    // --- QIBLA LOGIC ---
    
    const renderQibla = () => {
        const qiblaContainer = container.querySelector('#qibla-container');
        if (!qiblaContainer) return;

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
        wrapper.className = 'fade-in p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 flex flex-col items-center';
        wrapper.innerHTML = `
            <div class="flex justify-between items-center w-full">
                <div class="w-8"></div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">${t('qiblaCompass')}</h3>
                <button id="close-qibla-btn" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    ${CloseIcon()}
                </button>
            </div>
            <div class="relative w-64 h-64 md:w-80 md:h-80" id="compass-container">
                <div class="absolute inset-0 transition-transform duration-100 ease-linear">
                    <div class="w-full h-full rounded-full bg-slate-50 dark:bg-slate-800 shadow-inner flex items-center justify-center relative border-4 border-slate-100 dark:border-slate-700">
                        <span class="absolute top-4 text-xl font-black text-theme-600 dark:text-theme-400">N</span>
                        <span class="absolute bottom-4 text-xl font-bold text-slate-400">S</span>
                        <span class="absolute left-6 text-xl font-bold text-slate-400">W</span>
                        <span class="absolute right-6 text-xl font-bold text-slate-400">E</span>
                        <div class="w-3 h-3 rounded-full bg-slate-400"></div>
                    </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-linear" style="transform: rotate(${state.qiblaDirection}deg);">
                     <svg class="w-4/5 h-4/5 text-theme-500 drop-shadow-2xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 0 L60 20 L52 20 L50 15 L48 20 L40 20 Z" fill="currentColor"/>
                     </svg>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4 w-full">
                <div class="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t('yourLocation')}</p>
                    <p class="font-bold text-slate-700 dark:text-slate-200 truncate">${state.qiblaLocation.city || '...'}</p>
                </div>
                 <div class="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t('qiblaDirection')}</p>
                    <p class="font-bold text-theme-600 dark:text-theme-400 font-mono">${state.qiblaDirection.toFixed(1)}°</p>
                </div>
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
        stopOrientationListener();
        const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
        const listener = handleOrientation;
        window.addEventListener(eventName, listener);
        orientationListener = listener;
    };

    const handleShowQibla = () => {
        state.isQiblaVisible = true;
        const showQiblaBtn = container.querySelector('#show-qibla-btn');
        if (showQiblaBtn) showQiblaBtn.disabled = true;
        handlePermissionsRequest();
    };

    const handleHideQibla = () => {
        state.isQiblaVisible = false;
        stopOrientationListener();
        const qiblaContainer = container.querySelector('#qibla-container');
        if (qiblaContainer) qiblaContainer.innerHTML = '';
        const showQiblaBtn = container.querySelector('#show-qibla-btn');
        if (showQiblaBtn) showQiblaBtn.disabled = false;
    };

    const cleanup = () => {
        clearInterval(clockInterval);
        document.removeEventListener('click', closeSuggestionsOnClickOutside);
        stopOrientationListener();
    };
    
    // --- Initial setup ---
    render();
    if (state.isAutoLocation) {
        detectLocation();
    } else if (state.location) {
        fetchPrayerTimes(state.location);
    }
    startClock();

    return cleanup;
};
