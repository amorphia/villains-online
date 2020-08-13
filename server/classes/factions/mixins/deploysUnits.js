let obj = {

    canActivateDeploy( token, area ){
        return this.canDeployFromReserves() || this.deployFromAreas().length > 0;
    },


    canDeployFromReserves(){
        let lowestCost = this.reserves().reduce( (acc, unit) => {
            return !unit.noDeploy && unit.cost < acc ? unit.cost : acc;
        }, 100 );

        return this.money() >= lowestCost;
    },


    async deployToken( args ) {
        args.fromToken = true;
        let output = await this.deploy( args ).catch( error => console.error( error ) );

        if( output && output.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    },


    async deploy( args ){

        // set areas
        let areas = [];
        if( args.area ){
            if( typeof args.area === 'string' ) areas.push( args.area );
            else areas.push( args.area.name );
        } else {
            areas = Object.keys( this.game().areas );
        }

        let data = {
            deployLimit : args.deployLimit || this.data.deployLimit,
            toAreas : areas,
            fromAreas : this.deployFromAreas( args ),
            unitTypes : args.unitTypes,
            free : args.free,
            fromToken : args.fromToken,
            readyUnits : args.readyUnits
        };

        let result = await this.game().promise({
            players: args.player,
            name: 'deploy-action',
            data : data
        }).catch( error => console.error( error ) );
        return await this.processDeploy( ...result ).catch( error => console.error( error ) );
    },


    deployFromAreas( args = {} ){
        let areas = {};
        let money = this.money();

        _.forEach( this.data.units, (unit, index) => {
            // if our deploy is limited to a certain unit type only include areas with those
            let unitMatches = !args.unitTypes || args.unitTypes.includes( unit.type );
            let canPayFor = args.free || money >= unit.cost;

            if( !unit.noDeploy && canPayFor && unitMatches && _.unitInPlay( unit ) ){
                areas[ unit.location ] = { val : true };
                if( this.data.name === 'aliens' && unit.type === "champion"){
                    areas[ unit.location ].kau = true;
                }
            }
        });

        _.forEach( areas, (data, name) => {
            let cards = this.game().areas[name].data.cards;
            let trapped = _.find( cards, card => card.class === 'trapped-like-rats' ) && ! data.kau;
            let nuked = _.find( cards, card => card.class === 'suitcase-nuke' );

            if( nuked || trapped ){
                delete areas[name];
            }
        });

        return Object.keys( areas );
    },

    async processDeploy( player, data ){
        if( data.decline ) return { declined : true };

        let units = [];

        let output = {
            cost : data.cost,
            units : [],
        };

        this.payCost( data.cost );

        data.units.forEach( unitId => {
            let unit = this.game().objectMap[unitId];

            units.push( unit );
            output.units.push({
                from : unit.location,
                unit : unit
            });

            // heal wounded units, an unflip units coming in from the reserves
            if( unit.flipped && ( unit.toughness || !unit.location ) ){
                unit.flipped = false;
                this.unitUnflipped( unit );
            }

            // ready units
            if( data.readyUnits ){
                unit.ready = true;
            } else {
                if( unit.ready && ( unit.faction !== 'hackers' || !unit.location ) ) unit.ready = false;
            }

            // update area
            unit.location = data.toArea;


        });

        // prepare prompt and chat message
        let unitNames = [];
        units.forEach( unit => {
            unitNames.push( unit.name )
        });

        let message = `Pay xC${output.cost}x to deploy <span class="faction-${this.name}">${ unitNames.join(', ') }</span> to the ${output.units[0].unit.location}`;
        this.message({ message: message, faction : this });

        if( !data.hidePrompt ) {
            await this.game().timedPrompt('units-shifted', {
                message: `The ${this.name} deploy units to the ${data.toArea}`,
                units: units
            }).catch( error => console.error( error ) );
        }

        try {
            await this.triggeredEvents( 'deploy', output.units );
        } catch( error ){
            console.error( error );
        }

        return output;
    }
};

module.exports = obj;
