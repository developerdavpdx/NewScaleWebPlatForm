using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PTM.Models
{
    public class LoginContentResponse
    {
        public string status { get; set; }
        public string tipousuario { get; set; }
        public int empleadoid { get; set; }
        public string nombrecompleto { get; set; }
        public int planta { get; set; }
    }

    public class LoginResponse
    {
        public List<LoginContentResponse> data { get; set; }
    }
}