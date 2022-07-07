/**
 * Has the given faction activated x or more skills this turn?
 *
 * @param debug
 * @param faction
 * @param skillsUsed
 * @returns {boolean}
 */
const test = function useSkills( debug, faction, skillsUsed ){
    let factionSkillsUsed = faction.data.usedSkills.length;
    let result = factionSkillsUsed >= skillsUsed;

    if( debug ) console.log(
        'useSkills ---',
        'skillsUsed req:', skillsUsed,
        'factionSkillsUsed:', factionSkillsUsed,
        'result:', result
    );

    return  result;
};

module.exports = test;
