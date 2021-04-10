let helpers = {

    /**
     * Takes a string, capitalizes every word, and removes spaces: "activate battleToken" => "ActivateBattleToken"
     *
     * @param {string} string
     * @returns {string|void}
     */
    classCase( string ){
        return this.startCase( this.camelCase( string ) ).replace(/ /g, '');
    },


    /**
     * Deep difference between two objects
     *
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


    /**
     * Roll x dice
     *
     * @param count
     * @param max
     * @param game
     * @param faction
     * @returns {number|number[]}
     */
    roll( count = 1, max = 10, game = null, faction = null ){
        let rolls = [];

        for( let i = 0; i < count; i++ ){
            let roll = _.random( 1, max );
            rolls.push( roll );

            // record roll data for game and faction
            if( game ) game.data.rolls[roll]++;
            if( faction ) faction.data.rolls[roll]++;
        }

        // if we are only rolling one dice, unwrap it from the array
        if( rolls.length === 1 ) rolls = rolls[0];
        return rolls;
    },


    /**
     * Remove and return a random element from an array
     *
     * @param array
     * @returns {any}
     */
    popRandom( array ){
        return array.splice( Math.floor(Math.random() * array.length), 1 )[0];
    },


    /**
     * Move an element (identified by its ID) from one array to another
     *
     * @param id
     * @param source
     * @param target
     * @param mode // what array method should we use when adding the element to the target array: push, unshift, etc...
     * @returns {boolean}
     */
    moveItemById( id, source, target, mode = 'push' ){
        if( !Array.isArray( source ) ) throw "moveItemById failed: source is not a valid array";
        if( !Array.isArray( target ) ) throw "moveItemById failed: target is not a valid array";
        if( typeof id !== 'string' ) id = id.id; //format input

        // get the item's index
        let index = _.findIndex( source, item => item.id === id );

        // move the item
        return this.moveItem( index, source, target, mode );
    },


    moveItem( index, source, target, mode = 'push' ){
        if( !Array.isArray( source ) ) throw "moveItemById failed: source is not a valid array";
        if( !Array.isArray( target ) ) throw "moveItemById failed: target is not a valid array";
        if( typeof source[index] === 'undefined' ) throw `moveItem failed: source index ${index} does not exist`;

        // remove element from the source array
        let item = _.pullAt( source, index );

        // add the element to the target array
        target[mode]( item[0] );

        return true;
    },


    /**
     * Takes an object made up of property key/numeric values and returns the key name that has the
     * largest non-zero value, but only if there is a single key with that highest value.
     * If more than one key is tied for highest value, or no values are greater than 0 false is returned;
     *
     * @param {object} object // formatted { key : {number}, key : {number}, etc... }
     * @returns {string|boolean}
     */
    maxSingleObject( object ){
        let max = 0;

        // cycle through our object finding the highest value
        Object.values( object ).forEach( val => {
            if( val > max ) max = val;
        });

        // if no values were greater than 0 return false
        if( !max ) return false;

        // now cycle through the properties looking for any that have that max value and add them to our array
        let results = [];
        for ( const [key, value] of Object.entries( object ) ) {
            if( value === max ) results.push( key );
        }

        // if we have exactly one result return it, otherwise return false
        return results.length === 1 ? results[0] : false;
    },
};



module.exports = helpers;
