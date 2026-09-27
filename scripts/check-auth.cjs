const assert=require('node:assert/strict');
const {createApp}=require('../server.cjs');
(async()=>{
  const server=createApp({secure:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=(url,options={})=>fetch(base+url,{redirect:'manual',...options});
  try{
    assert.equal((await request('/')).status,302);
    for(const file of ['/prototype-trip.js','/index.html','/prototype.js','/auth-client.js'])assert([302,401].includes((await request(file)).status));
    assert.equal((await request('/login')).status,200);
    assert.equal((await request('/healthz')).status,200);
    const attempt=(password,origin=base)=>request('/auth/login',{method:'POST',headers:{Origin:origin},body:new URLSearchParams({username:'user123',password})});
    assert.equal((await attempt('wrong')).status,401);
    assert.equal((await attempt('password','https://unrelated.example')).status,403);
    const response=await attempt('password');assert.equal(response.status,200);
    const rawCookie=response.headers.get('set-cookie');assert(rawCookie.includes('HttpOnly'));assert(rawCookie.includes('SameSite=Strict'));
    const cookie=rawCookie.split(';')[0];const headers={Cookie:cookie};
    assert.equal((await request('/index.html',{headers})).status,200);
    assert.equal((await request('/prototype-trip.js',{headers})).status,200);
    for(const name of ['/.git/config','/.openai/deployment.json','/server.cjs','/render.yaml','/'+encodeURIComponent('杭州-上海 (10).html')])assert.equal((await request(name,{headers})).status,404);
    assert.equal((await request('/auth/logout',{method:'POST',headers:{...headers,Origin:'https://unrelated.example'}})).status,403);
    assert.equal((await request('/auth/logout',{method:'POST',headers})).status,200);
    assert.equal((await request('/auth/session',{headers})).status,401);
    assert.equal((await request('/prototype-trip.js',{headers})).status,401);
    for(let i=0;i<10;i++)assert.equal((await attempt('wrong')).status,401);
    assert.equal((await attempt('wrong')).status,429);
    console.log('PASS: valid/invalid login, protected assets, HttpOnly cookie, CSRF rejection, logout invalidation, private source exclusion, throttling');
  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
