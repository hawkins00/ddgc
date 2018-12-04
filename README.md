# ddgc 🎮

**Distributed Democratic Game Control**

This repo (when complete) will provide a system allowing numerous game
players to work together to democratically choose moves for a shared
online video game. The defining feature of this software is the ability
to use an actual controller to enter input (instead of the usual chat
input).

## Installation & Use

1. Clone this repo
2. `cd` to the <samp>ddgc</samp> directory
3. Run `nmp install`
4. Run `nmp start`
5. Open a browser to <samp>localhost:3000</samp>
6. Click the buttons directly, tab to them and press a keyboard button,
   or plug in a controller and press the buttons

## Information

* Only one button press will be sent per second (as this system is
  intended for online games where visual feedback can take many seconds.)
* There are two indicators for this one-second timer. The first is a
  literal second hand in the lower right corner of the screen. The second
  is an orange highlight will appear around the button that was successfully
  sent to the server.
* Up to five of the latest "winning" button presses will be visible on the
  game screen at a time.
* As this system is intended for older, emulated games, analog buttons
  and directional controls will be considered binary (pressed or not).
  Additionally, all analog and digital directional controls are normalized
  to one set of cardinal directions.

## License

This software is available under the [MIT License](LICENSE).