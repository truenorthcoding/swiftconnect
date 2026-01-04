-- CreateTable: User
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "whopUserId" TEXT NOT NULL,
  "email" TEXT,
  "name" TEXT,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_whopUserId_key" ON "User"("whopUserId");

-- CreateTable: Workspace
CREATE TABLE "Workspace" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "whopBusinessId" TEXT NOT NULL,
  "name" TEXT,
  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Workspace_whopBusinessId_key" ON "Workspace"("whopBusinessId");

-- CreateTable: Membership
CREATE TABLE "Membership" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "whopMembershipId" TEXT,
  "status" TEXT NOT NULL,
  CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Membership_workspaceId_idx" ON "Membership"("workspaceId");
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");
CREATE UNIQUE INDEX "Membership_userId_workspaceId_productId_key" ON "Membership"("userId", "workspaceId", "productId");

ALTER TABLE "Membership"
  ADD CONSTRAINT "Membership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Membership"
  ADD CONSTRAINT "Membership_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Session
CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "whopAccessToken" TEXT,
  "whopAccessTokenExpiresAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_workspaceId_idx" ON "Session"("workspaceId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: FailedPayment (add workspaceId + FK)
ALTER TABLE "FailedPayment" ADD COLUMN "workspaceId" TEXT;

-- Backfill existing rows into a legacy workspace so we can enforce NOT NULL.
INSERT INTO "Workspace" ("id", "createdAt", "updatedAt", "whopBusinessId", "name")
VALUES ('__legacy__', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '__legacy__', 'Legacy')
ON CONFLICT ("whopBusinessId") DO NOTHING;

UPDATE "FailedPayment"
SET "workspaceId" = '__legacy__'
WHERE "workspaceId" IS NULL;

ALTER TABLE "FailedPayment" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "FailedPayment"
  ADD CONSTRAINT "FailedPayment_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "FailedPayment_workspaceId_idx" ON "FailedPayment"("workspaceId");

