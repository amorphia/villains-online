<template>
    <player-prompt :forceOpen="open" :forceOnly="true" classes="">
        <div class="p-4 image-container flex-center">
            <img class="shared-image" :src="file" />
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'view-shared-image',
        data() {
            return {
                shared : App.state,
            };
        },

        methods : {
        },

        computed : {
            open(){
                return !!this.shared?.sharedImage;
            },
            file(){
                return this.shared?.sharedImage;
            },
        },
    }
</script>


<style scoped>
    .image-container {
        width: 70vw;
        height: 75vh;
    }

    .shared-image {
        object-fit: contain;
    }
</style>

