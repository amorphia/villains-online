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
        this.data.xchxchDeploy = 1;
        this.data.webs = [];

        // tokens
        delete this.tokens['battle'];

        this.tokens['drop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'drop',
                cost: 0,
                resource : 1,
                req : "To avoid discarding this token you must deploy at least one patsy, or start a battle"
            }
        };

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 3;
        this.units['patsy'].count = 10;
        this.units['patsy'].data.deadly = true;
        this.units['patsy'].data.attack = [8];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xchxch",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [4],
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
            text: `Patsies and champions are deadly, deadly units attack all enemies can't be modified`
        });

        /*
        if( this.data.patsyWebBonus ){
            mods.push({
                type: 'webBonus',
                text: `Patsies gain +${this.data.patsyWebBonus} to their attack in areas with a web marker`
            });
        }
        */

        return mods;
    }

    processUpgrade( upgrade ) {
        this.data.xchxchDeploy = upgrade + 1;
    }

    onKillUnit( unit ){
        if( unit.faction === this.name ) return;

        let faction = this.game().factions[ unit.faction ];
        _.moveItemById( unit.id, faction.data.units, this.data.webs );
    }

    factionsInWebs(){
        let totals = _.webbedTotals( this, this.game().data.factions );
        let factions = [];

        _.forEach( totals.factions, ( total, faction ) => {
            if( total ) factions.push( faction );
        });

        console.log( 'factions in webs', factions );
        return factions;
    }

    areaString( areas ){
        if( areas.length === 1 ) return areas[0];

        let areasClone = areas.slice();
        let string = '';
        string = ` and ${areasClone.pop()}`;
        string = areasClone.join( ', ' ) + string;

        return string;
    }

    freeUnit( unit, faction ){
        _.moveItemById( unit.id, this.data.webs, faction.data.units );
        faction.resetKilledUnit( unit );
        console.log( 'Free unit', unit );
    }

    async onStartOfTurn(){
        let player, data, promises = [];
        this.game().message({ message : `Units try to escape their webs` });

        let factions = this.factionsInWebs();
        if( !factions.length ) return this.game().message({ message : 'No units caught in webs', class : 'warning' });

        try {
            for( let factionName of factions ) {
                let faction = this.game().factions[factionName];

                promises.push( this.game().promise({ players: faction.playerId, name: 'free-units', data : {} })
                    .then( async ([player, data]) => {
                        let areas = data.areas;

                        if( areas.length ){
                            faction.payCost( areas.length, true );

                            let clonedWebs = this.data.webs.slice();
                            clonedWebs.forEach( unit => {
                                if( unit.faction === faction.name && areas.includes( unit.location ) ) this.freeUnit( unit, faction );
                            });

                            let areaString = this.areaString( areas );
                            this.game().message({ faction : faction, message : `frees their units in the ${areaString}` });
                        } else {
                            this.game().message({ faction : faction, message : `units remain trapped in webs` });
                        }

                        player.setPrompt({ active : false, playerUpdate : true });
                }));
            }

            await Promise.all( promises );

        } catch( error ){
            console.error( error );
        }
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
            deployLimit: this.data.xchxchDeploy,
            unitTypes: ['patsy'],
        };

        this.game().message({ faction : this, message : `Xchxch calls her brood to the feast` });
        await this.deploy( options );
    }

    async dropToken( args ) {
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
