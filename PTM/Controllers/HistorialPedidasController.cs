using Newtonsoft.Json;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using static System.Net.WebRequestMethods;

namespace PTM.Controllers
{
    public class HistorialPedidasController : Controller
    {
        // GET: HistorialPedidas
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public async Task<ActionResult> Index()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
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
        public async Task<ActionResult> GetAllHistoryWeight(string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                 {

                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/HistorialPesadas/GetAllHistorial");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/HistorialPesadas/GetAllHistorial");

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
        public async Task<ActionResult> DisabledRecord(string idHPesada, string comentario)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var data = new
                    {
                        idHistPesada = idHPesada,
                        comentario = comentario
                    };

                    var json = JsonConvert.SerializeObject(data);

                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/HistorialPesadas/DisableRegister");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await http.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = $"Error al agregar un comentario al registro {idHPesada}" };
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
        public async Task<ActionResult> GetHistoricalById(string idHPesada)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("idHistPesada", idHPesada);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/HistorialPesadas/GetHistoryRecordById");

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
        public async Task<ActionResult> EditarRegistroPesada(int idHistPesada, int idSKU, int LineaPtH, float PesoTotalPtH, int NumTubosPtH, float AtadoPTH,
            float TaraPTH, float AnilloPTH, float FlejePTH, string comentario, string nombreTrabjador)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var data = new
                    {
                        idHistPesada = idHistPesada,
                        idSKU = idSKU,
                        lineaPtH = LineaPtH,
                        pesoTotalPtH = PesoTotalPtH,
                        numTubosPtH = NumTubosPtH,
                        atadoPTH = AtadoPTH,
                        taraPTH = TaraPTH,
                        anilloPTH = AnilloPTH,
                        flejePTH = FlejePTH,
                        comentario = comentario,
                        nombreTrabjador = nombreTrabjador,
                    };

                    var json = JsonConvert.SerializeObject(data);

                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/HistorialPesadas/EditRegisterById");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await http.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = $"Error al editar el registro {idHistPesada}" };
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
        public async Task<ActionResult> GetBitacoraPesadasById(string idHPesadas)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("idHPesadas", idHPesadas);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/HistorialPesadas/GetBitacoraPesadas");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
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

        /// <summary>
        /// Registramos un prelimimar de las lineas que se enviaran a SAP en SQL
        /// </summary>
        /// <param name="preliminar"></param>
        /// <param name="idHistorialP"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> EnvioSap(string preliminar, int[] idHistorialP)
        {
            try
            {
                //LLamar a la conficuracion de TimeOut del webConfig
                int TimeS = int.Parse(WebConfigurationManager.AppSettings["TimeS"]);

                using (HttpClient http = new HttpClient())
                {   //asignamos el tiempo establecido desde el WebConfig
                    http.Timeout = TimeSpan.FromSeconds(TimeS);

                    var data = new
                    {
                        idPesadas = idHistorialP,
                        preliminar = preliminar,
                    };

                    var json = JsonConvert.SerializeObject(data);

                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/Sap/EnvioSap");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"https://localhost:7227/api/Sap/EnvioSap");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await http.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 400, data = $"Error al ingresar los datos para el envio a SAP" };
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

        /// <summary>
        /// Realizamos la carga a SAP
        /// </summary>
        /// <param name="identificador"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> GenereteXML(string identificador, string Planta)
        {
            try
            {
                //LLamar a la conficuracion de TimeOut del webConfig
                int TimeS = int.Parse(WebConfigurationManager.AppSettings["TimeS"]);

                using (HttpClient http = new HttpClient())
                {
                    //asignamos el tiempo establecido desde el WebConfig
                    http.Timeout = TimeSpan.FromSeconds(TimeS);

                    http.DefaultRequestHeaders.Add("identificador", identificador);
                    http.DefaultRequestHeaders.Add("Planta", Planta);
                    HttpResponseMessage request = await http.GetAsync($"{IpWebApi}/api/Sap/GenerarXml2");
                    

                    if (request.IsSuccessStatusCode)
                    {
                        var textResult = await request.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {

                        var textResult = await request.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 400, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        //enviamos la excepcion al script
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                var objectResponse = new { status = 400, data = ex.ToString() };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                //enviamos la excepcion al script
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> CopyRegister(string idHPesadas, string comentario, string Codigo, int Id_Linea,
            float PesoTotal,  int NumTubos, float AtadoPT, float TaraPT, float AnilloPT, float FlejePT)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {

                    var data = new
                    {
                        idHPesado = idHPesadas,
                        comentario = comentario,
                        Codigo = Codigo,
                        Id_Linea = Id_Linea,
                        PesoTotal = PesoTotal,
                        NumTubos = NumTubos,
                        AtadoPT = AtadoPT,
                        TaraPT = TaraPT,
                        AnilloPT = AnilloPT,
                        FlejePT = FlejePT
                    };

                    var json = JsonConvert.SerializeObject(data);

                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/HistorialPesadas/CopyRegister");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = $"Error al copiar el registro" };
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
        public async Task<ActionResult> FilterHistoricalW(string turno, string itemcode, string estatusSap,
    string fechaInicio, string fechaFin, string planta, string corte, string linea)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("turno", turno != "" ? turno : null);
                    http.DefaultRequestHeaders.Add("codigo", itemcode != "" ? itemcode : null);
                    http.DefaultRequestHeaders.Add("idEstadoSap", estatusSap != "Seleccione..." ? estatusSap : null);
                    http.DefaultRequestHeaders.Add("fechaInicio", fechaInicio != "" ? fechaInicio : null);
                    http.DefaultRequestHeaders.Add("fechaFin", fechaFin != "" ? fechaFin : null);
                    http.DefaultRequestHeaders.Add("planta", planta);
                    http.DefaultRequestHeaders.Add("corte", corte);
                    http.DefaultRequestHeaders.Add("linea", linea != "" ? linea : null);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/HistorialPesadas/FilterHistorical");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/HistorialPesadas/FilterHistorical");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al filtrar los registros de historial de pesadas" };
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
        public async Task<ActionResult> EditScrap(string idHistPesada, string idSKU, string LineaPtH, string PesoTotalPtH, string NumTubosPtH , string AtadoPTH , string TaraPTH, string AnilloPTH, string FlejePTH,string comentario, string nombreTrabjador)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    var data = new
                    {
                        idHistPesada = idHistPesada,
                        idSKU = idSKU,
                        lineaPtH = LineaPtH,
                        pesoTotalPtH = PesoTotalPtH,
                        numTubosPtH = NumTubosPtH,
                        atadoPTH = AtadoPTH,
                        taraPTH = TaraPTH,
                        anilloPTH = AnilloPTH,
                        flejePTH = FlejePTH,
                        comentario = comentario,
                        nombreTrabjador = nombreTrabjador
                    };

                    var json = JsonConvert.SerializeObject(data);

                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/HistorialPesadas/CopyRegister");
                    //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"https://localhost:7227/api/Scrap/EditScrap");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await http.SendAsync(request);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = $"Error al copiar el registro" };
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

        [HttpGet]
        public async Task<ActionResult> GetEmails()
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    //HttpResponseMessage request = await http.GetAsync($"https://localhost:7227/api/Email/GetEmails");
                    HttpResponseMessage request = await http.GetAsync($"{IpWebApi}/api/Email/GetEmails");

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
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        [ValidateInput(false)]
        public async Task<ActionResult> getexcel(string matrizdatos)
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
                    ExcelWorksheet ws = paquete.Workbook.Worksheets.Add("Historial Pesadas");

                    var matrizd = JsonConvert.DeserializeObject<string[,]>(matrizdatos);

                    string[] cabecera1 = { 
                        "Fecha Pesaje", "Línea", "Código","Tipo", "Turno",
                        "Cantidad", "Orden Fabricación","Atado", "P.Neto",
                        "Tara", "Anillo","Fleje", "Sobrepeso",
                        "Estatus SAP", "Folio SAP","Comentario SAP", "Comentarios"
                    };


                    // Escribir los valores en las celdas A1:L1
                    for (int i = 0; i < cabecera1.Length; i++)
                    {
                        ws.Cells[1, i + 1].Value = cabecera1[i];
                    }
                    // Obtener el rango de celdas A1:A12
                    ExcelRange range = ws.Cells["A1:Q1"];
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
                            var valorActual = matrizd[i, j];

                            ws.Cells[i + 2, j + 1].Value = valorActual != null ? valorActual.Trim() : "";
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
