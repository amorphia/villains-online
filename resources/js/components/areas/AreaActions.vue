<template>
    <!-- show actions -->
    <transition name="fade">
        <div v-if="actions.length"
             :class="{ closed : closed }"
             class="area-map__actions d-flex justify-center align-stretch z-7">

            <!-- close button -->
            <button @click.left="toggleClose" class="toggle minimize-toggle top right">
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
            // open up whenever we have actions
            actions(){
                this.closed = false;
            }
        },

        methods : {
            /**
             * Toggle this modal open or closed
             */
            toggleClose(){
                this.closed = !this.closed;
                App.event.emit( 'sound', 'ui' );
            },
        },

        computed: {
            /**
             * Returns an array of the actions available to us in this area
             * @returns {[]}
             */
            actions(){
                if( !this.shared.actions ) return [];

                // grab our area actions
                let actions = [];

                Object.entries( this.shared.actionTypes ).forEach( ([name, action]) => {
                    if( !action.areaAction ) return;
                    if( this.shared.actions[name]?.includes( this.area.name ) ) actions.push( name );
                });


                // add in xavier if needed
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
        opacity: 1;
        transition: all .1s;
        border: 1px solid #ffffff;
        box-shadow: 0 0 10px 4px rgba(0,0,0,1);
    }

    .area-map__actions.closed .area-map__actions-content {
        pointer-events: none;
        max-height: 0;
        max-width: 0;
        opacity: 0;
    }

</style>

