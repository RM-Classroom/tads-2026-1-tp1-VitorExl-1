namespace VendaVeiculosAPI.Models
{
    public class Fabricante
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;

        //One to many com veiculos
        public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
    }
}
