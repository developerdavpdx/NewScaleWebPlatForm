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
    public class DetallesFOController : Controller
    {
        // GET: DetallesFO
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> GetDetailFabricOrder(string docEntry)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("docentry", docEntry);

                    var response = await http.GetAsync($"{webapi}/api/SapPtm/GetFabricOrderDetail");

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
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }
    }
}