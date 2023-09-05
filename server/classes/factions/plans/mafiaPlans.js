let obj = [
    {
        name: "An Offer You Can't Refuse",
        num : 1,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [2] },
                ],
                value : 3
            },
        ]
    },
    {
        name: 'Set Up an Executive Game',
        num : 2,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [1] },
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
        name: 'Blackmail Some Dirty Cops',
        num : 3,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [4] },
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
                    { test : 'controlEnemyTargets', args : [1] },
                ],
                value : 1
            },
        ]
    },

    {
        name: 'Collect Ghost Payrolls',
        num : 4,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [1] },
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
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
        ]
    },

    {
        name: 'Aggressive Loansharking',
        num : 5,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [1] },
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
        name: 'Senatorial Extortion',
        num : 6,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [1] },
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
                    { test : 'useSkills', args : [4] },
                ],
                value : 1
            },
        ]
    },

    {
        name: 'Expand Our Numbers Racket',
        num : 7,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [1] },
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
        name: 'Time to Come Heavy',
        num : 8,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlEnemyTargets', args : [1] },
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

];


module.exports = obj;
