import { describe, expect, it } from "vitest";

import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";

describe("whatsapp helpers", () => {
  it("normalizes indonesian numbers", () => {
    expect(normalizeWhatsAppNumber("0812-3456-7890")).toBe("6281234567890");
  });

  it("builds a wa.me link", () => {
    expect(buildWhatsAppLink("081234567890", "Halo seller")).toContain(
      "https://wa.me/6281234567890",
    );
  });
});
