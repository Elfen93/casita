const V='20261110-1059';const C='casita-'+V;const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='casita-assets').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(u.pathname.includes('/q3d/')){e.respondWith(caches.open('casita-assets').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res&&res.ok)c.put(e.request,res.clone());return res;}))));return;}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>{const net=fetch(e.request).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}return res;}).catch(()=>r);return r||net;}));});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});
