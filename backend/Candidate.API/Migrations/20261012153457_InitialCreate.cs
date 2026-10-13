using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Candidate.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Providers",
                columns: table => new
                {
                    ProviderId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProviderName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    County = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Providers", x => x.ProviderId);
                });

            migrationBuilder.CreateTable(
                name: "Licenses",
                columns: table => new
                {
                    LicenseId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProviderId = table.Column<int>(type: "INTEGER", nullable: false),
                    LicenseNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LicenseStatus = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Licenses", x => x.LicenseId);
                    table.ForeignKey(
                        name: "FK_Licenses_Providers_ProviderId",
                        column: x => x.ProviderId,
                        principalTable: "Providers",
                        principalColumn: "ProviderId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Licenses_ExpirationDate",
                table: "Licenses",
                column: "ExpirationDate");

            migrationBuilder.CreateIndex(
                name: "IX_Licenses_IsDeleted",
                table: "Licenses",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Licenses_LicenseNumber",
                table: "Licenses",
                column: "LicenseNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Licenses_ProviderId",
                table: "Licenses",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_Providers_County",
                table: "Providers",
                column: "County");

            migrationBuilder.CreateIndex(
                name: "IX_Providers_IsDeleted",
                table: "Providers",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Providers_ProviderName",
                table: "Providers",
                column: "ProviderName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Licenses");

            migrationBuilder.DropTable(
                name: "Providers");
        }
    }
}
