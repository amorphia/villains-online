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

    moveItemById: function( id, source, target, mode = 'push' ){
        if( typeof id !== 'string' ) id = id.id;
        let index = _.findIndex( source, item => item.id === id );
        let item = _.pullAt( source, index );
        target[mode]( item[0] );
        return true;
    },

    moveItem: function( index, source, target, mode = 'push' ){
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

    firstUnrevealedToken( area ){
        return this.find( area.tokens, token => {
            return token && token.revealed === false
        });
    },

    factionIcon( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;

        return `/images/factions/${faction}/icon.jpg`;
    },

    assignableHits( units ){
        let assignableHits = 0;
        units.forEach( unit => {
            assignableHits += (unit.toughness && !unit.flipped)
                              || (unit.flipped && unit.faction === 'vampires' && unit.type === 'champion') ? 2 : 1;
            assignableHits -= unit.hits ? unit.hits : 0;
        });
        return assignableHits;
    },



    factionUnitsInArea( faction, area, type ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;
        return faction.units.filter( unit => this.unitInArea( unit, area ) && ( !type || unit.type === type ) );
    },


    hasUnitsInArea( faction, area, basic ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        return !! this.find( faction.units, unit => {
            if( basic ) return unit.basic && _.unitInArea( unit, area );
            else return _.unitInArea( unit, area );
        });
    },


    factionsWithUnitsInArea( factions, area, args ){
        if( typeof area !== 'string' ) area = area.name;
        let factionsWithUnits = [];

        _.forEach( factions, (faction, name) => {
            if( this.hasUnitsInArea( faction, area, args.basic ) && args.exclude !== name ){
                factionsWithUnits.push( name );
            }
        });

        return factionsWithUnits;
    },


    hasUsedSkill( faction, area ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;
        return faction.usedSkills.includes( area )
    },


    canUseSkill( faction, area ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( this.hasUsedSkill( faction, area ) ) return 0;
        return faction.units.filter( unit => this.unitReadyInArea( unit, area ) ).length;
    },


    deadInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && unit.killed;
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

    factionKilledUnitHere( faction, unit, area ){
        if( typeof faction !== 'string' ) faction = faction.name;
        if( typeof area !== 'string' ) area = area.name;
        return unit.killed === faction && unit.location === area;
    },

    unitInArea( unit, area, type ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && !unit.killed && (!type || type === unit.type );
    },

    enemyUnitsInArea( faction, area, factions, basicOnly = false ){
        if( faction.data ) faction = faction.data;

        let units = {};
        _.forEach( factions, fac => {
            if( fac.name === faction.name ) return;
            let factionUnits = _.factionUnitsInArea( fac, area );
            if( basicOnly ){
                factionUnits = factionUnits.filter( unit => unit.basic)
            }
            if( factionUnits.length ){
                units[fac.name] = factionUnits;
            }
        });
        return units;
    },

    unitInReserves( unit ){
        return !unit.location && !unit.killed;
    },

    unitInPlay( unit ){
        return unit.location && !unit.killed;
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

    calculateDefenseBonus( attackingFaction, targetFaction, area ){
        if( attackingFaction.data ) attackingFaction = attackingFaction.data;
        if( targetFaction.data ) targetFaction = targetFaction.data;
        if( area.data ) area = area.data;

        let defenseBonus = 0;

        if( targetFaction.defenseBonus && !this.hasKauImmunity( attackingFaction, area ) ){
            defenseBonus += targetFaction.defenseBonus;
        }

        if( targetFaction.name === 'mutants' && _.find( area.tokens, token => token.revealed && token.name === 'biohazard') ){
            defenseBonus += 2;
        }

        if( targetFaction.factionDefenseBonus ){
            defenseBonus += targetFaction.factionDefenseBonus;
        }

        return defenseBonus;
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
        influence += this.tokenInfluence( faction, area );
        influence += this.cardInfluence( faction, area );
        influence += this.churchInfluence( faction, area, factions );
        return influence;
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

    areaExterminated( area, factions ){

        let suitcaseNuke = _.find( area.cards, card => card.class === 'suitcase-nuke' );
        if( suitcaseNuke ) return suitcaseNuke.owner;

        let factionsWithUnitsHere = [];
        _.forEach( factions, (faction, name) => {
            if( faction.data ) faction = faction.data;
            if( _.find( faction.units, unit => this.unitInArea( unit, area ) ) ) factionsWithUnitsHere.push( name );
        });

        return factionsWithUnitsHere.length === 1 && this.killsInArea( factionsWithUnitsHere[0], area.name, factions ) > 0 ? factionsWithUnitsHere[0] : false;
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

    tokenInfluence( faction, area ){
        let influence = 0;
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                influence += token.influence;
            }
        });
        return influence;
    },

    cardInfluence( faction, area ){
        let influence = 0;
        let cards = this.getCardCounts( faction, area );
        let tokens = this.getTokenCounts( faction, area );

        if( cards['rousing-speech'] ) influence += (2 * cards['rousing-speech']);
        if( cards['march-the-streets'] && tokens['deploy'] ) influence += ( 2 * cards['march-the-streets'] * tokens['deploy'] );
        if( cards['display-of-brilliance'] && tokens['card'] ) influence += ( 2 * cards['display-of-brilliance'] * tokens['card'] );
        return influence;
    },

    getTokenCounts( faction, area ){
        let tokens = {};
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                tokens[token.type] = tokens[token.type] ? tokens[token.type] + 1 : 1;
            }
        });
        return tokens;
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

    hasKauImmunity( faction, area ){
        return faction.kau && faction.kau.location === area.name && !faction.kau.killed;
    },

};



module.exports = helpers;
