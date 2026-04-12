namespace VendaVeiculosAPI.Models
{
    public class Aluguel
    {
        public int Id { get; set; }

        //fk
        public int ClienteID { get; set; }
        public Cliente? Cliente { get; set; }

        //fk
        public int VeiculoID { get; set; }
        public Veiculo? Veiculo { get; set; }

        //Atributos da venda
        public DateTime DataInicio { get; set; }
        public DateTime? DataDevolucao { get; set; }
        public double KmInicial { get; set; }
        public double? KmFinal { get; set; }
        public decimal ValorDiaria { get; set; }
        public decimal ValorTotal { get; set; }
    }
}
