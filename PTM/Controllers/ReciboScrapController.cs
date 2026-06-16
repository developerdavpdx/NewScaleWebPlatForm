using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using OfficeOpenXml.Style;
using OfficeOpenXml;

namespace PTM.Controllers
{
    public class ReciboScrapController : Controller
    {
        // GET: ReciboScrap
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> GetAllReceiveScrap(string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Scrap/GetAllReciboScrap");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/Scrap/GetAllReciboScrap");

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
                var dat = new { status = 200, data = "Error" };
                return Json(dat, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> FilterInfoScrap(string fechaInicio, string fechaFin, string turno, string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("turno", turno != "" ? turno : null);
                    //http.DefaultRequestHeaders.Add("estado", estado != "Seleccione..." ? estado : null);
                    http.DefaultRequestHeaders.Add("fechaFin", fechaFin != "" ? fechaFin : null);
                    http.DefaultRequestHeaders.Add("fechaInicio", fechaInicio != "" ? fechaInicio : null);
                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Scrap/FilterScrap");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/Scrap/FilterScrap");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al filtrar los registros de scrap" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var data = new { status = 200, response = ex.Message };
                return Json(data, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> generarexcel(string matrizdatos, string arraydatos)
        {
            try
            {
                string rutaVirtual = "~/plantillas/reciboscrap.xlsx";
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
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("Recibo Scrap");

                    var matrizd = JsonConvert.DeserializeObject<string[,]>(matrizdatos);
                    var arrayd = JsonConvert.DeserializeObject<string[]>(arraydatos);


                    string[] cabecera1 = { "Fecha", "Turno", "IPS", "CLAY", "DWV", "C900",
                     "ESMERALDA", "CONDUIT", "PURGA", "VIRUTA", "ESTADO", "PROCESO" };

                    string[] cabecera2 = { "IPS", "CLAY", "DWV", "C900",
                     "ESMERALDA", "CONDUIT", "PURGA", "VIRUTA"};



                    // Escribir los valores en las celdas A1:L1
                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }
                    // Obtener el rango de celdas A1:A12
                    ExcelRange range = ws.Cells["A1:L1"];

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
                        for (int j = 0; j < 12; j++)
                        {
                            ws.Cells[i + 2, j + 1].Value = matrizd[i, j].Trim();
                            ws.Cells[i + 2, j + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[i + 2, j + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        }
                    }

                    //matrizd.GetLength(0);
                    ws.Column(1).Width = 30;
                    ws.Column(2).Width = 10;
                    ws.Column(3).Width = 10;
                    ws.Column(4).Width = 10;
                    ws.Column(5).Width = 10;
                    ws.Column(6).Width = 10;

                    ws.Column(8).Width = 10;
                    ws.Column(9).Width = 10;
                    ws.Column(10).Width = 10;
                    ws.Column(11).Width = 30;



                    for (int i = 0; i < cabecera2.Length; i++)
                    {
                        ws.Cells[matrizd.GetLength(0) + 3, i + 2].Value = cabecera2[i];
                    }

                    range = ws.Cells["A1:L" + (matrizd.GetLength(0) + 1)];

                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;

                    range = ws.Cells["B" + (matrizd.GetLength(0) + 3) + ":I" + (matrizd.GetLength(0) + 3)];

                    // Crear un estilo para el rango de celdas
                    style = range.Style;

                    // Establecer el fondo del rango de celdas en color azul
                    style.Fill.PatternType = ExcelFillStyle.Solid;
                    style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(0, 0, 0));
                    style.Font.Color.SetColor(System.Drawing.Color.White);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;


                    for (int i = 0; i < arrayd.Length; i++)
                    {
                        ws.Cells[matrizd.GetLength(0) + 4, i + 2].Value = double.Parse(arrayd[i]).ToString("N2").Trim();
                    }
                    range = ws.Cells["B" + (matrizd.GetLength(0) + 3) + ":I" + (matrizd.GetLength(0) + 4)];

                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;

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

        [HttpGet]
        public async Task<ActionResult> GetEmailsMolinos()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    //HttpResponseMessage request = await http.GetAsync($"https://localhost:7227/api/Email/GetEmailsMolinos");
                    HttpResponseMessage request = await http.GetAsync($"{IpWebApi}/api/Email/GetEmailsMolinos");

                    if (request.IsSuccessStatusCode)
                    {
                        var textResult = await request.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = $"Error al obtener la bitacora" };
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