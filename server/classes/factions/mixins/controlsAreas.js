let obj = {

    /**
     * Handle gaining control of an area
     *
     * @param {Area} area
     */
    gainControlOfArea( area ){
        area.data.owner = this.name;
        area.takeControl( this );
    },


    /**
     * Handle losing control of an area
     *
     * @param {Area} area
     */
    loseControlOfArea( area ){
        area.data.owner = null;
        area.loseControl( this );
    },


    /**
     * Handle capturing an enemy marker
     *
     * @param area
     * @returns {object}
     */
    captureEnemyMarker( area ){
        // push this area name to our list of areas captured this turn
        this.data.areasCapturedThisTurn.push( area.name );

        if( this.shouldScoreCapturedReward( area ) ){
            this.data.captured.current++;
            return this.applyCapturedRewards();
        }
    },


    /**
     * Should we score a captured reward for taking this area?
     *
     * @param area
     * @returns {boolean}
     */
    shouldScoreCapturedReward( area ){
        return area.data.owner // was this area previously owned
                && area.data.owner !== this.name // by someone other than us?
                && this.data.captured.current < this.data.captured.max; // and do we still have rewards to claim?
    },


    /**
     * Gain the appropriate rewards for capturing an area
     *
     * @returns {object}
     */
    applyCapturedRewards(){
        // get our rewards object
        let rewards = this.capturedRewards[ this.data.captured.current - 1 ];

        // cycle through each prop of our rewards and apply the bonuses
        _.forEach( rewards, (value, prop ) => this.applyCapturedReward( prop, value ) );

        return rewards;
    },


    /**
     * Gain one of the rewards for capturing an area
     *
     * @param prop
     * @param value
     */
    applyCapturedReward( prop, value ){
        // if our reward is Area Points, gain them and return
        if( prop === 'ap' ) return this.gainAP( value );

        // if our reward is Plan Points, gain them and return
        if( prop === 'pp' ) return this.gainPP( value );

        // otherwise use the prop name to increase the matching property on our data object
        this.data[prop] += value;
    }

};

module.exports = obj;

