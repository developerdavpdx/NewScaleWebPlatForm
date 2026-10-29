// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('accordionSidebar');
    const wrapper = document.getElementById('wrapper');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const dashboardLink = document.getElementById('Dashboard');
    

    // Marcar link activo según la página actual
    function markActiveLink() {
        const currentUrl = window.location.pathname.toLowerCase();
        const navLinks = sidebar.querySelectorAll('.nav-link, .collapse-item');

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const dataPage = link.getAttribute('data-page');

            // Si tiene data-page, usar eso para identificar la página
            if (dataPage) {
                if (currentUrl.includes(dataPage)) {
                    link.classList.add('active');
                }
            }
            // Si tiene href normal (no #), comparar con la URL
            else if (href && href !== '#') {
                const linkPath = href.toLowerCase().replace('../', '');
                if (currentUrl.includes(linkPath)) {
                    link.classList.add('active');

                    // Si es un collapse-item, encontrar el collapse padre y abrirlo
                    const collapseParent = link.closest('.collapse');
                    if (collapseParent) {
                        collapseParent.classList.add('show');
                        // También marcar el botón dropdown como activo
                        const collapseId = collapseParent.id;
                        const dropdownButton = document.querySelector(`[data-target="#${collapseId}"]`);
                        if (dropdownButton) {
                            dropdownButton.classList.add('active');
                        }
                    }

                    // Si es un dropdown (nav-link con data-target), expandir su contenedor
                    const target = link.getAttribute('data-target');
                    if (target && link.classList.contains('btnDropDown')) {
                        const collapseElement = document.querySelector(target);
                        if (collapseElement) {
                            collapseElement.classList.add('show');
                        }
                    }
                }
            }
        });

        // Excepción especial: marcar Dashboard como activo si estamos en DashboardMolinos
        if (currentUrl.includes('dashboardmolinos')) {
            dashboardLink.classList.add('active');
        }
    }

    // Show toggle button on mobile
    function checkScreen() {
        if (window.innerWidth <= 768) {
            sidebarToggle.classList.add('visible');
        } else {
            sidebarToggle.classList.remove('visible');
            sidebar.classList.remove('sidebar-hidden');
            if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
        }
    }

    // Toggle sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function (e) {
            e.preventDefault();
            sidebar.classList.toggle('sidebar-hidden');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('visible');
            }
        });
    }

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function () {
            sidebar.classList.add('sidebar-hidden');
            sidebarOverlay.classList.remove('visible');
        });
    }

    // Close sidebar when clicking a link
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('sidebar-hidden');
                if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
            }
        });
    });

    // Dashboard navigation
    if (dashboardLink) {
        dashboardLink.addEventListener('click', function (e) {
            e.preventDefault();
            const tipoUsuario = localStorage.getItem('tipousuario');

            if (tipoUsuario === 'AdmMolinos') {
                window.location.replace("../Molinos/DashboardMolinos");
            } else {
                window.location.replace("../Inicio/Index");
            }
        });
    }

    // Check screen size on load and resize
    checkScreen();
    window.addEventListener('resize', checkScreen);

    // Marcar link activo al cargar la página
    markActiveLink();
});

function btnCircleToggle() {

    if (document.getElementById('accordionSidebar').classList.contains('toggled')) {
        document.getElementById('sidebarToggle').classList.remove('fa-arrow-right')
        document.getElementById('sidebarToggle').classList.add('fa-arrow-left')
    } else {
        document.getElementById('sidebarToggle').classList.remove('fa-arrow-left')
        document.getElementById('sidebarToggle').classList.add('fa-arrow-right')
    }
}

function btnDropDown() {

    if (document.getElementById('accordionSidebar').classList.contains('toggled')) {
        document.getElementById('arrowIcon').style.display = 'none'
        return;
    }
}

function logOut() {
    fetch("/Login/LogOut").then((reponse) => {
        return reponse.ok ? reponse.json() : Promise.reject(reponse)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            window.location.replace('/')
        } else {
            window.location.replace('/')
        }
    }).catch((error) => {
        console.log(error)
        window.location.replace('/')
    })
}

//TODO: Actions

$(document).on("click", ".btnDropDown", function () {
    btnDropDown();
});

$(document).on("click", "#btnlogOut", function () {
    logOut();
});