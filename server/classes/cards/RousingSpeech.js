let Card = require( './Card' );

/**
 * Passive card that does nothing upon activation
 */
class RousingSpeech extends Card {
    /**
     * Resolve this card ability
     */
    async handle(){
        if( !this.game.data.options?.catchUpCards ) return;

        let oldOwner = this.area.owner();

        console.log("oldOwner", oldOwner);

        if( !oldOwner || (this.faction.totalPoints() + 4) > oldOwner.totalPoints() ) return;

        this.faction.captureEnemyMarker( this.area );

        // if the old owner isn't the neutral, the old owner loses control of the area
        oldOwner.loseControlOfArea( this.area );

        // the new owner gains control of the area
        this.faction.gainControlOfArea( this.area );

        this.game.sound( 'coin' );

        await this.game.timedPrompt('seize-control', {
            area: this.area.name,
            message: `The ${this.faction.name} seize control of the ${this.area.name} from the ${oldOwner.name}`,
        });
    }
}

module.exports = RousingSpeech;
