let obj = [
    {
        name: '1',
        num : 1,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'conquerAreas', args : [7] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'conquerAreas', args : [8] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'conquerAreas', args : [6] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlTarget', args : [] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [4] },
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'conquerAreas', args : [6] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'conquerAreas', args : [4] },
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['goon', 1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '6',
        num : 6,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'conquerAreas', args : [5] },
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'conquerAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [5] },
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
        faction : 'conquistadors',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['goon', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'conquerAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
