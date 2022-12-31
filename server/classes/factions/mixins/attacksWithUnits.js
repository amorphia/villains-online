let obj = {

    /**
     * Can we activate a battle token in this area?
     *
     * @param token
     * @param area
     * @returns {boolean|*}
     */
    canActivateBattle( token, area ){
        return area.canBattle();
    },


    /**
     * Handle activating a battle token
     *
     * @param args
     */
    async activateBattleToken( args ) {

        // resolve a battle in this area
        await this.game().battle( args.area );

        // handle onActivateToken triggers
        await this.handleAfterActivateTokenTriggers( args );

        // advance the game
        this.game().advancePlayer();
    },


    /**
     * Make an attack
     *
     * @param args
     *      area
     *      unit (optional)
     *      attacks
     */
    async attack( args ){

        // if we can't attack here, abort
        if( this.preventedFromAttacking( args ) ) return;

        // set any modifications to our args from attacking with a unit
        this.setUnitAttackArgs( args );

        // get our victim, or abort
        let victim = await this.setAttackTargets( args );
        if( !victim ) return;

        // apply swarm multi dice defense mod
        if( !args.deadly ) this.applyDroneDiceReduction( victim, args );

        // resolve attack
        let rolls = [].concat( _.roll( args.attacks.length, 10, this.game(), this ) );
        let toHit = this.getToHitNumber( args, victim );
        let hits = this.calculateHits( rolls, toHit );

        // resolve unit attack trigger, if applicable
        if( args.unit ) await this.unitTriggeredEvents('attack', [{ unit: args.unit }] );

        // report attack results
        let attackResult = {
            faction : this.name,
            area : args.area.name,
            type : 'attack',
            unit : args.unit,
            targetUnit : args.targetUnit,
            victim : victim.name,
            rolls : rolls,
            toHit : toHit,
            hits : hits
        };

        this.game().message( attackResult );
        if( this.game().data.combat ) this.game().data.combat.lastAttack = attackResult;

        // resolve hits
        let resolveHitsResult = await this.handleAttackHits( hits, victim, args );

        // return results
        return attackResult;
    },


    /**
     * Are we prevented from making this attack?
     *
     * @param args
     * @returns {boolean}
     */
    preventedFromAttacking( args ){
        // do we even have a valid attack set?
        if( !args.attacks.length ){
            this.game().message({ class : 'warning', message : 'Invalid attack value' });
            return true;
        }

        // if this is a unit attacking, but there is a cease fire in the area abort
        if( args.unit && args.area.hasCard( 'cease-fire' ) ){
            this.game().message({ class : 'warning', message : 'Cease fire prevents unit from attacking' });
            return true;
        }
    },


    /**
     * Make any modifications we need to to our attack args when attacking with a unit
     *
     * @param args
     * @returns {*}
     */
    setUnitAttackArgs( args ){
        // if we aren't attacking with a unit, abort
        if( !args.unit ) return;

        // if this is an attack from a deadly unit, set deadly in our args
        if( args.unit.deadly ) args.deadly = true;

        // if this is a non-deadly unit attacking, set bonus dice
        // if( !args.deadly ) args.attacks = this.addBonusDiceToAttack( args.attacks.slice(), args.bonusDice, args.area );

        // if this is a unit attacking, set bonus dice
        args.attacks = this.addBonusDiceToAttack( args.attacks.slice(), args.bonusDice, args.area );
    },


    /**
     * Add any bonus dice to this attack
     *
     * @param attacks
     * @param bonusDice
     * @param area
     * @returns {*}
     */
    addBonusDiceToAttack( attacks, bonusDice, area ){

        // get our bonus dice count
        let totalBonus = this.calculateBonusDice( attacks, bonusDice, area );

        // apply bonus dice
        if( totalBonus ){
            let attackVal = attacks[0];
            while( totalBonus ){
                attacks.push( attackVal );
                totalBonus--;
            }
        }

        return attacks;
    },


    /**
     * Calculate how many bonus dice to add to this attack
     *
     * @param attacks
     * @param bonusDice
     * @param area
     * @returns {number}
     */
    calculateBonusDice( attacks, bonusDice, area ){
        let totalBonus = 0;

        // if we have basic bonus dice add them in
        if( this.data.bonusDice ) totalBonus += this.data.bonusDice;

        // if we get bonus dice in unconquered areas and our area is unconquered then add them in too
        if( this.data.bonusDiceInUnconquered && !area.data.conquered  ) totalBonus += this.data.bonusDiceInUnconquered;

        // if we were passed any additional manual bonus dice, then sure, add those in too
        if( bonusDice ) totalBonus += bonusDice;

        return totalBonus;
    },


    /**
     * Set the target for our attack
     *
     * @param args
     * @returns {object|Faction}
     */
    async setAttackTargets( args ){
        // if this is a deadly attack we don't have a target
        if( args.deadly ) return { deadly : true, name : 'deadly' };

        // if we can choose the specific unit we want to attack do so now
        if( this.canChooseUnitAsAttackTarget( args ) ) {
            return this.chooseUnitAsAttackTarget( args );
        }

        // otherwise choose a faction to attack
        return await this.chooseFactionToAttack( args );
    },


    /**
     * Can we choose a specific unit to target with this attack?
     *
     * @param args
     * @returns {boolean}
     */
    canChooseUnitAsAttackTarget( args ){
        return args.chooseUnitTarget && this.enemyUnitTypesInArea( args.area, { basic : true } ).length > 0;
    },

    /**
     * Choose a unit to attack with this attack
     *
     * @param args
     * @returns {Faction}
     */
    async chooseUnitAsAttackTarget( args ){
        // otherwise we can choose a specific unit to attack
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : [args.area.name],
            enemyOnly : true,
            basicOnly : true,
            notHidden : true,
            message: "Choose a basic unit to attack"
        });

        // set the target unit to our args
        args.targetUnit = this.game().objectMap[ data.units[0] ];

        // and return that unit's owner
        return this.game().factions[ args.targetUnit.faction ];
    },


    /**
     * Choose the victim for our attack
     *
     * @param args
     * @returns {string|Faction}
     */
    async chooseFactionToAttack( args ){

        let message = '';
        args.attacks.forEach( n => message += `xA${n}x` );
        message = `Choose player to target with your attack of ${ message }`;

        // choose our target faction
        args.notHidden = true;
        let victim = await this.selectEnemyPlayerWithUnitsInArea( args.area, message, args );

        // if we declined, return "declined"
        if( victim === 'declined' ){
            this.message( `declines to attack` );
            return;
        }

        // if we didn't have a victim to choose from, return
        if( !victim ){
            this.game().message({ class : 'warning', message: `No units in the ${args.area.name} to attack` });
            return;
        }

        return victim;
    },


    /**
     * Select an enemy player with units in the given area
     *
     * @param area
     * @param message
     * @param args
     * @returns {Faction|string}
     */
    async selectEnemyPlayerWithUnitsInArea( area, message, args = {} ){
        let player, response;

        // grab our area instance if needed
        if( typeof area !== 'string' ) area = area.name;

        // factions to exclude from our selection
        let factionsToExclude = this.getFactionsToExcludeFromSelection( args );

        // find factions with units in this area
        let targetFactions = _.factionsWithUnitsInArea( this.game().factions, area, {
            exclude : factionsToExclude,
            notHidden : args.notHidden ?? false,
            basic : args.basic,
            types : args.types
        });

        if( !targetFactions.length ) return;

        // if we have only one option, and we must choose a faction then just return that faction
        if( targetFactions.length === 1 && !args.optional ) {
            return this.game().factions[ targetFactions[0] ];
        }

        let controllingFaction = args.controllingFaction ?? this;

        [player, response] = await this.game().promise({
            players: controllingFaction.playerId,
            name: 'choose-victim',
            data : {
                areas : [area],
                faction: this.name,
                message: message,
                optional : args.optional,
                targetFactions : targetFactions,
                unitAttack : !!args.unit,
                attackBonus : args.attackBonus,
                allowHidden : args.allowHidden,
            }
        }).catch( error => console.error( error ) );


        // if we decline, return declined
        if( response.declined ){
            return 'declined';
        }

        // otherwise return the selected faction instance
        return this.game().factions[ response.faction ];
    },


    /**
     * Apply our drone dice reduction to units that throw multiple dice
     *
     * @param victim
     * @param args
     */
    applyDroneDiceReduction( victim, args ){
        if( args.unit && victim.name === 'swarm' && args.attacks.length > 1 ){
            args.attacks = args.attacks.slice(1);
        }
    },


    /**
     * Returns the number we need to roll to score a hit with this attack
     *
     * @param args
     * @param victim
     * @returns {number}
     */
    getToHitNumber( args, victim ){
        // we start with our attack value
        let toHit = args.attacks[0];
        console.log("getToHitNumber start", toHit, args);

        // deadly attacks can't be modified, so just return our attack value
        // if( args.deadly ) return toHit;

        // subtract any attack bonuses set by our args
        if( args.attackBonus ) toHit -= args.attackBonus;
        console.log("getToHitNumber after args.attackBonus", toHit);

        // if we are attacking with a unit and our faction has a global attack bonus, apply it
        if( args.unit && this.data.attackBonus ) toHit -= this.data.attackBonus;

        // if we get a bonus for attacking with a unit having a given prop, apply it here
        if( args.unit && this.data.unitPropAttackBonus ){
            for( let prop in this.data.unitPropAttackBonus ) {
                if (args.unit[prop]) toHit -= this.data.unitPropAttackBonus[prop];
            }
        }

        // deadly attacks can't be negatively modified, so just return our attack value
        if( args.deadly ) return toHit;

        // finally if our target faction has a defense bonus apply that here
        let defenseBonus = _.calculateDefenseBonus( this.data, victim.data, args.area, { debug : true, unit : args.unit } );
        if( defenseBonus )  toHit += defenseBonus;

        console.log("getToHitNumber final", toHit);

        return toHit;
    },


    /**
     * Calculate how many hits we scored with this attack
     *
     * @param {number[]} rolls
     * @param {number} toHitNumber
     * @returns {number}
     */
    calculateHits( rolls, toHitNumber ){
        let hits = 0;

        rolls.forEach( roll => {
            this.data.hits.expected += this.getExpectedHits( toHitNumber );

            if( roll >= toHitNumber ) {
                this.data.hits.actual++;
                hits++;
            }
        });
        return hits;
    },

    getExpectedHits( toHitNumber ){
        if( toHitNumber > 10 ) return 0;
        if( toHitNumber <= 1 ) return 1;

        return (11 - toHitNumber) / 10;
    },

    /**
     * Returns an array of faction names to exclude from being selected
     *
     * @param args
     * @returns {string[]|Array}
     */
    getFactionsToExcludeFromSelection( args ){
        let factions = [ this.name ];

        // if we don't have any additional factions to exclude then return just us
        if( !args.exclude ) return factions;

        // if our factions to exclude isn't an array then push it to our array
        if( ! Array.isArray( args.exclude ) ){
            factions.push( args.exclude );
            return factions;
        }

        // otherwise merge the supplied exclude array to our existing array and return
        return _.concat( factions, args.exclude  );
    },


    /**
     * Resolve the hits from an attack
     *
     * @param hits
     * @param victim
     * @param args
     * @returns {object} // results
     */
    async handleAttackHits( hits, victim, args ){

        // if we scored no hits, abort
        if( !hits ){
            this.game().sound( 'wiff' );
            return;
        }

        // ka-pow!
        this.hitSound( hits );

        // if we attacked with a unit, check for any "onHit" triggered events
        if( args.unit ) await this.unitTriggeredEvents('hit', [{ unit: args.unit, hits: hits }] );

        // resolve our hits
        return await this.resolveAttackHits( hits, args, victim );
    },


    /**
     * Apply the hits we scored to the appropriate targets
     *
     * @param hits
     * @param args
     * @param victim
     * @returns {Promise<[]|string|*>}
     */
    async resolveAttackHits( hits, args, victim ){

        // if we targeted a specific unit with this attack assign our hits to that unit
        if( args.targetUnit ){
            this.game().message({ faction: this, message: `hits <span class="faction-${args.targetUnit.faction}">${args.targetUnit.faction} ${args.targetUnit.name}</span> in the ${args.area.name}` });
            return await this.game().assignHitsToUnit( args.targetUnit, this, hits, args );
        }

        // if this was a deadly attack assign our deadly hits to all enemy factions
        if ( args.deadly ){
            return await this.assignDeadlyHits( hits, args );
        }

        // otherwise the victim gets to assign their hits
        return await victim.assignHits( hits, args.area, this, args );
    },


    /**
     * Assign our deadly hits to all enemy players
     *
     * @param hits
     * @param args
     * @returns {[]} // an empty array
     */
    async assignDeadlyHits( hits, args ){
        let promises = [];

        // get our victims
        let factions = this.getTargetFactions( args.area );

        // let each victim assign their hits
        for( let factionName of factions ) {
            let faction = this.game().factions[factionName];
            promises.push( faction.assignHits( hits, args.area, this, args ) );
        }

        // wait for everyone to assign their hits
        await Promise.all( promises );
        return [];
    },


    /**
     * Emit the right number of crunchy attack noises depending on the number of successful hits
     *
     * @param hits
     */
    hitSound( hits ){
        let sound = this.getHitSound( hits );
        this.game().sound( sound );
    },


    /**
     * Get the sound file name that matches our number of hits
     * @param hits
     * @returns {string}
     */
    getHitSound( hits ){
        if( hits === 1 ) return  'hit';
        if( hits === 2 ) return 'hit2';
        return 'hit3';
    },


    /**
     * Get potential target factions in a given area
     *
     * @param area
     * @returns {*}
     */
    getTargetFactions( area ){
        // find valid players
        let targetFactions = _.factionsWithUnitsInArea( this.game().factions, area, {
            exclude : this.name,
            notHidden : true
        });

        // no enemies with units in the from location
        if( targetFactions.length === 0 ){
            this.game().message({ class : 'warning', message:  `No units in the ${area.name} to attack` });
            return;
        }

        return targetFactions;
    },


    /**
     * Assign hits from an attack
     *
     * @param hits
     * @param area
     * @param killer
     * @param args
     * @returns {string|undefined} // we either return undefined, or the string "kills" for reasons I don't quite recall
     */
    async assignHits( hits, area, killer, args ){

        // get our potential victims, and if we have none, abort
        let units = this.unitsInArea( area, { notHidden : true } );
        if( !units.length ){
            this.game().message({ class : 'warning', message: `No units in the ${area.name} to assign hits to` });
            return;
        }

        // prompt our player to assign the hits
        let response = await this.prompt( 'assign-hits', {
            area : area.name,
            hits : hits,
            unit : args.unit,
            seeking : args.seeking || (args.unit && args.unit.seeking )
        });


        // if we decided to buy off some hits, pay the costs here
        if( response.cost > 0 ){
            this.payCost( response.cost, true );
        }

        // assign hits to smoke instead?
        //if( this.smokeScreenAttack( response, killer ) ) return;

        // resolve our hit assignment
        return await this.resolveHitAssignment( response, killer, area, args );
    },


    /**
     * Resolve the hits we assign to our victim units
     *
     * @param response
     * @param killer
     * @param area
     * @param args
     * @returns {string|undefined} // we either return undefined, or the string "kills" for reasons I don't quite recall
     */
    async resolveHitAssignment( response, killer, area, args ){
        let hasKill;

        // cycle through the units chosen as victims and apply the appropriate hits
        let results = [];

        if(response.targets.some( target => target.id === "smoke")){
            let ninjas = this.game().factions['ninjas'];
            ninjas.clearSmokeFromAreas(area);
        }

        for( let target of response.targets ){

            // if we are are assigning a hit to a smoke token, remove it
            if(target.id === 'smoke'){
                continue;
            }

            // get our unit object
            let unit = this.game().objectMap[ target.id ];

            // assign hits to that unit
            let result = await this.game().assignHitsToUnit( unit, killer, target.hits, args );

            // if we killed the unit, set hasKill to "kills"
            if( result === 'kills' ) hasKill = result;

            // add to our message string to our results
            results.push( `${result} <span class="faction-${this.name}">${unit.name}</span>` );
        }

        // display our results
        if( results.length ){
            this.game().message({ faction: killer, message: `${results.join(', ')} in the ${area.name}` });
        }

        return hasKill;
    },


    /**
     * Apply damage from this attack to a smokescreen, if applicable
     *
     * @param data
     * @param killer
     * @returns {boolean}

    smokeScreenAttack( data, killer ){
        // if the target of this attack isn't a smoke token, return
        if( !data.targets[0] || data.targets[0].id !== 'smoke' ) return;

        // clear the smoke from this area
        let ninjas = this.game().factions['ninjas'];
        ninjas.data.smokeAreas = ninjas.data.smokeAreas.filter( area => area !== data.area );

        this.game().message({ faction: killer, message: `Gets lost in the ninjas smoke` });

        return true;
    },
    */

};

module.exports = obj;

