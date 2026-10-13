/* p8Work File Library: local, independent Blob copies; no server transfer. */
(function (global) {
 'use strict';
 const DB_NAME='p8work-file-library-v1', META='entries', DATA='fileBlobs', BACKUP_TYPE='p8work-file-library-backup', FORMAT=1, MAX_LIBRARY_BYTES=160*1024*1024;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const now=()=>new Date().toISOString();
 const uid=()=>global.crypto.randomUUID();
 const fmt=b=>{let n=Number(b)||0;for(const u of ['B','KB','MB','GB']){if(n<1024||u==='GB')return `${n.toFixed(u==='B'?0:1)} ${u}`;n/=1024;}};
 const safeName=s=>{const v=String(s||'').trim().replace(/[\x00-\x1f\x7f]/g,'').slice(0,180);if(!v||v==='.'||v==='..')throw Error('Enter a valid name.');return v;};
 const date=s=>s?new Date(s).toLocaleDateString():'';
 let dbp, cache=[], locationId=null, view='folder', selectedId=null, pendingRestore=null, openObjectUrl=null, busy=false;
 const catOptions=['General','Client Documents','Medication Records','Consultation Forms','Forms & Templates','Scheduling','Reports','Other'];
 const api={};
 function db(){
  if(!indexedDB)return Promise.reject(Error('File storage is not available in this browser.'));
  if(!dbp)dbp=new Promise((resolve,reject)=>{
   const r=indexedDB.open(DB_NAME,1);
   r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'id'});if(!d.objectStoreNames.contains(DATA))d.createObjectStore(DATA);};
   r.onsuccess=()=>{const d=r.result;d.onversionchange=()=>{d.close();dbp=null;};resolve(d);};
   r.onerror=()=>reject(r.error||Error('Could not open the File Library database.'));
   r.onblocked=()=>reject(Error('Close other p8Work tabs before continuing.'));
  }).catch(e=>{dbp=null;throw e;});
  return dbp;
 }
 async function txRun(stores,mode,callback){
  const d=await db(); return new Promise((resolve,reject)=>{
   let answer;const tx=d.transaction(stores,mode);
   tx.oncomplete=()=>resolve(answer);tx.onabort=()=>reject(tx.error||Error('Storage operation was interrupted; no changes were saved.'));tx.onerror=()=>{};
   try{answer=callback(tx);}catch(err){try{tx.abort();}catch(_){}reject(err);}
  });
 }
 function readRequest(store,operation){return new Promise((resolve,reject)=>{const r=operation(store);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('Could not read a saved file.'));});}
 async function list(){const d=await db();return readRequest(d.transaction(META,'readonly').objectStore(META),s=>s.getAll());}
 async function getFile(id){const d=await db();const blob=await readRequest(d.transaction(DATA,'readonly').objectStore(DATA),s=>s.get(id));if(!(blob instanceof Blob))throw Error('The saved file is missing or damaged. Export a backup or recover it before deleting any originals.');return blob;}
 const byId=id=>cache.find(e=>e.id===id);
 function parents(id){const out=[],seen=new Set();while(id){if(seen.has(id))break;seen.add(id);const e=byId(id);if(!e)break;out.push(e);id=e.parentId;}return out;}
 function descendants(id){const ids=new Set([id]);let changed=true;while(changed){changed=false;for(const e of cache){if(e.parentId&&ids.has(e.parentId)&&!ids.has(e.id)){ids.add(e.id);changed=true;}}}return ids;}
 function deleted(e){return [e,...parents(e.parentId)].some(v=>!!v.trashedAt);}
 function archived(e){return [e,...parents(e.parentId)].some(v=>!!v.archived);}
 function visible(e){return !deleted(e)&&!archived(e);}
 function state(e){return deleted(e)?'trash':archived(e)?'archive':'active';}
 function validParent(id,item){if(!id)return true;const p=byId(id);if(!p||p.kind!=='folder'||!visible(p))return false;if(item&&descendants(item.id).has(id))return false;return true;}
 function collision(parentId,name,ignoreId){return cache.some(e=>e.id!==ignoreId&&e.parentId===parentId&&!e.trashedAt&&e.name.toLowerCase()===name.toLowerCase());}
 async function change(item){await txRun([META],'readwrite',tx=>tx.objectStore(META).put(item));await refresh();}
 async function refresh(){cache=await list();render();}
 function notify(msg,error=false){const e=$('#libraryNotice');if(!e)return;e.textContent=msg;e.dataset.error=error?'yes':'no';e.hidden=false;}
 function setBusy(val){busy=val;for(const b of document.querySelectorAll('#section-library button,#section-library input,#section-library select'))b.disabled=val;}
 async function run(fn){if(busy)return;setBusy(true);try{await fn();}catch(e){notify(e.message||String(e),true);}finally{setBusy(false);}}
 function stat(){const active=cache.filter(e=>visible(e));return `${active.filter(e=>e.kind==='file').length} files · ${active.filter(e=>e.kind==='folder').length} folders · ${fmt(active.filter(e=>e.kind==='file').reduce((a,e)=>a+e.size,0))} locally stored`}
 function crumb(){const chain=parents(locationId).reverse();return `<button type="button" data-lib-nav="">My Files</button>${chain.map(p=>` <span>›</span> <button type="button" data-lib-nav="${esc(p.id)}">${esc(p.name)}</button>`).join('')}`;}
 function folderOptions(current){const base=cache.filter(x=>x.kind==='folder'&&visible(x)&&(!current||!descendants(current.id).has(x.id))).sort((a,b)=>a.name.localeCompare(b.name));return `<option value="">My Files (root)</option>`+base.map(x=>`<option value="${esc(x.id)}">${esc([...parents(x.id)].reverse().map(p=>p.name).join(' / '))}</option>`).join('');}
 function render(){
  const host=$('#libraryItems');if(!host)return;
  if(locationId&&(!byId(locationId)||state(byId(locationId))!=='active'))locationId=null;
  $('#libraryStats').textContent=stat();$('#libraryBreadcrumbs').innerHTML=view==='folder'?crumb():`<strong>${view==='archive'?'Archive':view==='trash'?'Trash':'Search results'}</strong>`;
  const filter=$('#libraryCategory'),selectedCategory=filter.value;
  const categories=[...new Set([...catOptions,...cache.map(e=>e.category).filter(Boolean)])].sort((a,b)=>a.localeCompare(b));
  filter.innerHTML='<option value="">All categories</option>'+categories.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  filter.value=selectedCategory;
  const q=$('#librarySearch').value.trim().toLowerCase(),cat=filter.value,sort=$('#librarySort').value;
  let rows=cache.filter(e=>{
   if(view==='folder')return visible(e)&&(q?true:e.parentId===locationId);
   if(view==='archive')return state(e)==='archive'&&(!e.parentId||state(byId(e.parentId)||{})!=='archive');
   if(view==='trash')return state(e)==='trash'&&(!e.parentId||state(byId(e.parentId)||{})!=='trash');
   return visible(e);
  });
  if(q)rows=rows.filter(e=>`${e.name} ${e.category||''} ${(e.tags||[]).join(' ')} ${e.originalName||''}`.toLowerCase().includes(q));
  if(cat)rows=rows.filter(e=>e.category===cat);
  rows.sort((a,b)=>sort==='newest'?b.createdAt.localeCompare(a.createdAt):sort==='oldest'?a.createdAt.localeCompare(b.createdAt):sort==='largest'?(b.size||0)-(a.size||0):a.kind===b.kind?a.name.localeCompare(b.name):a.kind==='folder'?-1:1);
  if(!rows.length){host.innerHTML='<p class="library-empty">No items here. Drag in files or create a folder to begin.</p>';}
  else host.innerHTML=rows.map(e=>`<article class="library-item" data-lib-item="${esc(e.id)}"><span class="library-glyph" aria-hidden="true">${e.kind==='folder'?'📁':e.type.startsWith('image/')?'🖼️':e.type==='application/pdf'?'📕':'📄'}</span><div class="library-detail"><strong title="${esc(e.name)}">${esc(e.name)}</strong><small>${esc(e.kind==='folder'?'Folder':fmt(e.size))}${e.category?' · '+esc(e.category):''}${e.trashedAt?' · Deleted '+date(e.trashedAt):''}${e.archived?' · Archived':''}</small><small>${esc((e.tags||[]).join(', '))}</small></div><div class="library-item-actions"><button type="button" class="secondary" data-lib-open="${esc(e.id)}">${e.kind==='folder'&&state(e)==='active'?'Open':'Details'}</button>${e.kind==='folder'&&state(e)==='active'?`<button type="button" class="secondary" data-lib-manage="${esc(e.id)}">Manage</button>`:''}</div></article>`).join('');
  $$('.library-item').forEach(x=>{x.ondblclick=()=>openEntry(x.dataset.libItem);});
  $('#libraryNavCurrent').textContent=view==='folder'?'Files':view==='archive'?'Archive':'Trash';
  const editReady=view==='folder';$('#libraryNewFolder').disabled=!editReady||busy;$('#libraryImportButton').disabled=!editReady||busy;
 }
 const $$=s=>Array.from(document.querySelectorAll(s));
 async function openEntry(id){const e=byId(id);if(!e)return;if(e.kind==='folder'&&state(e)==='active'){locationId=id;view='folder';$('#librarySearch').value='';render();return;}selectedId=id;renderDetails();}
 function renderDetails(){const e=byId(selectedId);if(!e)return;const el=$('#libraryDetailContent');let actions='';
  if(state(e)==='active')actions=`<button type="button" class="secondary" data-lib-act="rename">Rename</button><button type="button" class="secondary" data-lib-act="move">Move</button><button type="button" class="secondary" data-lib-act="categorize">Category & Tags</button><button type="button" class="secondary" data-lib-act="archive">Archive</button><button type="button" class="danger" data-lib-act="trash">Move to Trash</button>`;
  if(state(e)==='archive')actions=`<button type="button" class="secondary" data-lib-act="unarchive">Unarchive</button><button type="button" class="danger" data-lib-act="trash">Move to Trash</button>`;
  if(state(e)==='trash')actions=`<button type="button" class="secondary" data-lib-act="restore">Restore</button><button type="button" class="danger" data-lib-act="delete">Delete Permanently</button>`;
  if(e.kind==='file')actions=`<button type="button" class="primary" data-lib-act="download">Download Copy</button><button type="button" class="secondary" data-lib-act="preview">Preview</button>`+actions;
  el.innerHTML=`<h2>${esc(e.name)}</h2><p class="subtitle">${esc(e.kind==='file'?`${fmt(e.size)} · ${e.type||'Unknown type'}`:'Folder')} · Added ${esc(date(e.createdAt))}</p><p class="subtitle">Category: ${esc(e.category||'General')} · Tags: ${esc((e.tags||[]).join(', ')||'None')}</p><div class="library-detail-actions">${actions}</div>`;
  $('#libraryDetailDialog').showModal();
 }
 function promptValue(title,defaultValue){const v=prompt(title,defaultValue);return v===null?null:safeName(v);}
 async function createFolder(){const name=promptValue('New folder name');if(!name)return;if(collision(locationId,name))throw Error('An item with that name already exists here.');const e={id:uid(),kind:'folder',name,parentId:locationId,category:'General',tags:[],archived:false,trashedAt:null,createdAt:now(),updatedAt:now()};await change(e);notify('Folder created.');}
 async function addFiles(files){if(!files||!files.length)return;let done=0,errors=[];
  for(const file of Array.from(files)){
   try{
    if(!file||!file.name||file.size===0)throw Error('Empty files cannot be imported.');
    if(file.size>MAX_LIBRARY_BYTES)throw Error('A file exceeds the supported 160 MB library limit.');
    const used=cache.filter(e=>e.kind==='file').reduce((sum,e)=>sum+(Number(e.size)||0),0);
    if(used+file.size>MAX_LIBRARY_BYTES)throw Error('Import would exceed the 160 MB File Library limit. Delete unneeded files permanently and make an encrypted backup before importing more.');
    const name=safeName(file.name);if(collision(locationId,name))throw Error('A file with this name already exists in this folder. Rename the original or move the existing copy first.');
    const id=uid(), blob=file.slice(0,file.size,file.type||'application/octet-stream');
    const entry={id,kind:'file',name,originalName:file.name,parentId:locationId,category:'General',tags:[],size:file.size,type:file.type||'application/octet-stream',archived:false,trashedAt:null,createdAt:now(),updatedAt:now()};
    await txRun([META,DATA],'readwrite',tx=>{tx.objectStore(DATA).put(blob,id);tx.objectStore(META).put(entry);});
    done++;cache.push(entry);
   }catch(err){errors.push(`${file.name}: ${err.message||err}`);}
  }
  await refresh();notify(`${done} file${done===1?'':'s'} imported as independent local copies.${errors.length?' '+errors.length+' failed: '+errors.slice(0,2).join('; '):''}`,!!errors.length);
 }
 async function act(action){const original=byId(selectedId);if(!original)return;const e={...original,tags:[...(original.tags||[])]};
  if(action==='download'){const blob=await getFile(e.id);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=e.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return;}
  if(action==='preview'){const blob=await getFile(e.id);if(openObjectUrl){URL.revokeObjectURL(openObjectUrl);openObjectUrl=null;}
   let preview;if(e.type.startsWith('image/')){openObjectUrl=URL.createObjectURL(blob);preview=`<img alt="File preview" src="${openObjectUrl}">`;}
   else if(e.type==='application/pdf'){openObjectUrl=URL.createObjectURL(blob);preview=`<iframe title="PDF preview" sandbox="allow-same-origin" src="${openObjectUrl}"></iframe>`;}
   else if(/^text\/(plain|csv|markdown)$/.test(e.type)||/\.(txt|md|csv|json)$/i.test(e.name)){if(blob.size>1024*1024)throw Error('Text preview supports files under 1 MB. Download this file to open it.');preview=`<pre>${esc(await blob.text())}</pre>`;}
   else preview='<p>This file type cannot be previewed here. Use Download Copy to open it in an appropriate application.</p>';
   $('#libraryPreviewBody').innerHTML=preview;$('#libraryPreviewDialog').showModal();return;
  }
  if(action==='rename'){const name=promptValue('Rename file or folder',e.name);if(name===null)return;if(collision(e.parentId,name,e.id))throw Error('An item with that name already exists here.');e.name=name;e.updatedAt=now();await change(e);}
  else if(action==='categorize'){const category=prompt(`Category (${catOptions.join(', ')})`,e.category||'General');if(category===null)return;const nextCategory=safeName(category);const tags=prompt('Tags, separated by commas',(e.tags||[]).join(', '));if(tags===null)return;e.category=nextCategory;e.tags=[...new Set(tags.split(',').map(s=>s.trim().slice(0,60)).filter(Boolean))].slice(0,20);e.updatedAt=now();await change(e);}
  else if(action==='move'){
   const choice=$('#libraryMoveTo');choice.innerHTML=folderOptions(e);choice.value=e.parentId||'';$('#libraryMoveName').textContent=e.name;$('#libraryMoveDialog').showModal();return;
  }
  else if(action==='archive'){if(!confirm(`Archive “${e.name}”${e.kind==='folder'?' and its contents':''}?`))return;e.archived=true;e.updatedAt=now();await change(e);}
  else if(action==='unarchive'){const activeParent=e.parentId&&byId(e.parentId)&&visible(byId(e.parentId));e.parentId=activeParent?e.parentId:null;e.archived=false;e.updatedAt=now();await change(e);}
  else if(action==='trash'){if(!confirm(`Move “${e.name}”${e.kind==='folder'?' and everything inside it':''} to Trash?`))return;e.trashedAt=now();e.updatedAt=now();await change(e);}
  else if(action==='restore'){const activeParent=e.parentId&&byId(e.parentId)&&visible(byId(e.parentId));e.parentId=activeParent?e.parentId:null;e.trashedAt=null;e.archived=false;if(collision(e.parentId,e.name,e.id))e.name=`${e.name} (restored ${Date.now()})`;e.updatedAt=now();await change(e);}
  else if(action==='delete'){
   if(!confirm(`Permanently delete “${e.name}”${e.kind==='folder'?' and ALL files inside it':''}? This cannot be undone without a backup.`))return;
   const ids=descendants(e.id);await txRun([META,DATA],'readwrite',tx=>{for(const id of ids){tx.objectStore(META).delete(id);tx.objectStore(DATA).delete(id);}});await refresh();notify(`${ids.size} item${ids.size===1?'':'s'} permanently deleted.`);
  }
  if(action!=='preview'&&action!=='download')$('#libraryDetailDialog').close();
 }
 async function moveSelected(){const source=byId(selectedId),e=source&&{...source,tags:[...(source.tags||[])]},destination=$('#libraryMoveTo').value||null;if(!e)return;if(!validParent(destination,e))throw Error('You cannot move a folder into itself, its descendants, or an unavailable folder.');if(collision(destination,e.name,e.id))throw Error('An item with that name already exists at the destination.');e.parentId=destination;e.updatedAt=now();await change(e);$('#libraryMoveDialog').close();$('#libraryDetailDialog').close();notify('Item moved.');}
 function decode(b64){const raw=atob(b64),result=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)result[i]=raw.charCodeAt(i);return result;}
 function encode(bytes){let out='';for(let i=0;i<bytes.length;i+=0x8000)out+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(out);}
 async function checksum(blob){const arr=await blob.arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',arr))].map(n=>n.toString(16).padStart(2,'0')).join('');}
 async function buildBackup(){const entries=await list(),files=[];let total=0;
  for(const item of entries){if(item.kind!=='file')continue;total+=item.size;if(total>MAX_LIBRARY_BYTES)throw Error('The library exceeds this encrypted backup format’s 160 MB limit. Export smaller sets or contact IT about approved storage before deleting any originals.');
   const blob=await getFile(item.id);if(blob.size!==item.size)throw Error(`File size mismatch: ${item.name}. Backup stopped.`);
   files.push({id:item.id,type:blob.type,size:blob.size,sha256:await checksum(blob),data:encode(new Uint8Array(await blob.arrayBuffer()))});
  }
  return {type:BACKUP_TYPE,formatVersion:FORMAT,createdAt:now(),entries,files};
 }
 async function verifyBackup(payload){if(!payload||payload.type!==BACKUP_TYPE||payload.formatVersion!==FORMAT||!Array.isArray(payload.entries)||!Array.isArray(payload.files))throw Error('This is not a supported File Library backup.');
  const seen=new Set(),map=new Map();if(payload.entries.length>20000)throw Error('The backup has too many entries.');
  for(const e of payload.entries){if(!e||typeof e.id!=='string'||!['file','folder'].includes(e.kind)||seen.has(e.id)||typeof e.name!=='string'||e.name.length>180)throw Error('Backup contains invalid or duplicate library entries.');seen.add(e.id);map.set(e.id,e);}
  for(const e of payload.entries){if(e.parentId&&!map.has(e.parentId))throw Error('Backup folder hierarchy has a missing parent.');if(e.parentId&&map.get(e.parentId).kind!=='folder')throw Error('Backup parent is not a folder.');const visited=new Set([e.id]);let p=e.parentId;while(p){if(visited.has(p))throw Error('Backup folder hierarchy contains a cycle.');visited.add(p);p=map.get(p).parentId;}}
  const blobMap=new Map();let total=0;
  for(const f of payload.files){if(!f||!map.has(f.id)||map.get(f.id).kind!=='file'||blobMap.has(f.id)||typeof f.data!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256))throw Error('Backup contains invalid file data.');total+=Number(f.size)||0;if(total>MAX_LIBRARY_BYTES)throw Error('Backup exceeds the supported 160 MB limit.');const bytes=decode(f.data);if(bytes.length!==f.size)throw Error(`Backup file size mismatch for ${f.id}.`);const blob=new Blob([bytes],{type:f.type||'application/octet-stream'});if(await checksum(blob)!==f.sha256)throw Error(`Backup checksum failed for ${f.id}.`);blobMap.set(f.id,blob);}
  if(payload.entries.filter(e=>e.kind==='file').length!==blobMap.size)throw Error('One or more backed-up files are missing. Nothing has been restored.');return blobMap;
 }
 function downloadBackup(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 async function exportBackup(){const pw=$('#libraryBackupPassword').value,pw2=$('#libraryBackupConfirm').value;if(pw.length<8||pw!==pw2)throw Error('Choose matching backup passwords, at least eight characters long.');const contents=await buildBackup();await verifyBackup(contents);const envelope=await global.P8WORK_CRYPTO.encryptJson(contents,pw);envelope.type='p8work-file-library-backup-encrypted';const verified=await global.P8WORK_CRYPTO.decryptJson(envelope,pw);await verifyBackup(verified);const stamp=new Date().toISOString().slice(0,10);downloadBackup(new Blob([JSON.stringify(envelope)],{type:'application/octet-stream'}),`p8Work_File_Library_${stamp}.p8lib`);$('#libraryBackupPassword').value='';$('#libraryBackupConfirm').value='';notify(`Encrypted library backup verified and downloaded: ${contents.entries.length} entries, ${contents.files.length} files. Store the password separately and test a restore before removing originals.`);}
 async function prepareRestore(file){if(file.size>400*1024*1024)throw Error('Backup file is too large for in-browser restore.');let envelope;try{envelope=JSON.parse(await file.text());}catch(_){throw Error('This is not a valid File Library backup file.');}
  if(envelope.type!=='p8work-file-library-backup-encrypted')throw Error('Select an encrypted .p8lib File Library backup.');const password=prompt('Enter the File Library backup password');if(password===null)return;const payload=await global.P8WORK_CRYPTO.decryptJson(envelope,password);const blobs=await verifyBackup(payload);pendingRestore={payload,blobs};$('#libraryRestoreSummary').textContent=`Validated ${payload.files.length} files and ${payload.entries.length} entries from ${date(payload.createdAt)}. No data has changed. Merge adds a separate restored copy. Replace removes the current library only if the complete restore can be committed.`;$('#libraryRestoreDialog').showModal();}
 async function restoreBackup(mode){if(!pendingRestore)throw Error('Choose and validate a backup first.');const {payload,blobs}=pendingRestore;
  if(mode==='replace'&&!confirm('Replace the ENTIRE current File Library with this backup? Existing library files not in the backup will be deleted. This cannot be undone without a separate backup.'))return;
  const existing=mode==='merge'?await list():[];const oldIds=new Set(existing.map(e=>e.id));const idMap=new Map(payload.entries.map(e=>[e.id,mode==='merge'?uid():e.id]));
  const entries=payload.entries.map(e=>{let name=e.name;if(mode==='merge'&&!e.parentId){const dot=e.kind==='file'?name.lastIndexOf('.'): -1;name=dot>0?name.slice(0,dot)+' (restored)'+name.slice(dot):name+' (restored)';}return {...e,id:idMap.get(e.id),parentId:e.parentId?idMap.get(e.parentId):null,name,updatedAt:now()};});
  const originalIdByNew=new Map([...idMap].map(([oldId,newId])=>[newId,oldId]));
  await txRun([META,DATA],'readwrite',tx=>{
   const es=tx.objectStore(META),bs=tx.objectStore(DATA);
   if(mode==='replace'){es.clear();bs.clear();}
   for(const e of entries){if(mode==='merge'&&oldIds.has(e.id))throw Error('Duplicate restored item ID.');es.put(e);if(e.kind==='file')bs.put(blobs.get(originalIdByNew.get(e.id)),e.id);}
  });
  pendingRestore=null;$('#libraryRestoreDialog').close();locationId=null;view='folder';await refresh();notify(`Library restore completed (${mode}): ${entries.length} items. Verify sample files before deleting the backup.`);
 }
 function bind(){
  const section=$('#section-library');if(!section)return;
  $('#libraryNavFiles').onclick=()=>{view='folder';locationId=null;$('#librarySearch').value='';render();};
  $('#libraryNavArchive').onclick=()=>{view='archive';render();};$('#libraryNavTrash').onclick=()=>{view='trash';render();};
  $('#libraryNewFolder').onclick=()=>run(createFolder);
  $('#libraryImportButton').onclick=()=>$('#libraryFilePicker').click();
  $('#libraryFilePicker').onchange=e=>{const files=Array.from(e.target.files||[]);e.target.value='';run(()=>addFiles(files));};
  const drop=$('#libraryDrop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag-active');});
  drop.addEventListener('dragleave',e=>{if(!drop.contains(e.relatedTarget))drop.classList.remove('drag-active');});
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag-active');if(view!=='folder')return notify('Open Files to import documents.',true);run(()=>addFiles(e.dataTransfer.files));});
  for(const id of ['librarySearch','libraryCategory','librarySort'])$('#'+id).addEventListener(id==='librarySearch'?'input':'change',()=>render());
  section.addEventListener('click',e=>{const nav=e.target.closest('[data-lib-nav]'),op=e.target.closest('[data-lib-open]'),manage=e.target.closest('[data-lib-manage]');if(nav){locationId=nav.dataset.libNav||null;view='folder';render();}else if(manage){selectedId=manage.dataset.libManage;renderDetails();}else if(op)openEntry(op.dataset.libOpen);});
  $('#libraryMoveConfirm').onclick=()=>run(moveSelected);
  $('#libraryBackupButton').onclick=()=>run(exportBackup);
  $('#libraryRestoreFile').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)run(()=>prepareRestore(file));};
  $('#libraryRestoreMerge').onclick=()=>run(()=>restoreBackup('merge'));
  $('#libraryRestoreReplace').onclick=()=>run(()=>restoreBackup('replace'));
  $('#libraryPreviewDialog').addEventListener('close',()=>{if(openObjectUrl)URL.revokeObjectURL(openObjectUrl);openObjectUrl=null;$('#libraryPreviewBody').replaceChildren();});
  for(const button of $$('.library-dialog-close'))button.onclick=()=>button.closest('dialog').close();
  $('#libraryDetailDialog').addEventListener('click',e=>{const b=e.target.closest('[data-lib-act]');if(b)run(()=>act(b.dataset.libAct));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')drop.classList.remove('drag-active');});
 }
 async function init(){if(!$('#section-library'))return;bind();try{await refresh();}catch(e){notify('File Library unavailable: '+e.message,true);}}
 global.P8WORK_FILE_LIBRARY=Object.freeze({init,refresh,buildBackup,verifyBackup,restoreBackup,getFile,list});
})(window);
