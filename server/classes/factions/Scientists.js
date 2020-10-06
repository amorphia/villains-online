let Faction = require( './Faction' );


class Scientists extends Faction {
    name = 'scientists';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.focus = 'fusion-focus';
        this.data.focusDescription = "Play many cards";
        this.data.name = this.name;
        this.data.title = "The Union of Mad Science";
        this.data.cardDraw = 4;
        //this.data.maxEnergy = 10;
        this.data.fusion = 0;
        this.data.upgradeCardDraw = 0;

        // tokens
        this.tokens['card'].count = 4;

        this.tokens['mr-fusion'] = {
            count: 1,
            data: {
                influence: 1,
                type : 'card',
                noLimit : true,
                cost : 0
            }
        };

        // units
        this.units['goon'].count = 4;
        this.units['mole'].count = 4;
        this.units['talent'].count = 6;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Dr. Tyrannosaurus",
                flipped: false,
                toughness: true,
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [3],
                cost: 2,
                killed : false,
                onDeploy: 'drTyrannosaurusDeploy',
                onHit: 'drTyrannosaurusHit',
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    factionCombatMods( mods, area ) {
        if( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ){
            mods.push( { type : 'drCards', text : `Draws a card for each hit scored by Dr. Tyrannosaurus` });
        }

        return mods;
    }

    processUpgrade( n ){
        this.data.cardDraw += n - this.data.upgradeCardDraw;
        this.data.upgradeCardDraw = n;
    }

    async drTyrannosaurusHit( event ){
        let player = {}, data = {};

        for( let i = 0; i < event.hits; i++ ){
            this.message({ message: `<span class="faction-scientists">Dr Tyrannosaurus</span> learned a lot while killing` });
            this.drawCards( 2, true );
            [player, data] = await this.game().promise({ players: this.playerId, name: 'discard-card', data : {} });
            this.discardCard( data.cardId );
        }
    }


    async drTyrannosaurusDeploy( event ){
        let area = this.game().areas[ event.unit.location ];
        try {
            await this.game().battle( area );
        } catch( error ){
            console.error( error );
        }
    }

    factionCleanUp(){
       this.data.fusion = 0;
    }

    async mrFusionToken( args ){
        let fusing = true;

        while( fusing ) {
            args.fusion = true;
            let output = await this.playACard( args );
            if( output && output.declined ) fusing = false;
            else {
                this.data.fusion++;
            }
        }

        if( this.data.fusion === 0 ){
            this.game().declineToken( this.playerId, args.token, true );
        } else {
            this.game().advancePlayer();
        }
    }
}

module.exports = Scientists;
