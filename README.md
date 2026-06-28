# دليل الرحمانية

دليل خدمات الرحمانية — أطباء، صيدليات، مستشفيات، مطاعم، أسواق، خدمات توصيل، وأرقام طوارئ في مكان واحد. موقع + لوحة إدارة + تطبيق PWA قابل للتحويل إلى APK.

## 📁 هيكلة المشروع

| المسار | الوصف |
|---|---|
| `index.html` | صفحة الموقع العامة (للزوار) |
| `manifest.json` | إعدادات تثبيت التطبيق (PWA) |
| `sw.js` | Service Worker (العمل بدون إنترنت) |
| `admin/index.html` | لوحة الإدارة (محمية بتسجيل دخول) |
| `admin/admin.js` | منطق لوحة الإدارة |
| `assets/css/style.css` | كل التنسيقات (مشتركة) |
| `assets/js/common.js` | البيانات والدوال المشتركة بين الموقع واللوحة |
| `assets/js/app.js` | منطق الموقع العام |
| `assets/icons/` | أيقونات التطبيق (192px, 512px) |
| `assets/images/` | صورة خلفية الموقع |
| `firebase/firebase-config.js` | بيانات الاتصال بقاعدة البيانات |
| `firebase/firestore.rules` | قواعد الأمان الموصى بها |
| `firebase.json` | إعدادات نشر Firebase (اختياري) |
| `robots.txt` | منع فهرسة لوحة الإدارة في محركات البحث |

## 📖 التوثيق التفصيلي

التوثيق الكامل مقسّم لملفات منفصلة داخل مجلد [`docs/`](docs/) لسهولة القراءة:

1. **[ربط Firebase](docs/01-firebase-setup.md)** ← ابدأ من هنا (الخطوة الأهم)
2. **[التشغيل والنشر وتحويل APK](docs/02-run-and-deploy.md)**
3. **[الأمان](docs/03-security.md)**
4. **[دليل الإدارة والربح من الإعلانات](docs/04-admin-guide.md)**
5. **[قائمة الميزات](docs/05-features.md)**

## ⚡ بداية سريعة
1. اتبع [docs/01-firebase-setup.md](docs/01-firebase-setup.md) لربط قاعدة البيانات
2. اتبع [docs/02-run-and-deploy.md](docs/02-run-and-deploy.md) للنشر
3. راجع [docs/03-security.md](docs/03-security.md) للتأكد من تأمين المشروع قبل ما تنشره لأي حد
