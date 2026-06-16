let tablecorreostxtEmail;
const loader2 = document.getElementById('loaderDiv')
let planta2

$(document).ready(() => {
    localStorage.planta == '335' ? planta2 = '2' : planta2 = '1'
    const LinkINY = document.getElementById('LinkPTINY'); //link iny
    //mostramos u ocultamos de acuerdo a la planta
    if (planta === '1') {
        LinkINY.setAttribute("style", "display: none !important;");  // Oculta el div de INY objetivos
    }
    tablecorreostxtEmail = $('#tableCorreos').DataTable({
        ordering: false,
        responsive: true
    })
})

function GuardarCorreo() {
    loader2.style.display = "flex"
    const mail = document.getElementById("correoInput").value

    if (mail == "" || mail == undefined) {
        loader2.style.display = 'none'
        iziToast.error({
            position: "topRight",
            title: `Error generado`,
            message: `<p>Favor de llenar el campo del correo.</p>`,
        })
        return
    }
    let data = {
        "correo": mail,
        "planta": planta2
    }

    fetch("/Inicio/AddNewMailTXT", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then(result => {
        return result.ok ? result.json() : Promise.reject(result)
        if (!result.ok) {
            throw new Error(result.statusText); // Lanza una excepción si no es 200-299
        }
        return result.json();
    }).then(jsonData => {
        let error;
        if (jsonData.status == 200) {
            iziToast.success({
                position: "topRight",
                title: `Correo agregado`,
                message: `<p>Correo ${mail} agregado correctamente</p>`,
            })
            loader2.style.display = "none"
            document.getElementById("correoInput").value = ""
        } else {
            error = jsonData.data;
            iziToast.error({
                position: "topRight",
                title: `Error`,
                message: `<p>` + error + '</p>',
            })
            loader2.style.display = 'none'
        }
    }).catch(error => {
        loader2.style.display = "none"
        iziToast.error({
            position: "topRight",
            title: `Error generado`,
            message: `<p>Error: ${error}.</p>`,
        })
        console.log(error)
    })      
}

function getCorreosTXT() {
    loader2.style.display = 'flex'
    tablecorreostxtEmail.clear().draw()
    let data = {
        "planta": planta2
    }

    fetch("/Inicio/GetMailsTXT", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then(result => {
        return result.ok ? result.json() : Promise.reject(result)
    }).then(jsonData => {
        let Rows = []
        let data = JSON.parse(jsonData.data)
        console.log(data);
        data.message.forEach(email => {
            Rows.push([email, `<button class='btn-delete-mail' data-id="${email}" onclick="borrarMail(this)"><i class="fa fa-trash" aria-hidden="true"></i></button>`])
        })

        tablecorreostxtEmail.rows.add(Rows).draw()
        loader2.style.display = 'none'
    }).catch(error => {
        iziToast.error({
            position: "topRight",
            title: `Error generado`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader2.style.display = 'none'
    })
}

function borrarMail(element) {

    let correo = $(element).data("id")
    loader2.style.display = "flex"
    let data = {
        "correo": correo,
        "planta": planta2
    }
    console.log(data)
    fetch("/Inicio/RemoveMailTXT", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then(jsonData => {
        iziToast.success({
            position: "topRight",
            title: `Correo Eliminado`,
            message: `<p>Correo ${correo} eliminado correctamente</p>`,
        })

        getCorreosTXT()
    }).catch(error => {
        loader2.style.display = "none"
        iziToast.error({
            position: "topRight",
            title: `Error generado`,
            message: `<p>Error: ${error}.</p>`,
        })
        console.log(error)
    })
}