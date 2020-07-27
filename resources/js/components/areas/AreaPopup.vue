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
                popup : null,
                interval : null,
                seconds : 5,
            };
        },

        mounted(){
            this.shared.socket.on( 'popup', this.onPopup );
        },

        methods : {
            onPopup( popup ){
                if( popup.area !== this.area.name ) return;
                this.popup = popup;
                App.event.emit( 'sound', 'chirp' );
                this.interval = setTimeout( this.clearPopup, this.seconds * 1000 );
            },

            clearPopup(){
                this.popup = null;
            }

        },

        computed : {
            image(){
                if( this.popup.token ){
                    let token = this.popup.token;
                    return `/images/factions/${token.faction}/tokens/${token.type}.png`;
                }

                if( this.popup.skill ){
                    return `/images/icons/skilled.png`
                }
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

