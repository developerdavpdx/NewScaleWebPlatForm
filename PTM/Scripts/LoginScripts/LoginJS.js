function IniciarSesion() {

    //---------- Login desde el TESTAPI
    //let userEmail = document.getElementById('inputUsuario').value
    //let password = document.getElementById('inputContresana').value
    ////verificamos que user y pass no vengan vacios
    //var data = {
    //    "userEmail": "email",
    //    "password": "password"
    //}
    //fetch('/Login/Login', {
    //    method: 'POST',
    //    headers: {
    //        'Content-Type': 'application/json;charset=utf-8'
    //    },
    //    body: JSON.stringify(data)
    //}).then((response) => {
    //    return response.ok ? response.json() : Promise.reject(response)
    //}).then((jsonData) => {
    //    if (jsonData.status == 200) {
    //        localStorage.setItem("planta", "33") //33 <<--asignacion de planta en localStorage
    //        localStorage.setItem("usuario", "Irving") //<<--asignacion de usuario en localStorage

    //        window.location.replace("../Inicio/Index")  //Dashboard WEB
    //        //window.location.replace("../OPERADOR/DashboardCorrugados")  //Dashboard de Corrugados operador
    //    }
    //    //si el error es por fecha de bloqueo
    //    else if (jsonData.status == 403) {
    //        //liberamos el loader
    //        document.getElementById('loaderDiv').style.display = 'none'
    //        // Mostramos el mensaje 
    //        console.error(jsonData.data);
    //    }
    //}).catch((error) => {
    //    console.log(error.toString())
    //    document.getElementById('loaderDiv').style.display = 'none'
    //    alert(error)
    //})


    //--------- LOGIN PRODUCCION

    let userEmail = document.getElementById('inputUsuario').value
    let password = document.getElementById('inputContresana').value

    if (userEmail != '' && password != '') {
        document.getElementById('loaderDiv').style.display = 'flex'
        var data = {
            "userEmail": userEmail,
            "password": password
        }
        fetch('/Login/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            //Si el status es 200, continuamos con el flujo
            if (jsonData.status == 200) {
                if (jsonData.data.data[0].planta == 2) {
                    //console.log(jsonData);
                    localStorage.setItem("planta", "335")
                    localStorage.setItem("usuario", jsonData.data.data[0].nombrecompleto)
                } else {
                    localStorage.setItem("planta", "33")
                    localStorage.setItem("usuario", jsonData.data.data[0].nombrecompleto)
                }
                localStorage.setItem("tipousuario", jsonData.data.data[0].tipousuario)
                localStorage.setItem("webapiurl", jsonData.data.WebApiURL);

                //una vez validado el user, entramos al dashboard correspondiente
                //si el usuario es admin o consultor
                if (jsonData.data.data[0].tipousuario == "Administrador" || jsonData.data.data[0].tipousuario == "Consulta" || jsonData.data.data[0].tipousuario == "SupervisorProduccion") {
                    window.location.replace("../Inicio/Index")
                }
                //si el usuario es adminMolinos
                else if (jsonData.data.data[0].tipousuario == "AdmMolinos") {
                    window.location.replace("../Molinos/DashboardMolinos")
                }
                //si el usuario es "Operador"
                else if (jsonData.data.data[0].tipousuario == "Operador") {
                    window.location.replace("../Operador/DashboardCorrugados")  //Dashboard de Corrugados operador
                }
            }
            //si el error es la fecha de bloqueo
            else if (jsonData.status == 403) {
                //solo liberamos el loader
                document.getElementById('loaderDiv').style.display = 'none'
                // Mostramos el mensaje
                //console.error(jsonData.data);
            }
            else {
                console.log(jsonData.data)
                document.getElementById("alertaMessage").textContent = jsonData.data.trim()
                $('#alert_credentials').show()
                document.getElementById('loaderDiv').style.display = 'none'
            }
        }).catch((error) => {
            console.log(error.toString())
            document.getElementById('loaderDiv').style.display = 'none'
            alert(error)
        })
    } else {
        document.getElementById('loaderDiv').style.display = 'none'
        console.log("Usuario y contraseña vacios")
    }
    //----
}