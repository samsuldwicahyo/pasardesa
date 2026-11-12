# PasarDesa ERD Notes

## Core relationships
- `Tenant` has many `User`, `Seller`, `Product`, `OrderGroup`, and `Order`.
- `User` may belong to one tenant and may back one `Seller`.
- `Seller` belongs to one tenant, owns many `Product`, `SellerPaymentOption`, and `Order`.
- `OrderGroup` belongs to one tenant and contains many seller-scoped `Order`.
- `Order` contains many `OrderItem` and many `PaymentProof`.
- `PaymentProof` can be reviewed by a `User`.

## Snapshot strategy
- Order rows store seller name, WhatsApp target, and payment account snapshots.
- Order items store product name, slug, image, and price snapshots.
- Snapshot fields prevent historical orders from changing when seller or product data changes later.
