/**
 *
 *  The scroller class sets a throttled windows event listener to emit the current scroll distance from
 *  the top and bottoms of the page, and the delta from the last time the event fired
 *  This is meant to be used by other components that need this kind of thing
 *
 */

window.App.scroller = new class {

    constructor() {

        // ms to wait between scroll events
        const THROTTLE = 250;

        this._lastFromTop = 0;
        window.addEventListener('scroll', _.throttle( this.checkScroll, THROTTLE ));
    }

    checkScroll(){

            // get current scroll position
            let fromTop = window.scrollY;

            // get distance to bottom of page
            let fromBottom = document.body.scrollHeight - window.innerHeight - fromTop;

            // compare this scroll position with the last one
            let delta = fromTop - this._lastFromTop;

            // if we get a bad delta, reset it to 0
            if( isNaN( delta ) ) {
                delta = 0;
            }

            // emit the current delta and scroll position
            let data = { delta, fromTop, fromBottom };
            App.event.event( 'scroll', data );

            // update the last scroll position for next time
            this._lastFromTop = fromTop;
    }
};
