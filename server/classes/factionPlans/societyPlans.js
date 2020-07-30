let obj = [
    {
        name: '',
        num : 1,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
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
        ]
    },
    {
        name: '',
        num : 2,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                    { test : 'killUnits', args : [4] },
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
        name: '',
        num : 3,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [9] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '',
        num : 4,
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
                    { test : 'loseUnits', args : [3] },
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '',
        num : 5,
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
                    { test : 'exterminateAreas', args : [1] },
                    { test : 'useSkills', args : [2] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '',
        num : 6,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
                    { test : 'influenceInAreas', args : [6,1] },
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
        name: '',
        num : 7,
        faction : 'society',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 2
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
        name: '',
        num : 8,
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
                    { test : 'killUnits', args : [4] },
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
