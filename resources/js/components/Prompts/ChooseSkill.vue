<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
                <area-flipper :areas="areas" :index="index" @update="updateArea">
                    <div class="width-100 choose-action__skill-ability center-text" v-html="this.shared.filterText( this.area.skill )"></div>
                </area-flipper>

                <div class="">
                    <button class="button" @click="resolve">SAVE</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-skill',
        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        computed : {

            message(){
                return this.data.message ? this.data.message : 'Choose a skill to activate'
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

                this.shared.respond( 'choose-skill', data );
            },

            updateArea( n ){
                if( n === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = n;
            },

        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

