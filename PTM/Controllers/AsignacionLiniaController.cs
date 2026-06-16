using Newtonsoft.Json;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using PTM.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class AsignacionLiniaController : Controller
    {
        // GET: AsignacionLinia
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];
        public async Task<ActionResult> Index()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Account/ValidateToken");
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

        [HttpGet]
        public async Task<ActionResult> GetAllSkuInfo()
        {
            using (HttpClientHandler handler = new HttpClientHandler())
            {
                using (var client = new HttpClient(handler))
                {
                    client.DefaultRequestHeaders.Add("userId", Session["UserId"].ToString());
                    HttpResponseMessage response = await client.GetAsync($"{webapi}/api/SkuInfo/GetAllSkuInfo");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var jsonResponse = JsonConvert.DeserializeObject<ListSkuInfo>(textResult);
                        var objectResponse = new { status = 200, data = jsonResponse };
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
        }

        [HttpPost]
        public async Task<ActionResult> AsignSkuToLine(string idSku, string linea, string turno, 
            string kgxhora, string ordenfabricacion, string folio, string planta)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Linias/AsignSkuToLinie");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://localhost:7227/api/Linias/AsignSkuToLinie");
                    request.Headers.Add("sku", idSku);
                    request.Headers.Add("linea", linea);
                    request.Headers.Add("turno", turno);
                    request.Headers.Add("userId", Session["UserId"].ToString());
                    request.Headers.Add("username", Session["Name"].ToString());
                    request.Headers.Add("kgxhr", kgxhora);
                    request.Headers.Add("ordenFabricacion", ordenfabricacion);
                    request.Headers.Add("folio", folio);
                    request.Headers.Add("planta", planta);
                    
                    HttpResponseMessage response = await http.SendAsync(request);

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
            } catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error en traer los datos {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetBitacoraLinie(string linie, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("linie", linie);
                    http.DefaultRequestHeaders.Add("userId", Session["UserId"].ToString());
                    http.DefaultRequestHeaders.Add("planta", planta);

                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Linias/GetBitacoraLinie");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/Linias/GetBitacoraLinie");
                    

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var jsonResponse = JsonConvert.DeserializeObject<BitacoraList>(textResult);

                        if (jsonResponse.Bitacora != null)
                        {
                            if (jsonResponse.Bitacora.Count > 0)
                            {
                                var lista = new List<dynamic>();
                                foreach (var item in jsonResponse.Bitacora)
                                {
                                    lista.Add(new { codigo = item.codigoItem, name = item.trabajador, linie = item.Linea, dateasign = item.FechaAsignacion.ToString() });

                                }
                                var newJson = JsonConvert.SerializeObject(lista);
                                var objectResponse = new { status = 200, data = newJson };
                                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                                return result;
                            }
                            else
                            {
                                var objectResponse = new { status = 200, data = jsonResponse };
                                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                                return result;
                            }
                        }
                        else
                        {
                            var objectResponse = new { status = 200, data = jsonResponse };
                            var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                            return result;
                        }
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
                var objectResponse = new { status = 500, data = $"Error al obtener los datos {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> UnasignedLinie(string linea, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Linias/UnassignLinieAndTicket");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"https://localhost:7227/api/Linias/UnassignLinieAndTicket");
                    request.Headers.Add("idLinea", linea);
                    request.Headers.Add("userId", "a");
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
            } catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error al desasignar la línea {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> UnassignLinieAndTicket(string linea)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Linias/UnassignLinieAndTicket");

                    request.Headers.Add("idLinea", linea);
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
                        var objectResponse = new { status = 500, data = "Error en traer los datos" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error al desasignar la línea {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateNewLinea(string linea, string proceso, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Linias/CreateNewLinie");
                    request.Headers.Add("idLinea", linea);
                    request.Headers.Add("proceso", proceso);
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
                var objectResponse = new { status = 500, data = $"Error al desasignar la línea {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> DeleteLineaCreada(string linea, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/Linias/DeleteLinea");
                    request.Headers.Add("Linea", linea);
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
                        var objectResponse = new { status = 500, data = "Error en el controller del api" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error al Eliminar la línea  {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> ObtenerDocEntry(string itemcode, string series)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("itemcode", itemcode);
                    http.DefaultRequestHeaders.Add("series", series);
                    var response = await http.GetAsync($"{webapi}/api/Sap/GetDocEntrys");
                    //var response = await http.GetAsync($"https://localhost:7227/api/Sap/GetDocEntrys");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    } else
                    {
                        var objectResponse = new { status = 500, datat = "Error al obtener los docentrys" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = $"Error: {ex.Message}" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> generarexcel(string matrizdatos)
        {
            try
            {
                string rutaVirtual = "~/plantillas/dma.xlsx";
                string rutaFisica = Server.MapPath(rutaVirtual);
                string editedBase64String = "";
                // Asignación correcta para versiones EPPlus 8 y superiores
                ExcelPackage.License.SetNonCommercialPersonal("IrvingMPDX140102");
                // Cargar el archivo de Excel desde la cadena Base64

                // Verificar si el archivo existe en la ruta especificada
                if (System.IO.File.Exists(rutaFisica))
                {
                    // Si el archivo existe, eliminarlo
                    System.IO.File.Delete(rutaFisica);
                }

                // Crear un archivo nuevo de Excel
                FileInfo archivoExcel = new FileInfo(rutaFisica);

                // Crear el paquete de Excel
                using (ExcelPackage paquete = new ExcelPackage(archivoExcel))
                {
                    // Agregar una nueva hoja de trabajo
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("Lineas");

                    var matrizd = JsonConvert.DeserializeObject<string[,]>(matrizdatos);

                    string[] cabecera1 = { "Linea", "Proceso", "Codigo", "KgXHr", "Orden Fabricación" };


                    // Escribir los valores en las celdas A1:L1
                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }
                    // Obtener el rango de celdas A1:A12
                    ExcelRange range = ws.Cells["A1:E1"];
                    // Crear un estilo para el rango de celdas
                    ExcelStyle style = range.Style;

                    // Establecer el fondo del rango de celdas en color azul
                    style.Fill.PatternType = ExcelFillStyle.Solid;
                    style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(19, 92, 133));
                    style.Font.Color.SetColor(System.Drawing.Color.White);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    range.AutoFitColumns();

                    ws.Row(1).Height = 25;

                    var ancho = matrizd.GetLength(0);
                    var largo = matrizd.GetLength(1);

                    for (int i = 0; i < matrizd.GetLength(0); i++)
                    {
                        for (int j = 0; j < matrizd.GetLength(1); j++)
                        {
                            var valorActual = matrizd[i, j];

                            ws.Cells[i + 2, j + 1].Value = valorActual != null ? valorActual.Trim() : ""; // O cualquier valor por defecto
                            ws.Cells[i + 2, j + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[i + 2, j + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        }
                    }

                    // Ajustar automáticamente el ancho de todas las columnas basándose en el contenido
                    ws.Cells[ws.Dimension.Address].AutoFitColumns();

                    paquete.Save();

                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(rutaFisica);
                editedBase64String = Convert.ToBase64String(fileBytes);

                return Json(new { data = editedBase64String, R = 1 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message, R = 0 };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

    }
}