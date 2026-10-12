# p8Work 1.1.1, Beta 4 Medication Date Filter Checkpoint

## Baseline and scope
- Exact input: p8Work-1.1.0-Beta4-medications-deploy.zip; reference input: p8Work-1.1.0-Beta4-medications-project-reference.zip. SHA-256 of input archives independently verified during packaging.
- Patch line: p8Work 1.1.0 -> 1.1.1; Consultation Form Manager 1.3.0 -> 1.3.1. Beta 4 is unchanged. No schema changes.
- Separate client medication records continue to be stored in `clients[].medications` and exported through existing backup flows, not copied into the consult form body.

## Filtering algorithm and limitations
- Current browser local calendar date is compared with the visible EchoVantage timeline, using 3 consecutive month headings and the measured boundaries of the month columns. Today's date must be inside the visible calendar.
- Only the green medication bar whose interval overlaps today is selected for downstream OCR. Ended green bars, black discontinued bars, and future-only bars are excluded from automatic OCR drafts. This corrects the prior unsafe rule that treated any row labeled ACTIVE as current.
- Selected text remains a draft and requires user confirmation against the authorized medication record before saving. Text and date inference can be wrong. No autonomous medication discontinuation or medical decisions. If date axis cannot be verified, import stops with a notice; manual verified entry remains available.
- Date filtering occurs *when importing*. Saved medication lists are snapshots and do not automatically update over subsequent days; the saved review date is available. Dates are not shown beside individual medications on printouts.
- Screenshots with bars hidden beyond the visible scroll area require additional screenshots or manual completeness review.

## Print and preservation
- Consultation form continues on one page, blank reverse in duplex-safe mode, medication list on a separate page. Fail closed on page overflow.
- All three unrelated tools retained byte-for-byte. No client screenshot or original medication value bundled in deliverables.

## QA and open gates
- Automated Chromium test with synthetic green bands: ended, current, future and discontinued, correct current-only selection; OCR mock import integration including client matching, error fallback without destructively changing saved entries; import from new-client dialog; page and PDF print contract. Geometry parsed all 13 reference screenshots for the documented October 12, 2026 date. JS syntax and deployment package/hashes verified.
- OCR recognizing live timeline month text and medication names through the actual Tesseract runtime, actual physical duplex output, cross-date/timezone changes, installed-PWA update, workplace permission and sensitive information governance remain untested and need final clinical review before use.

## Rollback
- Preserve the user-supplied Beta 4 deploy and project-reference ZIPs. On rollback, export/secure current client data first; older backups may overwrite revised medication records. No new data format or storage key required.
