let obj = {

    async selectEnemyPlayerWithUnitsInArea( area, message, args ){
        let player, data, targetFaction, selfAttack;

        if( typeof area !== 'string' ) area = area.name;

        // find valid players
        let targetFactions = _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name });

        // no enemies with units in the from location
        if( targetFactions.length === 0 ){
            // if this attack forces a self attack return this faction as the victim, otherwise return false
            return args.selfAttack ? this : false;
        }

        [player, data] = await this.game().promise({ players: this.playerId, name: 'choose-victim', data : {
            areas : [area],
            faction: this.name,
            message: message,
            optional : args.optional,
            unitAttack : !!args.unit,
            attackBonus : args.attackBonus
        }});

        if( data.declined ){
            return 'declined';
        }

        targetFaction = this.game().factions[ data.faction ];
        return targetFaction;

    },

    getTargetFactions( area ){
        // find valid players
        let targetFactions = _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name });

        // no enemies with units in the from location
        if( targetFactions.length === 0 ){
            this.game().message({ class : 'warning', message:  `No units in the ${area.name} to attack` });
            return;
        }

        return targetFactions;
    },

    async nonCombatAttack( attack, count, area ){

        let targetFactions = this.getTargetFactions( area );

        if( ! targetFactions ){
            return;
        }

        // if we only have one target, bundle up the attacks
        if( targetFactions.length === 1 ){
            let attacks = Array( count ).fill( attack );
            await this.attack( { area:area, attacks : attacks });
            return;
        }

        // otherwise, resolve them one at a time
        for( let i = 0; i < count; i++ ){
            if( _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name }).length ){
                await this.attack( { area : area, attacks : [ attack ] } );
            }
        }

    },


    async chooseAttackVictim( args ){

        let message = '';
        args.attacks.forEach( n => message += `xA${n}x` );
        message = `Choose player to target with your attack of ${ message }`;

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
        return args.chooseUnitTarget && this.enemyUnitTypesInArea( args.area, true ).length;
    },


    async setAttackTargets( args ){
        let player, data;

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
                message: "Choose a basic unit to attack"
            }
        });

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

        // do we even have a valid attack set?
        if( !args.attacks.length ) return this.game().message({ class : 'warning', message : 'Invalid attack value' });

        // if this is a unit attacking, set bonus dice
        if( args.unit ) args.attacks = this.addBonusDiceToAttack( args.attacks.slice(), args.bonusDice );

        // set targets
        let victim = await this.setAttackTargets( args );
        if( !victim ) return console.log( 'no victim' );

        // apply swarm multi dice defense mod
        this.applyDroneDiceReduction( victim, args );

        // resolve attack
        let rolls = [].concat( _.roll( args.attacks.length ) );
        let toHit = this.getToHitNumber( args, victim );
        let hits = this.calculateHits( rolls, toHit );

        // report attack results
        let attackResult = {
            faction : this.name,
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
        await this.resolveAttackHits( hits, victim, args );

        return attackResult;
    },

    async resolveAttackHits( hits, victim, args ){
        if( !hits ) return this.game().sound( 'wiff' );
        this.hitSound( hits );
        if( args.unit ) await this.triggeredEvents('hit', [{ unit: args.unit, hits: hits }] );

        if( args.targetUnit ){
            await this.game().assignHits( args.targetUnit, this, hits );
            this.game().message({ faction: this, message: `hits <span class="faction-${args.targetUnit.faction}">${args.targetUnit.faction} ${args.targetUnit.name}</span> in the ${args.area.name}` });
        } else {
            await victim.assignHits( hits, args.area, this );
        }
    },


    hitSound( hits ){
        let sound;
        if( hits === 1 ) sound = 'hit';
        else if( hits === 2 ) sound = 'hit2';
        else sound = 'hit3';

        this.game().sound( sound );
    },

    async assignHits( hits, area, killer ){
        let player, data = {}, targets;

        let units = this.unitsInArea( area );

        if( !units.length ){
            this.game().message({ class : 'warning', message: `No units in the ${area.name} to assign hits to` });
            return;
        }


        [player, data] = await this.game().promise({ players: this.playerId, name: 'assign-hits', data : { area : area.name, hits : hits } });
        targets = data.targets;

        if( data.cost > 0 ){
            this.payCost( data.cost, true );
        }

        let results = [];

        for( let target of targets ){
            let unit = this.game().objectMap[ target.id ];
            let result = await this.game().assignHits( unit, killer, target.hits );
            results.push(`${result} <span class="faction-${this.name}">${unit.name}</span>`);
        }

        if( results.length ){
            this.game().message({ faction: killer, message: `${results.join(', ')} in the ${area.name}` });
        }

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

        if( args.attackBonus ) toHit -= args.attackBonus;

        // check our attack bonus
        if( args.unit ) toHit -= this.data.attackBonus;

        console.log( 'victim', victim );

        toHit += _.calculateDefenseBonus( this.data, victim.data, args.area );
        return toHit;
    },

    addBonusDiceToAttack( attacks, bonusDice ){
        let totalBonus = 0;
        if( this.data.bonusDice ) totalBonus += this.data.bonusDice;
        if( bonusDice ) totalBonus += bonusDice;

        console.log( 'bonusDice', bonusDice );

        if( totalBonus ){
            let attackVal = attacks[0];
            for( let i = 0; i < totalBonus; i++ ){
                attacks.push( attackVal );
            }
        }

        console.log( 'attacks', attacks );

        return attacks;
    },

    canActivateBattle( token, area ){
        return area.canBattle();
    },

    async battleToken( args ) {
        await this.game().battle( args.area );
        this.game().advancePlayer();
    }

};

module.exports = obj;

