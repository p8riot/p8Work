# p8Work 1.2.2, Beta 4: MAR medication-column capture

## Verified baseline
- p8Work 1.2.1 Beta 4 deploy and reference packages supplied in the same conversation.
- Consultation Form Manager 1.4.1 source bytes matched the deploy package before modification.
- Only the consultation manager was functionally changed; hub version/registry/cache identifiers were updated for release consistency.

## User-requested behavior
- Import PDF MAR and MAR photos via the existing page-selector workflow.
- Crop ONE continuous medication column per selected page instead of individual medication strips.
- Default crop omits staff initials and administration date grid.
- Allow expanded capture for exceptional outside-column handwriting, with a plain warning that this includes the grid.
- Display standard captures three across in the PDF export and browser print; wide and older captures use full width.
- Allow medication image pages to continue onto another sheet, keeping the consult form one page and duplex blank page.

## Safety / release limitations
- Client ownership of scanned pages and current medication status must be confirmed by staff before saving.
- Images preserve source handwriting but cannot determine which orders are current or decipher unclear writing.
- By default handwriting outside the medication column is omitted, so original full-page preview review is mandatory and expanded capture is offered.
- Clinical data is still stored unencrypted in browser localStorage. Separate OCR features may load third-party code. Organizational privacy/security approval required before real-world deployment.
- Physical printer/live hosted-PWA testing and screen-reader/manual accessibility review remain NOT TESTED.

## Automated validation performed
- Node JavaScript parse check: PASS.
- Python Playwright Chromium in-page (self-contained) MAR import on the supplied 102-page scanned PDF: 102 pages recognized and one image created from chosen page, PASS.
- Client record save verified using a simulated localStorage adapter: PASS (SIMULATED, not live storage).
- PDF export with five standard captures: 4 pages total including consult, blank duplex page, and 3+2 images on medication sheets, PASS.
- Browser print of same five captures: 4 pages total and three image positions on first medication sheet, PASS.
- MAR photo import: one column image, PASS. Wide exception capture: separate wide image, PASS.
- Stale-list browser print: no medication images emitted, PASS.
- Source PDF page preview retained in the review dialog until close; not serialized to client data.
- No identifiable MAR test scans included in release packages.
