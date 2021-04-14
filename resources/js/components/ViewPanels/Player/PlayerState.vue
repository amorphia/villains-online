<template>
    <div>
        <!-- target -->
        <div v-if="target">
            <div class="view-player__title">Current Target:</div>
            <div class="view-player__active-cards">
                <img class="view-player__card pointer"
                     @click="shared.card = `/images/cards/${target.file}.jpg`"
                     :src="`/images/cards/${target.file}.jpg`">
            </div>
        </div>

        <!-- active cards -->
        <div class="view-player__title">Active Cards:</div>
        <div v-if="faction.cards.active.length" class="view-player__active-cards">
            <img v-for="card in faction.cards.active" class="view-player__card pointer"
                 @click="shared.card = `/images/cards/${card.file}.jpg`"
                 :src="`/images/cards/${card.file}.jpg`">
        </div>
        <div v-else class="view-player__empty">No Active Cards</div>

        <!-- areas controlled -->
        <div class="view-player__title">Areas Controlled:</div>
        <div v-if="areas.length" class="view-player__areas">
            <div v-for="area in areas" class="view-player__areas">
                <div class="view-player__areas-name">{{ area.name }}</div>
                <div class="view-player__areas-control">{{ area.control }}</div>
            </div>
        </div>
        <div v-else class="view-player__empty">No Areas Controlled</div>

        <!-- unrevealed tokens -->
        <div class="view-player__title">Unrevealed Tokens:</div>
        <div v-if="unrevealedTokens" class="view-player__tokens d-flex justify-center">
            <div v-for="(count, type) in unrevealedTokens"
                 class="view-player__token-wrap p-2 ratio-square pos-relative">
                <div class="width-100 pos-relative height-100">
                    <div class="view-player__token" :data-count="count" >
                        <img class="view-player__token"
                             :src="`/images/factions/${faction.name}/tokens/${type}.png`">
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="view-player__empty">No Unrevealed Tokens</div>

        <!-- upgrade -->
        <div class="view-player__title">Current Upgrade:</div>
        <div v-if="faction.upgrade" class="view-player__areas">
            <div class="view-player__upgrade-card p-3 center-text">
                <img class="view-player__upgrade-card-image width-80" :src="`/images/factions/${faction.name}/upgrade-${faction.upgrade}.jpg`">
            </div>
        </div>
        <div v-else class="view-player__empty">No Upgrade</div>

        <!-- skills -->
        <div class="view-player__title">Areas Skills Used:</div>
        <div v-if="faction.usedSkills.length" class="view-player__areas">
            <div v-for="area in faction.usedSkills" class="view-player__areas">
                <div class="view-player__areas-name">{{ area }}</div>
            </div>
        </div>
        <div v-else class="view-player__empty">No Skills Used</div>

        <!-- capitol tokens -->
        <div class="view-player__title">Capitol Tokens:</div>
        <div v-if="faction.capitolTokens.length" class="view-player__capitol-tokens d-flex justify-center">
            <div v-for="token in faction.capitolTokens" class="view-player__capitol-token center-text p-3">
                <img class="view-player__capitol-token__image"
                     :src="`/images/tokens/capitol-${token.turn}.png`">
                <div class="view-player__capitol-token__value">{{ token.ap }} AP</div>
            </div>
        </div>
        <div v-else class="view-player__empty">No Capitol Tokens</div>

        <!-- killed units -->
        <div class="view-player__title">Killed Units:</div>
        <div v-if="killedUnits" class="d-flex justify-center p-4">
            <unit-set v-for="(units, area) in killedUnits"
                      :units="units"
                      :key="area"
                      :title="area" classes="border"></unit-set>
        </div>
        <div v-else class="view-player__empty">No Killed Units</div>
    </div>
</template>


<script>
    export default {

        name: 'player-state',
        props : ['faction'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Return a tally of this faction's dead units, grouped by area
             * @returns {object} // { areaName: Unit[], etc... }
             */
            killedUnits(){
                let killedUnits = this.faction.units.filter( unit => unit.killed );
                if( !killedUnits.length ) return;
                return _.groupBy( killedUnits, 'location' );
            },


            /**
             * Returns this faction's target card, if legal to view
             * @returns {object|null}
             */
            target(){
                if( !this.faction.cards.target || !this.shared.canSeeTarget( this.faction ) ) return;
                return this.faction.cards.target[0];
            },


            /**
             * Returns an array of area objects for each area this faction controls
             * @returns {object[]}
             */
            areas(){
                let areaNames = _.factionAreas( this.faction, this.shared.data.areas );
                let areas = [];
                areaNames.forEach( area => areas.push( this.shared.data.areas[area] ));
                return areas;
            },


            /**
             * Returns a tally of this faction's tokens that haven't been revealed yet
             * @returns {*}
             */
            unrevealedTokens(){
                let tokens = this.faction.tokens.filter( token => !token.revealed );
                return this.shared.groupByCount( tokens, 'name' );
            },
        },
    }
</script>

