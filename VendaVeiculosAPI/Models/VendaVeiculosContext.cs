using Microsoft.EntityFrameworkCore;


namespace VendaVeiculosAPI.Models
{
    public class VendaVeiculosContext : DbContext
    {
        public VendaVeiculosContext(DbContextOptions<VendaVeiculosContext> options) 
            : base(options) { }

        public DbSet<Veiculo> Veiculos { get; set; }
        public DbSet<Fabricante> Fabricantes { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Aluguel> Alugueis { get; set; }
        public DbSet<Venda> Vendas { get; set; }

    }
}
