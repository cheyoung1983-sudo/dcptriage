import { refreshVercelToken } from "@/lib/vercelAuth";
import * as fs from "fs";
import * as path from "path";
import { NextResponse } from "next/server";

// Path to the same JSON store used by the script
const storePath = path.resolve(process.cwd(), "tokenStore.json");

export async function GET() {
  if (!fs.existsSync(storePath)) {
    return NextResponse.json({ error: "Token store not found" }, { status: 404 });
  }

  const data = JSON.parse(fs.readFileSync(storePath, "utf-8")) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  const now = Math.floor(Date.now() / 1000);

  // Refresh if within 5 minutes of expiry
  if (data.refresh_token && data.expires_at - now < 300) {
    try {
      const newToken = await refreshVercelToken(data.refresh_token);
      const updated = {
        access_token: (newToken as any).access_token,
        refresh_token: (newToken as any).refresh_token ?? data.refresh_token,
        expires_at: now + (newToken as any).expires_in,
      };
      fs.writeFileSync(storePath, JSON.stringify(updated, null, 2));
      return NextResponse.json({ refreshed: true, token: updated });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ refreshed: false, token: data });
}
