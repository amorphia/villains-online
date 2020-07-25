<template>
    <transition name="up">
        <div v-if="open" class="hud-popout no-select width-100 overflow-hidden" :class="classes" :style="hasHeight">
            <adjust-handle v-if="!nohandle" direction="top" min="100" max="500" @newSize="setHeight"></adjust-handle>
            <button  class="toggle bottom right icon-x z-3"
                     @click="$emit( 'close')"
            ></button>
           <slot></slot>
        </div>
    </transition>
</template>


<script>

    export default {

        name: 'cards-hud',

        props: ['open', 'classes', 'nohandle'],
        data() {
            return {
                shared : App.state,
                height : null,
            };
        },

        computed : {
            hasHeight(){
                if( this.height ){
                    return `height : ${this.height}`;
                }
            },
        },

        methods : {

            setHeight( size ){
                this.height = size;
            }
        }
    }
</script>


<style>
    .hud-popout {
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        text-align: center;
        position: absolute;
        bottom: 100%;
        left: 0;
        z-index: 0;
        padding-bottom: 0.75rem;
        background-color: rgba(0,0,0,.7);
    }

    .hud-popout .adjust-handle.top {
        top: 4px;
    }

    .popout-hud__block {
        border: 1px var(--highlight-color) solid;
        margin: 0 .5rem;
        display: inline-block;
    }


    .popout-hud__block[data-title]:before {
        content: attr(data-title);
        background-color: rgba(0,0,0,.9);
        position: absolute;
        left: 50%;
        top: 0;
        z-index: 6;
        padding: .1rem .35rem;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translate(-50%,-60%);
    }

</style>

