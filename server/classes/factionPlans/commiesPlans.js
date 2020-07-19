let obj = [
    {
        num : 1,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
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
                    { test : 'influenceInAreas', args : [9,1] },
                ],
                value : 1
            }

        ]
    },

    {
        num : 2,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [5] },
                ],
                value : 1
            }
        ]
    },

    {
        num : 3,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [4,3] },
                    { test : 'killUnits', args : [5] },
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
        num : 4,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                    { test : 'useSkills', args : [2] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 5,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [5,2] },
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [12] },
                ],
                value : 2
            },
        ]
    },

    {
        num : 6,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [8,1] },
                    { test : 'unitInEnemy', args : ['mole', 1] },
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
        num : 7,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [12,1] },
                    { test : 'enemyMarkers', args : [2] },
                ],
                value : 3
            },
        ]
    },

    {
        num : 8,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [9,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'loseUnits', args : [4] },
                    { test : 'useSkills', args : [2] },
                ],
                value : 2
            },
        ]
    },

];


module.exports = obj;
