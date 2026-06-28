# 2) التشغيل، النشر، وتحويل التطبيق

## أ) تشغيل المشروع محليًا
المشروع مكوّن من ملفات HTML/JS عادية، ميحتاجش تثبيت أي حاجة. بس Firebase وService Worker مش بيشتغلوا صح من `file://` مباشرة، فلازم تشغّله من خلال سيرفر محلي بسيط:

- لو عندك Python: افتح Terminal في مجلد المشروع واكتب: `python3 -m http.server 8000` وبعدين افتح `http://localhost:8000`
- أو استخدم إضافة "Live Server" في VS Code

---

## ب) النشر (Hosting) — مجاني بالكامل

### الطريقة 1: Firebase Hosting (الأنسب لأنه نفس مشروعك)
1. ثبّت أداة Firebase (محتاج Node.js مثبت على جهازك): `npm install -g firebase-tools`
2. ملف `firebase.json` جاهز بالفعل في المشروع، فقط من مجلد المشروع: `firebase login` ثم `firebase use --add` (اختار مشروعك)
3. `firebase deploy` — هذا الأمر هيرفع الموقع **وقواعد الأمان معًا** في خطوة واحدة
4. هتاخد رابط زي: `https://your-project.web.app`

### الطريقة 2: GitHub Pages (لو رافع المشروع على GitHub بالفعل)
1. من صفحة المستودع → **Settings → Pages**
2. تحت "Branch" اختار **main** → فولدر **/ (root)** → **Save**
3. هياخد دقيقة، وبعدها هيظهر رابط زي: `https://اسم-حسابك.github.io/rahmaniya-project/`

### الطريقة 3: Netlify Drop (الأسهل، بدون حساب حتى)
1. روح **app.netlify.com/drop**
2. اسحب مجلد المشروع كامل وسيبه فوق الصفحة
3. هيطلعلك رابط جاهز فورًا

### طرق إضافية (لو حابب تجرّب غيرهم)
- **Vercel** (vercel.com): نفس مبدأ Netlify تقريبًا — تسجّل دخول وتسحب المجلد
- **Cloudflare Pages** (pages.cloudflare.com): مجاني وسريع جدًا في التحميل لزوارك

---

## ج) تحويل الموقع لتطبيق APK
بعد ما يكون الموقع منشور على رابط حقيقي (من أي طريقة فوق):
1. روح على **pwabuilder.com**
2. حط رابط موقعك واضغط Enter
3. هيفحص الموقع (هيلاقي `manifest.json` و `sw.js` جاهزين بالفعل)
4. دوس **Package for stores → Android** وحمّل ملف APK جاهز للتثبيت أو النشر على Google Play

> 📱 على iPhone: المستخدم بيثبّت الموقع كتطبيق مباشرة من Safari (مشاركة → "إضافة إلى الشاشة الرئيسية") بدون احتياج APK، وده مدعوم تلقائيًا بفضل `manifest.json`.

---

## د) دومين مخصص (اختياري)
لو شريت دومين (مثل rahmaniah-guide.com) من أي شركة (Namecheap, GoDaddy...):
1. Firebase Hosting → **Add custom domain**
2. اتبع التعليمات (هتحتاج تضيف سجلات DNS عند شركة الدومين)

⬅️ [السابق: ربط Firebase](01-firebase-setup.md) | ➡️ [التالي: الأمان](03-security.md) | [الفهرس الرئيسي](../README.md)
