class Token {

    revealed = false; // has this token been revealed yet? always false in reserves
    owner; // player who owns this token
    name; // token name
    faction; // faction this token belongs to
    selected; // is this token currently selected (used on the UI side, but initialized here so its reactive out of the box)
    location = null; // area where the token has been placed, null represents the player's reserves

    constructor( faction, name, data ) {
        this.owner = faction.owner;
        this.faction = faction.name;
        this.name = name;

        // by default every token's type will match its name, but some special faction tokens will have
        // a basic token type that doesn't match their name (for example the alien's invade token is named "invade",
        // but it has the type "deploy" because it is treated as a deploy token for effects like the action card
        // "march the streets"). So lets initialize the type here matching the token's name, then we can overwrite
        // it later when need be
        this.type = name;

        Object.assign( this, data );
    }

}


module.exports = Token;


