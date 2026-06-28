/* ===================================================================
   common.js — بيانات وحالة ودوال مشتركة بين الموقع العام ولوحة الإدارة
   =================================================================== */

/* ===================== DATA (seed) ===================== */
const SPECIALTIES = [
  {key:'pediatrics', label:'أطفال', icon:'fa-child-reaching'},
  {key:'internal', label:'باطنة', icon:'fa-stethoscope'},
  {key:'cardio', label:'قلب', icon:'fa-heart-pulse'},
  {key:'dental', label:'أسنان', icon:'fa-tooth'},
  {key:'derma', label:'جلدية', icon:'fa-hand-dots'},
  {key:'ortho', label:'عظام', icon:'fa-bone'},
  {key:'obgyn', label:'نساء وتوليد', icon:'fa-person-pregnant'},
  {key:'ent', label:'أنف وأذن', icon:'fa-ear-listen'},
  {key:'neuro', label:'مخ وأعصاب', icon:'fa-brain'},
  {key:'lab', label:'تحاليل', icon:'fa-vial'},
  {key:'physio', label:'علاج طبيعي', icon:'fa-dumbbell'}
];

const SECTION_ICONS = [
  {v:'fa-bullhorn', l:'إعلان عام'},
  {v:'fa-heart-circle-minus', l:'إعلان وفاة'},
  {v:'fa-car-burst', l:'حادث'},
  {v:'fa-tag', l:'عرض / خصم'},
  {v:'fa-newspaper', l:'خبر'},
  {v:'fa-calendar-day', l:'مناسبة'},
  {v:'fa-bell', l:'تنبيه'},
  {v:'fa-building', l:'منشأة'},
  {v:'fa-briefcase', l:'وظائف'},
  {v:'fa-graduation-cap', l:'تعليم'}
];
const SECTION_COLORS = ['#0B2A4A','#1AAE6F','#E2473B','#E3994B','#8C6FB3','#2E6F9E','#5B8FB0','#D8704F'];

let DOCTORS = [
  {id:'d1', name:'د. أحمد المصري', specialty:'internal', specialtyLabel:'باطنة وجهاز هضمي', rating:4.9, reviews:210, address:'شارع الرحمانية الرئيسي، عمارة 12', phone:'201234567890', phoneDisplay:'012 3456 7890', hours:'يوميًا 9 ص – 9 م (إجازة الجمعة)', bio:'يتمتع الدكتور أحمد بخبرة تزيد عن 15 عامًا في تشخيص وعلاج أمراض الجهاز الهضمي والباطنة العامة.', hasPhoto:false},
  {id:'d2', name:'د. سارة عبد الله', specialty:'internal', specialtyLabel:'استشاري باطنة عامة', rating:4.6, reviews:98, address:'ميدان الساعة، الرحمانية', phone:'201111223344', phoneDisplay:'011 1122 3344', hours:'السبت – الخميس: 10 ص – 8 م', bio:'استشارية باطنة عامة، مهتمة بمتابعة الأمراض المزمنة كالسكري وضغط الدم.', hasPhoto:false},
  {id:'d3', name:'د. منى السيد', specialty:'pediatrics', specialtyLabel:'أخصائية أطفال وحديثي الولادة', rating:4.8, reviews:165, address:'شارع المدارس، الرحمانية', phone:'201022334455', phoneDisplay:'010 2233 4455', hours:'يوميًا 4 م – 10 م', bio:'متخصصة في رعاية حديثي الولادة ومتابعة نمو الأطفال والتطعيمات.', hasPhoto:false},
  {id:'d4', name:'د. كريم فتحي', specialty:'cardio', specialtyLabel:'أخصائي قلب وأوعية دموية', rating:4.9, reviews:140, address:'قرب مستشفى الرحمانية العام', phone:'201233344556', phoneDisplay:'012 3334 4556', hours:'السبت، الإثنين، الأربعاء: 5 م – 9 م', bio:'أخصائي قلب وأوعية دموية، خبرة في القسطرة التشخيصية وتخطيط القلب.', hasPhoto:false},
  {id:'d5', name:'د. ياسمين علي', specialty:'dental', specialtyLabel:'طبيبة أسنان وتجميل', rating:4.7, reviews:120, address:'شارع الجمهورية', phone:'201099887766', phoneDisplay:'010 9988 7766', hours:'يوميًا 11 ص – 8 م', bio:'متخصصة في طب الأسنان التجميلي وتقويم الأسنان للأطفال والكبار.', hasPhoto:false}
];

const SHOP_CATS = [
  {key:'books', label:'مكتبات'}, {key:'clothes', label:'ملابس'},
  {key:'electronics', label:'أجهزة كهربائية'}, {key:'mobiles', label:'موبايلات'}
];
let FIXED_DATA = {
  pharmacies: [
    {id:'p1', name:'صيدلية الرحمانية الكبرى', address:'ميدان الرحمانية', phone:'201234567890', phoneDisplay:'0123 456 7890', open24:true, delivery:true},
    {id:'p2', name:'صيدلية النور', address:'شارع الجامعة', phone:'201112223344', phoneDisplay:'0111 222 3344', open24:false, delivery:true},
    {id:'p3', name:'صيدلية الشفاء', address:'خلف الجامع الكبير', phone:'201559988765', phoneDisplay:'0155 998 8765', open24:true, delivery:false}
  ],
  hospitals: [
    {id:'h1', name:'مستشفى الرحمانية العام', address:'شارع الاستاد الرئيسي', phone:'201234445566', phoneDisplay:'0123 444 5566', open24:true, note:'طوارئ وعمليات وعنابر'},
    {id:'h2', name:'مستشفى النيل التخصصي', address:'كورنيش الرحمانية', phone:'201099887700', phoneDisplay:'0109 988 7700', open24:true, note:'تخصصات متعددة وأشعة'}
  ],
  restaurants: [
    {id:'r1', name:'مطعم الرحمانية', kind:'مطعم شرقي', rating:4.8, address:'شارع المطاعم', phone:'201098877660', phoneDisplay:'0109 887 7660'},
    {id:'r2', name:'كافيه ذوق', kind:'كافيه ومشروبات', rating:4.5, address:'ميدان الرحمانية', phone:'201023344550', phoneDisplay:'0102 334 4550'},
    {id:'r3', name:'مطبخ بيتي', kind:'وجبات منزلية', rating:4.9, address:'شارع الجامعة', phone:'201229981120', phoneDisplay:'0122 998 1120'}
  ],
  supermarkets: [
    {id:'s1', name:'سوبر ماركت الرحمانية', address:'شارع التحرير', phone:'201662233440', phoneDisplay:'0166 223 3440', delivery:true},
    {id:'s2', name:'ماركت الأمانة', address:'أمام محطة المياه', phone:'201447789900', phoneDisplay:'0144 778 9900', delivery:true}
  ],
  shops: [
    {id:'sh1', cat:'books', name:'مكتبة المعرفة', address:'شارع المدارس', phone:'201076654320', phoneDisplay:'0107 665 4320'},
    {id:'sh3', cat:'clothes', name:'بوتيك الأناقة', address:'شارع التحرير', phone:'201233344550', phoneDisplay:'0123 334 4550'},
    {id:'sh5', cat:'electronics', name:'الرحمانية للأجهزة الكهربائية', address:'شارع الجامعة', phone:'201511223340', phoneDisplay:'0151 122 3340'},
    {id:'sh7', cat:'mobiles', name:'تك فون موبايلات', address:'ميدان الساعة', phone:'201099112230', phoneDisplay:'0109 911 2230'}
  ],
  delivery: [
    {id:'dl1', name:'سريع للتوصيل', hours:'يوميًا 8 ص – 12 م', phone:'201001122330', phoneDisplay:'0100 112 2330'},
    {id:'dl2', name:'توصيلة الرحمانية', hours:'يوميًا حتى 1 ص', phone:'201558877660', phoneDisplay:'0155 887 7660'}
  ],
  emergency: [
    {id:'e1', name:'الإسعاف', number:'123', icon:'fa-truck-medical', color:'#E2473B'},
    {id:'e2', name:'الشرطة', number:'122', icon:'fa-shield-halved', color:'#15406B'},
    {id:'e3', name:'المطافئ', number:'180', icon:'fa-fire', color:'#E3994B'},
    {id:'e4', name:'الكهرباء', number:'121', icon:'fa-bolt', color:'#D4A300'},
    {id:'e5', name:'المياه', number:'125', icon:'fa-droplet', color:'#2E6F9E'},
    {id:'e6', name:'الغاز', number:'129', icon:'fa-fire-flame-simple', color:'#B5663E'},
    {id:'e7', name:'مستشفى الرحمانية العام', number:'0123 4445566', icon:'fa-hospital', color:'#1AAE6F'}
  ],
  ads: []
};

/* تعريف الحقول لكل قسم ثابت — يُستخدم لبناء نموذج الإضافة/التعديل في لوحة
   الإدارة تلقائيًا بدون كتابة فورم منفصل لكل قسم. */
const FIXED_CATS_CONFIG = {
  pharmacies: { label:'الصيدليات', icon:'fa-capsules', color:'#1AAE6F', fields:[
    {name:'name', label:'اسم الصيدلية', type:'text', required:true},
    {name:'address', label:'العنوان', type:'text', required:true},
    {name:'phone', label:'رقم الهاتف (دولي بدون +)', type:'tel', required:true},
    {name:'phoneDisplay', label:'رقم الهاتف للعرض', type:'text'},
    {name:'open24', label:'متاحة 24 ساعة', type:'checkbox'},
    {name:'delivery', label:'خدمة توصيل', type:'checkbox'}
  ]},
  hospitals: { label:'المستشفيات', icon:'fa-hospital', color:'#0B2A4A', fields:[
    {name:'name', label:'اسم المستشفى', type:'text', required:true},
    {name:'address', label:'العنوان', type:'text', required:true},
    {name:'phone', label:'رقم الهاتف (دولي بدون +)', type:'tel', required:true},
    {name:'phoneDisplay', label:'رقم الهاتف للعرض', type:'text'},
    {name:'open24', label:'طوارئ 24 ساعة', type:'checkbox'},
    {name:'note', label:'ملاحظة (مثل: تخصصات متعددة)', type:'text'}
  ]},
  restaurants: { label:'المطاعم والكافيهات', icon:'fa-utensils', color:'#E3994B', fields:[
    {name:'name', label:'اسم المطعم/الكافيه', type:'text', required:true},
    {name:'kind', label:'النوع (مثل: مطعم شرقي)', type:'text'},
    {name:'address', label:'العنوان', type:'text', required:true},
    {name:'phone', label:'رقم الهاتف (دولي بدون +)', type:'tel', required:true},
    {name:'phoneDisplay', label:'رقم الهاتف للعرض', type:'text'},
    {name:'rating', label:'التقييم (1-5)', type:'number', step:'0.1', min:'1', max:'5', default:'5'}
  ]},
  supermarkets: { label:'السوبر ماركت', icon:'fa-cart-shopping', color:'#5B8FB0', fields:[
    {name:'name', label:'اسم المتجر', type:'text', required:true},
    {name:'address', label:'العنوان', type:'text', required:true},
    {name:'phone', label:'رقم الهاتف (دولي بدون +)', type:'tel', required:true},
    {name:'phoneDisplay', label:'رقم الهاتف للعرض', type:'text'},
    {name:'delivery', label:'توصيل متاح', type:'checkbox'}
  ]},
  shops: { label:'المحلات التجارية', icon:'fa-store', color:'#8C6FB3', fields:[
    {name:'name', label:'اسم المحل', type:'text', required:true},
    {name:'cat', label:'التصنيف', type:'select', required:true, options:[{v:'books',l:'مكتبات'},{v:'clothes',l:'ملابس'},{v:'electronics',l:'أجهزة كهربائية'},{v:'mobiles',l:'موبايلات'}]},
    {name:'address', label:'العنوان', type:'text', required:true},
    {name:'phone', label:'رقم الهاتف (دولي بدون +)', type:'tel', required:true},
    {name:'phoneDisplay', label:'رقم الهاتف للعرض', type:'text'}
  ]},
  delivery: { label:'خدمات التوصيل', icon:'fa-motorcycle', color:'#D8704F', fields:[
    {name:'name', label:'اسم الخدمة', type:'text', required:true},
    {name:'hours', label:'أوقات العمل', type:'text'},
    {name:'phone', label:'رقم الهاتف (دولي بدون +)', type:'tel', required:true},
    {name:'phoneDisplay', label:'رقم الهاتف للعرض', type:'text'}
  ]},
  emergency: { label:'أرقام الطوارئ', icon:'fa-phone-volume', color:'#E2473B', fields:[
    {name:'name', label:'اسم الجهة', type:'text', required:true},
    {name:'number', label:'رقم الهاتف', type:'text', required:true},
    {name:'icon', label:'الأيقونة', type:'select', options:[
      {v:'fa-truck-medical',l:'إسعاف'},{v:'fa-shield-halved',l:'شرطة'},{v:'fa-fire',l:'حريق'},
      {v:'fa-bolt',l:'كهرباء'},{v:'fa-droplet',l:'مياه'},{v:'fa-fire-flame-simple',l:'غاز'},
      {v:'fa-hospital',l:'مستشفى'},{v:'fa-phone-volume',l:'عام'}
    ]},
    {name:'color', label:'اللون', type:'select', options:[
      {v:'#E2473B',l:'أحمر'},{v:'#15406B',l:'كحلي'},{v:'#E3994B',l:'برتقالي'},
      {v:'#D4A300',l:'أصفر'},{v:'#2E6F9E',l:'أزرق'},{v:'#1AAE6F',l:'أخضر'},{v:'#B5663E',l:'بني'}
    ]}
  ]},
  ads: { label:'الإعلانات', icon:'fa-bullhorn', color:'#1AAE6F', noLocation:true, fields:[
    {name:'advertiserName', label:'اسم المعلن / النشاط', type:'text', required:true},
    {name:'photo', label:'صورة الإعلان (اختياري لو حطيت رابط فيديو)', type:'photo'},
    {name:'videoUrl', label:'رابط فيديو مباشر أو يوتيوب (اختياري)', type:'text'},
    {name:'phone', label:'رقم الهاتف (اختياري)', type:'tel'},
    {name:'link', label:'رابط خارجي (اختياري، مثال: صفحة فيسبوك)', type:'text'},
    {name:'startDate', label:'تاريخ بداية الإعلان (اختياري)', type:'date'},
    {name:'endDate', label:'تاريخ نهاية الإعلان (اختياري)', type:'date'},
    {name:'pinned', label:'تثبيت الإعلان في الأعلى دائمًا', type:'checkbox'},
    {name:'active', label:'مفعّل وظاهر للزوار', type:'checkbox', default:true}
  ]}
};

/* ===================== STATE ===================== */
let CUSTOM_SECTIONS = [];      /* [{key,label,icon,color}] */
let CUSTOM_ITEMS = {};         /* sectionKey -> [items] */
let photoCache = {};           /* 'doctor:id' or 'item:sectionKey:id' -> dataURL */

let toastTimer = null;
let storageAvailable = true;

/* ===================== HELPERS ===================== */
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function starString(rating){
  const full = Math.round(rating);
  return '★★★★★'.slice(0,full) + '☆☆☆☆☆'.slice(0, 5-full);
}
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2800);
}
function callBtn(phone){ return `<a class="btn btn-call" href="tel:+${phone}"><i class="fa-solid fa-phone"></i> اتصال</a>`; }
function waBtn(phone){ return `<a class="btn btn-wa" href="https://wa.me/${phone}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> واتساب</a>`; }
function photoOrIcon(photoKey, iconClass, containerClass){
  const src = photoCache[photoKey];
  if(src) return `<img src="${src}" class="${containerClass}" style="object-fit:cover;">`;
  return `<div class="${containerClass}"><i class="fa-solid ${iconClass}"></i></div>`;
}

/* ===================== MAPS / LOCATION ===================== */
function mapLinkHtml(lat, lng, fallbackText){
  let url;
  if(lat && lng){ url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`; }
  else if(fallbackText){ url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackText)}`; }
  else { return ''; }
  return `<a class="btn-maplink" href="${url}" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot"></i> الموقع على الخريطة</a>`;
}
function mapEmbedHtml(lat, lng, address){
  if(lat && lng){
    return `<div class="map-box-real"><iframe src="https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    <a class="btn btn-outline btn-block" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> فتح في خرائط جوجل</a>`;
  }
  return `<div class="map-box"><i class="fa-solid fa-location-dot map-pin"></i></div>
  <a class="btn btn-outline btn-block" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address||'')}" target="_blank" rel="noopener"><i class="fa-solid fa-magnifying-glass-location"></i> البحث عن العنوان في خرائط جوجل</a>`;
}
async function loadDoctors(){
  if(!firebaseAvailable){ storageAvailable = false; return; }
  try{
    const snap = await db.collection('doctors').get();
    if(!snap.empty){
      DOCTORS = snap.docs.map(d => d.data());
      DOCTORS.forEach(d => { if(d.photo) photoCache['doctor:'+d.id] = d.photo; });
    } else {
      /* أول مرة يشتغل فيها الموقع: نرفع البيانات التجريبية كبداية */
      for(const d of DOCTORS){ await db.collection('doctors').doc(d.id).set(d); }
    }
  }catch(err){ console.error('[رحمانية] فشل تحميل الأطباء:', err); storageAvailable = false; }
}
async function loadSections(){
  if(!firebaseAvailable) return;
  try{
    const snap = await db.collection('sections').get();
    CUSTOM_SECTIONS = snap.docs.map(d => d.data());
  }catch(err){ console.error('[رحمانية] فشل تحميل الأقسام:', err); CUSTOM_SECTIONS = []; }
}
async function loadSectionItems(){
  CUSTOM_SECTIONS.forEach(s => { CUSTOM_ITEMS[s.key] = []; });
  if(!firebaseAvailable) return;
  try{
    const snap = await db.collection('items').get();
    snap.docs.forEach(d => {
      const it = d.data();
      if(!CUSTOM_ITEMS[it.sectionKey]) CUSTOM_ITEMS[it.sectionKey] = [];
      CUSTOM_ITEMS[it.sectionKey].push(it);
      if(it.photo) photoCache['item:'+it.sectionKey+':'+it.id] = it.photo;
    });
  }catch(err){ console.error('[رحمانية] فشل تحميل العناصر:', err); }
}
async function loadFixedCategory(catKey){
  if(!firebaseAvailable){ storageAvailable = false; return; }
  try{
    const snap = await db.collection(catKey).get();
    if(!snap.empty){
      FIXED_DATA[catKey] = snap.docs.map(d => d.data());
    } else {
      /* أول مرة: نرفع البيانات التجريبية كبداية لهذا القسم */
      for(const item of (FIXED_DATA[catKey] || [])){ await db.collection(catKey).doc(item.id).set(item); }
    }
  }catch(err){ console.error('[رحمانية] فشل تحميل قسم', catKey, err); storageAvailable = false; }
}
function openOverlay(id){ const el = document.getElementById(id); if(el) el.classList.add('show'); }
function closeOverlay(id){ const el = document.getElementById(id); if(el) el.classList.remove('show'); }


/* تحميل كل بيانات الأقسام مرة واحدة (يُستخدم بواسطة الموقع ولوحة الإدارة) */
async function loadAllData(){
  await loadDoctors();
  await loadSections();
  await loadSectionItems();
  for(const catKey of Object.keys(FIXED_CATS_CONFIG)){
    await loadFixedCategory(catKey);
  }
}
