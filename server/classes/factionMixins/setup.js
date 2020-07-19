//let PlanTester = require( '../Plans' );
let Token = require( '../Token' );
let Unit = require( '../Unit' );

let obj = {

    setupUnits(){
        _.forEach( this.units, ( value, name ) => {
            for( let i = 0; i < value.count; i++ ) {
                let unit = new Unit( this, name, value.data );
                unit = this.game().newObject( unit );
                this.data.units.push( unit );
            }
        });
    },


    setupTokens(){
        _.forEach( this.tokens, ( value, name ) => {
            for( let i = 0; i < value.count; i++ ) {
                let token = new Token( this, name, value.data );
                token = this.game().newObject( token );
                this.data.tokens.push( token );
            }
        });
    },


    setupPlans(){
        let plans = _.cloneDeep( require( `../factionPlans/${this.name}Plans` ) );

        plans.forEach( item => {
            let plan = _.clone( item );
            plan.scored = false;
            plan = this.game().newObject( plan );
            this.data.plans.deck.push( plan );
        });

        this.game().shuffle( this.data.plans.deck );
    },

    // absract
    onSetup(){}
};

module.exports = obj;

