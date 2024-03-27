let Card = require( './Card' );

class Brainwash extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        this.faction.gainResources( 1 );
        await this.faction.replaceUnit( { area: this.area, sound: "hypnotize", message: `The ${this.faction.name} brainwash a unit` });
    }
}

module.exports = Brainwash;
