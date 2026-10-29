let tablecorreostxtEmail;
const loader2 = document.getElementById('loaderDiv')
let planta2 = '1'

// Validar que loader2 existe
if (!loader2) {
    console.warn('Elemento loaderDiv no encontrado en el DOM')
}

const idiomaTablaCorreos = {
    lengthMenu: 'Mostrar _MENU_ registros',
    search: 'Buscar:',
    info: 'Mostrando _START_ a _END_ de _TOTAL_ correos',
    infoEmpty: 'Sin correos',
    infoFiltered: '(filtrado de _MAX_ correos)',
    zeroRecords: 'No se encontraron correos',
    emptyTable: 'Sin correos registrados',
    paginate: {
        first: 'Primero',
        previous: 'Anterior',
        next: 'Siguiente',
        last: 'Último'
    }
}

function mostrarLoaderCorreos(visible) {
    if (loader2) {
        loader2.style.display = visible ? 'flex' : 'none';
    }
}

function avisoCorreos(tipo, titulo, mensaje) {
    if (typeof iziToast === 'undefined') {
        console.warn(titulo + ': ' + mensaje);
        return;
    }
    iziToast[tipo]({
        position: 'topRight',
        title: titulo,
        message: `<p>${mensaje}</p>`
    });
}

$(document).ready(() => {
    planta2 = localStorage.planta == '335' ? '2' : '1';

    const LinkINY = document.getElementById('LinkPTINY'); //link iny
    //mostramos u ocultamos de acuerdo a la planta
    if (planta2 === '1' && LinkINY !== null) {
        LinkINY.setAttribute("style", "display: none !important;");  // Oculta el div de INY objetivos
    }

    tablecorreostxtEmail = $('#tableCorreos').DataTable({
        ordering: false,
        language: idiomaTablaCorreos,
        columnDefs: [
            { targets: 1, orderable: false, className: 'text-center' }
        ]
    });

    actualizarContadorCorreos();

    // La tabla vive en una pestana oculta: al mostrarla hay que recalcular anchos.
    $(document).on('shown.bs.tab', '#ListaCorreos a', function () {
        if (tablecorreostxtEmail) {
            tablecorreostxtEmail.columns.adjust();
        }
    });

    $(document).on('shown.bs.modal', '#correoTXT', function () {
        if (tablecorreostxtEmail) {
            tablecorreostxtEmail.columns.adjust();
        }
    });
});

function actualizarContadorCorreos() {
    if (tablecorreostxtEmail) {
        $('#correosCount').text(tablecorreostxtEmail.rows().count());
    }
}

function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

function GuardarCorreo() {
    const input = document.getElementById('correoInput');
    const mail = input ? input.value.trim() : '';

    if (mail === '') {
        avisoCorreos('error', 'Error generado', 'Favor de llenar el campo del correo.');
        return;
    }

    if (!esCorreoValido(mail)) {
        avisoCorreos('error', 'Correo inválido', 'Escribe un correo con el formato nombre@dominio.com.');
        return;
    }

    mostrarLoaderCorreos(true)

    // El controlador recibe los parametros por formulario, no por JSON.
    const data = new URLSearchParams();
    data.append('correo', mail);
    data.append('planta', planta2);

    fetch("/Inicio/AddNewMailTXT", {
        method: "POST",
        body: data
    }).then(result => {
        if (!result.ok) {
            throw new Error(result.statusText); // Lanza una excepción si no es 200-299
        }
        return result.json();
    }).then(jsonData => {
        if (jsonData.status == 200) {
            avisoCorreos('success', 'Correo agregado', `Correo ${mail} agregado correctamente`);
            if (input) input.value = '';
            getCorreosTXT(true);
        } else {
            avisoCorreos('error', 'No se agregó el correo', 'Verifica que el correo no esté repetido y que la lista de correos del servidor esté disponible.');
            mostrarLoaderCorreos(false)
        }
    }).catch(error => {
        mostrarLoaderCorreos(false)
        avisoCorreos('error', 'Error generado', 'No se pudo agregar el correo: ' + error.message);
        console.error(error)
    })
}

function getCorreosTXT(silencioso) {
    if (!tablecorreostxtEmail) {
        mostrarLoaderCorreos(false)
        return;
    }

    mostrarLoaderCorreos(true)

    const data = new URLSearchParams();
    data.append('planta', planta2);

    fetch("/Inicio/GetMailsTXT", {
        method: "POST",
        body: data
    }).then(result => {
        return result.ok ? result.json() : Promise.reject(result)
    }).then(jsonData => {
        tablecorreostxtEmail.clear();

        if (jsonData.status != 200) {
            // El controlador responde 400 tanto si la lista esta vacia como si
            // no se pudo leer el archivo de correos del servidor.
            tablecorreostxtEmail.draw();
            actualizarContadorCorreos();
            mostrarLoaderCorreos(false)

            if (!silencioso) {
                avisoCorreos('warning', 'Sin correos para mostrar', 'Si esperabas ver correos, revisa la lista de correos de la planta en el servidor.');
            }
            return;
        }

        let lista = [];
        try {
            lista = JSON.parse(jsonData.data);
        } catch (e) {
            lista = null;
        }

        const correos = (lista && lista.message) ? lista.message : [];

        const rows = correos.map(email => ([
            email,
            `<button type="button" class="btn-delete-mail" data-id="${email}" title="Eliminar correo" onclick="borrarMail(this)"><i class="fa fa-trash" aria-hidden="true"></i></button>`
        ]));

        tablecorreostxtEmail.rows.add(rows).draw();
        tablecorreostxtEmail.columns.adjust();
        actualizarContadorCorreos();
        mostrarLoaderCorreos(false)
    }).catch(error => {
        tablecorreostxtEmail.clear().draw();
        actualizarContadorCorreos();
        mostrarLoaderCorreos(false)
        avisoCorreos('error', 'Error generado', 'No se pudieron obtener los correos registrados.');
        console.error(error)
    })
}

function borrarMail(element) {
    const correo = $(element).data("id");

    if (!correo) return;

    mostrarLoaderCorreos(true)

    const data = new URLSearchParams();
    data.append('correo', correo);
    data.append('planta', planta2);

    fetch("/Inicio/RemoveMailTXT", {
        method: "POST",
        body: data
    }).then(result => {
        if (!result.ok) {
            throw new Error(result.statusText);
        }
        return result.json();
    }).then(jsonData => {
        if (jsonData.status != 200) {
            throw new Error(jsonData.response || 'No se pudo eliminar el correo');
        }

        avisoCorreos('success', 'Correo eliminado', `Correo ${correo} eliminado correctamente`);
        getCorreosTXT(true);
    }).catch(error => {
        mostrarLoaderCorreos(false)
        avisoCorreos('error', 'Error generado', 'No se pudo eliminar el correo: ' + error.message);
        console.error(error)
    })
}
