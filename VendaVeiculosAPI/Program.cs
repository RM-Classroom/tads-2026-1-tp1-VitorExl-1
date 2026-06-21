using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using VendaVeiculosAPI.Models;

namespace VendaVeiculosAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddDbContext<VendaVeiculosContext>(opt =>
                opt.UseInMemoryDatabase("VendaVeiculosDb")
            );
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            var siblingFrontendPath = Path.GetFullPath(
                Path.Combine(app.Environment.ContentRootPath, "..", "Frontend")
            );
            var localFrontendPath = Path.Combine(app.Environment.ContentRootPath, "Frontend");
            var frontendPath = Directory.Exists(siblingFrontendPath)
                ? siblingFrontendPath
                : localFrontendPath;

            if (Directory.Exists(frontendPath))
            {
                var frontendProvider = new PhysicalFileProvider(frontendPath);

                app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = frontendProvider });

                app.UseStaticFiles(new StaticFileOptions { FileProvider = frontendProvider });
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
