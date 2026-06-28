/* =====================================================================
   sw.js — Service Worker لتطبيق "دليل الرحمانية"
   ---------------------------------------------------------------------
   الفكرة:
   - يخزّن "هيكل" التطبيق (HTML/CSS/JS/الأيقونات) عشان يفتح فورًا حتى من
     غير إنترنت.
   - بيانات الأقسام نفسها (الدكاترة، الصيدليات...) متخزنة بمعرفة Firestore
     نفسها (enablePersistence في firebase-config.js) فمش محتاجين نكررها هنا.
   - أي تحديث في نسخة الكود (CACHE_VERSION) بيمسح الكاش القديم ويحمّل الجديد
     تلقائيًا أول ما النت يرجع.
   ===================================================================== */
const CACHE_VERSION = 'rahmaniya-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/common.js',
  './assets/js/app.js',
  './firebase/firebase-config.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* سيب أي طلب لـ Firebase/Firestore/المكتبات الخارجية يعمل بشكل طبيعي
     (Firestore عندها نظام Offline/Sync الخاص بيها بالفعل) */
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  if(!isSameOrigin){ return; }

  /* Cache-first للملفات الثابتة، مع تحديث في الخلفية */
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((res) => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
