import { getSignedUrl as signCloudFrontUrl } from "@aws-sdk/cloudfront-signer";

interface SignedUrlOptions {
  keyPairId?: string;
  privateKey?: string;
  dateLessThan?: string; // ISO date string
}

/**
 * Generates a CloudFront Signed URL for secure asset delivery.
 * @param url The full CloudFront URL to sign.
 * @param options Configuration for the signing process.
 */
export function getSignedUrl(url: string, options: SignedUrlOptions = {}): string {
  // Use provided options or fall back to environment variables
  const keyPairId = options.keyPairId || process.env.CLOUDFRONT_KEY_PAIR_ID_1;
  const privateKey = options.privateKey || process.env.CLOUDFRONT_PRIVATE_KEY_1;

  // Default expiry: 1 hour from now
  const expiry = options.dateLessThan || new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (!keyPairId || !privateKey) {
    console.error("[CloudFront] Missing Key Pair ID or Private Key. Returning unsigned URL.");
    return url;
  }

  try {
    return signCloudFrontUrl({
      url,
      keyPairId,
      privateKey,
      dateLessThan: expiry,
    });
  } catch (error) {
    console.error("[CloudFront] Error signing URL:", error);
    return url;
  }
}
