let Card = require( './Card' );

class SuitcaseNuke extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // if we can't sacrifice a unit, abort
        if( !this.canWeSacrificeUnit() ) return;

        // do we want to sacrifice a unit?
        let response = await this.faction.prompt( 'sacrifice-units', {
            count : 1,
            areas : [this.area.name],
            optional : true
        });

        // if we didn't choose to sacrifice a unit, discard suitcase nuke and abort
        if( !response.units.length ) return this.discardSuitcaseNuke( "chose not to activate the suitcase nuke" );

        const unit = this.game.objectMap[response.units[0]];
        await this.game.killUnit( unit, this.faction );

        // BOOOOOOOOOOM!
        await this.explodeSuitcaseNuke();
    }


    /**
     * Can we sacrifice a unit in this area?
     *
     * @returns {boolean}
     */
    canWeSacrificeUnit(){
        // if we have a unit here, then yup we can
        if( _.find( this.faction.data.units, unit => _.unitInArea( unit, this.area ) ) ) return true;

        // if not announce discard this card
        this.discardSuitcaseNuke( "don't have a unit to sacrifice to suitcase nuke" );
    }


    /**
     * Discard the suitcase nuke from this area
     *
     * @param message
     */
    discardSuitcaseNuke( message ){
        this.faction.message( message, { class : 'warning' } );
        _.remove( this.area.data.cards, card => card.class === 'suitcase-nuke' );
    }


    /**
     * Make bomb go boom
     */
    async explodeSuitcaseNuke() {

        // booooooom!
        this.game.sound( 'explosion' );

        this.clearNukedAreaOwner();
        this.clearNukedAreaTokens();
        await this.clearNukedAreaUnits();
    }


    /**
     * Remove the current owner of this area, if any
     */
    clearNukedAreaOwner(){
        // no owner to begin with? abort
        if( !this.area.data.owner ) return;

        // if its owned by the neutral, just null them out and return
        if( this.area.data.owner === 'neutral' ){
            this.area.data.owner = null;
            return;
        }

        // otherwise we need to clear out ownership abilities as well
        let owner = this.game.factions[ this.area.data.owner ];
        owner.loseControlOfArea( this.area );
    }


    /**
     * Clear the tokens from a nuked area
     */
    clearNukedAreaTokens(){
        // return tokens to reserves
        this.area.data.tokens.forEach( token => {
            token.location = null;
            token.revealed = false;
        });

        // clear tokens array
        this.area.data.tokens = [];
    }


    /**
     * Kill all units in the nuked area
     */
    async clearNukedAreaUnits(){
        let unitsToKill = [];

        // cycle through each faction
        for( let faction of Object.values( this.game.factions ) ){
            // for each faction cycle through each unit
            let units = faction.unitsInArea( this.area ).forEach( unit => {
                let canSurvive = this.checkIfSurvivesNuke( unit );
                if(!canSurvive){
                    unitsToKill.push(unit);
                }
            });
        }

        for( let unit of unitsToKill ) {
            await this.game.killUnit( unit, this.faction );
        }

        await this.game.timedPrompt('units-shifted', {
            message: `Units consumed in nuclear hellfire`,
            units: unitsToKill
        });
    }

    checkIfSurvivesNuke( unit ){
        if(!unit.survivesNukeIfAlone){
            return false;
        }

        const faction = this.game.factions[ unit.faction ];
        return faction.unitsInArea( this.area.name ).length === 1;
    }
}

module.exports = SuitcaseNuke;
