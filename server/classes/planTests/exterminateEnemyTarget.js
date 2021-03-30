const test = function exterminateEnemyTarget( debug, faction ){
    let result;

    for( let item of Object.values( faction.game().factions ) ){
        if( faction.hasExterminatedArea( item.targetArea() ) ) result = true;
    }

    if( debug ) console.log(
        'exterminateEnemyTarget',
        'result:', result
    );

    return result;
};

module.exports = test;
