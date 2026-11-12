export type TenantCartItem = {
  productId: string;
  quantity: number;
};

function cartKey(tenantSlug: string) {
  return `pasardesa-cart:${tenantSlug}`;
}

export function readTenantCart(tenantSlug: string): TenantCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(cartKey(tenantSlug));

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as TenantCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTenantCart(tenantSlug: string, items: TenantCartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(cartKey(tenantSlug), JSON.stringify(items));
}

export function clearTenantCart(tenantSlug: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(cartKey(tenantSlug));
}
