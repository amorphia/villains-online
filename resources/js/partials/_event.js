/**
 * Shared event handler, which is really just a wrapper around a Vue instance
 */
window.App.event = new class {

    constructor() {
        this._vue = new Vue();
        this.debug = false;
    }

    emit( event, data = null ){
        if( this.debug ) console.log( 'emit', event );
        this._vue.$emit( event, data );
    }

    on( event, callback ){
        if( this.debug ) console.log( 'on', event );
        this._vue.$on( event, callback );
    }

};
