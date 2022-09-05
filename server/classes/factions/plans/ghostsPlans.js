let obj = [
    {
        name: 'Symmetrical Stacking',
        num : 1,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
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
        name: 'Hostile Manifestations',
        num : 2,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [1] },
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
                    { test : 'retainAreas', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Peace for the restless souls',
        num : 3,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [3] },
                ],
                value : 3
            },
        ]
    },
    {
        name: 'Free the anchored ones',
        num : 4,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [1] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'enemyMarkers', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'retainAreas', args : [2] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Extra-Planar Obelisk',
        num : 5,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [1] },
                    { test : 'tokensInAreas', args : [5] },
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
        name: 'Free Roaming Vapors',
        num : 6,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [1] },
                    { test : 'killUnits', args : [4] },
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
        name: 'Non-Terminal Phantasms',
        num : 7,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'retainAreas', args : [2] },
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
        name: 'Transcendence Rituals',
        num : 8,
        faction : 'ghosts',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'retainAreas', args : [2] },
                ],
                value : 2
            },
        ]
    },

];


module.exports = obj;
