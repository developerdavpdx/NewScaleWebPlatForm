//!function (l) {
//    "use strict";
//    l("#sidebarToggle, #sidebarToggleTop").on("click", function (e) {

//        l("body").toggleClass("sidebar-toggled"),
//            l(".sidebar").toggleClass("toggled"),

//            l(".sidebar").hasClass("toggled") && l(".sidebar .collapse").collapse("hide")
//    }),
//        l(window).resize(function () {
//            l(window).width() < 768 && l(".sidebar .collapse").collapse("hide"), l(window).width() < 480 && !l(".sidebar").hasClass("toggled") && (l("body").addClass("sidebar-toggled"),
//                l(".sidebar").addClass("toggled"),
//                l(".sidebar .collapse").collapse("hide"))
//        }), l("body.fixed-nav .sidebar").on("mousewheel DOMMouseScroll wheel", function (e) {
//            var o; 768 < l(window).width() && (o = (o = e.originalEvent).wheelDelta || -o.detail, this.scrollTop += 30 * (o < 0 ? 1 : -1), e.preventDefault())
//        }),
//        l(document).on("scroll", function () {

//            100 < l(this).scrollTop() ? l(".scroll-to-top").fadeIn() : l(".scroll-to-top").fadeOut()

//        }),
//        l(document).on("click", "a.scroll-to-top", function (e) {
//            var o = l(this); l("html, body").stop().animate({ scrollTop: l(o.attr("href")).offset().top }, 1e3, "easeInOutExpo"), e.preventDefault()
//        })
//}(jQuery);

// obtenemos la planta


function btnCircleToggle() {

    if (document.getElementById('accordionSidebar').classList.contains('toggled')) {
        document.getElementById('sidebarToggle').classList.remove('fa-arrow-right')
        document.getElementById('sidebarToggle').classList.add('fa-arrow-left')
        //document.getElementById('arrowIcon').classList.add('fa-arrow-right')
        //document.getElementById('arrowIcon').classList.remove('fa-arrow-down')
        //document.getElementById('arrowIcon').style.display = 'inline'
    } else {
        document.getElementById('sidebarToggle').classList.remove('fa-arrow-left')
        document.getElementById('sidebarToggle').classList.add('fa-arrow-right')
        //document.getElementById('arrowIcon').classList.add('fa-arrow-right')
        //document.getElementById('arrowIcon').style.display = 'none'
    }
}

function btnDropDown() {

    if (document.getElementById('accordionSidebar').classList.contains('toggled')) {
        document.getElementById('arrowIcon').style.display = 'none'
        return;
    }
    //} else if (document.getElementById('arrowIcon').classList.contains('fa-arrow-right')) {
    //    document.getElementById('arrowIcon').classList.remove('fa-arrow-right')
    //    document.getElementById('arrowIcon').classList.add('fa-arrow-down')
    //} else {
    //    document.getElementById('arrowIcon').classList.remove('fa-arrow-down')
    //    document.getElementById('arrowIcon').classList.add('fa-arrow-right')
    //}
}

//function logOut() {
//    fetch("/Login/LogOut").then((reponse) => {
//        return reponse.ok ? reponse.json() : Promise.reject(reponse)
//    }).catch((jsonData) => {
//        console.log(jsonData.status);
//    })
//}

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