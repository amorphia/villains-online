let obj = [
    {
        name: '1',
        num : 1,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'killsByPlayer', args : [1,3] },
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
                    { test : 'killsByPlayer', args : [2,3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'killsByPlayer', args : [1,3] },
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
                    { test : 'killsByPlayer', args : [2,3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'killsByPlayer', args : [3,3] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'killsByPlayer', args : [1,3] },
                ],
                value : 2
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
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killsByPlayer', args : [1,3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '6',
        num : 6,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'killsByPlayer', args : [2,2] },
                    { test : 'tokensInAreas', args : [5] },
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
        name: '7',
        num : 7,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'killsByPlayer', args : [2,2] },
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
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'spiders',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killsByPlayer', args : [2,2] },
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
];


module.exports = obj;
