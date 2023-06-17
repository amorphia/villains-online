let Card = require( './Card' );

class Brainwash extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        await this.faction.replaceUnit( { area: this.area, sound: "hypnotize", message: `The ${this.faction.name} brainwash a unit` });
    }
}

module.exports = Brainwash;
