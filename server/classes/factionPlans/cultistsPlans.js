let obj = [
    {
        num : 1,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [6] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['goon', 2] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 2,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [6] },
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
    {
        num : 3,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [5] },
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
        num : 4,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killMost', args : [] },
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
        num : 5,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['goon', 1] },
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
        num : 6,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [6] },
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
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
        num : 7,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [9] },
                ],
                value : 3
            },
        ]
    },
    {
        num : 8,
        faction : 'cultists',
        objectives : [
            {
                requirements : [
                    { test : 'killMost', args : [] },
                    { test : 'tokensInAreas', args : [6] },
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

];


module.exports = obj;
