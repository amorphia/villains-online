let Faction = require( './Faction' );


class Mafia extends Faction {
    name = 'mafia';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.spy = null;
        this.data.title = "La Cosa Nostra";
        this.data.focusDescription = "Infiltrate or control enemy targets";

        //tokens
        this.tokens['hit-man'] = {
            count : 1,
            data : {
                influence: 1,
                resource: 1,
                cost : 0,
                req : "This token must be discarded if you have no targets to assign a hit to"
            }
        };

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

    processUpgrade( n ){
        this.data.bonusDeploy = { type: 'champion', count: 1 };
    }


    startOfTurnPrompt() {
        return this.areas().includes( 'police' ) ? 'choose-target' : 'choose-spy';
    }

    async resolveStartOfTurn( player, spy ){
        this.data.spy = spy;
        player.setPrompt({ name : 'choose-target' });

        this.game().message({ message: `Is spying on the ${spy}`, faction: this });
        this.game().data.gameAction++;
        Server.saveToDB( this.game() );
        await this.game().pushGameDataToPlayers();
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

        if( this.data.upgrade === 2){
            let area = this.game().areas[ fixer.location ];
            let output = await this.attack( { area : area, attacks : fixer.attack , unit : event.unit, optional : true } ).catch( error => console.error( error ) );

            if( output ){
                await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                    .catch( error => console.error( error ) );
            }
        }
    }


    async hitManToken( args ){
        let player, data, result;

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'assassinate-unit',
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

        try {
            result = await this.game().assignHits( unit, this );
        } catch( error ){
            console.error( error );
        }

        this.game().message({ message : `the hitman ${result} <span class="faction-${unit.faction}">the ${unit.faction}'s ${unit.name}</span> in <span class="highlight">the ${args.area.name}</span>`, faction : this });

        this.game().advancePlayer();
    }


    canActivateHitMan( token, area ) {
        return _.factionsWithUnitsInArea( this.game().factions, area, { exclude : this.name, basic : true, notHidden : true }).length > 0;
    }
}


module.exports = Mafia;
