# Beta 4, consultation-only print/PDF option

Product: p8Work 1.2.5, Consultation Form Manager 1.4.5, Beta 4.
Based on user-supplied latest deploy baseline p8Work 1.2.4 and Consultation Form Manager 1.4.4.

- On the consultation workspace, an "Include medication attachment" checkbox is checked by default.
- Unchecking it hides medication pages, suppresses the duplex blank page, updates the form to say the med list is not attached, and allows consultation-only print/PDF without needing same-day medication review.
- Rechecking it restores the current packet/medication freshness rules.
- "Save PDF" in the consultation workspace honors this checkbox. Individual client cards also offer "Consult-Only PDF" independently of the checkbox.
- Excluding the attachment never removes stored medication data and does not alter the client's saved status.
- The existing client metadata key and MAR IndexedDB image storage remain unchanged.
- The other three p8Work tools are byte-for-byte preserved.

Testing: Chromium browser emulation (self-contained page) tested one-page consult-only PDF and print, stale medication bypass only while excluded, normal two-page PDF on fresh synthetic text meds, and preservation of saved med data. JavaScript syntax passed. This environment blocks normal file and localhost navigation; IndexedDB is also unavailable on its synthetic opaque browser origin, so live-origin migration, real MAR image storage, real Windows printing, installed PWA and physical printers remain NOT TESTED.

Separate user-upload audit: 10 consultation PDFs paired with 10 cleaned MAR PDFs, 51/51 image references matched correct source images, four handwritten Notes pages omitted in three packets. See separately delivered Audit Markdown for the page-by-page findings. These private files were NOT embedded in p8Work packages.
