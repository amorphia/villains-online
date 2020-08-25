

class FinalObjective {
    // abstract
    handle(){}

    score( faction, points ){
        if( !points ) return;

        faction.gainAP( points );
        return points;
    }
}

class Target extends FinalObjective {
    async handle( faction ) {
        let points =  faction.data.objective.tests.targetsScored;
        return this.score( faction, points );
    }
}

class Conquer extends FinalObjective {
    async handle( faction ) {
        let points =  faction.data.objective.tests.capturedAreas;
        return this.score( faction, points );
    }
}

class Exterminate extends FinalObjective {
    async handle( faction ) {
        let points =  faction.areasExterminated().length;
        return this.score( faction, points );
    }
}

class Expand extends FinalObjective {
    async handle( faction ) {
        let points =  0;
        let areasCount = faction.areas().length;

        if( areasCount === 3 ) points = 1;
        else if( areasCount >= 4 ) points = 2;

        return this.score( faction, points );
    }
}

class Dominate extends FinalObjective {
    async handle( faction ) {
        let points =  faction.areasWithMinInfluence( 8 );
        return this.score( faction, points );
    }
}

module.exports = {
    'Target' : Target,
    'Conquer': Conquer,
    'Exterminate': Exterminate,
    'Expand': Expand,
    'Dominate': Dominate,
};



