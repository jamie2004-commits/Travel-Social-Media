const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function get(selector){
  if(selector==='[data-memory-stream]')return null;
  if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',style:{},value:'',insertAdjacentHTML(position,html){this.innerHTML=html+this.innerHTML},focus(){},setSelectionRange(){}});
  return elements.get(selector);
}
const context={structuredClone,crypto:require('node:crypto').webcrypto,location:{hash:'#feed'},localStorage:{getItem(){return null},setItem(){}},document:{querySelector:get,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){},scrollTo(){}},setTimeout(){},clearTimeout(){},Blob,atob};
vm.createContext(context);
for(const name of ['map','trip','itinerary','photos','social','travel','backup','','memories'])vm.runInContext(fs.readFileSync(`prototype${name?'-'+name:''}.js`,'utf8'),context);
const run=code=>vm.runInContext(code,context);
assert(get('#app').innerHTML.includes('Out there, together.'));
assert(!get('#app').innerHTML.includes('YOUR UPCOMING TRIP'));
run('location.hash="#trip/hangzhou-shanghai-2026";render()');
assert(get('#app').innerHTML.includes('Earliest → latest visit'));
assert(!get('#app').innerHTML.includes('data-stop='));
run('planningTrip="hangzhou-shanghai-2026";render()');
assert(get('#app').innerHTML.includes('data-stop='));
assert(get('#app').innerHTML.includes('Back to photo story'));
// Posts without a chosen date are dated by when they were posted (created).
assert.equal(run('orderedMemories([{id:"late",created:1,visitedAt:"2026-09-18T18:00"},{id:"early",created:2,visitedAt:"2026-09-18T08:00"},{id:"posted",created:Date.parse("2030-01-01T00:00:00")}]).map(p=>p.id).join()'),'early,late,posted');
assert.equal(run('orderedMemories([{id:"early",created:2,visitedAt:"2026-09-18T08:00"},{id:"posted",created:Date.parse("2030-01-01T00:00:00")},{id:"late",created:1,visitedAt:"2026-09-18T18:00"}],true).map(p=>p.id).join()'),'posted,late,early');
assert.equal(run('memoryTime({created:Date.now()})'),'Just now');
assert.equal(run('memoryTime({created:Date.now()-3*3600000})'),'3h ago');
assert.equal(run('memoryTime({created:1,visitedAt:"2026-09-18T08:00"})'),'18 Sep 2026 · 08:00');
assert(run('memoryPost({id:"p",place:"<script>",caption:"<img onerror=x>",visitedAt:"2026-09-18T08:00"},state.trips[0],"blob:test").includes("&lt;img onerror=x&gt;")'));
(async()=>{
  run(`photoTransaction=async()=>[{id:'p',tripId:'hangzhou-shanghai-2026',name:'test.jpg',caption:'Evening walk',created:1,visitedAt:'2026-09-18T18:00',place:'West Lake',blob:new Blob(['x'])}];fileDataURL=async()=>'data:image/jpeg;base64,eA==';createImageBitmap=async()=>({close(){}});writePhotoBatch=async(records)=>{globalThis.restoredRecords=records};`);
  const backup=await run('buildBackup()');
  context.testBackup=backup;
  assert.equal(backup.photos[0].visitedAt,'2026-09-18T18:00');
  assert.equal(run('validateBackup(testBackup).photos[0].place'),'West Lake');
  await run('restoreBackup(testBackup)');
  assert.equal(run('restoredRecords[0].visitedAt'),'2026-09-18T18:00');
  assert.equal(run('restoredRecords[0].place'),'West Lake');
  assert(run('restoredRecords[0].tripId!==testBackup.photos[0].tripId'));
  delete backup.photos[0].visitedAt;delete backup.photos[0].place;
  assert.equal(run('validateBackup(testBackup).photos.length'),1,'Older backups remain valid');
  backup.photos[0].visitedAt='not-a-time';
  assert.throws(()=>run('validateBackup(testBackup)'));
  console.log('PASS: photo-first feed and story, optional planning, visit-time ordering, escaped captions, metadata backup/restore, older backup compatibility');
})().catch(error=>{console.error(error);process.exitCode=1});
