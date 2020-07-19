<template>
    <hud-popout :open="open" classes="score-hud" nohandle="true" @close="$emit( 'close')">
        <div classes="score-hud__board-container" >
            <img class="score-board" src="/images/score-board.jpg">
            <score-row :scores="ap" type="ap"></score-row>
            <score-row :scores="pp" type="pp"></score-row>
        </div>
    </hud-popout>
</template>


<script>

    import ScoreRow from "./ScoreRow";
    export default {

        name: 'score-hud',
        components: {ScoreRow},
        props: ['open'],
        data() {
            return {
                shared : App.state,
            };
        },

        computed :{
            ap(){
                return this.generatePointArray( 'ap' );
            },

            pp(){
                return this.generatePointArray( 'pp' );
            }

        },

        methods : {
            generatePointArray( type  ){
                let arr = [];

                for( let i = 0; i <= 16; i++ ){
                    arr.push( [] );
                }


                _.forEach( this.shared.data.factions, faction => {
                    let points = faction[type];
                    if( points > 16 ) points = 16;
                    arr[points].push( faction.name )
                });

                return arr;
            }
        }
    }
</script>


<style>
    .score-hud {
    }


</style>

