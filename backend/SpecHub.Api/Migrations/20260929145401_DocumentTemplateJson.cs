using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpecHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class DocumentTemplateJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            /*
            migrationBuilder.AlterColumn<string>(
                name: "ModulesJson",
                table: "DocumentTemplates",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
            */
            migrationBuilder.Sql("""
                ALTER TABLE "DocumentTemplates"
                ALTER COLUMN "ModulesJson"
                TYPE jsonb
                USING "ModulesJson"::jsonb;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ModulesJson",
                table: "DocumentTemplates",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");
        }
    }
}
