//sobrepeso
 function SobrePesoFormIndividual(produccionNeta, Numtubos, PesoUnitEstandar) {
    let sobrepeso = 0;
    let pesoEstandar = 0;
    pesoEstandar = Numtubos * PesoUnitEstandar
    sobrepeso = (produccionNeta / pesoEstandar) - 1;
    return sobrepeso * 100
}

function SobrePesoFormTotal(produccionNeta, pesoEstandar) {
    let sobrepeso = 0;
    sobrepeso = (produccionNeta / pesoEstandar) - 1;
    return sobrepeso * 100
}

//Scrap
 function ScrapForm(scrapTotal, prduccionNeta) {
    let scrap = (scrapTotal / (scrapTotal + prduccionNeta));
    return scrap * 100;
}

//eficiencia
 function EficienciaForm(produccionNeta, scrap, kgProducto, HorasTrabajadas) {
    let eficiencia = 0;
    let KgNetosProgramados = 0;

    KgNetosProgramados = kgProducto * HorasTrabajadas;
    eficiencia = ((produccionNeta + scrap) / (KgNetosProgramados)); 
    return eficiencia * 100
}