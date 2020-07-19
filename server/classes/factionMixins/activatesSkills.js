let obj = {

    async useSkill( area ) {
        if( typeof area === 'string' ) area = this.game().areas[area];

        if( _.hasUsedSkill( this, area ) ){
            this.game().message({ message: `has already used <span class="highlight">the ${area.name}'s</span> skill ability`, faction : this });
            return;
        }

        this.game().message({ message: `activate the skill ability of <span class="highlight">the ${area.name}</span>`, faction : this });

        let triggered = [];
        this.data.usedSkills.push( area.name );

        this.data.units.forEach( unit => {
            if( _.unitReadyInArea( unit, area ) ){
                triggered.push({ unit : unit });
                unit.ready = false;
            }
        });

        await area.skill( this );

        await this.triggeredEvents( 'skill', triggered );

    },

};

module.exports = obj;

