let obj = {

    async startTakeActionsStep(){
        this.data.phase = "take-actions";
        await this.timedPrompt( 'title-card', { wait: this.titleCardTimer, message : 'Take Actions Step' } )
            .catch( error => console.error( error ) );
        this.defaultListener = 'choose-action';

        this.setActivePlayerByPlayerOrder();
        this.setActivePlayerListener();
        this.allPlayers({ passed : false } );
        Server.saveToDB( this );
        await this.updateAll();
    },


    chooseAction( player, action, ...args ) {
        let method = _.camelCase(`take-${action}-action`);
        console.log( method );
        this[method](player, ...args);
    },

    activateDecline( player, action, tokenId, wildType = null ){
        let token = this.objectMap[tokenId];

        if( action === 'decline' ){
            this.declineToken( player, token );
        } else {
            player.faction().activateToken( player, token, wildType );
        }
    },

    declineToken( player, token, refund ){
        if( typeof player === 'string' ){
            player = this.getPlayerById( player );
        }

        let message;
        let area = this.areas[ token.location ];
        let faction = player.faction();

        /*
        if( faction.data.tokensNotDiscardedMax && faction.data.tokensNotDiscarded < faction.data.tokensNotDiscardedMax ){
            message = `Doesn't activate their <span class="uppercase highlight">${token.name}</span> token, but it stays in place`;
            faction.data.tokensNotDiscarded++;
        } else {
            message = `Pull their <span class="uppercase highlight">${token.name}</span> token`;
            _.discardToken( token, area );
        }
        */

        message = `Pull their <span class="uppercase highlight">${token.name}</span> token`;
        _.discardToken( token, area );

        if( refund ){
            this.checkForTokenRefund( token, area );
        }

        this.message({ message: message, faction : faction });
        this.advancePlayer();
    },

    checkForTokenRefund( token, area ) {
        let faction = this.factions[token.faction];
        let refund = faction.tokenCost( token, area );
        if( refund ){
            faction.data.energy += refund;
        }
    },

    takePassAction( player ){
        player.data.passed = true;
        this.message({ message: `Have passed`, faction : player.faction() });
        this.data.playerAction++;
        if( this.allPlayersHavePassed() ){
            this.startCombatStep();
        } else {
            this.advancePlayer();
        }
    },

    takeLockedAction( player ){
        this.message({ message: `are locked`, faction : player.faction() });
        this.data.playerAction++;
        this.advancePlayer();
    },

    takeSkipAction( player ){
        let faction = player.faction();
        faction.data.skips.used++;

        let remainingSkips = faction.data.skips.max - faction.data.skips.used;
        this.message({ message: `skip their turn <span class="highlight">(${remainingSkips} skips remaining)</span>`, faction : faction });

        this.data.playerAction++;
        this.advancePlayer();
    },

    async takeMagickAction( player, areaName ){
        let faction = player.faction();
        let area = this.areas[areaName];

        if( this.data.gameAction !== faction.data.lastMagickGameAction ){
            try {
                await faction.magickAction( area );
            } catch( error ){
                console.error( error );
            }
        } else {
            this.message({ message: 'Too soon to magick again', class: 'warning' });
        }
        this.advancePlayer( {}, false );
    },


    async takeMaterializeAction( player, areaName ){
        let faction = player.faction();
        let area = this.areas[areaName];

        if( this.data.gameAction !== faction.data.lastMaterializeGameAction ){
            try {
                await faction.materializeAction( area );
            } catch( error ){
                console.error( error );
            }
        } else {
            this.message({ message: 'Too soon to materialize again', class: 'warning' });
        }

        this.advancePlayer( {}, false  );
    },


    async takeAmbushAction( player, areaName ){
        let faction = player.faction();
        let area = this.areas[areaName];

        try {
            await faction.ambushAction( area );
        } catch( error ){
            console.error( error );
        }

        this.advancePlayer();
    },

    async takeLoopAction( player, areaName ){
        let faction = player.faction();
        let area = this.areas[areaName];

        try {
            await faction.loopAction( area );
        } catch( error ){
            console.error( error );
        }

        this.advancePlayer();
    },

    async takeSkillAction( player, areaName ){
        let area = this.areas[areaName];
        let faction = player.faction();

        try {
            await faction.useSkill( area );
        } catch( error ){
            console.error( error );
        }

        this.advancePlayer();
    },

    takeXavierAction( player ){
        player.faction().revealXavierToken( player );
    },

    async takeTokenAction( player, tokenId, wildType = null ){
        let token = this.objectMap[tokenId];
        let area = this.areas[token.location];

        let faction = player.faction();
        try {
            await faction.revealToken( player, token, area, wildType );
        } catch( error ){
            console.error( error );
        }
    },

    resetResolving(){
       _.forEach( this.data.resolving, (val, prop, obj ) => obj[prop] = null );
    },


};

module.exports = obj;
