<template>
    <div class="save-game pos-relative overflow-hidden" :class="{ disabled : !canLoad }"
         @click="$emit( 'open', index )">

        <div class="save-game__date">{{ save['created_at'] }}</div>

        <div class="save-game__players">
            <span class="save-game__player ellipses capitalize mr-2"
                 v-for="(player, index) in save.players"
                 :class="{ missing : !shared.lobbyPlayers[player.uuid]}">
                    {{ player.name }}
            </span>
        </div>

        <div class="save-game__saves" :class="{ open : open }" >
            <div v-if="save.manuals.length" class="save-game__type-block">
                <div class="save-game__type">manual save</div>
                <div v-for="item in save.manuals" class="save-game__save" @click="loadGame( item.id )">action {{ item.action }} - {{ item.active_player }}</div>
            </div>

            <div v-if="save.automatics.length" class="save-game__type-block">
                <div class="save-game__type">player actions</div>
                <div v-for="item in save.automatics" class="save-game__save" @click="loadGame( item.id )">action {{ item.action }} - {{ item.active_player }}</div>
            </div>

            <div v-if="save.turns.length" class="save-game__type-block">
                <div class="save-game__type">start of turn</div>
                <div v-for="item in save.turns" class="save-game__save" @click="loadGame( item.id )">turn {{ item.turn }} - {{ item.created_at }}</div>
            </div>

        </div>
    </div>
</template>


<script>
    export default {

        name: 'save-game',
        props : [ 'save', 'open', 'index' ],
        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            canLoad(){
                let canLoad = true;
                this.save.players.forEach( player => {
                    if( !this.shared.lobbyPlayers[player.uuid] ) canLoad = false;
                });
                return canLoad;
            },

        },
        methods : {
            loadGame( gameId ){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'loadGame', gameId );
            },
        }
    }
</script>


<style>
    .save-game {
        margin: 0 .5em .35em;
        background-color: rgba(255, 131, 213, 0.11);
        box-shadow: 0px 0px 2px rgba(0,0,0,.5);
        padding: .5em;
        font-family: var(--primary-font);
        font-size: 1.15rem;
    }

    .save-game__type {
        color: var(--primary-light-color);
        padding-left: .5em;
    }

    .save-game.disabled {
        opacity: .8;
        pointer-events: none;
    }

    .save-game__date {
        color: var(--primary-light-color);
        font-size: 1.25rem;
    }

    .save-game__players {
        max-width: 100%;
        display: flex;
        flex-wrap: wrap;
    }

    .save-game__player.missing {
        color: #d85082
    }

    .save-game__save {
        color: var(--highlight-color);
        cursor: pointer;
        opacity: .8;
        transition: all .2s;
    }

    .save-game__save:hover {
        opacity: 1;
    }

    .save-game__saves {
        transition: all .2s;
        max-height: 0;
        overflow: hidden;
    }

    .save-game__saves.open {
        max-height: 100vh;
    }
</style>

