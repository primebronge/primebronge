// ===== Firebase config (tomar project er) =====
const firebaseConfig = {
  apiKey: "AIzaSyCOGlJGLE-0QH4cr0mTk6kfT0A519QkwY4",
  authDomain: "app-store-sck.firebaseapp.com",
  databaseURL: "https://app-store-sck-default-rtdb.firebaseio.com",
  projectId: "app-store-sck",
  storageBucket: "app-store-sck.appspot.com",
  messagingSenderId: "515743484540",
  appId: "1:515743484540:web:b5cd4bbf48074383a257f9",
  measurementId: "G-809GT91F6B"
};

// ===== Shob asset er path. Sound: age .mp3, na thakle .wav. File na thakle built-in use hoy =====
const snd=n=>['assets/sound/'+n+'.mp3','assets/sound/'+n+'.wav'];
const ASSETS={
 img:{bg:'assets/img/bg.png',board:'assets/img/board.png',
  pawn0:'assets/img/pin_red.png',pawn1:'assets/img/pin_green.png',pawn2:'assets/img/pin_yellow.png',pawn3:'assets/img/pin_blue.png'},
 snd:{theme:snd('theme'),start:snd('start'),ui:snd('ui'),roll:snd('dice_roll'),step:snd('step'),out:snd('pawn_out'),cut:snd('capture'),six:snd('six'),home:snd('home'),win:snd('win')},
 lib:{local:['lib/firebase-app-compat.js','lib/firebase-database-compat.js'],
  cdn:['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js']},
 font:{LudoFont:'assets/fonts/LilitaOne-Regular.ttf',BnFont:'assets/fonts/NotoSansBengali-Regular.ttf'}};
