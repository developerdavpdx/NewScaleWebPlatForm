
const loader = document.getElementById('loaderDiv')

let tableArticulos;
let rowsTabla = [];
let planta;
let rowsTablaFamilias = []; //Aqui guardamos las familias que mostraremos en la tabla
let tableFamilias; //Aqui inicalizamos nuestra tabla de Familias
let datosFamilias = []; //Aqui guardamos las familias para agregarlas como opciones en los select
let tableTipoMaterial; //Aqui inicalizamos nuestra tabla de Topos de material
let rowsTablaTipoMaterial = []; //Aqui guardamos los Tipos de Material para agregarlas como opciones en los select

$(function () {

    //obtenemos la planta
    localStorage.planta == '335' ? planta = '2' : planta = '1'

    //inicializamos la tabla de articulos
    tableArticulos = $("#TablaArticulos").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        info: false,
        lengthChange: false,
    });

    //inicializamos la tabla de Familias
    tableFamilias = $("#TablaFamilias").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: true,
    });

    //inicializamos la tabla de Familias
    tableTipoMaterial = $("#TablaTiposMaterial").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: true,
    });

    //movemos el search de la tabla de posicion para que este al mismo nivel que los botones de agregar/eliminar
    const searchBox = $('#TablaArticulos_filter');
    $('#datatable-search-container').append(searchBox);

    //obtenemos los codigos
    ObtenerDatosArticulos(planta);
    //obtenemos las familias existentes
    ObtenerFamiliasExistentes();

    function ObtenerDatosArticulos(planta) {
        loader.style.display = "flex";

        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta
        }
        fetch("/Molinos/ObtenerArticulosMolinos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            // revisamos que los datos devueltos sean válidos
            //console.log(jsonData);
            let DataJson = JSON.parse(jsonData.data)
            datosArticulosMolinos = DataJson.articulosMolinos

            for (x = 0; x < datosArticulosMolinos.length; x++) {

                let iconoEditArticulos = `<i class="fa fa-pencil iconoEditArticulos" data-codigo="${datosArticulosMolinos[x].codigo}"
                data-descripcion="${datosArticulosMolinos[x].descripcion}"
                data-proceso="${datosArticulosMolinos[x].proceso}"
                data-tipo="${datosArticulosMolinos[x].tipo}"
                data-familia="${datosArticulosMolinos[x].familia}"></i>`;

                rowsTabla.push([
                    datosArticulosMolinos[x].codigo,
                    datosArticulosMolinos[x].descripcion,
                    datosArticulosMolinos[x].proceso,
                    datosArticulosMolinos[x].tipo,
                    datosArticulosMolinos[x].familia,
                    datosArticulosMolinos[x].fechaCreacion.split("T")[0], // Extrae solo la fecha
                    iconoEditArticulos,
                ])
            }
            tableArticulos.rows.add(rowsTabla).draw();
            rowsTabla = [];

            //Si no existen registros mostramos el mensaje
            if (datosArticulosMolinos.length == 0) {
                iziToast.info({
                    position: "topRight",
                    title: `NO SE ENCONTRARON DATOS`,
                    message: `<p>No existen datos</p>`,
                });
            }
            loader.style.display = "none";
        }).catch((error) => {
            console.error("Error en la solicitud:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
            loader.style.display = "none";
        });
    };

    function AgregarEliminarActualizarCodeArticulos(codigo, proces, planta, descripcion, fechacreacion, Tipo, Familia, Borrar) {
        loader.style.display = "flex";

        //armamos los datos que enviaremos al controler
        let data = {
            "Codigo": codigo,
            "Proceso": proces,
            "Planta": planta,
            "Descripcion": descripcion,
            "FechaCreacion": fechacreacion,
            "Tipo": Tipo,
            "Familia": Familia,
            "Borrar": Borrar
        }

        fetch("/Molinos/AgregarEliminarActualizarCodeArticulos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
                return response.ok ? response.json() : Promise.reject(response)
            })
            .then((jsonData) => {
                //Si la respuesta desde el api es ok
                console.log(jsonData.status)
                if (jsonData.status == 200) {

                    loader.style.display = "none";

                    iziToast.success({
                        position: "topRight",
                        title: `CÓDIGO AGREGADO`,
                        message: `<p>Código agregado correctamente</p>`,
                    });

                    LimpiarForm(); // Limpiar los formularios
                    recargarPagina();
                } else {
                    console.log("Error desde el api, no se establecio la comunicacion o devolvio un error, motivo: ", jsonData.data)
                    iziToast.error({
                        position: "topRight",
                        title: `CÓDIGO NO AGREGADO`,
                        message: `<p>Motivo: ${jsonData.data}</p>`,
                    });
                    loader.style.display = "none";
                }

            })
            //capturamos el error que retorno el controler
            .catch((error) => {
                console.error("Error en el controler interno:", error);
                iziToast.error({
                    position: "topRight",
                    title: `CÓDIGO NO AGREGADO`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    }

    function ObtenerFamiliasExistentes() {
        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "Accion": 1, //indicamos que estamos obteniendo las familias al prcedure (1-Obtener, 2-Agregrar, 3-Borrar, 4-Actualizar)
            "Familia": "SinFamilia", //solo llenamos el campo para el procedure, no se ocupa para esta consulta
            "Id": 0 //solo llenamos el campo para el procedure, no se ocupa para esta consulta
        }

        fetch("/Molinos/CRUDFamiliasMolinos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            // revisamos que los datos devueltos sean válidos
            //console.log(jsonData);

            //verificamos si el api devolvio algun error
            if (jsonData.status == 200) {
                let DataJson = JSON.parse(jsonData.data)
                datosFamilias = DataJson.datosFamilias

                //Actualizar los select con las familias obtenidas
                ActualizarSelectFamilias(datosFamilias);

                //Dibujamos la tabla de motivos de paro
                for (x = 0; x < datosFamilias.length; x++) {
                    // Creamos el ícono/botón para editar
                    let IconEdit = `<i class="fa fa-pencil IconEdit" idensql = "${datosFamilias[x].id}"
                        familia = "${datosFamilias[x].familia}"></i>`;

                    //Creamos el icono para borrar el registro
                    let TrashIcon = `<i class="bi bi-trash-fill IconTrash" idensqltrash = "${datosFamilias[x].id}"></i>`;

                    rowsTablaFamilias.push([
                        datosFamilias[x].familia,
                        IconEdit,
                        TrashIcon
                    ])
                }
                //Dibujamos la tabla con los datos
                tableFamilias.rows.add(rowsTablaFamilias).draw();

                //limpiamos los rows para que esten listos para la siguiente consulta
                rowsTablaFamilias = [];

                //Si no existen registros mostramos el mensaje
                if (datosFamilias.length == 0) {
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ENCONTRARON FAMILIAS`,
                        message: `<p>No existen familias</p>`,
                    });
                }
                //Si el api devolvio un error, lo mostramos
            } else {
                console.log("Error desde el api, no se establecio la comunicacion o devolvio un error Funcion: ObtenerMotivosParo, motivo: ", jsonData.data)
                iziToast.error({
                    position: "topRight",
                    title: `NO SE OBTUVIERON LOS DATOS`,
                    message: `<p>Motivo: ${jsonData.data}</p>`,
                });
                loader.style.display = "none";
            }
        }).catch((error) => {
            console.error("Error en la solicitud ObtenerFamiliasExistentes:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
        });
    }

    //Funcion para Agregar, Borra o actualizar en las familias
    function ActionsFamilias(accion, Familia, Id) {
        //la familia puede llevar acentos, asi que lo codificamos (para que pueda viajar por http al servidor)
        const FamiliaCodificado = Familia ? encodeURIComponent(Familia.trim()) : "";
        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "Accion": accion, //indicamos que accion realizaremos (1-Obtener, 2-Agregrar, 3-Borrar, 4-Actualizar)
            "Familia": FamiliaCodificado,
            "Id": Id
        }

        fetch("/Molinos/CRUDFamiliasMolinos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            // revisamos que los datos devueltos sean válidos
            //console.log(jsonData);

            //verificamos si el api devolvio algun error
            if (jsonData.status == 200) {
                let DataJson = JSON.parse(jsonData.data)
                datosFamilias = DataJson.datosFamilias

                //Actualizar los select con las familias obtenidas
                ActualizarSelectFamilias(datosFamilias);

                //Dibujamos la tabla de motivos de paro
                for (x = 0; x < datosFamilias.length; x++) {
                    // Creamos el ícono/botón para editar
                    let IconEdit = `<i class="fa fa-pencil IconEdit" idensql = "${datosFamilias[x].id}"
                        familia = "${datosFamilias[x].familia}"></i>`;

                    //Creamos el icono para borrar el registro
                    let TrashIcon = `<i class="bi bi-trash-fill IconTrash" idensqltrash = "${datosFamilias[x].id}"></i>`;

                    rowsTablaFamilias.push([
                        datosFamilias[x].familia,
                        IconEdit,
                        TrashIcon
                    ])
                }
                //Dibujamos la tabla con los datos
                tableFamilias.rows.add(rowsTablaFamilias).draw();

                //limpiamos los rows para que esten listos para la siguiente consulta
                rowsTablaFamilias = [];

                //Si no existen registros mostramos el mensaje
                if (datosFamilias.length == 0) {
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ENCONTRARON FAMILIAS`,
                        message: `<p>No existen familias</p>`,
                    });
                }
                //mostramos el mensaje de succes
                iziToast.success({
                    position: "topRight",
                    title: `ACCION EXITOSA`,
                    message: `<p>Movimiento realizado correctamente</p>`,
                });
                //Nos aseguramos de limpiar todos los formularios
                LimpiarForm();
                //una vez realizada la accion, volvemos a mostrar el modal con los motivos actuales
                $("#FamiliasArticulosModal").modal('show'); // muestra el modal de lo
                //Si el api devolvio un error, lo mostramos
            } else {
                console.log("Error desde el api, no se establecio la comunicacion o devolvio un error Funcion: ActionsFamilias, motivo: ", jsonData.data)
                iziToast.error({
                    position: "topRight",
                    title: `ACCION NO REALIZADA`,
                    message: `<p>Motivo: ${jsonData.data}</p>`,
                });
                loader.style.display = "none";
            }

        }).catch((error) => {
            console.error("Error en la solicitud ActionsFamilias:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
            loader.style.display = "none";
        });
    }

    //Funcion para obtener los tipos de materiales existentes
    function ObtenerTipoMaterial() { 
        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "Accion": 1, //indicamos que estamos obteniendo las familias al prcedure (1-Obtener, 2-Agregrar, 3-Borrar, 4-Actualizar)
            "Tipo": "SinFamilia", //solo llenamos el campo para el procedure, no se ocupa para esta consulta
            "Proceso": "SinProceso", //solo llenamos el campo para el procedure, no se ocupa para esta consulta
            "Id": 0 //solo llenamos el campo para el procedure, no se ocupa para esta consulta
        }

        fetch("/Molinos/CRUDTiposMaterialMolinos", { //nos quedamos aqui, 
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            // revisamos que los datos devueltos sean válidos
            //console.log(jsonData);

            //verificamos si el api devolvio algun error
            if (jsonData.status == 200) {
                let DataJson = JSON.parse(jsonData.data)
                datosTipoMaterial = DataJson.datosTipoMaterial

                //Actualizar los select con los tipos de material obtenidas
                ActualizarSelectTiposDeMaterial(datosTipoMaterial);

                //Dibujamos la tabla de motivos de paro
                for (x = 0; x < datosTipoMaterial.length; x++) {
                    // Creamos el ícono/botón para editar
                    let IconEdit = `<i class="fa fa-pencil IconEditTipo" idensql = "${datosTipoMaterial[x].id}"
                        tipo = "${datosTipoMaterial[x].tipo}"
                        proceso = "${datosTipoMaterial[x].proceso}"></i>`;

                    //Creamos el icono para borrar el registro
                    let TrashIcon = `<i class="bi bi-trash-fill IconTrashTipo" idensqltrash = "${datosTipoMaterial[x].id}"></i>`;

                    rowsTablaTipoMaterial.push([
                        datosTipoMaterial[x].tipo,
                        datosTipoMaterial[x].proceso,
                        IconEdit,
                        TrashIcon
                    ])
                }
                //Dibujamos la tabla con los datos
                tableTipoMaterial.rows.add(rowsTablaTipoMaterial).draw();

                //limpiamos los rows para que esten listos para la siguiente consulta
                rowsTablaTipoMaterial = [];

                //Si no existen registros mostramos el mensaje
                if (datosTipoMaterial.length == 0) {
                    iziToast.info({
                        position: "topRight",
                        title: `NO SE ENCONTRARON TIPOS DE MATERIALES`,
                        message: `<p>No existen tipos de materiales</p>`,
                    });
                }
                //Si el api devolvio un error, lo mostramos
            } else {
                console.log("Error desde el api, no se establecio la comunicacion o devolvio un error Funcion: ObtenerMotivosParo, motivo: ", jsonData.data)
                iziToast.error({
                    position: "topRight",
                    title: `NO SE OBTUVIERON LOS DATOS`,
                    message: `<p>Motivo: ${jsonData.data}</p>`,
                });
                loader.style.display = "none";
            }
        }).catch((error) => {
            console.error("Error en la solicitud ObtenerFamiliasExistentes:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
        });
    }

    //Funcion para Agregar, Borra o actualizar en las familias
    function ActionsTiposMaterial(accion, Tipo, Proceso, Id) {
        //el tipo de material puede llevar acentos, asi que lo codificamos (para que pueda viajar por http al servidor)
        const TipoCodificado = Tipo ? encodeURIComponent(Tipo.trim()) : "";
        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "Accion": accion, //indicamos que accion realizaremos (1-Obtener, 2-Agregrar, 3-Borrar, 4-Actualizar)
            "Tipo": TipoCodificado,
            "Proceso": Proceso,
            "Id": Id
        }

        fetch("/Molinos/CRUDTiposMaterialMolinos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            // revisamos que los datos devueltos sean válidos
            //console.log(jsonData);

            //verificamos si el api devolvio algun error
            if (jsonData.status == 200) {
                let DataJson = JSON.parse(jsonData.data);
                datosTipoMaterial = DataJson.datosTipoMaterial;

                //si estamos seleccionando agregar o actualizar articulo/codigo, actualizamos la lista de los tipos de material existentes en los select correspondientes
                if (accion == 5) {
                    ActualizarSelectTiposDeMaterial(datosTipoMaterial);
                    return;
                }

                //Dibujamos la tabla de motivos
                for (x = 0; x < datosTipoMaterial.length; x++) {
                    // Creamos el ícono/botón para editar
                    let IconEdit = `<i class="fa fa-pencil IconEditTipo" idensql = "${datosTipoMaterial[x].id}"
                        tipo = "${datosTipoMaterial[x].tipo}"
                        proceso = "${datosTipoMaterial[x].proceso}"></i>`;

                    //Creamos el icono para borrar el registro
                    let TrashIcon = `<i class="bi bi-trash-fill IconTrashTipo" idensqltrash = "${datosTipoMaterial[x].id}"></i>`;

                    rowsTablaTipoMaterial.push([
                        datosTipoMaterial[x].tipo,
                        datosTipoMaterial[x].proceso,
                        IconEdit,
                        TrashIcon
                    ]);
                }
                console.log(rowsTablaTipoMaterial)
                //Dibujamos la tabla con los datos
                tableTipoMaterial.rows.add(rowsTablaTipoMaterial).draw();

                //limpiamos los rows para que esten listos para la siguiente consulta
                rowsTablaTipoMaterial = [];

                //Si no existen registros mostramos el mensaje
                if (datosTipoMaterial.length == 0) {
                    iziToast.info({
                        position: "topRight",
                        title: `NO SE ENCONTRARON TIPOS DE MATERIALES`,
                        message: `<p>No existen tipos de materiales</p>`,
                    });
                }
                //mostramos el mensaje de succes
                iziToast.success({
                    position: "topRight",
                    title: `ACCION EXITOSA`,
                    message: `<p>Movimiento realizado correctamente</p>`,
                });
                //Nos aseguramos de limpiar todos los formularios
                LimpiarForm();
                //una vez realizada la accion, volvemos a mostrar el modal con los motivos actuales
                $("#TiposMaterialArticulosModal").modal('show'); // muestra el modal de lo
                //Si el api devolvio un error, lo mostramos
            } else {
                console.log("Error desde el api, no se establecio la comunicacion o devolvio un error Funcion: ActionsTiposMaterial, motivo: ", jsonData.data)
                iziToast.error({
                    position: "topRight",
                    title: `ACCION NO REALIZADA`,
                    message: `<p>Motivo: ${jsonData.data}</p>`,
                });
                loader.style.display = "none";
            }

        }).catch((error) => {
            console.error("Error en la solicitud ActionsFamilias:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
            loader.style.display = "none";
        });
    }


    //----FUNCIONES AUXILIARES:
    //limpiamos los formularios
    function LimpiarForm() {
        //modal agregar
        $('#inputCodeUpdate').val("");
        $('#selectInputProcessCodeMolino').val("0");
        $('#inputDescripcionCode').val("");
        //modal eliminar
        $('#inputCodigoRemovedatamaster').val("");
        //modal Edicion
        $('#selectInputProcessCodeMolinoUpdate').val("");
        $('#selectInputProcessCodeMolinoUpdate').val("0");
        $('#inputTipoUpdate').val("0");
        $('#inputFamiliaUpdate').val("0");
        $('#inputDescripcionCodeUpdate').val("");
        //Modal agregar familia
        $('#inputFamiliaAdd').val("");
        // Modal editar familia
        $('#inputFamiliaEdit').val("");
        //Modal agregar Tipo de material
        $('#inputTiposMaterialAdd').val("");
        $('#selectInputProcessTipoMAterialAdd').val("Salida");
        // Modal editar Tipo de material
        $('#inputTiposMateriaEdit').val("");
        $('#selectInputProcessTipoMAterialUpdate').val("");
    }

    //recargamos la tabla
    function recargarPagina() {
        //Limpiamos las tablas para asegurarnos de que no tenga registros pasados
        tableArticulos.clear().draw
        $('.modal').modal('hide'); //cerramos cualquier modal abierto
        ObtenerDatosArticulos(planta);// realizamos de nuevo la consulta para actualizar la tabla
    }

    // Función para actualizar los selectAgregar con las familias
    function ActualizarSelectFamilias(familias) {
        const selects = document.querySelectorAll('#inputFamilia, #inputFamiliaUpdate');

        selects.forEach(select => {
            // Limpiar opciones anteriores
            while (select.options.length > 1) select.remove(1);

            // Agregar nuevas opciones
            familias.forEach(familia => {
                select.add(new Option(familia.familia, familia.familia));
            });
        });
    }
    // Función para actualizar los selectAgregar en los tipos de material
    function ActualizarSelectTiposDeMaterial(TiposDeMateriales) {
        const selects = document.querySelectorAll('#inputTipo, #inputTipoUpdate');

        selects.forEach(select => {
            // Limpiar opciones anteriores
            while (select.options.length > 1) select.remove(1);

            // Agregar nuevas opciones
            TiposDeMateriales.forEach(TiposDeMaterial => {
                select.add(new Option(TiposDeMaterial.tipo, TiposDeMaterial.tipo));
            });
        });
    }

    // Función para actualizar las listas de los select de tipo de material
    function UpdateTipoMaterialListe(Valor) {
        if (Valor === 'Entrada' || Valor === 'Salida') {
            let accionSrch = 5;
            let tiporSrh = "Any";
            let ProcesoSrch = Valor; // Usamos el valor seleccionado
            let IdSrch = "0";
            ActionsTiposMaterial(accionSrch, tiporSrh, ProcesoSrch, IdSrch);
        }
    }


    //aqui estan todas las acciones de los botones
    function ButonsActions() {
        // Btn Agregar, Mostramos el modal de agregar codigo
        $(document).on("click", "#AddCodeArticulosMolinos", function () {

            // Función para habilitar/deshabilitar el select de Tipo (en caso de que no seleccionen un Proceso)
            function DesactivarInputTipo() {
                if ($("#selectInputProcessCodeMolino").val() == '0') {
                    $("#inputTipo").prop("disabled", true);
                } else {
                    $("#inputTipo").prop("disabled", false);
                }
            }

            // Ejecutar al cambiar el select
            $("#selectInputProcessCodeMolino").change(DesactivarInputTipo);

            // Ejecutar al abrir el modal (para aplicar el estado inicial)
            DesactivarInputTipo();

            $("#agregarCodigoModal").modal('show'); // Muestra el modal

        });

        // Btn Eliminar, Mostramos el modal de eliminar codigo
        $(document).on("click", "#RemoveCodeArticulosMolinos", function () {
            $("#EliminarCodigoModal").modal('show'); // Muestra el modal
        });

        //Btn Agregar (dentro del modal Agregar) Agrega el codigo a la BD
        $(document).on("click", "#AgregarCodigoNuevo", function () {

            //obtenemos los datos a enviar
            let Borrar = 0; //indicamos al procedure que no se borra, sino que se agrega el codigo
            let codigonew = $('#inputCode').val();
            let processnew = $('#selectInputProcessCodeMolino').val();
            let Tiponew = $('#inputTipo').val();
            let Familianew = $('#inputFamilia').val();
            let descripcionnew = $('#inputDescripcionCode').val();
            //obtenemos la actual fecha con el formato correcto
            let FechaActual = new Date();
            FechaActual.setHours(FechaActual.getHours() - 6); // Ajuste de zona horaria
            let fechacreacion = FechaActual.toISOString().slice(0, 19).replace('T', ' ');
            //comprobamos que los campos no esten vacios
            if (codigonew == "" || processnew == "0" || descripcionnew == "" || Tiponew == "0" || Familianew == "0") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACÍOS`,
                    message: `<p>Favor de llenar todos los campos</p>`,
                });
                return;
            }

            // Verificar si el código ya existe en `tableArticulos`
            let codigoExistente = false;
            tableArticulos.column(0).data().each(function (value) {
                if (value === codigonew) {
                    codigoExistente = true;
                    return false; // Detiene el loop
                }
            });

            if (codigoExistente) {
                iziToast.error({
                    position: "topRight",
                    title: `CÓDIGO YA EXISTE`,
                    message: `<p>El código ya está registrado</p>`,
                });
            } else {
                //agregamos el códigosi no está en la tabla
                AgregarEliminarActualizarCodeArticulos(codigonew, processnew, planta, descripcionnew, fechacreacion, Tiponew, Familianew, Borrar);
            }
        });

        //Btn Eliminar (dentro del modal Eliminar) elimina el codigo a la BD
        $(document).on("click", "#EliminarCodebtnfinish", function () {

            //obtenemos los datos a enviar, enviamos las variables que no usaremos en "any", solo para que las reciba el procedure, pero no se usaran en el caso de borrar
            let Borrar = 1; //indicamos al procedure que no se borra, sino que se agrega el codigo
            let codigodelete = $('#inputCodigoRemovedatamaster').val();
            let processnew = "any";
            let descripcionnew = "any";
            let Tiponew = "Any";
            let Familianew = "any";
            //obtenemos la actual fecha con el formato correcto
            let FechaActual = new Date();
            FechaActual.setHours(FechaActual.getHours() - 6); // Ajuste de zona horaria
            let fechacreacion = FechaActual.toISOString().slice(0, 19).replace('T', ' ');
            //comprobamos que los campos no esten vacios
            if (codigodelete == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACÍOS`,
                    message: `<p>Favor de llenar todos los campos</p>`,
                });
                return;
            }

            // Verificamos que el código exista (lo verificamos en la tabla que contiene todos los registros)
            let codigoNoExiste = true; // Asumimos que el código no existe
            $("#TablaArticulos tbody tr").each(function () {
                let codigoExistente = $(this).find("td:first").text().trim(); // Obtenemos el valor de la primera columna (código)
                if (codigoExistente === codigodelete.trim()) { // Comprobamos si el código coincide
                    codigoNoExiste = false; // El código sí existe
                    return false; // Salimos del bucle
                }
            });

            if (codigoNoExiste) {
                iziToast.error({
                    position: "topRight",
                    title: `CÓDIGO INVÁLIDO`,
                    message: `<p>Ingrese un código que esté registrado</p>`,
                });
                return;
            }

            // Si el código existe, procedemos a realizar la operación
            AgregarEliminarActualizarCodeArticulos(codigodelete, processnew, planta, descripcionnew, fechacreacion, Tiponew, Familianew, Borrar);
        });

        // Cerrar el modal, limpiamos los campos
        $(document).on("click", ".cerrarModal", function () {
            LimpiarForm();
        });

        //si hacemos click fuera de los modals, nos aseguramos de cerrarlos y limpiarlos
        $(document).on("click", function (event) {
            // Buscamos cualquier modal que esté visible
            $(".modal:visible").each(function () {
                if (!$(event.target).closest(".modal-content").length) {
                    $(this).modal("hide"); // Cierramos el modal visible
                    LimpiarForm();
                }
            });
        });

        //abrimos el modal de edicion al hacer clic en los iconos de "iconoEditArticulos"
        $(document).on("click", ".iconoEditArticulos", function () {
            // Obtener los valores de los atributos data-*
            let CodigoEdit = $(this).data("codigo");
            //let ProcesoEdit = $(this).data("proceso");
            //let TipoEdit = $(this).data("tipo");
            let FamiliaEdit = $(this).data("familia");
            let DescripcionEdit = $(this).data("descripcion");

            // Agregar los valores al modal antes de mostrarlo
            $("#inputCodeUpdate").val(CodigoEdit);
            $("#selectInputProcessCodeMolinoUpdate").val(0);
            $("#inputTipoUpdate").val(0);
            $("#inputFamiliaUpdate").val(FamiliaEdit);
            $("#inputDescripcionCodeUpdate").val(DescripcionEdit);

            // Función para habilitar/deshabilitar el select de Tipo (en caso de que no seleccionen un Proceso)
            function DesactivarInputTipo() {
                if ($("#selectInputProcessCodeMolinoUpdate").val() === '0') {
                    $("#inputTipoUpdate").prop("disabled", true);
                } else {
                    $("#inputTipoUpdate").prop("disabled", false);
                }
            }

            // Ejecutar al cambiar el select
            $("#selectInputProcessCodeMolinoUpdate").change(DesactivarInputTipo);

            // Ejecutar al abrir el modal (para aplicar el estado inicial)
            DesactivarInputTipo();

            // Mostrar el modal
            $("#UpdateCodigoModal").modal("show");
        });

        //Btn Actualizar dentro del modal "Actualizar Codigo"
        $(document).on("click", "#UpdateCodebtnfinish", function () {
            // Obtener los valores a enviar para axtualizar
            let Borrar = 2; //la mandamos en 2 para indicar al procedure que sera un update
            let CodigoSendUpdate = $("#inputCodeUpdate").val();
            let ProcesoSendUpdate = $("#selectInputProcessCodeMolinoUpdate").val();
            let TipoSendUpdate = $("#inputTipoUpdate").val();
            let FamiliaSendUpdate = $("#inputFamiliaUpdate").val();
            let DescripcionSendUpdate = $("#inputDescripcionCodeUpdate").val();
            //obtenemos la actual fecha con el formato correcto
            let FechaActual = new Date();
            FechaActual.setHours(FechaActual.getHours() - 6); // Ajuste de zona horaria
            let fechacreacion = FechaActual.toISOString().slice(0, 19).replace('T', ' ');

            //verificamos que los campos necesarios no esten vacios o sin seleccionar
            if (ProcesoSendUpdate == "0" || TipoSendUpdate == "0" || FamiliaSendUpdate == "0" || DescripcionSendUpdate == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACÍOS`,
                    message: `<p>Favor de llenar todos los campos</p>`,
                });
                return;
            }

            AgregarEliminarActualizarCodeArticulos(CodigoSendUpdate, ProcesoSendUpdate, planta, DescripcionSendUpdate, fechacreacion, TipoSendUpdate, FamiliaSendUpdate, Borrar)
        });

        //Btn Familias (mostrar modal)
        $(document).on("click", "#BtnModalFamilias", function () {
            //Limpiamos la tabla de registros pasados
            tableFamilias.clear().draw;
            //obtenemos los motivos de paro y llenamos la tabla antes de mostrar el modal
            ObtenerFamiliasExistentes();

            $("#FamiliasArticulosModal").modal('show'); // Muestra el modal
        });

        //Btn Agregar (Dentro de modal Familias) (mostrar modal agregar Familias)
        $(document).on("click", "#AgregegarFamiliaModal", function () {

            $("#FamiliasArticulosModal").modal('hide'); // oculta el modal de las familias
            $("#AddFamiliaModal").modal('show'); // muestra el modal de agregar familias
        });

        //Btn Agregar (Dentro de Agregar Familias) (añade una nueva familia)
        $(document).on("click", "#AgregegarFamiliaBtnFinal", function () {
            //Obtenemos los datos a enviar
            let AccionAdd = 2;
            let FamiliaAdd = $("#inputFamiliaAdd").val();
            let IdAdd = 0; //solo llenamos el campo para el procedure, no se ocupa para esta consulta

            //Nos aseguramos de que el input no este vacio
            if (FamiliaAdd == "") {
                iziToast.info({
                    position: "topRight",
                    title: `CAMPO VACIO`,
                    message: `<p>Favor de ingresar una familia</p>`,
                });
                return;
            } else {
                //Ocultamos el modal de agregar familia
                $("#AddFamiliaModal").modal('hide'); // oculta el modal de agregar motivo
                //Limpiamos la tabla para volver a generarla despues con la nueva familia agregada
                tableFamilias.clear().draw;
                //Enviamos los datos para agregar el nuevo motivo
                ActionsFamilias(AccionAdd, FamiliaAdd, IdAdd)
            }
        });

        //abrimos el modal de edicion de las familias al hacer clic en los iconos de "IconEdit"
        $(document).on("click", ".IconEdit", function () {
            // Obtener los valores de los atributos
            let IdEditAtr = $(this).attr("idensql");
            let FamiliaEditAtr = $(this).attr("familia");

            // Agregar los valores al input del modal antes de mostrarlo            
            $("#inputFamiliaEdit").val(FamiliaEditAtr);
            $("#inputFamiliaEdit").attr("idsqledit", IdEditAtr); //asignamos el id como atributo, esto lo usaremos para extraerlo al momento de actualizar y poder saber que id es el que se actualizara

            //Ocultamos el modal de "Familias"
            $("#FamiliasArticulosModal").modal('hide');
            // Mostrar el modal "Editar Familias"
            $("#UpdateFamiliaModal").modal("show");
        });

        //Btn Actualizar Familia
        $(document).on("click", "#ActualizarFamiliaBtn", function () {
            // Obtener los valores a enviar
            let AccionEdit = 4
            let IdEdit = $("#inputFamiliaEdit").attr("idsqledit");
            let FamiliaEdit = $("#inputFamiliaEdit").val();
            //Nos aseguramos de que el campo no este vacio
            if (FamiliaEdit == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPO VACIO`,
                    message: `<p>Favor de no dejar campos vacios</p>`,
                });
                return;
            } else {
                // Ocultamos el modal "Editar Motivos de paro"
                $("#UpdateFamiliaModal").modal("hide");
                //Limpiamos la tabla para volver a generarla despues con el nuevo motivo editado
                tableFamilias.clear().draw;
                //Enviamos los datos para agregar el nuevo motivo
                ActionsFamilias(AccionEdit, FamiliaEdit, IdEdit)
            }
        });

        //Btn Borrar Familia (icontrash)
        $(document).on("click", ".IconTrash", function () {
            // Obtener El id a borrar y los valores a enviar
            let AccionDelete = 3;
            let FamiliaDelete = "Any"; //No se ocupa, solo lo rellenamos para el procedure
            let IdDelete = $(this).attr("idensqltrash");
            //Limpiamos la tabla para volver a generarla despues con el nuevo motivo editado
            tableFamilias.clear().draw;
            //Borramos el regisgtro 
            ActionsFamilias(AccionDelete, FamiliaDelete, IdDelete)
        });

        //Btn Tipo de Material (mostrar modal)
        $(document).on("click", "#BtnModalTipoMaterial", function () {
            //Limpiamos la tabla de registros pasados
            tableTipoMaterial.clear().draw;
            //obtenemos los motivos de paro y llenamos la tabla antes de mostrar el modal
            ObtenerTipoMaterial();

            $("#TiposMaterialArticulosModal").modal('show'); // Muestra el modal
        });

        //Btn Agregar (Dentro de modal Tipo de Material) (mostrar modal agregar Tipo de Material)
        $(document).on("click", "#AgregegarTiposMaterialModal", function () {

            $("#TiposMaterialArticulosModal").modal('hide'); // oculta el modal de las familias
            $("#AddTiposMaterialModal").modal('show'); // muestra el modal de agregar familias
        });

        //Btn Agregar (Dentro de Agregar Tipo de Material) (añade un Tipo de Material)
        $(document).on("click", "#AgregegarTiposMaterialBtnFinal", function () {
            //Obtenemos los datos a enviar
            let AccionAdd = 2;
            let TipoMaterialAdd = $("#inputTiposMaterialAdd").val();
            let ProcesoAdd = $("#selectInputProcessTipoMAterialAdd").val();
            let IdAdd = 0; //solo llenamos el campo para el procedure, no se ocupa para esta consulta

            //Nos aseguramos de que el input no este vacio
            if (TipoMaterialAdd == "") {
                iziToast.info({
                    position: "topRight",
                    title: `CAMPO VACIO`,
                    message: `<p>Favor de ingresar un tipo de material</p>`,
                });
                return;
            } else {
                //Ocultamos el modal de agregar Tipo de material
                $("#AddTiposMaterialModal").modal('hide'); // oculta el modal de agregar motivo
                //Limpiamos la tabla para volver a generarla despues con la nueva familia agregada
                tableTipoMaterial.clear().draw;
                //Enviamos los datos para agregar el nuevo motivo
                ActionsTiposMaterial(AccionAdd, TipoMaterialAdd, ProcesoAdd, IdAdd);
            }
        });

        //abrimos el modal de edicion de los tipos de material al hacer clic en los iconos de "IconEditTipo"
        $(document).on("click", ".IconEditTipo", function () {
            // Obtener los valores de los atributos
            let IdEditAtr = $(this).attr("idensql");
            let TipoEditAtr = $(this).attr("tipo");
            let ProcesoEditAtr = $(this).attr("proceso");

            // Agregar los valores al input del modal antes de mostrarlo            
            $("#inputTiposMateriaEdit").val(TipoEditAtr);
            $("#inputTiposMateriaEdit").attr("idsqledit", IdEditAtr); //asignamos el id como atributo, esto lo usaremos para extraerlo al momento de actualizar y poder saber que id es el que se actualizara
            $("#selectInputProcessTipoMAterialUpdate").val(ProcesoEditAtr);

            //Ocultamos el modal de "Tipos de material"
            $("#TiposMaterialArticulosModal").modal('hide');
            // Mostrar el modal "Editar Tipos de material"
            $("#UpdateTiposMateriaModal").modal("show");
        });

        //Btn Actualizar Tipo de mat3erial
        $(document).on("click", "#ActualizarTiposMateriaBtn", function () {
            // Obtener los valores a enviar
            let AccionEdit = 4
            let IdEdit = $("#inputTiposMateriaEdit").attr("idsqledit");
            let TipodeMAterialEdit = $("#inputTiposMateriaEdit").val();
            let ProcesoEdit = $("#selectInputProcessTipoMAterialUpdate").val();

            //Nos aseguramos de que el campo no este vacio
            if (TipodeMAterialEdit == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPO VACIO`,
                    message: `<p>Favor de no dejar campos vacios</p>`,
                });
                return;
            } else {
                // Ocultamos el modal "Editar Motivos de paro"
                $("#UpdateTiposMateriaModal").modal("hide");
                //Limpiamos la tabla para volver a generarla despues
                tableTipoMaterial.clear().draw;
                //Enviamos los datos para agregar el nuevo tipo de material
                ActionsTiposMaterial(AccionEdit, TipodeMAterialEdit, ProcesoEdit, IdEdit)
            }
        });

        //Btn Borrar Tipo de material (IconTrashTipo)
        $(document).on("click", ".IconTrashTipo", function () {
            // Obtener El id a borrar y los valores a enviar
            let AccionDelete = 3;
            let TipoDelete = "Any"; //No se ocupa, solo lo rellenamos para el procedure
            let IdDelete = $(this).attr("idensqltrash");
            let ProcesoDelete = "Any"; //No se ocupa, solo lo rellenamos para el procedure

            //Limpiamos la tabla para volver a generarla despues con el nuevo motivo editado
            tableTipoMaterial.clear().draw;
            //Borramos el regisgtro 
            ActionsTiposMaterial(AccionDelete, TipoDelete, ProcesoDelete, IdDelete);
        });

    }

    //----ACTIONS:
    ButonsActions();

    //Revisamos que estatus de proceso se selecciono (al agregar o editar un codigo/articulo) para asignar los tipos de material correspondientes
    $("#selectInputProcessCodeMolino").change(function () {
        UpdateTipoMaterialListe($(this).val());
    });

    $("#selectInputProcessCodeMolinoUpdate").change(function () {
        UpdateTipoMaterialListe($(this).val());
    });
});