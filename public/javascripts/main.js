/// Setup ///
let currentPress = '';
let currentPressID = '';
let gamepadCurrent = null;
let poller = null;
const socket = io.connect('//localhost:3000/');
const tranDuration = 333;
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
    .on('keypress', function(e) {
        e.preventDefault();
        currentPressID = this.id;
        currentPress = currentPressID.split('-')[1];

        $(this).addClass('active');
        setTimeout(() => $(this).removeClass('active'), tranDuration);
    })
    .on('click', function(e) { // keypress/enter
        e.preventDefault();
        currentPressID = this.id;
        currentPress = currentPressID.split('-')[1];

        $(this).addClass('active');
        setTimeout(() => $(this).removeClass('active'), tranDuration);

        // trying to differentiate mouse clicks from hitting enter
        if (e.screenX === 0 && e.screenY === 0) { // enter
        } else { // mouse click
            setTimeout(() => $(this).blur(), tranDuration);
        }
    });


/// scale gamepad image on load/resize to fit bottom 50% of screen ///
const setScale = () => {
    let $wrapper = $('#wrapper');
    // 1024px x 768px is the default size of #gamepad
    let scaleW = window.innerWidth / 1024;
    let scaleH = window.innerHeight / 768 / 2;
    let scale = scaleH < scaleW ? scaleH : scaleW;
    $('#gamepad').css({
        'transform': 'scale(' + scale + ')'
    });
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
    $('#output').append('<span>' + data.button + '</span>');
    setTimeout(() => $('#output>span:first-child').remove(), 4800);
});


/// Socket.io outgoing ///
const sendPress = () => {
    if (currentPress !== '') {
        socket.emit('press', {
            'button': currentPress
        });
        $('#' + currentPressID).addClass('sentPress');
        setTimeout(() => $('.pressable').removeClass('sentPress'), tranDuration);
        currentPress = '';
        currentPressID = '';
    }
};
setInterval(sendPress, 1000); // only send button press every 1000ms


/// Gamepad API ///
function gamepadPoller() {
    console.debug('started');
//        console.debug('buttons: ' + gamepadCurrent.buttons.length);
    /*
    for (let i = 0; i < 4; i++) {
        console.debug(navigator.getGamepads()[i]);
    }
    */


    for (let i = 0; i < navigator.getGamepads()[gamepadCurrent].buttons.length; i++) {
        let val = navigator.getGamepads()[gamepadCurrent].buttons[i];

        // process to get 'pressed' from https://github.com/luser/gamepadtest/blob/master/gamepadtest.js (CC0)
        let pressed = val === 1.0;
        if (typeof(val) === 'object') {
            pressed = val.pressed;
            val = val.value;
        }

        if (!pressed) continue;
        console.debug(i + ': ' + pressed);
        console.debug(i + ': ' + val);
        $('#' + keyMap[i]).click();
        break;

//            console.debug(i + ': ' + navigator.getGamepads()[2].buttons[i].pressed);
//            if (gamepadCurrent.buttons[i].pressed) {
//                console.debug('i: ' + i);
//            }
    }
    console.debug('ended');
}

window.addEventListener("gamepadconnected", function(e) {
    console.debug('connect');
    /*
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
        */

    if (e.gamepad !== null
        && e.gamepad.mapping === 'standard'
        && e.gamepad.buttons.length > 0
        && gamepadCurrent === null) {
            gamepadCurrent = e.gamepad.index;
            console.debug('found');
            console.table(gamepadCurrent);
            if (poller !== null) {
                clearInterval(poller);
                console.debug('poller: ' + poller);
            }
            poller = setInterval(gamepadPoller, 83);
//      rAF(gamepadPoller);
            console.debug('poller: ' + poller);
    }
});
/*
$(window).on('gamepadconnected', function(e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
});
*/

window.addEventListener("gamepaddisconnected", function(e) {
    clearInterval(poller);
    gamepadCurrent = null;
    console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
});

/*
let gamepads = navigator.getGamepads();
console.table(gamepads);
for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] !== null
        && gamepads[i].mapping === 'standard'
        && gamepads[i].buttons.length > 0) {
        console.log(gamepads[i]);
    } else {
        console.log("nope");
    }
}
*/