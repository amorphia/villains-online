<template>
    <div class="horizontal-scroll d-flex justify-center height-100">
        <!-- left button -->
        <button v-if="addButtons" class="flipper" @click="scroll( -1 )"><i class="icon-left"></i></button>

        <!-- main container -->
        <div class="width-100 horizontal-scroll" ref="container" :class="classes" @wheel="wheel">
            <slot></slot>
        </div>

        <!-- right button -->
        <button v-if="addButtons" class="flipper" @click="scroll( 1 )"><i class="icon-right"></i></button>
    </div>
</template>


<script>
    export default {

        name: 'horizontal-scroll',
        props : ['classes', 'buttons'],

        data() {
            return {
                isMounted: false,
                wheelScroll : 100, // how many pixels to jump with each scroll
                buttonScrollCards : 3 // how many cards to jump with each navigation button
            };
        },
        mounted(){
            this.isMounted = true;

            // math math math!
            Math.easeInOutQuad = function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            };
        },

        methods : {
            /**
             * Handle wheel event
             * @param event
             */
            wheel( event ){
                if (event.deltaY > 0) this.$refs.container.scrollLeft += this.wheelScroll; // scroll right
                else this.$refs.container.scrollLeft -= this.wheelScroll; // scroll left
            },


            /**
             * Scroll from button click
             * @param sign
             */
            scroll( sign ){
                let buttonScroll = this.$refs.container.firstChild.clientWidth * this.buttonScrollCards;
                this.scrollTo( this.$refs.container, sign * buttonScroll );
            },


            /**
             * Resolve scroll
             *
             * @param element
             * @param shift
             * @param duration
             */
            scrollTo( element, shift, duration = 250 ) {

                let start = element.scrollLeft,
                    change = shift,
                    currentTime = 0,
                    increment = 20;

                let animateScroll = function(){
                    currentTime += increment;
                    element.scrollLeft = Math.easeInOutQuad( currentTime, start, change, duration );
                    if(currentTime < duration) {
                        setTimeout( animateScroll, increment );
                    }
                };

                animateScroll();
            },

        },


    computed : {
        /**
         * Should we add scroll buttons?
         *
         * @returns {string|boolean}
         */
        addButtons(){
                // if we aren't mounted, or we don't even want buttons, return
                if ( !this.isMounted || !this.buttons ) return;

                // otherwise only add buttons if our container is overflowing
                return this.$refs.container.scrollWidth > this.$refs.container.clientWidth;
            },

        }
    }
</script>


<style>
    .horizontal-scroll {
        max-width: 100%;
    }
</style>

