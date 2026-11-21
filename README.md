# Ludo King

Chalate: `index.html` browser e kholo. Local (PASS N PLAY) game internet charai cholbe.

- js/firebase-config.js -> tomar Firebase config (update er somoy ei file bodlano hoy na)
- js/config.js -> shob asset er path (PNG, sound, font, lib). theme.mp3 / start.mp3 dile age oita use hobe, na hole .wav
- assets/img: bg.png, pawn_red/green/yellow/blue.png | assets/sound: theme, start, dice_roll, step, pawn_out, capture, six, home, win, ui
- lib/ -> offline Firebase SDK (lib/README.txt dekho)

Firebase Rules (test): {"rules":{"rooms":{".read":true,".write":true}}}
Data: rooms/<code>/{playerCount, matchStarted, isLocalMatch, nextDice, players/player0../{name,color}, gameState/{...}}
nextDice shudhu dice dewar somoy generate hoy, guti chalale bodlay na.

## Sound / theme
- assets/sound/theme.mp3 (menu music, loop) ar start.mp3 (match shuru hole) nijer file diye bodlano jay. mp3 thakle oita agey use hoy, na thakle .wav.
- Match shuru hole start sound baje ar theme band hoye jay.

## Local match + Firebase
Net thakle local match o rooms/<3 digit key> e write hoy ar Firebase theke guti nora-chora korle local e dekhay. Net gele locally cholte thake, net ashle abar sync hoy.
nextDice shudhu dice roll er somoy ekbar generate hoy, guti challe bodlay na.
