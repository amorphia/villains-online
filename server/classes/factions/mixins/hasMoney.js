let obj = {

    /**
     * Reset our energy
     */
    resetEnergy(){
        this.data.energy = this.data.maxEnergy;

        if(this.game().data.options?.tokenLayaway  && this.data.tokenCost !== 0){
            this.data.energy -= this.game().data.tokenLayawayEnergyReduction;
        }
    },


    /**
     * Collect the resources we are entitled to during the collect resources step
     */
    collectResources(){
        this.gainResources( this.resourcesToCollect() );
    },


    /**
     * Gain resources
     *
     * @param number
     */
    gainResources( number ){
        this.game().sound( 'coin', { player: this.playerId} );

        //  gain our resources
        this.data.resources += number;

        // generate our message
        let message = '';
        for( let i = 0; i < number; i++ ){ message += 'xRx' }
        this.message( 'Gain ' + message );
    },


    /**
     * Pay a cost
     *
     * @param number
     * @param announce
     * @param type
     */
    payCost( number, announce = false, type = null ){
        if( !number ) return;

        if( announce ) this.message( `Pay xC${number}x` );

        // if we can pay the whole cost with energy, do so and return
        if( this.data.energy >= number ){
            this.data.energy -= number;
            return;
        }

        // otherwise pay as much as we can with energy, then pay the rest in resources
        number -= this.data.energy;
        this.data.energy = 0;
        this.data.resources -= number;
        if( this.data.resources < 0 ) this.data.resources = 0;
    }

};

module.exports = obj;

