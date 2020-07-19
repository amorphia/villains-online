let obj = [
    {
        num : 1,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [ 4, 'card' ] },
                    { test : 'exterminateAreas', args : [1] },
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
        num : 2,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [ 4, 'card' ] },
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 3,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [ 4, 'card' ] },
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 2
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
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'mrFusion', args : [4] },
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 5,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'discardCards', args : [3] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 6,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'discardCards', args : [3] },
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 7,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'mrFusion', args : [9] },
                ],
                value : 3
            },
        ]
    },

    {
        num : 8,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'mrFusion', args : [6] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                    { test : 'useSkills', args : [3] },
                ],
                value : 2
            },
        ]
    },

];


module.exports = obj;
