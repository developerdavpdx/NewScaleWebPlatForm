const loader = document.getElementById('loaderDiv');

let nameOpdor = document.getElementById("labelName").innerText;  //obtenemos el nombre del operador desde el layout que ya lo tiene
let BasculaSeleccionada = localStorage.getItem('BasculaSeleccionada');    //Obtenemos la bascula que el usuario selecciono desde PesajePT
let estadoSwitchScrapCorte = localStorage.getItem('estadoSwitchScrapCortesSierra'); //obtenemos el ultimo estado del switch para saber si lo marcamos o no (en caso de que el usuario haya cambiado de vista)
let ScrapCortesSierra = 0; //Bandera para saber si esta activo o no el scrap sin cortes de sierra (se inicializa en 0 indicando que no esta activo)

//variables para el evento de scan
let barcode = "";   //guarda el codigo de barras
let barcodeTimer;   //para limpiar el barcode por inactividad
//variables para los pesos
let PesoEnBascula;  //aqui guardamos el peso leido de la bascula
let Peso0 = false;  //Para verificar que el peso leido no este en 0 o menor
//variables para informacion del codigo escaneado
let Fam = ""; //guardamos la familia a la que corresponde el codigo escaneado
let NextIdScrap;    //guarda el siguiente id que sera agregado al registrar el scrap en BD
let WebApiURL = localStorage.getItem("webapiurl");
let planta = localStorage.planta == '335' ? '2' : '1';


//Al cargar la pagina..
$(document).ready(async () => {
    loader.style.display = "flex";

    //asignamos la bascula seleccionada
    $("#BasculaAsigned").val(BasculaSeleccionada);
    //asignamos el operador
    $("#staticOperador").val(nameOpdor);
    //asignamos al switch y la bandera, su status (seleccionado o no) [si es inicio de sesion, no existe el localstoage, por lo que el switch y bandera se quedan con sus valores default]
    if (estadoSwitchScrapCorte !== null) {
        $('#SwitchScrapCortesSierra').prop('checked', estadoSwitchScrapCorte === '1');
        ScrapCortesSierra = estadoSwitchScrapCorte; //asignamos a la bendera su valor (solo cuando ya existe el localstorage del switch)
    }

    //-----------------------------------------------------------------------------------

    //Obtenemos las lineas existentes y llenamos el select de linea
    getLineas();

    //------------------------------------------FUNCTIOS-----------------------------------------

    //obtenemos las lineas existentes (reusamos el metodo "GetLiniesCorrugados" del api [originalmente se usa en asignacion de lineas])
    function getLineas() {
        fetch(`${WebApiURL}/api/Corrugados/GetLiniesCorrugados`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'planta': planta
            }
        })
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(jsonData => {
                if (jsonData.status === 200) {
                    //accedemos al resultado del api
                    const numLineas = jsonData.response;
                    //console.log(numLineas);

                    //llenamos el select con las lineas existentes
                    const selectLinea = $("#selectLinea");
                    selectLinea.empty(); // Limpia opciones previas
                    // Agrega opción por defecto
                    selectLinea.append($("<option>").val(0).text("Seleccione.."));

                    numLineas.forEach(item => {
                        const value = item.numLinea;
                        const text = `Linea ${value}`;
                        const option = $("<option>").val(value).text(text);
                        selectLinea.append(option);
                    });


                    loader.style.display = 'none';
                }
                else {
                    const mensaje = jsonData.response || "";
                    iziToast.info({
                        position: "topRight",
                        title: `Sin Líneas`,
                        message: `<p>${mensaje}</p>`
                    });
                    loader.style.display = 'none';
                }
            })
            .catch(error => {
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>${error.toString()}</p>`
                });
                loader.style.display = 'none';
            });
    }

    //Fncion para leer el peso de la bascula seleccionada
    async function LeerPesoBascula(idBascula) {
        //validamos que exista una bascula seleccionada, de lo contrario, enviamos null al api para que retorne que no encontro la bascula [esto para cuando el localstorage no tiene una bascula seleccionada, por ejemplo, si el usuario inicio sesion y no eligio la bascula]
        if (!idBascula) {
            idBascula = null
        }

        try {
            const response = await fetch(`${WebApiURL}/api/Basculas/ConsultarPeso/${encodeURIComponent(idBascula)}`, {
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

    //verificamos que el codigo exista y obtenemos sus datos si es valido (familia y proceso)
    async function ValidateAndGetInfoCode(codigo) {
        // armamos los datos a enviar
        let data = {
            code: codigo
        };

        try {
            const response = await fetch(`${WebApiURL}/api/Corrugados/GetDescriptionCodeScrap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const jsonData = await response.json();

                //console.log(jsonData.data);
                let articuloName = jsonData.data.NOMBREARTICULO; // obtenemos el nombre que retorna el api
                let ArrayNombre = articuloName.split(" "); // divideimos el nombre en un array, cada palabra es separada por el espacio entre estas

                // asignamos el proceso y familia segun el nombre/descripcion obtenido
                //--Proceso [no aplicamos logica como en pvc-iny, ya que el proceso siempre sera corrugados en este caso, directamente asignamos el proceso]
                $("#staticProceso").val("Corrugado");
                //if (ArrayNombre.includes("CORR")) { //si en el nombre incluye "CORR", el proceso es corrugados
                //    staticProceso.value = "Corrugado"
                //} else {
                //    staticProceso.value = ""
                //}
                //--familia (falta verificar si esta es la forma correcta de obtener la familia)
                if (ArrayNombre.includes('IPS') && ArrayNombre.indexOf('IPS') < ArrayNombre.length - 1) {
                    $("#staticFamilia").val(ArrayNombre[4]);
                    Fam = ArrayNombre[4];
                } else {
                    $("#staticFamilia").val(ArrayNombre[3]);
                    Fam = ArrayNombre[3];
                }

                return true;
            } else {
                // si no es ok, leemos el error json y lanzamos excepción para leer en catch el mensaje que viene desde el api
                const err = await response.json();
                throw new Error(err.message || 'Error desconocido');
            }
        } catch (error) {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error al validar el código`,
                message: `<p>${error.message}</p>`
            });
            return false; // retornamos false para indicar que el flujo se interrumpió
        }
    }

    //funcion para crear la vista previa del ticket
    async function TicketPrevia(Linea, CodeArticulo, PesoEnBascula) {

        //obtenemos la fecha y hora actual (solo la mostramos en el preview, pero esta fecha y hora no son las que se almacenan en bd, en bd se almacena la hora en que el operador confirme)
        var d = new Date();
        var dia = String(d.getDate()).padStart(2, '0');
        var mes = String(d.getMonth() + 1).padStart(2, '0');
        var anio = d.getFullYear();
        var h = String(d.getHours()).padStart(2, '0');
        var m = String(d.getMinutes()).padStart(2, '0');
        var fechaHora = dia + '-' + mes + '-' + anio + ' ' + h + ':' + m;

        //obtenemos el id preview para mostrar
        NextIdScrap = await ObtenerSiguienteId();

        //obtenemos el turno
        let turno = obtenerTurno();

        //asignamos los valores a los campos correspondientes en la vista previa
        $("#FechaHoraTicketPreview").text(fechaHora);
        $("#idTicketPreview").text(NextIdScrap);
        $("#lineaTicketTicketPreview").text(Linea);
        $("#itemSapTicketPreview").text(CodeArticulo);
        $("#TurnoTicketPreview").text(turno);
        $("#OperadorTicketPreview").text(nameOpdor);
        $("#pesoTicketPreview").text(PesoEnBascula);
        $("#familiaSapTicketPreview").text(Fam);

        //Des-Ocultamos el preview
        $("#DivTicketPrevia").attr("hidden", false);

        //devolvemos el default del id para un siguiente escaneo
        NextIdScrap = 0;
    }

    //funcion para obtener el siguiente id de scrap
    async function ObtenerSiguienteId() {
        try {
            const response = await fetch(`${WebApiURL}/api/Corrugados/GetScrapID`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();
            // devuelve el ID + 1 para mostrar en el preview o imprimir
            return jsonData.idScrapEncontrado + 1;
        } catch (error) {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error al obtener el siguiente id del ticket de scrap`,
                message: `<p>${error.message}</p>`
            });
            return 0; // indica error
        }
    }

    //PASO 4 - GUARDAR EL SCRAP E IMPRIMIR EL TICKET
    //Funcion para enviar el scrap a BD
    async function EnviarScrap(data) {
        loader.style.display = 'flex';

        try {
            const response = await fetch(`${WebApiURL}/api/Corrugados/AddNewDBRegisterScrap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.status}: ${errorData.message}`);
            }

            const result = await response.json();

            // Revisamos si el resultado del API es que creó o no el registro
            const scrapCreated = result.scrapCreated;

            if (scrapCreated === true) {
                iziToast.success({
                    position: "topRight",
                    title: `Scrap enviado`,
                    message: `<p>${result.mensaje}</p>`,
                });

                // Generamos el ZPL y lo imprimimos
                let zpl = await generarZPLTicket();
                console.log(zpl);
                ImprimirZPL(zpl); // Mandamos a imprimir el ZPL (Falta probar con impresora)

                NextScanClean(); // Prepara formulario, variables y ocultamos la vista previa de ticket hasta el siguiente escaneo
                loader.style.display = 'none';

            } else if (scrapCreated === false) {
                iziToast.info({
                    position: "topRight",
                    title: `El scrap no se guardó correctamente`,
                    message: `<p>${result.mensaje}</p>`,
                });
                loader.style.display = 'none';
            }
        } catch (error) {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error al guardar el scrap en BD`,
                message: `<p>${error.message}</p>`,
            });
            loader.style.display = 'none';
        }
    }

    //funcion para generar el zpl del ticket a imprimir
    async function generarZPLTicket() {
        //obtenemos los valores desde la vista previa del ticket
        const fechaHora = $("#FechaHoraTicketPreview").text();
        const idTicket = await ObtenerSiguienteId();    //obtenemos el id ticket actual para imprimir (el mostrado puede no ser el real en caso de que el operador tarde en confirmar y alguien mas consuma el id visualizado)
        const linea = $("#lineaTicketTicketPreview").text();
        const codigoItem = $("#itemSapTicketPreview").text();
        const turno = $("#TurnoTicketPreview").text();
        const operador = $("#OperadorTicketPreview").text();
        const peso = $("#pesoTicketPreview").text();
        const familiaSap = $("#familiaSapTicketPreview").text();

        let zpl = "^XA ^CI28\n"; // Inicio del ticket

        // Logo PTM (imagen convertida zpl)
        zpl += "^FO250,50^GFA,3395,3395,35,,::::::P01FC,O07JF,N0MF8,M03MFC,L01NFE,L07OF6,L0PFB,K03PF9C,K07PFDE,J01QFCF8,J03QFE7C,J07QFE7EgT0FS0F,J0SF3FN03NF007RFE1FCQ01F8,I01SFBF8M03OF01RFE1FCQ03F8,I03SF9FCM03OF80RFE1FEQ07F8,I07SF9FEM03OFE07QFE1FFQ0FF8,I0TF8FEM03PF83QFE1FF8O01FF8,001TF8FFM03PFC1QFE1FFCO03FF8,001TFCFF8L03PFE0QFE1FFEO07FF8,003TFC7FCL03QF07PFE1IFO0IF8,007TFC7FCL03QF87PFE1IF8M01IF8,00UFC7FEL03QFC3PFE1IFCM03IF8,00UFE7FFL03QFC1PFE1IFEM07IF8,00UFE7FFL03QFC1PFE1JFM0JF8,01UFE7FF8K03QFE1PFE1JF8K01JF8,01OFC01IFE7FF8K03RF0PFE1JFCK03JF8,03NF8J0FFE7FFCK03IFEI0KFJ0JF8I01JFEK07JF8,03MFCK03FC7FFCK03IFEI03JFJ07IF8I01JFEK0KF8,07LFEM07C7FFEK03IFEI01JFJ07IF8I01KFK0KF8,07LFCM03C7FFEK03IFEJ0JFJ07IF8I01KF8I01KF8,07LF8N0C7FFEK03IFEJ0JF8I07IF8I01KFCI03KF8,07KFEO047IFK03IFEJ0JF8I07IF8I01KFEI07KF8,0LFCP07IFK03IFEJ07IF8I07IF8I01LFI0LF8,0LF8P07IFK03IFEJ07IF8I07IF8I01LF801LF8,1KFEQ07IFK03IFEJ07IF8I07IF8I01LF803LF8,1KFEQ0JFK03IFEJ07IF8I07IF8I01LFC07LF8,1KFCQ0JFK03IFEJ07IF8I07IF8I01LFE07LF8,1KF8Q0JF8J03IFEJ07IF8I07IF8I01MF0MF8,1KF8P01JF8J03IFEJ07IF8I07IF8I01MF9MF8,1KFQ01JF8J03IFEJ0JF8I07IF8I01UF8,1JFEQ01JF8J03IFEJ0JF8I07IF8I01UF8,1JFEQ01JF8J03IFEJ0JFJ07IF8I01UF8,1JFCQ03JF8J03IFEI01JFJ07IF8I01UF8,1JFCQ07JF8J03IFEI07JFJ07IF8I01UF8,1JF8Q07JF8J03JF7MFJ07IF8I01UF8,1JF8Q07JF8J03RFJ07IF8I01UF8,1JF8Q0KF8J03QFEJ07IF8I01UF8,1JFQ01KF8J03QFCJ07IF8I01UF8,1JFQ01KF8J03QFCJ07IF8I01JF7KFEJF8,1JFQ03KF8J03QF8J07IF8I01JF3KFCJF8,1JFQ03KF8J03QF8J07IF8I01JF1KF8JF8,1JFQ07KFK03QFK07IF8I01JF1KF0JF8,1IFEQ0LFK03PFEK07IF8I01JF0KF0JF8,0IFEP01LFK03PFCK07IF8I01JF07IFC0JF8,0IFEP03LFK03PF8K07IF8I01JF03IFC0JF8,07FFEP07LFK03OFEL07IF8I01JF01IF00JF8,07FFE3N01LFEK03OFCL07IF8I01JF00FFE00JF8,07FFE38M03LFEK03NFEM07IF8I01JF007FC00JF8,07FFE3EM0MFEK03MFCN07IF8I01JF003F800JF8,03FFE3F8K03MFCK03IFER07IF8I01JF001F800JF8,03FFE3FFJ01NFCK03IFER07IF8I01JFI0EI0JF8,03IF1FFEI07NFCK03IFER07IF8I01JFM0JF8,01IF1UF8K03IFER07IF8I01JFM0JF8,01IF1UFL03IFER07IF8I01JFM0JF8,00IF1UFL03IFER07IF8I01JFM0JF8,007FF0UFL03IFER07IF8I01JFM0JF8,007FF8TFCL03IFER07IF8I01JFM0JF8,003FF8TFCL03IFER07IF8I01JFM0JF8,003FF87SF8L03IFER07IF8I01JFM0JF8,001FFC7SF8L03IFER07IF8I01JFM0JF8,I0FFC7SFM03IFER07IF8I01JFM0JF8,I07FE3RFEM03IFER07IF8I01JFM0JF8,I03FE1RFCM03IFER07IF8I01JFM0JF8,I01FF1RFCM03IFER07IF8I01JFM0JF8,J0FF8RFN03IFER07IF8I01JFM0JF8,J07F87PFEgL04,J03FC7PFC,J01FE3PF8,K0FF1PF,K03F8OFC,K01FC7NF8,L07E1MFE,L03F8MF8,M07E3KFE,M01F1KF8,O0C3IF,Q0FFC,,::^FS\n";

        // Fecha y hora
        zpl += "^FO300,170^A0N,25,25^FD" + fechaHora + "^FS\n";

        //concepto y valor
        zpl += "^FO170,230^A0N,33,33^FDCONCEPTO^FS\n";
        zpl += "^FO450,230^A0N,33,33^FDVALOR^FS\n";
        zpl += "^FO170,270^GB500,2,2^FS\n"; //linea de separacion

        // ID Ticket
        zpl += "^FO170,290^A0N,25,25^FDID TICKET:^FS\n";
        zpl += "^FO420,290^A0N,25,25^FD" + idTicket + "^FS\n";
        zpl += "^FO170,320^GB500,2,2^FS\n";

        // Línea
        zpl += "^FO170,340^A0N,25,25^FDLÍNEA:^FS\n";
        zpl += "^FO420,340^A0N,25,25^FD" + linea + "^FS\n";
        zpl += "^FO170,370^GB500,2,2^FS\n";

        // Código Item
        zpl += "^FO170,390^A0N,25,25^FDCÓDIGO ITEM:^FS\n";
        zpl += "^FO420,390^A0N,25,25^FD" + codigoItem + "^FS\n";
        zpl += "^FO170,420^GB500,2,2^FS\n";

        // Turno
        zpl += "^FO170,440^A0N,25,25^FDTURNO:^FS\n";
        zpl += "^FO420,440^A0N,25,25^FD" + turno + "^FS\n";
        zpl += "^FO170,470^GB500,2,2^FS\n";

        // Operador
        zpl += "^FO170,490^A0N,25,25^FDOPERADOR:^FS\n";
        zpl += "^FO420,490^A0N,25,25^FD" + operador + "^FS\n";
        zpl += "^FO170,520^GB500,2,2^FS\n";

        // Peso
        zpl += "^FO170,540^A0N,25,25^FDPESO:^FS\n";
        zpl += "^FO420,540^A0N,25,25^FD" + peso + "^FS\n";
        zpl += "^FO170,570^GB500,2,2^FS\n";

        // Familia SAP
        zpl += "^FO170,590^A0N,25,25^FDFAMILIA (SAP):^FS\n";
        zpl += "^FO420,590^A0N,25,25^FD" + familiaSap + "^FS\n";
        zpl += "^FO170,620^GB500,2,2^FS\n";

        // Leyenda "POWERED BY"
        zpl += "^FO350,650^A0N,20,20^FDPOWERED BY^FS\n";

        // Logo PDX (imagen convertida zpl)
        zpl += "^^FO280,670^GFA,2080,2080,32,,:::::::::::hL01F,hK01IF,hK07IFC,hK0JFE,01MFJ07EJ07JFEK07CI01JFCI01KF01F8I07FE,00MFCI07EJ07KFK0FEI03KFI03KF01FCI0FFC,001LFEI0FFJ07KFCJ0FFI03KFC00LF00FE001FF,I07LF001FF8I07KFCI01FFI03KFE00FFC07F807F003FC,I03LF001FF8I07KFEI01FF8003LF01FF003FC03F807E,I03EI01F801FFCI07CI07FI03FF8I07I07F81FEI07C01FC0FC,I03EJ0F803E7CI07CI03FI07EFC003EI01FC3FCI03E00FE1F8,I03EJ0F807E7EI07CI03FI07E7C003FJ0FC3F8I01E007F3F,I03EJ0F807E3EI07CI03FI0FC7E003EJ07C3F8I01F003FFE,I03EJ0F807C3FI07CI03FI0F83E003EJ07E3F8I01F001FFC,I03EI03F80F81FI07CI07F001F81F003EJ07E3F8J0FI0FF8,I03LF01F81F8007KFE001F01F003EJ07E3F8J0FI07F8,I03LF01F00F8007KFC003F01F803EJ03E3F8J0FI07F8,I03EJFE03F00FC007DJF8003E00F803EJ07E3F8J0FI0FFC,I03EJFC07E007C007DJFI07E007C03EJ07E3F8I01F001FFE,I03E7FFC007E007E007CIFEI07C007C03EJ07C3FCI01E003IF,I03EL07C003F007C007EI0F8007E03FJ0FC3FCI03E007E3F8,I03EL0FC003F007C003FI0F8003E03EI01FC1FCI03E00FC1FC,I03EL0F8001F007C001F001F8001F03EI03F81FEI07C01F80FE,I03EK01F8I0F807C001F803FI01F83LF80FEI0F803F007F,I03EK01FJ0FC07CI0FC03EJ0F83LF00FF001F807E003F8,I03EK03EJ0FC07CI07E03EJ0FC3KFC007FE0FF00FC001FC,I03EK07EJ07C07CI07E07EJ07C3KF8002JFE01F8I0FE,I03EK07CJ03E07CI03F0FCJ07E3JFCJ07IF803FJ07F,hK03IF,hL07F8,,::::R01E110F070561C1C0078383808201C101C1E12,R0101B090C056101I01060400870243034101A,R01E1B0F0C0561C1C001078403870243030160E,R01C17080D056181C001070403868243030160C,R01E11080F07E1C1I010787808683C1C3C1E04,,::::::::::::^FS\n";

        zpl += "^XZ"; // Fin del ticket

        //console.log(zpl);
        return zpl;
    }

    //funcion para mandar a imprimir el zpl generado
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


    //funcion para preparar variables y formulario para un siguiente escaneo (limpia y regresa todo a default)
    function NextScanClean() {
        barcode = ""; // limpiar para próximo código
        Peso0 = false;
        PesoEnBascula = 0;
        Fam = "";
        limpiarFormulario();

        loader.style.display = 'none';
    }

    //Funcion para limpiar el formulario
    function limpiarFormulario() {
        $('#formularioEnvioScrap')[0].reset(); //limpiamos todos los campos del formulario
        $('#staticOperador').val(nameOpdor);    //volvemos a asignar el operador (este no cambia, siempre es el mismo que inicia sesion)

        FormActivation(2); //deshabilita campos

        //volvemos a ocultar el div de la vista previa
        $("#DivTicketPrevia").attr("hidden", true);
    }

    //Funcio para obtener el turno
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
            return 1;
        } else {
            return 2;
        }
    }

    //Convierte las letras que encuentre en minuscula a mayuscula?
    function convertirAMayusculas(texto) {
        return texto.replace(/[a-z]/g, function (letra) {
            return letra.toUpperCase();
        });
    }

    //Habilita o deshabilita los input en el formulario principal
    function FormActivation(Habilitar) {
        if (Habilitar == 1) {   //Habilita los campos (Habilitar == 1)
            $(".Activar_Desactivar").prop("disabled", false);

        } else if (Habilitar == 2) {    //DES-Habilita los campos (Habilitar == 2)
            $(".Activar_Desactivar").prop("disabled", true);
        }
    }

    //------------------------------------------BTNS------------------------------------------
    //Btn Limpiar
    $('#ClearForm').click(function () {
        limpiarFormulario(); //limpia campos
    });

    //Btn Confirmar scrap (guarda en bd e imprime ticket)
    $('#BtnConfirmarScrap').click(function () {
        //Obtenemos el turno
        let turno = obtenerTurno();

        //obtenemos los datos a enviar (tomamos los valores directo del formulario)
        let data = {
            nameUser: $("#staticOperador").val(),
            code: $("#staticCodigo").val(),
            pesoBascula: parseFloat($("#staticPeso").val()),     // nos aseguramos de que lleve el formato correcto double
            proceso: $("#staticProceso").val(),
            familia: $("#staticFamilia").val(),
            coments: $("#comentariosArea").val(),
            turno: turno,
            linea: parseInt($("#selectLinea").val(), 10),   // nos aseguramos de que lleve el formato correcto int
            planta: parseInt(planta),
            scrapCorteSierra: parseInt(ScrapCortesSierra)     //1 = scrap sin corte de sierra, 2 = scrap normal
        };

        //validamos que los campos esten llenos para continuar, de lo contrario, lanzamos la alerta (solo los campos del formulario)
        let camposFaltantes = [];

        if (!data.linea) camposFaltantes.push("Línea");
        if (!data.nameUser) camposFaltantes.push("Operador");
        if (!data.code) camposFaltantes.push("Código");
        if (!data.pesoBascula) camposFaltantes.push("Peso");
        if (!data.proceso) camposFaltantes.push("Proceso");
        if (!data.familia) camposFaltantes.push("Familia");

        if (camposFaltantes.length > 0) {
            //alert("Por favor, complete los siguientes campos: " + camposFaltantes.join(", "));
            iziToast.info({
                position: "topRight",
                title: `CAMPOS FALTANTES`,
                message: `<p>Por favor, complete los siguientes campos:<br><strong>${camposFaltantes.join(", ")}</strong></p>`,
            });
            return;

        } else {
            if (ScrapCortesSierra == 1) {   //si el scrap es "sin cortes de sierra" lanzamos la alerta de confirmacion (se autoconfirma una vez terminado el tiempo)
                $.confirm({
                    //personalizamos el estilo del confirm
                    theme: 'material',
                    type: 'orange',
                    icon: 'fa fa-warning',
                    animation: 'top',
                    closeAnimation: 'top',

                    title: 'Confirmación de Scrap',
                    content: 'Se enviará, "scrap sin cortes de sierra"',
                    buttons: {
                        Confirmar: {
                            action: function () {
                                EnviarScrap(data);
                            }
                        },
                        Cancelar: function () {
                            // No hacer nada, se cancela el envío
                        }
                    },
                    autoClose: 'Confirmar|10000',   //establecemos el tiempo (10 segundos)
                    closeIcon: false,
                    backgroundDismiss: false
                });
            } else if (ScrapCortesSierra == 0) {    //si es escrap normal, lo enviamos inmediato
                EnviarScrap(data);
            }
        }

    });

    //PASO 1 - ESCANEO DEL CODIGO
    $(document).on('keydown', async function (e) {
        // Si la tecla es Enter (código 13), tomar el código acumulado
        if (e.key === "Enter") {
            if (barcode.length > 0) {

                //Una vez obtenido el codigo, verificamos que el peso no sea 0 o negativo para poder continuar el flujo (guardamos el peso ya que se esta consultando)
                let BasculaSeleccionadaNow = $('#BasculaAsigned').val(); //obtenemos la bascula seleccionada
                let RespuestaPeso = await LeerPesoBascula(BasculaSeleccionadaNow);   //usamos await para esperar a que se lea el peso

                //dependiendo de la respuesta (si se encontro un peso valido o no)
                if (RespuestaPeso == true) { //peso valido mayor a 0
                    //Comenzamos el loader
                    loader.style.display = 'flex';

                    //Limpiamos el codigo escaneado de caracteres en blanco al comienzo o final de la cadena
                    const codigoLimpio = barcode.trim();
                    //Obtenemos la linea y el codigo de articulo correspondiente
                    let Linea = codigoLimpio.substring(0, 2);// Primeros dos caracteres
                    Linea = parseInt(Linea, 10); // Convertimos la línea a número (para los codigo que dan la linea como "01, 02, etc")
                    const CodeArticulo = convertirAMayusculas(codigoLimpio.substring(2));// Resto del código (nos aseguramos de que siempre este en mayusculas para compatibilidad en BD)

                    //PASO 2- VALIDAMOS QUE EL CODIGO EXISTA
                    //Validamos que el codigo exista y obtenemos sus datos (proceso y familia)
                    const Validate = await ValidateAndGetInfoCode(CodeArticulo);

                    if (Validate == true) { //la validacion se cumplio (el codigo existe en SAP) y ahora ya tenemos la familia y el proceso en el formulario
                        //llenamos los datos que faltan de llenar en el formulario y lo habilitamos para edicones manuales
                        if ($("#selectLinea option[value='" + Linea + "']").length > 0) {   //--En linea, primero aseguramos que la linea escaneada, sea una opcion valida (que exista dentro de las lineas existentes)
                            $("#selectLinea").val(Linea);
                        } else {
                            $("#selectLinea").val(0);
                            iziToast.info({
                                position: "topRight",
                                title: `LINEA NO ENCONTRADA`,
                                message: `<p>La línea escaneada: <strong>${Linea}</strong> <br> No existe dentro de las lineas creadas. <br> Favor de verificar con el administrador que la linea haya sido creada</p>`,
                            });
                        }
                        $("#staticCodigo").val(CodeArticulo);
                        $("#staticPeso").val(PesoEnBascula);

                        //PASO 3, CREAMOS LA VISTA PREVIA DEL TICKET A IMPRIMIR
                        TicketPrevia(Linea, CodeArticulo, PesoEnBascula);

                        //Habilitamos el formulario para edicion manual y limpiamos variables de codigo y peso, en caso de que se haga otro escaneo sin limpiar el formulario o mandar el scrap a bd
                        FormActivation(1); //Habilitamos el formulario
                        barcode = ""; // limpiar para próximo código
                        Peso0 = false;
                        PesoEnBascula = 0;

                        loader.style.display = 'none';

                    } else if (Validate == false) { //la validacion del codigo no se completo, terminamos el flujo (los mensajes de excepciones ya se manejan en la funcion de ValidateAndGetInfoCode)
                        //Preparamos para la siguiene lectura
                        NextScanClean();
                        return;
                    }

                }
                else if (RespuestaPeso == false) {   //peso invalido menor o igual a 0
                    iziToast.error({
                        position: "topRight",
                        title: `PESO 0`,
                        message: `<p>El peso registrado es 0 o menor, por favor verifique la báscula.<br> <strong>Peso leído: ${PesoEnBascula}</strong></p>`,
                    });

                    //Preparamos para la siguiene lectura
                    NextScanClean();
                }
                else if (RespuestaPeso == null) {    //si se encontro un error, no hacer nada la funcion de lectura de peso ya maneja los errores            

                    //Preparamos para la siguiene lectura
                    NextScanClean();
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
    // cambio del switch (guardamos si es corte de sierra o no)
    $('#SwitchScrapCortesSierra').change(function () {
        if ($(this).is(':checked')) {
            //Guardamos la posicion en localstorage (Activado)
            localStorage.setItem('estadoSwitchScrapCortesSierra', '1');
            //cambiamos la bandera para saber el tipo de scrap (1 = scrap corte de cierra, 0 = scrap normal)
            ScrapCortesSierra = 1;
        } else {
            //Guardamos la posicion en localstorage (DES-activado)
            localStorage.setItem('estadoSwitchScrapCortesSierra', '0');
            //cambiamos la bandera para saber el tipo de scrap (1 = scrap corte de cierra, 0 = scrap normal)
            ScrapCortesSierra = 0;
        }
    });
});