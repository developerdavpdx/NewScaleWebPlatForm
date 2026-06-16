using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class EnvioScrapController : Controller
    {
        // GET: EnvioScrap
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> SendToMills(string operadorEM, string codigoItemEM, string pesoEM, 
            string turnoEM, string comentariosEM, string procesoEM, string unidadEM, string fechaEnvioEM, 
            string linea, string familiaEM, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var parametros = new
                    {
                        operadorEM = operadorEM,
                        codigoItemEM = codigoItemEM,
                        pesoEM = pesoEM,
                        turnoEM = turnoEM,
                        comentariosEM = comentariosEM,
                        procesoEM = procesoEM,
                        unidadEM = unidadEM,
                        fechaEnvioEM = fechaEnvioEM,
                        linea = linea,
                        FamiliaEM = familiaEM,
                        planta = planta
                    };

                    var paramsUri = new StringContent(JsonConvert.SerializeObject(parametros), Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await http.PostAsync($"{IpWebApi}/api/Scrap/SendToMills", paramsUri);
                    //HttpResponseMessage response = await http.PostAsync($"https://localhost:7227/api/Scrap/SendToMills", paramsUri);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 500, data = textResult };
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
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/InfoTickets/getTicketTemplateMolinos");

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

        [HttpGet]
        public async Task<ActionResult> GetNextIdSendMills()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    //HttpResponseMessage response = await http.GetAsync("http://192.168.100.17:9097/api/Scrap/GetNextIdEnvioScrap");
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Scrap/GetNextIdEnvioScrap");

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
        public async Task<ActionResult> GetScaleWeight(string bascula)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("bascula", bascula);
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/Estados/ObtenerPesoBascula");
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Estados/ObtenerPesoBascula");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    } else
                    {
                        var objectResponse = new { status = 500, data = "Error al obtener el peso" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }

                }
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetItemNameInfo(string itemCode)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("itemCode", itemCode);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/SapPtm/GetItemName");

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
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }
    }
}