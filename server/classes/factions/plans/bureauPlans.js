let obj = [
    {
        name: 'FATE REVERSAL PROTOCOLS',
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
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'TRUNCATE THE SPLINTERED LINES',
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
        name: 'THE PERFECT MOMENT FOREVER',
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
        name: 'LEGIONS OF THE FUTURE’S PAST',
        num : 4,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [9] },
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
        name: 'INFINITE REGRESSIONS',
        num : 5,
        faction : 'bureau',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [4] },
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
        name: 'FORGE THE GOLDEN TIMELINE',
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
        name: 'STOP THE CASCADE DISRUPTIONS',
        num : 7,
        faction : 'bureau',


        objectives : [
            {
                requirements : [
                    { test : 'areasMostTokens', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [8,1] },
                ],
                value : 1
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
