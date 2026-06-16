using Newtonsoft.Json;
using PTM.Models;
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
    public class PesajePtController : Controller
    {
        // GET: PesajePt
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public async Task<ActionResult> Index()
        {
            using (HttpClient client = new HttpClient())
            {
                string url = $"{IpWebApi}/api/InfoTickets/getTicketTemplate";
                HttpResponseMessage response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    ViewBag.txttemplate = responseBody;
                    return View();
                }
                else
                {
                    ViewBag.txttemplate = "";
                    return View();
                }
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetNumberOfLinies(string planta)
        {
            using(HttpClient http = new HttpClient())
            {
                http.DefaultRequestHeaders.Add("planta", planta);
                HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/ProductTerminado/GetLineas");
                //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/ProductTerminado/GetLineas");

                if (response.IsSuccessStatusCode)
                {
                    var textResult = await response.Content.ReadAsStringAsync();
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

        [HttpPost]
        public async Task<ActionResult> ValidateSKU(string linea, string itemcode)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/Linias/ValidateSkuByLinie");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"https://localhost:7227/api/Linias/ValidateSkuByLinie");
                    request.Headers.Add("idLinea", linea);
                    request.Headers.Add("itemcode", itemcode);

                    HttpResponseMessage response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        //var jsonResponse = JsonConvert.DeserializeObject<RootTicket>(textResult);
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
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetTicketByLinie(string id)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("id", id);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/InfoTickets/GetTicketById");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/InfoTickets/GetTicketById");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/InfoTickets/GetTicketById");
                    //request.Headers.Add("userId", Session["UserId"].ToString());
                    //request.Headers.Add("id", id);

                    //HttpResponseMessage response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var jsonResponse = JsonConvert.DeserializeObject<RootTicket>(textResult);
                        var objectResponse = new { status = 200, data = jsonResponse };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    } else
                    {
                        var objectResponse = new { status = 500, data = "Error en traer los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> ValidateWeight(string ItemCode)
        {
            try
            {
                //string rutaPesos = @"C:\Paradox\SyCEMonitor.txt";
                //StreamReader sr = new StreamReader(rutaPesos);
                //string peso = sr.ReadLine();
                //sr.Close();

                using (HttpClient http = new HttpClient())
                {
                    //var data = new
                    //{
                    //    ItemCode = ItemCode,
                    //    Weight = peso
                    //};

                    //var json = JsonConvert.SerializeObject(data);
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/SkuInfo/ValidateWeight");
                    //request.Headers.Add("Weight", peso);
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://localhost:7227/api/SkuInfo/ValidateWeight");
                    request.Headers.Add("ItemCode", ItemCode);

                    //request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
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
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddNewTicket(string linea, string sku, string turno)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/InfoTickets/AddNewTicket");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"https://localhost:7227/api/InfoTickets/AddNewTicket");

                    request.Headers.Add("linea", linea);
                    request.Headers.Add("sku", sku);
                    request.Headers.Add("turno", turno);

                    HttpResponseMessage response = await http.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
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
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpdateTicketById(string idTicket, string peso, string porcentaje, string calidad, string pesoTubo, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/InfoTickets/UpdateTicketById");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"https://localhost:7227/api/InfoTickets/UpdateTicketById");

                    request.Headers.Add("idTicket", idTicket);
                    request.Headers.Add("peso", peso);
                    request.Headers.Add("porcentaje", porcentaje);
                    request.Headers.Add("calidad", calidad);
                    request.Headers.Add("pesotubo", pesoTubo);
                    request.Headers.Add("planta", planta);

                    HttpResponseMessage response = await http.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
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
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> TurnOnLights(string estado)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    string uri = $"http://192.168.136.22:5000/api/status/{estado}";
                    HttpResponseMessage response = await http.GetAsync(uri);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al cambiar el estado del semaforo" };
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
        public async Task<ActionResult> InsertarPeso(string idbascula, string peso)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var parametros = new
                    {
                        idbascular = idbascula,
                        peso = peso
                    };

                    var paramsUri = new StringContent(JsonConvert.SerializeObject(parametros), Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await http.PostAsync($"{IpWebApi}/Estados/EstadoBascula", paramsUri);


                    if (response.IsSuccessStatusCode)
                    {
                        var objectResponse = new { status = 200 };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500 };
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
        public async Task<ActionResult> AddBase64(string base64)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var data = new
                    {
                        base64 = base64
                    };

                    var json = JsonConvert.SerializeObject(data);
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/Estados/AddBase64");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://localhost:7227/api/Estados/AddBase64");

                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult, R = 1 };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error en traer los datos", R = 0 };
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