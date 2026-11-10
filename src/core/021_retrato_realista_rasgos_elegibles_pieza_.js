// ---------- retrato realista: rasgos elegibles pieza a pieza ----------
const HS_BODY={tupe:'corto',flequillo:'media',bob:'media',larga:'melena',ondas:'melena',trenzas:'coleta',twa:'corto',fade:'rapado',hightop:'rizos',cornrows:'rapado',boxbraids:'melena',locs:'melena',twists:'media',puffs:'mono',bantu:'rizos'};
const BEARD_BODY={completa:'corta',perilla:'corta',candado:'corta'};
const bodyHair=st=>HS_BODY[st]||st;
const bodyBeard=b=>BEARD_BODY[b]||b;
const HAIR_GROUPS=[['Lisos y ondulados',['corto','tupe','flequillo','media','bob','melena','larga','ondas','coleta','mono','trenzas']],
  ['Rizados y afro',['rizos','twa','afro','fade','hightop','puffs','bantu']],['Trenzas y locs',['cornrows','boxbraids','twists','locs']],['Sin pelo',['rapado','calvo']]];
const RF_OPTS={forma:{ovalada:'Ovalada',redonda:'Redonda',cuadrada:'Cuadrada',corazon:'Corazón',alargada:'Alargada'},
  estructura:{suave:'Suave',media:'Intermedia',marcada:'Marcada'},
  ojos:{almendra:'Almendrados',redondos:'Redondos',caidos:'Caídos',rasgados:'Rasgados',encapotados:'Encapotados'},
  nariz:{recta:'Recta',ancha:'Ancha',aguilena:'Aguileña',respingona:'Respingona',pequena:'Pequeña',chata:'Chata'},
  boca:{media:'Media',fina:'Fina',carnosa:'Carnosa',ancha:'Ancha',pequena:'Pequeña'},
  cejas:{natural:'Naturales',arqueada:'Arqueadas',recta:'Rectas',angulosa:'Angulosas',fruncida:'Fruncidas'},
  expresion:{neutra:'Neutra',sonrisa:'Sonriente',cansada:'Cansada',enfado:'Seria'}};
const RF_SLIDERS=[['tamOjos','Tamaño de ojos'],['sepOjos','Separación de ojos'],['grosorCejas','Grosor de cejas'],['tamNariz','Tamaño de nariz'],['labios','Grosor de labios'],['menton','Mentón'],['pomulos','Pómulos'],['orejas','Orejas']];
function randRF(ch){const r=seedRng((ch.faceSeed||'')+(ch.name||'')+(ch.skin||''));const P_=o=>{const k=Object.keys(o);return k[Math.floor(r()*k.length)];};const dark=['#9a623c','#6a3f25','#c68a5c'].includes(ch.skin);
  const f={forma:P_(RF_OPTS.forma),ojos:P_(RF_OPTS.ojos),nariz:dark&&r()<.5?'ancha':P_(RF_OPTS.nariz),boca:dark&&r()<.45?'carnosa':P_(RF_OPTS.boca),cejas:pickRR(r,['natural','natural','arqueada','recta','angulosa']),expresion:pickRR(r,['neutra','neutra','sonrisa','sonrisa','cansada']),
    tamOjos:.3+r()*.45,sepOjos:.3+r()*.4,grosorCejas:.25+r()*.6,tamNariz:.25+r()*.6,labios:.3+r()*.5+(dark?.15:0),menton:.25+r()*.5,pomulos:.3+r()*.5,orejas:.3+r()*.45};
  return {face:f,freck:r()<.14,mole:r()<.18?(r()<.5?'izq':'der'):null,makeup:ch.g==='f'&&r()<.4,earrings:r()<(ch.g==='m'?.12:.5)?(r()<.5?'aro':'bola'):null,gl:pickRR(r,['pasta','pasta','metal','redondas'])};}
function pickRR(r,a){return a[Math.floor(r()*a.length)];}
// caras de partidas antiguas: se traducen al nuevo motor para que sigan pareciéndose
function rfFromOld(F,ch){const b=randRF(ch);const m=(o,k,d)=>o[k]||d;
  b.face.forma=m({oval:'ovalada',redonda:'redonda',alargada:'alargada',cuadrada:'cuadrada',corazon:'corazon',pera:'cuadrada'},F.shape,b.face.forma);
  b.face.nariz=m({boton:'pequena',recta:'recta',grande:'recta',aguilena:'aguilena',ancha:'ancha',respingona:'respingona',patata:'chata'},F.nose,b.face.nariz);if(F.nose==='grande')b.face.tamNariz=.85;
  b.face.ojos=m({almendra:'almendra',redondos:'redondos',caidos:'caidos',pequenos:'almendra',grandes:'redondos'},F.eyes,b.face.ojos);if(F.eyes==='pequenos')b.face.tamOjos=.2;if(F.eyes==='grandes')b.face.tamOjos=.8;
  b.face.cejas=m({finas:'natural',normales:'natural',gruesas:'natural',arqueadas:'arqueada',rectas:'recta'},F.brow,b.face.cejas);if(F.brow==='finas')b.face.grosorCejas=.15;if(F.brow==='gruesas')b.face.grosorCejas=.9;
  b.face.boca=m({normal:'media',fina:'fina',carnosa:'carnosa',ancha:'ancha',pequena:'pequena'},F.mouth,b.face.boca);
  if(F.ears==='soplillo')b.face.orejas=.95;b.freck=!!F.freckles;b.mole=F.mole?'der':null;return b;}
function rfOf(ch){if(!ch.rf){ch.rf=ch.face&&ch.face.shape?rfFromOld(ch.face,ch):randRF(ch);}if(!ch.rf.face)ch.rf.face={};return ch.rf;}
function rfChar(ch,md,nobg){const R=rfOf(ch);const face={...R.face};
  if(md!=null){face.expresion=md>=74?'sonrisa':md<28?'cansada':R.face.expresion==='sonrisa'&&md<50?'neutra':R.face.expresion;}
  const age=ch.age||27;const grey=age>=58&&ch.hair!=='#bdbdbd'?ch.hair:null;
  return {g:ch.g,age,skin:ch.skin,hair:ch.hair,eyes:ch.eyes||'#3b2a20',shirt:ch.shirt||'#5b7fa6',hairStyle:ch.style||'corto',raya:ch.raya||(ch.name&&ch.name.length%3===0?'centro':ch.name&&ch.name.length%2?'izq':'der'),
    beard:ch.beard==='no'?null:ch.beard,glasses:ch.glasses?(R.gl||'pasta'):false,freck:R.freck,mole:R.mole,makeup:R.makeup,earrings:R.earrings,face,big:ch.build==='ancha',nobg,cuello:ch.g==='f'?'pico':null};}
function paintPortrait(c,ch,md=65,nobg){
  const x=c.getContext('2d'),k=c.width/100;x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,100,100);
  try{RF.draw(x,rfChar(ch,md,nobg));}catch(e){console.error(e);}
  x.setTransform(1,0,0,1,0,0);
}


function anaOpts(){
  const s=S.sim,m=mood();
  const c=CH();return {ch:c,shirt:c.shirt||s.shirt,mood:m,sad:m<30,front:anaRT.front,right:anaRT.right,pose:'stand',act:null};
}
function drawSim(){
  const s=S.sim; if(s.work>0) return;
  if(s.use&&ONOBJ.has(s.use.type)&&S.obj[s.use.i])return; // se dibuja sobre el objeto
  if(s.use&&s.use.seat!=null&&S.obj[s.use.seat])return; // sentada en una silla
  const [u,v]=w2v(s.x,s.y);
  const [bx,by]=P(u,v,0);
  const o=anaOpts();
  if(s.use&&s.use.type==='_suelo'){
    ctx.fillStyle='rgba(20,10,40,.2)';ctx.beginPath();ctx.ellipse(bx,by,14,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=CH().pants;ctx.beginPath();ctx.ellipse(bx-9,by-2,8,3.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=CH().shirt;ctx.beginPath();ctx.ellipse(bx+2,by-4,9,5,0,0,Math.PI*2);ctx.fill();
    circ(bx+13,by-6,6.5,CH().skin);ctx.fillStyle=CH().style==='calvo'?CH().skin:CH().hair;ctx.beginPath();ctx.arc(bx+14,by-7,7,Math.PI*1.1,Math.PI*2.1);ctx.fill();
    bubbleAt=[bx,by-30];return;
  }
  if(anaRT.moving)o.pose='walk';
  if(s.use&&ACTS[s.use.type])o.act=ACTS[s.use.type];
  if(s.use&&s.use.type==='_weed')o.act='dig';
  if(s.use&&s.use.type==='_build'){const st=S.job&&S.job.steps[s.use.j];o.act=st&&st.k==='paint'?'paint':'hammer';if(st&&st.k==='paint')o.paintCol=WALLCOLS[st.v][0];}
  const pp=anaRT.pop;if(pp&&pp.until>performance.now()&&/[⭐🎉]/.test(pp.e))o.act='cheer';
  const top=drawAna(bx,by,o);
  bubbleAt=[top[0],top[1]];
}
function drawBubble(){
  if(!bubbleAt)return;const s=S.sim;if(s.work>0)return;
  if(thought.txt&&performance.now()<thought.until&&!(anaRT.pop&&anaRT.pop.until>performance.now())){drawThought(bubbleAt[0],bubbleAt[1]);return;}
  let b=null;
  const pp=anaRT.pop,popOn=pp&&pp.until>performance.now()&&pp.until-performance.now()<=1800;
  if(popOn)b=pp.e;
  else if(s.use){b=useLabel(s.use).b;}
  else if(s.leaving)b='💼';
  else if(s.stuck&&!s.path.length)b='❓';
  else{const low=lowestNeed();if(low[1]<30)b=NEEDS.find(n=>n[0]===low[0])[1];}
  if(!b)return;
  const tt=performance.now()/1000,[bx,by0]=bubbleAt,yy=by0-14+Math.sin(tt*3)*2;
  const pop=popOn?1+Math.min(1,Math.max(0,(pp.until-performance.now()-1500)/300))*0.4:1;
  ctx.save();ctx.translate(bx,yy);ctx.scale(pop,pop);
  ctx.fillStyle='rgba(0,0,0,.12)';roundRect(-15,-12,30,26,10);ctx.fill();
  ctx.fillStyle='#fff';roundRect(-15,-14,30,26,10);ctx.fill();ctx.beginPath();ctx.moveTo(-4,11);ctx.lineTo(0,18);ctx.lineTo(4,11);ctx.fill();
  emoji(b,0,-1,17);
  if(s.use&&s.use.type==='_build'){const k=Math.min(1,s.use.t/s.use.dur);ctx.fillStyle='rgba(0,0,0,.25)';roundRect(-16,20,32,5,2.5);ctx.fill();ctx.fillStyle='#5cc98a';roundRect(-16,20,32*k,5,2.5);ctx.fill();}
  ctx.restore();
}
function drawNPC(){
  const n=S.npc;if(!n)return;const [u,v]=w2v(n.x,n.y);const [bx,by]=P(u,v,0);
  let front=n.front,right=n.right,act=null,pc=null;
  if(n.work){const st=S.job&&S.job.steps[n.work.j];if(st){const [a,b]=w2v(st.i%N+.5,(st.i/N|0)+.5);const du=a-u,dv=b-v;right=du-dv>0;front=du+dv>-.01;act=st.k==='paint'?'paint':'hammer';if(st.k==='paint')pc=WALLCOLS[st.v][0];}}
  const saved=anaRT.phase;anaRT.phase=n.phase||0;
  const top=drawAna(bx,by,{shirt:'#f4a261',skin:'#b57a4a',hair:'#2b2b2b',helmet:true,vest:true,mood:70,front,right,pose:n.path.length?'walk':'stand',act,paintCol:pc});
  anaRT.phase=saved;
  label('👷 '+n.name,top[0],top[1]-2,'rgba(244,162,97,.95)','#fff',9);
  if(n.work){const k=Math.min(1,n.work.t/n.work.dur);ctx.fillStyle='rgba(0,0,0,.25)';roundRect(top[0]-16,top[1]+8,32,5,2.5);ctx.fill();ctx.fillStyle='#f6c90e';roundRect(top[0]-16,top[1]+8,32*k,5,2.5);ctx.fill();}
}
function drawBox(vx,vy){prism(vx+.22,vy+.22,vx+.78,vy+.78,0,20,'#c89b6d');poly([P(vx+.47,vy+.22,20.1),P(vx+.53,vy+.22,20.1),P(vx+.53,vy+.78,20.1),P(vx+.47,vy+.78,20.1)],'#ead7ab');faceY(vx+.3,vx+.5,vy+.78,8,13,'#a77b52');}

