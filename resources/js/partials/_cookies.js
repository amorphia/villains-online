window.App._cookieHandler = new class {

    constructor(){
        this.MIN = 60;
        this.HOUR = this.MIN * 60;
        this.DAY = this.HOUR * 24;
        this.WEEK = this.DAY * 7;
        this.MONTH = this.DAY * 30;
        this.YEAR = this.DAY * 365;
    }

    getTime( time ){
        // if the time is a number return the number
        if( typeof time === 'number' ){
            return time;
        }

        // the time is a string parse it
        if( typeof time === 'string' ){
            let parsedtime = this.parseTimeString( time );
            if( typeof parsedtime === 'number'){
                return parsedtime;
            }
        }

        // default to 1000 years
        return this.YEAR * 1000;
    }

    parseTimeString( string ){

        let unit = string.slice(-1);
        let value = parseInt( string, 10);

        switch( unit ){
            case 'm':
                value = value * this.MIN;
                break;
            case 'h':
            case 'H':
                value = value * this.HOUR;
                break;
            case 'd':
            case 'D':
                value = value * this.DAY;
                break;
            case 'w':
            case 'W':
                value = value * this.WEEK;
                break;
            case 'M':
                break;
            case 'Y':
            case 'y':
                value = value * this.YEAR;
                break;
        }

        return value;
    }

    isJson( str ) {
        try { JSON.parse(str) } catch (e) { return false }
        return true;
    }

    setCookie( name, value, time) {
        // jsonify anything not already a string
        if (typeof value !== 'string' && typeof value !== 'number') value = JSON.stringify(value);

        // parse and format time string
        let date = new Date();
        date.setTime( date.getTime() + this.getTime( time ) * 1000 );
        let expires = "; expires=" + date.toUTCString();

        // write cookie
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    readCookie( name ) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for( let i=0;i < ca.length;i++ ) {
            let c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    getCookie( name ){
        let value = this.readCookie( name );

        if( this.isJson( value ) ){
            return JSON.parse( value );
        }
        return value;
    }
}

// public API
window.App.cookie = function( name, value, time ){
    if( value !== undefined ){
        App._cookieHandler.setCookie( name, value, time );
    }
    else {
        return App._cookieHandler.getCookie( name );
    }
};
