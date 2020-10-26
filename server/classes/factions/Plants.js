let Faction = require( './Faction' );


class Plants extends Faction {
    name = 'plants';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Reclamation of Gaia";
        this.data.focus = 'enemy-in-areas-focus';
        this.data.focusDescription = "Have many enemy units in your areas";
        this.data.vines = [];
        this.data.plants = {};


        // tokens
        this.tokens['vines'] = {
            count: 3,
            data: {
                influence: 2,
                type: 'vines',
                cost: 0,
                areaStat : true,
                description : 'enemy players must pay 1 for each unit they deploy or move away from here'
            }
        };

        // units
        this.units['goon'].count = 2;
        this.units['mole'].count = 6;
        this.units['talent'].count = 4;
        this.units['patsy'].count = 8;
        this.units['patsy'].data.influence = 1;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Soul",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [],
                toughness: true,
                flipped: false,
                skilled: true,
                ready: false,
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onSkill : 'soulLure',
            }
        };
    }

    factionCombatMods( mods, area ) {
        if ( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ) {
            mods.push({
                type: 'soulHeal',
                text: `If The Soul of the Green is wounded, heal her at the end of combat`
            });
        }

        return mods;
    }

    processUpgrade( n ) {
        let vinesToAdd = _.min( [ n, this.data.vines.length ] );
        while( vinesToAdd ){
            this.data.tokens.push( this.data.vines.pop() );
            vinesToAdd--;
        }
    }


    factionsWithAdjacentPatsies( area ){
        let factions = {};

        area.data.adjacent.forEach( areaName => {
            Object.values( this.game().factions ).forEach( faction => {
                if( faction.name === this.name ) return;
                if( faction.data.units.find( unit => _.unitInArea( unit, areaName, { types : ['patsy'] } ) ) ) factions[ faction.name ] = true;
            });
        });

        return Object.keys( factions );
    }

    async soulLure( event ){
        let player, data, promises = [], units = [], area = this.game().areas[event.unit.location];

        this.game().message({ faction : this, message : `The Soul of the Green begins to sing...` });

        let factions = this.factionsWithAdjacentPatsies( area );

        if( !factions.length ) return this.game().message({ message : 'No adjacent patsies to lure', class : 'warning' });

        try {
            for( let factionName of factions ) {
                let faction = this.game().factions[factionName];

                let factionAreas = faction.areasWithUnits({ adjacent : area.data.adjacent, types : ['patsy'] });

                promises.push( this.game().promise({ players: faction.playerId, name: 'choose-units', data : {
                    count : 1,
                    areas : factionAreas,
                    unitTypes : ['patsy'],
                    playerOnly : true,
                    message : `Choose a patsy to move to The ${area.name}`
                }}).then( async ([player, data]) => {

                    let unit = this.game().objectMap[data.units[0]];

                    unit.location = area.name;
                    if( unit.ready ) unit.ready = false;
                    units.push( unit );

                    player.setPrompt({ active : false, playerUpdate : true });
                }));
            }


            await Promise.all( promises );

            await this.game().timedPrompt('units-shifted', {
                message: `Patsies were lured to The ${area.name}`,
                units: units
            });

        } catch( error ){
            console.error( error );
        }

    }


    async factionCleanUp() {
        // plant units are removed from your reserves
        this.data.units = this.data.units.filter( unit => !unit.plant );
    }

    // Turn killed units into plants
    async onAfterCombatStep(){
        let player, data;
        let areas = this.areasWithDeadUnits();

        if( !areas.length ) return this.game().message({ message: 'The Plants have no killed units to convert into plants', class : 'warning' });

        this.game().message({ faction: this, message: `The Plants must choose which dead shall be reborn into Gaia's embrace` });

        for( let area of areas ){
            [player, data] = await this.game().promise({
                players: this.playerId,
                name: 'choose-units',
                data: {
                    count : 1,
                    areas : [area],
                    playerOnly : true,
                    killedOnly : true,
                    canDecline : true,
                    basicOnly : true,
                    message: `choose a killed unit in The ${area} to transform into a plant`
                }
            }).catch( error => console.error( error ) );

            if( data.decline ){
                this.game().message({ faction: this, message: `The Plants decline to seed The ${area}` });
                continue;
            }

            let unit = this.game().objectMap[data.units[0]];
            this.becomePlant( unit );
        }
    }

    becomePlant( unit ){
        let area = unit.location;
        unit.plant = true;
        if( this.data.plants[area] ) this.data.plants[area]++;
        else this.data.plants[area] = 1;
        this.game().message({ faction: this, message: `The Plants' ${unit.type} in The ${area} is reborn from Gaia's touch` });
    }

    canActivateVines() {
        return true;
    }

    vinesToken() {
        this.game().advancePlayer();
    }



    onSetup(){
        let numToSetAside = 2 - this.data.upgrade;

        if( numToSetAside > this.data.vines.length ){
            while( numToSetAside > this.data.vines.length ){
                let vine = this.data.tokens.find( token => token.type === 'vines' && !token.location && !token.revealed );
                if( vine ) _.moveItemById( vine.id, this.data.tokens, this.data.vines );
            }
        } else if( numToSetAside < this.data.vines.length ){
            while( numToSetAside < this.data.vines.length ) {
                this.data.tokens.push(this.data.vines.pop());
            }
        }
    }

}


module.exports = Plants;
