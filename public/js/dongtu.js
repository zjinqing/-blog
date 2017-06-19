/**
 * Created by Administrator on 2017/5/26.
 */
var classes_to_remove = ["look-right","look-left", "look-down", "look-up","look-down-right","look-down-left","look-up-right","look-up-left"];

function removeClasses () {
    for(var x = 0;x<classes_to_remove.length;x++) {
        $(".head").removeClass(classes_to_remove[x]);
        $(".hair").removeClass(classes_to_remove[x]);
        $(".neck").removeClass(classes_to_remove[x]);
    }
}
function direction(e) {
    //look left
    if( e.clientX<= window.innerWidth/2) {
        removeClasses();

        $(".head").addClass("look-left");
        $(".hair").addClass("look-left");
        $(".neck").addClass("look-left");
    }
    //look right
    if( e.clientX >= (window.innerWidth-(window.innerWidth/2))) {
        removeClasses();

        $(".head").addClass("look-right");
        $(".hair").addClass("look-right");
        $(".neck").addClass("look-right");
    }
    //look down
    if( e.clientY >= (window.innerHeight -(window.innerHeight/2.5))) {
        removeClasses();

        $(".head").addClass("look-down");
        $(".hair").addClass("look-down");
        $(".neck").addClass("look-down");
    }


    // look up
    if( e.clientY <= ((window.innerHeight/2.5))) {
        removeClasses();

        $(".head").addClass("look-up");
        $(".hair").addClass("look-up");
        $(".neck").addClass("look-up");
    }

    // look down right
    if( e.clientY >= (window.innerHeight -(window.innerHeight/2.5)) && e.clientX >= (window.innerWidth-(window.innerWidth/3))) {
        removeClasses();

        $(".head").addClass("look-down-right");
        $(".hair").addClass("look-down-right");
        $(".neck").addClass("look-down-right");
    }

    // look down left
    if( e.clientY >= (window.innerHeight -(window.innerHeight/2.5)) &&  e.clientX<= window.innerWidth/3) {
        removeClasses();

        $(".head").addClass("look-down-left");
        $(".hair").addClass("look-down-left");
        $(".neck").addClass("look-down-left");
    }


    // look up right
    if( e.clientY <= ((window.innerHeight/2.5)) && e.clientX >= (window.innerWidth-(window.innerWidth/3))) {
        removeClasses();

        $(".head").addClass("look-up-right");
        $(".hair").addClass("look-up-right");
        $(".neck").addClass("look-up-right");
    }

    // look down left
    if( e.clientY <= ((window.innerHeight/2.5)) &&  e.clientX<= window.innerWidth/3) {
        removeClasses();

        $(".head").addClass("look-up-left");
        $(".hair").addClass("look-up-left");
        $(".neck").addClass("look-up-left");
    }

    if( e.clientX >  window.innerWidth/3 &&  e.clientX < (window.innerWidth - (window.innerWidth/3)) &&
        e.clientY >  window.innerHeight/2.5 &&  e.clientY < (window.innerHeight - (window.innerHeight/2.5)) ) {
        removeClasses();
    }
}
window.addEventListener("mousemove", function (e) {
    direction(e);
})

window.addEventListener("click", function (e) {
    direction(e);
})