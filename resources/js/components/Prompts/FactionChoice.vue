<template>
    <div
        v-if="isValidOption"
        :class="classes"
         @click="$emit( 'clicked', faction.name )"
         class="choose-factions__faction pointer d-flex justify-end align-center">

        <!-- faction name / status -->
        {{ faction.name }}<span class="choose-factions__status pl-3" :class="`choose-factions__status-${faction.status}`"></span>

        <!-- faction selected icon -->
        <span class="choose-factions__circle pl-1" :class="faction.name === selected ? 'icon-circle' : 'icon-circle-open'"></span>

        <!-- block faction -->
        <span v-if="shared.isActive()" class="icon-x pl-1 choose-factions__block" :class="{active : faction.blocked}" @click.stop="$emit( 'blocked', faction.name )"></span>
    </div>
</template>


<script>
    export default {

        name: 'faction-choice',
        props: [
            'faction',
            'selected',
            'selectable',
            "remainingPlayers",
            "killersSelected",
            "expansionsSelected",
            "factionOptions",
        ],

        data() {
            return {
                shared : App.state
            };
        },

        mounted(){
            // if this is an anarchy game, eeeeerrrrrrything starts selectable even experimental factions
            if( this.shared.data && this.shared.data.gameType === 'anarchy' ){
                this.faction.selectable = true;
                this.$emit( 'isSelectable', true );
            }

            if( this.shared.data && this.shared.data.gameType === 'secret' ){
                this.faction.selectable = this.isValidOption;
                this.$emit( 'isSelectable', this.isValidOption );
            }
        },

        methods : {
            checkIsSelectable(){
                // if the faction is already taken, then it can't be taken
                if( this.faction.owner !== null ) return false;

                // if we've blocked this faction, them don't let it be selected
                if( this.faction.blocked ) return false;

                // otherwise if we are in free for all mode then anything goes
                if( this.shared.data && this.shared.data.gameType === 'anarchy' ) return true;

                // if a scret game and we have a valid selection
                if( this.shared.data && this.shared.data.gameType === 'secret' && this.isValidOption ) return true;

                // if the faction is defined as unselectable (and its not anarchy mode) return false
                if( !this.faction.selectable ) return false;

                // but if we are in basic mode everything goes as long as they are basic factions
                if( this.shared.data && this.shared.data.gameType === 'basic' && !this.faction.basic ) return false;

                // if we are in optimized mode and already have max killer factions allow only non-killers
                if( this.shared.data
                    && !this.moreKillersAllowed
                    && this.faction.killer) return false;

                // if we are in optimized mode and already have max expansion factions allow only non-basics
                if( this.shared.data && this.shared.data.gameType === 'optimized'
                    && !this.moreExpansionsAllowed
                    && !this.faction.basic) return false;

                // force the last player to pick a killer faction if one hasn't been picked yet (in optimized)
                if( this.shared.data
                    && this.remainingPlayers === 1
                    && !this.killersSelected
                    && !this.faction.killer) return false;

                return true;
            }
        },

        computed : {
            isValidOption(){
                if(!this.shared.data || this.shared.data.gameType !== 'secret' ) return true;
                return this.factionOptions.includes(this.faction.name);
            },

            /**
             * Return the computed classes for this faction
             * @returns {object}
             */
            classes(){
                return {
                    active : this.selected === this.faction.name,
                    taken : !this.isSelectable,
                    killer : this.faction.killer,
                    basic : this.faction.basic
                }
            },


            /**
             * Can we select more killer factions?
             * @returns {boolean}
             */
            moreKillersAllowed(){
                //let allowed = this.playerCount === 5 ? 2 : 1;
                return this.killersSelected < 1;
            },


            /**
             * Are more expansion factions allowed?
             * @returns {boolean}
             */
            moreExpansionsAllowed(){
                let allowed = this.playerCount === 5 ? 4 : 3;
                return this.expansionsSelected < allowed;
            },


            /**
             * Returns the current player count
             * @returns {number}
             */
            playerCount(){
                if( !this.shared.data ) return 0;
                return Object.keys( this.shared.data.players ).length;
            },


            /**
             * Is the faction selectable?
             * @returns {boolean}
             */
            isSelectable(){
                let selectable = this.checkIsSelectable();
                this.$emit( 'isSelectable', selectable );
                return selectable;
            }
        }
    }
</script>


<style>

    .choose-factions__block {
        font-size: .5em;
        color: var(--off-white);
    }

    .choose-factions__block.active {
        color: var(--faction-commies);
    }

</style>

