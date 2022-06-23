<template>
    <div class="tooltip pos-absolute" v-if="show" :class="computedClass">
        <i class="tooltip__close pointer pos-absolute icon-x w" @click="show = false"></i>
        <div v-if="title" class="center-text uppercase secondary-font tooltip__title">{{ title }}</div>
        <div class="width-100">
            <div v-if="content" class="accent-font off-white tooltip__content">{{ content }}</div>
            <div v-if="footnote" class="accent-font tooltip__footnote highlight">{{ footnote }}</div>
        </div>
    </div>
</template>


<script>

    export default {
        props : {
            direction : {
                type: String,
                default: "bottom"
            },
            title: {
                type: String,
            },
            content : {
                type: String,
            },
            id : {
                default: null,
            },
            footnote: {
                type: String,
            }
        },

        data() {
            return {
                show: false,
            };
        },
        mounted(){
            console.log("tooltip mounted");
            App.event.on( 'tooltip', id =>{
                console.log('tooltip event received');
                this.close(id);
            });
        },

        methods : {
            open(){
                this.show = true;
                App.event.emit('tooltip', this.id );
            },

            close(id){
                console.log("detected tooltip close", id, this.id);

                if(this.id && id === this.id) return;

                this.show = false;
            }
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
        padding: 1em;
        background-color: #0e0e0e;
        color: white;
        border-radius: .5rem;
        width: 15rem;
        z-index: 100;
    }

    .tooltip--bottom {
        top: calc(100% + 5px);
        left: 50%;
        transform: translateX(-50%);
    }

    .tooltip--top {
        top: -5px;
        left: 50%;
        transform: translate(-50%, -100%);
    }

    .tooltip--right {

    }

    .tooltip--left {

    }

    .tooltip__close {
        top: 5px;
        right: 5px;
        font-size: .7rem;
        color: rgba(255,255,255,.6);
    }

    .tooltip__title {
        white-space: nowrap;
        font-size: .8rem;
        letter-spacing: 1px;
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
        padding: 5px 0;
    }
</style>

