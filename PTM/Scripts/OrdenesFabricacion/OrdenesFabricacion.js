const loader = document.getElementById('loaderDiv')
let tableOFabricacion;
$(document).ready(function () {
    loader.style.display = 'flex'
    tableOFabricacion = $('#tablaOrdenesFabricacion').DataTable({
        ordering: false,
        responsive: true
    })
    PeticionApiSKU()
})

function PeticionApiSKU() {
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
            console.log(jsonString)
            let Rows = []
            var json = JSON.parse(jsonString.data)
            json = JSON.parse(json.data)
            console.log(json)
            for (x = 0; x < json.length; x++) {
                Rows.push([json[x].NUMERODOCUMENTO, json[x].DOCENTRY, json[x].ITEMCODE, json[x].NOMBRE, `<button class="btn btn-info btn-details" onclick="verDetallesFO('${json[x].DOCENTRY}')">Ver Detalles</button>`])
            }

            tableOFabricacion.rows.add(Rows).draw();

            //let skus = jsonString.data.productoTerminados
            //console.log(skus)
            //for (x = 0; x < skus.length; x++) {
            //    console.log(skus[x].updateDate)
            //    let dateList = ConvertDate(skus[x].updateDate)
            //    Rows.push([skus[x].skuInfo.itemCode, skus[x].skuInfo.itemName, `${dateList.fecha} ${dateList.hora}`, `<button class="btn btn-info btn-details" onclick="verDetallesSKU('${skus[x].id}')">Ver Detalles</button>`])
            //}
            //console.log(Rows)
            //tableOFabricacion.rows.add(Rows).draw();

            loader.style.display = 'none'
        } else {
            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error);
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de verificar la conexión con el servidor</p>`,
        })

        loader.style.display = 'none'
    })
}

function verDetallesFO(DocEntry) {
    localStorage.setItem("docEntry", DocEntry)
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