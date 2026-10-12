# p8Work 1.2.1, Beta 4, Weekly MAR PDF import repair

## Confirmed failure found in p8Work 1.2.0
The general Imports screen advertises PDF uploads but routes them through a lightweight text extractor. The representative 29 MB scanned MAR PDF is image-only, and the generic text-search regular expression can stall on its image data. This means uploading a MAR via the main Imports screen cannot yield client medications. The MAR-specific page picker was accessible only through each client's Manage Medications screen, requiring manual per-client page selection.

## Correction
- Scanned MAR PDFs are now detected before the generic PDF text parser. Exact 102-page scanner sample successfully routes locally in a Node/V8 test without invoking the generic extractor.
- Main Imports now exposes an explicit Weekly MAR PDF workflow with saved-client selection.
- Scanned MAR files uploaded to the general source drop zone are automatically redirected to this workflow, not mistaken for demographic or medication text.
- Page picker has range input (e.g. 1,3,5-7) and enlarged source page preview for client identity checks.
- One weekly PDF can be used with multiple clients in a browser session, and Clear loaded weekly PDF releases that file reference.
- Unsupported large PDFs no longer enter the expensive generic PDF text extraction path.
- All actual order-image captures still require human page selection, review, and per-entry approval. No medication or client match is guessed from handwritten text.

## Evidence
PASS (STATIC): JavaScript syntax checked using Node.
PASS (SIMULATED V8): 102 JPEG pages extracted from exact supplied scanned PDF, scanned MAR routed from main Imports without invoking basic PDF text extraction; identity/page-selection controls present.
PASS (STATIC): complete ZIP SHA-256 integrity check, all deployment paths tracked, unchanged other three tool bytes.
NOT TESTED: Actual Windows browser, installed PWA offline/cache refresh, PDF picker interaction on user device, physical print, real pharmacy/MAR clinical correctness.
WARNING: Current tool stores clinical records and saved MAR image captures in unencrypted browser localStorage; existing separate EchoVantage OCR optionally downloads third-party executable code. Organizational approval is required for any identifiable client records.

## User workflow
Open Imports > Weekly MAR PDF. Select an existing client, choose the weekly PDF, click Review this client's MAR pages. Use enlarged thumbnails or exact PDF page number ranges to select only that client's order pages, check client identity, Capture selected MAR pages. Review each saved capture and verify the full list, then Save Reviewed Medication List. The first consult page and duplex-safe blank back are unchanged. The same weekly PDF may be reused for the next client until explicitly cleared or the tab is closed.

## Rollback
Preserve and retain p8Work 1.2.0. No storage keys or migration formats changed in 1.2.1. Reverting code does not remove saved medication records. Do not import live client information without workplace privacy approval.
