using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Web;
using FluentScheduler;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Hosting;

namespace PTM.Models
{
    public class SheduleTurno1: Registry
    {
        public SheduleTurno1()
        {
            Schedule(() => ExecuteJobTurno1()).ToRunEvery(1).Days().At(17, 45);
        }

        public void ExecuteJobTurno1()
        {
            try // Código de la primera tarea programada (turno 1)
            {
                DateTime horaInicioTurno1 = DateTime.Today.AddHours(4.5); // Fecha y hora de inicio del turno 1 (hoy a las 4:30 am)
                DateTime horaFinTurno1 = DateTime.Today.AddHours(16.5); // Fecha y hora de fin del turno 1 (hoy a las 4:30 pm)
                

                sendReport(1, "PPVC", horaInicioTurno1, horaFinTurno1);
                sendReport(1, "INY", horaInicioTurno1, horaFinTurno1);
                string rutaVirtualE = "~/Shedule/";
                string rutaEmailE = HostingEnvironment.MapPath(rutaVirtualE);
                if (!System.IO.File.Exists(rutaEmailE + Path.GetFileName("CorreoEnviado.txt")))
                {
                    System.IO.File.Create(rutaEmailE + Path.GetFileName("CorreoEnviado.txt")).Close();
                }

                using (StreamWriter writer = File.AppendText(rutaEmailE + Path.GetFileName("CorreoEnviado.txt")))
                {
                    writer.Write($"{DateTime.Now} - Correo Enviado Job 1");
                    writer.Close();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.StackTrace trace = new System.Diagnostics.StackTrace(ex, true);
                int line = trace.GetFrame(trace.FrameCount - 1).GetFileLineNumber();
                string Message = string.Empty;
                StringBuilder Mensaje = new StringBuilder();
                Mensaje.Append("Ocurrio un error al enviar el reporte:");
                Mensaje.Append(ex.Message != null ? ex.Message.ToString() : string.Empty);
                Mensaje.Append(ex.InnerException != null ? ex.InnerException.ToString() : string.Empty);
                Mensaje.Append(" line: " + line);


                string rutaVirtualE = "~/Shedule/";
                string rutaEmailE = HostingEnvironment.MapPath(rutaVirtualE);
                if (!System.IO.File.Exists(rutaEmailE + Path.GetFileName("ErroresMail.txt")))
                {
                    System.IO.File.Create(rutaEmailE + Path.GetFileName("ErroresMail.txt")).Close();
                }

                using (StreamWriter writer = File.AppendText(rutaEmailE + Path.GetFileName("ErroresMail.txt")))
                {
                    writer.Write($"{DateTime.Now} - {Mensaje.ToString()}");
                    writer.Close();
                }
            }

        }

        public void sendReport(int turno, string proceso, DateTime fechaTurnoInicio, DateTime fechaTurnoFin)
        {
            try
            {

                var atadosTotales = 0;
                var tubosTotales = 0;
                decimal pesoNetoTotales = 0;
                decimal pUnitEstaTotales = 0;
                decimal sobrepesoTotales = 0;
                decimal scrapTotales = 0;
                decimal eficienciaTotales = 0;

                string route = "~/Shedule/";
                string filepath = HostingEnvironment.MapPath(route);
                string txttemplate = string.Empty;
                using (StreamReader str = new StreamReader(filepath + Path.GetFileName("ReportEmail.html")))
                {
                    txttemplate = str.ReadToEnd();
                    str.Close();
                };
                
                var datosReport = ObtenerDatosReporte(turno, proceso, fechaTurnoInicio, fechaTurnoFin);
                CultureInfo cultureInfo = new CultureInfo("es-MX");

                string tablebody = string.Empty;
                decimal a = 0;
                foreach (var dato in datosReport)
                {
                    atadosTotales = atadosTotales + dato.AtadosTarimas;
                    tubosTotales = tubosTotales + dato.NumTubos;
                    pesoNetoTotales = pesoNetoTotales + dato.PesoTotal;
                    pUnitEstaTotales = pUnitEstaTotales + dato.PUnitEstandar;
                    sobrepesoTotales = sobrepesoTotales + (dato.SobrePeso / 100);
                    scrapTotales = scrapTotales + (dato.Scrap / 100);
                    eficienciaTotales = eficienciaTotales + (dato.Eficiencia / 100);
                    a = dato.PesoTotal;
                    string tr = "<tr>" +
                                $"<td>{dato.Id_Linea}</td>" +
                                $"<td>{dato.Codigo}</td>" +
                                $"<td>{dato.AtadosTarimas}</td>" +
                                $"<td>{dato.NumTubos}</td>" +
                                $"<td>{dato.PesoTotal.ToString("C", cultureInfo).Replace("$", "")} Kg</td>" +
                                $"<td>{dato.PUnitEstandar.ToString("C", cultureInfo).Replace("$", "")}</td>" +
                                $"<td>{dato.PUnitReal.ToString("C", cultureInfo).Replace("$", "")}</td>" +
                                $"<td>{dato.SobrePeso.ToString("C", cultureInfo).Replace("$", "")} %</td>" +
                                $"<td>{dato.Scrap.ToString("C", cultureInfo).Replace("$", "")} %</td>" +
                                $"<td>{dato.Eficiencia.ToString("C", cultureInfo).Replace("$", "")} %</td>" +
                                // Agrega más columnas según los parámetros necesarios
                                "</tr>";
                    tablebody += tr;
                }
                string rutaVirtual = "~/Shedule/";
                string rutaEmail = HostingEnvironment.MapPath(rutaVirtual); ;
                if (!System.IO.File.Exists(rutaEmail + Path.GetFileName("CorreoEnvicado.txt")))
                {
                    System.IO.File.Create(rutaEmail + Path.GetFileName("CorreoEnvicado.txt")).Close();
                }

                using (StreamWriter writer = File.AppendText(rutaEmail + Path.GetFileName("CorreoEnvicado.txt")))
                {
                    writer.Write($"Valor: {a}");
                    writer.Close();
                }

                string trTotales = "<tr class='trTotales'>" +
                                $"<td colspan='2'>Totales</td>" +
                                $"<td>{atadosTotales}</td>" +
                                $"<td>{tubosTotales}</td>" +
                                $"<td>{pesoNetoTotales.ToString("C", cultureInfo).Replace("$", "")} Kg</td>" +
                                $"<td>{pUnitEstaTotales.ToString("C", cultureInfo).Replace("$", "")}</td>" +
                                $"<td></td>" +
                                $"<td>{(sobrepesoTotales * 100).ToString("C", cultureInfo).Replace("$", "")} %</td>" +
                                $"<td>{(scrapTotales * 100).ToString("C", cultureInfo).Replace("$", "")} %</td>" +
                                $"<td>{(eficienciaTotales * 100).ToString("C", cultureInfo).Replace("$", "")} %</td>" +
                                // Agrega más columnas según los parámetros necesarios
                                "</tr>";
                tablebody += trTotales;

                if (turno == 1)
                {
                    txttemplate = txttemplate.Replace("{saludoTiempo}", "Buena tarde,");
                    txttemplate = txttemplate.Replace("{turnoInicio}", $"{fechaTurnoInicio.ToString("dd/MM/yyyy HH:mm")}");
                    txttemplate = txttemplate.Replace("{turnoFin}", $"{fechaTurnoFin.ToString("dd/MM/yyyy HH:mm")}");
                }
                else
                {
                    txttemplate = txttemplate.Replace("{saludoTiempo}", "Buen día,");
                    txttemplate = txttemplate.Replace("{turnoInicio}", $"{fechaTurnoInicio.ToString("dd/MM/yyyy HH:mm")}");
                    txttemplate = txttemplate.Replace("{turnoFin}", $"{fechaTurnoFin.ToString("dd/MM/yyyy HH:mm")}");
                }

                txttemplate = txttemplate.Replace("{proceso}", proceso);
                txttemplate = txttemplate.Replace("{numturno}", $"{turno}");
                txttemplate = txttemplate.Replace("{tablebody}", tablebody);
                txttemplate = txttemplate.Replace("{tiporeporte}", proceso.ToUpper());


                MailMessage message = new MailMessage();
                message.From = new MailAddress("escaner@ptmexico.com", "PTM");
                //message.From = new MailAddress("franco.maldonado@paradox-et.com", "PTM");

                message.Subject = $"Reporte: {proceso}";
                message.Body = txttemplate;
                message.IsBodyHtml = true;
                message.BodyEncoding = Encoding.UTF8;
                message.SubjectEncoding = Encoding.UTF8;
                message.To.Add("saavedrasi@ptmexico.com");
                message.To.Add("jimenezml@ptmexico.com");
                message.To.Add("soporte@paradox-et.com");
                message.To.Add("franco.maldonado@paradox-et.com");

                // Configurar el cliente SMTP
                SmtpClient smtpClient = new SmtpClient("smtp.office365.com", 587);
                smtpClient.EnableSsl = true;
                smtpClient.UseDefaultCredentials = false;
                //smtpClient.Credentials = new System.Net.NetworkCredential("franco.maldonado@paradox-et.com", "Paradox#2023");
                smtpClient.Credentials = new System.Net.NetworkCredential("escaner@ptmexico.com", "Ptm2018E");

                try
                {
                    // Enviar el correo electrónicoon
                    smtpClient.Send(message);
                    message.Dispose();
                    smtpClient.Dispose();
                }
                catch (Exception ex)
                {
                    message.Dispose();
                    smtpClient.Dispose();
                    System.Diagnostics.StackTrace trace = new System.Diagnostics.StackTrace(ex, true);
                    int line = trace.GetFrame(trace.FrameCount - 1).GetFileLineNumber();
                    string Message = string.Empty;
                    StringBuilder Mensaje = new StringBuilder();
                    Mensaje.Append("Ocurrio un error al enviar el reporte:");
                    Mensaje.Append(ex.Message != null ? ex.Message.ToString() : string.Empty);
                    Mensaje.Append(ex.InnerException != null ? ex.InnerException.ToString() : string.Empty);
                    Mensaje.Append(" line: " + line);

                    string rutaVirtualE = "~/Shedule/";
                    string rutaEmailE = HostingEnvironment.MapPath(rutaVirtualE);
                    if (!System.IO.File.Exists(rutaEmailE + Path.GetFileName("ErrorSend.txt")))
                    {
                        System.IO.File.Create(rutaEmailE + Path.GetFileName("ErrorSend.txt")).Close();
                    }

                    using (StreamWriter writer = File.AppendText(rutaEmailE + Path.GetFileName("ErrorSend.txt")))
                    {
                        writer.Write($"{DateTime.Now} - {Mensaje.ToString()}");
                        writer.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.StackTrace trace = new System.Diagnostics.StackTrace(ex, true);
                int line = trace.GetFrame(trace.FrameCount - 1).GetFileLineNumber();
                string Message = string.Empty;
                StringBuilder Mensaje = new StringBuilder();
                Mensaje.Append("Ocurrio un error al enviar el reporte:");
                Mensaje.Append(ex.Message != null ? ex.Message.ToString() : string.Empty);
                Mensaje.Append(ex.InnerException != null ? ex.InnerException.ToString() : string.Empty);
                Mensaje.Append(" line: " + line);

                string rutaVirtualE = "~/Shedule/";
                string rutaEmailE = HostingEnvironment.MapPath(rutaVirtualE);

                if (!System.IO.File.Exists(rutaEmailE + Path.GetFileName("ErroresEnvioMail.txt") ))
                {
                    System.IO.File.Create(rutaEmailE + Path.GetFileName("ErroresEnvioMail.txt")).Close();
                }

                using (StreamWriter writer = File.AppendText(rutaEmailE + Path.GetFileName("ErroresEnvioMail.txt")))
                {
                    writer.WriteLine($"{DateTime.Now} - {Mensaje.ToString()}");
                    writer.Close();
                }
            }
        }

        public List<ReportesProdTerm> ObtenerDatosReporte(int turno, string proceso, DateTime fechaTurnoInicio, DateTime fechaTurnoFin)
        {
            try
            {
                var sqlconn = WebConfigurationManager.AppSettings["sqlConnection"];

                // Crear la conexión a la base de datos
                using (SqlConnection connection = new SqlConnection(sqlconn))
                {
                    // Abrir la conexión
                    connection.Open();

                    // Crear el comando para ejecutar el procedimiento almacenado
                    using (SqlCommand command = new SqlCommand("DatosReporte", connection))
                    {
                        // Especificar que el comando es un procedimiento almacenado
                        command.CommandType = CommandType.StoredProcedure;

                        // Agregar los parámetros necesarios
                        command.Parameters.AddWithValue("@turno", turno); // Reemplaza 1 con el valor deseado
                        command.Parameters.AddWithValue("@proceso", proceso); // Reemplaza "proceso" con el valor deseado
                        command.Parameters.AddWithValue("@FechaTurnoInicio", fechaTurnoInicio); // Reemplaza DateTime.Now con el valor deseado
                        command.Parameters.AddWithValue("@FechaTurnoFin", fechaTurnoFin); // Reemplaza DateTime.Now con el valor deseado

                        // Crear un SqlDataReader para leer los resultados del procedimiento almacenado
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            // Lista para almacenar los objetos reporte
                            List<ReportesProdTerm> reportes = new List<ReportesProdTerm>();

                            // Leer cada fila de resultados y deserializar en objetos reporte
                            while (reader.Read())
                            {
                                ReportesProdTerm r = new ReportesProdTerm
                                {
                                    Id_Linea = Convert.ToInt32(reader["Id_Linea"].ToString()),
                                    Codigo = reader["Codigo"].ToString(),
                                    AtadosTarimas = Convert.ToInt32(reader["AtadosTarimas"].ToString()),
                                    NumTubos = Convert.ToInt32(reader["NumTubos"].ToString()),
                                    PesoTotal = Convert.ToDecimal(reader["PesoTotal"].ToString()),
                                    PUnitEstandar = Convert.ToDecimal(reader["PUnitEstandar"].ToString()),
                                    PUnitReal = Convert.ToDecimal(reader["PUnitReal"].ToString()),
                                    SobrePeso = Convert.ToDecimal(reader["SobrePeso"].ToString()),
                                    Scrap = Convert.ToDecimal(reader["Scrap"].ToString()),
                                    Eficiencia = Convert.ToDecimal(reader["Eficiencia"].ToString())
                                };

                                reportes.Add(r);
                            }

                            return reportes;
                        }
                    }
                    // Cerrar la conexión
                    connection.Close();
                }
            }
            catch (Exception ex)
            {
                List<ReportesProdTerm> reportes = new List<ReportesProdTerm>();
                System.Diagnostics.StackTrace trace = new System.Diagnostics.StackTrace(ex, true);
                int line = trace.GetFrame(trace.FrameCount - 1).GetFileLineNumber();
                string Message = string.Empty;
                StringBuilder Mensaje = new StringBuilder();
                Mensaje.Append("Ocurrio un error al enviar el reporte:");
                Mensaje.Append(ex.Message != null ? ex.Message.ToString() : string.Empty);
                Mensaje.Append(ex.InnerException != null ? ex.InnerException.ToString() : string.Empty);
                Mensaje.Append(" line: " + line);

                string rutaVirtualE = "~/Shedule/";
                string rutaEmailE = HostingEnvironment.MapPath(rutaVirtualE);
                
                if (System.IO.File.Exists(rutaEmailE + Path.GetFileName("ErroresStore.txt")))
                {
                    System.IO.File.Create(rutaEmailE + Path.GetFileName("ErroresStore.txt")).Close();
                }

                using (StreamWriter writer = File.AppendText(rutaEmailE + Path.GetFileName("ErroresStore.txt") ))
                {
                    writer.WriteLine($"{DateTime.Now} - {Mensaje.ToString()}");
                    writer.Close();
                }

                return reportes;
            }

        }
    }

    public class ReportesProdTerm
    {
        public int Id_Linea { get; set; }
        public string Codigo { get; set; }
        public int AtadosTarimas { get; set; }
        public int NumTubos { get; set; }
        public decimal PesoTotal { get; set; }
        public decimal PUnitEstandar { get; set; }
        public decimal PUnitReal { get; set; }
        public decimal SobrePeso { get; set; }
        public decimal Scrap { get; set; }
        public decimal Eficiencia { get; set; }

    }
}