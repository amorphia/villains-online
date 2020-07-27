<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <div class="title">{{ message }}</div>

                <div v-if="action === 'xavier'" class="d-flex justify-center">
                    <area-flipper :areas="[xavierArea]" index="0">
                        <unit-row :units="[xavier]"></unit-row>
                    </area-flipper>
                </div>

                <area-flipper v-if="collection.length" :areas="collection" :index="areaIndex" @update="update">

                    <token-row v-if="action === 'token'" :area="area" :highlight="firstToken"></token-row>

                    <div v-if="action === 'skill'" class="choose-action__skilled-units center-text">
                        <unit-row :units="skilledUnitsInArea" allSelected="true"></unit-row>

                        <div class="width-100 choose-action__skill-ability" v-html="this.shared.filterText( this.area.skill )"></div>
                    </div>

                </area-flipper>

                <div v-if="!action" class="view-player__empty">
                    No Action selected
                </div>


                <div class="options d-flex justify-center">
                    <button v-if="validActions.includes('pass')"
                            class="button button-empty"
                            :class="{ active: action === 'pass' }"
                            @click="action = 'pass'">
                                PASS
                    </button>

                    <button v-if="validActions.includes('locked')"
                            class="button button-empty"
                            :class="{ active: action === 'locked' }"
                            @click="action = 'locked'">
                                LOCKED
                    </button>

                    <button v-if="validActions.includes('xavier')"
                            class="button button-empty"
                            :class="{ active: action === 'xavier' }"
                            @click="setXavierAction">
                                REVEAL XAVIER TOKEN
                    </button>

                    <button v-if="validActions.includes('token')"
                            class="button button-empty"
                            :class="{ active: action === 'token' }"
                            @click="setTokenAction">
                                REVEAL TOKEN
                    </button>

                    <button v-if="validActions.includes('skill')"
                            class="button button-empty"
                            :class="{ active: action === 'skill' }"
                            @click="setSkillAction">
                                ACTIVATE SKILL
                    </button>

                </div>

                <button class="button pull-center" @click="chooseAction" :disabled="saveDisabled">{{ buttonMessage }}</button>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-action-old',

        data() {
            return {
                shared : App.state,
                action : null,
                areaIndex : 0,
            };
        },

        mounted(){
            //this.shared.event.on( 'areaClicked', this.areaClicked );
            if( this.validActions.length === 1 ){
                this.action = this.validActions[0];
                if( this.validActions[0] === 'token' ) this.shared.event.emit('areaSelected', this.collection[ this.areaIndex ] );
            }
        },

        watch : {
            validActions(){

            }
        },

        methods : {

            chooseAction(){

                let args = [];

                switch( this.action ){
                    case 'skill':
                        args = [this.area.name];
                        break;
                    case 'token':
                        args = [this.currentToken.id];
                        break;
                }

                this.shared.respond( 'choose-action', this.action, ...args );
                this.action = null;
                this.areaIndex = 0;
            },

            update( n ){
                this.areaIndex = n;
            },

            setSkillAction(){
                this.action = 'skill';
                // this.shared.event.emit('areaSelected', this.collection[ this.areaIndex ] );
            },

            setTokenAction(){
                this.action = 'token';
                // this.shared.event.emit('areaSelected', this.collection[ this.areaIndex ] );
            },

            setXavierAction(){
                this.action = 'xavier';
                this.$set( this.xavier, 'placedToken', this.xavier.token );
            },

            prev(){
                this.areaIndex--;
                if( this.areaIndex < 0 ){
                    this.areaIndex = this.collection.length - 1;
                }
            },

            next(){
                this.areaIndex++;
                if( this.areaIndex > this.collection.length - 1 ){
                    this.areaIndex = 0;
                }
            },

            firstUnrevealed( area ){
                return _.find( area.tokens, token => {
                    return token && token.revealed === false
                });
            }
        },

        computed : {

            currentToken(){
                return this.action === 'token' ? this.firstUnrevealed( this.area ) : null;
            },

            buttonMessage(){
                let message;
                switch( this.action ){
                    case 'skill':
                        message = `Activate the ${this.area.name} skill ability`;
                        break;
                    case 'token':
                        message = `Reveal token in the ${this.area.name}`;
                        break;
                    case 'pass':
                        message = `Pass for the turn`;
                        break;
                    case 'locked':
                        message = `Declare yourself locked`;
                        break;
                    case 'xavier':
                        message = `Reveal token on Xavier`;
                        break;
                }
                return this.saveDisabled ? "Choose your action" : message;
            },

            message(){
                if( !this.action ) return "Choose an action";

                switch( this.action ){
                    case 'skill':
                        return "Choose a skill to activate";
                        break;
                    case 'token':
                        return "Choose a token to reveal";
                        break;
                    case 'xavier':
                        return "Reveal Xavier's token";
                        break;
                    case 'pass':
                        return "Declare yourself passed";
                        break;
                    case 'locked':
                        return "Skip your turn";
                        break;
                }
            },

            validActions(){
                let actions = [];

                if( this.useableSkills.length ){
                    actions.push( 'skill' );
                }

                if( this.canXavier ){
                    actions.push( 'xavier' );
                }

                if( this.revealableTokens.length  ){
                    actions.push( 'token' );
                }

                if( !this.activeTokens.length ){
                    actions.push( 'pass' );
                }

                if( !this.revealableTokens.length && this.activeTokens.length ){
                    actions.push( 'locked' );
                }

                return actions;
            },

            area(){
                return this.collection[this.areaIndex];
            },

            firstToken(){
                if( this.action === 'token' ){
                    let area = this.collection[this.areaIndex];
                    return this.firstUnrevealed( area );
                }
            },

            collection(){
                if( this.action === 'token' ) return this.revealableTokens;
                if( this.action === 'skill' ) return this.useableSkills;
                return [];
            },

            activeTokens(){
                return this.shared.faction.tokens.filter( token => token.location && token.revealed === false );
            },

            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.faction.units.find( unit => unit.type === 'champion' );
            },

            xavierArea(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.data.areas[ this.xavier.location ];
            },

            canXavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.xavier.token;
            },

            revealableTokens(){
                let areas = [];
                _.forEach( this.shared.data.areas, (area, name) => {
                    let firstUnrevealed = this.firstUnrevealed( area );
                    if( firstUnrevealed && firstUnrevealed.faction === this.shared.faction.name ){
                        areas.push( area );
                    }
                });
                return areas;
            },

            skilledUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitReadyInArea( unit, this.area ) );
            },

            useableSkills(){
                let areas = [];

                _.forEach( this.shared.data.areas, area => {
                    if( !_.hasUsedSkill( this.shared.faction, area ) && _.find( this.shared.faction.units, unit => _.unitReadyInArea( unit, area ) ) ){
                        areas.push( area );
                    }
                });

                return areas;
            },

            saveDisabled(){
                if( !this.action ) return true;
            }
        }
    }
</script>


<style>
    .choose-action__skill-ability {
        padding: 1rem;
        background-color: rgba(0,0,0,.8);
        color: var(--highlight-color);
        margin: .5rem auto;
        font-size: 1.2em;
        letter-spacing: 1px;
    }
</style>

