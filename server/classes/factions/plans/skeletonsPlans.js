let obj = [
    {
        name: '1',
        num : 1,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 2] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['goon', 2] },
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
        name: '3',
        num : 3,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'unitTypesInEnemy', args : [4] },
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 2] },
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
        name: '5',
        num : 5,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'unitTypesInEnemy', args : [3] },
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
        name: '6',
        num : 6,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'unitTypesInEnemy', args : [3] },
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
        name: '7',
        num : 7,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['talent', 2] },
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
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['talent', 2] },
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

];


module.exports = obj;
