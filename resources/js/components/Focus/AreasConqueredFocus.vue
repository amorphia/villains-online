<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        conquered areas :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'areas-conquered-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return Object.values( this.shared.data.areas ).filter( area => area.conquered ).length;
            }
        }
    }
</script>


<style>

</style>

