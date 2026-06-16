using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PTM.Models
{
    public class SKUInfo
    {
        public int id { get; set; }
        public string itemCode { get; set; }
        public string itemName { get; set; }
        public double minWeight { get; set; }
        public double maxWeight { get; set; }
        public int multiploCant { get; set; }
        public string multiploCategoria { get; set; }
        public int variable { get; set; }
        public string fijoCategoria { get; set; }
    }

    public class ProductoTerminado
    {
        public int id { get; set; }
        public int id_SKU { get; set; }
        public SKUInfo skuInfo { get; set; }
        public string clasification { get; set; }
        public int numLine { get; set; }
        public bool status { get; set; }
        public DateTime updateDate { get; set; }
    }

    public class Lineas
    {
        public int id_linea { get; set; }
        public string descripcion { get; set; }
        public bool asignado { get; set; }
    }

    public class RootObject
    {
        public List<ProductoTerminado> productoTerminados { get; set; }
        public List<Lineas> lineas { get; set; }
    }
}