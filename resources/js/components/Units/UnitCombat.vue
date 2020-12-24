<template>
    <div v-if="!hide" class="p-2 pos-relative">
        <unit-icon :unit="unit" :classes="classes"></unit-icon>
    </div>
</template>


<script>
    export default {

        name: 'unit-combat',
        props: ['unit'],
        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            classes(){
                let classes = [];

                if( ! this.unit.needsToAttack ) classes.push( 'saturate-4 opacity-7' );
                if( this.shared.data.combat && this.shared.data.combat.currentUnit && this.unit.id === this.shared.data.combat.currentUnit ) classes.push( 'selected' );

                return classes.join(' ');
            },

            hide(){
                return !this.unit.needsToAttack && this.unit.killed;
            }
        },

    }

</script>


<style>
    .unit-killed {
        border-radius: .2em;
        font-size: 1.2em;
        color: #ff0f0f;
        background-color: #610202;
        height: 2rem;
        display: flex;
        width: 2rem;
        align-items: center;
        justify-content: center;
        left: 50%;
        transform: translate(-23%, -5%);
        border: 4px solid rgba(0,0,0,.4);
        z-index: 2;
    }
</style>

