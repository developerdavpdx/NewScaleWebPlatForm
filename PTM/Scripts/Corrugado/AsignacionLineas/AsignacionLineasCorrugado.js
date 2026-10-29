const loader = document.getElementById('loaderDiv'); //Obtenemos el loader (definido en el html del layout)

let WebApiURL = localStorage.getItem("webapiurl"); //URL del API (se guarda al iniciar sesion)
let UserNameSes = localStorage.getItem("usuario"); //Nombre del usuario en sesion

let numeroLinea;    //guardamos el numero de linea clikeada o seleccionada (al asignar o desasignar)
let tablaBitacora;
let numLineas;   //Guardamos la respuesta del lineas exitentes
let EstaAsignado = false;

//variables para obtener los codigos a asignar
const entradaBusqueda = document.getElementById('entrada-busqueda');
const listaSugerencias = document.getElementById('sugerencias-autocompletar');
const sugerencias = [];

//Al terminar de cargar la pagina..
$(document).ready(async () => {
    loader.style.display = 'flex';  //COMENZAMOS EL LOADER
    localStorage.planta == '335' ? planta = '2' : planta = '1'; //obtenemos la planta asignada desde el usuario (planta esta declarada en el layout.js)

    //configuramos la tabla de historiales
    tablaBitacora = $('#tableHistorial').DataTable({
        ordering: false,
        responsive: true,
        searching: false,
        language: {
            search: 'Buscar:',
            lengthMenu: 'Mostrar _MENU_ registros',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
            infoEmpty: 'Sin registros',
            zeroRecords: 'No se encontraron resultados',
            emptyTable: "No hay registros encontrados en los últimos 30 días",
            paginate: { previous: 'Anterior', next: 'Siguiente' }
        }
    });

    await getLineas(); //obtenemos las lineas existentes/agregadas

    GetArticulos(); //obtenemos los articulos desde SAP (para llenar la lista de sugerencias)



    //FUNCTIOS

    //funcion para abrir el modal de agregar una nueva linea (solo aumenta el numero en el input del modal antes de mostrar el modal) [el modal se abre con el data-toggle del btn]
    function AgregaLineaBtn() {
        let totalLineas = (numLineas && numLineas.response) ? numLineas.response.length : 0;
        document.getElementById("inputNumLinea").value = totalLineas + 1; //siguiente numero de linea
    }

    // Funcion para abrir el modal de "asignacion/desasignacion" de cada linea clickeada
    function AsignarLineaModal(element) {
        numeroLinea = $(element).data('linea-id')
        tipoAsignado = $(element).data("asignado").toString();

        codigoAsignado = $(element).data("codigo").toString();
        ordenAsignado = $(element).data("orden");
        kiloshoraAsignado = $(element).data("kghora");

        //accedemos al select
        let selectOF = $("#selectOF");

        //Mostramos el boton de 'asignar' o 'desasignar' segun sea el caso (tambien habilitamos o no los input del modal)
        if (tipoAsignado == "Asignado") {
            document.getElementById('desasignarBtn').style.display = 'inline-flex'
            document.getElementById('AsignarLinea').style.display = 'none'

            //si la linea esta asignada, ademas de mostrar el boton, agregamos los values a los input y los inhabilitamos
            $("#entrada-busqueda").val(codigoAsignado).prop('disabled', true);
            $("#kgxhora").val(kiloshoraAsignado).prop('disabled', true);
            // Para select..
            // Limpiar opciones que pueda haber
            selectOF.empty();
            // Agregar opción temporal con ordenAsignado
            selectOF.append(new Option(ordenAsignado, ordenAsignado, true, true));
            // Deshabilitar el select para solo lectura
            selectOF.prop('disabled', true);
        } else {
            document.getElementById('AsignarLinea').style.display = 'inline-flex'
            document.getElementById('desasignarBtn').style.display = 'none'

            //habilitamos los input y select
            $("#entrada-busqueda").prop('disabled', false);
            $("#kgxhora").prop('disabled', false);
            selectOF.prop('disabled', false);
        }
        //agregammos el numero de linea en el titulo del modal
        document.getElementById('lineaNumber').textContent = numeroLinea;

        //obtenemos el historial de la linea seleccionada y lo pintamos
        getBitacoraInfo();
    }

    //Obtiene los datos de los articulos desde SAP (para llenar las sugerencias en el select de "articulos/producto")
    function GetArticulos() {
        fetch(`${WebApiURL}/api/Corrugados/GetArticulosSAP`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        }).then(async (response) => {
            const jsonData = await response.json();

            if (response.ok) {
                return jsonData;
            } else {
                // Rechaza con el objeto completo para permitir mostrar el mensaje del backend
                return Promise.reject(jsonData);
            }
        }).then((jsonData) => {
            let dataSku = jsonData.data;

            // Limpieza previa si sugerencias es global o declarado
            sugerencias.length = 0;

            for (let x = 0; x < dataSku.length; x++) {
                sugerencias.push({
                    valor: dataSku[x].codigoitem,
                    etiqueta: dataSku[x].codigoitem
                });
            }
            //mantenemos el input de articulo como "", para que el usuario seleccione de la lista de sugerencias
            entradaBusqueda.value = "";
            loader.style.display = 'none';

        }).catch((error) => {
            console.log(error);

            iziToast.error({
                position: "topRight",
                title: `Error al obtener los articulos`,
                message: `<p>${error.message}</p>`
            }); 

            loader.style.display = 'none';
        });
    }

    //Funcio para asignarle a la linea el articulo (al dar click en el boton "Asignar")
    function PeticionAsignarLinea() {
        loader.style.display = 'flex'; //comenzamos el loader
        let turno = obtenerTurno();
        let selectOF = document.getElementById("selectOF");  //Obtenemos la Orden de fabricacion seleccionada

        //validamos que se haya ingresado algun kilogramo x hora
        if (document.getElementById("kgxhora").value == "" || document.getElementById("kgxhora").value == 0) {
            iziToast.info({
                position: "topRight",
                title: `Sin Kg por Hora agregados`,
                message: `<p>Favor de ingresar los Kg por hora.</p>`,
            });

            loader.style.display = "none"; //detenemos el loader
            return;  //detenemos la asignacion de linea
        }

        //validamos si todos los inputs estan llenos para continuamos con el flujo
        if (entradaBusqueda.value == 0 && document.getElementById("kgxhora").value == '' && selectOF.options[selectOF.selectedIndex].value == 0) {
        
            iziToast.info({
                position: "topRight",
                title: `Campos Vacios`,
                message: `<p>Favor de Llenar todos los campos</p>`,
            });
            loader.style.display = 'none';
            return;
        }

        //obtenemos los datos a enviar
        let data = {
            "code": entradaBusqueda.value,
            "linea": numeroLinea.toString(),
            "turno": turno.toString(),
            "kgxhora": document.getElementById("kgxhora").value,
            "ordenfabricacion": selectOF.options[selectOF.selectedIndex].textContent,
            "folio": selectOF.options[selectOF.selectedIndex].value,
            "planta": planta,
            "NameUser": UserNameSes
        }

        fetch(`${WebApiURL}/api/Corrugados/AsignarLinea`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)

        }).then(async response => {
            const jsonData = await response.json();
            //validamos que la respuesta sea ok o 404 (404 indica un error en el sp)
            if (response.ok || response.status === 404) {
                return jsonData;
            } else {
                // otros errores (500, 400, etc.) seguirán a catch
                return Promise.reject(jsonData);
            }
        }).then((jsonData) => {

            if (jsonData.status == 200) {   // si la asignación es correcta
                iziToast.success({
                    position: "topRight",
                    title: `Asignación Completa`,
                    message: `<p>${jsonData.response}</p>`,
                });

                // refrescamos las líneas, cerramos el modal y terminamos el loader
                getLineas();
                $('.cerrarModal').click();
                loader.style.display = 'none';
            }
            else if (jsonData.status == 404) {  // si ocurre un error en el SP
                iziToast.info({
                    position: "topRight",
                    title: "No se realizó la asignación",
                    message: jsonData.message 
                });

                loader.style.display = 'none';
            }
        }).catch((error) => {
            console.error(error);
            iziToast.error({
                position: "topRight",
                title: "Error al asignar la línea",
                message: error.message
            });
            loader.style.display = 'none';
        });
       
    }

    //Funcion para obtener el historial de la linea seleccionada
    function getBitacoraInfo() {

        loader.style.display = 'flex';  //COMENZAMOS EL LOADER

        tablaBitacora.clear().draw();
        var data = {
            "linea": numeroLinea.toString(),
            "planta": planta
        }

        fetch("/Corrugados/GetHistorialAsignated", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            //console.log(jsonData)
            var data = jsonData.data;

            if (data && data.length > 0) {  // si hay registros
                let Rows = [];
                for (let x = 0; x < data.length; x++) {
                    Rows.push([data[x].name, data[x].dateasign, data[x].codigo]);
                }
                tablaBitacora.rows.add(Rows).draw();
            } else {  // si no hay registros
                iziToast.info({
                    position: "topRight",
                    title: `Aviso`,
                    message: `<p>No hay historial de cambios recientes para esta línea</p>`
                });
            }
            loader.style.display = 'none';
        }).catch((error) => {
            console.log(error);
            iziToast.warning({
                position: "topRight",
                title: `Aviso`,
                message: `<p>No hay historial de cambios recientes para esta línea</p>`
            });
            loader.style.display = 'none';
        });
    }

    //obtenemos y pintamos las lineas existentes
    function getLineas() {
        let data = {
            "planta": planta
        }
        fetch("/Corrugados/GetNumberOfLinies", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {

            if (jsonData.status == 200) {
                numLineas = JSON.parse(jsonData.data);
                //console.log(numLineas);

                // Limpia la sección antes de insertar los nuevos botones
                $("#buttonSection").empty();

                // Estado vacío (mismo criterio que la vista de Asignación de líneas PVC/INY)
                if (numLineas.response.length === 0) {
                    $("#buttonSection").append(`
                        <div class="al-empty">
                            <i class="fa fa-industry" aria-hidden="true"></i>
                            <p class="al-empty-title">No hay líneas registradas</p>
                            <p class="al-empty-text">Usa "Agregar Línea" para crear la primera.</p>
                        </div>
                    `);
                }

                for (x = 0; x < numLineas.response.length; x++) {
                    let orden = ComprobarNull(numLineas.response[x].ordenFabricacion);
                    let kg = ComprobarNull(numLineas.response[x].kgXHr);
                    let code = ComprobarNull(numLineas.response[x].itemCodeLinea);

                    $("#buttonSection").append(`
                        <button type="button"
                                class="linea-card ${numLineas.response[x].asignado ? "linea-asignada" : "linea-libre"}"
                                data-linea-id="${x + 1}"
                                data-asignado="${numLineas.response[x].asignado ? "Asignado" : "Desasignado"}"
                                data-codigo="${code}"
                                data-orden="${orden}"
                                data-kghora="${kg}"
                                data-toggle="modal"
                                data-target="#myModal">
                            <div class="linea-card-top">
                                <span class="linea-num">Línea ${numLineas.response[x].numLinea}</span>
                                <span class="linea-estado">${numLineas.response[x].asignado ? "Asignada" : "Libre"}</span>
                            </div>
                            <div class="linea-proceso">${numLineas.response[x].proceso}</div>
                            <div class="linea-datos">
                                <div>
                                    <span>Orden</span>
                                    <strong>${orden == null ? "---" : orden}</strong>
                                </div>
                                <div>
                                    <span>Kg x Hr</span>
                                    <strong>${kg == 0 ? "---" : kg}</strong>
                                </div>
                                <div>
                                    <span>Código</span>
                                    <strong>${code == null ? "---" : code}</strong>
                                </div>
                            </div>
                        </button>
                    `);
                }

                //asignamos el evento de "click" a cada boton (linea) creado
                $("#buttonSection").off("click", "button").on("click", "button", function () {
                    AsignarLineaModal(this);
                });

                actualizarContadores();
                loader.style.display = 'none';
            } else {
                //obtenemos el mensaje que viene desde el API
                let mensaje = "";
                let parsedData = JSON.parse(jsonData.data);
                mensaje = parsedData.response || "";

                iziToast.info({
                    position: "topRight",
                    title: `Sin Líneas`,
                    message: `<p>${mensaje}</p>`,
                })

                actualizarContadores();
                loader.style.display = 'none';
            }
        }).catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>${error.toString()}</p>`,
            })

            loader.style.display = 'none'
        })
    }

    //Actualiza los contadores del encabezado (solo presentacion)
    function actualizarContadores() {
        let lineas = (numLineas && numLineas.response) ? numLineas.response : [];
        let total = lineas.length;
        let asignadas = lineas.filter(linea => linea.asignado).length;

        let totalEl = document.getElementById('alTotal');
        let asignadasEl = document.getElementById('alAsignadas');
        let disponiblesEl = document.getElementById('alDisponibles');

        if (totalEl) totalEl.textContent = total;
        if (asignadasEl) asignadasEl.textContent = asignadas;
        if (disponiblesEl) disponiblesEl.textContent = total - asignadas;
    }

    //Crea una nueva linea
    function AgregarNuevaLinea() {
        loader.style.display = 'flex'; //iniciamos el loader

        let selectInputProcess = document.getElementById("selectInputProcess");  //Obtenemos el Proceso

        //nos aseguramos de que el "proceso" este seleccionado
        if (selectInputProcess.options[selectInputProcess.selectedIndex].value == 0) {
            iziToast.info({
                position: "topRight",
                title: `Campos Incompletos`,
                message: `<p>Favor de verificar que el proceso este seleccionado.</p>`,
            });
            //Detenemos el loader y el proceso de agregar una nueva linea
            loader.style.display = "none";
            return;
        }

        //obtenemos los datos para agregar una nueva linea
        let lineaNueva = document.getElementById("inputNumLinea").value;

        let data = {
            "linea": lineaNueva.toString(),
            "proceso": selectInputProcess.options[selectInputProcess.selectedIndex].textContent,
            "planta": planta
        }

        fetch("/Corrugados/CreateNewLinea", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            console.log(jsonData)

            //obtenemos el mensaje que viene desde el API
            let mensaje = "";
            let parsedData = JSON.parse(jsonData.data);
            mensaje = parsedData.response || "";

            if (jsonData.status == 200) {
                //localStorage.setItem("nLinea", "true")
                //cerramos el modal
                $('#agregarLinea').modal('hide');
                //recargamos las lineas existentes para traer las nuevas agregadas
                getLineas();
                //detenemos el loader
                loader.style.display = "none";
                iziToast.success({
                    position: "topRight",
                    title: `Linea creada`,
                    message: `<p>${mensaje}</p>`,
                });
            } else {
                loader.style.display = "none";
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>${mensaje}</p>`,
                });
            }
        }).catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Error de Servidor`,
                message: `<p>Error: ${error}.</p>`,
            })
            loader.style.display = "none"
        })
    }

    //Funcion para quitar eliminar una linea
    function EliminarLinea(LineaDelete) {
        loader.style.display = 'flex';

        let data = {
            "linea": LineaDelete,
            "planta": planta
        }

        fetch("/Corrugados/DeleteLinie", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            //obtenemos el mensaje que viene desde el API
            let mensaje = "";
            let parsedData = JSON.parse(jsonData.data);
            mensaje = parsedData.response || "";

            if (jsonData.status == 200) {
                //cerramos el modal
                $('#QuitarLinea').modal('hide');
                //recargamos las lineas existentes para traer las restantes
                getLineas();
                //detenemos el loader
                loader.style.display = "none";

                iziToast.success({
                    position: "topRight",
                    title: `Linea Eliminada`,
                    message: `<p>${mensaje}.</p>`,
                })
            } else {
                loader.style.display = "none";
                iziToast.info({
                    position: "topRight",
                    title: `La linea no se elimino`,
                    message: `<p>${mensaje}.</p>`,
                })
            }
        }).catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Error de Servidor`,
                message: `<p>Error: ${error}.</p>`,
            })
            loader.style.display = "none"
        })
    }

    //funcio para Des-Asignar una linea
    function DesasignarLinea() {
        loader.style.display = 'flex';

        var data = {
            "linea": numeroLinea.toString(),
            "planta": planta
        }

        fetch(`${WebApiURL}/api/Corrugados/Des_AsignarLinea`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)

        }).then(async response => {
            const jsonData = await response.json();
            //validamos que la respuesta sea ok o 404 (404 indica un error en el sp)
            if (response.ok || response.status === 404) {
                return jsonData;
            } else {
                // otros errores (500, 400, etc.) seguirán a catch
                return Promise.reject(jsonData);
            }
        }).then((jsonData) => {

            if (jsonData.status == 200) {   // si la DES-Asignación es correcta
                iziToast.success({
                    position: "topRight",
                    title: `Des-Asignación Completa`,
                    message: `<p>${jsonData.response}</p>`,
                });

                // refrescamos las líneas, cerramos el modal y terminamos el loader
                getLineas();
                $('.cerrarModal').click();
                loader.style.display = 'none';
            }
            else if (jsonData.status == 404) {  // si ocurre un error en el SP
                iziToast.info({
                    position: "topRight",
                    title: "No se realizó la DES-Asignación",
                    message: jsonData.message
                });

                loader.style.display = 'none';
            }
        }).catch((error) => {
            console.error(error);
            iziToast.error({
                position: "topRight",
                title: "Error al DES-Asignar la línea",
                message: error.message
            });
            loader.style.display = 'none';
        });
    }

    function obtenerTurno() {
        var horaInicio = new Date();
        horaInicio.setHours(4, 30, 0);
        var horaFin = new Date();
        horaFin.setHours(16, 30, 0);

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

    //Funcion para verificar si los objetos o valores vienen vacios
    function ComprobarNull(value) {
    // Si es null, undefined o un objeto vacío, mostrar "---"
    if (value == null) return "---";
    if (typeof value === "object" && Object.keys(value).length === 0) return "---";
    if (typeof value === "number" && value === 0) return "---";
    return value;
    }

    //Funcion para obtener las ordenes de fabricacion en base al codigo seleccionado
    function Get_OF(Code) {
        // Armamos el objeto JSON para enviar a la API
        let data = {
            code: Code,
            planta: parseInt(localStorage.planta) //Enviamos el planta en su base serie (33 o 335), ya que asi esta registrada en BD
        };

        fetch(`${WebApiURL}/api/Corrugados/GetOF_SAP`, {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify(data)
        })
            .then(async response => {
                const jsonData = await response.json();
                //validamos que la respuesta sea ok o 404 (404 no es error, solo indica que no se encontraron resultados)
                if (response.ok || response.status === 404) {
                    return jsonData;
                } else {
                    // otros errores (500, 400, etc.) seguirán a catch
                    return Promise.reject(jsonData);
                }
            })
            .then(jsonData => {
                //accedemos al select de OF
                var selectOF = document.getElementById("selectOF");

                //si hay of
                if (jsonData.status == 200) {
                    var baseEntry = JSON.parse(jsonData.data);
                    //console.log(baseEntry);
                    //opcion default
                    selectOF.innerHTML = '<option value="0" selected>Seleccione...</option>';
                    baseEntry.forEach(entry => {
                        var option = document.createElement("option");
                        option.value = entry.BASEENTRY;
                        option.text = entry.DOCNUM;
                        selectOF.appendChild(option);
                    });
                    //si no se encontraro OF
                } else if (jsonData.status == 404) {
                    selectOF.innerHTML = '<option value="0" selected>Seleccione...</option>';
                    iziToast.info({
                        position: "topRight",
                        title: "Sin OF",
                        message: jsonData.message
                    });
                }
            })
            .catch(error => {
                console.error(error);
                iziToast.error({
                    position: "topRight",
                    title: "Error",
                    message: error.message
                });
            });
    }

    //codes autocomplete
    entradaBusqueda.addEventListener('input', () => {
        const terminoBusqueda = entradaBusqueda.value.toLowerCase();

        // Obtener sugerencias basadas en terminoBusqueda
        obtenerSugerencias(terminoBusqueda, (sugerencias) => {
            mostrarSugerencias(sugerencias);
        });
    });
    function obtenerSugerencias(terminoBusqueda, callback) {

        // Filtrar sugerencias basándose en terminoBusqueda
        const sugerenciasFiltradas = sugerencias.filter(sugerencia => sugerencia.etiqueta.toLowerCase().includes(terminoBusqueda));

        callback(sugerenciasFiltradas);
    }
    function mostrarSugerencias(sugerencias) {
        listaSugerencias.innerHTML = '';

        if (sugerencias.length === 0) {
            const sinResultados = document.createElement('li');
            sinResultados.textContent = 'No se encontraron sugerencias';
            listaSugerencias.appendChild(sinResultados);
            return;
        }

        sugerencias.forEach(sugerencia => {
            const elementoSugerencia = document.createElement('li');
            elementoSugerencia.textContent = sugerencia.etiqueta;

            elementoSugerencia.addEventListener('click', () => {
                entradaBusqueda.value = sugerencia.etiqueta; // Establecer la etiqueta como valor de entrada
                // cuando seleccionamos la sugerencia de la lista..
                devolverValorSugerencia(sugerencia.valor);
                listaSugerencias.innerHTML = ''; // Ocultar la lista de sugerencias
            });

            listaSugerencias.appendChild(elementoSugerencia);
        });
    }

    // Funcion para Devolver la informacion relacionada al codigo seleccionado en la lista de sugerencias (OF, kgh..)
    function devolverValorSugerencia(Codigo_Articulo_Seleccionado) {
        //comenzamos el loader
        document.getElementById('loaderDiv').style.display = 'flex';

        //obtenemos los kghora de acuerdo al codigo seleccionad
        Obtener_KGH(Codigo_Articulo_Seleccionado);
        // obtenemos el numero de orden de acuerdo al codigo seleccionado
        Get_OF(Codigo_Articulo_Seleccionado);

        //terminamos el loader
        document.getElementById('loaderDiv').style.display = 'none';
    }

    //funcion para obtener los kilogramos hora de acuerdo al articulo y linea seleccionados (si no existen kgh para la linea, no se asignan automaticamente)
    function Obtener_KGH(Codigo) {
        //armamos los datos a enviar
        let data = {
            "code": Codigo,
            "planta": parseInt(planta),
            "linea": parseInt(numeroLinea)
        };

        fetch(`${WebApiURL}/api/Corrugados/GetKgHoraCorrugados`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data)
        })
        .then(async (response) => {
            const jsonData = await response.json();

            if (response.ok) {
                return jsonData;
            } else {
                // Rechaza con el objeto completo para permitir mostrar el mensaje del backend
                return Promise.reject(jsonData);
            }
        }).then(jsonData => {
            // Si el campo viene vacío o null, lo convertimos a ""
            const KghoraJson = jsonData.data || "";
            //asignamos los kgh encontrados (o no) en el campo correspondiente
            $('#kgxhora').val(KghoraJson);
        })
        .catch(error => {
            console.error(error);
            iziToast.error({
                position: "topRight",
                title: `Error al obtener los articulos`,
                message: `<p>${error.message}</p>`
            }); 
        });
    }

    // Funcion para iniciar el proceso de descarga de excel (obtiene las lineas existentes con sus asignacion y las pasa para generar el excel)
    function infoExcel() {
        let data = {
            "planta": planta
        }

        loader.style.display = "flex";

        fetch("/Corrugados/GetNumberOfLinies", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            if (jsonData.status == 200) {
                let lineas = JSON.parse(jsonData.data)
                lineas = lineas.response;
                //console.log(lineas);
                lineas = lineas.map(({ numLinea, proceso, kgXHr, itemCodeLinea, ordenFabricacion }) => ([
                    numLinea,
                    proceso,
                    itemCodeLinea,
                    kgXHr,
                    ordenFabricacion
                ]));

                generarexcel(lineas);
                loader.style.display = "none";
            }

        }).catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>${error.toString()}</p>`,
            })
            loader.style.display = "none";

        })
    }

    //Funcion para generar el excel con las lineas obtenidas
    function generarexcel(data) {
        var datos = new FormData();

        datos.append("matrizdatos", JSON.stringify(data));
        // Crear un nuevo objeto XMLHttpRequest
        var xhr = new XMLHttpRequest();
        var url = '/AsignacionLinia/generarexcelCorrugados';
        // Configurar la solicitud
        xhr.open('POST', url, true);

        // Manejar la respuesta
        xhr.onload = function () {
            if (xhr.status === 200) {
                
                var respuesta = JSON.parse(xhr.responseText);

                if (respuesta.R == 1) {
                    //Si el excel se genera correctamente en el controlador, lo descargamos
                    descargarArchivo('Asignacion de Lineas Corrugados.xlsx', respuesta.data);
                } else {

                    iziToast.info({
                        position: "topRight",
                        title: `Exportación de excel producto terminado`,
                        message: `<p>El documento de excel no pudo ser generado</p>`,
                    })
                    loader.style.display = "none";
                }

            } else {
                // Manejar el error
                console.log('Error: ' + xhr.status);
                loader.style.display = "none";
            }
        };
        // Enviar la solicitud
        xhr.send(datos);
    }

    //Fucion para descargar excel generado desde el controller
    function descargarArchivo(nombreArchivo, base64String) {
        // Crear un enlace temporal en la página
        var enlaceTemporal = document.createElement('a');
        enlaceTemporal.setAttribute('href', 'data:application/vnd.ms-excel;base64,' + base64String);
        enlaceTemporal.setAttribute('download', nombreArchivo);

        // Agregar el enlace temporal a la página
        document.body.appendChild(enlaceTemporal);

        // Hacer clic en el enlace temporal para descargar el archivo
        enlaceTemporal.click();

        // Remover el enlace temporal de la página
        document.body.removeChild(enlaceTemporal);
    }

    //------------------------------------------BTNS------------------------------------------

    //Btn Actualizar lineas
    $('#BtnRefreshLineas').click(function () {
        loader.style.display = 'flex';
        getLineas();
    });

    //Btn Agregar nueva linea (abre el modal)
    $('#BtnAddLineaModal').click(function () {
        AgregaLineaBtn();
    });

    //Btn Agregar nueva linea (dentro del modal)
    $('#BtnAddNweLine').click(function () {
        AgregarNuevaLinea();
    });

    //Btn elimiar linea (dentro del modal)
    $('#EliminarLineaBtn').click(function () {
        //obtenemos la linea a eliminar desde el input
        let LineaDelete = $('#inputNumLineaQuitar').val();
        EliminarLinea(LineaDelete);
    });

    //Btn Desasignar linea
    $('#desasignarBtn').click(function () {
        DesasignarLinea();
    });

    //Btn Asignar linea
    $('#AsignarLinea').click(function () {
        PeticionAsignarLinea();
    });

    //Btn descargar Excel
    $('#DivIconEcel').click(function () {
        infoExcel();      
    });

    //------------------------------------------EXTRAS------------------------------------------
    //nos aseguramos de que el input de eliminar linea solo acepte numeros enteros
    $('#inputNumLineaQuitar').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');

        let numlineasVal = (numLineas && numLineas.response) ? numLineas.response.length : 0;
        // nos aseguramos de que el numero ingresado sea menor o igual a "numLineas"
        if (parseInt(this.value) > numlineasVal) {
            this.value = ""; // Si el valor supera numLineas, lo ajustamos a ""
        }
    });

    //nos aseguramos de lmpiar los inputs cada vez que se cierren los modals de cualquier forma
    $('.modalClose').on('hidden.bs.modal', function () {
        //modal de Asignacion/Desasignacion
        let optionsSelect = `<option value="0" selected>Seleccione...</option>`;
        listaSugerencias.innerHTML = '';
        entradaBusqueda.value = "";
        $('#selectOF').html(optionsSelect);
        $('#kgxhora').val('');
        $('#inputNumLineaQuitar').val('');

        //modal Agregar Linea
        $('#selectInputProcess').val(0);

        //modal Eliminar Linea
        $('#inputNumLineaQuitar').val("");
    });

});