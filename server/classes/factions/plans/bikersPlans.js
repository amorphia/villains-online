let obj = [
    {
        name: '1',
        num : 1,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
                    { test : 'useSkills', args : [2] },
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
        name: '2',
        num : 2,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [3] },
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
        name: '3',
        num : 3,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasMostUnits', args : [3] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
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
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [3] },
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
    {
        name: '6',
        num : 6,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [4] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
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
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'bikers',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
                    { test : 'skilledAtTarget', args : [2] },
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
];


module.exports = obj;
