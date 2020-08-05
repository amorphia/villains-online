let Faction = require( './Faction' );


class Mafia extends Faction {
    name = 'mafia';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.spy = null;
        this.data.title = "La Cosa Nostra";

        //tokens
        this.tokens['hit-man'] = {
            count : 1,
            data : {
                influence: 1,
                resource: 1,
                cost : 0,
            }
        };

        this.tokens['deploy'].count = 4;

        // units
        this.units['talent'].count = 2;
        this.units['patsy'].count = 5;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Fixer",
                skilled : true,
                ready: false,
                type: 'champion',
                onDeploy : 'fixerDeploy',
                basic: false,
                influence: 2,
                attack: [5],
                cost: 0,
                killed : false,
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    startOfTurnPrompt() {
        return this.areas().includes( 'police' ) ? 'choose-target' : 'choose-spy';
    }

    resolveStartOfTurn( player, spy ){
        this.data.spy = spy;
        player.setPrompt({ name : 'choose-target' });

        this.game().message({ message: `Is spying on the ${spy}`, faction: this });
        this.game().data.playerAction++;
        Server.saveToDB( this );
        this.game().updateAll();
    }

    factionCleanUp(){
        this.data.spy = null;
    }

    async fixerDeploy( event ){
        let fixer = event.unit;

        if( !this.hasUsedSkill( fixer.location ) ){
            this.message({ message: `<span class="faction-mafia">The Fixer</span> is ready for action` });
            fixer.ready = true;
        }

        if( this.data.upgrade ){
            let attack = this.data.upgrade === 1 ? 8 : 5;
            let area = this.game().areas[ fixer.location ];
            await this.attack( { area : area, attacks : [attack], optional : true } );
        }
    }


    async hitManToken( args ){
        let player, data;

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-hitman',
            data : {
                faction : this.name,
                areas : [args.area.name]
            }
        }).catch( error => console.error( error ) );

        if( data.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        let unit = this.game().objectMap[data.unit];
        this.game().sound( 'hit' );
        let result = await this.game().assignHits( unit, this );
        this.game().message({ message : `the hitman ${result} <span class="faction-${unit.faction}">the ${unit.faction}'s ${unit.name}</span> in <span class="highlight">the ${args.area.name}</span>`, faction : this });

        this.game().advancePlayer();
    }


    canActivateHitMan( token, area ) {
        return _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name, basic : true, notHidden : true }).length > 0;
    }
}


module.exports = Mafia;
