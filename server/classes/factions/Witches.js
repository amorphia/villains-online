let Faction = require( './Faction' );


class Witches extends Faction {
    name = 'witches';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Witches of Havelocke";
        this.data.focus = 'rule-focus';
        this.data.darkEnergy = 0;
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
                resource : 1
            }
        };


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Cordella",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [9,9,9],
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }


    async revealMagick( area ){
        let player, data;

        this.drawCards();
        let card = _.last( this.data.cards.hand );

        this.game().message({
            faction : this,
            message: `reveals`,
            type : 'cards',
            cards : [card]
        });

        let declineMessage = this.data.upgrade >= 1 ? 'draw this card' : 'sacrifice a unit to draw this card';
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

        return [args, data];
    }

    async declineMagick( area ){
        let player, data;

        this.game().message({
            faction : this,
            message: `chooses not to play the card`
        });

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
        let player, data, args;

        this.dienchantUnits( area );

        [args, data] = await this.revealMagick( area );

        if( data.decline ){
            await this.declineMagick( area );
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
            if(
                unit.location
                && areas.includes( unit.location )
                && !unit.flipped
                && !unit.killed
            ) {
                unit.flipped = true;
                unit.redeployFree = true;
            }
        });
    }

    resetDarkEnergy() {
        let cordella = this.data.units.find( unit => unit.type === 'champion' && !unit.killed );
        if( ! cordella || ! this.data.areasCapturedThisTurn.includes( cordella.location ) ) return;

        this.game().message({ faction : this, message: `Cordella channels dark energy` });
        this.data.darkEnergy = this.data.darkEnergyMax;
    }

    factionCleanUp(){
        this.enchantUnits();
        this.resetDarkEnergy();
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.redeployFree = false;
    }

}


module.exports = Witches;
