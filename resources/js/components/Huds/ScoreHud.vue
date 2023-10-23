<template>
    <hud-popout :open="open" classes="score-hud" nohandle="true" @close="$emit( 'close')">
        <div classes="score-hud__board-container" >
            <img class="score-board" :src="scoreBoardImage">
            <score-row :scores="ap" type="ap"></score-row>
            <score-row :scores="pp" type="pp"></score-row>
        </div>
    </hud-popout>
</template>


<script>
    export default {
        name: 'score-hud',
        props: ['open'],

        data() {
            return {
                shared : App.state,
            };
        },

        computed :{

            /**
             * Returns our area points array
             * @returns {[]}
             */
            ap(){
                return this.generatePointArray( 'ap' );
            },

            /**
             * Returns our plan points array
             * @returns {[]}
             */
            pp(){
                return this.generatePointArray( 'pp' );
            },

            scoreBoardImage(){
                return this.shared.data?.options?.thirteenPoints ? "/images/score-board.jpg" : "/images/score-board-basic.jpg";
            }

        },

        methods : {
            /**
             * Generate the nested points arrays for the given points type
             *
             * @param type
             * @returns {[][]} // returns an array of 17 elements representing points 0-16, each of these elements
             *                 // contains an array of faction names for the factions with that many points
             */
            generatePointArray( type ){
                // build our parent array

                let array = [];
                for( let i = 0; i < 17; i++ ){
                    array.push([]);
                }

                // for each faction log our points
                Object.values(this.shared.data.factions ).forEach( faction => {
                    let points = faction[type];
                    if( points > 16 ) points = 16;
                    array[points].push( faction.name )
                });

                return array;
            }
        }
    }
</script>

