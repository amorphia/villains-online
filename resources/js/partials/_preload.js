window.App.preloader = new class {



    constructor() {
        this.loaded = false;
        this.list = [];
        this.imgs;
        this.t;
        this.timer;
    }

    preloadImages( array, waitForOtherResources, timeout ) {
        this.loaded = false;
        this.imgs = array.slice(0);
        this.t = timeout || 15 * 1000;

        if (!waitForOtherResources || document.readyState === 'complete') {
            this.loadNow();
        } else {
            window.addEventListener("load", () => {
                clearTimeout( this.timer) ;
                this.loadNow();
            });

            // in case window.addEventListener doesn't get called (sometimes some resource gets stuck)
            // then preload the images anyway after some timeout time
            this.timer = setTimeout( this.loadNow, this.t );
        }
    }

    loadNow() {
        if (!this.loaded ) {
            this.loaded = true;
            for ( let i = 0; i < this.imgs.length; i++ ) {
                if( !this.imgs[i].includes( '.jpg') && !this.imgs[i].includes( '.png') ) continue;

                let img = new Image();

                img.onload = img.onerror = img.onabort = () => {
                    let index = this.list.indexOf( img );
                    if ( index !== -1 ) {
                        // remove image from the array once it's loaded
                        // for memory consumption reasons
                        this.list.splice(index, 1);
                    }
                };

                this.list.push( img );
                img.src = this.imgs[i];
            }
        }
    }

    add( files, wait, timeout ) {
        wait = wait || true;
        if( !Array.isArray( files ) ) files = [files];
        this.preloadImages( files, wait, timeout );
    }

    loadCore(){
        App.ajax.get( '/preload' ).then( result => this.add( result.data ) );
    }

    loadFaction( faction ){
        App.ajax.get( '/preload/faction/' + faction ).then( result => this.add( result.data ) );
    }

};
