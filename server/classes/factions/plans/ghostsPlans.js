let obj = [
    {
        name: '1',
        num : 1,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'controlTarget', args : [] },
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
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1, 'target'] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'controlAnyTarget', args : [2] },
                    { test : 'enemyMarkers', args : [2] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlAnyTarget', args : [1] },
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
        name: '5',
        num : 5,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'controlAnyTarget', args : [1] },
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 2
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
        name: '6',
        num : 6,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'controlAnyTarget', args : [1] },
                    { test : 'killUnits', args : [4] },
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
        name: '7',
        num : 7,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
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
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1, 'target'] },
                ],
                value : 2
            },
        ]
    },

];


module.exports = obj;
