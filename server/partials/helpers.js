let helpers = {

    /***
     *
     * Actual Lodash Helpers
     *
     */
    classCase( str ){
        return this.startCase( this.camelCase( str ) ).replace(/ /g, '');
    },


    /**
     * Deep diff between two object, using lodash
     * @param  {Object} object Object compared
     * @param  {Object} base   Object to compare with
     * @return {Object}        Return a new object who represent the diff
     */
    difference( object, base ) {
        function changes( object, base, _this ) {
            return _this.transform( object, function( result, value, key ) {
                if ( !_this.isEqual( value, base[key] ) ) {
                    result[key] = ( _this.isObject( value )
                                    && _this.isObject( base[key] ) ) ? changes( value, base[key] ) : value;
                }
            });
        }
        return changes( object, base, this );
    },


    roll( count = 1, max = 10 ){
        let rolls = [];
        for( let i = 0; i < count; i++ ){
            rolls.push( _.random( 1, max ) );
        }

        if( rolls.length === 1 ) rolls = rolls[0];
        return rolls;
    },


    popRandom( array ){
        return array.splice( Math.floor(Math.random() * array.length), 1 )[0];
    },


    moveItemById( id, source, target, mode = 'push' ){
        if( typeof id !== 'string' ) id = id.id;
        let index = _.findIndex( source, item => item.id === id );
        let item = _.pullAt( source, index );
        target[mode]( item[0] );
        return true;
    },


    moveItem( index, source, target, mode = 'push' ){
        if(    !Array.isArray( source )
            || !Array.isArray( target )
            || !source[index]
        ){
            return false;
        }

        let item = _.pullAt( source, index );
        target[mode]( item[0] );

        return true;
    },


    /**
     *
     *
     *  Game functions I started stashing here because it seemed convenient
     *
     *
     */


    factionIcon( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        return `/images/factions/${faction}/icon.jpg`;
    },



    /**
     *
     *
     *  COMBAT
     *
     *
     */

    assignableHits( units, options = {} ){
        let assignableHits = 0;
        units.forEach( unit => {
            if( !unit.hidden && ( !options.nonPatsy || unit.type !== 'patsy' ) ){
                assignableHits += ( unit.toughness && !unit.flipped )
                || (unit.flipped && unit.faction === 'vampires' && unit.type === 'champion') ? 2 : 1;
                assignableHits -= unit.hits ? unit.hits : 0;
            }
        });
        return assignableHits;
    },


    calculateDefenseBonus( attackingFaction, targetFaction, area, options = {} ){
        if( attackingFaction.data ) attackingFaction = attackingFaction.data;
        if( targetFaction.data ) targetFaction = targetFaction.data;
        if( area.data ) area = area.data;

        let defenseBonus = 0;
        if( ! options.unit ) return defenseBonus;

        if( targetFaction.defenseBonus && !this.hasKauImmunity( attackingFaction, area ) ){
            defenseBonus += targetFaction.defenseBonus;
            if( options.debug ) console.log( 'Apply targetFaction.defenseBonus defense bonus:', defenseBonus  );
        }

        if( targetFaction.name === 'mutants' && _.find( area.tokens, token => token.revealed && token.name === 'biohazard') ){
            defenseBonus += 2;
            if( options.debug ) console.log( 'Apply bioHazard defense bonus:', defenseBonus  );
        }

        if( targetFaction.factionDefenseBonus ){
            defenseBonus += targetFaction.factionDefenseBonus;
            if( options.debug ) console.log( 'Apply targetFaction.factionDefenseBonus defense bonus:', defenseBonus  );
        }

        if( options.debug ) console.log( 'Final defense bonus:', defenseBonus  );
        return defenseBonus;
    },


    /**
     *
     *
     *  TOKENS
     *
     *
     */

    getTokenCounts( faction, area ){
        let tokens = {};
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                tokens[token.type] = tokens[token.type] ? tokens[token.type] + 1 : 1;
            }
        });
        return tokens;
    },

    firstUnrevealedToken( area, options = {} ){
        if( area.data ) area = area.data;
        return this.find( area.tokens, token => {
            return token && token.revealed === false && ( !options.enemy || token.faction !== options.enemy );
        });
    },

    firstRevealedToken( area, options = {} ){
        if( area.data ) area = area.data;

        return this.find( area.tokens, token => {
            return token && token.revealed
                && ( !options.enemy || token.faction !== options.enemy )
                && ( !options.player || token.faction === options.player );
        });
    },

    discardToken( token, area ){
        if( area.data ) area = area.data;
        let tokenSpace = false;

        token.location = null;
        _.forEach( area.tokens, (item, index, collection ) => {
            if( item.id && token.id === item.id ){
                collection[index] = {};
                tokenSpace = index + 1;
            }
        });
        return tokenSpace;
    },


    /**
     *
     *
     *  SKILLS
     *
     *
     */

    hasUsedSkill( faction, area ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;
        return faction.usedSkills.includes( area )
    },


    canUseMagick( faction, area, factions ){

        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( faction.name !== 'witches') return;

        if( faction.units.find( unit => this.unitInArea( unit, area ) && unit.flipped ) ) return true;

    },

    canUseSkill( faction, area, factions ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( this.hasUsedSkill( faction, area ) ) return;

        if( faction.units.find( unit => this.unitReadyInArea( unit, area ) ) ) return true;

        /*
        // Zero Day special ability
        if( faction.name === 'hackers'
            && faction.units.find( unit => this.unitInArea( unit, area ) && unit.type === 'champion' )
        ){
            for( let fac of Object.values( factions ) ){
                if( fac.name === faction.name ) continue;
                if( fac.units.find( unit => this.unitReadyInArea( unit, area ) && unit.basic ) ) return true;
            }
        }
        */
    },

    unitReady( unit ){
        return !unit.killed && unit.ready && unit.location;
    },

    unitReadyInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && !unit.killed && unit.ready;
    },

    unitNotReadyInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && !unit.killed && !unit.ready;
    },

    /**
     *
     *
     *  UNITS
     *
     *
     */

    factionUnitsInArea( faction, area, options = {} ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;
        return faction.units.filter( unit => this.unitInArea( unit, area, options ) );
    },


    hasUnitsInArea( faction, area, options = {} ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        return !! this.find( faction.units, unit => {
            return _.unitInArea( unit, area, options );
        });
    },


    factionsWithUnitsInArea( factions, area, args ){
        if( typeof area !== 'string' ) area = area.name;
        let factionsWithUnits = [];

        _.forEach( factions, (faction, name) => {
            let exclude = false;

            console.log( 'factionsWithUnitsInArea args', args );

            if( args.exclude ){
                if( Array.isArray( args.exclude ) && args.exclude.includes( name ) ) exclude = true;
                else if( args.exclude === name ) exclude = true;
                console.log( 'factionsWithUnitsInArea exclude', exclude );
            }

            if( this.hasUnitsInArea( faction, area, { basic : args.basic, notHidden : args.notHidden, types : args.types } ) && ! exclude ){
                factionsWithUnits.push( name );
            }
        });

        return factionsWithUnits;
    },

    deadInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && unit.killed;
    },


    unitInArea( unit, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name;

        return unit.location === area
                && !unit.killed
                && ( !options.basic || unit.basic )
                && ( !options.flipped || unit.flipped )
                && ( !options.type || options.type === unit.type )
                && ( !options.types || options.types.includes( unit.type ) )
                && ( !options.notHidden || !unit.hidden );
    },

    areasMostUnits( faction, factions ){
        if( faction.data ) faction = faction.data;
        let mostUnits = {};

        // cycle through each faction
        Object.values( factions ).forEach( faction => {
            let unitsInArea = {};

            // make a list of how many units this faction in each area
            faction.units.forEach( unit => {
                if( this.unitInPlay( unit ) ){
                    if( unitsInArea[unit.location] ) unitsInArea[unit.location]++;
                    else unitsInArea[unit.location] = 1;
                }
            });

            // compare this list of units per area to our list of most by area, if this faction has more than
            // the existing entry (if any) it takes the top spot
            for (const [key, value] of Object.entries( unitsInArea ) ) {
                if( !mostUnits[key] || mostUnits[key].count < value ) mostUnits[key] = { faction : faction.name, count : value }
            }
        });

        // convert most units object to array and filter out areas where we don't have the most units
        mostUnits = Object.values( mostUnits ).filter( item => item.faction === faction.name );

        return mostUnits;
    },


    maxSingleObject( object, property ){
        let max = 0;
        Object.values( object ).forEach( val => {
            if( val > max ) max = val;
        });

        console.log( max );

        if( !max ) return false;

        let hasMax = [];
        for ( const [key, value] of Object.entries( object ) ) {
           if( value === max ) hasMax.push( key );
        }

        return hasMax.length === 1 ? hasMax[0] : false;
    },


    areasMostTokens( faction, areas ){
        if( faction.data ) faction = faction.data;
        let mostTokens = 0;

        // cycle through each faction
        Object.values( areas ).forEach( area => {
            let tokensInArea = {};

            // make a list of how many units this faction in each area
            area.tokens.forEach( token => {
                if( token.faction ){
                    if( tokensInArea[token.faction] ) tokensInArea[token.faction]++;
                    else tokensInArea[token.faction] = 1;
                }
            });

            // compare this list of units per area to our list of most by area, if this faction has more than
            // the existing entry (if any) it takes the top spot
            if( this.maxSingleObject( tokensInArea ) === faction.name ) mostTokens++;
        });

        return mostTokens;
    },


    enemyUnitsInArea( faction, area, factions, options = {} ){
        if( faction.data ) faction = faction.data;
        let units = {};

        _.forEach( factions, fac => {
            if( fac.name === faction.name ) return;
            let factionUnits = _.factionUnitsInArea( fac, area );

            if( options.basic ) factionUnits = factionUnits.filter( unit => unit.basic );
            if( options.notHidden ) factionUnits = factionUnits.filter( unit => ! unit.hidden );

            if( factionUnits.length ){
                units[fac.name] = factionUnits;
            }
        });
        return units;
    },

    unitsInPlay( faction ){
        if( faction.data ) faction = faction.data;
        return faction.units.filter( unit => this.unitInPlay( unit ) );
    },

    unitInReserves( unit ){
        return !unit.location && !unit.killed;
    },

    unitInPlay( unit ){
        return unit.location && !unit.killed;
    },


    factionAreas( faction, areas ){
        let factionAreas = [];

        this.forEach( areas, (area, name) => {
            if( area.owner === faction.name ){
                factionAreas.push( name );
            }
        });
        return factionAreas;
    },


    /**
     *
     *
     *  INFLUENCE
     *
     *
     */

    eachInfluenceInArea( area, factions, withZeros ){
        let influences = [];
        if( area.owner === 'neutral' ) influences.push( { faction : 'neutrals', influence : 1 } );

        this.forEach( factions, faction => {
            let influence = this.influence( faction, area, factions );
            if( withZeros || influence ) influences.push({ faction : faction.name, influence : influence });
        });

        influences.sort( (a,b) => b.influence - a.influence );
        return influences;
    },

    influence( faction, area, factions ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        let influence = 0;

        if( area.owner === faction.name ) influence++;
        influence += this.unitInfluence( faction, area );
        influence += this.tokenInfluence( faction, factions, area );
        influence += this.cardInfluence( faction, factions, area );
        influence += this.churchInfluence( faction, area, factions );
        influence += this.plantInfluence( faction, area );
        return influence;
    },


    cardInfluence( faction, factions, area ){
        let influence = 0;
        let cards = this.getCardCounts( faction, area );
        let tokens = this.getTokenCounts( faction, area );
        let areaScared = this.areaIsScared( faction, factions, area );

        if( cards['rousing-speech'] ) influence += (2 * cards['rousing-speech']);
        if( cards['blown-cover'] ) influence += cards['blown-cover'];
        if( !areaScared && cards['march-the-streets'] && tokens['deploy'] ) influence += ( 2 * cards['march-the-streets'] * tokens['deploy'] );
        if( !areaScared && cards['display-of-brilliance'] && tokens['card'] ) influence += ( 2 * cards['display-of-brilliance'] * tokens['card'] );
        return influence;
    },


    plantInfluence( faction, area ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( faction.name !== 'plants' ) return 0;
        return faction.plants[area.name] ? faction.plants[area.name] : 0;
    },


    unitInfluence( faction, area ){
        if( faction.data ) faction = faction.data; if( area.data ) area = area.data;

        let influence = 0;
        let shouldRiseUp = this.shouldRiseUp( faction, area );

        if( !this.shouldStandDown( faction, area ) ){
            if( faction.data ) faction = faction.data;
            faction.units.forEach( unit => {
                if( this.unitInArea( unit, area ) ){
                    influence += unit.influence;
                    if( shouldRiseUp && unit.type === 'patsy' ) influence++;
                }
            });
        }

        return influence;
    },

    shouldRiseUp( faction, area ){
        if( faction.data ) faction = faction.data; if( area.data ) area = area.data;

        if( faction.name !== 'commies' ) return false;
        return !!this.find( area.tokens, token => token.name === 'rise-up' && token.revealed );
    },


    /**
     *
     *
     *  KILLS
     *
     *
     */

    factionKilledUnitHere( faction, unit, area ){
        if( typeof faction !== 'string' ) faction = faction.name;
        if( typeof area !== 'string' ) area = area.name;
        return unit.killed === faction && unit.location === area;
    },

    areaExterminated( area, factions ){
        if( area.data ) area = area.data;

        let suitcaseNuke = _.find( area.cards, card => card.class === 'suitcase-nuke' );
        if( suitcaseNuke ) return suitcaseNuke.owner;

        let factionsWithUnitsHere = [];
        let factionsWithNonHiddenUnitsHere = [];
        _.forEach( factions, (faction, name) => {
            if( faction.data ) faction = faction.data;
            if( faction.units.some( unit => this.unitInArea( unit, area ) ) ) factionsWithUnitsHere.push( name );
            if( faction.units.some( unit => this.unitInArea( unit, area, { notHidden: true } ) ) ) factionsWithNonHiddenUnitsHere.push( name );
        });

        // if only one player has units here (including hidden units), and that player has a kill they have scored an exterminate
        if( factionsWithUnitsHere.length === 1 && this.killsInArea( factionsWithUnitsHere[0], area.name, factions ) > 0 ){
            return factionsWithUnitsHere[0];
        }

        // if multiple players have units here, but only one has non-hidden units and they have a kill, that player has scored an exterminate
        if( factionsWithNonHiddenUnitsHere.length === 1 && this.killsInArea( factionsWithNonHiddenUnitsHere[0], area.name, factions ) > 0 ){
            return factionsWithNonHiddenUnitsHere[0];
        }

        return;
    },


    allKilledUnitsInAreaByFaction( areaName, factions ){
        if( typeof areaName !== 'string' ) areaName = areaName.name;
        let areaDead = {};
        this.forEach( factions, faction => {
            faction.units.forEach( unit => {
                if( unit.location === areaName && unit.killed ){
                    if( areaDead.hasOwnProperty( unit.killed ) ){
                        areaDead[unit.killed].push( unit );
                    } else {
                        areaDead[unit.killed] = [unit];
                    }
                }
            });
        });
        return areaDead;
    },

    factionKills( faction, factions ){
        let kills = [];

        _.forEach( factions, fac => {
            fac.units.forEach( unit => {
                if( unit.killed === faction.name ){
                    kills.push( unit );
                }
            })
        });

        return kills;
    },


    factionWinningAreas( faction, factions, areas, areaLeaders ){
        let winningAreas = [];
        Object.keys( areas ).forEach( areaName => {
            if( areaLeaders[areaName] && areaLeaders[areaName] === faction.name ) winningAreas.push( areaName );
        });

        if( factions['loyalists']){
            let queen = factions['loyalists'].units.find( unit => this.unitInPlay( unit ) && unit.type === 'champion' );
            if( queen ) winningAreas = winningAreas.filter( area => area !== queen.location );
        }

        return winningAreas;
    },


    factionEnemyInAreas( faction, factions, areas, areaLeaders = false ){
        let winningAreas = [];
        let count = 0;

        if( areaLeaders ){
            winningAreas = this.factionWinningAreas( faction, factions, areas, areaLeaders );
        } else {
            Object.values( areas ).forEach( area => {
                if( area.owner === faction.name ) winningAreas.push( area.name );
            });
        }

        Object.values( factions ).forEach( fac => {
            if( fac.name === faction.name ) return;
            count += fac.units.filter( unit => winningAreas.includes( unit.location ) && !unit.killed ).length;
        });

        return count;
    },


    factionKillsInEnemy( faction, factions, areas, areaLeaders = false ){
        let enemyAreas = [];

        if( areaLeaders ){
            let winningAreas = this.factionWinningAreas( faction, factions, areas, areaLeaders );
            Object.keys( areas ).forEach( areaName => {
                if( !winningAreas.includes( areaName ) ) enemyAreas.push( areaName );
            });
        } else {
            Object.values( areas ).forEach( area => {
                if( area.owner && area.owner !== faction.name ) enemyAreas.push( area.name );
            });
        }

        return this.factionKills( faction, factions ).filter( unit => enemyAreas.includes( unit.location ) );
    },

    areasWithFactionKills( faction, factions ){
        let areas = {};

        this.factionKills( faction, factions ).forEach( kill => {
            areas[kill.location] = true;
        });

        return Object.keys( areas );
    },


    factionTypesKilled( faction, factions ){
        let types = {};

        let kills = this.factionKills( faction, factions );
        kills.forEach( unit => {
            if( types.hasOwnProperty( unit.type ) ) types[unit.type]++;
            else types[unit.type] = 1;
        });

        return Object.keys( types ).length ? types : false;
    },


    killsInArea( factionName, areaName, factions ){
        if( typeof factionName !== 'string' ) factionName = factionName.name;
        if( typeof areaName !== 'string' ) areaName = areaName.name;
        let kills = 0;

        this.forEach( factions, ( faction, name ) => {
            if( name === factionName ) return;
            kills += faction.units.filter( unit => this.factionKilledUnitHere( factionName, unit, areaName ) ).length;
        });

        return kills;
    },


    churchInfluence( faction, area, factions ){
        if( faction.name !== 'cultists' ) return 0;
        return this.killsInArea( faction.name, area.name, factions );
    },


    areaIsScared( faction, factions, area ){
        if( faction.name === 'ghosts' || !factions['ghosts'] ) return false;
        return factions['ghosts'].units.some( unit => unit.type === 'champion' && this.unitInArea( unit, area.name ) );
    },

    tokenInfluence( faction, factions, area ){
        if( this.areaIsScared( faction, factions, area ) ) return 0;

        let influence = 0;
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                influence += token.influence;
            }
        });
        return influence;
    },


    /**
     *
     *
     *  AREAS
     *
     *
     */


    areasWithTokensCount( faction, areas, type ){
        let count = 0;

        _.forEach( areas, area => {
            if( _.find( area.tokens, token => {
                if( token.revealed
                    && token.faction === faction.name
                    && ( !type || token.type === type )
                ) return true;
            }) ) count++;
        });

        return count;
    },

    areasWithUnits( faction, options = {} ){
        if( faction.data ) faction = faction.data;
        if( typeof options.types === 'string' ) options.types = [ options.types ];

        let areas = {};
        faction.units.forEach( unit => {
            if( _.unitInPlay( unit )
                && ( !options.types || options.types.includes( unit.type ) )
                && ( !options.adjacent || options.adjacent.includes( unit.location ) )
                && ( !options.flipped || unit.flipped )
                && ( !options.deployable || !unit.noDeploy )
                && ( !options.notHidden || !unit.hidden )
                && ( !options.basic || unit.basic )
            ){
                areas[ unit.location ] = true;
            }
        });

        let areasArray = Object.keys( areas );

        if( options.excludesArea ){
            areasArray = areasArray.filter( area => area !== options.excludesArea );
        }

        return areasArray;
    },


    getCardCounts( faction, area ){
        let cards = {};
        area.cards.forEach( card => {
            if( card.owner === faction.name ){
                cards[card.class] = cards[card.class] ? cards[card.class] + 1 : 1;
            }
        });
        return cards;
    },

    shouldStandDown( faction, area ) {
        let standDowns = area.cards.map(card => card.class === 'stand-down' ? card.owner : false);
        standDowns = standDowns.filter(name => name); // filter out false values

        if ( !this.hasKauImmunity( faction, area ) ) return standDowns.length > 0;
        return standDowns.filter( owner => owner === 'aliens' ).length > 0;
    },

    areaIsTrapped( faction, area ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // if this area is trapped by the plants and we don't have enough money return true
        let vines = area.tokens.filter( token => token.type === 'vines' && token.revealed );
        if( faction.name !== 'plants' && vines.length ){
            return _.money( faction ) < vines.length;
        }

        // let make an array of all the players that have played a trapped like rats here
        let traps = [];
        area.cards.forEach( card => {
            if( card.class === 'trapped-like-rats' ) traps.push( card.owner );
        });

        // if there are no trapped like rats played here, then the area ain't trapped
        if( !traps.length ) return false;

        // if there is at least one TLR here and we don't have Kau immunity then we are trapped
        if( !this.hasKauImmunity( faction, area ) ) return true;

        // but even if we do have Kau immunity we still get trapped by our own TLR
        if( _.remove( traps, name => name !== faction.name ).length ) return true;
    },


    vinesCost( faction, units, factions ){
        if( faction.name === 'plants' || ! factions['plants'] ) return 0;

        // find out where each of our vines tokens is located
        let vinesAreas = {};
        let vines = factions['plants'].tokens.forEach( token => {
            if( token.type === 'vines' && token.revealed && token.location ){
                if( vinesAreas[token.location] ) vinesAreas[token.location] = vinesAreas[token.location] + 1;
                else vinesAreas[token.location] = 1;
            }
        });
        if( ! Object.keys( vinesAreas ).length ) return 0;

        // apply appropriate cost per vines token
        let cost = 0;
        units.forEach( unit => {
            if( vinesAreas[ unit.location ] ) cost += vinesAreas[ unit.location ];
        });

        return cost;
    },

    policePayoffs( faction, area, units ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;
        let policePayoff = 0;

        _.forEach( area.cards, card => {
            if( card.class === 'police-payoff' // if there is a police payoff here
                && card.owner !== faction.name // which we don't own
                && !this.hasKauImmunity( faction, area ) // and we don't already have kau immunity in this area
                && !this.find( units, unit => unit.type === 'champion' && unit.faction === 'aliens' ) ) // and we aren't deploying kau
            {
                policePayoff++; // increase our police payoff cost by one
            }
        });

        return policePayoff;

    },

    hasKauImmunity( faction, area ){
        return faction.kau && faction.kau.location === area.name && !faction.kau.killed;
    },


    /**
     *
     *  Others
     *
     */

     money( faction, darkEnergy = false ){
        if( faction.data ) faction = faction.data;

        let money = faction.resources + faction.energy;
        if( darkEnergy && faction.hasOwnProperty( 'darkEnergy' ) ) money += faction.darkEnergy;

        return money;
     },

     rulesPlayed( faction, areas ){
        if( faction.data ) faction = faction.data;

        let rules = {
            total : faction.cards.active.length,
            areas : 0,
            stack : 0,
        };

        let globalAreas = {};

        for( let card of faction.cards.active ){
            if( globalAreas[card.playedIn] ) globalAreas[card.playedIn]++;
            else globalAreas[card.playedIn] = 1;
        }

        for( let area of Object.values( areas ) ){
            let areaRules = area.cards.filter( card => card.owner === faction.name );
            if( areaRules.length ) {
                rules.total += areaRules.length;
                if( globalAreas[area.name] ) globalAreas[area.name] += areaRules.length;
                else globalAreas[area.name] = areaRules.length;
            }
        }

        rules.areas = Object.keys( globalAreas ).length;
        console.log( Object.keys( globalAreas ) );
        globalAreas = Object.values( globalAreas );

        if( globalAreas.length ){
            rules.stack = globalAreas.reduce( (val, n) => val > n ? val : n );
        }

        return rules;
    }


};



module.exports = helpers;
