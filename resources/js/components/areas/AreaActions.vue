<template>
    <!-- show actions -->
    <transition name="fade">
        <div v-if="actions.length"
             :class="{ closed : closed }"
             class="area-map__actions d-flex justify-center align-stretch z-7">
            <button @click="toggleClose" class="toggle minimize-toggle top right">
                <i :class="closed ? 'icon-maximize' : 'icon-minimize'"></i>
                <loading-streak v-if="closed" position="left"></loading-streak>
                <loading-streak v-if="closed" position="right"></loading-streak>
                <loading-streak v-if="closed" position="top"></loading-streak>
                <loading-streak v-if="closed" position="bottom"></loading-streak>
            </button>
            <div class="area-map__actions-content ">
                <area-action v-for="action in actions"
                             :action="action"
                             :area="area"
                             :key="action"></area-action>
            </div>
        </div>
    </transition>
</template>


<script>
    export default {

        name: 'area-actions',
        props : ['area'],

        data() {
            return {
                shared : App.state,
                closed : false,
            };
        },

        watch : {
            actions(){
                this.closed = false;
            }
        },

        methods : {
            toggleClose(){
                this.closed = !this.closed;
                App.event.emit( 'sound', 'ui' );
            },
        },

        computed: {
            actions(){
                let actions = [];
                if( !this.shared.actions ) return actions;

                this.shared.areaActions.forEach( action => {
                    if( this.shared.actions[action] && this.shared.actions[action].includes( this.area.name ) ) actions.push( action );
                });

                if( this.shared.actions.xavier === this.area.name ) actions.push( 'xavier' );

                return actions;
            },
        }
    }
</script>


<style>
    .area-map__actions {
        top: 55%;
        transition: all .1s;
        position: absolute;
        right: 50%;
        transform: translate(50%,-50%);
        max-width: 95%;
        max-height: 95%;
    }

    .area-map__actions .toggle {
        transform: translateX(100%);
        padding: .5rem;
        height: 2em;
    }

    .area-map__actions.closed {
        right: 100%;
        left: unset;
        top: 0;
        transform: translate(0, 0);
    }

    .area-map__actions-content {
        display: flex;
        padding: .5rem;
        background-image: url(/images/background-blurred.jpg);
        background-size: cover;
        background-position: center;
        max-height: 100%;
        max-width: 100%;
        overflow: hidden;
        opacity: 1;
        transition: all .1s;
        border: 1px solid #ffffff;
        box-shadow: 0 0 10px 4px rgba(0,0,0,1);
    }

    .area-map__actions.closed .area-map__actions-content {
        max-height: 0;
        max-width: 0;
        opacity: 0;
    }

</style>

