<template>
    <player-prompt classes="width-100">
        <div class="px-5 center-text">
            <div class="title d-inline-block">Score Targets Step</div>
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
                index : 0,
                interval : null
            };
        },

        mounted() {
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
        },

        methods : {

            incrementIndex(){
                if( !this.data || !this.data.targets || this.index === this.data.targets.length ) {
                    clearInterval( this.interval );
                    return;
                }
                this.data.targets[this.index].flipped = true;
                this.index++;
            }
        },

        computed : {

            data(){
                return this.shared.player.prompt.data;
            },

        },


    }
</script>


<style>



</style>

