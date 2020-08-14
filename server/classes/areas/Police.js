let Area = require( './Area' );

class Police extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You may look at each enemy target (after picking yours)";
        this.data.skill = "Make an attack with any one of your units";
        this.data.adjacent = [ 'sewers', 'capitol', 'laboratory' ];
    }

    takeControl( faction ){
        faction.data.spyAll = true;
    }

    loseControl( faction ){
        faction.data.spyAll = false;
    }


    async skill( faction ){
        let player = {}, data = {};

        // get areas with units
        let areas = faction.areasWithAttackingUnits();

        if( ! areas.length  ){
            faction.game().message({
                faction : faction,
                message: "No attacks may be made",
                class: 'warning'
            });
            return false;
        }

        // prompt player to select a unit
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : areas,
                hasAttack: true,
                playerOnly : true,
                showEnemyUnits: true,
                message: "Choose a unit to make an attack"
            }
        }).catch( error => console.error( error ) );
        let unit = faction.game().objectMap[ data.units[0] ];

        // resolve attack with that unit
        let area = this.game().areas[ unit.location ];
        let output = await faction.attack({
            area : area,
            attacks : unit.attack,
            unit : unit
        });

        if( output ){
            await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }

    }
}

module.exports = Police;
