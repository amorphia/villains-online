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

        await this.pushGameDataToAllPlayers();
        await this.wait( 3 );
        this.combat = null;
        this.data.combat = null;
    },

    async assignHits( unit, faction, count = 1 ){

        if( unit.hidden ){
            return 'hidden unit ignores hit'
        }

        if( unit.onDamaged ){

            let owner = this.factions[unit.faction];
            let onDamagedResults = await owner[unit.onDamaged]({
                unit : unit,
                hits : count,
                attacker : faction
            });

            if( onDamagedResults ) return onDamagedResults;
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
        if( typeof faction === 'string' ) faction = this.factions[faction];
        unit.killed = faction.name;

        try {
            await faction.triggeredEvents( 'killed', [{ unit : unit }] );
        } catch( error ){
            console.error( error );
        }

        faction.onKillUnit( unit );
    },
};

module.exports = obj;
