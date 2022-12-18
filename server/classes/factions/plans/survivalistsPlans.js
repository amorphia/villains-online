let obj = [
    {
        name: '1',
        num : 1,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [3] },
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
    {
        name: '2',
        num : 2,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [3] },
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
        name: '3',
        num : 3,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [5] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [3] },
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
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [2] },
                    { test : 'killUnits', args : [4] },
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
        name: '6',
        num : 6,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [4] },
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
        name: '7',
        num : 7,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'survivalists',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInNumberOfEnemyAreas', args : [2] },
                    { test : 'useSkills', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
        ]
    },
];


module.exports = obj;
