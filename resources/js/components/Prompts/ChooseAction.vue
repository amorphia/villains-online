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
                        <token-row :area="area"></token-row>

                        <div class="width-100 choose-action__skill-ability center-text">
                            Discard a token here to start a battle?
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


                    <!-- materialize display -->
                    <div v-if="action.name === 'materialize'"
                         class="choose-action__skilled-units center-text">

                        <unit-row :units="ghostsInArea"></unit-row>

                        <div class="width-100 choose-action__skill-ability">
                            Reveal ghosts in this area?
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

                <!--  Reveal token requirement -->
                <div v-if="action.name === 'token' && firstToken.req" class="reveal-token-req prompt-question">{{ firstToken.req }}</div>


                <!-- Wild token type prompt -->
                <div v-if="action.name === 'token' && firstToken.name === 'wild'" class="py-3">
                    <div class="prompt-question center-text">Choose type for your wild token to be revealed as</div>
                    <token-set :tokens="wildTokens"
                               classes="center-text"
                               noBorder="true"
                               @tokenClicked="t => wildType = t"
                               :selected="wildType"></token-set>
                </div>

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
                wildType : null,
                wildTokens : [
                    { name : 'deploy', id : 1 },
                    { name : 'card', id : 2 },
                    { name : 'battle', id : 3 },
                    { name : 'move', id : 4 },
                ],
                actions : {},
                areaActions:  [
                    'ambush',
                    'loop',
                    'skill',
                    'materialize',
                    'magick',
                    'token',
                ]
            };
        },

        mounted(){
            App.event.on( 'actionClicked', args => this.setAction( ...args ) );
            this.$set( this.shared, 'areaActions', this.areaActions );
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
                let action = { name : name };

                if( this.areaActions.includes( name ) ){
                    action.area = param ?? this.actions[name][0];
                }

                if( name === 'token' ){
                    action.token = this.firstUnrevealed( action.area );
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

                // can we ambush?
                if( this.ambushAreas.length  ) actions.ambush = this.ambushAreas;

                // can we pass?
                if( !this.activeTokens.length ) actions.pass = true;

                // can we skip?
                if( this.shared.faction.hasOwnProperty( 'skips' ) && this.shared.faction.skips.used < this.shared.faction.skips.max ) actions.skip = true;

                // can we magick?
                if( this.useableMagick.length ) actions.magick = this.useableMagick;

                // can we materialize?
                if( this.useableMaterialize.length ) actions.materialize = this.useableMaterialize;

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
                    case 'token':
                        args = [this.action.token.id];
                        if( this.wildType ) args.push( this.wildType.name );
                        break;
                    case 'ambush':
                    case 'skill':
                    case 'magick':
                    case 'materialize':
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
                    case 'materialize':
                        message = `Reveal ghosts in the ${this.area.name}`;
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
                    if( ! this.firstRevealedToken( area ) ) return;
                    if( _.factionsWithUnitsInArea( this.shared.data.factions, area ).length < 2 ) return;

                    areas.push( area.name );
                });

                return areas;
            },

            skilledUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitReadyInArea( unit, this.area ) );
            },

            flippedUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, this.area ) && unit.flipped );
            },

            ghostsInArea(){
                if( !this.shared.faction.ghosts ) return [];
                return this.shared.faction.ghosts.filter( ghost => ghost.location === this.area.name );
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

            useableMaterialize(){
                if( this.shared.faction.name !== 'ghosts'
                    || this.shared.faction.lastMaterializeGameAction === this.shared.data.gameAction
                ) return [];

                let areas = {};

                this.shared.faction.ghosts.forEach( ghost => {
                   areas[ghost.location] = true;
                });

                return Object.keys( areas );

            },

            useableMagick(){
                let areas = [];
                if( this.shared.faction.name !== 'witches'
                    || this.shared.faction.lastMagickGameAction === this.shared.data.gameAction
                ) return areas;

                _.forEach( this.shared.data.areas, area => {
                    if( _.canUseMagick( this.shared.faction, area, this.shared.data.factions ) ){
                        areas.push( area.name );
                    }
                });

                return areas;
            },

            saveDisabled(){
                if( !this.action || this.wildTokenNeedsType ) return true;
            },

            wildTokenNeedsType(){
                return this.firstToken && this.firstToken.name === 'wild' && !this.wildType;
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

