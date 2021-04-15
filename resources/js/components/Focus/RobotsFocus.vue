<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        areas exterminated :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'exterminate-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Returns the count of areas we have exterminated
             * @returns {number}
             */
            focus(){
                return Object.values( this.shared.data.areas ).reduce( (count, area) => {
                    if( _.areaExterminated( area, this.shared.data.factions ) === this.faction.name ) count++;
                    return count;
                }, 0 );
            },
        }
    }
</script>
