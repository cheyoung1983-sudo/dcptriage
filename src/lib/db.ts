import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import type { SignerConfig } from "@aws-sdk/rds-signer";
import { ClientBase, Pool } from "pg";

const signerOptions: SignerConfig = {
  hostname: process.env.PGHOST || '',
  port: Number(process.env.PGPORT) || 5432,
  username: process.env.PGUSER || '',
  region: process.env.AWS_REGION || "us-east-1",
};

// Use Vercel OIDC credentials only when running in Vercel environment
if (process.env.VERCEL && process.env.AWS_ROLE_ARN) {
  signerOptions.credentials = awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION || "us-east-1" },
  });
}

const signer = new Signer(signerOptions);

let poolInstance: any;

try {
  if (process.env.PGHOST && process.env.PGUSER) {
    poolInstance = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE || "postgres",
      password: () => signer.getAuthToken(),
      port: Number(process.env.PGPORT) || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
      max: 20,
    });
    try {
      attachDatabasePool(poolInstance);
    } catch {
      // Ignore if attachDatabasePool is not supported in this runtime
    }
  } else {
    throw new Error("PGHOST or PGUSER not set");
  }
} catch {
  console.warn('[AI Studio] Database not connected — mock active');
  poolInstance = {
    query: async () => ({ rows: [] }),
    connect: async () => ({
      query: async () => ({ rows: [] }),
      release: () => {},
    }),
  };
}

export const pool = poolInstance;

// Single query transaction with safe mock fallback.
export async function query(sql: string, args: unknown[] = []) {
  try {
    if (!poolInstance || !isDbConfigured()) {
      return { rows: [] };
    }
    return await poolInstance.query(sql, args);
  } catch (err) {
    console.warn('[AI Studio] Database query failed — fallback to empty rows:', err);
    return { rows: [] };
  }
}

// Use it for multiple queries transaction with safe fallback.
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  if (!poolInstance || !isDbConfigured()) {
    const mockClient = { query: async () => ({ rows: [] }), release: () => {} } as unknown as ClientBase;
    return await fn(mockClient);
  }
  try {
    const client = await poolInstance.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[AI Studio] Database connection failed — mock active:', err);
    const mockClient = { query: async () => ({ rows: [] }), release: () => {} } as unknown as ClientBase;
    return await fn(mockClient);
  }
}

/**
 * Safe helper to check if database configuration is complete.
 */
export function isDbConfigured(): boolean {
  return !!(process.env.PGHOST && process.env.PGUSER);
}
