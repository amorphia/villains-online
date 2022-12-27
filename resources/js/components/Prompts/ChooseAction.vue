<template>
    <!--
    * Woe be unto ye who stumbles upon this dire sight. I gotta refactor this whole thing into individual action
    * components, as this prompt has really gotten away from me. I promise, its on my list
    -->
<div>
    <!-- TOP BAR -->
    <div v-if="hasTopAction" class="choose-action-top p-2 d-flex justify-center align-center">
        <button v-if="showSkip" @click="setSkipAction" class="button">SKIP THIS ACTION</button>
        <button v-if="showPass" @click="setPassAction" class="button">PASS</button>
        <button v-if="showLocked" @click="setLockedAction" class="button" >DECLARE YOURSELF LOCKED</button>
    </div>

    <player-prompt v-if="action" classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title" v-html="message"></div>

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

                    <unit-row class="mt-3" v-if="forcedMoleKingAction"
                        :units="[ this.moleKing ]">
                    </unit-row>

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

                        <unit-icon :unit="ghostInArea" :unhiddenGhost="true"></unit-icon>

                        <div class="width-100 choose-action__skill-ability" v-html="ghostInArea.description">
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

                    <!-- shelter display -->
                    <div v-if="action.name === 'shelter'"
                         class="choose-action__skilled-units center-text">

                        <token-row
                            :area="area"
                            :highlight="shelterToken">
                        </token-row>

                        <div class="width-100 choose-action__skill-ability">
                            Discard your shelter token to revive one of your killed basic units?
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

                <!-- buttons -->
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
                shared: App.state,
                action: null,
                wildType: null,
                wildTokens: [
                    {name: 'deploy', id: 1},
                    {name: 'card', id: 2},
                    {name: 'battle', id: 3},
                    {name: 'move', id: 4},
                ],
                actions: {},
            }
        },

        mounted(){
            App.event.on( 'actionClicked', args => this.setAction( ...args ) );
            this.generateActions();
            this.setDefaultAction();
        },

        methods : {
            /**
             * Set our default action
             */
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


            /**
             * Set our action
             *
             * @param name
             * @param param
             */
            setAction( name, param ){
                let action = { name : name };

                // if this is an area action set our shared action area
                if( this.shared.actionTypes[name]?.areaAction ){
                    action.area = param ?? this.actions[name][0];
                }

                // if this is a token action set our token
                if( name === 'token' ){
                    action.token = this.firstUnrevealed( action.area );
                }

                // handle xavier action
                if( name === 'xavier' ){
                    action.area = this.xavier.location;
                    action.token = this.xavier.token;
                    this.$set( this.xavier, 'placedToken', this.xavier.token );
                }

                // select the appropriate area
                if( action.area ) this.shared.event.emit('areaSelected', { name : action.area } );

                // set our action
                this.action = action;
                this.shared.action = action;
            },


            /**
             * Clear our action
             */
            clearAction(){
                if( this.action.name === 'xavier' ) this.$set( this.xavier, 'placedToken', null );
                this.action = null;
                this.shared.action = null;
                App.event.emit('unselectAreas' );
            },


            /**
             * Build our action options
             */
            generateActions(){
                let actions = {};

                /********************
                 * NON-ACTION ACTIONS
                 ********************/

                // can we magick?
                if( this.useableMagick.length ) actions.magick = this.useableMagick;

                /********************
                 * ACTION ACTIONS
                 ********************/

                // forced mole king action
                if( this.forcedMoleKingAction ){
                    actions.token = [this.forcedMoleKingAction];
                    this.actions = actions;
                    this.shared.actions = actions;
                    return;
                }

                // can we materialize?
                if( this.useableMaterialize.length ) actions.materialize = this.useableMaterialize;

                // can we reveal tokens?
                if( this.revealableTokens.length  ) actions.token = this.revealableTokens;

                // can we activate skills?
                if( this.useableSkills.length ) actions.skill = this.useableSkills;

                // can we ambush?
                if( this.ambushAreas.length  ) actions.ambush = this.ambushAreas;

                // can we pass?
                if( !this.activeTokens.length ) actions.pass = true;

                // can we skip?
                if( this.shared.faction.hasOwnProperty( 'skips' ) && this.shared.faction.skips.used < this.shared.faction.skips.max ) actions.skip = true;

                // can we loop?
                if( this.useableLoop.length ) actions.loop = this.useableLoop;

                // can we shelter?
                if( this.useableShelter.length ) actions.shelter = this.useableShelter;

                // can we declare ourselves locked?
                if( !this.revealableTokens.length && (this.activeTokens.length || ( !this.useableMaterialize.length && this.faceDownGhosts.length ) ) ) actions.locked = true;

                // can we reveal an xavier token?
                if( this.canXavier ) actions.xavier = this.xavier.location;

                this.actions = actions;
                this.shared.actions = actions;
            },


            /**
             * Save our action
             */
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
                    case 'shelter':
                    case 'loop':
                        args = [this.action.area];
                        break;
                }

                this.shared.respond( 'choose-action', this.action.name, ...args );
                this.shared.actions = null;
                this.clearAction();
            },


            /**
             * Set pass action
             */
            setPassAction(){
                this.setAction( 'pass' );
            },


            /**
             * Set Locked action
             */
            setLockedAction(){
                this.setAction( 'locked' );
            },


            /**
             * Set skip action
             */
            setSkipAction(){
                this.setAction( 'skip' );
            },


            /**
             * Get the first unrevealed token in the given area
             */
            firstUnrevealed( area ){
                if( typeof area === 'string' ) area = this.shared.data.areas[ area ];
                return _.firstUnrevealedToken( area );
            },


            /**
             * Get the first revealed token in the given area
             */
            firstRevealedToken( area ){
                if( typeof area === 'string' ) area = this.shared.data.areas[ area ];
                return _.firstRevealedToken( area, { player : this.shared.faction.name });
            }
        },

        computed : {

            /**
             * Does this action use the top bar?
             * @returns {boolean}
             */
            hasTopAction(){
                return this.actions.pass || this.actions.locked || this.actions.skip;
            },

            message(){
                return this.forcedMoleKingAction ? `The <span class="gold">Mole King</span> demands you reveal your token in the ${this.forcedMoleKingAction}` : "Confirm Action";
            },

            // should show pass type actions
            showPass(){ return this.actions.pass },
            showSkip(){ return this.actions.skip },
            showLocked(){ return this.actions.locked },


            /**
             * Returns our current token (if applicable)
             * @returns {Token|null}
             */
            currentToken(){
                return this.action.name === 'token' ? this.firstUnrevealed( this.area ) : null;
            },

            moleKing(){
                for(let faction of Object.values(this.shared.data.factions)){
                    if(faction.moleKing && faction.moleKing.location && !faction.moleKing.killed){
                        return faction.moleKing;
                    }
                }
            },

            forcedMoleKingAction(){
                if(this.moleKing?.faction === this.shared.faction.name) return false;

                let moleKingArea = this.moleKing ? this.moleKing.location : null;

                if(moleKingArea && this.revealableTokens.includes(moleKingArea)){
                    return moleKingArea;
                }

                return false;
            },

            /**
             * Returns our button message
             * @returns {string}
             */
            buttonMessage(){
                // if we don't have a valid action
                if( this.saveDisabled ) return "Choose your action";

                // if we have an action with a static message
                let message = this.shared.actionTypes[this.action.name]?.buttonMessage;
                if( message ) return message;

                // if we need a dynamic message
                switch( this.action.name ){
                    case 'skill': return `Activate the ${this.area.name} skill ability`;
                    case 'token': return `Reveal token in the ${this.area.name}`;
                    case 'materialize': return `Reveal ghosts in the ${this.area.name}`;
                    case 'ambush': return `Ambush the ${this.area.name}`;
                }
            },


            /**
             * Returns our area if any
             * @returns {Area|null}
             */
            area(){
                if( !this.action.area ) return;
                return this.shared.data.areas[this.action.area];
            },


            /**
             * Returns the token we have chosen to reveal with this action if applicable
             * @returns {Token|null}
             */
            firstToken(){
                if( this.action.name === 'token' ) return this.firstUnrevealed( this.area );
            },


            /**
             * Returns the first revealed token in this area for this ambush action, if applicable
             * @returns {Token|null}
             */
            firstRevealed(){
                if( this.action.name === 'ambush' ) return this.firstRevealedToken( this.area );
            },


            /**
             * Returns an array of the tokens we have remaining to reveal this turn
             * @returns {Token[]}
             */
            activeTokens(){
                return this.shared.faction.tokens.filter(
                    token => token.location
                             && token.revealed === false
                             && token.location !== 'xavier'
                );
            },


            /**
             * Returns xavier blackstone, if we are the society
             * @returns {Unit|null}
             */
            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.faction.units.find( unit => unit.type === 'champion' );
            },


            /**
             * Returns Xavier blackstone's area object, if applicable
             * @returns {Area|null}
             */
            xavierArea(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.data.areas[ this.xavier.location ];
            },


            /**
             * Return Xaviers token, if we can activate it, or null if not applicable
             * @returns {Token|null}
             */
            canXavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.xavier.token;
            },


            /**
             * Returns an array of area names that we can reveal a token in
             * @returns {string[]}
             */
            revealableTokens(){
                return Object.values( this.shared.data.areas ).reduce( (tokens, area) =>{
                    let firstUnrevealed = this.firstUnrevealed( area );
                    if( firstUnrevealed?.faction === this.shared.faction.name ){
                        tokens.push( area.name );
                    }
                    return tokens;
                }, [] );
            },


            /**
             * Returns an array of area names matching the areas we can ambush
             * @returns {[]}
             */
            ambushAreas(){
                let areas = [];
                let faction = this.shared.faction;

                // if we can't ambush at all, return the empty array
                if( !faction.ambushes || faction.ambushes.used >= faction.ambushes.max ) return areas;

                // check each area to see if we have a revealed token there, and there are two players
                // with units in that area
                Object.values( this.shared.data.areas ).forEach( area => {
                    if( ! this.firstRevealedToken( area ) ) return;
                    if( _.factionsWithUnitsInArea( this.shared.data.factions, area ).length < 2 ) return;
                    areas.push( area.name );
                });

                return areas;
            },


            /**
             * Return an array of our skilled units in our selected area
             * @returns {Unit[]}
             */
            skilledUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitReadyInArea( unit, this.area ) );
            },


            /**
             * Return an array of our flipped units in our selected area
             * @returns {Unit[]}
             */
            flippedUnitsInArea(){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, this.area, { flipped : true } ));
            },


            /**
             * Return an array of our ghost units in our selected area
             * @returns {Unit[]}
             */
            ghostInArea(){
                if( !this.shared.faction.canPlaceGhostsDuringTokens || !this.action?.area ) return [];
                return this.shared.faction.units.find( unit => unit.ghost && unit.flipped && unit.location === this.action?.area );
            },


            /**
             * Return an array of area names matching the areas where we can activate the area skill
             * @returns {[]}
             */
            useableSkills(){
                return Object.values( this.shared.data.areas ).reduce( (array, area) =>{
                    if( _.canUseSkill( this.shared.faction, area, this.shared.data.factions ) ){
                        array.push( area.name );
                    }
                    return array;
                }, []);
            },


            /**
             * Returns our loop token, if revealed and in play
             * @returns {Token|null}
             */
            loopToken(){
                return this.shared.faction.tokens.find( token => token.type === 'loop'
                    && token.revealed
                    && token.location );
            },


            /**
             * Returns an array of area names matching areas we can play a loop action
             * @returns {string[]}
             */
            useableLoop(){
                let reserves = this.shared.faction.tokens.find( token => !token.location );
                return this.loopToken && reserves ? [this.loopToken.location] : [];
            },


            shelterToken(){
                return this.shared.faction.tokens.find( token => token.type === 'shelter'
                    && token.revealed
                    && token.location );
            },

            useableShelter(){
                if(!this.shelterToken) return [];

                let deadInArea = _.factionDeadInArea( this.shared.faction, this.shelterToken.location, { basic: true } )
                return deadInArea.length ? [this.shelterToken.location] : [];
            },

            /**
             * Returns an array of area names matching the areas where we can take a materialize action
             * @returns {string[]|Array}
             */
            useableMaterialize(){
                if( this.shared.faction.name !== 'ghosts') return [];

                let areas = {};
                this.faceDownGhosts.forEach( unit => {
                    //if( this.areasWithoutUnrevealedEnemyTokens.includes(unit.location) ) areas[unit.location] = true;
                    areas[unit.location] = true;
                });

                return Object.keys( areas );
            },

            areasWithoutUnrevealedEnemyTokens(){
               return _.areasWithoutUnrevealedTokens( this.shared.data.areas, { enemy: this.shared.faction.name } );
            },

            faceDownGhosts(){
                if( this.shared.faction.name !== 'ghosts') return [];

                return this.shared.faction.units.filter( unit => unit.ghost && unit.flipped );
            },

            /**
             * Returns an array of area names matching the areas where we can take a magick action
             * @returns {string[]|Array}
             */
            useableMagick(){
                // if not applicable, return an empty array
                if( this.shared.faction.name !== 'witches'
                    || this.shared.faction.lastMagickGameAction === this.shared.data.gameAction
                ) return [];


                return Object.values( this.shared.data.areas ).reduce( (array, area) =>{
                    if( _.canUseMagick( this.shared.faction, area, this.shared.data.factions ) ){
                        array.push( area.name );
                    }
                    return array;
                }, []);
            },


            /**
             * Is our ability to save our choice disabled?
             * @returns {boolean}
             */
            saveDisabled(){
                if( !this.action || this.wildTokenNeedsType ) return true;
            },


            /**
             * Does our wild token still need to be assigned a type?
             * @returns {boolean}
             */
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

