let Faction = require( './Faction' );


class Bikers extends Faction {
    name = 'bikers';

    constructor(owner, game) {
        super(owner, game);

        // data
        this.data.name = this.name;
        this.data.bonusDeploy = { inPlay: true, count : 2 };
        this.data.title = "Hell's Blade Cycle Club";
        this.data.focusDescription = "Most units in areas";
        this.data.upgrade = 0;

        // tokens
        this.tokens['bully'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'battle',
                cost: 0,
                resource: 1,
                description: "Start a battle in this area if possible, your units gain first strike for this battle.",
                req: "This token must be discarded if you cannot start a battle"
            }
        };

        delete this.tokens['battle'];
        delete this.tokens['move'];

        // units
        this.units['goon'].count = 5;
        this.units['goon'].data.noReplace = true;
        this.units['goon'].data.redeployFree = true;

        this.units['patsy'].count = 8;
        this.units['patsy'].data.noReplace = true;
        this.units['patsy'].data.redeployFree = true;

        this.units['talent'].count = 5;
        this.units['talent'].data.noReplace = true;
        this.units['talent'].data.redeployFree = true;

        this.units['mole'].count = 3;
        this.units['mole'].data.noReplace = true;
        this.units['mole'].data.redeployFree = true;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Danny 'The Blade' Sturgis",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [6,6,6],
                cost: 3,
                toughness: true,
                clipped: false,
                killed: false,
                onDeploy: 'bladeIntimidate',
                onMove: 'bladeIntimidate',
                selected : false,
                hitsAssigned : 0,
                noReplace: true,
                onHit: 'bladeRecruit',
                redeployFree: true,
            }
        };
    }

    /**
     * Handle our basta sacrifice trigger
     *
     * @param event
     */
    async bladeIntimidate( event ){
        let from = event.from;
        let area = event.unit.location;

        // if The Blade wasn't deployed from a different area do nothing
        if( from === area ) return;

        const unitCount = this.unitsInArea( area ).length;

        // let the players decide whether to return a unit or pay 1
        let promises = [];

        Object.values(this.game().factions).forEach( faction => {
            promises.push( this.factionChooseIntimidateAction( faction, event.unit.location, unitCount ) );
        });

        // await all choices
        const responses = await Promise.all( promises );

        // process choices
        const units = this.processIntimidateActions( responses );


        if(units.length){
            await this.game().timedPrompt('units-shifted', {
                message : `Danny "The Blade" scares units out of town`,
                units: units,
            });
        }

    }

    async factionChooseIntimidateAction( faction, area, unitCount ) {
        const factionCount = faction.unitsInArea(area).length;
        // only opponents with fewer units than us are affected
        if (faction.name === this.name || factionCount === 0 || factionCount >= unitCount){
            console.log(faction.name + ' not intimidated', faction.unitsInArea(area).length, unitCount);
            return {notIntimidated: true};
        }

        let [player, response] = await this.game().promise({
            players: faction.playerId,
            name: 'choose-units',
            data : {
                message: "Choose a unit to return to your reserves, or pay xC1x",
                count : 1,
                areas : [ area ],
                playerOnly: true,
                canPayInstead: 1,
            }
        });

        const unit = response.units ? response.units[0] : null;

        return {
            faction: faction,
            unit: unit,
            pay: response.pay
        };
    }



    processIntimidateActions( responses ){
        const units = [];

        responses.forEach( response => {
            const faction = response.faction;

            if(response.pay){
                faction.payCost(1);
                let message = `Danny "The Blade" Strugis shakes down <span class="faction-${faction.name}">the ${faction.name}</span> for xC1x`;
                this.game().message({ faction, message });
                return;
            }

            if(response.unit){
                const unit = this.game().objectMap[response.unit];
                units.push( _.clone(unit) );
                faction.returnUnitToReserves( unit );
            }
        });

        return units;
    }


    async bladeRecruit( event ){
        console.log("blade recruit", event);
        if(!this.data.upgrade || !this.data.units.some( unit =>  _.unitInReserves( unit, { type : 'patsy' } ) ) ) return;

        // gain resources equal to the hits scored
        const count = this.data.upgrade === 1 ? 1 : event.hits;
        console.log("recruit count", count);

        await this.resolveRecruitPatsies( event.unit.location, count );
    }



    async resolveRecruitPatsies( area, count ){
        let units = [];

        // add spiders equal to our dropDeploy count
        for( let i = 0; i < count; i++ ){
            let patsy = this.placePatsy( area );
            if( !patsy ) continue;
            units.push( patsy );
        }

        // abort if we didn't deploy any units
        if( !units.length ) return [];

        // send out the birth announcements
        this.message( "The Blade's brutal act of violence draws in more gang members" );

        await this.game().timedPrompt('units-shifted', {
            message : "The Blade's brutal act of violence draws in more gang members",
            units: units
        }).catch( error => console.error( error ) );

        return units;
    }


    placePatsy( area ){
        let patsy = this.data.units.find( unit => _.unitInReserves( unit, { type : 'patsy' } ) );

        if( this.game().combat ) this.game().combat.addUnitToCombat( patsy );

        if( !patsy ) return null;

        patsy.location = area;
        return patsy;
    }


    /**
     * Can we activate our bully token?
     *
     * @returns {boolean}
     */
    canActivateBully( token, area ){
        return this.canActivateBattle( token, area );
    }


    /**
     *
     */
    async activateBullyToken( args ) {
        this.applyFirstStrikeToUnits( args.area );

        // resolve a battle in this area
        await this.game().battle( args.area );

        this.applyFirstStrikeToUnits( args.area, false );

        // advance the game
        this.game().advancePlayer();
    }


    applyFirstStrikeToUnits( area, add = true ){
        const units = this.data.units.filter( unit => unit.location === area.name );

        units.forEach( unit => {
            if( add ){
                unit.firstStrike = true;
            } else {
                delete unit.firstStrike;
            }
        })
    }

}


module.exports = Bikers;
