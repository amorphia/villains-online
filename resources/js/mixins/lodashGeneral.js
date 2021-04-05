let helpers = {

    /**
     *
     * @param str
     * @returns {string|void}
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


    roll( count = 1, max = 10, game, faction ){
        let rolls = [];
        for( let i = 0; i < count; i++ ){
            let roll = _.random( 1, max );
            rolls.push( roll );
            if( game ) game.data.rolls[roll]++;
            if( faction ) faction.data.rolls[roll]++;
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
};



module.exports = helpers;
