<template>
    <div>
        <!-- small area icons -->
        <div v-if="manyAreas && !hidePips" class="area-flipper__pips">
            <div v-for="(area, index) in areaNamesAndReserves"
                 class="area-flipper__pip"
                 @click="pipClicked( area )"
                 :title="`switch to the ${area}`"
                 :class="pipClasses( area )">
            </div>
        </div>

        <!-- area -->
        <div class="width-100 d-flex justify-center">
            <!-- left button -->
            <button v-if="manyAreas" class="flipper" @click="switchArea( -1 )"><i class="icon-left"></i></button>

            <!-- main content -->
            <div class="area-header p-4 pb-1 pos-relative" :class="`area-header-${areaName} ${classes}`" @click="$emit( 'areaClicked', areaName )">
                <slot></slot>
                <div v-if="!noZoom && areaName !== 'reserves'" class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>
            </div>

            <!-- right button -->
            <button v-if="manyAreas" class="flipper" @click="switchArea( +1 )"><i class="icon-right"></i></button>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'area-flipper',
        props : {
            'areas': {},
            'index': { default: 0 },
            'classes': {},
            'hasReserves': {},
            'isReserves': {},
            'noZoom': {},
            'locked': {},
            'hidePips': {},
        },

        data() {
            return {
                shared : App.state
            };
        },

        mounted(){
            this.shared.event.on( 'areaClicked', this.areaClicked );

            // highlight area
            this.$nextTick( () => {
                if( this.useAreaSelect) this.shared.event.emit( 'areaSelected', this.area );
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
            /**
             * Should we apply the area select highlighting?
             * @returns {boolean}
             */
            useAreaSelect(){
                // if we have an area, this isn't locked, and we aren't showing the reserves
                return this.area && !this.locked && this.index !== -1;
            },


            /**
             * Returns an array of our area names and "reserves" if applicable
             * @returns {string[]}
             */
            areaNamesAndReserves(){
                let areas = this.areas.map( area => area.name );
                if( this.hasReserves ) areas.unshift( 'reserves' );
                return areas;
            },


            /**
             * Do we have more than one area?
             * @returns {boolean|string}
             */
            manyAreas(){
                return this.areas.length > 1
                       || ( this.hasReserves && !this.isReserves )
                       || ( this.isReserves && this.areas.length > 0 );
            },


            /**
             * Returns the currently selected area object, or a dummy object for our reserves
             * @returns {object}
             */
            area(){
                if( this.isReserves ) return { name : 'reserves' };
                return this.areas[this.index];
            },


            /**
             * Return's the currently selected area name
             * @returns {string}
             */
            areaName(){
                return this.area.name;
            }
        },

        methods : {
            /**
             * After a user clicks on an area icon, jump the index to the appropriate area
             * @param area
             */
            pipClicked( area ){
                let index = area === 'reserves' ? -1 : _.findIndex( this.areas, item => item.name === area );
                this.$emit( 'update', index );
            },


            /**
             * Get the classes for the given icon pip
             * @param area
             * @returns {string}
             */
            pipClasses( area ){
                let classes = `pip-bg-${area}`;
                if( this.area.name === area ) classes += ' active';
                return classes;
            },


            /**
             * Handle an area click to select the given area
             * @param clicked
             */
            areaClicked( clicked ){
                let index = _.findIndex( this.areas, area => area.name === clicked.name );
                if( index === -1 ) return;
                this.$emit( 'update', index );
            },


            /**
             * Change our area index
             * @param increment
             */
            switchArea( increment ){
                let index = this.index + increment;

                // if we go below index 0...
                if( index < 0 ){
                    if( this.hasReserves && !this.isReserves ){ index = -1 }
                    else index = this.areas.length - 1;
                }

                // if we go above our max index...
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

