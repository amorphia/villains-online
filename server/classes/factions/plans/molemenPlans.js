let obj = [
    {
        name: '',
        num : 1,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [2] }
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] }
                ],
                value : 1
            }
        ]
    },
    {
        name: 'Field Vivisections',
        num : 2,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] }
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Orbital Monitoring',
        num : 3,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [1] },
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
        name: 'Death Spore Testing',
        num : 4,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [2] }
                ],
                value : 2
            },
        ]
    },
    {
        name: 'Landing Site Omega',
        num : 5,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [2] }
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'useSkills', args : [2] }
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Uplink Salvos',
        num : 6,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [3] }
                ],
                value : 3
            },
        ]
    },
    {
        name: 'Phased Operations',
        num : 7,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [2] }
                ],
                value : 2
            },
        ]
    },
    {
        name: 'Elite Cloning Vats',
        num : 8,
        faction : 'molemen',
        objectives : [
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'areasCapturedThisTurn', args : [1] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            }
        ]
    },
];


module.exports = obj;
