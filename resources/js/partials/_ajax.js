window.App.ajax = new class {

    file( url, originalData, file, message ){
        // set multipart form headers
        let headers = { headers: { 'Content-Type': 'multipart/form-data' } };

        // build form data manually
        let data = new FormData();

        for ( let property in originalData ) {
            data.set( property, originalData[property] );
        }

        // add file to formdata
        data.append( "image", file );

        // post request
        return this.axios( 'post', url, data, message, headers )
    }

    post( url, data, message ){
        return this.axios( 'post', url, data, message );
    }

    get( url, message ){
        return this.axios( 'get', url, {}, message );
    }

    patch( url, data, message ){
        data = data || {};
        data._method = 'patch';
        return this.axios( 'post', url, data, message );
    }

    delete( url, data, message ){
        data = data || {};
        data._method = 'delete';
        return this.axios( 'post', url, data, message );
    }

    axios( type, url, data, message, headers ){

        // return an axios call wrapped in a promise
        return new Promise(function( resolve, reject ) {
            axios[type]( url, data )
                .then( response => {
                    // notify success
                    let successMessage = message ? message : 'Success';

                    // resolve
                    resolve( response );
                } )
                .catch( error => {
                    // log error
                    console.log( error );

                    // notify erro

                    // reject
                    reject( error );
                } );

        });

    }

};

