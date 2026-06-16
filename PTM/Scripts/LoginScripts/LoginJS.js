function IniciarSesion() {
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
            if (jsonData.status == 200) {
                /*console.log(jsonData.data.data)*/
                if (jsonData.data.data[0].planta == 2) {
                    localStorage.setItem("planta", "335")
                    localStorage.setItem("usuario", jsonData.data.data[0].nombrecompleto)
                } else {
                    localStorage.setItem("planta", "33")
                    localStorage.setItem("usuario", jsonData.data.data[0].nombrecompleto)
                }
                window.location.replace("../Inicio/Index")
            } else {
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
        console.log("Error")
    }
}