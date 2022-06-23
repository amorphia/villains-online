let obj = {
    deploy: {
        count: 3,
        data: {
            influence: 1,
            cost: 0,
            description: "Deploy a number of units up to your deploy limit (default of 2) to this area by paying their unit cost. Those units may be from your reserves or another area.",
            req: "This token must be discarded if you don't deploy any units"
        }
    },
    card: {
        count: 3,
        data: {
            influence: 1,
            cost: 0,
            description: "Play an action card in this area by paying its card cost.",
            req: "This token must be discarded if you don't play a card"
        }
    },
    move: {
        count: 1,
        data: {
            influence: 1,
            cost: 2,
            description: "Move any number of your units from adjacent areas to this area.",
            req: "This token must be discarded if you don't move any units"
        }
    },
    battle: {
        count: 1,
        data: {
            influence: 1,
            resource: 1,
            cost: 0,
            description: "Start a battle in this area if possible (even if only enemy units are present).",
            req: "This token must be discarded if you cannot start a battle"
        }
    }
};

module.exports = obj;
