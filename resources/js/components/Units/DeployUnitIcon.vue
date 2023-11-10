<template>
    <img
        class="unit-hud__unit-image"
        @click="$emit('clicked')"
        :src="sourceImage"
    >
</template>


<script>
    export default {

        name: 'deploy-unit-icon',
        props : [
            'unit',
        ],

        data() {
            return {
                shared : App.state
            };
        },

        methods: {

        },

        computed : {
            sourceImage(){
                let unit = this.unit;
                let url = `/images/factions/${unit.faction}/units/${unit.type}`;

                if(unit.canDeployFlipped){
                    url += unit.deployFlipped ? '-flipped' : '';
                } else {
                    url += unit.flipped ? '-flipped' : '';
                }

                return url + '.png';
            },
        }
    }
</script>


<style>
</style>

