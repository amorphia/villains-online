<template>
    <player-prompt classes="">
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title" v-html="shared.filterText( message )"></div>
                <area-flipper :areas="areas" :index="index" @update="updateArea">
                    <div v-if="data.show === 'units'" class="">
                        <unit-row v-for="(set, name) in units"
                                  :units="set"
                                  :key="name"
                                    ></unit-row>
                    </div>
                    <token-row v-else :area="area"></token-row>
                </area-flipper>

                <div class="">
                    <button class="button" @click="resolve">{{ buttonMessage }}</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-area',
        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },


        updated(){
            if( this.data.prompt.name === 'choose-area' ){
                this.shared.event.emit('areaSelected', this.area );
            }
        },

        computed : {

            buttonMessage(){
                return `choose the ${this.area.name}`
            },

            units(){
                let units = {};
                _.forEach( this.shared.data.factions, faction => {
                    if( this.data.enemyOnly && faction.name === this.shared.faction.name ) return;
                    if( this.data.playerOnly && faction.name !== this.shared.faction.name ) return;

                    let factionUnits = _.factionUnitsInArea( faction, this.area.name );
                    if( factionUnits.length ){
                        units[faction.name] = factionUnits;
                    }
                });
                return units;
            },

            message(){
                return this.data.message ? this.data.message : 'Choose an area'
            },

            area(){
                return this.shared.data.areas[ this.currentArea ];
            },

            currentArea(){
                return this.data.areas[this.index];
            },

            areas(){
                let areas = [];
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            resolve(){
                let data = {};
                data.area = this.area.name;
                data = Object.assign( {}, this.data, data );

                this.shared.respond( 'choose-area', data );
            },

            updateArea( n ){
                if( n === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = n;
            },


            tokenClicked( token ){

                if( token.location !== this.area.name
                    || ( this.data.unrevealedOnly && token.revealed )
                    || ( this.data.revealedOnly && !token.revealed )
                    || ( this.data.enemyOnly && token.faction === this.shared.faction.name )
                    || ( this.data.playerOnly && token.faction !== this.shared.faction.name )
                ) {
                    return;
                }

                if( token.selected ){
                    this.$set( token, 'selected', false );
                } else {
                    if( this.needToSelect === 0 ) {
                        if( this.data.count > 1) {
                            return;
                        }

                        this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                    }
                    this.$set( token, 'selected', true );
                }
            },
        }
    }
</script>

