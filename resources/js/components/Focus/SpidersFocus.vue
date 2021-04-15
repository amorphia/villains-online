<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        faction webbed:
        <span class="ml-2 mr-4 pl-2">
            <span v-for="(count, faction) in focus.factions"
                  class="mx-1"
                  :class="`faction-${faction}`"
                  :title="`The ${faction} have ${count} units trapped in webs`">
                {{ count }}
            </span>
        </span>
        total :<span class="highlight ml-2">{{ focus.total }}</span>
    </div>
</template>


<script>
    export default {

        name: 'spider-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.webbedTotals( this.faction, this.shared.data.factions );
            },
        }
    }
</script>

