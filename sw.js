const CACHE_NAME = 'p8work-shell-v14';
const SHELL = [
  './','./index.html','./manifest.webmanifest','./release.json',
  './hub/tool-registry.js','./hub/hub-storage.js','./hub/crypto.js','./hub/backup-adapters.js','./hub/consultation-media.js','./hub/backup-engine.js','./hub/restore-engine.js','./hub/update-manager.js','./hub/app.js',
  './assets/icons/p8work-192.png','./assets/icons/p8work-512.png','./assets/icons/p8work-maskable-512.png',
  './assets/icons/shiftview-256.png','./assets/icons/transportview-256.png','./assets/icons/consultation-manager-256.png','./assets/icons/chore-planner-256.png',
  './assets/backgrounds/p8work-home.webp',
  './tools/shiftview.html','./tools/transportview.html','./tools/consultation-form-manager.html','./tools/chore-planner.html'
];
function canonicalRequest(request){
  const u=new URL(request.url); if(u.origin!==self.location.origin)return request;
  if(u.pathname.endsWith('.html')||request.mode==='navigate'){u.search='';u.hash='';return new Request(u.href,{method:'GET',headers:request.headers,credentials:'same-origin',redirect:'follow'});} return request;
}
async function putSafe(cache,request,response){if(response&&response.ok&&response.type!=='opaque'){try{await cache.put(canonicalRequest(request),response.clone());}catch(_){}}return response;}
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('p8work-shell-')&&n!==CACHE_NAME).map(n=>caches.delete(n)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
  const req=event.request; if(req.method!=='GET')return; const url=new URL(req.url); if(url.origin!==self.location.origin)return;
  const isNav=req.mode==='navigate'||url.pathname.endsWith('.html');
  if(isNav){event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);try{return await putSafe(cache,req,await fetch(req));}catch(_){return (await cache.match(canonicalRequest(req)))||(await cache.match('./index.html'));}})());return;}
  event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);const hit=await cache.match(req);if(hit){event.waitUntil(fetch(req).then(r=>putSafe(cache,req,r)).catch(()=>{}));return hit;}try{return await putSafe(cache,req,await fetch(req));}catch(_){return Response.error();}})());
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
