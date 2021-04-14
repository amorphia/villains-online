<template>
    <transition name="fade">
        <div v-if="shared.card" class="player-prompt view-card z-8">
            <!-- close button -->
            <button @click="shared.card = null" class="toggle minimize-toggle top right"><i class="icon-x"></i></button>

            <!-- card image -->
            <div class="player-prompt__slot-container">
                <img class="view-card__card" :src="shared.card">
            </div>
        </div>
    </transition>
</template>


<script>
    export default {

        name: 'view-card',

        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>
.view-card__card{
    margin: 0 3rem;
    border-radius: 9%/7%;
    box-shadow: 0 0 0.5rem 0.2rem rgba(0,0,0,.5);
    width: 22rem;
}
</style>

