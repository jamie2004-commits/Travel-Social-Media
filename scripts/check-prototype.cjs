// Lightweight rendering checks; run with node scripts/check-prototype.cjs.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const get = selector => {
  if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', style: {}, value: '', focus() {}, setSelectionRange() {} });
  return elements.get(selector);
};
const handlers = {};
const context = {
  structuredClone, crypto: require('node:crypto').webcrypto,
  location: { hash: '#feed' },
  localStorage: { getItem() { return null; }, setItem(k, value) { JSON.parse(value); } },
  document: { querySelector: get, querySelectorAll: () => [], addEventListener: (name, fn) => handlers[name] = fn },
  window: { addEventListener() {}, scrollTo() {} },
  setTimeout() {}, clearTimeout() {}
};
vm.createContext(context);
for (const file of ['prototype-map.js', 'prototype-trip.js', 'prototype-itinerary.js', 'prototype-photos.js', 'prototype-social.js', 'prototype-travel.js', 'prototype-backup.js', 'prototype.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
for (const route of ['feed', 'explore', 'trips', 'profile', 'trip/kyoto', 'trip/bali', 'trip/missing']) {
  context.location.hash = '#' + route;
  vm.runInContext('render()', context);
  assert(get('#app').innerHTML.length > 50, route);
}
vm.runInContext('state.saved.push("kyoto"); filter="saved"; location.hash="#trips"; render()', context);
assert(get('#app').innerHTML.includes('The quieter side of Kyoto'));
vm.runInContext('query="no-such-place"; render()', context);
assert(get('#app').innerHTML.includes('A new adventure belongs here'));
handlers.click({ target: { closest: () => ({ dataset: { copy: 'kyoto' } }) } });
assert(vm.runInContext('state.trips.at(-1).own && state.trips.at(-1).status === "Draft"', context));
vm.runInContext('state.trips.at(-1).stops[0].name = "Independent copy"', context);
assert.equal(vm.runInContext('state.trips.find(t=>t.id==="kyoto").stops[0].name', context), 'Wander through Arashiyama');
console.log('PASS: seven routes, saved filtering, search empty state, map rendering, independent itinerary copy');

for (const tab of ['itinerary', 'transport', 'hotels', 'expenses']) {
  vm.runInContext(`location.hash='#trip/hangzhou-shanghai-2026';tripTab='${tab}';render()`, context);
  assert(get('#app').innerHTML.includes(`panel-${tab}`));
  if (tab === 'itinerary') {
    assert(get('#app').innerHTML.includes('2026-09-24'));
    assert(get('#app').innerHTML.includes('Time to decide'));
    assert(get('#app').innerHTML.includes('Wedding Ceromony'));
  }
  if (tab === 'transport') assert(get('#app').innerHTML.includes('G7304'));
  if (tab === 'hotels') assert(get('#app').innerHTML.includes('Huachen International'));
  if (tab === 'expenses') assert(get('#app').innerHTML.includes('1,532.68'));
}
assert.equal(vm.runInContext('importedTrip.stops.length', context), 30);
assert.equal(vm.runInContext('importedTrip.schedule.length', context), 8);
handlers.change({ target: { dataset: { trip: 'hangzhou-shanghai-2026', stop: '0' }, checked: true } });
assert(vm.runInContext('state.trips[0].stops[0].done', context));
handlers.submit({ preventDefault() {}, target: { id: 'add-stop', dataset: { trip: 'hangzhou-shanghai-2026' }, elements: { stop: { value: 'An extra coffee stop' }, day: { value: '6' }, time: { value: '15:30' } } } });
assert(vm.runInContext('state.trips[0].stops.at(-1).day === 6 && state.trips[0].stops.at(-1).time === "15:30"', context));
vm.runInContext('location.hash="#explore";query="";render()', context);
assert(!get('#app').innerHTML.includes('A week together'));
// Simulate upgrading a browser containing user-created trips, then reloading.
let storage = JSON.stringify({ saved: ['kyoto'], liked: [], visited: ['SGP'], trips: [{ id: 'user-trip', title: 'Keep me', own: true, stops: [] }] });
function reload() {
  const restored = { ...context, localStorage: { getItem: () => storage, setItem: (key, value) => storage = value }, location: { hash: '#feed' } };
  vm.createContext(restored);
  for (const file of ['prototype-map.js', 'prototype-trip.js', 'prototype-itinerary.js', 'prototype-photos.js', 'prototype-social.js', 'prototype-travel.js', 'prototype-backup.js', 'prototype.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), restored);
  return restored;
}
let restored = reload();
assert.equal(vm.runInContext('state.trips.length', restored), 2);
assert(vm.runInContext('state.trips.some(t=>t.id==="user-trip")', restored));
vm.runInContext('state.trips[0].stops[0].done=true;persist()', restored);
restored = reload();
assert.equal(vm.runInContext('state.trips.length', restored), 2);
assert(vm.runInContext('state.trips[0].stops[0].done', restored));
const imported = fs.readFileSync('prototype-trip.js', 'utf8');
assert(!/\bRef\b|Eticket|\bpin\b|\d{12,}/i.test(imported));
console.log('PASS: imported trip tabs, source totals, dated stops, completion, discovery exclusion, migration and reload persistence');
