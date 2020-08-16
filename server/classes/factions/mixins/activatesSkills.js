let obj = {

    async useSkill( area ) {
        if( typeof area === 'string' ) area = this.game().areas[area];

        if( _.hasUsedSkill( this, area ) ){
            this.game().message({ message: `has already used the ${area.name}'s skill ability`, faction : this });
            return;
        }

        this.game().message({ message: `activate the skill ability of the ${area.name}`, faction : this });

        let modifySkill = await this.onBeforeSkill( area );

        console.log( 'modifySkill', modifySkill );

        let triggered = [];
        this.data.usedSkills.push( area.name );

        this.data.units.forEach( unit => {
            if( _.unitReadyInArea( unit, area ) ){
                triggered.push({ unit : unit });
                unit.ready = false;
            }
        });

        this.game().popup( this.playerId, { skill : true, area : area.name, faction : this.name });

        try {
            await area.skill( this );
            await this.triggeredEvents( 'skill', triggered );
            await this.onAfterSkill( area, triggered );

            if( modifySkill && modifySkill.doubleResolve ) await area.skill( this );
        } catch ( error ) {
            console.error( error );
        }

    },

};

module.exports = obj;

