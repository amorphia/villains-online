<template>
    <player-prompt>
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <!-- title -->
                <div class="title">{{ message }}</div>

                <!-- area -->
                <area-flipper :areas="areas" :index="index" @update="updateArea">
                    <!-- units -->
                    <unit-row v-for="(set, name) in units"
                              :units="set"
                              :key="name"
                              @unit="u => unit = u"
                              :selectedUnit="unit"></unit-row>

                </area-flipper>

                <!-- resolve buttons -->
                <div>
                    <button class="button button-empty" @click="resolve( false )">DECLINE</button>
                    <button class="button" :disabled="!unit" @click="resolve( true )">save</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'assassinate-unit',

        data() {
            return {
                shared : App.state,
                index : 0,
                unit : null
            };
        },

        computed : {

            /**
             * Return an array potential target units to kill
             * @returns {Unit[]}
             */
            units(){
                return _.enemyUnitsInArea( this.shared.faction, this.area, this.shared.data.factions, { basic : true, notHidden : true } );
            },

            /**
             * Returns title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.data.message : 'Choose your victim'
            },


            /**
             * Returns our current area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.currentAreaName ];
            },


            /**
             * Returns our current area name
             * @returns {string}
             */
            currentAreaName(){
                return this.data.areas[this.index];
            },


            /**
             * Returns an array of our area objects
             * @returns {Area[]}
             */
            areas(){
                return this.data.areas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Returns our prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            /**
             * Update our area index
             * @param index
             */
            updateArea( index ){
                if( index === this.index ) return;
                this.index = index;
            },


            /**
             * Resolve this prompt
             * @param val
             */
            resolve( val ){
                let data = this.getResolveData( val );
                data = { ...this.data, ...data };
                this.shared.respond( 'assassinate-unit', data );
            },


            /**
             * Return our resolve data
             * @param val
             */
            getResolveData( val ){
                // if we decline return our decline response
                if( !val ) return {
                    declines : true,
                    area : this.area.name
                };

                // otherwise return our unit data
                return {
                    area : this.area.name,
                    unit : this.unit.id
                };
            }
        }
    }
</script>
