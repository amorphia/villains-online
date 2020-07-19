class Unit {

    owner;
    name;
    faction;
    killed = false;
    needsToAttack = false;
    location = null;

    constructor( faction, name, data ) {
        this.owner = faction.owner;
        this.faction = faction.name;
        this.name = name;
        Object.assign( this, data );
    }

}


module.exports = Unit;


