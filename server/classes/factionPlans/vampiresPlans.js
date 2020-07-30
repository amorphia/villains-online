let obj = [
    {
        name: '',
        num : 1,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [2] },
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
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '',
        num : 2,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [3] },
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
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [5] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '',
        num : 4,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [4] },
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
        name: '',
        num : 5,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [4] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 2
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
        name: '',
        num : 6,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [3] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '',
        num : 7,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
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
        name: '',
        num : 8,
        faction : 'vampires',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
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

];


module.exports = obj;
