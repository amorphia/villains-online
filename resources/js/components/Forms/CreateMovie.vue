<template>
    <div>
        <vue-form
            @formSuccess="added = true"
            class="mail-form"
            method="post"
            :action="action"
            submitclass="width-100"
            :schema="schema"></vue-form>

        <transition name="fade" mode="out-in">
            <div class="width-100 center-text" v-if="added">
                <div class="success mx-4 p-5">Submitted</div>
            </div>
        </transition>
    </div>
</template>


<script>
    export default {

        name: 'create-movie',
        props: ['action'],
        data() {
            return {
                added : false
            };
        },
        computed: {
            schema(){
                return [
                    { name: 'title' },
                    { name: 'year' },
                    { name: 'gross', optional: true },
                    { name: 'seen', value: '1', type: 'checkbox' },
                    { name: 'type', type: 'select', value: 'theater', options : [
                            { value: 'theater', text: 'Theater' },
                            { value: 'streaming', text: 'Streaming' }
                        ]}
                ]
            }
        }
    }
</script>


<style>

</style>

