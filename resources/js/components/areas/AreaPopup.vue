<template>
    <!-- show actions -->
    <transition name="popup">
        <div v-if="popup" class="area-map__popup area-action z-8">
            <img class="area-map__popup-image" :src="image">
        </div>
    </transition>
</template>


<script>
    export default {

        name: 'area-popup',
        props: ['area'],
        data() {
            return {
                shared : App.state,
                popup : null, // the popup to display
                interval : null, // store our interval object
                seconds : 5, // how long to show our popup
            }
        },

        mounted(){
            // set socket listener
            this.shared.socket.on( 'popup', this.onPopup );
        },

        methods : {

            /**
             * Popup an action notification in this area
             * @param popup
             */
            onPopup( popup ){
                // if this popup isn't for our area, abort
                if( popup.area !== this.area.name ) return;

                // show our popup for the specified time
                this.popup = popup;
                App.event.emit( 'sound', 'chirp' );
                this.interval = setTimeout( this.clearPopup, this.seconds * 1000 );
            },

            // clear this popup
            clearPopup(){
                this.popup = null;
            }
        },


        computed : {

            /**
             * Returns the image url for this popup
             * @returns {string}
             */
            image(){
                // first return any dynamic images

                // show a face down token when placing a token
                if( this.popup.type === 'place' ){
                    return `/images/factions/${this.popup.faction}/tokens/back.png`;
                }

                // reveal this token
                if( this.popup.type === 'token' ){
                    return `/images/factions/${this.popup.token.faction}/tokens/${this.popup.token.name}.png`;
                }

                // otherwise return the appropriate static image
                return this.shared.actionTypes[this.popup.type]?.img;
            }
        }
    }
</script>


<style>
    .area-map__popup {
        position: absolute;
        top: 55%;
        left: 50%;
        transform:  scale(1) translate(-50%,-50%);
        box-shadow: 0 0 .5rem .2rem rgba(0,0,0,.7);
        border: 1px solid;
    }
</style>

