//Variable con el filtrado inicial que almacena scrap por procesos
let ScrapPVC;
let ScrapINY;

//Variables con el filtrado del Scrap de PVC por sus Familias
let ScrapPvcIPS;
let ScrapPvcDWV;
let ScrapPvcC900;
let ScrapPvcCPVC;

//Variables con el filtrado del Scrap de Inyecciones por sus Familias
let ScrapInyDWV;
let ScrapInyCLAY;
let ScrapInyPURGA;

let acumuladosArray = ['-', '-', '-', '-', '-', '-', '-']
let registosHoyArray = ['-', '-', '-', '-', '-', '-', '-']
let registosAyerArray = ['-', '-', '-', '-', '-', '-', '-']

let tableCorreo;
let planta 

$(document).ready(() => {
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    tableCorreo = $("#tablaCorreo").DataTable({
        ordering: false,
        responsive: true
    })
    ObtenerEmail()
    peticionObtenerScrap()
})

function ObtenerEmail() {
    fetch("/ReciboScrap/GetEmailsMolinos").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsondata) => {
        var data = JSON.parse(jsondata.data)
        var sapemail = data.sapemail
        let rows = []
        if (sapemail.length > 0) {
            for (x = 0; x < sapemail.length; x++) {
                rows.push([sapemail[x].nombrecompleto, sapemail[x].name, sapemail[x].email])
            }

            tableCorreo.rows.add(rows).draw()
        }
    })
}

function peticionObtenerScrap() {
    fetch("/Molinos/GetAllMolinos").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            var data = JSON.parse(jsonData.data)
            console.log(data)
            var resultResponse = data.result;
            var resultAcumulados = data.acumuladoEmbarque;
            var resultRegistrosAyer = data.registrosAyer
            var resultRegistrosHoy = data.registrosHoy

            genrarArraySrapMolinos(resultResponse, resultAcumulados, resultRegistrosAyer, resultRegistrosHoy);
        }
    }).catch((error) => {
        console.log(error)
    })
}

function filtradoFamiliaScrapPVC(ScrapPVC) {
    ScrapPvcIPS = ScrapPVC.filter(x => x.familia == 'C900')
    ScrapPvcIPS = ScrapPvcIPS.filter(x => x.familia = "IPS")
}

function filtradoFamiliaScrapINY(ScrapINY) {

}
let table
var rows;
function genrarArraySrapMolinos(dt, resultAcumulados, resultRegistrosAyer, resultRegistrosHoy) {
    rows = new Array();
    console.log(dt)
    for (var i = 0; i < 23; i++) {
        rows.push([0, 0, 0, 0, 0, 0]);
    }

    let filtrado;
    let filtradoAE;

    for (x = 0; x < resultRegistrosHoy.length; x++) {
        registosHoyArray[resultRegistrosHoy[x].indexSubFamilia] = resultRegistrosHoy[x].pesot
    }

    for (x = 0; x < resultRegistrosAyer.length; x++) {
        registosAyerArray[resultRegistrosAyer[x].indexSubFamilia] = resultRegistrosAyer[x].pesot
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'IPS');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[0] = filtradoAE[x].sumatoria
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'DWV' && x.proceso == 'PVC');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[1] = filtradoAE[x].sumatoria
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'C900');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[2] = filtradoAE[x].sumatoria
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'CPVC');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[3] = filtradoAE[x].sumatoria
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'DWV' && x.proceso == 'INY');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[4] = filtradoAE[x].sumatoria
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'CLAY');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[5] = filtradoAE[x].sumatoria
    }

    filtradoAE = resultAcumulados.filter(x => x.familia == 'PURGA');
    for (let x = 0; x < filtradoAE.length; x++) {
        acumuladosArray[6] = filtradoAE[x].sumatoria
    }

    console.log(acumuladosArray)

    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'IPS' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[0][parseInt(filtrado[i].indexSubFamilia)] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'IPS' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[1][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'IPS' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[2][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'DWV' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[3][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'DWV' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[4][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'DWV' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[5][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'C900' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[6][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'C900' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[7][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'C900' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[8][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'CPVC' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[9][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'CPVC' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[10][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'PPVC' && x.familia == 'CPVC' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[11][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'DWV' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[12][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'DWV' && x.tipo == 'Colada');
    for (var i = 0; i < filtrado.length; i++) {
        rows[13][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'DWV' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[14][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'DWV' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[15][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'CLAY' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[16][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'CLAY' && x.tipo == 'Colada');
    for (var i = 0; i < filtrado.length; i++) {
        rows[17][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'CLAY' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[18][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'CLAY' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[19][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'PURGA' && x.tipo == 'Bueno');
    for (var i = 0; i < filtrado.length; i++) {
        rows[20][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'PURGA' && x.tipo == 'Quemado/Contaminado');
    for (var i = 0; i < filtrado.length; i++) {
        rows[21][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }
    filtrado = dt.filter(x => x.proceso == 'INY' && x.familia == 'PURGA' && x.tipo == 'Baja');
    for (var i = 0; i < filtrado.length; i++) {
        rows[22][filtrado[i].indexSubFamilia] = filtrado[i].pesot;
    }


    let bodytabhtml = `<tr><td rowspan="24" id="ProcesoCat">PVC Extrusion</td><td rowspan="6" id="Categoria">IPS</td>
    </tr>`;
    bodytabhtml += `<tr id="tr-col">
        <td class="td-title">Bueno</td>
        <td>${rows[0][0] == 0 ? "-" : agregarComas(rows[0][0].toFixed(2))}</td >
        <td>${rows[0][1] == 0 ? "-" : agregarComas(rows[0][1].toFixed(2))}</td>
        <td>${rows[0][2] == 0 ? "-" : agregarComas(rows[0][2].toFixed(2))}</td>
        <td>${rows[0][3] == 0 ? "-" : agregarComas(rows[0][3].toFixed(2))}</td>
        <td>${rows[0][4] == 0 ? "-" : agregarComas(rows[0][4].toFixed(2))}</td>
        <td>${rows[0][5] == 0 ? "-" : agregarComas(rows[0][5].toFixed(2))}</td>
        <td rowspan="6" id="td-acomulado">${acumuladosArray[0]}</td>
    </tr>`;

    bodytabhtml += `<tr id="tr-col">
        <td class="td-title">Quemado/Cont</td>
        <td>${rows[1][0] == 0 ? "-" : agregarComas(rows[1][0].toFixed(2))}</td>
        <td>${rows[1][1] == 0 ? "-" : agregarComas(rows[1][1].toFixed(2))}</td>
        <td>${rows[1][2] == 0 ? "-" : agregarComas(rows[1][2].toFixed(2))}</td>
        <td>${rows[1][3] == 0 ? "-" : agregarComas(rows[1][3].toFixed(2))}</td>
        <td>${rows[1][4] == 0 ? "-" : agregarComas(rows[1][4].toFixed(2))}</td>
        <td>${rows[1][5] == 0 ? "-" : agregarComas(rows[1][5].toFixed(2))}</td>
    </tr>`;

    bodytabhtml += `<tr id="tr-col-baja">
        <td class="bajaTr">Baja</td>
        <td>${rows[2][0] == 0 ? "-" : agregarComas(rows[2][0].toFixed(2))}</td>
        <td>${rows[2][1] == 0 ? "-" : agregarComas(rows[2][1].toFixed(2))}</td>
        <td>${rows[2][2] == 0 ? "-" : agregarComas(rows[2][2].toFixed(2))}</td>
        <td>${rows[2][3] == 0 ? "-" : agregarComas(rows[2][3].toFixed(2))}</td>
        <td>${rows[2][3] == 0 ? "-" : agregarComas(rows[2][4].toFixed(2))}</td>
        <td>-</td>
    </tr>`;


    bodytabhtml += `<tr id="tr-col">
                <td class="td-title">Total Consumible</td>
                <td>${(rows[0][0] + rows[1][0]) == 0 ? "-" : agregarComas((rows[0][0] + rows[1][0]).toFixed(2))}</td>
                <td>${(rows[0][1] + rows[1][1]) == 0 ? "-" : agregarComas((rows[0][1] + rows[1][1]).toFixed(2))}</td>
                <td>${(rows[0][2] + rows[1][2]) == 0 ? "-" : agregarComas((rows[0][2] + rows[1][2]).toFixed(2))}</td>
                <td>${(rows[0][3] + rows[1][3]) == 0 ? "-" : agregarComas((rows[0][3] + rows[1][3]).toFixed(2))}</td>
                <td>${(rows[0][4] + rows[1][4]) == 0 ? "-" : agregarComas((rows[0][4] + rows[1][4]).toFixed(2))}</td>
                <td>${(rows[0][5] + rows[1][5]) == 0 ? "-" : agregarComas((rows[0][5] + rows[1][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr id="tr-totalINY-col">
                <td id="td-total-col">Total</td>
                <td>${(rows[0][0] + rows[1][0] + rows[2][0]) == 0 ? "-" : agregarComas((rows[0][0] + rows[1][0] + rows[2][0]).toFixed(2))}</td>
                <td>${(rows[0][1] + rows[1][1] + rows[2][1]) == 0 ? "-" : agregarComas((rows[0][1] + rows[1][1] + rows[2][1]).toFixed(2))}</td>
                <td>${(rows[0][2] + rows[1][2] + rows[2][2]) == 0 ? "-" : agregarComas((rows[0][2] + rows[1][2] + rows[2][2]).toFixed(2))}</td>
                <td>${(rows[0][3] + rows[1][3] + rows[2][3]) == 0 ? "-" : agregarComas((rows[0][3] + rows[1][3] + rows[2][3]).toFixed(2))}</td>
                <td>${(rows[0][4] + rows[1][4] + rows[2][4]) == 0 ? "-" : agregarComas((rows[0][4] + rows[1][4] + rows[2][4]).toFixed(2))}</td>
                <td>${(rows[0][5] + rows[1][5] + rows[2][5]) == 0 ? "-" : agregarComas((rows[0][5] + rows[1][5] + rows[2][5]).toFixed(2))}</td>
            </tr>
            <tr>
                <td rowspan="6" id="Categoria">DWV</td>
            </tr>`;

    bodytabhtml += `<tr id="tr-col">
                <td class="td-title">Bueno</td>
                <td>${rows[3][0] == 0 ? "-" : agregarComas(rows[3][0].toFixed(2))}</td>
                <td>${rows[3][1] == 0 ? "-" : agregarComas(rows[3][1].toFixed(2))}</td>
                <td>${rows[3][2] == 0 ? "-" : agregarComas(rows[3][2].toFixed(2))}</td>
                <td>${rows[3][3] == 0 ? "-" : agregarComas(rows[3][3].toFixed(2))}</td>
                <td>${rows[3][4] == 0 ? "-" : agregarComas(rows[3][4].toFixed(2))}</td>
                <td>${rows[3][5] == 0 ? "-" : agregarComas(rows[3][5].toFixed(2))}</td>
                <td rowspan="6" id="td-acomulado">${acumuladosArray[1]}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Quemado/Cont</td>
                <td>${rows[4][0] == 0 ? "-" : agregarComas(rows[4][0].toFixed(2))}</td>
                <td>${rows[4][1] == 0 ? "-" : agregarComas(rows[4][1].toFixed(2))}</td>
                <td>${rows[4][2] == 0 ? "-" : agregarComas(rows[4][2].toFixed(2))}</td>
                <td>${rows[4][3] == 0 ? "-" : agregarComas(rows[4][3].toFixed(2))}</td>
                <td>${rows[4][4] == 0 ? "-" : agregarComas(rows[4][4].toFixed(2))}</td>
                <td>${rows[4][5] == 0 ? "-" : agregarComas(rows[4][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col-baja">
                <td class="bajaTr">Baja</td>
                <td>${rows[5][0] == 0 ? "-" : agregarComas(rows[5][0].toFixed(2))}</td>
                <td>${rows[5][1] == 0 ? "-" : agregarComas(rows[5][1].toFixed(2))}</td>
                <td>${rows[5][2] == 0 ? "-" : agregarComas(rows[5][2].toFixed(2))}</td>
                <td>${rows[5][3] == 0 ? "-" : agregarComas(rows[5][3].toFixed(2))}</td>
                <td>${rows[5][4] == 0 ? "-" : agregarComas(rows[5][4].toFixed(2))}</td>
                <td>${rows[5][5] == 0 ? "-" : agregarComas(rows[5][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title td-title">Total Consumible</td>
                <td>${(rows[3][0] + rows[4][0]) == 0 ? "-" : agregarComas((rows[3][0] + rows[4][0]).toFixed(2))}</td>
                <td>${(rows[3][1] + rows[4][1]) == 0 ? "-" : agregarComas((rows[3][1] + rows[4][1]).toFixed(2))}</td>
                <td>${(rows[3][2] + rows[4][2]) == 0 ? "-" : agregarComas((rows[3][2] + rows[4][2]).toFixed(2))}</td>
                <td>${(rows[3][3] + rows[4][3]) == 0 ? "-" : agregarComas((rows[3][3] + rows[4][3]).toFixed(2))}</td>
                <td>${(rows[3][4] + rows[4][4]) == 0 ? "-" : agregarComas((rows[3][4] + rows[4][4]).toFixed(2))}</td>
                <td>${(rows[3][5] + rows[4][5]) == 0 ? "-" : agregarComas((rows[3][5] + rows[4][5]).toFixed(2))}</td>
            </tr>
            <tr id="tr-totalINY-col">
                <td id="td-total-col">Total</td>
                <td>${(rows[3][0] + rows[4][0] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][0] + rows[4][0] + rows[5][0]).toFixed(2))}</td>
                <td>${(rows[3][1] + rows[4][1] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][1] + rows[4][1] + rows[5][1]).toFixed(2))}</td>
                <td>${(rows[3][2] + rows[4][2] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][2] + rows[4][2] + rows[5][2]).toFixed(2))}</td>
                <td>${(rows[3][3] + rows[4][3] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][3] + rows[4][3] + rows[5][3]).toFixed(2))}</td>
                <td>${(rows[3][4] + rows[4][4] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][4] + rows[4][4] + rows[5][4]).toFixed(2))}</td>
                <td>${(rows[3][5] + rows[4][5] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][5] + rows[4][5] + rows[5][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr>
        <td rowspan="6" id="Categoria">C900</td>
    </tr>`;

    bodytabhtml += `<tr id="tr-col">
                <td class="td-title">Bueno</td>
                <td>${rows[6][0] == 0 ? "-" : agregarComas(rows[6][0].toFixed(2))}</td>
                <td>${rows[6][1] == 0 ? "-" : agregarComas(rows[6][1].toFixed(2))}</td>
                <td>${rows[6][2] == 0 ? "-" : agregarComas(rows[6][2].toFixed(2))}</td>
                <td>${rows[6][3] == 0 ? "-" : agregarComas(rows[6][3].toFixed(2))}</td>
                <td>${rows[6][4] == 0 ? "-" : agregarComas(rows[6][4].toFixed(2))}</td>
                <td>${rows[6][5] == 0 ? "-" : agregarComas(rows[6][5].toFixed(2))}</td>
                <td rowspan="6" id="td-acomulado">${acumuladosArray[2]}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Quemado/Cont</td>
                <td>${rows[7][0] == 0 ? "-" : agregarComas(rows[7][0].toFixed(2))}</td>
                <td>${rows[7][1] == 0 ? "-" : agregarComas(rows[7][1].toFixed(2))}</td>
                <td>${rows[7][2] == 0 ? "-" : agregarComas(rows[7][2].toFixed(2))}</td>
                <td>${rows[7][3] == 0 ? "-" : agregarComas(rows[7][3].toFixed(2))}</td>
                <td>${rows[7][4] == 0 ? "-" : agregarComas(rows[7][4].toFixed(2))}</td>
                <td>${rows[7][5] == 0 ? "-" : agregarComas(rows[7][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col-baja">
                <td class="bajaTr">Baja</td>
                <td>${rows[8][0] == 0 ? "-" : agregarComas(rows[8][0].toFixed(2))}</td>
                <td>${rows[8][1] == 0 ? "-" : agregarComas(rows[8][1].toFixed(2))}</td>
                <td>${rows[8][2] == 0 ? "-" : agregarComas(rows[8][2].toFixed(2))}</td>
                <td>${rows[8][3] == 0 ? "-" : agregarComas(rows[8][3].toFixed(2))}</td>
                <td>${rows[8][4] == 0 ? "-" : agregarComas(rows[8][4].toFixed(2))}</td>
                <td>${rows[8][5] == 0 ? "-" : agregarComas(rows[8][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Total Consumible</td>
                <td>${(rows[6][0] + rows[7][0]) == 0 ? "-" : agregarComas((rows[6][0] + rows[7][0]).toFixed(2))}</td>
                <td>${(rows[6][1] + rows[7][1]) == 0 ? "-" : agregarComas((rows[6][1] + rows[7][1]).toFixed(2))}</td>
                <td>${(rows[6][2] + rows[7][2]) == 0 ? "-" : agregarComas((rows[6][2] + rows[7][2]).toFixed(2))}</td>
                <td>${(rows[6][3] + rows[7][3]) == 0 ? "-" : agregarComas((rows[6][3] + rows[7][3]).toFixed(2))}</td>
                <td>${(rows[6][4] + rows[7][4]) == 0 ? "-" : agregarComas((rows[6][4] + rows[7][4]).toFixed(2))}</td>
                <td>${(rows[6][5] + rows[7][5]) == 0 ? "-" : agregarComas((rows[6][5] + rows[7][5]).toFixed(2))}</td>
            </tr>
            <tr id="tr-totalINY-col">
                <td id="td-total-col">Total</td>
                <td>${(rows[6][0] + rows[7][0] + rows[8][0]) == 0 ? "-" : agregarComas((rows[6][0] + rows[7][0] + rows[8][0]).toFixed(2))}</td>
                <td>${(rows[6][1] + rows[7][1] + rows[8][1]) == 0 ? "-" : agregarComas((rows[6][1] + rows[7][1] + rows[8][1]).toFixed(2))}</td>
                <td>${(rows[6][2] + rows[7][2] + rows[8][2]) == 0 ? "-" : agregarComas((rows[6][2] + rows[7][2] + rows[8][2]).toFixed(2))}</td>
                <td>${(rows[6][3] + rows[7][3] + rows[8][3]) == 0 ? "-" : agregarComas((rows[6][3] + rows[7][3] + rows[8][3]).toFixed(2))}</td>
                <td>${(rows[6][4] + rows[7][4] + rows[8][4]) == 0 ? "-" : agregarComas((rows[6][4] + rows[7][4] + rows[8][4]).toFixed(2))}</td>
                <td>${(rows[6][5] + rows[7][5] + rows[8][5]) == 0 ? "-" : agregarComas((rows[6][5] + rows[7][5] + rows[8][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr>
        <td rowspan="6" id="Categoria">CPVC</td>
    </tr>`;

    bodytabhtml += `<tr id="tr-col">
                <td class="td-title">Bueno</td>
                <td>${rows[9][0] == 0 ? "-" : agregarComas(rows[9][0].toFixed(2))}</td>
                <td>${rows[9][1] == 0 ? "-" : agregarComas(rows[9][1].toFixed(2))}</td>
                <td>${rows[9][2] == 0 ? "-" : agregarComas(rows[9][2].toFixed(2))}</td>
                <td>${rows[9][3] == 0 ? "-" : agregarComas(rows[9][3].toFixed(2))}</td>
                <td>${rows[9][4] == 0 ? "-" : agregarComas(rows[9][4].toFixed(2))}</td>
                <td>${rows[9][5] == 0 ? "-" : agregarComas(rows[9][5].toFixed(2))}</td>
                <td rowspan="6" id="td-acomulado">${acumuladosArray[3]}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Quemado/Cont</td>
                <td>${rows[10][0] == 0 ? "-" : agregarComas(rows[10][0].toFixed(2))}</td>
                <td>${rows[10][1] == 0 ? "-" : agregarComas(rows[10][1].toFixed(2))}</td>
                <td>${rows[10][2] == 0 ? "-" : agregarComas(rows[10][2].toFixed(2))}</td>
                <td>${rows[10][3] == 0 ? "-" : agregarComas(rows[10][3].toFixed(2))}</td>
                <td>${rows[10][4] == 0 ? "-" : agregarComas(rows[10][4].toFixed(2))}</td>
                <td>${rows[10][5] == 0 ? "-" : agregarComas(rows[10][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col-baja">
                <td class="bajaTr">Baja</td>
                <td>${rows[11][0] == 0 ? "-" : agregarComas(rows[11][0].toFixed(2))}</td>
                <td>${rows[11][1] == 0 ? "-" : agregarComas(rows[11][1].toFixed(2))}</td>
                <td>${rows[11][2] == 0 ? "-" : agregarComas(rows[11][2].toFixed(2))}</td>
                <td>${rows[11][3] == 0 ? "-" : agregarComas(rows[11][3].toFixed(2))}</td>
                <td>${rows[11][4] == 0 ? "-" : agregarComas(rows[11][4].toFixed(2))}</td>
                <td>${rows[11][5] == 0 ? "-" : agregarComas(rows[11][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Total Consumible</td>
                <td>${(rows[9][0] + rows[10][0]) == 0 ? "-" : agregarComas((rows[9][0] + rows[10][0]).toFixed(2))}</td>
                <td>${(rows[9][1] + rows[10][1]) == 0 ? "-" : agregarComas((rows[9][1] + rows[10][1]).toFixed(2))}</td>
                <td>${(rows[9][2] + rows[10][2]) == 0 ? "-" : agregarComas((rows[9][2] + rows[10][2]).toFixed(2))}</td>
                <td>${(rows[9][3] + rows[10][3]) == 0 ? "-" : agregarComas((rows[9][3] + rows[10][3]).toFixed(2))}</td>
                <td>${(rows[9][4] + rows[10][4]) == 0 ? "-" : agregarComas((rows[9][4] + rows[10][4]).toFixed(2))}</td>
                <td>${(rows[9][5] + rows[10][5]) == 0 ? "-" : agregarComas((rows[9][5] + rows[10][5]).toFixed(2))}</td>
            </tr>
            <tr id="tr-totalINY-col">
                <td class="td-total-col" style="text-align: right !important">Total</td>
                <td>${(rows[9][0] + rows[10][0] + rows[11][0]) == 0 ? "-" : agregarComas((rows[9][0] + rows[10][0] + rows[11][0]).toFixed(2))}</td>
                <td>${(rows[9][1] + rows[10][1] + rows[11][1]) == 0 ? "-" : agregarComas((rows[9][1] + rows[10][1] + rows[11][1]).toFixed(2))}</td>
                <td>${(rows[9][2] + rows[10][2] + rows[11][2]) == 0 ? "-" : agregarComas((rows[9][2] + rows[10][2] + rows[11][2]).toFixed(2))}</td>
                <td>${(rows[9][3] + rows[10][3] + rows[11][3]) == 0 ? "-" : agregarComas((rows[9][3] + rows[10][3] + rows[11][3]).toFixed(2))}</td>
                <td>${(rows[9][4] + rows[10][4] + rows[11][4]) == 0 ? "-" : agregarComas((rows[9][4] + rows[10][4] + rows[11][4]).toFixed(2))}</td>
                <td>${(rows[9][5] + rows[10][5] + rows[11][5]) == 0 ? "-" : agregarComas((rows[9][5] + rows[10][5] + rows[11][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr>
        <td rowspan="20" class="tr-Inyecciones">Inyección</td>
        <td rowspan="7" class="InyCategoria">DWV</td>
    </tr>`;

    bodytabhtml += `<tr id="tr-col">
                <td class="td-title">Bueno</td>
                <td>${rows[12][0] == 0 ? "-" : agregarComas(rows[12][0].toFixed(2))}</td>
                <td>${rows[12][1] == 0 ? "-" : agregarComas(rows[12][1].toFixed(2))}</td>
                <td>${rows[12][2] == 0 ? "-" : agregarComas(rows[12][2].toFixed(2))}</td>
                <td>${rows[12][3] == 0 ? "-" : agregarComas(rows[12][3].toFixed(2))}</td>
                <td>${rows[12][4] == 0 ? "-" : agregarComas(rows[12][4].toFixed(2))}</td>
                <td>${rows[12][5] == 0 ? "-" : agregarComas(rows[12][5].toFixed(2))}</td>
                <td rowspan="7" id="td-acomulado">${acumuladosArray[4]}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Colada</td>
                <td>${rows[13][0] == 0 ? "-" : agregarComas(rows[13][0].toFixed(2))}</td>
                <td>${rows[13][1] == 0 ? "-" : agregarComas(rows[13][1].toFixed(2))}</td>
                <td>${rows[13][2] == 0 ? "-" : agregarComas(rows[13][2].toFixed(2))}</td>
                <td>${rows[13][3] == 0 ? "-" : agregarComas(rows[13][3].toFixed(2))}</td>
                <td>${rows[13][4] == 0 ? "-" : agregarComas(rows[13][4].toFixed(2))}</td>
                <td>${rows[13][5] == 0 ? "-" : agregarComas(rows[13][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Quemado/Cont.</td>
                <td>${rows[14][0] == 0 ? "-" : agregarComas(rows[14][0].toFixed(2))}</td>
                <td>${rows[14][1] == 0 ? "-" : agregarComas(rows[14][1].toFixed(2))}</td>
                <td>${rows[14][2] == 0 ? "-" : agregarComas(rows[14][2].toFixed(2))}</td>
                <td>${rows[14][3] == 0 ? "-" : agregarComas(rows[14][3].toFixed(2))}</td>
                <td>${rows[14][4] == 0 ? "-" : agregarComas(rows[14][4].toFixed(2))}</td>
                <td>${rows[14][5] == 0 ? "-" : agregarComas(rows[14][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col-baja">
                <td class="bajaTr">Baja</td>
                <td>${rows[15][0] == 0 ? "-" : agregarComas(rows[15][0].toFixed(2))}</td>
                <td>${rows[15][1] == 0 ? "-" : agregarComas(rows[15][1].toFixed(2))}</td>
                <td>${rows[15][2] == 0 ? "-" : agregarComas(rows[15][2].toFixed(2))}</td>
                <td>${rows[15][3] == 0 ? "-" : agregarComas(rows[15][3].toFixed(2))}</td>
                <td>${rows[15][4] == 0 ? "-" : agregarComas(rows[15][4].toFixed(2))}</td>
                <td>${rows[15][5] == 0 ? "-" : agregarComas(rows[15][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Total Consumible</td>
                <td>${(rows[12][0] + rows[13][0] + rows[14][0]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0]).toFixed(2))}</td>
                <td>${(rows[12][1] + rows[13][1] + rows[14][1]) == 0 ? "-" : agregarComas((rows[12][1] + rows[13][1] + rows[14][1]).toFixed(2))}</td>
                <td>${(rows[12][2] + rows[13][2] + rows[14][2]) == 0 ? "-" : agregarComas((rows[12][2] + rows[13][2] + rows[14][2]).toFixed(2))}</td>
                <td>${(rows[12][3] + rows[13][3] + rows[14][3]) == 0 ? "-" : agregarComas((rows[12][3] + rows[13][3] + rows[14][3]).toFixed(2))}</td>
                <td>${(rows[12][4] + rows[13][4] + rows[14][4]) == 0 ? "-" : agregarComas((rows[12][4] + rows[13][4] + rows[14][4]).toFixed(2))}</td>
                <td>${(rows[12][5] + rows[13][5] + rows[14][5]) == 0 ? "-" : agregarComas((rows[12][5] + rows[13][5] + rows[14][5]).toFixed(2))}</td>
            </tr>
            <tr id="tr-totalINY-col">
                <td class="td-total-col" style="text-align: right !important">Total</td>
                <td>${(rows[12][0] + rows[13][0] + rows[14][0] + rows[15][0]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][0]).toFixed(2))}</td>
                <td>${(rows[12][1] + rows[13][1] + rows[14][1] + rows[15][1]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][1]).toFixed(2))}</td>
                <td>${(rows[12][2] + rows[13][2] + rows[14][2] + rows[15][2]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][2]).toFixed(2))}</td>
                <td>${(rows[12][3] + rows[13][3] + rows[14][3] + rows[15][3]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][3]).toFixed(2))}</td>
                <td>${(rows[12][4] + rows[13][4] + rows[14][4] + rows[15][4]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][4]).toFixed(2))}</td>
                <td>${(rows[12][5] + rows[13][5] + rows[14][5] + rows[15][5]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr>
                <td rowspan="7" class="InyCategoria">CLAY</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Bueno</td>
                <td>${rows[16][0] == 0 ? "-" : agregarComas(rows[16][0].toFixed(2))}</td>
                <td>${rows[16][1] == 0 ? "-" : agregarComas(rows[16][1].toFixed(2))}</td>
                <td>${rows[16][2] == 0 ? "-" : agregarComas(rows[16][2].toFixed(2))}</td>
                <td>${rows[16][3] == 0 ? "-" : agregarComas(rows[16][3].toFixed(2))}</td>
                <td>${rows[16][4] == 0 ? "-" : agregarComas(rows[16][4].toFixed(2))}</td>
                <td>${rows[16][5] == 0 ? "-" : agregarComas(rows[16][5].toFixed(2))}</td>
                <td rowspan="7" id="td-acomulado">${acumuladosArray[5]}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Colada</td>
                <td>${rows[17][0] == 0 ? "-" : agregarComas(rows[17][0].toFixed(2))}</td>
                <td>${rows[17][1] == 0 ? "-" : agregarComas(rows[17][1].toFixed(2))}</td>
                <td>${rows[17][2] == 0 ? "-" : agregarComas(rows[17][2].toFixed(2))}</td>
                <td>${rows[17][3] == 0 ? "-" : agregarComas(rows[17][3].toFixed(2))}</td>
                <td>${rows[17][4] == 0 ? "-" : agregarComas(rows[17][4].toFixed(2))}</td>
                <td>${rows[17][5] == 0 ? "-" : agregarComas(rows[17][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Quemado/Cont.</td>
                <td>${rows[18][0] == 0 ? "-" : agregarComas(rows[18][0].toFixed(2))}</td>
                <td>${rows[18][1] == 0 ? "-" : agregarComas(rows[18][1].toFixed(2))}</td>
                <td>${rows[18][2] == 0 ? "-" : agregarComas(rows[18][2].toFixed(2))}</td>
                <td>${rows[18][3] == 0 ? "-" : agregarComas(rows[18][3].toFixed(2))}</td>
                <td>${rows[18][4] == 0 ? "-" : agregarComas(rows[18][4].toFixed(2))}</td>
                <td>${rows[18][5] == 0 ? "-" : agregarComas(rows[18][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="bajaTr">Baja</td>
                <td>${rows[19][0] == 0 ? "-" : agregarComas(rows[19][0].toFixed(2))}</td>
                <td>${rows[19][1] == 0 ? "-" : agregarComas(rows[19][1].toFixed(2))}</td>
                <td>${rows[19][2] == 0 ? "-" : agregarComas(rows[19][2].toFixed(2))}</td>
                <td>${rows[19][3] == 0 ? "-" : agregarComas(rows[19][3].toFixed(2))}</td>
                <td>${rows[19][4] == 0 ? "-" : agregarComas(rows[19][4].toFixed(2))}</td>
                <td>${rows[19][5] == 0 ? "-" : agregarComas(rows[19][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Total Consumible</td>
                <td>${(rows[16][0] + rows[17][0] + rows[18][0]) == 0 ? "-" : agregarComas((rows[16][0] + rows[17][0] + rows[18][0]).toFixed(2))}</td>
                <td>${(rows[16][1] + rows[17][1] + rows[18][1]) == 0 ? "-" : agregarComas((rows[16][1] + rows[17][1] + rows[18][1]).toFixed(2))}</td>
                <td>${(rows[16][2] + rows[17][2] + rows[18][2]) == 0 ? "-" : agregarComas((rows[16][2] + rows[17][2] + rows[18][2]).toFixed(2))}</td>
                <td>${(rows[16][3] + rows[17][3] + rows[18][3]) == 0 ? "-" : agregarComas((rows[16][3] + rows[17][3] + rows[18][3]).toFixed(2))}</td>
                <td>${(rows[16][4] + rows[17][4] + rows[18][4]) == 0 ? "-" : agregarComas((rows[16][4] + rows[17][4] + rows[18][4]).toFixed(2))}</td>
                <td>${(rows[16][5] + rows[17][5] + rows[18][5]) == 0 ? "-" : agregarComas((rows[16][5] + rows[17][5] + rows[18][5]).toFixed(2))}</td>
            </tr>
            <tr id="tr-totalINY-col">
                <td class="td-total-col" style="text-align: right !important">Total Inyección</td>
                <td>${(rows[16][0] + rows[17][0] + rows[18][0] + rows[19][0]) == 0 ? "-" : agregarComas((rows[16][0] + rows[17][0] + rows[18][0] + rows[19][0]).toFixed(2))}</td>
                <td>${(rows[16][1] + rows[17][1] + rows[18][1] + rows[19][1]) == 0 ? "-" : agregarComas((rows[16][1] + rows[17][1] + rows[18][1] + rows[19][1]).toFixed(2))}</td>
                <td>${(rows[16][2] + rows[17][2] + rows[18][2] + rows[19][2]) == 0 ? "-" : agregarComas((rows[16][2] + rows[17][2] + rows[18][2] + rows[19][2]).toFixed(2))}</td>
                <td>${(rows[16][3] + rows[17][3] + rows[18][3] + rows[19][3]) == 0 ? "-" : agregarComas((rows[16][3] + rows[17][3] + rows[18][3] + rows[19][3]).toFixed(2))}</td>
                <td>${(rows[16][4] + rows[17][4] + rows[18][4] + rows[19][4]) == 0 ? "-" : agregarComas((rows[16][4] + rows[17][4] + rows[18][4] + rows[19][4]).toFixed(2))}</td>
                <td>${(rows[16][5] + rows[17][5] + rows[18][5] + rows[19][5]) == 0 ? "-" : agregarComas((rows[16][5] + rows[17][5] + rows[18][5] + rows[19][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr>
                <td rowspan="6" class="InyCategoria">PURGA</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Bueno</td>
                <td>${rows[20][0] == 0 ? "-" : agregarComas(rows[20][0].toFixed(2))}</td>
                <td>${rows[20][1] == 0 ? "-" : agregarComas(rows[20][1].toFixed(2))}</td>
                <td>${rows[20][2] == 0 ? "-" : agregarComas(rows[20][2].toFixed(2))}</td>
                <td>${rows[20][3] == 0 ? "-" : agregarComas(rows[20][3].toFixed(2))}</td>
                <td>${rows[20][4] == 0 ? "-" : agregarComas(rows[20][4].toFixed(2))}</td>
                <td>${rows[20][5] == 0 ? "-" : agregarComas(rows[20][5].toFixed(2))}</td>
                <td rowspan="5" id="td-acomulado">${acumuladosArray[6]}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Quemado/Cont.</td>
                <td>${rows[21][0] == 0 ? "-" : agregarComas(rows[21][0].toFixed(2))}</td>
                <td>${rows[21][1] == 0 ? "-" : agregarComas(rows[21][1].toFixed(2))}</td>
                <td>${rows[21][2] == 0 ? "-" : agregarComas(rows[21][2].toFixed(2))}</td>
                <td>${rows[21][3] == 0 ? "-" : agregarComas(rows[21][3].toFixed(2))}</td>
                <td>${rows[21][4] == 0 ? "-" : agregarComas(rows[21][4].toFixed(2))}</td>
                <td>${rows[21][5] == 0 ? "-" : agregarComas(rows[21][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Degradada P/Baja</td>
                <td>${rows[22][0] == 0 ? "-" : agregarComas(rows[22][0].toFixed(2))}</td>
                <td>${rows[22][1] == 0 ? "-" : agregarComas(rows[22][1].toFixed(2))}</td>
                <td>${rows[22][2] == 0 ? "-" : agregarComas(rows[22][2].toFixed(2))}</td>
                <td>${rows[22][3] == 0 ? "-" : agregarComas(rows[22][3].toFixed(2))}</td>
                <td>${rows[22][4] == 0 ? "-" : agregarComas(rows[22][4].toFixed(2))}</td>
                <td>${rows[22][5] == 0 ? "-" : agregarComas(rows[22][5].toFixed(2))}</td>
            </tr>
            <tr id="tr-col">
                <td class="td-title">Total P/Reciclaje</td>
                <td>${(rows[20][0] + rows[21][0]) == 0 ? "-" : agregarComas((rows[20][0] + rows[21][0]).toFixed(2))}</td>
                <td>${(rows[20][1] + rows[21][1]) == 0 ? "-" : agregarComas((rows[20][1] + rows[21][1]).toFixed(2))}</td>
                <td>${(rows[20][2] + rows[21][2]) == 0 ? "-" : agregarComas((rows[20][2] + rows[21][2]).toFixed(2))}</td>
                <td>${(rows[20][3] + rows[21][3]) == 0 ? "-" : agregarComas((rows[20][3] + rows[21][3]).toFixed(2))}</td>
                <td>${(rows[20][4] + rows[21][4]) == 0 ? "-" : agregarComas((rows[20][4] + rows[21][4]).toFixed(2))}</td>
                <td>${(rows[20][5] + rows[21][5]) == 0 ? "-" : agregarComas((rows[20][5] + rows[21][5]).toFixed(2))}</td>
            </tr>
            <tr id="tr-totalINY-col">
                <td class="td-total-col" style="text-align: right !important">Total Purga</td>
                <td>${(rows[20][0] + rows[21][0] + rows[22][0]) == 0 ? "-" : agregarComas((rows[20][0] + rows[21][0] + rows[22][0]).toFixed(2))}</td>
                <td>${(rows[20][1] + rows[21][1] + rows[22][1]) == 0 ? "-" : agregarComas((rows[20][1] + rows[21][1] + rows[22][1]).toFixed(2))}</td>
                <td>${(rows[20][2] + rows[21][2] + rows[22][2]) == 0 ? "-" : agregarComas((rows[20][2] + rows[21][2] + rows[22][2]).toFixed(2))}</td>
                <td>${(rows[20][3] + rows[21][3] + rows[22][3]) == 0 ? "-" : agregarComas((rows[20][3] + rows[21][3] + rows[22][3]).toFixed(2))}</td>
                <td>${(rows[20][4] + rows[21][4] + rows[22][4]) == 0 ? "-" : agregarComas((rows[20][4] + rows[21][4] + rows[22][4]).toFixed(2))}</td>
                <td>${(rows[20][5] + rows[21][5] + rows[22][5]) == 0 ? "-" : agregarComas((rows[20][5] + rows[21][5] + rows[22][5]).toFixed(2))}</td>
            </tr>`;

    bodytabhtml += `<tr class="secondHead">
                <td colspan="3">Material</td>
                <td>Srap</td>
                <td>Viruta</td>
                <td>Molido</td>
                <td>Pulverizado</td>
                <td>Polvo de Filtros de Vacio</td>
                <td>Compuesto Virgen en Saco</td>
                <td>Total Material Reprocesado</td>
            </tr>
            <tr id="tr-col">
                <td colspan="3" style="vertical-align: middle; text-align: center">Total Hoy PVC</td>
                <td>${registosHoyArray[0] == '-' ? registosHoyArray[0] : registosHoyArray[0].toFixed(2)}</td>
                <td>${registosHoyArray[1] == '-' ? registosHoyArray[1] : registosHoyArray[1].toFixed(2)}</td>
                <td>${registosHoyArray[2] == '-' ? registosHoyArray[2] : registosHoyArray[2].toFixed(2)}</td>
                <td>${registosHoyArray[3] == '-' ? registosHoyArray[3] : registosHoyArray[3].toFixed(2)}</td>
                <td>${registosHoyArray[4] == '-' ? registosHoyArray[4] : registosHoyArray[4].toFixed(2)}</td>
                <td>${registosHoyArray[5] == '-' ? registosHoyArray[5] : registosHoyArray[5].toFixed(2)}</td>
                <td>${registosHoyArray[6] == '-' ? registosHoyArray[6] : registosHoyArray[6].toFixed(2)}</td>
            </tr>
            <tr id="tr-col">
                <td colspan="3" style="vertical-align: middle; text-align: center">Total Ayer PVC</td>
                <td>${registosAyerArray[0] == '-' ? registosAyerArray[0] : registosAyerArray[0].toFixed(2)}</td>
                <td>${registosAyerArray[1] == '-' ? registosAyerArray[1] : registosAyerArray[1].toFixed(2)}</td>
                <td>${registosAyerArray[2] == '-' ? registosAyerArray[2] : registosAyerArray[2].toFixed(2)}</td>
                <td>${registosAyerArray[3] == '-' ? registosAyerArray[3] : registosAyerArray[3].toFixed(2)}</td>
                <td>${registosAyerArray[4] == '-' ? registosAyerArray[4] : registosAyerArray[4].toFixed(2)}</td>
                <td>${registosAyerArray[5] == '-' ? registosAyerArray[5] : registosAyerArray[5].toFixed(2)}</td>
                <td>${registosAyerArray[6] == '-' ? registosAyerArray[6] : registosAyerArray[6].toFixed(2)}</td>
            </tr>`;

    document.getElementById("bodytab").innerHTML = bodytabhtml;

}

function agregarComas(numero) {
    // Convertir el número a una cadena y eliminar espacios en blanco
    let numeroStr = String(numero).trim();

    // Verificar si el número es negativo y guardar el signo
    let signo = "";
    if (numeroStr.startsWith("-")) {
        signo = "-";
        numeroStr = numeroStr.slice(1);
    }

    // Dividir el número en parte entera y decimal (si existe)
    let partes = numeroStr.split(".");
    let parteEntera = partes[0];
    let parteDecimal = partes[1] ? "." + partes[1] : "";

    // Agregar comas cada 3 dígitos en la parte entera
    let parteEnteraConComas = "";
    let longitud = parteEntera.length;
    for (let i = longitud - 1; i >= 0; i--) {
        parteEnteraConComas = parteEntera.charAt(i) + parteEnteraConComas;
        if ((longitud - i) % 3 === 0 && i > 0) {
            parteEnteraConComas = "," + parteEnteraConComas;
        }
    }

    // Combinar el signo, la parte entera con comas y la parte decimal (si existe)
    let resultado = signo + parteEnteraConComas + parteDecimal;

    return resultado;
}
const loader = document.getElementById('loaderDiv')
let rgb1 = [165, 165, 165];
let rgb2 = [113, 113, 113];
let rgb3 = [165, 165, 165];

async function generarpdf() {
    loader.style.display = 'flex';

    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter'
    });

    doc.setFont("times");
    // Agregar imagen
    var img = new Image();
    img.src = '../../Images/LogoPTMHDBN.png';
    img.onload = async function () {
        var imgWidth = this.width;
        var imgHeight = this.height;

        // Obtener el tamaño de la página y establecer los márgenes
        var pageSize = doc.internal.pageSize;
        var pageWidth = pageSize.width;
        var marginLeft = 10;
        var marginRight = 10;
        var usableWidth = pageWidth - marginLeft - marginRight;

        // Calcular el ancho y la altura de la imagen
        var imageWidth = usableWidth * 0.35;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', imageX, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE DE INVENTARIO FÍSICO";
        doc.text(text, 140, 17, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, 140, 22, { align: 'center', });

        // Crea un objeto Date para la fecha y hora actual
        var fechaHoraActual = new Date();

        // Obtiene el año actual
        var año = fechaHoraActual.getFullYear();

        // Obtiene el mes actual (los meses van de 0 a 11)
        var mes = fechaHoraActual.getMonth() + 1;

        // Obtiene el día actual
        var dia = fechaHoraActual.getDate();

        // Obtiene las horas actuales
        var horas = fechaHoraActual.getHours();

        // Obtiene los minutos actuales
        var minutos = fechaHoraActual.getMinutes();

        // Obtiene los segundos actuales
        var segundos = fechaHoraActual.getSeconds();

        // Crea una cadena con la fecha y hora actual
        var fechaHoraActualStr = dia + "/" + mes + "/" + año + " " + horas + ":" + minutos;

        doc.setFontSize(12);
        var text = "Fecha: " + fechaHoraActualStr;
        doc.text(text, 140, 28, { align: 'center', });

        var rectX = 10; // Posición x del rectángulo
        var rectY = 40; // Posición y del rectángulo
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 7; // Altura del rectángulo
        // Dibuja el rectángulo negro

        // Establece el color de fondo
        doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);

        // Dibuja un rectángulo negro en el centro de la página
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 10; // Altura del rectángulo
        var rectX = (10); // Coordenada X del rectángulo
        var rectY = (37); // Coordenada Y del rectángulo
        doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');

        // Establece el color de texto en blanco
        doc.setTextColor(255, 255, 255);

        // Agrega texto blanco en el centro del rectángulo
        var text = 'INVENTARIO FÍSICO DE SCRAP Y MOLINOS';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 43; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 50;


        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - IPS', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[0][0] == 0 ? "-" : agregarComas(rows[0][0].toFixed(2)),
                    rows[0][1] == 0 ? "-" : agregarComas(rows[0][1].toFixed(2)),
                    rows[0][2] == 0 ? "-" : agregarComas(rows[0][2].toFixed(2)),
                    rows[0][3] == 0 ? "-" : agregarComas(rows[0][3].toFixed(2)),
                    rows[0][4] == 0 ? "-" : agregarComas(rows[0][4].toFixed(2)),
                    rows[0][5] == 0 ? "-" : agregarComas(rows[0][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[1][0] == 0 ? "-" : agregarComas(rows[0][0].toFixed(2)),
                    rows[1][1] == 0 ? "-" : agregarComas(rows[0][1].toFixed(2)),
                    rows[1][2] == 0 ? "-" : agregarComas(rows[0][2].toFixed(2)),
                    rows[1][3] == 0 ? "-" : agregarComas(rows[0][3].toFixed(2)),
                    rows[1][4] == 0 ? "-" : agregarComas(rows[0][4].toFixed(2)),
                    rows[1][5] == 0 ? "-" : agregarComas(rows[0][5].toFixed(2))
                ],
                ['Baja',
                    rows[2][0] == 0 ? "-" : agregarComas(rows[2][0].toFixed(2)),
                    rows[2][1] == 0 ? "-" : agregarComas(rows[2][1].toFixed(2)),
                    rows[2][2] == 0 ? "-" : agregarComas(rows[2][2].toFixed(2)),
                    rows[2][3] == 0 ? "-" : agregarComas(rows[2][3].toFixed(2)),
                    rows[2][4] == 0 ? "-" : agregarComas(rows[2][4].toFixed(2)),
                    rows[2][5] == 0 ? "-" : agregarComas(rows[2][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[0][0] + rows[1][0]) == 0 ? "-" : agregarComas((rows[0][0] + rows[1][0]).toFixed(2)),
                    (rows[0][1] + rows[1][1]) == 0 ? "-" : agregarComas((rows[0][1] + rows[1][1]).toFixed(2)),
                    (rows[0][2] + rows[1][2]) == 0 ? "-" : agregarComas((rows[0][2] + rows[1][2]).toFixed(2)),
                    (rows[0][3] + rows[1][3]) == 0 ? "-" : agregarComas((rows[0][3] + rows[1][3]).toFixed(2)),
                    (rows[0][4] + rows[1][4]) == 0 ? "-" : agregarComas((rows[0][4] + rows[1][4]).toFixed(2)),
                    (rows[0][5] + rows[1][5]) == 0 ? "-" : agregarComas((rows[0][5] + rows[1][5]).toFixed(2))
                ],
                ['Total',
                    (rows[0][0] + rows[1][0] + rows[2][0]) == 0 ? "-" : agregarComas((rows[0][0] + rows[1][0] + rows[2][0]).toFixed(2)),
                    (rows[0][1] + rows[1][1] + rows[2][1]) == 0 ? "-" : agregarComas((rows[0][1] + rows[1][1] + rows[2][1]).toFixed(2)),
                    (rows[0][2] + rows[1][2] + rows[2][2]) == 0 ? "-" : agregarComas((rows[0][2] + rows[1][2] + rows[2][2]).toFixed(2)),
                    (rows[0][3] + rows[1][3] + rows[2][3]) == 0 ? "-" : agregarComas((rows[0][3] + rows[1][3] + rows[2][3]).toFixed(2)),
                    (rows[0][4] + rows[1][4] + rows[2][4]) == 0 ? "-" : agregarComas((rows[0][4] + rows[1][4] + rows[2][4]).toFixed(2)),
                    (rows[0][5] + rows[1][5] + rows[2][5]) == 0 ? "-" : agregarComas((rows[0][5] + rows[1][5] + rows[2][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });
        startY = doc.autoTable.previous.finalY + 4;

        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - DWV', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[3][0] == 0 ? "-" : agregarComas(rows[3][0].toFixed(2)),
                    rows[3][1] == 0 ? "-" : agregarComas(rows[3][1].toFixed(2)),
                    rows[3][2] == 0 ? "-" : agregarComas(rows[3][2].toFixed(2)),
                    rows[3][3] == 0 ? "-" : agregarComas(rows[3][3].toFixed(2)),
                    rows[3][4] == 0 ? "-" : agregarComas(rows[3][4].toFixed(2)),
                    rows[3][5] == 0 ? "-" : agregarComas(rows[3][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[4][0] == 0 ? "-" : agregarComas(rows[4][0].toFixed(2)),
                    rows[4][1] == 0 ? "-" : agregarComas(rows[4][1].toFixed(2)),
                    rows[4][2] == 0 ? "-" : agregarComas(rows[4][2].toFixed(2)),
                    rows[4][3] == 0 ? "-" : agregarComas(rows[4][3].toFixed(2)),
                    rows[4][4] == 0 ? "-" : agregarComas(rows[4][4].toFixed(2)),
                    rows[4][5] == 0 ? "-" : agregarComas(rows[4][5].toFixed(2))
                ],
                ['Baja',
                    rows[5][0] == 0 ? "-" : agregarComas(rows[5][0].toFixed(2)),
                    rows[5][1] == 0 ? "-" : agregarComas(rows[5][1].toFixed(2)),
                    rows[5][2] == 0 ? "-" : agregarComas(rows[5][2].toFixed(2)),
                    rows[5][3] == 0 ? "-" : agregarComas(rows[5][3].toFixed(2)),
                    rows[5][4] == 0 ? "-" : agregarComas(rows[5][4].toFixed(2)),
                    rows[5][5] == 0 ? "-" : agregarComas(rows[5][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[3][0] + rows[4][0]) == 0 ? "-" : agregarComas((rows[3][0] + rows[4][0]).toFixed(2)),
                    (rows[3][1] + rows[4][1]) == 0 ? "-" : agregarComas((rows[3][1] + rows[4][1]).toFixed(2)),
                    (rows[3][2] + rows[4][2]) == 0 ? "-" : agregarComas((rows[3][2] + rows[4][2]).toFixed(2)),
                    (rows[3][3] + rows[4][3]) == 0 ? "-" : agregarComas((rows[3][3] + rows[4][3]).toFixed(2)),
                    (rows[3][4] + rows[4][4]) == 0 ? "-" : agregarComas((rows[3][4] + rows[4][4]).toFixed(2)),
                    (rows[3][5] + rows[4][5]) == 0 ? "-" : agregarComas((rows[3][5] + rows[4][5]).toFixed(2))
                ],
                ['Total',
                    (rows[3][0] + rows[4][0] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][0] + rows[4][0] + rows[5][0]).toFixed(2)),
                    (rows[3][1] + rows[4][1] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][1] + rows[4][1] + rows[5][1]).toFixed(2)),
                    (rows[3][2] + rows[4][2] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][2] + rows[4][2] + rows[5][2]).toFixed(2)),
                    (rows[3][3] + rows[4][3] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][3] + rows[4][3] + rows[5][3]).toFixed(2)),
                    (rows[3][4] + rows[4][4] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][4] + rows[4][4] + rows[5][4]).toFixed(2)),
                    (rows[3][5] + rows[4][5] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][5] + rows[4][5] + rows[5][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 4;

        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - C900', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[6][0] == 0 ? "-" : agregarComas(rows[6][0].toFixed(2)),
                    rows[6][1] == 0 ? "-" : agregarComas(rows[6][1].toFixed(2)),
                    rows[6][2] == 0 ? "-" : agregarComas(rows[6][2].toFixed(2)),
                    rows[6][3] == 0 ? "-" : agregarComas(rows[6][3].toFixed(2)),
                    rows[6][4] == 0 ? "-" : agregarComas(rows[6][4].toFixed(2)),
                    rows[6][5] == 0 ? "-" : agregarComas(rows[6][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[7][0] == 0 ? "-" : agregarComas(rows[7][0].toFixed(2)),
                    rows[7][1] == 0 ? "-" : agregarComas(rows[7][1].toFixed(2)),
                    rows[7][2] == 0 ? "-" : agregarComas(rows[7][2].toFixed(2)),
                    rows[7][3] == 0 ? "-" : agregarComas(rows[7][3].toFixed(2)),
                    rows[7][4] == 0 ? "-" : agregarComas(rows[7][4].toFixed(2)),
                    rows[7][5] == 0 ? "-" : agregarComas(rows[7][5].toFixed(2))
                ],
                ['Baja',
                    rows[8][0] == 0 ? "-" : agregarComas(rows[8][0].toFixed(2)),
                    rows[8][1] == 0 ? "-" : agregarComas(rows[8][1].toFixed(2)),
                    rows[8][2] == 0 ? "-" : agregarComas(rows[8][2].toFixed(2)),
                    rows[8][3] == 0 ? "-" : agregarComas(rows[8][3].toFixed(2)),
                    rows[8][4] == 0 ? "-" : agregarComas(rows[8][4].toFixed(2)),
                    rows[8][5] == 0 ? "-" : agregarComas(rows[8][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[6][0] + rows[7][0]) == 0 ? "-" : agregarComas((rows[6][0] + rows[7][0]).toFixed(2)),
                    (rows[6][1] + rows[7][1]) == 0 ? "-" : agregarComas((rows[6][1] + rows[7][1]).toFixed(2)),
                    (rows[6][2] + rows[7][2]) == 0 ? "-" : agregarComas((rows[6][2] + rows[7][2]).toFixed(2)),
                    (rows[6][3] + rows[7][3]) == 0 ? "-" : agregarComas((rows[6][3] + rows[7][3]).toFixed(2)),
                    (rows[6][4] + rows[7][4]) == 0 ? "-" : agregarComas((rows[6][4] + rows[7][4]).toFixed(2)),
                    (rows[6][5] + rows[7][5]) == 0 ? "-" : agregarComas((rows[6][5] + rows[7][5]).toFixed(2))
                ],
                ['Total',
                    (rows[6][0] + rows[7][0] + rows[8][0]) == 0 ? "-" : agregarComas((rows[6][0] + rows[7][0] + rows[8][0]).toFixed(2)),
                    (rows[6][1] + rows[7][1] + rows[8][1]) == 0 ? "-" : agregarComas((rows[6][1] + rows[7][1] + rows[8][1]).toFixed(2)),
                    (rows[6][2] + rows[7][2] + rows[8][2]) == 0 ? "-" : agregarComas((rows[6][2] + rows[7][2] + rows[8][2]).toFixed(2)),
                    (rows[6][3] + rows[7][3] + rows[8][3]) == 0 ? "-" : agregarComas((rows[6][3] + rows[7][3] + rows[8][3]).toFixed(2)),
                    (rows[6][4] + rows[7][4] + rows[8][4]) == 0 ? "-" : agregarComas((rows[6][4] + rows[7][4] + rows[8][4]).toFixed(2)),
                    (rows[6][5] + rows[7][5] + rows[8][5]) == 0 ? "-" : agregarComas((rows[6][5] + rows[7][5] + rows[8][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });


        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - CPVC', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[9][0] == 0 ? "-" : agregarComas(rows[9][0].toFixed(2)),
                    rows[9][1] == 0 ? "-" : agregarComas(rows[9][1].toFixed(2)),
                    rows[9][2] == 0 ? "-" : agregarComas(rows[9][2].toFixed(2)),
                    rows[9][3] == 0 ? "-" : agregarComas(rows[9][3].toFixed(2)),
                    rows[9][4] == 0 ? "-" : agregarComas(rows[9][4].toFixed(2)),
                    rows[9][5] == 0 ? "-" : agregarComas(rows[9][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[10][0] == 0 ? "-" : agregarComas(rows[10][0].toFixed(2)),
                    rows[10][1] == 0 ? "-" : agregarComas(rows[10][1].toFixed(2)),
                    rows[10][2] == 0 ? "-" : agregarComas(rows[10][2].toFixed(2)),
                    rows[10][3] == 0 ? "-" : agregarComas(rows[10][3].toFixed(2)),
                    rows[10][4] == 0 ? "-" : agregarComas(rows[10][4].toFixed(2)),
                    rows[10][5] == 0 ? "-" : agregarComas(rows[10][5].toFixed(2))
                ],
                ['Baja',
                    rows[11][0] == 0 ? "-" : agregarComas(rows[11][0].toFixed(2)),
                    rows[11][1] == 0 ? "-" : agregarComas(rows[11][1].toFixed(2)),
                    rows[11][2] == 0 ? "-" : agregarComas(rows[11][2].toFixed(2)),
                    rows[11][3] == 0 ? "-" : agregarComas(rows[11][3].toFixed(2)),
                    rows[11][4] == 0 ? "-" : agregarComas(rows[11][4].toFixed(2)),
                    rows[11][5] == 0 ? "-" : agregarComas(rows[11][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[9][0] + rows[10][0]) == 0 ? "-" : agregarComas((rows[9][0] + rows[10][0]).toFixed(2)),
                    (rows[9][1] + rows[10][1]) == 0 ? "-" : agregarComas((rows[9][1] + rows[10][1]).toFixed(2)),
                    (rows[9][2] + rows[10][2]) == 0 ? "-" : agregarComas((rows[9][2] + rows[10][2]).toFixed(2)),
                    (rows[9][3] + rows[10][3]) == 0 ? "-" : agregarComas((rows[9][3] + rows[10][3]).toFixed(2)),
                    (rows[9][4] + rows[10][4]) == 0 ? "-" : agregarComas((rows[9][4] + rows[10][4]).toFixed(2)),
                    (rows[9][5] + rows[10][5]) == 0 ? "-" : agregarComas((rows[9][5] + rows[10][5]).toFixed(2))
                ],
                ['Total',
                    (rows[9][0] + rows[10][0] + rows[11][0]) == 0 ? "-" : agregarComas((rows[9][0] + rows[10][0] + rows[11][0]).toFixed(2)),
                    (rows[9][1] + rows[10][1] + rows[11][1]) == 0 ? "-" : agregarComas((rows[9][1] + rows[10][1] + rows[11][1]).toFixed(2)),
                    (rows[9][2] + rows[10][2] + rows[11][2]) == 0 ? "-" : agregarComas((rows[9][2] + rows[10][2] + rows[11][2]).toFixed(2)),
                    (rows[9][3] + rows[10][3] + rows[11][3]) == 0 ? "-" : agregarComas((rows[9][3] + rows[10][3] + rows[11][3]).toFixed(2)),
                    (rows[9][4] + rows[10][4] + rows[11][4]) == 0 ? "-" : agregarComas((rows[9][4] + rows[10][4] + rows[11][4]).toFixed(2)),
                    (rows[9][5] + rows[10][5] + rows[11][5]) == 0 ? "-" : agregarComas((rows[9][5] + rows[10][5] + rows[11][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });


        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'Inyección - DWV', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[12][0] == 0 ? "-" : agregarComas(rows[12][0].toFixed(2)),
                    rows[12][1] == 0 ? "-" : agregarComas(rows[12][1].toFixed(2)),
                    rows[12][2] == 0 ? "-" : agregarComas(rows[12][2].toFixed(2)),
                    rows[12][3] == 0 ? "-" : agregarComas(rows[12][3].toFixed(2)),
                    rows[12][4] == 0 ? "-" : agregarComas(rows[12][4].toFixed(2)),
                    rows[12][5] == 0 ? "-" : agregarComas(rows[12][5].toFixed(2))
                ],
                ['Colada',
                    rows[13][0] == 0 ? "-" : agregarComas(rows[13][0].toFixed(2)),
                    rows[13][1] == 0 ? "-" : agregarComas(rows[13][1].toFixed(2)),
                    rows[13][2] == 0 ? "-" : agregarComas(rows[13][2].toFixed(2)),
                    rows[13][3] == 0 ? "-" : agregarComas(rows[13][3].toFixed(2)),
                    rows[13][4] == 0 ? "-" : agregarComas(rows[13][4].toFixed(2)),
                    rows[13][5] == 0 ? "-" : agregarComas(rows[13][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[14][0] == 0 ? "-" : agregarComas(rows[14][0].toFixed(2)),
                    rows[14][1] == 0 ? "-" : agregarComas(rows[14][1].toFixed(2)),
                    rows[14][2] == 0 ? "-" : agregarComas(rows[14][2].toFixed(2)),
                    rows[14][3] == 0 ? "-" : agregarComas(rows[14][3].toFixed(2)),
                    rows[14][4] == 0 ? "-" : agregarComas(rows[14][4].toFixed(2)),
                    rows[14][5] == 0 ? "-" : agregarComas(rows[14][5].toFixed(2))
                ],
                ['Baja',
                    rows[15][0] == 0 ? "-" : agregarComas(rows[15][0].toFixed(2)),
                    rows[15][1] == 0 ? "-" : agregarComas(rows[15][1].toFixed(2)),
                    rows[15][2] == 0 ? "-" : agregarComas(rows[15][2].toFixed(2)),
                    rows[15][3] == 0 ? "-" : agregarComas(rows[15][3].toFixed(2)),
                    rows[15][4] == 0 ? "-" : agregarComas(rows[15][4].toFixed(2)),
                    rows[15][5] == 0 ? "-" : agregarComas(rows[15][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[12][0] + rows[13][0] + rows[14][0]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0]).toFixed(2)),
                    (rows[12][1] + rows[13][1] + rows[14][1]) == 0 ? "-" : agregarComas((rows[12][1] + rows[13][1] + rows[14][1]).toFixed(2)),
                    (rows[12][2] + rows[13][2] + rows[14][2]) == 0 ? "-" : agregarComas((rows[12][2] + rows[13][2] + rows[14][2]).toFixed(2)),
                    (rows[12][3] + rows[13][3] + rows[14][3]) == 0 ? "-" : agregarComas((rows[12][3] + rows[13][3] + rows[14][3]).toFixed(2)),
                    (rows[12][4] + rows[13][4] + rows[14][4]) == 0 ? "-" : agregarComas((rows[12][4] + rows[13][4] + rows[14][4]).toFixed(2)),
                    (rows[12][5] + rows[13][5] + rows[14][5]) == 0 ? "-" : agregarComas((rows[12][5] + rows[13][5] + rows[14][5]).toFixed(2))
                ],
                ['Total',
                    (rows[12][0] + rows[13][0] + rows[14][0] + rows[15][0]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][0]).toFixed(2)),
                    (rows[12][1] + rows[13][1] + rows[14][1] + rows[15][1]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][1]).toFixed(2)),
                    (rows[12][2] + rows[13][2] + rows[14][2] + rows[15][2]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][2]).toFixed(2)),
                    (rows[12][3] + rows[13][3] + rows[14][3] + rows[15][3]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][3]).toFixed(2)),
                    (rows[12][4] + rows[13][4] + rows[14][4] + rows[15][4]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][4]).toFixed(2)),
                    (rows[12][5] + rows[13][5] + rows[14][5] + rows[15][5]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'Inyección - CLAY', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[16][0] == 0 ? "-" : agregarComas(rows[16][0].toFixed(2)),
                    rows[16][1] == 0 ? "-" : agregarComas(rows[16][1].toFixed(2)),
                    rows[16][2] == 0 ? "-" : agregarComas(rows[16][2].toFixed(2)),
                    rows[16][3] == 0 ? "-" : agregarComas(rows[16][3].toFixed(2)),
                    rows[16][4] == 0 ? "-" : agregarComas(rows[16][4].toFixed(2)),
                    rows[16][5] == 0 ? "-" : agregarComas(rows[16][5].toFixed(2))
                ],
                ['Colada',
                    rows[17][0] == 0 ? "-" : agregarComas(rows[17][0].toFixed(2)),
                    rows[17][1] == 0 ? "-" : agregarComas(rows[17][1].toFixed(2)),
                    rows[17][2] == 0 ? "-" : agregarComas(rows[17][2].toFixed(2)),
                    rows[17][3] == 0 ? "-" : agregarComas(rows[17][3].toFixed(2)),
                    rows[17][4] == 0 ? "-" : agregarComas(rows[17][4].toFixed(2)),
                    rows[17][5] == 0 ? "-" : agregarComas(rows[17][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[18][0] == 0 ? "-" : agregarComas(rows[18][0].toFixed(2)),
                    rows[18][1] == 0 ? "-" : agregarComas(rows[18][1].toFixed(2)),
                    rows[18][2] == 0 ? "-" : agregarComas(rows[18][2].toFixed(2)),
                    rows[18][3] == 0 ? "-" : agregarComas(rows[18][3].toFixed(2)),
                    rows[18][4] == 0 ? "-" : agregarComas(rows[18][4].toFixed(2)),
                    rows[18][5] == 0 ? "-" : agregarComas(rows[18][5].toFixed(2))
                ],
                ['Baja',
                    rows[19][0] == 0 ? "-" : agregarComas(rows[19][0].toFixed(2)),
                    rows[19][1] == 0 ? "-" : agregarComas(rows[19][1].toFixed(2)),
                    rows[19][2] == 0 ? "-" : agregarComas(rows[19][2].toFixed(2)),
                    rows[19][3] == 0 ? "-" : agregarComas(rows[19][3].toFixed(2)),
                    rows[19][4] == 0 ? "-" : agregarComas(rows[19][4].toFixed(2)),
                    rows[19][5] == 0 ? "-" : agregarComas(rows[19][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[16][0] + rows[17][0] + rows[18][0]) == 0 ? "-" : agregarComas((rows[16][0] + rows[17][0] + rows[18][0]).toFixed(2)),
                    (rows[16][1] + rows[17][1] + rows[18][1]) == 0 ? "-" : agregarComas((rows[16][1] + rows[17][1] + rows[18][1]).toFixed(2)),
                    (rows[16][2] + rows[17][2] + rows[18][2]) == 0 ? "-" : agregarComas((rows[16][2] + rows[17][2] + rows[18][2]).toFixed(2)),
                    (rows[16][3] + rows[17][3] + rows[18][3]) == 0 ? "-" : agregarComas((rows[16][3] + rows[17][3] + rows[18][3]).toFixed(2)),
                    (rows[16][4] + rows[17][4] + rows[18][4]) == 0 ? "-" : agregarComas((rows[16][4] + rows[17][4] + rows[18][4]).toFixed(2)),
                    (rows[16][5] + rows[17][5] + rows[18][5]) == 0 ? "-" : agregarComas((rows[16][5] + rows[17][5] + rows[18][5]).toFixed(2))
                ],
                ['Total',
                    (rows[16][0] + rows[17][0] + rows[18][0] + rows[19][0]) == 0 ? "-" : agregarComas((rows[16][0] + rows[17][0] + rows[18][0] + rows[19][0]).toFixed(2)),
                    (rows[16][1] + rows[17][1] + rows[18][1] + rows[19][1]) == 0 ? "-" : agregarComas((rows[16][1] + rows[17][1] + rows[18][1] + rows[19][1]).toFixed(2)),
                    (rows[16][2] + rows[17][2] + rows[18][2] + rows[19][2]) == 0 ? "-" : agregarComas((rows[16][2] + rows[17][2] + rows[18][2] + rows[19][2]).toFixed(2)),
                    (rows[16][3] + rows[17][3] + rows[18][3] + rows[19][3]) == 0 ? "-" : agregarComas((rows[16][3] + rows[17][3] + rows[18][3] + rows[19][3]).toFixed(2)),
                    (rows[16][4] + rows[17][4] + rows[18][4] + rows[19][4]) == 0 ? "-" : agregarComas((rows[16][4] + rows[17][4] + rows[18][4] + rows[19][4]).toFixed(2)),
                    (rows[16][5] + rows[17][5] + rows[18][5] + rows[19][5]) == 0 ? "-" : agregarComas((rows[16][5] + rows[17][5] + rows[18][5] + rows[19][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'Inyección - PURGA', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[20][0] == 0 ? "-" : agregarComas(rows[20][0].toFixed(2)),
                    rows[20][1] == 0 ? "-" : agregarComas(rows[20][1].toFixed(2)),
                    rows[20][2] == 0 ? "-" : agregarComas(rows[20][2].toFixed(2)),
                    rows[20][3] == 0 ? "-" : agregarComas(rows[20][3].toFixed(2)),
                    rows[20][4] == 0 ? "-" : agregarComas(rows[20][4].toFixed(2)),
                    rows[20][5] == 0 ? "-" : agregarComas(rows[20][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[21][0] == 0 ? "-" : agregarComas(rows[21][0].toFixed(2)),
                    rows[21][1] == 0 ? "-" : agregarComas(rows[21][1].toFixed(2)),
                    rows[21][2] == 0 ? "-" : agregarComas(rows[21][2].toFixed(2)),
                    rows[21][3] == 0 ? "-" : agregarComas(rows[21][3].toFixed(2)),
                    rows[21][4] == 0 ? "-" : agregarComas(rows[21][4].toFixed(2)),
                    rows[21][5] == 0 ? "-" : agregarComas(rows[21][5].toFixed(2))
                ],
                ['Degradada P/Baja	',
                    rows[22][0] == 0 ? "-" : agregarComas(rows[22][0].toFixed(2)),
                    rows[22][1] == 0 ? "-" : agregarComas(rows[22][1].toFixed(2)),
                    rows[22][2] == 0 ? "-" : agregarComas(rows[22][2].toFixed(2)),
                    rows[22][3] == 0 ? "-" : agregarComas(rows[22][3].toFixed(2)),
                    rows[22][4] == 0 ? "-" : agregarComas(rows[22][4].toFixed(2)),
                    rows[22][5] == 0 ? "-" : agregarComas(rows[22][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[20][0] + rows[21][0]) == 0 ? "-" : agregarComas((rows[20][0] + rows[21][0]).toFixed(2)),
                    (rows[20][1] + rows[21][1]) == 0 ? "-" : agregarComas((rows[20][1] + rows[21][1]).toFixed(2)),
                    (rows[20][2] + rows[21][2]) == 0 ? "-" : agregarComas((rows[20][2] + rows[21][2]).toFixed(2)),
                    (rows[20][3] + rows[21][3]) == 0 ? "-" : agregarComas((rows[20][3] + rows[21][3]).toFixed(2)),
                    (rows[20][4] + rows[21][4]) == 0 ? "-" : agregarComas((rows[20][4] + rows[21][4]).toFixed(2)),
                    (rows[20][5] + rows[21][5]) == 0 ? "-" : agregarComas((rows[20][5] + rows[21][5]).toFixed(2))
                ],
                ['Total',
                    (rows[20][0] + rows[21][0] + rows[22][0]) == 0 ? "-" : agregarComas((rows[20][0] + rows[21][0] + rows[22][0]).toFixed(2)),
                    (rows[20][1] + rows[21][1] + rows[22][1]) == 0 ? "-" : agregarComas((rows[20][1] + rows[21][1] + rows[22][1]).toFixed(2)),
                    (rows[20][2] + rows[21][2] + rows[22][2]) == 0 ? "-" : agregarComas((rows[20][2] + rows[21][2] + rows[22][2]).toFixed(2)),
                    (rows[20][3] + rows[21][3] + rows[22][3]) == 0 ? "-" : agregarComas((rows[20][3] + rows[21][3] + rows[22][3]).toFixed(2)),
                    (rows[20][4] + rows[21][4] + rows[22][4]) == 0 ? "-" : agregarComas((rows[20][4] + rows[21][4] + rows[22][4]).toFixed(2)),
                    (rows[20][5] + rows[21][5] + rows[22][5]) == 0 ? "-" : agregarComas((rows[20][5] + rows[21][5] + rows[22][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                /*[{ content: 'Inyección - PURGA', colSpan: 7, styles: { halign: 'center' } }],*/
                ['Material', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco', 'Total Material Reprocesado']
            ],
            body: [
                ["Total Hoy PVC",
                    (registosHoyArray[0] == '-' ? '-' : registosHoyArray[0].toFixed(2)),
                    (registosHoyArray[1] == '-' ? '-' : registosHoyArray[1].toFixed(2)),
                    (registosHoyArray[2] == '-' ? '-' : registosHoyArray[2].toFixed(2)),
                    (registosHoyArray[3] == '-' ? '-' : registosHoyArray[3].toFixed(2)),
                    (registosHoyArray[4] == '-' ? '-' : registosHoyArray[4].toFixed(2)),
                    (registosHoyArray[5] == '-' ? '-' : registosHoyArray[5].toFixed(2)),
                    (registosHoyArray[6] == '-' ? '-' : registosHoyArray[6].toFixed(2)),
                ],
                ["Total Ayer PVC",
                    (registosAyerArray[0] == '-' ? '-' : registosAyerArray[0].toFixed(2)),
                    (registosAyerArray[1] == '-' ? '-' : registosAyerArray[1].toFixed(2)),
                    (registosAyerArray[2] == '-' ? '-' : registosAyerArray[2].toFixed(2)),
                    (registosAyerArray[3] == '-' ? '-' : registosAyerArray[3].toFixed(2)),
                    (registosAyerArray[4] == '-' ? '-' : registosAyerArray[4].toFixed(2)),
                    (registosAyerArray[5] == '-' ? '-' : registosAyerArray[5].toFixed(2)),
                    (registosAyerArray[6] == '-' ? '-' : registosAyerArray[6].toFixed(2)),
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        })

        startY = doc.autoTable.previous.finalY + 10;

        doc.save("InventarioFisicoScrapMolinos.pdf");
        loader.style.display = 'none';
    };
}

function generarexcel() {

    var datos = [];
    for (var i = 0; i < 37; i++) {
        datos.push([0, 0, 0, 0, 0, 0]);
    }

    var rangoexcel = [];

    for (let i = 0; i < 50; i++) {
        rangoexcel[i] = [];
        for (let j = 0; j < 50; j++) {
            rangoexcel[i][j] = ""; // Asignar un valor inicial de cero a cada elemento
        }
    }

    let indr = 0;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }

    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[0][j] + rows[1][j]) == 0 ? "-" : agregarComas((rows[0][j] + rows[1][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[0][j] + rows[1][j] + rows[2][j]) == 0 ? "-" : agregarComas((rows[0][j] + rows[1][j] + rows[2][j]).toFixed(2))
    }
    indr++;

    for (var i = 3; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }

    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[3][j] + rows[4][j]) == 0 ? "-" : agregarComas((rows[3][j] + rows[4][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[3][j] + rows[4][j] + rows[5][j]) == 0 ? "-" : agregarComas((rows[3][j] + rows[4][j] + rows[5][j]).toFixed(2))
    }
    indr++;

    for (var i = 6; i < 9; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }

    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[6][j] + rows[7][j]) == 0 ? "-" : agregarComas((rows[6][j] + rows[7][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[6][j] + rows[7][j] + rows[8][j]) == 0 ? "-" : agregarComas((rows[6][j] + rows[7][j] + rows[8][j]).toFixed(2))
    }
    indr++;

    for (var i = 9; i < 12; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }

    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[9][j] + rows[10][j]) == 0 ? "-" : agregarComas((rows[9][j] + rows[10][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[9][j] + rows[10][j] + rows[11][j]) == 0 ? "-" : agregarComas((rows[9][j] + rows[10][j] + rows[11][j]).toFixed(2))
    }
    indr++;

    for (var i = 12; i < 16; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }


    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[12][j] + rows[13][j] + rows[14][j]) == 0 ? "-" : agregarComas((rows[12][j] + rows[13][j] + rows[14][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[12][j] + rows[13][j] + rows[14][j] + rows[15][j]) == 0 ? "-" : agregarComas((rows[12][j] + rows[13][j] + rows[14][j] + rows[15][j]).toFixed(2))
    }
    indr++;

    for (var i = 16; i < 20; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }

    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[16][j] + rows[17][j] + rows[18][j]) == 0 ? "-" : agregarComas((rows[16][j] + rows[17][j] + rows[18][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[16][j] + rows[17][j] + rows[18][j] + rows[19][j]) == 0 ? "-" : agregarComas((rows[16][j] + rows[17][j] + rows[18][j] + rows[19][j]).toFixed(2))
    }
    indr++;

    for (var i = 20; i < 23; i++) {
        for (var j = 0; j < 6; j++) {
            datos[indr][j] = rows[i][j] == 0 ? "-" : agregarComas(rows[i][j].toFixed(2));
        }
        indr++;
    }


    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[20][j] + rows[21][j]) == 0 ? "-" : agregarComas((rows[20][j] + rows[21][j]).toFixed(2));
    }

    indr++;
    for (var j = 0; j < 6; j++) {
        datos[indr][j] = (rows[20][j] + rows[21][j] + rows[22][j]) == 0 ? "-" : agregarComas((rows[20][j] + rows[21][j] + rows[22][j]).toFixed(2))
    }

    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/Molinos/generarexcel?matrizdatos=' + JSON.stringify(datos);
    // Configurar la solicitud
    xhr.open('GET', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);

            descargarArchivo('archivo.xlsx', respuesta.data);
        } else {
            // Manejar el error
            console.log('Error: ' + xhr.status);
        }
    };

    // Enviar la solicitud
    xhr.send();

}

function obtenerFamiliasProceso(element) {
    let subFamINY = ["DWV", "CLAY", "PURGA"]
    let subFamPVC = ["IPS", "DWV", "C900", "CPVC"]
    let valorProceso = element.options[element.selectedIndex].value
    let selectSubFam = document.getElementById("selectSubFam")
    if (valorProceso == '0') {
        document.getElementById("selectSubFam").disabled = true
    } else {
        document.getElementById("selectSubFam").disabled = false
        switch (valorProceso) {
            case "1":
                if (selectSubFam.length > 1) {
                    for (let x = selectSubFam.length - 1; x > 0; x--) {
                        selectSubFam.remove(x)
                    }
                }
                for (x = 0; x < subFamINY.length; x++) {
                    document.getElementById("selectSubFam").innerHTML += `
                        <option value="${x + 1}">${subFamINY[x]}</option>
                    `
                }
                break
            case "2":

                if (selectSubFam.length > 1) {
                    for (let x = selectSubFam.length - 1; x > 0; x--) {
                        selectSubFam.remove(x)
                    }
                }
                for (x = 0; x < subFamPVC.length; x++) {
                    document.getElementById("selectSubFam").innerHTML += `
                        <option value="${x + 1}">${subFamPVC[x]}</option>
                    `
                }
                break
        }
    }
}


function descargarArchivo(nombreArchivo, base64String) {
    // Crear un enlace temporal en la página
    var enlaceTemporal = document.createElement('a');
    enlaceTemporal.setAttribute('href', 'data:application/vnd.ms-excel;base64,' + base64String);
    enlaceTemporal.setAttribute('download', nombreArchivo);

    // Agregar el enlace temporal a la página
    document.body.appendChild(enlaceTemporal);

    // Hacer clic en el enlace temporal para descargar el archivo
    enlaceTemporal.click();

    // Remover el enlace temporal de la página
    document.body.removeChild(enlaceTemporal);
}


function GuardarAcumulado() {
    loader.style.display = 'flex'
    let selectProceso = document.getElementById("selectProces")
    let selectProcesoValue = selectProceso.options[selectProceso.selectedIndex].value
    let selectSubFam = document.getElementById("selectSubFam")
    let selectSubFamValue = selectSubFam.options[selectSubFam.selectedIndex].value
    let peso = document.getElementById("staticPeso").value

    if (peso == '' || selectProcesoValue == '0' || selectSubFamValue == '0') {
        iziToast.error({
            position: "topRight",
            title: `Error Generado`,
            message: `<p>Favor de completar el formulario para continuar.</p>`,
        })
        loader.style.display = 'none'
        return
    }

    let data = {
        "proceso": selectProceso.options[selectProceso.selectedIndex].innerText,
        "familia": selectSubFam.options[selectSubFam.selectedIndex].innerText,
        "peso": peso,
        "planta": planta
    }

    fetch("/Molinos/AgregarAcumuladoEmbarque", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(promise)
    }).then((jsonData) => {
        console.log(jsonData)
        let data = JSON.parse(jsonData.data)
        if (jsonData.status == 200) {
            loader.style.display = 'none'
            iziToast.success({
                position: "topRight",
                title: `Ingreso Correcto`,
                message: `<p>${data.message}</p>`,
            })
            $("#closeModal").click()
            peticionObtenerScrap()
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error Generado`,
                message: `<p>${data.message}</p>`,
            })
            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error Generado`,
            message: `<p>${error}.</p>`,
        })
        loader.style.display = 'none'
    })
}

function emailreporte() {
    loader.style.display = 'flex';

    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter',
        compress: true,
        objcompress: true
    });

    doc.setFont("times");
    // Agregar imagen
    var img = new Image();
    img.src = '../../Images/LogoPTMHDBN.png';
    img.onload = async function () {
        var imgWidth = this.width;
        var imgHeight = this.height;

        // Obtener el tamaño de la página y establecer los márgenes
        var pageSize = doc.internal.pageSize;
        var pageWidth = pageSize.width;
        var marginLeft = 10;
        var marginRight = 10;
        var usableWidth = pageWidth - marginLeft - marginRight;

        // Calcular el ancho y la altura de la imagen
        var imageWidth = usableWidth * 0.35;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', imageX, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE DE INVENTARIO FÍSICO";
        doc.text(text, 140, 17, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, 140, 22, { align: 'center', });

        // Crea un objeto Date para la fecha y hora actual
        var fechaHoraActual = new Date();

        // Obtiene el año actual
        var año = fechaHoraActual.getFullYear();

        // Obtiene el mes actual (los meses van de 0 a 11)
        var mes = fechaHoraActual.getMonth() + 1;

        // Obtiene el día actual
        var dia = fechaHoraActual.getDate();

        // Obtiene las horas actuales
        var horas = fechaHoraActual.getHours();

        // Obtiene los minutos actuales
        var minutos = fechaHoraActual.getMinutes();

        // Obtiene los segundos actuales
        var segundos = fechaHoraActual.getSeconds();

        // Crea una cadena con la fecha y hora actual
        var fechaHoraActualStr = dia + "/" + mes + "/" + año + " " + horas + ":" + minutos;

        doc.setFontSize(12);
        var text = "Fecha: " + fechaHoraActualStr;
        doc.text(text, 140, 28, { align: 'center', });

        var rectX = 10; // Posición x del rectángulo
        var rectY = 40; // Posición y del rectángulo
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 7; // Altura del rectángulo
        // Dibuja el rectángulo negro

        // Establece el color de fondo
        doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);

        // Dibuja un rectángulo negro en el centro de la página
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 10; // Altura del rectángulo
        var rectX = (10); // Coordenada X del rectángulo
        var rectY = (37); // Coordenada Y del rectángulo
        doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');

        // Establece el color de texto en blanco
        doc.setTextColor(255, 255, 255);

        // Agrega texto blanco en el centro del rectángulo
        var text = 'INVENTARIO FÍSICO DE SCRAP Y MOLINOS';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 43; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 50;


        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - IPS', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[0][0] == 0 ? "-" : agregarComas(rows[0][0].toFixed(2)),
                    rows[0][1] == 0 ? "-" : agregarComas(rows[0][1].toFixed(2)),
                    rows[0][2] == 0 ? "-" : agregarComas(rows[0][2].toFixed(2)),
                    rows[0][3] == 0 ? "-" : agregarComas(rows[0][3].toFixed(2)),
                    rows[0][4] == 0 ? "-" : agregarComas(rows[0][4].toFixed(2)),
                    rows[0][5] == 0 ? "-" : agregarComas(rows[0][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[1][0] == 0 ? "-" : agregarComas(rows[0][0].toFixed(2)),
                    rows[1][1] == 0 ? "-" : agregarComas(rows[0][1].toFixed(2)),
                    rows[1][2] == 0 ? "-" : agregarComas(rows[0][2].toFixed(2)),
                    rows[1][3] == 0 ? "-" : agregarComas(rows[0][3].toFixed(2)),
                    rows[1][4] == 0 ? "-" : agregarComas(rows[0][4].toFixed(2)),
                    rows[1][5] == 0 ? "-" : agregarComas(rows[0][5].toFixed(2))
                ],
                ['Baja',
                    rows[2][0] == 0 ? "-" : agregarComas(rows[2][0].toFixed(2)),
                    rows[2][1] == 0 ? "-" : agregarComas(rows[2][1].toFixed(2)),
                    rows[2][2] == 0 ? "-" : agregarComas(rows[2][2].toFixed(2)),
                    rows[2][3] == 0 ? "-" : agregarComas(rows[2][3].toFixed(2)),
                    rows[2][4] == 0 ? "-" : agregarComas(rows[2][4].toFixed(2)),
                    rows[2][5] == 0 ? "-" : agregarComas(rows[2][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[0][0] + rows[1][0]) == 0 ? "-" : agregarComas((rows[0][0] + rows[1][0]).toFixed(2)),
                    (rows[0][1] + rows[1][1]) == 0 ? "-" : agregarComas((rows[0][1] + rows[1][1]).toFixed(2)),
                    (rows[0][2] + rows[1][2]) == 0 ? "-" : agregarComas((rows[0][2] + rows[1][2]).toFixed(2)),
                    (rows[0][3] + rows[1][3]) == 0 ? "-" : agregarComas((rows[0][3] + rows[1][3]).toFixed(2)),
                    (rows[0][4] + rows[1][4]) == 0 ? "-" : agregarComas((rows[0][4] + rows[1][4]).toFixed(2)),
                    (rows[0][5] + rows[1][5]) == 0 ? "-" : agregarComas((rows[0][5] + rows[1][5]).toFixed(2))
                ],
                ['Total',
                    (rows[0][0] + rows[1][0] + rows[2][0]) == 0 ? "-" : agregarComas((rows[0][0] + rows[1][0] + rows[2][0]).toFixed(2)),
                    (rows[0][1] + rows[1][1] + rows[2][1]) == 0 ? "-" : agregarComas((rows[0][1] + rows[1][1] + rows[2][1]).toFixed(2)),
                    (rows[0][2] + rows[1][2] + rows[2][2]) == 0 ? "-" : agregarComas((rows[0][2] + rows[1][2] + rows[2][2]).toFixed(2)),
                    (rows[0][3] + rows[1][3] + rows[2][3]) == 0 ? "-" : agregarComas((rows[0][3] + rows[1][3] + rows[2][3]).toFixed(2)),
                    (rows[0][4] + rows[1][4] + rows[2][4]) == 0 ? "-" : agregarComas((rows[0][4] + rows[1][4] + rows[2][4]).toFixed(2)),
                    (rows[0][5] + rows[1][5] + rows[2][5]) == 0 ? "-" : agregarComas((rows[0][5] + rows[1][5] + rows[2][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });
        startY = doc.autoTable.previous.finalY + 4;

        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - DWV', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[3][0] == 0 ? "-" : agregarComas(rows[3][0].toFixed(2)),
                    rows[3][1] == 0 ? "-" : agregarComas(rows[3][1].toFixed(2)),
                    rows[3][2] == 0 ? "-" : agregarComas(rows[3][2].toFixed(2)),
                    rows[3][3] == 0 ? "-" : agregarComas(rows[3][3].toFixed(2)),
                    rows[3][4] == 0 ? "-" : agregarComas(rows[3][4].toFixed(2)),
                    rows[3][5] == 0 ? "-" : agregarComas(rows[3][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[4][0] == 0 ? "-" : agregarComas(rows[4][0].toFixed(2)),
                    rows[4][1] == 0 ? "-" : agregarComas(rows[4][1].toFixed(2)),
                    rows[4][2] == 0 ? "-" : agregarComas(rows[4][2].toFixed(2)),
                    rows[4][3] == 0 ? "-" : agregarComas(rows[4][3].toFixed(2)),
                    rows[4][4] == 0 ? "-" : agregarComas(rows[4][4].toFixed(2)),
                    rows[4][5] == 0 ? "-" : agregarComas(rows[4][5].toFixed(2))
                ],
                ['Baja',
                    rows[5][0] == 0 ? "-" : agregarComas(rows[5][0].toFixed(2)),
                    rows[5][1] == 0 ? "-" : agregarComas(rows[5][1].toFixed(2)),
                    rows[5][2] == 0 ? "-" : agregarComas(rows[5][2].toFixed(2)),
                    rows[5][3] == 0 ? "-" : agregarComas(rows[5][3].toFixed(2)),
                    rows[5][4] == 0 ? "-" : agregarComas(rows[5][4].toFixed(2)),
                    rows[5][5] == 0 ? "-" : agregarComas(rows[5][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[3][0] + rows[4][0]) == 0 ? "-" : agregarComas((rows[3][0] + rows[4][0]).toFixed(2)),
                    (rows[3][1] + rows[4][1]) == 0 ? "-" : agregarComas((rows[3][1] + rows[4][1]).toFixed(2)),
                    (rows[3][2] + rows[4][2]) == 0 ? "-" : agregarComas((rows[3][2] + rows[4][2]).toFixed(2)),
                    (rows[3][3] + rows[4][3]) == 0 ? "-" : agregarComas((rows[3][3] + rows[4][3]).toFixed(2)),
                    (rows[3][4] + rows[4][4]) == 0 ? "-" : agregarComas((rows[3][4] + rows[4][4]).toFixed(2)),
                    (rows[3][5] + rows[4][5]) == 0 ? "-" : agregarComas((rows[3][5] + rows[4][5]).toFixed(2))
                ],
                ['Total',
                    (rows[3][0] + rows[4][0] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][0] + rows[4][0] + rows[5][0]).toFixed(2)),
                    (rows[3][1] + rows[4][1] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][1] + rows[4][1] + rows[5][1]).toFixed(2)),
                    (rows[3][2] + rows[4][2] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][2] + rows[4][2] + rows[5][2]).toFixed(2)),
                    (rows[3][3] + rows[4][3] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][3] + rows[4][3] + rows[5][3]).toFixed(2)),
                    (rows[3][4] + rows[4][4] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][4] + rows[4][4] + rows[5][4]).toFixed(2)),
                    (rows[3][5] + rows[4][5] + rows[5][0]) == 0 ? "-" : agregarComas((rows[3][5] + rows[4][5] + rows[5][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 4;

        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - C900', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[6][0] == 0 ? "-" : agregarComas(rows[6][0].toFixed(2)),
                    rows[6][1] == 0 ? "-" : agregarComas(rows[6][1].toFixed(2)),
                    rows[6][2] == 0 ? "-" : agregarComas(rows[6][2].toFixed(2)),
                    rows[6][3] == 0 ? "-" : agregarComas(rows[6][3].toFixed(2)),
                    rows[6][4] == 0 ? "-" : agregarComas(rows[6][4].toFixed(2)),
                    rows[6][5] == 0 ? "-" : agregarComas(rows[6][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[7][0] == 0 ? "-" : agregarComas(rows[7][0].toFixed(2)),
                    rows[7][1] == 0 ? "-" : agregarComas(rows[7][1].toFixed(2)),
                    rows[7][2] == 0 ? "-" : agregarComas(rows[7][2].toFixed(2)),
                    rows[7][3] == 0 ? "-" : agregarComas(rows[7][3].toFixed(2)),
                    rows[7][4] == 0 ? "-" : agregarComas(rows[7][4].toFixed(2)),
                    rows[7][5] == 0 ? "-" : agregarComas(rows[7][5].toFixed(2))
                ],
                ['Baja',
                    rows[8][0] == 0 ? "-" : agregarComas(rows[8][0].toFixed(2)),
                    rows[8][1] == 0 ? "-" : agregarComas(rows[8][1].toFixed(2)),
                    rows[8][2] == 0 ? "-" : agregarComas(rows[8][2].toFixed(2)),
                    rows[8][3] == 0 ? "-" : agregarComas(rows[8][3].toFixed(2)),
                    rows[8][4] == 0 ? "-" : agregarComas(rows[8][4].toFixed(2)),
                    rows[8][5] == 0 ? "-" : agregarComas(rows[8][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[6][0] + rows[7][0]) == 0 ? "-" : agregarComas((rows[6][0] + rows[7][0]).toFixed(2)),
                    (rows[6][1] + rows[7][1]) == 0 ? "-" : agregarComas((rows[6][1] + rows[7][1]).toFixed(2)),
                    (rows[6][2] + rows[7][2]) == 0 ? "-" : agregarComas((rows[6][2] + rows[7][2]).toFixed(2)),
                    (rows[6][3] + rows[7][3]) == 0 ? "-" : agregarComas((rows[6][3] + rows[7][3]).toFixed(2)),
                    (rows[6][4] + rows[7][4]) == 0 ? "-" : agregarComas((rows[6][4] + rows[7][4]).toFixed(2)),
                    (rows[6][5] + rows[7][5]) == 0 ? "-" : agregarComas((rows[6][5] + rows[7][5]).toFixed(2))
                ],
                ['Total',
                    (rows[6][0] + rows[7][0] + rows[8][0]) == 0 ? "-" : agregarComas((rows[6][0] + rows[7][0] + rows[8][0]).toFixed(2)),
                    (rows[6][1] + rows[7][1] + rows[8][1]) == 0 ? "-" : agregarComas((rows[6][1] + rows[7][1] + rows[8][1]).toFixed(2)),
                    (rows[6][2] + rows[7][2] + rows[8][2]) == 0 ? "-" : agregarComas((rows[6][2] + rows[7][2] + rows[8][2]).toFixed(2)),
                    (rows[6][3] + rows[7][3] + rows[8][3]) == 0 ? "-" : agregarComas((rows[6][3] + rows[7][3] + rows[8][3]).toFixed(2)),
                    (rows[6][4] + rows[7][4] + rows[8][4]) == 0 ? "-" : agregarComas((rows[6][4] + rows[7][4] + rows[8][4]).toFixed(2)),
                    (rows[6][5] + rows[7][5] + rows[8][5]) == 0 ? "-" : agregarComas((rows[6][5] + rows[7][5] + rows[8][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });


        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'PVC Extrusión - CPVC', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[9][0] == 0 ? "-" : agregarComas(rows[9][0].toFixed(2)),
                    rows[9][1] == 0 ? "-" : agregarComas(rows[9][1].toFixed(2)),
                    rows[9][2] == 0 ? "-" : agregarComas(rows[9][2].toFixed(2)),
                    rows[9][3] == 0 ? "-" : agregarComas(rows[9][3].toFixed(2)),
                    rows[9][4] == 0 ? "-" : agregarComas(rows[9][4].toFixed(2)),
                    rows[9][5] == 0 ? "-" : agregarComas(rows[9][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[10][0] == 0 ? "-" : agregarComas(rows[10][0].toFixed(2)),
                    rows[10][1] == 0 ? "-" : agregarComas(rows[10][1].toFixed(2)),
                    rows[10][2] == 0 ? "-" : agregarComas(rows[10][2].toFixed(2)),
                    rows[10][3] == 0 ? "-" : agregarComas(rows[10][3].toFixed(2)),
                    rows[10][4] == 0 ? "-" : agregarComas(rows[10][4].toFixed(2)),
                    rows[10][5] == 0 ? "-" : agregarComas(rows[10][5].toFixed(2))
                ],
                ['Baja',
                    rows[11][0] == 0 ? "-" : agregarComas(rows[11][0].toFixed(2)),
                    rows[11][1] == 0 ? "-" : agregarComas(rows[11][1].toFixed(2)),
                    rows[11][2] == 0 ? "-" : agregarComas(rows[11][2].toFixed(2)),
                    rows[11][3] == 0 ? "-" : agregarComas(rows[11][3].toFixed(2)),
                    rows[11][4] == 0 ? "-" : agregarComas(rows[11][4].toFixed(2)),
                    rows[11][5] == 0 ? "-" : agregarComas(rows[11][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[9][0] + rows[10][0]) == 0 ? "-" : agregarComas((rows[9][0] + rows[10][0]).toFixed(2)),
                    (rows[9][1] + rows[10][1]) == 0 ? "-" : agregarComas((rows[9][1] + rows[10][1]).toFixed(2)),
                    (rows[9][2] + rows[10][2]) == 0 ? "-" : agregarComas((rows[9][2] + rows[10][2]).toFixed(2)),
                    (rows[9][3] + rows[10][3]) == 0 ? "-" : agregarComas((rows[9][3] + rows[10][3]).toFixed(2)),
                    (rows[9][4] + rows[10][4]) == 0 ? "-" : agregarComas((rows[9][4] + rows[10][4]).toFixed(2)),
                    (rows[9][5] + rows[10][5]) == 0 ? "-" : agregarComas((rows[9][5] + rows[10][5]).toFixed(2))
                ],
                ['Total',
                    (rows[9][0] + rows[10][0] + rows[11][0]) == 0 ? "-" : agregarComas((rows[9][0] + rows[10][0] + rows[11][0]).toFixed(2)),
                    (rows[9][1] + rows[10][1] + rows[11][1]) == 0 ? "-" : agregarComas((rows[9][1] + rows[10][1] + rows[11][1]).toFixed(2)),
                    (rows[9][2] + rows[10][2] + rows[11][2]) == 0 ? "-" : agregarComas((rows[9][2] + rows[10][2] + rows[11][2]).toFixed(2)),
                    (rows[9][3] + rows[10][3] + rows[11][3]) == 0 ? "-" : agregarComas((rows[9][3] + rows[10][3] + rows[11][3]).toFixed(2)),
                    (rows[9][4] + rows[10][4] + rows[11][4]) == 0 ? "-" : agregarComas((rows[9][4] + rows[10][4] + rows[11][4]).toFixed(2)),
                    (rows[9][5] + rows[10][5] + rows[11][5]) == 0 ? "-" : agregarComas((rows[9][5] + rows[10][5] + rows[11][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });


        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'Inyección - DWV', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[12][0] == 0 ? "-" : agregarComas(rows[12][0].toFixed(2)),
                    rows[12][1] == 0 ? "-" : agregarComas(rows[12][1].toFixed(2)),
                    rows[12][2] == 0 ? "-" : agregarComas(rows[12][2].toFixed(2)),
                    rows[12][3] == 0 ? "-" : agregarComas(rows[12][3].toFixed(2)),
                    rows[12][4] == 0 ? "-" : agregarComas(rows[12][4].toFixed(2)),
                    rows[12][5] == 0 ? "-" : agregarComas(rows[12][5].toFixed(2))
                ],
                ['Colada',
                    rows[13][0] == 0 ? "-" : agregarComas(rows[13][0].toFixed(2)),
                    rows[13][1] == 0 ? "-" : agregarComas(rows[13][1].toFixed(2)),
                    rows[13][2] == 0 ? "-" : agregarComas(rows[13][2].toFixed(2)),
                    rows[13][3] == 0 ? "-" : agregarComas(rows[13][3].toFixed(2)),
                    rows[13][4] == 0 ? "-" : agregarComas(rows[13][4].toFixed(2)),
                    rows[13][5] == 0 ? "-" : agregarComas(rows[13][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[14][0] == 0 ? "-" : agregarComas(rows[14][0].toFixed(2)),
                    rows[14][1] == 0 ? "-" : agregarComas(rows[14][1].toFixed(2)),
                    rows[14][2] == 0 ? "-" : agregarComas(rows[14][2].toFixed(2)),
                    rows[14][3] == 0 ? "-" : agregarComas(rows[14][3].toFixed(2)),
                    rows[14][4] == 0 ? "-" : agregarComas(rows[14][4].toFixed(2)),
                    rows[14][5] == 0 ? "-" : agregarComas(rows[14][5].toFixed(2))
                ],
                ['Baja',
                    rows[15][0] == 0 ? "-" : agregarComas(rows[15][0].toFixed(2)),
                    rows[15][1] == 0 ? "-" : agregarComas(rows[15][1].toFixed(2)),
                    rows[15][2] == 0 ? "-" : agregarComas(rows[15][2].toFixed(2)),
                    rows[15][3] == 0 ? "-" : agregarComas(rows[15][3].toFixed(2)),
                    rows[15][4] == 0 ? "-" : agregarComas(rows[15][4].toFixed(2)),
                    rows[15][5] == 0 ? "-" : agregarComas(rows[15][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[12][0] + rows[13][0] + rows[14][0]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0]).toFixed(2)),
                    (rows[12][1] + rows[13][1] + rows[14][1]) == 0 ? "-" : agregarComas((rows[12][1] + rows[13][1] + rows[14][1]).toFixed(2)),
                    (rows[12][2] + rows[13][2] + rows[14][2]) == 0 ? "-" : agregarComas((rows[12][2] + rows[13][2] + rows[14][2]).toFixed(2)),
                    (rows[12][3] + rows[13][3] + rows[14][3]) == 0 ? "-" : agregarComas((rows[12][3] + rows[13][3] + rows[14][3]).toFixed(2)),
                    (rows[12][4] + rows[13][4] + rows[14][4]) == 0 ? "-" : agregarComas((rows[12][4] + rows[13][4] + rows[14][4]).toFixed(2)),
                    (rows[12][5] + rows[13][5] + rows[14][5]) == 0 ? "-" : agregarComas((rows[12][5] + rows[13][5] + rows[14][5]).toFixed(2))
                ],
                ['Total',
                    (rows[12][0] + rows[13][0] + rows[14][0] + rows[15][0]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][0]).toFixed(2)),
                    (rows[12][1] + rows[13][1] + rows[14][1] + rows[15][1]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][1]).toFixed(2)),
                    (rows[12][2] + rows[13][2] + rows[14][2] + rows[15][2]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][2]).toFixed(2)),
                    (rows[12][3] + rows[13][3] + rows[14][3] + rows[15][3]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][3]).toFixed(2)),
                    (rows[12][4] + rows[13][4] + rows[14][4] + rows[15][4]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][4]).toFixed(2)),
                    (rows[12][5] + rows[13][5] + rows[14][5] + rows[15][5]) == 0 ? "-" : agregarComas((rows[12][0] + rows[13][0] + rows[14][0] + rows[15][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'Inyección - CLAY', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[16][0] == 0 ? "-" : agregarComas(rows[16][0].toFixed(2)),
                    rows[16][1] == 0 ? "-" : agregarComas(rows[16][1].toFixed(2)),
                    rows[16][2] == 0 ? "-" : agregarComas(rows[16][2].toFixed(2)),
                    rows[16][3] == 0 ? "-" : agregarComas(rows[16][3].toFixed(2)),
                    rows[16][4] == 0 ? "-" : agregarComas(rows[16][4].toFixed(2)),
                    rows[16][5] == 0 ? "-" : agregarComas(rows[16][5].toFixed(2))
                ],
                ['Colada',
                    rows[17][0] == 0 ? "-" : agregarComas(rows[17][0].toFixed(2)),
                    rows[17][1] == 0 ? "-" : agregarComas(rows[17][1].toFixed(2)),
                    rows[17][2] == 0 ? "-" : agregarComas(rows[17][2].toFixed(2)),
                    rows[17][3] == 0 ? "-" : agregarComas(rows[17][3].toFixed(2)),
                    rows[17][4] == 0 ? "-" : agregarComas(rows[17][4].toFixed(2)),
                    rows[17][5] == 0 ? "-" : agregarComas(rows[17][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[18][0] == 0 ? "-" : agregarComas(rows[18][0].toFixed(2)),
                    rows[18][1] == 0 ? "-" : agregarComas(rows[18][1].toFixed(2)),
                    rows[18][2] == 0 ? "-" : agregarComas(rows[18][2].toFixed(2)),
                    rows[18][3] == 0 ? "-" : agregarComas(rows[18][3].toFixed(2)),
                    rows[18][4] == 0 ? "-" : agregarComas(rows[18][4].toFixed(2)),
                    rows[18][5] == 0 ? "-" : agregarComas(rows[18][5].toFixed(2))
                ],
                ['Baja',
                    rows[19][0] == 0 ? "-" : agregarComas(rows[19][0].toFixed(2)),
                    rows[19][1] == 0 ? "-" : agregarComas(rows[19][1].toFixed(2)),
                    rows[19][2] == 0 ? "-" : agregarComas(rows[19][2].toFixed(2)),
                    rows[19][3] == 0 ? "-" : agregarComas(rows[19][3].toFixed(2)),
                    rows[19][4] == 0 ? "-" : agregarComas(rows[19][4].toFixed(2)),
                    rows[19][5] == 0 ? "-" : agregarComas(rows[19][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[16][0] + rows[17][0] + rows[18][0]) == 0 ? "-" : agregarComas((rows[16][0] + rows[17][0] + rows[18][0]).toFixed(2)),
                    (rows[16][1] + rows[17][1] + rows[18][1]) == 0 ? "-" : agregarComas((rows[16][1] + rows[17][1] + rows[18][1]).toFixed(2)),
                    (rows[16][2] + rows[17][2] + rows[18][2]) == 0 ? "-" : agregarComas((rows[16][2] + rows[17][2] + rows[18][2]).toFixed(2)),
                    (rows[16][3] + rows[17][3] + rows[18][3]) == 0 ? "-" : agregarComas((rows[16][3] + rows[17][3] + rows[18][3]).toFixed(2)),
                    (rows[16][4] + rows[17][4] + rows[18][4]) == 0 ? "-" : agregarComas((rows[16][4] + rows[17][4] + rows[18][4]).toFixed(2)),
                    (rows[16][5] + rows[17][5] + rows[18][5]) == 0 ? "-" : agregarComas((rows[16][5] + rows[17][5] + rows[18][5]).toFixed(2))
                ],
                ['Total',
                    (rows[16][0] + rows[17][0] + rows[18][0] + rows[19][0]) == 0 ? "-" : agregarComas((rows[16][0] + rows[17][0] + rows[18][0] + rows[19][0]).toFixed(2)),
                    (rows[16][1] + rows[17][1] + rows[18][1] + rows[19][1]) == 0 ? "-" : agregarComas((rows[16][1] + rows[17][1] + rows[18][1] + rows[19][1]).toFixed(2)),
                    (rows[16][2] + rows[17][2] + rows[18][2] + rows[19][2]) == 0 ? "-" : agregarComas((rows[16][2] + rows[17][2] + rows[18][2] + rows[19][2]).toFixed(2)),
                    (rows[16][3] + rows[17][3] + rows[18][3] + rows[19][3]) == 0 ? "-" : agregarComas((rows[16][3] + rows[17][3] + rows[18][3] + rows[19][3]).toFixed(2)),
                    (rows[16][4] + rows[17][4] + rows[18][4] + rows[19][4]) == 0 ? "-" : agregarComas((rows[16][4] + rows[17][4] + rows[18][4] + rows[19][4]).toFixed(2)),
                    (rows[16][5] + rows[17][5] + rows[18][5] + rows[19][5]) == 0 ? "-" : agregarComas((rows[16][5] + rows[17][5] + rows[18][5] + rows[19][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                [{ content: 'Inyección - PURGA', colSpan: 7, styles: { halign: 'center' } }],
                ['Estado', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco']
            ],
            body: [
                ['Bueno',
                    rows[20][0] == 0 ? "-" : agregarComas(rows[20][0].toFixed(2)),
                    rows[20][1] == 0 ? "-" : agregarComas(rows[20][1].toFixed(2)),
                    rows[20][2] == 0 ? "-" : agregarComas(rows[20][2].toFixed(2)),
                    rows[20][3] == 0 ? "-" : agregarComas(rows[20][3].toFixed(2)),
                    rows[20][4] == 0 ? "-" : agregarComas(rows[20][4].toFixed(2)),
                    rows[20][5] == 0 ? "-" : agregarComas(rows[20][5].toFixed(2))
                ],
                ['Quemado/Cont',
                    rows[21][0] == 0 ? "-" : agregarComas(rows[21][0].toFixed(2)),
                    rows[21][1] == 0 ? "-" : agregarComas(rows[21][1].toFixed(2)),
                    rows[21][2] == 0 ? "-" : agregarComas(rows[21][2].toFixed(2)),
                    rows[21][3] == 0 ? "-" : agregarComas(rows[21][3].toFixed(2)),
                    rows[21][4] == 0 ? "-" : agregarComas(rows[21][4].toFixed(2)),
                    rows[21][5] == 0 ? "-" : agregarComas(rows[21][5].toFixed(2))
                ],
                ['Degradada P/Baja	',
                    rows[22][0] == 0 ? "-" : agregarComas(rows[22][0].toFixed(2)),
                    rows[22][1] == 0 ? "-" : agregarComas(rows[22][1].toFixed(2)),
                    rows[22][2] == 0 ? "-" : agregarComas(rows[22][2].toFixed(2)),
                    rows[22][3] == 0 ? "-" : agregarComas(rows[22][3].toFixed(2)),
                    rows[22][4] == 0 ? "-" : agregarComas(rows[22][4].toFixed(2)),
                    rows[22][5] == 0 ? "-" : agregarComas(rows[22][5].toFixed(2))
                ],
                ['Total Consumible',
                    (rows[20][0] + rows[21][0]) == 0 ? "-" : agregarComas((rows[20][0] + rows[21][0]).toFixed(2)),
                    (rows[20][1] + rows[21][1]) == 0 ? "-" : agregarComas((rows[20][1] + rows[21][1]).toFixed(2)),
                    (rows[20][2] + rows[21][2]) == 0 ? "-" : agregarComas((rows[20][2] + rows[21][2]).toFixed(2)),
                    (rows[20][3] + rows[21][3]) == 0 ? "-" : agregarComas((rows[20][3] + rows[21][3]).toFixed(2)),
                    (rows[20][4] + rows[21][4]) == 0 ? "-" : agregarComas((rows[20][4] + rows[21][4]).toFixed(2)),
                    (rows[20][5] + rows[21][5]) == 0 ? "-" : agregarComas((rows[20][5] + rows[21][5]).toFixed(2))
                ],
                ['Total',
                    (rows[20][0] + rows[21][0] + rows[22][0]) == 0 ? "-" : agregarComas((rows[20][0] + rows[21][0] + rows[22][0]).toFixed(2)),
                    (rows[20][1] + rows[21][1] + rows[22][1]) == 0 ? "-" : agregarComas((rows[20][1] + rows[21][1] + rows[22][1]).toFixed(2)),
                    (rows[20][2] + rows[21][2] + rows[22][2]) == 0 ? "-" : agregarComas((rows[20][2] + rows[21][2] + rows[22][2]).toFixed(2)),
                    (rows[20][3] + rows[21][3] + rows[22][3]) == 0 ? "-" : agregarComas((rows[20][3] + rows[21][3] + rows[22][3]).toFixed(2)),
                    (rows[20][4] + rows[21][4] + rows[22][4]) == 0 ? "-" : agregarComas((rows[20][4] + rows[21][4] + rows[22][4]).toFixed(2)),
                    (rows[20][5] + rows[21][5] + rows[22][5]) == 0 ? "-" : agregarComas((rows[20][5] + rows[21][5] + rows[22][5]).toFixed(2))
                ],
                [{ content: 'Acumulado Entrega de Merma de Embarque', colSpan: 5 },
                { content: '2,000.00', colSpan: 2, styles: { halign: 'center' } }
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [
                /*[{ content: 'Inyección - PURGA', colSpan: 7, styles: { halign: 'center' } }],*/
                ['Material', 'Scrap', 'Viruta', 'Molido', 'Pulverizado', 'Polvo de Filtros de Vacio', 'Compuesto Virgen en Saco', 'Total Material Reprocesado']
            ],
            body: [
                ["Total Hoy PVC",
                    (registosHoyArray[0] == '-' ? '-' : registosHoyArray[0].toFixed(2)),
                    (registosHoyArray[1] == '-' ? '-' : registosHoyArray[1].toFixed(2)),
                    (registosHoyArray[2] == '-' ? '-' : registosHoyArray[2].toFixed(2)),
                    (registosHoyArray[3] == '-' ? '-' : registosHoyArray[3].toFixed(2)),
                    (registosHoyArray[4] == '-' ? '-' : registosHoyArray[4].toFixed(2)),
                    (registosHoyArray[5] == '-' ? '-' : registosHoyArray[5].toFixed(2)),
                    (registosHoyArray[6] == '-' ? '-' : registosHoyArray[6].toFixed(2)),
                ],
                ["Total Ayer PVC",
                    (registosAyerArray[0] == '-' ? '-' : registosAyerArray[0].toFixed(2)),
                    (registosAyerArray[1] == '-' ? '-' : registosAyerArray[1].toFixed(2)),
                    (registosAyerArray[2] == '-' ? '-' : registosAyerArray[2].toFixed(2)),
                    (registosAyerArray[3] == '-' ? '-' : registosAyerArray[3].toFixed(2)),
                    (registosAyerArray[4] == '-' ? '-' : registosAyerArray[4].toFixed(2)),
                    (registosAyerArray[5] == '-' ? '-' : registosAyerArray[5].toFixed(2)),
                    (registosAyerArray[6] == '-' ? '-' : registosAyerArray[6].toFixed(2)),
                ]
            ],
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        })

        startY = doc.autoTable.previous.finalY + 10;
        let arrayCorreos = []
        var pdfData = doc.output();

        var base64Data = btoa(pdfData);

        let correosNodes = tableCorreo.columns(2).nodes()
         
        for (x = 0; x < correosNodes[0].length; x++) {
            arrayCorreos.push(correosNodes[0][x].innerText)
        }

        // doc.save("Reporte producto terminado pvc.pdf");
        var datos = new FormData();

        datos.append("tiporeporte", "Inventario Físico De Scrap y Molinos");
        datos.append("base64PDF", base64Data);
        datos.append("email", JSON.stringify(arrayCorreos))

        // Crear un nuevo objeto XMLHttpRequest
        var xhr = new XMLHttpRequest();
        var url = '/ProductoTerminado/emailreporte';
        // Configurar la solicitud
        xhr.open('POST', url, true);

        // Manejar la respuesta
        xhr.onload = function () {
            if (xhr.status === 200) {
                // Mostrar el texto de la respuesta en la consola
                var respuesta = JSON.parse(xhr.responseText);
                if (respuesta.R == 1) {

                    iziToast.success({
                        position: "topRight",
                        title: `Correo Enviado`,
                        message: `<p>El correo se ha enviado correctamente.</p>`
                    })
                    loader.style.display = "none"

                } else {
                    iziToast.error({
                        position: "topRight",
                        title: `Ha surgido un error`,
                        message: `<p>No se ha enviado correctamente el correo.</p>`
                    })

                    loader.style.display = "none"
                }

            } else {
                // Manejar el error
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>Error dentro del proceso de enviar correo. Favor de verificar.</p>`
                })

                loader.style.display = "none"
            }
        };

        //Enviar la solicitud
        xhr.send(datos);
    }
}