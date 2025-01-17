/* eslint no-unused-vars: ["error", { "args": "none" }]*/
/* global dzPlayer, exportedValues, Events, dataLayer */

// Gets called first
function pollDzPlayer() {
    if (dzPlayer != null) {
        injectSetVolume();
    } else {
        setTimeout(pollDzPlayer, 100);
    }
}

function injectSetVolume() {
    // e - new volume level
    // t - did user specifically click the volume bar?
    dzPlayer.control.setVolume = (e, t) => {
        try {
            if (dzPlayer.chromecast.isLoading()) {
                return !1;
            }
            // What is st?? 
            // This probably only disables setting volume while an ad is playing
            // if (st(dzPlayer.getPlayerType()))
            //    return !1;
            
            dzPlayer.isMuted() && e > 0 && dzPlayer.control.mute(!1);
            t = t || !1;
            dzPlayer.volume = e;

            // volumePower is exported by another script, yet we can access it freely via exportedValues
            if (!isNaN(exportedValues.volumePower) && isFinite(exportedValues.volumePower) && exportedValues.volumePower > 0) {
                dzPlayer.trigger('audioPlayer_setVolume', [Math.pow(e, exportedValues.volumePower)]);
            } else {
                dzPlayer.trigger('audioPlayer_setVolume', [e]);
            }

            Events.trigger(Events.player.volume_changed, Math.round(100 * e));
            // Disabled, to allow setting the local storage even when changed via mpris
            // if (t === true) {
            window.localStorage.setItem('volume_' + dataLayer[0].deezer_user_id, e);
            // }
        } catch (e) {
            console.error(e);
        }
    };
}

pollDzPlayer();
