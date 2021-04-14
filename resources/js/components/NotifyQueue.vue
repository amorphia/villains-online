<template>
    <!-- notifiaction queue wrapper -->
    <div class="notify-queue overflow-hidden">
        <transition-group name="slide" tag="ul">

            <!-- notification items -->
            <li class="notify-item"
                 v-for="note in queue"
                 v-text="note.message"
                :key="note.id"
                :class="note.class"
                 @click="removeNote( note )"
            ></li>
        </transition-group>
    </div>
</template>


<script>
    export default {

        name: 'notify-queue',

        data() {
            return {
                shared : App.state,
                queue : []
            };
        },

        methods : {

            /**
             * Create a new notification
             *
             * @param {object} note
             */
            createNote( note ){

                // generate an id from a timestamp
                note.id = new Date().getTime();

                // errors stick around and look scary
                if( note.error ){
                    note.class = "error";
                    note.persist = true;
                }

                // add new note to front of queue
                this.queue.unshift( note );

                // if we don't tell this note to persist then remove it after 5 seconds
                if( ! note.persist ) setTimeout( () => this.removeNote( note ), 5000 );
            },


            /**
             * Remove a given note from the queue
             *
             * @param {object} note
             */
            removeNote( note ){
                this.queue = this.queue.filter( item => item.id !== note.id );
            }

        },

        created() {
            // set even listener
            App.event.on( 'notify', this.createNote );
        }

    }
</script>


<style>
    .notify-queue {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        width: 15vw;
        text-align: center;
        z-index: 10001;
    }

    .notify-item {
        background-color: #3fb13f;
        padding: 1rem;
        color: white;
        width: 100%;
        font-family: 'open sans', sans-serif;
        letter-spacing: 1px;
        border-radius: 3px;
        margin-top: .5rem;
    }

    .notify-item.error {
        background-color: #c40c0c;
    }

</style>

