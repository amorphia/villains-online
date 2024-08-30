let obj = [
    {
        name: '1',
        num : 1,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
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
                    { test : 'areasWithTypesCount', args : [2, 3, 'patsy'] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 2, 'mole'] },
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
        name: '3',
        num : 3,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 2, 'goon'] },
                ],
                value : 2
            },

        ]
    },
    {
        name: '4',
        num : 4,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 3, 'mole'] },
                    { test : 'enemyMarkers', args : [2] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 3, 'patsy'] },
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
        name: '6',
        num : 6,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 2, 'goon'] },
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
        name: '7',
        num : 7,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 2, 'talent'] },
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
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'mutants',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasWithTypesCount', args : [2, 2, 'talent'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
