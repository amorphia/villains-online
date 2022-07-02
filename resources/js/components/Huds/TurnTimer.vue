<template>
   <div v-if="timestamp && shared.admin"
        class="width-100 timer center-text p-2 mx-3 mb-3 glass secondary-font"
        :class="computedClasses"
   >
       {{ elapsedText }}
   </div>
</template>


<script>
    export default {
        data() {
            return {
                shared : App.state,
                interval: null,
                elapsed: 0,
            };
        },

        mounted(){
            if(this.timestamp) this.startTimer();
        },

        watch: {
            timestamp(newVal){
                if(newVal){
                    this.startTimer();
                } else {
                    this.endTimer();
                }
            }
        },

        methods: {
            startTimer(){
                this.calculateTime();
                this.interval = setInterval(this.calculateTime, 1000);
            },

            endTimer(){
                clearInterval(this.interval);
                this.elapsed = 0;
            },

            calculateTime(){
                if(!this.timestamp) return this.elapsed = 0;

                this.elapsed = Math.floor((Date.now() - this.timestamp) / 1000);
            },
        },

        computed: {
            timestamp(){
                if(!this.shared.player || !this.shared.player.prompt || !this.shared.player.prompt?.timestamp){
                    return false;
                }

                return this.shared.player.prompt?.timestamp;
            },

            computedClasses(){
                if(this.elapsed < 20) return "timer--white";
                if(this.elapsed > 40) return "timer--red";
            },

            elapsedText(){
                return new Date(this.elapsed * 1000).toISOString().substr(14, 5);
            }
        }
    }
</script>

<style>
    .timer {
        font-size: 2rem;
    }

    .timer--white {
        color: rgba(255,255,255,.65);
    }

    .timer--red {
        color: red;
        font-weight: bold;
    }
</style>
