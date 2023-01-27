let obj = [
    {
        name: 'Triumph of the Tangle',
        num : 1,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [3] },
                    { test : 'useSkills', args : [3] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killUnits', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'A Blossoming Annihilation',
        num : 2,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'From Lords to Loam',
        num : 3,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [5] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killUnits', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [2] },
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'The Song of Re-Wilding',
        num : 5,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [7,1] },
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
        name: '6',
        num : 6,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [6] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Seeds of a New World',
        num : 8,
        faction : 'plants',
        objectives : [
            {
                requirements : [
                    { test : 'enemyUnitsInAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [3] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
