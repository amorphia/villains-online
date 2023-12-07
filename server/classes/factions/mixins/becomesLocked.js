let obj = {

  async lockedAction(){
      this.message( `are locked` );

      if(this.game().data?.options?.lootWhenLocked){
          await this.lootOnLocked();
      }
  },

  async lootOnLocked(){
      // draw a card
      this.drawCards( 1, true );

      // discard card
      const response = await this.prompt('discard-card', {
          message: 'choose a card to discard',
          count : 1
      });

      this.discardCards( response.cards, { bottomOfDeck: true } );
  },

};

module.exports = obj;
