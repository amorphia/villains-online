class Unit {
    owner; // player who owns this unit
    name; // unit name
    faction; // faction this unit belongs to
    killed = false; // has this unit been killed
    needsToAttack = false; // does this unit need to attack used during combat to track which have/haven't attacked)
    location = null; // area this unit is currently located, null places it in the player's reserves

    constructor( faction, name, data ) {
        this.owner = faction.owner;
        this.faction = faction.name;
        this.name = name;
        Object.assign( this, data );

        // if we need to set our units base stats in the case of flipped units
        // that transform stats, do it here
        if( faction.shouldSetUnitBaseStats ) faction.setUnitBaseStats( this );
    }
}


module.exports = Unit;


