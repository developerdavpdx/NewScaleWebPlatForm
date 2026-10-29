
const loader = document.getElementById('loaderDiv')

let tableMolineros;
let rowsTabla = [];
let planta;
let codigoanterior; //lo usamos para las actualizaciones de registro de los molineros

$(function () {

    //obtenemos la planta
    localStorage.planta == '335' ? planta = '2' : planta = '1'

    //configuramos la tabla
    tableMolineros = $("#TablaMolinerios").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        info: false,
        lengthChange: false,
    });

    //movemos el search de la tabla de posicion para que este al mismo nivel que los botones de agregar/eliminar
    const searchBox = $('#TablaMolinerios_filter');
    $('#datatable-search-container').append(searchBox);

    //obtenemos los Molinerois existentes y los dibujamos en la tabla
    ObtenerDatosMolineros(planta);

    function ObtenerDatosMolineros(planta) {
        loader.style.display = "flex";

        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta
        }
        fetch("/Molinos/ObtenerMolinerosMolinos", {
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
            datosMolinerosMolinos = DataJson.molinerosMolinos

            for (x = 0; x < datosMolinerosMolinos.length; x++) {

                let iconoEdit = `<i class="fa fa-pencil IconEdit" data-codigouser="${datosMolinerosMolinos[x].codigoUsuario}"
                data-nombre="${datosMolinerosMolinos[x].nombre}"
                data-activo="${datosMolinerosMolinos[x].activo}"></i>`;

                rowsTabla.push([
                    datosMolinerosMolinos[x].codigoUsuario,
                    datosMolinerosMolinos[x].nombre,
                    datosMolinerosMolinos[x].fechaCreacion.split("T")[0], // Extrae solo la fecha
                    datosMolinerosMolinos[x].activo,
                    iconoEdit,
                ])
            }

            tableMolineros.rows.add(rowsTabla).draw()
            //limpiamos las rows para que reciba nueva info al volver a llamar a la funcion
            rowsTabla = [];

            //Si no existen registros mostramos el mensaje
            if (datosMolinerosMolinos.length == 0) {
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

    //agrega/elimina molineros, tambien se usa para los update
    function AgregarEliminarMolineros(NombreNewUser, Codigo, borrar, fecha, Activo, CodigoUserEdit) {
        loader.style.display = "flex";

        //el nombre puede llevar acento, asi que lo codificamos (para que pueda viajar por http al servidor)
        const NombreNewUserCodificado = NombreNewUser ? encodeURIComponent(NombreNewUser.trim()) : "";
        //armamos los datos que enviaremos al controler
        let data = {
            "Codigo": Codigo,
            "Nombre": NombreNewUserCodificado,
            "Borrar": borrar,
            "Planta": planta,
            "Fecha": fecha,
            "Activo": Activo,
            "CodigoUserEdit": CodigoUserEdit
        }

        fetch("/Molinos/AgregarEliminarOperador", {
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
                //console.log(jsonData.status)
                if (jsonData.status == 200) {

                    loader.style.display = "none";

                    iziToast.success({
                        position: "topRight",
                        title: `OPERACION EXITOSA`,
                        message: `<p>Operador modificado</p>`,
                    });

                    LimpiarForm(); // Limpiar los formularios
                    recargarTabla();
                } else {
                    console.log("Error desde el api, no se establecio la comunicacion o devolvio un error Funcion: AgregarEliminarMolineros, motivo: ", jsonData.data)
                    iziToast.error({
                        position: "topRight",
                        title: `OPERADOR NO AGREGADO`,
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
                    title: `OPERADOR NO AGREGADO`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    }

    //----FUNCIONES AUXILIARES:
    //limpiamos los formularios
    function LimpiarForm() {
        //Modal Agregar
        $('#inputNombreMolinero').val("");
        $('#inputCodeMolinero').val("");
        //Modal Eliminar
        $('#inputCodigoRemoveMolinero').val("");
        //Modal Editar
        $('#inputCodeEditMolinero').val("");
        $('#inputActivoMolinero').val("");
    }

    //recargamos la tabla para visualizar los cambios
    function recargarTabla() {
        //Limpiamos la tabla para asegurarnos de que no tenga registros pasados
        tableMolineros.clear().draw
        $('.modal').modal('hide'); //cerramos cualquier modal abierto
        ObtenerDatosMolineros(planta);    
    }


    //aqui estan todas las acciones de los botones
    function ButonsActions() {
        // Btn Agregar Molinero, Mostramos el modal de agregar molinero
        $(document).on("click", "#AddMolineroUser", function () {
            $("#agregarMolineroModal").modal('show'); // Muestra el modal
        });

        // Btn Eliminar Molinero, Mostramos el modal de eliminar molinero
        $(document).on("click", "#RemoveMolineroUser", function () {
            $("#EliminarMolineroModal").modal('show'); // Muestra el modal
        });

        //Btn Agregar (dentro del modal Agregar operador) Agrega el user a la BD
        $(document).on("click", "#AgregarMolinerobtnfinish", function () {
            //obtenemos los datos a enviar
            let NombreNewUser = $("#inputNombreMolinero").val();
            let CodigoNewUser = $("#inputCodeMolinero").val();
            let borrar = 0 //mandamos borrar en 0 para indicar al procedure que es una agregacion y no una eliminacion
            //obtenemos la actual fecha con el formato correcto
            let FechaActual = new Date();
            FechaActual.setHours(FechaActual.getHours() - 6); // Ajuste de zona horaria
            let fechacreacion = FechaActual.toISOString().slice(0, 19).replace('T', ' ');
            let Activo = "any"; //la funcion la ocupara para el update, en este caso se manda como "any" ya que no se usara
            let CodigoUserEdit = "any" //la funcion la ocupara para el update, en este caso se manda como "any" ya que no se usara

            //nos aseguramos de que los campos no esten vacios
            if (NombreNewUser == "" || CodigoNewUser == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACIOS`,
                    message: `<p>Asegurese de llenar todos los campos</p>`,
                });
                return;
            }

            // Verificamos si el código ya existe en la tabla
            let codigoExiste = false;
            $("#TablaMolinerios tbody tr").each(function () {
                let codigoExistente = $(this).find("td:first").text().trim();
                if (codigoExistente == CodigoNewUser.trim()) {
                    codigoExiste = true;
                    return false; // Rompemos el bucle si encontramos coincidencia
                }
            });

            if (codigoExiste) {
                iziToast.info({
                    position: "topRight",
                    title: `CÓDIGO EXISTENTE`,
                    message: `<p>El código ingresado ya está registrado</p>`,
                });
                return;
            } else {
                // Si no existe, llamamos a la función para agregar
                AgregarEliminarMolineros(NombreNewUser, CodigoNewUser, borrar, fechacreacion, Activo, CodigoUserEdit);
            }

        });

        //Btn Eliminar (dentro del modal Eliminar operador) elimina el user de la BD
        $(document).on("click", "#EliminarMolinerobtnfinish", function () {
            //obtenemos los datos a enviar
            let NombreNewUser = "any"; //la mandamos porque la recibe el procedure, pero no se usa en caso de eliminacion
            let CodigoNewDelete = $("#inputCodigoRemoveMolinero").val();
            let borrar = 1 //mandamos borrar en 1 para indicar al procedure que una eliminacion
            //obtenemos la actual fecha con el formato correcto
            let FechaActual = new Date();
            FechaActual.setHours(FechaActual.getHours() - 6); // Ajuste de zona horaria
            let fechacreacion = FechaActual.toISOString().slice(0, 19).replace('T', ' ');
            let Activo = "any"; //la funcion la ocupara para el update, en este caso se manda como "any" ya que no se usara
            let CodigoUserEdit = "any" //la funcion la ocupara para el update, en este caso se manda como "any" ya que no se usara

            //nos aseguramos de que los campos no esten vacios
            if (CodigoNewDelete == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACIOS`,
                    message: `<p>Asegurese de llenar todos los campos</p>`,
                });
                return;
            }
            // Verificamos que el código exista (lo verificamos en la tabla que contiene todos los registros)
            let codigoNoExiste = true; // Asumimos que el código no existe
            $("#TablaMolinerios tbody tr").each(function () {
                let codigoExistente = $(this).find("td:first").text().trim(); // Obtenemos el valor de la primera columna (código)
                if (codigoExistente === CodigoNewDelete.trim()) { // Comprobamos si el código coincide
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
            AgregarEliminarMolineros(NombreNewUser, CodigoNewDelete, borrar, fechacreacion, Activo, CodigoUserEdit);

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

        //abrimos el modal de edicion al hacer clic en los iconos de "IconEdit"
        $(document).on("click", ".IconEdit", function () {
            // Obtener los valores de los atributos data-*
            let CodigoUserEdit = $(this).data("codigouser");
            let ActivoEdit = $(this).data("activo");
            let NombreEdit = $(this).data("nombre");

            // Agregar los valores al modal antes de mostrarlo
            $("#inputCodeEditMolinero").val(CodigoUserEdit);
            if (ActivoEdit == "SI") {
                $("#inputActivoMolinero").val("SI");
            } else {
                $("#inputActivoMolinero").val("NO");
            }
            $("#inputNombreEditMolinero").val(NombreEdit);
            //asignamos el codigo original en la variable "codigoanterior"
            codigoanterior = CodigoUserEdit;

            // Mostrar el modal
            $("#EditMolineroModal").modal("show");
        });

        // Btn Actualizar (dentro del modal edit)
        $(document).on("click", "#EditMolinerobtnfinish", function () {
            //obtenemos los datos a enviar
            let CodigoUserEdit = $("#inputCodeEditMolinero").val();
            let ActivoUserEdit = $("#inputActivoMolinero").val();
            let NombreEdit = $("#inputNombreEditMolinero").val();;
            let borrar = 3; //lo mandamos en 3 para indicar en el procedure que sera un update
            //datso que ocupa la funcion pero no se usan
            let FechaActual = new Date();
            FechaActual.setHours(FechaActual.getHours() - 6); // Ajuste de zona horaria
            let fechacreacion = FechaActual.toISOString().slice(0, 19).replace('T', ' ');

            //nos aseguramos de que los campos no esten vacios
            if (CodigoUserEdit == "") {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACIOS`,
                    message: `<p>Asegurese de llenar todos los campos</p>`,
                });
                return;
            } else {
                //(usara el mismo procedure de agregar/eliminar molinero "Sppdx_AgregarEliminarOperadorMolino", solo mandamos "borrar" en 3 para indicarlo)
                AgregarEliminarMolineros(NombreEdit, codigoanterior, borrar, fechacreacion, ActivoUserEdit, CodigoUserEdit);
            }

        });
    }

    //----ACTIONS:
    ButonsActions();


    //----------RESTRICCIONES
    //Restringimos el input de codigo (al agregar nuevos usuarios) para que no acepte acentos ni caracteres especiales
    $("#inputCodeMolinero").on("input", function () {
        // Expresión regular para permitir solo letras y números
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });
});