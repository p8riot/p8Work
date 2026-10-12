# p8Work 1.1.0 Beta 4, Medication Attachment QA

## Exact supplied baseline

- `p8Work-1.0.2-Beta3-deploy(1).zip` SHA-256: `249eec8ce64ca4a32798a52bc192c925fc8a93fe09679c088e8d048eea5eb742`.
- `p8Work-1.0.2-Beta3-project-reference(1).zip` SHA-256: `27d1064c0bdd96f18bab9f5016c84be93c1d3bfd489e635d1c497f1726cea28b`.
- Version resolved from `release.json` and in-tool code: p8Work 1.0.2 / Consultation Manager 1.2.2. Two upload packages have matching shared deploy files.

## Automated test results

- PASS, Chromium `page.set_content` executable UI test with in-memory mock storage: add client, edit medication draft, require review confirmation, save list, render selected-client medication attachment, verify persisted JSON, and test backward-compatible schema 1 hydration.
- PASS, Chromium headless `page.pdf` print tests: 1 page for no-medication client, 2 pages for single-sided consultation + medication, 3 pages in duplex-safe mode with text-empty middle page.
- PASS, browser-built per-client PDF module: 2 pages (simplex), 3 pages (duplex-safe), correct medication text on attachment and no text on intentional blank page.
- PASS, overfull medication list returns fit failure instead of fitting by clipping; one-page consultation fitting still works on synthetic example.
- PASS, medication parser excludes explicitly discontinued medication rows in a fixture and retains repeat entries for explicit review, with duplicate saved entries rejected. Identity mismatch fixture refuses another client's screenshot.
- PASS, actual sample screenshot processed into a 3300-pixel wide medication-band OCR canvas without a runtime JavaScript error. Independent color-band verification finds green ACTIVE medication rows in all 13 submitted screenshot files.
- PASS, browser JavaScript errors: zero in scripted interaction and print tests.
- PASS, release JS syntax, package hashes, unchanged unrelated tools, service-worker file references and cache generation (see packaging verification).
- SIMULATED, mock browser localStorage only. Real-origin storage, actual hub restore UI, service-worker install/update, true offline startup, and native work-printer settings are **NOT TESTED**.
- NOT TESTED, online Tesseract.js screenshot OCR end to end in this environment (remote runtime resources unavailable). Local image-band preprocessing and independent local OCR spot review demonstrate relevant text but some names/directions were imperfect and require human checking.
- NOT TESTED, real client records, real medical workflow, HIPAA/privacy organization review, Windows printer/PWA live usage, and target-device screen reader.

## Key guardrails and compatibility

- Existing `consultation-form-manager-state` key and `schemaVersion: 1` retained. Additive optional `clients[].medications` and `clients[].medicationReviewedAt` fields; no existing client data deleted by this update.
- Medication import is a review stage, not an automatic order approval or medication reconciliation engine. The attached output explicitly requires checking the current MAR/prescriber records.
- Hub Master Backup owns the entire `clients` section, so nested medication lists are included without changing the backup format; restore of clients replaces the client records as before, and selective restore/backup confirmation remains essential.
- Uploaded example screenshots remain separate and are excluded from application ZIPs. The ZIP packages contain only application, documentation, and frozen old tool baseline files.

## Privacy and deployment gate

- Client lists are stored as unencrypted browser localStorage. Screenshot OCR code is fetched from third-party CDNs if not already available. Technical review should approve local storage, client access, controlled device/browser profiles, export handling, OCR distribution and external script trust before clinical use.
- Maintain Beta status. Final on-origin smoke tests and physical paper/PDF output checks have not yet been completed.

---

## Historical Beta 3 QA record


## Baselines frozen

Known-good source copies were preserved before modification:

- ShiftView 0.7.2
- TransportView 0.1.4
- Consultation Form Manager 1.2.0
- Monthly Chore Planner 0.2.1

They are retained outside the deploy package for rollback/reference.

## Integration changes

### ShiftView 0.7.4
- Removed the generated single-file manifest/icon ownership block.
- Changed product PWA configuration from enabled to disabled.
- Existing `shiftview-schedule` namespace is unchanged.
- Added hub-aware `← p8Work` control.
- Added companion modification metadata without changing the stored schedule schema.
- Existing private workspace import/export and reset behavior remain present.

### TransportView 0.1.6
- Existing `transportview-state-v1` storage key is unchanged.
- Added hub-aware return control and companion modification metadata.
- Existing full backup/import, source import, CSV export, print and reset controls remain present.

### Consultation Form Manager 1.2.2
- Existing `consultation-form-manager-state` key and schema 1 are unchanged.
- Fort Harrison is no longer protected from editing/deletion after initialization.
- An explicitly empty `groupHomes` collection remains empty across ordinary reload/update hydration.
- Zero group homes is valid; printed program heading falls back to `TRANSITIONAL LIVING` with blank contact fields.
- Factory Reset still restores the original default state, including the Fort Harrison factory seed.
- Removed the separate `Restore Fort Harrison Defaults` reseed button so normal reseeding is tied to first initialization/factory reset.
- Added hub-aware return control and companion metadata.
- OCR external dependency remains unchanged.

### Monthly Chore Planner 0.2.3
- Existing `monthly-chore-planner` namespace, `planner-state`, and `planner-undo` keys remain unchanged.
- Added hub-aware return control and companion modification metadata.
- Existing backup/import, reset and print behavior remain present.

## Hub implementation present

- Responsive Home with Grid, Compact and Dashboard layouts.
- Midnight, Ocean, Slate, Forest, Plum, Light and High Contrast themes.
- Live device-based greeting/date/time.
- 12-hour and 24-hour clock preference used throughout hub timestamps.
- User-controlled tool order.
- Optional hub return control inside launched tools.
- Backup Center, Restore Review, Reset Center and About screens.
- Tool Registry as the source of Home cards, versions, storage ownership and restore sections.
- Encrypted and unencrypted Master Backup creation.
- SHA-256 integrity validation.
- Section-level selective restore and Restore Missing where configured with stable IDs.
- Local pre-change safety snapshot, rollback attempt and undo.
- Root manifest and root service worker only.
- Network-first navigation/HTML with cached offline fallback.
- Cache-first static assets with refresh.
- Update-ready lifecycle and release check.

## Automated checks completed in this build environment

- All expected deploy files exist: PASS.
- Manifest JSON parse: PASS.
- Release metadata JSON parse: PASS.
- Every service-worker precache path resolves to a real file: PASS.
- External hub JavaScript `node --check`: PASS.
- Every inline script in the hub and all four patched tools `node --check`: PASS.
- ShiftView no longer generates a tool manifest: PASS.
- ShiftView and Chore Planner PWA product flags are disabled: PASS.
- No Linktree/personal/social link found in patched tool source: PASS.
- Only Consultation Form Manager retains expected external OCR URLs: PASS.
- Backup engine Node test: payload build, SHA-256 verification, AES-GCM round trip, current/newer comparison, selective TransportView section restore and undo: PASS.
- p8Core-envelope adapter Node test: ShiftView section restore, tool reset and safety-snapshot undo: PASS.
- Stable deployment filenames: PASS.
- Original application storage identities remain unchanged: PASS.

## Runtime test limitation

A full rendered Chromium/PWA automation pass could not be completed inside this execution environment because navigation in the available browser is blocked by an administrator policy. This build therefore remains **Beta 3**, not Stable. The planned real-browser smoke test on the eventual HTTPS GitHub Pages deployment is still required before promotion to Stable.

## Required real-browser Beta checks before Stable

1. Desktop and mobile Home rendering in all themes/layouts.
2. 12-hour/24-hour clock toggle and live updates.
3. Install p8Work and relaunch in standalone mode.
4. First online cache, then complete offline launch of hub + all four tools.
5. Consultation OCR online and its graceful offline failure path.
6. Individual tool regression tests for imports, exports, print/download and reset.
7. Master Backup encrypted export/download and password restore.
8. Restore Review choices against real tool records, including Restore Missing.
9. Safety snapshot rollback and Undo Last Restore / Reset.
10. Upgrade from this cache generation to the next test generation without losing local data.
11. Mobile download/file-picker behavior on the actual work devices/browsers.

## Privacy reminder

Master backups, tool backups, private saves and exported work data must not be committed to GitHub. Factory-seed information hard-coded in application source is publicly readable if the deployed repository/site source is public.


## Beta 2 targeted regression
- Home Grid CSS collision corrected: `tool-area.layout-grid` now acts as a full-width wrapper while the nested `.tool-grid` owns the two-column card grid.
- Hub return control corrected in all four tools: the control is now placed before tool content in normal document flow and cannot overlay the tool title/header.
- Service-worker cache generation bumped to `p8work-shell-v2` so cached Beta 1 HTML is replaced.


## Beta 3 targeted regression
- PASS: greeting thresholds now classify 00:00–11:59 as morning, 12:00–16:59 as afternoon, and 17:00–23:59 as evening.
- PASS: 01:32 resolves to `Good morning`.
- PASS: static Home markup no longer hard-codes `Good evening` before initialization.
- PASS: cache generation advanced to `p8work-shell-v3`.


## 1.1.2 medication OCR review regression
- PASS (browser simulated): OCR label parsing positive/negative controls; unidentifiable screenshot blocked before date/medication OCR; selected today-active bar without readable candidate requires separate acknowledgment; failed import leaves prior saved medications untouched.
- PASS (browser automated): print/PDF 1/2/3 pages with blank duplex middle, client backup storage unchanged, full app JS syntax, unmodified tools integrity, ZIP content checks.
- WARNING: standalone Tesseract engine with sample image filtering detected incomplete/misread medication lines. Human review of every medication order remains mandatory.
- NOT TESTED: actual third-party browser Tesseract.js runtime, clinical accuracy, approved-device security and privacy, installed PWA upgrade, physical duplex and manual assistive technology.


## 1.1.3 medication review freshness regression
- PASS (automated browser): old/missing/future review dates blocked; current-day review enables attachments; Ctrl+P route hides stale medication entries and prints an explicit NOT VERIFIED TODAY warning on the separate page; old record retained; reconfirmation restores printing.
- PASS (automated browser): consultation form 1 page, reviewed medication simplex 2 pages, duplex 3 pages with blank page 2, native PDF export same counts, 9 widths no page overflow, no runtime JS errors.
- PASS (static/integrity): version/cache synchronization, existing storage/backup format untouched, unrelated tools byte-identical, source syntax, ZIP SHA-256 and paths.
- NOT TESTED: in-browser network-loaded Tesseract runtime; actual printer or on-origin offline cache migration; live PHI data, workplace privacy/security approval, installed PWA and screen reader.


## 1.1.4 medication screenshot legibility QA
- PASS (automated Chromium): two manually entered medications require each row checked; edited row unchecks automatically; no source preview image or verification metadata persists in client records; source image preview rendered in dialog; stale-medication print suppression remains.
- PASS (automated Chromium/PDF): consultation page 1 unchanged, medication sheet on page 2, duplex blank page 2 with medication on page 3, legible synthetic review texts, EchoVantage disclaimer in footer, removed separate-attachment subtitle, 9 responsive widths.
- PASS (real PNG + native host Tesseract 5): 15 date-current green bar regions from user-supplied example screenshot detected and processed separately, each returned a nonempty candidate, 15/15 ACTIVE medication markers recognized in this offline environment. This does NOT verify dosage/transcription accuracy or the app's separate Tesseract.js runtime.
- PASS (static): JS syntax, ids, release versions, asset links, baseline file preservation, SHA256SUMS and deploy/reference ZIP content verification, no embedded patient screenshot or source record.
- NOT TESTED: actual browser-loaded external Tesseract.js language/runtime; physical print; employer/workplace privacy approval; clinical correctness; real origin offline cache upgrade; screen reader.
