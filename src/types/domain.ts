import type {
  FulfillmentStatus,
  OrderGroupStatus,
  PaymentMethod,
  PaymentProofStatus,
  PaymentStatus,
  ProductStatus,
  UserRole,
} from "@prisma/client";

export type SessionUser = {
  id: string;
  role: UserRole;
  tenantId?: string | null;
  sellerId?: string | null;
  name?: string | null;
  email?: string | null;
  mustChangePassword?: boolean;
};

export type TenantCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contactPhone: string | null;
};

export type MarketplaceProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  sellerId: string;
  sellerName: string;
  sellerSlug: string;
  sellerWhatsappNumber: string | null;
  imageUrl: string | null;
  paymentMethods: PaymentMethod[];
};

export type OrderStatusCard = {
  id: string;
  code: string;
  sellerName: string;
  whatsappTarget: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  totalAmount: number;
  paymentAccountName: string | null;
  paymentAccountNumber: string | null;
  paymentBankName: string | null;
  paymentQrisImageUrl: string | null;
  paymentInstructions: string | null;
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  proofs: Array<{
    id: string;
    imageUrl: string;
    note: string | null;
    status: PaymentProofStatus;
    reviewNote: string | null;
    createdAt: string;
  }>;
};

export type OrderGroupView = {
  id: string;
  code: string;
  tenantSlug?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  buyerAddress: string;
  buyerNote: string | null;
  paymentMethod: PaymentMethod;
  status: OrderGroupStatus;
  subtotal: number;
  totalAmount: number;
  orders: OrderStatusCard[];
};
