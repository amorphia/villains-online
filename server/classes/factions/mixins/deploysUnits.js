let obj = {

    /**
     * Can we activate a deploy action?
     *
     * @returns {boolean}
     */
    canActivateDeploy(){
        return this.canDeployFromReserves() || this.deployFromAreas().length > 0;
    },


    /**
     * Can we deploy from our reserves?
     *
     * @returns {boolean}
     */
    canDeployFromReserves(){
        // get the lowest cost unit from our reserves, or if no units return 100, an impossible sum to pay
        let lowestCost = this.reserves().reduce( (acc, unit) => {
            return !unit.noDeploy && unit.cost < acc ? unit.cost : acc;
        }, 100 );

        // we got enough money to pay for this?
        return this.money() >= lowestCost;
    },


    /**
     * Handle activating a deploy token
     *
     * @param args
     */
    async activateDeployToken( args ) {
        // make sure our deploy action knows we are deploying off a token
        args.fromToken = true;

        // take a deploy action
        let output = await this.deploy( args ).catch( error => console.error( error ) );

        // if we decline (and aren't a pod) pull the token and abort
        if( output?.declined ){
            if( !args.pod ) this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // handle onActivateToken triggers
        await this.handleAfterActivateTokenTriggers( args );

        // advance game
        this.game().advancePlayer();
    },


    /**
     * Make a deploy action
     *
     * @param args
     */
    async deploy( args ){

        // get the areas we can deploy to
        let areas = this.getDeployAreas( args );

        let data = {
            deployLimit : args.deployLimit || this.data.deployLimit,
            toAreas : areas,
            fromAreas : this.deployFromAreas( args ),
            unitTypes : args.unitTypes,
            free : args.free,
            fromToken : args.fromToken,
            noBonusUnits : args.noBonusUnits,
            readyUnits : args.readyUnits,
            reduceCost : args.reduceCost,
            transformUnit : args.transformUnit
        };

        // have the player select units to deploy
        let response = await this.game().promise({
            players: args.player,
            name: 'deploy-action',
            data : data
        }).catch( error => console.error( error ) );

        // resolve the deploy
        return await this.resolveDeploy( ...response )
            .catch( error => console.error( error ) );
    },


    /**
     * Return an array of area names we can deploy to
     *
     * @param args
     * @returns {string[]}
     */
    getDeployAreas( args ){
        // if we have no provided area return all areas
        if( !args.area ) return this.game().data.areaOrder.slice();

        // if the provided area is an area name wrap it in an array and return it
        if (typeof args.area === 'string') return [args.area];

        // otherwise we must have been passed an area object, so return that areas' name as an array
        return [args.area.name];
    },


    /**
     * Return an array of area names for the areas we can deploy from
     *
     * @param args
     * @returns {string[]}
     */
    deployFromAreas( args = {} ){
        let money = this.money();
        let area = typeof args.area === 'string' ? this.game().areas[args.area] : args.area;
        let kauInArea = area && area.hasKau() && this.name !== 'aliens';

        let areas = {};
        // cycle through our units to check if they can be redeployed, if so add their area to our list
        this.data.units.forEach( unit => {
            if( this.canThisUnitBeReDeployed( unit, args, kauInArea, money ) ){
                areas[ unit.location ] = { val : true };
            }
        });

        // ghosts can be redployed too, so add their locations to our area list
        if( this.data.ghosts ){
            this.data.ghosts.forEach( unit => {
                // if we are limited to certain unit types then abort if our type doesn't match
                if( args.unitTypes && !args.unitTypes.includes( unit.type ) ) return;
                // otherwise add this ghosts area to our areas object
                areas[ unit.location ] = { val : true };
            });
        }

        // filter out any areas that are trapped and then return the remaining areas
        return Object.keys( areas ).filter( areaName => !_.areaIsTrapped( this, this.game().areas[areaName] ) );
    },


    /**
     * Returns if a given unit can be redeployed
     *
     * @param unit
     * @param args
     * @param kauInArea
     * @param money
     * @returns {boolean}
     */
    canThisUnitBeReDeployed( unit, args, kauInArea, money ){
        // noDeploy units can never be deployed
        if( unit.noDeploy ) return false;

        // a unit can't be re-deployed if it isn't already in a play, duh
        if( !_.unitInPlay( unit ) ) return false;

        // if our deploy is limited to a certain unit type only include areas with those
        if( args.unitTypes && !args.unitTypes.includes( unit.type ) ) return false;

        // can we pay for this unit?
        if( money < unit.cost && !(args.free || unit.redeployFree ) ) return false;

        // is kau blocking us from deploying a champion?
        if( unit.type === 'champion' && kauInArea ) return false;

        // if we made it this far, then yes! We can redeploy this unit
        return true;
    },


    /**
     * Resolve a deploy action
     *
     * @param player
     * @param response
     * @returns {Promise<{declined: boolean}|{cost: *, units: []}>}
     */
    async resolveDeploy( player, response ){
        // if we declined, then abort
        if( response.decline ) return { declined : true };

        let units = [];

        let output = {
            cost : response.cost,
            units : [],
        };

        // pay our costs
        this.payCost( response.cost );

        // handle each unit's deployment
        response.units.forEach( unitId => {
            this.resolveDeployUnit( unitId, units, output, response );
        });

        // make an array of unit names
        let unitNames = units.map( unit => unit.name );

        // ghost deploy
        if( response.ghosts && response.ghosts.length ){
            let ghostOutput = this.game().factions['ghosts'].deployGhosts( response.ghosts, response.toArea );
            ghostOutput.forEach( ghost => unitNames.push( 'ghost' ) );
            units = _.concat( units, ghostOutput );
        }

        // display our deployment results
        await this.displayDeployResults( units, output, unitNames, response  );

        // handle triggered events
        await this.unitTriggeredEvents( 'deploy', output.units )
            .catch( error => { console.error( error ) });

        // return our output
        return output;
    },


    /**
     * Resolve deploying a unit
     *
     * @param unitId
     * @param units
     * @param output
     * @param response
     */
    resolveDeployUnit( unitId, units, output, response ){
        // get our unit object
        let unit = this.game().objectMap[unitId];

        // do the appropriate bookkeeping
        units.push( unit );
        output.units.push({
            from : unit.location,
            unit : unit
        });

        // heal wounded units, ad unflip units coming in from the reserves
        if( unit.flipped && ( unit.toughness || !unit.location || unit.skeleton ) ){
            this.unflipUnit( unit );
        }

        console.log( 'delpoy response', response );
        if( !unit.flipped && response.transformUnit ) {
            this[response.transformUnit]( unit );
        }


        // ready units
        if( response.readyUnits ){
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
        unit.location = response.toArea;
    },


    /**
     * Output our log message and display the units shifted prompt for our deploy
     *
     * @param units
     * @param output
     * @param unitNames
     * @param response
     */
    async displayDeployResults( units, output, unitNames, response ){
        // prepare prompt and chat message
        let message = `Pay xC${output.cost}x to deploy <span class="faction-${this.name}">${ unitNames.join(', ') }</span> to the ${response.toArea}`;
        this.message( message );

        if( !response.hidePrompt ) {
            await this.game().timedPrompt('units-shifted', {
                message: `The ${this.name} deploy units to the ${response.toArea}`,
                units: units
            }).catch( error => console.error( error ) );
        }
    }


};

module.exports = obj;
