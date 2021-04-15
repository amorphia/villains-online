<template>
    <div class="adjust-handle pos-absolute icon-drag_handle"
         :class="direction"
         ref="handle"
         @mousedown="onMouseDown"
    ></div>
</template>


<script>

    export default {

        name: 'adjust-handle',
        props : ['direction', 'min', 'max'],

        data() {
            return {
                initialX : 0,
                initialY : 0,
                offsetX : 0,
                offsetY : 0,
                parentX : 0,
                parentY : 0,
                parentEl : null
            };
        },
        mounted(){
            this.parentEl = this.$refs.handle.parentElement;
            this.setParentValues();
        },

        methods : {

            /**
             * Set initial positions and listeners
             * @param e
             */
            onMouseDown ( e ) {
                this.initialX = e.clientX;
                this.initialY = e.clientY;
                this.addEventListeners();
                this.parentEl.style.userSelect = 'none';
            },


            /**
             * set initial parent values
             */
            setParentValues(){
                this.parentX = this.parentEl.scrollWidth;
                this.parentY = this.parentEl.scrollHeight;
            },


            /**
             * Add mouse event listeners
             */
            addEventListeners(){
                window.addEventListener('mouseup',  this.onMouseUp );
                window.addEventListener('mousemove',  this.onMouseMove );
            },


            /**
             * remove mouse event listeners
             */
            removeEventListeners(){
                window.removeEventListener('mouseup',  this.onMouseUp );
                window.removeEventListener('mousemove',  this.onMouseMove );
            },


            /**
             * remove event listeners and parent values on mouse release
             */
            onMouseUp () {
                this.removeEventListeners();
                this.setParentValues();
                this.parentEl.style.removeProperty('user-select');
            },


            /**
             * Calculate new parent size
             */
            getNewSize( parent, offset ) {
                let newSize = parent + offset;

                if( this.max && newSize > this.max ){
                    newSize = this.max;
                } else if ( this.min && newSize < this.min ){
                    newSize = this.min;
                }

                return newSize + 'px';
            },


            /**
             * Use mouse drag to resize parent element
             * @param e
             */
            onMouseMove ( e ) {
                let newSize;

                switch( this.direction ){
                    case 'left' :
                            this.offsetX = this.initialX - e.clientX;
                            newSize = this.getNewSize( this.parentX, this.offsetX );
                            this.parentEl.style.width = newSize;
                        break;
                    case 'right' :
                            this.offsetX = ( this.initialX - e.clientX ) * -1;
                            newSize = this.getNewSize( this.parentX, this.offsetX );
                            this.parentEl.style.width = newSize;
                        break;
                    case 'top' :
                            this.offsetY = ( this.initialY - e.clientY );
                            newSize = this.getNewSize( this.parentY, this.offsetY );
                            this.parentEl.style.height = newSize;
                        break;
                    case 'bottom' :
                            this.offsetY = this.initialY - e.clientY * -1;
                            newSize = this.getNewSize( this.parentY, this.offsetY );
                            this.parentEl.style.height = newSize;
                        break;
                }

                this.$emit( 'newSize', newSize );

            }
        }
    }
</script>


<style>
    .adjust-handle {
        color: #843aa3;
        font-size: 1.3rem;
    }

    .adjust-handle.left {
        top: 50%;
        transform: translate(-50%,-50%) rotate( 90deg );
        left: 0;
        cursor: col-resize;
    }
    .adjust-handle.right {
        top: 50%;
        transform: translate(50%,-50%) rotate( 90deg );
        right: 0;
        cursor: col-resize;
    }
    .adjust-handle.top {
        left: 50%;
        transform: translate(-50%,-50%);
        top: 0;
        cursor: row-resize;
    }
    .adjust-handle.bottom {
        left: 50%;
        transform: translate(-50%,-50%);
        bottom: 0;
        cursor: row-resize;
    }
</style>

