<template>
    <div class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        areas winning :<span class="highlight ml-2">{{ leading }}</span>
    </div>
</template>


<script>
    export default {

        name: 'control-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            leading(){
                return Object.values( this.shared.areaLeaders ).filter( leader => leader === this.shared.faction.name ).length;
            },
        }
    }
</script>


<style>

</style>

