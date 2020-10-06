let obj = [
    {
        name: '1',
        num : 1,
        faction : 'parasites',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [3] },
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
        name: '2',
        num : 2,
        faction : 'parasites',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
                ],
                value : 1
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
        faction : 'parasites',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                    { test : 'controlTarget', args : [] },
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
        faction : 'parasites',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [2] },
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
    {
        name: '5',
        num : 5,
        faction : 'parasites',
        objectives : [
            {
                requirements : [
                    { test : 'areasMostUnits', args : [3] },
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
        name: '6',
        num : 6,
        faction : 'parasites',
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
        faction : 'parasites',
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
        faction : 'parasites',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasMostUnits', args : [1] },
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
