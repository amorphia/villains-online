<template>
    <div class="plan-block">

        <div class="plan-block__container d-flex">
            <div class="plan-block__pips">
                <div v-for="test in plan.objectives" class="plan-block__pip highlight" :class="test.passed ? 'icon-circle' : 'icon-circle-open'"></div>
            </div>
            <div class='plan-block__image-wrap' @click="$emit('clicked')" :class="{ selected : plan.selected }">
                <img class="plan-block__image" :src="image">
            </div>
        </div>

        <div v-if="plan.points" class="center-text mt-2">
            <img class="target-block__ap-icon" :src="`/images/icons/pp-${plan.points}.png`">
        </div>
        <div v-else class="center-text primary-light  mt-2">Cannot Score</div>

    </div>
</template>


<script>
    export default {

        name: 'plan-block',
        props : ['plan','faction'],
        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            image(){
                return `/images/factions/${this.faction.name}/plans/${this.plan.plan.num}.jpg`;
            }
        }
    }
</script>


<style>
    .plan-block {
        font-size: 1.5rem;
    }

    .plan-block__pips {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-left: .25rem;
    }

    .plan-block__pip {
        font-size: 1rem;
        margin: .25rem 0;
    }

    .plan-block__image-wrap {
        width: 16vw;
        position: relative;
        overflow: hidden;
        padding: .25rem;
        margin: 0 .5rem;
        border-radius: 8%/6%;
    }

    .plan-block__image {
        z-index: 2;
        position: relative;
        border-radius: 8%/6%;
        margin-bottom: -.75rem;
    }

</style>

