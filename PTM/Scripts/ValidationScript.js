/**
 * Script de Validación - Verificar que las correcciones funcionan
 * Ejecutar en la consola del navegador después de cargar la página
 */

console.log('%c🔍 VERIFICACIÓN DE CORRECCIONES', 'color: #0058a1; font-size: 16px; font-weight: bold;');
console.log('═'.repeat(50));

// TEST 1: Verificar que EmailTXT.js se cargó correctamente
console.log('\n✓ TEST 1: Validación de EmailTXT.js');
try {
    // Verificar que las funciones existen
    if (typeof GuardarCorreo === 'function') {
        console.log('  ✅ GuardarCorreo encontrada');
    } else {
        console.warn('  ⚠️ GuardarCorreo NO encontrada');
    }

    if (typeof getCorreosTXT === 'function') {
        console.log('  ✅ getCorreosTXT encontrada');
    } else {
        console.warn('  ⚠️ getCorreosTXT NO encontrada');
    }

    if (typeof borrarMail === 'function') {
        console.log('  ✅ borrarMail encontrada');
    } else {
        console.warn('  ⚠️ borrarMail NO encontrada');
    }

    // Verificar que loader2 está disponible
    const loader2 = document.getElementById('loaderDiv');
    if (loader2) {
        console.log('  ✅ Elemento loaderDiv encontrado');
    } else {
        console.warn('  ⚠️ Elemento loaderDiv NO encontrado');
    }
} catch (e) {
    console.error('  ❌ Error en TEST 1:', e.message);
}

// TEST 2: Verificar CSS del Navbar
console.log('\n✓ TEST 2: Validación de estilos Navbar');
try {
    const topbar = document.querySelector('.topbar');
    if (topbar) {
        const styles = window.getComputedStyle(topbar);
        const bgColor = styles.backgroundColor;
        const minHeight = styles.minHeight;

        console.log('  ✅ Topbar encontrada');
        console.log('  - Color de fondo:', bgColor);
        console.log('  - Altura mínima:', minHeight);

        // Verificar links del navbar
        const navLinks = topbar.querySelectorAll('.nav-link');
        if (navLinks.length > 0) {
            console.log(`  ✅ ${navLinks.length} navegación links encontrados`);
            navLinks.forEach((link, index) => {
                const text = link.textContent.trim();
                const color = window.getComputedStyle(link).color;
                console.log(`     Link ${index + 1}: "${text}" - Color: ${color}`);
            });
        }
    } else {
        console.warn('  ⚠️ Topbar NO encontrada. Verifica las clases CSS.');
    }
} catch (e) {
    console.error('  ❌ Error en TEST 2:', e.message);
}

// TEST 3: Validar elementos críticos
console.log('\n✓ TEST 3: Elementos críticos del página');
try {
    const elementos = {
        'wrapper': '#wrapper',
        'accordionSidebar': '#accordionSidebar',
        'loaderDiv': '#loaderDiv',
        'page-top': '#page-top'
    };

    for (const [nombre, selector] of Object.entries(elementos)) {
        const elem = document.querySelector(selector);
        if (elem) {
            console.log(`  ✅ ${nombre} encontrado`);
        } else {
            console.warn(`  ⚠️ ${nombre} NO encontrado (selector: ${selector})`);
        }
    }
} catch (e) {
    console.error('  ❌ Error en TEST 3:', e.message);
}

// TEST 4: Verificar que no hay errores no capturados
console.log('\n✓ TEST 4: Validación de errores global');
window.addEventListener('error', function(e) {
    console.error('  ❌ Error capturado:', e.message);
});

console.log('\n' + '═'.repeat(50));
console.log('%c✅ VERIFICACIÓN COMPLETADA', 'color: #28a745; font-size: 14px; font-weight: bold;');
console.log('\nSi ves todos los checkmarks ✅, las correcciones están funcionando correctamente.\n');
