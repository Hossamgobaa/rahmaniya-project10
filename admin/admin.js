/* ===================================================================
   admin.js -- منطق لوحة الإدارة (محمي بتسجيل دخول Firebase Authentication)
   =================================================================== */

function locationPickerHtml(lat, lng){
  const hasLoc = lat && lng;
  return `
  <div class="form-group">
    <label>تحديد الموقع على الخريطة (اختياري) — دوس على الخريطة لوضع الدبوس بدقة</label>
    <div id="locationPickerMap" class="location-picker-map"></div>
    <div class="row" style="gap:8px;margin-top:9px;flex-wrap:wrap;">
      <button type="button" class="btn btn-outline" style="flex:0 0 auto;" onclick="useMyLocationForPicker()"><i class="fa-solid fa-location-crosshairs"></i> استخدم موقعي الحالي</button>
      <div class="muted-sm" id="latlngDisplay" style="flex:1;">${hasLoc ? ('تم تحديد الموقع: ' + lat + ', ' + lng) : 'لم يتم تحديد موقع بعد'}</div>
    </div>
    <input type="hidden" name="lat" id="latInput" value="${hasLoc ? lat : ''}">
    <input type="hidden" name="lng" id="lngInput" value="${hasLoc ? lng : ''}">
  </div>`;
}

let __pickerMapInstance = null;

function initLocationPicker(){
  const mapDiv = document.getElementById('locationPickerMap');
  if(!mapDiv || typeof L === 'undefined') return;
  try{
    const latInput = document.getElementById('latInput');
    const lngInput = document.getElementById('lngInput');
    const existingLat = parseFloat(latInput.value);
    const existingLng = parseFloat(lngInput.value);
    const hasExisting = !isNaN(existingLat) && !isNaN(existingLng);
    const startLat = hasExisting ? existingLat : 31.1048901;
    const startLng = hasExisting ? existingLng : 30.6431445;
    const map = L.map('locationPickerMap').setView([startLat, startLng], hasExisting ? 15 : 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    }).addTo(map);
    let marker = hasExisting ? L.marker([startLat, startLng]).addTo(map) : null;
    map.on('click', function(e){
      const lat = e.latlng.lat, lng = e.latlng.lng;
      if(marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
      document.getElementById('latInput').value = lat.toFixed(6);
      document.getElementById('lngInput').value = lng.toFixed(6);
      const disp = document.getElementById('latlngDisplay');
      if(disp) disp.textContent = 'تم تحديد الموقع: ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
    });
    __pickerMapInstance = map;
    setTimeout(() => { try{ map.invalidateSize(); }catch(e){} }, 150);
  }catch(err){ console.error('[رحمانية] فشل تحميل الخريطة:', err); }
}

function useMyLocationForPicker(){
  if(!navigator.geolocation){ showToast('المتصفح لا يدعم تحديد الموقع'); return; }
  navigator.geolocation.getCurrentPosition(function(pos){
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    const latInput = document.getElementById('latInput');
    const lngInput = document.getElementById('lngInput');
    if(latInput) latInput.value = lat.toFixed(6);
    if(lngInput) lngInput.value = lng.toFixed(6);
    if(__pickerMapInstance){
      try{
        __pickerMapInstance.setView([lat, lng], 16);
        L.marker([lat, lng]).addTo(__pickerMapInstance);
      }catch(e){}
    }
    const disp = document.getElementById('latlngDisplay');
    if(disp) disp.textContent = 'تم تحديد الموقع: ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
    showToast('تم تحديد موقعك الحالي 📍');
  }, function(){ showToast('تعذر الحصول على الموقع، تأكد من تفعيل صلاحية الموقع في المتصفح'); });
}

/* ===================== ADS BANNER (داخلي، يديره الأدمن) ===================== */

function returnAfterSave(dest){
  stack.pop();
  current = dest;
  render();
}

async function fbSaveDoctor(doctorObj){
  if(!firebaseAvailable) return;
  try{ await db.collection('doctors').doc(doctorObj.id).set(doctorObj); }
  catch(err){ console.error('[رحمانية] فشل حفظ الطبيب:', err); storageAvailable = false; }
}

async function fbDeleteDoctor(id){
  if(!firebaseAvailable) return;
  try{ await db.collection('doctors').doc(id).delete(); }
  catch(err){ console.error('[رحمانية] فشل حذف الطبيب:', err); }
}

async function fbSaveSection(sectionObj){
  if(!firebaseAvailable) return;
  try{ await db.collection('sections').doc(sectionObj.key).set(sectionObj); }
  catch(err){ console.error('[رحمانية] فشل حفظ القسم:', err); storageAvailable = false; }
}

async function fbDeleteSection(key){
  if(!firebaseAvailable) return;
  try{ await db.collection('sections').doc(key).delete(); }
  catch(err){ console.error('[رحمانية] فشل حذف القسم:', err); }
}

async function fbSaveItem(sectionKey, itemObj){
  if(!firebaseAvailable) return;
  try{ await db.collection('items').doc(itemObj.id).set({...itemObj, sectionKey}); }
  catch(err){ console.error('[رحمانية] فشل حفظ العنصر:', err); storageAvailable = false; }
}

async function fbDeleteItem(id){
  if(!firebaseAvailable) return;
  try{ await db.collection('items').doc(id).delete(); }
  catch(err){ console.error('[رحمانية] فشل حذف العنصر:', err); }
}

/* ---- عام: يخدم كل الأقسام الثابتة (صيدليات/مستشفيات/مطاعم/سوبر ماركت/محلات/توصيل/طوارئ) ---- */

async function fbSaveFixedItem(catKey, obj){
  if(!firebaseAvailable) return;
  try{ await db.collection(catKey).doc(obj.id).set(obj); }
  catch(err){ console.error('[رحمانية] فشل حفظ عنصر في', catKey, err); storageAvailable = false; }
}

async function fbDeleteFixedItem(catKey, id){
  if(!firebaseAvailable) return;
  try{ await db.collection(catKey).doc(id).delete(); }
  catch(err){ console.error('[رحمانية] فشل حذف عنصر من', catKey, err); }
}


/* ===================== STATE & NAVIGATION (لوحة الإدارة) ===================== */
let current = {view:'adminDashboard', adminTab:'doctors'};
let stack = [];
function navigate(next, push=true){
  if(push) stack.push(current);
  current = next;
  render();
  const appEl = document.getElementById('app');
  if(appEl) appEl.scrollIntoView({behavior:'smooth', block:'start'});
}
function goBack(){ current = stack.pop() || {view:'adminDashboard', adminTab:'doctors'}; render(); }

function resizeImageFile(file, maxW=480, quality=0.75){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if(w > maxW){ h = Math.round(h * (maxW / w)); w = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function previewPhoto(input, previewId){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if(img){ img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function selectColorSwatch(btn){
  document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const hidden = document.getElementById('colorHiddenInput');
  if(hidden) hidden.value = btn.dataset.color;
}

/* ===================== pageHeader components ===================== */

function pageHeaderAdmin(title){
  return `
  <div class="page-head">
    <button class="icon-btn" data-action="back" aria-label="رجوع"><i class="fa-solid fa-arrow-right"></i></button>
    <h2>${esc(title)}</h2>
    <button class="exit-btn" data-action="adminExit"><i class="fa-solid fa-right-from-bracket"></i> خروج</button>
  </div>`;
}

/* ===================== PUBLIC: HOME ===================== */

function storageWarningHtml(){
  if(firebaseAvailable && storageAvailable) return '';
  if(!firebaseAvailable){
    return `<div class="storage-warning"><i class="fa-solid fa-triangle-exclamation"></i> قاعدة البيانات (Firebase) لسه مش متوصّلة — لازم تحط بيانات الاتصال في أول الكود (FIREBASE_CONFIG). التعديلات دلوقتي تجريبية وهتُمسح بمجرد إغلاق الصفحة.</div>`;
  }
  return `<div class="storage-warning"><i class="fa-solid fa-triangle-exclamation"></i> حصل خطأ في الاتصال بقاعدة البيانات. تأكد من صحة بيانات FIREBASE_CONFIG وقواعد الأمان (Rules) في Firestore.</div>`;
}

function adminDoctorRow(d){
  return `<div class="card">
    <div class="row between">
      <div class="row">${photoOrIcon('doctor:'+d.id,'fa-user-doctor','avatar round')}
        <div><div class="name-strong">${esc(d.name)}</div><div class="muted-sm">${esc(d.specialtyLabel)}</div>
          <div class="addr-line"><i class="fa-solid fa-location-dot"></i> ${esc(d.address)}</div></div>
      </div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-edit" data-action="adminEditDoctor" data-id="${d.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
      <button type="button" class="btn btn-delete" data-action="adminDeleteDoctor" data-id="${d.id}"><i class="fa-solid fa-trash"></i> حذف</button>
    </div>
  </div>`;
}

function adminSectionRow(s){
  const items = CUSTOM_ITEMS[s.key] || [];
  return `<div class="card">
    <div class="row between">
      <div class="row"><div class="avatar" style="background:${s.color};color:#fff;"><i class="fa-solid ${s.icon}"></i></div>
        <div><div class="name-strong">${esc(s.label)}</div><div class="muted-sm">${items.length} عنصر</div></div>
      </div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-outline" data-action="adminOpenSection" data-key="${s.key}"><i class="fa-solid fa-folder-open"></i> فتح العناصر</button>
      <button type="button" class="btn btn-delete" data-action="adminDeleteSection" data-key="${s.key}"><i class="fa-solid fa-trash"></i> حذف القسم</button>
    </div>
  </div>`;
}

function renderAdminDashboard(){
  const tab = current.adminTab || 'doctors';
  const tabs = `<div class="chip-row">
    <div class="chip${tab==='doctors'?' active':''}" data-action="adminTab" data-tab="doctors">إدارة الأطباء</div>
    <div class="chip${tab==='fixed'?' active':''}" data-action="adminTab" data-tab="fixed">كل الأقسام</div>
    <div class="chip${tab==='sections'?' active':''}" data-action="adminTab" data-tab="sections">الأقسام المخصصة</div>
  </div>`;
  let body;
  if(tab === 'doctors'){
    body = `<button type="button" class="btn-submit" style="margin-bottom:14px;" data-action="adminAddDoctor"><i class="fa-solid fa-plus"></i> إضافة طبيب جديد</button>`
      + (DOCTORS.length ? DOCTORS.map(adminDoctorRow).join('') : `<div class="empty-state"><i class="fa-solid fa-user-doctor"></i><p>لا يوجد أطباء مضافون</p></div>`);
  } else if(tab === 'fixed'){
    body = `<div class="muted-sm" style="margin-bottom:12px;">دوس على أي قسم تحته لإضافة أو تعديل أو حذف عناصره</div>`
      + Object.keys(FIXED_CATS_CONFIG).map(key => adminFixedCatRow(key)).join('');
  } else {
    body = `<button type="button" class="btn-submit" style="margin-bottom:14px;" data-action="adminAddSection"><i class="fa-solid fa-plus"></i> إضافة قسم جديد</button>`
      + (CUSTOM_SECTIONS.length ? CUSTOM_SECTIONS.map(adminSectionRow).join('') : `<div class="empty-state"><i class="fa-solid fa-layer-group"></i><p>لا توجد أقسام مخصصة بعد<br>مثال: إعلانات الوفيات، الحوادث، العروض الخاصة</p></div>`);
  }
  return pageHeaderAdmin('لوحة الإدارة') + `<div class="section-block">${storageWarningHtml()}${tabs}${body}</div>`;
}

function adminFixedCatRow(catKey){
  const cfg = FIXED_CATS_CONFIG[catKey];
  const count = (FIXED_DATA[catKey] || []).length;
  return `<div class="card">
    <div class="row between">
      <div class="row"><div class="avatar" style="background:${cfg.color};color:#fff;"><i class="fa-solid ${cfg.icon}"></i></div>
        <div><div class="name-strong">${esc(cfg.label)}</div><div class="muted-sm">${count} عنصر</div></div>
      </div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-outline" data-action="adminOpenFixedCat" data-cat="${catKey}"><i class="fa-solid fa-folder-open"></i> فتح وتعديل</button>
    </div>
  </div>`;
}

/* ===================== ADMIN: GENERIC FIXED-CATEGORY ENGINE ===================== */

function fixedItemTitle(catKey, item){
  const cfg = FIXED_CATS_CONFIG[catKey];
  const titleField = cfg.fields[0].name;
  return item[titleField] || '';
}

function fixedItemSubtitle(catKey, item){
  const subCandidates = ['address','kind','hours','number'];
  for(const c of subCandidates){ if(item[c]) return item[c]; }
  return '';
}

function adminFixedItemRow(catKey, item){
  const photoField = FIXED_CATS_CONFIG[catKey].fields.find(f => f.type === 'photo');
  const photoHtml = photoField && item[photoField.name] ? `<img src="${item[photoField.name]}" class="item-photo" style="height:90px;">` : '';
  const activeBadge = ('active' in item) ? (item.active ? '<span class="badge badge-green">مفعّل</span>' : '<span class="badge" style="background:#FBE9E2;color:var(--danger);">متوقف</span>') : '';
  const pinnedBadge = item.pinned ? '<span class="badge badge-navy">مُثبّت ⭐</span>' : '';
  const statsLine = (catKey === 'ads') ? `<div class="muted-sm" style="margin-top:4px;"><i class="fa-solid fa-eye"></i> ${item.views||0} مشاهدة &nbsp; <i class="fa-solid fa-arrow-pointer"></i> ${item.clicks||0} ضغطة</div>` : '';
  return `<div class="card">
    ${photoHtml}
    <div class="row between"><div class="name-strong">${esc(fixedItemTitle(catKey, item))}</div><div class="row" style="gap:6px;">${activeBadge}${pinnedBadge}</div></div>
    <div class="muted-sm">${esc(fixedItemSubtitle(catKey, item))}</div>
    ${statsLine}
    <div class="btn-row">
      <button type="button" class="btn btn-edit" data-action="adminEditFixedItem" data-cat="${catKey}" data-id="${item.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
      <button type="button" class="btn btn-delete" data-action="adminDeleteFixedItem" data-cat="${catKey}" data-id="${item.id}"><i class="fa-solid fa-trash"></i> حذف</button>
    </div>
  </div>`;
}

function renderAdminCategoryList(catKey){
  const cfg = FIXED_CATS_CONFIG[catKey];
  if(!cfg) return pageHeaderAdmin('قسم غير معروف') + `<div class="section-block"></div>`;
  const list = FIXED_DATA[catKey] || [];
  const rows = list.length ? list.map(it => adminFixedItemRow(catKey, it)).join('') : `<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>لا توجد عناصر بعد</p></div>`;
  return pageHeaderAdmin(cfg.label) + `
  <div class="section-block">
    <button type="button" class="btn-submit" style="margin-bottom:14px;" data-action="adminAddFixedItem" data-cat="${catKey}"><i class="fa-solid fa-plus"></i> إضافة جديد لـ ${esc(cfg.label)}</button>
    ${rows}
  </div>`;
}

function renderFixedFieldInput(field, item){
  const val = item ? (item[field.name] !== undefined && item[field.name] !== null ? item[field.name] : '') : (field.default || '');
  if(field.type === 'checkbox'){
    const checked = item ? (item[field.name] ? 'checked' : '') : (field.default ? 'checked' : '');
    return `<div class="form-group"><label class="row" style="gap:8px;cursor:pointer;"><input type="checkbox" name="${field.name}" ${checked} style="width:auto;"> ${esc(field.label)}</label></div>`;
  }
  if(field.type === 'select'){
    const opts = field.options.map(o => `<option value="${esc(o.v)}" ${item && item[field.name]===o.v ? 'selected' : ''}>${esc(o.l)}</option>`).join('');
    return `<div class="form-group"><label>${esc(field.label)}${field.required?' *':''}</label><select name="${field.name}">${opts}</select></div>`;
  }
  if(field.type === 'photo'){
    const existingPhoto = item ? item[field.name] : null;
    return `<div class="form-group">
      <label>${esc(field.label)}${field.required?' *':''}</label>
      <img id="genPhotoPreview_${field.name}" class="photo-preview" style="display:${existingPhoto?'block':'none'};" src="${existingPhoto||''}">
      <input type="file" class="gen-photo-input" data-field="${field.name}" accept="image/*" onchange="previewPhoto(this,'genPhotoPreview_${field.name}')">
    </div>`;
  }
  const extra = [field.step?`step="${field.step}"`:'', field.min?`min="${field.min}"`:'', field.max?`max="${field.max}"`:''].join(' ');
  return `<div class="form-group"><label>${esc(field.label)}${field.required?' *':''}</label><input name="${field.name}" type="${field.type}" value="${esc(String(val))}" ${extra} ${field.required?'required':''}></div>`;
}

function renderAdminCategoryItemForm(catKey, editId){
  const cfg = FIXED_CATS_CONFIG[catKey];
  if(!cfg) return pageHeaderAdmin('قسم غير معروف') + `<div class="section-block"></div>`;
  const editing = !!editId;
  const item = editing ? (FIXED_DATA[catKey]||[]).find(x => x.id === editId) : null;
  const fieldsHtml = cfg.fields.map(f => renderFixedFieldInput(f, item)).join('');
  const showLocation = cfg.noLocation !== true;
  return pageHeaderAdmin((editing ? 'تعديل: ' : 'إضافة إلى ') + cfg.label) + `
  <div class="section-block">
    <form id="catItemForm" data-cat="${catKey}" data-edit-id="${editing ? editId : ''}">
      ${fieldsHtml}
      ${showLocation ? locationPickerHtml(item ? item.lat : null, item ? item.lng : null) : ''}
      <button type="submit" class="btn-submit"><i class="fa-solid fa-floppy-disk"></i> ${editing ? 'حفظ التعديلات' : 'إضافة'}</button>
    </form>
  </div>`;
}

function validateFixedForm(catKey, fd){
  const cfg = FIXED_CATS_CONFIG[catKey];
  for(const f of cfg.fields){
    if(f.required && f.type !== 'checkbox' && f.type !== 'photo'){
      const v = (fd.get(f.name) || '').toString().trim();
      if(!v) return f.label;
    }
  }
  return null;
}

async function submitCatItemForm(form){
  const catKey = form.dataset.cat;
  const cfg = FIXED_CATS_CONFIG[catKey];
  const fd = new FormData(form);
  const missing = validateFixedForm(catKey, fd);
  if(missing){ showToast('من فضلك أكمل: ' + missing); return; }

  const editId = form.dataset.editId || null;
  const id = editId || (catKey.slice(0,2) + '_' + Date.now());
  const existing = editId ? (FIXED_DATA[catKey]||[]).find(x => x.id === editId) : null;
  const obj = existing ? {...existing} : {id};
  obj.id = id;
  for(const f of cfg.fields){
    if(f.type === 'checkbox'){ obj[f.name] = fd.get(f.name) === 'on'; }
    else if(f.type === 'number'){ obj[f.name] = parseFloat(fd.get(f.name)) || (f.default ? parseFloat(f.default) : 0); }
    else if(f.type === 'photo'){
      let photoVal = existing ? (existing[f.name] || null) : null;
      const fileInput = form.querySelector(`.gen-photo-input[data-field="${f.name}"]`);
      if(fileInput && fileInput.files && fileInput.files[0]){
        try{ photoVal = await resizeImageFile(fileInput.files[0], 640, 0.75); }
        catch(err){ showToast('تعذر معالجة الصورة، تم الحفظ بدونها'); }
      }
      obj[f.name] = photoVal;
    }
    else { obj[f.name] = (fd.get(f.name) || '').toString().trim(); }
  }
  if(cfg.noLocation !== true){
    const lat = parseFloat(fd.get('lat')); const lng = parseFloat(fd.get('lng'));
    obj.lat = isNaN(lat) ? null : lat;
    obj.lng = isNaN(lng) ? null : lng;
  }

  if(!FIXED_DATA[catKey]) FIXED_DATA[catKey] = [];
  if(editId){
    const idx = FIXED_DATA[catKey].findIndex(x => x.id === editId);
    if(idx > -1) FIXED_DATA[catKey][idx] = obj; else FIXED_DATA[catKey].push(obj);
  } else {
    FIXED_DATA[catKey].push(obj);
  }
  await fbSaveFixedItem(catKey, obj);
  showToast(editId ? 'تم تحديث البيانات ✅' : 'تم الإضافة بنجاح ✅');
  returnAfterSave({view:'adminCategoryList', catKey});
}

async function deleteFixedItem(catKey, id){
  if(!confirm('هل أنت متأكد من الحذف؟')) return;
  FIXED_DATA[catKey] = (FIXED_DATA[catKey] || []).filter(x => x.id !== id);
  await fbDeleteFixedItem(catKey, id);
  showToast('تم الحذف');
  render();
}

/* ===================== ADMIN: DOCTOR FORM ===================== */

function renderAdminDoctorForm(editId){
  const editing = !!editId;
  const d = editing ? DOCTORS.find(x => x.id === editId) : null;
  const seenKeys = new Set(SPECIALTIES.map(s => s.key));
  const customKeys = [];
  DOCTORS.forEach(x => { if(!seenKeys.has(x.specialty) && !customKeys.find(c=>c.key===x.specialty)){ seenKeys.add(x.specialty); customKeys.push({key:x.specialty, label:x.specialtyLabel}); } });
  const fixedOptions = SPECIALTIES.map(s => `<option value="${s.key}" ${d && d.specialty===s.key ? 'selected' : ''}>${esc(s.label)}</option>`).join('');
  const customOptions = customKeys.map(c => `<option value="${c.key}" ${d && d.specialty===c.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  const photoExisting = editing && photoCache['doctor:'+editId];

  return pageHeaderAdmin(editing ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد') + `
  <div class="section-block">
    <form id="doctorForm" data-edit-id="${editing ? editId : ''}">
      <div class="form-group"><label>اسم الطبيب *</label><input name="name" type="text" value="${d ? esc(d.name) : ''}" required></div>
      <div class="form-group"><label>التخصص الأساسي *</label>
        <select name="specialty" onchange="document.getElementById('specialtyNewWrap').style.display=(this.value==='__other__')?'block':'none';">
          ${fixedOptions}${customOptions}
          <option value="__other__">➕ تخصص جديد...</option>
        </select>
      </div>
      <div class="form-group" id="specialtyNewWrap" style="display:none;"><label>اسم التخصص الجديد</label><input name="specialtyNew" type="text" placeholder="مثال: تغذية علاجية"></div>
      <div class="form-group"><label>الوصف التخصصي (يظهر تحت اسم الطبيب) *</label><input name="specialtyLabel" type="text" value="${d ? esc(d.specialtyLabel) : ''}" placeholder="مثال: أخصائي باطنة وجهاز هضمي" required></div>
      <div class="form-group"><label>العنوان *</label><input name="address" type="text" value="${d ? esc(d.address) : ''}" required></div>
      <div class="form-group"><label>رقم الهاتف (دولي بدون +) *</label><input name="phone" type="tel" value="${d ? esc(d.phone) : ''}" placeholder="201xxxxxxxxx" required></div>
      <div class="form-group"><label>رقم الهاتف للعرض</label><input name="phoneDisplay" type="text" value="${d ? esc(d.phoneDisplay) : ''}" placeholder="0123 456 7890"></div>
      <div class="form-group"><label>مواعيد العمل</label><input name="hours" type="text" value="${d ? esc(d.hours||'') : ''}" placeholder="يوميًا 9 ص - 9 م"></div>
      <div class="form-group"><label>نبذة عن الطبيب</label><textarea name="bio" rows="3">${d ? esc(d.bio||'') : ''}</textarea></div>
      <div class="row" style="gap:10px;align-items:flex-start;">
        <div class="form-group" style="flex:1;"><label>التقييم (1-5)</label><input name="rating" type="number" min="1" max="5" step="0.1" value="${d ? d.rating : '5'}"></div>
        <div class="form-group" style="flex:1;"><label>عدد التقييمات</label><input name="reviews" type="number" min="0" value="${d ? d.reviews : '0'}"></div>
      </div>
      <div class="form-group">
        <label>صورة الطبيب</label>
        <img id="docPhotoPreview" class="photo-preview" style="display:${photoExisting?'block':'none'};" src="${photoExisting ? photoCache['doctor:'+editId] : ''}">
        <input type="file" id="docPhotoInput" accept="image/*" onchange="previewPhoto(this,'docPhotoPreview')">
      </div>
      ${locationPickerHtml(d ? d.lat : null, d ? d.lng : null)}
      <button type="submit" class="btn-submit"><i class="fa-solid fa-floppy-disk"></i> ${editing ? 'حفظ التعديلات' : 'إضافة الطبيب'}</button>
    </form>
  </div>`;
}

async function submitDoctorForm(form){
  const fd = new FormData(form);
  const name = (fd.get('name')||'').trim();
  const address = (fd.get('address')||'').trim();
  const phoneRaw = (fd.get('phone')||'').trim().replace(/[^0-9]/g,'');
  if(!name || !address || !phoneRaw){ showToast('من فضلك أكمل الحقول المطلوبة'); return; }

  let specialty = fd.get('specialty');
  if(specialty === '__other__'){
    const customName = (fd.get('specialtyNew')||'').trim();
    if(!customName){ showToast('من فضلك اكتب اسم التخصص الجديد'); return; }
    specialty = 'custom_' + customName.replace(/\s+/g,'_').toLowerCase();
  }
  const specialtyLabel = (fd.get('specialtyLabel')||'').trim() || specialty;
  const rating = parseFloat(fd.get('rating')) || 5;
  const reviews = parseInt(fd.get('reviews'),10) || 0;
  const hours = (fd.get('hours')||'').trim();
  const bio = (fd.get('bio')||'').trim();
  const phoneDisplay = (fd.get('phoneDisplay')||'').trim() || phoneRaw;

  const editId = form.dataset.editId || null;
  const id = editId || ('d_' + Date.now());

  const photoInput = form.querySelector('#docPhotoInput');
  let photo = editId ? (photoCache['doctor:'+editId] || null) : null;
  if(photoInput && photoInput.files && photoInput.files[0]){
    try{
      const dataUrl = await resizeImageFile(photoInput.files[0]);
      photoCache['doctor:'+id] = dataUrl;
      photo = dataUrl;
    }catch(err){ showToast('تعذر معالجة الصورة، تم الحفظ بدونها'); }
  }
  const hasPhoto = !!photo;
  const lat = parseFloat(fd.get('lat')); const lng = parseFloat(fd.get('lng'));

  const doctorObj = {id, name, specialty, specialtyLabel, rating, reviews, address, phone:phoneRaw, phoneDisplay, hours, bio, hasPhoto, photo, lat: isNaN(lat)?null:lat, lng: isNaN(lng)?null:lng};
  if(editId){
    const idx = DOCTORS.findIndex(x => x.id === editId);
    if(idx > -1) DOCTORS[idx] = doctorObj; else DOCTORS.push(doctorObj);
  } else {
    DOCTORS.push(doctorObj);
  }
  await fbSaveDoctor(doctorObj);
  showToast(editId ? 'تم تحديث بيانات الطبيب ✅' : 'تم إضافة الطبيب بنجاح ✅');
  returnAfterSave({view:'adminDashboard', adminTab:'doctors'});
}

async function deleteDoctor(id){
  if(!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
  DOCTORS = DOCTORS.filter(x => x.id !== id);
  delete photoCache['doctor:'+id];
  await fbDeleteDoctor(id);
  showToast('تم حذف الطبيب');
  render();
}

/* ===================== ADMIN: CUSTOM SECTION FORM ===================== */

function renderAdminSectionForm(editKey){
  const editing = !!editKey;
  const s = editing ? CUSTOM_SECTIONS.find(x => x.key === editKey) : null;
  const iconOptions = SECTION_ICONS.map(i => `<option value="${i.v}" ${s && s.icon===i.v ? 'selected' : ''}>${esc(i.l)}</option>`).join('');
  const colorSwatches = SECTION_COLORS.map(c => `<button type="button" class="color-swatch-btn${s && s.color===c ? ' selected' : (!s && c===SECTION_COLORS[0] ? ' selected' : '')}" style="background:${c};" data-color="${c}" onclick="selectColorSwatch(this)"></button>`).join('');
  const photoExisting = s && s.photo;
  return pageHeaderAdmin(editing ? 'تعديل القسم' : 'إضافة قسم جديد') + `
  <div class="section-block">
    <form id="sectionForm" data-edit-key="${editing ? editKey : ''}">
      <div class="form-group"><label>اسم القسم *</label><input name="label" type="text" value="${s ? esc(s.label) : ''}" placeholder="مثال: إعلانات الوفيات" required></div>
      <div class="form-group"><label>الأيقونة *</label><select name="icon">${iconOptions}</select></div>
      <div class="form-group"><label>اللون *</label>
        <div class="color-swatch-row">${colorSwatches}</div>
        <input type="hidden" name="color" id="colorHiddenInput" value="${s ? s.color : SECTION_COLORS[0]}">
      </div>
      <div class="form-group">
        <label>صورة غلاف للقسم (اختياري)</label>
        <img id="sectionPhotoPreview" class="photo-preview" style="display:${photoExisting?'block':'none'};" src="${photoExisting ? s.photo : ''}">
        <input type="file" id="sectionPhotoInput" accept="image/*" onchange="previewPhoto(this,'sectionPhotoPreview')">
      </div>
      <button type="submit" class="btn-submit"><i class="fa-solid fa-floppy-disk"></i> ${editing ? 'حفظ التعديلات' : 'إضافة القسم'}</button>
    </form>
  </div>`;
}

async function submitSectionForm(form){
  const fd = new FormData(form);
  const label = (fd.get('label')||'').trim();
  const icon = fd.get('icon');
  const color = fd.get('color') || SECTION_COLORS[0];
  if(!label){ showToast('من فضلك اكتب اسم القسم'); return; }
  const editKey = form.dataset.editKey || null;
  const key = editKey || ('custom_' + Date.now());

  let photo = editKey ? ((CUSTOM_SECTIONS.find(x => x.key === editKey) || {}).photo || null) : null;
  const photoInput = form.querySelector('#sectionPhotoInput');
  if(photoInput && photoInput.files && photoInput.files[0]){
    try{ photo = await resizeImageFile(photoInput.files[0], 640, 0.75); }
    catch(err){ showToast('تعذر معالجة صورة القسم، تم الحفظ بدونها'); }
  }

  const sectionObj = {key, label, icon, color, photo};
  if(editKey){
    const idx = CUSTOM_SECTIONS.findIndex(x => x.key === editKey);
    if(idx > -1) CUSTOM_SECTIONS[idx] = sectionObj;
  } else {
    CUSTOM_SECTIONS.push(sectionObj);
    CUSTOM_ITEMS[key] = [];
  }
  await fbSaveSection(sectionObj);
  showToast(editKey ? 'تم تحديث القسم ✅' : 'تم إضافة القسم بنجاح ✅');
  returnAfterSave({view:'adminDashboard', adminTab:'sections'});
}

async function deleteSection(key){
  if(!confirm('سيتم حذف القسم وكل العناصر بداخله. هل أنت متأكد؟')) return;
  const items = CUSTOM_ITEMS[key] || [];
  for(const it of items){ await fbDeleteItem(it.id); delete photoCache['item:'+key+':'+it.id]; }
  CUSTOM_SECTIONS = CUSTOM_SECTIONS.filter(s => s.key !== key);
  delete CUSTOM_ITEMS[key];
  await fbDeleteSection(key);
  showToast('تم حذف القسم');
  render();
}

/* ===================== ADMIN: SECTION ITEMS ===================== */

function adminItemRow(sectionKey, it){
  return `<div class="card">
    ${it.hasPhoto && photoCache['item:'+sectionKey+':'+it.id] ? `<img src="${photoCache['item:'+sectionKey+':'+it.id]}" class="item-photo">` : ''}
    <div class="name-strong">${esc(it.title)}</div>
    ${it.note ? `<div class="addr-line"><i class="fa-solid fa-calendar"></i> ${esc(it.note)}</div>` : ''}
    ${it.description ? `<p class="bio-text" style="margin-top:6px;">${esc(it.description)}</p>` : ''}
    ${it.phone ? `<div class="addr-line" style="direction:ltr;display:inline-block;"><i class="fa-solid fa-phone"></i> ${esc(it.phoneDisplay||it.phone)}</div>` : ''}
    <div class="btn-row">
      <button type="button" class="btn btn-edit" data-action="adminEditItem" data-section="${sectionKey}" data-id="${it.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
      <button type="button" class="btn btn-delete" data-action="adminDeleteItem" data-section="${sectionKey}" data-id="${it.id}"><i class="fa-solid fa-trash"></i> حذف</button>
    </div>
  </div>`;
}

function renderAdminSectionItems(sectionKey){
  const s = CUSTOM_SECTIONS.find(x => x.key === sectionKey);
  const items = CUSTOM_ITEMS[sectionKey] || [];
  const rows = items.length ? items.map(it => adminItemRow(sectionKey, it)).join('') : `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>لا توجد عناصر بعد</p></div>`;
  return pageHeaderAdmin(s ? s.label : 'العناصر') + `
  <div class="section-block">
    <button type="button" class="btn-submit" style="margin-bottom:14px;" data-action="adminAddItem" data-section="${sectionKey}"><i class="fa-solid fa-plus"></i> إضافة عنصر جديد</button>
    ${rows}
  </div>`;
}

function renderAdminItemForm(sectionKey, editId){
  const editing = !!editId;
  const it = editing ? (CUSTOM_ITEMS[sectionKey]||[]).find(x => x.id === editId) : null;
  const photoExisting = editing && photoCache['item:'+sectionKey+':'+editId];
  return pageHeaderAdmin(editing ? 'تعديل العنصر' : 'إضافة عنصر جديد') + `
  <div class="section-block">
    <form id="itemForm" data-section="${sectionKey}" data-edit-id="${editing ? editId : ''}">
      <div class="form-group"><label>العنوان *</label><input name="title" type="text" value="${it ? esc(it.title) : ''}" required></div>
      <div class="form-group"><label>الوصف / التفاصيل</label><textarea name="description" rows="3">${it ? esc(it.description||'') : ''}</textarea></div>
      <div class="form-group"><label>تاريخ أو ملاحظة</label><input name="note" type="text" value="${it ? esc(it.note||'') : ''}" placeholder="مثال: العزاء يوم الجمعة بمسجد..."></div>
      <div class="form-group"><label>رقم الهاتف (اختياري، دولي بدون +)</label><input name="phone" type="tel" value="${it ? esc(it.phone||'') : ''}" placeholder="201xxxxxxxxx"></div>
      <div class="form-group">
        <label>صورة (اختياري)</label>
        <img id="itemPhotoPreview" class="photo-preview" style="display:${photoExisting?'block':'none'};" src="${photoExisting ? photoCache['item:'+sectionKey+':'+editId] : ''}">
        <input type="file" id="itemPhotoInput" accept="image/*" onchange="previewPhoto(this,'itemPhotoPreview')">
      </div>
      ${locationPickerHtml(it ? it.lat : null, it ? it.lng : null)}
      <button type="submit" class="btn-submit"><i class="fa-solid fa-floppy-disk"></i> ${editing ? 'حفظ التعديلات' : 'إضافة العنصر'}</button>
    </form>
  </div>`;
}

async function submitItemForm(form){
  const sectionKey = form.dataset.section;
  const fd = new FormData(form);
  const title = (fd.get('title')||'').trim();
  if(!title){ showToast('من فضلك اكتب العنوان'); return; }
  const description = (fd.get('description')||'').trim();
  const note = (fd.get('note')||'').trim();
  const phone = (fd.get('phone')||'').trim().replace(/[^0-9]/g,'');
  const editId = form.dataset.editId || null;
  const id = editId || ('it_' + Date.now());
  const lat = parseFloat(fd.get('lat')); const lng = parseFloat(fd.get('lng'));

  const photoInput = form.querySelector('#itemPhotoInput');
  let photo = editId ? (photoCache['item:'+sectionKey+':'+editId] || null) : null;
  if(photoInput && photoInput.files && photoInput.files[0]){
    try{
      const dataUrl = await resizeImageFile(photoInput.files[0]);
      photoCache['item:'+sectionKey+':'+id] = dataUrl;
      photo = dataUrl;
    }catch(err){ showToast('تعذر معالجة الصورة، تم الحفظ بدونها'); }
  }
  const hasPhoto = !!photo;
  const itemObj = {id, title, description, note, phone, phoneDisplay:phone, hasPhoto, photo, lat: isNaN(lat)?null:lat, lng: isNaN(lng)?null:lng};
  if(!CUSTOM_ITEMS[sectionKey]) CUSTOM_ITEMS[sectionKey] = [];
  if(editId){
    const idx = CUSTOM_ITEMS[sectionKey].findIndex(x => x.id === editId);
    if(idx > -1) CUSTOM_ITEMS[sectionKey][idx] = itemObj; else CUSTOM_ITEMS[sectionKey].push(itemObj);
  } else {
    CUSTOM_ITEMS[sectionKey].push(itemObj);
  }
  await fbSaveItem(sectionKey, itemObj);
  showToast(editId ? 'تم تحديث العنصر ✅' : 'تم إضافة العنصر بنجاح ✅');
  returnAfterSave({view:'adminSectionItems', sectionKey});
}

async function deleteItem(sectionKey, id){
  if(!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
  CUSTOM_ITEMS[sectionKey] = (CUSTOM_ITEMS[sectionKey]||[]).filter(x => x.id !== id);
  delete photoCache['item:'+sectionKey+':'+id];
  await fbDeleteItem(id);
  showToast('تم حذف العنصر');
  render();
}

/* ===================== MAIN RENDER DISPATCH ===================== */

/* ===================== MAIN RENDER (لوحة الإدارة) ===================== */
function render(){
  const app = document.getElementById('app');
  let html = '';
  switch(current.view){
    case 'adminDashboard': html = renderAdminDashboard(); break;
    case 'adminDoctorForm': html = renderAdminDoctorForm(current.editId); break;
    case 'adminSectionForm': html = renderAdminSectionForm(current.editKey); break;
    case 'adminSectionItems': html = renderAdminSectionItems(current.sectionKey); break;
    case 'adminItemForm': html = renderAdminItemForm(current.sectionKey, current.editId); break;
    case 'adminCategoryList': html = renderAdminCategoryList(current.catKey); break;
    case 'adminCategoryItemForm': html = renderAdminCategoryItemForm(current.catKey, current.editId); break;
    default: html = renderAdminDashboard();
  }
  app.innerHTML = html;
  if(current.view === 'adminDoctorForm' || current.view === 'adminCategoryItemForm' || current.view === 'adminItemForm'){
    setTimeout(initLocationPicker, 60);
  }
}

/* ===================== EVENT HANDLING (لوحة الإدارة) ===================== */
function handleGlobalClick(e){
  try{
    const backEl = e.target.closest('[data-action="back"]');
    if(backEl){ goBack(); return; }

    const adminExitEl = e.target.closest('[data-action="adminExit"]');
    if(adminExitEl){
      firebase.auth().signOut();
      return;
    }

    const adminTabEl = e.target.closest('[data-action="adminTab"]');
    if(adminTabEl){ current.adminTab = adminTabEl.dataset.tab; render(); return; }

    const addDocEl = e.target.closest('[data-action="adminAddDoctor"]');
    if(addDocEl){ navigate({view:'adminDoctorForm', editId:null}); return; }

    const editDocEl = e.target.closest('[data-action="adminEditDoctor"]');
    if(editDocEl){ navigate({view:'adminDoctorForm', editId:editDocEl.dataset.id}); return; }

    const delDocEl = e.target.closest('[data-action="adminDeleteDoctor"]');
    if(delDocEl){ deleteDoctor(delDocEl.dataset.id); return; }

    const addSecEl = e.target.closest('[data-action="adminAddSection"]');
    if(addSecEl){ navigate({view:'adminSectionForm', editKey:null}); return; }

    const openSecEl = e.target.closest('[data-action="adminOpenSection"]');
    if(openSecEl){ navigate({view:'adminSectionItems', sectionKey:openSecEl.dataset.key}); return; }

    const delSecEl = e.target.closest('[data-action="adminDeleteSection"]');
    if(delSecEl){ deleteSection(delSecEl.dataset.key); return; }

    const addItemEl = e.target.closest('[data-action="adminAddItem"]');
    if(addItemEl){ navigate({view:'adminItemForm', sectionKey:addItemEl.dataset.section, editId:null}); return; }

    const editItemEl = e.target.closest('[data-action="adminEditItem"]');
    if(editItemEl){ navigate({view:'adminItemForm', sectionKey:editItemEl.dataset.section, editId:editItemEl.dataset.id}); return; }

    const delItemEl = e.target.closest('[data-action="adminDeleteItem"]');
    if(delItemEl){ deleteItem(delItemEl.dataset.section, delItemEl.dataset.id); return; }

    const openFixedCatEl = e.target.closest('[data-action="adminOpenFixedCat"]');
    if(openFixedCatEl){ navigate({view:'adminCategoryList', catKey:openFixedCatEl.dataset.cat}); return; }

    const addFixedItemEl = e.target.closest('[data-action="adminAddFixedItem"]');
    if(addFixedItemEl){ navigate({view:'adminCategoryItemForm', catKey:addFixedItemEl.dataset.cat, editId:null}); return; }

    const editFixedItemEl = e.target.closest('[data-action="adminEditFixedItem"]');
    if(editFixedItemEl){ navigate({view:'adminCategoryItemForm', catKey:editFixedItemEl.dataset.cat, editId:editFixedItemEl.dataset.id}); return; }

    const delFixedItemEl = e.target.closest('[data-action="adminDeleteFixedItem"]');
    if(delFixedItemEl){ deleteFixedItem(delFixedItemEl.dataset.cat, delFixedItemEl.dataset.id); return; }
  }catch(err){
    console.error('[رحمانية-إدارة] خطأ في معالجة الضغط:', err);
    showToast('حدث خطأ غير متوقع، حاول مرة أخرى');
  }
}

function handleGlobalSubmit(e){
  try{
    if(e.target.id === 'doctorForm'){ e.preventDefault(); submitDoctorForm(e.target); }
    else if(e.target.id === 'sectionForm'){ e.preventDefault(); submitSectionForm(e.target); }
    else if(e.target.id === 'itemForm'){ e.preventDefault(); submitItemForm(e.target); }
    else if(e.target.id === 'catItemForm'){ e.preventDefault(); submitCatItemForm(e.target); }
  }catch(err){
    console.error('[رحمانية-إدارة] خطأ في معالجة الإرسال:', err);
    showToast('حدث خطأ غير متوقع، حاول مرة أخرى');
  }
}

function setupEventListeners(){
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('submit', handleGlobalSubmit);
}

/* ===================== تسجيل الدخول الحقيقي (Firebase Authentication) =====================
   لازم تكون مفعّلة من Firebase Console:
   Authentication → Sign-in method → فعّل "Email/Password"
   وبعدين من تبويب Users → Add user → حط إيميل وكلمة سر للأدمن بتاعك.
   كلمة السر دلوقتي محفوظة بأمان في سيرفرات Firebase، مش في الكود خالص. */
function showLoginScreen(){
  const ls = document.getElementById('loginScreen');
  const aa = document.getElementById('adminApp');
  if(ls) ls.style.display = 'flex';
  if(aa) aa.style.display = 'none';
}
function showAdminApp(){
  const ls = document.getElementById('loginScreen');
  const aa = document.getElementById('adminApp');
  if(ls) ls.style.display = 'none';
  if(aa) aa.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  const loginForm = document.getElementById('adminLoginForm');
  if(loginForm){
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmailInput').value.trim();
      const pwd = document.getElementById('adminPasswordInput').value;
      const errEl = document.getElementById('adminLoginError');
      const btn = loginForm.querySelector('button[type=submit]');
      if(errEl) errEl.style.display = 'none';
      if(!firebaseAvailable || !firebase.auth){
        if(errEl){ errEl.textContent = 'تسجيل الدخول غير متاح حاليًا — تأكد من إعداد Firebase أولًا.'; errEl.style.display = 'block'; }
        return;
      }
      if(btn) btn.disabled = true;
      try{
        await firebase.auth().signInWithEmailAndPassword(email, pwd);
        /* onAuthStateChanged تحت هيتولى عرض اللوحة تلقائيًا */
      }catch(err){
        if(errEl){ errEl.textContent = 'بيانات الدخول غير صحيحة'; errEl.style.display = 'block'; }
      }finally{
        if(btn) btn.disabled = false;
      }
    });
  }

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => { if(firebaseAvailable && firebase.auth) firebase.auth().signOut(); });
  }

  if(firebaseAvailable && firebase.auth){
    firebase.auth().onAuthStateChanged((user) => {
      if(user){
        showAdminApp();
        const appEl = document.getElementById('app');
        if(appEl) appEl.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner"></i><span>جاري تحميل البيانات...</span></div>';
        loadAllData().then(() => {
          current = {view:'adminDashboard', adminTab:'doctors'};
          stack = [];
          render();
        }).catch(err => { console.error('[رحمانية-إدارة] خطأ في تحميل البيانات:', err); render(); });
      } else {
        showLoginScreen();
      }
    });
  } else {
    /* Firebase لسه مش متوصّل: اعرض رسالة بدل شاشة الدخول العادية */
    const ls = document.getElementById('loginScreen');
    if(ls){
      ls.innerHTML = `<div class="login-box">
        <div class="brandmark"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <h2>Firebase غير متصل</h2>
        <p>من فضلك أضف بيانات الاتصال في ملف <b>firebase/firebase-config.js</b> أولًا، وفعّل Email/Password Authentication من Firebase Console، ثم أنشئ حساب أدمن.</p>
      </div>`;
    }
  }
});
