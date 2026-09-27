async function checkRoamSession(){
  try{const response=await fetch('/auth/session',{cache:'no-store'});if(response.status===401)location.replace('/login'+location.hash);}catch{/* An already-open trip can still be edited while temporarily offline. */}
}
document.querySelector('#sign-out').addEventListener('click',async()=>{
  try{
    const result=await fetch('/auth/logout',{method:'POST'});if(!result.ok)throw new Error('Could not sign out.');
    if('caches'in window){for(const name of await caches.keys())if(name.startsWith('roam-'))await caches.delete(name);}
    location.replace('/login');
  }catch{notify('Reconnect to sign out. Your trip data stays on this device.');}
});
window.addEventListener('pageshow',checkRoamSession);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkRoamSession();});
