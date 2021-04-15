<template>
    <div class="chat d-flex pos-relative drawer__aside">
        <!-- handle -->
        <adjust-handle direction="left" max="600" min="100"></adjust-handle>

        <!-- messages -->
        <div class="chat__window p-4 height-100">
            <chat-message v-for="message in shared.messages" :key="message.timestamp" :message="message"></chat-message>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'chat-window',

        data() {
            return {
                shared : App.state,
            };
        },

        mounted(){
            // handle incoming messages
            this.shared.socket.on( 'message', message => {
                this.shared.messages.unshift( message );
                if( this.shared.messages.length > 50 ){
                    this.shared.messages.pop();
                }
            });
        }
    }
</script>

<style>
.chat {
    width: 12rem;
    user-select: none;
}

.chat__window {
    width: 100%;
    background-image: url('/images/background-blurred.jpg');
    background-size: auto 100%;
    background-position: right;
    box-shadow: 0px 0px 6px rgba(0,0,0,.5);
    overflow: auto;
}
</style>

