(function (global) {
  "use strict";

  const tools = [
    {
      id: "shiftview",
      name: "ShiftView",
      version: "0.7.4",
      schemaVersion: 7,
      hubContract: 1,
      file: "tools/shiftview.html",
      icon: "assets/icons/shiftview-256.png",
      description: "Staff scheduling, coverage, attendance, and workforce records.",
      storage: { type: "prefix", prefix: "p8riot:shiftview-schedule:", primaryKey: "p8riot:shiftview-schedule:schedule" },
      offline: true,
      onlineOnlyFeatures: [],
      sections: [
        { id: "schedule", label: "Schedules & manual edits", paths: ["records", "sources", "notes", "nextImportOrder", "overrides"] },
        { id: "workforce", label: "Locations, roster & shift codes", paths: ["organization"] },
        { id: "attendance", label: "Attendance records", paths: ["attendanceRecords"], mergeMissing: { path: "attendanceRecords", idKey: "id" } },
        { id: "discipline", label: "Discipline records", paths: ["disciplineRecords"], mergeMissing: { path: "disciplineRecords", idKey: "id" } },
        { id: "preferences", label: "ShiftView preferences", paths: ["preferences"] }
      ]
    },
    {
      id: "transportview",
      name: "TransportView",
      version: "0.1.6",
      schemaVersion: 1,
      hubContract: 1,
      file: "tools/transportview.html",
      icon: "assets/icons/transportview-256.png",
      description: "Transportation scheduling, appointments, staff, and locations.",
      storage: { type: "exact", keys: ["transportview-state-v1"], primaryKey: "transportview-state-v1" },
      offline: true,
      onlineOnlyFeatures: [],
      sections: [
        { id: "appointments", label: "Appointments", paths: ["appointments"], mergeMissing: { path: "appointments", idKey: "id" } },
        { id: "staff", label: "Staff & shifts", paths: ["staff", "shifts"] },
        { id: "locations", label: "Locations", paths: ["locations"], mergeMissing: { path: "locations", idKey: "id" } },
        { id: "archives", label: "Archives", paths: ["archives"], mergeMissing: { path: "archives", idKey: "id" } },
        { id: "customization", label: "Transport types", paths: ["customTransportTypes"] },
        { id: "settings", label: "Settings & email", paths: ["settings", "email"] }
      ]
    },
    {
      id: "consultation-form-manager",
      name: "Consultation Form Manager",
      version: "1.4.6",
      schemaVersion: 1,
      hubContract: 1,
      file: "tools/consultation-form-manager.html",
      icon: "assets/icons/consultation-manager-256.png",
      description: "Consultation forms, MAR scanned-PDF capture, reviewed medication images, clients, and group homes.",
      storage: { type: "exact", keys: ["consultation-form-manager-state"], primaryKey: "consultation-form-manager-state" },
      offline: "partial",
      onlineOnlyFeatures: ["Screenshot OCR"],
      sections: [
        { id: "clients", label: "Client records", paths: ["clients"], mergeMissing: { path: "clients", idKey: "id" } },
        { id: "pending", label: "Pending imports", paths: ["pending"], mergeMissing: { path: "pending", idKey: "id" } },
        { id: "groupHomes", label: "Group homes", paths: ["groupHomes", "selectedGroupHomeId", "groupHome", "workplaceProfile"], mergeMissing: { path: "groupHomes", idKey: "id" } },
        { id: "form", label: "Current form selection", paths: ["selectedClientId", "consultWith", "consultDate"] },
        { id: "settings", label: "Consultation Manager settings", paths: ["theme", "formTemplate"] }
      ]
    },
    {
      id: "monthly-chore-planner",
      name: "Monthly Chore Planner",
      version: "0.2.3",
      schemaVersion: 1,
      hubContract: 1,
      file: "tools/chore-planner.html",
      icon: "assets/icons/chore-planner-256.png",
      description: "Resident chore assignments, rotation, and monthly planning.",
      storage: { type: "prefix", prefix: "p8riot:monthly-chore-planner:", primaryKey: "p8riot:monthly-chore-planner:planner-state", transientKeys: ["p8riot:monthly-chore-planner:planner-undo"] },
      offline: true,
      onlineOnlyFeatures: [],
      sections: [
        { id: "residents", label: "Residents", paths: ["residents", "historicalResidents"], mergeMissing: { path: "residents", idKey: "id" } },
        { id: "chores", label: "Chore configuration", paths: ["dailyChores", "weeklyChores", "mealTasks", "laundry"] },
        { id: "schedules", label: "Monthly schedules", paths: ["schedules", "selectedMonth"] },
        { id: "settings", label: "Planner settings", paths: ["settings"] }
      ]
    }
  ];

  const byId = Object.freeze(Object.fromEntries(tools.map(t => [t.id, Object.freeze(t)])));
  global.P8WORK_REGISTRY = Object.freeze({ tools: Object.freeze(tools), byId });
}(window));
