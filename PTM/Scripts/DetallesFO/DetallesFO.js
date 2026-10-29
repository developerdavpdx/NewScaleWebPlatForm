/* ══════════════════════════════════════════════════════════════
   Detalles de Orden de Fabricación
   Mantiene los nombres usados por la vista:
   tablaDetallesOF, TBOFDetail, peticionDetallesFO y docEntry.
   ══════════════════════════════════════════════════════════════ */

var docEntry = localStorage.getItem("docEntry");
let tableDetallesOF;
let cargandoDetalles = false;

const idiomaDetallesOF = {
    lengthMenu: 'Mostrar _MENU_ registros',
    search: 'Buscar:',
    info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
    infoEmpty: 'Sin registros',
    infoFiltered: '(filtrado de _MAX_ registros)',
    zeroRecords: 'No se encontraron resultados',
    emptyTable: 'Sin componentes registrados',
    paginate: {
        first: 'Primero',
        previous: 'Anterior',
        next: 'Siguiente',
        last: 'Último'
    }
};

$(document).ready(function () {
    tableDetallesOF = $('#tablaDetallesOF').DataTable({
        ordering: false,
        responsive: true,
        pageLength: 10,
        autoWidth: false,
        columnDefs: [
            { targets: 1, className: 'text-start' }
        ],
        language: idiomaDetallesOF,
        drawCallback: function () {
            actualizarContadorDetalles();
        }
    });

    pintarContextoDetalles();

    if (!docEntry) {
        ocultarLoader();
        actualizarContadorDetalles();
        iziToast.warning({
            position: "topRight",
            title: "Sin orden seleccionada",
            message: "<p>Vuelve a Órdenes de Fabricación y elige <b>Ver Detalles</b> en una orden.</p>"
        });
        return;
    }

    mostrarLoader();
    peticionDetallesFO();
});

/* ── Petición al controlador ─────────────────────────────────── */
function peticionDetallesFO() {
    if (!docEntry || cargandoDetalles) {
        return;
    }
    cargandoDetalles = true;
    mostrarLoader();

    const data = {
        "docEntry": docEntry
    };

    fetch("/DetallesFO/GetDetailFabricOrder", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status != 200) {
            throw new Error("Respuesta del servidor: " + jsonData.status);
        }

        const filas = obtenerFilas(jsonData.data);
        const Rows = filas.map(function (fila) {
            return [
                '<span class="dfo-code">' + esc(fila.codigoitem) + '</span>',
                esc(fila.nombreitem),
                fmtNum(fila.cantidadbase),
                fmtNum(fila.cantrequerida),
                fmtNum(fila.cantidadplaneada),
                '<span class="dfo-badge dfo-badge-almacen">' + esc(fila.almacen) + '</span>',
                '<span class="dfo-badge dfo-badge-proceso">' + esc(fila.proceso) + '</span>'
            ];
        });

        tableDetallesOF.clear();
        tableDetallesOF.rows.add(Rows).draw();
    }).catch((error) => {
        console.log(error);
        iziToast.error({
            position: "topRight",
            title: "Ha surgido un error",
            message: "<p>Favor de verificar la conexión con el servidor</p>"
        });
    }).finally(() => {
        cargandoDetalles = false;
        ocultarLoader();
    });
}

function recargarDetallesOF() {
    if (cargandoDetalles) {
        return;
    }
    if (!docEntry) {
        iziToast.warning({
            position: "topRight",
            title: "Sin orden seleccionada",
            message: "<p>Vuelve a Órdenes de Fabricación y elige <b>Ver Detalles</b> en una orden.</p>"
        });
        return;
    }
    tableDetallesOF.clear().draw();
    peticionDetallesFO();
}

function volverAOrdenes() {
    window.location.href = "../OrdenesFabricacion/Index";
}

/* ── Contexto de la orden (pills del encabezado) ─────────────── */
function pintarContextoDetalles() {
    const numero = localStorage.getItem("dfoNumero");
    const item = localStorage.getItem("dfoItem");

    pintarPill("pillOrden", "dfoNumero", numero);
    pintarPill("pillClave", "dfoClave", docEntry);

    const codigo = document.getElementById("dfoCodigo");
    if (codigo) {
        codigo.textContent = item || "—";
    }
}

function pintarPill(idPill, idValor, valor) {
    const pill = document.getElementById(idPill);
    const span = document.getElementById(idValor);
    if (!pill || !span) {
        return;
    }
    if (valor) {
        span.textContent = valor;
        pill.classList.remove("is-hidden");
    } else {
        span.textContent = "—";
        pill.classList.add("is-hidden");
    }
}

function actualizarContadorDetalles() {
    const contador = document.getElementById("dfoCount");
    if (contador && tableDetallesOF) {
        contador.textContent = tableDetallesOF.rows().count();
    }
}

/* ── Utilidades ──────────────────────────────────────────────── */
function obtenerFilas(data) {
    let payload = data;
    try {
        if (typeof payload === "string") {
            payload = JSON.parse(payload);
        }
        if (typeof payload === "string") {
            payload = JSON.parse(payload);
        }
    } catch (e) {
        console.log(e);
        return [];
    }
    if (Array.isArray(payload)) {
        return payload;
    }
    return payload && Array.isArray(payload.data) ? payload.data : [];
}

function fmtNum(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "—";
    }
    const num = Number(valor);
    if (isNaN(num)) {
        return esc(valor);
    }
    return num.toLocaleString("es-MX", { maximumFractionDigits: 4 });
}

function esc(texto) {
    if (texto === null || texto === undefined) {
        return "";
    }
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function mostrarLoader() {
    const loader = document.getElementById("loaderDiv");
    if (loader) {
        loader.style.display = "flex";
    }
}

function ocultarLoader() {
    const loader = document.getElementById("loaderDiv");
    if (loader) {
        loader.style.display = "none";
    }
}
