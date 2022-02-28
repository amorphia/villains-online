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

        // reset token spy
        this.data.tokenSpy = [];

        console.log('checking for onCleanup Events' );

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
        // remove active cards
        this.data.cards.active.forEach( card => {
            let cardClass = this.game().cards[card.class];
            new cardClass().clear( this );
            card.owner = null;
            card.playedIn = null;
        });

        let cards = this.data.cards.active.splice( 0 );
        cards.forEach( card => this.game().deck.discard.push( card ) );
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

