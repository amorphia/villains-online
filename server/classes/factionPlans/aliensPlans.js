let obj = [
    {
        num : 1,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'enemyMarkers', args : [5] }
                ],
                value : 3
            }
        ]
    },
    {
        num : 2,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'enemyMarkers', args : [4] }
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [9] }
                ],
                value : 1
            }
        ]
    },
    {
        num : 3,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'enemyMarkers', args : [2] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [8,1] }
                ],
                value : 1
            }
        ]
    },
    {
        num : 4,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'enemyMarkers', args : [3] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlTarget', args : [] },
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 2
            },
        ]
    },
    {
        num : 5,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [2] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [3] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
        ]
    },
    {
        num : 6,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                    { test : 'useSkills', args : [2] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [4] },
                ],
                value : 2
            },
        ]
    },
    {
        num : 7,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'enemyMarkers', args : [1] },
                    { test : 'exterminateAreas', args : [1] }
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] }
                ],
                value : 1
            },
        ]
    },
    {
        num : 8,
        faction : 'aliens',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [2] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] }
                ],
                value : 1
            },
        ]
    },
];


module.exports = obj;
