// ===== Ludo King =====
// Color index: 0 Lal (bam-upor), 1 Sobuj (dan-upor), 2 Holud (dan-niche), 3 Nil (bam-niche)
const COL=['#e8202a','#12a83a','#ffd21f','#1e9bf0'],CN=['red','green','yellow','blue'];
const SEG=[[6,1,0,1,5],[5,6,-1,0,6],[0,7,0,1,2],[1,8,1,0,5],[6,9,0,1,6],[7,14,1,0,2],[8,13,0,-1,5],[9,8,1,0,6],[14,7,0,-1,2],[13,6,-1,0,5],[8,5,0,-1,6],[7,0,-1,0,2]];
const PATH=[];SEG.forEach(([r,c,dr,dc,k])=>{for(let i=0;i<k;i++)PATH.push([r+dr*i,c+dc*i])});
const HB=[[7,1,0,1],[1,7,1,0],[7,13,0,-1],[13,7,-1,0]],YB=[[0,0],[0,9],[9,9],[9,0]];
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const $=id=>document.getElementById(id),clone=o=>JSON.parse(JSON.stringify(o)),esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
let db,conn=0,mode='L',me=-1,base=null,code='',owned=0,N=4,TM=0,S,P={},TK,busy=0,seen=-1,rolling=0,prev=null,won=0,muted=0,AC,AN=0,CR={};   // CR: kon seat er crown ekbar dekhano hoye gese (rank soho)
const LV={0:1,1:1,2:1,3:1},RA={};let LAST=null;
let fbs=0,tl=0,fc=0,synced=0,syncing=0,lst=0,LN=2,LP=0;
const NMV=['Player 1','Player 2','Player 3','Player 4'],IMG={},SND={},rn=()=>1+Math.random()*6|0;

// ===== Asset loader (path system) =====
Object.entries(ASSETS.img).forEach(([k,p])=>{const i=new Image();i.onload=()=>{IMG[k]=p;if(k==='bg'){document.body.style.background='url('+p+') center/cover fixed';document.body.classList.add('hasbg')}};i.src=p});
Object.entries(ASSETS.snd).forEach(([k,p])=>{const L=[].concat(p),tr=i=>{if(i>=L.length)return;const a=new Audio();a.preload='auto';a.oncanplaythrough=()=>{SND[k]=a};a.onerror=()=>tr(i+1);a.src=L[i]};tr(0)});
Object.entries(ASSETS.font).forEach(([n,p])=>{try{new FontFace(n,'url('+p+')').load().then(f=>document.fonts.add(f)).catch(()=>{})}catch(e){}});

// ===== Sound: file thakle file, na thakle synth =====
function tn(f,d,ty,v,w,f2){const t=AC.currentTime+(w||0),o=AC.createOscillator(),g=AC.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d)}
function nz(d,f,q,v,w,ty){const t=AC.currentTime+(w||0),b=AC.createBuffer(1,AC.sampleRate*d|0,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;fl.type=ty||'bandpass';fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(AC.destination);s.start(t)}
const bell=(f,w,v)=>{tn(f,.5,'sine',v,w);tn(f*2.01,.3,'sine',v/3,w)};
const SY={
 ui:()=>{nz(.03,2500,2,.3);tn(600,.05,'sine',.15)},
 roll:()=>{let t=0;for(let i=0;i<12;i++){const v=.7-i*.04;nz(.05,1500+Math.random()*2500,3,v,t);tn(130+Math.random()*70,.07,'sine',v*.5,t,60);t+=.045+i*.011+Math.random()*.02}nz(.09,800,2,.9,t);tn(110,.14,'sine',.6,t,45)},
 step:()=>{tn(850,.06,'sine',.35,0,320);nz(.035,2200,2,.35)},
 out:()=>{tn(260,.14,'sine',.45,0,900);nz(.05,1500,2,.3)},
 cut:()=>{tn(560,.5,'sawtooth',.16,0,60);nz(.3,500,1,.6);tn(90,.25,'sine',.6,.05,40)},
 six:()=>{[880,1175,1568].forEach((f,i)=>bell(f,i*.08,.22))},
 home:()=>{[1047,1319,1568,2093].forEach((f,i)=>bell(f,i*.09,.2))},
 start:()=>{[523,659,784,1047,1319].forEach((f,i)=>bell(f,i*.1,.22))},
 win:()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>{bell(f,i*.17,.25);tn(f/2,.4,'triangle',.1,i*.17)})}};
function sfx(k){if(muted)return;const a=SND[k];if(a){const b=a.cloneNode();b.play().catch(()=>{});return}
 try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();SY[k]&&SY[k]()}catch(e){}}
function music(on){const a=SND.theme;if(!a)return;a.loop=true;a.volume=.45;if(on&&!muted){if(a.paused)a.play().catch(()=>{})}else a.pause()}
function mute(){muted=!muted;sv('muted',muted?1:0);uiS();if(muted)music(0);else if(document.body.dataset.s!=='game')music(1)}
document.addEventListener('click',e=>{if(e.target.closest('.gb,.nb,.bk,.sm,.hb.fn'))sfx('ui')});
document.addEventListener('pointerdown',()=>{const s=document.body.dataset.s;if(s!=='game'&&s!=='splash')music(1)});

// ===== Engine (pos: -1 yard, 0..50 path, 51..55 home column, 56 mukhe) =====
const init=(cs,ow,o={})=>{const n=cs.length,st=Math.max(0,cs.indexOf(o.first)),nmz=[];
 for(let k=0;k<n;k++)nmz[(st+k)%n]=(o.names&&o.names[k])||'Player '+(k+1);
 return {n,cs,ow,turn:st,ph:'r',d:0,ri:0,ls:st,win:-1,msg:'',team:!!o.team,fk:!!o.fk,nm:nmz,pos:cs.map(()=>[o.oto?0:-1,-1,-1,-1]),dr:cs.map(()=>0),rk:cs.map(()=>0),fp:cs.map(()=>[null,null,null,null])}};
function xy(col,p,t){
 if(p<0){const [a,b]=YB[col];return [a+(t<2?1.5:3.5),b+(t%2?3.5:1.5)]}
 if(p<=50)return PATH[(p+13*col)%52];
 const [r,c,dr,dc]=HB[col],k=p-51;return [r+dr*k,c+dc*k]}
const who=s=>s.team&&s.pos[s.turn].every(x=>x===56)?(s.turn+2)%4:s.turn;          // team mode: sob guti home hole partner er guti chale
const foe=(s,a,o)=>o!==a&&(!s.team||o%2!==a%2||s.fk);                               // team mate ke kate na (Friendly Kill off thakle)
// finish hoye gele (team chara) tar chal skip hoy
const adv=s=>{for(let i=0;i<s.n;i++){s.turn=(s.turn+1)%s.n;if(s.team||s.win>=0||!s.rk[s.turn])break}};
function movable(s){const r=[];s.pos[who(s)].forEach((p,t)=>{if(p<0?s.d===6:p+s.d<=56)r.push(t)});return r}
function afterRoll(s,d){s.ls=s.turn;s.dr[s.turn]=d===6?0:(s.dr[s.turn]||0)+1;s.d=d;s.ri++;s.msg='';if(movable(s).length)s.ph='m';else{s.ph='r';adv(s);s.msg='1'}}
function doMove(s,t){
 const q=who(s),col=s.cs[q];let p=s.pos[q][t],extra=s.d===6;
 p=p<0?0:p+s.d;s.pos[q][t]=p;if(s.fp&&s.fp[q])s.fp[q][t]=null;
 if(p<=50){const a=(p+13*col)%52;
  if(a%13&&a%13!==8)s.pos.forEach((arr,o)=>{if(foe(s,q,o))arr.forEach((x,u)=>{if(x>=0&&x<=50&&(x+13*s.cs[o])%52===a){arr[u]=-1;if(s.fp&&s.fp[o])s.fp[o][u]=null;extra=true}})})}
 if(p===56)extra=true;
 if(s.pos[q].every(x=>x===56)&&!s.rk[q]){s.rk[q]=Math.max(0,...s.rk)+1;   // crown: finish korar order (1,2,3)
  if(s.team?s.pos[(q+2)%4].every(x=>x===56):s.rk.filter(Boolean).length>=s.n-1){   // team: 2 jon-i finish / normal: 1 jon baki thakle match shesh
   if(!s.team){const l=s.rk.indexOf(0);if(l>=0)s.rk[l]=s.n;s.win=s.rk.indexOf(1)}else s.win=q}}
 s.ph='r';if(s.win>=0)return;if(!extra||(!s.team&&s.rk[s.turn]))adv(s)}

// ===== Dice: puro random (1-6 sobar chance soman, kono balance/bias nai) =====
const genDice=()=>rn();
// porer dice roll er somoy ekbar-i generate hoy, guti challe ar bodlay na.

// ===== Firebase data: rooms/<code>/{playerCount,matchStarted,teamMode,isLocalMatch,nextDice,players/player0../{name,color},gameState/{...}} =====
const enc=s=>{const tp={},rw={},fo={};s.cs.forEach((c,i)=>{tp[CN[c]]=s.pos[i];rw[CN[c]]=s.dr[i];(s.fp&&s.fp[i]||[]).forEach((f,t)=>{if(f)(fo[CN[c]]=fo[CN[c]]||{})[t]=f.join(',')})});
 const o={playerCount:s.n,seatColors:s.cs.map(c=>CN[c]),seatPlayerIndexes:s.ow,playerNames:s.nm,teamMode:!!s.team,friendlyKill:!!s.fk,currentTurnSeat:s.turn,phase:s.ph==='r'?'waitingForRoll':'waitingForMove',currentDice:s.d,rollCount:s.ri,lastRollerSeat:s.ls,winnerSeat:s.win,finishRank:s.rk,noMoveOnLastRoll:!!s.msg,tokenPositions:tp,rollsSinceLastSix:rw};if(Object.keys(fo).length)o.freePositions=fo;return o};
const dec=v=>{const cs=v.seatColors.map(c=>CN.indexOf(c));
 return {n:v.playerCount,cs,ow:v.seatPlayerIndexes,nm:v.playerNames||[],team:!!v.teamMode,fk:!!v.friendlyKill,turn:v.currentTurnSeat,ph:v.phase==='waitingForRoll'?'r':'m',d:v.currentDice,ri:v.rollCount,ls:v.lastRollerSeat,win:v.winnerSeat,rk:cs.map((_,i)=>(v.finishRank||[])[i]||0),msg:v.noMoveOnLastRoll?'1':'',pos:cs.map(c=>v.tokenPositions[CN[c]]),dr:cs.map(c=>(v.rollsSinceLastSix||{})[CN[c]]||0),fp:cs.map(c=>[0,1,2,3].map(t=>{const x=v.freePositions&&v.freePositions[CN[c]]&&v.freePositions[CN[c]][t];return x?String(x).split(',').map(Number):null}))}};

const nm=s=>S.nm[s]||t('c'+S.cs[s]);
const canAct=()=>S.win>=0?false:!AN&&(mode==='L'||S.ow[S.turn]===me);

// ===== Actions (dice: Firebase theke read, sathe sathe porer dice generate hoye write; move e nextDice bodlay na) =====
async function roll(c){
 if(busy||!canAct()||S.ph!=='r'||S.cs[S.turn]!==c)return;
 busy=1;setTimeout(()=>{busy=0},4000);
 const fbm=base&&(mode==='O'||(conn&&synced));let d;
 try{if(fbm)d=await Promise.race([base.child('nextDice').once('value').then(s=>s.val()),new Promise(r=>setTimeout(r,3000))])}catch(e){}
 if(!(d>=1&&d<=6))d=genDice();
 const N2=clone(S);afterRoll(N2,d);
 if(fbm)base.update({gameState:enc(N2),nextDice:genDice()});
 if(mode==='L'){S=N2;busy=0;show()}}
function move(t){
 if(!canAct()||S.ph!=='m'||!movable(S).includes(t))return;
 const N2=clone(S);doMove(N2,t);
 if(mode==='O')base.update({gameState:enc(N2)});
 else{S=N2;show();if(base&&conn&&synced)base.update({gameState:enc(N2)})}}

// ===== Screens =====
function sc(id){
 document.querySelectorAll('.scr').forEach(e=>e.classList.remove('on'));$('game').style.display=id==='game'?'block':'none';
 if(id!=='game')$(id).classList.add('on');document.body.dataset.s=id;
 if(id==='onl'){$('ob').style.display='';$('cr').classList.remove('on');$('jn').classList.remove('on');err()}}
const err=m=>{$('err').textContent=m||''};
function oSub(id){$('ob').style.display='none';$(id).classList.add('on')}
function oBack(){const o=$('cr').classList.contains('on')||$('jn').classList.contains('on');sc(o?'onl':'home')}
function exitG(){try{sessionStorage.setItem('bl_home','1')}catch(e){}location.reload()}

// ===== Pass N Play / Team Up setup (Ludo King style) =====
const pinI=c=>'<svg class="pi" viewBox="0 0 40 56" style="color:'+COL[c]+'"><use href="#pin"/></svg>';
const nrow=(c,i)=>'<div class="nr">'+pinI(c)+'<input value="'+esc(NMV[i])+'" maxlength="12" oninput="NMV['+i+']=this.value"><i class="rd" onclick="rnd('+i+',this)">🎲</i></div>';
function rnd(i,el){const L=['Rahim','Karim','Sumi','Tuli','Rony','Mim','Sajib','Nila'];NMV[i]=L[Math.random()*L.length|0];el.parentNode.querySelector('input').value=NMV[i]}
const BLK={2:[[3,1],[0,2]],3:[[3,0,1]],4:[[3,0,1,2]]};
function openL(){sc('lset');lN(LN)}
function lN(n){LN=n;LP=0;document.querySelectorAll('#lset .nb[data-n]').forEach(b=>b.classList.toggle('sel',+b.dataset.n===n));
 $('lrows').innerHTML=BLK[n].map((b,k)=>'<div class="blk'+(n===2&&k?' off':'')+'" onclick="selB('+k+')">'+(n===2?'<span class="ck'+(k?'':' on')+'">✔</span>':'')+'<div>'+b.map((c,i)=>nrow(c,i)).join('')+'</div></div>').join('')}
function selB(k){if(LN!==2)return;LP=k;document.querySelectorAll('.blk').forEach((e,i)=>{e.classList.toggle('off',i!==k);e.querySelector('.ck').classList.toggle('on',i===k)})}
function playLocal(oto){const b=BLK[LN][LN===2?LP:0];local([...b].sort((x,y)=>x-y),{first:b[0],names:NMV.slice(0,LN),oto})}
function openT(){sc('tset');
 const tm=(l,cl,a,b)=>'<div class="th"><span class="tg" style="background:'+cl+'">'+l+'</span><div style="flex:1">'+nrow(a,a===3?0:2)+nrow(b,b===3?0:2)+'</div></div>';
 $('trows').innerHTML='<div class="th"><span class="tg" style="background:#1e9bf0">'+t('ta')+'</span><div style="flex:1">'+nrow(3,0)+nrow(1,2)+'</div></div><div class="vs">VS</div><div class="th"><span class="tg" style="background:#e8202a">'+t('tb')+'</span><div style="flex:1">'+nrow(0,1)+nrow(2,3)+'</div></div>'}
function playTeam(oto){local([0,1,2,3],{first:3,names:NMV.slice(0,4),oto,team:1,fk:$('fk').checked})}

// ===== Board / UI =====
const PW=c=>IMG['pawn'+c]?'<img src="'+IMG['pawn'+c]+'">':'<svg viewBox="0 0 40 56" style="color:'+COL[c]+'"><use href="#pin"/></svg>';
const pn=(c,r)=>'<div class="pl'+(r?' r':'')+'" id="pl'+c+'"><div class="dbox">'+pinI(c)+'<button class="dsq" id="dc'+c+'" onclick="roll('+c+')"><div class="die" id="de'+c+'">'+'<i></i>'.repeat(9)+'</div></button></div><b class="ar">'+(r?'▶':'◀')+'</b></div>';
function goGame(){
 sc('game');music(0);sfx('start');
 $('top').innerHTML=pn(0)+pn(1,1);$('bot').innerHTML=pn(3)+pn(2,1);
 const AR={},cell={},GL=['→','↓','←','↑'];COL.forEach((_,j)=>AR[(50+13*j)%52]=j);
 PATH.forEach(([r,c],i)=>cell[r+','+c]={bg:i%13?'#fff':COL[i/13],t:i%13===8?'☆':AR[i]!=null?GL[AR[i]]:'',k:AR[i]!=null?COL[AR[i]]:'#444'});
 HB.forEach(([r,c,dr,dc],i)=>{for(let k=0;k<5;k++)cell[(r+dr*k)+','+(c+dc*k)]={bg:COL[i]}});
 let h='';
 for(let r=0;r<15;r++)for(let c=0;c<15;c++){
  const y=(r<6||r>8)&&(c<6||c>8),x=cell[r+','+c];
  h+='<div class="c" style="background:'+(y?'transparent':x?x.bg:'transparent')+(x&&x.k?';color:'+x.k:'')+'">'+((x&&x.t)||'')+'</div>'}
 for(let c=0;c<4;c++)h+='<div class="yd c'+c+'" id="yd'+c+'" style="--c:'+COL[c]+';left:'+(c==1||c==2?60:0)+'%;top:'+(c>1?60:0)+'%"><b></b>'+['26.3,26.3','59.7,26.3','26.3,59.7','59.7,59.7'].map(q=>'<i style="left:'+q.split(',')[0]+'%;top:'+q.split(',')[1]+'%"></i>').join('')+'<em class="yn" id="yn'+c+'"></em><u class="tb" id="tb'+c+'"></u><s class="cw" id="cw'+c+'"><svg viewBox="0 0 60 44"><use href="#crown"/></svg><b></b></s></div>';
 $('bd').insertAdjacentHTML('afterbegin',h);
 if(IMG.board){$('bd').classList.add('pg');$('bd').style.backgroundImage='url('+IMG.board+')'}
 $('ct').style.background='conic-gradient(from -45deg,'+COL[1]+' 0 90deg,'+COL[2]+' 90deg 180deg,'+COL[3]+' 180deg 270deg,'+COL[0]+' 270deg)';
 TK=S.pos.map((a,s)=>a.map((_,t)=>{const e=document.createElement('div');e.className='tk';e.innerHTML=PW(S.cs[s]);e.onclick=()=>{if(s===who(S))move(t)};$('bd').appendChild(e);return e}))}

function pips(c,v){const d=$('de'+c);d.style.display=v?'grid':'none';[...d.children].forEach((e,i)=>{e.style.opacity=v&&PIPS[v].includes(i)?1:0})}
function rollAnim(c,v,cb){const b=$('dc'+c);b.classList.add('rl');RA[c]=1;let k=0;const iv=setInterval(()=>{pips(c,rn());if(++k>10){clearInterval(iv);b.classList.remove('rl');RA[c]=0;LV[c]=v;pips(c,v);cb()}},85)}
function show(){
 if(S.ri!==seen){seen=S.ri;
  if(S.ri){const d=S.d;rolling=1;sfx('roll');rollAnim(S.cs[S.ls||0],d,()=>{rolling=0;if(d===6)sfx('six');draw()})}}
 if(!rolling)draw()}

// guti ekta ekta kore ghor e hop kore jay
function anim(s,t,a,b){
 const e=TK[s][t],col=S.cs[s],st=a<0?[0]:Array.from({length:b-a},(_,k)=>a+k+1);e.a=1;AN++;
 st.forEach((p,k)=>setTimeout(()=>{const [r,c]=xy(col,p,t);e.style.left=c*100/15+'%';e.style.top=r*100/15+'%';e.style.zIndex=50;
  e.classList.remove('hp');void e.offsetWidth;e.classList.add('hp');sfx(a<0?'out':'step')},k*190));
 setTimeout(()=>{e.a=0;AN--;e.classList.remove('hp');if(b===56)sfx('home');draw()},st.length*190+60)}

function draw(){
 if(prev){let md=0;const vs=[];
  S.pos.forEach((a,s)=>a.forEach((p,t)=>{const q=prev[s][t];if(p===q)return;if(p<0)vs.push([s,t]);else{anim(s,t,q,p);md=Math.max(md,(q<0?1:p-q)*190)}}));
  vs.forEach(([s,t])=>{const e=TK[s][t];e.a=1;AN++;setTimeout(()=>{e.a=0;AN--;sfx('cut');draw()},md+90)})}
 prev=clone(S.pos);
 if(S.win>=0&&!won){won=1;setTimeout(()=>{sfx('win');showRes()},1500)}
 const col=S.cs[S.turn],A=who(S),ca=canAct(),mv=ca&&S.ph==='m'?movable(S):[],tot={},ix={};
 const xs=S.pos.map((a,s)=>a.map((p,t)=>{const q=(S.fp&&S.fp[s]&&S.fp[s][t])||xy(S.cs[s],p,t);tot[q+'']=(tot[q+'']||0)+1;return q}));
 xs.forEach((a,s)=>a.forEach(([r,c],t)=>{
  const e=TK[s][t],m=s===A&&mv.includes(t);e.classList.toggle('mv',m);if(e.a)return;
  const k=r+','+c,i=ix[k]=(ix[k]||0)+1,n=tot[k],o=n>1?(i-1-(n-1)/2)*.22:0;
  e.style.left=(c+o)*100/15+'%';e.style.top=r*100/15+'%';e.style.zIndex=m?40:Math.round(r)+1}));
 [0,1,2,3].forEach(c=>{
  const s=S.cs.indexOf(c),p=$('pl'+c),tb=$('tb'+c);p.classList.toggle('hid',s<0);$('yn'+c).textContent=s<0?'':nm(s);
  tb.style.display=S.team&&s>=0?'flex':'none';tb.textContent=c%2?'A':'B';tb.style.background=COL[(c+2)%4];
  if(s<0)return;
  const r0=S.rk[s]||0,rk=r0&&(!AN||CR[s]===r0)?r0:0,cw=$('cw'+c);if(rk)CR[s]=rk;cw.style.display=rk?'flex':'none';cw.lastChild.textContent=rk||'';$('yd'+c).classList.toggle('rk',!!rk);p.classList.toggle('fin',!!rk&&!S.team);
  const on=s===S.turn&&S.win<0,go=on&&ca&&S.ph==='r';p.classList.toggle('off',!on);p.classList.toggle('go',go);$('dc'+c).disabled=!go;
  if(!RA[c])pips(c,LV[c])});
 $('st').style.borderColor=COL[col];
 $('st').textContent=S.win>=0?(S.team?t('twin',S.cs[S.win]%2?'A':'B'):t('win',nm(S.win))):(ca?nm(S.turn)+' — '+t(S.ph==='r'?'tap':'pick'):t('turn',nm(S.turn)))+(S.msg?' ('+t('nomove')+')':'')}

// ===== Storage + language =====
const ld=k=>{try{return localStorage.getItem('bl_'+k)}catch(e){return null}},sv=(k,v)=>{try{localStorage.setItem('bl_'+k,v)}catch(e){}};
let LANG=ld('lang')||'bn';muted=+ld('muted')||0;
const T={
bn:{cname:'রঙ ও নাম বাছাই করো',play:'খেলো',oto:'- এক গুটি বের -',ta:'টিম A',tb:'টিম B',fk:'ফ্রেন্ডলি কিল',set:'সেটিংস',lang:'ভাষা',snd:'সাউন্ড',on:'চালু',off:'বন্ধ',create:'রুম তৈরি করুন',join:'রুমে জয়েন করুন',yname:'তোমার নাম',rcode:'রুম কোড',mk:'রুম তৈরি করো',jn:'জয়েন করো',tmo:'টিম আপ (৪ জন)',p2:'২ জন',p3:'৩ জন',p4:'৪ জন',rc:'রুম কোড:',go:'ম্যাচ শুরু করো',wait:'অপেক্ষা করছি…',lw:'লিডার শুরু করলে ম্যাচ শুরু হবে',exitq:'সত্যিই ম্যাচ থেকে বের হবে?',yes:'হ্যাঁ, বের হও',no:'না, থাকো',tap:'ডাইসে ট্যাপ করো',pick:'গুটি চালাও',turn:'{n} এর চাল',nomove:'চাল নেই',win:'🏆 {n} জিতেছে!',twin:'🏆 টিম {n} জিতেছে!',noconn:'ইন্টারনেট/সার্ভার কানেক্ট হচ্ছে না',c5:'৫ অক্ষরের রুম কোড দাও',noroom:'রুম পাওয়া যায়নি',started:'ম্যাচ শুরু হয়ে গেছে',full:'রুম পূর্ণ',tapstart:'শুরু করতে ট্যাপ করো',c0:'লাল',c1:'সবুজ',c2:'হলুদ',c3:'নীল',cg:'অভিনন্দন!',won:'জিতেছে',lost:'হেরেছে',wn:'জয়',ls:'হার'},
en:{cname:'CHOOSE COLOR AND NAME',play:'Play',oto:'- One Token Out -',ta:'TEAM A',tb:'TEAM B',fk:'Friendly Kill',set:'Settings',lang:'Language',snd:'Sound',on:'On',off:'Off',create:'Create room',join:'Join room',yname:'Your name',rcode:'Room code',mk:'Create',jn:'Join',tmo:'Team Up (4 players)',p2:'2 Players',p3:'3 Players',p4:'4 Players',rc:'Room code:',go:'Start match',wait:'Waiting…',lw:'The match starts when the leader begins',exitq:'Really leave the match?',yes:'Yes, leave',no:'No, stay',tap:'Tap the dice',pick:'Move a piece',turn:"{n}'s turn",nomove:'No move',win:'🏆 {n} wins!',twin:'🏆 Team {n} wins!',noconn:'No internet / server connection',c5:'Enter the 5-letter room code',noroom:'Room not found',started:'Match already started',full:'Room is full',tapstart:'Tap to start',c0:'Red',c1:'Green',c2:'Yellow',c3:'Blue',cg:'Congratulations!',won:'Won',lost:'Lost',wn:'WIN',ls:'LOSE'}};
const t=(k,n)=>(T[LANG][k]||k).replace('{n}',n);
function uiS(){$('mu').textContent=muted?'🔇':'🔊';$('sb').textContent=t(muted?'off':'on')}
function applyLang(){
 document.documentElement.lang=LANG;
 document.querySelectorAll('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
 document.querySelectorAll('[data-p]').forEach(e=>e.placeholder=t(e.dataset.p));
 $('lbn').classList.toggle('sel',LANG==='bn');$('len').classList.toggle('sel',LANG==='en');uiS();
 if(S&&TK)draw();if($('lobby').classList.contains('on'))lobby();if($('tset').classList.contains('on'))openT()}
function setLang(l){LANG=l;sv('lang',l);applyLang()}

// ===== Firebase: SDK lazy load (local lib -> CDN) + network tick =====
const to=p=>Promise.race([p,new Promise((_,no)=>setTimeout(no,5000))]);
const loadScript=s=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=no;document.head.appendChild(e)});
async function loadFB(){
 if(fbs||firebaseConfig.apiKey.startsWith('YOUR'))return;fbs=1;tl=1;
 try{
  for(const L of navigator.onLine?[ASSETS.lib.local,ASSETS.lib.cdn]:[ASSETS.lib.local]){
   if(window.firebase&&firebase.database)break;
   try{for(const u of L)await loadScript(u)}catch(e){}}
  if(!(window.firebase&&firebase.database))throw 0;
  firebase.initializeApp(firebaseConfig);db=firebase.database();fbs=2;
  db.ref('.info/connected').on('value',s=>{fc=!!s.val();setConn()});
 }catch(e){fbs=0}}
function setConn(){const c=!!(fc&&navigator.onLine&&db);if(c&&!conn){conn=1;synced=0;syncL()}else if(!c){conn=0;synced=0}}
function tick(){setConn();if(!fbs&&(navigator.onLine||!tl))loadFB();if(conn&&mode==='L'&&S&&!synced&&!syncing)syncL()}

// ===== Local match: 3 digit key = Firebase child key. Net thakle online er moto Firebase er sathe two-way connected =====
const rc=()=>String(100+Math.random()*900|0);
async function syncL(){
 if(mode!=='L'||!S||!db||!conn||syncing)return;syncing=1;
 try{
  if(!owned){for(let i=0;i<30;i++){if(!(await to(db.ref('rooms/'+code).once('value'))).exists())break;code=rc()}owned=1;$('ck').textContent='#'+code}
  const b=db.ref('rooms/'+code);await to(b.update({playerCount:S.n,matchStarted:true,isLocalMatch:true,teamMode:!!S.team,nextDice:genDice(),gameState:enc(S)}));base=b;synced=1;
  if(!lst){lst=1;b.on('value',s=>{ // Firebase theke guti nora-chora korle local e o dekhabe
   if(mode!=='L'||!conn||!synced)return;const v=s.val();if(!v||!v.gameState)return;const ns=dec(v.gameState);
   if(JSON.stringify(enc(ns))!==JSON.stringify(enc(S))){S=ns;busy=0;show()}})}
 }catch(e){console.warn('sync',e)}
 syncing=0}
function local(cs,o){
 if(base){try{base.off()}catch(e){}}
 mode='L';me=-1;base=null;owned=0;synced=0;lst=0;code=rc();$('ck').textContent='#'+code;
 LAST={cs,o};S=init(cs,cs.map((_,i)=>i),o);goGame();show();tick()}

// ===== Online room (FRIENDS) =====
const dbOk=()=>{if(!db||!conn){err(t('noconn'));return false}err();return true};
async function create(){
 if(!dbOk())return;
 const tm=$('tm').checked,n=tm?4:+$('pn').value,A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',nme=$('nm1').value.trim()||'Player';
 let id;try{for(let i=0;i<20;i++){id=Array.from({length:5},()=>A[Math.random()*A.length|0]).join('');if(!(await db.ref('rooms/'+id).once('value')).exists())break}
  await db.ref('rooms/'+id).set({playerCount:n,matchStarted:false,teamMode:tm,nextDice:rn(),players:{player0:{name:nme,color:'red'}}});enter(id,0)}catch(e){err(e.message)}}
async function join(){
 if(!dbOk())return;
 const id=$('rid').value.trim().toUpperCase(),nme=$('nm2').value.trim()||'Player';
 if(id.length<5)return err(t('c5'));
 try{
  const snap=await db.ref('rooms/'+id).once('value');
  if(!snap.exists())return err(t('noroom'));
  if(snap.val().matchStarted)return err(t('started'));
  const n=snap.val().playerCount;let seat=-1;
  await db.ref('rooms/'+id+'/players').transaction(p=>{
   p=p||{};seat=-1;const used=Object.values(p).map(x=>x.color);
   for(let i=0;i<n;i++)if(!p['player'+i]){seat=i;p['player'+i]={name:nme,color:[0,2,1,3].map(x=>CN[x]).find(x=>!used.includes(x))};return p}
   return});
  if(seat<0)return err(t('full'));
  enter(id,seat);
 }catch(e){err(e.message)}}
function enter(id,seat){
 me=seat;mode='O';code=id;base=db.ref('rooms/'+id);$('ck').textContent=id;
 base.on('value',s=>{const v=s.val();if(!v)return;N=v.playerCount;TM=!!v.teamMode;P=v.players||{};
  if(v.matchStarted&&v.gameState){S=dec(v.gameState);busy=0;if(!TK)goGame();show()}else lobby()})}
function lobby(){
 sc('lobby');$('lc').textContent=code;const host=me===0;
 $('pls').innerHTML=Array.from({length:N},(_,i)=>{const p=P['player'+i],c=p?CN.indexOf(p.color):0;
  return p?'<div class="lp"><span class="dot" style="background:'+COL[c]+'"></span><b>'+esc(p.name)+(i?'':' ★')+'</b>'+(TM?'<em class="tg2">'+t(c%2?'ta':'tb')+'</em>':'')+(host?[0,1,2,3].map(x=>'<i class="sw" style="background:'+COL[x]+'" onclick="setc('+i+','+x+')"></i>').join(''):'')+'</div>':'<div class="lp off">'+t('wait')+'</div>'}).join('');
 $('go').style.display=host?'block':'none';$('go').disabled=Object.keys(P).length<N;
 $('wt').textContent=host?'':t('lw')}
function setc(i,c){ // shudhu leader color change korte pare
 if(me!==0)return;const j=Array.from({length:N},(_,k)=>k).find(k=>k!==i&&P['player'+k]&&P['player'+k].color===CN[c]),u={};
 u['players/player'+i+'/color']=CN[c];if(j!=null)u['players/player'+j+'/color']=P['player'+i].color;base.update(u)}
function start(){
 if(me!==0)return;const ps=Object.keys(P).map(k=>({i:+k.slice(6),c:CN.indexOf(P[k].color),n:P[k].name})).sort((a,b)=>a.c-b.c),cs=ps.map(p=>p.c),g=init(cs,ps.map(p=>p.i),{team:TM,first:cs[0]});
 g.nm=ps.map(p=>p.n);base.update({matchStarted:true,nextDice:genDice(),gameState:enc(g)})}

// ===== Match result + baji (fireworks) =====
function showRes(){
 const A=S.cs[S.win]%2,W=s=>S.team?S.cs[s]%2===A:S.rk[s]<S.n,
  o=S.cs.map((_,s)=>s).sort((a,b)=>(W(b)-W(a))||((S.rk[a]||99)-(S.rk[b]||99))),nw=o.filter(W).length,
  cr='<svg class="ci" viewBox="0 0 60 44"><use href="#crown"/></svg>';
 $('rrows').innerHTML=o.map((s,i)=>'<div class="rr'+(i?'':' g')+'">'+(S.rk[s]?cr:'<i class="ci"></i>')+pinI(S.cs[s])+'<b>'+esc(nm(s))+'</b><em>'+(i?t(W(s)?'won':'lost'):'🪙 +500')+'</em></div>').join('');
 $('rw').textContent=nw;$('rl').textContent=S.n-nw;
 const co=(+ld('coins')||2250)+500;sv('coins',co);$('co').textContent=co.toLocaleString();
 $('rep').style.display=mode==='O'?'none':'';$('rs').classList.add('on');fire()}
function replay(){if(!LAST)return;try{sessionStorage.setItem('bl_rp',JSON.stringify(LAST))}catch(e){}location.reload()}
function share(){const x=$('st').textContent+' — Ludo King';if(navigator.share)navigator.share({text:x}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(x)}
const FX={p:[],r:[],on:0};
function fire(){
 const cv=$('fx'),g=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;if(FX.on)return;FX.on=1;
 const launch=()=>FX.r.push({x:cv.width*(.1+Math.random()*.8),y:cv.height,vy:-cv.height*(.011+Math.random()*.004),ty:cv.height*(.1+Math.random()*.4),h:Math.random()*360});
 const boom=r=>{const n=70,sp=1.5+Math.random()*2.5;for(let i=0;i<n;i++){const a=6.283*i/n,s=sp*(.6+Math.random()*.8);FX.p.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h:r.h+Math.random()*50})}};
 for(let i=0;i<5;i++)setTimeout(launch,i*220);
 (function f(){
  g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,0,cv.width,cv.height);g.globalCompositeOperation='lighter';
  if(Math.random()<.08)launch();
  FX.r=FX.r.filter(r=>{r.y+=r.vy;g.fillStyle='hsl('+r.h+',100%,85%)';g.fillRect(r.x-1.5,r.y,3,16);if(r.y<=r.ty){boom(r);return false}return true});
  FX.p=FX.p.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.vx*=.985;p.l-=.011;g.fillStyle='hsla('+p.h+',100%,60%,'+Math.max(p.l,0)+')';g.beginPath();g.arc(p.x,p.y,2.3,0,6.3);g.fill();return p.l>0});
  requestAnimationFrame(f)})()}

// ===== Boot =====
applyLang();loadFB();
window.addEventListener('online',tick);window.addEventListener('offline',setConn);setInterval(tick,2500);
setTimeout(()=>$('tp').classList.add('show'),1700);
$('splash').onclick=()=>{if($('tp').classList.contains('show')){sc('home');music(1)}};
try{if(sessionStorage.getItem('bl_home')){sessionStorage.removeItem('bl_home');sc('home')}}catch(e){}

$('lg').innerHTML=$('logo').innerHTML;if(ld('coins'))$('co').textContent=(+ld('coins')).toLocaleString();
try{const R=sessionStorage.getItem('bl_rp');if(R){sessionStorage.removeItem('bl_rp');const r=JSON.parse(R);sc('home');local(r.cs,r.o)}}catch(e){}
