using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class PesajeMolinosController : Controller
    {
        // GET: PesajeMolinos
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> GetEnvioMolinosInfo(string idProduccion)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("idProduccion", idProduccion);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Scrap/GetAfterIdProduction");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al obtener el ticket de molinos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> RegisterScrap(int idEnvioScrap, string operadorScrap, string codigoItemScrap, double pesoScrap, string familiaScrap, string tipoScrap,
            string subFamiliaScrap, string estadoScrap, int turnoScrap, string procesoScrap, string unidadScrap)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var parametros = new
                    {
                        idEnvioScrap = idEnvioScrap,
                        operadorScrap = operadorScrap,
                        codigoItemScrap = codigoItemScrap,
                        pesoScrap = pesoScrap,
                        familiaScrap = familiaScrap,
                        tipoScrap = tipoScrap,
                        subFamiliaScrap = subFamiliaScrap,
                        estadoScrap = estadoScrap,
                        turnoScrap = turnoScrap,
                        procesoScrap = procesoScrap,
                        unidadScrap = unidadScrap,
                    };

                    var paramsUri = new StringContent(JsonConvert.SerializeObject(parametros), Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await http.PostAsync($"{IpWebApi}/api/Scrap/AddScrap", paramsUri);
                    //HttpResponseMessage response = await http.PostAsync($"https://localhost:7227/api/Scrap/AddScrap", paramsUri);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error en guardar los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpGet]
        public async Task<ActionResult> GetNextIdScrap()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Scrap/GetNextIdScrap");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al obtener el siguiente id" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> RegisterRemolido(string operadorScrap, string codigoItemScrap, int? pesoScrap, string familiaScrap, string tipoScrap,
            string subFamiliaScrap, string estadoScrap, string turnoScrap, string procesoScrap, string unidadScrap, int? idRemolidoScrap)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var parametros = new
                    {
                        operadorScrap = operadorScrap,
                        codigoItemScrap = codigoItemScrap,
                        pesoScrap = pesoScrap,
                        familiaScrap = familiaScrap,
                        tipoScrap = tipoScrap,
                        subFamiliaScrap = subFamiliaScrap,
                        estadoScrap = estadoScrap,
                        turnoScrap = turnoScrap,
                        procesoScrap = procesoScrap,
                        unidadScrap = unidadScrap,
                        idRemolidoScrap = idRemolidoScrap
                    };

                    var paramsUri = new StringContent(JsonConvert.SerializeObject(parametros), Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await http.PostAsync($"{IpWebApi}/api/Scrap/AddRemolido", paramsUri);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error en guardar los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpGet]
        public async Task<ActionResult> ObtenerTicketMolino()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/InfoTickets/getTicketTemplateScrap");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al obtener el ticket de molinos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }
    }
}