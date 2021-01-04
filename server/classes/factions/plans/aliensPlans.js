let obj = [
    {
        name: 'We Come In Peace',
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
        name: 'Elite Cloning Vats',
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
        name: 'Phased Operations',
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
        name: 'Uplink Salvos',
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
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 2
            },
        ]
    },
    {
        name: 'Landing Site Omega',
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
        name: 'Death Spore Testing',
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
        name: 'Orbital Monitoring',
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
        name: 'Field Vivisections',
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
                    { test : 'skilledAtTarget', args : [2] }
                ],
                value : 1
            },
        ]
    },
];


module.exports = obj;
