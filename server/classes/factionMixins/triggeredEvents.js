let obj = {


    async triggeredEvents( type, units ){
        if( !Array.isArray( units ) ) units = [ units ];
        let events = this.getTriggeredEvents( type, units );

        if( events.length ){
            try {
                await this.processTriggeredEvents( events );
            } catch( error ){
                console.error( error );
            }
        }
    },


    async processTriggeredEvents( events ){
        for( let event of events ) {
            let faction = this.game().factions[ event.unit.faction ];

            try {
                await faction[ event.event ]( event );
            } catch( error ){
                console.error( error );
            }
        }
    },


    getTriggeredEvents( type, units ){
        let events = [];
        let property = 'on' + _.classCase( type );

        units.forEach( data => {
            if( data.unit[property] ){
                data.event = data.unit[property];
                events.push( data );
            }
        });
        return events;
    },


};

module.exports = obj;


