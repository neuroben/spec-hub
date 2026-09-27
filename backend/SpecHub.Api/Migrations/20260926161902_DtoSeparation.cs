using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpecHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class DtoSeparation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentModules");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Modules");

            migrationBuilder.CreateTable(
                name: "Document",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModulesJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Document", x => new { x.Id, x.Version });
                });

            migrationBuilder.CreateTable(
                name: "ModuleTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    ParametersJson = table.Column<string>(type: "jsonb", nullable: false),
                    Comments = table.Column<string>(type: "jsonb", nullable: false),
                    Owners = table.Column<string>(type: "jsonb", nullable: false),
                    ComponentsJson = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleTemplates", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Document");

            migrationBuilder.DropTable(
                name: "ModuleTemplates");

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => new { x.Id, x.Version });
                });

            migrationBuilder.CreateTable(
                name: "Modules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Comments = table.Column<string>(type: "jsonb", nullable: false),
                    Owners = table.Column<string>(type: "jsonb", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Components = table.Column<string>(type: "jsonb", nullable: false),
                    Parameters = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentModules",
                columns: table => new
                {
                    ModulesId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentVersion = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentModules", x => new { x.ModulesId, x.DocumentId, x.DocumentVersion });
                    table.ForeignKey(
                        name: "FK_DocumentModules_Documents_DocumentId_DocumentVersion",
                        columns: x => new { x.DocumentId, x.DocumentVersion },
                        principalTable: "Documents",
                        principalColumns: new[] { "Id", "Version" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentModules_Modules_ModulesId",
                        column: x => x.ModulesId,
                        principalTable: "Modules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentModules_DocumentId_DocumentVersion",
                table: "DocumentModules",
                columns: new[] { "DocumentId", "DocumentVersion" });
        }
    }
}
