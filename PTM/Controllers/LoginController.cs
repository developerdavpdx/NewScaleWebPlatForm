using Newtonsoft.Json;
using PTM.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class LoginController : Controller
    {
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> Login(string userEmail, string password)
        {
            try
            {
                if (userEmail != null && password != null)
                {
                    using (HttpClient http = new HttpClient())
                    {
                        var parametros = new
                        {
                            userEmail = userEmail,
                            password = password
                        };

                        var paramsUri = new StringContent(JsonConvert.SerializeObject(parametros), Encoding.UTF8, "application/json");
                        //var response = await http.PostAsync($"https://localhost:7227/api/Account/Login", paramsUri);
                        var response = await http.PostAsync($"{webapi}/api/Account/Login", paramsUri);
                        if (response.IsSuccessStatusCode)
                        {
                            var textResult = await response.Content.ReadAsStringAsync();
                            LoginResponse jsonResult = JsonConvert.DeserializeObject<LoginResponse>(textResult);
                            if(jsonResult.data[0].tipousuario == "Operador" || jsonResult.data[0].tipousuario == "Molinos")
                            {
                                var objectResponse1 = new { status = 500, data = $"El usuario {jsonResult.data[0].tipousuario} no puede acceder al sitio web" };
                                var result1 = Json(objectResponse1, JsonRequestBehavior.AllowGet);
                                return result1;
                            }

                            Session["Rol"] = jsonResult.data[0].tipousuario;
                            Session["DateConection"] = DateTime.Now.ToString();
                            Session["UserId"] = jsonResult.data[0].empleadoid;
                            Session["Name"] = jsonResult.data[0].nombrecompleto;
                            Session["DateConection"] = DateTime.Now.ToString();
                            var x = Session["Name"].ToString();
                            if (jsonResult.data[0].planta == 2) {
                                Session["Planta"] = "335";
                            } else {
                                Session["Planta"] = "33";
                            }
                            var objResponse = new { status = 200, data = jsonResult };
                            var resultJson = Json(objResponse, JsonRequestBehavior.AllowGet);
                            return resultJson;
                        }
                        var objectResponse = new { status = 500, data = "Las credenciales son invalidas" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                } else
                {
                    return Json(new { status = 500, response = "Los paramentros llegan vacios" });
                }
            } catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public async Task<ActionResult> LogOut()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Account/LogOut");
                    request.Headers.Add("userId", Session["UserId"].ToString());

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
                        var objectResponse = new { status = 500, data = "Error del servidor" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
                
            } catch(Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}