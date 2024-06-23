let obj = [
    {
        name: '1',
        num : 1,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [4] },
                    { test : 'useSkills', args : [2] },
                ],
                value : 2
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
        name: '2',
        num : 2,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [3] },
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
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [4] },
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
        name: '4',
        num : 4,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [3] },
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
        name: '5',
        num : 5,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [6] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '6',
        num : 6,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [3] },
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 2
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
        name: '7',
        num : 7,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [4] },
                ],
                value : 1
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
        name: '8',
        num : 8,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killCondemnedUnits', args : [3] },
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
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
