using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SpecHub.Api.Data;

#nullable disable

namespace SpecHub.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261002190000_DocumentTemplateUnlink")]
public partial class DocumentTemplateUnlink : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Documents_DocumentTemplates_TemplateId_TemplateVersion",
            table: "Documents");

        migrationBuilder.DropIndex(
            name: "IX_Documents_TemplateId_TemplateVersion",
            table: "Documents");

        migrationBuilder.DropColumn(name: "TemplateId", table: "Documents");
        migrationBuilder.DropColumn(name: "TemplateVersion", table: "Documents");
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        throw new NotSupportedException("Document template references were intentionally removed and cannot be restored automatically.");
}
