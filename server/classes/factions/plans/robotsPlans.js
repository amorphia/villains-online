let obj = [
    {
        name: 'Shadow Node Deployment',
        num : 1,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
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
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Negation Algorithms',
        num : 2,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'loseUnits', args : [2] },
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
        name: 'Reformat the Creators',
        num : 3,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateTarget', args : [] },
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
        name: 'Local Queue Defrag',
        num : 4,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateTarget', args : [] },
                ],
                value : 2
            },
        ]
    },
    {
        name: 'Bath Install Drones',
        num : 5,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
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
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Osiris Configuration',
        num : 6,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateTarget', args : [] },
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
        name: 'Gray Goo Seeding',
        num : 7,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [2] },
                ],
                value : 3
            },
        ]
    },
    {
        name: 'The Gulliver Worm',
        num : 8,
        faction : 'robots',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 2] },
                ],
                value : 2
            },
        ]
    },

];


module.exports = obj;
