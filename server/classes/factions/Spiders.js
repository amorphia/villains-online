let Faction = require( './Faction' );


class Spiders extends Faction {
    name = 'spiders';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Eyes of the Woods";
        this.data.focus = 'web-focus';
        this.data.focusDescription = "Trap enemy units in webs";
        this.data.patsyWebBonus = 0;
        this.data.webs = [];

        // tokens
        delete this.tokens['battle'];

        this.tokens['drop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'drop',
                cost: 0,
                resource : 1
            }
        };

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 3;
        this.units['patsy'].count = 8;
        this.units['patsy'].data.deadly = true;
        this.units['patsy'].data.attack = [8];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xchxch",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [3],
                deadly: true,
                cost: 2,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }

    factionCombatMods( mods, area ) {
        mods.push({
            type: 'deadly',
            text: `Patsies and champions are deadly, deadly units attack all enemies and ignore defensive modifiers`
        });

        if( this.data.patsyWebBonus ){
            mods.push({
                type: 'webBonus',
                text: `Patsies gain +${this.data.patsyWebBonus} to their attack in areas with a web marker`
            });
        }

        return mods;
    }

    processUpgrade( upgrade ) {
        this.data.patsyWebBonus = n === 1 ? 2 : 3;
    }

    onKillUnit( unit ){
        let faction = this.game().factions[ unit.faction ];
        _.moveItemById( unit.id, faction.data.units, this.data.webs );
    }


    canActivateDrop( token, area ) {
        let hasPatsies = this.data.units.some( unit => unit.type === 'patsy' && !unit.killed );
        let canBattle = area.canBattle();
        return hasPatsies || canBattle;
    }

    async onBeforeBattle( battle ){
        let data, player;

        // is Xchxch here? No? then return
        let xchxch = this.data.units.some( unit => unit.type === 'champion' && _.unitInArea( unit, battle.area.name ) );
        if( !xchxch ) return;


        let options = {
            area: battle.area,
            faction: this,
            player: this.playerId,
            fromToken : true,
            deployLimit: 1,
            unitTypes: ['patsy'],
        };

        this.game().message({ faction : this, message : `Xchxch summons a hatchling to the feast` });
        await this.deploy( options );
    }

    async dropToken( args ) {
        let data, player;

        let options = {
            area: args.area,
            faction: this,
            player: this.playerId,
            fromToken : true,
            deployLimit: 2,
            unitTypes: ['patsy'],
        };
        let deployed = await this.deploy( options );
        if( ( !deployed.units || !deployed.units.length ) && ! args.area.canBattle() ) return this.game().declineToken( this.playerId, args.token, true );

        await this.game().battle( args.area );
        this.game().advancePlayer();
    }

}


module.exports = Spiders;
