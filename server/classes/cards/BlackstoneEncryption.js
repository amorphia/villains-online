let Card = require( './Card' );

class BlackstoneEncryption extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // get the areas we can activate and if we have none, abort.
        let areas = this.getValidAreas();
        if( !areas.length ){
            this.faction.message( 'No valid areas to resolve Blackstone Encryption', { class : 'warning' } );
            return;
        }

        // get the area we want to activate
        let areaToActivate = await this.chooseAreaToActivate( areas );

        // activate that skill
         await this.faction.useSkill( areaToActivate )
             .catch( error => console.log( error ) );
    }


    /**
     * Get the areas where we have a unit, and have not activated that skill
     *
     * @returns {string[]}
     */
    getValidAreas(){
        let areas = {};

        Object.values( this.game.areas ).forEach( area => {
            if( _.hasUnitsInArea( this.faction, area ) && !_.hasUsedSkill( this.faction, area ) ){
                areas[area.name] = true;
            }
        });

        return Object.keys( areas );
    }


    /**
     * Choose an area to activate
     * @param areas
     * @returns {Area}
     */
    async chooseAreaToActivate( areas ){
        // if we only have one choice, return it
        if( areas.length === 1 ){
            return areas[0];
        }

        // ask the player which area to activate
        let response = await this.faction.prompt( 'choose-skill', { areas : areas } );
        return response.area;
    }

}

module.exports = BlackstoneEncryption;
