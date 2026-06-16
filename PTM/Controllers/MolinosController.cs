using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace PTM.Views
{
    public class MolinosController : Controller
    {
        // GET: Molinos
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
                return RedirectToAction("Login", "Login");
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetAllMolinos(string planta)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{IpWebApi}/api/Scrap/GetAllScrap");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    }
                    else
                    {
                        var objectResponse = new { status = 500, data = "Error al obtener el la informacion de scrap de molinos" };
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

        [HttpGet]
        public async Task<ActionResult> generarexcel(string matrizdatos)
        {
            try
            {
                string rutaVirtual = "~/plantillas/archivo.xlsx";
                string rutaFisica = Server.MapPath(rutaVirtual);
                string editedBase64String = "";
                // Asignación correcta para versiones EPPlus 8 y superiores
                ExcelPackage.License.SetNonCommercialPersonal("IrvingMPDX140102");
                string base64String = "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";
                byte[] fileBytes = Convert.FromBase64String(base64String);
                // Cargar el archivo de Excel desde la cadena Base64
                using (MemoryStream memoryStream = new MemoryStream(fileBytes))
                {
                    using (OfficeOpenXml.ExcelPackage excelPackage = new OfficeOpenXml.ExcelPackage(memoryStream))
                    {
                        // Obtener la hoja de trabajo
                        OfficeOpenXml.ExcelWorksheet ws = excelPackage.Workbook.Worksheets[0];
                        ExcelRange cols = ws.Cells["A:XFD"];
                        var array = JsonConvert.DeserializeObject<string[,]>(matrizdatos);

                        for (int i = 0; i < 37; i++)
                        {
                            for (int j = 0; j < 6; j++)
                            {
                                ws.SetValue(i + 2, 4 + j, array[i, j]);
                            }
                        }


                        var excelFile = new FileInfo(rutaFisica);
                        excelPackage.SaveAs(excelFile);

                        // Guardar los cambios en el archivo de Excel
                        excelPackage.Save();
                    }


                    fileBytes = System.IO.File.ReadAllBytes(rutaFisica);
                    editedBase64String = Convert.ToBase64String(fileBytes);

                }


                return Json(new { data = editedBase64String }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var response = new { status = 500, response = ex.Message };
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public async Task<ActionResult> AgregarAcumuladoEmbarque(string proceso, string familia, string peso)
        {
            try
            {
                using (HttpClient http = new HttpClient())
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{IpWebApi}/api/AcumuladoEmb/AddAcumuladoEmbarque");
                    request.Headers.Add("proceso", proceso);
                    request.Headers.Add("familia", familia);
                    request.Headers.Add("peso", peso);

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
                        var objectResponse = new { status = 500, data = "Error al ingresar la información de acumulados embarques" };
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
    }
}