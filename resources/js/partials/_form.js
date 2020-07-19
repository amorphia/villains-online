class Errors {
    /**
     * Create a new Errors instance.
     */
    constructor() {
        this.errors = {};
    }


    /**
     * Determine if an errors exists for the given field.
     */
    has( field ) {
        return this.errors.hasOwnProperty( field );
    }


    /**
     * Determine if we have any errors.
     */
    any() {
        return Object.keys( this.errors ).length > 0;
    }


    /**
     * Retrieve the error message for a field.
     */
    get( field ) {
        if ( this.errors[field] ) {
            return this.errors[field][0];
        }
    }

    /**
     * Manually set an error
     */
    set( field, message ) {
        this.errors[field] = [message];
    }


    /**
     * Record the new errors.
     */
    record( errors ) {
        this.errors = errors;
    }


    /**
     * Clear one or all error fields.
     */
    clear( field ) {
        delete this.errors[field];
    }

    clearAll() {
        this.errors = {};
    }

}


export default class Form {

    /**
     * Create a new Form instance.
     */
    constructor( data, action, method = 'post' ) {

        this.originalData = data;
        this.action = action;
        this.method = method.toLowerCase();
        this.success = null;
        this.headers = {};

        for ( let field in data ) {

            if( typeof data[field] === 'object' && data[field].hasOwnProperty( 'value' ) ) {
                this[field] = { value : data[field].value };
            } else {
                this[field] = { value : data[field] };
            }

            if( data[field].file ){
                this[field].file = true;
            }
        }

        this.errors = new Errors();
    }


    /**
     * Return all relevant data for the form.
     */
    data() {

        let data = new FormData();

        for ( let property in this.originalData ) {
            if( this[property].file ){
                data.append( property, this[property].value )
            }
            else if( Array.isArray( this[property].value ) ){
                this[property].value.forEach( item => {
                    if( typeof item === 'object' ){
                        item = JSON.stringify( item );
                    }
                    data.append(`${property}[]`, item );
                });
            }
            else {
                data.set( property, this[property].value );
            }
        }

        if( this.method !== 'post' ){
            data.append( '_method', this.method );
        }

        return data;
    }


    /**
     * Reset the form fields.
     */
    reset() {

        for ( let field in this.originalData ) {
            this[field].value = this.originalData[field].value;
        }

        this.errors.clearAll();
    }


    /**
     *  Flag this form as having files
     */
    hasFiles(){
        this.headers['Content-Type'] = 'multipart/form-data';
    }

    /**
     *  Return our headers in a wrapping object
     */
    getHeaders() {
        return { headers : this.headers };
    }


    /**
     * Submit the form.
     */
    submit() {
        this.success = null;

        if( this.errors.any() ){
            return new Promise( (resolve, reject ) => {
                console.log( 'errors any pre-flag' );
                reject( 'form has errors' );
            });
        }


        return new Promise(( resolve, reject ) => {
            let data = this.data();

            axios.post( this.action, this.data(), this.getHeaders() )
                .then(response => {
                    this.onSuccess( response.data );
                    resolve( response.data );
                })
                .catch(error => {
                    this.onFail( error.response.data );
                    reject( error.response.data );
                });
        });

    }


    /**
     * Handle a successful form submission.
     */
    onSuccess( data ) {
        this.success = true;
        this.reset();
    }


    /**
     * Handle a failed form submission.
     */
    onFail( response ) {
        if( response.errors ){
            this.errors.record( response.errors );
        }
    }
}
