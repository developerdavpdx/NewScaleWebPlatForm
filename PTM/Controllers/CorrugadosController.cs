
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class CorrugadosController : Controller
    {
        // URL del API
        string webapi = ConfigurationManager.AppSettings["WebApiURL"];

        //-----------------METODOS----------------

        //-------ASIGNACION DE LINEAS--------//        
        [HttpPost]
        public async Task<ActionResult> GetNumberOfLinies(string planta)    //obtiene el numero de lineas
        {
            using (HttpClient http = new HttpClient())
            {
                http.DefaultRequestHeaders.Add("planta", planta);
                HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Corrugados/GetLiniesCorrugados");

                var textResult = await response.Content.ReadAsStringAsync();    //obtenemos la respuesta del API

                if (response.IsSuccessStatusCode)
                {                    
                    var objectResponse = new { status = 200, data = textResult };
                    var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                    return result;
                }
                else
                {
                    var objectResponse = new { status = 500, data = textResult };
                    var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                    return result;
                }
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateNewLinea(string linea, string proceso, string planta)     //crea una nueva linea
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Corrugados/CreateNewLinieCorrugados");
                    request.Headers.Add("idLinea", linea);
                    request.Headers.Add("proceso", proceso);
                    request.Headers.Add("planta", planta);

                    HttpResponseMessage response = await http.SendAsync(request);
                    var textResult = await response.Content.ReadAsStringAsync();    //obtenemos la respuesta del API

                    if (response.IsSuccessStatusCode)
                    {
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error al crear una nueva linea: {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> DeleteLinie(string linea, string planta)     //elimina una linea
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Corrugados/DeleteLinieCorrugados");
                    request.Headers.Add("idLinea", linea);
                    request.Headers.Add("planta", planta);

                    HttpResponseMessage response = await http.SendAsync(request);
                    var textResult = await response.Content.ReadAsStringAsync();    //obtenemos la respuesta del API

                    if (response.IsSuccessStatusCode)
                    {
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error al eliminar la linea: {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }


        [HttpPost]
        public async Task<ActionResult> GetHistorialAsignated(string linea, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("linea", linea);
                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Corrugados/GetLiniesHistoryAsignedCorrugados");

                    var textResult = await response.Content.ReadAsStringAsync();

                    var jsonContent = JsonConvert.DeserializeObject<dynamic>(textResult);

                    if (response.IsSuccessStatusCode)
                    {
                        //creamos una lista dinamica con los campos retornados
                        var lista = new List<dynamic>();
                        foreach (var item in jsonContent.data)
                        {
                            lista.Add(new
                            {
                                name = item.name.ToString(),
                                codigo = item.codigo.ToString(),
                                dateasign = item.dateasign.ToString()
                            });
                        }
                        //Enviamos la lista al view
                        var objectResponse = new { status = 200, data = lista };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = jsonContent.data };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error al obtener la linea: {ex.Message}" };
                return Json(objectResponse, JsonRequestBehavior.AllowGet);
            }
        }


        //-------OPERADORES--------//   
        //-------PESAJE PT--------//   

        //Next Controler
    }
}