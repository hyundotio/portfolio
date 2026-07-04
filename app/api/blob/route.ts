import { issueSignedToken, presignUrl } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_VIDEO_PATHS = new Set([
  "assets/work/hawkeye-product-prototype.mp4",
  "assets/work/hawkeye-rf-signals-workflow-video.mp4",
  "assets/work/ibm-interfaces-beyond-screen.mp4",
  "assets/work/ibm-project-debater-ai-explainer.mp4",
  "assets/work/ibm-qiskit-getting-started.mp4",
  "assets/work/ibm-quantum-education-ux.mp4",
  "assets/work/ibm-spatial-interaction-prototype.mp4",
]);

function getBlobAuthOptions() {
  if (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID) {
    return {
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
      storeId: process.env.BLOB_STORE_ID,
    };
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    };
  }

  return {};
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");

  if (!pathname || !ALLOWED_VIDEO_PATHS.has(pathname)) {
    return NextResponse.json({ error: "Blob not found" }, { status: 404 });
  }

  const validUntil = Date.now() + 5 * 60 * 1000;
  const signedToken = await issueSignedToken({
    ...getBlobAuthOptions(),
    pathname,
    operations: ["get"],
    validUntil,
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname,
    access: "private",
    validUntil,
  });

  return NextResponse.redirect(presignedUrl, 307);
}
