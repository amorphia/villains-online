let obj = {

    /**
     * Begin the end of turn step
     */
    async resolveEndOfTurnStep(){

        // determine control step
        this.data.phase = "determine-control";
        await this.determineControlStep();

        // collect resources step
        this.collectResourcesStep();

        // score targets step
        this.data.phase = "score-targets";
        await this.scoreTargetsStep();

        // score plans step
        this.data.phase = "score-plans";
        try {
            await this.scorePlansStep();
        } catch( error ){
            console.error( error );
        }

        // check for victory
        if( this.checkForVictory() ){
            this.scoreGame();
            return;
        }

        //collect upgrades
        this.data.phase = "collect-upgrades";
        await this.collectUpgrades();

        // cleanup
        this.data.phase = "cleanup-step";
        try {
            await this.cleanUpStep();
        } catch( error ){
            console.error( error );
        }

        // ready skilled units
        this.readySkilledUnits();

        // start the nect turn
        this.startNextTurn();
    },


    /**
     * Resolve determine control step
     */
    async determineControlStep(){

        let slideSpeed = 4;
        if( this.fastMode ) slideSpeed = .5;

        // show title card
        await this.timedPrompt( 'title-card',{ wait: this.titleCardTimer, message : 'Determine Control Step' } )
            .catch( error => console.error( error ) );

        let areaData = [];

        for(let faction of Object.values(this.factions)){
            faction.data.retainedAreas = [];
        }

        // for each area, determine the current controller
        for( let i = 0; i < this.data.areaOrder.length; i++ ) {
            let area = this.areas[ this.data.areaOrder[i] ];
            areaData.push( await area.determineControl() );
        }

        // display the results to all players
        await this.timedPrompt( 'determine-control', { wait : slideSpeed * 9, slideSpeed : slideSpeed, areas : areaData })
            .catch( error => console.error( error ) );
    },


    /**
     * Resolve collect resources step
     */
    collectResourcesStep(){
        _.forEach( this.factions, faction => faction.collectResources() );
    },


    /**
     * Resolve the score targets step
     */
    async scoreTargetsStep(){

        let targets = [];
        let slideSpeed = 3;
        if( this.fastMode ) slideSpeed = .5;

        // check if Ol' Zeke is stealing targets again
        let stealsTarget = null;
        _.forEach( this.factions, faction => {
            let zeke = faction.data.zeke;
            if(zeke && _.unitInPlay(zeke)){
                stealsTarget = {
                    faction,
                    area: zeke.location,
                }
            }
        });

        // score each target and record the results
        _.forEach( this.factions, faction => {
            targets.push( this.scoreTarget( faction, stealsTarget ) );
        });

        // display the results to each player
        await this.timedPrompt( 'score-targets', { wait : slideSpeed * (targets.length + 1), slideSpeed : slideSpeed, targets : targets })
            .catch( error => console.error( error ) );
    },


    /**
     * Score a faction's target
     *
     * @param faction
     * @param stealsTarget
     * @returns {object}
     */
    scoreTarget( faction, stealsTarget ){
        let card = faction.data.cards.target[0];
        let area = card.target;

        let owner = this.areas[card.target].data.owner;

        let targetStolen = null;

        if((area === stealsTarget?.area) && (owner !== stealsTarget?.faction.name)){
            targetStolen = stealsTarget?.faction.name;
            stealsTarget?.faction.gainAP( 1 );
            this.message({ faction: stealsTarget?.faction, message: "Ol' Zeke finds some valuables in the " + area });
        }

        let target = {
            file : card.file,
            area : area,
            placer : faction.name,
            owner : owner,
            flipped : false,
            stolen : targetStolen,
        };

        // if this area is controlled (by a non-neutral faction) award our AP
        if( target.owner && this.factions[target.owner] ){
            let points = this.data.turn === 4 && this.doubleTargetsFourthTurn ? 2 : 1;
            this.factions[target.owner].gainAP( points );
            this.message({ faction: this.factions[target.owner], message: "Scores the target in the " + area });
        }

        return target;
    },


    /**
     * Resolve the score plans step
     */
    async scorePlansStep(){

        let promises = [];
        let results = [];
        let slideSpeed = 5;
        if( this.fastMode ) slideSpeed = .5;

        try {
            _.forEach( this.factions, faction => {
                // test this faction's plans
                let plans = faction.testPlans();

                // then show them the results of their plans and allow them to score
                // any that they qualify for
                promises.push( this.promise({

                        players: faction.playerId,
                        name: 'score-plans',
                        data : { plans : plans  }

                    }).then( ([player, data]) => {

                        // save the plans this faction has chosen to score
                        results.push( data );
                        this.message({ faction: faction, message: 'have scored their plans' });
                        player.setPrompt({ active : false, updatePlayerData : true });

                    })
                );
            });

            // wait for everyone to score their plans, then process the results
            await Promise.all( promises );
            this.processPlanResults( results );

            // finally show all players the results of the score plans step
            await this.timedPrompt( 'plan-results', {
                wait : slideSpeed * results.length,
                slideSpeed : slideSpeed,
                results : results
            });

        } catch( error ){
            console.error( error );
        }
    },


    /**
     * Score any appropriate plans scored by each player
     *
     * @param results
     */
    processPlanResults( results ){
        // cycle through our plans results
        results.forEach( result => {
            let faction = this.factions[result.faction];
            // score each plan
            result.plans.forEach( plan => faction.scorePlan( plan ) );
        });
    },


    /**
     * Checks for game victory
     *
     * @returns {boolean}
     */
    checkForVictory(){
        // if its turn 4, then we have to declare a winner
        if( this.data.turn === 4 ) return true;

        // otherwise we only got to final scoring if at least one player has achieved victory
        return Object.values( this.factions ).some( faction => faction.hasVictory() );
    },


    /**
     * Display the final game results and record the scores in our external tracker, if applicable
     *
     * @param isIncomplete
     */
    scoreGame( isIncomplete = false ){

        // get our formatted final scores
        let scores = this.calculateFinalScores();

        // show each player the final score display
        _.forEach( this.players, player => player.setPrompt({
            name : 'final-scores',
            data : {
                scores : scores,
                rolls : this.data.rolls
            },
            active : false,
            passive : true
        }));

        this.pushGameDataToPlayers();

        // if we have 4+ players, record the score in our external tracker
        if( Object.keys( this.factions ).length >= 4 ){
            Server.saveToTracker( this, scores, isIncomplete );
        }
    },


    /**
     * Calculate and format our final scores
     *
     * @returns {array}
     */
    calculateFinalScores(){

        // create final score data object for each player
        let scores = Object.values( this.factions ).map( faction => {
            return {
                faction : faction.name,
                player : faction.playerName(),
                ap : faction.data.ap,
                pp : faction.data.pp,
                total : faction.data.ap + faction.data.pp,
                hasVictory : faction.hasVictory(),
                capitolToken : faction.lastCapitolToken(),
                rolls: faction.data.rolls,
                hits: faction.data.hits,
            }
        });

        // sort the scores by best to worst
        scores.sort( (a,b) => {
            // sort those who have scored a victory condition first
            if( a.hasVictory && !b.hasVictory ) return -1;
            if( !a.hasVictory && b.hasVictory ) return 1;

            // then by total points
            if( a.total > b.total ) return -1;
            if( b.total > a.total ) return 1;

            // finally by most recent capitol token
            return a.capitolToken > b.capitolToken ? -1 : 1;
        });

        return scores;
    },


    /**
     * Upgrade each faction that has scored enough points,
     * then display all the newly acquired upgrades to each player
     */
    async collectUpgrades(){
        let promises = [];

        // have each faction collect their upgrades, then create an array
        // of the newly acquired upgrades
        let upgrades = Object.values( this.factions )
            .map( faction => faction.collectUpgrades() )
            .filter( item => item );

        // if no upgrades were scored, then we are done here
        if( !upgrades.length ) return;


        // show each player the score upgrades results
        _.forEach(this.factions, faction => {
            promises.push( this.promise({

                    players: faction.playerId,
                    name: 'score-upgrades',
                    data: { upgrades: upgrades }

                }).then(([player, data]) => {
                    player.setPrompt({ active: false, updatePlayerData: true });
                })
            );
        });

        // and wait for them to respond that they are done reading them
        await Promise.all(promises);

    },


    /**
     * Set all skilled units to ready
     */
    readySkilledUnits(){
        this.message({ message : 'Skilled units have become readied', class : 'highlight' });
        _.forEach( this.factions, faction => faction.readySkilledUnits() );
    },


    /**
     * Manage cleanup step
     */
    async cleanUpStep(){
        try {
            for( let faction of Object.values( this.factions ) ){
                await faction.cleanUp();
            }
        } catch( error ){
            console.error( error );
        }

        _.forEach( this.areas, area => area.cleanUp() );
    },


    /**
     * Move on to the next turn
     */
    startNextTurn(){
        // move the first player in player order to the end of the player order array
        this.data.playerOrder.push( this.data.playerOrder.shift() );

        // increment turn counter
        this.data.turn++;

        // begin the net turn
        this.resolveStartOfTurnStep();
    },

};


module.exports = obj;

