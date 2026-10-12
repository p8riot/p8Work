## p8Work 1.2.5, Beta 4, consult-only print and PDF
Consultation Form Manager 1.4.5 adds a safe, non-destructive medication-attachment toggle, single-page consult-only print/PDF, and explicit client-card consult-only PDF.

# p8Work 1.2.4, Beta 4, medication-image storage repair

- Resolved full-browser-storage error when saving multi-page MAR image captures by moving images into IndexedDB.
- Added safe first-load migration of old image-filled client records, reviewed medication saves through an IndexedDB transaction, and non-destructive failure behavior.
- Integrated MAR images into encrypted p8Work Master Backups, selected client/full JSON backups and restore.
- Preserved consultation print format, MAR detection, three-column image layout, other three tools, and all client identifiers.
- Local images remain unencrypted; browser storage is not unlimited and is erased by clearing site data. Physical device / printer and real-origin IndexedDB remain not tested.

## Historical releases

# p8Work 1.2.3, Beta 4, MAR handwritten amendment review

- Flags scanned MAR pages with likely handwritten marks beyond the medication column.
- Blocks medication-list saving until each flag has a reviewed close-up or an explicit no-close-up acknowledgment.
- Keeps original source visuals, prints readable handwritten close-ups outside the existing three-column medication layout, and preserves the single-page consultation and blank-back duplex option.
- Reviewed close-up removals reopen the corresponding warning. Heuristic detection is imperfect; all pages still require comparison with authorized orders.

# p8Work 1.2.2, Beta 4, medication-column print layout

- Consultation Form Manager 1.4.2 now preserves the full medication-description column from each MAR order page as one image.
- Omits staff initials/calendar by default, with per-page wide-crop exception for cross-column handwriting.
- Exports reviewed MAR columns in three side-by-side PDF columns without cropping individual medication records.
- Retains original-page previews for clinician/staff verification and suppresses stale MAR images in browser printing.
- The consultation form stays one page, duplex mode keeps a blank reverse side.

## p8Work 1.2.1, Beta 4, MAR upload routing repair

- Fixed stalled generic text parsing of scanned weekly MAR PDFs. Added visible main Imports workflow, saved-client chooser, page ranges and enlarged page previews.
- Preserved medication image capture, dated review requirements, one-page consultation, blank-back duplex option, and other three tools.
- Browser validation not yet performed on user device.

# p8Work 1.2.0, Beta 4, scanned MAR PDF importer

- Added local scanned-MAR PDF import with reviewed page selection, source image box capture, printed PDF image output, and mixed-client safeguards.
- Source-specific medication print disclaimer, one-page consult, and duplex blank reverse preserved.
- Old data is retained under the existing storage key, no destructive migration.

# p8Work 1.1.4, Beta 4 maintenance update (medication OCR legibility)

- Consultation Form Manager 1.3.4 isolates current green timeline screenshot rows for separate OCR passes and offers the original row image next to each editable draft. The previous multi-row composite OCR output could produce unreadable medication names and directions.
- All medication entries (manual, imported, or carried from past review) now require individual row confirmation against the correct chart/current authorized record as well as the existing overall review attestation. Editing a checked row clears its check. The original image stays in volatile editor memory, never in client storage/backup/printouts.
- The medication sheet header no longer says it is a separate attachment. The footer says medications are those shown as current on the client's EchoVantage chart as of the review date and clarifies it is not an order or MAR. The consultation paper and blank-back duplex layout are unchanged.
- Existing client storage schema, saved medication text, review-date logic, backup format, other three tools, and hub contract are preserved. Maintenance PATCH version 1.1.3 -> 1.1.4; Consultation Manager 1.3.3 -> 1.3.4; Beta 4 maturity unchanged.
- CAUTION: screenshot OCR remains fallible, and extracted words, doses and directions must be corrected manually. Actual network-loaded Tesseract in the browser, printing on physical hardware, on-origin upgrade, and clinical/privacy approval remain NOT TESTED. The app continues to store user records unencrypted in browser localStorage; OCR code downloads from external providers.

---

# p8Work 1.1.3, Beta 4 maintenance update (medication review freshness)

- Consultation Form Manager 1.3.3 now requires review of saved medication lists on the local calendar day of printing or PDF export. Screenshot-date filtering alone is insufficient for older saved snapshots. Saved text stays intact for manual reconfirmation and backups.
- App print and PDF commands block stale or missing-review medication attachments. Native browser print (Ctrl+P) instead hides stale medication details and displays a NOT VERIFIED TODAY warning on the separate medication page, rather than silently printing old text.
- Added visible stale-review notice beside consultation print controls and explicit third-party OCR and unencrypted browser-storage caution in the medication editor.
- Print forms remain one-page with blank back, and verified medication list appears on separate page (2-page simplex / 3-page duplex-safe). Existing schema 1 storage, client data, backup format 1, and three unrelated tools unchanged. p8Work 1.1.2 -> 1.1.3; Consultation Manager 1.3.2 -> 1.3.3; patch release; Beta 4 maturity unchanged.
- Known limits: this is a review-date gate, **not** real-time medication reconciliation or automatic expiration of individual saved orders. OCR correctness and clinical verification require authorized human checking. In-browser third-party Tesseract runtime, real-device/production origin upgrade, physical duplex printing, and organizational PHI/privacy approval are NOT TESTED.

---

# p8Work 1.1.2, Beta 4 maintenance update (medication OCR safety review)

- Consultation Form Manager 1.3.2 accepts OCR-damaged ACTIVE and Medication *labels* on previously date-filtered green bars without guessing or correcting the medication names/doses/directions. The authorized list must still be checked character by character.
- Visible additional review gate when screenshot OCR yields fewer entries than green bars selected for today, with user acknowledgment required before saving. An image with neither a verified client header, Patient ID nor recognizable matching filename is rejected.
- All existing client data, nested medications, backups, consent checks, and 1-page consultation and separate medication print contracts remain unchanged. p8Work 1.1.1 -> 1.1.2, Consultation tool 1.3.1 -> 1.3.2, backward-compatible patch. Beta maturity unchanged.
- Offline local OCR remains limited by third-party remotely loaded code. Physical printing, real-origin installed PWA upgrade, organizational security/privacy approval, and clinical human medication verification remain outstanding gates.

---

# p8Work 1.1.1, Beta 4 maintenance update (date-aware medication import)

- Consultation Form Manager 1.3.1 now filters EchoVantage green timeline bars against the computer's current local date, including a bar that started in the past but overlaps today. Past-ended and future-starting bars do not enter the automatic draft, nor do black discontinued rows. Three consecutive month names, a valid today position and visible bars are required; otherwise no automatic import occurs, with a manual entry fallback.
- Current medication records remain separate under clients, with a medication panel in the Edit Client dialog and optional automatic opening of the editor after saving a new client. Screenshot medication dates are not printed on the list; reviewed-at date remains printed.
- Existing consultation form layout, backup keys, print packet contract and the other three tools are preserved. This is a backward-compatible PATCH and Beta maturity has not changed. Cache generation advanced to 5.
- **Safety:** Calendar geometry and screenshot OCR produce suggested medication entries only, never authorized clinical medication verification. If a screenshot doesn't show the full list or dates change later, review and reimport. Screenshot images are not bundled or persisted. True end-to-end OCR, physical printers, PWA updates and workplace clinical/privacy approval are not yet verified.

---

# p8Work 1.1.0, Beta 4 release notes

## Consultation Manager 1.3.0, reviewed medication attachments

- Added client-scoped medication lists. Each active or archived client can maintain editable medication entries containing the source's full medication/dose/directions text, without guessing missing fields.
- Import one or more screenshots or paste/manual-enter medication lines. Enhanced image processing detects green ACTIVE medication bands in EchoVantage timeline screenshots; extracted text is an editable **unverified draft**, never automatically saved as verified medication orders.
- Original screenshot previews are available during review and discarded from the app when the dialog closes. The app does not intentionally persist screenshots or include any example client screenshot data in application source.
- The user must review active status, duplicates, spellings, doses, and directions against the current authorized record and affirm that review before saving. Mismatched detectable screenshot name or Patient ID blocks auto-assignment. OCR quality is not guaranteed.
- The existing consultation form remains an independently fitted **one-page letter sheet**. Its printed medication-attached label updates according to whether the selected client has a saved list.
- A medication attachment appears as a separate one-page letter sheet and is included in printing and per-client PDF downloads. The app refuses prints/exports that would overflow either sheet rather than silently truncating text.
- For printers set to **single-sided**, the two-page packet prints as two physical sheets. Optional **duplex-safe** layout inserts a genuinely blank PDF page 2 so the medication list starts on PDF page 3, the front of the second physical sheet when duplex printing is selected. Disable the printer's automatic headers/footers.
- Medication lists are nested in existing client records so full, selected-client, hub Master Backup, and client-section restore retain them. Existing storage key and schema 1 remain readable. Standalone client imports carry medication lists to Pending, and merges never overwrite medications by default.

## Integration

- Updated p8Work from 1.0.2 to 1.1.0, minor feature release, maturity remains Beta (Beta 4).
- Updated Consultation Manager from 1.2.2 to 1.3.0. Versions of ShiftView, TransportView, and Chore Planner are unchanged; those three tool files are unchanged byte-for-byte.
- PWA cache advanced from `p8work-shell-v3` to `p8work-shell-v4`; release metadata, tool registry, backup engine, and update manager synchronized.
- No real client names, patient IDs, screenshot files, or medication data from the supplied examples are bundled in either deliverable.

## Release limitations

- Automated Chromium print-layout and PDF export tests passed. Physical printer settings, installed PWA upgrades, and clinical work-device validation are not yet tested.
- OCR for screenshots depends on remote Tesseract JavaScript/WASM downloads. OCR availability and fidelity on the actual work network are unverified; manual entry remains available offline. The source-images themselves are processed locally after the OCR code loads, but remote third-party script loading needs an organizational privacy/security review before actual client use.
- Local browser storage is not encrypted. Real client information and medication lists must only be processed on approved, secured work systems. This Beta build is **not validated as HIPAA compliant** or an authoritative medication administration record.

---

## Earlier release history (p8Work 1.0.2, Beta 3)


## Beta 3 greeting fix
- Corrected the Home greeting so **12:00 AM through 11:59 AM** displays **Good morning**.
- **12:00 PM through 4:59 PM** displays **Good afternoon**.
- **5:00 PM through 11:59 PM** displays **Good evening**.
- Replaced the hard-coded initial `Good evening` markup with neutral `Welcome` so a stale greeting does not flash before JavaScript initializes.
- Advanced the service-worker cache generation to v3 so the corrected hub files can replace the Beta 2 cached shell.


## Beta 2 interface fixes
- Fixed the Home **Grid** layout width bug caused by a CSS class collision between the Home layout state and the Settings layout-choice grid. Tool cards now use the full Home content width and render as the intended two-column desktop grid / one-column mobile grid.
- Reworked the in-tool **← p8Work** control so it is inserted in normal document flow above the tool interface instead of floating over the top-left corner. It no longer covers tool names or header controls.
- Bumped the p8Work shell cache generation so installed/offline copies receive the corrected interface files.


This is the first integrated p8Work hub build.

Highlights:
- professional branded launcher and icon family
- three Home layouts and seven themes
- local greeting/date/time with 12h/24h choice
- one installable PWA for all registered work tools
- offline-first application shell after initial online load
- individual tool import/export/reset remains intact
- encrypted Master Backup and protected selective Restore Center
- mandatory pre-change safety snapshots for hub restores/resets
- tool registry for future expansion
- Consultation Form Manager factory-seed behavior corrected so saved group homes can be edited/deleted and remain deleted across ordinary upgrades

This is a Beta build pending the real-browser/PWA regression pass described in `QA-AUDIT.md`.


## Consultation Form Manager v1.3.5
- Added MAR photo medication capture workflow with preserved image strips and overflow-handwriting support.
