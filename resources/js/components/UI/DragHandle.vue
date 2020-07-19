<template>
    <div class="adjust-handle pos-absolute icon-drag_handle"
         :class="direction"
         ref="handle"
         @mousedown="onMouseDown"
    ></div>
</template>


<script>

    export default {

        name: 'drag-handle',
        props : ['direction'],

        data() {
            return {
                offsetX : 0,
                offsetY : 0,
                initialX: 0,
                initialY: 0,
                parentX : 0,
                parentY : 0,
                parentEl : null
            };
        },
        mounted(){
            this.parentEl = this.$refs.handle.parentElement;
        },

        methods : {
            onMouseDown ( e ) {
                this.initialX = e.clientX;
                this.initialY = e.clientY;
                this.setParentValues();
                this.addEventListeners();
                this.parentEl.style.userSelect = 'none';
            },

            setParentValues(){
                this.parentY = this.parentEl.offsetTop;
                this.parentX = this.parentEl.offsetLeft;
                console.log( this );
            },

            addEventListeners(){
                window.addEventListener('mouseup',  this.onMouseUp );
                window.addEventListener('mousemove',  this.onMouseMove );
            },

            removeEventListeners(){
                window.removeEventListener('mouseup',  this.onMouseUp );
                window.removeEventListener('mousemove',  this.onMouseMove );
            },

            onMouseUp () {
                this.removeEventListeners();
                this.setParentValues();
                this.parentEl.style.removeProperty('user-select');
            },


            onMouseMove ( e ) {

                this.offsetX = e.clientX - this.initialX ;
                this.offsetY = this.initialY - e.clientY;

                console.log( 'this.offsetX', this.offsetX );
                console.log( 'this.offsetY', this.offsetY );

                this.parentEl.style.top = (this.parentY - this.offsetY) + "px";
                this.parentEl.style.right = (this.parentX - this.offsetX) + "px";

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

