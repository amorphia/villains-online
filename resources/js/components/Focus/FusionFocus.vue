<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        fusion :<span class="highlight ml-2 mr-4">{{ focus }}</span>
        card areas :<span class="highlight ml-2 mr-4">{{ areas }}</span>
        in hand :<span class="highlight ml-2">{{ faction.cards.hand.length }}</span>
    </div>
</template>


<script>
    export default {

        name: 'fusion-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            focus(){
                return this.faction.fusion;
            },

            areas(){
                let areas = [];
                this.faction.tokens.forEach( token => {
                    if( token.location
                        && token.revealed
                        && token.type === 'card'
                        && !areas.includes( token.location )
                    ) areas.push( token.location );
                });

                return areas.length;
            }
        }

    }
</script>


<style>

</style>

