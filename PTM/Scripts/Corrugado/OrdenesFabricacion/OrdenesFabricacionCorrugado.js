const loader = document.getElementById('loaderDiv')
let tableOFabricacion;

//al cargar la pagina..
$(document).ready(function () {
    loader.style.display = 'flex';

    //inicializamos la tabla
    tableOFabricacion = $('#tablaOrdenesFabricacion').DataTable({
        ordering: false,
        responsive: true
    });

    //obtenemos los datos para para llenar la tabla
    PeticionApiSKU();

    //------FUNCIONES----

    //funcion para obtener las ordenes de fabricacion
    function PeticionApiSKU() {
        let data = {
            "planta": localStorage.getItem("planta")    //enviamos 33 si es planta 1 o 335 si es planta 2
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
                //console.log(jsonString)

                //nos aseguramos de limpiar la tabla de informacion pasada
                tableOFabricacion.clear();

                let Rows = [];
                var json = JSON.parse(jsonString.data);
                json = JSON.parse(json.data);
                //console.log(json)
                for (x = 0; x < json.length; x++) {
                    Rows.push([json[x].NUMERODOCUMENTO, json[x].DOCENTRY, json[x].ITEMCODE, json[x].NOMBRE, `<button class="btn btn-info btn-details" data-itemcode="${json[x].DOCENTRY}">Ver Detalles</button>`])
                }

                //agregamos a la tabla la informacion
                tableOFabricacion.rows.add(Rows).draw();

                loader.style.display = 'none';
            } else {
                loader.style.display = 'none';
            }
        }).catch((error) => {
            console.log(error);
            iziToast.error({
                position: "topRight",
                title: `Error al obtener las ordenes de fabricacion`,
                message: `<p>Favor de verificar la conexión con el servidor</p>`,
            });

            loader.style.display = 'none';
        })
    }

    //para ver los detalles de la orden seleccionada
    function verDetallesFO(DocEntry) {
        localStorage.setItem("docEntry", DocEntry);
        window.location.href = "../DetallesFO/Index";
    }

    //--------BOTONES-----
    //Btn de Detalles de cada articulo
    $('#tablaOrdenesFabricacion').on('click', '.btn-details', function () {
        var DocEntry = $(this).data('itemcode');
        verDetallesFO(DocEntry);
    });
});