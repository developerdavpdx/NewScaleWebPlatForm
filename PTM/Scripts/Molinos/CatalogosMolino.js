const loader = document.getElementById('loaderDiv');

let planta;
let numMolinos = []; //aqui guardamos los molinos existentes
let numMolinosMax = 0; //aqui guardamos el numero maximo de molinos existentes
let rowsTablaMotivosparo = []; //Aqui guardamos los Motivos que mostraremos en la tabla
let tableMotivosParo; //Aqui inicalizamos nuestra tabla de motivos

$(function () {
    //inicializamos la tabla de motivos Paro
    tableMotivosParo = $("#TablaMotivosParo").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: true,
    });
    //obtenemos la planta
    localStorage.planta == '335' ? planta = '2' : planta = '1';
    //console.log(planta);

    ObtenerNumeroMolinos(planta);

    //obtenemos el numero de molinos junto con sus datos para crear los botones dinamicos
    function ObtenerNumeroMolinos(planta) {
        loader.style.display = "flex";

        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
        }
        fetch("/Molinos/ObtenerNumeroMolinos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
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
                let DataJson = JSON.parse(jsonData.data)
                datosMolinos = DataJson.datosMolinos
                numMolinosMax = datosMolinos.length
                for (x = 0; x < datosMolinos.length; x++) {
                    //Asignamos los valores para añadirlos a los botones creados
                    let NumeroMolino = datosMolinos[x].numeroMolino;
                    let Proceso = datosMolinos[x].proceso;
                    let Nombre = datosMolinos[x].nombre;
                    let HorasTurno = datosMolinos[x].horasTurno;
                    let Eficiencia = datosMolinos[x].eficiencia;
                    let ObjetivoProd = datosMolinos[x].objetivoProduccion;
                    //asignamos los numeros de molinos existentes (nos servira para evitar que el usuario intente eliminar un molino que no exista)
                    numMolinos.push(NumeroMolino);
                    //creamos los botones
                    $("#buttonSectionMolinos").append(`
                        <button class="btn btnAsignada btnMolinoModal" idProcess="${Proceso}" idHorasTurno="${HorasTurno}" idEficiencia="${Eficiencia}" idObjetivoProd="${ObjetivoProd}"
                        idNumMolino="${NumeroMolino}"
                        id="btn-molino-${NumeroMolino}">
                        <b>
                            ${Proceso}, Equipo No. ${NumeroMolino} <br />
                            ${Nombre} <br />
                        </b>
                        <p style="font-size: 1.5rem">
                            Horas por Turno ${HorasTurno} | Eficiencia Obj. ${Eficiencia}
                        </p>
                        </button>
                    `)
                }
                //console.log(numMolinos);
                loader.style.display = "none";
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ENCONTRARON MOLINOS`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    }

    //agrega o borra un molino dependiendo del boton usado
    function AgregarBorrarMolino(numMolino, NombreMolino, HorasTurnoMolino, EficienciaMolino, borrar, ObjetivoProd, ProcessProdMolino) {

        loader.style.display = "flex";

        //armamos los datos que enviaremos al controler
        let data = {
            "NumeroMolino": numMolino,
            "Proceso": ProcessProdMolino, //<<--
            "HorasxTurno": HorasTurnoMolino,
            "Eficiencia": EficienciaMolino,
            "Borrar": borrar,
            "Planta": planta,
            "ObjetivoProduccion": ObjetivoProd,
            "Nombre": NombreMolino//<<--
        }

        fetch("/Molinos/AgregarQuitarMolino", {
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
                        title: `COMPLETADO CORRECTAMENTE`,
                        message: `<p>Movimiento realizado correctamente</p>`,
                    });

                    LimpiarFormularios(); // Limpiar los formularios
                    recargarPagina();
                } else {
                    console.log("Error desde el api, no se establecio la comunicacion o devolvio un error, FUNCION: AgregarBorrarMolino motivo: ", jsonData.data)
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ACTUALIZO EL MOLINO`,
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
                    title: `NO SE ACTUALIZO EL MOLINO`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    }

    //Actualiza los datos de cada molino
    function ActualizarDatosMolino(numMolino, EficienciaMolino, HorasMolino, ObjtProdMolino) {
        loader.style.display = "flex";

        //armamos los datos que enviaremos al controler
        let data = {
            "NumeroMolino": numMolino,
            "Eficiencia": EficienciaMolino,
            "HorasxTurno": HorasMolino,
            "Planta": planta,
            "ObjetivoProduccion": ObjtProdMolino,
        }

        fetch("/Molinos/ActualizarMolino", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
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
                loader.style.display = "none";

                iziToast.success({
                    position: "topRight",
                    title: `ACTUALIZADO CORRECTAMENTE`,
                    message: `<p>El molino fue actualizado</p>`,
                });

                LimpiarFormularios(); // Limpiar los formularios
                recargarPagina();
            })
            //capturamos el error que retorno el controler
            .catch((error) => {
                console.error("Error en la solicitud:", error);
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ACTUALIZO EL MOLINO`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    }

    //Funcion para obtener de la tabla los motivos de paro existentes
    function ObtenerMotivosParo() {
        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "Accion": 1, //indicamos que estamos obteniendo los motivos de paro al prcedure (1-Obtener, 2-Agregrar, 3-Borrar, 4-Actualizar)
            "Motivo": "SinMotivo", //solo llenamos el campo para el procedure, no se ocupa para esta consulta
            "Id": 0 //solo llenamos el campo para el procedure, no se ocupa para esta consulta
        }

        fetch("/Molinos/CRUDMotivosDeParoMolinos", {
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
                datosMotivosParo = DataJson.datosMotivosParo

                //Dibujamos la tabla de motivos de paro
                for (x = 0; x < datosMotivosParo.length; x++) {
                    // Creamos el ícono/botón para editar
                    let IconComentarios = `<i class="fa fa-pencil IconEdit" idensql = "${datosMotivosParo[x].id}"
                        motivosparo = "${datosMotivosParo[x].motivoParo}"></i>`;

                    //Creamos el icono para borrar el registro
                    let TrashIcon = `<i class="bi bi-trash-fill IconTrash" idensqltash = "${datosMotivosParo[x].id}"></i>`;

                    rowsTablaMotivosparo.push([
                        datosMotivosParo[x].motivoParo,
                        IconComentarios,
                        TrashIcon
                    ])
                }
                //Dibujamos la tabla con los datos
                tableMotivosParo.rows.add(rowsTablaMotivosparo).draw();

                //limpiamos los rows para que esten listos para la siguiente consulta
                rowsTablaMotivosparo = [];

                //Si no existen registros mostramos el mensaje
                if (datosMotivosParo.length == 0) {
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ENCONTRARON MOTIVOS DE PARO`,
                        message: `<p>No existen motivos de paro</p>`,
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
            console.error("Error en la solicitud ObtenerMotivosParo:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
        });
    }

    //Funcion para Agregar, Borra o actualizar en los motivos de paro
    function ActionsMotivosParo(accion, Motivo, Id) {
        //el Motivo puede llevar acentos, asi que lo codificamos (para que pueda viajar por http al servidor)
        const MotivoCodificado = Motivo ? encodeURIComponent(Motivo.trim()) : "";
        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "Accion": accion, //indicamos que accion realizaremos (1-Obtener, 2-Agregrar, 3-Borrar, 4-Actualizar)
            "Motivo": MotivoCodificado,
            "Id": Id
        }

        fetch("/Molinos/CRUDMotivosDeParoMolinos", {
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
                datosMotivosParo = DataJson.datosMotivosParo

                //Dibujamos la tabla de motivos de paro
                for (x = 0; x < datosMotivosParo.length; x++) {
                    // Creamos el ícono/botón para editar
                    let IconComentarios = `<i class="fa fa-pencil IconEdit" idensql = "${datosMotivosParo[x].id}"
                        motivosparo = "${datosMotivosParo[x].motivoParo}"></i>`;

                    //Creamos el icono para borrar el registro
                    let TrashIcon = `<i class="bi bi-trash-fill IconTrash" idensqltash = "${datosMotivosParo[x].id}"></i>`;

                    rowsTablaMotivosparo.push([
                        datosMotivosParo[x].motivoParo,
                        IconComentarios,
                        TrashIcon
                    ])
                }
                //Dibujamos la tabla con los datos
                tableMotivosParo.rows.add(rowsTablaMotivosparo).draw();

                //limpiamos los rows para que esten listos para la siguiente consulta
                rowsTablaMotivosparo = [];

                //Si no existen registros mostramos el mensaje
                if (datosMotivosParo.length == 0) {
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ENCONTRARON MOTIVOS DE PARO`,
                        message: `<p>No existen motivos de paro</p>`,
                    });
                }
                //mostramos el mensaje de succes
                iziToast.success({
                    position: "topRight",
                    title: `ACCION EXITOSA`,
                    message: `<p>Movimiento realizado correctamente</p>`,
                });
                //Nos aseguramos de limpiar todos los formularios
                LimpiarFormularios();
                //una vez realizada la accion, volvemos a mostrar el modal con los motivos actuales
                $("#MotivosPAroModal").modal('show'); // muestra el modal de los motivos
                //Si el api devolvio un error, lo mostramos
            } else {
                console.log("Error desde el api, no se establecio la comunicacion o devolvio un error Funcion: ActionsMotivosParo, motivo: ", jsonData.data)
                iziToast.error({
                    position: "topRight",
                    title: `AACION NO REALIZADA`,
                    message: `<p>Motivo: ${jsonData.data}</p>`,
                });
                loader.style.display = "none";
            }

        }).catch((error) => {
            console.error("Error en la solicitud ActionsMotivosParo:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ENCONTRARON DATOS`,
                message: `<p>Motivo: ${error}</p>`,
            });
            loader.style.display = "none";
        });
    }

    //FUNCIONES AUXILIARES
    //limpiamos todos los formularios
    function LimpiarFormularios() {
        //formulario Agregar
        $(inputNumMolino).val("");
        $(selectInputNombreMolino).val("");
        $(inputHorasTurnoMolino).val("");
        $(inputEficienciaObjMolino).val("");
        $(inputObjetivoProd).val("");
        $(selectInputProcessMolino).val("Molino");
        //formulario borrar
        $(inputNumMolinoBorrar).val("");
        //formulario Actualizar
        $(inputHorasTurnoObjetivoMolino).val("");
        $(inputEficienciaMolino).val("");
        $(inputObjetivoProdMolino).val("");
        //Formulario Agregar Motivo de paro
        $(inputMotivoDeParo).val("");


    }

    function recargarPagina() {
        // Recargar la página después de 3 segundos para visualizar los cambios
        setTimeout(() => {
            location.reload();
        }, 3000); //3 segundos
    }

    function EvitarLetras(e) {
        var charCode = e.which ? e.which : e.keyCode;
        if (charCode < 48 || charCode > 57) {
            e.preventDefault();
        }
    }

    //aqui estan todas las reglas de restricciones para los input
    function RestriccionesEnInputs() {
        //MODAL OBJETIVOS
        $('#inputHorasTurnoObjetivoMolino, #inputEficienciaMolino, #inputObjetivoProdMolino')
            .on('keypress', function (e) {
                // Permitir solo números
                EvitarLetras(e)
            });
        $('#inputHorasTurnoObjetivoMolino').on('input', function () {
            // Limitar el valor a 12
            var value = parseInt($(this).val());
            if (value > 12) {
                $(this).val(12);
            }
        });

        //MODAL AGREGAR MOLINO
        $('#inputObjetivoProd, #inputHorasTurnoMolino, #inputEficienciaObjMolino')
            .on('keypress', function (e) {
                // Permitir solo números
                EvitarLetras(e)
            });
        $('#inputHorasTurnoMolino').on('input', function () {
            // Limitar el valor a 12
            var value = parseInt($(this).val());
            if (value > 12) {
                $(this).val(12);
            }
        });

        //MODAL ELIMINAR MOLINO
        $('#inputNumMolinoBorrar')
            .on('keypress', function (e) {
                // Permitir solo números
                EvitarLetras(e)
            });
        $('#inputNumMolinoBorrar').on('input', function () {
            // Obtenemos el valor ingresado
            var value = $(this).val();

            // Eliminamos cualquier valor que no sea un número en la matriz numMolinos
            if (!numMolinos.includes(parseInt(value))) {
                $(this).val(''); // Borra el valor si no es válido
            }
        });

    }

    //Aqui estan todos los botones junto con sus acciones
    function ButonActions() {
        //Btn Agregar Molino
        $(document).on("click", "#BtnAgregaMolino", function () {
            //asignamos el valor del ultimo molino mas 1
            $("#inputNumMolino").val(numMolinosMax + 1);
            $("#agregarMolinoModal").modal('show'); // Muestra el modal
        });

        //Btn Eliminar Molino (Mostrar Modal)
        $(document).on("click", "#BtnEliminarMolino", function () {
            $("#EliminarMolinoModal").modal('show'); // Muestra el modal
        });

        //Btn molinos dinamico (cada molino, mostrar modal)
        $(document).on('click', '.btnMolinoModal', function () {
            // Obtenemos los valores que asignaremos al modal
            const NumMolinoModal = $(this).attr('idNumMolino');
            const EficienciaModal = $(this).attr('idEficiencia');
            const HorasTurnoModal = $(this).attr('idHorasTurno');
            const ObjProdModal = $(this).attr('idObjetivoProd');

            // Asignamos los valores en el modal
            $('#MolinoTituloModal').text(NumMolinoModal);
            $('#inputEficienciaMolino').val(EficienciaModal);
            $('#inputHorasTurnoObjetivoMolino').val(HorasTurnoModal);
            $('#inputObjetivoProdMolino').val(ObjProdModal);

            // Mostrar el modal
            $('#ActualizarObjetivosMolinoModal').modal('show');
        });

        //Btn Agregar Molino (dentro del modal)
        $(document).on("click", "#AgregarMolinoNuevo", function () {
            //obtenemos los datos a enviar
            let numMolino = $(inputNumMolino).val();
            let NombreMolino = $(selectInputNombreMolino).val();
            let HorasTurnoMolino = $(inputHorasTurnoMolino).val();
            let EficienciaMolino = $(inputEficienciaObjMolino).val();
            let ObjetivoProdMolino = $(inputObjetivoProd).val();
            let ProcessProdMolino = $(selectInputProcessMolino).val();
            //seleccionamos "borrar" en 0, para indcar al procedure que no se borrara
            let borrar = 0;
            //verificamos que los datos no esten vacios
            if (HorasTurnoMolino == "" || NombreMolino == "" || EficienciaMolino == "" || ObjetivoProdMolino == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACÍOS`,
                    message: `<p>Favor de llenar todos los campos</p>`,
                });
            } else {
                AgregarBorrarMolino(numMolino, NombreMolino, HorasTurnoMolino, EficienciaMolino, borrar, ObjetivoProdMolino, ProcessProdMolino);
            }
        });

        //Btn Eliminar Molino (dentro del modal)
        $(document).on("click", "#BtnBorrarMolino", function () {
            //obtenemos los datos a enviar
            let numMolino = $(inputNumMolinoBorrar).val();
            let NombreMolino = 0;
            let HorasTurnoMolino = 0;
            let EficienciaMolino = 0;
            let ObjetivoProdMolino = 0;
            let ProcessProdMolino = 0;
            //seleccionamos "borrar" en 1, para indcar al procedure que borrara el molino
            let borrar = 1;
            //verificamos que el proceso no este vacio
            if (numMolino == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACÍOS`,
                    message: `<p>Favor de indicar un número de molino</p>`,
                });
            } else {
                AgregarBorrarMolino(numMolino, NombreMolino, HorasTurnoMolino, EficienciaMolino, borrar, ObjetivoProdMolino, ProcessProdMolino);
            }
        });

        //Btn cerrar modal
        $(document).on("click", ".cerrarModal", function () {
            //limpiamos los formularios
            LimpiarFormularios();
        });

        //Btn Actualizar (dentro del modal de cada molino)
        $(document).on("click", "#BtnActualizarObjetivosModal", function () {
            //obtenemos la info a enviar para actualizar
            let numMolino = $(MolinoTituloModal).text();
            let EficienciaMolino = $(inputEficienciaMolino).val();
            let HorasMolino = $(inputHorasTurnoObjetivoMolino).val();
            let ObjtProdMolino = $(inputObjetivoProdMolino).val();

            ActualizarDatosMolino(numMolino, EficienciaMolino, HorasMolino, ObjtProdMolino);
        });

        //si hacemos click fuera de los modals, nos aseguramos de cerrarlos y limpiarlos
        $(document).on("click", function (event) {
            // Buscamos cualquier modal que esté visible
            $(".modal:visible").each(function () {
                if (!$(event.target).closest(".modal-content").length) {
                    $(this).modal("hide"); // Cierramos el modal visible
                    LimpiarFormularios();
                }
            });
        });

        //Btn Motivos de Paro (mostrar modal)
        $(document).on("click", "#BtnModalMotivosDeParo", function () {
            //Limpiamos la tabla de registros pasados
            tableMotivosParo.clear().draw;
            //obtenemos los motivos de paro y llenamos la tabla antes de mostrar el modal
            ObtenerMotivosParo();

            $("#MotivosPAroModal").modal('show'); // Muestra el modal
        });

        //Btn Agregar (Dentro de Motivos de Paro) (mostrar modal agregar motivo de paro)
        $(document).on("click", "#AgregegarMotivoDeParo", function () {

            $("#MotivosPAroModal").modal('hide'); // oculta el modal de los motivos
            $("#AddMotivosPAroModal").modal('show'); // muestra el modal de agregar motivo
        });

        //Btn Agregar (Dentro de Agregar Motivos de Paro) (añade un uevo motivo de paro)
        $(document).on("click", "#AgregegarMotivoDeParoBtnFinal", function () {
            //Obtenemos los datos a enviar
            let AccionAdd = 2;
            let MotivoAdd = $("#inputMotivoDeParo").val();
            let IdAdd = 0; //solo llenamos el campo para el procedure, no se ocupa para esta consulta

            //Nos aseguramos de que el input no este vacio
            if (MotivoAdd == "") {
                iziToast.info({
                    position: "topRight",
                    title: `CAMPO VACIO`,
                    message: `<p>Favor de ingresar un motivo de paro</p>`,
                });
                return;
            } else {
                //Ocultamos el modal de agregar motivo de paro
                $("#AddMotivosPAroModal").modal('hide'); // oculta el modal de agregar motivo
                //Limpiamos la tabla para volver a generarla despues con el nuevo motivo agregado
                tableMotivosParo.clear().draw;
                //Enviamos los datos para agregar el nuevo motivo
                ActionsMotivosParo(AccionAdd, MotivoAdd, IdAdd)
            }
        });

        //abrimos el modal de edicion del motivo de paro al hacer clic en los iconos de "IconEdit"
        $(document).on("click", ".IconEdit", function () {
            // Obtener los valores de los atributos
            let IdEditAtr = $(this).attr("idensql");
            let MotivoEditAtr = $(this).attr("motivosparo");

            // Agregar los valores al input del modal antes de mostrarlo            
            $("#inputMotivoDeParoEdit").val(MotivoEditAtr);
            $("#inputMotivoDeParoEdit").attr("idsqledit", IdEditAtr); //asignamos el id como atributo, esto lo usaremos para extraerlo al momento de actualizar y poder saber que id es el que se actualizara

            //Ocultamos el modal de "motivos de paro"
            $("#MotivosPAroModal").modal('hide');
            // Mostrar el modal "Editar Motivos de paro"
            $("#UpdateMotivosPAroModal").modal("show");
        });

        //Btn Actualizar Motivo de paro
        $(document).on("click", "#ActualizarMotivoPAroBtn", function () {
            // Obtener los valores a enviar
            let AccionEdit = 4
            let IdEdit = $("#inputMotivoDeParoEdit").attr("idsqledit");
            let MotivoEdit = $("#inputMotivoDeParoEdit").val();
            //Nos aseguramos de que el campo no este vacio
            if (MotivoEdit == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPO VACIO`,
                    message: `<p>Favor de ingresar un motivo de paro</p>`,
                });
                return;
            } else {
                // Ocultamos el modal "Editar Motivos de paro"
                $("#UpdateMotivosPAroModal").modal("hide");
                //Limpiamos la tabla para volver a generarla despues con el nuevo motivo editado
                tableMotivosParo.clear().draw;
                //Enviamos los datos para agregar el nuevo motivo
                ActionsMotivosParo(AccionEdit, MotivoEdit, IdEdit)
            }
        });

        //Btn Borrar motivo de paro (icontrash)
        $(document).on("click", ".IconTrash", function () {
            // Obtener El id a borrar y los valores a enviar
            let AccionDelete = 3;
            let MotivoDelete = "Any"; //No se ocupa, solo lo rellenamos para el procedure
            let IdDelete = $(this).attr("idensqltash");
            //Limpiamos la tabla para volver a generarla despues con el nuevo motivo editado
            tableMotivosParo.clear().draw;
            //Borramos el regisgtro 
            ActionsMotivosParo(AccionDelete, MotivoDelete, IdDelete)
        });
    }

    //LLAMAMOS A LOS BOTONES JUNTO CON SUS ACCIONES
    ButonActions()

    //--RESTRICCIONES---
    RestriccionesEnInputs()
});