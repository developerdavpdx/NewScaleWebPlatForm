using System;
using System.Configuration;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class ReimpresionTicketController : Controller
    {
        // GET: ReimpresionTicket
        private readonly string webapi = ConfigurationManager.AppSettings["WebApiURL"];
        public async Task<ActionResult> Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> GetAllTickets(string planta)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("planta", planta);
                    HttpResponseMessage response = await http.GetAsync($"{webapi}/api/InfoTickets/GetTickets");
                    //HttpResponseMessage response = await http.GetAsync($"https://localhost:7227/api/InfoTickets/GetTickets");

                    if (response.IsSuccessStatusCode)
                    {
                        var textResult = await response.Content.ReadAsStringAsync();
                        //var jsonResponse = JsonConvert.DeserializeObject<RootTicket>(textResult);
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
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = ex.Message };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetTicketById(string id)
        {
            using (HttpClient http = new HttpClient())
            {
                http.DefaultRequestHeaders.Add("id", id);
                HttpResponseMessage response = await http.GetAsync($"{webapi}/api/InfoTickets/GetTicketById");

                if (response.IsSuccessStatusCode)
                {
                    var textResult = await response.Content.ReadAsStringAsync();
                    //var jsonResponse = JsonConvert.DeserializeObject<RootTicket>(textResult);
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

        [HttpPost]
        public async Task<ActionResult> GetPrintTicketById(string id)
        {
            using (HttpClient http = new HttpClient())
            {
                http.DefaultRequestHeaders.Add("id", id);
                HttpResponseMessage response = await http.GetAsync($"{webapi}/api/InfoTickets/GetPrintTicketById");


                if (response.IsSuccessStatusCode)
                {
                    var textResult = await response.Content.ReadAsStringAsync();
                    //var jsonResponse = JsonConvert.DeserializeObject<RootTicket>(textResult);
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

        [HttpPost]
        public async Task<ActionResult> FilterTickets(string folio, string turno, string fechaInicio, string fechaFin, string planta)
        {
            try
            {
                using(HttpClient http = new HttpClient())
                {
                    http.DefaultRequestHeaders.Add("folio", folio == "" ? null : folio);
                    http.DefaultRequestHeaders.Add("turno", turno == "" ? null : turno);
                    http.DefaultRequestHeaders.Add("fechaInicio", fechaInicio == "" ? null : fechaInicio);
                    http.DefaultRequestHeaders.Add("fechaFin", fechaFin == "" ? null : fechaFin);
                    http.DefaultRequestHeaders.Add("planta", planta);

                    //HttpResponseMessage request = await http.GetAsync("https://localhost:7227/api/InfoTickets/FilterTickets");
                    HttpResponseMessage request = await http.GetAsync($"{webapi}/api/InfoTickets/FilterTickets");

                    if (request.IsSuccessStatusCode)
                    {
                        var textResult = await request.Content.ReadAsStringAsync();
                        //var jsonResponse = JsonConvert.DeserializeObject<RootTicket>(textResult);
                        var objectResponse = new { status = 200, data = textResult };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;
                    } else
                    {
                        var objectResponse = new { status = 500, data = "Error al filtrar los resultados" };
                        var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                        return result;

                    }

                }
            } catch(Exception ex)
            {
                var objectResponse = new { status = 500, data = "Error en traer los datos" };
                var result = Json(objectResponse, JsonRequestBehavior.AllowGet);
                return result;
            }
        }
    }
}