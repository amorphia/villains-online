<template>
    <div class="d-flex flex-wrap view-player__core-stats my-6">
        <!-- AP -->
        <div class="view-player__AP view-player__title width-50 d-flex align-center">
            <i class="icon-ap mr-3"></i>
            <span>{{ faction.ap }}</span>
            <span class="note">/ {{ shared.data.maxAP }}</span>
            <i v-if="shared.admin" :disabled="faction.ap === 0" @click="setPoints( 'ap', -1)" class="icon-minimize pr-2"></i>
            <i v-if="shared.admin" @click="setPoints( 'ap', 1)" class="icon-maximize pr-2"></i>
        </div>

        <!-- PP -->
        <div class="view-player__PP view-player__title width-50 d-flex align-center">
            <i class="icon-pp mr-3"></i>
            <span>{{ faction.pp }}</span>
            <span class="note">/ {{ shared.data.maxPP }}</span>
            <i v-if="shared.admin" :disabled="faction.pp === 0" @click="setPoints( 'pp', -1)" class="icon-minimize pr-2"></i>
            <i v-if="shared.admin" @click="setPoints( 'pp', 1)" class="icon-maximize pr-2"></i>
        </div>

        <!-- energy -->
        <div class="view-player__energy view-player__title width-50">Energy: <span>{{ faction.energy }}</span> <span class="note">/ {{ faction.maxEnergy }}</span>
            <i v-if="shared.admin" :disabled="faction.energy === 0" @click="setPoints( 'energy', -1)" class="icon-minimize pr-2"></i>
            <i v-if="shared.admin" @click="setPoints( 'energy', 1)" class="icon-maximize pr-2"></i>
        </div>

        <!-- resources -->
        <div class="view-player__resources view-player__title width-50">Resources: <span>{{ faction.resources }}</span>
            <i v-if="shared.admin" :disabled="faction.resources === 0" @click="setPoints( 'resources', -1)" class="icon-minimize pr-2"></i>
            <i v-if="shared.admin" @click="setPoints( 'resources', 1)" class="icon-maximize pr-2"></i>
        </div>

        <!-- upgrade number -->
        <div class="view-player__resources view-player__title width-50"> Upgrade: <span>{{ faction.upgrade ? faction.upgrade : 'none' }}</span></div>

        <!-- cards in hand -->
        <div class="view-player__hand view-player__title width-50">Cards in hand: <span>{{ faction.cards.hand.length }}</span> <span class="note">/ +{{ faction.cardDraw }}</span> <i v-if="shared.admin" @click="drawCard()" class="icon-maximize pr-2"></i></div>

        <!-- Deploy limit -->
        <div class="view-player__deploy view-player__title width-50">Deploy Limit: <span>{{ faction.deployLimit }}</span></div>

        <!-- Defense Bonus -->
        <div class="view-player__defense-bonus view-player__title width-50">Defense Bonus: <span>+{{ defenseBonus }}</span></div>

        <!-- Attack Bonus -->
        <div class="view-player__attack-bonus view-player__title width-50">Attack Bonus: <span>+{{ faction.attackBonus }}</span></div>

        <!-- Bonus Dice -->
        <div class="view-player__bonus-dice view-player__title width-50">Bonus Attack Dice: <span>+{{ faction.bonusDice }}</span></div>

        <!-- tokens in areas -->
        <div class="view-player__bonus-dice view-player__title width-50">Areas with tokens: <span>{{ tokensAreasRevealed }} ({{ tokensAreas }})</span></div>


        <!-- Skills used -->
        <div class="view-player__bonus-dice view-player__title width-50">Skills Activated: <span>{{ faction.usedSkills.length }}</span></div>

        <!-- Killed Count -->
        <div class="view-player__bonus-dice view-player__title width-50">Kills: <span>{{ kills }}</span></div>

        <!-- units in play -->
        <div class="view-player__bonus-dice view-player__title width-50">Units in play: <span>{{ unitsInPlay }}</span></div>

        <!-- Lost Count -->
        <div class="view-player__bonus-dice view-player__title width-50">Units Lost: <span>{{ losses }}</span></div>


        <!-- Captured Markers -->
        <div class="view-player__captured view-player__title width-50">Captured Markers: <span>{{ faction.captured.current }} / {{ faction.captured.max }}</span></div>
    </div>

</template>


<script>
    export default {

        name: 'player-stats',
        props : [ 'faction' ],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Calculate our defense bonus
             * @returns {number}
             */
            defenseBonus(){
                let bonus = this.faction.defenseBonus;
                if( this.faction.factionDefenseBonus ) bonus += this.faction.factionDefenseBonus;
                return bonus;
            },

            kills(){
                let kills = _.factionKills( this.faction, this.shared.data.factions ) ?? [];
                return kills.length;
            },

            losses(){
                let losses = this.faction.units.filter( unit => _.unitInGraveyard( unit ) );
                return losses.length;
            },

            unitsInPlay(){
                let units = this.faction.units.filter( unit => _.unitInPlay( unit ) );
                return units.length;
            },

            tokensAreas(){
                return _.areasWithTokensCount( this.faction, this.shared.data.areas );
            },

            tokensAreasRevealed(){
                return _.areasWithTokensCount( this.faction, this.shared.data.areas, { revealed: true } );
            },
        },

        methods : {
            /**
             * Adjust a player's AP, PP, Energy, or Resources
             * @param type // which resource should we adjust
             * @param val // by how much?
             */
            setPoints( type, val = 1 ) {
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'setPoints', {
                    faction: this.faction.name,
                    type: type,
                    val: val
                });
            },

            drawCard() {
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'manualCardDraw', {
                    faction: this.faction.name,
                });
            },
        }
    }
</script>


<style>

</style>

