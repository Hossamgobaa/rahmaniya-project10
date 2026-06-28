/* ===================================================================
   app.js -- منطق الموقع العام (الزوار)
   =================================================================== */

function adsenseSlotHtml(){
  if(!adsenseConfigured) return '';
  return `<div class="section-block" style="padding-top:0;">
    <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CONFIG.publisherId}" data-ad-slot="${ADSENSE_CONFIG.adSlotId}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  </div>`;
}


const OFFERS = [
  {id:'o1', title:'خصم 20% على الكشف', place:'د. أحمد المصري — باطنة', expiry:'حتى 30 يونيو', nav:{view:'doctorDetail', id:'d1'}},
  {id:'o2', title:'توصيل مجاني للطلب الأول', place:'سوبر ماركت الرحمانية', expiry:'عرض دائم للعملاء الجدد', nav:{view:'supermarkets'}}
];

/* كل الأقسام الثابتة (صيدليات، مستشفيات، مطاعم، سوبر ماركت، محلات، توصيل، طوارئ)
   بياناتها الابتدائية فقط — بعد أول تشغيل ستُقرأ من قاعدة البيانات وتصبح قابلة
   للتعديل بالكامل من لوحة الإدارة. */

const HOME_CATS_FIXED = [
  {view:'specialties', label:'الأطباء والعيادات', icon:'fa-user-doctor', color:'#2E6F9E'},
  {view:'pharmacies', label:'الصيدليات', icon:'fa-capsules', color:'#1AAE6F'},
  {view:'hospitals', label:'المستشفيات', icon:'fa-hospital', color:'#0B2A4A'},
  {view:'restaurants', label:'المطاعم والكافيهات', icon:'fa-utensils', color:'#E3994B'},
  {view:'supermarkets', label:'السوبر ماركت', icon:'fa-cart-shopping', color:'#5B8FB0'},
  {view:'shops', label:'المحلات التجارية', icon:'fa-store', color:'#8C6FB3'},
  {view:'delivery', label:'خدمات التوصيل', icon:'fa-motorcycle', color:'#D8704F'},
  {view:'emergency', label:'أرقام الطوارئ', icon:'fa-phone-volume', color:'#E2473B'}
];


let favorites = new Set();

let searchTerm = '';

let activeShopCat = 'books';

/* ===================== STATE & NAVIGATION (نسخة الموقع العام) ===================== */
let current = {view:'home'};
let stack = [];
function navigate(next, push=true){
  if(push) stack.push(current);
  current = next;
  render();
  const appEl = document.getElementById('app');
  if(appEl) appEl.scrollIntoView({behavior:'smooth', block:'start'});
}
function goBack(){ current = stack.pop() || {view:'home'}; render(); }

function isFav(type,id){ return favorites.has(type+':'+id); }

function favIconHtml(type,id){
  const active = isFav(type,id);
  return `<i class="${active?'fa-solid':'fa-regular'} fa-heart fav-icon${active?' active':''}" data-fav="${type}:${id}" title="إضافة للمفضلة"></i>`;
}

/* ---- مساعدات الإعلانات: الفيديو، الجدولة، العداد، السلايدر ---- */
function isAdLive(a){
  if(!a.active) return false;
  const today = new Date().toISOString().slice(0,10);
  if(a.startDate && today < a.startDate) return false;
  if(a.endDate && today > a.endDate) return false;
  return true;
}
async function incrementAdStat(adId, field){
  if(!firebaseAvailable) return;
  try{
    await db.collection('ads').doc(adId).update({[field]: firebase.firestore.FieldValue.increment(1)});
  }catch(err){
    /* صامت بالتصميم: مع قواعد الأمان المُشدّدة (Read Only للزوار) هذا العداد
       لن يزيد فعليًا من جانب الزوار العاديين، وهذا متوقع ومقصود لصالح الأمان.
       لو احتجت تفعيل العداد الحي لاحقًا، راجع firebase/firestore.rules. */
  }
}
function videoEmbedHtml(url){
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if(yt){
    return `<iframe class="ad-banner-img" style="border:0;" src="https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0" allow="autoplay" loading="lazy"></iframe>`;
  }
  return `<video class="ad-banner-img" autoplay muted loop playsinline src="${esc(url)}"></video>`;
}
function adSlideHtml(a, index){
  const media = a.videoUrl ? videoEmbedHtml(a.videoUrl) : (a.photo ? `<img src="${a.photo}" class="ad-banner-img">` : '');
  return `<div class="ad-slide" style="display:${index===0?'block':'none'};">
    <div class="ad-banner-card">
      <span class="ad-label">${a.pinned ? 'مُثبّت ⭐' : 'إعلان'}</span>
      ${media}
      <div class="ad-banner-info">
        <div class="name-strong" style="font-size:13px;">${esc(a.advertiserName)}</div>
        <div class="btn-row" style="margin-top:7px;">
          ${a.phone ? `<a class="btn btn-call" href="tel:+${a.phone}" data-ad-click="${a.id}"><i class="fa-solid fa-phone"></i> اتصال</a>` : ''}
          ${a.link ? `<a class="btn btn-outline" href="${esc(a.link)}" target="_blank" rel="noopener" data-ad-click="${a.id}"><i class="fa-solid fa-arrow-up-right-from-square"></i> زيارة</a>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}
let __adCarouselTimer = null;
let __adCarouselIndex = 0;
let __adCarouselTotal = 0;
function advanceAdCarousel(){
  __adCarouselIndex = (__adCarouselIndex + 1) % __adCarouselTotal;
  updateAdCarouselDisplay();
}
function goToAdSlide(index){
  __adCarouselIndex = index;
  updateAdCarouselDisplay();
  if(__adCarouselTimer){ clearInterval(__adCarouselTimer); __adCarouselTimer = setInterval(advanceAdCarousel, 5000); }
}
function updateAdCarouselDisplay(){
  const track = document.getElementById('adsCarouselTrack');
  if(!track) return;
  Array.from(track.children).forEach((slide,i) => { slide.style.display = (i===__adCarouselIndex) ? 'block' : 'none'; });
  document.querySelectorAll('.ads-carousel-dot').forEach((d,i) => d.classList.toggle('active', i===__adCarouselIndex));
}
function startAdCarousel(total){
  __adCarouselTotal = total;
  __adCarouselIndex = 0;
  if(__adCarouselTimer){ clearInterval(__adCarouselTimer); __adCarouselTimer = null; }
  if(total <= 1) return;
  __adCarouselTimer = setInterval(advanceAdCarousel, 5000);
}
/* ---- الترتيب حسب الأقرب (مسافة حقيقية) ---- */
let userLocation = null;
let sortByDistance = false;
function haversineDistance(lat1, lng1, lat2, lng2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLng = (lng2-lng1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function requestUserLocation(){
  if(!navigator.geolocation){ showToast('المتصفح لا يدعم تحديد الموقع'); return; }
  navigator.geolocation.getCurrentPosition((pos) => {
    userLocation = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    sortByDistance = true;
    showToast('تم الترتيب حسب الأقرب لك 📍');
    render();
  }, () => { showToast('تعذر الحصول على موقعك، تأكد من تفعيل صلاحية الموقع'); });
}
function sortByDistanceIfEnabled(list){
  if(!sortByDistance || !userLocation) return list;
  return [...list].sort((a,b) => {
    const da = (a.lat && a.lng) ? haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) : Infinity;
    const db = (b.lat && b.lng) ? haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng) : Infinity;
    return da - db;
  });
}
function distanceSortBarHtml(){
  return `<div class="distance-bar">
    <button type="button" class="btn-maplink" data-action="sortNearest" style="margin-top:0;">
      <i class="fa-solid fa-location-crosshairs"></i> ${sortByDistance ? 'مُرتّب حسب الأقرب ✓ (دوس لتحديث موقعك)' : 'ترتيب حسب الأقرب لي'}
    </button>
  </div>`;
}
function distanceBadge(item){
  if(!sortByDistance || !userLocation || !item.lat || !item.lng) return '';
  const d = haversineDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
  return `<span class="badge badge-navy" style="margin-right:6px;"><i class="fa-solid fa-route"></i> ${d.toFixed(1)} كم</span>`;
}

function renderAdsBanner(){
  let activeAds = (FIXED_DATA.ads || []).filter(a => isAdLive(a) && (a.photo || a.videoUrl));
  if(!activeAds.length) return '';
  activeAds.sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0));
  activeAds.forEach(a => incrementAdStat(a.id, 'views'));
  const slides = activeAds.map((a,i) => adSlideHtml(a,i)).join('');
  const dots = activeAds.length > 1
    ? `<div class="ads-carousel-dots">${activeAds.map((a,i) => `<span class="ads-carousel-dot${i===0?' active':''}" data-action="adDot" data-index="${i}"></span>`).join('')}</div>`
    : '';
  return `<div class="ads-section">
    <div class="ads-carousel-track" id="adsCarouselTrack">${slides}</div>
    ${dots}
  </div>`;
}


function goHome(){
  stack = []; current = {view:'home'}; searchTerm = '';
  const si = document.getElementById('searchInput');
  if(si) si.value = '';
  render();
}

/* ===================== STORAGE (Firebase Firestore) ===================== */

function pageHeader(title){
  return `
  <div class="page-head">
    <button class="icon-btn" data-action="back" aria-label="رجوع"><i class="fa-solid fa-arrow-right"></i></button>
    <h2>${esc(title)}</h2>
    <div class="icon-btn" style="opacity:0;"></div>
  </div>`;
}

function renderHome(){
  const fixed = HOME_CATS_FIXED.map(c => `
    <div class="cat-card" data-nav="${c.view}">
      <div class="cat-icon" style="background:${c.color};"><i class="fa-solid ${c.icon}"></i></div>
      <span>${esc(c.label)}</span>
    </div>`).join('');
  const custom = CUSTOM_SECTIONS.map(s => `
    <div class="cat-card" data-nav="customSection" data-key="${s.key}">
      ${s.photo
        ? `<div class="cat-icon" style="padding:0;overflow:hidden;"><img src="${s.photo}" style="width:100%;height:100%;object-fit:cover;"></div>`
        : `<div class="cat-icon" style="background:${s.color};"><i class="fa-solid ${s.icon}"></i></div>`}
      <span>${esc(s.label)}</span>
    </div>`).join('');
  return `
    <section class="hero">
      <h1>دليل الرحمانية</h1>
      <p>كل خدمات حي الرحمانية في مكان واحد — أطباء، صيدليات، مطاعم، أسواق، وأرقام طوارئ</p>
    </section>
    ${renderAdsBanner()}
    <div class="section-block">
      <div class="section-title">الأقسام الرئيسية</div>
      <div class="cat-grid">${fixed}${custom}</div>
      <a href="admin/index.html" class="admin-entry-banner" style="text-decoration:none;">\n      <i class="fa-solid fa-lock"></i> لوحة الإدارة\n    </a>
    </div>
    ${adsenseSlotHtml()}`;
}

/* ===================== PUBLIC: SPECIALTIES ===================== */

function renderSpecialties(){
  const seen = new Set(SPECIALTIES.map(s => s.key));
  const customSpecs = [];
  DOCTORS.forEach(d => {
    if(!seen.has(d.specialty)){ seen.add(d.specialty); customSpecs.push({key:d.specialty, label:d.specialtyLabel, icon:'fa-user-doctor'}); }
  });
  const all = [...SPECIALTIES, ...customSpecs];
  const items = all.map(s => `
    <div class="spec-card" data-nav="doctorsList" data-specialty="${s.key}">
      <div class="spec-icon"><i class="fa-solid ${s.icon}"></i></div>
      <span>${esc(s.label)}</span>
    </div>`).join('');
  return pageHeader('التخصصات الطبية') + `<div class="section-block"><div class="spec-grid">${items}</div></div>`;
}

/* ===================== PUBLIC: DOCTORS LIST / DETAIL ===================== */

function doctorCard(d){
  return `
  <div class="card click" data-nav="doctorDetail" data-id="${d.id}">
    <div class="row between">
      <div class="row">
        ${photoOrIcon('doctor:'+d.id, 'fa-user-doctor', 'avatar round')}
        <div>
          <div class="name-strong">${esc(d.name)}</div>
          <div class="muted-sm">${esc(d.specialtyLabel)}</div>
          <div class="stars">${starString(d.rating)} <span>${d.rating} (${d.reviews} تقييم)</span></div>
          <div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(d.address)}</div>
        </div>
      </div>
      ${favIconHtml('doctors', d.id)}
    </div>
    <div class="btn-row">${callBtn(d.phone)}${waBtn(d.phone)}</div>
  </div>`;
}

function renderDoctorsList(specialtyKey){
  const all = [...SPECIALTIES];
  const spec = all.find(s => s.key === specialtyKey);
  let list = DOCTORS.filter(d => d.specialty === specialtyKey);
  list = sortByDistanceIfEnabled(list);
  const label = spec ? spec.label : (list[0] ? list[0].specialtyLabel : '');
  const cards = list.length ? list.map(doctorCard).join('') :
    `<div class="empty-state"><i class="fa-regular fa-face-frown"></i><p>لا يوجد أطباء مسجلين في هذا التخصص حاليًا</p></div>`;
  return pageHeader('أطباء — ' + label) + `<div class="section-block">${distanceSortBarHtml()}${cards}</div>`;
}

function renderDoctorDetail(id){
  const d = DOCTORS.find(x => x.id === id);
  if(!d) return pageHeader('غير موجود') + `<div class="section-block"><p class="muted-sm">تعذر العثور على هذا الطبيب.</p></div>`;
  return `
  <div class="page-head">
    <button class="icon-btn" data-action="back"><i class="fa-solid fa-arrow-right"></i></button>
    <h2></h2>
    <button class="icon-btn" data-action="share" data-id="${d.id}"><i class="fa-solid fa-share-nodes"></i></button>
  </div>
  <div class="detail-hero">
    ${photoOrIcon('doctor:'+d.id, 'fa-user-doctor', 'detail-photo')}
    <div class="detail-name">${esc(d.name)}</div>
    <div class="detail-spec">${esc(d.specialtyLabel)}</div>
    <div class="detail-rating"><span class="stars">${starString(d.rating)}</span><b>${d.rating}</b><span class="muted-sm">(${d.reviews} تقييم)</span></div>
  </div>
  <div class="action-grid">
    <a class="action-item" href="tel:+${d.phone}"><div class="action-circle" style="background:var(--green);"><i class="fa-solid fa-phone"></i></div>اتصال</a>
    <a class="action-item" href="https://wa.me/${d.phone}" target="_blank" rel="noopener"><div class="action-circle" style="background:#25D366;"><i class="fa-brands fa-whatsapp"></i></div>واتساب</a>
    <button class="action-item" data-action="share" data-id="${d.id}"><div class="action-circle" style="background:var(--navy-mid);"><i class="fa-solid fa-share-nodes"></i></div>مشاركة</button>
  </div>
  <div class="section-block">
    <div class="card">
      <div class="info-row"><i class="fa-solid fa-location-dot"></i><div><div class="lbl">العنوان</div><div class="val">${esc(d.address)}</div></div></div>
      <div class="info-row"><i class="fa-solid fa-clock"></i><div><div class="lbl">المواعيد</div><div class="val">${esc(d.hours||'-')}</div></div></div>
      <div class="info-row"><i class="fa-solid fa-phone"></i><div><div class="lbl">رقم الهاتف</div><div class="val" style="direction:ltr;">${esc(d.phoneDisplay)}</div></div></div>
    </div>
    ${mapEmbedHtml(d.lat, d.lng, d.address)}
    <div class="section-title">نبذة عن الطبيب</div>
    <p class="bio-text">${esc(d.bio || 'لا توجد نبذة مضافة حاليًا.')}</p>
  </div>`;
}

/* ===================== PUBLIC: OTHER FIXED CATEGORIES ===================== */

function renderPharmacies(){
  const cards = sortByDistanceIfEnabled(FIXED_DATA.pharmacies).map(p => `
    <div class="card"><div class="row between">
      <div class="row"><div class="avatar" style="background:#E5F7EE;color:var(--green-dark);"><i class="fa-solid fa-capsules"></i></div>
        <div><div class="name-strong">${esc(p.name)}${distanceBadge(p)}</div>
          <div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(p.address)}</div>
          <div class="addr-line" style="direction:ltr;display:inline-block;"><i class="fa-solid fa-phone"></i> ${esc(p.phoneDisplay)}</div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
            ${p.open24 ? '<span class="badge badge-green"><i class="fa-solid fa-clock"></i> 24 ساعة</span>' : ''}
            ${p.delivery ? '<span class="badge badge-navy"><i class="fa-solid fa-motorcycle"></i> توصيل</span>' : ''}
          </div></div></div>
      ${favIconHtml('pharmacies', p.id)}
    </div><div class="btn-row">${callBtn(p.phone)}${waBtn(p.phone)}</div>${mapLinkHtml(p.lat, p.lng, p.address)}</div>`).join('');
  return pageHeader('الصيدليات') + `<div class="section-block">${distanceSortBarHtml()}${cards}</div>`;
}

function renderHospitals(){
  const cards = sortByDistanceIfEnabled(FIXED_DATA.hospitals).map(h => `
    <div class="card"><div class="row between">
      <div class="row"><div class="avatar" style="background:#EAF1F8;color:var(--navy-mid);"><i class="fa-solid fa-hospital"></i></div>
        <div><div class="name-strong">${esc(h.name)}${distanceBadge(h)}</div>
          <div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(h.address)}</div>
          <div class="addr-line" style="direction:ltr;display:inline-block;"><i class="fa-solid fa-phone"></i> ${esc(h.phoneDisplay)}</div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
            ${h.open24 ? '<span class="badge badge-green"><i class="fa-solid fa-clock"></i> طوارئ 24 ساعة</span>' : ''}
            <span class="badge badge-navy">${esc(h.note)}</span>
          </div></div></div>
      ${favIconHtml('hospitals', h.id)}
    </div><div class="btn-row">${callBtn(h.phone)}</div>${mapLinkHtml(h.lat, h.lng, h.address)}</div>`).join('');
  return pageHeader('المستشفيات') + `<div class="section-block">${distanceSortBarHtml()}${cards}</div>`;
}

function renderRestaurants(){
  const cards = sortByDistanceIfEnabled(FIXED_DATA.restaurants).map(r => `
    <div class="food-card">
      <div class="food-img" style="background:linear-gradient(135deg,#F0D9B5,#E3B57D);"><i class="fa-solid fa-utensils"></i>${favIconHtml('restaurants', r.id)}</div>
      <div class="food-info">
        <div class="name-strong" style="font-size:13px;">${esc(r.name)}${distanceBadge(r)}</div>
        <div class="muted-sm">${esc(r.kind)}</div>
        <div class="stars">${starString(r.rating)} <span>${r.rating}</span></div>
        <div class="btn-row" style="margin-top:8px;">${callBtn(r.phone)}${waBtn(r.phone)}</div>
        ${mapLinkHtml(r.lat, r.lng, r.address)}
      </div>
    </div>`).join('');
  return pageHeader('المطاعم والكافيهات') + `<div class="section-block">${distanceSortBarHtml()}<div class="food-grid">${cards}</div></div>`;
}

function renderSupermarkets(){
  const cards = sortByDistanceIfEnabled(FIXED_DATA.supermarkets).map(s => `
    <div class="card"><div class="row between">
      <div class="row"><div class="avatar" style="background:#EAF1F8;color:var(--navy-mid);"><i class="fa-solid fa-cart-shopping"></i></div>
        <div><div class="name-strong">${esc(s.name)}${distanceBadge(s)}</div>
          <div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(s.address)}</div>
          <div class="addr-line" style="direction:ltr;display:inline-block;"><i class="fa-solid fa-phone"></i> ${esc(s.phoneDisplay)}</div>
          ${s.delivery ? '<div style="margin-top:6px;"><span class="badge badge-green"><i class="fa-solid fa-motorcycle"></i> توصيل متاح</span></div>' : ''}
        </div></div>
      ${favIconHtml('supermarkets', s.id)}
    </div><div class="btn-row">${callBtn(s.phone)}${waBtn(s.phone)}</div>${mapLinkHtml(s.lat, s.lng, s.address)}</div>`).join('');
  return pageHeader('السوبر ماركت') + `<div class="section-block">${distanceSortBarHtml()}${cards}</div>`;
}

function renderShops(){
  const chips = SHOP_CATS.map(c => `<div class="chip${c.key===activeShopCat?' active':''}" data-action="shopcat" data-cat="${c.key}">${esc(c.label)}</div>`).join('');
  let list = FIXED_DATA.shops.filter(s => s.cat === activeShopCat);
  list = sortByDistanceIfEnabled(list);
  const cards = list.map(s => `
    <div class="card"><div class="row between">
      <div class="row"><div class="avatar" style="background:#F1EAF8;color:#8C6FB3;"><i class="fa-solid fa-store"></i></div>
        <div><div class="name-strong">${esc(s.name)}${distanceBadge(s)}</div>
          <div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(s.address)}</div>
          <div class="addr-line" style="direction:ltr;display:inline-block;"><i class="fa-solid fa-phone"></i> ${esc(s.phoneDisplay)}</div>
        </div></div>
      ${favIconHtml('shops', s.id)}
    </div><div class="btn-row">${callBtn(s.phone)}${waBtn(s.phone)}</div>${mapLinkHtml(s.lat, s.lng, s.address)}</div>`).join('');
  return pageHeader('المحلات التجارية') + `<div class="section-block">${distanceSortBarHtml()}<div class="chip-row">${chips}</div>${cards}</div>`;
}

function renderDelivery(){
  const cards = sortByDistanceIfEnabled(FIXED_DATA.delivery).map(d => `
    <div class="card"><div class="row between">
      <div class="row"><div class="avatar" style="background:#FBE9E2;color:#D8704F;"><i class="fa-solid fa-motorcycle"></i></div>
        <div><div class="name-strong">${esc(d.name)}${distanceBadge(d)}</div>
          <div class="addr-line"><i class="fa-solid fa-clock"></i> ${esc(d.hours)}</div>
          <div class="addr-line" style="direction:ltr;display:inline-block;"><i class="fa-solid fa-phone"></i> ${esc(d.phoneDisplay)}</div>
        </div></div>
      ${favIconHtml('delivery', d.id)}
    </div><div class="btn-row">${callBtn(d.phone)}${waBtn(d.phone)}</div>${mapLinkHtml(d.lat, d.lng, d.hours)}</div>`).join('');
  return pageHeader('خدمات التوصيل') + `<div class="section-block">${distanceSortBarHtml()}${cards}</div>`;
}

function renderEmergency(){
  const rows = FIXED_DATA.emergency.map(e => `
    <a class="em-row" href="tel:${e.number.replace(/\s/g,'')}">
      <div class="em-icon" style="background:${e.color};"><i class="fa-solid ${e.icon}"></i></div>
      <div><div class="em-name">${esc(e.name)}</div><div class="em-num">${esc(e.number)}</div></div>
      <div class="em-call"><i class="fa-solid fa-phone"></i></div>
    </a>`).join('');
  return pageHeader('أرقام الطوارئ') + `<div class="section-block">${rows}</div>`;
}

/* ===================== PUBLIC: CUSTOM SECTION ===================== */

function renderCustomSection(key){
  const s = CUSTOM_SECTIONS.find(x => x.key === key);
  const items = CUSTOM_ITEMS[key] || [];
  const coverHtml = s && s.photo ? `<div class="section-cover" style="background-image:url('${s.photo}');"></div>` : '';
  const cards = items.length ? items.map(it => `
    <div class="card">
      ${it.hasPhoto && photoCache['item:'+key+':'+it.id] ? `<img src="${photoCache['item:'+key+':'+it.id]}" class="item-photo">` : ''}
      <div class="name-strong">${esc(it.title)}</div>
      ${it.note ? `<div class="addr-line"><i class="fa-solid fa-calendar"></i> ${esc(it.note)}</div>` : ''}
      ${it.description ? `<p class="bio-text" style="margin-top:6px;">${esc(it.description)}</p>` : ''}
      ${it.phone ? `<div class="btn-row">${callBtn(it.phone)}${waBtn(it.phone)}</div>` : ''}
      ${mapLinkHtml(it.lat, it.lng, it.title)}
    </div>`).join('') : `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>لا توجد عناصر في هذا القسم حاليًا</p></div>`;
  return pageHeader(s ? s.label : 'قسم') + coverHtml + `<div class="section-block">${cards}</div>`;
}

/* ===================== PUBLIC: FAVORITES / SEARCH ===================== */

const TYPE_SOURCE = {
  doctors: () => DOCTORS, pharmacies: () => FIXED_DATA.pharmacies, hospitals: () => FIXED_DATA.hospitals,
  restaurants: () => FIXED_DATA.restaurants, supermarkets: () => FIXED_DATA.supermarkets, shops: () => FIXED_DATA.shops, delivery: () => FIXED_DATA.delivery
};

const TYPE_LABEL = { doctors:'طبيب', pharmacies:'صيدلية', hospitals:'مستشفى', restaurants:'مطعم', supermarkets:'سوبر ماركت', shops:'محل', delivery:'توصيل' };

const TYPE_ICON = { doctors:'fa-user-doctor', pharmacies:'fa-capsules', hospitals:'fa-hospital', restaurants:'fa-utensils', supermarkets:'fa-cart-shopping', shops:'fa-store', delivery:'fa-motorcycle' };

function genericResultCard(type, item){
  const avatarHtml = type === 'doctors'
    ? photoOrIcon('doctor:'+item.id, 'fa-user-doctor', 'avatar round')
    : `<div class="avatar" style="background:#EAF1F8;color:var(--navy-mid);"><i class="fa-solid ${TYPE_ICON[type]}"></i></div>`;
  const addr = item.address || item.hours || '';
  return `
  <div class="card${type==='doctors' ? ' click' : ''}" ${type==='doctors' ? `data-nav="doctorDetail" data-id="${item.id}"` : ''}>
    <div class="row between">
      <div class="row">${avatarHtml}
        <div>
          <div class="name-strong">${esc(item.name)}<span class="badge badge-navy" style="margin-right:6px;">${TYPE_LABEL[type]}</span></div>
          ${addr ? `<div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(addr)}</div>` : ''}
        </div>
      </div>
      ${favIconHtml(type, item.id)}
    </div>
    <div class="btn-row">${callBtn(item.phone)}${waBtn(item.phone)}</div>
  </div>`;
}

function renderFavorites(){
  let cards = '';
  favorites.forEach(key => {
    const [type, id] = key.split(':');
    const srcFn = TYPE_SOURCE[type];
    if(!srcFn) return;
    const item = srcFn().find(x => x.id === id);
    if(item) cards += genericResultCard(type, item);
  });
  if(!cards) cards = `<div class="empty-state"><i class="fa-regular fa-heart"></i><p>لا توجد عناصر في المفضلة بعد<br>اضغط على أيقونة القلب في أي بطاقة لإضافتها هنا</p></div>`;
  return pageHeader('المفضلة') + `<div class="section-block">${cards}</div>`;
}

function renderSearchResults(){
  const q = searchTerm.trim().toLowerCase();
  let cards = '', count = 0;
  Object.keys(TYPE_SOURCE).forEach(type => {
    TYPE_SOURCE[type]().forEach(item => {
      const hay = (item.name + ' ' + (item.specialtyLabel||'') + ' ' + (item.kind||'')).toLowerCase();
      if(hay.includes(q)){ cards += genericResultCard(type, item); count++; }
    });
  });
  if(!count) cards = `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>لا توجد نتائج لـ «${esc(searchTerm)}»</p></div>`;
  return pageHeader('نتائج البحث: ' + searchTerm) + `<div class="section-block"><div class="muted-sm" style="margin-bottom:10px;">${count} نتيجة</div>${cards}</div>`;
}

/* ===================== PUBLIC: OFFERS / MORE ===================== */

function renderOffers(){
  const cards = OFFERS.map(o => `
    <div class="card click" data-nav-offer='${JSON.stringify(o.nav).replace(/'/g,"&#39;")}'>
      <div class="row between">
        <div>
          <span class="badge badge-green"><i class="fa-solid fa-tag"></i> عرض</span>
          <div class="name-strong" style="margin-top:8px;">${esc(o.title)}</div>
          <div class="muted-sm">${esc(o.place)}</div>
          <div class="addr-line"><i class="fa-solid fa-clock"></i> ${esc(o.expiry)}</div>
        </div>
        <i class="fa-solid fa-arrow-left" style="color:var(--muted);"></i>
      </div>
    </div>`).join('');
  return pageHeader('العروض') + `<div class="section-block">${cards}</div>`;
}

function renderMore(){
  const rows = [
    {icon:'fa-circle-info', label:'عن التطبيق', nav:'about'},
    {icon:'fa-headset', label:'تواصل معنا', nav:'contact'},
    {icon:'fa-file-contract', label:'الشروط والأحكام', nav:'terms'},
    {icon:'fa-shield-halved', label:'سياسة الخصوصية', nav:'privacy'},
    {icon:'fa-share-from-square', label:'مشاركة التطبيق', action:'share-app'},
    {icon:'fa-language', label:'اللغة: العربية', action:'info'}
  ].map(r => `
    <div class="more-row" ${r.nav ? `data-nav="${r.nav}"` : `data-action="${r.action}"`}>
      <div class="row"><i class="fa-solid ${r.icon}" style="width:22px;color:var(--navy-mid);"></i><span>${esc(r.label)}</span></div>
      <i class="fa-solid fa-chevron-left" style="color:#C7D2DA;font-size:12px;"></i>
    </div>`).join('');
  return pageHeader('المزيد') + `<div class="section-block"><div class="card" style="padding:4px 13px;">${rows}</div>
  <a href="admin/index.html" class="admin-entry-banner" style="text-decoration:none;">
    <i class="fa-solid fa-lock"></i> لوحة الإدارة
  </a>
  </div>`;
}

/* ===================== ADMIN: DASHBOARD ===================== */


/* ===================== PUBLIC: LEGAL / STATIC PAGES ===================== */
function renderAbout(){
  return pageHeader('عن التطبيق') + `<div class="section-block"><div class="card">
    <p class="bio-text">تطبيق دليل الرحمانية هو دليل خدمي متكامل بيجمع لك كل الخدمات والأنشطة داخل مدينة الرحمانية في مكان واحد، وبيسهّل عليك الوصول للدكاترة، المحلات، الخدمات، والعروض بسرعة وسهولة. هدفنا نوفّر عليك الوقت ونقرّب لك كل اللي محتاجه بضغطة واحدة.</p>
  </div></div>`;
}
function renderContact(){
  return pageHeader('تواصل معنا') + `<div class="section-block"><div class="card">
    <p class="bio-text" style="margin-bottom:14px;">يسعدنا تواصلكم معانا في أي وقت للاستفسارات أو المقترحات أو الشكاوى.</p>
    <div class="info-row"><i class="fa-solid fa-phone"></i><div><div class="lbl">رقم التواصل</div><div class="val" style="direction:ltr;">01204335153</div></div></div>
    <div class="info-row"><i class="fa-solid fa-bullhorn"></i><div><div class="lbl">للإعلانات وإضافة نشاطك</div><div class="val">تواصل معنا على نفس الرقم</div></div></div>
  </div>
  <a class="btn btn-call btn-block" href="tel:+2001204335153" style="margin-top:14px;"><i class="fa-solid fa-phone"></i> اتصال مباشر</a>
  </div>`;
}
function renderTerms(){
  return pageHeader('الشروط والأحكام') + `<div class="section-block"><div class="card">
    <ul class="bio-text" style="margin:0;padding-right:18px;line-height:2.1;">
      <li>التطبيق مجرد وسيط لعرض الخدمات والأنشطة داخل الرحمانية.</li>
      <li>الإدارة غير مسؤولة عن جودة أو أسعار الخدمات المقدمة من المعلنين.</li>
      <li>يتحمل صاحب النشاط مسؤولية صحة البيانات والصور المعروضة.</li>
      <li>يحق لإدارة التطبيق تعديل أو حذف أي محتوى مخالف دون إشعار مسبق.</li>
      <li>استخدامك للتطبيق يعني موافقتك على جميع الشروط والأحكام.</li>
    </ul>
  </div></div>`;
}
function renderPrivacy(){
  return pageHeader('سياسة الخصوصية') + `<div class="section-block"><div class="card">
    <p class="bio-text">نحرص في "دليل الرحمانية" على خصوصية زوارنا. لا يقوم الموقع بجمع بيانات شخصية للزائر العادي بخلاف ما يلزم لتحسين تجربة الاستخدام (مثل تحديد الموقع الجغرافي عند طلبك ذلك صراحة لعرض الأقرب إليك، ولا يتم تخزينه أو مشاركته مع أي طرف ثالث).</p>
    <p class="bio-text" style="margin-top:10px;">بيانات الأنشطة (الأطباء، المحلات، إلخ) المعروضة على الموقع تُدار حصريًا من خلال لوحة إدارة محمية بحساب أدمن واحد مصرّح له فقط، ولا يمكن لأي زائر تعديلها.</p>
  </div></div>`;
}

function updateBottomNav(){
  document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
  const map = {home:'nav-home', favorites:'nav-fav', offers:'nav-offers', more:'nav-more'};
  const id = map[current.view];
  if(id){ const el = document.getElementById(id); if(el) el.classList.add('active'); }
}

/* ===================== STORAGE INIT (Firestore) ===================== */

async function shareItem(label){
  const shareData = {title:'دليل الرحمانية', text:label, url:location.href};
  try{
    if(navigator.share){ await navigator.share(shareData); }
    else{ await navigator.clipboard.writeText(location.href); showToast('تم نسخ رابط الصفحة 📋'); }
  }catch(err){ /* user cancelled - ignore */ }
}

/* =====================================================================
   EVENT SETUP
   كل التعاملات مربوطة بمستمع واحد على مستوى الصفحة كلها (document)
   بدل ربط كل عنصر لوحده — ده يمنع إن مشكلة في عنصر واحد توقف باقي
   الأزرار، وبيغطي عناصر الهيدر الثابتة وعناصر الصفحة المتغيرة معًا.
   ===================================================================== */

/* ===================== MAIN RENDER (الموقع العام) ===================== */
function render(){
  const app = document.getElementById('app');
  let html = '';
  switch(current.view){
    case 'home': html = renderHome(); break;
    case 'specialties': html = renderSpecialties(); break;
    case 'doctorsList': html = renderDoctorsList(current.specialty); break;
    case 'doctorDetail': html = renderDoctorDetail(current.id); break;
    case 'pharmacies': html = renderPharmacies(); break;
    case 'hospitals': html = renderHospitals(); break;
    case 'restaurants': html = renderRestaurants(); break;
    case 'supermarkets': html = renderSupermarkets(); break;
    case 'shops': html = renderShops(); break;
    case 'delivery': html = renderDelivery(); break;
    case 'emergency': html = renderEmergency(); break;
    case 'favorites': html = renderFavorites(); break;
    case 'offers': html = renderOffers(); break;
    case 'more': html = renderMore(); break;
    case 'searchResults': html = renderSearchResults(); break;
    case 'customSection': html = renderCustomSection(current.key); break;
    case 'about': html = renderAbout(); break;
    case 'contact': html = renderContact(); break;
    case 'terms': html = renderTerms(); break;
    case 'privacy': html = renderPrivacy(); break;
    default: html = renderHome();
  }
  app.innerHTML = html;
  updateBottomNav();
  if(current.view === 'home'){
    const liveAdsCount = (FIXED_DATA.ads || []).filter(a => isAdLive(a) && (a.photo || a.videoUrl)).length;
    startAdCarousel(liveAdsCount);
    if(adsenseConfigured){
      try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
    }
  }
}

/* ===================== EVENT HANDLING (الموقع العام) ===================== */
function openOverlay(id){ const el = document.getElementById(id); if(el) el.classList.add('show'); }
function closeOverlay(id){ const el = document.getElementById(id); if(el) el.classList.remove('show'); }

function handleGlobalClick(e){
  try{
    if(e.target.closest('#logoHome')){ goHome(); return; }

    if(e.target.closest('#modalCloseBtn')){ closeOverlay('modalOverlay'); return; }
    if(e.target.id === 'modalOverlay'){ closeOverlay('modalOverlay'); return; }

    const bottomNavEl = e.target.closest('[data-bottom-nav]');
    if(bottomNavEl){
      const view = bottomNavEl.dataset.bottomNav;
      if(view === 'addActivity'){ openOverlay('modalOverlay'); return; }
      stack = [];
      current = {view};
      render();
      return;
    }

    const favEl = e.target.closest('[data-fav]');
    if(favEl){
      const key = favEl.dataset.fav;
      if(favorites.has(key)){ favorites.delete(key); showToast('تم الحذف من المفضلة'); }
      else { favorites.add(key); showToast('تم الإضافة إلى المفضلة ❤️'); }
      render();
      return;
    }

    /* لو العنصر <a> وعنده href حقيقي (تل:/واتساب/مشاركة) سيبه يعمل سلوكه الطبيعي */
    const anchor = e.target.closest('a');
    if(anchor && anchor.hasAttribute('href') && !anchor.dataset.navOffer){
      if(anchor.dataset.adClick){ incrementAdStat(anchor.dataset.adClick, 'clicks'); }
      return;
    }

    const adDotEl = e.target.closest('[data-action="adDot"]');
    if(adDotEl){ goToAdSlide(parseInt(adDotEl.dataset.index, 10)); return; }

    const sortNearestEl = e.target.closest('[data-action="sortNearest"]');
    if(sortNearestEl){ requestUserLocation(); return; }

    const offerEl = e.target.closest('[data-nav-offer]');
    if(offerEl){ navigate(JSON.parse(offerEl.dataset.navOffer)); return; }

    const shareEl = e.target.closest('[data-action="share"]');
    if(shareEl){ const d = DOCTORS.find(x => x.id === shareEl.dataset.id); shareItem(d ? d.name : 'دليل الرحمانية'); return; }

    const moreEl = e.target.closest('[data-action="info"]');
    if(moreEl){ showToast('هذه الميزة قيد التطوير قريبًا'); return; }

    const shareAppEl = e.target.closest('[data-action="share-app"]');
    if(shareAppEl){ shareItem('دليل الرحمانية - دليل خدمات متكامل'); return; }

    const chipEl = e.target.closest('[data-action="shopcat"]');
    if(chipEl){ activeShopCat = chipEl.dataset.cat; render(); return; }

    const backEl = e.target.closest('[data-action="back"]');
    if(backEl){ goBack(); return; }

    const navEl = e.target.closest('[data-nav]');
    if(navEl){
      const view = navEl.dataset.nav;
      const params = {view};
      if(navEl.dataset.specialty) params.specialty = navEl.dataset.specialty;
      if(navEl.dataset.id) params.id = navEl.dataset.id;
      if(navEl.dataset.key) params.key = navEl.dataset.key;
      navigate(params);
      return;
    }
  }catch(err){
    console.error('[رحمانية] خطأ في معالجة الضغط:', err);
    showToast('حدث خطأ غير متوقع، حاول مرة أخرى');
  }
}

function handleGlobalSubmit(e){
  try{
    if(e.target.id === 'addForm'){
      e.preventDefault();
      showToast('تم إضافة النشاط بنجاح ✅ (نموذج تجريبي)');
      e.target.reset();
      closeOverlay('modalOverlay');
    }
  }catch(err){
    console.error('[رحمانية] خطأ في معالجة الإرسال:', err);
    showToast('حدث خطأ غير متوقع، حاول مرة أخرى');
  }
}

function setupEventListeners(){
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('submit', handleGlobalSubmit);

  const searchInput = document.getElementById('searchInput');
  if(searchInput){
    searchInput.addEventListener('input', (e) => {
      try{
        searchTerm = e.target.value;
        if(searchTerm.trim() === ''){ if(current.view === 'searchResults') goHome(); return; }
        if(current.view !== 'searchResults'){ stack.push(current); }
        current = {view:'searchResults'};
        render();
      }catch(err){ console.error('[رحمانية] خطأ في البحث:', err); }
    });
  }
}

/* ===================== BOOTSTRAP ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const appEl = document.getElementById('app');
  if(appEl) appEl.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner"></i><span>جاري تحميل البيانات...</span></div>';
  setupEventListeners();
  loadAllData().then(render).catch(err => {
    console.error('[رحمانية] خطأ في تحميل البيانات:', err);
    render();
  });
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('[رحمانية] فشل تسجيل Service Worker:', err));
  }
});
