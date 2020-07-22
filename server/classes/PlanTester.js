class PlanTester {

    test( faction, plan ){

        let results = [];
        let discardCards = 0;

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
                    tests.push({ test: req.test, result : true });
                }

                if( req.test === 'discardCards' ) discardCards += req.args[0];
            });

            results.push({ passed : passed, val : objective.value, tests : tests });
        });

        let scorablePoints = this.scorablePoints( faction, results );

        let returnData = {
            points : scorablePoints,
            tests : results,
            plan : plan,
            selected : scorablePoints > 0
        };

        if( discardCards ) returnData.discardCards = discardCards;
        return returnData;
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
        return faction.unitsInPlay().length >= unitsInPlay;
    }


    enemyMarkers( faction, enemyMarkers ){
        return faction.data.captured.current >= enemyMarkers;
    }


    killUnits( faction, killedUnits ) {
        return faction.totalKills() >= killedUnits;
    }


    influenceInAreas( faction, influenceCount, areaCount = 1 ) {
        let areasWithEnoughInfluence = 0;
        _.forEach( faction.game().areas, area => {
            if( faction.influenceInArea( area ) >= influenceCount ) areasWithEnoughInfluence++;
        });

        return areasWithEnoughInfluence >= areaCount;
    }


    controlTarget( faction ) {
        return faction.targetArea().data.owner === faction.name;
    }


    controlArea( faction, areaName ) {
        return faction.game().areas[ areaName ].data.owner === faction.name;
    }

    tokensInAreas( faction, areaCount, type ) {
        let count = 0;
        _.forEach( faction.game().areas, area => {
            if( _.find( area.data.tokens, token => {
                if( token.faction === faction.name && (!type || token.type === type ) ) return true;
            }) ) count++;
        });

        return count >= areaCount;
    }

    useSkills( faction, skillsUsed ){
        return faction.data.usedSkills.length >= skillsUsed;
    }

    loseUnits( faction, lostUnits ){
        return faction.data.units.filter( unit => unit.killed && unit.killed !== faction.name ).length >= lostUnits;
    }

    unitInEnemy( faction, unitType, unitCount ){
        let enemyAreas = [];
        _.forEach( faction.game().areas, area => {
            if( area.data.owner && area.data.owner !== faction.name ) enemyAreas.push( area.name );
        });

        let count = faction.data.units.reduce( (acc, unit) => {
            if( unit.type === unitType
                && !unit.killed
                && enemyAreas.includes( unit.location )
            ) acc++;
            return acc;
        }, 0 );

        return count >= unitCount;
    }

    unitsAtTarget( faction, unitCount, type = 'talent' ){
        let targetName = faction.targetArea().name;
        return faction.data.units.filter( unit => unit.type === type && _.unitInArea( unit, targetName ) ).length;
    }

    exterminateAreas( faction, exterminateCount = 1 ){
        return faction.areasExterminated().length >= exterminateCount;
    }

    /**
     *
     *
     *  FACTION SPECIFIC TESTS
     *
     *
     */

    controlAreas( faction, areaCount ){
        return faction.areas().length >= areaCount;
    }

    controlEnemyTargets( faction, targetCount ){
        let areasControlled = faction.areas();

        let enemyTargetsControlled = Object.values( faction.game().factions )
            .map( item => {
                 return item.name !== faction.name // if this faction is not us
                        && areasControlled.includes( item.targetName() ); // and areas we control includes their target
             }).filter( item => item ); // get rid of false values

        return enemyTargetsControlled.length >= targetCount;
    }

    killMost( faction ){
        let killCounts = Object.values( faction.game().factions )
            .map( item => {
                return { name : item.name, kills : item.kills().length }
            });

        killCounts.sort( (a,b) => b.kills - a.kills );

        return killCounts[0].kills // there was at least one kill
               && killCounts[0].name === faction.name // our number of kills puts us at the top of the sort
               && killCounts[0].kills !== killCounts[1].kills; // and there isn't a tie
    }

    exterminateTarget( faction ){
        return faction.hasExterminatedArea( faction.targetArea() );
    }

    exterminateEnemyTarget( faction ){
        for( let item of Object.values( faction.game().factions ) ){
            if( faction.hasExterminatedArea( item.targetArea() ) ) return true;
        }
    }

    unitsAtEnemyTargets( faction, unitCount, unitType ){
        let count = 0;
        for( let item of Object.values( faction.game().factions ) ) {
            if (item.name === faction.name) continue;
            count += faction.unitsInArea( item.targetArea(), unitType ).length;
        }
        return count >= unitCount;
    }

    mrFusion( faction, fusionCount ){
        return faction.data.fusion && faction.data.fusion >= fusionCount;
    }

    discardCards( faction, cardCount ){
        return faction.data.cards.hand.length >= cardCount;
    }

    unitsInAreas( faction, areaCount ){
        return faction.areasWithUnits().length >= areaCount;
    }

    killsInAreas( faction, areaCount ){
        return faction.areasWithKills().length >= areaCount;
    }

}

module.exports = PlanTester;
