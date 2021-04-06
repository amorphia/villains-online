let obj = {


    /**
     * Handle any unit triggered events of the given type
     *
     * @param type
     * @param unitsData
     */
    async unitTriggeredEvents( type, unitsData ){
        // wrap our units in an array if its not already
        if( !Array.isArray( unitsData ) ) unitsData = [ unitsData ];

        // get the triggered events we need to apply
        let events = this.getUnitTriggeredEvents( type, unitsData );

        // resolve our triggered events
        if( events.length ) await this.resolveUnitTriggeredEvents( events )
            .catch( error => console.log( error ) );

    },


    /**
     * Cycle through the given units checking if any have the "onEventType" property, and if
     * they do, add them to our return array
     *
     * @param type
     * @param unitsData
     * @returns {[]}
     */
    getUnitTriggeredEvents( type, unitsData ){
        let events = [];
        let property = 'on' + _.classCase( type );

        unitsData.forEach( data => {
            // if this entries unit doesn't have the matching "onEvent" property ignore it
            if( !data.unit[property] ) return;

            // otherwise get our event method name and push this object to our events to run array
            data.event = data.unit[property];
            events.push( data );
        });

        return events;
    },


    /**
     * Resolves each of the unit triggered events
     *
     * @param events
     */
    async resolveUnitTriggeredEvents( events ){
        // cycle through our events
        for( let event of events ) {
            let faction = this.game().factions[ event.unit.faction ];

            // resolve the triggered event
            try {
                await faction[ event.event ]( event );
            } catch( error ){
                console.error( error );
            }
        }
    },

};

module.exports = obj;


