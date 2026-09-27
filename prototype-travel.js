let selectedTripDay = 'all';
let offlineMessage = 'Saved on this device · connection needed to sign in or reopen';
function chinaDate() { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
function tripDayControls(t) {
  return `<div class="day-picker"><button data-day="all" class="${selectedTripDay==='all'?'active':''}">All days</button><button data-today>Today</button>${t.schedule.map(d=>`<button data-day="${d.day}" class="${selectedTripDay===String(d.day)?'active':''}">Day ${d.day}<small>${d.date.slice(5)}</small></button>`).join('')}</div>`;
}
function travelTools() {
  return `<section class="travel-tools"><div><strong>Your trip, ready to take along</strong><p id="offline-status" role="status">${escapeHTML(offlineMessage)}</p></div><a href="#travel">Storage & backups →</a></section>`;
}
function travelSettings() {
  $('#app').innerHTML = intro('Ready for the journey.','Keep your plans and memories together, with backups you can take to another device.')+`<section class="trip-info"><h2>Access on this device</h2><p id="offline-status" role="status">${escapeHTML(offlineMessage)}</p><p>Sign in with your Roam prototype username and password. You need a connection to sign in or reopen the app. An already-open trip can still save local edits during a temporary connection loss. Download backups regularly.</p><p>On a phone, open the hosted HTTPS link in Safari or Chrome and use Add to Home Screen. A local computer address does not work away from that computer.</p></section><section class="trip-info"><h2>Back up your trip</h2><p>Download your personal trips, notes, spending, visited countries, and saved photo copies in one backup file. Save it to Files or your preferred drive after each travel day.</p><button class="primary" id="export-backup">Download backup</button><p id="backup-feedback" role="status"></p><h3>Restore on this or another device</h3><p>A backup restores trips as new copies, preserving your current trips. Countries are added to your visited map. There is no automatic sync between devices.</p><label class="upload-button">Choose backup<input id="import-backup" type="file" accept="application/json,.json"></label><p>Backups contain your itinerary and photos. Keep the file somewhere private. Original full-size photos are not included.</p></section><section class="trip-info"><h2>Before you leave</h2><ol><li>Open your Hangzhou / Shanghai trip and add one test photo.</li><li>Download a backup and keep it outside the browser.</li><li>Keep the app connected when opening it. Use a downloaded backup to transfer your trip to another device.</li></ol></section>`;
}
function expenseForm(t) {
  return `<form id="add-expense" data-trip="${t.id}" class="dated-add"><h3>Add spending</h3><label>Date<input name="date" type="date" value="${chinaDate()}" required></label><label>Amount paid<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required></label><label>Currency<select name="currency"><option>CNY</option><option>SGD</option></select></label><label>CNY per S$1<input name="rate" type="number" min="0.01" max="1000" step="0.01" value="5.20" required></label><label class="full-width">What was it for?<input name="name" maxlength="120" required placeholder="Dinner, taxi, coffee…"></label><button class="primary">Save expense</button><p class="muted full-width">The exchange rate is yours to enter, not a live rate.</p></form>`;
}
function saveTravelState(next) {
  try { localStorage.setItem('roam-prototype-v1',JSON.stringify(next));state=next;return true; }
  catch { notify('Could not save. Storage is full or unavailable. Download a backup before closing.');return false; }
}
function openStopEditor(t,index) {
  const stop=t.stops[index];if(!stop)return;
  const modal=$('#modal');
  modal.innerHTML=`<form id="edit-stop" data-trip="${t.id}" data-index="${index}"><h2>Edit your stop</h2><label>Place or activity<input name="name" maxlength="120" value="${escapeHTML(stop.name)}" required></label><label>Day<select name="day">${t.schedule.map(d=>`<option value="${d.day}" ${d.day===stop.day?'selected':''}>Day ${d.day} · ${d.date}</option>`).join('')}</select></label><label>Time<input name="time" type="time" value="${/^\d{2}:\d{2}$/.test(stop.time||'')?stop.time:''}"></label><label>Notes<textarea name="notes" rows="5" maxlength="3000">${escapeHTML((stop.notes||[]).join('\n'))}</textarea></label><div class="dialog-actions"><button type="button" data-close-modal>Cancel</button><button class="primary">Save changes</button></div></form>`;
  modal.showModal();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if('closeModal'in b.dataset)$('#modal').close();
  if('day'in b.dataset){selectedTripDay=b.dataset.day;render();}
  if('today'in b.dataset){const t=state.trips.find(t=>location.hash===`#trip/${t.id}`);const day=t?.schedule?.find(d=>d.date===chinaDate());if(day){selectedTripDay=String(day.day);render()}else notify('Today is outside these trip dates. Choose a day below.');}
  if('editStop'in b.dataset){const t=state.trips.find(t=>t.id===b.dataset.trip&&t.own);if(t)openStopEditor(t,Number(b.dataset.editStop));}
  if('deleteExpense'in b.dataset){const next=structuredClone(state),t=next.trips.find(t=>t.id===b.dataset.trip&&t.own);if(t){t.expenses.splice(Number(b.dataset.deleteExpense),1);if(saveTravelState(next))render();}}
});
document.addEventListener('submit',e=>{
  if(!['edit-stop','add-expense','trip-journal'].includes(e.target.id))return;e.preventDefault();
  const next=structuredClone(state),t=next.trips.find(t=>t.id===e.target.dataset.trip&&t.own);if(!t)return;
  const f=new FormData(e.target);
  if(e.target.id==='edit-stop'){
    if(!String(f.get('name')).trim())return;
    Object.assign(t.stops[Number(e.target.dataset.index)],{name:String(f.get('name')).trim(),day:Number(f.get('day')),time:String(f.get('time')),notes:String(f.get('notes')).split('\n').filter(Boolean)});
  }
  if(e.target.id==='trip-journal')t.journal=String(f.get('journal')).slice(0,10000);
  if(e.target.id==='add-expense'){
    const amount=Number(f.get('amount')),rate=Number(f.get('rate'));if(!(amount>0&&rate>0)||!String(f.get('name')).trim())return;
    t.expenses.push({date:String(f.get('date')),name:String(f.get('name')).trim(),category:'Added during trip',paid:(f.get('currency')==='CNY'?'¥':'S$')+amount.toFixed(2),sgd:Math.round((f.get('currency')==='CNY'?amount/rate:amount)*100)/100});
  }
  if(saveTravelState(next)){if(e.target.id==='edit-stop')$('#modal').close();render();notify('Saved in this browser');}
});
function updateOfflineMessage(message) {
  offlineMessage=message;
  document.querySelectorAll('#offline-status').forEach(el=>el.textContent=message);
}
async function setupOffline() {
  updateOfflineMessage('Saved on this device · connection needed to sign in or reopen');
  if('serviceWorker' in navigator){
    try{for(const registration of await navigator.serviceWorker.getRegistrations())await registration.unregister();}catch{}
  }
  if('caches' in window){try{for(const key of await caches.keys())if(key.startsWith('roam-'))await caches.delete(key);}catch{}}
}
