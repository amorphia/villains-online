<template>
    <div class="card-picker">

        <div v-if="cards.length" class="d-flex align-center justify-center">
            <button v-if="cards.length > 1" class="toggle" @click="prev"><i class="icon-left"></i></button>

            <div class="card-picker__main">
                <div v-if="title" class="title view-player__title">{{ title }}</div>
                <transition-group
                    class='card-picker__card-wrap'
                    tag="div"
                    :name="transition">
                    <div
                        v-if="index == n"
                        v-for="(card, n) in cards"
                        class='card-picker__card'
                        :key="card.id" :style="source( card )">
                    </div>
                </transition-group>
                <div class="card-picker__pips d-flex justify-center flex-wrap mt-3">
                    <i v-for="(card, n) in cards"
                       class="card-picker__pip"
                        :class="n === index ? 'icon-circle active' : 'icon-circle-open'"></i>
                </div>
            </div>
            <button v-if="cards.length > 1" class="toggle" @click="next"><i class="icon-right"></i></button>
        </div>
        <div v-else class="view-player__empty">
            Nothing to choose from
        </div>
    </div>
</template>


<script>
    export default {

        name: 'card-picker',
        props : ['cards', 'type', 'faction', 'title'],

        data() {
            return {
                shared : App.state,
                index : 0,
                transition : null
            };
        },

        computed : {

        },

        methods : {
            source( card ){
                switch( this.type ){
                    case 'card':
                        return `background-image : url('/images/cards/${card.file}.jpg')`;
                        break;
                    case 'plan':
                        return `background-image : url('/images/factions/${this.faction}/plans/${card.num}.jpg')`;
                        break;
                }
            },
            next () {
                this.transition = 'slide-left';
                this.index++;
                if( this.index > this.cards.length - 1 ){
                    this.index = 0;
                }
                this.$emit( 'updated', this.index );
            },
            prev () {
                this.transition = 'slide-right';
                this.index--;
                if( this.index < 0 ){
                    this.index = this.cards.length - 1;
                }
                this.$emit( 'updated', this.index );
            }
        }
    }
</script>


<style>

    .card-picker__main{
        width: 16vw;
    }

    .card-picker__pip {
        font-size: .8em;
        display: block;
        padding: .3em;
        color: var(--primary-light-color);
    }

    .card-picker__pip.active {
        color: var(--highlight-color);
    }

    .card-picker {

    }

    .card-picker__card-wrap {
        width: 16vw;
        height: 23vw;
        position: relative;
        overflow: hidden;
        /* padding: 2px; */
        border-radius: 2.5rem;
    }

    .card-picker__card {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 2.5rem;
        box-shadow: 0 0 4px rgba(0,0,0,.3);
    }

    .card-picker .toggle {
        position: relative;
    }

</style>

