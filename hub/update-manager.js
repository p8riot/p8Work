(function (global) {
  "use strict";
  const CURRENT_BUILD='1.0.0-stable-privacy-and-unified-settings';
  let registration=null, waiting=null, deferredInstall=null, listeners=[], remoteRelease=null;
  function emit(type, detail) { listeners.forEach(fn=>{ try{fn(type,detail||{});}catch(_){}}); }
  function on(fn) { listeners.push(fn); return ()=>{listeners=listeners.filter(x=>x!==fn);}; }
  window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredInstall=e; emit('install-available'); });
  window.addEventListener('appinstalled',()=>{ deferredInstall=null; emit('installed'); });
  async function init() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) { emit('unsupported'); return null; }
    try {
      registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
      if (registration.waiting) { waiting=registration.waiting; emit('update-ready'); }
      registration.addEventListener('updatefound',()=>{
        const w=registration.installing; if (!w) return;
        w.addEventListener('statechange',()=>{ if (w.state==='installed' && navigator.serviceWorker.controller) { waiting=w; emit('update-ready'); } });
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>emit('controller-changed'));
      emit('ready',{registration});
      // Quiet launch check. It only surfaces UI if a different build is published.
      setTimeout(()=>check().catch(()=>{}),0);
      return registration;
    } catch (error) { emit('error',{error}); return null; }
  }
  async function check() {
    let releaseNewer=false;
    try {
      const response=await fetch('./release.json?check='+Date.now(),{cache:'no-store'});
      if(response.ok){remoteRelease=await response.json();releaseNewer=!!(remoteRelease.buildId&&remoteRelease.buildId!==CURRENT_BUILD);if(releaseNewer)emit('update-ready',{release:remoteRelease});}
    } catch(_) {}
    if (registration) { try { await registration.update(); } catch(_) {} }
    return {ok:navigator.onLine,waiting:!!(registration&&registration.waiting)||!!waiting,newer:releaseNewer,release:remoteRelease};
  }
  function applyUpdate() {
    const w=waiting || (registration&&registration.waiting);
    if (w) { w.postMessage({type:'SKIP_WAITING'}); return true; }
    if (remoteRelease && remoteRelease.buildId!==CURRENT_BUILD) { location.reload(); return true; }
    return false;
  }
  async function promptInstall() {
    if (!deferredInstall) return {available:false};
    deferredInstall.prompt(); const choice=await deferredInstall.userChoice; deferredInstall=null; return {available:true,outcome:choice.outcome};
  }
  async function offlineReadiness() {
    if (!('caches' in global)) return {available:false,total:global.P8WORK_REGISTRY.tools.length,cached:0};
    let cached=0;
    for (const tool of global.P8WORK_REGISTRY.tools) {
      try { if (await caches.match('./'+tool.file,{ignoreSearch:true})) cached++; } catch(_) {}
    }
    return {available:true,total:global.P8WORK_REGISTRY.tools.length,cached};
  }
  function installAvailable() { return !!deferredInstall; }
  function status() { return {supported:'serviceWorker' in navigator,registered:!!registration,waiting:!!(waiting||(registration&&registration.waiting)),standalone:matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,installAvailable:!!deferredInstall,currentBuild:CURRENT_BUILD,remoteRelease}; }
  global.P8WORK_UPDATES=Object.freeze({init,check,applyUpdate,promptInstall,offlineReadiness,installAvailable,status,on});
}(window));
