//let PlanTester = require( '../Plans' );
let Token = require( '../../Token' );
let Unit = require( '../../Unit' );

let obj = {

    setupUnits( saved ){
        _.forEach( this.units, ( value, name ) => {
            for( let i = 0; i < value.count; i++ ) {
                let unit = new Unit( this, name, value.data );
                unit = this.game().newObject( unit, saved );
                this.data.units.push( unit );
            }
        });
    },


    setupTokens( saved ){
        _.forEach( this.tokens, ( value, name ) => {
            for( let i = 0; i < value.count; i++ ) {
                let token = new Token( this, name, value.data );
                token = this.game().newObject( token, saved );
                this.data.tokens.push( token );
            }
        });
    },


    setupPlans( saved ){
        let plans = _.cloneDeep( require( `../plans/${this.name}Plans` ) );

        plans.forEach( item => {
            let plan = _.clone( item );
            plan.scored = false;
            plan = this.game().newObject( plan, saved );
            this.data.plans.deck.push( plan );
        });

        this.game().shuffle( this.data.plans.deck );
    },

    // absract
    onSetup(){}
};

module.exports = obj;

