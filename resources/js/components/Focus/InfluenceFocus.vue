<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        highest influence areas:<span class="ml-2"> <span class="highlight">{{ influences[0] }}</span> / <span class="highlight">{{ influences[1] }}</span> / <span class="highlight">{{ influences[2] }}</span></span>
    </div>
</template>


<script>
    export default {

        name: 'influence-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            influences(){
                let influences = [];
                Object.values( this.shared.data.areas ).forEach( area => {
                   influences.push( _.influence( this.faction, area, this.shared.data.factions ) );
                });

                influences.sort( (a, b) => b - a );
                return influences;
            },
        }
    }
</script>


<style>

</style>

