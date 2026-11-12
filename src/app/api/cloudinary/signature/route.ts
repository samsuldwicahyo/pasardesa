import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { createCloudinarySignature } from "@/lib/cloudinary";

export async function POST(request: Request) {
  await requireRole(["SUPER_ADMIN", "BUMDES_ADMIN", "SELLER"]);

  try {
    const body = (await request.json()) as {
      folder?: string;
      timestamp?: number;
    };

    const timestamp = body.timestamp || Math.floor(Date.now() / 1000);
    const folder = body.folder || "pasardesa/uploads";
    const signed = createCloudinarySignature({ folder, timestamp });

    return NextResponse.json({
      ...signed,
      folder,
      timestamp,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal membuat signature.",
      },
      { status: 400 },
    );
  }
}
