<template>
    <div class="player-hud d-flex flex-wrap pos-relative overflow-hidden" :class="{'opacity-5' : player.passed}" @click="shared.event.emit( 'viewPlayer', player )">

        <loading-streak v-if="isActive" position="left"></loading-streak>

        <div class="player-hud__core d-flex flex-wrap width-100 align-center shrink-0">

            <!-- faction icon -->
            <div class="player-hud__champion-wrap d-flex grow-0 shrink-0 p-1">
                <div class="player-hud__champion" :style="`background-image: url('/images/factions/${faction.name}/icon.jpg')`"></div>
            </div>

            <!-- player name -->
            <div class="player-hud__title grow-1">
                <div class="player-hud__name width-100 ellipses" :class="{ gold: player.admin}">
                    <!-- <i v-if="shared.isFirstPlayer( player )" class="first-player icon-key"></i> -->
                    {{ player.name | startCase }}
                </div>
                <div class="player-hud__faction width-100 ellipses">{{ faction.name }}</div>
            </div>

            <!-- player points -->
            <div class="player-hud__scores grow-0 shrink-0">
                <div class="width-100 d-flex align-center"><i class="icon-ap"></i><span>{{ faction.ap }}</span></div>
                <div class="width-100 d-flex align-center"><i class="icon-pp"></i><span>{{ faction.pp }}</span></div>
            </div>
        </div>

        <!-- current player prompt -->
        <div v-if="showPromptMessage" class="player-hud__message ellipses shrink-0 game-phase center-text highlight lowercase">{{ player.prompt.name | clearHyphens }}</div>


        <!-- player target -->
        <div v-if="faction.cards.target.length && shared.canSeeTarget( faction )"
             class="player-hud__target p-2 text-center shrink-0"
             :style="`background-image: url('/images/areas/${faction.cards.target[0].target}-slice.jpg')`">
            {{ faction.cards.target[0].target }}
        </div>

        <!-- player resources -->
        <div class="player-hud__pip-content overflow-hidden">

            <!-- money -->
            <div class="player-hud__pip-content__item">
                <i class="icon-money pip-icon"></i>
                <span>{{ (faction.energy + faction.resources) }}</span>
                <i v-if="faction.hasOwnProperty('darkEnergy')"  title="Dark Energy (may be spent to play action cards)" class="faction-witches player-hud__darkenergy">{{ faction.darkEnergy }}</i>
            </div>

            <!-- cards -->
            <div class="player-hud__pip-content__item"><i class="icon-cards pip-icon"></i><span>{{ faction.cards.hand.length }}</span></div>

            <!-- captured markers -->
            <div class="player-hud__pip-content__item "><i class="icon-flag pip-icon"></i><span class="ellipses">{{ faction.captured.current }} / {{ faction.captured.max }}</span></div>
        </div>

        <!-- devil chaos -->
        <div v-if="faction.name === 'devils'" class="ellipses overflow-hidden game-phase lowercase highlight chaos-track">
            <div class="chaos-track__internal d-flex flex-wrap">
                <span class="">CHAOS</span>
                <div class="d-flex justify-center align-center grow-1">
                    <i v-for="n in faction.chaosLevels.max"
                       class="faction-track__pip"
                       :class="n <= faction.chaos ? 'icon-circle active' : 'icon-circle-open'"></i>
                </div>
            </div>
        </div>


        <!-- modifier abilities -->
        <div class="player-hud__stats-row pos-relative width-100 display-flex shrink-1 overflow-hidden flex-wrap">
            <i v-for="stat in stats" class="stat-icon" :class="`icon-${stat.name}`" :title="`${stat.title} - ${stat.description}`"></i>
        </div>


    </div>
</template>


<script>
    export default {

        name: 'player-hud',
        props: ['player'],
        data() {
            return {
                shared : App.state,
            };
        },

        computed: {

            /**
             * Is ths player active?
             */
            isActive(){
                return this.player.prompt.name
                    && !( this.player.prompt.data && this.player.prompt.data.passive );
            },

            /**
             * Should we show the player's prompt message
             * @returns {boolean}
             */
            showPromptMessage(){
                return this.player.prompt // does this player have a prompt
                    && !( this.player.prompt.data && this.player.prompt.data.passive ); // that isn't a passive?
            },


            /**
             * Return this player's faction
             * @returns {Faction}
             */
            faction(){
                return this.shared.getPlayerFaction( this.player );
            },

            condemned(){
                return this.shared.data.factions['executioners']?.condemned ?? [];
            },

            /**
             * Returns an array of ability modifiers and their descriptions
             * @returns {[]}
             */
            stats(){
                let areasToShow = [
                    'sewers',
                    'police',
                    'factory',
                    'church',
                    'university',
                    'subway',
                ];

                areasToShow = areasToShow.filter( area => !this.shared.data.ignoredAreas.includes( area ) );

                let stats = [];

                // add condemned stat
                if( this.condemned.includes( this.faction.name ) ){
                    stats.push({ name : "condemned", title : "condemned", description : "This faction has been condemned by the executioners"  });
                }

                // add card stats
                this.faction.cards.active.forEach( card => stats.push({ name : card.class, title : card.name, description : card.description } ));

                // add area stats
                areasToShow.forEach( area => {
                   if( this.shared.data.areas[area].owner === this.faction.name ){
                       stats.push({ name : area, title : area, description : this.shared.data.areas[area].control  });
                   }
                });

                return stats;
            }
        }
    }
</script>

<style>
    .player-hud__stats-row {
        color: var(--highlight-color);
        font-size: .8em;
        padding: .3em 0 0;
    }

    .player-hud__stats-row i {
        background-color: transparent;
        height: 1.2rem;
        width: 1.2em;
    }

    .icon-ap:before, .icon-pp:before {
        content: "";
        background-image: url(/images/icons/ap.png);
        background-size: contain;
        background-position: center;
        width: 1.3em;
        height: 1.3em;
        display: inline-block;
        background-repeat: no-repeat;
        position: relative;
        bottom: .1em;
    }
    .icon-pp:before {
        background-image: url(/images/icons/pp.png);
    }

    .faction-track__pip {
        font-size: .5em;
        display: block;
        padding: .3em;
        color: var(--primary-light-color);
    }

    .player-hud {
        margin: 0 .5em .35em;
        background-color: rgba(255, 131, 213, 0.11);
        box-shadow: 0px 0px 2px rgba(0,0,0,.5);
        padding: .5em;
        cursor: pointer;
        font-size: 1.15rem;
    }

    .player-hud__pip {
        display: inline-flex;
        padding: .15em;
        flex-grow: 1;
    }

    .player-hud__pip-content {
        display: flex;
        align-items: center;
        flex-grow: 1;
        justify-content: space-around;
        background-color: rgba(0,0,0,.5);
        padding: .1em .5em 0;
        border-radius: .25em;
        font-family: var(--primary-font);
        color: var(--off-white);
    }

    .chaos-track {
        background-color: rgba(0,0,0,.5);
        padding: 0 .5em;
        border-radius: 0 0 .25em .25em;
        font-family: var(--primary-font);
        color: var(--off-white);
        width: 100%;
    }

    .chaos-track__internal {
        margin-top: -.25em;
    }

    .player-hud__pip-content__item {
        display: flex;
        align-items: baseline;
    }

    .player-hud__pip-content span {
        font-size: 1.2em;
        padding: 0 .2em;
    }

    .pip-icon {
        color: var(--highlight-color);
        font-size: 1em;
    }

    .player-hud__name {
        font-family: var(--primary-font);
        font-size: 1.1em;
        line-height: 1.1;
    }

    .player-hud__faction {
        font-family: var(--primary-font);
        font-weight: 100;
        color: var(--primary-light-color);
    }

    .player-hud__scores span {
        font-family: var(--primary-font);
        min-width: 1.2em;
        text-align: center;
        color: var(--highlight-color);
    }

    .player-hud__champion{
        width: 30px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        position: relative;
        bottom: .15em;
        height: 30px;
    }

    .player-hud__champion-wrap {
        padding-right: .3em;
    }

    .player-hud__title {
        flex-basis: 0;
        flex-shrink: 1;
        overflow: hidden;
    }

    .player-hud__target {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }

    .player-hud__target {
        width: 100%;
        font-size: .9em;
        text-align: center;
        box-shadow: inset 0px 0px 20px rgba(0,0,0,.7);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: var(--primary-font);
        text-shadow: 0px 0px 8px black, 0 0 4px black, 0 0 2px black;
        height: 1.4rem;
        line-height: 1.2rem;
        border-radius: 3px;
    }

    .player-hud__target i {
        line-height: .8;
        margin-right: .2em;
        color: var(--highlight-color);
    }

    .player-hud__message {
        width: 100%;
        font-size: .8em;
        margin-bottom: .2em;
        background-color: rgba(0,0,0,.3);
    }

    .player-hud__darkenergy {
        margin-left: -.15em;
        margin-right: .15em;
    }

</style>

