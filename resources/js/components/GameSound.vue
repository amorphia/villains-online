<template>
    <div class="d-inline stat-icon mute-button" :class="{active : this.volume}" @click="toggleVolume">
        <i :class="soundIcon" ></i>
    </div>
</template>


<script>
    export default {

        name: 'game-sound',
        props: [],
        data() {
            return {
                shared : App.state,
                volume : 1, // initial volume setting

                // used to store each of our sound objects
                sounds : {},

                // data about each of our volume settings
                volumeScale : {
                    '0' : { icon : 'icon-mute', amp : 0 },
                    '1' : { icon : 'icon-volume-mid', amp : .4 },
                    '2' : { icon : 'icon-volume-high', amp : .7 },
                },

                // array of available sounds
                soundBank : [
                    'active',
                    'basta',
                    'bats',
                    'combat',
                    'chirp',
                    'coin',
                    'error',
                    'explosion',
                    'hatch',
                    'hit',
                    'hit2',
                    'hit3',
                    'hypnotize',
                    'huh',
                    'points',
                    'queendeath',
                    'title',
                    'wiff',
                    'woosh',
                    'ui',
                ]
            };
        },

        mounted() {

            // for each sound initialize an audio object
            this.soundBank.forEach(sound => {
                this.sounds[sound] = new Audio(`/sounds/${sound}.mp3`);
            });

            // check our cookies to see any previous volume settings
            if(  App.cookie( 'volume' ) !== null ){
                this.volume = parseInt(  App.cookie( 'volume' ) );
            }

            // set event listeners
            this.shared.socket.on( 'sound', this.play ); // from the game server
            this.shared.event.on( 'sound', this.play ); // from the ui
        },

        computed : {

            /**
             * Get our volume icon
             * @returns {string}
             */
           soundIcon(){
                return this.volumeScale[ this.volume ].icon;
           }
        },

        methods : {

            /**
             * Toggle through our volume settings
             */
            toggleVolume(){
                // increment our volume by 1, looping back to 0 after 2
                switch ( this.volume ) {
                    case 0: this.volume = 1; break;
                    case 1: this.volume = 2; break;
                    case 2: this.volume = 0; break;
                }

                App.cookie( 'volume', this.volume );
            },


            /**
             * Play a sound
             * @param sound
             */
            play( sound ){
                if( this.volume === 0 ) return;
                this.setVolume( this.sounds[sound] );
                this.sounds[sound].play();
            },


            /**
             * set the volume of a sound
             * @param sound
             */
            setVolume( sound ){
                sound.volume = this.volumeScale[this.volume].amp;
            },
        }
    }
</script>


<style>
    .mute-button {
        color: var(--primary-light-color);
    }

    .mute-button.active {
        color: var(--highlight-color);
    }
</style>

