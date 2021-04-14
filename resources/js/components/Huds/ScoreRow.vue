<template>
    <div class="score-hud__row d-flex" :class="`score-hud__${type}`">
        <div v-for="score in scores" class="score-hud__cell">
            <img v-for="faction in score" class="score-hud__faction" :src="shared.factionIcon( faction )">
        </div>
    </div>
</template>


<script>
    export default {

        name: 'score-row',
        props:['scores', 'type'],
        data() {
            return {
                shared : App.state
            };
        },
    }
</script>


<style>

    .score-hud__row {
        position: absolute;
        width: 89%;
        left: 9%;

    }

    .score-hud__ap {
        top: 23%;
        transform: translateY(-50%);
    }

    .score-hud__pp {
        bottom: 26%;
        transform: translateY(50%);
    }

    .score-hud__cell {
        width: 5.88%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .score-hud__faction {
        width: 40%;
        margin: .1em;
        border: 1px solid black;
        box-shadow: 0 0 4px black;
    }
</style>

