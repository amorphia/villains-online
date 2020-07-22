<template>

    <div class="d-inline stat-icon mute-button" :class="computedClasses" @click="toggleVolume">
        <i :class="soundIcon" ></i>
    </div>
</template>


<script>
    export default {

        name: 'game-sound',
        props: ['classes'],
        data() {
            return {
                shared : App.state,
                volume : 1,
                mute : false,
                sounds : {},
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
            this.soundBank.forEach(sound => {
                this.sounds[sound] = new Audio(`/sounds/${sound}.mp3`);
            });

            let cookieVol = App.cookie( 'volume' );

            if( cookieVol !== null ){
                let cookieVol = App.cookie( 'volume' );
                this.volume = parseInt( cookieVol );
                this.updateVolume();
            }

            this.updateVolume();

            this.shared.socket.on( 'sound', this.play );
            this.shared.event.on( 'sound', this.play );
        },

        computed : {

            computedClasses(){
                let classes = '';
                if( this.volume ) classes += 'active';
                if( this.classes ) classes += ` ${this.classes}`;
                return classes;
            },

           soundIcon(){
                switch ( this.volume  ) {
                    case 0: return 'icon-mute';
                    case 1: return 'icon-volume-mid';
                    case 2: return 'icon-volume-high';
                }
           }
        },

        methods : {
            toggleVolume(){
                switch ( this.volume  ) {
                    case 0: this.volume = 1; break;
                    case 1: this.volume = 2; break;
                    case 2: this.volume = 0; break;
                }

                App.cookie( 'volume', this.volume );
                this.updateVolume();
            },

            updateVolume(){
                let vol;

                switch( this.volume ){
                    case 0: vol = 0; break;
                    case 1: vol = 0.4; break;
                    case 2: vol = 0.7; break;
                }

                _.forEach( this.sounds, sound => sound.volume = vol );
            },

            play( sound, options = {} ){
                if( this.volume === 0 ) return;
                this.sounds[sound].play();
            }
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

