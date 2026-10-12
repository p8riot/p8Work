(function (global) {
  "use strict";

  const registry = global.P8WORK_REGISTRY;
  const META_PREFIX = 'p8work-tool-meta:';

  function deepClone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function deepEqual(a,b) { return global.P8WORK_CRYPTO.canonical(a) === global.P8WORK_CRYPTO.canonical(b); }

  function ownedKeys(tool) {
    const keys = [];
    if (tool.storage.type === 'exact') {
      tool.storage.keys.forEach(k => { if (localStorage.getItem(k) != null) keys.push(k); });
    } else if (tool.storage.type === 'prefix') {
      for (let i=0;i<localStorage.length;i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(tool.storage.prefix)) keys.push(k);
      }
    }
    const meta = META_PREFIX + tool.id;
    if (localStorage.getItem(meta) != null) keys.push(meta);
    return Array.from(new Set(keys)).sort();
  }

  function captureEntries(tool) {
    const out = {};
    ownedKeys(tool).forEach(k => { out[k] = localStorage.getItem(k); });
    return out;
  }

  function removeOwned(tool) {
    if (tool.storage.type === 'exact') {
      tool.storage.keys.forEach(k => localStorage.removeItem(k));
    } else {
      const remove=[];
      for (let i=0;i<localStorage.length;i++) {
        const k=localStorage.key(i);
        if (k && k.startsWith(tool.storage.prefix)) remove.push(k);
      }
      remove.forEach(k=>localStorage.removeItem(k));
    }
    localStorage.removeItem(META_PREFIX + tool.id);
  }

  function parseRaw(raw) {
    if (raw == null) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }
  function unwrap(raw) {
    const parsed = parseRaw(raw);
    if (parsed && parsed.__p8riotStorage && Object.prototype.hasOwnProperty.call(parsed,'value')) return parsed.value;
    return parsed;
  }
  function wrapLike(raw, state, schemaVersion) {
    const parsed = parseRaw(raw);
    if (parsed && parsed.__p8riotStorage && Object.prototype.hasOwnProperty.call(parsed,'value')) {
      return JSON.stringify({__p8riotStorage:parsed.__p8riotStorage,schemaVersion:parsed.schemaVersion == null ? schemaVersion : parsed.schemaVersion,value:state});
    }
    return JSON.stringify(state);
  }
  function stateFromEntries(tool, entries) {
    return unwrap(entries && entries[tool.storage.primaryKey]);
  }
  function metaFromEntries(tool, entries) {
    return parseRaw(entries && entries[META_PREFIX + tool.id]) || null;
  }
  function getPath(obj, path) {
    const parts=String(path).split('.'); let cur=obj;
    for (const p of parts) { if (cur == null) return undefined; cur=cur[p]; }
    return cur;
  }
  function setPath(obj, path, value) {
    const parts=String(path).split('.'); let cur=obj;
    for (let i=0;i<parts.length-1;i++) {
      const p=parts[i]; if (!cur[p] || typeof cur[p] !== 'object') cur[p]={}; cur=cur[p];
    }
    cur[parts[parts.length-1]]=deepClone(value);
  }

  function sectionValue(state, section) {
    if (!state || typeof state !== 'object') return null;
    if (section.paths.length === 1) return getPath(state, section.paths[0]);
    const out={};
    section.paths.forEach(p=>{ out[p]=getPath(state,p); });
    return out;
  }
  function summarizeValue(v) {
    if (Array.isArray(v)) return `${v.length} item${v.length===1?'':'s'}`;
    if (v && typeof v === 'object') return `${Object.keys(v).length} field${Object.keys(v).length===1?'':'s'}`;
    if (v == null || v === '') return 'Empty';
    return 'Present';
  }
  function sectionComparison(tool, currentState, backupState) {
    return tool.sections.map(section => {
      const current=sectionValue(currentState,section);
      const backup=sectionValue(backupState,section);
      let status='different';
      if (deepEqual(current,backup)) status='identical';
      else if ((current == null || (Array.isArray(current)&&current.length===0)) && !(backup == null || (Array.isArray(backup)&&backup.length===0))) status='backup-only';
      else if ((backup == null || (Array.isArray(backup)&&backup.length===0)) && !(current == null || (Array.isArray(current)&&current.length===0))) status='current-only';
      return { id:section.id,label:section.label,currentSummary:summarizeValue(current),backupSummary:summarizeValue(backup),status,canRestoreMissing:!!section.mergeMissing };
    });
  }

  function toolComparison(tool, currentEntries, backupEntries) {
    const currentState=stateFromEntries(tool,currentEntries);
    const backupState=stateFromEntries(tool,backupEntries);
    const currentMeta=metaFromEntries(tool,currentEntries);
    const backupMeta=metaFromEntries(tool,backupEntries);
    const identical=deepEqual(currentState,backupState);
    let status='different';
    if (identical) status='identical';
    else if (!currentState && backupState) status='backup-only';
    else if (currentState && !backupState) status='current-only';
    else {
      const ct=currentMeta && Date.parse(currentMeta.lastModifiedAt||'');
      const bt=backupMeta && Date.parse(backupMeta.lastModifiedAt||'');
      if (Number.isFinite(ct) && Number.isFinite(bt) && ct!==bt) status = ct>bt ? 'current-newer' : 'backup-newer';
    }
    return {toolId:tool.id,status,currentState,backupState,currentMeta,backupMeta,sections:sectionComparison(tool,currentState,backupState)};
  }

  function mergeMissingArray(current, backup, idKey) {
    const a=Array.isArray(current)?deepClone(current):[];
    const b=Array.isArray(backup)?backup:[];
    const ids=new Set(a.map(x=>x && x[idKey]).filter(Boolean));
    b.forEach(item=>{ const id=item && item[idKey]; if (id && !ids.has(id)) { a.push(deepClone(item)); ids.add(id); } });
    return a;
  }

  function applySectionPlan(tool,currentState,backupState,sectionActions) {
    let next=deepClone(currentState || {});
    for (const section of tool.sections) {
      const action=(sectionActions && sectionActions[section.id]) || 'keep';
      if (action === 'keep') continue;
      if (action === 'replace') {
        section.paths.forEach(p=>setPath(next,p,getPath(backupState,p)));
      } else if (action === 'missing' && section.mergeMissing) {
        const p=section.mergeMissing.path;
        setPath(next,p,mergeMissingArray(getPath(next,p),getPath(backupState,p),section.mergeMissing.idKey));
      }
    }
    return next;
  }

  function touchMeta(tool, extra) {
    const key=META_PREFIX+tool.id;
    let previous={};
    try { previous=JSON.parse(localStorage.getItem(key)||'{}'); } catch (_) {}
    localStorage.setItem(key,JSON.stringify(Object.assign({},previous,{toolId:tool.id,productVersion:tool.version,schemaVersion:tool.schemaVersion,hubContract:tool.hubContract,lastModifiedAt:new Date().toISOString()},extra||{})));
  }

  function restoreWhole(tool, backupEntries) {
    removeOwned(tool);
    Object.entries(backupEntries||{}).forEach(([k,v])=>{ if (v != null) localStorage.setItem(k,v); });
    touchMeta(tool,{restoredAt:new Date().toISOString()});
  }

  function restoreSections(tool, backupEntries, sectionActions) {
    const currentEntries=captureEntries(tool);
    const currentState=stateFromEntries(tool,currentEntries) || {};
    const backupState=stateFromEntries(tool,backupEntries) || {};
    const next=applySectionPlan(tool,currentState,backupState,sectionActions);
    const currentRaw=currentEntries[tool.storage.primaryKey];
    const backupRaw=backupEntries && backupEntries[tool.storage.primaryKey];
    const template=currentRaw != null ? currentRaw : backupRaw;
    localStorage.setItem(tool.storage.primaryKey,wrapLike(template,next,tool.schemaVersion));
    (tool.storage.transientKeys||[]).forEach(k=>localStorage.removeItem(k));
    touchMeta(tool,{restoredAt:new Date().toISOString()});
  }

  function resetTool(tool) { removeOwned(tool); }

  global.P8WORK_ADAPTERS = Object.freeze({ META_PREFIX, ownedKeys, captureEntries, stateFromEntries, metaFromEntries, toolComparison, restoreWhole, restoreSections, resetTool, removeOwned, touchMeta, deepEqual });
}(window));
