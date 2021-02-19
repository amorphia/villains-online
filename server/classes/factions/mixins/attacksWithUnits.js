let obj = {

    async selectEnemyPlayerWithUnitsInArea( area, message, args ){
        let player = {}, data = {}, targetFaction, selfAttack, exclude = [];
        if( typeof area !== 'string' ) area = area.name;


        if( args.exclude ){
            if( ! Array.isArray( args.exclude ) ) exclude.push( args.exclude );
            else exclude = _.concat( exclude, args.exclude  );
        }

        exclude.push( this.name );

        // find valid players
        let targetFactions = _.factionsWithUnitsInArea( this.game().factions, area, { exclude : exclude, notHidden : args.notHidden, basic : args.basic, types : args.types });

        // no enemies with units in the from location
        if( targetFactions.length === 0 ){
            // if this attack forces a self attack return this faction as the victim, otherwise return false
            return args.selfAttack ? this : false;
        }

        if( targetFactions.length === 1 && !args.optional ) {
            return this.game().factions[ targetFactions[0] ];
        }

        [player, data] = await this.game().promise({ players: this.playerId, name: 'choose-victim', data : {
                areas : [area],
                faction: this.name,
                message: message,
                optional : args.optional,
                targetFactions : targetFactions,
                unitAttack : !!args.unit,
                attackBonus : args.attackBonus
            }}).catch( error => console.error( error ) );

        if( data.declined ){
            return 'declined';
        }

        return this.game().factions[ data.faction ];
    },


    getTargetFactions( area ){
        // find valid players
        let targetFactions = _.factionsWithUnitsInArea(
            this.game().factions,
            area,
            { exclude : this.name, notHidden : true }
        );

        // no enemies with units in the from location
        if( targetFactions.length === 0 ){
            this.game().message({ class : 'warning', message:  `No units in the ${area.name} to attack` });
            return;
        }

        return targetFactions;
    },


    async nonCombatAttack( attack, count, area ){
        let output = [];
        let targetFactions = this.getTargetFactions( area );

        if( ! targetFactions ){
            return;
        }

        // if we only have one target, bundle up the attacks
        if( targetFactions.length === 1 ){
            let attacks = Array( count ).fill( attack );
            output.push( await this.attack( { area:area, attacks : attacks }) );
        } else {
            // otherwise, resolve them one at a time
            for( let i = 0; i < count; i++ ){
                if( _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name }).length ){
                    output.push( await this.attack( { area : area, attacks : [ attack ] } ) );
                }
            }
        }

        await this.game().timedPrompt('noncombat-attack', { output : output } )
            .catch( error => console.error( error ) );
    },


    async chooseAttackVictim( args ){

        let message = '';
        args.attacks.forEach( n => message += `xA${n}x` );
        message = `Choose player to target with your attack of ${ message }`;

        args.notHidden = true;
        let victim = await this.selectEnemyPlayerWithUnitsInArea( args.area, message, args );

        if( victim === 'declined' ){
            this.game().message({ message: `declines to attack`, faction : this });
            return;
        }

        if( !victim ){
            this.game().message({ class : 'warning', message: `No units in the ${args.area.name} to attack` });
        }

        return victim;
    },


    applyDroneDiceReduction( victim, args ){
        if( args.unit && victim.name === 'swarm' && args.attacks.length > 1 ){
            args.attacks = args.attacks.slice(1);
        }
    },


    canChooseAttackTarget( args ){
        return args.chooseUnitTarget && this.enemyUnitTypesInArea( args.area, { basic : true } ).length;
    },


    async setAttackTargets( args ){
        let player = {}, data = {};

        if( args.deadly ) return { deadly : true, name : 'deadly' };

        if( ! this.canChooseAttackTarget( args ) ) {
           return await this.chooseAttackVictim( args );
        }

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : [args.area.name],
                enemyOnly : true,
                basicOnly : true,
                notHidden : true,
                message: "Choose a basic unit to attack"
            }
        }).catch( error => console.error( error ) );

        args.targetUnit = this.game().objectMap[ data.units[0] ];
        return this.game().factions[ args.targetUnit.faction ];
    },


    /**
     *
     * @param args
     * area
     * unit (optional)
     * attacks
     *
     */
    async attack( args ){
        let player, data;

        if( args.unit && args.unit.deadly ) args.deadly = true;

        // do we even have a valid attack set?
        if( !args.attacks.length ) return this.game().message({ class : 'warning', message : 'Invalid attack value' });

        // if this is a unit attacking, but there is a cease fire in the area abort
        if( args.unit && args.area.hasCard( 'cease-fire' ) ) return this.game().message({ class : 'warning', message : 'Cease fire prevents unit from attacking' });

        // if this is a unit attacking, set bonus dice
        if( args.unit && !args.deadly ) args.attacks = this.addBonusDiceToAttack( args.attacks.slice(), args.bonusDice, args.area );

        // set targets
        let victim = await this.setAttackTargets( args );
        if( !victim ) return console.log( 'no victim' );


        // apply swarm multi dice defense mod
        if( !args.deadly ) this.applyDroneDiceReduction( victim, args );

        // resolve attack
        let rolls = [].concat( _.roll( args.attacks.length, 10, this.game(), this ) );
        let toHit = this.getToHitNumber( args, victim );
        let hits = this.calculateHits( rolls, toHit );

        if( args.unit ) await this.triggeredEvents('attack', [{ unit: args.unit }] );

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
        let resolveHitsResult = await this.resolveAttackHits( hits, victim, args );

        return attackResult;
    },


    async resolveAttackHits( hits, victim, args ){
        let result;

        if( !hits ){
            this.game().sound( 'wiff' );
            return;
        }

        this.hitSound( hits );
        if( args.unit ) await this.triggeredEvents('hit', [{ unit: args.unit, hits: hits }] );

        if( args.targetUnit ){
            result = await this.game().assignHits( args.targetUnit, this, hits );
            this.game().message({ faction: this, message: `hits <span class="faction-${args.targetUnit.faction}">${args.targetUnit.faction} ${args.targetUnit.name}</span> in the ${args.area.name}` });
        } else if ( args.deadly ){
            result = await this.assignDeadlyHits( hits, args );
        } else {
            result = await victim.assignHits( hits, args.area, this, args );
        }

        return result;
    },


    async assignDeadlyHits( hits, args ){
        let promises = [], result = [];

        let factions = this.getTargetFactions( args.area );

        for( let factionName of factions ) {
            let faction = this.game().factions[factionName];

            promises.push( faction.assignHits( hits, args.area, this, args ).then( async results => {
                console.log( results );
            }) );
        }

        await Promise.all( promises );
        return result;
    },


    hitSound( hits ){
        let sound;
        if( hits === 1 ) sound = 'hit';
        else if( hits === 2 ) sound = 'hit2';
        else sound = 'hit3';

        this.game().sound( sound );
    },


    async assignHits( hits, area, killer, args ){
        let player, data = {}, targets, hasKill;

        let units = this.unitsInArea( area, { notHidden : true } );

        if( !units.length ){
            this.game().message({ class : 'warning', message: `No units in the ${area.name} to assign hits to` });
            return;
        }

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'assign-hits',
            data : {
                area : area.name,
                hits : hits,
                unit : args.unit,
                seeking : args.seeking || (args.unit && args.unit.seeking )
            }
        }).catch( error => console.error( error ) );

        if( data.cost > 0 ){
            this.payCost( data.cost, true );
        }

        let results = [];

        // assign hits to smoke instead?
        if( this.smokeScreenAttack( data, killer ) ){
            console.log( 'assign hits to smoke' );
            return;
        }

        console.log( 'not smoke' );

        for( let target of  data.targets ){
            let unit = this.game().objectMap[ target.id ];
            let result = await this.game().assignHits( unit, killer, target.hits );
            if( result === 'kills' ) hasKill = 'kills';
            results.push(`${result} <span class="faction-${this.name}">${unit.name}</span>`);
        }

        if( results.length ){
            this.game().message({ faction: killer, message: `${results.join(', ')} in the ${area.name}` });
        }

        return hasKill;
    },


    smokeScreenAttack( data, killer ){
        // if the target of this attack isn't a smoke token, return
        if( !data.targets[0] || data.targets[0].id !== 'smoke' ) return;

        let ninjas = this.game().factions['ninjas'];
        ninjas.data.smokeAreas = ninjas.data.smokeAreas.filter( area => area !== data.area );
        this.game().message({ faction: killer, message: `Gets lost in the ninjas smoke` });
        return true;
    },


    calculateHits( rolls, toHitNumber ){
        let hits = 0;
        rolls.forEach( roll => {
            if( roll >= toHitNumber ) hits++;
        });
        return hits;
    },


    getToHitNumber( args, victim ){
        let toHit = args.attacks[0];

        // deadly attacks can't be modified
        if( args.deadly ) return toHit;

        console.log( 'base attack:', toHit );

        if( args.attackBonus ){
            toHit -= args.attackBonus;
            console.log( 'apply combat effect attack bonus: -', args.attackBonus, 'toHit:', toHit );
        }

        // check our attack bonus
        if( args.unit && this.data.attackBonus ){
            toHit -= this.data.attackBonus;
            console.log( 'apply faction attack bonus: -', this.data.attackBonus, 'toHit:', toHit );
        }

        let defenseBonus = _.calculateDefenseBonus( this.data, victim.data, args.area, { debug : true, unit : args.unit } );
        if( defenseBonus ) {
            toHit += defenseBonus;
            console.log( 'apply defense penalty:', defenseBonus, 'toHit:', toHit );
        }

        return toHit;
    },

    addBonusDiceToAttack( attacks, bonusDice, area ){
        let totalBonus = 0;
        if( this.data.bonusDice ) totalBonus += this.data.bonusDice;
        if( this.data.bonusDiceInUnconquered && !area.data.conquered  ) totalBonus += this.data.bonusDiceInUnconquered;
        if( bonusDice ) totalBonus += bonusDice;

        console.log( 'bonusDice', bonusDice );

        if( totalBonus ){
            let attackVal = attacks[0];
            for( let i = 0; i < totalBonus; i++ ){
                attacks.push( attackVal );
            }
        }

        return attacks;
    },

    canActivateBattle( token, area ){
        return area.canBattle();
    },

    async battleToken( args ) {
        await this.game().battle( args.area );

        if( args.pod ) return;

        for( let faction of Object.values( this.game().factions ) ){
            await faction.onAfterActivateToken( args.token );
        }

        this.game().advancePlayer();
    }

};

module.exports = obj;

