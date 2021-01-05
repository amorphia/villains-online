let obj = [
    {
        name: '1',
        num : 1,
        faction : 'skeletons',
        objectives : [
            {
                requirements : [
                    { test : 'killsInAreas', args : [2] },
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
                    { test : 'loseUnits', args : [3] },
                ],
                value : 1
            },
        ]
    },


];


module.exports = obj;
