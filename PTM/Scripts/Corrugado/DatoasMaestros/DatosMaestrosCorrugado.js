let WebApiURL = localStorage.getItem("webapiurl"); //URL del API (se guarda al iniciar sesion)
let UserNameSes = localStorage.getItem("usuario"); //Nombre del usuario en sesion

// ========================================
// APP PRINCIPAL
// ========================================
class DatosMaestrosApp {
    constructor() {
        this.loader = document.getElementById('loaderDiv');
        this.planta = localStorage.planta == '335' ? '2' : '1';
        this.tableDatosMestros = null;

        this.datosMaestrosManager = new DatosMaestrosManager(this);
        this.detalleSkuManager = new DetalleSkuManager(this, this.datosMaestrosManager);
        this.excelManager = new ExcelManager(this);

        window.AppDatosMaestros = this;
    }

    inicializar() {
        this.inicializarTabla();
        this.configurarEventos();
        this.datosMaestrosManager.PeticionApiSKU();
    }

    inicializarTabla() {
        this.loader.style.display = 'flex';

        this.tableDatosMestros = $('#DatosMaestros').DataTable({
            ordering: false,
            responsive: true,
            columnDefs: [
                { targets: 1, className: 'text-start' },  // Descripción
                { width: "90px", targets: 6 },            // Tara
                { width: "120px", targets: 7 }            // Acciones
            ],
            drawCallback: function () {
                var contador = document.getElementById('dmcCount');
                if (contador) contador.textContent = this.api().rows().count();
            },
            language: {
                decimal: "",
                emptyTable: "Sin registros para mostrar",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                lengthMenu: "Mostrar _MENU_ registros",
                loadingRecords: "Cargando...",
                processing: "Procesando...",
                search: "Buscar:",
                zeroRecords: "No se encontraron resultados",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                }
            }
        });
    }

    configurarEventos() {

        // Cerrar los modales con sus botones. data-dismiss no siempre
        // responde cuando el modal se abre por JavaScript.
        $(document).on('click', '#updateCode [data-dismiss="modal"], #modalDetalleSKU [data-dismiss="modal"]', (e) => {
            e.preventDefault();
            const $modal = $(e.currentTarget).closest('.modal');
            if ($modal.length) $modal.modal('hide');
        });

        // Ver detalles SKU
        $(document).on('click', '.btn-details', (e) => {
            const id = $(e.currentTarget).data('id');
            this.datosMaestrosManager.verDetallesSKU(id);
        });

        // Actualizar ItemCode
        $(document).on("click", ".ActualizarSKU", () => {
            this.detalleSkuManager.ActualizarSKU();
        });

        $(document).on('click', '#btnAgregarLinea', () => {
            this.detalleSkuManager.agregarLineaUI();
        });

        $(document).on('click', '#BtnAddCode', () => {
            this.detalleSkuManager.agregarCodigo(this.planta);
        });
        // Exportar Excel
        $(document).on('click', '#btnExportExcel', () => {
            this.excelManager.generarexcelDm();
        });
    }
}


// ========================================
// DATOS MAESTROS MANAGER
// ========================================
class DatosMaestrosManager {

    constructor(app) {
        this.app = app;
        this.skuInfo = [];
        this.dataSapHana = [];
    }

    async PeticionApiSKU() {

        this.app.loader.style.display = 'flex';

        const data = {
            planta: this.app.planta,
            proceso_ignorado: "PPVC,PT,INY",
            corrugado: "SI",
            ignorenewscale: 1
        };

        try {

            const response = await fetch("/DatosMaestros/GetAllPt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            });

            const jsonString = await response.json();

            if (jsonString.status == 200) {

                const responseJson = JSON.parse(jsonString.data);
                this.dataSapHana = responseJson.data ?? [];
                this.skuInfo = responseJson.skuInfo ?? [];

                // Índice de skuInfo por código para hacer el match sin recorrer el arreglo cada vez
                const skuInfoMap = new Map(
                    this.skuInfo.map(s => [String(s.itemCode).trim(), s])
                );

                const iconNo = '<span class="dm-badge dm-badge-no">No</span>';
                const iconSi = '<span class="dm-badge dm-badge-ok">Sí</span>';

                let rows = [];

                // El listado sale de HANA
                for (const item of this.dataSapHana) {

                    const codigoItem = item.codigoitem;
                    const info = skuInfoMap.get(String(codigoItem).trim());

                    let fechaActualizacion = '<span class="dm-muted">No Existe Actualización</span>';
                    let usuario = '<span class="dm-muted">No Existe Actualización</span>';
                    let iconUpdate = iconNo;
                    let tara = 0;
                    let proceso = "Corrugado";

                    // skuInfo solo enriquece si existe match
                    if (info) {
                        const isUpdate = UtilsDatosMaestros.ExisteActualizacion(info.lastUpdate);

                        fechaActualizacion = UtilsDatosMaestros.ConvertDate(info.lastUpdate);
                        usuario = info.usuario || '<span class="dm-muted">No Existe Actualización</span>';
                        iconUpdate = isUpdate ? iconSi : iconNo;
                        tara = info.variable;
                        proceso = (info.proceso && info.proceso !== "N/A") ? info.proceso : "Corrugado";
                    }

                    rows.push([
                        codigoItem,
                        item.nombre ?? 'N/A',
                        `<span class="dmc-proceso">${proceso}</span>`,
                        iconUpdate,
                        fechaActualizacion,
                        usuario,
                        tara,
                        `<button class="btn btn-outline-info btn-details" data-id="${codigoItem}">
                        Ver detalles
                    </button>`
                    ]);
                }

                this.app.tableDatosMestros.clear();
                this.app.tableDatosMestros.rows.add(rows).draw();
                this.app.tableDatosMestros.columns.adjust().draw();

                this.app.loader.style.display = 'none';

            } else {

                iziToast.error({
                    position: "topRight",
                    title: "Error",
                    message: jsonString
                });

                this.app.loader.style.display = 'none';
            }

        } catch (error) {

            console.error(error);

            iziToast.error({
                position: "topRight",
                title: "Error",
                message: "Error al conectar con servidor"
            });

            this.app.loader.style.display = 'none';
        }
    }

    verDetallesSKU(id) {
        this.app.detalleSkuManager.cargarDetalle(id);
    }
}


// ========================================
// EXCEL MANAGER
// ========================================
class ExcelManager {

    constructor(app) {
        this.app = app;
    }

    generarexcelDm() {

        this.app.loader.style.display = "flex";

        const data = this.app.tableDatosMestros.rows().data().toArray();

        const filteredData = data.map(row => {
            return row
                .filter((_, index) => index !== 3 && index !== row.length - 1) // quita columna icono
                .map(cell => typeof cell === 'string'
                    ? cell.replace(/<[^>]*>?/gm, '') // limpia HTML
                    : cell
                );
        });

        const datos = new FormData();
        datos.append("matrizdatos", JSON.stringify(filteredData));

        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/DatosMaestros/getexcel', true);

        xhr.onload = () => {

            if (xhr.status === 200) {

                const respuesta = JSON.parse(xhr.responseText);

                if (respuesta.R == 1) {
                    this.descargarArchivo('Datos Maestros Articulo.xlsx', respuesta.data);
                    iziToast.success({
                        title: "Éxito",
                        message: "Excel generado correctamente"
                    });
                } else {
                    iziToast.error({
                        title: "Error",
                        message: "No se pudo generar el archivo"
                    });
                }

            } else {
                iziToast.error({
                    title: "Error",
                    message: "Error en la petición al servidor"
                });
            }

            this.app.loader.style.display = "none";
        };

        xhr.onerror = () => {
            iziToast.error({
                title: "Error",
                message: "Error de red al generar Excel"
            });

            this.app.loader.style.display = "none";
        };

        xhr.send(datos);
    }

    descargarArchivo(nombreArchivo, base64String) {

        const enlace = document.createElement('a');

        enlace.href = 'data:application/vnd.ms-excel;base64,' + base64String;
        enlace.download = nombreArchivo;

        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }
}


// ========================================
// UTILS
// ========================================
class UtilsDatosMaestros {

    static ConvertDate(dateTime) {

        const fecha = new Date(dateTime);

        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();

        const date = `${day}/${month}/${year}`;
        const hours = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;

        return `${date} ${hours}`;
    }

    static ExisteActualizacion(fechaActualizacion) {

        const fecha = new Date(fechaActualizacion);
        const horaActual = new Date();

        // Turno 1: 04:30 a 16:30
        const inicioTurno1 = new Date();
        inicioTurno1.setHours(4, 30, 0, 0);

        const finTurno1 = new Date();
        finTurno1.setHours(16, 30, 0, 0);

        // Turno 2: 16:30 a 04:30 del dia siguiente
        const inicioTurno2 = new Date();
        inicioTurno2.setHours(16, 30, 0, 0);

        const finTurno2 = new Date();
        finTurno2.setDate(finTurno2.getDate() + 1);
        finTurno2.setHours(4, 30, 0, 0);

        if (horaActual > inicioTurno1 && horaActual < finTurno1) {
            return fecha > inicioTurno1 && fecha < finTurno1;
        }

        // Si es de madrugada, el turno 2 empezo el dia anterior
        if (horaActual.getHours() < 4 || (horaActual.getHours() === 4 && horaActual.getMinutes() <= 30)) {
            inicioTurno2.setDate(inicioTurno2.getDate() - 1);
            finTurno2.setDate(finTurno2.getDate() - 1);
        }

        return fecha > inicioTurno2 && fecha < finTurno2;
    }
}

// ========================================
// DetalleSkuManager
// ========================================
class DetalleSkuManager {

    constructor(app, datosMaestrosManager) {
        this.app = app;
        this.skuActual = null;
        this.datosMaestrosManager = datosMaestrosManager;
        this.configurarInputsNumericos();
    }

    async cargarDetalle(id) {

        this.skuActual = id;
        //ID a actualizar
        $("#updateCodeInp").val(this.skuActual);

        await Promise.all([
            this.GetSkuDetails(id),
            this.ObtenerInfoPorLinea(id)
        ]);
    }

    // ========================================
    // OBTENER DETALLES SKU
    // ========================================

    async GetSkuDetails(SKU) {

        this.app.loader.style.display = 'flex';

        try {

            const response = await fetch('/DetallesSku/GetPTbySku', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sku: SKU,
                    planta: this.app.planta,
                    ignorenewscale: "1"
                })
            });

            const jsonData = await response.json();

            if (jsonData.status == 200) {

                const jsonResult = JSON.parse(jsonData.data);
                const data = jsonResult.data[0];
                const skuInfo = jsonResult.skuInfos;

                // llenar info general
                this.setValue('#skuCode', data.codigoitem);
                this.setValue('#ItemName', data.nombre);
                this.setValue('#CategorySKU', data.categoria);
                $("#ProcesoSku").val("Corrugado");   //esta vista es solo de corrugado
                this.setValue('#minWeight', data.pesominimo);
                this.setValue('#maxWeight', data.pesomaximo);

                // crear material embalaje
                this.crearMaterialEmb(data);

                if (skuInfo.length != 0) {

                    $('#inputMultiplo').val(skuInfo[0].multiploCant);
                    $('#selectMulti').val(skuInfo[0].multiploCategoria);
                    $('#inputVariable').val(skuInfo[0].variable);

                    // llenar material embalaje
                    this.llenarMaterialEmb(skuInfo[0]);

                }

                else {

                    iziToast.info({
                        position: "topRight",
                        title: "Código sin datos de embalaje",
                        message: `El código ${this.skuActual} no tiene datos de embalaje`
                    });

                }

                $('#modalDetalleSKU').modal('show');

            }

            else {

                iziToast.info({
                    title: "Código no encontrado en SAP",
                    message: "No se encontró el código en SAP, favor de validar."
                });

            }

        } catch (error) {

            console.error(error);

        }

        this.app.loader.style.display = 'none';

    }

    // ========================================
    // CREAR MATERIAL EMBALAJE
    // ========================================

    crearMaterialEmb(data) {

        const CorrMatEmb = ["Fleje", "Costales", "Tarima"];

        $('#divMatEmb').empty();

        CorrMatEmb.forEach(item => {

            $('#divMatEmb').append(`
                <div class="col-lg-4">
                    ${item}
                    <div>
                        <input class="form-control FormControlTexts" 
                               type="number" 
                               id="input${item}" />
                    </div>
                </div>
            `);

        });

    }

    // ========================================
    // LLENAR MATERIAL EMBALAJE
    // ========================================

    llenarMaterialEmb(data) {

        $('#inputFleje').val(data.flejeCant ?? '');
        $('#inputAnillo').val(data.anilloCant ?? '');
        $('#inputMadera').val(data.maderaCant ?? '');

        $('#inputCostales').val(data.costalesCant ?? '');
        $('#inputArpilla').val(data.arpillaCant ?? '');
        $('#inputTarima').val(data.tarimaCant ?? '');

    }

    // ========================================
    // RENDER DETALLE
    // ========================================

    renderDetalle(data) {

        $('#detalleSkuContainer').empty();

        $('#detalleSkuContainer').html(`
        <div class="row">
        <div class="col-4">
        <label>SKU</label>
        <input class="form-control" value="${data.codigoitem}" disabled>
        </div>

        <div class="col-4">
        <label>Nombre</label>
        <input class="form-control" value="${data.nombre}" disabled>
        </div>

        <div class="col-4">
        <label>Categoria</label>
        <input class="form-control" value="${data.categoria}" disabled>
        </div>
        </div>`);
    }


    // ========================================
    // DETALLES LINEA
    // ========================================

    async ObtenerInfoPorLinea(sku) {

        try {

            const response = await fetch('/DetallesSKU/ObtenerInfoLinea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sku: sku,
                    planta: this.app.planta
                })
            });

            const jsonData = await response.json();

            if (jsonData.status == 200) {

                const DetailsJson = JSON.parse(jsonData.data);
                const SkuDetailLinea = DetailsJson.skuDetailLinea;

                $('#divDetailsLine').empty();

                if (SkuDetailLinea.length === 0) {

                    $('#divDetailsLine').html(`
                    <div class="col-12 text-center text-muted">
                    No existen detalles de línea
                    </div>
                    `);

                    return;
                }

                SkuDetailLinea.forEach(item => {
                    let eficiencia;

                    if (item.kgHora == 0 || item.kgHora == null) {

                        eficiencia = "No existe ultimo registro";

                    } else {

                        eficiencia = item.pesoTotal / (item.kgHora * 24) * 100;
                        eficiencia = eficiencia.toFixed(2);

                        if (eficiencia == 0.00) {
                            eficiencia = "No existe ultimo registro";
                        }

                    }
                    $('#divDetailsLine').append(`

                    <div class="col-md-3 mt-3">
                    <input class="form-control KgHoraClass" value="${item.kgHora ?? ''}">
                    </div>

                    <div class="col-md-3 mt-3">
                    <input readonly class="form-control EficienciaClass" value="${eficiencia ?? ''}">
                    </div>

                    <div class="col-md-3 mt-3">
                    <input class="form-control LineaClass" value="${item.linea ?? ''}">
                    </div>

                    <div class="col-md-3 mt-3">
                    <input class="form-control PlantaClass" 
                           value="${item.planta ?? ''}" 
                           valueId="${item.id}" 
                           readonly>
                    </div>

                    `);

                });

            }

        } catch (error) {
            console.error(error);
        }

    }

    agregarLineaUI() {

        $('#divDetailsLine').append(`
        <div class="col-md-3 mt-3">
            <input class="form-control KgHoraClass" placeholder="Kg/Hr">
        </div>

        <div class="col-md-3 mt-3">
            <input readonly class="form-control EficienciaClass" value="Nuevo">
        </div>

        <div class="col-md-3 mt-3">
            <input class="form-control LineaClass" placeholder="Linea">
        </div>

        <div class="col-md-3 mt-3">
            <input class="form-control PlantaClass" 
                   value="${this.app.planta}" 
                   valueId="0" 
                   readonly>
        </div>
    `);

    }

    setValue(selector, value) {

        if (value === null || value === undefined || value === '') {
            $(selector).val('—');
        } else {
            $(selector).val(value);
        }

    }

    // ========================================
    // ACTUALIZAR SKU
    // ========================================

    async ActualizarSKU() {

        const lineaActualizada = await this.ActualizarDetailsLinea();

        if (!lineaActualizada) {
            return;
        }

        let faltante = [];

        if ($("#ProcesoSku").val() == 0) faltante.push('Proceso');
        if ($("#inputMultiplo").val() == '') faltante.push('Multiplo');
        if ($("#selectMulti").val() == 0) faltante.push('Seleccion del multiplo');
        if ($("#inputVariable").val() == '') faltante.push('Variable');

        if (faltante.length != 0) {

            iziToast.info({
                title: `Campos faltantes`,
                message: `<strong>${faltante}</strong>`
            });

            return;
        }

        let data = {

            id: this.skuActual,
            MultiploCant: $("#inputMultiplo").val(),
            MultiploCat: $("#selectMulti").val(),
            Variable: $("#inputVariable").val(),
            itemName: $("#ItemName").val(),
            minWeight: $("#minWeight").val(),
            flejeCant: $("#inputFleje").val() || '0',
            anilloCant: $("#inputAnillo").val() || '0',
            maderaCant: $("#inputMadera").val() || '0',
            arpillaCant: $("#inputArpilla").val() || '0',
            costalesCant: $("#inputCostales").val() || '0',
            tarimaCant: $("#inputTarima").val() || '0',
            planta: this.app.planta,
            usuario: UserNameSes,
            proceso: $("#ProcesoSku").val()

        };

        this.PeticionActualizarSku(data);

    }

    async PeticionActualizarSku(data) {

        this.app.loader.style.display = 'flex';

        try {

            const response = await fetch("/DetallesSKU/UpdateMaterialEmbalaje", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const jsonData = await response.json();

            if (jsonData.status == 200) {

                iziToast.success({
                    title: "Actualizado",
                    message: "SKU actualizado correctamente"
                });

                //refrescamos la tabla para ver la fecha/usuario/actualizado
                this.app.datosMaestrosManager.PeticionApiSKU();

                setTimeout(() => {
                    $('#modalDetalleSKU').modal('hide');
                }, 3000); // 1.5 segundos

            } else {

                iziToast.error({
                    title: "Error",
                    message: "Error al actualizar"
                });

            }

        } catch (error) {

            console.error(error);

        }

        this.app.loader.style.display = 'none';

    }

    async ActualizarDetailsLinea() {

        let data = [];

        let kgHoraElements = document.getElementsByClassName('KgHoraClass');
        let lineaElements = document.getElementsByClassName('LineaClass');
        let idsElements = document.getElementsByClassName('PlantaClass');

        let lineasSet = new Set();

        $('.KgHoraClass, .LineaClass').removeClass('input-error');

        for (let i = 0; i < kgHoraElements.length; i++) {

            let kgHora = kgHoraElements[i].value.trim();
            let linea = lineaElements[i]?.value?.trim() || '';
            let id = idsElements[i]?.getAttribute('valueId');

            let kgHoraNum = Number(kgHora);
            let lineaNormalizada = linea.toLowerCase().trim();

            // incompleto
            if ((kgHora && !linea) || (!kgHora && linea)) {
                iziToast.warning({
                    title: "Campos incompletos",
                    message: `La fila ${i + 1} está incompleta`
                });

                kgHoraElements[i].classList.add("input-error");
                lineaElements[i].classList.add("input-error");

                return false;
            }

            // ambos vacíos
            if (!kgHora && !linea) {

                // 🚨 si es nueva → ERROR
                if (!id || Number(id) === 0) {
                    iziToast.warning({
                        title: "Fila vacía",
                        message: `Debe llenar la nueva línea antes de guardar`
                    });

                    kgHoraElements[i].classList.add("input-error");
                    lineaElements[i].classList.add("input-error");

                    return false;
                }

                // ✔️ si es existente → se ignora (no la modificaron)
                continue;
            }

            // kgHora inválido
            if (!kgHora || isNaN(kgHoraNum) || kgHoraNum <= 0) {
                iziToast.warning({
                    title: "KgHora inválido",
                    message: `La fila ${i + 1} tiene un KgHora incorrecto`
                });

                kgHoraElements[i].classList.add("input-error");

                return false;
            }

            // duplicado
            if (lineasSet.has(lineaNormalizada)) {
                iziToast.warning({
                    title: "Línea duplicada",
                    message: `La línea "${linea}" está repetida`
                });

                lineaElements[i].classList.add("input-error");

                return false;
            }

            lineasSet.add(lineaNormalizada);

            data.push({
                kgHora: kgHoraNum,
                linea: linea,
                id: id ? Number(id) : 0,
                sku: this.skuActual,
                planta: this.app.planta
            });

        }

        if (data.length === 0) {
            iziToast.warning({
                title: "Sin datos",
                message: "Debe ingresar al menos una línea válida"
            });
            return false;
        }

        const nuevas = data.filter(item => !item.id || Number(item.id) === 0);
        const existentes = data.filter(item => item.id && Number(item.id) > 0);

        try {

            // Las líneas nuevas se insertan con AddNewDataLine
            for (const nueva of nuevas) {

                const response = await fetch("/DetallesSKU/AddNewDataLine", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                        kgHora: String(nueva.kgHora),
                        linea: String(nueva.linea),
                        planta: this.app.planta,
                        codigo: this.skuActual
                    })
                });

                const jsonData = await response.json();

                if (jsonData.status != 200) {

                    iziToast.error({
                        title: "Error",
                        message: "Error al agregar la línea nueva"
                    });

                    return false;
                }
            }

            // Las líneas existentes se actualizan en bloque
            if (existentes.length > 0) {

                const response = await fetch("/DetallesSKU/UpdateDataLinea", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(existentes)
                });

                const jsonData = await response.json();

                if (jsonData.status != 200) {

                    iziToast.error({
                        title: "Error",
                        message: "Error al actualizar datos de línea"
                    });

                    return false;
                }
            }

            console.log("Datos de línea actualizados correctamente");
            return true;

        } catch (error) {

            console.error(error);

            iziToast.error({
                title: "Error",
                message: "Error al actualizar datos de línea"
            });

            return false;
        }
    }

    configurarInputsNumericos() {

        $(document).on("keydown", "#inputVariable, #inputMultiplo", function (event) {

            if (event.key === "e" || event.key === "E") {
                event.preventDefault();
            }

        });

    }

    async agregarCodigo(planta) {
        $('#BtnAddCode').prop('disabled', true);
        $('#BtnAddCode').html('<i class="bi bi-hourglass-split"></i> Guardando...');

        let itemCode = $("#updateCodeInp").val();
        let proceso = $("#Proceso").val();

        itemCode = itemCode.trim();

        if (!itemCode) {
            iziToast.warning({
                title: "Sin código",
                message: "Ingrese un código"
            });
            $('#BtnAddCode').prop('disabled', false);
            $('#BtnAddCode').html('<i class="bi bi-check-circle"></i> Agregar');
            return;
        }

        if (itemCode.length < 3) {
            iziToast.warning({
                title: "Código inválido",
                message: "El código es demasiado corto"
            });
            $('#BtnAddCode').prop('disabled', false);
            $('#BtnAddCode').html('<i class="bi bi-check-circle"></i> Agregar');
            return;
        }

        if (!proceso) {
            iziToast.warning({
                title: "Sin proceso",
                message: "Seleccione un proceso"
            });
            $('#BtnAddCode').prop('disabled', false);
            $('#BtnAddCode').html('<i class="bi bi-check-circle"></i> Agregar');
            return;
        }


        let data = {
            code: itemCode,
            planta: parseInt(planta),
            proceso: proceso,
            NameUser: UserNameSes
        };

        try {

            const response = await fetch(`${WebApiURL}/api/Corrugados/AddArticuloToNwScale`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const json = await response.json();

            // 🔥 MANEJO CENTRALIZADO
            if (json.status === 200) {

                iziToast.success({
                    title: "Código agregado",
                    message: json.message
                });

                $('#updateCode').modal('hide');
                this.datosMaestrosManager.PeticionApiSKU();

            }
            else if (json.status === 400) {

                iziToast.warning({
                    title: "Validación",
                    message: json.message
                });

            }
            else {

                iziToast.error({
                    title: "Error",
                    message: json.message || "Error inesperado"
                });
            }

        } catch (error) {

            console.error(error);

            iziToast.error({
                title: "Error",
                message: "No se pudo agregar el código"
            });
        }
        finally {
            $('#BtnAddCode').prop('disabled', false);
            $('#BtnAddCode').html('<i class="bi bi-check-circle"></i> Agregar');
            $("#updateCodeInp").val('');
        }
    }
}

// ========================================
// INICIALIZAR
// ========================================
function recargarDatosMaestrosCorrugado() {
    if (window.AppDatosMaestros) {
        window.AppDatosMaestros.datosMaestrosManager.PeticionApiSKU();
    }
}

$(document).ready(function () {

    const app = new DatosMaestrosApp();
    app.inicializar();

});