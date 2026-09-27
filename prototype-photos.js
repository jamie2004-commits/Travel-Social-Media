let photoDatabase;
let photoObjectURLs = [];
let photoViewSerial = 0;
const busyPhotoTrips = new Set();
function openPhotoDatabase() {
  if (!photoDatabase) photoDatabase = new Promise((resolve,reject)=>{
    if (!globalThis.indexedDB) return reject(new Error('Photo storage is unavailable in this browser.'));
    const request = indexedDB.open('roam-photos-v1',1);
    request.onupgradeneeded = () => request.result.createObjectStore('photos',{keyPath:'id'}).createIndex('tripId','tripId');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not open photo storage.'));
    request.onblocked = () => reject(new Error('Close other prototype tabs and try again.'));
  }).catch(error=>{photoDatabase=undefined;throw error});
  return photoDatabase;
}
async function photoTransaction(mode, operation) {
  const db = await openPhotoDatabase();
  return new Promise((resolve,reject)=>{
    const transaction = db.transaction('photos',mode);
    const request = operation(transaction.objectStore('photos'));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = transaction.onabort = () => reject(new Error('Could not save photos. Browser storage may be full or unavailable.'));
  });
}
function photoPanel(t) {
  if (!t.own) return `<h2>Little moments along the way</h2><p class="muted">Illustrative destination photo for this sample friend trip.</p><div class="photo-grid"><figure><img src="${photo(photos[t.image]||photos.mountain)}" alt="Illustrative view of ${escapeHTML(t.place)}"><figcaption>${escapeHTML(t.place)} · Sample photo</figcaption></figure></div>`;
  return `<div class="section-head"><h2>Your trip in pictures</h2><label class="upload-button">+ Upload photos<input type="file" data-photo-upload="${t.id}" accept="image/jpeg,image/png,image/webp" multiple ${busyPhotoTrips.has(t.id)?'disabled':''}></label></div><p class="muted">Choose JPEG, PNG, or WebP photos, up to 15 MB each. Resized copies save only in this browser—not online or backed up. Keep your originals.</p><p id="photo-feedback" role="status"></p><div id="photo-gallery" data-photo-gallery="${t.id}" class="photo-grid"><p class="muted">Loading your photos…</p></div>`;
}
async function mountPhotoGallery() {
  const serial = ++photoViewSerial;
  photoObjectURLs.forEach(url=>URL.revokeObjectURL(url));
  photoObjectURLs = [];
  const gallery = document.querySelector('[data-photo-gallery]');
  if (!gallery?.dataset?.photoGallery) return;
  try {
    const records = await photoTransaction('readonly',store=>store.index('tripId').getAll(gallery.dataset.photoGallery));
    if (serial !== photoViewSerial || !gallery.isConnected) return;
    records.sort((a,b)=>a.created-b.created);
    gallery.innerHTML = records.length ? records.map(record=>{
      const url = URL.createObjectURL(record.blob); photoObjectURLs.push(url);
      return `<figure><img src="${url}" alt="${escapeHTML(record.caption||record.name)}"><figcaption><form data-photo-caption="${record.id}" data-trip="${record.tripId}"><label>Caption<input name="caption" maxlength="180" value="${escapeHTML(record.caption)}" placeholder="A moment to remember…"></label><button>Save caption</button><button type="button" data-photo-delete="${record.id}" data-trip="${record.tripId}">Remove photo</button></form></figcaption></figure>`;
    }).join('') : '<div class="empty"><h3>Your first memory goes here.</h3><p class="muted">Use Upload photos above to start your album.</p></div>';
  } catch(error) { if(serial===photoViewSerial) gallery.textContent=error.message; }
}
async function preparePhoto(file) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose JPEG, PNG, or WebP. Export HEIC photos as JPEG first.');
  if (file.size > 15*1024*1024) throw new Error('This photo exceeds 15 MB. Choose a smaller file.');
  const bitmap = await createImageBitmap(file).catch(()=>{throw new Error('This file could not be read as an image.')});
  try {
    const scale = Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not prepare this photo.')),'image/jpeg',.85));
  } finally { bitmap.close(); }
}
document.addEventListener('change',async e=>{
  const tripId=e.target.dataset.photoUpload;
  if(!tripId||!state.trips.some(t=>t.id===tripId&&t.own)||busyPhotoTrips.has(tripId))return;
  const files=[...e.target.files];if(!files.length)return;
  busyPhotoTrips.add(tripId);e.target.disabled=true;
  let saved=0;const errors=[];
  for(const [index,file] of files.entries()){
    const feedback=document.querySelector('#photo-feedback');
    if(feedback&&location.hash===`#trip/${tripId}`)feedback.textContent=`Saving photo ${index+1} of ${files.length}…`;
    try{const blob=await preparePhoto(file);await photoTransaction('readwrite',store=>store.put({id:newTripId(),tripId,blob,name:file.name,caption:'',created:Date.now()}));saved++}catch(error){errors.push(`${file.name}: ${error.message}`)}
  }
  busyPhotoTrips.delete(tripId);e.target.disabled=false;e.target.value='';
  const currentInput=document.querySelector('[data-photo-upload]');
  if(currentInput?.dataset.photoUpload===tripId)currentInput.disabled=false;
  if(location.hash===`#trip/${tripId}`&&tripTab==='photos'){
    await mountPhotoGallery();
    const feedback=document.querySelector('#photo-feedback');if(feedback)feedback.textContent=`${saved} photo${saved===1?'':'s'} saved in this browser.${errors.length?' '+errors.join(' '):''}`;
  }
  notify(`${saved} photo${saved===1?'':'s'} saved locally${errors.length?`; ${errors.length} could not be saved`:''}`);
});
document.addEventListener('submit',async e=>{
  const id=e.target.dataset.photoCaption;if(!id)return;e.preventDefault();
  try{
    const record=await photoTransaction('readonly',store=>store.get(id));
    if(!record||!state.trips.some(t=>t.id===record.tripId&&t.own))return;
    record.caption=e.target.elements.caption.value.trim().slice(0,180);
    await photoTransaction('readwrite',store=>store.put(record));notify('Caption saved');await mountPhotoGallery();
  }catch(error){notify(error.message)}
});
document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-photo-delete]');if(!button)return;
  try{
    const record=await photoTransaction('readonly',store=>store.get(button.dataset.photoDelete));
    if(!record||!state.trips.some(t=>t.id===record.tripId&&t.own))return;
    await photoTransaction('readwrite',store=>store.delete(record.id));await mountPhotoGallery();notify('Photo removed from this browser');
  }catch(error){notify(error.message)}
});
