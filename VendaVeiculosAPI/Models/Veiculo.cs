using System.Text.Json.Serialization;

namespace VendaVeiculosAPI.Models
{
    public class Veiculo
    {
        public int Id { get; set; }
        public string Modelo { get; set; } = string.Empty;
        public int AnoFabricacao { get; set; }
        public double Quilometragem { get; set; }

        //fk
        public int FabricanteId { get; set; }
        [JsonIgnore]
        public Fabricante? Fabricante { get; set; }
    }
}
