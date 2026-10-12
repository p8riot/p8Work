# p8Work 1.1.4, Beta 4 — consultation medication OCR legibility update

## Baseline and release
- Exact source: SHA256-verified p8Work 1.1.3 Beta 4 deployment and project reference pair supplied in prior turn, with historical baseline/ files preserved unmodified.
- Version: p8Work 1.1.4, Consultation Form Manager 1.3.4. SemVer PATCH, Beta 4 unchanged. Cache generation 8. Hub contract 1, backup format 1, consultation schema 1 unchanged.

## User-requested changes
- The previously demonstrated medication PDF contained severe OCR transcription errors. Old OCR read combined timeline bars. New import isolates one date-current green bar at a time, providing individual image+draft text side by side for mandatory row-specific verification before save. No automatic correction of medication name or dosage is attempted.
- The medication-page header has no separate-attachment subtitle. New footer: reflects medications shown as current in the client’s EchoVantage chart as of review date and requires confirmation against authorized records.
- The separate medication page remains printable with the consultation as one page, or with a blank duplex back; no individual order dates printed. Same-day review gating, identity checks, date filtering, duplicate warnings, warnings for unreadable rows, and backups preserved. Source row images are session-only and stripped from persisted data.

## Quality and open risks
- Chromium tests covered per-row verification and re-edit invalidation, source preview display, persisted text-only medication records, stale record rejection, 2/3-page printing and duplex blank sheet, disclaimer and subtitle, nine widths 320–1920. Offline host OCR against real user screenshot returned 15/15 ACTIVE markers from 15 current bars after per-row extraction, not a claim of complete correct medication text.
- NOT TESTED: network-dependent Tesseract.js code and language downloads on production website, actual physical printer, clinical text accuracy, privacy/security approval. Browser-local client data remains unencrypted, and external OCR scripts create compliance risks. Do not use real client PHI without employer/organizational authorization.
- User-operated verification is deferred to release gate. Existing 1.1.3 deploy ZIP remains rollback fallback; always preserve current master backup before replacing deployed files.
