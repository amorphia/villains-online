<template>
    <div class="player-hud flex-vertical pos-relative overflow-hidden" v-if="showControls">
        <div class="player-hud__message ellipses shrink-0 game-phase center-text highlight lowercase" @click="open = !open">{{ toggleText }}</div>
        <div v-if="open" class="">
            <div v-for="image in images" class="share-image-item" @click="shareImage(image.file)">{{ image.text }}</div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'share-image',
        data() {
            return {
                open: false,
                shared : App.state,
                images: [
                    { file: null, text: "CLEAR" },
                    { file: "/images/examples/victory-points.png", text: "VICTORY POINTS" },
                    { file: "/images/examples/icons.png", text: "ICONS" },
                    { file: "/images/examples/start-phase.png", text: "START PHASE" },
                    { file: "/images/examples/action-cards.png", text: "ACTION CARDS" },
                    { file: "/images/examples/plan-cards.png", text: "PLANS" },
                    { file: "/images/examples/ui-sidebar.png", text: "UI SIDEBAR" },
                    { file: "/images/examples/tokens.png", text: "TOKENS" },
                    { file: "/images/examples/units.png", text: "UNITS" },
                    { file: "/images/examples/unit-icons.png", text: "UNIT ICONS" },
                    { file: "/images/examples/captured-markers.png", text: "CAPTURED MARKERS" },
                ],
            };
        },

        methods: {
            shareImage( file ){
                this.shared.socketEmit( 'shareImage', { file } );
            },
        },

        computed: {
            showControls(){
                let player = this.shared.getPlayer();
                return this.shared.data.options?.playtestMode && player?.admin;
            },

            toggleText(){
                return this.open ? "CLOSE" : "OPEN";
            }
        }
    }
</script>

<style>
    .share-image-item {
        color: var(--off-white);
        font-size: .8rem;
    }
</style>

