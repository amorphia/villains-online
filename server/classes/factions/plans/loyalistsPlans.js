let obj = [
    {
        name: '1',
        num : 1,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'controlArea', args : ['capitol'] },
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
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            }
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlArea', args : ['capitol'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            }
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'controlArea', args : ['capitol'] },
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
    {
        name: '4',
        num : 4,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlArea', args : ['capitol'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            }
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'controlArea', args : ['laboratory'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'controlArea', args : ['subway'] },
                ],
                value : 1
            }
        ]
    },
    {
        name: '6',
        num : 6,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'controlArea', args : ['bank'] },
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
                    { test : 'controlArea', args : ['sewers'] },
                ],
                value : 1
            }
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'controlArea', args : ['police'] },
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
                    { test : 'controlArea', args : ['university'] },
                ],
                value : 1
            }
        ]
    },
    {
        name: '8',
        num : 8,
        faction : 'loyalists',
        objectives : [
            {
                requirements : [
                    { test : 'controlArea', args : ['church'] },
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
                    { test : 'controlArea', args : ['factory'] },
                ],
                value : 1
            }
        ]
    },

];


module.exports = obj;
