let obj = {
    deploy: {
        count: 3,
        data: {
            influence: 1,
            cost: 0,
            req: "This token must be discarded if you don't deploy any units"
        }
    },
    card: {
        count: 3,
        data: {
            influence: 1,
            cost: 0,
            req: "This token must be discarded if you don't play a card"
        }
    },
    move: {
        count: 1,
        data: {
            influence: 1,
            cost: 2,
            req: "This token must be discarded if you don't move any units"
        }
    },
    battle: {
        count: 1,
        data: {
            influence: 1,
            resource: 1,
            cost: 0,
            req: "This token must be discarded if you cannot start a battle"
        }
    }
};

module.exports = obj;
