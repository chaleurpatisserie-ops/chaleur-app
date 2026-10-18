/* Chaleur Atelier · phone notifications (v22.58). The server sends an empty push; this worker asks the server for the message and shows it.
   Tap → opens the page the message is about (or focuses the app). */
const API="https://script.google.com/macros/s/AKfycbyX_DH98Kfqa3SHKgM_XXCM7MIJaJokTbjuCq8Rcf6uueS7kSDy7wg2CmvXsOACtZfivw/exec";
self.addEventListener("install",e=>{ self.skipWaiting(); });
self.addEventListener("activate",e=>{ e.waitUntil(self.clients.claim()); });
function dev(){ return new Promise(res=>{ try{ const o=indexedDB.open("ca-push",1); o.onupgradeneeded=()=>o.result.createObjectStore("kv"); o.onsuccess=()=>{ try{ const g=o.result.transaction("kv","readonly").objectStore("kv").get("dev"); g.onsuccess=()=>res(g.result||null); g.onerror=()=>res(null); }catch(e){ res(null); } }; o.onerror=()=>res(null); }catch(e){ res(null); } }); }
async function pull(){ const d=await dev(); if(!d) return [];
  const r=await fetch(API,{method:"POST",credentials:"omit",redirect:"follow",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({fn:"pushPull",args:[d.id,d.sec]})});
  const j=await r.json(); return j&&j.ok&&Array.isArray(j.result)?j.result:[]; }
self.addEventListener("push",e=>{ e.waitUntil((async()=>{ let list=[]; try{ list=await pull(); }catch(x){}
  if(!list.length){ let t=null; try{ t=e.data&&e.data.json(); }catch(x){} list=[t&&t.body?t:{title:"Chaleur Atelier",body:"You have a new reminder. Tap to open the app.",url:"./",tag:"ca"}]; }
  for(const m of list.slice(-5)) await self.registration.showNotification(m.title||"Chaleur Atelier",{body:m.body||"",tag:m.tag||m.id||"ca",renotify:true,icon:"icon-192.png",badge:"icon-192.png",data:{url:m.url||"./"}});
})()); });
self.addEventListener("notificationclick",e=>{ e.notification.close(); const url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil((async()=>{ const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true}); for(const c of cs){ if(c.url&&c.url.indexOf(self.registration.scope)===0&&"focus" in c){ try{ if("navigate" in c) await c.navigate(url); }catch(x){} return c.focus(); } } return self.clients.openWindow(url); })()); });
