using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;
using Newtonsoft.Json;
using OfficeOpenXml.Style;
using OfficeOpenXml;

namespace PTM.Controllers
{
    public class ProdTerminadoINYController : Controller
    {
        // GET: ProdTerminadoINY
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public async Task<ActionResult> Index()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
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
        public async Task<ActionResult> GetAllPtIny(string planta, string proceso)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("proceso", proceso);

                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/ReporteProductoTerm/GetAllPt");

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
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> FiltrarProductoTerminadoINY(string turno, string itemcode, string fechaInicio, string fechaFin, string proceso, string linea, string planta, string corte)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("turno", turno != "" ? turno : null);    //deprecade en store
                    http.DefaultRequestHeaders.Add("codigo", itemcode != "" ? itemcode : null);
                    http.DefaultRequestHeaders.Add("fechaInicio", fechaInicio != "" ? fechaInicio : null);
                    http.DefaultRequestHeaders.Add("fechaFin", fechaFin != "" ? fechaFin : null);
                    http.DefaultRequestHeaders.Add("proceso", proceso != "" ? proceso : null);
                    http.DefaultRequestHeaders.Add("linea", linea != "" ? linea : null);
                    http.DefaultRequestHeaders.Add("corte", corte != null ? corte : null);

                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/ProductTerminado/FilterFinishedProduct");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, data = "Error al filtrar los registros" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 400, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetDataByLinieIny(string linea, string planta, string corte, string filtroDefault,
            string fechaInicioFiltro, string fechaFinFiltro, string codigo, string proceso)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("numLinea", linea);
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("corte", corte);
                    http.DefaultRequestHeaders.Add("codigo", codigo);
                    http.DefaultRequestHeaders.Add("proceso", proceso);
                    http.DefaultRequestHeaders.Add("filtroDefault", filtroDefault);

                    //mandamos las fechas, estas solo aplican cuando es por filtro
                    http.DefaultRequestHeaders.Add("fechaInicioFiltro", fechaInicioFiltro);
                    http.DefaultRequestHeaders.Add("fechaFinFiltro", fechaFinFiltro);

                    //usamos el mismo controller del api, solo cambia el proceso
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/ProductTerminado/GetPTByLinie");
                    //HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/ProductTerminado/GetPtInyByLinie");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "No se encontraron datos" };
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
        public async Task<ActionResult> generarexcel(string matrizdatos, string totales)
        {
            try
            {
                string rutaVirtual = "~/plantillas/ProductoTerminadoINY.xlsx";
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
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("Producto Terminado INY");

                    var matrizd = JsonConvert.DeserializeObject<string[,]>(matrizdatos);
                    var totalesF = JsonConvert.DeserializeObject<string[,]>(totales);

                    string[] cabecera1 = { "Línea", "Código", "# Atados/Tarima", "# Tubos", "P. Neto Total",
                    "P. Unit. Estándar", "% Sobrepeso", "% Eficiencia", "KG Scrap Pt", "% Scrap PT"};



                    // Escribir los valores en las celdas A1:L1
                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }
                    // Obtener el rango de celdas A1:A12
                    ExcelRange range = ws.Cells["A1:J1"];

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
                        for (int j = 0; j < 10; j++)
                        {
                            ws.Cells[i + 2, j + 1].Value = matrizd[i, j].Trim();
                            ws.Cells[i + 2, j + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[i + 2, j + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        }
                    }

                    //matrizd.GetLength(0);
                    ws.Column(1).Width = 10;
                    ws.Column(2).Width = 20;
                    ws.Column(3).Width = 20;
                    ws.Column(4).Width = 15;
                    ws.Column(5).Width = 15;
                    ws.Column(6).Width = 15;
                    ws.Column(7).Width = 25;
                    ws.Column(8).Width = 25;
                    ws.Column(9).Width = 25;
                    ws.Column(10).Width = 25;

                    int lastRow = ws.Dimension.End.Row; // Última fila
                    int lastColumn = ws.Dimension.End.Column; // Última columna

                    ExcelCellAddress lastRowStartCell = new ExcelCellAddress(lastRow + 2, 1);
                    ExcelCellAddress endCell = new ExcelCellAddress(lastRow + 2, lastColumn); // Celda final (última fila y columna)

                    ExcelRange range2 = ws.Cells[$"A{lastRowStartCell.Row}:G{lastRowStartCell.Row}"];

                    string[] cabecera2 = { "Tot. Peso Neto", "Tot. Peso U.Estandar", "Tot. Sobrepes", "Tot. Eficiencia", "Tot. Kg Scrap PT", "Tot. % Scrap PT" };

                    // Escribir los valores en las celdas A1:L1
                    for (int i = 0; i < cabecera2.Length; i++)
                    {
                        ws.Cells[lastRowStartCell.Row, i + 1].Value = cabecera2[i];
                    }
                    // Obtener el rango de celdas A1:A12

                    // Crear un estilo para el rango de celdas
                    ExcelStyle style2 = range2.Style;

                    // Establecer el fondo del rango de celdas en color azul
                    style2.Fill.PatternType = ExcelFillStyle.Solid;
                    style2.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(19, 92, 133));
                    style2.Font.Color.SetColor(System.Drawing.Color.White);
                    range2.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range2.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    range2.AutoFitColumns();

                    ws.Row(lastRowStartCell.Row).Height = 25;


                    for (int i = 0; i < totalesF.GetLength(0); i++)
                    {
                        for (int j = 0; j < 6; j++)
                        {
                            ws.Cells[i + lastRowStartCell.Row + 1, j + 1].Value = totalesF[i, j].Trim();
                            ws.Cells[i + lastRowStartCell.Row + 1, j + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[i + lastRowStartCell.Row + 1, j + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        }
                    }

                    //matrizd.GetLength(0);
                    ws.Column(1).Width = 25;
                    ws.Column(2).Width = 25;
                    ws.Column(3).Width = 25;
                    ws.Column(4).Width = 25;
                    ws.Column(5).Width = 25;
                    ws.Column(4).Width = 25;
                    ws.Column(5).Width = 25;
                    ws.Column(6).Width = 25;

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

        //Acceder al API
        [HttpPost]
        public async Task<ActionResult> FiltrarScrap(string fechaInicio, string fechaFin, string proceso, string corte, string planta, string codigo, string linea)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("fechaInicio", fechaInicio != "" ? fechaInicio : null);
                    http.DefaultRequestHeaders.Add("fechaFin", fechaFin != "" ? fechaFin : null);
                    http.DefaultRequestHeaders.Add("proceso", proceso != "" ? proceso : null);
                    http.DefaultRequestHeaders.Add("corte", corte != "" ? corte : null);
                    http.DefaultRequestHeaders.Add("codigo", codigo != "" ? codigo : null);
                    http.DefaultRequestHeaders.Add("linea", linea != "" ? linea : null);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/ProductTerminado/FiltroScrapCorte");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, data = "Error al filtrar los registros" };
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
        public async Task<ActionResult> generarexcelScrap(string matrizdatos)
        {
            try
            {
                string rutaVirtual = "~/plantillas/reciboscrap2.xlsx";
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
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("Scrap PVC");

                    var matrizd = JsonConvert.DeserializeObject<string[,]>(matrizdatos);

                    string[] cabecera1 = { "Línea", "Código Item", "Peso Kg", "Comentario" };


                    // Escribir los valores en las celdas A1:D1
                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }
                    // Obtener el rango de celdas A1:A12
                    ExcelRange range = ws.Cells["A1:D1"];
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
                        for (int j = 0; j < 4; j++)
                        {
                            ws.Cells[i + 2, j + 1].Value = matrizd[i, j].Trim();
                            ws.Cells[i + 2, j + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Cells[i + 2, j + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        }
                    }

                    //matrizd.GetLength(0);
                    ws.Column(1).Width = 10;
                    ws.Column(2).Width = 20;
                    ws.Column(3).Width = 15;
                    ws.Column(4).Width = 15;

                    int lastRow = ws.Dimension.End.Row; // Última fila
                    int lastColumn = ws.Dimension.End.Column; // Última columna

                    ExcelCellAddress lastRowStartCell = new ExcelCellAddress(lastRow + 2, 1);
                    ExcelCellAddress endCell = new ExcelCellAddress(lastRow + 2, lastColumn); // Celda final (última fila y columna)

                    paquete.Save();

                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(rutaFisica);
                editedBase64String = Convert.ToBase64String(fileBytes);

                return Json(new { data = editedBase64String, R = 1 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var response = new { status = 400, response = ex.Message, R = 0 };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }
    }
}