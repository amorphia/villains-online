let obj = [
    {
        num : 1,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [4] },
                    { test : 'useSkills', args : [2] }
                ],
                value : 3
            }
        ]
    },
    {
        num : 2,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            }
        ]
    },
    {
        num : 3,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                    { test : 'useSkills', args : [2] }
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            }
        ]
    },
    {
        num : 4,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                    { test : 'unitInEnemy', args : ['mole', 1] }
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] }
                ],
                value : 1
            }
        ]
    },
    {
        num : 5,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                    { test : 'enemyMarkers', args : [3] }
                ],
                value : 2
            }
        ]
    },
    {
        num : 6,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                    { test : 'tokensInAreas', args : [6] }
                ],
                value : 2
            }
        ]
    },
    {
        num : 7,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                    { test : 'killUnits', args : [5] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] }
                ],
                value : 1
            }
        ]
    },
    {
        num : 8,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlAreas', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] }
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
];


module.exports = obj;
