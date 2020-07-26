<template>
    <div>
        <div v-if="manyAreas && !hidePips" class="area-flipper__pips">
            <div v-for="(area, index) in areaNamesAndReserves"
                 class="area-flipper__pip"
                 @click="pipClicked( area )"
                 :title="`switch to the ${area}`"
                 :class="pipClasses( area )">
            </div>
        </div>

        <div class="width-100 d-flex justify-center">
            <button v-if="manyAreas" class="flipper" @click="prev"><i class="icon-left"></i></button>
            <div class="area-header p-4 pb-1 pos-relative" :class="`area-header-${areaName} ${classes}`">
                <slot></slot>
                <div v-if="!noZoom && areaName !== 'reserves'" class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>
            </div>
            <button v-if="manyAreas" class="flipper" @click="next"><i class="icon-right"></i></button>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'area-flipper',
        props : [
            'areas',
            'index',
            'classes',
            'hasReserves',
            'isReserves',
            'noZoom',
            'locked',
            'hidePips'
        ],
        data() {
            return {
                shared : App.state
            };
        },

        mounted(){
            this.shared.event.on( 'areaClicked', this.areaClicked );
            this.$nextTick( () => {
                if( this.useAreaSelect) this.shared.event.emit('areaSelected', this.area );
            });
        },

        watch: {
            index(){
                if( this.useAreaSelect ){
                    App.event.emit( 'sound', 'ui' );
                    this.shared.event.emit('areaSelected', this.area );
                }
            }
        },

        computed : {
            useAreaSelect(){
                return this.area && !this.locked && this.index !== -1;
            },
            areaNamesAndReserves(){
                let areas = this.areas.map( area => area.name );
                if( this.hasReserves ) areas.unshift( 'reserves' );
                return areas;
            },
            manyAreas(){
                return this.areas.length > 1
                       || ( this.hasReserves && !this.isReserves )
                       || ( this.isReserves && this.areas.length > 0 );
            },
            area(){
                if( this.isReserves ) return { name : 'reserves' };
                return this.areas[this.index];
            },
            areaName(){
                return this.area.name;
            }
        },
        methods : {
            pipClicked( area ){
                let index;
                if( area === 'reserves' ){
                    index = -1;
                } else {
                    index = _.findIndex( this.areas, item => item.name === area );
                }

                this.$emit( 'update', index );
            },

            pipClasses( area ){
                let classes = `pip-bg-${area}`;
                if( this.area.name === area ) classes += ' active';
                return classes;
            },


            areaClicked( clicked ){
                let index = _.findIndex( this.areas, area => area.name === clicked.name );
                if( index === -1 ) return;
                this.$emit( 'update', index );
            },

            prev(){
                let index = this.index - 1;
                if( index < 0 ){
                    if( this.hasReserves && !this.isReserves ){ index = -1 }
                    else index = this.areas.length - 1;
                }

                this.$emit( 'update', index );
            },

            next(){
                let index = this.index + 1;
                if( index > this.areas.length - 1 ){
                    if( this.hasReserves && !this.isReserves ){ index = -1 }
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

    .area-flipper__pips {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-bottom: .5rem;
    }

    .area-flipper__pip {
        width: 2rem;
        height: 2rem;
        margin: 0 .25rem;
        background-size: 150% 150%;
        background-position: center;
        box-shadow: inset 0 0 0px 2px rgba(0,0,0,.5);
        border: 1px solid rgba(255,255,255,.8);
    }

    .area-flipper__pip.active{
        border-color: var(--highlight-color);
    }

    .area-header-reserves {
        background-image: url(/images/areas/reserves-top.png), url(/images/areas/reserves-bg.jpg);
        padding-bottom: 2.7rem;
    }
    .pip-bg-reserves { background-image: url(/images/areas/reserves-bg.jpg) }

    .area-header-church { background-image: url(/images/areas/church-top.png), url(/images/areas/church-bg.jpg) }
    .pip-bg-church { background-image: url(/images/areas/church-bg.jpg) }

    .area-header-sewers { background-image: url(/images/areas/sewers-top.png), url(/images/areas/sewers-bg.jpg) }
    .pip-bg-sewers { background-image: url(/images/areas/sewers-bg.jpg) }

    .area-header-police { background-image: url(/images/areas/police-top.png), url(/images/areas/police-bg.jpg) }
    .pip-bg-police { background-image: url(/images/areas/police-bg.jpg) }

    .area-header-subway { background-image: url(/images/areas/subway-top.png), url(/images/areas/subway-bg.jpg) }
    .pip-bg-subway { background-image: url(/images/areas/subway-bg.jpg) }

    .area-header-capitol { background-image: url(/images/areas/capitol-top.png),  url(/images/areas/capitol-bg.jpg) }
    .pip-bg-capitol { background-image: url(/images/areas/capitol-bg.jpg) }

    .area-header-laboratory { background-image: url(/images/areas/laboratory-top.png),  url(/images/areas/laboratory-bg.jpg) }
    .pip-bg-laboratory { background-image: url(/images/areas/laboratory-bg.jpg) }

    .area-header-university { background-image: url(/images/areas/university-top.png),  url(/images/areas/university-bg.jpg) }
    .pip-bg-university { background-image: url(/images/areas/university-bg.jpg) }

    .area-header-bank { background-image: url(/images/areas/bank-top.png),  url(/images/areas/bank-bg.jpg) }
    .pip-bg-bank { background-image: url(/images/areas/bank-bg.jpg) }

    .area-header-factory { background-image: url(/images/areas/factory-top.png),  url(/images/areas/factory-bg.jpg) }
    .pip-bg-factory { background-image: url(/images/areas/factory-bg.jpg) }
</style>

