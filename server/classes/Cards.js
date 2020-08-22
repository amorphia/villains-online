

class Card {

    // abstract
    handle(){}
    // abstract
    clear(){}

    async cardDeploy( faction, area, newArgs ) {
        let args = {
            area: area,
            faction: faction,
            player: faction.playerId,
        };
        Object.assign( args, newArgs );
        let output = await faction.deploy( args ).catch( error => console.error( error ) );
        if ( output && output.declined ) return;

        return output;
    }
}


class AllHollowsEve extends Card {
    async handle( faction, area ){

        let units = [];

        _.forEach( faction.game().factions, (item, name) =>{
            item.data.units.forEach( unit => {
                if( unit.killed && unit.location ){

                    units.push( unit );

                    unit.killed = false;
                    if( unit.ready ) unit.ready = false;
                    if( unit.flipped ){
                        unit.flipped = false;
                        item.unitUnflipped( unit );
                    }
                }
            });
        });


        await faction.game().timedPrompt('units-shifted', {
            message: `The ${faction.name} returns killed units to play`,
            units: units
        }).catch( error => console.error( error ) );

    }
}

class AmpleCover extends Card {
    handle( faction ){
        faction.data.defenseBonus++;
    }

    clear( faction ){
        faction.data.defenseBonus--;
    }
}


class BlownCover extends Card {
    async handle( faction, area ){
        await faction.game().battle( area, { attackBonus : 3 } ).catch( error => console.error( error ) );
    }
}


class BlackstoneEncryption extends Card {
    async handle( faction, area ){
        let player = {}, data = {}, chosenArea;

        let areas = {};
        _.forEach( faction.game().areas, area => {
            if( _.hasUnitsInArea( faction, area ) && !_.hasUsedSkill( faction, area ) ){
                areas[area.name] = true;
            }
        });
        areas = Object.keys( areas );

        if( !areas.length ){
            faction.game().message({ message : 'No valid areas to resolve Blackstone Encryption', class : 'warning' });
            return;
        }

        if( areas.length === 1 ){
            chosenArea = areas[0];
        } else {
            [player, data] = await faction.game().promise({
                players: faction.playerId,
                name: 'choose-skill',
                data : { areas : areas  }
            }).catch( error => console.error( error ) );
            chosenArea = data.area;
        }

        // activate that skill
        try {
            await faction.useSkill( chosenArea );
        } catch( error ){
            console.error( error );
        }

    }
}

class CeaseFire extends Card {}


class ChicagoAirlift extends Card {
    async handle( faction, area ){

        let args = {
            area: area,
            faction: faction,
            player: faction.playerId,
            farMove : true,
        };


        let output = await faction.move( args ).catch( error => console.error( error ) );

        if ( output && output.declined ) return;

        return output;
    }
}


class Despotism extends Card {
    async handle( faction ){
        let areas = faction.areas();
        for( let index in faction.areas() ){
            let area = faction.game().areas[areas[index]];
            faction.game().message({ faction: faction, message:  `the mad despot launches an attack in the ${area.name}` });
            await faction.nonCombatAttack(5, 2, area ).catch( error => console.error( error ) );
        }
    }
}


class FishInABarrel extends Card {
    async handle( faction, area ){
        await faction.nonCombatAttack(4, 3, area ).catch( error => console.error( error ) );
    }
}


class DisplayOfBrilliance extends Card {}


class GoGoGo extends Card {
    handle( faction ){
        faction.data.deployLimit++;
    }

    clear( faction ){
        faction.data.deployLimit--;
    }
}


class GoWithGod extends Card {
    handle( faction ){
        faction.data.defenseBonus += 2;
    }

    clear( faction ){
        faction.data.defenseBonus -= 2;
    }
}


class HighNoon extends Card {
    async handle( faction, area ) {
        let player = {}, data = {};

        // get our unit types
        let unitTypes = {};
        faction.data.units.forEach(unit => {
            if (!unit.location && unit.basic) unitTypes[unit.type] = true;
        });
        unitTypes = Object.keys(unitTypes);

        if (!unitTypes.length) {
            faction.game().message({
                faction: faction,
                message: 'High Noon cannot be resolved (no basic units in your reserves)',
                class: 'warning'
            });
            return;
        }

        let enemies = [];
        // get enemies with at least one matching unit type
        _.forEach(faction.game().factions, enemy => {
            if (enemy.name === faction.name) return;

            let matchingUnit = _.find(enemy.data.units, unit => {
                return !unit.location && unitTypes.includes(unit.type);
            });

            if (matchingUnit) enemies.push(enemy.name);
        });


        if (!enemies.length) {
            faction.game().message({
                faction: faction,
                message: 'High Noon cannot be resolved (no matching basic units in enemy reserves)',
                class: 'warning'
            });
            return;
        }

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'high-noon',
            data: {
                area: area.name,
                types: unitTypes,
                enemies: enemies
            }
        }).catch( error => console.error( error ) );

        let units = data.units.map(id => faction.game().objectMap[id]);

        for( let unit of units ){
            let deployFaction = faction.game().factions[unit.faction];
            await deployFaction.processDeploy( deployFaction.playerId, {
                cost: 0,
                units: [unit.id],
                toArea: area.name,
                hidePrompt : true
            }).catch( error => console.error( error ) );
        }

        await faction.game().timedPrompt('units-shifted', {
            message: `The ${faction.name} place units in the ${area.name}`,
            units: units
        }).catch( error => console.error( error ) );
    }
}


class LetGodSortThemOut extends Card {
    async handle( faction, area ){
        let promises = [];
        let units = [];

        try {
            _.forEach( faction.game().factions, item => {
                let areasOwned = item.areas().length;
                let unitsInPlay = item.data.units.filter( unit => unit.location && !unit.killed );
                let unitsToSacrifice = Math.min( areasOwned, unitsInPlay.length );

                if( unitsToSacrifice > 0 ){

                    let areas = {};
                    unitsInPlay.forEach( unit => areas[unit.location] = true );
                    areas = Object.keys( areas );

                    promises.push( faction.game().promise({ players: item.playerId, name: 'sacrifice-units', data : { count : unitsToSacrifice, areas : areas  } }).then( async ([player, data]) => {

                        let unitNames = [];
                        for( let u of data.units ){
                            let unit = faction.game().objectMap[u];
                            unitNames.push( unit.name );
                            units.push( unit );
                            await faction.game().killUnit( unit, faction );
                        }

                        let message = `sacrifices <span class="faction-${item.name}item">${unitNames.join(', ')}</span>`;
                        faction.game().message({ faction: item, message: message });
                        player.setPrompt({ active : false, playerUpdate : true });
                    }));
                }
            });


            await Promise.all( promises );

            await faction.game().timedPrompt('units-shifted', {
                message: `The ${faction.name} killed the following units`,
                units: units
            });

        } catch( error ){
            console.error( error );
        }
    }
}


class MarchTheStreets extends Card {}


class MarketInstability extends Card {
    handle( faction, area ){
        _.forEach( faction.game().factions, ( item, name ) => {
            if( name !== faction.name ){
                item.payCost( 1, true );
            }
        });
    }
}

class Massacre extends Card {
    handle( faction ){
        faction.data.bonusDice++;
    }

    clear( faction ){
        faction.data.bonusDice--;
    }
}


class MilitaryCache extends Card {
    handle( faction ){
        faction.data.attackBonus += 2;
    }

    clear( faction ){
        faction.data.attackBonus -= 2;
    }
}


class Mobilize extends Card {
    async handle( faction, area ){
        let args = {
            free: true,
            deployLimit: 2
        };
        return await this.cardDeploy( faction, area, args ).catch( error => console.error( error ) );
    }
}


class PolicePayoff extends Card {}


class PublicBacklash extends Card {
    async handle( faction, area ){
        await faction.nonCombatAttack(5, 2, area ).catch( error => console.error( error ) );
    }
}

class RousingSpeech extends Card {}


class Shakedown extends Card {
    handle( faction, area ){
        let promises = [];

        try {
            _.forEach( faction.game().factions, item => {
               if( item.data.cards.hand.length > 0 && item.name !== faction.name ){
                   console.log( 'shakedown sent to', item.name );
                   promises.push( faction.game().promise({ players: item.playerId, name: 'discard-card', data : {} }).then( ([player, data]) => {
                       let eventFaction = faction.game().factions[data.faction];
                       eventFaction.discardCard( data.cardId );
                       player.setPrompt({ active : false, playerUpdate : true });
                   }));
               }
            });
        } catch (error ){
            console.error( error );
        }

        return Promise.all( promises );

    }
}


class SlipInTheBack extends Card {
    async handle( faction, area ){

        if( !faction.data.units.find(
            unit => unit.type === 'talent'
                    && !unit.noDeploy
                    && !unit.killed
        )){
            faction.game().message({ faction : faction, message: "No talents to deploy", class : 'warning'  });
            return;
        }

        let args = {
            free: true,
            deployLimit: 1,
            unitTypes: ['talent'],
            readyUnits: true
        };
        return await this.cardDeploy( faction, area, args ).catch( error => console.error( error ) );
    }
}


class StrokeOfGenius extends Card {
    handle( faction ){
        faction.drawCards(2);
    }
}


class StandDown extends Card {}



class Stupor extends Card {
    async handle( faction, area ){
        let player, data;

        if( ! _.find( area.data.tokens, token => token.faction !== faction.name && !token.revealed ) ){
            faction.game().message({ faction : faction, message: "No tokens to stupor", class : 'warning'  });
            return false;
        }

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : [area.name],
                enemyOnly : true,
                unrevealedOnly : true
            }
        }).catch( error => console.error( error ) );

        let token = faction.game().objectMap[data.tokens[0]];
        let tokenSpot = _.discardToken( token, area );
        faction.game().message({ faction : faction, message: `Removes <span class="faction-${token.faction}">the ${token.faction} token</span> from the ${tokenSpot} slot of the ${area.name}` });

    }
}


class SuitcaseNuke extends Card {
    async handle( faction, area ){
        let player = {}, data = {};

        // can we sacrifice a unit
        if( !_.find( faction.data.units, unit => _.unitInArea( unit, area ) ) ){
            faction.game().message({ faction : faction, message: "don't have a unit to sacrifice to suitcase nuke", class : 'warning' });
            _.remove( area.data.cards, card => card.class === 'suitcase-nuke' );
            return;
        }

        // do we want to sacrifice a unit
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data : {
                count : 1,
                areas : [area.name],
                optional : true
            }
        });

        if( !data.units.length ){
            faction.game().message({ faction : faction, message: "chose not to activate the suitcase nuke", class : 'text' });
            _.remove( area.data.cards, card => card.class === 'suitcase-nuke' );
            return;
        }

        //
        //
        // BOOOOOOOOOOM!
        //
        //

        faction.game().sound( 'explosion' );

        // lose control of area
        if( area.data.owner ){
            if( area.data.owner === 'neutral' ){
                area.data.owner = null;
            } else {
                let owner = faction.game().factions[ area.data.owner ];
                owner.loseControlOfArea( area );
            }
        }

        // remove all tokens
        area.data.tokens.forEach( token => {
           token.location = null;
           token.revealed = false;
        });
        area.data.tokens = [];

        // kill all units
        for( let fac of Object.values( faction.game().factions ) ){
            for( let unit of fac.data.units ) {
                if( _.unitInArea( unit, area ) ){
                    await faction.game().killUnit( unit, faction );
                }
            }
        }
    }
}


class TotalWar extends Card {
    handle( faction, area ){
        _.forEach(faction.game().areas, (item , name) => {
            item.data.battle = true;
        });
    }
}


class TrappedLikeRats extends Card {}


class Windfall extends Card {
    handle( faction ){
        faction.gainResources( 2 );
    }
}

module.exports = {
    'all-hollows-eve' : AllHollowsEve,
    'ample-cover': AmpleCover,
    'blown-cover': BlownCover,
    'blackstone-encryption': BlackstoneEncryption,
    'cease-fire': CeaseFire,
    'chicago-airlift': ChicagoAirlift,
    'despotism': Despotism,
    'fish-in-a-barrel': FishInABarrel,
    'display-of-brilliance': DisplayOfBrilliance,
    'go-go-go': GoGoGo,
    'go-with-god': GoWithGod,
    'high-noon': HighNoon,
    'let-god-sort-them-out': LetGodSortThemOut,
    'march-the-streets': MarchTheStreets,
    'market-instability': MarketInstability,
    'massacre': Massacre,
    'military-cache': MilitaryCache,
    'mobilize': Mobilize,
    'police-payoff': PolicePayoff,
    'public-backlash': PublicBacklash,
    'rousing-speech': RousingSpeech,
    'shakedown': Shakedown,
    'slip-in-the-back': SlipInTheBack,
    'stroke-of-genius': StrokeOfGenius,
    'stand-down': StandDown,
    'stupor': Stupor,
    'suitcase-nuke': SuitcaseNuke,
    'total-war': TotalWar,
    'trapped-like-rats': TrappedLikeRats,
    'windfall': Windfall,
};



