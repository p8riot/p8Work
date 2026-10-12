(function (global) {
  "use strict";
  const reg=global.P8WORK_REGISTRY, storage=global.P8WORK_STORAGE, backup=global.P8WORK_BACKUP, restore=global.P8WORK_RESTORE, updates=global.P8WORK_UPDATES;
  let settings=storage.loadSettings();
  let currentRestorePayload=null, currentRestoreEncrypted=false, currentRestorePassword='';
  let toastTimer=null;

  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function formatDateTime(iso, includeDate=true) {
    if (!iso) return 'Unavailable'; const d=new Date(iso); if (Number.isNaN(d.getTime())) return 'Unavailable';
    const date=includeDate?new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(d):'';
    const time=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',hour12:settings.clockFormat!=='24h'}).format(d);
    return includeDate?`${date} · ${time}`:time;
  }
  function toast(message,type='info') {
    const el=$('#toast'); el.textContent=message; el.dataset.type=type; el.hidden=false;
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>{el.hidden=true;},5000);
  }
  function applyTheme() { document.documentElement.dataset.theme=settings.theme; document.documentElement.dataset.cardSize=settings.cardSize; }
  function saveSettings() { settings=storage.saveSettings(settings); applyTheme(); renderHome(); renderSettings(); renderAbout(); }

  function greetingFor(hour){ if(hour>=0&&hour<12)return 'Good morning'; if(hour>=12&&hour<17)return 'Good afternoon'; return 'Good evening'; }
  function renderClock() {
    const now=new Date(), parts=[];
    $('#greeting').hidden=!settings.showGreeting; $('#greeting').textContent=greetingFor(now.getHours());
    if(settings.showDate) parts.push(new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(now));
    if(settings.showTime) parts.push(new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',hour12:settings.clockFormat!=='24h'}).format(now));
    const line=$('#dateTimeLine'); line.textContent=parts.join('  •  '); line.hidden=parts.length===0;
  }
  function orderedTools(){ return settings.toolOrder.map(id=>reg.byId[id]).filter(Boolean); }
  function toolCard(tool,compact=false){
    const desc=settings.showDescriptions?`<p>${esc(tool.description)}</p>`:'';
    const ver=settings.showVersions?`<span class="tool-version">v${esc(tool.version)}</span>`:'';
    const launchQuery=settings.showHomeButtonInTools?'?hub=1':'?hub=1&home=0';
    return `<a class="tool-card${compact?' compact-tool':''}" href="${esc(tool.file)}${launchQuery}" data-tool-id="${esc(tool.id)}">
      <img src="${esc(tool.icon)}" alt="" width="96" height="96">
      <div class="tool-copy"><h3>${esc(tool.name)}</h3>${desc}<div class="tool-meta">${ver}<span class="open-tool">Open <span aria-hidden="true">→</span></span></div></div>
    </a>`;
  }
  function renderHome(){
    const area=$('#toolArea'); area.className=`tool-area layout-${settings.layout}`;
    const tools=orderedTools();
    if(settings.layout==='compact') area.innerHTML=tools.map(t=>toolCard(t,true)).join('');
    else if(settings.layout==='dashboard') {
      const history=storage.loadHistory(), last=history.lastOpenedTool, backupMeta=storage.getBackupMeta();
      const lastTool=last&&reg.byId[last.toolId];
      area.innerHTML=`<div class="dashboard-tools"><h2 class="section-mini-title">My tools</h2><div class="tool-grid">${tools.map(t=>toolCard(t,false)).join('')}</div></div>
      <aside class="dashboard-panel">
        <div class="info-block"><span>Last opened</span><strong>${lastTool?esc(lastTool.name):'No tool opened yet'}</strong><small>${last?esc(formatDateTime(last.openedAt)):''}</small></div>
        <div class="info-block"><span>Master backup</span><strong>${backupMeta?'Backup available':'No backup yet'}</strong><small>${backupMeta?esc(formatDateTime(backupMeta.createdAt)):'Create one from Backups'}</small></div>
        <div class="info-block"><span>System</span><strong>${tools.length} tools available</strong><small>p8Work 1.2.4 · Beta 4</small></div>
      </aside>`;
    } else area.innerHTML=`<div class="tool-grid">${tools.map(t=>toolCard(t,false)).join('')}</div>`;
    $$('.tool-card',area).forEach(card=>card.addEventListener('click',()=>storage.recordToolOpen(card.dataset.toolId)));
  }

  function showSection(id,persist=true){
    $$('.app-section').forEach(s=>s.hidden=s.id!==`section-${id}`);
    $$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.section===id));
    if(persist&&settings.rememberLastSection){settings.lastSection=id; storage.saveSettings(settings);}
    if(id==='backups') renderBackupStatus(); if(id==='about')renderAbout(); if(id==='settings')renderSettings();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function renderBackupStatus(){
    const meta=storage.getBackupMeta(), el=$('#backupStatus');
    if(!meta){el.innerHTML='<strong>No Master Backup yet</strong><span>Creating one is recommended before major changes.</span>';}
    else {
      const age=Math.floor((Date.now()-Date.parse(meta.createdAt))/86400000);
      el.innerHTML=`<strong>Last Master Backup: ${esc(formatDateTime(meta.createdAt))}</strong><span>${meta.toolIds.length} tool${meta.toolIds.length===1?'':'s'} included · ${meta.encrypted?'Encrypted':'Unencrypted'} · ${age<=settings.backupWarningDays?'Status: Good':`Backup age: ${age} days`}</span>`;
    }
    $('#undoProtectedChange').hidden=!storage.getSafety();
  }

  function openDialog(id){ const d=$(id); if(d.showModal)d.showModal(); else d.setAttribute('open',''); }
  function closeDialog(id){ const d=$(id); if(d.close)d.close(); else d.removeAttribute('open'); }

  function populateBackupDialog(selectedIds){
    const holder=$('#backupToolChoices'); holder.innerHTML=reg.tools.map(t=>`<label class="check-row"><input type="checkbox" value="${esc(t.id)}" ${!selectedIds||selectedIds.includes(t.id)?'checked':''}><span><strong>${esc(t.name)}</strong><small>v${esc(t.version)}</small></span></label>`).join('');
    $('#backupEncrypted').checked=true; $('#backupUnencrypted').checked=false; $('#backupPasswordWrap').hidden=false; $('#backupPassword').value=''; $('#backupPassword2').value=''; $('#backupWarning').hidden=true;
  }
  function syncBackupEncryptionUI(){ const encrypted=$('#backupEncrypted').checked; $('#backupPasswordWrap').hidden=!encrypted; $('#backupWarning').hidden=encrypted; }
  async function createMasterFromDialog(){
    const ids=$$('#backupToolChoices input:checked').map(x=>x.value); if(!ids.length){toast('Select at least one tool to back up.','error');return;}
    const encrypted=$('#backupEncrypted').checked; let password='';
    if(encrypted){password=$('#backupPassword').value; const p2=$('#backupPassword2').value; if(password.length<8){toast('Use a backup password with at least 8 characters.','error');return;} if(password!==p2){toast('The backup passwords do not match.','error');return;}}
    const btn=$('#createBackupConfirm'); btn.disabled=true; btn.textContent='Creating…';
    try { const r=await backup.createBackup({toolIds:ids,encrypted,password}); closeDialog('#createBackupDialog'); renderBackupStatus(); toast(`Master Backup created and verified: ${r.filename}`,'success'); }
    catch(e){toast(e.message||String(e),'error');}
    finally{btn.disabled=false;btn.textContent='Create & Download Backup';}
  }

  async function handleRestoreFile(file){
    if(!file)return; let text; try{text=await file.text();}catch(e){toast('Could not read the selected backup file.','error');return;}
    try{
      const probe=await backup.openBackupText(text,'');
      if(probe.needsPassword){ currentRestorePayload=null; $('#restorePassword').value=''; $('#restorePasswordDialog').dataset.backupText=text; openDialog('#restorePasswordDialog'); return; }
      currentRestorePayload=probe.payload; currentRestoreEncrypted=false; currentRestorePassword=''; renderRestoreReview(); toast('Backup validated. Review the restore choices before applying anything.','success');
    }catch(e){toast(e.message||String(e),'error');}
  }
  async function unlockRestore(){
    const text=$('#restorePasswordDialog').dataset.backupText||'', password=$('#restorePassword').value;
    try{const opened=await backup.openBackupText(text,password);currentRestorePayload=opened.payload;currentRestoreEncrypted=true;currentRestorePassword=password;closeDialog('#restorePasswordDialog');renderRestoreReview();toast('Encrypted backup validated. No data has been changed.','success');}
    catch(e){toast(e.message||String(e),'error');}
  }
  function statusLabel(s){return ({identical:'Identical','current-newer':'Current newer','backup-newer':'Backup newer','current-only':'Current only','backup-only':'Backup only',different:'Different'})[s]||s;}
  function metaTime(meta){return meta&&meta.lastModifiedAt?formatDateTime(meta.lastModifiedAt):'Exact modification time unavailable';}
  function renderRestoreReview(){
    const host=$('#restoreReview'); if(!currentRestorePayload){host.hidden=true;host.innerHTML='';return;}
    const comparisons=backup.compare(currentRestorePayload); host.hidden=false;
    host.innerHTML=`<div class="restore-header"><div><span class="eyebrow">Validated backup</span><h3>Restore Review</h3><p>Created ${esc(formatDateTime(currentRestorePayload.createdAt))}. Loading this backup has not changed current data.</p></div><button type="button" class="secondary" id="downloadSafetyNow">Create Current Master Backup</button></div>
      <label class="restore-hub-settings check-row"><input type="checkbox" id="restoreHubSettings"><span><strong>Restore p8Work hub preferences</strong><small>Theme, layout, clock format, tool order, and other hub preferences.</small></span></label>
      <div class="restore-tools">${comparisons.map(c=>restoreToolMarkup(c)).join('')}</div>
      <div class="restore-actions"><button type="button" class="secondary" id="clearRestoreReview">Cancel</button><button type="button" class="primary" id="reviewRestorePlan">Review Restore Plan</button></div>`;
    $$('.restore-action',host).forEach(sel=>sel.addEventListener('change',()=>toggleSectionReview(sel.dataset.toolId,sel.value)));
    $('#downloadSafetyNow').addEventListener('click',()=>{populateBackupDialog();openDialog('#createBackupDialog');});
    $('#clearRestoreReview').addEventListener('click',()=>{currentRestorePayload=null;currentRestorePassword='';renderRestoreReview();});
    $('#reviewRestorePlan').addEventListener('click',reviewRestorePlan);
  }
  function restoreToolMarkup(c){
    const tool=reg.byId[c.toolId], item=currentRestorePayload.tools&&currentRestorePayload.tools[c.toolId];
    if(!item) return `<article class="restore-tool disabled"><div><h4>${esc(tool.name)}</h4><span class="status-pill">Not in backup</span></div><p>This backup does not contain ${esc(tool.name)}. Current data will not be changed.</p></article>`;
    const warning=c.versionWarning?'<div class="warning-box">This backup uses a newer data schema. Restore is disabled until a compatible tool version is installed.</div>':'';
    const options=c.versionWarning?'<option value="keep">Keep Current</option>':`<option value="keep">Keep Current</option><option value="whole">Restore Entire Tool</option><option value="sections">Review Sections</option>`;
    return `<article class="restore-tool" data-restore-tool="${esc(tool.id)}"><div class="restore-tool-top"><div><h4>${esc(tool.name)}</h4><span class="status-pill status-${esc(c.status)}">${esc(statusLabel(c.status))}</span></div><select class="restore-action" data-tool-id="${esc(tool.id)}" aria-label="Restore action for ${esc(tool.name)}">${options}</select></div>
      <div class="compare-grid"><span><small>Current</small>${esc(metaTime(c.currentMeta))}</span><span><small>Backup</small>${esc(metaTime(c.backupMeta))}</span></div>${warning}
      <div class="section-review" id="sections-${esc(tool.id)}" hidden>${c.sections.map(s=>`<div class="section-row"><div><strong>${esc(s.label)}</strong><small>Current: ${esc(s.currentSummary)} · Backup: ${esc(s.backupSummary)} · ${esc(statusLabel(s.status))}</small></div><select data-section-id="${esc(s.id)}"><option value="keep">Keep Current</option><option value="replace">Use Backup</option>${s.canRestoreMissing?'<option value="missing">Restore Missing Only</option>':''}</select></div>`).join('')}</div>
    </article>`;
  }
  function toggleSectionReview(id,value){const el=$(`#sections-${CSS.escape(id)}`);if(el)el.hidden=value!=='sections';}
  function buildRestorePlan(){
    const plan={restoreHubSettings:!!$('#restoreHubSettings')?.checked,tools:{}};
    reg.tools.forEach(tool=>{const card=$(`[data-restore-tool="${tool.id}"]`);if(!card){plan.tools[tool.id]={action:'keep'};return;}const action=$('.restore-action',card).value;const p={action};if(action==='sections'){p.sections={};$$('.section-row select',card).forEach(s=>p.sections[s.dataset.sectionId]=s.value);}plan.tools[tool.id]=p;});return plan;
  }
  function reviewRestorePlan(){
    const plan=buildRestorePlan(), actions=restore.summarizeActions(plan); if(!actions.length){toast('No restore changes are selected.','info');return;}
    $('#restorePlanBody').innerHTML=`<p>A safety snapshot will be created automatically before anything changes.</p><div class="plan-list">${actions.map(a=>`<div><strong>${esc(a.name)}</strong><span>${a.action==='whole'?'Replace entire tool':a.action==='sections'?'Apply selected sections':'Replace settings'}</span></div>`).join('')}</div><div class="warning-box">Existing information will only be replaced where you explicitly selected a restore action.</div>`;
    $('#applyRestoreConfirm').onclick=()=>applyRestore(plan); openDialog('#restorePlanDialog');
  }
  async function applyRestore(plan){
    try{const result=await restore.apply(currentRestorePayload,plan);closeDialog('#restorePlanDialog');renderBackupStatus();renderSettings();renderHome();$('#restoreReport').hidden=false;$('#restoreReport').innerHTML=`<strong>Restore completed successfully.</strong><span>${result.report.tools.length} tool${result.report.tools.length===1?'':'s'} changed · Verification passed.</span>`;toast('Restore completed and verified.','success');currentRestorePayload=null;renderRestoreReview();}
    catch(e){closeDialog('#restorePlanDialog');renderBackupStatus();toast((e.report&&e.report.rollback==='completed'?'Restore failed and the previous data was restored. ':'Restore failed. ')+(e.message||''),'error');}
  }

  function renderSettings(){
    applyTheme();
    $$('[data-theme-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.themeChoice===settings.theme));
    $$('[data-layout-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.layoutChoice===settings.layout));
    $$('[data-size-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.sizeChoice===settings.cardSize));
    for(const id of ['showGreeting','showDate','showTime','showDescriptions','showVersions','showHomeButtonInTools','rememberLastSection']){const el=$('#'+id);if(el)el.checked=!!settings[id];}
    $$('input[name="clockFormat"]').forEach(r=>r.checked=r.value===settings.clockFormat);
    $('#backupWarningDays').value=settings.backupWarningDays;
    $('#toolOrderList').innerHTML=settings.toolOrder.map((id,i)=>{const t=reg.byId[id];return `<div class="order-row" data-order-id="${esc(id)}"><img src="${esc(t.icon)}" alt=""><span>${esc(t.name)}</span><div><button type="button" class="icon-button move-up" ${i===0?'disabled':''} aria-label="Move ${esc(t.name)} up">↑</button><button type="button" class="icon-button move-down" ${i===settings.toolOrder.length-1?'disabled':''} aria-label="Move ${esc(t.name)} down">↓</button></div></div>`;}).join('');
    $$('.move-up').forEach(b=>b.onclick=()=>moveTool(b.closest('.order-row').dataset.orderId,-1)); $$('.move-down').forEach(b=>b.onclick=()=>moveTool(b.closest('.order-row').dataset.orderId,1));
    const u=updates.status(); $('#offlineStatus').textContent=navigator.onLine?'Online · offline copies maintained automatically':'Offline · local tools are available';
    $('#installP8Work').hidden=u.standalone||!u.installAvailable;
  }
  function moveTool(id,delta){const i=settings.toolOrder.indexOf(id),j=i+delta;if(i<0||j<0||j>=settings.toolOrder.length)return;[settings.toolOrder[i],settings.toolOrder[j]]=[settings.toolOrder[j],settings.toolOrder[i]];saveSettings();}

  async function refreshOfflineReadiness(){
    const detail=$('#offlineCacheDetail'); if(!detail)return;
    try{const r=await updates.offlineReadiness(); detail.textContent=r.available?`${r.cached} of ${r.total} registered tools currently have an offline copy.`:'Offline cache status is available after p8Work is served over HTTPS.';}catch(_){detail.textContent='Offline cache status could not be read.';}
  }

  function renderAbout(){
    $('#aboutToolVersions').innerHTML=reg.tools.map(t=>`<div><img src="${esc(t.icon)}" alt=""><span><strong>${esc(t.name)}</strong><small>v${esc(t.version)} · Schema ${esc(t.schemaVersion)} · Hub Contract ${esc(t.hubContract)}</small></span></div>`).join('');
    $('#aboutOffline').textContent=navigator.onLine?'Online. Registered tools are cached for offline use after initialization.':'Offline. p8Work is using locally cached application files.';
  }

  function bind(){
    $$('.nav-button').forEach(b=>b.onclick=()=>showSection(b.dataset.section));
    $$('[data-theme-choice]').forEach(b=>b.onclick=()=>{settings.theme=b.dataset.themeChoice;saveSettings();});
    $$('[data-layout-choice]').forEach(b=>b.onclick=()=>{settings.layout=b.dataset.layoutChoice;saveSettings();});
    $$('[data-size-choice]').forEach(b=>b.onclick=()=>{settings.cardSize=b.dataset.sizeChoice;saveSettings();});
    ['showGreeting','showDate','showTime','showDescriptions','showVersions','showHomeButtonInTools','rememberLastSection'].forEach(id=>{$('#'+id).addEventListener('change',e=>{settings[id]=e.target.checked;saveSettings();});});
    $$('input[name="clockFormat"]').forEach(r=>r.addEventListener('change',e=>{if(e.target.checked){settings.clockFormat=e.target.value;saveSettings();renderClock();renderBackupStatus();}}));
    $('#backupWarningDays').addEventListener('change',e=>{settings.backupWarningDays=Number(e.target.value)||7;saveSettings();});
    $('#restoreDefaultToolOrder').onclick=()=>{settings.toolOrder=reg.tools.map(t=>t.id);saveSettings();};
    $('#resetHubPreferences').onclick=()=>{if(confirm('Reset p8Work appearance and hub preferences? Tool data will not be changed.')){settings=storage.resetSettings();saveSettings();toast('p8Work preferences reset. Tool data was not changed.','success');}};

    $('#openCreateBackup').onclick=()=>{populateBackupDialog();openDialog('#createBackupDialog');};
    $('#backupEncrypted').onchange=syncBackupEncryptionUI; $('#backupUnencrypted').onchange=syncBackupEncryptionUI; $('#createBackupConfirm').onclick=createMasterFromDialog;
    $$('.dialog-close').forEach(b=>b.onclick=()=>closeDialog('#'+b.closest('dialog').id));
    $('#openRestore').onclick=()=>$('#restoreFile').click(); $('#restoreFile').onchange=e=>{handleRestoreFile(e.target.files[0]);e.target.value='';}; $('#unlockRestore').onclick=unlockRestore;
    $('#openResetCenter').onclick=()=>{$('#resetCenter').hidden=!$('#resetCenter').hidden;};
    $('#resetSelectedTools').onclick=()=>{const ids=$$('#resetToolChoices input:checked').map(x=>x.value);if(!ids.length){toast('Select at least one tool to reset.','info');return;}const names=ids.map(id=>reg.byId[id].name).join(', ');if(confirm(`Reset ${names}? A local safety snapshot will be created first. Other tools will not be changed.`)){try{restore.resetTools(ids);renderBackupStatus();toast('Selected tools were reset. A safety snapshot is available for undo.','success');}catch(e){toast(e.message||String(e),'error');}}};
    $('#factoryResetAll').onclick=()=>{if(confirm('Factory reset p8Work and all four tools? A local safety snapshot will be created first. This clears current local tool data and restores factory behavior on next open.')){if(confirm('Final confirmation: factory reset the entire p8Work installation on this browser profile?')){try{restore.factoryResetAll();settings=storage.loadSettings();saveSettings();renderBackupStatus();toast('p8Work factory reset completed. A safety snapshot is available for undo.','success');}catch(e){toast(e.message||String(e),'error');}}}};
    $('#createBackupBeforeReset').onclick=()=>{populateBackupDialog();openDialog('#createBackupDialog');};
    $('#undoProtectedChange').onclick=()=>{if(confirm('Undo the last protected restore/reset using its safety snapshot? Current affected data will be replaced.')){try{restore.undoLastRestore();renderBackupStatus();renderHome();toast('Previous data restored from the safety snapshot.','success');}catch(e){toast(e.message||String(e),'error');}}};

    $('#checkUpdates').onclick=async()=>{const b=$('#checkUpdates');b.disabled=true;b.textContent='Checking…';const r=await updates.check();b.disabled=false;b.textContent='Check for Updates';toast(r.ok?(r.waiting?'Update ready. Restart when convenient.':'p8Work is up to date.'):'Update check is unavailable right now.',r.ok?'success':'info');};
    $('#restartUpdate').onclick=()=>{if(updates.applyUpdate()){$('#updateBanner').hidden=true;setTimeout(()=>location.reload(),900);}};
    $('#updateLater').onclick=()=>{$('#updateBanner').hidden=true;};
    $('#installP8Work').onclick=async()=>{const r=await updates.promptInstall();if(r.outcome==='accepted')toast('p8Work installation started.','success');};
    window.addEventListener('online',()=>{renderSettings();refreshOfflineReadiness();$('#offlineBanner').hidden=true;$('#offlineBannerTop').hidden=true;}); window.addEventListener('offline',()=>{renderSettings();refreshOfflineReadiness();$('#offlineBanner').hidden=false;$('#offlineBannerTop').hidden=false;});
  }

  async function init(){
    applyTheme(); bind(); renderClock(); setInterval(renderClock,30000); renderHome(); renderBackupStatus(); renderSettings(); renderAbout();
    $('#resetToolChoices').innerHTML=reg.tools.map(t=>`<label class="check-row"><input type="checkbox" value="${esc(t.id)}"><span><strong>${esc(t.name)}</strong><small>Reset only this tool's local data.</small></span></label>`).join('');
    $('#offlineBanner').hidden=navigator.onLine; $('#offlineBannerTop').hidden=navigator.onLine;
    updates.on((type)=>{if(type==='update-ready')$('#updateBanner').hidden=false;if(type==='install-available')renderSettings();if(type==='controller-changed')location.reload();});
    await updates.init(); renderSettings(); await refreshOfflineReadiness();
    const initial=settings.rememberLastSection&&['home','backups','settings','about'].includes(settings.lastSection)?settings.lastSection:'home'; showSection(initial,false);
  }
  document.addEventListener('DOMContentLoaded',init);
}(window));
