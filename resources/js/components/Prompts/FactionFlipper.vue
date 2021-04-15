<template>
    <div class="px-3 width-100 d-flex justify-center">
        <!-- left button -->
        <button v-if="factions.length > 1" class="flipper" @click="flip( -1 )"><i class="icon-left"></i></button>

        <!-- faction -->
        <div class="faction-header p-4 pos-relative" :class="`faction-header-${faction.name} ${classes}`" :style="`background-color: var(--faction-${faction.name})`">
            <div class="faction-flipper__faction-logo units-hud__unit"><img :src="`/images/factions/${faction.name}/icon.jpg`"></div>
            <slot></slot>
        </div>

        <!-- right button -->
        <button v-if="factions.length > 1" class="flipper" @click="flip( +1 )"><i class="icon-right"></i></button>
    </div>
</template>


<script>
    export default {

        name: 'faction-flipper',
        props : [ 'factions', 'index', 'classes' ],
        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            /**
             * Return current faction
             * @returns {Faction}
             */
            faction(){
                return this.factions[this.index];
            }
        },
        methods : {
            /**
             * increment/decrement faction index
             * @param increment
             */
            flip( increment ){
                let index = this.index + increment;
                if( index < 0 ) index = this.factions.length - 1; // if we go below 0, flip to the end
                if( index > this.factions.length - 1 ) index = 0; // if we go above our max flip to the start
                this.$emit( 'update', index );
            },
        }
    }
</script>

<style>
.faction-header {
    display: flex;
    justify-content: center;
}

.faction-header .units-hud__unit {
    z-index: 1;
}

.faction-header .units-hud__unit img {
    outline: 2px solid rgba(0,0,0,.2);
    margin: .25em;
}


.faction-header:after {
    box-shadow: inset 0 0 20px rgba( 0,0,0,.8);
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.2);
    z-index: 0;
}
</style>

