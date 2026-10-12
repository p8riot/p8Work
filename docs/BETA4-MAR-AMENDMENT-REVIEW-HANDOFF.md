# p8Work 1.2.3, Beta 4, MAR amendment safeguards

## Source baseline
- p8Work 1.2.2 Beta 4 medication-column deploy and project-reference ZIPs; all original SHA256SUMS entries independently verified.
- Consultation Form Manager 1.4.2 -> 1.4.3. The other three registered tools remain at the exact original bytes.

## User-approved scope
Keep three side-by-side MAR medication columns, detect potential handwritten medication amendments outside the narrow medication column, flag for review, allow drawing a close-up around the original handwriting, and include reviewed close-ups on medication attachment pages. Preserve one-page consultation and duplex blank reverse.

## Implementation
- Browser-only visual ink-density heuristic examines the right-side administration region (grid-line suppressed, connected components counted), without cloud OCR or interpreting medication meaning. False positives/negatives are possible.
- A flagged source page must receive a user-selected close-up or an explicit verified no-close-up acknowledgment before saving. Removing an attached close-up reopens its flag.
- Close-ups remain source images, appear in the existing review list, require individual verification, and print at legible width outside the three-column layout.
- Original full source stays visible in the review session; flagged crops are stored with the client's saved medication images.
- Existing EchoVantage screenshot OCR, manual text entry, client backup/restore, print layout, and data storage key are unchanged.

## Automated QA actually executed
- JavaScript syntax passed Node --check.
- Image-based detector against 5-page scanned MAR: pages 2,3,4 flagged, pages 1,5 not flagged.
- Headless Chromium scanned MAR import: 5 medication column captures, 3 source-page flags, blocked save before resolving flags; cropped note added and persisted after review; delete note reopens flag.
- Headless Chromium HTML printing and application PDF export: both four-page duplex-safe (one consultation, one blank reverse, two medication image pages), with 3 image captures on each image page in the selected sample. Test client name was synthetic.
- The actual PDF used for QA was not bundled in this release; no client records, MAR crops, or test output files are shipped.

## Outstanding warnings
- Heuristic ink detection does not interpret order status or guarantee finding every annotation. Review every MAR page and verify all current orders.
- Client medication images still reside in unencrypted browser storage. External Tesseract code for the optional EchoVantage OCR path remains unchanged; employer privacy/security approval is needed before working with identifiable records.
- Real installed Windows/browser deployment, physical duplex printing, and individual handwriting legibility on the user's equipment remain NOT TESTED.
- Restore previous full v1.2.2 deploy ZIP to roll back app code; local client data schema and storage key are unchanged. Do not erase browser storage.
