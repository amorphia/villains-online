let obj = {
    async startEndOfTurnStep(){

        this.data.phase = "determine-control";
        await this.determineControlStep();

        this.collectResourcesStep();

        this.data.phase = "score-targets";
        await this.scoreTargetsStep();

        this.data.phase = "score-plans";
        await this.scorePlansStep();


        if( this.checkForVictory() ){
            this.concludeGame();
            return;
        }


        this.data.phase = "collect-upgrades";
        await this.collectUpgrades();


        this.data.phase = "cleanup-step";
        await this.cleanUpStep();


        this.readySkilledUnits();


        this.startNextTurn();
    },


    readySkilledUnits(){
        this.message({ message : 'Skilled units have become readied', class : 'highlight' });
        _.forEach( this.factions, faction => faction.readySkilledUnits() );
    },


    async cleanUpStep(){
        _.forEach( this.areas, area => area.cleanUp() );

        for( let faction of Object.values( this.factions ) ){
            await faction.cleanUp();
        }
    },


    startNextTurn(){
        this.data.playerOrder.push( this.data.playerOrder.shift() );
        this.data.turn++;
        this.startTurn();
    },


    async collectUpgrades(){
        let slideSpeed = 4;
        if( this.fastMode ) slideSpeed = 1;

        let upgrades = Object.values( this.factions ).map( faction => faction.collectUpgrades() )
                                                     .filter( item => item );

        if( upgrades.length ){
            await this.timedPrompt( 'score-upgrades', { wait : slideSpeed * upgrades.length, slideSpeed : slideSpeed, upgrades : upgrades });
        }
    },

    concludeGame(){
        let scores = this.calculateFinalScores();
        _.forEach( this.players, player => player.setPrompt({
                name : 'final-scores',
                data : scores,
                active : false,
                passive : true
            }));
        this.updateAll();
        Server.saveToDB( this );
    },

    calculateFinalScores(){
        let scores = Object.values( this.factions ).map( faction => {
            return {
                faction : faction.name,
                ap : faction.data.ap,
                pp : faction.data.pp,
                total : faction.data.ap + faction.data.pp,
                hasVictory : faction.hasVictory(),
                capitolToken : faction.lastCapitolToken()
            }
        });

        scores.sort( (a,b) => {
            // sort those who have scored a victory condition first
            if( a.hasVictory && !b.hasVictory ) return -1;
            if( !a.hasVictory && b.hasVictory ) return 1;

            if( a.total > b.total ) return -1;
            if( b.total > a.total ) return 1;

            return a.capitolToken > b.capitolToken ? -1 : 1;
        });

        return scores;
    },


    checkForVictory(){
        if( this.data.turn === 4 ) return true;

        return Object.values( this.factions ).reduce( (acc, faction) => {
            if( faction.hasVictory() ) acc = true;
            return acc;
        }, false );
    },


    async scorePlansStep(){
        let promises = [];
        let results = [];
        let slideSpeed = 5;
        if( this.fastMode ) slideSpeed = 1;

        _.forEach( this.factions, faction => {
                let plans = faction.testPlans();

                promises.push( this.promise({ players: faction.playerId, name: 'score-plans', data : { plans : plans  } }).then( ([player, data]) => {
                    results.push( data );
                    this.message({ faction: faction, message: 'have scored their plans' });
                    player.setPrompt({ active : false, playerUpdate : true });
                }));
        });

        await Promise.all( promises );
        this.processPlanResults( results );

        await this.timedPrompt( 'plan-results', { wait : slideSpeed * results.length, slideSpeed : slideSpeed, results : results });

    },

    processPlanResults( results ){

        results.forEach( result => {
            let faction = this.factions[result.faction];
            result.plans.forEach( plan => {
                if( plan.selected ){
                    faction.gainPP( plan.points );
                    _.moveItemById( plan.plan.id , faction.data.plans.current, faction.data.plans.completed );
                }
            });

            if( result.discard ){
                result.discard.forEach( card => faction.discardCard( card ) );
            }

        });
    },

    async scoreTargetsStep(){

        let targets = [];
        let slideSpeed = 3;
        if( this.fastMode ) slideSpeed = 1;

        _.forEach( this.factions, faction => {
            let card = faction.data.cards.target[0];

            let target = {
                file : card.file,
                area : card.target,
                placer : faction.name,
                owner : this.areas[card.target].data.owner,
                flipped : false
            };

            if( target.owner && this.factions[target.owner] ){
                this.factions[target.owner].gainAP( 1 );
            }

            targets.push( target );
        });

        await this.timedPrompt( 'score-targets', { wait : slideSpeed * (targets.length + 1), slideSpeed : slideSpeed, targets : targets });

    },

    collectResourcesStep(){
        _.forEach( this.factions, faction => faction.collectResources() );
    },

    async determineControlStep(){

        let slideSpeed = 4;
        if( this.fastMode ) slideSpeed = 1;

        await this.timedPrompt( 'title-card',{ wait: this.titleCardTimer, message : 'Determine Control Step' } );

        let areaData = [];

        for( let i = 0; i < this.data.areaOrder.length; i++ ) {
            let area = this.areas[ this.data.areaOrder[i] ];
            areaData.push( area.determineControl() );
        }

        await this.timedPrompt( 'determine-control', { wait : slideSpeed * 9, slideSpeed : slideSpeed, areas : areaData });

    }
};

module.exports = obj;

