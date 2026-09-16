const CACHE='wanwan-v15';
const ASSETS=['/','/index.html','/manifest.webmanifest','/wanwan-icon.svg','/wanwan-logo.png','/wanwan-jazz.mp3','/wedding.css','/motion.css','/refine.css','/audio.css','/logo-large.css','/sound.js','/wedding.js','/r2.js','/admin-tools.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/index.html'))));
});
