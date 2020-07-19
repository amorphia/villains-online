class Plan_old {

    num;
    faction;
    revealed = false;
    owner;

    constructor( faction, num ) {
        this.faction = faction.name;
        this.num = num;
        this.owner = faction.owner;
    }

}


module.exports = Plan_old;


