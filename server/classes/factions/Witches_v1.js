let Faction = require( './Faction' );


class Witches extends Faction {
    name = 'witches';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Witches of Havelocke";
        this.data.focus = 'rule-focus';
        this.data.focusDescription = "Play many rule cards";
        this.data.darkEnergy = 0;
        this.data.cordellaDeployed = false;
        this.data.darkEnergyMax = 3;

        // icons
        this.data.statusIcon = 'enchanted';
        this.data.statusDescription = 'has enchanted units';


        this.capturedRewards = [
            { ap : 1, cardDraw : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 2 },
        ];

        // tokens
        this.tokens['brew'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'brew',
                cost: 0,
            }
        };


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Cordella",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [8,8,8],
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onHit: 'cordellaHit',
                onDeploy : 'cordellaFirstDeploy'
            }
        };
    }



    async revealMagick( area ){
        let player, data;

        this.game().popup( this.playerId, { magick : true, area : area.name, faction : this.name });

        this.drawCards();
        let card = _.last( this.data.cards.hand );

        this.game().message({
            faction : this,
            message: `use magick in the <span class="highlight">${area.name}</span> revealing:`,
            type : 'cards',
            cards : [card]
        });

        let declineMessage = this.data.upgrade >= 1 ? 'discard this card' : 'sacrifice a unit and discard this card';
        let message = `Play this card ${ this.data.upgrade === 2 ? 'for free ' : '' }in The ${area.name}`

        let args = {
            area : area.name,
            cards : [card],
            cost : this.data.upgrade === 2 ? 0 : card.cost,
            message : message + '?',
            declineMessage : declineMessage,
            saveMessage : message,
            free : this.data.upgrade === 2
        };

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-card',
            data : args
        }).catch( error => console.error( error ) );

        return [args, data, card];
    }

    async declineMagick( area, card ){
        let player, data;

        this.game().message({
            faction : this,
            message: `chooses not to play the card`
        });

        this.discardCard( card );

        if( !this.data.upgrade ) {
            [player, data] = await this.game().promise({
                players: this.playerId,
                name: 'sacrifice-units',
                data : { count : 1, areas : [area.name]  }
            }).catch( error => console.error( error ) );

            let unit = this.game().objectMap[ data.units[0] ];
            await this.game().killUnit( unit, this );

            let message = `sacrifices ${unit.name} in the ${area.name}`;
            this.game().message({ faction: this, message: message });
        }
    }


    dienchantUnits( area ){
        this.data.units.forEach( unit => {
            if( unit.location === area.name && unit.flipped ) this.unitUnflipped( unit );
        })
    }


    async magickAction( area ){
        let player, data, args, card;

        this.dienchantUnits( area );

        [args, data, card] = await this.revealMagick( area );

        if( data.decline ){
            await this.declineMagick( area, card );
            return;
        }

        args.area = this.game().areas[args.area];
        await this.processCard( args, data );
    }


    canActivateBrew( token, area ) {
        return !! this.data.tokens.find( token => token.location === area.name && token.revealed && token.type !== 'brew' );
    }


    async brewToken( args ) {
        this.data.tokens.forEach( token => {
            if(
                token.location === args.area.name
                && token.revealed
                && token.type !== 'brew'
            ){
                token.revealed = false;
            }
        });

        this.game().message({ faction : this, message: `Flip their tokens face down in The ${args.area.name}` });
        this.game().advancePlayer();
    }

    enchantUnits() {
        let areas = this.areas();

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && !unit.flipped ) {
                unit.flipped = true;
                unit.redeployFree = true;
            }
        });
    }

    async cordellaHit( event ){
        let player = {}, data = {};

        this.message({ message: `<span class="faction-witches">The Mirror Mother</span> looks into possible futures` });
        this.drawCards( event.hits, true );
        [player, data] = await this.game().promise({ players: this.playerId, name: 'discard-card', data : { count: event.hits } });
        this.discardCard( data.cards );

    }

    cordellaFirstDeploy( event ){
        if( !this.data.cordellaDeployed ){
            this.data.cordellaDeployed = true;
            this.resetDarkEnergy();
        }
    }

    checkCordellaCapture(){
        let cordella = this.data.units.find( unit => unit.type === 'champion' && !unit.killed );
        if( ! cordella || ! this.data.areasCapturedThisTurn.includes( cordella.location ) ) return;

        this.resetDarkEnergy();
    }

    resetDarkEnergy() {
        this.game().message({ faction : this, message: `Cordella channels dark energy` });
        this.data.darkEnergy = this.data.darkEnergyMax;
    }

    factionCleanUp(){
        this.enchantUnits();
        this.checkCordellaCapture();
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.redeployFree = false;
    }

}


module.exports = Witches;