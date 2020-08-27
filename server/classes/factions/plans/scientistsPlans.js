let obj = [
    {
        name: 'Test the Death Ray',
        num : 1,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [ 4, 'card' ] },
                    { test : 'useSkills', args : [3] },

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
        name: 'Dissect the Mind of God',
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
        name: 'Ascend Beyond Morality',
        num : 3,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [ 4, 'card' ] },
                    { test : 'unitsAtTarget', args : [2, 'talent'] },

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
        name: 'Doomsday Device Research',
        num : 4,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'mrFusion', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'tokensInAreas', args : [6] },
                ],
                value : 1
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
        name: 'Post-Human Ascension',
        num : 5,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'cardsInHand', args : [3] },
                    { test : 'loseUnits', args : [3] },

                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'unitInEnemy', args : ['mole', 1] },
                ],
                value : 2
            },
        ]
    },

    {
        name: 'And They Called Me Mad...',
        num : 6,
        faction : 'scientists',
        objectives : [
            {
                requirements : [
                    { test : 'cardsInHand', args : [3] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                ],
                value : 2
            },
        ]
    },

    {
        name: 'Enter the Final Infinite',
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
        name: 'What Man Was Not Meant to Know',
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
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [3] },
                ],
                value : 1
            },
        ]
    },

];


module.exports = obj;
