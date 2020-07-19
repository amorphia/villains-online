<template>
    <div class="main-content height-100 drawer__main pos-relative d-flex flex-column align-stretch" :class="classes">
        <game-display></game-display>
        <game-controls></game-controls>
    </div>
</template>


<script>

    export default {
        name: 'game-core',
        props : ['classes'],
        data() {
            return {
                shared : App.state,
            };
        },
        created(){
            this.shared.player = this.shared.getPlayer();
            this.shared.faction = this.shared.getFaction();
        },
        watch : {
            'shared.player.active' : {
                handler(newValue, oldValue) {
                    if( newValue === true && oldValue !== true ){
                        App.event.emit( 'sound', 'active' );
                    }
                }
            },
        },
        methods : {

        }
    }
</script>


<style>

</style>

