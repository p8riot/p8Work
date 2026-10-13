# p8Work 1.3.2 Beta 4 — Editable consultation template and pharmacy

After updating the existing GitHub Pages files, open **Consultation Manager → Settings → Consultation form template and pharmacy** to change the organization name, printed wording, pharmacy name/address/phone/fax/emails, or section visibility. Click Save Form Template, then check the form preview and make a fresh encrypted Master Backup with all four tools selected. Existing clients, group homes, medication images, File Library and other three tools are preserved. A standalone Consultation Manager Full Backup also retains the form settings. Your File Library requires its separate encrypted `.p8lib` backup.

This does **not** remove any hard-coded workplace defaults yet. The privacy cleanup, one visible app version, centralized attribution and stable v1.0.0 remain future release steps after backup verification and broader testing. Do not upload private client documents, records, or backup files to GitHub.

See `docs/BETA4-EDITABLE-CONSULTATION-TEMPLATE-HANDOFF.md`.

---

# p8Work 1.3.1 Beta 4 — Backup Safety Hotfix (Pre-Privacy-Cleanup)

This is a narrowly scoped BACKUP PRESERVATION update. No embedded workplace names, staff, pharmacy details, or form branding have been removed yet. Do not call this 1.0.0. Existing user data, storage keys, document library, and all four tool functions are retained.

**First priority:** Once deployed to the SAME GitHub Pages address and browser profile, create an **encrypted Master Backup selecting all four tools**, then save it in an employer-approved secure location. The backup now preserves unsaved Consultation Form Manager group-home defaults and pharmacy/organization print details, and Monthly Chore Planner facility/starter settings. Saved ShiftView employee rosters, locations, schedules, attendance, disciplinary records, TransportView staff/shifts/appointments, consultation clients and MAR images are included through existing storage adapters. A broken saved tool record or a missing MAR image stops the backup.

**Important limitations:** The Master Backup does **not** contain File Library documents. You must create a separate encrypted `.p8lib` backup in File Library. Neither browser storage nor downloaded files should be assumed encrypted at rest; protect both backups and use the approved workplace storage policy. This release does not remove the hardcoded workplace values from the public source; that cleanup is deferred until backup coverage and restore tests are completed. Existing encrypted backups remain compatible (format 1).

See `docs/BETA4-WORKPLACE-BACKUP-SAFETY-HANDOFF.md` for verification details.

---

# p8Work 1.3.0 — File Library (Beta 4)

**Deploy to GitHub Pages:** Extract this ZIP and upload its contents to the repository root. Do NOT upload the ZIP itself or commit real client files or backups. Do not clear your existing browser site data; the four established tools retain their storage locations.

**New File Library:** Select **File Library** on the navigation menu. Drag and drop files or use **Import Files**. Imports create actual independent browser-local copies, not path links, so moving/deleting originals does not break imported files. Create nested folders, rename, move, tag, categorize, archive, Trash/restore or permanently delete files; preview supported file types and download original-byte copies.

**File protection:** File Library documents are stored in unencrypted on-device browser IndexedDB, limited to **160 MiB total** this release. Browser quota and organization policies can further restrict storage. The existing Master Backup does **not** include the File Library. Make a **separate encrypted `.p8lib` backup** from the library section and validate recovery before removing your only other copy. Keep backups/passwords in an employer-approved secure location. Browser site data clearance, a changed site origin, device loss or policy can erase stored data. GitHub Pages does not store any uploaded library documents.

**Also repaired:** The stale “Update ready” prompt caused by unsynchronized 1.2.5 build IDs. The update manager, `release.json`, and service-worker cache are synchronized for 1.3.0.

See `docs/BETA4-FILE-LIBRARY-HANDOFF.md` for design, test limits and security considerations.

---

## Earlier releases (preserved)

# p8Work 1.2.5, Beta 4, consultation-only printing

# Beta 4, consultation-only print/PDF option

Product: p8Work 1.2.5, Consultation Form Manager 1.4.5, Beta 4.
Based on user-supplied latest deploy baseline p8Work 1.2.4 and Consultation Form Manager 1.4.4.

- On the consultation workspace, an "Include medication attachment" checkbox is checked by default.
- Unchecking it hides medication pages, suppresses the duplex blank page, updates the form to say the med list is not attached, and allows consultation-only print/PDF without needing same-day medication review.
- Rechecking it restores the current packet/medication freshness rules.
- "Save PDF" in the consultation workspace honors this checkbox. Individual client cards also offer "Consult-Only PDF" independently of the checkbox.
- Excluding the attachment never removes stored medication data and does not alter the client's saved status.
- The existing client metadata key and MAR IndexedDB image storage remain unchanged.
- The other three p8Work tools are byte-for-byte preserved.

Testing: Chromium browser emulation (self-contained page) tested one-page consult-only PDF and print, stale medication bypass only while excluded, normal two-page PDF on fresh synthetic text meds, and preservation of saved med data. JavaScript syntax passed. This environment blocks normal file and localhost navigation; IndexedDB is also unavailable on its synthetic opaque browser origin, so live-origin migration, real MAR image storage, real Windows printing, installed PWA and physical printers remain NOT TESTED.

Separate user-upload audit: 10 consultation PDFs paired with 10 cleaned MAR PDFs, 51/51 image references matched correct source images, four handwritten Notes pages omitted in three packets. See separately delivered Audit Markdown for the page-by-page findings. These private files were NOT embedded in p8Work packages.

# p8Work 1.2.4, Beta 4, medication-image storage repair

- Consultation Form Manager 1.4.4 moves saved MAR image data from limited `localStorage` to the browser's IndexedDB, keeping existing client metadata and storage key intact.
- When upgrading, legacy image data is copied and verified in IndexedDB before the smaller localStorage record replaces it. Existing medication data is not cleared when this step fails.
- IndexedDB image records are included in both Consultation Manager JSON exports and the p8Work Master Backup. The hub restores images before updating client data. The Master Backup's password protection and integrity checks remain unchanged.
- A missing image blocks backup and reviewed-medication printing rather than silently generating incomplete paperwork.
- This fix does NOT add encryption at rest. All protected information remains on the local device in unencrypted browser storage. The employer's security/privacy review is required before using real patient records.
- Do not clear site data or use an older p8Work build to manage image-reference records. To recover into an old build, preserve an appropriate exported backup and verify the legacy build can accommodate the image payload. Image references without IndexedDB are not a portable backup.
- Full notes: `docs/BETA4-MAR-IMAGE-STORAGE-FIX-HANDOFF.md`.

## Historical release notes

# p8Work 1.2.3, Beta 4, MAR handwritten amendment review

- Consultation Form Manager 1.4.3: additional safeguards for handwritten amendments beyond the narrow MAR medication column.
- Original three-column layout retained, with separately reviewed and verified handwritten-note image close-ups.
- Full technical and privacy limitations: `docs/BETA4-MAR-AMENDMENT-REVIEW-HANDOFF.md`.

## Existing product guidance and historical notes

# p8Work 1.2.2, Beta 4, MAR medication-column captures

**p8Work** is an installable, offline-first hub for the current work tools:

- ShiftView 0.7.4
- TransportView 0.1.6
- Consultation Form Manager 1.4.2
- Monthly Chore Planner 0.2.3

The hub is the only PWA. Each tool remains an independent HTML application with its own import/export/reset behavior and its existing storage identity.

## Deployment

This package is designed to be placed at the root of a GitHub Pages project repository. All application URLs are relative, so a project-site path such as `https://<user>.github.io/p8work/` is supported without hard-coding the account name.

1. Create or use the `p8work` repository.
2. Copy the **deploy package contents** to the repository root.
3. Enable GitHub Pages for that repository/branch.
4. Open the published HTTPS site once while online.
5. Allow the initial service worker installation to finish. The hub and four registered tools are then available from the local application cache when offline.
6. Install p8Work from the browser when the browser offers PWA installation.

Do not commit exported work backups, private saves, client exports, schedules, or other work data to the repository.

## Existing local data migration

Data saved by old `file://` copies is not automatically visible to the GitHub Pages origin. Perform a one-time migration for any existing data:

1. Export the tool's existing backup from the old local copy.
2. Open the GitHub-hosted version of that tool through p8Work.
3. Import the tool backup.
4. Verify the data.
5. Create a p8Work Master Backup after all tools have been migrated.

Installing the PWA from the same GitHub Pages origin does not require a second migration in that browser profile.

## Master Backup

The Backup Center supports:

- encrypted Master Backup by default
- optional visibly labeled unencrypted backup
- backup integrity hashes
- tool-by-tool comparison
- section-level selective restore
- `Restore Missing Only` where reliable record IDs exist
- current-vs-backup modification status when metadata is available
- mandatory local safety snapshot before destructive restore/reset
- rollback attempt if restore fails
- Undo Last Restore / Reset from the most recent safety snapshot

Encrypted Master Backups use PBKDF2-SHA-256 key derivation and AES-GCM-256 in the browser. p8Work cannot recover a forgotten backup password.

## Offline behavior

After initial online setup, p8Work can open the hub and cached tool HTML while offline. Local tool data continues to use browser storage.

Consultation Form Manager screenshot OCR remains internet-dependent because its Tesseract resources load from external CDNs. The screenshot pixels are processed in the browser, and the app does not intentionally upload or save the image itself, but the OCR library is third-party code running in the browser. The work organization's privacy/security team should approve this design before actual client use. Medication entry and consultation printing work without internet once the app shell is cached.

## OCR review quality improvements in 1.1.2

- The date filter still selects only today's green timeline bars and never relies on the ACTIVE label alone.
- Tiny OCR labels such as ACT-VE and Yedication can now be recognized without silently correcting medication names, doses or instructions, which remain human-review-only.
- When fewer draft entries than selected green rows are recovered, the tool displays the unresolved row count and requires a second acknowledgment after manual source comparison before saving. Ordinary review confirmation is still required for every medication list.
- An uploaded image must have at least a recognizably matching client header, Patient ID or named filename. A mismatch blocks the image. A generic, unreadable source with no client match cannot be imported automatically.
- Existing client records, consultation form, backup schema, single-page print rules and separate medicine sheets are unchanged.

## Medication print legibility and row-by-row review in 1.1.4

- EchoVantage timeline screenshot OCR now isolates individual date-current green bar rows instead of sending many lines to OCR as one long composite image. The medication editor shows each original row image alongside the editable OCR text. It requires an individual verification checkbox per medication entry, and editing the text resets that checkbox. Source screenshots and image previews are never stored with clients or backups; only independently checked text is saved.
- The printed medication list header omits the separate-attachment subtitle. Its footer now states that the contents reflect entries shown as current in the EchoVantage chart as of the review date, with a caution that this is not a live medication order or MAR and must be checked against current authorized records.
- Source PNGs, patient PDFs and client details are not bundled into any build artifact. Screenshot OCR can still make errors; no spelling correction or clinical order verification is claimed. Real CDN Tesseract and employer security/privacy approval remain open.

## Medication review freshness in 1.1.3

A medication list is a dated, manually reviewed snapshot, not a live order feed. If the review date is not today according to the device's local calendar, the Consultation Manager now blocks its own print and PDF export commands until the current authorized medication orders have been reviewed again and saved. No previous medication details are deleted. Existing backup records without a valid review timestamp also require review.

Ctrl+P or the browser's native print command is a separate path. To prevent unnoticed old medication text from leaking into a paper packet through that path, the printable medication sheet hides the old medication entries and prints a prominent NOT VERIFIED TODAY notice instead. The consultation form continues to occupy one page. Normal current-day medication packets remain two pages for simplex and three pages for duplex-safe (blank middle page). The normal editor still shows the saved entries for comparison.

Enhanced OCR downloads executable library code from third-party content providers. The browser storage is unencrypted. The UI now calls out these risks explicitly. This is not a clinical/HIPAA compliance approval, and we have not certified browser OCR against actual clinical medication data.

## Medication lists and printing

For each client, choose **Medications** from the client card or **Manage Medications** on the consultation form. Upload screenshot(s), paste one medication per line, or add entries manually. All imported text is an unsaved draft. Review it carefully against the current MAR and the correct client, select the review confirmation, then save. The stored list will appear as a separate medication page for that client in print and PDF exports.

The consultation form is always its own letter sheet. To leave the back blank, choose **single-sided printing** with the normal two-page layout. If your printer is set to duplex, use the **duplex-safe** print option: the generated sequence is consultation, deliberately blank back, then medication list. Verify the actual printer preview and turn off browser header/footer printing.

If a medication list is too long for the single attachment page, print/export is blocked rather than silently cutting off orders. Correct or shorten the list against the authoritative record, or handle extra pages outside this two-sheet workflow. Screenshots may contain repeats and discontinued orders: no imported entry should be treated as medically verified without human review.

Client medication data is sensitive: the app uses **unencrypted local browser storage**. Master/selected client backups and printouts must be protected as client records. This Beta feature is not a clinical medication-order system and has not undergone an organizational HIPAA compliance review.

## Important source note

Fort Harrison Group Home remains factory seed data in Consultation Form Manager by approved design. Because it is factory source data, it is readable in the published HTML if the GitHub Pages source is publicly accessible. Once initialized, the record is normal editable/deletable data. Ordinary upgrades do not recreate it after deletion; first initialization or Factory Reset restores the seed.

## Release identifiers

- p8Work product version: 1.1.4
- release stage: Beta 4
- build ID: `1.1.4-beta4-medication-legibility`
- hub contract: 1
- backup format: 1
- cache generation: 7

Built using the p8Core App Builder.


## Package types
- **Deploy package:** production GitHub Pages files only. Upload these contents to the `p8work` repository.
- **Project/reference package:** the deployable app plus frozen baseline copies of the original four tools for development comparison and rollback reference. Do **not** publish the `baseline/` folder to the production Pages repository.

## Scanned MAR PDF workflow

Open a client, Manage Medications, Import scanned MAR PDF. Select only that client's pages and confirm identity, review every preserved order capture against the authorized MAR, then save. Note: only scanned PDFs with one JPEG per page are supported by this offline PDF reader. Other PDF types are safely rejected. The source PDF and temporary thumbnails are not included in saved records, but confirmed cropped medication images are stored in browser localStorage, currently without encryption. Medical-record and employer approval is required before handling identifiable records.


## Weekly MAR PDF import correction (1.2.1)

The general Imports page now routes the supported scanned weekly MAR PDF format to a dedicated client/page review workflow. Select a saved client before choosing their source pages. This is not automatic client-matching or medication-order verification.


## MAR medication-column layout (1.2.2)
- One full medication-information column is captured per selected MAR order page, not individual medication boxes.
- Standard captures omit the staff-initials/daily-administration grid.
- A per-page widened option preserves important handwritten amendments outside the column, but includes some administration grid content.
- Three standard MAR columns fit side by side in exported medication PDFs; wide and older captures remain full width.
- The original selected source page remains visible in the review dialog until the dialog closes.
- An explicit human confirmation is still required, including checking current medication status and any handwritten amendments.
- The one-page consultation form, optional duplex blank back, and source-specific medication attachment disclaimers remain in place.
- This is a Beta checkpoint, not cleared for handling protected client information without organizational privacy/security approval.
