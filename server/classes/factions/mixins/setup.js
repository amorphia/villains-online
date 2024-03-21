let Token = require( '../../Token' );
let Unit = require( '../../Unit' );

let obj = {

    /**
     * Build up our unit reinforcements
     *
     * @param saved // option save game state
     */
    setupUnits( saved = null ){

        _.forEach( this.units, ( value, name ) => {
            for( let i = 0; i < value.count; i++ ) {
                // setup our unit objects
                let unit = new Unit( this, name, value.data );
                unit = this.game().newObject( unit, saved );
                this.data.units.push( unit );
            }
        });
    },


    /**
     * saves the specified properties to a "baseXxxxx" property for use
     * with transforming units that change stats back and forth
     *
     * @param unit
     */
    setUnitBaseStats( unit ){
        if( this.shouldSetUnitBaseStats.basic && !unit.basic ) return;

        if( this.shouldSetUnitBaseStats.basic === false && unit.basic ) return;

        this.shouldSetUnitBaseStats.props.forEach( prop => {
            if( unit[prop] !== undefined ){
                let baseProp = _.camelCase( `base ${prop}` );
                unit[baseProp] = unit[prop];
            }
        });
    },


    /**
     * Build up our token reinforcements
     *
     * @param saved
     */
    setupTokens( saved ){
        _.forEach( this.tokens, ( value, name ) => {
            for( let i = 0; i < value.count; i++ ) {
                let token = new Token( this, name, value.data, this.game() );
                token = this.game().newObject( token, saved );
                this.data.tokens.push( token );
            }
        });
    },

    /**
     * Setup our plan objects
     *
     * @param saved
     */
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

};

module.exports = obj;

