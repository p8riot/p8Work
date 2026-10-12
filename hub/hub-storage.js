(function (global) {
  "use strict";
  const KEYS = Object.freeze({
    settings: "p8work-hub-settings-v1",
    history: "p8work-hub-history-v1",
    backupMeta: "p8work-hub-backup-meta-v1",
    safety: "p8work-hub-safety-snapshot-v1"
  });

  const defaults = Object.freeze({
    theme: "midnight",
    layout: "grid",
    cardSize: "comfortable",
    showGreeting: true,
    showDate: true,
    showTime: true,
    clockFormat: "12h",
    showDescriptions: true,
    showVersions: true,
    showHomeButtonInTools: true,
    collapseSidebar: false,
    rememberLastSection: true,
    lastSection: "home",
    toolOrder: ["shiftview", "transportview", "consultation-form-manager", "monthly-chore-planner"],
    backupWarningDays: 7
  });

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? clone(fallback) : JSON.parse(raw);
    } catch (_) { return clone(fallback); }
  }
  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }
  function normalizeSettings(input) {
    const s = Object.assign(clone(defaults), input && typeof input === "object" ? input : {});
    const validThemes = ["midnight","ocean","slate","forest","plum","light","high-contrast"];
    const validLayouts = ["grid","compact","dashboard"];
    const validSizes = ["compact","comfortable","large"];
    if (!validThemes.includes(s.theme)) s.theme = defaults.theme;
    if (!validLayouts.includes(s.layout)) s.layout = defaults.layout;
    if (!validSizes.includes(s.cardSize)) s.cardSize = defaults.cardSize;
    if (!['12h','24h'].includes(s.clockFormat)) s.clockFormat = defaults.clockFormat;
    const known = global.P8WORK_REGISTRY.tools.map(t => t.id);
    const order = Array.isArray(s.toolOrder) ? s.toolOrder.filter(id => known.includes(id)) : [];
    known.forEach(id => { if (!order.includes(id)) order.push(id); });
    s.toolOrder = order;
    s.backupWarningDays = Math.max(1, Math.min(365, Number(s.backupWarningDays) || 7));
    return s;
  }
  function loadSettings() { return normalizeSettings(readJson(KEYS.settings, defaults)); }
  function saveSettings(settings) { return writeJson(KEYS.settings, normalizeSettings(settings)); }
  function resetSettings() { localStorage.removeItem(KEYS.settings); return clone(defaults); }
  function loadHistory() { return readJson(KEYS.history, { lastOpenedTool:null, recentTools:[], restoreReports:[] }); }
  function saveHistory(h) { return writeJson(KEYS.history, h); }
  function recordToolOpen(toolId) {
    const h = loadHistory();
    const now = new Date().toISOString();
    h.lastOpenedTool = { toolId, openedAt: now };
    h.recentTools = (h.recentTools || []).filter(x => x.toolId !== toolId);
    h.recentTools.unshift({ toolId, openedAt: now });
    h.recentTools = h.recentTools.slice(0, 8);
    saveHistory(h);
  }
  function addRestoreReport(report) {
    const h = loadHistory();
    h.restoreReports = Array.isArray(h.restoreReports) ? h.restoreReports : [];
    h.restoreReports.unshift(report);
    h.restoreReports = h.restoreReports.slice(0, 20);
    saveHistory(h);
  }
  function getBackupMeta() { return readJson(KEYS.backupMeta, null); }
  function setBackupMeta(meta) { return writeJson(KEYS.backupMeta, meta); }
  function getSafety() { return readJson(KEYS.safety, null); }
  function setSafety(v) { return writeJson(KEYS.safety, v); }
  function clearSafety() { localStorage.removeItem(KEYS.safety); }

  global.P8WORK_STORAGE = Object.freeze({ KEYS, defaults, loadSettings, saveSettings, resetSettings, loadHistory, saveHistory, recordToolOpen, addRestoreReport, getBackupMeta, setBackupMeta, getSafety, setSafety, clearSafety, readJson, writeJson });
}(window));
