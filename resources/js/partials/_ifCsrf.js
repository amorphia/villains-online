window.App.ifCsrf = function( callback ){

    let wrapper = () => {
        if( App.csrf ){
            callback();
        } else {
            console.log( 'csrf not found' );
            setTimeout( wrapper, 200 );
        }
    }

    wrapper();
}


