let obj = {


    async triggeredEvents( type, units ){
        if( !Array.isArray( units ) ) units = [ units ];
        let events = this.getTriggeredEvents( type, units );

        if( events.length ){
            await this.processTriggeredEvents( events );
        }
    },


    async processTriggeredEvents( events ){
        for( let event of events ) {
            let faction = this.game().factions[ event.unit.faction ];
            await faction[ event.event ]( event );
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


