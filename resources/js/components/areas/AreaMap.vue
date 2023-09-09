<template>
    <div class="area-map-container" :class="`${area.name}-container`">
        <div class="area-map pos-relative width-100 height-100" :class="computedClasses" @click="areaClicked">

            <!-- blocked -->
            <div v-if="area.ignored" class="area-map__blocked pos-absolute-center flex-center">
                <span class="pos-relative" style="top: 5px;">BLOCKED</span>
            </div>

            <!-- Control -->
            <div class="area-map__owner-wrap z-3 cursor-help">
                <!-- owner -->
                <img v-if="area.owner"
                     @click.right.prevent="() => {
                         $refs.controllerTooltip.open();
                         areaClicked();
                     }"
                     class="area-map__owner-portrait z-2"
                     :src="`/images/factions/${area.owner}/icon.jpg`"
                     :title="`The ${area.owner} control this area`">

                <tool-tip v-if="area.owner" direction="right-bottom" :title="`controlled by The ${area.owner}`" ref="controllerTooltip">
                    <div v-html="shared.filterText(`The ${this.area.owner} gain xIx in this area and have: <span class='highlight'>${shared.filterText(this.area.control)}</span>`)"></div>
                </tool-tip>

                <!-- conquered -->
                <div v-if="area.conquered"
                     class="area-map__conquered-icon z-1 icon-flag faction-conquistadors"
                     title="The Conquistadors have conquered this area">
                </div>
            </div>

            <!-- zoom -->
            <div class="toggle area-map__toggle top-0 right-0"
                 @click.stop="shared.event.emit('viewArea', area )">
                    <i class="icon-zoom_in"></i>
            </div>

            <!-- battle marker -->
            <div v-if="willBattle" class="tooltip area-map__battle-marker-container">
                <img
                     @click.right.prevent="() => {
                         $refs.battleTooltip.open();
                         areaClicked();
                     }"
                     class="width-100 height-100 area-map__battle-marker"
                     src="/images/icons/battle.png"
                     title="A battle will take place here during the combat step">
                    <tool-tip title="Battle Marker" ref="battleTooltip" direction="right-top">
                        <div>Combat will take place in this area after all players finish taking their actions.</div>
                        <div class="highlight">Battle markers are placed when there are as many tokens in an area as number of players</div>
                    </tool-tip>
            </div>


            <!-- exterminate -->
            <i v-if="exterminated"
               @click.right.prevent="() => {
                         $refs.exterminateTooltip.open();
                         areaClicked();
               }"
               class="area-map__exterminated icon-exterminate z-2 cursor-help"
               :style="`color: var(--faction-${exterminated}); border-color: var(--faction-${exterminated})`"
               :title="`The ${exterminated} have exterminated the ${area.name}`">
                    <tool-tip title="exterminated" direction="left-top" ref="exterminateTooltip">
                        <div class="center-text" :class="`faction-${exterminated}`">({{ exterminated }})</div>
                        <div>The {{ exterminated }} have exterminated the {{ area.name }}</div>
                        <div class="highlight">An area is exterminated by a player if that player is the only one with units there, and they have killed at least one unit there</div>
                    </tool-tip>
            </i>

            <!-- tokens -->
            <div class="width-100 shrink-0 pos-absolute top-0" v-if="!area.ignored">
                <token-row
                    :area="area"
                    :token="token"
                    @token="emitToken"
                ></token-row>
            </div>

            <!-- graveyard -->
            <div v-if="graveyard" class="area-map__graveyard cursor-help"
                 @click.right.prevent="() => $refs.killsTooltip.open()"
            >
                <!-- dead -->
                <div class="icon-graveyard mb-2"></div>
                <div v-for="(dead, name) in graveyard"
                     class="area-map__graveyard-count"
                     :class="`faction-${name}`"
                     :title="`the ${name} have ${dead} kills in the ${area.name}`">{{ dead }}</div>

                <!-- kills tooltip -->
                <tool-tip ref="killsTooltip" title="faction kills" direction="left">
                    <div style="display: grid;">
                        <div v-for="(dead, name) in graveyard" v-html="`The <span class='uppercase faction-${name}'>${name}</span> have ${dead} kill${dead > 1 ? 's' : ''}`"></div>
                    </div>
                </tool-tip>
            </div>

            <!-- influence -->
            <div v-if="influence.length" class="area-map__influence cursor-help"
                @click.right.prevent="() => $refs.influenceTooltip.open()"
            >
                <div class="influence-marker mb-2">
                    <img src="/images/icons/influence.png">
                </div>
                <!-- faction influece -->
                <div v-for="obj in influence"
                     class="area-map__influence-count"
                     :class="`faction-${obj.faction}`"
                     :title="`the ${obj.faction} have ${obj.influence} influence in the ${area.name}`">
                    {{ obj.influence }}
                    <!-- {{ obj.faction === 'plants' && killedPlant ? '*' : '' }} -->
                </div>

                <!-- influence tooltip -->
                <tool-tip ref="influenceTooltip" title="influence count" direction="right">
                    <div style="display: grid;">
                        <div v-for="faction in influence" v-html="influenceTooltipText(faction)"></div>
                    </div>
                </tool-tip>
            </div>

            <!-- Xavier -->
            <div v-if="showXavier" class="pos-absolute-center area-map__xavier z-6" @click.stop="emitXavier">
                <unit-row  :units="[xavier]"></unit-row>
            </div>


            <!-- area actions -->
            <area-actions :area="area"></area-actions>

            <!-- area popups -->
            <area-popup :area="area" v-if="!hasActions"></area-popup>

            <!-- Core Content -->
            <div class="width-100 height-100 area-map__core-content-container">
                    <div class="area-map__core-content width-100 height-100 overflow-auto d-flex align-center justify-center">
                        <div class="d-flex flex-wrap justify-center" style="max-width: 95%">
                            <map-player v-for="faction in shared.data.factions"
                                        :key="faction.name"
                                        :faction="faction"
                                        :area="area"></map-player>
                        </div>
                    </div>
            </div>


            <!-- status icons -->
            <div class="area-map__stats-row pos-absolute bottom-0 width-100 flex-center shrink-0">
                <stat-icon v-for="stat in stats" :stat="stat" :area="area" />
            </div>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'area-map',
        props: ['areaName', 'classes'],

        data() {
            return {
                shared : App.state,
                opacity : false,
            };
        },
        mounted(){
            // area selected listener
            this.shared.event.on( 'areaSelected', area => {
                if( this.area.name !== area.name ) this.opacity = true;
                else this.opacity = false;
            });

            // unselect areas listener
            this.shared.event.on( 'unselectAreas', area => this.opacity = false );
        },

        methods : {
            areaClicked(){
                if(this.area.ignored) return;

                this.shared.event.emit( 'areaClicked', this.area );
            },

            openStatTooltip(index){
                const ref = `statTooltip-${index}`;
                this.$refs[ref].open();
            },

            influenceTooltipText(faction){
                let text = `The <span class='faction-${faction.faction} uppercase'>${faction.faction}</span> have <span class="highlight bold mr-1">${faction.influence}</span>`;

                if( faction.faction === 'plants' && this.killedPlant ) text += '*';

                return this.shared.filterText(text + 'xIx');
            },

            /**
             * Emit a token event
             * @param token
             */
            emitToken( token ){
                this.shared.event.emit( 'tokenClicked', token );
            },


            /**
             * Emit an xavier event
             */
            emitXavier(){
                this.shared.event.emit( 'xavierClicked' );
            },


            /**
             * Return the most influence in this area
             * @param influences
             * @returns {number}
             */
            mostInfluence( influences ){
                let max = _.maxBy(influences, 'influence');
                return max ? max.influence : 0;
            },


            /**
             * Return the faction name of whomever has the most influence here
             * @param influences
             * @returns {boolean}
             */
            playerWithMostInfluence( influences ){
                let max = this.mostInfluence( influences );
                let maxes = influences.filter( item => item.influence === max );
                return maxes.length === 1 ? maxes[0].faction : false;
            },


            /**
             * Set the player who is leading in influence in this area to our shared state
             */
            setSharedAreaLeader( influences ){
                let leader = null;

                // set the shared state influence leader for this area
                if( influences.length ){
                    let mostInfluence = this.playerWithMostInfluence( influences );
                    if( mostInfluence ) leader = mostInfluence;
                    else if( this.area.owner ) leader = this.area.owner;
                }

                this.shared.areaLeaders[this.area.name] = leader;
            },


            /**
             * Add the players who have used this area's skill to our stats
             * return {[]}
             */
            getSkillsStats( stats ){
                Object.values( this.shared.data.factions ).forEach( faction => {

                    // if this faction hans't used this skill, abort
                    if( !faction.usedSkills.includes( this.area.name ) ) return;

                    // otherwise flag this faction as having used this skill
                    stats.push({
                        name : 'skill',
                        owner : faction.name,
                        title : 'skill used',
                        description : `the ${faction.name} have used this area's skill`
                    });

                });

                return stats;
            },


            /**
             * Add any targets and faction flags to our stats
             * @returns {[]}
             */
            getTargetStats( stats ){

                Object.values( this.shared.data.factions ).forEach( faction => {
                    // Hax0red?
                    if( faction.hax0red?.includes( this.area.name )){
                        stats.push({
                            name : 'hax0red',
                            owner : faction.name,
                            title : 'hax0red',
                            description : `the ${faction.name} have hax0red this area`
                        });
                    }

                    // Raised dead?
                    if( faction.raiseAreas?.includes( this.area.name )){
                        stats.push({
                            name : 'raise',
                            owner : faction.name,
                            title : 'raise',
                            description : `the ${faction.name} have raised the dead in this area`
                        });
                    }

                    // smoke?
                    if( faction.smokeAreas?.includes( this.area.name )){
                        stats.push({
                            name : 'smoke',
                            owner : faction.name,
                            title : 'smoke',
                            description : `the ninjas have set off a smoke bomb in this area`
                        });
                    }

                    // target?
                    if( faction.cards.target.length
                        && this.shared.canSeeTarget( faction )
                        && faction.cards.target[0].target === this.area.name ){
                            stats.push({
                                name : 'target',
                                owner : faction.name,
                                title : 'target',
                                description : `The ${faction.name} are targeting this area, whomever controls this area at the end of the turn gains +1 AP`
                            });
                    }
                });

                return stats;
            }

        },

        computed : {
            area(){
                return this.shared.data.areas[this.areaName] ?? this.shared.data.ignoredAreaData[this.areaName];
            },

            playerCount(){
                return this.shared.data.playerOrder.length;
            },

            revealedTokensCount(){
                let revealedTokens = this.area.tokens.filter(token => token.revealed);
                return revealedTokens.length;
            },

            willBattle(){
                if(this.shared.data.tokenLayawayCombat){
                    return this.revealedTokensCount >= (this.playerCount - 1);
                }
                return this.area.battle;
            },

            /**
             * Does this area have any actions that may be taken here by the active player?
             * @returns {boolean}
             */
            hasActions(){
                // if there are no actions to be taken, then obviously nope
                if( !this.shared.actions ) return false;

                // xavier action
                if( this.shared.actions.xavier === this.area.name ) return true;

                // check all of our area actions
                for( let [name, action] of Object.entries( this.shared.actionTypes ) ){
                    if( !action.areaAction ) continue;
                    if( this.shared.actions[name]?.includes( this.area.name ) ) return true;
                }
            },


            /**
             * Is there a killed plant in this area?
             * @returns {boolean}
             */
            killedPlant(){
                if( !this.shared.data.factions['plants'] ) return false;
                return _.factionAreasWithDead( this.shared.data.factions['plants'], { basic: true } ).includes( this.area.name );
            },


            /**
             * Should we show Xavier?
             * @returns {boolean}
             */
            showXavier(){
                return this.shared.showXavier && this.xavier;
            },


            /**
             * Returns xavier blackstone if he is in this area
             * @returns {Unit|null}
             */
            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.faction.units.find( unit => unit.type === 'champion' && unit.location === this.area.name );
            },


            /**
             * Returns the token for this area, is any
             * @returns {Token|null}
             */
            token(){
                if( this.shared.token && this.shared.token.place === this.area.name ){
                    return this.shared.token;
                }
            },

            /**
             * Tallys the influence in this area and updates our shared state with the current area leader
             * @returns {[]}
             */
            influence(){
                let influences = _.eachInfluenceInArea( this.area, this.shared.data.factions );

                // set shared leader
                this.setSharedAreaLeader( influences );

                return influences;
            },


            /**
             * Returns the number of units webbed in this area
             * @returns {number}

            webbed(){
                if( !this.shared.data.factions['spiders'] ) return 0;
                return _.webbedUnits( this.shared.data.factions['spiders'], { area : this.area.name } ).length;
            },
             */

            /**
             * Tally each player's kills in this area, or return false if there are no killed units here
             * @returns {object|false}
             */
            graveyard(){
                let dead = {};

                Object.values( this.shared.data.factions ).forEach( faction => {
                    let kills = _.factionKillCountInArea( faction, this.area, this.shared.data.factions );
                    if( kills ) dead[faction.name] = kills;
                });

                return Object.keys( dead ).length ? dead : false;
            },


            /**
             * Returns the faction who has exterminated this area, if any
             * @returns {string|null}
             */
            exterminated(){
                return _.areaExterminated( this.area, this.shared.data.factions  );
            },


            /**
             * Returns our class string
             * @returns {string}
             */
            computedClasses(){
                let classes = `area-map-${this.area.name}`;
                if( this.opacity || (this.shared.actions && !this.hasActions ) ){
                    classes += ' opacity-4'
                }

                if( this.area.ignored ){
                    classes += ' opacity-4';
                }

                return classes;
            },


            stats(){
                let stats = [];

                // target stats
                stats = this.getTargetStats( stats );

                // get used skills
                stats = this.getSkillsStats( stats );

                // card effects
                this.area.cards.forEach( card => stats.push({
                    name : card.class,
                    owner : card.owner,
                    title : card.name,
                    description : card.description
                }));

                // token effects
                this.area.tokens.forEach( token => {
                    if( token.areaStat && token.revealed ) stats.push({
                        name : token.name,
                        owner : token.faction,
                        title : token.name,
                        description : token.description
                    });
                });

                return stats;
            }
        }
    }
</script>


<style>
    .influence-marker {
        width: 1em;
        height: 1em;
    }

    .area-map__blocked {
        width: 70%;
        height: 70%;
        border-radius: 1rem;
        font-size: 4rem;
        background-color: rgba(0,0,0,.7);
        box-shadow: 0px 0px 6px rgba(0,0,0,.5);
    }

    .area-map-container {
        width: 33%;
        height: 33%;
        padding: .40rem;
    }

    .area-map__core-content-container {
        padding: 3.5em .75em 2em;
    }

    .area-map__xavier {
        top: 60%;
    }

    .stat-icon {
        width: 1.5em;
        height: 1.5em;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0,0,0,.8);
        border-radius: .25em;
        margin: 0 .1em;
        font-size: 1.2rem;
    }

    .area-map__toggle {
        display: flex;
        padding: .45vw;
        z-index: 3;
    }

    .area-map__owner-wrap {
        position: absolute;
        top:0;
        left:0;
        transform: translate(-15%,-15%);
        display: flex;
    }

    .area-map__owner-portrait {
        width: 2.5rem;
        height: 2.5rem;
        border: 2px solid rgba(255,255,255,1);
        outline: 3px solid rgba(0,0,0,.5);
    }

    .area-map__conquered-icon {
        display: flex;
        align-items: center;
        background-color: rgb(72 62 0);
        padding: .25rem;
        box-shadow: inset 0px 0px 1px rgba(0,0,0,1), inset 0px 0px 2px rgba(0,0,0,1), 0px 0px 4px rgba(0,0,0,1);
        border: 2px solid;
    }

  .area-map__exterminated {
        width: 2.5rem;
        height: 2.5rem;
        position: absolute;
        z-index: 1000;
        border: 2px solid rgba(255,255,255,1);
        outline: 3px solid rgba(0,0,0,.5);
    }

    .area-map__battle-marker {
        width: 2.5rem;
        height: 2.5rem;
    }

    .area-map__battle-marker-container {
        position: absolute;
        bottom:0;
        left:0;
        transform: translate(-15%,15%);
        z-index: 1000;
    }


    .area-map__graveyard {
        background-color: rgba(0,0,0,.8);
        padding: .25em;
        align-items: center;
        justify-content: center;
        color: var(--highlight-color);
        border-radius: .2em;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        position: absolute;
        right: 3px;
        top: 50%;
        z-index: 1000;
    }

    .area-map__graveyard .icon-web {
        color: var(--faction-spiders);
    }

    .area-map__graveyard-count {
        text-align: center;
        font-weight: 700;
    }

    .area-map__influence {
        background-color: rgba(0,0,0,.8);
        padding: .25em;
        align-items: center;
        justify-content: center;
        color: var(--highlight-color);
        border-radius: .2em;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        position: absolute;
        left: 3px;
        top: 50%;
        z-index: 1000;
    }

    .area-map__influence-count {
        text-align: center;
        font-weight: 700;
    }

    .area-map__exterminated {
        bottom: 0;
        right:0;
        transform: translate(15%,15%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8em;
        background-color: black;
    }

    .area-map {
        background-position: center top, center;
        background-repeat: no-repeat, no-repeat;
        background-size: 100% 2vw, cover;
        box-shadow: inset 0 0 0px 4px rgba(0,0,0,.5);
        border: 2px solid rgba(255,255,255,.3);
        transition: opacity .1s;
    }

    .church-container { order: 1; }
    .area-map-church {
        background-image: url(/images/areas/church-tokens.png), url(/images/areas/church-bg.jpg);
    }

    .sewers-container { order: 2; }
    .area-map-sewers {
        background-image: url(/images/areas/sewers-tokens.png),url(/images/areas/sewers-bg.jpg);
    }


    .police-container { order: 3; }
    .area-map-police {
        background-image: url(/images/areas/police-tokens.png),url(/images/areas/police-bg.jpg);
    }

    .subway-container { order: 4; }
    .area-map-subway {
        background-image: url(/images/areas/subway-tokens.png),url(/images/areas/subway-bg.jpg);
    }


    .capitol-container { order: 5; }
    .area-map-capitol {
        background-image: url(/images/areas/capitol-tokens.png),url(/images/areas/capitol-bg.jpg);
    }


    .laboratory-container { order: 6; }
    .area-map-laboratory {
        background-image: url(/images/areas/laboratory-tokens.png),url(/images/areas/laboratory-bg.jpg);
    }


    .university-container { order: 7; }
    .area-map-university {
        background-image: url(/images/areas/university-tokens.png),url(/images/areas/university-bg.jpg);
    }

    .factory-container { order: 8; }
    .area-map-factory {
        background-image: url(/images/areas/factory-tokens.png),url(/images/areas/factory-bg.jpg);
    }

    .bank-container { order: 9; }
    .area-map-bank {
        background-image: url(/images/areas/bank-tokens.png),url(/images/areas/bank-bg.jpg);
    }

</style>

