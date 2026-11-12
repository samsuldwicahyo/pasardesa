import { v2 as cloudinary } from "cloudinary";

import { env, hasCloudinaryConfig } from "@/lib/env";

let configured = false;

function ensureCloudinary() {
  if (!configured && hasCloudinaryConfig()) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }

  return hasCloudinaryConfig();
}

export async function uploadFileToCloudinary(
  file: File,
  folder: string,
  publicId?: string,
) {
  if (!ensureCloudinary()) {
    throw new Error("Cloudinary belum dikonfigurasi.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function createCloudinarySignature(params: Record<string, string | number>) {
  if (!ensureCloudinary()) {
    throw new Error("Cloudinary belum dikonfigurasi.");
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
  };
}
