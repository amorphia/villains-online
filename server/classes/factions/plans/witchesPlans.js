let obj = [
    {
        name: '1',
        num : 1,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [3, 'total'] },
                    { test : 'influenceInAreas', args : [6,1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '2',
        num : 2,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [2, 'areas'] },
                    { test : 'unitsAtTarget', args : [2, 'talent'] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            },
        ]
    },
    {
        name: '3',
        num : 3,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [2, 'stack'] },
                    { test : 'useSkills', args : [2] },
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
        name: '4',
        num : 4,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [2, 'stack'] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                    { test : 'useSkills', args : [2] },
                ],
                value : 2
            },
        ]
    },
    {
        name: '5',
        num : 5,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [3, 'total'] },
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
        name: '6',
        num : 6,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [5, 'total'] },
                ],
                value : 3
            },
        ]
    },
    {
        name: '7',
        num : 7,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [2, 'areas'] },
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
        name: '8',
        num : 8,
        faction : 'witches',
        objectives : [
            {
                requirements : [
                    { test : 'playRules', args : [3, 'total'] },
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [3] },
                ],
                value : 1
            },
        ]
    },


];


module.exports = obj;