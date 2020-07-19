let obj = [
    {
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
        num : 2,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [10] },
                ],
                value : 1
            },
        ]
    },
    {
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
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 1
            },
        ]
    },
    {
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
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
