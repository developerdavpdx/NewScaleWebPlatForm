using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PTM.Models
{
    public class RootTicket
    {
        public TicketsInfo[] ticketsInfos { get; set; }
    }

    public class Linea
    {
        public int id_linea { get; set; }
        public string descripcion { get; set; }
        public bool asignado { get; set; }
    }

    public class TicketsInfo
    {
        public int idTicket { get; set; }
        public string folio { get; set; }
        public string ordenFabricacion { get; set; }
        public string itemCode { get; set; }
        public string itemName { get; set; }
        public int turno { get; set; }
        public int id_Linea { get; set; }
        public Linea linea { get; set; }
        public int operacion { get; set; }
        public int numTubos { get; set; }
        public double pesoNeto { get; set; }
        public string medida { get; set; }
        public double porcentaje { get; set; }
        public string categoria { get; set; }
    }
}