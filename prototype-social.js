function enrichFriendExamples() {
  const kyoto = state.trips.find(t => t.id === 'kyoto' && !t.own);
  if (!kyoto || kyoto.exampleVersion === 1) return;
  kyoto.exampleVersion = 1;
  kyoto.story = 'Five slow days in Kyoto: early walks, riverside coffee, and getting pleasantly lost. Here’s the route I’d share with a friend.';
  kyoto.stops = [
    { name: 'Wander through Arashiyama', day: 1, time: '08:00', note: 'Start with the bamboo paths, then take the slower walk along the river.' },
    { name: 'Coffee beside the Kamo River', day: 1, time: '15:00', note: 'A quiet afternoon with coffee and a notebook.' },
    { name: 'An evening in Gion', day: 2, time: '17:00', note: 'Explore the public streets, then stop for dinner.' },
    { name: 'Fushimi Inari morning walk', day: 2, time: '08:00', note: 'Leave time to wander beyond the first stretch of gates.' },
    { name: 'Nishiki Market lunch', day: 3, time: '12:00', note: 'Try a few small dishes and browse the nearby shops.' },
    { name: 'Pottery shops around Higashiyama', day: 3, time: '15:00', note: 'My favourite afternoon for picking up a small keepsake.' },
    { name: 'Philosopher’s Path', day: 4, time: '09:00', note: 'A gentle walk and an unhurried lunch.' },
    { name: 'A garden and a tea break', day: 4, time: '14:00', note: 'Keep the afternoon flexible.' },
    { name: 'One last riverside breakfast', day: 5, time: '09:00', note: 'Revisit a favourite spot before packing.' },
    { name: 'Head to Kyoto Station', day: 5, time: '13:00', note: 'Leave a buffer for the onward journey.' }
  ].map(s => ({ ...s, done: false }));
  persist();
}
function simpleTripTabs() {
  return `<div class="trip-tabs" role="tablist" aria-label="Trip details">${[['itinerary','Itinerary'],['photos','Photos']].map(([id,label])=>`<button role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${tripTab===id}" tabindex="${tripTab===id?0:-1}" data-trip-tab="${id}">${label}</button>`).join('')}</div>`;
}
function genericDetail(t) {
  const dayNumbers = [...new Set(t.stops.map(s=>s.day || 1))].sort((a,b)=>a-b);
  $('#app').innerHTML = `<div class="intro"><a class="muted" href="#${t.own?'trips':'feed'}">← ${t.own?'My trips':'Friends feed'}</a></div><section class="hero detail-hero"><img src="${photo(photos[t.image]||photos.mountain,1600)}" alt="${escapeHTML(t.place)}"><div><span class="kicker">${escapeHTML(t.place)} · ${t.days} DAYS</span><h2>${escapeHTML(t.title)}</h2><p>By ${escapeHTML(t.author)}${t.own?'':' · Example friend trip'}</p></div></section><div class="trip-facts"><span>${t.stops.length} itinerary stops</span><span>${escapeHTML(t.status)}</span><span>${t.own?'Your own trip':'Sample itinerary and illustrative photos'}</span></div>${t.story?`<p class="trip-story">“${escapeHTML(t.story)}”</p>`:''}${simpleTripTabs()}<div class="detail-layout imported-layout"><section id="panel-${tripTab}" role="tabpanel" aria-labelledby="tab-${tripTab}">${tripTab==='photos'?photoPanel(t):dayNumbers.map(day=>`<section class="itinerary-day"><h2>Day ${day}</h2>${t.stops.map((s,i)=>({s,i})).filter(({s})=>(s.day||1)===day).sort((a,b)=>(a.s.time||'').localeCompare(b.s.time||'')).map(({s,i})=>`<div class="stop dated-stop ${s.done?'done':''}">${t.own?`<input type="checkbox" aria-label="Mark ${escapeHTML(s.name)} complete" data-stop="${i}" data-trip="${t.id}" ${s.done?'checked':''}>`:''}<div class="stop-content">${s.time?`<small class="stop-time">${escapeHTML(s.time)}</small>`:''}<strong>${escapeHTML(s.name)}</strong>${s.note?`<p>${escapeHTML(s.note)}</p>`:''}</div>${t.own?`<button data-remove="${i}" data-trip="${t.id}" aria-label="Remove ${escapeHTML(s.name)}">Remove</button>`:''}</div>`).join('')}</section>`).join('')}${tripTab==='itinerary'&&t.own?`<form id="add-stop" data-trip="${t.id}" class="dated-add"><h3>Add a stop</h3><label>Day<input name="day" type="number" min="1" max="${t.days}" value="1" required></label><label>Time (optional)<input name="time" type="time"></label><label class="full-width">Place or activity<input name="stop" required maxlength="120"></label><button class="primary">Add stop</button></form>`:''}</section><div><div class="rail-box"><span class="kicker">${t.own?'YOUR MEMORIES':'INSPIRED BY THIS TRIP?'}</span><h3>${t.own?'Give your trip a photo album.':'Make the route your own.'}</h3><p>${t.own?'Add photos from your phone or computer in the Photos tab.':'Copy this itinerary, then change the stops to suit your trip. Your edits won’t change your friend’s version.'}</p>${t.own?`<button class="primary" data-trip-tab="photos">Upload photos +</button><label class="status-label">Trip status<select id="status" data-trip="${t.id}">${['Draft','Planned','Ongoing','Completed'].map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select></label>`:`<button class="primary" data-copy="${t.id}">Copy itinerary +</button><p>Sample friend content for trying the prototype.</p>`}</div></div></div>`;
}
