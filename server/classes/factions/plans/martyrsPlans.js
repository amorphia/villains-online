let obj = [
    {
        name: '1',
        num : 1,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
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
        name: '2',
        num : 2,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
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
    {
        name: '3',
        num : 3,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
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
        name: '4',
        num : 4,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [4] },
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
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [8] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '6',
        num : 6,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [6] },
                ],
                value : 2
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
        name: '7',
        num : 7,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [6] },
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
                    { test : 'influenceInAreas', args : [7,1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'martyrs',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [5] },
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
