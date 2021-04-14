window.App.preloader = new class {

    constructor() {
        this.loaded = false;
        this.list = []; // images we are currently loading
        this.images = []; // images we want to load
        this.timeout;
        this.timer = null;
    }

    preloadImages( array, waitForOtherResources, timeout ) {
        this.loaded = false;
        this.images = [...this.images, ...array];
        this.timeout = timeout || 15 * 1000;

        // should we load our images yet?
        if (!waitForOtherResources || document.readyState === 'complete') {
            this.loadNow();
        } else {
            window.addEventListener("load", () => {
                clearTimeout( this.timer) ;
                this.loadNow();
            });

            // in case window.addEventListener doesn't get called (sometimes some resource gets stuck)
            // then preload the images anyway after some timeout time
            this.timer = setTimeout( this.loadNow, this.timeout );
        }
    }

    loadNow() {
        if ( !this.loaded ) {

            this.loaded = true;

            this.images.forEach( image => {
                if( !image.includes( '.jpg') && !image.includes( '.png') ) return;

                let img = new Image();

                // once this image loads,
                img.onload = img.onerror = img.onabort = () => {
                    let index = this.list.indexOf( img );
                    if ( index !== -1 ) {
                        // remove image from the array once it's loaded
                        // for memory consumption reasons
                        this.list.splice( index, 1 );
                    }
                };

                // push this image to our list
                this.list.push( img );

                // then set its url
                img.src = image;
            });

            this.images = [];
        }
    }


    /**
     * Add files to our pre-loader
     *
     * @param files
     * @param wait
     * @param timeout
     */
    add( files, wait, timeout ) {
        wait = wait || true;
        if( !Array.isArray( files ) ) files = [files];
        this.preloadImages( files, wait, timeout );
    }


    /**
     * load our core game assets
     */
    loadCore(){
        App.ajax.get( '/preload' ).then( result => this.add( result.data ) );
    }


    /**
     * load a faction's assets
     *
     * @param faction
     */
    loadFaction( faction ){
        App.ajax.get( '/preload/faction/' + faction ).then( result => this.add( result.data ) );
    }

};
