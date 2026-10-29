const urlApi = "http://129.80.97.150:9096/api"
//variables
let tableTickets;   //tabla principal
let loader = document.getElementById("loaderDiv");
let ZplPritn;   //aqui guardamos el zpl previsualizado para mandarlo a imprimir si el usuario lo desea
let WebApiURL = localStorage.getItem("webapiurl");
let planta = localStorage.planta == '335' ? '2' : '1';

//funcion principal...
$(document).ready(() => {
    /*localStorage.planta == "335" ? plantaID = "2" : plantaID = "1";*/
    loader.style.display = 'flex';  //comenzamos el loader (lo detenemos al llenar la tabla principal)

    //configuramos la tabla
    tableTickets = $("#tableTickets").DataTable({
        ordering: false,
        responsive: true
    })

    //-----------------------------------------------------------------------------------

    //obtenemos los tickets existentes para mostrarlos en la tabla
    peticionObtenerTickets();


    //------------------------------------------FUNCTIOS-----------------------------------------
    //Para obtener los tickets a reeimprimir (llena la tabla principañ)
    function peticionObtenerTickets() {//})
        fetch(`${WebApiURL}/api/InfoTickets/GetTickets2`, {    //Conecta directo al api, sin controller intermedio [la url la inyectamos desde el web.config en el html del layout]
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "numplanta": planta,
                "process": "Corrugado"
            }
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            let tickets = jsonData.ticketsInfos
            let Rows = []
            for (x = 0; x < tickets.length; x++) {
                //creamos el boton para abrir el modal de reimpresion
                //let btnReimprimir = `<buton class="btn btn-info" data-toggle="modal" data-target="#TicketModal" data-id="${tickets[x].idTicket}" onclick="ReimprimirTicket(this)">Reimpresión</buton>`;
                let btnReimprimir = `<buton class="btn btn-info btnReimprimirTicket" value = "${tickets[x].idTicket}" >Reimpresión</buton>`;
                Rows.push([
                    tickets[x].folio,
                    tickets[x].ordenFabricacion,
                    tickets[x].itemCode,
                    tickets[x].itemName,
                    btnReimprimir
                ])
            }

            //dibujamos los registros en la tabla
            tableTickets.rows.add(Rows).draw();
            loader.style.display = "none";
        }).catch((error) => {
            loader.style.display = "none";
        })
    }

    //para filtrar tickets
    function FiltrarTickets() {
        loader.style.display = 'flex';

        let folioT;
        let turnoT;
        let fechaInicioT;
        let fechaFinT;

        let folio = document.getElementById("folioInp").value;
        let turno = document.getElementById("turnoInp").value;
        let fechaInicio = document.getElementById("fechaInicioInp").value;
        let fechaFin = document.getElementById("fechaFinInp").value;

        //si no se selecciona ningun filtro, realizamos la busqueda default
        if (folio == "" && turno == "" && fechaInicio == "" && fechaFin == "") {
            tableTickets.clear().draw();    //limpiar tabla de registros pasados
            peticionObtenerTickets();
            return;
        }

        // Si turno es 1 o 2 y hay fechaInicio, calculamos fechaFin = fechaInicio + 1 día (ya que fechaFin se encuentra deshabilitado para evitar errores de operador)
        if ((turno === "1" || turno === "2") && fechaInicio !== "") {
            const d = new Date(fechaInicio);     // fechaInicio viene como 'yyyy-mm-dd'
            d.setDate(d.getDate() + 2);          // sumamos 1 día

            // Formatear de vuelta a 'yyyy-mm-dd' [web:6]
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            fechaFin = `${year}-${month}-${day}`;
        }

        //si el turnos es "0" (seleccione), significa que el usuario esta buscando tickets de turno 1 0 2, asi que mandamos "turno" como "", para que el api devuelva los resultados de truno 1 o 2
        if (turno == "0") {
            turno = "";
        }

        folio == "" ? folioT = '' : folioT = folio.toString();
        turno == "" ? turnoT = '' : turnoT = turno.toString();
        fechaInicio == "" ? fechaInicioT = '' : fechaInicioT = fechaInicio.toString();
        fechaFin == "" ? fechaFinT = '' : fechaFinT = fechaFin.toString();

        //fetch(`${urlApi}/InfoTickets/FilterTickets2`, {
        fetch(`${WebApiURL}/api/InfoTickets/FilterTickets2`, {    //Conecta directo al api, sin controller intermedio [la url la inyectamos desde el web.config en el html del layout]
            method: "GET",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "folio": folioT,
                "turno": turnoT,
                "fechaInicio": fechaInicioT,
                "fechaFin": fechaFinT,
                "planta": planta,
                "proceso": "Corrugado"
            }
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response);
        }).then((jsonData) => {
            //console.log(jsonData);
            tableTickets.clear().draw();    //limpiar tabla de registros pasados
            let ticketsInfo = jsonData.tickets;

            let rows = [];
            for (let x = 0; x < ticketsInfo.length; x++) {
                let btnReimprimir = `<buton class="btn btn-info btnReimprimirTicket" value = "${ticketsInfo[x].idTicket}" >Reimpresión</buton>`;
                rows.push([
                    ticketsInfo[x].folio,
                    ticketsInfo[x].ordenFabricacion,
                    ticketsInfo[x].itemCode,
                    decodeURIComponent(ticketsInfo[x].itemName),
                    btnReimprimir
                ])
            }
            //dibujamos los registros encontrados
            tableTickets.rows.add(rows).draw();
            loader.style.display = "none";
        }).catch((error) => {
            loader.style.display = "none";
            console.log(error);
        })
    }

    //genera el zpl y abre el modal de acuerdo al registro seleccionado, para previsualizar el ticket a imprimir
    async function PreviewTicket(idRempresion) {
        let id = idRempresion
        fetch(`${WebApiURL}/api/InfoTickets/GetTicketById`, {   //Conecta directo al api, sin controller intermedio [la url la inyectamos desde el web.config en el html del layout]
            method: "GET",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "id": id
            }
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then(async (jsonData) => {

            //desglosamos los datos que usaremos en el zpl
            const fechaHora = ConvertDate(jsonData.ticketsInfos[0].fechaPesaje);
            const folio = jsonData.ticketsInfos[0].folio;
            const turno = jsonData.ticketsInfos[0].turno;
            const linea = jsonData.ticketsInfos[0].id_Linea;
            const operacion = jsonData.ticketsInfos[0].operacion;
            const codigo = jsonData.ticketsInfos[0].itemCode;
            const numTubos = jsonData.ticketsInfos[0].numTubos;
            const pesoNeto = jsonData.ticketsInfos[0].pesoNeto.toFixed(2) + " KG";
            const pesoTubos = jsonData.ticketsInfos[0].pesoTubo.toFixed(2) + " KG";
            const sobrepeso = jsonData.ticketsInfos[0].porcentaje.toFixed(2) + " %";
            const Of = jsonData.ticketsInfos[0].ordenFabricacion;
            const descripcion = jsonData.ticketsInfos[0].itemName;

            //armamos el zpl
            let zpl = await generarZPLTicketReimpresion(fechaHora, folio, turno, linea, operacion, codigo, numTubos, pesoNeto, pesoTubos, sobrepeso, Of, descripcion);
            //guardamos el zpl globalmente, por si se imprime
            ZplPritn = zpl;

            //para previsualizar el zpl (preview del ticket) usamos el api de labelary para generar la imagen
            const res = await fetch('https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'image/png'
                },
                body: zpl
            });

            const buffer = await res.arrayBuffer();

            //Convertir buffer a base64 e insertar en modal
            const base64 = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            const img = document.createElement('img');
            img.src = `data:image/png;base64,${base64}`;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.alt = 'Preview del ticket';

            // Limpiar y agregar imagen al modal-body
            const modalBody = document.getElementById('modal-ticket-body');
            modalBody.innerHTML = '';  // limpiar contenido anterior
            modalBody.appendChild(img);

            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('TicketModal'));
            modal.show();

        })
        .catch((error) => {
            // loader.style.display = 'none';
            console.error('Error:', error);
            alert('Error al cargar preview: ' + error.message);
        });
    }

    async function generarZPLTicketReimpresion(fechaHora, folio, turno, linea, operacion, codigo, numTubos, pesoNeto, pesoTubos, sobrepeso, Of, descripcion){
        //La descripcion puede ser muy larga, por lo que la dividiremos en varias lineas que incertamos "dinamicamente"
        const lineasDesc = dividirDescripcion(descripcion, 20);
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

        // Leyenda "POWERED BY" (sumamos 60 a la ultima posicion de "descripcion")
        zpl += `^FO350,${dyUltima + 60}^A0N,20,20^FDPOWERED BY^FS\n`;

        // Logo PDX (imagen convertida zpl) (sumamos 80 a la ultima posicion de "descripcion")
        zpl += `^^FO280,${dyUltima + 80}^GFA,2080,2080,32,,:::::::::::hL01F,hK01IF,hK07IFC,hK0JFE,01MFJ07EJ07JFEK07CI01JFCI01KF01F8I07FE,00MFCI07EJ07KFK0FEI03KFI03KF01FCI0FFC,001LFEI0FFJ07KFCJ0FFI03KFC00LF00FE001FF,I07LF001FF8I07KFCI01FFI03KFE00FFC07F807F003FC,I03LF001FF8I07KFEI01FF8003LF01FF003FC03F807E,I03EI01F801FFCI07CI07FI03FF8I07I07F81FEI07C01FC0FC,I03EJ0F803E7CI07CI03FI07EFC003EI01FC3FCI03E00FE1F8,I03EJ0F807E7EI07CI03FI07E7C003FJ0FC3F8I01E007F3F,I03EJ0F807E3EI07CI03FI0FC7E003EJ07C3F8I01F003FFE,I03EJ0F807C3FI07CI03FI0F83E003EJ07E3F8I01F001FFC,I03EI03F80F81FI07CI07F001F81F003EJ07E3F8J0FI0FF8,I03LF01F81F8007KFE001F01F003EJ07E3F8J0FI07F8,I03LF01F00F8007KFC003F01F803EJ03E3F8J0FI07F8,I03EJFE03F00FC007DJF8003E00F803EJ07E3F8J0FI0FFC,I03EJFC07E007C007DJFI07E007C03EJ07E3F8I01F001FFE,I03E7FFC007E007E007CIFEI07C007C03EJ07C3FCI01E003IF,I03EL07C003F007C007EI0F8007E03FJ0FC3FCI03E007E3F8,I03EL0FC003F007C003FI0F8003E03EI01FC1FCI03E00FC1FC,I03EL0F8001F007C001F001F8001F03EI03F81FEI07C01F80FE,I03EK01F8I0F807C001F803FI01F83LF80FEI0F803F007F,I03EK01FJ0FC07CI0FC03EJ0F83LF00FF001F807E003F8,I03EK03EJ0FC07CI07E03EJ0FC3KFC007FE0FF00FC001FC,I03EK07EJ07C07CI07E07EJ07C3KF8002JFE01F8I0FE,I03EK07CJ03E07CI03F0FCJ07E3JFCJ07IF803FJ07F,hK03IF,hL07F8,,::::R01E110F070561C1C0078383808201C101C1E12,R0101B090C056101I01060400870243034101A,R01E1B0F0C0561C1C001078403870243030160E,R01C17080D056181C001070403868243030160C,R01E11080F07E1C1I010787808683C1C3C1E04,,::::::::::::^FS\n`;

        zpl += "^XZ"; // Fin del ticket

        //console.log(zpl);
        return zpl;
    }

    //imprime el ticket visualizado en el modal
    async function Imprimir(ZplPritn) {
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
            printer.send(ZplPritn, function () {
                //console.log("Impresión enviada correctamente.");

                iziToast.success({
                    position: "topRight",
                    title: `Impresión exitosa`,
                    message: `<p>Se ha completado el proceso correctamente</p>`,
                });

            }, function (error) {
                console.error("Error al enviar impresión: ", error);
                //alert("Error al imprimir: " + error);
                iziToast.error({
                    position: "topRight",
                    title: `IMPRESION NO REALIZADA`,
                    message: `<p>Error al imprimir: " + ${error}</p>`,
                });
            });
        }, function (error) {
            iziToast.error({
                position: "topRight",
                title: `SIN IMPRESORA`,
                message: `<p>Error al buscar impresora: " + ${error}</p>`,
            });
        });

    }

    //desactiva el input "a fecha" en el filtro de busqueda dependiendo del turno seleccionado
    function VerifyTurn(element) {
        const valoresValidos = ['1', '2'];

        if (valoresValidos.includes(element.options[element.selectedIndex].value)) {
            document.getElementById('fechaFinInp').disabled = true
            document.getElementById('fechaFinInp').value = ""
        } else {
            document.getElementById('fechaFinInp').disabled = false
        }
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

    //para dar formato a la fecha
    function ConvertDate(dateTime) {
        const fecha = new Date(dateTime);
        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();
        var date = `${day}/${month}/${year}`
        //console.log(date)
        var hours = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'PM' : 'AM'}`
        //console.log(hours)
        let listInfoDate = `${date} ${hours}`
        return listInfoDate
    }

    //BTNS
    //btn para buscar en el filtro de busqueda
    $(document).on("click", "#searchTickets", function () {
        FiltrarTickets();
    });

    //btn para abrir el modal de "reimpresion" del registro seleccionado
    $(document).on("click", ".btnReimprimirTicket", async function () {
        let idReimpresion = $(this).attr("value");
        await PreviewTicket(idReimpresion)
    });

    //btn imprimir el ticket visualizado (dentro del modal)
    $(document).on("click", "#BtnPrintModal", async function () {
        alert("print")
        //Imprimir(ZplPritn);
    });

    //verificar el turno para desactivar "aFecha"
    $("#turnoInp").change(function () {
        VerifyTurn(this); // Llama a la función VerifyTurn con el elemento seleccionado
    });

})

