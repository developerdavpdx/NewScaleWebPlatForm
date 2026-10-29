const loader = document.getElementById('loaderDiv'); //Obtenemos el loader (definido en el html del layout)
const $checkbox = $('#atadoIncompleto');    //(accedemos al chec de "atados incomplets" para cambiar su estatus de check)

let atadoIncompletoTubos = 0; //Variable para guardar el numero de tubos cuando el atado es incompleto
//variables para el evento de scan
let barcode = "";   //guarda el codigo de barras
let barcodeTimer;   //para limpiar el barcode por inactividad
//Para los pesos..
let Peso0 = false;  //Para verificar que el peso leido no este en 0 o menor
let PesoEnBascula = 0;  //Guardamos el peso en la bascula
let BasculaSeleccionada = localStorage.getItem('BasculaSeleccionada');    //Obtenemos la bascula que el usuario selecciono
//Para guardar el escaneo
let PesoNetoSend;
let SobrePesoPorcentSend;
let PesoTubosSend;
let NumTubosSend;
let PesoBasculaSend;
let WebApiURL = localStorage.getItem("webapiurl");
let planta = localStorage.planta == '335' ? '2' : '1';

//Al terminar de cargar la pagina..
$(document).ready(async () => {
    loader.style.display = 'flex';  //COMENZAMOS EL LOADER (lo detenmos al pintar las lineas existentes)
    //Obtenemos la planta (planta esta declarada y asignada en el layout.js)


    //-----------------------------------------------------------------------------------

    GetBásculas();  //Obtenemos las básculas existentes (guardadas en el API) (si el usuario ya habia seleccionado una, aqui la elegimos)
    GetLineas();    //Obtenemos las lineas existentes para corrugado


    //------------------------------------------FUNCTIOS-----------------------------------------

    //Funcion para obtener y pintar las lineas
    function GetLineas() {
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

                //creamos cada boton (linea)
                for (x = 0; x < numLineas.response.length; x++) {
                    let code = ComprobarNull(numLineas.response[x].itemCodeLinea);

                    $("#buttonSection").append(`
                        <button class="btn ${numLineas.response[x].asignado ? "btnAsignada" : "btnDesasignada"}" data-linea-id="${numLineas.response[x].numLinea}" data-asignado="${numLineas.response[x].asignado ? "Asignado" : "Desasignado"}" data-toggle="modal" data-target="#myModal">
                        <b>
                            Línea ${numLineas.response[x].numLinea} <br />
                            </b>
                            <p style="font-size: 1.5rem">
                             ${code == null ? "" : code}
                            </p>
                        </button>
                    `);
                }

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

                loader.style.display = 'none';
            }
        }).catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>${error.toString()}</p>`,
            });

            loader.style.display = 'none';
        })
    }

    //Funcion para obtener las basculas existentes (guardadas en el API [las basculas que se guardan segun los ids que va mandando cada báscula])
    function GetBásculas() {
        fetch(`${WebApiURL}/api/Basculas/BasculasIDs`, {    //Conecta directo al api, sin controller intermedio [la url la inyectamos desde el web.config en el html del layout]
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        })
            .then(async response => {
                //verificamos el status de la respuesta
                if (response.ok) {
                    return response.json();     // Si la respuesta es exitosa, parsear el JSON
                } else {
                    // Extraer el mensaje y status desde el body JSON del error
                    const errorData = await response.json();
                    return Promise.reject(`Error ${errorData.status}: ${errorData.message}`);   // Rechazar con el mensaje de error
                }
            })
            .then(data => {
                // Pintar las opciones en el select
                const selectBascula = document.getElementById('basculaSelect');
                selectBascula.innerHTML = ''; // Limpiar opciones previas

                //verificamos que exista alguna bascula
                if (data.length === 0) {

                    iziToast.info({
                        position: "topRight",
                        title: `Sin básculas conectadas`,
                        message: `<p>No se encontraron básculas conectadas al servidor</p>`,
                    })

                } else {
                    // Agregar opción por defecto
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '0';
                    defaultOption.text = 'Seleccione una báscula';
                    selectBascula.appendChild(defaultOption);

                    data.forEach(id => {
                        const option = document.createElement('option');
                        option.value = id;
                        option.text = id;
                        selectBascula.appendChild(option);
                    });

                    //seleccionamos la bascula que el usuario ya habia seleccionado previamente (en caso de que ya se haya seleccionado)
                    SelectBasculaUser();
                }
            })
            .catch(error => {
                //console.log(error)
                //alert(`Error: ${error}`);
                iziToast.error({
                    position: "topRight",
                    title: `Error al obtener básculas`,
                    message: `<p>${error}</p>`,
                });
            });
    }

    //Fncion para leer el peso de la bascula seleccionada
    async function LeerPesoBascula(idBascula) {
        try {
            const response = await fetch(`${WebApiURL}/api/Basculas/ConsultarPeso/${encodeURIComponent(idBascula)}`, {
                // Conecta directo al api, sin controller intermedio [la url la inyectamos desde el web.config en el html del layout]
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Guardamos el peso para usar despues en el flujo
                PesoEnBascula = data.peso;
                //console.log(PesoEnBascula);
                // Verificamos si el peso es mayor a 0
                if (PesoEnBascula == 0 || PesoEnBascula < 0) {
                    Peso0 = false;
                } else {
                    Peso0 = true;
                }
                return Peso0;

            } else if (response.status === 404) {   // si el error es que no se encontro la bascula
                const MensajeAPI = await response.json();

                iziToast.info({
                    position: "topRight",
                    title: `Báscula no encontrada`,
                    message: `<p>${MensajeAPI.message}</p>`,
                });

                return null;

            } else {    // si el error es otro
                // Extraer el mensaje y status desde el body JSON del error
                const errorData = await response.json();
                throw new Error(`${errorData.status}: ${errorData.message}`);
            }
        } catch (error) {
            iziToast.error({
                position: "topRight",
                title: `Error al leer el peso`,
                message: `<p>${error.message}</p>`,
            });
            return null;
        }
    }

    //Funcion para elegir en el select, la opcion que el usuario ya habia seleccionado (si no ah seleccionado ninguna bascula, se elije la opcion default 0)
    function SelectBasculaUser() {
        const select = $('#basculaSelect');

        if (BasculaSeleccionada) {
            let encontrada = false;
            select.find('option').each(function () {
                if ($(this).val() === BasculaSeleccionada) {
                    $(this).prop('selected', true);
                    encontrada = true;
                    return false; // salir del each
                }
            });
            // Si no encontró ninguna opción que coincida, seleccionar value = "0"
            if (!encontrada) {
                select.val('0');
            }
        } else {
            // No hay valor guardado, seleccionar value = "0"
            select.val('0');
        }
    }

    //funcion para validar el codigo escaneado (que existe y corresponde a la linea escaneada)
    async function ValidarCodigo_Linea(Linea, CodeArticulo) {
        try {
            const response = await fetch(`${WebApiURL}/api/Corrugados/ValidarCodigoExiste`, {    // Conecta directo al api, sin controller intermedio [la url la inyectamos desde el web.config en el html del layout]
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Linea': Linea,
                    'code': CodeArticulo,
                    'planta': planta
                }
            });

            if (response.ok) {
                const data = await response.json();
                // data tiene { status, existeCodigo, mensaje }
                return data.existeCodigo;  // Devuelve true/false encontrado en el api
            } else {
                //si ocurre un error en el api, lo mostramos con el catch
                const errorData = await response.json();
                throw new Error(`${errorData.status}: ${errorData.message}`);
            }
        } catch (error) {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error al validar código`,
                message: `<p>${error.message}</p>`,
            });
            return null;
        }
    }

    //funcion para realizar los calculos pertinentes en los pesos antes de guardar en DB
    async function GetAllDataCodigoEscaneado(CodeArticulo, PesoEnBascula, atadoIncompletoTubos) {
        try {
            const response = await fetch(`${WebApiURL}/api/Corrugados/GetPesosPTM`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'peso': PesoEnBascula,
                    'code': CodeArticulo,
                    'numTubos': atadoIncompletoTubos,
                    'planta': planta,
                    'proceso': "Corrugado"
                }
            });

            if (response.ok) {
                const responseJson = await response.json();
                //accedemos a la info que viene en data
                const data = responseJson.data;
                // guardamos los datos relevantes para guardar el registro
                PesoNetoSend = data.pesoNeto;
                SobrePesoPorcentSend = data.sobrePeso;
                PesoTubosSend = data.pesoTubos;
                NumTubosSend = data.tubosTotales; // -->> aqui ya traemos el numero de tubos (sea por atado incompleto o normal)
                PesoBasculaSend = data.pesoTotal
                //devolvemos el sobrepeso correspondiente para encender el semaforo y mostrar el modal correspondiente
                return data.alertSobrepeso;
            } else {
                //si ocurre un error en el api, lo mostramos con el catch
                const errorData = await response.json();
                throw new Error(`${errorData.status}: ${errorData.message}`);
            }
        } catch (error) {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error obtener los datos del codigo escaneado`,
                message: `<p>${error.message}</p>`,
            });
            return null;
        }
    }

    //funcion para crear un nuevo registro en DB
    async function Add_DB_Register(Linea, CodeArticulo, calidad) {
        try {
            //armamos los datos para enviar
            let datasend = {
                code: CodeArticulo,
                linea: parseInt(Linea),
                planta: parseInt(planta),
                turno: turno,
                calidad: calidad,
                pesoNeto: PesoNetoSend,
                sobrePeso: SobrePesoPorcentSend,
                pesotubos: PesoTubosSend,
                numTubos: NumTubosSend,
                pesoBascula: PesoBasculaSend
            };
            //console.log(data);
            const response = await fetch(`${WebApiURL}/api/Corrugados/AddNewDBRegister`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(datasend)
            });

            if (response.ok) {  //si todo va bien
                const data = await response.json();

                if (data.ticketCreated == true) {//si el registro se creo, generamos el tiket
                    //generamos el zpl correspondiente e imprimimos el ticket
                    let zpl = await generarZPLTicket(datasend, data.folio, data.operacion, data.ordenFabricacion, data.itemName); //falta retornar el folio desde el api y verificar que regresa correctamente
                    ImprimirZPL(zpl); // Mandamos a imprimir el ZPL
                }

                return data.ticketCreated;  // Devuelve true/false desde el api

            } else {    //si ocurre un error lo mandamos al catch para mostrarlo
                const errorData = await response.json();
                throw new Error(`${errorData.status}: ${errorData.message}`);
            }
        } catch (error) {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error al crear el registro en BD`,
                message: `<p>${error.message}</p>`,
            });
            return null;
        }
    }

    //funcion para generar el zpl del ticket
    async function generarZPLTicket(data, Folio, Operacion, OF, Descripcion) {
        //obtenemos la fecha y hora actual (puede diferir un poco de la que esta en bd, ya que esa se genera durante el insert [la diferencia deberia ser de milisegundos])
        const ahora = new Date();
        // Dia con dos dígitos
        const dia = String(ahora.getDate()).padStart(2, '0');
        // Mes (getMonth() es 0-based, por eso +1)
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        // Año completo
        const anio = ahora.getFullYear();
        // Hora en 24h dos dígitos
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        const fechaticket = `${dia}/${mes}/${anio} ${horas}:${minutos}`;

        //obtenemos los valores
        const fechaHora = fechaticket;
        const folio = Folio;
        const turno = data.turno;
        const linea = data.linea;
        const operacion = Operacion;
        const codigo = data.code;
        const numTubos = data.numTubos;
        const pesoNeto = data.pesoNeto + " KG";
        const pesoTubos = data.pesotubos + " KG";
        const sobrepeso = data.sobrePeso + " %";
        const Of = OF;
        const descripcion = Descripcion;
        //const categoria = "PRODUCTO TERMINADO";

        //La descripcion puede ser muy larga, por lo que la dividiremos en varias lineas que incertamos "dinamicamente"
        const lineasDesc = dividirDescripcion(descripcion, 40); // Ajusta a tu margen real
        let yBase = 790; // Base para primer línea
        const dy = 30;   // Distancia vertical entre cada línea
        let dyUltima = 0; // Para ajustar la posición del "Powered by" y logo PDX de acuerdo a la cantidad de líneas de descripción

        //armamos el zpl
        let zpl = "^XA ^CI28\n"; // Inicio del ticket

        // Logo PTM (imagen convertida zpl)
        zpl += "^FO250,50^GFA,3395,3395,35,,::::::P01FC,O07JF,N0MF8,M03MFC,L01NFE,L07OF6,L0PFB,K03PF9C,K07PFDE,J01QFCF8,J03QFE7C,J07QFE7EgT0FS0F,J0SF3FN03NF007RFE1FCQ01F8,I01SFBF8M03OF01RFE1FCQ03F8,I03SF9FCM03OF80RFE1FEQ07F8,I07SF9FEM03OFE07QFE1FFQ0FF8,I0TF8FEM03PF83QFE1FF8O01FF8,001TF8FFM03PFC1QFE1FFCO03FF8,001TFCFF8L03PFE0QFE1FFEO07FF8,003TFC7FCL03QF07PFE1IFO0IF8,007TFC7FCL03QF87PFE1IF8M01IF8,00UFC7FEL03QFC3PFE1IFCM03IF8,00UFE7FFL03QFC1PFE1IFEM07IF8,00UFE7FFL03QFC1PFE1JFM0JF8,01UFE7FF8K03QFE1PFE1JF8K01JF8,01OFC01IFE7FF8K03RF0PFE1JFCK03JF8,03NF8J0FFE7FFCK03IFEI0KFJ0JF8I01JFEK07JF8,03MFCK03FC7FFCK03IFEI03JFJ07IF8I01JFEK0KF8,07LFEM07C7FFEK03IFEI01JFJ07IF8I01KFK0KF8,07LFCM03C7FFEK03IFEJ0JFJ07IF8I01KF8I01KF8,07LF8N0C7FFEK03IFEJ0JF8I07IF8I01KFCI03KF8,07KFEO047IFK03IFEJ0JF8I07IF8I01KFEI07KF8,0LFCP07IFK03IFEJ07IF8I07IF8I01LFI0LF8,0LF8P07IFK03IFEJ07IF8I07IF8I01LF801LF8,1KFEQ07IFK03IFEJ07IF8I07IF8I01LF803LF8,1KFEQ0JFK03IFEJ07IF8I07IF8I01LFC07LF8,1KFCQ0JFK03IFEJ07IF8I07IF8I01LFE07LF8,1KF8Q0JF8J03IFEJ07IF8I07IF8I01MF0MF8,1KF8P01JF8J03IFEJ07IF8I07IF8I01MF9MF8,1KFQ01JF8J03IFEJ0JF8I07IF8I01UF8,1JFEQ01JF8J03IFEJ0JF8I07IF8I01UF8,1JFEQ01JF8J03IFEJ0JFJ07IF8I01UF8,1JFCQ03JF8J03IFEI01JFJ07IF8I01UF8,1JFCQ07JF8J03IFEI07JFJ07IF8I01UF8,1JF8Q07JF8J03JF7MFJ07IF8I01UF8,1JF8Q07JF8J03RFJ07IF8I01UF8,1JF8Q0KF8J03QFEJ07IF8I01UF8,1JFQ01KF8J03QFCJ07IF8I01UF8,1JFQ01KF8J03QFCJ07IF8I01JF7KFEJF8,1JFQ03KF8J03QF8J07IF8I01JF3KFCJF8,1JFQ03KF8J03QF8J07IF8I01JF1KF8JF8,1JFQ07KFK03QFK07IF8I01JF1KF0JF8,1IFEQ0LFK03PFEK07IF8I01JF0KF0JF8,0IFEP01LFK03PFCK07IF8I01JF07IFC0JF8,0IFEP03LFK03PF8K07IF8I01JF03IFC0JF8,07FFEP07LFK03OFEL07IF8I01JF01IF00JF8,07FFE3N01LFEK03OFCL07IF8I01JF00FFE00JF8,07FFE38M03LFEK03NFEM07IF8I01JF007FC00JF8,07FFE3EM0MFEK03MFCN07IF8I01JF003F800JF8,03FFE3F8K03MFCK03IFER07IF8I01JF001F800JF8,03FFE3FFJ01NFCK03IFER07IF8I01JFI0EI0JF8,03IF1FFEI07NFCK03IFER07IF8I01JFM0JF8,01IF1UF8K03IFER07IF8I01JFM0JF8,01IF1UFL03IFER07IF8I01JFM0JF8,00IF1UFL03IFER07IF8I01JFM0JF8,007FF0UFL03IFER07IF8I01JFM0JF8,007FF8TFCL03IFER07IF8I01JFM0JF8,003FF8TFCL03IFER07IF8I01JFM0JF8,003FF87SF8L03IFER07IF8I01JFM0JF8,001FFC7SF8L03IFER07IF8I01JFM0JF8,I0FFC7SFM03IFER07IF8I01JFM0JF8,I07FE3RFEM03IFER07IF8I01JFM0JF8,I03FE1RFCM03IFER07IF8I01JFM0JF8,I01FF1RFCM03IFER07IF8I01JFM0JF8,J0FF8RFN03IFER07IF8I01JFM0JF8,J07F87PFEgL04,J03FC7PFC,J01FE3PF8,K0FF1PF,K03F8OFC,K01FC7NF8,L07E1MFE,L03F8MF8,M07E3KFE,M01F1KF8,O0C3IF,Q0FFC,,::^FS\n";

        // Fecha y hora
        zpl += "^FO300,170^A0N,25,25^FD" + fechaHora + "^FS\n";

        //concepto y valor
        zpl += "^FO170,230^A0N,33,33^FDCONCEPTO^FS\n";
        zpl += "^FO450,230^A0N,33,33^FDVALOR^FS\n";
        zpl += "^FO170,270^GB500,2,2^FS\n"; //linea de separacion

        // FOLIO
        zpl += "^FO170,290^A0N,25,25^FDFOLIO:^FS\n";
        zpl += "^FO420,290^A0N,25,25^FD" + folio + "^FS\n";
        zpl += "^FO170,320^GB500,2,2^FS\n";

        // Turno
        zpl += "^FO170,340^A0N,25,25^FDTURNO:^FS\n";
        zpl += "^FO420,340^A0N,25,25^FD" + turno + "^FS\n";
        zpl += "^FO170,370^GB500,2,2^FS\n";

        // Línea
        zpl += "^FO170,390^A0N,25,25^FDLÍNEA:^FS\n";
        zpl += "^FO420,390^A0N,25,25^FD" + linea + "^FS\n";
        zpl += "^FO170,420^GB500,2,2^FS\n";

        // Operación
        zpl += "^FO170,440^A0N,25,25^FDOPERACIÓN:^FS\n";
        zpl += "^FO420,440^A0N,25,25^FD" + operacion + "^FS\n";
        zpl += "^FO170,470^GB500,2,2^FS\n";

        // Código
        zpl += "^FO170,490^A0N,25,25^FDCÓDIGO:^FS\n";
        zpl += "^FO420,490^A0N,25,25^FD" + codigo + "^FS\n";
        zpl += "^FO170,520^GB500,2,2^FS\n";

        // Numero de tubos
        zpl += "^FO170,540^A0N,25,25^FDNUM. DE TUBOS:^FS\n";
        zpl += "^FO420,540^A0N,25,25^FD" + numTubos + "^FS\n";
        zpl += "^FO170,570^GB500,2,2^FS\n";

        // Peso Neto
        zpl += "^FO170,590^A0N,25,25^FDPESO N. ATADOS:^FS\n";
        zpl += "^FO420,590^A0N,25,25^FD" + pesoNeto + "^FS\n";
        zpl += "^FO170,620^GB500,2,2^FS\n";

        // Peso de tubos
        zpl += "^FO170,640^A0N,25,25^FDPESO N. TUBOS:^FS\n";
        zpl += "^FO420,640^A0N,25,25^FD" + pesoTubos + "^FS\n";
        zpl += "^FO170,670^GB500,2,2^FS\n";

        // Sobrepeso
        zpl += "^FO170,690^A0N,25,25^FDSOBREPESO:^FS\n";
        zpl += "^FO420,690^A0N,25,25^FD" + sobrepeso + "^FS\n";
        zpl += "^FO170,720^GB500,2,2^FS\n";

        //OF
        zpl += "^FO170,740^A0N,25,25^FDOF:^FS\n";
        zpl += "^FO420,740^A0N,25,25^FD" + Of + "^FS\n";
        zpl += "^FO170,770^GB500,2,2^FS\n";

        //Descripción
        zpl += "^FO170,790^A0N,25,25^FDDESCRIPCIÓN:^FS\n";
        for (let i = 0; i < lineasDesc.length; i++) {
            // Cada línea se imprime más abajo, separadas por dy
            zpl += `^FO420,${yBase + i * dy}^A0N,25,25^FD${lineasDesc[i]}^FS\n`;
            dyUltima = yBase + i * dy; // Actualizamos dyUltima para determinar la posicion del "Powered by" y logo PDX
        }
        zpl += `^FO170,${dyUltima + 30}^GB500,2,2^FS\n`;    //la ultima linea divisoria es la posicion final de la ultima linea de descripcion + 30

        //Categoría
        //zpl += "^FO170,840^A0N,25,25^FDCATEGORÍA:^FS\n";
        //zpl += "^FO420,840^A0N,25,25^FD" + categoria + "^FS\n";
        //zpl += "^FO170,870^GB500,2,2^FS\n";

        // Leyenda "POWERED BY" (sumamos 60 a la ultima posicion de "descripcion")
        zpl += `^FO350,${dyUltima + 60}^A0N,20,20^FDPOWERED BY^FS\n`;

        // Logo PDX (imagen convertida zpl) (sumamos 80 a la ultima posicion de "descripcion")
        zpl += `^^FO280,${dyUltima + 80}^GFA,2080,2080,32,,:::::::::::hL01F,hK01IF,hK07IFC,hK0JFE,01MFJ07EJ07JFEK07CI01JFCI01KF01F8I07FE,00MFCI07EJ07KFK0FEI03KFI03KF01FCI0FFC,001LFEI0FFJ07KFCJ0FFI03KFC00LF00FE001FF,I07LF001FF8I07KFCI01FFI03KFE00FFC07F807F003FC,I03LF001FF8I07KFEI01FF8003LF01FF003FC03F807E,I03EI01F801FFCI07CI07FI03FF8I07I07F81FEI07C01FC0FC,I03EJ0F803E7CI07CI03FI07EFC003EI01FC3FCI03E00FE1F8,I03EJ0F807E7EI07CI03FI07E7C003FJ0FC3F8I01E007F3F,I03EJ0F807E3EI07CI03FI0FC7E003EJ07C3F8I01F003FFE,I03EJ0F807C3FI07CI03FI0F83E003EJ07E3F8I01F001FFC,I03EI03F80F81FI07CI07F001F81F003EJ07E3F8J0FI0FF8,I03LF01F81F8007KFE001F01F003EJ07E3F8J0FI07F8,I03LF01F00F8007KFC003F01F803EJ03E3F8J0FI07F8,I03EJFE03F00FC007DJF8003E00F803EJ07E3F8J0FI0FFC,I03EJFC07E007C007DJFI07E007C03EJ07E3F8I01F001FFE,I03E7FFC007E007E007CIFEI07C007C03EJ07C3FCI01E003IF,I03EL07C003F007C007EI0F8007E03FJ0FC3FCI03E007E3F8,I03EL0FC003F007C003FI0F8003E03EI01FC1FCI03E00FC1FC,I03EL0F8001F007C001F001F8001F03EI03F81FEI07C01F80FE,I03EK01F8I0F807C001F803FI01F83LF80FEI0F803F007F,I03EK01FJ0FC07CI0FC03EJ0F83LF00FF001F807E003F8,I03EK03EJ0FC07CI07E03EJ0FC3KFC007FE0FF00FC001FC,I03EK07EJ07C07CI07E07EJ07C3KF8002JFE01F8I0FE,I03EK07CJ03E07CI03F0FCJ07E3JFCJ07IF803FJ07F,hK03IF,hL07F8,,::::R01E110F070561C1C0078383808201C101C1E12,R0101B090C056101I01060400870243034101A,R01E1B0F0C0561C1C001078403870243030160E,R01C17080D056181C001070403868243030160C,R01E11080F07E1C1I010787808683C1C3C1E04,,::::::::::::^FS\n`;

        zpl += "^XZ"; // Fin del ticket

        //console.log(zpl);
        return zpl;
    }

    //funcion para imprimir el zpl generado
    function ImprimirZPL(zpl) {
        const BrowserPrint = window.BrowserPrint;
        if (!BrowserPrint) {
            console.error("BrowserPrint no está disponible aún");
            iziToast.error({
                position: "topRight",
                title: `LIBRERIA INACCESIBLE`,
                message: `<p>Librería BrowserPrint no cargada, favor de contactar a soporte si el error persiste</p>`,
            });
            return;
        }

        BrowserPrint.getDefaultDevice('printer', function (printer) {
            if (!printer) {
                iziToast.info({
                    position: "topRight",
                    title: `SIN IMPRESORA`,
                    message: `<p>No se encontró una impresora Zebra conectada.</p>`,
                });
                return;
            }
            printer.send(zpl, function () {
                console.log("Impresión enviada correctamente.");
            }, function (error) {
                console.error("Error al enviar impresión: ", error);
                alert("Error al imprimir: " + error);
            });
        }, function (error) {
            iziToast.error({
                position: "topRight",
                title: `SIN IMPRESORA`,
                message: `<p>Error al buscar impresora: " + ${error}</p>`,
            });
        });
    }

    //Funcion para mandar a encender el semaforo segun el sobrepeso obtenido (1, 2 o 3) (a travez de la app de lectura de peso)
    function EncenderSemaforo(semaforoPeso) {
        fetch(`http://localhost:49152/semaforo?numero=${semaforoPeso}`)
            .then(response => {
                if (response.status === 200 || response.status === 400) {   //verificamos que haya una respuesta del programa de lectura de pesos
                    return response.text().then(data => {
                        console.log(data);
                    });
                } else {
                    // Si no es 200 ni 400, lanzamos error para atraparlo en catch (significa que el programa de pesos no esta activo en el equipo local)
                    throw new Error('El registro se guardo, pero no se ecnontro la app de lectura de pesos, <br>por favor verifica que el programa se este ejecutando <br>y se encuentre conectado a la báscula<br>' + response.status);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                iziToast.info({
                    position: "topRight",
                    title: `SIN LECTURA DE PESOS`,
                    message: `<p>${error}</p>`,
                });
            });
    }


    //funcion para dividir la descripcion larga en varias lineas para el ticket
    function dividirDescripcion(desc, maxCharsPorLinea) {
        const lineas = [];
        let pos = 0;
        while (pos < desc.length) {
            lineas.push(desc.substring(pos, pos + maxCharsPorLinea));
            pos += maxCharsPorLinea;
        }
        return lineas;
    }

    //Funcion para verificar si los objetos o valores vienen vacios
    function ComprobarNull(value) {
        // Si es null, undefined o un objeto vacío, mostrar ""
        if (value == null) return "";
        if (typeof value === "object" && Object.keys(value).length === 0) return "";
        if (typeof value === "number" && value === 0) return "";
        return value;
    }

    //Funcion para convertir a mayusculas
    function convertirAMayusculas(texto) {
        return texto.replace(/[a-z]/g, function (letra) {
            return letra.toUpperCase();
        });
    }

    //------------------------------------------BTNS------------------------------------------

    //Check "Atado incompleto" (abre el modal/Limpia el atadoIncompletoTubos)
    $('#LabelAtadoIncompleteDiv').click(function (e) {
        e.preventDefault(); // Siempre prevenir el cambio automático

        const estaMarcado = $checkbox.prop('checked');

        // Si ya está marcado, desmarcarlo y resetear variable sin modal
        if (estaMarcado && atadoIncompletoTubos) {
            // desactivar el checkbox
            $checkbox.prop('checked', false);
            atadoIncompletoTubos = 0;
        } else {
            // Abrir modal para ingresar cantidad y confirmar
            $('#AtadoIncompletoModal').modal('show');
        }
    });

    //Btn Confirmar (dentro del modal "atado incompleto")
    $('#Btn_ConfirmarAtadoIncompleto').click(function () {
        // Obtener los tubos asignados en el input
        const valorTubos = $('#tubosAtadoIncompleto').val();

        // Validar que sea algún valor mayor a 0
        if (!valorTubos || valorTubos <= 0) {
            iziToast.info({
                position: "topRight",
                title: `SIN TUBOS ASIGNADOS`,
                message: `<p>Por favor ingrese un número de tubos valido.</p>`,
            })
            return;
        }

        // Guardamos el numero de tubos
        atadoIncompletoTubos = valorTubos;

        // Activar el checkbox
        $checkbox.prop('checked', true);
        // Cerrar el modal
        $('#AtadoIncompletoModal').modal('hide');
    });

    //Btn cerar modal (en cualquier modal)
    $('.cerrarModal').click(function () {
        //cerramos el modal "atado incompleto"
        $('#AtadoIncompletoModal').modal('hide');
        //limpiamos el input
        $('#tubosAtadoIncompleto').val("");

        //cerramos los modals "Alerta de peso"
        $('#BPModal').modal('hide');
        $('#SPModal').modal('hide');
    });

    //Cambio de bascula (cambios en el select)
    $('#basculaSelect').on('change', function () {
        //Guardamos la bascula seleccionada en localstorage para "recordar la opcion que el usuario selecciono", tambien guardamos en nustra variable para usar a conveniencia
        BasculaSeleccionada = $(this).val();
        localStorage.setItem('BasculaSeleccionada', BasculaSeleccionada);

        //mostramos el mensaje de succes
        iziToast.success({
            position: "topRight",
            title: `Báscula guardada`,
            message: `<p>Se ha seleccinado la báscula: <strong>${BasculaSeleccionada}</strong></p>`,
        });
    });

    //EVENTO DE ESCANEO (el usuario escanea el codigo de barras), PASO 1 - ESCANEO DE PT
    $(document).on('keydown', async function (e) {
        // Si la tecla es Enter (código 13), tomar el código acumulado
        if (e.key === "Enter") {
            if (barcode.length > 0) {

                //Una vez obtenido el codigo, verificamos que el peso no sea 0 o negativo para poder continuar el flujo (guardamos el peso ya que se esta consultando)
                let BasculaSeleccionadaNow = $('#basculaSelect').val(); //usamos el valor que esta en el select, para asegurar que es lo mismo que el usuario ve
                let RespuestaPeso = await LeerPesoBascula(BasculaSeleccionadaNow);   //usamos await para esperar a que se lea el peso

                //dependiendo de la respuesta (si se encontro un peso valido o no)
                if (RespuestaPeso == true) { //peso valido mayor a 0

                    //Comenzamos el loader
                    loader.style.display = 'flex';

                    //Limpiamos el codigo escaneado de caracteres en blanco al comienzo o final de la cadena
                    const codigoLimpio = barcode.trim();

                    //Obtenemos la linea y el codigo de articulo correspondiente
                    const Linea = codigoLimpio.substring(0, 2);// Primeros dos caracteres
                    const CodeArticulo = convertirAMayusculas(codigoLimpio.substring(2));// Resto del código (nos aseguramos de que siempre este en mayusculas para compatibilidad en BD)

                    //***** en este punto ya tenemos las variables principales para continuar el flujo: Linea, CodeArticulo y PesoEnBascula *****//

                    //PASO 2 - validamos que el codigo de articulo exista y este asignado a la linea indiaca en el escaneo
                    let respuestaValidacionCode = await ValidarCodigo_Linea(Linea, CodeArticulo);
                    if (respuestaValidacionCode == true) { //si el codigo es valido y corresponde a la linea

                        //PASO 3
                        //Obtenemos todos los datos para el registro en bd (guardamos peso estandar, sobrepeso etc.). Ademas comprobamos el sobrepeso para encender el semaforo
                        let semaforoPeso = await GetAllDataCodigoEscaneado(CodeArticulo, PesoEnBascula, atadoIncompletoTubos);

                        let calidad; //para que se usa? (no he encontrado utilidad, pero ya se encontraba en la tabla con las reglas del case, lo sigo mandando igual)

                        //dependiendo de la alerta sobrepeso obtenida, mostramos el modal correspondiente y activamos el semaforo (tambien asignamos calidad)
                        switch (semaforoPeso) {
                            case 1: //sobrepeso dentro de limites, "OK"
                                calidad = 0;
                                //Encendemos el semaforo
                                EncenderSemaforo(semaforoPeso);
                                break;

                            case 2: //sobrepeso por debajo de limites
                                calidad = 1;
                                //Encendemos el semaforo
                                EncenderSemaforo(semaforoPeso);
                                //Lanzamos el modal de sobrepeso debajo de los limites
                                $("#DescripcionBajoPeso").html( //armamos el mensaje a mostrar
                                    "<span>Se ha detectado un <b>BAJO PESO</b> de: <b>" + SobrePesoPorcentSend + "%</b>" +
                                    "en el artículo: <b>" + CodeArticulo + "</b> " +
                                    " con la línea: <b>" + Linea + "</b>" +

                                    "<br>Peso actual en báscula: <b>" + PesoBasculaSend + " Kg</b>" +
                                    "<br> Peso Neto del árticulo: <b>" + PesoNetoSend + " Kg</b>" +
                                    "<br>Peso tubo: <b>" + PesoTubosSend + " Kg</b></span>"
                                );
                                $("#BPModal").modal("show");
                                //el modal debe cerrarse en automatico tras 5 segundos
                                setTimeout(function () {
                                    $("#BPModal").modal("hide");
                                }, 5000);
                                break;

                            case 3: //sobrepeso, arriba de limites
                                calidad = 1;
                                //Encendemos el semaforo
                                EncenderSemaforo(semaforoPeso);
                                //Lanzamos el modal de sobrepeso arriba de los limites
                                $("#DescripcionSobrePeso").html(   //armamos el mensaje a mostrar
                                    "<span>Se ha detectado un <b>SOBRE PESO</b> de: <b>" + SobrePesoPorcentSend + "%</b>" +
                                    "en el artículo: <b>" + CodeArticulo + "</b> " +
                                    " con la línea: <b>" + Linea + "</b>" +

                                    "<br>Peso actual en báscula: <b>" + PesoBasculaSend + " Kg</b>" +
                                    "<br> Peso Neto del árticulo: <b>" + PesoNetoSend + " Kg</b>" +
                                    "<br>Peso tubo: <b>" + PesoTubosSend + " Kg</b></span>"
                                );
                                $("#SPModal").modal("show");
                                //el modal debe cerrarse en automatico tras 5 segundos
                                setTimeout(function () {
                                    $("#SPModal").modal("hide");
                                }, 5000);
                                break;
                        }

                        //PASO 4
                        //Guardamos en BD el registro del escaneo (en TicketsInfo y ProductoTerminados)
                        let RespuestaRegisroBD = await Add_DB_Register(Linea, CodeArticulo, calidad)
                        switch (RespuestaRegisroBD) {
                            case true:  //el registro se rralizo bien
                                iziToast.success({
                                    position: "topRight",
                                    title: `ESCANEO COMPLETADO`,
                                    message: `<p>El escaneo se ha completado correctamente</p>`,
                                });
                                break;

                            case false: //ocurrio un error en el sp
                                iziToast.error({
                                    position: "topRight",
                                    title: `REGISTRO INCOMPLETO`,
                                    message: `<p>El regitro de escaneo no se completo. <br>Favor de reintentar</p>`,
                                });
                                break;

                            case null:  //ocurrio un error en la funcion
                                break;//no hacemos nada, la funcion de registro ya lanza el mensaje de error
                        }


                    } else if (respuestaValidacionCode == false) { //si el codigo no es valido o no corresponde a la linea (no se encontro cincidencia)
                        iziToast.info({
                            position: "topRight",
                            title: `CÓDIGO NO VÁLIDO`,
                            message: `<p>El código escaneado no es válido o no corresponde a la línea. <br>Linea escaneada: <strong>${Linea}</strong>.<br> Codigo escaneado: <strong>${CodeArticulo}</strong></p>`,
                        });
                    } else if (respuestaValidacionCode == null) { //si se encontro un error, no hacer nada la funcion de validacion ya maneja los errores

                    }

                    //PASO 5 - AL FINALIZAR EL FLUJO DE ESCANEO (LECTURA Y GUARDADO EN BD)
                    //Preparamos para la siguiene lectura (Reestablecemos variables)

                    //variables de codigo de barras y pesos locales
                    barcode = ""; // limpiar para próximo código
                    Peso0 = false;
                    PesoEnBascula = 0;

                    //variables de datos a enviar
                    PesoNetoSend = 0;
                    SobrePesoPorcentSend = 0;
                    PesoTubosSend = 0;
                    NumTubosSend = 0;
                    PesoBasculaSend = 0;

                    loader.style.display = 'none';
                }
                else if (RespuestaPeso == false) {   //peso invalido menor o igual a 0
                    iziToast.error({
                        position: "topRight",
                        title: `PESO 0`,
                        message: `<p>El peso registrado es 0 o menor, por favor verifique la báscula.<br> <strong>Peso leído: ${PesoEnBascula}</strong></p>`,
                    });

                    //Preparamos para la siguiene lectura
                    barcode = ""; // limpiar para próximo código
                    Peso0 = false;
                    PesoEnBascula = 0;
                }
                else if (RespuestaPeso == null) {    //si se encontro un error, no hacer nada la funcion de lectura de peso ya maneja los errores            

                    //Preparamos para la siguiene lectura
                    barcode = ""; // limpiar para próximo código
                    Peso0 = false;
                    PesoEnBascula = 0;
                }
            }
            //Limpiamos el timer de codigo de barras
            clearTimeout(barcodeTimer);
            return;
        }

        // Ignorar teclas especiales o de control
        if (e.key.length === 1) { // solo caracteres normales
            barcode += e.key;

            // Limpiar buffer si no se recibe tecla en 150 ms (asumiendo escaneo rápido)
            clearTimeout(barcodeTimer);
            barcodeTimer = setTimeout(() => {
                barcode = ""; // limpiar por inactividad, (código incompleto)
            }, 150);
        }
    });

    //------------------------------------------EXTRAS------------------------------------------

    //nos aseguramos de lmpiar los inputs cada vez que se cierren los modals de cualquier forma
    $('.modalClose').on('hidden.bs.modal', function () {
        //modal "atado incompleto"
        $('#tubosAtadoIncompleto').val("");
    });

});