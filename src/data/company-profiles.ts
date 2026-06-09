/**
 * Rich per-company content for the detail pages, keyed by slug.
 * Trilingual text (en / ar / tr) lives inline so it stays co-located per
 * company and doesn't bloat the dictionaries.
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
export type Bilingual = { en: string; ar: string; tr: string };
export type ProfileService = { name: Bilingual; desc: Bilingual };
/** The slim, serializable slice of a profile the header/footer need (passed to
 *  the client `Header`, so it must stay plain data — no functions). */
export type CompanyNav = {
  accent: string;
  name: Bilingual;
  logo?: string;
  logoW?: number;
  logoH?: number;
  logoOnDark?: boolean;
};
export type CompanyContact = { phone?: string; email?: string };
export type CompanyProfile = {
  accent: string;
  name: Bilingual;
  tagline: Bilingual;
  /** Optional admin-editable Overview text for the company detail page.
   *  When unset, the page falls back to the dictionary card's `about`
   *  (`dict.companies.cards[idx].about`), which stays the default source. */
  about?: Bilingual;
  logo?: string;
  logoW?: number;
  logoH?: number;
  /** logo is light/white → show it on a dark accent plate, and fall back to the
   *  wordmark in the (white) header. */
  logoOnDark?: boolean;
  /** Real postal address — set only where a verified address exists (Imdad).
   *  The newly-registered Axon companies omit it and rely on areaServed: SY. */
  address?: { street?: string; locality: string };
  services: ProfileService[];
  contact?: CompanyContact;
};

export const companyProfiles: Record<string, CompanyProfile> = {
  "axon-contracting": {
    accent: "#3A4A44",
    name: { en: "Axon Contracting", ar: "أكسون للمقاولات", tr: "Axon Contracting" },
    tagline: { en: "Rebuilding Syria from the ground up.", ar: "نعيد بناء سوريا، من الأساس.", tr: "Suriye'yi temelden yeniden inşa ediyoruz." },
    logo: "/images/companies/axon-contracting-logo.png",
    logoW: 195,
    logoH: 100,
    services: [
      { name: { en: "Building Construction", ar: "إنشاء المباني", tr: "Bina İnşaatı" }, desc: { en: "We build residential and non-residential structures of every kind, taking each one from the foundations through to a finished building that's ready to use.", ar: "نبني المنشآت السكنية وغير السكنية بمختلف أنواعها، ونأخذ كل واحدة منها من الأساسات حتى تصبح مبنًى مكتملًا جاهزًا للاستخدام.", tr: "Her türden konut ve konut dışı yapıyı inşa ediyor, her birini temelden başlayarak kullanıma hazır, tamamlanmış bir binaya dönüştürüyoruz." } },
      { name: { en: "Roads & Highways", ar: "الطرق والطرق السريعة", tr: "Yollar ve Otoyollar" }, desc: { en: "We build and repair highways, streets, roads and pedestrian pathways, and we handle the paving and surfacing of streets, highways and tunnels.", ar: "نبني الطرق السريعة والشوارع والطرق وممرّات المشاة ونصلحها، ونتولّى تعبيد وتسوية الشوارع والطرق السريعة والأنفاق.", tr: "Otoyolları, caddeleri, yolları ve yaya geçitlerini inşa edip onarıyor, caddelerin, otoyolların ve tünellerin asfaltlama ve kaplama işlerini üstleniyoruz." } },
      { name: { en: "Bridges & Water Networks", ar: "الجسور وشبكات المياه", tr: "Köprüler ve Su Şebekeleri" }, desc: { en: "We build and repair bridges and elevated highways, and we lay the water pipeline networks that run inside cities and between them.", ar: "نبني الجسور والطرق المرتفعة ونصلحها، ونمدّ شبكات نقل المياه التي تمتد داخل المدن وفيما بينها.", tr: "Köprüleri ve yükseltilmiş otoyolları inşa edip onarıyor, şehir içinde ve şehirler arasında uzanan su boru hattı şebekelerini döşüyoruz." } },
      { name: { en: "Restoration & Heritage", ar: "الترميم والتراث", tr: "Restorasyon ve Miras" }, desc: { en: "We restore and rehabilitate buildings, historical sites and heritage structures included, bringing them back into safe, lasting use.", ar: "نرمّم المباني ونعيد تأهيلها، ومن ضمنها المواقع التاريخية والمباني التراثية، ونعيدها إلى استخدام آمن ودائم.", tr: "Tarihi alanlar ve kültürel miras yapıları dahil olmak üzere binaları restore edip rehabilite ediyor, onları güvenli ve kalıcı bir kullanıma geri kazandırıyoruz." } },
      { name: { en: "Demolition & Site Works", ar: "الهدم وأعمال المواقع", tr: "Yıkım ve Saha İşleri" }, desc: { en: "We demolish buildings and structures safely, clear away the debris and prepare the site, so the ground is ready for what comes next.", ar: "نهدم المباني والمنشآت بأمان، ونزيل الأنقاض ونهيّئ الموقع، حتى تصبح الأرض جاهزة لما يليها من أعمال.", tr: "Binaları ve yapıları güvenli bir şekilde yıkıyor, molozu temizliyor ve sahayı hazırlıyoruz, böylece zemin sonraki aşamaya hazır hale geliyor." } },
      { name: { en: "Building-Materials Supply", ar: "توريد مواد البناء", tr: "Yapı Malzemesi Tedariği" }, desc: { en: "We import, export and wholesale construction materials and machinery, including cement, steel, marble, ceramics, sanitary ware, wood and more.", ar: "نستورد مواد البناء والآليات ونصدّرها ونبيعها بالجملة، ومنها الإسمنت والحديد والرخام والسيراميك والأدوات الصحية والأخشاب وغيرها.", tr: "Çimento, çelik, mermer, seramik, vitrifiye, ahşap ve daha fazlası dahil olmak üzere inşaat malzemelerini ve makinelerini ithal ediyor, ihraç ediyor ve toptan satışını yapıyoruz." } },
    ],
  },

  "axon-industry-trade": {
    accent: "#E8920E",
    name: { en: "Axon Industry & Trade", ar: "أكسون للصناعة والتجارة", tr: "Axon Industry & Trade" },
    tagline: { en: "Steel made to spec, supply you can count on.", ar: "حديدٌ يُصنع وفق المواصفة، وتوريدٌ يُعتمد عليه.", tr: "Standarda uygun üretilen çelik, güvenebileceğiniz bir tedarik." },
    logo: "/images/companies/axon-industry-trade-logo.png",
    logoW: 206,
    logoH: 100,
    services: [
      { name: { en: "Steel Structures & Hangars", ar: "الهياكل الحديدية والحظائر", tr: "Çelik Yapılar ve Hangarlar" }, desc: { en: "Fabrication of steel and metal structures, covering hangars, industrial sheds and warehouse frames, all engineered and built to specification.", ar: "تصنيع الهياكل الحديدية والمعدنية، بما يشمل الحظائر والمستودعات الصناعية وهياكل المخازن، وكلّها مهندسةٌ ومصنّعةٌ وفق المواصفة.", tr: "Hangarları, endüstriyel sundurmaları ve depo iskeletlerini kapsayan, tamamı mühendisliği yapılmış ve standarda uygun üretilmiş çelik ve metal yapıların imalatı." } },
      { name: { en: "Custom Metal Fabrication", ar: "التصنيع المعدني حسب الطلب", tr: "Özel Metal İmalatı" }, desc: { en: "Fabricated steel products made to order, including flagpoles, gates, frames and similar metalwork, cut and finished to each client's drawings.", ar: "منتجات حديدية مصنّعة حسب الطلب، تشمل سواري الأعلام والبوابات والهياكل والأعمال المعدنية المماثلة، تُقصّ وتُجهَّز وفق مخططات كل عميل.", tr: "Bayrak direkleri, kapılar, çerçeveler ve benzeri metal işlerini içeren, her müşterinin çizimlerine göre kesilip işlenen, siparişe özel üretilmiş çelik ürünler." } },
      { name: { en: "Industrial Equipment Supply", ar: "توريد المعدات الصناعية", tr: "Endüstriyel Ekipman Tedariği" }, desc: { en: "Industrial equipment and machinery for factories, workshops and project sites, sourced to match the technical requirements of each application.", ar: "معدات وآلات صناعية للمصانع والورش ومواقع المشاريع، مُنتقاةٌ بما يطابق المتطلبات التقنية لكل استخدام.", tr: "Fabrikalar, atölyeler ve proje sahaları için, her uygulamanın teknik gereksinimlerine uygun şekilde temin edilen endüstriyel ekipman ve makineler." } },
      { name: { en: "Import & Export", ar: "الاستيراد والتصدير", tr: "İthalat ve İhracat" }, desc: { en: "Import and export of materials and industrial goods, giving clients a dependable route to products and inputs from regional and international markets.", ar: "استيراد المواد والسلع الصناعية وتصديرها، بما يمنح العملاء طريقاً موثوقاً للوصول إلى المنتجات والمدخلات من الأسواق الإقليمية والعالمية.", tr: "Malzeme ve endüstriyel ürünlerin ithalatı ile ihracatı, müşterilere bölgesel ve uluslararası pazarlardaki ürün ve girdilere güvenilir bir erişim yolu sunar." } },
      { name: { en: "Commercial Agencies", ar: "الوكالات التجارية", tr: "Ticari Acentelikler" }, desc: { en: "We act as commercial agent and representative for local and foreign manufacturers, connecting their products and equipment to the Syrian market.", ar: "نعمل وكيلاً وممثلاً تجارياً للمصنّعين المحليين والأجانب، ونربط منتجاتهم ومعداتهم بالسوق السورية.", tr: "Yerli ve yabancı üreticiler için ticari acente ve temsilci olarak hareket ediyor, onların ürünlerini ve ekipmanlarını Suriye pazarına bağlıyoruz." } },
      { name: { en: "On-Site Erection", ar: "التركيب في الموقع", tr: "Sahada Montaj" }, desc: { en: "Delivery and on-site erection of fabricated steel structures, assembled and installed by the same team that builds them for a clean, single-source handover.", ar: "توصيل الهياكل الحديدية المصنّعة وتركيبها في الموقع، إذ يتولّى تجميعها وتنصيبها الفريق نفسه الذي صنّعها، لتسليمٍ نظيفٍ من مصدر واحد.", tr: "Üretilen çelik yapıların teslimatı ve sahada montajı; bunları üreten ekibin aynısı tarafından kurulup monte edilir, böylece tek kaynaktan temiz bir teslim sağlanır." } },
    ],
  },

  "axon-integrated-facilities": {
    accent: "#4056E0",
    name: { en: "Axon Facilities Services", ar: "أكسون لخدمات المرافق", tr: "Axon Facilities Services" },
    tagline: { en: "Facilities and infrastructure, kept running.", ar: "مرافق وبنى تحتية، نُبقيها تعمل.", tr: "Tesisler ve altyapı, çalışır durumda tutulur." },
    logo: "/images/companies/axon-integrated-facilities-logo.png",
    logoW: 216,
    logoH: 100,
    services: [
      { name: { en: "MEP Systems", ar: "الأنظمة الكهروميكانيكية", tr: "MEP Sistemleri" }, desc: { en: "Plumbing, electrical and heating systems running on electricity, gas or oil, plus the installation and maintenance of automatic doors across facilities.", ar: "أعمال السباكة والكهرباء والتدفئة التي تعمل بالكهرباء أو الغاز أو النفط، إضافة إلى تركيب الأبواب الأوتوماتيكية وصيانتها في مختلف المرافق.", tr: "Elektrik, gaz veya yakıtla çalışan tesisat, elektrik ve ısıtma sistemleri ile birlikte tesislerde otomatik kapıların montajı ve bakımı." } },
      { name: { en: "HVAC & Climate Control", ar: "التكييف والتبريد", tr: "HVAC ve İklimlendirme" }, desc: { en: "We install and maintain cooling and air-conditioning systems so interiors stay comfortable and equipment runs within safe temperature ranges.", ar: "نركّب أنظمة التبريد والتكييف ونصونها لتبقى المساحات الداخلية مريحة وتعمل التجهيزات ضمن نطاقات حرارة آمنة.", tr: "Soğutma ve klima sistemlerini kuruyor ve bakımını yapıyoruz; böylece iç mekanlar konforlu kalır ve ekipmanlar güvenli sıcaklık aralıklarında çalışır." } },
      { name: { en: "Solar Energy Systems", ar: "أنظمة الطاقة الشمسية", tr: "Güneş Enerjisi Sistemleri" }, desc: { en: "Installation and maintenance of solar power systems, giving facilities a cleaner and more reliable source of energy.", ar: "تركيب أنظمة الطاقة الشمسية وصيانتها، لتزويد المرافق بمصدر طاقة أنظف وأكثر موثوقية.", tr: "Tesislere daha temiz ve daha güvenilir bir enerji kaynağı sunan güneş enerjisi sistemlerinin montajı ve bakımı." } },
      { name: { en: "Water & Sewage Networks", ar: "شبكات المياه والصرف الصحي", tr: "Su ve Atık Su Şebekeleri" }, desc: { en: "Operating sewage networks, maintaining and cleaning drains, insulating technical pits, and collecting domestic and industrial sewage.", ar: "تشغيل شبكات الصرف الصحي، وصيانة المصارف وتنظيفها، وعزل الحفر الفنية، وجمع مياه الصرف المنزلية والصناعية.", tr: "Atık su şebekelerinin işletilmesi, kanalizasyonların bakımı ve temizliği, teknik çukurların yalıtımı ile evsel ve endüstriyel atık suyun toplanması." } },
      { name: { en: "Waste Collection & Recycling", ar: "جمع النفايات وإعادة التدوير", tr: "Atık Toplama ve Geri Dönüşüm" }, desc: { en: "Garbage collection from public areas, recovery of recyclable waste, and removal of construction and demolition debris.", ar: "جمع القمامة من المناطق العامة، واستعادة النفايات القابلة للتدوير، وإزالة مخلّفات البناء والهدم.", tr: "Kamusal alanlardan çöp toplama, geri dönüştürülebilir atıkların geri kazanımı ile inşaat ve yıkım molozunun kaldırılması." } },
      { name: { en: "Remediation & Fit-Out", ar: "المعالجة والتجهيز والتشطيب", tr: "Islah ve İç Tasarım" }, desc: { en: "Soil and water remediation, site decontamination and insulation, plus ceilings, partitions, tiling, gypsum, painting and post-construction cleaning.", ar: "معالجة التربة والمياه وإزالة تلوّث المواقع وأعمال العزل، إضافة إلى الأسقف والقواطع والتبليط والجبس والدهان وتنظيف ما بعد البناء.", tr: "Toprak ve su ıslahı, saha dekontaminasyonu ve yalıtımı ile birlikte tavanlar, bölme duvarlar, fayans, alçı, boya ve inşaat sonrası temizlik." } },
    ],
  },

  "axon-landscape": {
    accent: "#7A9C4F",
    name: { en: "Axon Landscape", ar: "أكسون لاندسكيب", tr: "Axon Landscape" },
    tagline: { en: "Greener spaces, built to last.", ar: "مساحات خضراء، صُممت لتبقى.", tr: "Daha yeşil alanlar, kalıcı olmak üzere tasarlandı." },
    logo: "/images/companies/axon-landscape-logo.png",
    logoW: 181,
    logoH: 100,
    services: [
      { name: { en: "Landscape Design & Execution", ar: "تصميم وتنفيذ المساحات الخضراء", tr: "Peyzaj Tasarımı ve Uygulaması" }, desc: { en: "Complete landscaping from concept to handover, with green roofs and planted building facades that turn structures into living green surfaces.", ar: "تنسيق متكامل للمساحات الخضراء من الفكرة حتى التسليم، مع أسطح خضراء وواجهات مزروعة تحوّل المباني إلى أسطح حيّة نابضة بالخضرة.", tr: "Konseptten teslime kadar eksiksiz peyzaj çalışması; yapıları yaşayan yeşil yüzeylere dönüştüren yeşil çatılar ve bitkilendirilmiş bina cepheleriyle birlikte." } },
      { name: { en: "Garden Maintenance & Pest Control", ar: "صيانة الحدائق ومكافحة الآفات", tr: "Bahçe Bakımı ve Haşere Kontrolü" }, desc: { en: "Regular upkeep that keeps gardens and green spaces healthy, plus specialized cleaning, disinfection and pest and rodent control for buildings.", ar: "صيانة منتظمة تحافظ على صحة الحدائق والمساحات الخضراء، إضافةً إلى أعمال التنظيف والتعقيم المتخصصة ومكافحة الحشرات والقوارض في المباني.", tr: "Bahçeleri ve yeşil alanları sağlıklı tutan düzenli bakımın yanı sıra binalar için özel temizlik, dezenfeksiyon ve haşere ile kemirgen kontrolü." } },
      { name: { en: "Nurseries & Ornamental Plants", ar: "المشاتل ونباتات الزينة", tr: "Fidanlıklar ve Süs Bitkileri" }, desc: { en: "In-house nurseries producing seedlings, tree saplings and ornamental plants, with propagation centres that supply projects with healthy, climate-suited stock.", ar: "مشاتل خاصة لإنتاج الشتلات وغراس الأشجار ونباتات الزينة، مع مراكز إكثار تزوّد المشاريع بنباتات سليمة ملائمة للمناخ.", tr: "Fide, ağaç fidanı ve süs bitkileri üreten kendi fidanlıklarımız ve projelere sağlıklı, iklime uygun bitki sağlayan çoğaltım merkezleri." } },
      { name: { en: "Irrigation Systems", ar: "أنظمة الري", tr: "Sulama Sistemleri" }, desc: { en: "We design, install and operate irrigation systems and equipment, delivering water efficiently so planting stays healthy through dry seasons.", ar: "نصمّم أنظمة الري ومعداتها ونركّبها ونشغّلها، فنوصل المياه بكفاءة لتبقى المزروعات سليمة في مواسم الجفاف.", tr: "Sulama sistemlerini ve ekipmanlarını tasarlıyor, kuruyor ve işletiyoruz; suyu verimli bir şekilde ulaştırarak bitkilerin kurak mevsimlerde sağlıklı kalmasını sağlıyoruz." } },
      { name: { en: "Natural-Grass Sports Pitches", ar: "الملاعب العشبية الطبيعية", tr: "Doğal Çim Spor Sahaları" }, desc: { en: "Preparation and maintenance of natural-grass pitches for sports facilities, covering ground preparation, turf establishment and season-long care.", ar: "إعداد الملاعب ذات العشب الطبيعي للمنشآت الرياضية وصيانتها، بدءاً من تهيئة الأرض وزراعة العشب وصولاً إلى العناية بها طوال الموسم.", tr: "Spor tesisleri için doğal çim sahaların hazırlanması ve bakımı; zemin hazırlığını, çimin yetiştirilmesini ve sezon boyu bakımı kapsar." } },
      { name: { en: "Greenhouses & Agricultural Supplies", ar: "البيوت البلاستيكية والمستلزمات الزراعية", tr: "Seralar ve Tarımsal Malzemeler" }, desc: { en: "Installation of plastic greenhouses, plus import and wholesale of agricultural machinery, equipment and supplies, including operator-driven equipment services.", ar: "تركيب البيوت البلاستيكية، إضافةً إلى استيراد الآليات والمعدات والمستلزمات الزراعية وبيعها بالجملة، بما في ذلك خدمات المعدات الزراعية مع مشغّليها.", tr: "Plastik seraların kurulumu ile birlikte tarım makineleri, ekipmanları ve malzemelerinin ithalatı ve toptan satışı; operatörlü ekipman hizmetleri dahil." } },
    ],
  },

  imdad: {
    accent: "#2A2659",
    name: { en: "Imdad", ar: "إمداد", tr: "Imdad" },
    tagline: { en: "The steel behind Syria's rebuild.", ar: "الحديد الذي تُبنى به سوريا من جديد.", tr: "Suriye'nin yeniden inşasının arkasındaki çelik." },
    logo: "/images/companies/imdad-logo.png",
    logoW: 91,
    logoH: 70,
    address: { street: "Al Shaikh Najar, Second Industrial Area", locality: "Aleppo" },
    contact: { phone: "+963 21 473 1300", email: "info@imdadgroup.com" },
    services: [
      { name: { en: "Cold Roll-Formed Steel", ar: "حديد التشكيل على البارد", tr: "Soğuk Şekillendirilmiş Çelik" }, desc: { en: "Cold roll-forming and steel shaping, producing metal structures designed and fabricated to European engineering standards for industrial and commercial projects.", ar: "التشكيل على البارد وتشكيل الفولاذ، مع إنتاج هياكل معدنية مصمّمة ومصنّعة وفق المعايير الهندسية الأوروبية للمشاريع الصناعية والتجارية.", tr: "Soğuk haddeleme ve çelik şekillendirme; endüstriyel ve ticari projeler için Avrupa mühendislik standartlarına göre tasarlanıp üretilen metal yapılar." } },
      { name: { en: "Prefabricated Buildings & Caravans", ar: "المباني الجاهزة والكرفانات", tr: "Prefabrik Binalar ve Karavanlar" }, desc: { en: "Prefabricated buildings, caravans and temporary offices, built in the factory and delivered ready to install on site.", ar: "مبانٍ جاهزة وكرفانات ومكاتب مؤقتة، تُصنَّع في المعمل وتُسلَّم جاهزة للتركيب في الموقع.", tr: "Fabrikada üretilen ve sahada montaja hazır olarak teslim edilen prefabrik binalar, karavanlar ve geçici ofisler." } },
      { name: { en: "Cladding & Fit-Out", ar: "الكسوة والتشطيب", tr: "Cephe Kaplama ve İç Tasarım" }, desc: { en: "Building cladding and interior fit-out, covering gypsum and cement boards, false ceilings, and electrical and sanitary installations.", ar: "كسوة المباني والتشطيب الداخلي، وتشمل ألواح الجبس والإسمنت والأسقف المستعارة والتمديدات الكهربائية والصحية.", tr: "Alçı ve çimento levhalar, asma tavanlar, elektrik ve sıhhi tesisatları kapsayan bina cephe kaplaması ve iç tasarım işleri." } },
      { name: { en: "Metal Warehouses & Contracting", ar: "المستودعات المعدنية والمقاولات", tr: "Metal Depolar ve Müteahhitlik" }, desc: { en: "Building and metal contracting that includes the construction and full equipping of metal warehouses and industrial structures.", ar: "مقاولات بناء وأعمال معدنية تشمل إنشاء المستودعات المعدنية والمنشآت الصناعية وتجهيزها بالكامل.", tr: "Metal depoların ve endüstriyel yapıların inşasını ve tam donanımını içeren yapı ve metal müteahhitlik hizmetleri." } },
      { name: { en: "Aluminium & Glass Facades", ar: "واجهات الألمنيوم والزجاج", tr: "Alüminyum ve Cam Cepheler" }, desc: { en: "Aluminium and glass work for building facades, fabricated and installed to suit both commercial and residential projects.", ar: "أعمال الألمنيوم والزجاج لواجهات المباني، تُصنَّع وتُركَّب بما يلائم المشاريع التجارية والسكنية على السواء.", tr: "Bina cepheleri için, hem ticari hem de konut projelerine uygun şekilde üretilip monte edilen alüminyum ve cam işleri." } },
      { name: { en: "Scaffolding, Tents & Greenhouses", ar: "السقالات والخيام والبيوت المحمية", tr: "İskele, Çadır ve Seralar" }, desc: { en: "Metal scaffolding manufactured alongside event tents and greenhouses, serving construction sites and agricultural projects alike.", ar: "تصنيع السقالات المعدنية إلى جانب خيام المناسبات والبيوت المحمية، بما يخدم مواقع البناء والمشاريع الزراعية معًا.", tr: "Etkinlik çadırları ve seralarla birlikte üretilen, inşaat sahalarına ve tarım projelerine aynı şekilde hizmet veren metal iskeleler." } },
    ],
  },
};
