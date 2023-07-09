let obj = [
    {
        name: 'Botnet Takeover',
        num : 1,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'killUnits', args : [6] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [4] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'skilledAtTarget', args : [3] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Brute Force Crack',
        num : 2,
        faction : 'hackers',
        objectives : [
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
            {
                requirements : [
                    { test : 'useSkills', args : [5] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Self Modifying Virus',
        num : 3,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'tokensInAreas', args : [5] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [4] },
                    { test : 'influenceInAreas', args : [7,1] },
                ],
                value : 2
            },
        ]
    },
    {
        name: 'Collapse the Firewalls',
        num : 4,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [4] },
                    { test : 'enemyMarkers', args : [3] },
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
        name: 'Social Engineering',
        num : 5,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [5] },
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
                    { test : 'controlOwnTarget', args : [] },
                ],
                value : 1
            },
        ]
    },
    {
        name: 'Def-Con Recruiting',
        num : 6,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'unitsInPlay', args : [8] },
                ],
                value : 1
            },
            {
                requirements : [
                    { test : 'useSkills', args : [6] },
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
        name: 'Hack the Planet',
        num : 7,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [8] },
                ],
                value : 3
            },
        ]
    },
    {
        name: 'Phishing Attacks',
        num : 8,
        faction : 'hackers',
        objectives : [
            {
                requirements : [
                    { test : 'useSkills', args : [7] },
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

];


module.exports = obj;
