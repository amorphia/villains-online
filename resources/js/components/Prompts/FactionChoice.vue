<template>
    <div :class="{
            active : selected === faction.name,
            taken : !isSelectable,
            killer : faction.killer,
            basic : faction.basic
            }"
         @click="$emit( 'clicked', faction.name )"
         class="choose-factions__faction pointer d-flex justify-end align-center">
        {{ faction.name }}<span class="choose-factions__status pl-3" :class="`choose-factions__status-${faction.status}`"></span>
        <span class="choose-factions__circle pl-1" :class="faction.name === selected ? 'icon-circle' : 'icon-circle-open'"></span>
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
        ],

        data() {
            return {
                shared : App.state
            };
        },

        mounted(){
            if( this.shared.data && this.shared.data.gameType === 'anarchy' ){
                this.faction.selectable = true;
                this.$emit( 'isSelectable', true );
            }
        },

        methods : {
            checkIsSelectable(){
                // if the faction is already taken, or flagged unselectable, then it can't be taken
                if( this.faction.owner !== null || ( this.faction.selectable === false && this.shared.data.gameType !== 'anarchy' ) ) return false;

                // otherwise if we are in free for all mode then anything goes
                if( this.shared.data && this.shared.data.gameType === 'anarchy' ) return true;

                // but if we are in basic mode everything goes as long as they are basic factions
                if( this.shared.data && this.shared.data.gameType === 'basic' ) return this.faction.basic;

                // if we are in optimized mode and already have max killer factions allow only non-killers
                if( this.shared.data && this.shared.data.gameType === 'optimized'
                    && !this.moreKillersAllowed
                    && this.faction.killer) return false;

                // if we are in optimized mode and already have max expansion factions allow only non-basics
                if( this.shared.data && this.shared.data.gameType === 'optimized'
                    && !this.moreExpansionsAllowed
                    && !this.faction.basic) return false;

                if( this.shared.data && this.shared.data.gameType === 'optimized'
                    && this.remainingPlayers === 1
                    && !this.killersSelected
                    && !this.faction.killer) return false;

                return true;
            }
        },

        computed : {
            moreKillersAllowed(){
                let allowed = this.playerCount === 5 ? 2 : 1;
                return this.killersSelected < allowed;
            },

            moreExpansionsAllowed(){
                let allowed = this.playerCount === 5 ? 3 : 2;
                return this.expansionsSelected < allowed;
            },

            playerCount(){
                if( !this.shared.data ) return 0;
                return Object.keys( this.shared.data.players ).length;
            },

            isSelectable(){
                let selectable = this.checkIsSelectable();
                this.$emit( 'isSelectable', selectable );
                return selectable;
            }
        }
    }
</script>


<style>

</style>

