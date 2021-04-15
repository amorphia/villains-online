<template>
    <player-prompt classes="">
        <div class="choose-spy overflow-auto px-5 center-text">

            <!-- title -->
            <div class="title view-player__title d-inline-block pull-center">Choose area to deploy Xavier Blackstone</div>

            <!-- area selector -->
            <area-flipper :areas="areas" :index="index" @update="updateArea">
                <unit-row v-if="xavier" :units="[xavier]"></unit-row>
            </area-flipper>

            <!-- submit button -->
            <div class="width-100 d-flex justify-center">
                <button class="button" @click="save">{{ `Deploy Xavier to the ${area.name}` }}</button>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'deploy-xavier',

        data() {
            return {
                shared : App.state,
                index : 0,
                xavier : null,
            };
        },

        mounted(){
            // get our xavier unit
            this.xavier = this.shared.faction.units.find( unit => unit.type === "champion" );
        },

        methods : {
            /**
             * Save our choice
             */
            save(){
                App.event.emit( 'sound', 'ui' );
                App.event.emit('unselectAreas' );
                this.shared.socketEmit( 'factionStartOfTurnResponse', this.area.name );
            },


            /**
             * Change our area index
             * @param index
             */
            updateArea( index ){
                // abort if we select our current area
                if( index === this.index ) return;

                // set our area
                this.index = index;
            },

        },

        computed : {
            /**
             * Return our selected area
             * @returns {Area}
             */
            area(){
                return this.areas[ this.index ];
            },


            /**
             * Return an array of each of our areas
             * @returns {unknown[]}
             */
            areas(){
                return Object.values( this.shared.data.areas );
            },
        }
    }
</script>

