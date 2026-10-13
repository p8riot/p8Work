/* p8Work workplace configuration preservation bridge, pre-cleanup safety release.
 * Read-only: generates complete portable backup records; never writes user data.
 * No client, roster, or employee data is seeded or invented here.
 */
(function (global) {
  'use strict';
  const CFM_KEY='consultation-form-manager-state';
  const CHORE_KEY='p8riot:monthly-chore-planner:planner-state';
  const DEFAULT_GROUP_HOME=Object.freeze({
    id:'group-home-fort-harrison', name:'Fort Harrison Group Home',
    address:'1175 Ft Harrison Rd, Terre Haute, IN 47807', supervisor:'Andrew Toon',
    nurse:'Erin Burns, RN', phone:'(812) 231-8274', fax:'(812) 231-8175'
  });
  const DEFAULT_WORKPLACE_PROFILE=Object.freeze({"organizationName":"HAMILTON CENTER","programName":"TRANSITIONAL LIVING – FORT HARRISON","pharmacy":{"name":"Genoa Pharmacy","address":"620 8th Avenue, Terre Haute, IN 47802","phone":"812-232-1730","fax":"812-232-8362","emails":["TerreHaute-IN-10084@genoa-qol.com","cclaycomb@genoahealthcare.com"]},"notes":{"consultationMedicationInstructions":"Medication Administration Records are used at the group home. All orders to add or discontinue must be communicated to avoid interactions or duplicate therapy."}});
  const DEFAULT_FORM_TEMPLATE=Object.freeze({"labels":{"documentTitle":"CONSULTATION FORM","medicationTitle":"CLIENT MEDICATION LIST","patientName":"Patient Name:","consultWith":"Consult with:","dob":"DOB:","consultDate":"Consult date:","patientId":"Patient ID:","diagnosis":"Significant Diagnosis/ History:","insuranceType":"Insurance Type:","insuranceId":"Insurance ID:","allergies":"Allergies:","contacts":"Contact Information:","phone":"Phone","fax":"Fax","groupHomeSuffix":":","supervisorSuffix":" Supervisor:","nurseSuffix":" Nurse:","pharmacyPhone":"Phone:","pharmacyFax":"Fax:","pharmacyEmail":"{pharmacy} Email:","purpose":"Purpose of Visit (circle one):","purpose1":"Follow-Up","purpose2":"Physical","purpose3":"New Complaint:","ordersHeading":"Physician’s Findings and Orders","ordersNote":"(**Please note that Medication Administration Records are used at the {home} where this person resides and ALL information regarding orders to be added AND/OR discontinued is needed to avoid interactions and duplication of therapy! Thank you for your assistance)","findings":"Findings and New Orders:","discontinueQuestion":"Do any medication orders need to be discontinued as a result of findings or new orders?","circleOne":"(circle one)","yes":"YES","no":"NO","signature":"Physician Signature:","appointmentDate":"Follow-Up Appointment Date:","appointmentTime":"Time:","medAttached":"Medication List Attached","medNotAttached":"Medication List Not Attached","medReview":"Medication Review Required Before Printing","medAbsent":"Medication Record Not Attached"},"sections":{"diagnosis":true,"insurance":true,"allergies":true,"medicationStatement":true,"contact":true,"purpose":true,"orders":true,"footer":true}});
  const CHORE_STARTER=Object.freeze({"schemaVersion":1,"dataRevision":3,"appVersion":"0.2.3","selectedMonth":"__BACKUP_MONTH__","settings":{"facilityName":"Fort Harrison Group Home","headerLabel":"Group Home Monthly Chores","sheetTitle":"Monthly Chore Sheet","dailyLabel":"Daily Chores","laundryLabel":"Laundry Schedule","weeklyLabel":"Weekly Chores","mealLabel":"After Meal Chores","showPrintInstructions":true,"theme":"system"},"residents":[{"id":"resident-1","name":"Resident 1","room":1,"active":true},{"id":"resident-2","name":"Resident 2","room":2,"active":true},{"id":"resident-3","name":"Resident 3","room":3,"active":true},{"id":"resident-4","name":"Resident 4","room":4,"active":true},{"id":"resident-5","name":"Resident 5","room":5,"active":true},{"id":"resident-6","name":"Resident 6","room":6,"active":true},{"id":"resident-7","name":"Resident 7","room":7,"active":true},{"id":"resident-8","name":"Resident 8","room":8,"active":true},{"id":"resident-9","name":"Resident 9","room":9,"active":true},{"id":"resident-10","name":"Resident 10","room":10,"active":false}],"historicalResidents":[],"dailyChores":[{"id":"daily-living","name":"Living Room","people":1,"eligibleRooms":[],"difficulty":2,"auto":true},{"id":"daily-linen","name":"Linen / Utility Closets","people":1,"eligibleRooms":[],"difficulty":2,"auto":true},{"id":"daily-hallway","name":"Hallway","people":1,"eligibleRooms":[],"difficulty":2,"auto":true},{"id":"daily-stairs","name":"Stairs","people":1,"eligibleRooms":[],"difficulty":1,"auto":true},{"id":"daily-basement","name":"Basement","people":1,"eligibleRooms":[],"difficulty":2,"auto":true},{"id":"daily-ne-bath","name":"Northeast Bathroom","people":1,"eligibleRooms":[7,8,9,10],"difficulty":3,"auto":true},{"id":"daily-se-bath","name":"Southeast Bathroom","people":1,"eligibleRooms":[5,6,7,8],"difficulty":3,"auto":true},{"id":"daily-handicap-bath","name":"Handicap Bathroom","people":1,"eligibleRooms":[1,2,3,4],"difficulty":3,"auto":true},{"id":"daily-disinfect","name":"Disinfect doorknobs & light switches","people":1,"eligibleRooms":[],"difficulty":2,"auto":true},{"id":"daily-house-laundry","name":"House laundry & laundry room","people":1,"eligibleRooms":[],"difficulty":2,"auto":true}],"weeklyChores":[{"id":"weekly-smoke-porch","name":"Clean Smoke Porch","people":1,"eligibleRooms":[],"difficulty":2,"auto":true,"days":{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":true}}],"laundry":{"auto":true,"slots":{"mon":1,"tue":1,"wed":2,"thu":2,"fri":1,"sat":1,"sun":2}},"mealTasks":[{"id":"meal-dishes","name":"Dishes","people":1,"difficulty":3,"auto":true},{"id":"meal-table","name":"Table & Counters","people":1,"difficulty":2,"auto":true},{"id":"meal-sweep","name":"Sweep","people":1,"difficulty":2,"auto":true},{"id":"meal-mop","name":"Mop","people":1,"difficulty":2,"auto":true},{"id":"meal-trash","name":"Trash","people":1,"difficulty":1,"auto":true}],"schedules":{}});
  const deepCopy=v=>JSON.parse(JSON.stringify(v));
  const monthNow=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
  function parseRecord(raw,toolName) {
    if(raw==null)return {exists:false,wrapper:null,state:null};
    let outer;try{outer=JSON.parse(raw);}catch(_){throw new Error(toolName+' saved record is damaged. Backup stopped rather than omitting data.');}
    const wrapper=outer&&outer.__p8riotStorage&&Object.prototype.hasOwnProperty.call(outer,'value')?outer:null;
    const state=wrapper?wrapper.value:outer;
    if(!state||typeof state!=='object'||Array.isArray(state))throw new Error(toolName+' saved record has an invalid structure. Backup stopped.');
    return {exists:true,wrapper,state};
  }
  function encodeRecord(record,modified) {
    if(record.wrapper){const wrapper=deepCopy(record.wrapper);wrapper.value=modified;return JSON.stringify(wrapper);}
    return JSON.stringify(modified);
  }
  function consultation(entries) {
    const record=parseRecord(entries[CFM_KEY],'Consultation Manager');
    const current=record.exists?deepCopy(record.state):{schemaVersion:1,appVersion:'1.4.6',clients:[],pending:[],selectedClientId:'',consultWith:'',consultDate:'',theme:'classic-blue'};
    if(!Array.isArray(current.groupHomes)) {
      const legacy=current.groupHome&&typeof current.groupHome==='object'?current.groupHome:null;
      const legacyHome=legacy?{...DEFAULT_GROUP_HOME,...legacy}:deepCopy(DEFAULT_GROUP_HOME);
      const matching=String(legacyHome.name||'').toLowerCase()===DEFAULT_GROUP_HOME.name.toLowerCase();
      current.groupHomes=matching?[{...legacyHome,id:DEFAULT_GROUP_HOME.id}]:[deepCopy(DEFAULT_GROUP_HOME),{...legacyHome,id:legacyHome.id||'group-home-migrated'}];
      if(!current.selectedGroupHomeId) current.selectedGroupHomeId=current.groupHomes[0].id;
    }
    if(!current.groupHome&&current.groupHomes.length){
      current.groupHome=deepCopy(current.groupHomes.find(h=>h.id===current.selectedGroupHomeId)||current.groupHomes[0]);
    }
    if(!current.workplaceProfile||typeof current.workplaceProfile!=='object'||Array.isArray(current.workplaceProfile)){
      current.workplaceProfile=deepCopy(DEFAULT_WORKPLACE_PROFILE);
    } else {
      current.workplaceProfile={...deepCopy(DEFAULT_WORKPLACE_PROFILE),...current.workplaceProfile,
        pharmacy:{...deepCopy(DEFAULT_WORKPLACE_PROFILE.pharmacy),...(current.workplaceProfile.pharmacy||{})}};
    }
    // Include all template defaults in Master Backup, even before the editor is first opened.
    // Never overwrite a user's saved wording, visibility or pharmacy configuration.
    const custom=current.formTemplate&&typeof current.formTemplate==='object'&&!Array.isArray(current.formTemplate)?current.formTemplate:{};
    current.formTemplate={labels:{...deepCopy(DEFAULT_FORM_TEMPLATE.labels),...(custom.labels||{})},
      sections:{...deepCopy(DEFAULT_FORM_TEMPLATE.sections),...(custom.sections||{})}};
    return {...entries,[CFM_KEY]:encodeRecord(record,current)};
  }
  function chores(entries) {
    const record=parseRecord(entries[CHORE_KEY],'Monthly Chore Planner');
    const current=record.exists?deepCopy(record.state):deepCopy(CHORE_STARTER);
    if(!record.exists) current.selectedMonth=monthNow();
    if(!current.settings||typeof current.settings!=='object'||Array.isArray(current.settings)) current.settings={};
    if(!Object.prototype.hasOwnProperty.call(current.settings,'facilityName')) current.settings.facilityName=CHORE_STARTER.settings.facilityName;
    return {...entries,[CHORE_KEY]:encodeRecord(record,current)};
  }
  function prepareEntries(tool,entries) {
    const key=tool&&tool.storage&&tool.storage.primaryKey;
    if(key&&entries[key]!=null && tool.id!=='consultation-form-manager'&&tool.id!=='monthly-chore-planner'){
      // Fail closed if a persisted employee/transport record is unreadable.
      parseRecord(entries[key],tool.name);
    }
    if(tool.id==='consultation-form-manager')return consultation(entries);
    if(tool.id==='monthly-chore-planner')return chores(entries);
    return entries;
  }
  global.P8WORK_PRESERVATION=Object.freeze({prepareEntries});
}(window));
