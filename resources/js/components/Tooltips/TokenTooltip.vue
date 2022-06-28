<template>
    <tool-tip v-if="token" :title="title" :direction="direction" ref="tooltip">
        <template v-if="canSeeToken || token.revealed">
            <div class="center-text" :class="`faction-${token.faction}`">({{ token.faction }})</div>
            <div>
                {{ token.description }}
            </div>

            <div v-if="token.resource" class="highlight">
                <em>Refunded</em>: <span v-html="shared.filterText('this token grants its owner one xRx when revealed')"></span>
            </div>

            <div v-if="token.cost" class="highlight" v-html="shared.filterText(`This token costs xC${token.cost}x to activate`)"></div>
        </template>
        <template v-else>
            <div class="center-text" :class="`faction-${token.faction}`">({{ token.faction }})</div>
            An unrevealed token belonging to the {{ token.faction | startCase }}
        </template>
    </tool-tip>
</template>

<script>
    export default {
        props : {
            direction : {
                type: String,
                default: "bottom"
            },
            token: {
                type: Object,
            },
            canSeeToken: {
                type: Boolean,
                default: true,
            }
        },

        data() {
            return {
                shared : App.state,
                show: false,
            };
        },
        mounted(){

        },

        methods : {
            open(){
                this.$refs.tooltip.open();
            }
        },

        computed: {
            title(){
                if(!this.canSeeToken && !this.token.revealed) return "unrevealed token"

                let title = _.startCase(this.token?.name);
                if(!this.token?.revealed) title += " (unrevealed)";

                return title;
            }
        }
    }
</script>


<style scoped>

</style>

