/* =====================================================================
   إعدادات قاعدة البيانات (Firebase) — مشترك بين الموقع ولوحة الإدارة
   ---------------------------------------------------------------------
   استبدل القيم دي بالقيم اللي هتجيبها من Firebase Console الخاص بمشروعك:
   Project Settings → عام → "إعداد SDK" → Config
   لو سيبتها كما هي، الموقع هيشتغل عادي بس بدون حفظ دائم (Demo Mode).
   ===================================================================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDDKNopnGSUUOaOAz262rB8he1jhbS0tFs",
  authDomain: "rahmaniya-guide.firebaseapp.com",
  projectId: "rahmaniya-guide",
  storageBucket: "rahmaniya-guide.firebasestorage.app",
  messagingSenderId: "7221687832",
  appId: "1:7221687832:web:bc3fd69e13b5160898b56d"
};

let db = null;
let firebaseAvailable = false;
try{
  if(typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf('ضع_') === -1){
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    /* العمل بدون إنترنت + مزامنة تلقائية فور رجوع النت (خاصية Firestore مدمجة) */
    db.enablePersistence({synchronizeTabs:true}).catch(err => {
      console.warn('[رحمانية] تعذر تفعيل العمل بدون إنترنت:', err.code);
    });
    firebaseAvailable = true;
  } else {
    console.warn('[رحمانية] لم يتم إدخال إعدادات Firebase بعد — الموقع يعمل بدون حفظ دائم.');
  }
}catch(err){
  console.error('[رحمانية] فشل الاتصال بـ Firebase:', err);
  firebaseAvailable = false;
}

/* =====================================================================
   إعدادات Google AdSense (لكسب المال من الإعلانات تلقائيًا)
   ---------------------------------------------------------------------
   متاحة فقط بعد موافقة جوجل على موقعك المنشور فعليًا على الإنترنت.
   استبدل القيمتين دول بعد التسجيل في adsense.google.com والموافقة:
   - publisherId: من "حسابي" → "معلومات الحساب" (شكله: ca-pub-XXXXXXXXXXXXXXXX)
   - adSlotId: من "الإعلانات" → "بحسب الوحدة الإعلانية" → أنشئ وحدة جديدة وهياخدك رقمها
   لو سيبتهم كما هم، مكان الإعلان مش هيظهر للزوار نهائيًا (آمن تمامًا).
   ===================================================================== */
const ADSENSE_CONFIG = {
  publisherId: "ضع_publisher_id_هنا",
  adSlotId: "ضع_ad_slot_id_هنا"
};
const adsenseConfigured = ADSENSE_CONFIG.publisherId.indexOf('ضع_') === -1 && ADSENSE_CONFIG.adSlotId.indexOf('ضع_') === -1;
if(adsenseConfigured){
  try{
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CONFIG.publisherId;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }catch(err){ console.error('[رحمانية] فشل تحميل AdSense:', err); }
}
