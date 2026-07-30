Salesman Services V6.8 - Reservation Cleanup Fix

Changes:
- Deleting an unpaid order in /admin now releases the linked account immediately.
- The account returns to Available and reservation fields are cleared.
- Paid/completed orders are protected from accidental deletion.
- Server-side reconciliation also clears orphaned reservations on Save changes.
- Existing storefront, checkout, vault, payment monitoring, email delivery, Discord alerts and SEO remain unchanged.
