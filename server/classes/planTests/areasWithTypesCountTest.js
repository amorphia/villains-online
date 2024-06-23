/**
 * Does this faction of x units of a given type in y areas?
 */
const test = function areasWithTypesCount( debug, faction, areaCount, unitCount, unitType ){

    let unitsOfTheTypeInAreas = {};

    faction.data.units.forEach(unit => {
       if(_.unitInPlay(unit, { type: unitType })){
           unitsOfTheTypeInAreas[unit.location] = unitsOfTheTypeInAreas[unit.location] ? ++unitsOfTheTypeInAreas[unit.location] : 1;
       }
    });

    let countOfAreasWithMinUnits = 0;

    Object.values(unitsOfTheTypeInAreas).forEach(count => {
       if(count >= unitCount) countOfAreasWithMinUnits++;
    });

    let result = countOfAreasWithMinUnits >= areaCount;

    console.log (
        'areasWithTypesCount ---',
        'areaCount req:', unitType,
        'unitCount req:', unitCount,
        'unitTypeReq:', unitType,
        'countOfAreasWithMinUnits', countOfAreasWithMinUnits,
        'unitsOfTheTypeInAreas', unitsOfTheTypeInAreas,
        'result:', result
    );

    return result;
};

module.exports = test;
