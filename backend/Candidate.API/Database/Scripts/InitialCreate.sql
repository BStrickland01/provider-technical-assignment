CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
    "ProductVersion" TEXT NOT NULL
);

BEGIN TRANSACTION;

CREATE TABLE "Providers" (
    "ProviderId" INTEGER NOT NULL CONSTRAINT "PK_Providers" PRIMARY KEY AUTOINCREMENT,
    "ProviderName" TEXT NOT NULL,
    "County" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "CreatedDate" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "IsDeleted" INTEGER NOT NULL DEFAULT 0,
    "DeletedAtUtc" TEXT NULL
);

CREATE TABLE "Licenses" (
    "LicenseId" INTEGER NOT NULL CONSTRAINT "PK_Licenses" PRIMARY KEY AUTOINCREMENT,
    "ProviderId" INTEGER NOT NULL,
    "LicenseNumber" TEXT NOT NULL,
    "LicenseStatus" TEXT NOT NULL,
    "ExpirationDate" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL DEFAULT 0,
    "DeletedAtUtc" TEXT NULL,
    CONSTRAINT "FK_Licenses_Providers_ProviderId" FOREIGN KEY ("ProviderId") REFERENCES "Providers" ("ProviderId") ON DELETE RESTRICT
);

CREATE INDEX "IX_Licenses_ExpirationDate" ON "Licenses" ("ExpirationDate");

CREATE INDEX "IX_Licenses_IsDeleted" ON "Licenses" ("IsDeleted");

CREATE INDEX "IX_Licenses_LicenseNumber" ON "Licenses" ("LicenseNumber");

CREATE INDEX "IX_Licenses_ProviderId" ON "Licenses" ("ProviderId");

CREATE INDEX "IX_Providers_County" ON "Providers" ("County");

CREATE INDEX "IX_Providers_IsDeleted" ON "Providers" ("IsDeleted");

CREATE INDEX "IX_Providers_ProviderName" ON "Providers" ("ProviderName");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20261012153457_InitialCreate', '8.0.31');

COMMIT;

