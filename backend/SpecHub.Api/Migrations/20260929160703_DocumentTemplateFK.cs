using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpecHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class DocumentTemplateFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TemplateId",
                table: "Documents",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "TemplateVersion",
                table: "Documents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TemplateId_TemplateVersion",
                table: "Documents",
                columns: new[] { "TemplateId", "TemplateVersion" });

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_DocumentTemplates_TemplateId_TemplateVersion",
                table: "Documents",
                columns: new[] { "TemplateId", "TemplateVersion" },
                principalTable: "DocumentTemplates",
                principalColumns: new[] { "Id", "Version" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_DocumentTemplates_TemplateId_TemplateVersion",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_TemplateId_TemplateVersion",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "TemplateVersion",
                table: "Documents");
        }
    }
}
