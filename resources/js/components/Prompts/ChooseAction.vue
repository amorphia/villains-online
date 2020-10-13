<template>
<div>

    <!-- TOP BAR -->
    <div v-if="hasTopAction" class="choose-action-top p-2 d-flex justify-center align-center">
        <button v-if="showSkip" @click="setSkipAction" class="button">SKIP THIS ACTION</button>
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


                    <!-- ambush display -->
                    <div class="" v-if="action.name === 'ambush'">
                        <token-row :area="area" :highlight="firstRevealed"></token-row>

                        <div class="width-100 choose-action__skill-ability center-text">
                            Discard this token to start a battle here?
                        </div>
                    </div>


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

                    <!-- magick display -->
                    <div v-if="action.name === 'magick'"
                         class="choose-action__skilled-units center-text">

                        <unit-row
                            :units="flippedUnitsInArea"
                            allSelected="true">
                        </unit-row>

                        <div class="width-100 choose-action__skill-ability">
                            Use your magick ability in this area?
                        </div>

                    </div>


                    <!-- loop display -->
                    <div v-if="action.name === 'loop'"
                         class="choose-action__skilled-units center-text">

                        <token-row
                            :area="area"
                            :highlight="loopToken">
                        </token-row>

                        <div class="width-100 choose-action__skill-ability">
                            Replace Loop token with a face down token from your reserves?
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
                    if( actionKeys[0] === 'pass'
                        || actionKeys[0] === 'locked'
                        || actionKeys[0] === 'skip'
                        || actionSet.length === 1 ){
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

                if( name === 'ambush' ){
                    action.area = param ?? this.actions[name][0];
                }

                if( name === 'skill' ){
                    action.area = param ?? this.actions[name][0];
                }

                if( name === 'xavier' ){
                    action.area = this.xavier.location;
                    action.token = this.xavier.token;
                    this.$set( this.xavier, 'placedToken', this.xavier.token );
                }

                if( name === 'magick' ){
                    action.area = param ?? this.actions[name][0];
                }

                if( name === 'loop' ){
                    action.area = param ?? this.actions[name][0];
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

                // can we ambush?
                if( this.ambushAreas.length  ) actions.ambush = this.ambushAreas;

                // can we pass?
                if( !this.activeTokens.length ) actions.pass = true;

                // can we skip?
                if( this.shared.faction.hasOwnProperty( 'skips' ) && this.shared.faction.skips.used < this.shared.faction.skips.max ) actions.skip = true;

                // can we magick?
                if( this.useableMagick.length ) actions.magick = this.useableMagick;

                // can we loop?
                if( this.useableLoop.length ) actions.loop = this.useableLoop;

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
                    case 'ambush':
                        args = [this.action.area];
                        break;
                    case 'magick':
                        args = [this.action.area];
                        break;
                    case 'loop':
                        args = [this.action.area];
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

            setSkipAction(){
                this.setAction( 'skip' );
            },

            firstUnrevealed( area ){
                if( typeof area === 'string' ) area = this.shared.data.areas[ area ];
                return _.firstUnrevealedToken( area );
            },

            firstRevealedToken( area ){
                if( typeof area === 'string' ) area = this.shared.data.areas[ area ];
                return _.firstRevealedToken( area, { player : this.shared.faction.name });
            }
        },

        computed : {

            hasTopAction(){
                return this.actions.pass || this.actions.locked || this.actions.skip;
            },

            showPass(){
                return this.actions.pass;
            },

            showSkip(){
                return this.actions.skip;
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
                    case 'skip':
                        message = `Skip this action`;
                        break;
                    case 'locked':
                        message = `Declare yourself locked`;
                        break;
                    case 'xavier':
                        message = `Reveal token on Xavier`;
                        break;
                    case 'magick':
                        message = `Use magick in the ${this.area.name}`;
                        break;
                    case 'loop':
                        message = `Replace Loop token`;
                        break;
                    case 'ambush':
                        message = `Ambush the ${this.area.name}`;
                        break;
                }
                return this.saveDisabled ? "Choose your action" : message;
            },


            area(){
                if( !this.action.area ) return;
                return this.shared.data.areas[this.action.area];
            },

            firstToken(){
                if( this.action.name === 'token' ){
                    return this.firstUnrevealed( this.area );
                }
            },

            firstRevealed(){
                if( this.action.name === 'ambush' ){
                    return this.firstRevealedToken( this.area );
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

            ambushAreas(){
                let areas = [];
                let faction = this.shared.faction;

                if( !faction.ambushes || faction.ambushes.used >= faction.ambushes.max ) return areas;

                _.forEach( this.shared.data.areas, area => {
                    if( this.firstRevealedToken( area ) ) areas.push( area.name );
                });

                return areas;
            },

            skilledUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitReadyInArea( unit, this.area ) );
            },

            flippedUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, this.area ) && unit.flipped );
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

            loopToken(){
                return this.shared.faction.tokens.find( token => token.type === 'loop' && token.revealed && token.location );
            },

            useableLoop(){
                let reserves = this.shared.faction.tokens.find( token => !token.location );
                return this.loopToken && reserves ? [this.loopToken.location] : [];
            },

            useableMagick(){
                let areas = [];
                if( this.shared.faction.name !== 'witches' ) return areas;

                _.forEach( this.shared.data.areas, area => {
                    if( _.canUseMagick( this.shared.faction, area, this.shared.data.factions ) ){
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

