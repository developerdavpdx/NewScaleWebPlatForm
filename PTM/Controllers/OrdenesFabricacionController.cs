using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class OrdenesFabricacionController : Controller
    {
        // GET: OrdenesFabricacion
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> GetAllOrdenFabric(string planta)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("series", planta);
                    var response = await http.GetAsync($"{webapi}/api/SapPtm/GetFabricOrder");
                    
                    //var response = await http.GetAsync($"https://localhost:7227/api/SapPtm/GetFabricOrder");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        //var jsonResponse = JsonConvert.DeserializeObject<RootObject>(textResult);
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error en traer los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            } catch(Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        
    }
}