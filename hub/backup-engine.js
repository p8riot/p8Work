(function (global) {
  "use strict";
  const APP_VERSION='1.3.2';
  const RELEASE='Beta 4';
  const FORMAT=1;
  const reg=global.P8WORK_REGISTRY;
  const adapters=global.P8WORK_ADAPTERS;
  const cryptoApi=global.P8WORK_CRYPTO;
  const storage=global.P8WORK_STORAGE;

  function fileStamp() {
    const d=new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  }
  function downloadBlob(blob,filename) {
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=filename; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  async function buildPayload(toolIds) {
    const payload={
      type:'p8work-master-backup',formatVersion:FORMAT,createdAt:new Date().toISOString(),
      app:{name:'p8Work',version:APP_VERSION,releaseStage:RELEASE,hubContract:1},
      hub:{settings:storage.loadSettings(),history:storage.loadHistory()},tools:{},integrity:null
    };
    for (const id of toolIds) {
      const tool=reg.byId[id]; if (!tool) continue;
      const captured=adapters.captureEntries(tool);
      const preserved=global.P8WORK_PRESERVATION.prepareEntries(tool,captured);
      const entries=id==='consultation-form-manager' ? await global.P8WORK_MAR_MEDIA.exportEntries(preserved) : preserved;
      const meta=adapters.metaFromEntries(tool,entries);
      payload.tools[id]={toolId:id,name:tool.name,productVersion:tool.version,schemaVersion:tool.schemaVersion,hubContract:tool.hubContract,capturedAt:new Date().toISOString(),meta,entries};
      payload.tools[id].checksum=await cryptoApi.sha256Text(cryptoApi.canonical(entries));
    }
    const clone=JSON.parse(JSON.stringify(payload)); clone.integrity=null;
    payload.integrity={algorithm:'SHA-256',checksum:await cryptoApi.sha256Text(cryptoApi.canonical(clone))};
    return payload;
  }
  async function verifyPayload(payload) {
    if (!payload || payload.type!=='p8work-master-backup' || Number(payload.formatVersion)!==FORMAT) throw new Error('This is not a supported p8Work Master Backup.');
    if (!payload.integrity || !payload.integrity.checksum) throw new Error('Backup integrity information is missing.');
    const clone=JSON.parse(JSON.stringify(payload)); clone.integrity=null;
    const sum=await cryptoApi.sha256Text(cryptoApi.canonical(clone));
    if (sum!==payload.integrity.checksum) throw new Error('Backup validation failed. The file may be damaged or modified.');
    for (const [id,item] of Object.entries(payload.tools||{})) {
      const sum2=await cryptoApi.sha256Text(cryptoApi.canonical(item.entries||{}));
      if (item.checksum!==sum2) throw new Error(`Backup validation failed for ${item.name||id}.`);
    }
    return true;
  }
  async function createBackup(options) {
    const ids=Array.isArray(options.toolIds)?options.toolIds:reg.tools.map(t=>t.id);
    const payload=await buildPayload(ids);
    let fileObject, filename;
    if (options.encrypted!==false) {
      if (!options.password || options.password.length<8) throw new Error('Use a backup password with at least 8 characters.');
      const envelope=await cryptoApi.encryptJson(payload,options.password);
      // Round-trip verification before success.
      const decoded=await cryptoApi.decryptJson(envelope,options.password); await verifyPayload(decoded);
      fileObject=envelope; filename=`p8Work_Master_Backup_${fileStamp()}.wtb`;
    } else {
      await verifyPayload(payload); fileObject=payload; filename=`p8Work_Master_Backup_UNENCRYPTED_${fileStamp()}.wtb.json`;
    }
    const blob=new Blob([JSON.stringify(fileObject,null,2)+'\n'],{type:'application/json'});
    storage.setBackupMeta({createdAt:payload.createdAt,toolIds:ids,encrypted:options.encrypted!==false,verified:true});
    if (options.download!==false) downloadBlob(blob,filename);
    return {payload,blob,filename};
  }
  async function openBackupText(text,password) {
    let obj;
    try { obj=JSON.parse(text); } catch (_) { throw new Error('The selected file is not valid JSON.'); }
    let payload=obj;
    if (obj && obj.type==='p8work-master-backup-encrypted') {
      if (!password) return {needsPassword:true,envelope:obj};
      payload=await cryptoApi.decryptJson(obj,password);
    }
    await verifyPayload(payload);
    return {needsPassword:false,payload,encrypted:obj.type==='p8work-master-backup-encrypted'};
  }
  function compare(payload) {
    return reg.tools.map(tool=>{
      const current=adapters.captureEntries(tool);
      const backupItem=payload.tools && payload.tools[tool.id];
      const backup=backupItem?backupItem.entries:{};
      const result=adapters.toolComparison(tool,current,backup);
      result.inBackup=!!backupItem;
      result.backupVersion=backupItem&&backupItem.productVersion;
      result.backupSchema=backupItem&&backupItem.schemaVersion;
      result.versionWarning=!!(backupItem && Number(backupItem.schemaVersion)>Number(tool.schemaVersion));
      return result;
    });
  }
  global.P8WORK_BACKUP=Object.freeze({APP_VERSION,RELEASE,FORMAT,buildPayload,verifyPayload,createBackup,openBackupText,compare,downloadBlob});
}(window));
