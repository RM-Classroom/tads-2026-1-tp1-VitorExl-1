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
    public class AluguelController : ControllerBase
    {
        private readonly VendaVeiculosContext _context;

        public AluguelController(VendaVeiculosContext context)
        {
            _context = context;
        }

        // GET: api/Aluguels
        [HttpGet]
        /*public async Task<ActionResult<IEnumerable<Aluguel>>> GetAlugueis()
        {
            return await _context.Alugueis.ToListAsync();
        }*/
        public async Task<ActionResult<IEnumerable<object>>> GetAlugueis()
        {
            return Ok(await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .Select(a => new {
                    a.Id,
                    Cliente = a.Cliente.Nome,
                    Veiculo = a.Veiculo.Modelo,
                    a.DataInicio,
                    a.DataDevolucao,
                    a.ValorTotal
                }).ToListAsync());
        }

        // GET: api/Aluguels/5
        [HttpGet("{id}")]
        /*public async Task<ActionResult<Aluguel>> GetAluguel(int id)
        {
            var aluguel = await _context.Alugueis.FindAsync(id);

            if (aluguel == null)
            {
                return NotFound();
            }

            return aluguel;
        }*/
        public async Task<ActionResult<object>> GetAluguel(int id)
        {
            var aluguel = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .Where(a => a.Id == id)
                .Select(a => new {
                    a.Id,
                    a.ClienteID,
                    NomeCliente = a.Cliente.Nome,
                    a.VeiculoID,
                    ModeloVeiculo = a.Veiculo.Modelo,
                    a.DataInicio,
                    a.DataDevolucao,
                    a.ValorDiaria,
                    a.ValorTotal
                }).FirstOrDefaultAsync();

            if (aluguel == null) return NotFound($"Aluguel ID {id} não encontrado.");

            return Ok(aluguel);
        }

        // PUT: api/Aluguels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluguel(int id, Aluguel aluguel)
        {
            if (id != aluguel.Id)
            {
                return BadRequest("Erro: ID do aluguel não corresponde ao ID fornecido.");
            }

            // validar a data de devolução, não podendo ser menor que a data do inicio do lauguel
            if (aluguel.DataDevolucao.HasValue && aluguel.DataDevolucao < aluguel.DataInicio)
            {
                return BadRequest("Erro: A data de devolução não pode ser anterior à data de início do aluguel.");
            }

            _context.Entry(aluguel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AluguelExists(id))
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

        // POST: api/Aluguels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        /*public async Task<ActionResult<Aluguel>> PostAluguel(Aluguel aluguel)
        {
            _context.Alugueis.Add(aluguel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAluguel", new { id = aluguel.Id }, aluguel);
        }*/
        public async Task<ActionResult<Aluguel>> PostAluguel(Aluguel aluguel)
        {
            // Validação de existência
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == aluguel.ClienteID);
            var veiculoExiste = await _context.Veiculos.AnyAsync(v => v.Id == aluguel.VeiculoID);

            if (!clienteExiste || !veiculoExiste)
                return BadRequest("Cliente ou Veículo inexistente.");

            // Validação de Regra de Negócio: Data de Devolução (Se preenchida)
            if (aluguel.DataDevolucao.HasValue && aluguel.DataDevolucao < aluguel.DataInicio)
                return BadRequest("A data de devolução não pode ser menor que a data de início.");
            try
            {
                _context.Alugueis.Add(aluguel);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetAluguel", new { id = aluguel.Id }, aluguel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao processar aluguel: {ex.Message}");
            }
        }

        // DELETE: api/Aluguels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluguel(int id)
        {
            var aluguel = await _context.Alugueis.FindAsync(id);
            if (aluguel == null)
            {
                return NotFound();
            }

            _context.Alugueis.Remove(aluguel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AluguelExists(int id)
        {
            return _context.Alugueis.Any(e => e.Id == id);
        }
    }
}
