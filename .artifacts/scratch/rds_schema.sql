-- Auth.js (NextAuth) PostgreSQL Schema
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL,
  name TEXT,
  email TEXT,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  PRIMARY KEY (id)
);

-- Business Tables (Migrated from Firestore)
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "companyName" TEXT,
  device TEXT NOT NULL,
  "issueType" TEXT NOT NULL,
  status TEXT NOT NULL,
  "quotedPrice" DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER -- Links to the Auth.js user ID
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS "sessionToken_index" ON sessions ("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "email_index" ON users (email);
