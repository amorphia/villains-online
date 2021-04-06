let obj = {


    /**
     * Test each of our plans, and return the results
     *
     * @returns {[]}
     */
    testPlans(){
        let results = [];
        this.data.plans.current.forEach( plan => {
            let planResults = this.game().planTester.test( this, plan );
            results.push( planResults );
        });
        return results;
    },


    /**
     * Score a plan, if appropriate
     *
     * @param plan
     */
    scorePlan( plan ){
        // if this plan wasn't selected then abort
        if( !plan.selected ) return;

        // gain plan points
        this.gainPP( plan.points );

        // tag plan with data on when/how scored
        let planObject = this.game().objectMap[ plan.plan.id ];
        planObject.turnScored = this.game().data.turn;
        planObject.objectives = plan.objectives;
        planObject.plan = { num : plan.num };
        planObject.points = plan.points;

        // move plan to completed array
        _.moveItemById( plan.plan.id , this.data.plans.current, this.data.plans.completed );

    }
};

module.exports = obj;
