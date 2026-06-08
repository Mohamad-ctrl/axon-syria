import type { Job } from "@/lib/jobs";

// Seed data used once to populate the `jobs` table. The app reads jobs from the DB.
export const seedJobs: Omit<Job, "active">[] = [
  {
    slug: "software-engineer",
    company: { en: "Axon Syria", ar: "أكسون سوريا" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "Software Engineer", ar: "مهندس برمجيات" },
    description: {
      en: [
        "Axon Syria is investing in its digital presence, and we're looking for a software engineer to help lead that effort across the group's companies.",
        "You'll work on modern, fast websites and the internal tools that support our operations — owning projects end to end, from design through deployment.",
      ],
      ar: [
        "تستثمر أكسون سوريا في حضورها الرقمي، ونبحث عن مهندس برمجيات للمساعدة في قيادة هذا الجهد عبر شركات المجموعة.",
        "ستعمل على مواقع حديثة وسريعة وعلى الأدوات الداخلية التي تدعم عملياتنا — مع تولّي المشاريع من البداية إلى النهاية، من التصميم حتى النشر.",
      ],
    },
    requirements: {
      en: [
        "2+ years building web applications with modern JavaScript/TypeScript.",
        "Experience with React and a framework such as Next.js.",
        "Solid understanding of HTML, CSS and web performance.",
        "Good communication skills in Arabic and English.",
      ],
      ar: [
        "خبرة سنتين فأكثر في بناء تطبيقات الويب باستخدام JavaScript/TypeScript الحديثة.",
        "خبرة في React وإطار عمل مثل Next.js.",
        "فهم متين لـ HTML وCSS وأداء الويب.",
        "مهارات تواصل جيدة بالعربية والإنجليزية.",
      ],
    },
    posted: "2026-05-20",
  },
  {
    slug: "mep-maintenance-technician",
    company: { en: "Axon Integrated Facilities Services", ar: "أكسون لخدمات المرافق العامة" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "MEP Maintenance Technician", ar: "فني صيانة أنظمة كهروميكانيكية" },
    description: {
      en: [
        "Join Axon Integrated Facilities Services' technical team keeping buildings, sites and infrastructure running across Syria.",
        "You'll handle day-to-day mechanical, electrical and plumbing maintenance — working to the quality and HSE standards adopted from Axon Group UAE's operations.",
      ],
      ar: [
        "انضم إلى الفريق الفني في أكسون لخدمات المرافق العامة الذي يُبقي المباني والمواقع والبنى التحتية تعمل في أنحاء سوريا.",
        "ستتولى أعمال الصيانة الميكانيكية والكهربائية والصحية اليومية — وفق معايير الجودة والسلامة المنقولة من عمليات مجموعة أكسون الإماراتية.",
      ],
    },
    requirements: {
      en: [
        "Diploma or trade certificate in a relevant technical field.",
        "3+ years of hands-on MEP maintenance experience.",
        "Knowledge of HSE standards and safe working practices.",
        "Valid driving licence is an advantage.",
      ],
      ar: [
        "دبلوم أو شهادة مهنية في مجال تقني ذي صلة.",
        "خبرة عملية 3 سنوات فأكثر في صيانة الأنظمة الميكانيكية والكهربائية والصحية.",
        "معرفة بمعايير الصحة والسلامة وممارسات العمل الآمن.",
        "رخصة قيادة سارية ميزة إضافية.",
      ],
    },
    posted: "2026-05-18",
  },
  {
    slug: "steel-fabricator",
    company: { en: "Axon for Industry & Trade", ar: "أكسون للصناعة والتجارة" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "Steel Fabricator / Welder", ar: "فني تصنيع وتلحيم هياكل معدنية" },
    description: {
      en: [
        "Axon for Industry & Trade fabricates steel structures, hangars and custom metalwork for projects across Syria.",
        "We're hiring experienced fabricators and welders to cut, assemble and finish steel structures to drawing, with on-site erection work as projects require.",
      ],
      ar: [
        "تصنّع أكسون للصناعة والتجارة الهياكل الحديدية والحظائر والأعمال المعدنية حسب الطلب لمشاريع في أنحاء سوريا.",
        "نوظّف فنيي تصنيع وتلحيم ذوي خبرة لقصّ الهياكل الحديدية وتجميعها وإنهائها وفق المخططات، مع أعمال تركيب في المواقع بحسب المشاريع.",
      ],
    },
    requirements: {
      en: [
        "Proven experience in steel fabrication or structural welding.",
        "Ability to read and work from technical drawings.",
        "Commitment to safe workshop and site practices.",
        "Willingness to travel to project sites within Syria.",
      ],
      ar: [
        "خبرة مثبتة في تصنيع الحديد أو تلحيم الهياكل الإنشائية.",
        "القدرة على قراءة المخططات الفنية والعمل وفقها.",
        "التزام بممارسات العمل الآمن في الورشة والموقع.",
        "استعداد للتنقل إلى مواقع المشاريع داخل سوريا.",
      ],
    },
    posted: "2026-05-12",
  },
  {
    slug: "landscape-supervisor",
    company: { en: "Axon Landscape", ar: "أكسون لاندسكيب" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "Landscape Supervisor", ar: "مشرف تنسيق حدائق" },
    description: {
      en: [
        "Axon Landscape creates and maintains gardens, green spaces and irrigation systems across Syria.",
        "We're looking for a hands-on supervisor to lead site crews and ensure every project is delivered to a high standard.",
      ],
      ar: [
        "تنشئ أكسون لاندسكيب الحدائق والمساحات الخضراء وأنظمة الري وتصونها في أنحاء سوريا.",
        "نبحث عن مشرف ميداني لقيادة فرق المواقع وضمان تنفيذ كل مشروع وفق معايير عالية.",
      ],
    },
    requirements: {
      en: [
        "Experience supervising landscaping or horticulture teams.",
        "Knowledge of plants suited to the Syrian climate and irrigation systems.",
        "Leadership and organisational skills.",
        "Valid driving licence preferred.",
      ],
      ar: [
        "خبرة في الإشراف على فرق تنسيق الحدائق أو البستنة.",
        "معرفة بالنباتات الملائمة للمناخ السوري وبأنظمة الري.",
        "مهارات قيادية وتنظيمية.",
        "يفضّل امتلاك رخصة قيادة سارية.",
      ],
    },
    posted: "2026-05-10",
  },
  {
    slug: "civil-site-engineer",
    company: { en: "Axon Contracting", ar: "أكسون للمقاولات" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "Civil Site Engineer", ar: "مهندس موقع مدني" },
    description: {
      en: [
        "Axon Contracting delivers civil construction, roads and restoration projects taking part in Syria's reconstruction.",
        "We're hiring a site engineer to oversee day-to-day construction activities and coordinate teams, subcontractors and quality control.",
      ],
      ar: [
        "تنفّذ أكسون للمقاولات مشاريع الإنشاءات المدنية والطرق والترميم ضمن مسيرة إعادة إعمار سوريا.",
        "نوظّف مهندس موقع للإشراف على أنشطة البناء اليومية وتنسيق الفرق ومقاولي الباطن وضبط الجودة.",
      ],
    },
    requirements: {
      en: [
        "Bachelor's degree in Civil Engineering.",
        "3+ years of site experience.",
        "Familiarity with local codes and construction standards.",
        "Strong coordination and problem-solving skills.",
      ],
      ar: [
        "درجة بكالوريوس في الهندسة المدنية.",
        "خبرة ميدانية 3 سنوات فأكثر.",
        "إلمام بالأكواد المحلية ومعايير البناء.",
        "مهارات قوية في التنسيق وحل المشكلات.",
      ],
    },
    posted: "2026-05-08",
  },
  {
    slug: "production-engineer",
    company: { en: "Imdad", ar: "إمداد" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "Production Engineer — Metal Construction", ar: "مهندس إنتاج — إنشاءات معدنية" },
    description: {
      en: [
        "Imdad manufactures cold roll-formed steel, prefabricated buildings and metal structures at its factory in Aleppo's Second Industrial Area.",
        "We're hiring a production engineer to plan and supervise fabrication lines, keep output to specification and uphold our ISO-certified quality and safety standards.",
      ],
      ar: [
        "تصنّع إمداد حديد التشكيل على البارد والمباني الجاهزة والهياكل المعدنية في مصنعها بالمدينة الصناعية الثانية في حلب.",
        "نوظّف مهندس إنتاج لتخطيط خطوط التصنيع والإشراف عليها، وضمان مطابقة الإنتاج للمواصفات، والالتزام بمعايير الجودة والسلامة المعتمدة وفق الأيزو.",
      ],
    },
    requirements: {
      en: [
        "Degree in mechanical, industrial or metallurgical engineering.",
        "Experience in steel fabrication or manufacturing operations.",
        "Working knowledge of quality systems (ISO 9001) and HSE practice.",
        "Strong planning and team-supervision skills.",
      ],
      ar: [
        "شهادة في الهندسة الميكانيكية أو الصناعية أو هندسة المعادن.",
        "خبرة في تصنيع الحديد أو العمليات الصناعية.",
        "معرفة عملية بأنظمة الجودة (الأيزو 9001) وممارسات الصحة والسلامة.",
        "مهارات قوية في التخطيط والإشراف على الفرق.",
      ],
    },
    posted: "2026-05-15",
  },
  {
    slug: "business-development-executive",
    company: { en: "Axon Syria", ar: "أكسون سوريا" },
    location: { en: "Aleppo, Syria", ar: "حلب، سوريا" },
    type: { en: "Full-time", ar: "دوام كامل" },
    title: { en: "Business Development Executive", ar: "تنفيذي تطوير أعمال" },
    description: {
      en: [
        "As a group of specialized companies, Axon Syria offers clients a single partner for many services.",
        "We're looking for a business development executive to build relationships, generate leads and win new contracts across our companies.",
      ],
      ar: [
        "بوصفها مجموعة من الشركات المتخصصة، تقدّم أكسون سوريا لعملائها شريكًا واحدًا لخدمات متعددة.",
        "نبحث عن تنفيذي تطوير أعمال لبناء العلاقات وتوليد العملاء المحتملين والفوز بعقود جديدة عبر شركاتنا.",
      ],
    },
    requirements: {
      en: [
        "Proven B2B sales or business-development experience.",
        "Strong communication and negotiation skills in Arabic and English.",
        "Knowledge of construction or facilities services is a plus.",
        "Valid driving licence.",
      ],
      ar: [
        "خبرة مثبتة في مبيعات الشركات أو تطوير الأعمال.",
        "مهارات قوية في التواصل والتفاوض بالعربية والإنجليزية.",
        "معرفة بقطاع الإنشاءات أو خدمات المرافق ميزة إضافية.",
        "رخصة قيادة سارية.",
      ],
    },
    posted: "2026-05-22",
  },
];
