let obj = {
    /**
     * Handle a non-combat attack
     *
     * @param attack
     * @param count
     * @param area
     */
    async nonCombatAttack( attack, count, area ){

        // get our potential target factions, and if we have none, return
        let targetFactions = this.getTargetFactions( area );
        if( !targetFactions ) return;

        // resolve our non-combat attacks
        let output = await this.resolveNonCombatAttack( attack, count, area, targetFactions );

        await this.game().timedPrompt('noncombat-attack', { output : output } )
            .catch( error => console.error( error ) );
    },


    /**
     * Resolve a non-combat attack
     *
     * @param attack
     * @param count
     * @param area
     * @param targetFactions
     */
    async resolveNonCombatAttack( attack, count, area, targetFactions ){
        // if we only have one target, bundle up the individual attacks
        if( targetFactions.length === 1 ){
            return await this.makeBundledNonCombatAttacks( attack, count, area );
        }

        // otherwise make each attack individually
        return await this.makeIndividualNonCombatAttacks( attack, count, area );
    },


    /**
     * Bundle all attacks of a non-combat attack into a single attack
     *
     * @param attack
     * @param count
     * @param area
     * @returns {[]} // an attack output wrapped in an array
     */
    async makeBundledNonCombatAttacks( attack, count, area ){
        // create an array of {count} attacks of value {attack} to resolve as a single attack
        let attacks = Array( count ).fill( attack );

        // make our attack
        return [ await this.attack( { area:area, attacks : attacks }) ];
    },


    /**
     * Make a number of individual non-combat attacks equal to our count value
     *
     * @param attack
     * @param count
     * @param area
     * @returns {[]} // an array of our attack outputs
     */
    async makeIndividualNonCombatAttacks( attack, count, area ){
        let output = [];

        // otherwise, resolve them one at a time
        while( count ){
            if( this.hasUnitsToAttackRemaining( area ) ){
                output.push( await this.attack( { area : area, attacks : [ attack ] } ) );
            }
            count--;
        }

        return output;
    },


    /**
     * do we have units remaining to attack n this area?
     *
     * @param area
     * @returns {*}
     */
    hasUnitsToAttackRemaining( area ){
        return _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name, notHidden : true }).length > 0;
    },


};

module.exports = obj;

