<template>
    <player-prompt classes="">
        <div class="choose-spy overflow-auto px-5 center-text">
            <div class="title view-player__title d-inline-block pull-center">Choose area to deploy Xavier Blackstone</div>

            <area-flipper :areas="areas" :index="index" @update="updateArea">
                <unit-row v-if="xavier" :units="[xavier]"></unit-row>
            </area-flipper>

            <div class="width-100 d-flex justify-center">
                <button class="button" @click="save">SAVE</button>
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
            this.xavier = this.shared.faction.units.find( unit => unit.type === "champion" );
        },

        methods : {
            save(){
                App.event.emit( 'sound', 'ui' );
                App.event.emit('unselectAreas' );
                this.shared.socketEmit( 'factionStartOfTurnResponse', this.area.name );
            },

            updateArea( n ){
                if( n === this.index ) return;
                this.index = n;
            },

        },

        computed : {
            area(){
                return this.areas[ this.index ];
            },


            areas(){
                return Object.values( this.shared.data.areas );
            },
        }
    }
</script>


<style>

</style>

