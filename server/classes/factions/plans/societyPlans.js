let obj = [
    {
        name: '1',
        num : 1,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [8,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [7] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [7] },
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [8,1] },
                ],
                value : 1
            },

        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [8] },
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [7] },
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
        name: '5',
        num : 5,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
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
                    { test : 'useSkills', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '6',
        num : 6,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [7] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [10] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'goon'] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [7] },
                    { test : 'enemyMarkers', args : [3] },
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
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 2
            },
        ]
    },
];


module.exports = obj;
