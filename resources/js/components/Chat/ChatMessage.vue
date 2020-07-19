<template>
    <div class="chat__message">
        <span v-if="message.player && message.player.data" class="name">{{ message.player.data.name | startCase }}:</span>
        <span v-else-if="message.faction" :class="`faction-${message.faction}`">The {{ message.faction | startCase }}:</span>
        <span v-if="message.message" :class="message.class || 'info'" v-html="filteredText"></span>
        <component v-if="message.type" :is="`${message.type}-message`" :message="message"></component>
    </div>
</template>


<script>
    export default {

        name: 'chat-message',
        props : ['message'],

        data() {
            return {
                shared : App.state
            };
        },

        computed: {
            filteredText(){
                return this.shared.filterText( this.message.message );
            }
        }
    }
</script>


<style>

    .chat__message {
        padding: .5em 0;
        color: var(--primary-light-color);
        font-family: var(--secondary-font);
    }

    .chat__message .name {
    }

    .chat__message .info {
        color: white;
        text-transform: capitalize;
    }

    .chat__message .warning {
        color: #fd4a4a;
        text-transform: capitalize;
    }

    .message-box {
        width: 100%;
        overflow: hidden;
        padding: 1rem .5rem;
        justify-content: center;
        align-items: center;
        background-color: rgba(0,0,0,.5);
        display: flex;
        flex-direction: column;
        border-radius: .5rem;
        margin-top: .5rem;
    }
</style>

