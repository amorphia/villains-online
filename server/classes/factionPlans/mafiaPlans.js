let obj = [
    {
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
                    { test : 'exterminateEnemyTarget', args : [] },
                ],
                value : 2
            },
        ]
    },

    {
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
                    { test : 'unitsAtEnemyTargets', args : [ 2, 'mole' ] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 4,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'unitsAtEnemyTargets', args : [ 4 ] },
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
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
        ]
    },

    {
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
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
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
        num : 6,
        faction : 'mafia',
        objectives : [
            {
                requirements : [
                    { test : 'unitsAtEnemyTargets', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
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
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 1
            },
        ]
    },

    {
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
