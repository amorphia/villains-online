/**
 * Shared event handler, which is really just a wrapper around a Vue instance
 */
window.App.event = new class {

    constructor() {
        this._vue = new Vue();
        this.debug = false;
    }

    emit( event, data = null ){
        if( this.debug ) console.log( `${event} emitted` );
        this._vue.$emit( event, data );
    }

    on( event, callback ){
        if( this.debug ) console.log( `on ${event} registered` );
        this._vue.$on( event, callback );
    }

};
