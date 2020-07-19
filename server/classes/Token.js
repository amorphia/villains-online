class Token {

    revealed = false;
    owner;
    name;
    faction;
    selected;
    location = null;

    constructor( faction, name, data ) {
        this.owner = faction.owner;
        this.faction = faction.name;
        this.name = name;
        this.type = name;
        Object.assign( this, data );
    }

}


module.exports = Token;


