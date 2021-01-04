let obj = [
    {
        name: '1',
        num : 1,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasMostTokens', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostTokens', args : [2] },
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostTokens', args : [3] },
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
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasMostTokens', args : [3] },
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
        name: '5',
        num : 5,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasMostTokens', args : [3] },
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
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostTokens', args : [4] },
                    { test : 'enemyMarkers', args : [2] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostTokens', args : [2] },
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killUnits', args : [5] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostTokens', args : [2] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
        ]
    },
];


module.exports = obj;
