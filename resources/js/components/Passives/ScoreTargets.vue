<template>
    <player-prompt classes="width-100">
        <div class="px-5 center-text">
            <!-- title -->
            <div class="title d-inline-block">Score Targets Step</div>

            <!-- targets -->
            <div class="score-targets d-flex justify-center align-start">
                <target-block v-for="target in data.targets" :key="target.placer" :target="target"></target-block>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'score-targets',

        data() {
            return {
                shared : App.state,
                index : 0, // which target are we revealing
                interval : null
            };
        },

        mounted() {
            // set our reveal target interval
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
        },

        methods : {
            /**
             * increment our reveal target index
             */
            incrementIndex(){
                // if we are done clear the interval
                if( !this.data || !this.data.targets || this.index === this.data.targets.length ) {
                    clearInterval( this.interval );
                    return;
                }

                // otherwise, flip this target and increment our index
                this.data.targets[this.index].flipped = true;
                this.index++;
            }
        },

        computed : {
            /**
             * Return our prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },
        },
    }
</script>
