// Verifica que un webhook venga realmente de Meta y no de un impostor.
// Meta firma cada petición con HMAC-SHA256 usando el "App Secret".
import crypto from "node:crypto";

export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
