using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VendaVeiculosAPI.Models;

namespace VendaVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendaController : ControllerBase
    {
        private readonly VendaVeiculosContext _context;

        public VendaController(VendaVeiculosContext context)
        {
            _context = context;
        }

        // GET: api/Venda
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Venda>>> GetVendas()
        {
            //return await _context.Vendas.ToListAsync();

            // O Include faz o JOIN entre as tabelas
            var vendas = await _context.Vendas
                .Include(v => v.Veiculo)
                .Include(v => v.Cliente)
                .Select(v => new {
                    IdVenda = v.Id,
                    Data = v.DataVenda,
                    Valor = v.ValorVenda,
                    Carro = v.Veiculo.Modelo, // Dado que vem do Join
                    Comprador = v.Cliente.Nome, // Dado que vem do Join
                    CpfComprador = v.Cliente.CPF
                })
                .ToListAsync();

            return Ok(vendas);
        }

        // GET: api/Venda/5
        [HttpGet("{id}")]
        /*public async Task<ActionResult<Venda>> GetVenda(int id)
        {
            var venda = await _context.Vendas.FindAsync(id);

            if (venda == null)
            {
                return NotFound();
            }

            return venda;
        }*/

        public async Task<ActionResult<object>> GetVenda(int id)
        {
            // utilização do join
            var venda = await _context.Vendas
                .Include(v => v.Veiculo)
                .Include(v => v.Cliente)
                .Where(v => v.Id == id)
                .Select(v => new {
                    v.Id,
                    v.DataVenda,
                    v.ValorVenda,
                    ModeloVeiculo = v.Veiculo.Modelo, // Join em Veiculo
                    NomeCliente = v.Cliente.Nome      // Join em Cliente
                })
                .FirstOrDefaultAsync();

            if (venda == null)
            {
                return NotFound($"Venda com ID {id} não encontrada.");
            }

            return Ok(venda);
        }

        // PUT: api/Venda/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVenda(int id, Venda venda)
        {
            if (id != venda.Id)
            {
                return BadRequest();
            }

            // Verifica se o cliente e o carro existem na atualização
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == venda.ClienteId);
            var veiculoExiste = await _context.Veiculos.AnyAsync(v => v.Id == venda.VeiculoId);

            if (!clienteExiste || !veiculoExiste)
            {
                return BadRequest("Impossível atualizar: Cliente ou Veículo informado não existe.");
            }

            if (venda.ValorVenda <= 0)
            {
                return BadRequest("O valor da venda deve ser maior que zero.");
            }

            _context.Entry(venda).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VendaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Venda
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Venda>> PostVenda(Venda venda)
        {
            // Verifica se o cliente existe
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == venda.ClienteId);
            // Verifica se o veículo existe
            var veiculoExiste = await _context.Veiculos.AnyAsync(v => v.Id == venda.VeiculoId);

            if (!clienteExiste || !veiculoExiste)
            {
                return BadRequest("Cliente ou Veículo informado não existe no sistema.");
            }

            if (venda.ValorVenda <= 0)
            {
                return BadRequest("O valor da venda deve ser maior que zero.");
            }

            try
            {
                _context.Vendas.Add(venda);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetVenda", new { id = venda.Id }, venda);
            }
            catch (Exception ex)
            {
                // Tratamento de exceção
                return StatusCode(500, $"Erro interno ao processar a venda: {ex.Message}");
            }
        }

        // DELETE: api/Venda/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVenda(int id)
        {
            var venda = await _context.Vendas.FindAsync(id);
            if (venda == null)
            {
                return NotFound();
            }

            _context.Vendas.Remove(venda);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VendaExists(int id)
        {
            return _context.Vendas.Any(e => e.Id == id);
        }
    }
}
