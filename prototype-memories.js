// Photo records remain in the existing IndexedDB store, including older uploads.
const planningDetail = detail;
const collectionPage = renderPage;
const albumMount = mountPhotoGallery;
let planningTrip = null;
let memorySerial = 0;
// A post is dated by the time the user chose, or otherwise by when it was posted (like Instagram).
function localStamp(ms) {
  const d=new Date(Number(ms)||0),pad=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function memoryStamp(p){return p.visitedAt||localStamp(p.created);}
function orderedMemories(records, newest = false) {
  return [...records].sort((a,b)=>{
    const order=memoryStamp(a).localeCompare(memoryStamp(b)) || a.created-b.created || a.id.localeCompare(b.id);
    return newest ? -order : order;
  });
}
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function prettyDate(y,m,d){return `${Number(d)} ${MONTHS[Number(m)-1]} ${y}`;}
function memoryTime(p) {
  if(!p||(!p.visitedAt&&!p.created))return '';
  if(p.visitedAt){const [date,time]=p.visitedAt.split('T');const [y,m,d]=date.split('-');return `${prettyDate(y,m,d)} · ${time}`;}
  const mins=Math.floor((Date.now()-p.created)/60000);
  if(mins<1)return 'Just now';
  if(mins<60)return `${mins}m ago`;
  if(mins<1440)return `${Math.floor(mins/60)}h ago`;
  if(mins<10080)return `${Math.floor(mins/1440)}d ago`;
  const [date]=localStamp(p.created).split('T');const [y,m,d]=date.split('-');return prettyDate(y,m,d);
}
function memoryPost(p,t,url,sample=false) {
  return `<article class="memory-post"><div class="memory-author"><span class="avatar">${escapeHTML(t.author.split(' ').map(n=>n[0]).join(''))}</span><div><strong>${escapeHTML(t.author)}</strong><small>${escapeHTML(p.place||t.place)}${sample?' · Example post':''}</small></div>${!sample?`<button class="memory-edit" data-edit-memory="${escapeHTML(p.id)}" aria-label="Edit memory">Edit</button>`:''}</div><img class="memory-image" src="${url}" alt="${escapeHTML(p.caption||p.place||t.place)}" loading="lazy"><div class="memory-body"><a class="memory-trip" href="#trip/${t.id}">${escapeHTML(t.title)} ↗</a><p>${escapeHTML(p.caption||'A little moment worth keeping.')}</p>${memoryTime(p)?`<time>${escapeHTML(memoryTime(p))}</time>`:''}${sample?'<span class="sample-label">Illustrative photo · Sample story</span>':''}</div></article>`;
}
function sampleMemories(t) {
  return memoryPost({place:t.place,caption:t.story||'Slow mornings, new places, and a few favourite moments.',visitedAt:''},t,photo(photos[t.image]||photos.mountain),true);
}
function memoryComposerLink(t) {
  return `<button class="memory-compose" data-compose-memory="${t?.id||''}"><span class="avatar">JL</span><span>Where have you been?<small>Add a photo, a place, and a little story.</small></span><b>＋</b></button>`;
}
renderPage = function() {
  const route=location.hash.slice(1)||'feed';
  if(route!=='feed')return collectionPage();
  nav();$('#breadcrumb').textContent='Little moments. Places worth remembering.';
  $('#app').innerHTML=`<div class="social-heading"><div><span class="kicker">YOUR TRAVEL CIRCLE</span><h1>Out there, together.</h1><p class="muted">Places, photos, and the stories between.</p></div></div><div class="social-layout"><section class="memory-stream">${memoryComposerLink()}<div class="memory-section-label">RECENT MEMORIES <span>Newest first</span></div><div data-memory-stream="all" aria-live="polite"><p class="muted">Loading memories…</p></div><div class="memory-section-label">FROM YOUR CIRCLE <span>Example stories</span></div>${state.trips.filter(t=>!t.own).map(sampleMemories).join('')}</section><section class="memory-side"><span class="kicker">YOUR STORIES</span><h2>A trip, told your way.</h2><p class="muted">Keep the moments in order. Start with the photo you keep coming back to.</p>${state.trips.filter(t=>t.own).map(t=>`<a class="story-link" href="#trip/${t.id}"><span>↗</span><div><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.place)}</small></div></a>`).join('')}<button data-create>+ New trip story</button><p class="storage-note">Your posts save on this device. <a href="#travel">Back up your memories ↗</a></p></section></div>`;
};
detail = function(id) {
  const t=state.trips.find(t=>t.id===id);
  if(!t)return planningDetail(id);
  if(planningTrip===id){planningDetail(id);$('#app').insertAdjacentHTML('afterbegin',`<button class="back-story" data-story-view="${id}">← Back to photo story</button>`);return;}
  $('#breadcrumb').textContent='Your trip, one moment at a time';
  $('#app').innerHTML=`<div class="story-heading"><a class="muted" href="#trips">← Trip stories</a><div class="story-title"><div><span class="kicker">${escapeHTML(t.place)}</span><h1>${escapeHTML(t.title)}</h1><p class="muted">By ${escapeHTML(t.author)} · ${t.own?'Your personal story':'Example friend story'}</p></div><button data-planning-view="${id}">Trip details</button></div></div><section class="story-stream memory-stream">${t.own?memoryComposerLink(t):''}<div class="memory-section-label">THE STORY SO FAR <span>Earliest → latest visit</span></div>${t.own?`<div data-memory-stream="${id}" aria-live="polite"><p class="muted">Loading memories…</p></div>`:sampleMemories(t)}${t.own?'<p class="storage-note">Photos and captions stay on this device. <a href="#travel">Download a backup ↗</a></p>':''}</section>`;
};
mountPhotoGallery = async function() {
  const serial=++memorySerial;
  await albumMount();
  const stream=document.querySelector('[data-memory-stream]');
  if(!stream)return;
  try {
    const all=stream.dataset.memoryStream==='all';
    const records=orderedMemories((await photoTransaction('readonly',s=>s.getAll())).filter(p=>state.trips.some(t=>t.id===p.tripId&&t.own)&&(all||p.tripId===stream.dataset.memoryStream)),all);
    if(serial!==memorySerial||!stream.isConnected)return;
    stream.innerHTML=records.length?records.map(p=>{const url=URL.createObjectURL(p.blob);photoObjectURLs.push(url);return memoryPost(p,state.trips.find(t=>t.id===p.tripId),url)}).join(''):`<div class="memory-empty"><span>↗</span><h2>Your story starts with a moment.</h2><p>Add a photo and a caption.<br>It's dated when you post, or pick your own date.</p><button class="primary" data-compose-memory="${all?'':stream.dataset.memoryStream}">+ Add your first memory</button></div>`;
  }catch(error){if(serial===memorySerial&&stream.isConnected)stream.textContent=error.message;}
};
async function openMemoryComposer(tripId='',record=null) {
  const own=state.trips.filter(t=>t.own);
  if(!own.length){create();return;}
  const d=$('#modal');
  d.innerHTML=`<form id="memory-form" data-record="${record?.id||''}"><span class="kicker">${record?'EDIT YOUR MEMORY':'A MOMENT WORTH KEEPING'}</span><h2>${record?'A little more to the story.':'Where did you go?'}</h2>${record?'':`<label class="memory-file">Add a photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required><small>JPEG, PNG or WebP · up to 15 MB</small></label><img id="memory-preview" alt="Selected photo preview" hidden>`}<label>Trip story<select name="tripId">${own.map(t=>`<option value="${t.id}" ${t.id===(record?.tripId||tripId)?'selected':''}>${escapeHTML(t.title)}</option>`).join('')}</select></label><label>Caption<textarea name="caption" rows="3" required maxlength="180" placeholder="The sunset we stayed a little longer for…">${escapeHTML(record?.caption||'')}</textarea></label><label>Location <small class="optional">optional</small><input name="place" maxlength="200" placeholder="West Lake, Hangzhou" value="${escapeHTML(record?.place||'')}"></label><details class="memory-date" ${record?.visitedAt?'open':''}><summary>Use a different date <small class="optional">optional</small></summary><label>When was this? (local time at the place)<input name="visitedAt" type="datetime-local" value="${escapeHTML(record?.visitedAt||'')}"></label><small>Leave blank and it's dated ${record?'when it was posted':'when you post it'}.</small></details><p class="storage-note">Saved on this device. Other people cannot see this post yet.</p><p id="memory-error" role="alert"></p><div class="dialog-actions">${record?'<button type="button" id="remove-memory">Delete memory</button>':''}<button type="button" data-close-modal>Cancel</button><button class="primary" id="save-memory">${record?'Save changes':'Add memory'}</button></div></form>`;
  d.showModal();
  let preview;
  d.onclose=()=>{if(preview)URL.revokeObjectURL(preview);};
  const input=d.querySelector('[name=photo]');
  if(input)input.onchange=()=>{if(preview)URL.revokeObjectURL(preview);const file=input.files[0];const image=$('#memory-preview');image.hidden=!file;if(file){preview=URL.createObjectURL(file);image.src=preview;}};
  if(record)$('#remove-memory').onclick=async()=>{
    if(!confirm('Delete this memory and its photo from this device?'))return;
    try{await photoTransaction('readwrite',s=>s.delete(record.id));d.close();render();notify('Memory deleted');}catch(error){$('#memory-error').textContent=error.message;}
  };
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if('composeMemory'in b.dataset)openMemoryComposer(b.dataset.composeMemory);
  if('editMemory'in b.dataset){try{const p=await photoTransaction('readonly',s=>s.get(b.dataset.editMemory));if(p&&state.trips.some(t=>t.id===p.tripId&&t.own))openMemoryComposer(p.tripId,p);}catch(error){notify(error.message);}}
  if('planningView'in b.dataset){planningTrip=b.dataset.planningView;tripTab='itinerary';render();}
  if('storyView'in b.dataset){planningTrip=null;render();}
});
document.addEventListener('submit',async e=>{
  if(e.target.id!=='memory-form')return;e.preventDefault();
  const form=e.target,button=$('#save-memory'),data=new FormData(form),tripId=String(data.get('tripId'));
  if(!state.trips.some(t=>t.id===tripId&&t.own))return;
  if(busyPhotoTrips.has(tripId))return;
  button.disabled=true;busyPhotoTrips.add(tripId);
  try{
    const existing=form.dataset.record?await photoTransaction('readonly',s=>s.get(form.dataset.record)):null;
    if(form.dataset.record&&(!existing||!state.trips.some(t=>t.id===existing.tripId&&t.own)))throw new Error('This memory is no longer available.');
    const file=data.get('photo');
    if(!existing&&!(file&&file.size))throw new Error('Add a photo.');
    const caption=String(data.get('caption')||'').trim().slice(0,180),place=String(data.get('place')||'').trim(),visitedAt=String(data.get('visitedAt')||'');
    if(!caption)throw new Error('Add a caption.');
    if(visitedAt&&!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(visitedAt))throw new Error('That date doesn\'t look right. Clear it to use the posting time.');
    const record={...(existing||{id:newTripId(),created:Date.now(),name:file.name,blob:await preparePhoto(file)}),tripId,place,caption};
    if(visitedAt)record.visitedAt=visitedAt;else delete record.visitedAt;
    if(!place)delete record.place;
    await photoTransaction('readwrite',s=>s.put(record));$('#modal').close();planningTrip=null;render();notify('Memory saved on this device');
  }catch(error){$('#memory-error').textContent=error.message;}finally{busyPhotoTrips.delete(tripId);button.disabled=false;}
});
window.addEventListener('hashchange',()=>{planningTrip=null;render();});
const previousCard=card;
card=t=>previousCard(t).replace(/View itinerary/g,'View story').replace(/itinerary stops/g,'places in this trip').replace(/ itinerary"/g,' story"');
$('#new-trip').textContent='+ Add memory';
$('#new-trip').onclick=()=>openMemoryComposer(location.hash.startsWith('#trip/')?location.hash.slice(6):'');
document.querySelector('footer').innerHTML='<a href="#travel">Storage & backups</a> · Photos, places, and the stories between. · Saved on this device';
render();
