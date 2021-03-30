class PlanTester {
    debug = true;

    test( faction, plan ){

        if( this.debug ) console.log( '', 'plan:', plan.name, 'faction:', faction.name );

        let results = [];
        let hasFailedObjective = false;

        // test each objective on this plan
        plan.objectives.forEach( objective => {

            // test our objective
            let result = this.testObjective( objective, faction );

            // if we have failed this objective then flag our plan as having having hit a failed objective
            if( !result.passed ) hasFailedObjective = true;

            // determine if objective is scorable, an objective is scorable if this objective has passed its tests,
            // and either no objectives before it on this plan card have failed, or the player controls the church
            // which allows them to score plan objectives in any order
            result.scoreable = result.passed && ( !hasFailedObjective || faction.controlsArea('church') );

            // add our result to the array
            results.push( result );
        });

        // tally our scorable points
        let scorablePoints = this.scorablePoints( faction, results );

        return {
            points : scorablePoints,
            objectives : results,
            plan : plan,
            selected : scorablePoints > 0
        };
    }


    /**
     * Test a single plan objective by testing each of its requirements
     *
     * @param {object} objective
     * @param {Faction} faction
     * @returns {{result: {object}, failed: {boolean}}}
     */
    testObjective( objective, faction ) {
        let passedAllRequirements = true;
        let tests = [];

        // test each requirement
        objective.requirements.forEach(requirement => {
            let testResult = this.checkRequirement(requirement, faction);
            tests.push({test: requirement.test, result: testResult});

            // if we failed this requirments flag the objective as failed
            if (!testResult) {
                passedAllRequirements = false;
            }
        });

        return { passed: passedAllRequirements, val: objective.value, tests: tests };
    }


    /**
     * Returns the points a faction can score based on their test results
     *
     * @param faction
     * @param results
     * @returns {number}
     */
    scorablePoints( faction, results ) {
        let points = 0;
        let controlsChurch = faction.controlsArea('church');

        // determine how many points we can score by looping through the test results
        // and adding up the points from each passed test. Once we fail a test return the total
        // unless we control the church, which allows a faction to score plan points even
        // if they failed a test previously on the same plan
        for( let result of results ){
            if( result.passed ){
                points += result.val;
            } else {
                if( !controlsChurch ) return points;
            }
        }

        return points;
    }


    /**
     * Test a plan requirement
     *
     * @param {object} requirement
     * @param {object} faction
     */
    checkRequirement( requirement, faction ){
        let test = require( `./planTests/${requirement.test}` );
        return test( this.debug, faction, ...requirement.args );
    }

}

module.exports = PlanTester;
