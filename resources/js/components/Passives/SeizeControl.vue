<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center pb-5">
                <!-- title -->
                <div class="title mb-4">{{ data.message }}</div>

                <!-- units -->
                <div class="py-3">
                    <area-flipper :areas="[shared.data.areas[data.area]]" locked="true" index="0" classes="area-header__units">
                    </area-flipper>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'seize-control',
        data() {
            return {
                shared : App.state,
            };
        },

        computed : {

            /**
             * Return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        }
    }
</script>

