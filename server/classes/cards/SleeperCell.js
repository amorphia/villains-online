let Card = require( './Card' );

class SleeperCell extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // deploy one mole to any area
        let output = await this.faction.deploy({
            faction: this.faction,
            player: this.faction.playerId,
            area: this.area,
            deployLimit: 1,
            free: true,
            unitTypes: ["mole"],
        });

        let moles = this.faction.data.units.filter( unit => unit.type === "mole" || unit.additionalTypes?.includes( 'mole' ));

        moles.forEach( unit => {
            // add first strike (if needed)
            if( !unit.firstStrike ){
                unit.firstStrike = true;
                unit.temporaryfirstStrike = true;
            }
        });

        // improve attacks
        this.faction.data.unitTypeAttackBonus.push( { type: "mole", value: 3, from: "Sleeper Cell" });
    }

    clear( faction ){
        let moles = faction.data.units.filter( unit => unit.type === "mole" || unit.additionalTypes?.includes( 'mole' ));

        moles.forEach( unit => {
            // remove first strike (if needed)
            if( unit.temporaryfirstStrike ){
                delete unit.firstStrike;
                delete unit.temporaryfirstStrike;
            }

            // remove attack bonus
            faction.data.unitTypeAttackBonus = faction.data.unitTypeAttackBonus.filter( bonus => bonus.from !== "Sleeper Cell" );
        });
    }
}

module.exports = SleeperCell;
