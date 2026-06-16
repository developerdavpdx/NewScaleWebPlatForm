using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using PTM.Models;

namespace PTM.Controllers
{
    public class InicioController : Controller
    {
        // GET: Inicio
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public async Task<ActionResult> Index()
        {
            //return View();
            try
            {
                //LLamar a la conficuracion de TimeOut del webConfig
                int TimeS = int.Parse(WebConfigurationManager.AppSettings["TimeS"]);

                using (HttpClient http = new HttpClient())
                {
                    //asignamos el tiempo establecido desde el WebConfig
                    //http.Timeout = TimeSpan.FromSeconds(TimeS);

                    //return View();
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/Account/ValidateToken");

                    request.Headers.Add("userId", Session["UserId"].ToString());

                    HttpResponseMessage response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        return View();
                    }
                    else
                    {
                        return Redirect("http://129.80.97.150:9097/");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Redirect("http://129.80.97.150:9097/");
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetDataGraph(string planta, string turno, string proceso)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("turno", turno);
                    http.DefaultRequestHeaders.Add("proceso", proceso);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Graficas/GraficasInfo");
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, response = "No se obtuvo la informacion correctamente" };
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

        [HttpPost]
        public async Task<ActionResult> ActualizaObj(string planta, string proceso, string Sobrepeso, string Scrap)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("proceso", proceso);
                    http.DefaultRequestHeaders.Add("Sobrepeso", Sobrepeso);
                    http.DefaultRequestHeaders.Add("Scrap", Scrap);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Graficas/UpdateObjetivosData");

                    if (response.IsSuccessStatusCode)
                    {
                        return Json(new { status = 200, data = "Datos actualizados correctamente" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = 400, data = "No se actualizo ña informacion correctamente" }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception e)
            {
                return Json(new { status = 400, response = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetMailsTXT(string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Email/GetMailTxt");
                    //HttpResponseMessage response = await http.GetAsync("https://localhost:7227/api/Email/GetMailTxt");
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, response = "Error al obtener la información de las gráficas" };
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

        [HttpPost]
        public async Task<ActionResult> AddNewMailTXT(string correo, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {

                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/Email/AddMailTxt");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://localhost:7227/api/Email/AddMailTxt");
                    request.Headers.Add("correo", correo);
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
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 400, data = "El correo ya existe" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, data = ex };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> RemoveMailTXT(string correo, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://localhost:7227/api/Email/RemoveMailTxt");
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/Email/RemoveMailTxt");
                    request.Headers.Add("correo", correo);
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
                        var objectResponse = new { status = 400, response = "Error al obtener la información de las gráficas" };
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