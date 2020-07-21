<template>
    <div class="width-100 d-flex justify-center">
        <button v-if="areas.length > 1 || hasReserves" class="flipper" @click="prev"><i class="icon-left"></i></button>
        <div class="area-header p-4 pb-1 pos-relative" :class="`area-header-${areaName} ${classes}`">
            <slot></slot>
            <div v-if="!noZoom && areaName !== 'reserves'" class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>
        </div>
        <button v-if="areas.length > 1 || hasReserves" class="flipper" @click="next"><i class="icon-right"></i></button>
    </div>
</template>


<script>
    export default {

        name: 'area-flipper',
        props : [ 'areas', 'index', 'classes', 'hasReserves', 'noZoom', 'locked' ],
        data() {
            return {
                shared : App.state
            };
        },

        mounted(){
            this.shared.event.on( 'areaClicked', this.areaClicked );
            this.$nextTick( () => {
                if( this.area && !this.locked ) this.shared.event.emit('areaSelected', this.area );
            });
        },

        watch: {
            index(){
                if( this.area && !this.locked ){
                    App.event.emit( 'sound', 'ui' );
                    this.shared.event.emit('areaSelected', this.area );
                }
            }
        },
        computed : {
            area(){
                return this.areas[this.index];
            },
            areaName(){
                return this.areas[this.index].name;
            }
        },
        methods : {

            areaClicked( clicked ){
                let index = _.findIndex( this.areas, area => area.name === clicked.name );
                if( index === -1 ) return;
                this.$emit( 'update', index );
            },


            prev(){
                let index = this.index - 1;
                if( index < 0 ){
                    if( this.hasReserves ){ index = -1 }
                    else index = this.areas.length - 1;
                }

                this.$emit( 'update', index );
            },

            next(){
                let index = this.index + 1;
                if( index > this.areas.length - 1 ){
                    if( this.hasReserves ){ index = -1 }
                    else index = 0;
                }

                this.$emit( 'update', index );
            },
        }
    }
</script>


<style>
    .area-header {
        background-position: center -1rem, center top;
        background-repeat: no-repeat;
        background-size: contain, cover;
        box-shadow: inset 0 0 0px 4px rgba(0,0,0,.5);
        border: 2px solid rgba(255,255,255,.3);
        width: 40rem;
        padding-top: 5rem;
        min-height: 8rem;
    }

    .area-header__units {
        min-height: 14rem;
    }

    .area-header-reserves { background-image: url(/images/areas/reserves-top.png), url(/images/areas/reserves-bg.jpg) }
    .area-header-church { background-image: url(/images/areas/church-top.png), url(/images/areas/church-bg.jpg) }
    .area-header-sewers { background-image: url(/images/areas/sewers-top.png), url(/images/areas/sewers-bg.jpg) }
    .area-header-police { background-image: url(/images/areas/police-top.png), url(/images/areas/police-bg.jpg) }
    .area-header-subway { background-image: url(/images/areas/subway-top.png), url(/images/areas/subway-bg.jpg) }
    .area-header-capitol { background-image: url(/images/areas/capitol-top.png),  url(/images/areas/capitol-bg.jpg) }
    .area-header-laboratory { background-image: url(/images/areas/laboratory-top.png),  url(/images/areas/laboratory-bg.jpg) }
    .area-header-university { background-image: url(/images/areas/university-top.png),  url(/images/areas/university-bg.jpg) }
    .area-header-bank { background-image: url(/images/areas/bank-top.png),  url(/images/areas/bank-bg.jpg) }
    .area-header-factory { background-image: url(/images/areas/factory-top.png),  url(/images/areas/factory-bg.jpg) }

</style>

