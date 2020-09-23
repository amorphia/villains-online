let obj = {
    mutants : { name: 'mutants', owner : null, status : 3, basic : true },
    mafia : { name: 'mafia', owner : null, status : 2, basic: true },
    scientists : { name: 'scientists', owner : null, status : 3, basic: true },
    robots : { name: 'robots', owner : null, killer : true, status : 3, basic: true },
    bankers : { name: 'bankers', owner : null, status : 3, basic: true },
    commies : { name: 'commies', owner : null, status : 2, basic: true},
    aliens : { name: 'aliens', owner : null, status : 3, basic: true },
    cultists : { name: 'cultists', owner : null, killer : true, status : 3, basic: true },
    loyalists : { name: 'loyalists', owner : null, status : 2 },
    swarm : { name: 'swarm', owner : null, status : 2 },
    vampires : { name: 'vampires', owner : null, killer : true, status : 2 },
    society : { name: 'society', owner : null, status : 1 },
    hackers : { name: 'hackers', owner : null, status : 0 },
    ninjas : { name: 'ninjas', owner : null, killer : true, status : 1 },
    //guerrillas : { name: 'guerrillas', owner : null, killer : true, status : 0 },
    //parasites : { name: 'parasites', owner : null, status : 0 },
    conquistadors : { name: 'conquistadors', owner : null, killer : true, status : 0 },
};

module.exports = Object.assign({}, obj );
