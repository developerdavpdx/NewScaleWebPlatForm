using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace PTM.Controllers
{
    public class ReportesController : Controller
    {
        // GET: Reportes
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
    }
}