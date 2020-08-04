<template>
<div>

    <!-- TOP BAR -->
    <div v-if="hasTopAction" class="choose-action-top p-2 d-flex justify-center align-center">
        <button v-if="showPass" @click="setPassAction" class="button">PASS</button>
        <button v-if="showLocked" @click="setLockedAction" class="button" >DECLARE YOURSELF LOCKED</button>
    </div>

    <!-- TOP BAR -->
    <player-prompt v-if="action" classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <div class="title">Confirm Action</div>


                <!-- Skill / Token flipper -->
                <area-flipper v-if="area"
                              :areas="[area]"
                              index="0">

                    <unit-row v-if="action.name === 'xavier'"
                              :units="[xavier]"></unit-row>

                    <!-- token display -->
                    <token-row v-if="action.name === 'token'"
                               :area="area"
                               :highlight="firstToken">
                    </token-row>

                    <!-- skill display -->
                    <div v-if="action.name === 'skill'"
                         class="choose-action__skilled-units center-text">

                        <unit-row
                            :units="skilledUnitsInArea"
                            allSelected="true">
                        </unit-row>

                        <div class="width-100 choose-action__skill-ability"
                             v-html="this.shared.filterText( this.area.skill )">
                        </div>

                    </div>
                </area-flipper>

                <div class="d-flex justify-center">

                    <button class="button button-empty"
                        @click="clearAction">
                        back
                    </button>

                    <button class="button pull-center"
                            @click="saveAction"
                            :disabled="saveDisabled">
                        {{ buttonMessage }}
                    </button>
                </div>

            </div>
        </div>
    </player-prompt>
</div>
</template>


<script>
    export default {

        name: 'choose-action',

        data() {
            return {
                shared : App.state,
                action : null,
                actions : {}
            };
        },

        mounted(){
            App.event.on( 'actionClicked', args => this.setAction( ...args ) );
            this.generateActions();
            this.setDefaultAction();
        },

        methods : {

            setDefaultAction(){
                let actionKeys = Object.keys( this.actions );
                if( actionKeys.length === 1 ){
                    let actionSet = this.actions[actionKeys[0]];
                    if( actionKeys[0] === 'pass' || actionKeys[0] === 'locked' || actionSet.length === 1 ){
                        this.setAction( actionKeys[0] );
                    }
                }
            },

            setAction( name, param ){

                console.log( 'set action', name, param );

                let action = { name : name };

                if( name === 'token' ){
                    action.area = param ?? this.actions[name][0];
                    action.token = this.firstUnrevealed( action.area );
                }

                if( name === 'skill' ){
                    action.area = param ?? this.actions[name][0];
                }

                if( name === 'xavier' ){
                    action.area = this.xavier.location;
                    action.token = this.xavier.token;
                    this.$set( this.xavier, 'placedToken', this.xavier.token );
                }

                if( action.area ) this.shared.event.emit('areaSelected', { name : action.area } );

                this.action = action;
                this.shared.action = action;
            },

            clearAction(){
                if( this.action.name === 'xavier' ) this.$set( this.xavier, 'placedToken', null );
                this.action = null;
                this.shared.action = null;
                App.event.emit('unselectAreas' );
            },

            generateActions(){
                let actions = {};

                // can we activate skills?
                if( this.useableSkills.length ) actions.skill = this.useableSkills;

                // can we reveal tokens?
                if( this.revealableTokens.length  ) actions.token = this.revealableTokens;

                // can we pass?
                if( !this.activeTokens.length ) actions.pass = true;

                // can we declare ourselves locked?
                if( !this.revealableTokens.length && this.activeTokens.length ) actions.locked = true;

                // can we reveal an xavier token?
                if( this.canXavier ) actions.xavier = this.xavier.location;

                this.actions = actions;
                this.shared.actions = actions;
            },

            saveAction(){
                let args = [];

                switch( this.action.name ){
                    case 'skill':
                        args = [this.action.area];
                        break;
                    case 'token':
                        args = [this.action.token.id];
                        break;
                }

                this.shared.respond( 'choose-action', this.action.name, ...args );
                this.shared.actions = null;
                this.clearAction();
            },

            setPassAction(){
                this.setAction( 'pass' );
            },

            setLockedAction(){
                this.setAction( 'locked' );
            },

            /*
            setSkillAction( area ){
                this.setAction( 'skill', area );
            },

            setTokenAction( area ){
                this.setAction( 'token', area );
            },

            setXavierAction(){
                this.setAction( 'xavier' );
            },
            */

            firstUnrevealed( area ){
                if( typeof area === 'string' ) area = this.shared.data.areas[ area ];
                return _.firstUnrevealedToken( area );
            }
        },

        computed : {

            hasTopAction(){
                return this.actions.pass || this.actions.locked;
            },

            showPass(){
                return this.actions.pass;
            },

            showLocked(){
                return this.actions.locked;
            },

            currentToken(){
                return this.action.name === 'token' ? this.firstUnrevealed( this.area ) : null;
            },

            buttonMessage(){
                let message;
                switch( this.action.name ){
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

            /*
            message(){
                if( !this.action ) return "Choose an action";

                switch( this.action.name ){
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
             */

            area(){
                if( !this.action.area ) return;
                return this.shared.data.areas[this.action.area];
            },

            firstToken(){
                if( this.action.name === 'token' ){
                    return this.firstUnrevealed( this.area );
                }
            },

            activeTokens(){
                return this.shared.faction.tokens.filter(
                    token => token.location
                             && token.revealed === false
                             && token.location !== 'xavier'
                );
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
                _.forEach( this.shared.data.areas, area => {
                    let firstUnrevealed = this.firstUnrevealed( area );
                    if( firstUnrevealed && firstUnrevealed.faction === this.shared.faction.name ){
                        areas.push( area.name );
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
                    if( _.canUseSkill( this.shared.faction, area, this.shared.data.factions ) ){
                        areas.push( area.name );
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

