/// Setup ///
let currentPress = '';
let currentPressID = '';
let gamepadCurrent = null;
let poller = null; // timer identifier, allows removal of setInterval when gamepad is disconnected
const socket = io.connect('//localhost:3000/');
const tranDuration = 333; // duration of .active class transition
// map of gamepad button number: html element id
const keyMap = {
    0: 'button-A',
    1: 'button-B',
    2: 'button-X',
    3: 'button-Y',
    4: 'button-LB',
    5: 'button-RB',
    6: 'button-LT',
    7: 'button-RT',
    8: 'button-select',
    9: 'button-start',
    10: 'button-L3',
    11: 'button-R3',
    12: 'direction-up',
    13: 'direction-down',
    14: 'direction-left',
    15: 'direction-right'
};


/// jQuery events ///
$('.pressable')
    .on('keypress', function(e) { // keypress
        e.preventDefault(); // don't actually follow hrefs
        currentPressID = this.id;
        currentPress = currentPressID.split('-')[1];

        // highlight button press for a short time
        $(this).addClass('active');
        setTimeout(() => $(this).removeClass('active'), tranDuration);
    })
    .on('click', function(e) { // mouse click/enter
        e.preventDefault(); // don't actually follow hrefs
        currentPressID = this.id;
        currentPress = currentPressID.split('-')[1];

        // highlight button press for a short time
        $(this).addClass('active');
        setTimeout(() => $(this).removeClass('active'), tranDuration);

        // trying to differentiate mouse clicks from hitting enter, so we don't
        // affect accessibility for keyboard users (by calling .blur())
        if (e.screenX !== 0 || e.screenY !== 0) { // mouse click
            setTimeout(() => $(this).blur(), tranDuration);
        }
    });


/// scale gamepad image on load/resize to fit bottom 50% of screen ///
const setScale = () => {
    let $wrapper = $('#wrapper');
    // 1024px x 768px is the default size of #gamepad
    let scaleW = window.innerWidth / 1024;
    let scaleH = window.innerHeight / 768 / 2; // divide by 2 because height is 50%
    let scale = scaleH < scaleW ? scaleH : scaleW; // choose smaller of the scales to ensure fit
    $('#gamepad').css({
        'transform': 'scale(' + scale + ')'
    });
    // visibility starts hidden to hide sudden 'jumps' in controller scale before sizing
    $wrapper.css({
        'width': 1024 * scale + 'px',
        'height': 768 * scale + 'px',
        'visibility': 'visible'
    });
};
$(window).on('load', setScale).on('resize', setScale);

/// set background color randomly (default = blue) ///
const rando = Math.random();
if (rando > .666) {
    $('body').addClass('green').removeClass('blue');
} else if (rando > .333) {
    $('body').addClass('red').removeClass('blue');
} //else blue



/// Socket.io incoming ///
socket.on('winning-button', function (data) {
    // display winning button overlayed on video output, then fade
    $('#output').append('<span>' + data.button + '</span>');
    setTimeout(() => $('#output>span:first-child').remove(), 4800);
});


/// Socket.io outgoing ///
const sendPress = () => {
    if (currentPress !== '') {
        socket.emit('press', {
            'button': currentPress
        });
        // highlight sent button press
        $('#' + currentPressID).addClass('sentPress');
        setTimeout(() => $('.pressable').removeClass('sentPress'), tranDuration);
        // reset current button press
        currentPress = '';
        currentPressID = '';
    }
};
setInterval(sendPress, 1000); // only send button press once every 1000ms


/// Gamepad API ///
function gamepadPoller() {
    // scan buttons in order until a pressed one is found
    // (i.e. when multiple buttons are pressed, only one will count)
    for (let i = 0; i < navigator.getGamepads()[gamepadCurrent].buttons.length; i++) {
        let val = navigator.getGamepads()[gamepadCurrent].buttons[i];

        // process to get 'pressed' from https://github.com/luser/gamepadtest/blob/master/gamepadtest.js (CC0)
        let pressed = (val === 1.0);
        if (typeof(val) === 'object') {
            pressed = val.pressed;
            val = val.value;
        }

        // check the next button, if this one wasn't pressed
        if (!pressed) continue;

        // use the already-present click handler on buttons
        $('#' + keyMap[i]).click();
        break;
    }
}

// when a gamepad is connected, check that it is real (that it actually has buttons)
// then start the poller to check that gamepad
window.addEventListener("gamepadconnected", function(e) {
    if (e.gamepad !== null
        && e.gamepad.mapping === 'standard'
        && e.gamepad.buttons.length > 0
        && gamepadCurrent === null) {
            // if a previous gamepad poller is running, stop it and start a new one
            if (poller !== null) {
                clearInterval(poller);
            }
            gamepadCurrent = e.gamepad.index;
            poller = setInterval(gamepadPoller, 83); // ~12 times/second
    }
});

// on a gamepad disconnect, stop the polling function, and nullify the current reference
window.addEventListener("gamepaddisconnected", function(e) {
    clearInterval(poller);
    gamepadCurrent = null;
});
