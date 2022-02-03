let obj = [
    {
        name: 'Forward, To Victory!',
        num : 1,
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
                    { test : 'enemyMarkers', args : [3] },
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
        name: 'Eat the Rich!',
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
                    { test : 'skilledAtTarget', args : [2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'killUnits', args : [4] },
                ],
                value : 1
            }
        ]
    },

    {
        name: 'The First Up Against The Wall!',
        num : 3,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [6,2] },
                    { test : 'useSkills', args : [2] },
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
        name: 'No War But Class War!',
        num : 4,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [5,2] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'exterminateAreas', args : [1] },
                    { test : 'controlTarget', args : [] },
                ],
                value : 2
            },
        ]
    },

    {
        name: 'Workers of the World, Unite!',
        num : 5,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [5,2] },
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 2
            },
            {
                requirements : [
                    { test : 'unitsInPlay', args : [12] },
                ],
                value : 1
            },
        ]
    },

    {
        name: 'Property is Theft!',
        num : 6,
        faction : 'commies',
        objectives : [
            {
                requirements : [
                    { test : 'influenceInAreas', args : [8,1] },
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
                    { test : 'controlTarget', args : [] },
                ],
                value : 1
            },
        ]
    },

    {
        name: 'Seize the Means of Production!',
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
        name: 'Nothing to Lose, But Your Chains!',
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

];


module.exports = obj;
