let obj = [
    {
        name: 'The Endless Spills',
        num : 1,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [13] },
                ],
                value : 3
            },
        ]
    },
    {
        name: 'Found a Sludge Nest',
        num : 2,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [10] },
                ],
                value : 2
            },
        ]
    },
    {
        name: 'Rise of the Deformed',
        num : 3,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Poison the Shadows',
        num : 4,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [9] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Pollute the Overworld',
        num : 5,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [11] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'useSkills', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Spread the Foul Truths',
        num : 6,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Taint the Beautiful',
        num : 7,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [9] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Release the Forever Smog',
        num : 8,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [9] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
