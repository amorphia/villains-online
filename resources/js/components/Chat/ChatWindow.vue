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
                maxChatLength : 1000,
            };
        },

        created(){

        },

        mounted(){
            this.shared.socket.on( 'joinGame', this.loadCurrentChat );

            // handle incoming messages
            this.shared.socket.on( 'message', message => {
                this.shared.messages.unshift( message );

                this.handleLocalStorage();

                if( this.shared.messages.length > this.maxChatLength ){
                    this.shared.messages.pop();
                }
            });
                          
            this.shared.socket.on( 'joinedGame', () => {
                this.loadCurrentChat();
            });
        }, 

        methods: {
            handleLocalStorage(){
                if(!this.shared?.data?.id) return;

                const now = new Date();

                // save current messages by gameId
                localStorage.setItem(this.shared?.data?.id, JSON.stringify({
                    gameId:  this.shared.data.id,
                    chat: this.shared.messages,
                    expiration: now.getTime() + 800000000,
                }));
            },

            loadCurrentChat(){
                if(!this.shared?.data?.id) return;

                let currentChatString = localStorage.getItem(this.shared?.data?.id);
                if(!currentChatString) return;

                let currentChat = JSON.parse(currentChatString);
                this.shared.messages = currentChat.chat;
            },
        },
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

