let obj = [
    {
        name: 'Vertical Monopolies',
        num : 1,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlMostAreas', args : [false] },
                    { test : 'enemyMarkers', args : [3] }
                ],
                value : 3
            }
        ]
    },
    {
        name: 'Violent Arbitrage',
        num : 2,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
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
        name: 'Market Reallocation',
        num : 3,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
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
        name: 'Regulatory Capture',
        num : 4,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,1] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] }
                ],
                value : 1
            }
        ]
    },
    {
        name: 'Mass Outsourcing',
        num : 5,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
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
        name: 'Asset Diversification',
        num : 6,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] }
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
                ],
                value : 1
            }
        ]
    },
    {
        name: 'Liquidated Policies',
        num : 7,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
                ],
                value : 1
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
        name: 'Insider Trading',
        num : 8,
        faction : 'bankers',
        objectives : [
            {
                requirements : [
                    { test : 'controlMostAreas', args : [true] },
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
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
];


module.exports = obj;
