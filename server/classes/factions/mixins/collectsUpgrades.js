let obj = {

    /**
     * Collect faction upgrades
     *
     * @returns {{upgrade: *, faction: *}|null}
     */
    collectUpgrades(){
        // get our highest point value
        const maxPoints = Math.max( this.data.ap, this.data.pp );

        // check if we qualify for an upgrade
        let upgrade = this.checkIfWeQualifyForNewUpgrade( maxPoints );
        if( !upgrade ) return;

        // process our upgrade
        this.data.upgrade = upgrade;
        this.processUpgrade( upgrade );
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
        if( this.weQualifyForFirstUpgrade( points ) ) {
            return 1;
        }

        if( this.weQualifyForSecondUpgrade( points ) ){
            return 2;
        }

        return 0;
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

