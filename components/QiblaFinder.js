import { t, getCurrentLanguage } from '../i18n.js';
import { ArrowLeftIcon, ArrowRightIcon, QiblaIcon } from './Icons.js';

export const renderQiblaFinder = (container, props = {}) => {
    const isRtl = getCurrentLanguage() === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

    let state = {
        heading: 0,
        qiblaAngle: null,
        error: null,
        permissionGranted: false,
        location: null,
        manualAngle: null,
        manualCity: null,
        cityQuery: '',
        cityLoading: false,
        cityError: null
    };

    const MAKKAH_LAT = 21.422487;
    const MAKKAH_LNG = 39.826206;

    const calculateQibla = (lat, lng) => {
        const phiK = MAKKAH_LAT * Math.PI / 180.0;
        const lambdaK = MAKKAH_LNG * Math.PI / 180.0;
        const phi = lat * Math.PI / 180.0;
        const lambda = lng * Math.PI / 180.0;

        const y = Math.sin(lambdaK - lambda);
        const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
        
        let qibla = Math.atan2(y, x) * 180.0 / Math.PI;
        return (qibla + 360.0) % 360.0;
    };

    const handleOrientation = (event) => {
        let heading = event.webkitCompassHeading || Math.abs(event.alpha - 360);
        if (heading) {
            state.heading = heading;
            updateCompass();
        }
    };

    const requestPermission = async () => {
        try {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    startCompass();
                } else {
                    state.error = t('compassPermissionDenied') || 'Compass permission denied.';
                    render();
                }
            } else {
                startCompass();
            }
        } catch (err) {
            state.error = err.message;
            render();
        }
    };

    const startCompass = () => {
        state.permissionGranted = true;
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    state.location = { latitude, longitude };
                    state.qiblaAngle = calculateQibla(latitude, longitude);
                    render();
                },
                (err) => {
                    state.error = t('locationPermissionDenied') || 'Location permission denied. Cannot calculate Qibla.';
                    render();
                }
            );
        } else {
            state.error = 'Geolocation is not supported by this browser.';
            render();
        }
    };

    const searchCityQibla = async (query) => {
        const q = (query || '').trim();
        state.cityQuery = q;
        if (q.length < 3) {
            state.cityError = 'Enter at least 3 letters of a city name.';
            render();
            return;
        }
        state.cityLoading = true;
        state.cityError = null;
        render();
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(q)}&format=json&accept-language=en&limit=1`);
            const data = await res.json();
            if (!data || !data.length) {
                state.cityError = 'City not found. Try another name.';
            } else {
                const parts = data[0].display_name.split(', ');
                state.manualCity = parts[0] + (parts.length > 1 ? ', ' + parts[parts.length - 1] : '');
                state.manualAngle = calculateQibla(parseFloat(data[0].lat), parseFloat(data[0].lon));
            }
        } catch (err) {
            state.cityError = 'Could not look up that city. Check your connection and try again.';
        }
        state.cityLoading = false;
        render();
    };

    const updateCompass = () => {
        const compassEl = container.querySelector('#compass-dial');
        const qiblaPointer = container.querySelector('#qibla-pointer');
        
        if (compassEl) {
            compassEl.style.transform = `rotate(${-state.heading}deg)`;
        }
        
        if (qiblaPointer && state.qiblaAngle !== null) {
            // The qibla pointer should point to the Qibla relative to North
            // Since the compass dial rotates to keep North up, the Qibla pointer
            // should rotate by the Qibla angle relative to the dial.
            qiblaPointer.style.transform = `rotate(${state.qiblaAngle}deg)`;
        }

        const headingText = container.querySelector('#heading-text');
        if (headingText) {
            headingText.textContent = `${Math.round(state.heading)}°`;
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="space-y-6 max-w-2xl mx-auto">
                <div class="flex items-center gap-4 mb-8">
                    <button id="qibla-back-btn" class="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1">
                        ${BackIcon()}
                        <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">${t('back')}</span>
                    </button>
                    <div>
                        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">${t('qiblaFinder') || 'Qibla Finder'}</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${t('qiblaDesc') || 'Find the direction of the Kaaba'}</p>
                    </div>
                </div>

                ${state.error ? `
                    <div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                        ${state.error}
                    </div>
                ` : ''}

                ${!state.permissionGranted && !state.error && state.manualAngle === null ? `
                    <div class="glass-card p-8 rounded-2xl text-center border border-slate-200/50 shadow-sm">
                        <div class="w-20 h-20 mx-auto bg-theme-50 dark:bg-theme-900/20 text-theme-600 dark:text-theme-400 rounded-full flex items-center justify-center mb-6">
                            ${QiblaIcon({className: 'w-10 h-10'})}
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">${t('compassPermission') || 'Compass & Location Access'}</h3>
                        <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">${t('compassPermissionDesc') || 'We need access to your device\'s compass and location to accurately determine the Qibla direction.'}</p>
                        <button id="grant-permission-btn" class="px-8 py-3 bg-theme-600 hover:bg-theme-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                            ${t('grantPermission') || 'Grant Permission'}
                        </button>
                        <div class="mt-8 pt-6 border-t border-slate-200 text-start">
                            <p class="font-bold text-slate-900 mb-1">No compass? Find your Qibla by city</p>
                            <p class="text-sm text-slate-500 mb-3">On a desktop there is no compass sensor. Enter your city and we will show the exact Qibla angle for it.</p>
                            <div class="flex gap-2">
                                <input id="qibla-city-input" type="text" value="${state.cityQuery}" placeholder="Enter your city…" class="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-theme-600">
                                <button id="qibla-city-btn" class="shrink-0 px-4 py-2.5 bg-theme-600 text-white rounded-xl text-sm font-bold hover:bg-theme-700 transition-colors" ${state.cityLoading ? 'disabled' : ''}>
                                    ${state.cityLoading ? 'Searching…' : 'Calculate'}
                                </button>
                            </div>
                            ${state.cityError ? `<p class="text-sm text-red-600 mt-2">${state.cityError}</p>` : ''}
                        </div>
                    </div>
                ` : ''}

                ${!state.permissionGranted && !state.error && state.manualAngle !== null ? `
                    <div class="bg-white p-8 rounded-2xl text-center border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">${state.manualCity}</p>
                        <div class="text-5xl font-bold text-theme-600 mb-2">${Math.round(state.manualAngle)}°</div>
                        <p class="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Face North, then turn ${Math.round(state.manualAngle)}° clockwise. That is your Qibla direction.</p>
                        <div class="relative w-64 h-64 mx-auto mb-8">
                            <div class="absolute inset-0 rounded-full border-4 border-slate-200 flex items-center justify-center">
                                <div class="absolute top-2 text-red-500 font-bold text-lg">N</div>
                                <div class="absolute bottom-2 text-slate-400 font-bold text-lg">S</div>
                                <div class="absolute right-2 text-slate-400 font-bold text-lg">E</div>
                                <div class="absolute left-2 text-slate-400 font-bold text-lg">W</div>
                                <div class="absolute inset-0" style="transform: rotate(${state.manualAngle}deg)">
                                    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex flex-col items-center">
                                        <div class="w-4 h-4 bg-theme-500 rotate-45"></div>
                                        <div class="w-1 h-32 bg-theme-500/20"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 rounded-full border-2 border-white z-10"></div>
                        </div>
                        <button id="qibla-manual-back-btn" class="text-sm font-bold text-theme-600 hover:underline">Back to compass</button>
                    </div>
                ` : ''}

                ${state.permissionGranted ? `
                    <div class="glass-card p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                        
                        <div class="absolute top-4 right-4 text-center">
                            <div class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">${t('heading') || 'Heading'}</div>
                            <div id="heading-text" class="text-2xl font-mono font-bold text-slate-900 dark:text-white">0°</div>
                        </div>

                        ${state.qiblaAngle !== null ? `
                            <div class="absolute top-4 left-4 text-center">
                                <div class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">${t('qibla') || 'Qibla'}</div>
                                <div class="text-2xl font-mono font-bold text-theme-600 dark:text-theme-400">${Math.round(state.qiblaAngle)}°</div>
                            </div>
                        ` : ''}

                        <div class="relative w-64 h-64 md:w-80 md:h-80 mt-8">
                            <!-- Compass Dial -->
                            <div id="compass-dial" class="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700 transition-transform duration-100 ease-out flex items-center justify-center shadow-inner">
                                <div class="absolute top-2 text-red-500 font-bold text-lg">N</div>
                                <div class="absolute bottom-2 text-slate-400 font-bold text-lg">S</div>
                                <div class="absolute right-2 text-slate-400 font-bold text-lg">E</div>
                                <div class="absolute left-2 text-slate-400 font-bold text-lg">W</div>
                                
                                <!-- Tick marks -->
                                ${Array.from({length: 12}).map((_, i) => `
                                    <div class="absolute w-1 h-3 bg-slate-300 dark:bg-slate-600" style="transform: rotate(${i * 30}deg) translateY(-120px) md:translateY(-150px)"></div>
                                `).join('')}

                                <!-- Qibla Pointer (rotates with dial, but offset by qiblaAngle) -->
                                ${state.qiblaAngle !== null ? `
                                    <div id="qibla-pointer" class="absolute inset-0 transition-transform duration-500 ease-out" style="transform: rotate(${state.qiblaAngle}deg)">
                                        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex flex-col items-center">
                                            <div class="w-4 h-4 bg-theme-500 rotate-45"></div>
                                            <div class="w-1 h-32 bg-theme-500/20"></div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Center Pin -->
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 dark:bg-slate-200 rounded-full shadow-md z-10 border-2 border-white dark:border-slate-900"></div>
                        </div>

                        ${!state.location ? `
                            <div class="mt-12 text-slate-500 dark:text-slate-400 animate-pulse text-sm">
                                ${t('gettingLocation') || 'Getting location...'}
                            </div>
                        ` : `
                            <div class="mt-12 text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
                                ${t('qiblaInstruction') || 'Rotate your device until the compass aligns with the Qibla pointer.'}
                            </div>
                        `}
                    </div>
                ` : ''}
            </div>
        `;

        container.querySelector('#qibla-back-btn')?.addEventListener('click', () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
            window.removeEventListener('deviceorientation', handleOrientation, true);
            if (props.onBack) props.onBack();
        });

        container.querySelector('#grant-permission-btn')?.addEventListener('click', requestPermission);
        const cityBtn = container.querySelector('#qibla-city-btn');
        const cityInput = container.querySelector('#qibla-city-input');
        cityBtn?.addEventListener('click', () => searchCityQibla(cityInput?.value || ''));
        cityInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchCityQibla(cityInput.value);
        });
        container.querySelector('#qibla-manual-back-btn')?.addEventListener('click', () => {
            state.manualAngle = null;
            state.manualCity = null;
            render();
        });
        
        if (state.permissionGranted) {
            updateCompass();
        }
    };

    render();
};
