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
using System.Globalization;
// LogsGlobales functionality would be handled by LogHelper if available

namespace PTM.Controllers
{
    public class OperadorController : Controller
    {
        // URL del API
        string webapi = ConfigurationManager.AppSettings["WebApiURL"];

        //-----------------VISTAS----------------

        //-----------------VISTAS CORRUGADOS----------------
        //para entrar a la vista "Dashboard" de corrugados
        public async Task<ActionResult> DashboardCorrugados()
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
                        //le pasamos la subruta completa donde buscara la vista
                        return View();
                    }
                    else
                    {
                        return RedirectToAction("Index", "Login");  //si el usuario ya no es valido (la sesion expiro), retornamos al login
                    }
                }
            }
            catch (Exception ex)
            {
                // Error logging handled by application logging infrastructure
                return RedirectToAction("Index", "Login"); //si existe algun error, retornamos al login
            }
        }

        //para entrar a la vista "PesajePT" de corrugados
        public async Task<ActionResult> PesajePTCorrugados()
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
                        //le pasamos la subruta completa donde buscara la vista
                        return View();
                    }
                    else
                    {
                        return RedirectToAction("Index", "Login"); //si el usuario ya no es valido (la sesion expiro), retornamos al login
                    }
                }
            }
            catch (Exception ex)
            {
                // Error logging handled by application logging infrastructure
                return RedirectToAction("Index", "Login"); //si existe algun error, retornamos al login
            }
        }

        //para entrar a la vista "EnvioScrap" de corrugados
        public async Task<ActionResult> EnvioScrapCorrugados()
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
                        //le pasamos la subruta completa donde buscara la vista
                        return View();
                    }
                    else
                    {
                        return RedirectToAction("Index", "Login"); //si el usuario ya no es valido (la sesion expiro), retornamos al login
                    }
                }
            }
            catch (Exception ex)
            {
                // Error logging handled by application logging infrastructure
                return RedirectToAction("Index", "Login"); //si existe algun error, retornamos al login
            }
        }

        //para entrar a la vista "Reimpresion" de corrugados
        public async Task<ActionResult> ReimpresionesCorrugados()
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
                        //le pasamos la subruta completa donde buscara la vista
                        return View();
                    }
                    else
                    {
                        return RedirectToAction("Index", "Login"); //si el usuario ya no es valido (la sesion expiro), retornamos al login
                    }
                }
            }
            catch (Exception ex)
            {
                // Error logging handled by application logging infrastructure
                return RedirectToAction("Index", "Login"); //si existe algun error, retornamos al login
            }
        }

        //-----------------CONTROLLERS----------------
        //DASHBOARD
        /// <summary>
        /// Obtenemos los datos para el dashboard (Datos de las graficas y de los titulos)
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> DatosDashboard(string Planta, string Turno, string FechaInicio, string FechaFin)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Turno", Turno);
                    http.DefaultRequestHeaders.Add("FechaInicio", FechaInicio);
                    http.DefaultRequestHeaders.Add("FechaFin", FechaFin);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/DatosDashboard");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);

                    }
                }
            }
            catch (Exception ex)
            {
                // Capturar mensaje de excepción
                var response = new { status = 500, data = $"Exception: {ex.Message}" };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        //CATALOGOS-MOLINO
        /// <summary>
        /// Obtenemos los molinos existentes
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ObtenerNumeroMolinos(string Planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ObtenerNumeroMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Agregar o borrar/eliminar un molino
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> AgregarQuitarMolino(string NumeroMolino, string Proceso, string HorasxTurno, string Eficiencia, string Borrar, string Planta,
            string ObjetivoProduccion, string Nombre)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    // Agregar los encabezados
                    http.DefaultRequestHeaders.Add("NumeroMolino", NumeroMolino);
                    http.DefaultRequestHeaders.Add("Proceso", Proceso);
                    http.DefaultRequestHeaders.Add("HorasxTurno", HorasxTurno);
                    http.DefaultRequestHeaders.Add("Eficiencia", Eficiencia);
                    http.DefaultRequestHeaders.Add("Borrar", Borrar);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("ObjetivoProduccion", ObjetivoProduccion);
                    http.DefaultRequestHeaders.Add("Nombre", Nombre);

                    // Hacer la solicitud al API
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/AgregarQuitarMolino");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        // Leer el mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        var result =  Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Actualiza los datos de cada molino
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ActualizarMolino(string NumeroMolino, string Eficiencia, string HorasxTurno, string Planta, string ObjetivoProduccion)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("NumeroMolino", NumeroMolino);
                    http.DefaultRequestHeaders.Add("Eficiencia", Eficiencia);
                    http.DefaultRequestHeaders.Add("HorasxTurno", HorasxTurno);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("ObjetivoProduccion", ObjetivoProduccion);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ActualizarMolino");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        //CATALOGOS-ARTICULOS
        /// <summary>
        /// Obtenemos Codigos eistentes con sus datos
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ObtenerArticulosMolinos(string Planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ObtenerArticulosMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Obtenemos Los datos para el reporte de molinos
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ObtenerDatosReporteMolinos(string Planta, string FechaInicio, string FechaFin, string Turno, string Histori)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("FechaInicio", FechaInicio);
                    http.DefaultRequestHeaders.Add("FechaFin", FechaFin);
                    http.DefaultRequestHeaders.Add("Turno", Turno);
                    http.DefaultRequestHeaders.Add("Histori", Histori);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ObtenerDatosReporteMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Agrega, elimina o actualiza un codifo maestro, dependiendo de la variable borrar [0 agrega, 1 elmina, 2 actualiza]
        /// </summary>
        /// <param name="Codigo"></param>
        /// <param name="Proceso"></param>
        /// <param name="Planta"></param>
        /// <param name="Descripcion"></param>
        /// <param name="FechaCreacion"></param>
        /// <param name="Tipo"></param>
        /// <param name="Familia"></param>
        /// <param name="Borrar"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> AgregarEliminarActualizarCodeArticulos(string Codigo, string Proceso, string Planta, string Descripcion, string FechaCreacion,
            string Tipo, string Familia, string Borrar)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    // Agregar los encabezados
                    http.DefaultRequestHeaders.Add("Codigo", Codigo);
                    http.DefaultRequestHeaders.Add("Proceso", Proceso);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Descripcion", Descripcion);
                    http.DefaultRequestHeaders.Add("FechaCreacion", FechaCreacion);
                    http.DefaultRequestHeaders.Add("Tipo", Tipo);
                    http.DefaultRequestHeaders.Add("Familia", Familia);
                    http.DefaultRequestHeaders.Add("Borrar", Borrar);

                    // Hacer la solicitud al API
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/AgregarEliminarActualizarCodeArticulos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        // Leer el mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Actualiza las horas paro de un registro
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ActualizaHorasParoRegistro(string Folio, string HorasParo, string Comentarios, string Planta, string Peso, string Desactivar)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Folio", Folio);
                    http.DefaultRequestHeaders.Add("HorasParo", HorasParo);
                    http.DefaultRequestHeaders.Add("Comentarios", Comentarios);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Peso", Peso);
                    http.DefaultRequestHeaders.Add("Desactivar", Desactivar);

                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ActualizaHorasParoRegistro");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        //CATALOGOS-Molineros
        /// <summary>
        /// Obtenemos Los molineros existentes
        /// </summary>
        /// <param name="Planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ObtenerMolinerosMolinos(string Planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ObtenerMolinerosMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Agregar o eliminar un nuevo operador (Molinero) [Tambien se usa para los update (actualizaciones de los molineros)]
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Codigo"></param>
        /// <param name="Nombre"></param>
        /// <param name="Borrar"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> AgregarEliminarOperador(string Codigo, string Nombre, string Borrar, string Planta, string Fecha, 
            string Activo, string CodigoUserEdit)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    // Agregar los encabezados
                    http.DefaultRequestHeaders.Add("Codigo", Codigo);
                    http.DefaultRequestHeaders.Add("Nombre", Nombre);
                    http.DefaultRequestHeaders.Add("Borrar", Borrar);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Fecha", Fecha);
                    http.DefaultRequestHeaders.Add("Activo", Activo);
                    http.DefaultRequestHeaders.Add("CodigoUserEdit", CodigoUserEdit);

                    // Hacer la solicitud al API
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/AgregarEliminarOperador");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        // Leer el mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Obtenemos Los datos de los ingresos de scrap
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Turno"></param>
        /// <param name="FechaInicio"></param>
        /// <param name="FechaFin"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ObtenerDatosScrapIngresos(string Planta, string FechaInicio, string FechaFin, string Turno)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("FechaInicio", FechaInicio);
                    http.DefaultRequestHeaders.Add("FechaFin", FechaFin);
                    http.DefaultRequestHeaders.Add("Turno", Turno);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/ObtenerDatosScrapIngresos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Controler para descargar los exceles
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public ActionResult GenerarExcel()
        {
            try
            {
                string jsonString;
                using (var reader = new StreamReader(Request.InputStream))
                {
                    jsonString = reader.ReadToEnd();
                }

                // Usamos NewtonSoft.Json para parsear el string JSON
                var json = Newtonsoft.Json.Linq.JObject.Parse(jsonString);

                // Extraer encabezados y datos
                var headers = json["headers"].ToObject<List<string>>();
                var data = json["data"].ToObject<List<List<string>>>();

                // Configurar la licencia de EPPlus
                ExcelPackage.License.SetNonCommercialPersonal("IrvingPDX140102");

                using (ExcelPackage package = new ExcelPackage())
                {
                    //creamos el libro
                    ExcelWorksheet worksheet = package.Workbook.Worksheets.Add("Reporte Molinos Resumen");

                    // Colocar encabezados en la fila 1
                    for (int i = 0; i < headers.Count; i++)
                    {
                        worksheet.Cells[1, i + 1].Value = headers[i];
                    }

                    // Aplicar estilos a los encabezados
                    using (var range = worksheet.Cells[1, 1, 1, headers.Count])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(19, 92, 133)); // Azul
                        range.Style.Font.Color.SetColor(System.Drawing.Color.White); // Blanco
                        range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    }

                    // Agregar los datos a partir de la fila 2
                    for (int rowIndex = 0; rowIndex < data.Count; rowIndex++)
                    {
                        for (int colIndex = 0; colIndex < data[rowIndex].Count; colIndex++)
                        {
                            worksheet.Cells[rowIndex + 2, colIndex + 1].Value = data[rowIndex][colIndex];
                        }
                    }

                    // Ajustar el ancho de las columnas automáticamente
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    byte[] fileContents = package.GetAsByteArray();

                    return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ReporteMolinosResumen.xlsx");
                }
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(500, $"Error al generar el Excel: {ex.Message}");
            }
        }

        /// <summary>
        /// Cargamos el archivo excel para procesarlo y devolverlo en la tabla
        /// </summary>
        /// <param name="archivoExcel"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult ProcesarExcel(HttpPostedFileBase archivoExcel)
        {
            try
            {
                if (archivoExcel == null || archivoExcel.ContentLength == 0)
                {
                    return Json(new { message = "No se proporcionó ningún archivo." }, JsonRequestBehavior.AllowGet);
                }

                ExcelPackage.License.SetNonCommercialPersonal("IrvingPDX140102");

                using (var stream = archivoExcel.InputStream)
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();

                    if (worksheet == null)
                    {
                        return Json(new { message = "El archivo Excel está vacío." }, JsonRequestBehavior.AllowGet);
                    }

                    var rowCount = worksheet.Dimension.Rows;
                    var colCount = worksheet.Dimension.Columns;

                    // Leer los encabezados de la primera fila
                    var headers = new List<string>();
                    for (int col = 1; col <= colCount; col++)
                    {
                        // Leer y limpiar el encabezado de caracteres en blanco
                        string header = worksheet.Cells[1, col].Text?.Trim();

                        // Agregar solo si no está vacío o en blanco
                        if (!string.IsNullOrEmpty(header))
                        {
                            headers.Add(header);
                        }
                    }

                    // Crear una lista de diccionarios para almacenar las filas dinámicamente
                    var data = new List<Dictionary<string, string>>();

                    // Obtener la fecha y hora actual (lo usamos para asignar uhna hora a las fechas de registro del excel)
                    var currentDateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                    // Leer el contenido de las filas a partir de la segunda fila
                    for (int row = 2; row <= rowCount; row++)
                    {
                        var rowData = new Dictionary<string, string>();
                        bool isRowEmpty = true; // Bandera para verificar si la fila está vacía

                        for (int col = 1; col <= colCount; col++)
                        {
                            // Verificar que el índice esté dentro del rango de headers
                            if (col - 1 < headers.Count)
                            {
                                // Obtener el valor de la celda y limpiar espacios en blanco
                                string cellValue = worksheet.Cells[row, col].Text?.Trim();

                                // Si la columna es "Fecha de registro", convertirla al formato requerido
                                if (headers[col - 1] == "Fecha de registro" && !string.IsNullOrEmpty(cellValue))
                                {
                                    DateTime parsedDate;

                                    // Intentar parsear la fecha del Excel
                                    if (DateTime.TryParseExact(cellValue, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate))
                                    {
                                        // Convertir la fecha a formato "yyyy-MM-dd" y agregar la hora actual
                                        rowData[headers[col - 1]] = parsedDate.ToString("yyyy-MM-dd") + " " + currentDateTime.Substring(11);
                                    }
                                    else
                                    {
                                        // Si la fecha no se puede parsear, devolvemos el mensaje
                                        return Json(new { message = $"Error: El valor de la columna 'Fecha de registro' no tiene un formato válid0." }, JsonRequestBehavior.AllowGet);
                                    }
                                }
                                else
                                {
                                    // Asignar el valor sin cambios
                                    rowData[headers[col - 1]] = cellValue;
                                }

                                // Si al menos una celda tiene valor, la fila no está vacía
                                if (!string.IsNullOrEmpty(cellValue))
                                {
                                    isRowEmpty = false;
                                }
                            }
                        }

                        // Solo agregar la fila si no está completamente vacía
                        if (!isRowEmpty)
                        {
                            data.Add(rowData);
                        }
                    }

                    return Json(data, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { message = $"Error al procesar el archivo Excel: {ex.Message}" }, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// CRUD en la tabla de los motivos de paro
        /// </summary>
        /// <param name="Planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> CRUDMotivosDeParoMolinos(string Planta, string Accion, string Motivo, string Id)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Accion", Accion);
                    http.DefaultRequestHeaders.Add("Motivo", Motivo);
                    http.DefaultRequestHeaders.Add("Id", Id);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/CRUDMotivosDeParoMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// CRUD en la tabla de Familias
        /// </summary>
        /// <param name="Planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> CRUDFamiliasMolinos(string Planta, string Accion, string Familia, string Id)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Accion", Accion);
                    http.DefaultRequestHeaders.Add("Familia", Familia);
                    http.DefaultRequestHeaders.Add("Id", Id);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/CRUDFamiliasMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// CRUD en la tabla de Tipos de materiañ
        /// </summary>
        /// <param name="Planta"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> CRUDTiposMaterialMolinos(string Planta, string Accion, string Tipo, string Proceso, string Id)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Accion", Accion);
                    http.DefaultRequestHeaders.Add("Tipo", Tipo);
                    http.DefaultRequestHeaders.Add("Proceso", Proceso);
                    http.DefaultRequestHeaders.Add("Id", Id);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/CRUDTiposMaterialMolinos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// agregar/borrar/actualizar los registros del historial de ingresos
        /// </summary>
        /// <param name="Planta"></param>
        /// <param name="Accion"></param>
        /// <param name="Motivo"></param>
        /// <param name="Id"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> CRUDRegistroIngresos(string Accion, string Id, string Planta, string Codigo, string Tipo, string Familia,
            string Fecha, string Peso, string Origen)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("Accion", Accion);
                    http.DefaultRequestHeaders.Add("Id", Id);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    http.DefaultRequestHeaders.Add("Codigo", Codigo);
                    http.DefaultRequestHeaders.Add("Tipo", Tipo);
                    http.DefaultRequestHeaders.Add("Familia", Familia);
                    http.DefaultRequestHeaders.Add("Fecha", Fecha);
                    http.DefaultRequestHeaders.Add("Peso", Peso);
                    http.DefaultRequestHeaders.Add("Origen", Origen);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/Molinos/CRUDRegistroIngresos");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        // Leer mensaje de error cuando la respuesta falla
                        var errorText = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = (int)response.StatusCode, data = $"Error: {errorText}" };
                        return Json(objectResponse, JsonRequestBehavior.AllowGet); ;
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new { status = 500, message = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> GuardarDatosExcelIngresosEnBD()
        {
            try
            {
                // Obtener los datos enviados a través de FormData
                var datosJson = Request.Form["datos"]; // Esto recupera el JSON que enviaste como "datos"

                // Deserializar el JSON a una lista de objetos
                var datos = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(datosJson);

                using (HttpClient http = new HttpClient())
                {
                    // Enviar los datos a la API del servidor
                    var response = await http.PostAsJsonAsync($"{webapi}/api/Molinos/GuardarDatosExcelIngresosEnBD", datos);

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorText = await response.Content.ReadAsStringAsync();
                        return Json(new { status = response.StatusCode, message = errorText });
                    }

                    return Json(new { status = 200, message = "Datos guardados correctamente." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = 500, message = ex.Message });
            }
        }

        //Next Controler
    }
}
