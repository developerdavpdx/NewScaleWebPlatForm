using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PTM.Models
{
    public class SkuInfo
    {
        public int Id { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public double MinWeight { get; set; }
        public double MaxWeight { get; set; }
    }
    public class LineaData
    {
        public string Id { get; set; }
        public string Sku { get; set; }
        public string Planta { get; set; }
        public string KgHora { get; set; }
        public string Linea { get; set; }
    }

    public class ListSkuInfo
    {
        public IList<SkuInfo> skuInfos { get; set; }
    }
}