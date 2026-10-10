using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SpecHub.Api.Data;

#nullable disable

namespace SpecHub.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261002200000_ModuleTemplateSavedModuleFields")]
public partial class ModuleTemplateSavedModuleFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "SavedModuleJson", table: "ModuleTemplates", type: "jsonb", nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "SavedAt", table: "ModuleTemplates", type: "timestamp with time zone", nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "SavedModuleJson", table: "ModuleTemplates");
        migrationBuilder.DropColumn(name: "SavedAt", table: "ModuleTemplates");
    }
}
