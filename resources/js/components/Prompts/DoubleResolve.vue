<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <div class="title">Resolve this skill twice?</div>

                <area-flipper :areas="[area]" :index="0">
                    <div class="width-100 choose-action__skill-ability center-text"
                         v-html="this.shared.filterText( this.area.skill )"></div>
                </area-flipper>

                <!-- <div class="prompt-question" v-html="shared.filterText( `Pay xC1x to resolve this skill a second time?` )"></div> -->

                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">Decline</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!canActivate">Resolve Twice</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'double-resolve',

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            resolve( choice ){
                let data = { doubleResolve : choice };
                this.shared.respond('double-resolve', data );
            }
        },

        computed : {

            canActivate(){
                return (this.shared.faction.resources) >= 1;
            },


            data(){
                return this.shared.player.prompt.data;
            },

            area(){
                return this.shared.data.areas[this.data.area];
            }
        }
    }
</script>


<style>
</style>
