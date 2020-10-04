<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title mb-4">{{ message }}</div>

                <area-flipper :areas="[area]" index="0" classes="">
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <div v-if="data.fusion" class="toggle area-map__toggle top-0 left-0">Fusion Count {{ shared.faction.fusion }}</div>


                    <card-picker
                        :cards="cards"
                        type="card"
                        @updated="n => index = n"></card-picker>
                </area-flipper>

                <div v-if="selected.name" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to play this card?` )"></div>

                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">{{ declineMessage }}</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="canSave !== true">{{ saveMessage }}</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-card',

        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        watch : {
            cards(){
                this.index = 0;
            }
        },

        methods : {

            resolve( option ) {
                let data = {};

                if (!option) {
                    data.decline = true;
                } else {
                    data.areaName = this.area.name;
                    data.cardId = this.selected.id;
                    data.cost = this.cost;
                }

                this.shared.respond('choose-card', data);
            },

        },

        computed : {

            declineMessage(){
                return this.data.declineMessage ? this.data.declineMessage : 'decline';
            },

            saveMessage(){
                return this.data.saveMessage ? this.data.saveMessage : 'choose a card';
            },

            message(){
                return this.data.message ? this.data.message : `Play a card in the ${this.area.name}`;
            },

            selected(){
                if( !this.cards.length ) return {};
                return this.cards[this.index];
            },

            cards(){
                if( this.data.cards.length ) return this.data.cards;
                return this.shared.faction.cards.hand;
            },

            canSave(){
                return this.selected.name && _.money( this.shared.faction, true ) >= this.cost;
            },

            cost(){
                return this.data.free ? 0 : this.selected.cost;
            },

            data(){
                return this.shared.player.prompt.data;
            },

            area(){
                return this.shared.data.areas[ this.data.area ];
            }

        }

    }
</script>


<style>

</style>

