using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace PTM.LogsGlobales //lo usamos para registrar logs ocurridos en la web
{
    public static class LogGlobal
    {
        //obtenemos la ruta de logs desde el .ini
        private static string GetRutaLogsGlobals(string iniPath)
        {
            string[] lines = File.ReadAllLines(iniPath);
            bool rutaSection = false;
            foreach (var line in lines)
            {
                if (line.Trim().Equals("[RutaLogs]", StringComparison.OrdinalIgnoreCase))
                {
                    rutaSection = true;
                    continue;
                }

                if (rutaSection)
                {
                    // Si llegamos a otra sección, terminamos la búsqueda
                    if (line.Trim().StartsWith("["))
                        break;

                    // Ignorar líneas vacías o comentarios
                    if (string.IsNullOrWhiteSpace(line) || line.Trim().StartsWith(";"))
                        continue;

                    // Buscar la clave "Path"
                    var parts = line.Split(new[] { '=' }, 2);
                    if (parts.Length == 2 && parts[0].Trim().Equals("Path", StringComparison.OrdinalIgnoreCase))
                        return parts[1].Trim();
                }
            }
            throw new Exception("No se encontró la clave 'Path' en la sección [RutaLogs]");
        }


        public static void LogError(string message)
        {
            // Ruta del ini
            var iniPath = @"C:\Paradox\PTM\Almacen.ini";
            try
            {
                // obtenemos la ruta base del archivo ini
                var basePath = GetRutaLogsGlobals(iniPath);

                // Asegurar que carpeta LOGS exista
                var logsDir = Path.Combine(basePath, "LOGS");
                if (!Directory.Exists(logsDir)) Directory.CreateDirectory(logsDir);

                // Determinar archivo según el día actual
                var fileName = $"{DateTime.Now:dd-MM-yyyy}.txt";
                var logFilePath = Path.Combine(logsDir, fileName);

                // Escribir la línea en el archivo log
                File.AppendAllText(logFilePath, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} - LOG WEB - {message}{Environment.NewLine}");

                // Limpiar archivos viejos (más de 6 meses)
                var archivos = Directory.GetFiles(logsDir, "*.txt");
                var ahora = DateTime.Now;
                var regex = new Regex(@"(\\d{2})-(\\d{2})-(\\d{4})\\.txt$");
                foreach (var archivo in archivos)
                {
                    var nombre = Path.GetFileName(archivo);
                    if (DateTime.TryParseExact(nombre.Replace(".txt", ""), "dd-MM-yyyy", null, System.Globalization.DateTimeStyles.None, out var fechaArchivo))
                    {
                        if (ahora - fechaArchivo > TimeSpan.FromDays(180))
                        {
                            File.Delete(archivo);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al escribir log: {ex.Message}");
            }
        }
    }
}