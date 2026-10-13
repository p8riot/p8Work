# p8Work 1.3.2 / Consultation Form Manager 1.4.6 — Editable consultation template

**Purpose:** Save actual pharmacy contacts, organization, form wording, labels, section visibility, and medical-order note through Settings → Consultation form template and pharmacy. Existing Clients and Group Homes editors remain the source of truth for their data; this editor cannot overwrite client medications. No employer/workplace hard-coded defaults were removed, pending a verified work-computer Master Backup and the later privacy cleanup.

## Storage and backups
- Preserves `consultation-form-manager-state` schemaVersion 1 and unchanged MAR image store. The new `formTemplate` object contains printed labels and section flags; `workplaceProfile` remains the canonical source for organization and pharmacy (including multiple emails). Hydration of older data fills absent keys without replacing saved values.
- Standalone Consultation Manager Full Backup includes both objects through its `state` snapshot. A full restore replaces the template and profile; merge-clients-only leaves the current local template and pharmacy unchanged.
- Master Backup's read-only preservation bridge includes both objects even if the user has not yet opened the editor after updating. Old backups without `formTemplate` hydrate to legacy-equivalent printed wording. The master backup format is unchanged. Select the Consultation Manager settings section to selectively restore `formTemplate`; organization and pharmacy remain in the group-home settings section.
- File Library retains its separate `.p8lib` encrypted backup, unchanged. All local browser records remain unencrypted at rest.

## Behavior and limitations
- Text is inserted using `textContent`, not arbitrary HTML. `{home}` is a safe placeholder in program heading and physician instructions. Default legacy program line retains automatic group-home switching.
- Changing optional printed sections changes form content only. It does not delete underlying client or medication data. Print and PDF fitting still stop exports when excessive text cannot fit safely on one sheet.
- Default clinical wording and built-in facility details remain in code for this transitional safety build. Future source privacy cleanup remains deferred. Users must not publish client backups or documents in a public repository.
- Functional browser tests and backup tests must be completed on the actual work computer before declaring the future p8Work 1.0.0 stable release.
