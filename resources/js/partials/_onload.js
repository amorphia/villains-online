window.addtoOnLoad = function( func ) {

    var preOnload = window.onload;

    if( typeof window.onload != 'function' ){
        window.onload = func;
    } else {
        window.onload = function(){
            if( preOnload ){
                preOnload();
            }
            func();
        }
    }

}
