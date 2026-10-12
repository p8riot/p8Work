# p8Work 1.2.0, Consultation Form Manager 1.4.0

## Verified development scope
- Added offline PDF import for the Ricoh scanned MAR format supplied: one JPEG scan per PDF page.
- The 102-page sample parsed into 102 independently matched pages using PDF page-tree references; visual paper-type suggestion identified 51 likely medication order pages and 51 notes/other pages.
- Mixed-client protection: no pages selected by default, explicit per-client selection and identity confirmation before adding unsaved MAR capture drafts.
- Extracts original printed-medication entry rows as JPEG images spanning the handwritten continuation region, with manual verification required for every row. Adjacent captures slightly overlap to avoid cutting handwriting at separators.
- Existing MAR photo and EchoVantage screenshot plus manual medication entry remain available.
- Client medication list stays separate from one-page consultation form and is reviewed at each day of use.
- Download PDF now embeds MAR images as JPEG XObjects and paginates. Duplex mode adds a blank second PDF page. Browser printing also works in automated Chromium.
- Safe state rollback on storage-full errors while saving medication images.
- All PDF processing is local and dependency-free for this verified scanner subtype. No live patient MAR is bundled.

## Automated evidence
- Node and Chromium parsed all 102 pages of the representative scanned PDF.
- Detected 51 MAR-order-looking and 51 notes/other pages in headless Chromium; 0 pages were automatically selected.
- Unconfirmed selection was rejected; a checked source page was imported only after explicit client confirmation.
- Five full-height overlapping source captures extracted from PDF page 1.
- Synthetic test client: saved 5 reviewed images, PDF export generated 3 pages including blank page 2 and 5 embedded JPEGs on page 3.
- Two source-page test: 10 captures, 4 PDF pages, blank page 2, 10 embedded JPEGs; Chromium browser print also output 4 pages.
- App JavaScript syntax passed node --check. No console page errors in exercised paths.
- Package hashes and ZIP integrity verified at packaging.

## Important limits and risks
- This parser is deliberately strict, not a general PDF engine. Files containing multiple scans per page, compressed non-JPEG image streams, or unverified page references are refused with an explicit message.
- The MAR source can contain many different clients. Visual review of source-page client identity is mandatory; do not assign pages based only on order layout.
- Entry detection is a conservative layout heuristic validated only against this scanner style. It may group multiple medication entries or include blank areas and must not be treated as a verified list of current orders. Handwriting and dates are not interpreted automatically.
- Existing client storage is unencrypted local browser storage; OCR code for the separate Echo workflow still loads from third-party providers. Organizational security and HIPAA/privacy review is required before processing identifiable patient data.
- Phone hardware, physical duplex printers, deployed PWA cache migration, and human clinical correctness remain NOT TESTED.
- The immediately prior 1.1.5 archive was labeled 1.1.5 in its filename but its original release.json/tool-registry still said 1.1.4/1.3.4. This checkpoint explicitly reconciles those authoritative values to p8Work 1.2.0 and Consultation Manager 1.4.0. Historical reference copies are retained unchanged.

## Recovery
Retain the supplied p8Work 1.1.5 ZIP as a rollback source. Tool state remains under consultation-form-manager-state, schema version 1, backward-compatible medication records. Restoring an earlier app does not automatically erase browser data, but older application code may not display image-based medication records. Preserve a Master Backup before migration.
