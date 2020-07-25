<template>
    <div class="d-flex justify-center height-100">
        <button v-if="addButtons" class="flipper" @click="scroll( -1 )"><i class="icon-left"></i></button>
        <div class="width-100 horizontal-scroll" ref="container" :class="classes" @wheel="wheel">
        <slot></slot>
        </div>
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
                wheelScroll : 100
            };
        },
        mounted(){
            this.isMounted = true;

            Math.easeInOutQuad = function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            };
        },

        methods : {
            wheel( e ){
                if (e.deltaY > 0) this.$refs.container.scrollLeft += this.wheelScroll;
                else this.$refs.container.scrollLeft -= this.wheelScroll;
            },

            scroll( sign ){
                let buttonScroll = this.$refs.container.firstChild.clientWidth * 2;
                this.scrollTo( this.$refs.container, sign * buttonScroll );
            },

            scrollTo( element, shift, duration = 250 ) {

                let start = element.scrollLeft,
                    change = shift,
                    currentTime = 0,
                    increment = 20;

                let animateScroll = function(){
                    currentTime += increment;
                    let val = Math.easeInOutQuad( currentTime, start, change, duration );
                    element.scrollLeft = val;
                    if(currentTime < duration) {
                        setTimeout( animateScroll, increment );
                    }
                };
                animateScroll();
            }
        },



    computed : {
            addButtons(){
                if (!this.isMounted ) return;
                return this.buttons && this.$refs.container.scrollWidth > this.$refs.container.clientWidth;
            },

        }
    }
</script>


<style>

</style>

