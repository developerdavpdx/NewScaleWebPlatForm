// ========================================
// APP PRINCIPAL
// ========================================
class DatosMaestrosCorrugadoApp {

    constructor() {
        this.loader = document.getElementById('loaderDiv');
        this.planta = localStorage.planta == '335' ? '2' : '1';
        this.tableDatosMestros = null;

        this.dataManager = new CorrugadoDataManager(this);
        this.codigoManager = new CorrugadoCodigoManager(this);
        this.excelManager = new CorrugadoExcelManager(this);
        this.detalleManager = new CorrugadoDetalleManager(this);

        window.AppCorrugado = this;
    }

    inicializar() {
        this.inicializarTabla();
        this.configurarEventos();
        this.dataManager.PeticionApiSKU();
    }

    inicializarTabla() {
        this.loader.style.display = 'flex';

        this.tableDatosMestros = $('#DatosMaestros').DataTable({
            ordering: false,
            responsive: true,
            columnDefs: [
                { className: "text-center", targets: "_all" }, // 🔥 centra todo
                { width: "280px", targets: 4 }, // Fecha
                { width: "90px", targets: 6 },   // Tara
                { width: "150px", targets: 7 }   // Detalles
            ],
            language: {
                decimal: "",
                emptyTable: "No hay datos disponibles en la tabla",
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

        // Ver detalles SKU
        $(document).on('click', '.btn-details', (e) => {
            const id = $(e.currentTarget).data('id');
            this.dataManager.verDetallesSKU(id);
        });
        // Agregar código
        $(document).on('click', '#BtnAddCode', () => {
            this.codigoManager.agregarCodigo(this.planta);
        });

        // Excel
        $(document).on('click', '#GenerateExcel', () => {
            this.excelManager.generarExcel();
        });

        // limpiar modal
        $('#updateCode').on('hidden.bs.modal', () => {
            $("#updateCodeInp").val("");
        });

        // agregar línea
        $(document).on('click', '#btnAgregarLinea', () => {
            this.detalleManager.agregarLineaUI();
        });

        // guardar cambios
        $(document).on('click', '.ActualizarSKU', () => {
            this.detalleManager.actualizarSKU();
        });
    }
}

//////////////////////////////////////////////////////////////

// ========================================
// DATA MANAGER
// ========================================
class CorrugadoDataManager {

    constructor(app) {
        this.app = app;
        this.dataSapHana = [];
        this.skuInfo = [];
    }

    async PeticionApiSKU() {

        const data = {
            planta: this.app.planta,
            proceso_ignorado: "PPVC"
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
                this.dataSapHana = responseJson.data;
                this.skuInfo = responseJson.skuInfo;

                let rows = [];

                for (let x = 0; x < this.skuInfo.length; x++) {

                    let fechaActualizacion = "No Existe Actualización";
                    let usuario = "No Existe Actualización";
                    let iconUpdate = '<i style="font-size:14px; color: #C12123;" class="fa fa-times"></i>';
                    let tara = 0;

                    const codigoItem = this.skuInfo[x].itemCode;
                    const skuFilter = this.dataSapHana.filter(x => x.codigoitem == codigoItem);

                    if (skuFilter.length != 0) {

                        let isUpdate = UtilsCorrugado.esActualizado(this.skuInfo[x].lastUpdate);

                        fechaActualizacion = UtilsCorrugado.formatDate(this.skuInfo[x].lastUpdate);

                        usuario = this.skuInfo[x].usuario || "No Existe Actualización";

                        iconUpdate = isUpdate
                            ? '<i style="font-size:14px; color: #2B9B2B;" class="fa fa-check"></i>'
                            : '<i style="font-size:14px; color: #C12123;" class="fa fa-times"></i>';

                        tara = this.skuInfo[x].variable;
                    }

                    rows.push([
                        this.skuInfo[x].itemCode,
                        (skuFilter[0]?.nombre ?? 'N/A'),
                        this.skuInfo[x].proceso,
                        iconUpdate,
                        fechaActualizacion,
                        usuario,
                        tara,
                        `<button class="btn btn-info btn-details" data-id="${codigoItem}">
                            Ver detalles
                        </button>`
                    ]);
                }

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

//////////////////////////////////////////////////////////////

// ========================================
// CODIGO MANAGER
// ========================================
class CorrugadoCodigoManager {

    constructor(app) {
        this.app = app;
    }

    async agregarCodigo(planta) {

        const btn = $('#BtnAddCode');

        // 🔒 bloquear botón
        btn.prop('disabled', true)
            .html('<i class="bi bi-hourglass-split"></i> Guardando...');

        let itemCode = $("#updateCodeInp").val();
        let proceso = $("#Proceso").val();

        itemCode = itemCode?.trim() || "";

        // 🔍 VALIDACIONES
        if (!itemCode) {
            iziToast.warning({
                title: "Sin código",
                message: "Ingrese un código"
            });

            btn.prop('disabled', false)
                .html('<i class="bi bi-check-circle"></i> Agregar');
            return;
        }

        if (itemCode.length < 3) {
            iziToast.warning({
                title: "Código inválido",
                message: "El código es demasiado corto"
            });

            btn.prop('disabled', false)
                .html('<i class="bi bi-check-circle"></i> Agregar');
            return;
        }

        if (!proceso) {
            iziToast.warning({
                title: "Sin proceso",
                message: "Seleccione un proceso"
            });

            btn.prop('disabled', false)
                .html('<i class="bi bi-check-circle"></i> Agregar');
            return;
        }

        // 📦 DATA
        let data = {
            code: itemCode,
            planta: parseInt(planta),
            proceso: proceso,
            NameUser: UserNameSes
        };

        this.app.loader.style.display = "flex";

        try {

            const response = await fetch(`${WebApiURL}/api/Corrugados/AddArticuloToNwScale`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const json = await response.json();

            // 🎯 MANEJO ESTÁNDAR
            if (json.status === 200) {

                iziToast.success({
                    title: "Código agregado",
                    message: json.message
                });

                $('#updateCode').modal('hide');

                this.app.dataManager.obtenerDatos();

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

        } finally {

            // 🔓 restaurar botón + limpiar
            btn.prop('disabled', false)
                .html('<i class="bi bi-check-circle"></i> Agregar');

            $("#updateCodeInp").val('');
            $("#Proceso").val('');

            this.app.loader.style.display = "none";
        }
    }
}

//////////////////////////////////////////////////////////////

// ========================================
// EXCEL MANAGER
// ========================================
class CorrugadoExcelManager {

    constructor(app) {
        this.app = app;
    }

    generarExcel() {

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

        xhr.open('POST', '/DatosMaestros/getexcelCorrugados', true);

        xhr.onload = () => {

            if (xhr.status === 200) {

                const respuesta = JSON.parse(xhr.responseText);

                if (respuesta.R === 1) {

                    this.descargarArchivo('Datos Maestros.xlsx', respuesta.data);

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


//////////////////////////////////////////////////////////////

// ========================================
// UTILS
// ========================================
class UtilsCorrugado {

    static formatDate(dateTime) {

        const f = new Date(dateTime);

        const day = f.getDate().toString().padStart(2, '0');
        const month = (f.getMonth() + 1).toString().padStart(2, '0');
        const year = f.getFullYear();

        let hours = f.getHours();
        let minutes = f.getMinutes().toString().padStart(2, '0');

        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 => 12
        hours = hours.toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    }

    static esActualizado(fechaActualizacion) {

        let fecha = new Date(fechaActualizacion);
        let horaActual = new Date();

        let inicio1 = new Date();
        inicio1.setHours(4, 30, 0, 0);

        let fin1 = new Date();
        fin1.setHours(16, 30, 0, 0);

        let inicio2 = new Date();
        inicio2.setHours(16, 30, 0, 0);

        let fin2 = new Date();
        fin2.setDate(fin2.getDate() + 1);
        fin2.setHours(4, 30, 0, 0);

        let actualizado = false;

        if (horaActual > inicio1 && horaActual < fin1) {

            if (fecha > inicio1 && fecha < fin1) {
                actualizado = true;
            }

        } else {

            if ((horaActual.getHours() >= 0 && horaActual.getHours() <= 4) ||
                (horaActual.getHours() === 4 && horaActual.getMinutes() <= 30)) {

                inicio2.setDate(inicio2.getDate() - 1);
                fin2.setDate(fin2.getDate() - 1);
            }

            if (fecha > inicio2 && fecha < fin2) {
                actualizado = true;
            }
        }

        return actualizado;
    }
}

class CorrugadoDetalleManager {

    constructor(app) {
        this.app = app;
        this.skuActual = null;
        this.configurarInputsNumericos();
    }

    async cargarDetalle(id) {

        this.skuActual = id;

        await Promise.all([
            this.GetSkuDetails(id),
            this.ObtenerInfoPorLinea(id)
        ]);
    }

    async GetSkuDetails(SKU) {

        this.app.loader.style.display = 'flex';

        try {

            const response = await fetch('/DetallesSku/GetPTbySku', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sku: SKU,
                    planta: this.app.planta
                })
            });

            const jsonData = await response.json();

            if (jsonData.status == 200) {

                const jsonResult = JSON.parse(jsonData.data);
                const data = jsonResult.data[0];
                const skuInfo = jsonResult.skuInfos;

                // 🔥 INFO GENERAL
                this.setValue('#skuCode', data.codigoitem);
                this.setValue('#ItemName', data.nombre);
                this.setValue('#CategorySKU', data.categoria);
                $("#ProcesoSku").val(skuInfo[0].proceso);
                this.setValue('#minWeight', data.pesominimo);
                this.setValue('#maxWeight', data.pesomaximo);

                // 🔥 MATERIAL EMBALAJE
                this.crearMaterialEmb(skuInfo);

                if (skuInfo.length != 0) {

                    $('#inputMultiplo').val(skuInfo[0].multiploCant);
                    $('#selectMulti').val(skuInfo[0].multiploCategoria);
                    $('#inputVariable').val(skuInfo[0].variable);

                    this.llenarMaterialEmb(skuInfo[0]);

                }

                $('#modalDetalleSKU').modal('show');
            }

        } catch (error) {
            console.error(error);
        }

        this.app.loader.style.display = 'none';
    }

    crearMaterialEmb(data) {

        const CorrMatEmb = ["Fleje", "Costales", "Tarima"];

        $('#divMatEmb').empty();

        CorrMatEmb.forEach(item => {
            $('#divMatEmb').append(`
                    <div class="col-lg-4">
                        ${item}
                        <input class="form-control" type="number" id="input${item}" />
                    </div>
                `);
        });
    }

    llenarMaterialEmb(data) {

        $('#inputFleje').val(data.flejeCant ?? '');
        $('#inputAnillo').val(data.anilloCant ?? '');
        $('#inputMadera').val(data.maderaCant ?? '');

        $('#inputCostales').val(data.costalesCant ?? '');
        $('#inputArpilla').val(data.arpillaCant ?? '');
        $('#inputTarima').val(data.tarimaCant ?? '');
    }

    async ObtenerInfoPorLinea(sku) {

        const response = await fetch('/DetallesSKU/ObtenerInfoLinea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sku: sku,
                planta: this.app.planta
            })
        });

        const jsonData = await response.json();

        if (jsonData.status == 200) {

            const data = JSON.parse(jsonData.data).skuDetailLinea;

            $('#divDetailsLine').empty();

            data.forEach(item => {

                let eficiencia = item.kgHora > 0
                    ? (item.pesoTotal / (item.kgHora * 24) * 100).toFixed(2)
                    : "N/A";

                $('#divDetailsLine').append(`
                    <div class="col-md-3 mt-3">
                        <input class="form-control KgHoraClass" value="${item.kgHora ?? ''}">
                    </div>

                    <div class="col-md-3 mt-3">
                        <input readonly class="form-control" value="${eficiencia}">
                    </div>

                    <div class="col-md-3 mt-3">
                        <input class="form-control LineaClass" value="${item.linea ?? ''}">
                    </div>

                    <div class="col-md-3 mt-3">
                        <input class="form-control PlantaClass" value="${item.planta}" valueId="${item.id}" readonly>
                    </div>
                `);
            });
        }
    }

    agregarLineaUI() {
        $('#divDetailsLine').append(`
            <div class="col-md-3 mt-3">
                <input class="form-control KgHoraClass">
            </div>
            <div class="col-md-3 mt-3">
                <input readonly class="form-control" value="Nuevo">
            </div>
            <div class="col-md-3 mt-3">
                <input class="form-control LineaClass">
            </div>
            <div class="col-md-3 mt-3">
                <input class="form-control PlantaClass" value="${this.app.planta}" valueId="0" readonly>
            </div>
        `);
    }

    setValue(selector, value) {
        $(selector).val(value ?? '—');
    }

    configurarInputsNumericos() {
        $(document).on("keydown", "#inputVariable, #inputMultiplo", function (e) {
            if (e.key === "e" || e.key === "E") e.preventDefault();
        });
    }
}
//////////////////////////////////////////////////////////////

// ========================================
// INIT
// ========================================
$(document).ready(() => {
    const app = new DatosMaestrosCorrugadoApp();
    app.inicializar();
});