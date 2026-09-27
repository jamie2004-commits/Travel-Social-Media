const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
const ASSETS=new Set(['index.html','prototype.css','prototype-map.js','prototype-trip.js','prototype-itinerary.js','prototype-photos.js','prototype-social.js','prototype-travel.js','prototype-backup.js','prototype.js','manifest.webmanifest','app-icon.svg','auth-client.js']);
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const digest=s=>crypto.createHash('sha256').update(s).digest();
function createApp(options={}) {
  const username=options.username||process.env.ROAM_USERNAME||'user123';
  const password=options.password||process.env.ROAM_PASSWORD||'password';
  const secure=options.secure??(process.env.NODE_ENV==='production');
  const maxAge=options.maxAge??7*24*60*60;
  const sessions=new Map(),attempts=new Map();
  const sessionCookie=(value,age)=>`roam_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
  function token(req){const match=(req.headers.cookie||'').match(/(?:^|;\s*)roam_session=([a-f0-9]{64})(?:;|$)/);return match?.[1];}
  function authenticated(req){const key=token(req),expires=sessions.get(key);if(expires&&expires>Date.now())return true;if(key)sessions.delete(key);return false;}
  function send(res,status,body,type='text/plain; charset=utf-8',headers={}){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY',...headers});res.end(body);}
  function file(res,name,headers={}){fs.readFile(path.join(ROOT,name),(error,data)=>{if(error)return send(res,404,'Not found');send(res,200,data,TYPES[path.extname(name)]||'application/octet-stream',headers);});}
  function sameOrigin(req){if(req.headers['sec-fetch-site']==='cross-site')return false;const origin=req.headers.origin;if(!origin)return true;try{return new URL(origin).host===req.headers.host}catch{return false;}}
  async function body(req){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>4096)throw new Error('too-large');}return new URLSearchParams(text);}
  const server=http.createServer(async(req,res)=>{
    let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{return send(res,400,'Bad request');}
    if(pathname==='/healthz')return send(res,200,'ok');
    // A replacement worker removes previous offline caches, so they cannot bypass logout.
    if(pathname==='/sw.js')return file(res,'sw.js',{'Service-Worker-Allowed':'/'});
    if(pathname==='/login'&&req.method==='GET')return file(res,'login.html');
    if(pathname==='/login.css'&&req.method==='GET')return file(res,'login.css');
    if(pathname==='/login.js'&&req.method==='GET')return file(res,'login.js');
    if(pathname==='/app-icon.svg'&&req.method==='GET')return file(res,'app-icon.svg');
    if(pathname==='/auth/session'&&req.method==='GET')return send(res,authenticated(req)?200:401,JSON.stringify({authenticated:authenticated(req)}),'application/json');
    if(pathname==='/auth/login'&&req.method==='POST'){
      if(!sameOrigin(req))return send(res,403,'Cross-site sign-in is not allowed.');
      const ip=req.socket.remoteAddress||'local',now=Date.now();
      for(const [key,entry] of attempts)if(entry.until<now)attempts.delete(key);
      for(const [key,expires] of sessions)if(expires<now)sessions.delete(key);
      const entry=attempts.get(ip)||{count:0,until:now+600000};
      if(entry.count>=10)return send(res,429,'Too many attempts. Try again in 10 minutes.',undefined,{'Retry-After':'600'});
      let form;try{form=await body(req)}catch{return send(res,413,'Sign-in request is too large.');}
      const validUser=crypto.timingSafeEqual(digest(form.get('username')||''),digest(username));
      const validPassword=crypto.timingSafeEqual(digest(form.get('password')||''),digest(password));
      if(!validUser||!validPassword){entry.count++;attempts.set(ip,entry);return send(res,401,'Incorrect username or password.');}
      attempts.delete(ip);const previous=token(req);if(previous)sessions.delete(previous);
      const next=crypto.randomBytes(32).toString('hex');sessions.set(next,now+maxAge*1000);
      return send(res,200,JSON.stringify({ok:true}),'application/json',{'Set-Cookie':sessionCookie(next,maxAge)});
    }
    if(pathname==='/auth/logout'&&req.method==='POST'){
      if(!sameOrigin(req))return send(res,403,'Cross-site sign-out is not allowed.');
      sessions.delete(token(req));return send(res,200,JSON.stringify({ok:true}),'application/json',{'Set-Cookie':sessionCookie('',0)});
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,'Method not allowed');
    if(!authenticated(req)){
      if(pathname==='/'||pathname==='/index.html')return send(res,302,'','text/plain',{'Location':'/login'});
      return send(res,401,'Sign in to open this resource.');
    }
    const name=pathname==='/'?'index.html':pathname.slice(1);
    if(!ASSETS.has(name))return send(res,404,'Not found');
    return file(res,name);
  });
  return server;
}
if(require.main===module){const port=Number(process.env.PORT||8001),host=process.env.HOST||'0.0.0.0';createApp().listen(port,host,()=>console.log(`Roam is ready on port ${port}. Open http://localhost:${port}/login`));}
module.exports={createApp};
