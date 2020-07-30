let obj = [
    {
        name: 'Call to the Last Shadow',
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
        name: 'Behold the Flayed Beauty',
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
        name: 'Cast Aside Your Earthly Husks',
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
        name: 'Surrender to the Lotus Milk',
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
        name: 'Set the Stars as Spears',
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
        name: 'Bind the Flesh Pentacle',
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
        name: 'Nine rites of Belzenubius',
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
        name: 'Tears of the Unborn God',
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
