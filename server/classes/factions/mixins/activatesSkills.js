let obj = {

    async useSkill( area ) {
        if( typeof area === 'string' ) area = this.game().areas[area];

        if( _.hasUsedSkill( this, area ) ){
            this.game().message({ message: `has already used the ${area.name}'s skill ability`, faction : this });
            return;
        }

        this.game().message({ message: `activate the skill ability of the ${area.name}`, faction : this });

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
            await this.onAfterSkill( this, area, triggered );

            for( let faction of Object.values( this.game().factions ) ){
                if( faction.name === this.name ) continue;
                await faction.onAfterSkill( this, area, triggered );
            }
        } catch ( error ) {
            console.error( error );
        }

    },

};

module.exports = obj;

