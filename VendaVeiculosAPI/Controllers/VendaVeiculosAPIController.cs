using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VendaVeiculosAPI.Models;

namespace VendaVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultasController : ControllerBase
    {
        private readonly VendaVeiculosContext _context;

        public ConsultasController(VendaVeiculosContext context)
        {
            _context = context;
        }

        // Consulta compras de um determinado cliente (ID)
        [HttpGet("compras-cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetComprasPorCliente(int clienteId)
        {
            var compras = await _context.Vendas
                .Include(v => v.Veiculo)
                .Include(v => v.Cliente)
                .Where(v => v.ClienteId == clienteId)
                .Select(v => new {
                    v.Id,
                    Data = v.DataVenda,
                    ValorVenda = v.ValorVenda,
                    Carro = v.Veiculo.Modelo,
                    Comprador = v.Cliente.Nome
                })
                .ToListAsync();

            return Ok(compras);
        }

        // Consulta modelos de carro de um determinado fabricante (ID)
        [HttpGet("veiculos-fabricante/{fabricanteId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetVeiculosPorFabricante(int fabricanteId)
        {
            var veiculos = await _context.Veiculos
                .Include(v => v.Fabricante)
                .Where(v => v.FabricanteId == fabricanteId)
                .Select(v => new {
                    v.Modelo,
                    v.AnoFabricacao,
                    Marca = v.Fabricante.Nome
                })
                .ToListAsync();

            return Ok(veiculos);
        }

        // Consulta as vendas de um determinado fabricante (ID)
        [HttpGet("vendas-por-fabricante/{fabricanteId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetVendasPorFabricante(int fabricanteId)
        {
            var vendas = await _context.Vendas
                .Include(v => v.Veiculo)
                    .ThenInclude(veic => veic.Fabricante) 
                .Include(v => v.Cliente)
                .Where(v => v.Veiculo.FabricanteId == fabricanteId)
                .Select(v => new {
                    VendaId = v.Id,
                    v.DataVenda,
                    Modelo = v.Veiculo.Modelo,
                    Marca = v.Veiculo.Fabricante.Nome,
                    Comprador = v.Cliente.Nome
                })
                .ToListAsync();

            return Ok(vendas);
        }

        // Consulta aluguéis ativos de um cliente
        [HttpGet("alugueis-cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAlugueisPorCliente(int clienteId)
        {
            return Ok(await _context.Alugueis
                .Include(a => a.Veiculo)
                .Where(a => a.ClienteID == clienteId)
                .Select(a => new {
                    a.Id,
                    a.DataInicio,
                    a.DataDevolucao,
                    Carro = a.Veiculo.Modelo,
                    Status = a.DataDevolucao == null ? "Em andamento" : "Finalizado"
                })
                .ToListAsync());
        }

        // Consulta faturamento total por veículo
        [HttpGet("faturamento-veiculo/{veiculoId}")]
        public async Task<ActionResult> GetFaturamentoVeiculo(int veiculoId)
        {
            var total = await _context.Vendas
                .Where(v => v.VeiculoId == veiculoId)
                .SumAsync(v => v.ValorVenda);

            var veiculo = await _context.Veiculos.FindAsync(veiculoId);

            return Ok(new
            {
                Veiculo = veiculo?.Modelo ?? "Não encontrado",
                TotalVendido = total
            });
        }
    }
}