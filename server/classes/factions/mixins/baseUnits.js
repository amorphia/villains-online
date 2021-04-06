let obj = {
    goon: {
        count: 5,
        data: {
            name: 'Goon',
            influence: 1,
            basic: true,
            killed: false,
            type: 'goon',
            attack: [5, 5],
            cost: 2,
            selected: false,
            hitsAssigned: 0
        }
    },
    mole: {
        count: 5,
        data: {
            name: 'Mole',
            influence: 2,
            basic: true,
            type: 'mole',
            killed: false,
            attack: [9],
            cost: 1,
            selected: false,
            hitsAssigned: 0
        }
    },
    talent: {
        count: 3,
        data: {
            name: 'Talent',
            ready: false,
            influence: 1,
            skilled: true,
            basic: true,
            killed: false,
            type: 'talent',
            attack: [7],
            cost: 1,
            selected: false,
            hitsAssigned: 0
        }
    },
    patsy: {
        count: 4,
        data: {
            name: 'Patsy',
            ready: false,
            influence: 0,
            skilled: false,
            basic: true,
            type: 'patsy',
            killed: false,
            attack: [],
            cost: 0,
            selected: false,
            hitsAssigned: 0
        }
    },
    champion: {}
};

module.exports = module.exports = obj;
