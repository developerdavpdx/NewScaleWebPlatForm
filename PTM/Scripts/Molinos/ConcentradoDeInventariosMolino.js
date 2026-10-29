
//formateamos los valores para que devuelva los miles separados por "," [creamos esta funcion al inicio para que exista antes de intentar usarla]
function FarmatoConComas(number) {
    //si el valor es null o undefined retornamos "-"
    return number != null ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-";
}

const loader = document.getElementById('loaderDiv')
let planta;
let turno;

//Tabla1
let tableInventarioInicial;
let rowsTabla1 = [
    ['SCRAP FOAM CORE', `<input class="text-center InputDin form-control ppvc-input" value="${FarmatoConComas(5300)}">`],
    ['SCRAP IPS', `<input class="InputDin text-center form-control ppvc-input" value="${FarmatoConComas(17000)}">`],
    ['SCRAP CPVC BALOR', `<input class="InputDin text-center form-control ppvc-input" value="${FarmatoConComas(4739)}">`],
];

//Tabla2
let tableEntradasScrap
let rowsTabla2 = [
    ['SCRAP FOAM CORE', FarmatoConComas(5300), FarmatoConComas(31045), 1, FarmatoConComas(2730), 50],
    ['SCRAP CLAY', FarmatoConComas(5300), FarmatoConComas(31045), 1, FarmatoConComas(2730), 50],
    ['SCRAP CPVC BALOR', FarmatoConComas(10904), FarmatoConComas(null), 1, FarmatoConComas(null), 17],
];

//Tabla3
let tableProduccionMolinos
let rowsTabla3 = [
    ['MOL IPS', FarmatoConComas(28760)],
    ['MOL DWV', FarmatoConComas(4500)],
    ['MOL CPVC BALOR', FarmatoConComas(27000)]
];

//Tabla3
let TableInventarioTeoricoMolinos
let rowsTabla4 = [
    [FarmatoConComas(283760)]
];


//variables para el filtro (las dejamos inicializadas para el caso donde no aplica filtro)[No agregamos las horas, dejamos el estandar de asignar horas en el api]
let FechaActual = new Date();
let year = FechaActual.getFullYear();
let month = String(FechaActual.getMonth() + 1).padStart(2, '0');
let day = String(FechaActual.getDate()).padStart(2, '0');
let FechaInicioFiltro = `${year}-${month}-${day}`;
let FechaFinFiltro = `${year}-${month}-${day}`;

$(function () {

    //Accedemos a las tabla donde dibujaremos los resultados
    //Tabla1
    tableInventarioInicial = $("#TableInvInicial").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: false,
    });

    //Tabla2
    tableEntradasScrap = $("#TableEntradasScrap").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: false,
    });

    //Tabla3
    tableProduccionMolinos = $("#TableProduccionMolinos").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: false,
    });

    //Tabla4
    TableInventarioTeoricoMolinos = $("#TableInventarioTeoricoMolinos").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: false,
    });

    //obtenemos la planta:
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    //obtenemos el turno
    turno = obtenerTurno();

    //Obtenemos los datos para la tabla de Reportes (Molinos) [default sin filtro]
    //ObtenerDatosReporteMolinos(planta, FechaInicioFiltro, FechaFinFiltro, turno);
    tableInventarioInicial.rows.add(rowsTabla1).draw()
    tableEntradasScrap.rows.add(rowsTabla2).draw()
    tableProduccionMolinos.rows.add(rowsTabla3).draw()
    TableInventarioTeoricoMolinos.rows.add(rowsTabla4).draw()

    // Escucha el evento 'input' para formatear el número mientras el usuario escribe
    $(document).on("input", ".ppvc-input", function () {
        // Elimina las comas para convertir el valor a un número, luego vuelve a formatearlo
        let rawValue = $(this).val().replace(/,/g, "");
        if (!isNaN(rawValue) && rawValue.length > 0) {
            $(this).val(FarmatoConComas(rawValue));
        }
    });

    function ObtenerDatosReporteMolinos(planta, FechaInicioFiltro, FechaFinFiltro, turno) {
        loader.style.display = "flex";

        //si no se selecciona ningun turno, asignamos el valor de 3 para pasarlo al api y tratarlo como "sin turno"
        if (turno != 1 && turno != 2) {
            turno = 3
        }

        fetch(`${urlApi}/Molinos/ObtenerDatosReporteMolinos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                Planta: planta,
                FechaInicio: FechaInicioFiltro,
                FechaFin: FechaFinFiltro,
                Turno: turno
            },
        }).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then((errorData) => {
                    // Si la respuesta no es 200, 
                    return Promise.reject(errorData.message || "Error en la solicitud dentro del controlador");
                });
            }
        })
            .then((jsonData) => {
                // revisamos que los datos devueltos sean válidos
                //console.log(jsonData);
                datosReporteMolinos = jsonData.datosMolinosReporte

                for (x = 0; x < datosReporteMolinos.length; x++) {

                    rowsTabla.push([
                        datosReporteMolinos[x].molino,
                        datosReporteMolinos[x].turno,
                        datosReporteMolinos[x].fechaPesaje,
                        datosReporteMolinos[x].operador,
                        datosReporteMolinos[x].objetivoDeProduccion,
                        datosReporteMolinos[x].codigo,
                        datosReporteMolinos[x].pesoTotal,
                        datosReporteMolinos[x].horasProgramadas,
                        datosReporteMolinos[x].horasParo,
                    ])

                }

                tableReporteMolino.rows.add(rowsTabla).draw()

                //Si no existen registros mostramos el mensaje
                if (datosReporteMolinos.length == 0) {
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ENCONTRARON DATOS`,
                        message: `<p>No existen registros con los filtros seleccionados</p>`,
                    });
                }

                loader.style.display = "none";
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ENCONTRARON DATOS`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    };


    //Funciones Auxiliares

    //function logOut() {
    //    localStorage.clear()
    //    window.location.href = "../../index.html"
    //};

    function obtenerTurno() {
        var horaInicio = new Date();
        horaInicio.setHours(5, 45, 1);
        var horaFin = new Date();
        horaFin.setHours(17, 45, 0);

        // Obtener la hora actual
        var horaActual = new Date();

        // Establecer los segundos a cero en la hora actual
        horaActual.setSeconds(0);

        // Comparar si la hora actual está dentro del rango de horas
        if (horaActual >= horaInicio && horaActual <= horaFin) {
            return 1
        } else {
            return 2
        }
    }

    //ACTIONS
    //Btn cerrar sesion
    //$(document).on("click", "#BtnLogOutReportes", function () {
    //    logOut();
    //});

    //Btn Search
    $(document).on("click", "#SearcReporteMolinos", function () {
        //obtenemos los datos a enviar
        let FechaInicioSearch = $('#FechaInicioReprMolino').val()
        let FechaFinSearch = $('#FechafinReprMolino').val()
        turno = $('#InputturnoMolinos').val();

        //validamos que los campos no esten vacios
        if (FechaFinFiltro == "" || FechaFinFiltro == "" || turno == "") {
            iziToast.error({
                position: "topRight",
                title: `CAMPOS VACIOS`,
                message: `<p>Favor de llenar todos los campos de búsqueda</p>`,
            });
        } else {
            //Limpiamos la tabla y los datos de las lineas
            tableReporteMolino.clear().draw()
            rowsTabla = [];

            //Es la misma funcion para buscar y en default
            ObtenerDatosReporteMolinos(planta, FechaInicioSearch, FechaFinSearch, turno)
        }
    });
});