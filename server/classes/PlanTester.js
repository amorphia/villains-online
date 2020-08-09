class PlanTester {

    debug = true;

    test( faction, plan ){

        if( this.debug ){
            console.log('');
            console.log(
                'plan:', plan.name,
                'faction:', faction.name
            );
        }

        let results = [];

        // for each objective
        plan.objectives.forEach( objective => {
            let passed = true;
            let tests = [];
            // test each requirement
            objective.requirements.forEach( req => {

                if( !this.checkRequirement( req, faction ) ){
                    tests.push({ test: req.test, result : false });
                    passed = false;
                } else {
                    let testObject = { test: req.test, result : true };
                    //if( req.test === 'discardCards' ) testObject.discardCards = req.args[0];
                    tests.push( testObject );
                }
            });

            results.push({ passed : passed, val : objective.value, tests : tests });
        });

        let scorablePoints = this.scorablePoints( faction, results );

        return {
            points : scorablePoints,
            objectives : results,
            plan : plan,
            selected : scorablePoints > 0
        };
    }

    scorablePoints( faction, results ) {
        let points = 0;
        let controlsChurch = faction.controlsArea('church');

        for( let result of results ){
            if( result.passed ){
                points += result.val;
            } else {
                if( !controlsChurch ) return points;
            }
        }

        return points;
    }



    checkRequirement( requirement, faction ){
        return this[requirement.test]( faction, ...requirement.args );
    }



    /**
     *
     *
     *  BASIC TESTS
     *
     *
     */


    unitsInPlay( faction, unitsInPlay ){
        let factionUnitsInPlay = faction.unitsInPlay().length;
        let result = factionUnitsInPlay >= unitsInPlay;

        if( this.debug ) console.log(
            'unitsInPlay',
            'unitsInPlay req:', unitsInPlay,
            'factionUnitsInPlay:', factionUnitsInPlay,
            'result:', result
        );

        return result;
    }


    enemyMarkers( faction, enemyMarkers ){
        let factionEnemyMarkers = faction.data.captured.current;
        let result = faction.data.captured.current >= enemyMarkers;

        if( this.debug ) console.log(
            'enemyMarkers',
            'enemyMarkers req:', enemyMarkers,
            'factionEnemyMarkers:', factionEnemyMarkers,
            'result:', result
        );

        return result;
    }


    killUnits( faction, killedUnits ) {
        let factionKilledUnits = faction.totalKills();
        let result = factionKilledUnits >= killedUnits;

        if( this.debug ) console.log(
            'killUnits',
            'killedUnits req:', killedUnits,
            'factionKilledUnits:', factionKilledUnits,
            'result:', result
        );

        return result;
    }


    influenceInAreas( faction, influenceCount, areaCount = 1 ) {
        let areasWithEnoughInfluence = 0;

        _.forEach( faction.game().areas, area => {
            if( faction.influenceInArea( area ) >= influenceCount ) areasWithEnoughInfluence++;
        });

        let result = areasWithEnoughInfluence >= areaCount;

        if( this.debug ) console.log(
            'influenceInAreas',
            'influenceCount req:', influenceCount,
            'areaCount req:', areaCount,
            'areasWithEnoughInfluence:', areasWithEnoughInfluence,
            'result:', result
        );

        return result;
    }


    controlTarget( faction ) {
        let targetController = faction.targetArea().data.owner;
        let result = faction.targetArea().data.owner === faction.name;

        if( this.debug ) console.log(
            'controlTarget',
            'targetController:', targetController,
            'result:', result
        );

        return result;
    }


    controlArea( faction, areaName ) {
        let areaController = faction.game().areas[ areaName ].data.owner;
        let result = areaController === faction.name;

        if( this.debug ) console.log(
            'controlArea',
            'areaName req:', areaName,
            'areaController:', areaController,
            'result:', result
        );

        return result;
    }

    tokensInAreas( faction, areaCount, type ) {
        let factionCount = _.areasWithTokensCount( faction, faction.game().data.areas, type );

        let result = factionCount >= areaCount;

        if( this.debug ) console.log(
            'tokensInAreas',
            'areaCount req:', areaCount,
            'type req:', type,
            'factionCount:', factionCount,
            'result:', result
        );

        return result;
    }

    useSkills( faction, skillsUsed ){
        let factionSkillsUsed = faction.data.usedSkills.length;
        let result = factionSkillsUsed >= skillsUsed;

        if( this.debug ) console.log(
            'useSkills',
            'skillsUsed req:', skillsUsed,
            'factionSkillsUsed:', factionSkillsUsed,
            'result:', result
        );

        return  result;
    }

    loseUnits( faction, lostUnits ){
        let factionLostUnits = faction.data.units.filter( unit => unit.killed && unit.killed !== faction.name ).length;
        let result = factionLostUnits >= lostUnits;

        if( this.debug ) console.log (
            'loseUnits',
            'lostUnits req:', lostUnits,
            'factionLostUnits:', factionLostUnits,
            'result:', result
        );

        return result;
    }

    unitInEnemy( faction, unitType, unitCount ){
        let enemyAreas = [];

        _.forEach( faction.game().areas, area => {
            if( area.data.owner && area.data.owner !== faction.name ) enemyAreas.push( area.name );
        });

        let factionUnitCount = faction.data.units.reduce( (acc, unit) => {
            if( unit.type === unitType
                && !unit.killed
                && enemyAreas.includes( unit.location )
            ) acc++;
            return acc;
        }, 0 );

        let result = factionUnitCount >= unitCount;

        if( this.debug ) console.log (
            'unitInEnemy',
            'unitType req:', unitType,
            'unitCount req:', unitCount,
            'factionUnitCount:', factionUnitCount,
            'result:', result
        );

        return result;
    }

    unitsAtTarget( faction, unitCount, type = 'talent' ){
        let targetName = faction.targetArea().name;
        let factionUnitsAtTarget = faction.data.units.filter( unit => _.unitInArea( unit, targetName, { type : type } ) ).length;
        let result = factionUnitsAtTarget >= unitCount;

        if( this.debug ) console.log (
            'unitsAtTarget',
            'unitCount req:', unitCount,
            'type req:', type,
            'factionUnitsAtTarget:', factionUnitsAtTarget,
            'result:', result
        );

        return result;
    }

    exterminateAreas( faction, exterminateCount = 1 ){
        let factionExterminatedAreas = faction.areasExterminated().length;
        let result = factionExterminatedAreas >= exterminateCount;

        if( this.debug ) console.log (
            'exterminateAreas',
            'exterminateCount req:', exterminateCount,
            'factionExterminatedAreas:', factionExterminatedAreas,
            'result:', result
        );

        return result;
    }

    /**
     *
     *
     *  FACTION SPECIFIC TESTS
     *
     *
     */

    controlAreas( faction, areaCount ){
        let factionAreasControlled = faction.areas().length;
        let result = factionAreasControlled >= areaCount;

        if( this.debug ) console.log(
            'controlAreas',
            'areaCount req:', areaCount,
            'factionAreasControlled:', factionAreasControlled,
            'result:', result
        );

        return result;
    }

    controlEnemyTargets( faction, targetCount ){
        let areasControlled = faction.areas();

        let enemyTargetsControlled = Object.values( faction.game().factions )
            .map( item => {
                 return item.name !== faction.name // if this faction is not us
                        && areasControlled.includes( item.targetName() ); // and areas we control includes their target
             }).filter( item => item ).length; // get rid of false values

        let result = enemyTargetsControlled >= targetCount;

        if( this.debug ) console.log(
            'controlEnemyTargets',
            'targetCount req:', targetCount,
            'factionEnemyTargetsControlled:', enemyTargetsControlled,
            'result:', result
        );

        return result;
    }

    killMost( faction ){
        let killCounts = Object.values( faction.game().factions )
            .map( item => {
                return { name : item.name, kills : item.kills().length }
            });

        killCounts.sort( (a,b) => b.kills - a.kills );

        let result = killCounts[0].kills // there was at least one kill
                     && killCounts[0].name === faction.name // our number of kills puts us at the top of the sort
                     && killCounts[0].kills !== killCounts[1].kills; // and there isn't a tie

        if( this.debug ) console.log(
            'killMost',
            'killCounts[0]:',killCounts[0],
            'result:', result
        );

        return result;
    }

    exterminateTarget( faction ){
        let targetArea = faction.targetArea();
        let result = faction.hasExterminatedArea( targetArea );

        if( this.debug ) console.log(
            'exterminateTarget',
            'targetArea:', targetArea.name,
            'result:', result
        );

        return result;
    }

    exterminateEnemyTarget( faction ){
        let result;

        for( let item of Object.values( faction.game().factions ) ){
            if( faction.hasExterminatedArea( item.targetArea() ) ) result = true;
        }

        if( this.debug ) console.log(
            'exterminateEnemyTarget',
            'result:', result
        );

        return result;
    }

    unitsAtEnemyTargets( faction, unitCount, unitType ){
        let factionUnitsAtEnemyTargets = 0;

        for( let item of Object.values( faction.game().factions ) ) {
            if (item.name === faction.name) continue;
            factionUnitsAtEnemyTargets += faction.unitsInArea( item.targetArea(), unitType ).length;
        }

        let result = factionUnitsAtEnemyTargets >= unitCount;

        if( this.debug ) console.log(
            'unitsAtEnemyTargets',
            'unitCount req:', unitCount,
            'unitType req:', unitType,
            'factionUnitsAtEnemyTargets:', factionUnitsAtEnemyTargets,
            'result:', result
        );

        return result;
    }

    mrFusion( faction, fusionCount ){
        let factionFusionCount = faction.data.fusion;
        let result = factionFusionCount && factionFusionCount >= fusionCount;

        if( this.debug ) console.log(
            'mrFusion',
            'fusionCount req:', fusionCount,
            'factionFusionCount:', factionFusionCount,
            'result:', result
        );

        return result;
    }


    cardsInHand( faction, cardCount ){
        let factionCardsInHand = faction.data.cards.hand.length;
        let result = factionCardsInHand >= cardCount;

        if( this.debug ) console.log(
            'discardCards',
            'cardCount req:', cardCount,
            'factionCardsInHand:', factionCardsInHand,
            'result:', result
        );

        return result;
    }

    /*
    discardCards( faction, cardCount ){
        let factionCardsInHand = faction.data.cards.hand.length;
        let result = factionCardsInHand >= cardCount;

        if( this.debug ) console.log(
            'discardCards',
            'cardCount req:', cardCount,
            'factionCardsInHand:', factionCardsInHand,
            'result:', result
        );

        return result;
    }
    */

    unitsInAreas( faction, areaCount ){
        let factionAreasWithUnits = faction.areasWithUnits().length;
        let result =  factionAreasWithUnits >= areaCount;

        if( this.debug ) console.log(
            'unitsInAreas',
            'areaCount req:', areaCount,
            'factionAreasWithUnits:', factionAreasWithUnits,
            'result:', result
        );

        return result;
    }

    killsInAreas( faction, areaCount ){
        let factionAreasWithKills = faction.areasWithKills().length;
        let result = factionAreasWithKills >= areaCount;

        if( this.debug ) console.log(
            'killsInAreas',
            'areaCount req:', areaCount,
            'factionAreasWithKills:', factionAreasWithKills,
            'result:', result
        );

        return result;
    }

    killTypeCount( faction, typeCount ){
        let typesKilled = faction.unitTypesKilled();
        let result = Object.keys( typesKilled ).length >= typeCount;

        if( this.debug ) console.log(
            'killTypeCount',
            'typeCount req:', typeCount,
            'typesKilled:', typesKilled,
            'result:', result
        );

        return result;
    }


    killTypes( faction, types, killCount ){
        let typesKilled = faction.unitTypesKilled();
        let killsOfTypes = 0;

        types.forEach( type => {
            if( typesKilled.hasOwnProperty( type ) ) killsOfTypes += typesKilled[type];
        });

        let result = killsOfTypes >= killCount;

        if( this.debug ) console.log(
            'killTypeCount',
            'types req:', types,
            'killCount req:', killCount,
            'typesKilled:', typesKilled,
            'result:', result
        );

        return result;
    }
}

module.exports = PlanTester;
