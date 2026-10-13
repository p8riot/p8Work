# p8Work 1.0.0 — GitHub Pages Deployment

Extract this ZIP into the root of your existing GitHub Pages repository. Keep the same domain/path and browser profile to preserve locally saved information. Do not upload private backups, client files, or personnel data.

## Preservation and upgrades

This release removes organization-specific workplace, staff, and pharmacy **defaults** from the public source. Existing records in browser storage remain unchanged, and the app continues to read Master Backups produced by earlier releases. The consultation form's workplace and pharmacy contacts are configurable inside Consultation Manager settings. A new installation or reset starts with blank workplace details. Restore your verified workplace Master Backup if needed; do not clear site data during deployment.

The app retains internal schema/backup compatibility versions, with one user-visible application version under p8Work Settings. Its sole attribution is: Created by J.P. Coons, using his p8Core App Builder.

## Backups and privacy

The encrypted Master Backup includes the four tools and hub preferences. The File Library requires a **separate encrypted backup** and is not included in the Master Backup. It uses local IndexedDB; moving or deleting the original computer file after import does not alter the copy in IndexedDB. Data on disk is not encrypted merely because the library's exported backup can be encrypted. Browser storage can be wiped by organizational policy. Confirm permission to store confidential information in an unencrypted, locally cached web app.

## Release validation and limitations

The release was checked for workplace/personnel/client seeds in deployable source, consistency of the release/update/cache identity, script syntax, existing storage key continuity, and automated browser smoke tests. Physical print output and your organization's browser/device/security policies cannot be certified here. Keep your earlier verified backup and test on the actual work PC before full production use.
