let Battle = require( '../Battle' );

let obj = {
    async battle( area, options = {} ){

        if( !area.canBattle() ){
            this.message({ message : `Unable to battle in the ${area.name}` , class : 'warning' });
            return;
        }

        this.combat = new Battle( area, this, options );
        this.data.combat = this.combat.data;
        this.message({ message : `A battle begins in the ${area.name}`, class : 'highlight' });

        try {
            await this.combat.init();
        } catch( error ){
            console.error( error );
        }

        this.message({ message :  `The battle in the ${area.name} concludes`, class : 'highlight' });

        this.updateAll();
        await this.wait( 3 );
        this.combat = null;
        this.data.combat = null;
    },

    async assignHits( unit, faction, count = 1 ){

        if( unit.hidden ){
            return 'hidden unit ignores hit'
        }

        // Lilith heal ability
        if( count === 1
            && unit.faction === 'vampires'
            && unit.flipped === true
            && unit.type === 'champion'
        ){
            this.factions['vampires'].unitUnflipped( unit );
            return 'return to human form'
        }

        if( count === 1 && unit.toughness && !unit.flipped ){
            unit.flipped = true;
            return 'wounds';
        }

        try {
            await this.killUnit( unit, faction );
        } catch( error ){
            console.error( error );
        }

        return 'kills';
    },

    async killUnit( unit, faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        unit.killed = faction;

        if( unit.ready ) unit.ready = false;

        if( unit.flipped ){
            unit.flipped = false;
            this.factions[faction].unitUnflipped( unit );
        }

        try {
            await this.factions[faction].triggeredEvents( 'killed', [{ unit : unit }] );
        } catch( error ){
            console.error( error );
        }

    },
};

module.exports = obj;
