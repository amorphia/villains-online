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
        if( !oldOwner || (this.faction.totalPoints() + 4) > oldOwner.totalPoints() ) return;

        // prompt player to decide to move lotus dancer
        let response = await this.faction.prompt( 'question', {
            message: `Do you want to take control of this area?`,
            yesButtonText: 'Take Control',
            noButtonText: `Leave it with the ${oldOwner.name}`,
        });

        if ( !response.answer ) {
            this.faction.message(`Chooses not to take control of the ${oldOwner.name}`);
            return;
        }

        this.faction.captureEnemyMarker( this.area );
        this.game.sound( 'coin' );

        // if the old owner isn't the neutral, the old owner loses control of the area
        oldOwner.loseControlOfArea( this.area );

        // the new owner gains control of the area
        this.faction.gainControlOfArea( this.area );

        let trigger = this.faction.triggers.onControlArea;
        if( trigger ) await this.faction[trigger]( this.area );

        await this.game.timedPrompt('seize-control', {
            area: this.area.name,
            message: `The ${this.faction.name} seize control of the ${this.area.name} from the ${oldOwner.name}`,
        });
    }
}

module.exports = RousingSpeech;
