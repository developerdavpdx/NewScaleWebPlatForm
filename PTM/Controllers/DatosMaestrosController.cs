using DocumentFormat.OpenXml.Office2016.Excel;
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
using static System.Net.WebRequestMethods;
using PTM.LogsGlobales;

namespace PTM.Controllers
{
    public class DatosMaestrosController : Controller
    {
        // GET: DatosMaestros
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];

        //---------VISTAS---------//
        public async Task<ActionResult> Index() //Datos Maestros pvc-iny
        {
            try
            {
                //return View();
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
                        return Redirect("https://localhost:44390/");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return RedirectToAction("Index", "Login");
            }
        }

        public async Task<ActionResult> DatosMaestrosCorrugado() //Datos maestros corrugado
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
                        return View("DatosMaestrosCorrugado");
                    }
                    else
                    {
                        return RedirectToAction("Index", "Login");  //si el usuario ya no es valido (la sesion expiro), retornamos al login
                    }
                }
            }
            catch (Exception ex)
            {
                LogGlobal.LogError(ex.Message); // Registramos el error en el log global
                return RedirectToAction("Index", "Login"); //si existe algun error, retornamos al login
            }
        }


        //------------MÉTODOS------------//
        [HttpPost]
        public async Task<ActionResult> GetAllPt(string planta,string proceso_ignorado,string corrugado, string ignorenewscale) //Obtiene los Datos maestros de pvc-iny
        {
            try
            {
                using (var client = new HttpClient())
                {

                    client.DefaultRequestHeaders.Add("planta", planta);
                    client.DefaultRequestHeaders.Add("proceso", proceso_ignorado);
                    client.DefaultRequestHeaders.Add("Corrugado", corrugado);
                    client.DefaultRequestHeaders.Add("IgnoreNewScale", ignorenewscale);
                    HttpResponseMessage response = await client.GetAsync($"{webapi}/api/SapPtm/GetAllPT");
                    

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
                        var objectResponse = new { status = 500, data = "Error en traer los datos: " + textResult };
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
        public async Task<ActionResult> UpdateItemCode(string itemcode)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                   
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{webapi}/api/SapPtm/UpdateNwScaleItem");
                    request.Headers.Add("itemcode", itemcode);

                    var response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = result };
                        var json = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return json;
                    } else
                    {
                        var result = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 500, data = result};
                        var json = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return json;
                    }
                }
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var response = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return response;
            }
        }

        [HttpPost]
        //Esto para evitar errores cuando se manda codigo HTML
        //[ValidateInput(false)]
        public async Task<ActionResult> getexcel(string matrizdatos)
        {
            try
            {
                string rutaVirtual = "~/plantillas/dma.xlsx";
                string rutaFisica = Server.MapPath(rutaVirtual);
                string editedBase64String = "";
                OfficeOpenXml.ExcelPackage.License.SetNonCommercialPersonal("IrvingPDX140102");
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
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("DATOS MAESTROS");

                    var matrizd = JsonConvert.DeserializeObject<string[,]>(matrizdatos);

                    string[] cabecera1 = { "Código", "Descripción","Proceso," ,"Fecha de última actualización",
                    "Usuario", "Tara (Kg)"};


                    // Escribir los valores en las celdas A1:L1
                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }
                    // Obtener el rango de celdas A1:A12
                    ExcelRange range = ws.Cells["A1:F1"];
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


                    for (int i = 0; i < matrizd.GetLength(0); i++)
                    {
                        for (int j = 0; j < matrizd.GetLength(1); j++)
                        {
                            ws.Cells[i + 2, j + 1].Value = matrizd[i, j].Trim();
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

        //Para descargar el excel en Datos Maestros Corrugados (cambia ligeramente pues la estructura de la tabla se consume diferente, esto porque se consulta directamente al api al momento de llenarla)
        [HttpPost]
        public async Task<ActionResult> getexcelCorrugados(string matrizdatos)
        {
            try
            {
                string rutaVirtual = "~/plantillas/dma.xlsx";
                string rutaFisica = Server.MapPath(rutaVirtual);
                string editedBase64String = "";
                OfficeOpenXml.ExcelPackage.License.SetNonCommercialPersonal("IrvingPDX140102");

                if (System.IO.File.Exists(rutaFisica))
                {
                    System.IO.File.Delete(rutaFisica);
                }

                FileInfo archivoExcel = new FileInfo(rutaFisica);

                using (ExcelPackage paquete = new ExcelPackage(archivoExcel))
                {
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("DATOS MAESTROS");

                    var matrizd = JsonConvert.DeserializeObject<object[][]>(matrizdatos);

                    string[] cabecera1 = { "Código", "Descripción", "Proceso","Fecha de última actualización", "Usuario", "Tara (Kg)" };

                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }

                    ExcelRange range = ws.Cells["A1:F1"];
                    ExcelStyle style = range.Style;
                    style.Fill.PatternType = ExcelFillStyle.Solid;
                    style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(19, 92, 133));
                    style.Font.Color.SetColor(System.Drawing.Color.White);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    range.AutoFitColumns();

                    ws.Row(1).Height = 25;

                    for (int i = 0; i < matrizd.Length; i++)
                    {
                        for (int j = 0; j < matrizd[i].Length; j++)
                        {
                            var cellValue = matrizd[i][j];

                            // Si el valor es un JObject vacío o un diccionario vacío, poner cadena vacía
                            if (cellValue != null && cellValue.ToString() == "{}")
                            {
                                ws.Cells[i + 2, j + 1].Value = "";
                            }
                            else
                            {
                                ws.Cells[i + 2, j + 1].Value = cellValue?.ToString() ?? "";
                            }
                            ws.Cells[i + 2, j + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[i + 2, j + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        }
                    }

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