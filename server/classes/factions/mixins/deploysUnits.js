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
            if( !args.pod ) this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        if( args.pod ) return;

        for( let faction of Object.values( this.game().factions ) ){
            await faction.onAfterActivateToken( args.token );
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
            areas = Object.values( this.game().areas ).map( area => area.name );
        }

        let data = {
            deployLimit : args.deployLimit || this.data.deployLimit,
            toAreas : areas,
            fromAreas : this.deployFromAreas( args ),
            unitTypes : args.unitTypes,
            free : args.free,
            fromToken : args.fromToken,
            noBonusUnits : args.noBonusUnits,
            readyUnits : args.readyUnits,
            reduceCost : args.reduceCost
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
        let area = typeof args.area === 'string' ? this.game().areas[args.area] : args.area;
        let kauInArea = area && area.hasKau() && this.name !== 'aliens';


        _.forEach( this.data.units, (unit, index) => {
            // if our deploy is limited to a certain unit type only include areas with those
            let unitMatches = !args.unitTypes || args.unitTypes.includes( unit.type );
            let canPayFor = args.free || unit.redeployFree || money >= unit.cost;
            let blockedByKau = unit.type === 'champion' && kauInArea;

            if( !unit.noDeploy
                && canPayFor
                && unitMatches
                && !blockedByKau
                && _.unitInPlay( unit )
            ){
                areas[ unit.location ] = { val : true };
            }
        });

        if( this.data.ghosts ){
            _.forEach( this.data.ghosts, (unit, index) => {
                // if our deploy is limited to a certain unit type only include areas with those
                if( !args.unitTypes || args.unitTypes.includes( unit.type ) ){
                    areas[ unit.location ] = { val : true };
                }
            });
        }

        _.forEach( areas, (data, name) => {
            let area = this.game().areas[name];
            let cards = area.data.cards;

            if( _.areaIsTrapped( this, area )){
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

            // unghost ghosts
            if( unit.ghost ){
                let ghosts = this.game().factions['ghosts'];
                ghosts.unGhost( unit );
            }

            // update area
            unit.location = data.toArea;
        });

        let unitNames = [];
        units.forEach( unit => {
            unitNames.push( unit.name )
        });

        // ghost deploy
        if( data.ghosts && data.ghosts.length ){
            let ghostOutput = this.game().factions['ghosts'].deployGhosts( data.ghosts, data.toArea );
            ghostOutput.forEach( ghost => unitNames.push( 'ghost' ) );
            units = _.concat( units, ghostOutput );
        }

        // prepare prompt and chat message
        let message = `Pay xC${output.cost}x to deploy <span class="faction-${this.name}">${ unitNames.join(', ') }</span> to the ${data.toArea}`;
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
