// Clear old app-shell caches before accepting a new session; saved trip data is retained.
async function clearAppCaches(){
  if('serviceWorker'in navigator){const registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.map(r=>r.unregister()));}
  if('caches'in window){const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('roam-')).map(n=>caches.delete(n)));}
}
clearAppCaches().catch(()=>{});
document.querySelector('#login-form').addEventListener('submit',async e=>{
  e.preventDefault();const button=e.target.querySelector('button'),error=document.querySelector('#login-error');button.disabled=true;error.textContent='';
  try{
    const response=await fetch('/auth/login',{method:'POST',body:new URLSearchParams(new FormData(e.target)),credentials:'same-origin'});
    if(!response.ok)throw new Error(await response.text());
    await clearAppCaches();location.replace('/index.html'+(location.hash||'#trip/hangzhou-shanghai-2026'));
  }catch(problem){error.textContent=problem.message==='Failed to fetch'?'Unable to connect. Check your connection and try again.':problem.message;button.disabled=false;}
});
