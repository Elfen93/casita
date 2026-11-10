// =================== ESCENAS: los sitios a los que va Ana ===================
let viewPlace=false,placeAuto=true,savedCam=null,sceneKey=null;
function awayKey(){const s=S.sim;if(!(s.work>0)||!s.dest)return null;const tot=s.awayTotal||s.work,el=tot-s.work,tr=Math.min(20,tot/3);
  if(s.dest!=='_ride'&&s.dest!=='comisaria'&&(el<tr||s.work<tr))return '_calle';
  if(s.outingActive==='piquete')return '_piquete';return s.dest;}
function sceneAct(){const s=S.sim;return s.outingActive||'work';}
// primitivas
const sBox=(x0,y0,x1,y1,z0,z1,c)=>prismG(x0,y0,x1,y1,z0,z1,c);
function sFloor(W,D,col,tile){prism(0,0,W,D,-22,0,'#6d5c4a');topQuad(0,0,W,D,0,col);if(tile){ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){const a=P(k,0),b=P(k,D);ctx.moveTo(...a);ctx.lineTo(...b);}for(let k=1;k<D;k++){const a=P(0,k),b=P(W,k);ctx.moveTo(...a);ctx.lineTo(...b);}ctx.stroke();}}
function sWalls(W,D,h,col,night,win=true){sBox(0,-.15,W,0,0,h,col);sBox(-.15,-.15,0,D,0,h,shade(col,.95));
  if(win)for(let k=1;k<W-.5;k+=2.2)poly([P(k,0,h*.35),P(k+1.2,0,h*.35),P(k+1.2,0,h*.8),P(k,0,h*.8)],night>.5?'#2c3558':'#bfe3f7');
  poly([P(0,0,0),P(W,0,0),P(W,0,6),P(0,0,6)],shade(col,.85));}
const sTop=(x0,y0,x1,y1,z,c)=>topQuad(x0,y0,x1,y1,z,c);
function sPoster(x,z,col,txt,onX){const pts=onX?[P(0,x,z),P(0,x+1,z),P(0,x+1,z+14),P(0,x,z+14)]:[P(x,0,z),P(x+1,0,z),P(x+1,0,z+14),P(x,0,z+14)];poly(pts,col);if(txt){const [a,b]=onX?P(0,x+.5,z+7):P(x+.5,0,z+7);emoji(txt,a,b,10);}}
function sBanner(x0,x1,z,txt){poly([P(x0,0,z),P(x1,0,z),P(x1,0,z+11),P(x0,0,z+11)],'#fffdf8');const [a,b]=P((x0+x1)/2,0,z+5.5);ctx.save();ctx.fillStyle='#d1242f';ctx.font='900 8px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(a,b);ctx.transform(1,0.5,0,1,0,0);ctx.fillText(txt,0,0);ctx.restore();}
function sChair(x,y,c='#8a6a4a'){sBox(x+.3,y+.3,x+.7,y+.7,0,9,c);sBox(x+.3,y+.25,x+.7,y+.33,9,20,shade(c,.9));}
function sTable(x,y,c='#a0754c'){cyl(x+.5,y+.5,.08,0,15,'#3b3f46');cyl(x+.5,y+.5,.42,15,17,c,shade(c,1.1));}
function sDesk(x,y,c='#d9d2c3'){sBox(x+.05,y+.15,x+.95,y+.85,12,15,c);sBox(x+.1,y+.2,x+.15,y+.8,0,12,'#3b3f46');sBox(x+.85,y+.2,x+.9,y+.8,0,12,'#3b3f46');sBox(x+.35,y+.2,x+.75,y+.3,15,27,'#2b2b33');poly([P(.37+x,.3+y,17),P(.73+x,.3+y,17),P(.73+x,.3+y,26),P(.37+x,.3+y,26)],'#7cc8f0');}
function sShelf(x,y,len,dirX,t){for(let k=0;k<len;k++){const a=dirX?x+k:x,b=dirX?y:y+k;sBox(a,b,a+1,b+.6,0,36,'#c9c3b8');for(let z=6;z<34;z+=8)for(let j=0;j<4;j++){const c=['#e85d3f','#5bc0be','#f0ad4e','#9b5de5','#00bb7f','#f4f1ea'][(k*3+j+z)%6];sBox(a+.05+j*.23,b+.45,a+.24+j*.23,b+.6,z,z+6,t==='libros'?['#8c4b5a','#3a5a8c','#5a7a3a','#a0754c'][(j+k+z)%4]:c);}}}
function sCaja(x,y){sBox(x,y,x+2,y+.8,0,16,'#e8e2d4');sBox(x+.1,y+.1,x+1.4,y+.7,16,17,'#2b2b33');sBox(x+1.5,y+.15,x+1.9,y+.65,16,26,'#3b3f46');poly([P(x+1.55,y+.65,20),P(x+1.85,y+.65,20),P(x+1.85,y+.65,25),P(x+1.55,y+.65,25)],'#7cf0a8');}
function sBed(x,y){sBox(x,y,x+1,y+2,0,12,'#e9e6df');sBox(x+.05,y+.05,x+.95,y+.5,12,15,'#fffdf8');sBox(x+.05,y+.6,x+.95,y+1.95,12,14,'#9fb4c8');}
function sArm(x,y,c='#7a8c6e'){sBox(x+.1,y+.1,x+.9,y+.9,0,11,c);sBox(x+.1,y+.1,x+.9,y+.3,11,24,shade(c,.9));sBox(x+.1,y+.1,x+.25,y+.9,11,16,shade(c,.95));sBox(x+.75,y+.1,x+.9,y+.9,11,16,shade(c,.95));}
function sPew(x,y,len){sBox(x,y+.3,x+len,y+.7,0,10,'#7a5230');sBox(x,y+.2,x+len,y+.32,10,22,'#6b4a2e');}
function sTree(x,y){const [px,py]=P(x,y);const se=seasonOf();capsule(px,py,px,py-22,4,'#6b4a2e');if(se==='inv'){capsule(px,py-20,px-7,py-32,2,'#6b4a2e');capsule(px,py-20,px+8,py-30,2,'#6b4a2e');return;}
  const c={pri:['#5cae4c','#7fcf6a'],ver:['#3f8a3a','#58ac4e'],oto:['#c9702e','#e3a53a']}[se];circ(px,py-34,16,c[0]);circ(px-8,py-30,11,c[1]);circ(px+9,py-28,10,c[1]);}
function sBench(x,y){sBox(x,y+.3,x+1.6,y+.7,0,9,'#8a6a4a');sBox(x,y+.2,x+1.6,y+.3,9,18,'#7a5a3a');}
function sScaffold(x,y,w,h){for(const a of [x,x+w])for(const b of [y,y+.8])sBox(a,b,a+.08,b+.08,0,h,'#8a8f98');for(let z=20;z<=h;z+=20)sBox(x,y,x+w,y+.8,z-2,z,'#b08850');}
function sBricks(x,y){for(let k=0;k<3;k++)sBox(x,y,x+.8,y+.5,k*5,k*5+5,k%2?'#b5543c':'#c8654a');}
function sBoxes(x,y){sBox(x,y,x+.6,y+.6,15,24,'#c8a46a');sBox(x+.1,y+.1,x+.5,y+.5,24,30,'#d6b47a');}
// gente
const NPCS=()=>WALKERS.map(w=>w.ch);
function sPerson(x,y,ch,o={}){const [px,py]=P(x,y);const old=anaRT.phase;anaRT.phase=o.ph??0;drawAna(px,py+(o.pose==='sit'?-4:0),{ch,shirt:o.shirt||ch.shirt,mood:o.mood??60,front:o.front??true,right:o.right??true,pose:o.pose||'stand',act:o.act||null,sad:o.sad,helmet:o.helmet,vest:o.vest});anaRT.phase=old;
  if(o.prop){emoji(o.prop,px+8,py-44,11);}if(o.name){ctx.save();ctx.globalAlpha=.85;label(o.name,px,py-64,'rgba(255,253,248,.92)','#3b3247',8);ctx.restore();}}
const elder=k=>({...NPCS()[k%12],hair:'#d6d6d6',style:k%2?'corto':'mono',glasses:true});
// cada escena devuelve {W,D,items[], ana:{x,y,...}, out?, floor, wall}
function buildScene(key,tt,night){
  const act=sceneAct(),w=W_(),npc=NPCS(),it=[],add=(x,y,f)=>it.push({d:x+y,f});let ana={x:3,y:3,pose:'stand',act:null,front:true,right:true};let W=9,D=7,floor='#e9e6df',wall='#f4f1ea',out=false,tile=true,decor=null;
  const cp=P_('compi');
  switch(key){
  case 'super':{W=10;D=7;wall='#f4f1ea';decor=()=>{sShelf(1,.2,8,true);};
    for(let k=0;k<3;k++){const cx=1.5+k*2.8;add(cx+1,4,()=>sCaja(cx,4));}
    ana={x:2.2,y:5.3,pose:'stand',act:'type',front:false,right:true};
    add(4.6,5.3,()=>sPerson(4.6,5.3,npc[3],{act:'type',front:false,name:cp?cp.n:null}));add(7.4,5.3,()=>sPerson(7.4,5.3,npc[6],{act:'type',front:false}));
    const q=2+Math.round(w.crisis/30);for(let k=0;k<q;k++)add(3.2+(k%3)*2.8,3.2-Math.floor(k/3)*.8,()=>sPerson(3.2+(k%3)*2.8,3.2-Math.floor(k/3)*.8,npc[(k+5)%12],{front:true,right:false,prop:k%2?'🛒':null}));
    break;}
  case 'bar':{W=8;D=6;floor='#b08850';wall='#e8d5b5';tile=false;decor=()=>{sShelf(1,.2,3,true);sPoster(5,30,'#d1242f','🍺');};
    add(4,1.8,()=>{sBox(.8,1.4,4.8,2.1,0,17,'#7a5230');sBox(.7,1.35,4.9,2.15,17,19,'#a0754c');});
    for(const [tx,ty] of [[5.6,3.6],[2.5,4.2],[5.4,5]]){add(tx+.5,ty+.5,()=>sTable(tx,ty));}
    if(act==='work'){ana={x:2.6,y:.95,pose:'stand',act:'stir',front:true,right:true};}
    else{ana={x:2.2,y:4.4,pose:'sit',act:act==='eat'?'eat':'talk',front:true,right:true};const f=P_('amiga');if(act==='amigos')add(3.4,4.6,()=>sPerson(3.4,4.6,npc[4],{pose:'sit',act:'talk',front:true,right:false,name:f?f.n:null}));}
    add(6.3,3.8,()=>sPerson(6.3,3.8,npc[1],{pose:'sit',act:'talk',right:false}));add(5.3,4.8,()=>sPerson(5.3,4.8,npc[7],{pose:'sit',act:'eat'}));
    if(act!=='work')add(2.8,.95,()=>sPerson(2.8,.95,npc[9],{act:'stir'}));
    break;}
  case 'torre':{W=9;D=7;floor='#c9ccd4';wall='#e7ecf2';
    if(act==='networking'){for(let k=0;k<4;k++){const x=2+k*1.8,y=3+(k%2);add(x+.5,y+.5,()=>sTable(x,y,'#e7ecf2'));}ana={x:3.2,y:4.6,act:'talk'};for(let k=0;k<6;k++){const x=1.5+k*1.2,y=2.5+(k%3);add(x,y,()=>sPerson(x,y,npc[k],{act:k%2?'talk':null,prop:'🥂',right:k%2===0}));}}
    else{for(let r=0;r<2;r++)for(let c=0;c<3;c++){const x=1.2+c*2.6,y=1.8+r*2.6;add(x+.5,y+.5,()=>sDesk(x,y));add(x+.5,y+1.4,()=>sChair(x,y+.9,'#3b3f46'));if(!(r===1&&c===0))add(x+.5,y+1.3,()=>sPerson(x+.5,y+1.3,npc[(r*3+c)%12],{pose:'sit',act:'type',front:false,right:false,name:r===0&&c===1&&cp?cp.n:null}));}
      ana={x:1.7,y:5.7,pose:'sit',act:'type',front:false,right:false};}
    break;}
  case 'obra':{W=9;D=7;floor='#a08a6a';wall='#bdb6aa';tile=false;decor=()=>{sScaffold(1,.3,6,60);};
    add(6.5,4.5,()=>{cyl(6.5,4.5,.5,6,22,'#f0ad4e','#e0901e');});add(2,5.3,()=>sBricks(1.6,5));add(7.6,2.6,()=>sBricks(7.2,2.3));
    ana={x:3.5,y:3.6,act:'hammer',helmet:true,vest:true};add(5.2,2.8,()=>sPerson(5.2,2.8,npc[2],{act:'hammer',helmet:true,vest:true,name:cp?cp.n:null}));add(6.8,5.8,()=>sPerson(6.8,5.8,npc[8],{helmet:true,vest:true,act:'dig'}));
    break;}
  case 'residencia':{W=9;D=7;floor='#e4ddd0';wall='#f1e3d3';decor=()=>{sPoster(3,28,'#9fb4c8','🌻');};
    for(let k=0;k<4;k++){const x=1.2+k*1.9,y=2.2;add(x+.5,y+.5,()=>{sArm(x,y);sPerson(x+.5,y+.6,elder(k),{pose:'sit',mood:k===2?30:60,sad:k===2});});}
    add(2,5,()=>sBed(1.2,4.6));ana={x:3.6,y:3.6,act:'talk',front:true,right:false};add(6.5,4.2,()=>sPerson(6.5,4.2,npc[5],{act:'talk',name:cp?cp.n:null}));
    break;}
  case 'ayto':{
    if(act==='manifestacion'){out=true;W=10;D=8;floor='#cfc6b4';tile=false;decor=()=>{sBox(0,-.2,W,0,0,90,'#e7dcc2');for(let k=1;k<W;k+=2)poly([P(k,0,30),P(k+1,0,30),P(k+1,0,60),P(k,0,60)],night>.5?'#ffe08a':'#9fb4c8');sBanner(2,8,70,(W_().manif&&W_().manif.cause||'').toUpperCase());};
      const n=10+Math.round(w.mov/5);for(let k=0;k<n;k++){const x=1+(k*1.37)%8,y=2+((k*2.11)%5);add(x,y,()=>sPerson(x,y,npc[k%12],{act:k%3?'cheer':null,ph:tt*3+k,prop:k%4===0?(isI('conservadora','liberal','libertaria')?'🇪🇸':'🚩'):k%5===0?'📣':null}));}
      ana={x:5,y:6.2,act:'cheer',prop:'🪧'};if(W_().gov==='conservador'||W_().era==='represion')add(9,7,()=>{sBox(8.2,6.6,9.8,7.6,0,22,'#2b3a5a');const [a,b]=P(9,7,26);emoji('🚨',a,b,12);});break;}
    W=9;D=7;floor='#d8d2c4';wall='#efe6d2';decor=()=>{sPoster(6,30,'#e9c46a','🏛️');};
    if(act==='militancia'){add(4.5,3.5,()=>{sBox(2,3,7,4,0,15,'#a0754c');});for(let k=0;k<6;k++){const x=2.4+k*.8,y=k%2?2.5:4.4;add(x,y,()=>sPerson(x,y,npc[k],{pose:'sit',act:k===2?'talk':null,front:k%2===1,right:k%2===0}));}ana={x:4.6,y:4.4,pose:'sit',act:'talk',front:false,right:false};}
    else{add(4.5,3,()=>{sBox(1,2.6,8,3.2,0,22,'#c9c3b8');});for(let k=0;k<3;k++){const x=1.6+k*2.3;add(x,2.2,()=>sPerson(x,2.2,npc[k+3],{pose:'sit',act:'type',front:true}));add(x,4.4,()=>sPerson(x,4.4,npc[k+6],{front:false,right:false}));}ana={x:3.9,y:2.2,pose:'sit',act:'type',front:true};}
    break;}
  case 'sindicato':case 'ateneo':{W=8;D=7;floor=key==='ateneo'?'#c9b48a':'#d8d2c4';wall=key==='ateneo'?'#e3d3e6':'#ecd9d2';tile=key!=='ateneo';
    decor=()=>{sPoster(1,30,'#d1242f','✊');sPoster(3,30,key==='ateneo'?'#2b2b2b':'#e9c46a',key==='ateneo'?'🏴':'📢');sPoster(5.5,30,'#7a6fd0','📅');if(W_().mov>40)sBanner(1,7,50,key==='ateneo'?'APOYO MUTUO':'UNIDAD');};
    add(4,1.6,()=>sBox(2.5,1.2,5.5,1.9,0,15,'#a0754c'));
    const size=key==='sindicato'?4+Math.round((office().org||0)/12):4+Math.round(w.mov/10);const speak=S.pol.inf>=45;
    for(let k=0;k<Math.min(16,size);k++){const x=1.4+(k%5)*1.3,y=3.2+Math.floor(k/5)*1.1;add(x,y,()=>{sChair(x-.5,y-.3,'#3b3f46');sPerson(x,y,npc[k%12],{pose:'sit',front:false,right:false,act:k===1&&!speak?'talk':null});});}
    if(speak)ana={x:4,y:1.1,act:'talk',front:true,right:true};else{ana={x:1.4+3*1.3,y:3.2+1.1,pose:'sit',act:'talk',front:false,right:false};add(4,1.1,()=>sPerson(4,1.1,npc[10],{act:'talk'}));}
    break;}
  case 'parroquia':{W=8;D=8;floor='#c9b48a';wall='#e6dcc4';tile=false;decor=()=>{sBox(3,.1,5,.9,0,20,'#f4f1ea');const [a,b]=P(4,.5,40);emoji('✝️',a,b,16);poly([P(1,0,40),P(2,0,40),P(2,0,64),P(1,0,64)],'#c4568f');poly([P(6,0,40),P(7,0,40),P(7,0,64),P(6,0,64)],'#4f6fd1');};
    if(act==='voluntariado'){add(4,3,()=>{sBox(1.5,2.6,6.5,3.4,0,15,'#a0754c');for(let k=0;k<4;k++)sBoxes(1.8+k*1.2,2.7);});ana={x:3,y:2.2,act:'stir',front:true};const q=3+Math.round(w.crisis/15);for(let k=0;k<q;k++)add(2+k*.7,4.3+(k%2)*.5,()=>sPerson(2+k*.7,4.3+(k%2)*.5,npc[k%12],{front:false,right:false}));}
    else{for(let r=0;r<4;r++){add(4,2.4+r*1.3,()=>sPew(1.2,2+r*1.3,5.6));for(let k=0;k<(r%2?3:2);k++){const x=1.8+k*1.6+r*.3,y=2.3+r*1.3;add(x,y+.01,()=>sPerson(x,y,elder(k+r),{pose:'sit',front:false,right:false}));}}ana={x:5.6,y:3.6,pose:'sit',front:false,right:false};add(4,1.4,()=>sPerson(4,1.4,{...npc[0],shirt:'#1d1714',hair:'#bdbdbd'},{act:'talk'}));}
    break;}
  case 'comedor':{W=8;D=7;wall='#dfe7d9';decor=()=>{sPoster(1,30,'#2f8a5a','🥫');};
    add(4,2.4,()=>{sBox(1.2,2,6.8,2.8,0,15,'#c9c3b8');for(let k=0;k<5;k++)sBoxes(1.4+k*1.1,2.1);});
    const q=3+Math.round(w.crisis/10);for(let k=0;k<q;k++){const x=1.4+(k%6)*1,y=3.8+Math.floor(k/6)*.8;add(x,y,()=>sPerson(x,y,npc[(k+2)%12],{front:false,right:false,mood:40}));}
    if(act==='comedor'){ana={x:6.5,y:5.6,pose:'stand',act:'eat',front:false,right:false};add(2.4,1.6,()=>sPerson(2.4,1.6,npc[0],{act:'stir'}));}else{ana={x:3.5,y:1.6,act:'stir',front:true};add(5.5,1.6,()=>sPerson(5.5,1.6,npc[11],{act:'stir'}));}
    break;}
  case 'parque':{out=true;W=10;D=8;floor=shade(LAWN,.95);tile=false;decor=()=>{};
    for(const [x,y] of [[1,1],[8.5,1.5],[1.5,6.5],[9,6.8],[5,.8]])add(x,y,()=>sTree(x,y));add(5,4,()=>{cyl(5,4,1,0,6,'#c9c3b8','#7cc8f0');});add(2.5,3.6,()=>sBench(2,3.4));
    if(act==='deporte'){const a=tt*0.6;const x=5+Math.cos(a)*3.2,y=4+Math.sin(a)*2.6;ana={x,y,pose:'walk',walkPh:tt*12,front:Math.sin(a)<0?false:true,right:Math.cos(a+Math.PI/2)>0};}
    else{ana={x:2.6,y:3.9,pose:'sit',act:'talk',front:true};const f=P_('amiga');add(3.3,3.9,()=>sPerson(3.3,3.9,npc[4],{pose:'sit',act:'talk',right:false,name:f?f.n:null}));}
    for(let k=0;k<3;k++){const a=tt*0.4+k*2.1;const x=5+Math.cos(a)*3.6,y=4+Math.sin(a)*3;add(x,y,()=>sPerson(x,y,npc[k+6],{pose:'walk',ph:tt*8+k,front:Math.sin(a)<0?false:true,right:Math.cos(a+Math.PI/2)>0}));}
    break;}
  case 'biblioteca':{W=8;D=7;floor='#c9b48a';wall='#e7e0d0';tile=false;decor=()=>{sShelf(.5,.2,7,true,'libros');};
    for(const [x,y] of [[1.5,3],[4.5,3],[1.5,5],[4.5,5]])add(x+1,y+.5,()=>{sBox(x,y,x+2,y+.9,12,15,'#a0754c');sBox(x+.1,y+.1,x+.2,y+.8,0,12,'#6b4a2e');sBox(x+1.8,y+.1,x+1.9,y+.8,0,12,'#6b4a2e');});
    ana={x:2.2,y:4.2,pose:'sit',act:'book',front:false,right:false};add(5.3,4.2,()=>sPerson(5.3,4.2,npc[6],{pose:'sit',act:'book',front:false,right:false}));add(2,6.2,()=>sPerson(2,6.2,npc[9],{pose:'sit',act:'type',front:false}));
    break;}
  case 'sala':{W=8;D=7;floor='#3b2f3a';wall='#4a3040';tile=false;decor=()=>{for(let k=0;k<4;k++){const [a,b]=P(1+k*2,.1,70);ctx.fillStyle=['rgba(255,80,120,.25)','rgba(80,160,255,.25)','rgba(255,220,80,.25)','rgba(140,255,160,.25)'][(k+Math.floor(tt*2))%4];ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a-30,b+90);ctx.lineTo(a+30,b+90);ctx.fill();}};
    add(4,1.5,()=>sBox(1,.4,7,2.4,0,10,'#2b2026'));
    if(act==='work'){ana={x:4,y:1.4,act:'strum',front:true,right:true,z:10};for(let k=0;k<5+Math.round((S.career||0)*4);k++){const x=1.4+(k%6)*1,y=3.5+Math.floor(k/6)*1;add(x,y,()=>sPerson(x,y,npc[k%12],{act:k%2?'cheer':null,front:false,right:false,ph:tt*4+k}));}}
    else{add(4,1.4,()=>{const [a,b]=P(4,1.4);sPerson(4,1.4-.0,npc[10],{act:'strum'});});ana={x:3,y:4.4,act:'cheer',front:false,right:false};for(let k=0;k<7;k++){const x=1.4+(k%5)*1.2,y=3.6+Math.floor(k/5)*1.4;add(x,y,()=>sPerson(x,y,npc[k%12],{act:k%3?'cheer':null,front:false,right:false,ph:tt*4+k}));}}
    break;}
  case 'comisaria':{W=6;D=5;floor='#b9bec6';wall='#d9dde3';decor=()=>{};
    add(3,2.5,()=>{sBox(1,1,4.5,3.6,0,1,'#a9aeb6');sBox(1.4,1.2,3.6,1.8,0,9,'#7a7f88');});ana={x:2.4,y:1.9,pose:'sit',sad:true,front:true};
    add(5,4,()=>{for(let k=0;k<7;k++){const a=P(1+k*.55,3.6),b=P(1+k*.55,3.6,48);capsule(a[0],a[1],b[0],b[1],1.6,'#3b3f46');}const a=P(1,3.6,48),b=P(4.6,3.6,48);capsule(a[0],a[1],b[0],b[1],2,'#3b3f46');});
    break;}
  case 'coop':{W=9;D=7;floor='#c9c3b8';wall='#eadfae';decor=()=>{sPoster(2,30,'#e9c46a','🐝');sPoster(5,30,'#2f8a5a','🤝');};
    for(let k=0;k<3;k++){const x=1.2+k*2.6;add(x+1,2.4,()=>{sBox(x,2,x+2,2.8,0,15,'#a0754c');sBox(x+.2,2.1,x+.6,2.5,15,20,'#5f6670');});add(x+1,3.4,()=>sPerson(x+1,3.4,npc[k+2],{act:'hammer',front:false,right:false}));}
    ana={x:5,y:5.2,act:'talk',front:false,right:false};
    break;}
  case 'tienda':{W=7;D=5;wall='#e9eef2';decor=()=>{sShelf(.5,.2,6,true);};add(3.5,2.4,()=>sBox(1.5,2,5.5,2.7,0,16,'#a0754c'));
    ana={x:3,y:1.6,act:'talk',front:true};const c=Math.max(0,3-Math.round(w.crisis/30));for(let k=0;k<c;k++)add(2+k*1.4,3.6,()=>sPerson(2+k*1.4,3.6,npc[k+4],{front:false,right:false}));break;}
  case '_piquete':{out=true;W=9;D=6;floor='#cfc6b4';tile=false;const wk=destOf('work');const pl=PLACES[wk]||{c:'#e8e2d4',n:'el trabajo'};
    decor=()=>{sBox(0,-.2,W,0,0,70,pl.c);poly([P(3.5,0,0),P(5.5,0,0),P(5.5,0,30),P(3.5,0,30)],'#5f6670');sBanner(1,8,40,'¡EN HUELGA!');};
    for(let k=0;k<8;k++){const x=1+k*.95,y=2.6+(k%2)*.6;add(x,y,()=>sPerson(x,y,npc[k],{act:'cheer',ph:tt*3+k,prop:k%2?'🪧':null}));}ana={x:4.6,y:3.8,act:'cheer',prop:'📣'};break;}
  case '_calle':{out=true;W=12;D=4;floor='#d8d2c4';tile=false;const s=S.sim;const tot=s.awayTotal||s.work,el=tot-s.work,tr=Math.min(20,tot/3);const f=el<tr?el/tr:1-s.work/tr,back=el>=tr;
    decor=()=>{for(let k=0;k<6;k++){const x=k*2;sBox(x,-.4,x+2,0,0,60+(k%3)*20,['#e8b7a0','#c9d8b6','#b9c6d8','#efe9dc','#d8c3dc','#e9d27a'][k]);for(let z=12;z<60;z+=16)poly([P(x+.4,0,z),P(x+1.6,0,z),P(x+1.6,0,z+9),P(x+.4,0,z+9)],night>.5?'#ffe08a':'#9fc4dc');}
      topQuad(0,2.6,W,D,0.05,'#5d6168');};
    const x=back?11-f*10:1+f*10;ana={x,y:1.6,pose:'walk',walkPh:tt*9,front:true,right:!back};
    for(let k=0;k<4;k++){const a=(tt*0.5*(k%2?1:-1)+k*3)%12,xx=((a%12)+12)%12;add(xx,1+((k%2)*.9),()=>sPerson(xx,1+((k%2)*.9),npc[k+3],{pose:'walk',ph:tt*7+k,right:k%2===0}));}
    const cx=((tt*2.4)%16)-2;add(cx,3.3,()=>{sBox(cx-.7,3,cx+.7,3.6,2,9,'#d9534f');sBox(cx-.4,3.05,cx+.4,3.55,9,14,'#e66a66');});
    break;}
  case '_ride':{out=true;W=12;D=4;floor='#d8d2c4';tile=false;decor=()=>{for(let k=0;k<6;k++){const x=k*2;sBox(x,-.4,x+2,0,0,60+(k%3)*20,['#e8b7a0','#c9d8b6','#b9c6d8','#efe9dc','#d8c3dc','#e9d27a'][k]);}topQuad(0,1.8,W,D,0.05,'#5d6168');};
    const x=((tt*1.8)%14)-1;ana={x,y:2.8,pose:'walk',walkPh:tt*3,front:true,right:true,prop:'🛵'};
    const cx=((tt*1.2+6)%16)-2;add(cx,3.4,()=>{sBox(cx-.7,3.1,cx+.7,3.7,2,9,'#3b3f46');});break;}
  default:{W=6;D=5;}
  }
  return {W,D,floor,wall,out,tile,decor,items:it,ana};
}
function drawScene(key,tt,night){
  const sc=buildScene(key,tt,night);
  sFloor(sc.W,sc.D,sc.floor,sc.tile);
  if(!sc.out)sWalls(sc.W,sc.D,70,sc.wall,night);
  if(sc.decor)sc.decor();
  const a=sc.ana;sc.items.push({d:a.x+a.y,f:()=>{const [px,py]=P(a.x,a.y,a.z||0);const old=anaRT.phase;if(a.walkPh!=null)anaRT.phase=a.walkPh;const o={...anaOpts(),pose:a.pose||'stand',act:a.act,front:a.front??true,right:a.right??true,helmet:a.helmet,vest:a.vest};if(a.sad)o.mood=20;
    if(a.pose==='sit'&&!a.noChair){}drawAna(px,py+(a.pose==='sit'?-4:0),o);anaRT.phase=old;if(a.prop)emoji(a.prop,px+(a.prop==='🛵'?4:9),py-(a.prop==='🛵'?4:46),a.prop==='🛵'?20:13);
    ctx.save();label(CH().name,px,py-70,'#ff8a5b','#fff',9);ctx.restore();bubbleAt=[px,py-58];}});
  sc.items.sort((p,q)=>p.d-q.d);for(const x of sc.items)x.f();
  return sc;
}
function sceneTitle(key){const act=sceneAct();if(key==='_calle')return (S.sim.awayTotal||0)-S.sim.work<20?`De camino: ${placeName(S.sim.dest)}`:'Volviendo a casa';if(key==='_ride')return 'Repartiendo por la ciudad';if(key==='_piquete')return `Piquete en ${placeName(destOf('work'))}`;
  if(act==='work')return `Trabajando: ${placeName(key)}`;return `${OUT[act]?OUT[act].e+' '+outName(act)+' · ':''}${placeName(key)}`;}
function placeName(k){if(k==='_ride')return 'reparto';const p=PLACES[k];if(!p)return 'fuera';if(k==='tienda'&&S.track==='negocio')return 'Tu tienda';if(k==='torre'&&S.office&&['oficina','tech'].includes(S.track))return S.office.n;if(['super','bar','obra','residencia','sala','coop'].includes(k)&&S.office&&destOf('work')===k)return S.office.n;return p.n;}
function enterScene(){if(viewPlace)return;viewPlace=true;savedCam={x:cam.x,y:cam.y,z:cam.z};sceneKey=null;}
function leaveScene(){if(!viewPlace)return;viewPlace=false;if(savedCam){cam.x=savedCam.x;cam.y=savedCam.y;cam.z=savedCam.z;}sceneKey=null;}
function sceneCam(sc,key){if(sceneKey===key)return;sceneKey=key;const [cx,cy]=P(sc.W/2,sc.D/2,30);cam.z=Math.max(0.6,Math.min(1.6,W/((sc.W+sc.D)*TW/2+80)));cam.x=W/2-cx*cam.z;cam.y=H*0.5-cy*cam.z;}
