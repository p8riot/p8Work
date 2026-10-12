(function (global) {
  "use strict";
  const reg=global.P8WORK_REGISTRY, adapters=global.P8WORK_ADAPTERS, store=global.P8WORK_STORAGE;

  function captureSafety(toolIds, includeHub) {
    const snap={type:'p8work-safety-snapshot',createdAt:new Date().toISOString(),tools:{},hub:null};
    toolIds.forEach(id=>{ const tool=reg.byId[id]; if (tool) snap.tools[id]={entries:adapters.captureEntries(tool)}; });
    if (includeHub) snap.hub={settings:store.loadSettings(),history:store.loadHistory()};
    store.setSafety(snap); return snap;
  }
  function restoreSafety(snapshot) {
    if (!snapshot || snapshot.type!=='p8work-safety-snapshot') throw new Error('No valid safety snapshot is available.');
    Object.entries(snapshot.tools||{}).forEach(([id,item])=>{ const tool=reg.byId[id]; if (tool) adapters.restoreWhole(tool,item.entries||{}); });
    if (snapshot.hub&&snapshot.hub.settings) store.saveSettings(snapshot.hub.settings);
    if (snapshot.hub&&snapshot.hub.history) store.saveHistory(snapshot.hub.history);
  }
  function summarizeActions(plan) {
    const lines=[];
    Object.entries(plan.tools||{}).forEach(([id,p])=>{ const t=reg.byId[id]; if (!t||p.action==='keep') return; lines.push({toolId:id,name:t.name,action:p.action,sections:p.sections||{}}); });
    if (plan.restoreHubSettings) lines.push({toolId:'hub',name:'p8Work settings',action:'replace'});
    return lines;
  }
  function affectedIds(plan) { return Object.entries(plan.tools||{}).filter(([,p])=>p.action&&p.action!=='keep').map(([id])=>id); }

  async function apply(payload,plan) {
    const ids=affectedIds(plan);
    const safety=captureSafety(ids,!!plan.restoreHubSettings);
    const report={id:'restore-'+Date.now(),createdAt:new Date().toISOString(),status:'success',tools:[],restoreHubSettings:!!plan.restoreHubSettings};
    try {
      for (const id of ids) {
        const tool=reg.byId[id], p=plan.tools[id], item=payload.tools&&payload.tools[id];
        if (!tool||!item) continue;
        const entries=id==='consultation-form-manager' ? await global.P8WORK_MAR_MEDIA.prepareEntries(item.entries||{}) : (item.entries||{});
        if (p.action==='whole') adapters.restoreWhole(tool,entries);
        else if (p.action==='sections') adapters.restoreSections(tool,entries,p.sections||{});
        // verify the tool can still be decoded after write
        const now=adapters.captureEntries(tool); const state=adapters.stateFromEntries(tool,now);
        if (state == null) throw new Error(`${tool.name} could not be verified after restore.`);
        report.tools.push({toolId:id,name:tool.name,action:p.action,sections:p.sections||null});
      }
      if (plan.restoreHubSettings && payload.hub && payload.hub.settings) { store.saveSettings(payload.hub.settings); if (payload.hub.history) store.saveHistory(payload.hub.history); }
      store.addRestoreReport(report);
      return {report,safety};
    } catch (error) {
      report.status='failed'; report.error=error.message||String(error);
      try { restoreSafety(safety); report.rollback='completed'; } catch (rollbackError) { report.rollback='failed'; report.rollbackError=rollbackError.message||String(rollbackError); }
      store.addRestoreReport(report);
      throw Object.assign(new Error(report.error),{report});
    }
  }
  function undoLastRestore() {
    const safety=store.getSafety(); if (!safety) throw new Error('No restore safety snapshot is available.');
    restoreSafety(safety); store.clearSafety();
    return true;
  }
  function resetTools(toolIds) {
    const ids=toolIds.filter(id=>reg.byId[id]);
    const safety=captureSafety(ids,false);
    try { ids.forEach(id=>adapters.resetTool(reg.byId[id])); return safety; }
    catch (e) { try { restoreSafety(safety); } catch (_) {} throw e; }
  }
  function factoryResetAll() {
    const ids=reg.tools.map(t=>t.id); const safety=captureSafety(ids,true);
    try {
      ids.forEach(id=>adapters.resetTool(reg.byId[id]));
      store.resetSettings();
      localStorage.removeItem(store.KEYS.history);
      localStorage.removeItem(store.KEYS.backupMeta);
      return safety;
    } catch (e) { try { restoreSafety(safety); } catch (_) {} throw e; }
  }
  global.P8WORK_RESTORE=Object.freeze({captureSafety,restoreSafety,summarizeActions,apply,undoLastRestore,resetTools,factoryResetAll});
}(window));
