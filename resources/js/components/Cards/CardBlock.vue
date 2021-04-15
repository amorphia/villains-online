<template>
    <div class="card-block">
        <div class="card-block__container d-flex">
            <!-- card image -->
            <div class='card-block__image-wrap' @click="$emit('clicked', card )" :class="{ selected : card.selected }">
                <img class="card-block__image" :src="image">
            </div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'card-block',
        props : ['card'],
        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Returns our card image url
             * @returns {string}
             */
            image(){
                return `/images/cards/${this.card.file}.jpg`;
            }
        }
    }
</script>


<style>
    .card-block {
        font-size: 1.5rem;
    }

    .card-block__image-wrap {
        width: 16vw;
        position: relative;
        overflow: hidden;
        padding: .25rem;
        margin: 0 .5rem;
        border-radius: 8%/6%;
    }

    .card-block__image {
        z-index: 2;
        position: relative;
        border-radius: 8%/6%;
        margin-bottom: -.75rem;
    }

</style>

