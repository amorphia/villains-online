let obj = {


    /**
     * Handle any unit triggered events of the given type
     *
     * @param type
     * @param unitsData
     * @param area
     */
    async unitTriggeredEvents( type, unitsData, area ){
        // wrap our units in an array if its not already
        if( !Array.isArray( unitsData ) ) unitsData = [ unitsData ];

        // get the triggered events we need to apply
        let events = this.getUnitTriggeredEvents( type, unitsData, area );

        // resolve our triggered events
        if( events.length ) await this.resolveUnitTriggeredEvents( events, area )
            .catch( error => console.log( error ) );

    },


    /**
     * Cycle through the given units checking if any have the "onEventType" property, and if
     * they do, add them to our return array
     *
     * @param type
     * @param unitsData
     * @param area
     * @returns {[]}
     */
    getUnitTriggeredEvents( type, unitsData, area ){
        let events = [];
        let property = 'on' + _.classCase( type );

        unitsData.forEach( data => {
            // if this entries unit doesn't have the matching "onEvent" property ignore it
            if( !data.unit[property] ) return;

            // otherwise get our event method name and push this object to our events to run array
            data.event = data.unit[property];
            data.area = area;
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


