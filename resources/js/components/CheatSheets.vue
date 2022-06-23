<template>
    <!-- GAME OPTIONS PANEL -->
    <transition name="fade">
        <div v-if="shared.openCheatSheets" class="player-prompt view-card z-8 width-70">

            <!-- close button -->
            <button @click="shared.openCheatSheets = false" class="toggle minimize-toggle top right"><i class="icon-x"></i></button>

            <!-- main container -->
            <div class="player-prompt__slot-container">
                <div class="d-flex justify-center mb-3">
                    <div class="cheat-sheet__option" @click="mode = 'general'" :class="{active : mode === 'general'}">general</div>
                    <div class="cheat-sheet__option" @click="mode = 'areas'" :class="{active : mode === 'areas'}">areas</div>
                </div>

                <div class="px-5 pb-5 d-flex flex-column align-stretch center-text">
                    <img class="" :src="image">
                </div>
            </div>
        </div>
    </transition>
</template>


<script>
    export default {

        name: 'cheat-sheets',

        data() {
            return {
                shared : App.state,
                mode: "general",
            };
        },

        computed: {
            image(){
                return this.mode === 'general' ? "images/cheat-sheets-general.jpg" : "images/cheat-sheets-areas.jpg";
            }
        }
    }
</script>
<style>
    .cheat-sheet__option {
        margin: 0 5px;
        padding: 2px 10px;
        border: solid 1px;
    }

    .cheat-sheet__option.active {
        color: gold;
    }
</style>

