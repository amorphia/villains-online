<template>
    <transition name="right">
        <div v-if="player" class="view-player pos-absolute width-100 height-100 top-0 p-5 d-flex align-stretch overflow-auto z-5">
            <button class="toggle fixed top right icon-x"
                    @click="closeViewPlayer"
            ></button>

                <div class="view-player__main-content width-55 pt-4 pr-5 pb-6">

                    <div class="d-flex">
                        <div class="view-player__title width-100 pos-relative">
                            <i v-if="shared.isFirstPlayer( player )" class="first-player icon-key"></i>{{ player.name | startCase }}
                            <div v-if="shared.player.id !== player.id && shared.faction.resources" class="bribe-box pos-absolute top-0 right-0 d-flex align-baseline">
                                <i :disabled="bribe === 0" @click="bribe--" class="icon-minimize pr-2"></i>
                                <img class="icon-image ml-3" src="/images/icons/resource.png">
                                <div class="ml-2 current-bribe mr-3">{{ bribe }}</div>
                                <i :disabled="bribe >= shared.faction.resources" @click="bribe++" class="icon-maximize"></i>
                                <span :disabled="bribe === 0" class="pointer ml-3" @click="sendBribe">SEND BRIBE</span>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex flex-wrap view-player__core-stats my-6">
                        <div class="view-player__AP view-player__title width-50 d-flex align-center">
                            <i class="icon-ap mr-3"></i>
                            <span>{{ faction.ap }}</span>
                            <span class="note">/ {{ shared.data.maxAP }}</span>
                            <i v-if="shared.admin" :disabled="faction.ap === 0" @click="setPoints( 'ap', -1)" class="icon-minimize pr-2"></i>
                            <i v-if="shared.admin" @click="setPoints( 'ap', 1)" class="icon-maximize pr-2"></i>
                        </div>
                        <div class="view-player__PP view-player__title width-50 d-flex align-center">
                            <i class="icon-pp mr-3"></i>
                            <span>{{ faction.pp }}</span>
                            <span class="note">/ {{ shared.data.maxPP }}</span>
                            <i v-if="shared.admin" :disabled="faction.pp === 0" @click="setPoints( 'pp', -1)" class="icon-minimize pr-2"></i>
                            <i v-if="shared.admin" @click="setPoints( 'pp', 1)" class="icon-maximize pr-2"></i>
                        </div>
                        <div class="view-player__energy view-player__title width-50">Energy: <span>{{ faction.energy }}</span> <span class="note">/ {{ faction.maxEnergy }}</span>
                            <i v-if="shared.admin" :disabled="faction.energy === 0" @click="setPoints( 'energy', -1)" class="icon-minimize pr-2"></i>
                            <i v-if="shared.admin" @click="setPoints( 'energy', 1)" class="icon-maximize pr-2"></i>
                        </div>
                        <div class="view-player__resources view-player__title width-50">Resources: <span>{{ faction.resources }}</span>
                            <i v-if="shared.admin" :disabled="faction.resources === 0" @click="setPoints( 'resources', -1)" class="icon-minimize pr-2"></i>
                            <i v-if="shared.admin" @click="setPoints( 'resources', 1)" class="icon-maximize pr-2"></i>
                        </div>
                        <div class="view-player__resources view-player__title width-50"> Upgrade: <span>{{ faction.upgrade ? faction.upgrade : 'none' }}</span></div>
                        <div class="view-player__hand view-player__title width-50">Cards in hand: <span>{{ faction.cards.hand.length }}</span> <span class="note">/ +{{ faction.cardDraw }}</span></div>
                        <div class="view-player__deploy view-player__title width-50">Deploy Limit: <span>{{ faction.deployLimit }}</span></div>
                        <div class="view-player__defense-bonus view-player__title width-50">Defense Bonus: <span>+{{ defenseBonus }}</span></div>
                        <div class="view-player__attack-bonus view-player__title width-50">Attack Bonus: <span>+{{ faction.attackBonus }}</span></div>
                        <div class="view-player__bonus-dice view-player__title width-50">Bonus Attack Dice: <span>+{{ faction.bonusDice }}</span></div>
                        <div class="view-player__captured view-player__title width-100">Captured Markers: <span>{{ faction.captured.current }} / {{ faction.captured.max }}</span></div>
                    </div>


                    <div class="view-player__title">Plan Focus:</div>
                    <div class="prompt-question p-4">{{ faction.focusDescription }}
                        <component v-if="faction.focus" :is="faction.focus" :faction="faction"></component>
                    </div>


                    <div v-if="target">
                        <div class="view-player__title">Current Target:</div>
                        <div class="view-player__active-cards">
                            <img class="view-player__card pointer"
                                 @click="shared.card = `/images/cards/${target.file}.jpg`"
                                 :src="`/images/cards/${target.file}.jpg`">
                        </div>
                    </div>

                    <div class="view-player__title">Active Cards:</div>
                    <div v-if="faction.cards.active.length" class="view-player__active-cards">
                        <img v-for="card in faction.cards.active" class="view-player__card pointer"
                             @click="shared.card = `/images/cards/${card.file}.jpg`"
                             :src="`/images/cards/${card.file}.jpg`">
                    </div>
                    <div v-else class="view-player__empty">No Active Cards</div>


                    <div class="view-player__title">Areas Controlled:</div>
                    <div v-if="areas.length" class="view-player__areas">
                        <div v-for="area in areas" class="view-player__areas">
                            <div class="view-player__areas-name">{{ area.name }}</div>
                            <div class="view-player__areas-control">{{ area.control }}</div>
                        </div>
                    </div>
                    <div v-else class="view-player__empty">No Areas Controlled</div>

                    <div class="view-player__title">Unrevealed Tokens:</div>
                    <div v-if="unrevealedTokens" class="view-player__tokens d-flex justify-center">
                        <div v-for="(count, type) in unrevealedTokens"
                             class="view-player__token-wrap p-2 ratio-square pos-relative">
                            <div class="width-100 pos-relative height-100">
                                <div class="view-player__token" :data-count="count" >
                                    <img class="view-player__token"
                                         :src="`/images/factions/${faction.name}/tokens/${type}.png`">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="view-player__empty">No Unrevealed Tokens</div>

                    <div class="view-player__title">Current Upgrade:</div>
                    <div v-if="faction.upgrade" class="view-player__areas">
                        <div class="view-player__upgrade-card p-3 center-text">
                            <img class="view-player__upgrade-card-image width-80" :src="`/images/factions/${faction.name}/upgrade-${faction.upgrade}.jpg`">
                        </div>
                    </div>
                    <div v-else class="view-player__empty">No Upgrade</div>

                    <div class="view-player__title">Areas Skills Used:</div>
                    <div v-if="faction.usedSkills.length" class="view-player__areas">
                        <div v-for="area in faction.usedSkills" class="view-player__areas">
                            <div class="view-player__areas-name">{{ area }}</div>
                        </div>
                    </div>
                    <div v-else class="view-player__empty">No Skills Used</div>


                    <div class="view-player__title">Capitol Tokens:</div>
                    <div v-if="faction.capitolTokens.length" class="view-player__capitol-tokens d-flex justify-center">
                        <div v-for="token in faction.capitolTokens" class="view-player__capitol-token center-text p-3">
                            <img class="view-player__capitol-token__image"
                                 :src="`/images/tokens/capitol-${token.turn}.png`">
                            <div class="view-player__capitol-token__value">{{ token.ap }} AP</div>
                        </div>
                    </div>
                    <div v-else class="view-player__empty">No Capitol Tokens</div>


                    <div class="view-player__title">Completed Plans:</div>
                    <div v-if="completedPlans" class="view-player__completed-plans py-4">

                        <div v-for="(plans, turn) in completedPlans" class="completed-plan__block">
                            <div class="prompt-question center-text">TURN {{ turn }}</div>

                            <div class="d-flex flex-wrap">
                                <div v-for="plan in plans" class="plan-block__container d-flex my-3">
                                    <div class="plan-block__pips">
                                        <div v-for="test in plan.objectives" class="plan-block__pip primary-light" :class="{ 'icon-circle' : test.passed, 'icon-circle-open' : !test.passed, 'highlight' : test.scoreable }"></div>
                                    </div>
                                    <div class='plan-block__image-wrap pos-relative'>
                                        <img class="completed-plans__points" :src="`/images/icons/pp-${plan.points}.png`">
                                        <img class="plan-block__image" :src="`/images/factions/${faction.name}/plans/${plan.num}.jpg`">
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                    <div v-else class="view-player__empty">No Completed Plans</div>


                </div>


            <div class="view-player__side width-45 height-100 pt-4 pl-3 pb-6">
                <div class="view-player__title">Faction Sheet:</div>
                <img :src="`/images/factions/${faction.name}/sheet.jpg`" class="my-5" >

                <div class="view-player__title mt-5">Unit Mix:</div>
                <div class="view-player__units d-flex mb-4 justify-center align-start">
                    <div v-for="(count, type) in shared.groupByCount( faction.units, 'type' )"
                         class="view-player__token-wrap p-2 pos-relative d-flex flex-column">

                        <div class="width-100 pos-relative ratio-square">
                            <div class="view-player__unit" :data-count="count" >
                                <img class="view-player__unit-image"
                                    :src="`/images/factions/${faction.name}/units/${type}.png`">
                            </div>
                         </div>

                        <div v-if="faction.flippedUnits && faction.flippedUnits.includes( type )" class="width-100 pos-relative ratio-square">
                            <div class="view-player__unit">
                                <img class="view-player__unit-image"
                                     :src="`/images/factions/${faction.name}/units/${type}-flipped.png`">
                            </div>
                        </div>

                    </div>
                </div>

                <div class="view-player__title mt-5">Token Mix:</div>
                <div class="view-player__tokens d-flex mb-4 justify-center">
                    <div v-for="(count, type) in shared.groupByCount( faction.tokens, 'name' )"
                         class="view-player__token-wrap p-2 ratio-square pos-relative">
                        <div class="width-100 pos-relative height-100">
                            <div class="view-player__token" :data-count="count" >
                                <img class="view-player__token"
                                    :src="`/images/factions/${faction.name}/tokens/${type}.png`">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="view-player__title mt-5">Upgrades:</div>
                <div class="view-player__upgrades d-flex justify-center">
                    <div class="view-player__upgrade-card width-50 p-3">
                        <img class="view-player__upgrade-card-image" :src="`/images/factions/${faction.name}/upgrade-1.jpg`">
                    </div>
                    <div class="view-player__upgrade-card width-50 p-3">
                        <img class="view-player__upgrade-card-image" :src="`/images/factions/${faction.name}/upgrade-2.jpg`">
                    </div>
                </div>


                <div class="view-player__title mt-5">Plans:</div>
                <div class="view-player__upgrades d-flex flex-wrap">
                    <div class="width-50 p-3" v-for="index in 8">
                        <img class="width-100 radius-1" :src="`/images/factions/${faction.name}/plans/${index}.jpg`">
                    </div>
                </div>

            </div>

        </div>
    </transition>
</template>


<script>
    export default {

        name: 'view-player',

        data() {
            return {
                shared : App.state,
                player : null,
                bribe : 0,
            };
        },

        created(){
            this.shared.event.on( 'viewPlayer', this.setViewPlayer );
            this.shared.event.on( 'viewArea', () => this.player = null );
        },


        computed : {

            completedPlans(){
                return _.groupBy( this.faction.plans.completed, 'turnScored' );
            },

            target(){
                if( !this.faction.cards.target || !this.shared.canSeeTarget( this.faction ) ) return;
                return this.faction.cards.target[0];
            },

            defenseBonus(){
                let bonus = this.faction.defenseBonus;
                if( this.faction.factionDefenseBonus ) bonus += this.faction.factionDefenseBonus;
                return bonus;
            },
            areas(){
                let areaNames = _.factionAreas( this.faction, this.shared.data.areas );
                let areas = [];
                areaNames.forEach( area => areas.push( this.shared.data.areas[area] ));
                return areas;
            },

            unrevealedTokens(){
                let tokens = this.faction.tokens.filter( token => !token.revealed );
                return this.shared.groupByCount( tokens, 'name' );
            },

            faction : {
                get() { return this.shared.getPlayerFaction( this.player );},
                set( newValue ) {}
            },
        },

        watch : {
            player(){
                App.event.emit( 'sound', 'ui' );
            }
        },

        methods : {

            setPoints( type, val ){
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'setPoints', {
                    faction : this.faction.name,
                    type: type,
                    val: val
                });
            },

            sendBribe(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'sendBribe', this.faction.name, this.bribe );
                this.bribe = 0;
            },

            closeViewPlayer(){
                this.player = null;
                this.faction = null;
                App.event.emit( 'showChatIcon' );
            },

            setViewPlayer( player ){

                if( this.player && this.player.id === player.id ){
                    this.closeViewPlayer();
                    return
                }

                this.player = player;
            }
        }
    }
</script>


<style>

    .icon-image {
        height: 1.4em;
        margin: 0 .1em;
        position: relative;
        top: .3em;
    }

    .view-player {
        background-image : url('/images/factory-background.jpg');
        background-position: center;
        background-size: cover;
        z-index: 3;
    }

    .view-player__unit-image {
        width: 100%;
        border: 1.5px solid rgba(0,0,0,.1);
    }

    .view-player__token-wrap, .view-player__unit-wrap {
        width: 6vw;
    }

    .view-player__token, .view-player__unit {
        position: absolute;
        width: 100%;
        height: 100%;
        max-width: 6vw;
        max-height: 6vw;
        top: 0;
        left: 0;
        border: 1.5px solid rgba(0,0,0,.1);
    }

     .view-player__upgrade-card-image{
         border: 3px solid rgba(0,0,0,.2);
         border-radius: 5%/8%;
     }

    .view-player__token {
        border-radius: 50%;
    }

    .view-player__title {
        letter-spacing: 1px;
        margin-bottom: .5em;
        border-bottom: 1px solid;
        border-left: 1px solid;
        font-size: 1.2em;
        text-transform: uppercase;
        padding: .2em .5em;
        margin-top: .5em;
        white-space: nowrap;
        font-family: var(--secondary-font);
        border-color: #e953cd;
        font-weight: 200;
    }

    .view-player__title span {
        font-family: var(--primary-font);
        color: var(--highlight-color);
        font-size: 1.3em;
    }

    .view-player__title span.note {
        color: var(--off-white);
        font-size: .85em;
    }


    .view-player__core-stats .view-player__title {
        margin: 0;
    }

    .view-player__empty {
        padding: 1vw;
        font-size: 1.3em;
        text-align: center;
        color: var(--primary-light-color);
    }

    .view-player .icon-ap,  .view-player .icon-pp {
        width: 2.3rem;
        position: relative;
        height: 2.3rem;
        display: inline-block;
    }

    .view-player .icon-ap:before, .view-player .icon-pp:before {
        width: 100%;
        height: 100%;
        display: inline-block;
        position: absolute;
        bottom: 0;
    }

    .view-player__areas {
        padding: 1vw;
        font-size: 1.3em;
        color: var(--highlight-color);
        text-align: center;
        text-transform: capitalize;
    }

    .view-player__card {
        width: 11.5rem;
        border-radius: 11%/8%;
        border: 2px solid rgba(0,0,0,.2);
        margin: 0 .2rem;
    }

    .view-player__areas-control {
        font-size: 0.7em;
        color: var(--primary-light-color);
        letter-spacing: 1px;
    }

    .view-player__capitol-token__image {
        width: 5.5rem;
        border-radius: 50%;
        border: 3px solid rgba(0,0,0,.3);
    }

    .completed-plans__points {
        position: absolute;
        bottom: .5rem;
        z-index: 4;
        left: 50%;
        transform: translateX(-50%);
        width: 4rem;
    }

</style>

