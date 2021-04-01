let Faction = require( './Faction' );


class Ninjas extends Faction {
    name = 'ninjas';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "clearSmokeFromAreas",
            "onAfterTokenReveal" : "lotusDancerMove"
        };


        //data
        this.data.name = this.name;
        this.data.focus = 'kill-types-focus';
        this.data.focusDescription = "Kill different unit types";
        this.data.title = "The Clan of the Pale Moon";
        this.data.bladesBonusDice = 0;
        this.data.smokeAreas = [];
        //this.data.firstAttackThisBattle = false;
        //this.data.flippedUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // icons
        this.data.statusIcon = 'smoke';
        this.data.statusDescription = 'has hidden unit';

        // tokens
        this.tokens['blades'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'blades',
                resource: 1,
                cost: 0,
                req: "This token must be discarded if you can't make an attack with a unit"
            }
        };

        // units
        this.units['patsy'].data.attack = [7];
        this.units['patsy'].data.onHit = 'placeSmoke';
        this.units['talent'].data.attack = [5];
        this.units['talent'].data.onHit = 'placeSmoke';
        this.units['mole'].data.attack = [7];
        this.units['mole'].data.onHit = 'placeSmoke';
        this.units['goon'].data.onHit = 'placeSmoke';

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Lotus Dancer",
                type: 'champion',
                basic: false,
                influence: 2,
                seeking: true,
                attack: [4],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onHit: 'placeSmoke',
            }
        };
    }

    battleOrderSort(combatFactions) {
        combatFactions.sort((a, b) => {
            if (a.name === this.name) return -1;
            if (b.name === this.name) return 1;
            return a.order - b.order
        });
    }

    factionCombatMods(mods, area) {
        mods.push({
            type: 'ninjas',
            text: `The Ninjas attack first in player order, if one of their units rolls a hit place a smoke token in that area if it doesn't have one already.`
        });

        mods.push({
            type: 'smoke',
            text: `If the ninjas have a smoke token in this area, they may discard it to ignore one enemy unit's attack`
        });

        return mods;
    }

    processUpgrade(n) {
        this.data.bladesBonusDice = n;
    }

    async lotusDancerMove(token) {
        let player, data;

        let lotusDancer = this.data.units.find(unit => unit.type === 'champion' && _.unitInPlay(unit));
        if (token.type !== 'battle' || !lotusDancer) return;

        let lotusDancerArea = this.game().areas[lotusDancer.location];
        let area = this.game().areas[token.location];

        // check if lotus dancer can't legally move
        if (lotusDancerArea.isTrapped(this) // if she's trapped
            || !area.data.adjacent.includes(lotusDancer.location) // if she's not adjacent
            || area.hasKau() // if kau is in the destination
        ) return;

        this.game().message({faction: this, message: 'Lotus dancer deciding whether to enter the frey'});

        // prompt player to select a unit
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'question',
            data: {message: `Move lotus dancer from the ${lotusDancer.location} to the ${area.name}?`}
        }).catch(error => console.error(error));

        if (!data.answer) return this.game().message({faction: this, message: 'Lotus dancer declines to get involved'});

        lotusDancer.location = token.location;
        this.game().sound('wiff');
        this.game().message({faction: this, message: `Lotus Dancer slips into the ${token.location}`});

        await this.game().timedPrompt('units-shifted', {
            message: `Lotus Dancer slips into the ${token.location}`,
            units: lotusDancer
        }).catch(error => console.error(error));

    }


    canActivateBlades(token, area) {
        return this.hasUnitsInArea(area) && area.canBattle();
    }


    async bladesToken(args) {
        let data, player;

        // prompt player to select a unit
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data: {
                count: 1,
                areas: [args.area.name],
                hasAttack: true,
                playerOnly: true,
                showEnemyUnits: true,
                message: "Choose a unit to make an attack",
            }
        }).catch(error => console.error(error));

        let unit = this.game().objectMap[data.units[0]];

        // resolve attack with that unit
        let attackArea = this.game().areas[unit.location];
        let output = await this.attack({
            area: attackArea,
            attacks: unit.attack,
            unit: unit,
            noDecline: true,
            bonusDice: this.data.bladesBonusDice
        });

        if (output) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }

        this.game().advancePlayer();
    }

    placeSmoke(event) {
        if (this.data.smokeAreas.includes(event.unit.location)) return;

        this.data.smokeAreas.push(event.unit.location);
        this.game().message({faction: this, message: `Release a smoke bomb in the  ${event.unit.location}`});
    }

    async clearSmokeFromAreas() {
        if( !this.data.smokeAreas.length ) return;

        this.data.smokeAreas = [];
        this.game().message({faction: this, message: `smoke clears from the city`});
    }
}


module.exports = Ninjas;
