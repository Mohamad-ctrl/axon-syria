/**
 * Rich per-company content for the detail pages, keyed by slug.
 * Bilingual text lives inline (same pattern as the dictionaries) so it stays
 * co-located per company and doesn't bloat the dictionaries.
 *
 * - `accent`  — per-company brand colour sampled from the official logo (used
 *               for chips, service marks, section labels and buttons on that
 *               company's page only; the global header/footer keep the Axon
 *               Syria royal blue).
 * - `name`    — short label shown beside the Axon Syria mark in the header.
 * - `logo`    — `/images/companies/<slug>-logo.png` (the official logos from
 *               the Syria brand pack; dimensions match the trimmed files).
 * - `services`— grouped from each company's licensed business activities
 *               (Syrian commercial registry) — Imdad's from its live site.
 * - `contact` — company's own direct line/email where one exists; otherwise
 *               the page falls back to the group call-to-action.
 */
export type Bilingual = { en: string; ar: string };
export type ProfileService = { en: string; ar: string; enDesc: string; arDesc: string };
export type CompanyContact = { phone?: string; email?: string };
export type CompanyProfile = {
  accent: string;
  name: Bilingual;
  tagline: Bilingual;
  logo?: string;
  logoW?: number;
  logoH?: number;
  /** logo is light/white → show it on a dark accent plate, and fall back to the
   *  wordmark in the (white) header. */
  logoOnDark?: boolean;
  services: ProfileService[];
  contact?: CompanyContact;
};

export const companyProfiles: Record<string, CompanyProfile> = {
  "axon-contracting": {
    accent: "#3A4A44",
    name: { en: "Axon Contracting", ar: "أكسون للمقاولات" },
    tagline: { en: "Building Syria back, from the ground up.", ar: "نعيد بناء سوريا، من الأساس." },
    logo: "/images/companies/axon-contracting-logo.png",
    logoW: 195,
    logoH: 100,
    services: [
      { en: "Building Construction", ar: "إنشاء المباني", enDesc: "Construction of all types of residential and non-residential buildings, from foundations to a finished, ready-to-use structure.", arDesc: "إنشاء المباني السكنية وغير السكنية بجميع أنواعها، من الأساسات إلى هيكل مكتمل جاهز للاستخدام." },
      { en: "Roads & Highways", ar: "الطرق والطرق السريعة", enDesc: "Construction and repair of highways, streets, roads and pedestrian pathways, including the paving and surfacing of streets, highways and tunnels.", arDesc: "إنشاء وإصلاح الطرق السريعة والشوارع والطرق وممرّات المشاة، بما في ذلك تعبيد وتسوية الشوارع والطرق السريعة والأنفاق." },
      { en: "Bridges & Water Networks", ar: "الجسور وشبكات المياه", enDesc: "Construction and repair of bridges and elevated highways, plus installation of water pipeline networks within and between cities.", arDesc: "إنشاء وإصلاح الجسور والطرق المرتفعة، إضافةً إلى مدّ شبكات نقل المياه داخل المدن وفيما بينها." },
      { en: "Restoration & Heritage", ar: "الترميم والتراث", enDesc: "Restoration and rehabilitation of buildings, including historical sites and heritage structures, returning them to safe, lasting use.", arDesc: "ترميم المباني وإعادة تأهيلها، بما في ذلك المواقع التاريخية والمباني التراثية، لإعادتها إلى استخدام آمن ودائم." },
      { en: "Demolition & Site Works", ar: "الهدم وأعمال المواقع", enDesc: "Safe demolition of buildings and structures, debris removal and site clearance, preparing the ground for what comes next.", arDesc: "هدم المباني والمنشآت بأمان، وإزالة الأنقاض وتنظيف المواقع، لتهيئة الأرض لما يليها من أعمال." },
      { en: "Building-Materials Supply", ar: "توريد مواد البناء", enDesc: "Import, export and wholesale of construction materials and machinery: cement, steel, marble, ceramics, sanitary ware, wood and more.", arDesc: "استيراد مواد البناء والآليات وتصديرها وبيعها بالجملة: الإسمنت والحديد والرخام والسيراميك والأدوات الصحية والأخشاب وغيرها." },
    ],
  },

  "axon-industry-trade": {
    accent: "#E8920E",
    name: { en: "Axon Industry & Trade", ar: "أكسون للصناعة والتجارة" },
    tagline: { en: "Steel built to spec, supply you can rely on.", ar: "حديدٌ يُصنع وفق المواصفة، وتوريدٌ يُعتمد عليه." },
    logo: "/images/companies/axon-industry-trade-logo.png",
    logoW: 206,
    logoH: 100,
    services: [
      { en: "Steel Structures & Hangars", ar: "الهياكل الحديدية والحظائر", enDesc: "Fabrication of steel and metal structures, including hangars, industrial sheds and warehouse frames, engineered and built to specification.", arDesc: "تصنيع الهياكل الحديدية والمعدنية، بما فيها الحظائر والمستودعات الصناعية وهياكل المخازن، مهندسةً ومصنّعةً وفق المواصفة." },
      { en: "Custom Metal Fabrication", ar: "التصنيع المعدني حسب الطلب", enDesc: "Made-to-order fabricated steel products such as flagpoles, gates, frames and similar metalwork, cut and finished to each client's drawings.", arDesc: "منتجات حديدية مصنّعة حسب الطلب، كسواري الأعلام والبوابات والهياكل والأعمال المعدنية المماثلة، تُقصّ وتُجهَّز وفق مخططات كل عميل." },
      { en: "Industrial Equipment Supply", ar: "توريد المعدات الصناعية", enDesc: "Supply of industrial equipment and machinery for factories, workshops and project sites, sourced to match the technical requirements of each application.", arDesc: "توريد المعدات والآلات الصناعية للمصانع والورش ومواقع المشاريع، مُنتقاةً بما يطابق المتطلبات التقنية لكل استخدام." },
      { en: "Import & Export", ar: "الاستيراد والتصدير", enDesc: "Import and export of materials and industrial goods, giving clients a dependable channel to products and inputs from regional and international markets.", arDesc: "استيراد المواد والسلع الصناعية وتصديرها، بما يمنح العملاء قناة موثوقة للوصول إلى المنتجات والمدخلات من الأسواق الإقليمية والعالمية." },
      { en: "Commercial Agencies", ar: "الوكالات التجارية", enDesc: "Acting as commercial agent and representative for local and foreign manufacturers, connecting their products and equipment to the Syrian market.", arDesc: "العمل وكيلاً تجارياً وممثلاً للمصنّعين المحليين والأجانب، وربط منتجاتهم ومعداتهم بالسوق السورية." },
      { en: "On-Site Erection", ar: "التركيب في الموقع", enDesc: "Delivery and on-site erection of fabricated steel structures, assembled and installed by the team that builds them for a clean, single-source handover.", arDesc: "توصيل الهياكل الحديدية المصنّعة وتركيبها في الموقع، إذ يتولّى تجميعها وتنصيبها الفريق نفسه الذي صنّعها، لتسليمٍ متكامل من مصدر واحد." },
    ],
  },

  "axon-integrated-facilities": {
    accent: "#4056E0",
    name: { en: "Axon Facilities Services", ar: "أكسون لخدمات المرافق" },
    tagline: { en: "Facilities and infrastructure, kept running.", ar: "مرافق وبنى تحتية، نُبقيها تعمل." },
    logo: "/images/companies/axon-integrated-facilities-logo.png",
    logoW: 216,
    logoH: 100,
    services: [
      { en: "MEP Systems", ar: "الأنظمة الكهروميكانيكية", enDesc: "Plumbing, electrical and heating systems, electric, gas or oil, plus the installation and maintenance of automatic doors across facilities.", arDesc: "أعمال السباكة والكهرباء والتدفئة، الكهربائية والغازية والنفطية، إضافة إلى تركيب الأبواب الأوتوماتيكية وصيانتها في مختلف المرافق." },
      { en: "HVAC & Climate Control", ar: "التكييف والتبريد", enDesc: "Installation and maintenance of cooling and air-conditioning systems, keeping interiors comfortable and equipment running within safe temperature ranges.", arDesc: "تركيب وصيانة أنظمة التبريد والتكييف، للحفاظ على راحة المساحات الداخلية وعمل التجهيزات ضمن نطاقات حرارة آمنة." },
      { en: "Solar Energy Systems", ar: "أنظمة الطاقة الشمسية", enDesc: "Installation and maintenance of solar power systems, giving facilities a cleaner and more reliable source of energy.", arDesc: "تركيب وصيانة أنظمة الطاقة الشمسية، لتزويد المرافق بمصدر طاقة أنظف وأكثر موثوقية." },
      { en: "Water & Sewage Networks", ar: "شبكات المياه والصرف الصحي", enDesc: "Operation of sewage networks, drain maintenance and cleaning, technical-pit insulation, and collection of domestic and industrial sewage.", arDesc: "تشغيل شبكات الصرف الصحي وصيانة المصارف وتنظيفها، وعزل الحفر الفنية، وجمع مياه الصرف المنزلية والصناعية." },
      { en: "Waste Collection & Recycling", ar: "جمع النفايات وإعادة التدوير", enDesc: "Garbage collection from public areas, recovery of recyclable waste, and removal of construction and demolition debris.", arDesc: "جمع القمامة من المناطق العامة، واستعادة النفايات القابلة للتدوير، وإزالة مخلّفات البناء والهدم." },
      { en: "Remediation & Fit-Out", ar: "المعالجة والتجهيز والتشطيب", enDesc: "Soil and water remediation, site decontamination and insulation, plus ceilings, partitions, tiling, gypsum, painting and post-construction cleaning.", arDesc: "معالجة التربة والمياه وإزالة تلوّث المواقع وأعمال العزل، إضافة إلى الأسقف والقواطع والتبليط والجبس والدهان وتنظيف ما بعد البناء." },
    ],
  },

  "axon-landscape": {
    accent: "#7A9C4F",
    name: { en: "Axon Landscape", ar: "أكسون لاندسكيب" },
    tagline: { en: "Greener spaces, built to last.", ar: "مساحات خضراء، صُممت لتبقى." },
    logo: "/images/companies/axon-landscape-logo.png",
    logoW: 181,
    logoH: 100,
    services: [
      { en: "Landscape Design & Execution", ar: "تصميم وتنفيذ المساحات الخضراء", enDesc: "Complete landscaping from concept to handover, including green roofs and planted building facades that turn structures into living, green surfaces.", arDesc: "تنسيق متكامل للمواقع من الفكرة حتى التسليم، بما في ذلك الأسطح الخضراء والواجهات المزروعة التي تحوّل المباني إلى أسطح خضراء نابضة بالحياة." },
      { en: "Garden Maintenance & Pest Control", ar: "صيانة الحدائق ومكافحة الآفات", enDesc: "Regular upkeep that keeps gardens and green spaces healthy, alongside specialized cleaning, disinfection and pest and rodent control for buildings.", arDesc: "صيانة منتظمة تحافظ على صحة الحدائق والمساحات الخضراء، إلى جانب التنظيف والتعقيم المتخصص ومكافحة الحشرات والقوارض في المباني." },
      { en: "Nurseries & Ornamental Plants", ar: "المشاتل ونباتات الزينة", enDesc: "In-house nurseries producing seedlings, tree saplings and ornamental plants, with propagation centres that supply projects with healthy, climate-suited stock.", arDesc: "مشاتل خاصة لإنتاج الشتلات وغراس الأشجار ونباتات الزينة، مع مراكز إكثار النباتات التي تزوّد المشاريع بنباتات سليمة ملائمة للمناخ." },
      { en: "Irrigation Systems", ar: "أنظمة الري", enDesc: "Design, installation and operation of irrigation systems and equipment, delivering water efficiently so planting stays healthy through dry seasons.", arDesc: "تصميم وتركيب وتشغيل أنظمة الري ومعداتها، لإيصال المياه بكفاءة والحفاظ على صحة المزروعات خلال مواسم الجفاف." },
      { en: "Natural-Grass Sports Pitches", ar: "الملاعب العشبية الطبيعية", enDesc: "Preparation and maintenance of natural-grass pitches for sports facilities, from ground preparation and turf establishment to season-long care.", arDesc: "إعداد وصيانة الملاعب العشبية الطبيعية للمنشآت الرياضية، من تهيئة الأرض وزراعة العشب حتى العناية المستمرة طوال الموسم." },
      { en: "Greenhouses & Agricultural Supplies", ar: "البيوت البلاستيكية والمستلزمات الزراعية", enDesc: "Installation of plastic greenhouses plus import and wholesale of agricultural machinery, equipment and supplies, including operator-driven equipment services.", arDesc: "تركيب البيوت البلاستيكية، إضافة إلى استيراد وبيع الآليات والمعدات والمستلزمات الزراعية بالجملة، بما في ذلك خدمات المعدات الزراعية مع مشغّليها." },
    ],
  },

  imdad: {
    accent: "#2A2659",
    name: { en: "Imdad", ar: "إمداد" },
    tagline: { en: "Steel that builds Syria back.", ar: "حديدٌ يعيد بناء سوريا." },
    logo: "/images/companies/imdad-logo.png",
    logoW: 91,
    logoH: 70,
    contact: { phone: "+963 21 473 1300", email: "info@imdadgroup.com" },
    services: [
      { en: "Cold Roll-Formed Steel", ar: "حديد التشكيل على البارد", enDesc: "Cold roll-forming and steel shaping, with metal structures designed and fabricated to European engineering standards for industrial and commercial projects.", arDesc: "تشكيل الحديد على البارد وتشكيل الفولاذ، مع هياكل معدنية مصمّمة ومصنّعة وفق المعايير الهندسية الأوروبية للمشاريع الصناعية والتجارية." },
      { en: "Prefabricated Buildings & Caravans", ar: "المباني الجاهزة والكرفانات", enDesc: "Prefabricated buildings, caravans and temporary offices, manufactured at the factory and delivered ready to install on site.", arDesc: "مبانٍ جاهزة وكرفانات ومكاتب مؤقتة، تُصنّع في المعمل وتُسلّم جاهزة للتركيب في الموقع." },
      { en: "Cladding & Fit-Out", ar: "الكسوة والتشطيب", enDesc: "Building cladding and interior fit-out: gypsum and cement boards, false ceilings, and electrical and sanitary installations.", arDesc: "كسوة المباني والتشطيب الداخلي: ألواح الجبس والإسمنت، والأسقف المستعارة، والتمديدات الكهربائية والصحية." },
      { en: "Metal Warehouses & Contracting", ar: "المستودعات المعدنية والمقاولات", enDesc: "Building and metal contracting, including the construction and full equipping of metal warehouses and industrial structures.", arDesc: "مقاولات البناء والمعادن، بما في ذلك إنشاء المستودعات المعدنية والمنشآت الصناعية وتجهيزها بالكامل." },
      { en: "Aluminium & Glass Facades", ar: "واجهات الألمنيوم والزجاج", enDesc: "Aluminium and glass works for building facades, fabricated and installed to suit commercial and residential projects.", arDesc: "أعمال الألمنيوم والزجاج لواجهات المباني، تُصنّع وتُركّب بما يلائم المشاريع التجارية والسكنية." },
      { en: "Scaffolding, Tents & Greenhouses", ar: "السقالات والخيام والبيوت المحمية", enDesc: "Manufacture of metal scaffolding, along with event tents and greenhouses, for construction sites and agricultural projects alike.", arDesc: "تصنيع السقالات المعدنية، إضافةً إلى خيام المناسبات والبيوت الزراعية المحمية، لمواقع البناء والمشاريع الزراعية على حدٍّ سواء." },
    ],
  },
};
