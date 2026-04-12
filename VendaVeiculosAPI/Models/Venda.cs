namespace VendaVeiculosAPI.Models
{
    public class Venda
    {
        public int Id { get; set; }

        //fk
        public int VeiculoId { get; set; }
        public Veiculo? Veiculo { get; set; }

        //fk
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        //Atributos da venda
        public DateTime DataVenda { get; set; }
        public decimal ValorVenda { get; set; }

    }
}
