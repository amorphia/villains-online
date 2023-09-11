let obj = {

    /**
     * Handle our faction cleanup at the end of each turn
     */
    async cleanUp(){

        // reset dead units
        this.cleanUpWebbed();

        // reset our tokens
        this.resetTokens();

        // remove active cards
        this.removeActiveCards();

        // discard our target
        this.discardTarget();

        // reset used skills
        this.data.usedSkills = [];

        // reset token limit
        this.data.tokenLimitRemaining = this.data.tokenLimit + this.game().data.turn;

        // reset token spy
        this.data.tokenSpy = [];

        // faction specific end of turn shizz
        try {
            if( this.triggers.onCleanUp ){
                console.log('cleanup event triggered', this.triggers.onCleanUp );
                await this[ this.triggers.onCleanUp ]();
            }
        } catch( error ){
            console.error( error );
        }

        // reset dead units
        this.cleanUpKilled();

        // clear captured this turn
        this.data.areasCapturedThisTurn = [];
    },


    /**
     * Reset our action tokens
     */
    resetTokens(){
        // reset tokens
        this.data.tokens.forEach( token => {
            if( token.location !== 'xavier' ) token.location = null;
            token.revealed = false;
        });
    },


    /**
     * Remove our active action cards
     */
    removeActiveCards(){
        let collectCards = null;

        // does a faction steal discarded cards in an area?
        _.forEach(this.game().areas, area => {
            let token = area.data.tokens.find( token => token.collectDiscardedCards && token.revealed );
            if(token && token.faction !== this.name){
                collectCards = {
                    faction: this.game().factions[token.faction],
                    area: area.name,
                };
            }
        });

        // remove active cards
        this.data.cards.active.forEach( card => {
            let cardClass = this.game().cards[card.class];
            new cardClass().clear( this );

            if(collectCards && card.playedIn === collectCards.area){
                collectCards.faction.message(`Scrounges a ${card.name} card from the trash`);
                collectCards.faction.data.cards.hand.push(card);
            } else {
                this.game().deck.discard.push( card );
            }

            this.game().deck.discard.push( card )

            card.owner = null;
            card.playedIn = null;
        });

        this.data.cards.active = [];
    },


    /**
     *  discard our target
     */
    discardTarget(){
        // discard target
        _.moveItemById(
            this.data.cards.target[0].id,
            this.data.cards.target,
            this.game().deck.discard
        );
    },


    /**
     * clean up our killed units
     */
    cleanUpKilled(){
        this.data.units.forEach( unit => {
            if( unit.killed ) this.returnUnitToReserves( unit );
        });
    },


    /**
     * clean up our webbed units
     */
    cleanUpWebbed(){
        this.data.units.forEach( unit => {
            if( unit.webbed ) delete unit.webbed;
        });
    }

};

module.exports = obj;

