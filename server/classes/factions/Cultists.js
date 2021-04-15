let Faction = require( './Faction' );


class Cultists extends Faction {
    name = 'cultists';

    constructor(owner, game) {
        super(owner, game);

        // data
        this.data.maxEnergy = 4;
        this.data.tokenCost = 0; // post to place tokens
        this.data.name = this.name;
        this.data.bonusDeploy = { type: 'champion', count : 1 };
        this.data.title = "The Church of Doom";
        this.data.focusDescription = "Kill many units";

        // tokens
        this.tokens['nothing'] = {
            count: 4,
            data: {
                req : "This token must always be discarded"
            }
        };
        delete this.tokens['battle'];

        // units
        this.units['goon'].count = 6;
        this.units['goon'].data.influence = 0;
        this.units['patsy'].count = 6;
        this.units['patsy'].data.attack = [7];
        this.units['talent'].count = 6;
        this.units['talent'].data.influence = 0;
        delete this.units['mole'];


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Basta, Robed in Night",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [],
                cost: 0,
                killed: false,
                onDeploy: 'bastaSacrifice',
                onMove: 'bastaSacrifice',
                selected : false,
                hitsAssigned : 0
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        this.data.units.forEach( unit => {
            // only wanna mess with patsies
            if( unit.type !== 'patsy' ) return;
            // upgrade out attacks
            unit.attack = upgrade === 1 ? [7,7] : [7,7,7];
        });
    }


    /**
     * Handle our basta sacrifice trigger
     *
     * @param event
     */
    async bastaSacrifice( event ){
        let area = event.from;

        // if basta wasn't moved/deployed from an area do nothing
        if( !area || area === event.unit.location ) return;

        let message = 'Choose player to target with Basta';
        // get our target faction
        let targetFaction = await this.selectEnemyPlayerWithUnitsInArea( area, message )
            .catch( error => console.error( error ) );

        // abort if we don't have any targets
        if( !targetFaction ){
            this.message( "No souls for Basta to claim", { class : 'warning' } );
            return;
        }

        // get our victim and kill it
        let unit = await this.getBastaSacrificeVictim( targetFaction, area );
        await this.game().killUnit( unit, this );

        // show our work
        message = `sacrifices <span class="faction-${unit.faction}">${unit.name}</span> in the ${event.from}`;
        this.game().message({ faction: targetFaction, message: message });
        await this.game().timedPrompt('units-shifted', {
            message : `Basta claims a soul in the ${event.from}`,
            units: [unit]
        });
    }


    /**
     * Get the unit that will be sacrificed to basta
     *
     * @param faction
     * @param area
     */
    async getBastaSacrificeVictim( faction, area ) {
        // alert players
        this.game().sound( 'basta' );
        let message = `<span class="faction-${faction.name}">the ${faction.name}</span> must pay tribute to Basta`;
        this.game().message({ faction, message });

        // get our enemy units
        let enemyUnits = _.factionUnitsInArea(faction, area);

        // if there is only one enemy units just return it
        if ( enemyUnits.length === 1 ) {
            return enemyUnits[0];
        }

        // otherwise let that player choose whch of their units to sacrifice
        let [player, response] = await this.game().promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data: {count: 1, areas: [area]}
        }).catch(error => console.error(error));

        return this.game().objectMap[response.units[0]];
    }


    /**
     * Can we activate our nothing token?
     *
     * @returns {boolean}
     */
    canActivateNothing(){
        // no, don't even think about it
        return false;
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        // patsy attack dice upgrade
        if( this.data.upgrade ){
            mods.push({
                type: 'patsies',
                text: `Patsies throw ${this.data.upgrade} additional dice`
            });
        }

        // cultist influence for kills
        mods.push( { type : 'cultistInfluence', text : `Gains xIx for each kill` });
        return mods;
    }
}


module.exports = Cultists;
