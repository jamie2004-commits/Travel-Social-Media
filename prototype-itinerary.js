// Dated personal trips share the existing stop completion and persistence controls.
function tripDates(t) {
  return `${t.departureDate.slice(8)}–${t.endDate.slice(8)} Sep 2026`;
}
function importedOverview(t) {
  return `<section class="upcoming"><div><span class="kicker">YOUR UPCOMING TRIP · ${tripDates(t)}</span><h2>From West Lake to the Bund.</h2><p>杭州 → 上海 · 7 days + departure night · Your own itinerary</p></div><button class="primary" data-open="${t.id}">Open my trip ↗</button></section>`;
}
function itineraryStop(t, s, i) {
  return `<div class="stop dated-stop ${s.done ? 'done' : ''}"><input type="checkbox" aria-label="Mark ${escapeHTML(s.name)} complete" data-stop="${i}" data-trip="${t.id}" ${s.done ? 'checked' : ''}><div class="stop-content"><small class="stop-time">${s.time && s.time !== '·' ? escapeHTML(s.time) : 'Time to decide'}</small><strong>${escapeHTML(s.name)}</strong>${s.transport ? `<p class="transport-note">${escapeHTML(s.transport)}</p>` : ''}${(s.notes || []).map(n => `<p>${escapeHTML(n)}</p>`).join('')}${s.cost ? `<small class="cost-chip">${escapeHTML(s.cost)} · source estimate</small>` : ''}</div><button data-edit-stop="${i}" data-trip="${t.id}">Edit</button><button data-remove="${i}" data-trip="${t.id}" aria-label="Remove ${escapeHTML(s.name)}">Remove</button></div>`;
}
function importedDetail(t) {
  const completed = t.stops.filter(s => s.done).length;
  const total = t.expenses.reduce((sum, e) => sum + e.sgd, 0);
  const money = n => 'S$' + n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  $('#app').innerHTML = `<div class="intro"><a class="muted" href="#trips">← My trips</a></div>
    ${travelTools()}<section class="china-cover"><div><span class="kicker">YOUR ITINERARY · ${tripDates(t)}</span><h1>杭州 / 上海</h1><p>West Lake sunsets, a wedding, and a little Shanghai magic.</p><span class="trip-badge">${escapeHTML(t.status)} · Personal trip</span></div><div class="cover-type" aria-hidden="true">杭州<br><span>上海</span></div></section>
    <div class="trip-facts"><span>7 days + departure night</span><span>2 cities</span><span>${completed}/${t.stops.length} stops complete</span><span>All times UTC+8</span></div>
    <div class="trip-tabs" role="tablist" aria-label="Trip details">${[['itinerary','Day by day'],['transport','Getting there'],['hotels','Stays'],['expenses','Spending'],['photos','Photos']].map(([id,label])=>`<button role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${tripTab === id}" tabindex="${tripTab === id ? 0 : -1}" data-trip-tab="${id}">${label}</button>`).join('')}</div>
    <div class="detail-layout imported-layout"><section id="panel-${tripTab}" role="tabpanel" aria-labelledby="tab-${tripTab}" tabindex="0">
    ${tripTab === 'itinerary' ? `<p class="muted">Dates, times, estimates, and notes from your itinerary. Transport and venue information has not been rechecked.</p>${tripDayControls(t)}${t.schedule.filter(day=>selectedTripDay==='all'||String(day.day)===selectedTripDay).map(day => `<section class="itinerary-day"><div class="day-heading"><div><span class="kicker">DAY ${day.day} · ${escapeHTML(day.date)}</span><h2>${escapeHTML(day.title)}</h2></div><span class="muted">${day.day === 0 ? 'Departure night' : day.day < 4 ? 'Hangzhou' : 'Shanghai'}</span></div>${t.stops.map((s,i)=>({s,i})).filter(({s})=>s.day===day.day).sort((a,b)=>(a.s.time==='·'||!a.s.time?'99:99':a.s.time).localeCompare(b.s.time==='·'||!b.s.time?'99:99':b.s.time)).map(({s,i})=>itineraryStop(t,s,i)).join('')}${day.stay ? `<p class="stay-note">☾ ${escapeHTML(day.stay)}</p>` : ''}</section>`).join('')}${t.stops.some(s=>s.day===undefined)?`<h2>Unscheduled stops</h2>${t.stops.map((s,i)=>s.day===undefined?itineraryStop(t,s,i):'').join('')}`:''}<form id="add-stop" data-trip="${t.id}" class="dated-add"><h3>Add to your itinerary</h3><label>Day<select name="day">${t.schedule.map(d=>`<option value="${d.day}">Day ${d.day} · ${d.date}</option>`).join('')}</select></label><label>Time (optional)<input name="time" type="time"></label><label class="full-width">Place or activity<input name="stop" required maxlength="120" placeholder="Leave room for a new discovery…"></label><button class="primary">Add stop</button></form>` : ''}
    ${tripTab === 'photos' ? photoPanel(t) : ''}
    ${tripTab === 'transport' ? `<h2>Every connection</h2><p class="muted">Scheduled details from your original plan.</p>${t.transport.map(leg=>`<article class="trip-info"><span class="kicker">${escapeHTML(leg.day)}</span><h3>${escapeHTML(leg.name)}</h3><p>${escapeHTML(leg.route)}</p><strong>${escapeHTML(leg.time)}</strong></article>`).join('')}<p class="muted">Airport coach and bus plans are included in the daily itinerary.</p>` : ''}
    ${tripTab === 'hotels' ? `<h2>A place to come back to</h2>${t.hotels.map(h=>`<article class="trip-info"><span class="kicker">${escapeHTML(h.time)}</span><h3>${escapeHTML(h.name)}</h3><p>${escapeHTML(h.route)}</p>${h.day?`<small>${escapeHTML(h.day)}</small>`:''}</article>`).join('')}` : ''}
    ${tripTab === 'expenses' ? `<h2>Recorded spending</h2><p class="muted">Amounts and dates copied from your itinerary. This is the recorded total, including the flight entry for two people, not a per-person budget.</p><div class="spend-total">${money(total)}<small>${t.expenses.length} recorded entries · SGD</small></div><div class="expense-list">${t.expenses.map((e,i)=>`<article class="expense"><div><strong>${escapeHTML(e.name)}</strong><small>${escapeHTML(e.date)} · ${escapeHTML(e.category)} · Paid ${escapeHTML(e.paid)}</small></div><div><b>${money(e.sgd)}</b><button data-delete-expense="${i}" data-trip="${t.id}" aria-label="Remove expense ${escapeHTML(e.name)}">Remove</button></div></article>`).join('')}</div><p class="muted">The source uses ¥5.2 per S$1. Daily CNY estimates are separate from recorded spending.</p>${expenseForm(t)}` : ''}
    ${tripTab==='itinerary'?`<form id="trip-journal" data-trip="${t.id}" class="trip-info"><h3>Trip journal</h3><label for="journal">Notes, memories, and changes of plan</label><textarea id="journal" name="journal" rows="6" maxlength="10000" placeholder="What do you want to remember?">${escapeHTML(t.journal||'')}</textarea><button class="primary">Save notes</button></form>`:''}</section><aside class="trip-sidebar"><div class="rail-box"><span class="kicker">YOUR JOURNEY</span><h3>${escapeHTML(t.status)}</h3><button class="primary" data-trip-tab="photos">Upload photos +</button><label class="muted">Trip status<select id="status" data-trip="${t.id}">${['Draft','Planned','Ongoing','Completed'].map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select></label><p>Check off each stop as you go. Changes stay in this browser.</p><progress max="${Math.max(1,t.stops.length)}" value="${completed}" aria-label="Completed itinerary stops"></progress><p>${completed} of ${t.stops.length} complete</p></div><div class="rail-box"><span class="kicker">FROM YOUR ORIGINAL PLAN</span><p>Imported from 杭州-上海 (10).html. Booking references, hotel PINs, and e-ticket numbers remain in the original file.</p><p>The Day 4 title mentions 灵隐寺, but no timed temple visit appears in the source. It remains a day heading.</p></div></aside></div>`;
}
document.addEventListener('click', e => {
  const button = e.target.closest('[data-trip-tab]');
  if (!button) return;
  tripTab = button.dataset.tripTab;
  render();
  document.querySelector(`[data-trip-tab="${tripTab}"]`).focus();
});
document.addEventListener('keydown', e => {
  if (!e.target.matches('[data-trip-tab]')) return;
  const t=state.trips.find(t=>location.hash===`#trip/${t.id}`);
  const tabs = t?.imported ? ['itinerary','transport','hotels','expenses','photos'] : ['itinerary','photos'];
  const index = tabs.indexOf(tripTab);
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
  e.preventDefault();
  tripTab = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length-1] : tabs[(index + (e.key === 'ArrowRight' ? 1 : tabs.length-1)) % tabs.length];
  render();
  document.querySelector(`[data-trip-tab="${tripTab}"]`).focus();
});
