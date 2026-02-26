import { t } from '../i18n.js';
import { ChevronRightIcon } from './Icons.js';

const SCIENTIFIC_MIRACLES_DATA = [
  {
    "id": "embryology",
    "title_en": "Embryology in the Quran",
    "title_ar": "علم الأجنة في القرآن",
    "content_en": "The Quran describes the stages of human embryonic development with remarkable precision, at a time when microscopes did not exist. It mentions the 'alaqah' (a leech-like, clinging clot of blood) and 'mudghah' (a chewed-like lump of flesh), which accurately describe the appearance and behavior of the early-stage embryo.",
    "content_ar": "يصف القرآن مراحل تطور الجنين البشري بدقة ملحوظة، في وقت لم تكن فيه المجاهر موجودة. يذكر 'العلقة' (قطعة دم متخثرة تشبه العلقة) و'المضغة' (قطعة لحم تشبه الشيء الممضوغ)، وهما وصفان دقيقان لمظهر وسلوك الجنين في مراحله المبكرة.",
    "verses": [
      { "surah": 23, "ayah": 14, "text_en": "Then We made the sperm-drop into a clinging clot, and We made the clot into a lump [of flesh], and We made [from] the lump, bones, and We covered the bones with flesh; then We developed him into another creation. So blessed is Allah, the best of creators." },
      { "surah": 96, "ayah": 2, "text_en": "Created man from a clinging substance." }
    ]
  },
  {
    "id": "astronomy",
    "title_en": "The Expanding Universe",
    "title_ar": "توسع الكون",
    "content_en": "Modern cosmology has established that the universe is expanding. This groundbreaking discovery of the 20th century is alluded to in the Quran, which states that the heaven is being built with power and is being expanded.",
    "content_ar": "أثبتت علم الكونيات الحديث أن الكون يتوسع. هذا الاكتشاف الرائد في القرن العشرين أشار إليه القرآن، الذي يذكر أن السماء بنيت بقوة وأنها في توسع مستمر.",
    "verses": [
      { "surah": 51, "ayah": 47, "text_en": "And the heaven We constructed with strength, and indeed, We are [its] expander." }
    ]
  },
  {
    "id": "oceans",
    "title_en": "The Barrier Between Seas",
    "title_ar": "الحاجز بين البحار",
    "content_en": "The Quran mentions a barrier between two seas that meet, preventing them from mixing. Oceanographers have discovered that where different seas meet, a barrier of different salinity, temperature, and density separates them, allowing each to maintain its distinct characteristics.",
    "content_ar": "يذكر القرآن وجود حاجز بين بحرين يلتقيان، يمنعهما من الاختلاط. اكتشف علماء المحيطات أنه عند التقاء البحار المختلفة، يفصل بينها حاجز يختلف في الملوحة ودرجة الحرارة والكثافة، مما يسمح لكل بحر بالحفاظ على خصائصه المميزة.",
    "verses": [
      { "surah": 55, "ayahs": "19-20", "text_en": "He released the two seas, meeting [side by side]. Between them is a barrier [so] neither of them transgresses." },
      { "surah": 25, "ayah": 53, "text_en": "And it is He who has released [simultaneously] the two seas, one fresh and sweet and one salty and bitter, and He placed between them a barrier and a partition forbidding contact." }
    ]
  },
  {
    "id": "mountains",
    "title_en": "Mountains as Pegs",
    "title_ar": "الجبال كالأوتاد",
    "content_en": "The Quran describes mountains as 'pegs' (awtad). Modern geology confirms that mountains have deep roots embedded in the ground, functioning much like pegs that stabilize a tent. These roots can reach several times their surface height deep into the Earth, playing a crucial role in stabilizing the Earth's crust.",
    "content_ar": "يصف القرآن الجبال بأنها 'أوتاد'. يؤكد علم الجيولوجيا الحديث أن للجبال جذوراً عميقة مغروسة في الأرض، تعمل بشكل كبير مثل الأوتاد التي تثبت الخيمة. يمكن أن تصل هذه الجذور إلى عدة أضعاف ارتفاعها السطحي في عمق الأرض، وتلعب دوراً حاسماً في استقرار القشرة الأرضية.",
    "verses": [
      { "surah": 78, "ayahs": "6-7", "text_en": "Have We not made the earth a resting place? And the mountains as stakes?" }
    ]
  }
];

export const renderScientificMiracles = (container, { navigateTo }) => {

    const render = () => {
        const lang = t('language') === 'Arabic' ? 'ar' : 'en';

        container.innerHTML = `
            <div class="space-y-6">
                <h2 class="text-3xl font-bold text-theme-700 dark:text-theme-400 font-amiri">${t('scientificMiracles')}</h2>
                <div class="space-y-4" id="miracles-accordion">
                    ${SCIENTIFIC_MIRACLES_DATA.map((item, index) => `
                        <div class="accordion-item bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
                            <button class="accordion-header w-full flex justify-between items-center p-5 text-left rtl:text-right" aria-expanded="false" aria-controls="accordion-content-${index}">
                                <span class="font-bold text-lg text-slate-800 dark:text-slate-200">${item[`title_${lang}`]}</span>
                                <svg class="accordion-icon w-6 h-6 text-slate-500 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div id="accordion-content-${index}" class="accordion-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                                <div class="p-5 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                    <p class="text-slate-600 dark:text-slate-300 leading-relaxed">${item[`content_${lang}`]}</p>
                                    <div>
                                        <h4 class="font-semibold text-slate-700 dark:text-slate-200 mb-2">${t('relatedVerses')}</h4>
                                        <div class="space-y-2">
                                            ${item.verses.map(v => `
                                                <div class="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                                                    <p class="italic text-slate-800 dark:text-slate-200">"${v.text_en}"</p>
                                                    <button class="verse-link text-sm font-semibold text-theme-600 dark:text-theme-400 hover:underline mt-1" data-surah="${v.surah}" data-ayah="${v.ayah || (v.ayahs && v.ayahs.split('-')[0])}">
                                                        ${t('surah')} ${v.surah}, ${v.ayahs ? `${t('verses')} ${v.ayahs}` : `${t('verse')} ${v.ayah}`}
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        attachEventListeners();
    };

    const attachEventListeners = () => {
        const accordion = container.querySelector('#miracles-accordion');
        if (!accordion) return;

        accordion.addEventListener('click', (e) => {
            const header = e.target.closest('.accordion-header');
            if (!header) return;
            
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const icon = header.querySelector('.accordion-icon');
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Close all other items
            accordion.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                    otherItem.querySelector('.accordion-icon').classList.remove('rotate-180');
                }
            });

            // Toggle the clicked item
            if (isExpanded) {
                header.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
                icon.classList.remove('rotate-180');
            } else {
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
                icon.classList.add('rotate-180');
            }
        });

        accordion.querySelectorAll('.verse-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const surahNumber = parseInt(link.dataset.surah, 10);
                const ayahNumber = parseInt(link.dataset.ayah, 10);
                navigateTo({ surahNumber, ayahNumber });
            });
        });
    };
    
    render();

    return () => {
        // Cleanup function if needed
    };
};
