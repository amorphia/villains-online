<template>
    <transition name="right">
        <div v-if="player" class="view-player pos-absolute width-100 height-100 top-0 p-5 d-flex align-stretch overflow-auto z-5">

            <!-- close button -->
            <button class="toggle fixed top right icon-x" @click="closeViewPlayer"></button>

            <!-- player stats and resources -->
            <div class="view-player__main-content width-55 pt-4 pr-5 pb-6">

                <!-- bribe -->
                <player-bribe :player="player" :faction="faction"></player-bribe>

                <!-- player stats -->
                <player-stats :faction="faction"></player-stats>

                <!-- plan focus -->
                <div class="view-player__title">Plan Focus:</div>
                <div class="prompt-question p-4">{{ faction.focusDescription }}
                    <component v-if="faction.focus" :is="faction.focus" :faction="faction"></component>
                </div>

                <!-- player state -->
                <player-state :faction="faction"></player-state>

                <!-- completed plans -->
                <player-plans :faction="faction"></player-plans>
            </div>


            <!-- faction components -->
            <faction-components :faction="faction"></faction-components>

        </div>
    </transition>
</template>


<script>
    export default {
        name: 'view-player',

        data() {
            return {
                shared : App.state,
                player : null,
            };
        },

        created(){
            // set event listeners
            this.shared.event.on( 'viewPlayer', this.setViewPlayer ); // set our player
            this.shared.event.on( 'viewArea', () => this.player = null ); // clear our player when the area modal is selected
        },


        computed : {
            /**
             * Return the selected player's faction
             */
            faction(){
                return this.shared.getPlayerFaction( this.player );
            },
        },

        watch : {
            /**
             * Play a sound when a new player is selected for view
             */
            player(){
                App.event.emit( 'sound', 'ui' );
            }
        },

        methods : {
            /**
             * close this modal
             */
            closeViewPlayer(){
                this.player = null;
                //this.faction = null;
                App.event.emit( 'showChatIcon' );
            },

            /**
             * Set the player to view
             * @param player
             */
            setViewPlayer( player ){
                // if we select the same player twice, toggle it closed
                if( this.player && this.player.id === player.id ){
                    this.closeViewPlayer();
                    return
                }

                // otherwise set the player
                this.player = player;
            }
        }
    }
</script>


<style>

    .icon-image {
        height: 1.4em;
        margin: 0 .1em;
        position: relative;
        top: .3em;
    }

    .view-player {
        background-image : url('/images/factory-background.jpg');
        background-position: center;
        background-size: cover;
        z-index: 3;
    }

    .view-player__unit-image {
        width: 100%;
        border: 1.5px solid rgba(0,0,0,.1);
    }

    .view-player__token-wrap, .view-player__unit-wrap {
        width: 6vw;
    }

    .view-player__token, .view-player__unit {
        position: absolute;
        width: 100%;
        height: 100%;
        max-width: 6vw;
        max-height: 6vw;
        top: 0;
        left: 0;
        border: 1.5px solid rgba(0,0,0,.1);
    }

     .view-player__upgrade-card-image{
         border: 3px solid rgba(0,0,0,.2);
         border-radius: 5%/8%;
     }

    .view-player__token {
        border-radius: 50%;
    }

    .view-player__title {
        letter-spacing: 1px;
        margin-bottom: .5em;
        border-bottom: 1px solid;
        border-left: 1px solid;
        font-size: 1.2em;
        text-transform: uppercase;
        padding: .2em .5em;
        margin-top: .5em;
        white-space: nowrap;
        font-family: var(--secondary-font);
        border-color: #e953cd;
        font-weight: 200;
    }

    .view-player__title span {
        font-family: var(--primary-font);
        color: var(--highlight-color);
        font-size: 1.3em;
    }

    .view-player__title span.note {
        color: var(--off-white);
        font-size: .85em;
    }


    .view-player__core-stats .view-player__title {
        margin: 0;
    }

    .view-player__empty {
        padding: 1vw;
        font-size: 1.3em;
        text-align: center;
        color: var(--primary-light-color);
    }

    .view-player .icon-ap,  .view-player .icon-pp {
        width: 2.3rem;
        position: relative;
        height: 2.3rem;
        display: inline-block;
    }

    .view-player .icon-ap:before, .view-player .icon-pp:before {
        width: 100%;
        height: 100%;
        display: inline-block;
        position: absolute;
        bottom: 0;
    }

    .view-player__areas {
        padding: 1vw;
        font-size: 1.3em;
        color: var(--highlight-color);
        text-align: center;
        text-transform: capitalize;
    }

    .view-player__card {
        width: 11.5rem;
        border-radius: 11%/8%;
        border: 2px solid rgba(0,0,0,.2);
        margin: 0 .2rem;
    }

    .view-player__areas-control {
        font-size: 0.7em;
        color: var(--primary-light-color);
        letter-spacing: 1px;
    }

    .view-player__capitol-token__image {
        width: 5.5rem;
        border-radius: 50%;
        border: 3px solid rgba(0,0,0,.3);
    }

    .completed-plans__points {
        position: absolute;
        bottom: .5rem;
        z-index: 4;
        left: 50%;
        transform: translateX(-50%);
        width: 4rem;
    }

</style>

