# BETA4 MAR Capture Handoff

Updated Consultation Form Manager to v1.3.5.

Primary changes:
- Added MAR photo import as the preferred medication workflow.
- Auto-detects medication-entry bands from uploaded MAR page images.
- Preserves captured medication entries as image strips instead of OCR-only text.
- Attempts to include overflow handwriting that extends beyond the printed medication box.
- Keeps existing EchoVantage screenshot OCR import and manual medication entry as fallbacks.
- Medication attachment printing now supports captured image entries and can continue onto additional pages as needed.
- Footer disclaimer on the medication attachment now reflects MAR-based capture use.

Operational notes:
- Current MAR import accepts image files (PNG/JPG/WEBP) captured from MAR pages.
- EchoVantage timeline screenshot OCR remains draft-only and still requires human verification.
- All medication data remains stored locally in the browser and is not encrypted.
