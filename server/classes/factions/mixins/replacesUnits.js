let obj = {

    /**
     * Replace an enemy unit with a matching unit from our reserves
     *
     * @param unit
     * @param options
     */
    async replaceUnit( unit, options = {} ){

        const replacement = this.getReplacementUnit( unit );

        if( !replacement ) {
            this.message( "Unable to replace unit", { class : 'warning' });
            return false;
        }

        await this.resolveUnitReplacement( unit, replacement, options );
        return true;
    },


    /**
     * Find a replacement unit from our reserves
     *
     * @param original
     * @returns {Unit}
     */
    getReplacementUnit( original ){
        if( typeof original === 'string' ) original = this.game().objectMap[ original ];

        return this.data.units.find( unit => !unit.location
                                            && unit.type === original.type
                                            && !unit.killed );
    },


    /**
     * Resolve the replacement of an enemy unit with one of our own
     *
     * @param original
     * @param replacement
     * @param options
     */
    async resolveUnitReplacement( original, replacement, options ){
        const units = [];

        // replace unit
        replacement.location = original.location;

        // if original was ready, replacement is too
        if( original.ready ) replacement.ready = true;

        // prepare data for popup prompt
        units.push( replacement );
        units.push( _.clone( original ) );

        // return original to owner
        let owner = this.game().factions[original.faction];
        owner.returnUnitToReserves( original );

        // show our work
        if( options.silent ){
            return;
        }

        await this.game().timedPrompt('units-shifted', {
            message : options.message,
            units: units.reverse()
        });
    }

};

module.exports = obj;
