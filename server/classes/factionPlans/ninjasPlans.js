let obj = [
    {
        name: '1',
        num : 1,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'killTypeCount', args : [3] },
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
        name: '2',
        num : 2,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'killTypeCount', args : [3] },
                    { test : 'exterminateAreas', args : [1] },
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
        name: '3',
        num : 3,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'killTypeCount', args : [5] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'killTypes', args : [ ['mole','talent'], 2 ] },
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
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killTypes', args : [ ['mole','talent'], 2 ] },
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
        name: '6',
        num : 6,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killTypeCount', args : [2] },
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
        name: '7',
        num : 7,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killTypes', args : [ ['goon','champion'], 2 ] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'ninjas',
        objectives : [
            {
                requirements : [
                    { test : 'killTypes', args : [ ['goon','champion'], 2 ] },
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

];


module.exports = obj;
