# p8Work 1.3.0, Beta 4: File Library implementation and QA handoff

## Baseline and preservation

Base: `p8Work-1.2.5-Beta4-consult-only-deploy.zip`. Four `tools/*.html` files remain byte-for-byte identical to that deployment. Existing tool data keys, IndexedDB MAR image store, tool registry/schema, Master Backup format 1, settings keys, and hub restore logic are unchanged. New module `hub/file-library.js`; only hub HTML/app/update manager, service worker shell and version manifest are modified.

## Storage and features

- Separate database `p8work-file-library-v1`, object stores `entries` (metadata, id keyPath) and `fileBlobs` (actual original-byte File/Blob copies keyed by matching id). Does NOT keep links to original file paths, so once a file is imported it can be moved/deleted from the originating PC without invalidating the library copy.
- User interface: Library navigation, new nested folders, multiple-file input and drag/drop, breadcrumb navigation, Open and Manage controls for folders, rename, move (with prevention of folder cycles and duplicate names), category/tag editing and dynamic category filtering, search, name/date/size sorting, Archive and reversible Trash, permanent deletion with confirmation, image/PDF/text preview, and original-byte download.
- Each file insertion writes metadata and file bytes in one IndexedDB readwrite transaction. Permanent folder deletion deletes all descendants and Blobs in the same readwrite transaction. No automatic Trash emptying.
- Local library limit 160 MiB across *all* items including archived and trashed items. This deliberately aligns with the single-file encrypted backup ceiling so imported documents remain backup-eligible. Browser/device quotas may be lower.
- Individual folder and file control separated; clicking Open enters a folder, Manage edits the folder itself.

## File Library backup and restore

- Separate File Library encrypted backup `.p8lib` includes all entries, folders, archive/trash state, file bytes, categories and tags. Requires matching password entries of at least eight characters; uses the existing `P8WORK_CRYPTO` WebCrypto PBKDF2-SHA256 250,000 iterations and AES-256-GCM envelope.
- Before download, checks every backed-up blob's size and SHA-256, validates full hierarchy, encrypts, decrypts and verifies a round trip. If any saved file is missing or corrupted, the backup stops.
- Restore decrypts and validates complete payload and all file digests *before* showing restore options. **Merge** remaps all IDs and adds copies without modifying existing data. **Replace** requires confirmation and atomically clears/repopulates the two stores in a single IDB transaction; IDB rollback is relied upon if the transaction fails.
- `Master Backup` continues covering the existing four tools and hub preferences **but not File Library**. The app visibly states this in File Library, Backups and the Master Backup dialog. Factory reset of four tools intentionally does not clear File Library.
- Users must download the `.p8lib` to approved external storage, protect the password and verify a restore before removing their only other copy. A browser profile deletion, GitHub Pages origin change, local quota eviction, OS/device loss, or employer browser policy may remove local data. No automatic cloud synchronization, at-rest encryption, or server upload is provided.

## Update notification repair

Earlier observed mismatch in 1.2.5 between update manager's hardcoded current build ID and `release.json`. Both now use `1.3.0-beta4-file-library`; service worker shell increments to `p8work-shell-v15` and precaches new library JS. Offline support is through existing hub service worker.

## Test evidence

- JavaScript syntax checks for new/modified scripts passed (`node --check`).
- Automated Chromium **simulated-origin** interaction with explicit in-memory IDB/localStorage and test-only WebCrypto stubs: nested folders, file copy, rename, tags/category, move, cycle guard, search, archive/unarchive, Trash/permanent deletion, .p8lib backup download, restore merge and original byte recovery all passed with no page script exceptions.
- Separate real Node WebCrypto test passed AES-GCM / PBKDF2 roundtrip, wrong-password rejection and ciphertext-tampering rejection.
- Baseline comparison verifies all four registered tool HTML files unchanged.
- Release ID, updater ID, cache ID, service worker pre-cache, index script inclusion were statically verified consistent.
- Real GitHub Pages origin IndexedDB behavior, Windows installed PWA, browser backup at 160 MiB, enterprise security/privacy approval, physical printing, and browser quota behavior on user's PC are **not** tested. In-browser IDB transaction correctness relies on standard browser semantics, not observed on the target machine.
- No client documents, MARs, consultation PDFs, or test backups are included in the deployment ZIP.
