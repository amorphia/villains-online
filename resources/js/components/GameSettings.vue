<template>
    <!-- GAME OPTIONS PANEL -->
    <transition name="fade">
        <div v-if="shared.openSettings" class="player-prompt view-card z-8">

            <!-- close button -->
            <button @click="shared.openSettings = false" class="toggle minimize-toggle top right"><i class="icon-x"></i></button>

            <!-- main container -->
            <div class="player-prompt__slot-container">

                <div class="px-5 pb-5 d-flex flex-column align-stretch center-text">

                    <!-- title -->
                    <div class="title">Game Options</div>

                    <!-- rules -->
                    <div class="pt-4">
                        <a href="/files/villains_v4.2_web.pdf" target="_blank" class=" width-100 d-block button">
                            view game rules <i class="icon-launch"></i>
                        </a>
                    </div>

                    <div class="pt-3">
                        <a href="/files/villains_visitors_guide_v4.2_web.pdf" target="_blank" class=" width-100 d-block button">
                            view visitor's guide <i class="icon-launch"></i>
                        </a>
                    </div>

                    <!-- final scoring -->
                    <div class="pt-3">
                        <end-game :track="true">
                            <button  class="conclude button width-100 d-block">go to final scoring</button>
                        </end-game>
                    </div>

                    <!-- terminate game -->
                    <div class="pt-3">
                        <end-game>
                            <button class="conclude button width-100 d-block">terminate game</button>
                        </end-game>
                    </div>

                </div>
            </div>
        </div>
    </transition>
</template>


<script>
    export default {

        name: 'game-settings',

        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


