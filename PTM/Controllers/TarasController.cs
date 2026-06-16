using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using OfficeOpenXml;

namespace PTM.Controllers
{
    public class TarasController: Controller
    {
        string IpWebApi = ConfigurationManager.AppSettings["WebApiURL"];
        public ActionResult Index()
        {
            return View(); 
        }

        /// <summary>
        /// conversion del excel a json
        /// </summary>
        /// <param name="archivoexcel"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult exceltojson(HttpPostedFileBase archivoexcel)
        {
            try
            {
                // Asignación correcta para versiones EPPlus 8 y superiores
                ExcelPackage.License.SetNonCommercialPersonal("IrvingMPDX140102");
                string jsondata = "";
                // Cargar el archivo Excel utilizando ExcelPackage
                using (ExcelPackage package = new ExcelPackage(archivoexcel.InputStream))
                {
                    //  Obtener la primera hoja del libro de Excel
                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0];

                    // Obtener el n�mero de filas y columnas utilizadas en la hoja
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;

                    string[,] datos = new string[rowCount, colCount];


                    //Recorrer todas las filas y columnas para leer los datos
                    for (int row = 1; row <= rowCount; row++)
                    {
                        for (int col = 1; col <= colCount; col++)
                        {
                            // Leer el valor de cada celda
                            object cellValue = worksheet.Cells[row, col].Value;

                            if (cellValue != null)
                            {
                                // Verificar si es un número decimal
                                if (cellValue is double || cellValue is float || cellValue is decimal)
                                {
                                    datos[row - 1, col - 1] = Convert.ToDecimal(cellValue).ToString("G", CultureInfo.InvariantCulture);
                                }
                                else
                                {
                                    datos[row - 1, col - 1] = cellValue.ToString();
                                }
                            }
                            else
                            {
                                datos[row - 1, col - 1] = "";
                            }
                        }
                    }

                    jsondata = JsonConvert.SerializeObject(datos);
                }
                return Json(new { data = jsondata });
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.ToString() });
            }

        }

        /// <summary>
        /// Actualizamos las taras
        /// </summary>
        /// <param name="datos"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> actiualizartarasAsync(string datos)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var data = new
                    {
                        tarasInfo = datos
                    };

                    string url = $"{IpWebApi}/api/Taras/UpdateTare";
                    StringContent content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");

                    // Realizar la petición HTTP POST
                    HttpResponseMessage response = await client.PostAsync(url, content);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return Json(result);
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al actualizar las taras" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return Json(result);
                    }


                }
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message.ToString() });
            }
        }

        /// <summary>
        /// enviamos el excel en json al api para actualizacion masiva de kghora por linea
        /// </summary>
        /// <param name="datos"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> actiualizarKgHora(string datos)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var data = new
                    {
                        KgHoraInfo = datos
                    };

                    string url = $"{IpWebApi}/api/Taras/UpdateKgHora";
                    StringContent content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");

                    // Realizar la petición HTTP POST
                    HttpResponseMessage response = await client.PostAsync(url, content);

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return Json(result);
                    }
                    else
                    {
                        
                        var objectResponse = new { status = 500, data = "Error al actualizar los kgHora" };
                        return new HttpStatusCodeResult(500, "Error al actualizar los kgHora");
                    }


                }
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(500, ex.Message);
            }
        }
    }
}