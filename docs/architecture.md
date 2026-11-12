# PasarDesa Architecture

## Runtime shape
- Single fullstack Next.js App Router app lives at the repository root.
- PostgreSQL stores all tenants, users, sellers, products, orders, and payment proofs.
- Prisma is the only ORM and data access layer.
- Auth.js credentials flow authenticates `SUPER_ADMIN`, `BUMDES_ADMIN`, and `SELLER`.
- Cloudinary stores product images and payment proof uploads.

## Multi-tenant rules
- Public routes are segmented by `tenantSlug` under `/pasar/[tenantSlug]`.
- Dashboard access is role-based and tenant-aware.
- Every seller, product, order group, and child order belongs to exactly one tenant.
- Buyer cart may include multiple sellers only within the same tenant.

## Checkout model
- Guest checkout creates one `OrderGroup`.
- Items are split into child `Order` rows per seller.
- Payment instructions and WhatsApp links are stored as snapshots on each child order.
- Manual payment proof is uploaded per child order, not per order group.

## App surfaces
- Public storefront: tenant catalog, product detail, checkout, order status.
- Super admin dashboard: create tenants and first BUMDes admin account.
- Tenant dashboard: seller management, tenant orders, aggregate metrics.
- Seller dashboard: product management, payment option setup, seller order review.
