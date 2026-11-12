from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent/'public'
files=sorted(p.name for p in root.iterdir() if p.is_file() and p.name not in ['sw.js','.nojekyll'])
version=hashlib.sha256(b''.join((root/n).read_bytes() for n in files)).hexdigest()[:16]
source="""const PREFIX='touchline-shell-'+self.registration.scope+'-',CACHE=PREFIX+'VERSION',FILES=FILES_JSON;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
const base=new URL('./',self.location.href);if(!url.pathname.startsWith(base.pathname))return;
const relative=url.pathname.slice(base.pathname.length);if(!FILES.includes(relative)&&relative!=='')return;
event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(relative||'index.html'))||fetch(event.request)));});
""".replace('VERSION',version).replace('FILES_JSON',json.dumps(files))
(root/'sw.js').write_text(source)
print('Ready:',len(files),'assets; cache',version)
