using Newtonsoft.Json;
using PTM.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class DetallesSKUController : Controller
    {
        // GET: DetallesSKU
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> GetPTbySku(string sku, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("sku", sku);
                    http.DefaultRequestHeaders.Add("planta", planta);
                    var response = await http.GetAsync($"{webapi}/api/SapPtm/GetPTbySku");
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    } else
                    {
                        var objectResponse = new { status = 500, data = "Error en traer los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            } catch(Exception e)
            {
                var result = new { status = 500, response = e.Message };
                var JsonResp = Json(result, JsonRequestBehavior.AllowGet);
                return JsonResp;
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpdateMaterialEmbalaje(string id, string MultiploCant, string MultiploCat, string Variable,
        string itemName, string minWeight, string flejeCant, string anilloCant, string maderaCant,
        string arpillaCant, string costalesCant, string tarimaCant, string planta, string usuario)
        {
            using (HttpClient http = new HttpClient())
            {
                var user = Session["UserId"].ToString();

                // Crear un objeto para enviar los parámetros
                var requestData = new
                {
                    id = id,
                    MultiploCant = MultiploCant,
                    MultiploCat = MultiploCat,
                    Variable = Variable,
                    itemName = itemName,
                    minWeight = minWeight,
                    flejeCant = flejeCant,
                    anilloCant = anilloCant,
                    maderaCant = maderaCant,
                    arpillaCant = arpillaCant,
                    costalesCant = costalesCant,
                    tarimaCant = tarimaCant,
                    planta = planta,
                    usuario = usuario,
                    userId = user
                };

                // Convertir el objeto a JSON
                var jsonContent = JsonConvert.SerializeObject(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await http.PostAsync($"{webapi}/api/ProductTerminado/UpdateMaterialEmb", content);

                if (response.IsSuccessStatusCode)
                {
                    var textResult = await response.Content.ReadAsStringAsync();
                    var objectResponse = new { status = 200, data = textResult };
                    return Json(objectResponse, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var textResult = await response.Content.ReadAsStringAsync();
                    var objectResponse = new { status = 500, data = "Error al actualizar campos Material Embalaje" };
                    return Json(objectResponse, JsonRequestBehavior.AllowGet);
                }
            }
        }



        /// <summary>
        /// Obtenemos los detalles de linea del codigo seleccionado
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ObtenerInfoLinea(string sku, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("sku", sku);
                    http.DefaultRequestHeaders.Add("planta", planta);

                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/SapPtm/ObtenerInfoLinea");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, data = "Error en traer los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }

            }
            catch (Exception e)
            {
                var result = new { status = 400, response = e.Message };
                var JsonResp = Json(result, JsonRequestBehavior.AllowGet);
                return JsonResp;
            }
        }

        /// <summary>
        /// conexion con el procedure para actualizar los datos de linea para el codigo 
        /// seleccionado
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> UpdateDataLinea(List<LineaData> lineasData)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    // Serializamos los datos que ya están en lineasData a JSON
                    var content = new StringContent(JsonConvert.SerializeObject(lineasData), Encoding.UTF8, "application/json");

                    // Enviar los datos serializados a la API
                    HttpResponseMessage response = await http.PostAsync($"{webapi}/api/SapPtm/ActualizarInfoLineas", content);

                    if (response.IsSuccessStatusCode)
                    {
                        return Json(new { status = 200, data = "Datos actualizados correctamente" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = 400, data = "Error en traer los datos" }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception e)
            {
                return Json(new { status = 400, response = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// añadimos datos nuevos de linea 
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> AddNewDataLine(string kgHora, string linea,
            string planta, string codigo)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("kgHora", kgHora);
                    http.DefaultRequestHeaders.Add("linea", linea);
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("codigo", codigo);

                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/SapPtm/AddNewDataLine");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, data = "Error al conectar con el API" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }

            }
            catch (Exception e)
            {
                var result = new { status = 400, response = e.Message };
                var JsonResp = Json(result, JsonRequestBehavior.AllowGet);
                return JsonResp;
            }
        }

    }
}