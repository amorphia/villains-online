let obj = {

    /**
     * Collect faction upgrades
     *
     * @returns {{upgrade: *, faction: *}|null}
     */
    async collectUpgrades( forcedPoints ){
        // get our highest point value
        const maxPoints = forcedPoints ?? Math.max( this.data.ap, this.data.pp );

        // check if we qualify for an upgrade
        let upgrade = this.checkIfWeQualifyForNewUpgrade( maxPoints );
        if( !upgrade ) return;

        // process our upgrade
        this.data.upgrade = upgrade;
        if(this.processUpgrade){
            await this.processUpgrade( upgrade );
        }

        return {
            faction : this.name,
            upgrade: upgrade
        };
    },


    /**
     * Check if we qualify for a new upgrade
     *
     * @param points
     * @returns {number}
     */
    checkIfWeQualifyForNewUpgrade( points ){
        let upgrade = 0;

        if( this.weQualifyForFirstUpgrade( points ) ) upgrade = 1;
        if( this.weQualifyForSecondUpgrade( points ) ) upgrade = 2;

        return upgrade;
    },


    /**
     * Do we qualify for our first upgrade?
     *
     * @param points
     * @returns {boolean}
     */
    weQualifyForFirstUpgrade( points ){
        return points >= this.game().data.upgradePoints[0] && this.data.upgrade < 1;
    },


    /**
     * Do we qualify for our second upgrade?
     *
     * @param points
     * @returns {boolean}
     */
    weQualifyForSecondUpgrade( points ){
        return points >= this.game().data.upgradePoints[1] && this.data.upgrade < 2;
    }

};

module.exports = obj;

