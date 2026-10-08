// 여섯 식구 첫 해외여행 · 오프라인 저장
const CACHE='tw-v51';
const PRE=["./", "index.html", "manifest.webmanifest", "icon-192.png", "apple-touch-icon.png", "img/101.jpg", "img/chiikawa.jpg", "img/cks.jpg", "img/donki.jpg", "img/f_beef.jpg", "img/f_boar.jpg", "img/f_boba.jpg", "img/f_charsiu.jpg", "img/f_court.jpg", "img/f_fruit.jpg", "img/f_gopchang.jpg", "img/f_hotpot2.jpg", "img/f_kiki.jpg", "img/f_lurou.jpg", "img/f_mango.jpg", "img/f_peanut.jpg", "img/f_pepper.jpg", "img/f_ribs.jpg", "img/f_sausage.jpg", "img/f_shandi.jpg", "img/f_wing.jpg", "img/flight.jpg", "img/hero.jpg", "img/hello.png", "img/splash.png", "img/globe2.png", "img/hotel.jpg", "img/jiufen.jpg", "img/longshan.jpg", "img/r_jiufen.jpg", "img/r_shifen.jpg", "img/r_wulai.jpg", "img/r_yehliu.jpg", "img/raohe.jpg", "img/redhouse.jpg", "img/shifen.jpg", "img/trolley.jpg", "img/wannian.jpg", "img/wulaifall.jpg", "img/wulaist.jpg", "img/wulaivil.jpg", "img/ximen.jpg", "img/ximenug.jpg", "img/yehliu.jpg", "og.jpg"];
const CORE=['./','index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>
  /* 핵심 파일은 꼭 새로 받아야 설치 완료 (실패하면 예전 버전 유지) */
  c.addAll(CORE.map(u=>new Request(u,{cache:'reload'}))).then(()=>Promise.all(PRE.filter(u=>CORE.indexOf(u)<0).map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{}))))
).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const good=res=>res&&res.ok&&res.type==='basic'&&!res.redirected;
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const same=u.origin===self.location.origin;const font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);if(!same&&!font)return;
  if(r.mode==='navigate'||(same&&/\/(index\.html)?$/.test(u.pathname))){
    /* 새 버전을 먼저 시도하되 3초 안에 안 오면 저장된 화면으로 바로 열기 (산속·지하에서 흰 화면 방지) */
    const net=fetch(r).then(res=>{if(good(res)){const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp))}return res});
    e.waitUntil(net.catch(()=>{}));
    const cached=()=>caches.match('index.html').then(m=>m||caches.match('./'));
    e.respondWith(new Promise(done=>{let fin=false;const t=setTimeout(()=>{cached().then(m=>{if(m&&!fin){fin=true;done(m)}})},3000);
      net.then(res=>{if(fin)return;if(good(res)||res.status<500){fin=true;clearTimeout(t);done(res)}else return cached().then(m=>{if(!fin){fin=true;clearTimeout(t);done(m||res)}})})
        .catch(()=>cached().then(m=>{if(!fin){fin=true;clearTimeout(t);done(m||Response.error())}})).catch(()=>{if(!fin){fin=true;done(Response.error())}})}));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{if(m&&/\/img\//.test(u.pathname))return m;/* 사진은 저장본 그대로 (버전 올릴 때 새로 받음) */const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>m);return m||net}))});
