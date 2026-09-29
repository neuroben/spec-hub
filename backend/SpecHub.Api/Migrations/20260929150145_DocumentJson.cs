using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpecHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class DocumentJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            /*
            migrationBuilder.AlterColumn<string>(
                name: "ModulesJson",
                table: "Documents",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
            */
            migrationBuilder.Sql("""
                ALTER TABLE "Documents"
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
                table: "Documents",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");
        }
    }
}
