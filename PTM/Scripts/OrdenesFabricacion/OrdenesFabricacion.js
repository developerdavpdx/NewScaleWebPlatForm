const loader = document.getElementById('loaderDiv')
let tableOFabricacion;
let cargandoOrdenes = false;

$(document).ready(function () {
    loader.style.display = 'flex'
    tableOFabricacion = $('#tablaOrdenesFabricacion').DataTable({
        ordering: false,
        responsive: true,
        pageLength: 10,
        autoWidth: false,
        columnDefs: [
            { targets: 3, className: 'text-start' }
        ],
        language: {
            lengthMenu: 'Mostrar _MENU_ registros',
            search: 'Buscar:',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
            infoEmpty: 'Sin registros',
            infoFiltered: '(filtrado de _MAX_ registros)',
            zeroRecords: 'No se encontraron resultados',
            emptyTable: 'Sin datos disponibles',
            paginate: {
                first: 'Primero',
                previous: 'Anterior',
                next: 'Siguiente',
                last: 'Último'
            }
        }
    })

    // Mantiene el contador sincronizado con los registros cargados
    tableOFabricacion.on('draw', function () {
        const contador = document.getElementById('ofCount')
        if (contador) {
            contador.textContent = tableOFabricacion.rows().count()
        }
    })

    PeticionApiSKU()
})

function PeticionApiSKU() {
    if (cargandoOrdenes) {
        return
    }
    cargandoOrdenes = true

    let data = {
        "planta": localStorage.getItem("planta")
    }
    fetch("/OrdenesFabricacion/GetAllOrdenFabric", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonString) => {
        if (jsonString.status == 200) {
            let Rows = []
            var json = JSON.parse(jsonString.data)
            json = JSON.parse(json.data)
            for (let x = 0; x < json.length; x++) {
                Rows.push([json[x].NUMERODOCUMENTO, json[x].DOCENTRY, json[x].ITEMCODE, json[x].NOMBRE, `<button class="btn btn-outline-info btn-details" onclick="verDetallesFO('${json[x].DOCENTRY}', '${json[x].NUMERODOCUMENTO}', '${json[x].ITEMCODE}')">Ver Detalles</button>`])
            }

            tableOFabricacion.rows.add(Rows).draw();
        }
    }).catch((error) => {
        console.log(error);
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de verificar la conexión con el servidor</p>`,
        })
    }).finally(() => {
        cargandoOrdenes = false
        loader.style.display = 'none'
    })
}

function recargarOrdenes() {
    if (cargandoOrdenes) {
        return
    }
    loader.style.display = 'flex'
    tableOFabricacion.clear().draw()
    PeticionApiSKU()
}

function verDetallesFO(DocEntry, NumeroDocumento, ItemCode) {
    localStorage.setItem("docEntry", DocEntry)

    // Contexto de la orden para el encabezado de DetallesFO
    if (NumeroDocumento) {
        localStorage.setItem("dfoNumero", NumeroDocumento)
    } else {
        localStorage.removeItem("dfoNumero")
    }
    if (ItemCode) {
        localStorage.setItem("dfoItem", ItemCode)
    } else {
        localStorage.removeItem("dfoItem")
    }

    window.location.href = "../DetallesFO/Index"
}

function ConvertDate(dateTime) {
    const fecha = new Date(parseInt(dateTime.substring(6)));
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();
    var date = `${day}/${month}/${year}`
    var hours = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'PM' : 'AM'}`
    let listInfoDate = { "fecha": date, "hora": hours }
    return listInfoDate
}
