window.App.ajax = new class {

    /**
     * Make a POST request
     *
     * @param url
     * @param data
     * @param message
     * @returns {Promise}
     */
    post( url, data, message ){
        return this.axios( 'post', url, data, message );
    }


    /**
     * Make a GET request
     *
     * @param url
     * @param message
     * @returns {Promise}
     */
    get( url, message ){
        return this.axios( 'get', url, {}, message );
    }


    /**
     * Make a patch request
     *
     * @param url
     * @param data
     * @param message
     * @returns {Promise}
     */
    patch( url, data, message ){
        data = data || {};
        data._method = 'patch';
        return this.axios( 'post', url, data, message );
    }


    /**
     * Make a DELETE request
     *
     * @param url
     * @param data
     * @param message
     * @returns {*|Promise<unknown>}
     */
    delete( url, data, message ){
        data = data || {};
        data._method = 'delete';
        return this.axios( 'post', url, data, message );
    }


    /**
     * Make a multipart/formdata request
     *
     * @param url
     * @param originalData
     * @param file
     * @param message
     * @returns {Promise}
     */
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


    /**
     * Make an axios call
     *
     * @param type
     * @param url
     * @param data
     * @param message // our success message
     * @param headers
     * @returns {Promise}
     */
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

                    // reject
                    reject( error );
                } );

        });

    }

};

