<template>
    <transition name="fade">
        <div class="tooltip pos-absolute cursor-default" v-if="show" :class="computedClass" @click.stop="() => null">
            <i class="tooltip__close pointer pos-absolute icon-x w" @click.stop="show = false"></i>
            <div v-if="title" class="center-text uppercase secondary-font tooltip__title">
                {{ title }}
            </div>
            <div class="width-100 tooltip__content off-white accent-font">
                <slot></slot>
            </div>
        </div>
    </transition>
</template>


<script>

    export default {
        name: 'tool-tip',
        props : {
            direction : {
                type: String,
                default: "bottom"
            },
            title: {
                type: String,
            },
        },

        data() {
            return {
                shared : App.state,
                show: false,
            };
        },

        mounted(){
            App.event.on( 'closeTooltips', () =>{
                this.show = false;
            });
        },

        methods : {
            open(){
                App.event.emit('closeTooltips');
                this.show = true;
            },
        },

        computed: {
            computedClass(){
                return `tooltip--${this.direction}`;
            }
        }
    }
</script>


<style scoped>
    .tooltip {
        padding: 1rem;
        background-color: #0e0e0e;
        color: white;
        border-radius: .5rem;
        width: 15rem;
        z-index: 100000;
    }

    .tooltip::after {
        content: "";
        position: absolute;
        border-width: 10px;
        border-style: solid;
    }

    .tooltip--bottom {
        top: calc(100% + 5px);
        left: 50%;
        transform: translateX(-50%);
    }

    .tooltip--bottom::after {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-color: transparent transparent black transparent;
    }

    .tooltip--top {
        top: -5px;
        left: 50%;
        transform: translate(-50%, -100%);
    }

    .tooltip--top::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-color: black transparent transparent transparent;
    }

    .tooltip--right {
        left: calc(100% + 5px);
        top: 50%;
        transform: translate(0, -50%);
    }

    .tooltip--right::after {
        top: 50%;
        right: 100%;
        transform: translateY(-50%);
        border-color: transparent black transparent transparent;
    }

    .tooltip--right-top {
        left: calc(100% + 5px);
        bottom: 10px;
        transform: translate(0, 0);
    }

    .tooltip--right-top::after {
        bottom: 10px;
        right: 100%;
        transform: translateY(0%);
        border-color: transparent black transparent transparent;
    }

    .tooltip--left-top {
        right: calc(100% + 5px);
        bottom: 10px;
        transform: translate(0, 0);
    }

    .tooltip--left-top::after {
        bottom: 10px;
        left: 100%;
        transform: translateY(0%);
        border-color: transparent transparent transparent black;
    }

    .tooltip--bottom-right {
        top: calc(100% + 5px);
        left: 5px;
        transform: translateX(0%);
    }

    .tooltip--bottom-right::after {
        bottom: 100%;
        left: 15px;
        transform: translateX(0%);
        border-color: transparent transparent black transparent;
    }

    .tooltip--right-bottom {
        left: calc(100% + 5px);
        top: 10px;
        transform: translate(0, 0);
    }

    .tooltip--right-bottom::after {
        top: 10px;
        right: 100%;
        transform: translateY(0%);
        border-color: transparent black transparent transparent;
    }

    .tooltip--bottom-left {
        top: calc(100% + 5px);
        right: 5px;
        transform: translateX(0%);
    }

    .tooltip--bottom-left::after {
        bottom: 100%;
        right: 15px;
        transform: translateX(0%);
        border-color: transparent transparent black transparent;
    }

    .tooltip--left {
        left: 5px;
        top: 50%;
        transform: translate(-100%, -50%);
    }

    .tooltip--left::after {
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        border-color: transparent transparent transparent black;
    }

    .tooltip__close {
        top: 10px;
        right: 10px;
        font-size: .7rem;
        color: rgba(255,255,255,.6);
    }

    .tooltip__title {
        white-space: nowrap;
        font-size: .8rem;
        letter-spacing: 1px;
        margin-bottom: .3rem;
    }

    .tooltip__footnote {
        text-align: left;
        white-space: normal;
        font-size: 1rem;
    }

    .tooltip__content {
        white-space: normal;
        text-align: left;
        font-size: 1rem;
        display: grid;
        gap: .3rem;
    }
</style>

