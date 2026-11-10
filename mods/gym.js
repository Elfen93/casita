// =================== GIMNASIOS: el low cost de nave y el club bueno con piscina; y el local político con Lenin en la pared ===================
PLACES.gym={n:'FitBarrio 24h',e:'🏋️',r:[-12,23,-6,25],h:30,c:'#2b2b33',acc:'#b5ff3a',d:'Nave con máquinas, espejos y nadie que te explique nada. Barato. Permanencia de un año.',outs:['gimnasio']};
PLACES.gymbueno={n:'Club Aqua',e:'🏊',r:[34,-12,40,-5],h:34,c:'#dfe8ec',glass:1,d:'Piscina climatizada, clases dirigidas, toallas que huelen a suavizante. Cuota de quien puede.',outs:['gimnasio']};
{const _d=destOf;destOf=function(k){if(k==='gimnasio'){const H=typeof HP==='function'?HP():null;return H&&H.gymGood?'gymbueno':'gym';}if(k==='calistenia')return 'parque';return _d.apply(this,arguments);};}
// ---- helpers comunes ----
const gH=i=>Math.abs(hash(i));
function gTreadmill(x,y,on,tt){sBox(x,y,x+.55,y+1.5,0,4,'#2a2a30');sBox(x+.05,y+.1,x+.5,y+1.4,4,5.5,'#3c3c44');sBox(x+.05,y,x+.12,y+.08,0,34,'#8a8f98');sBox(x+.43,y,x+.5,y+.08,0,34,'#8a8f98');sBox(x+.02,y-.05,x+.53,y+.12,34,37,'#3c3c44');poly([P(x+.08,y+.02,37),P(x+.47,y+.02,37),P(x+.47,y+.02,47),P(x+.08,y+.02,47)],on?'#7cd0ff':'#1c1c22');
  if(on){const o=(tt*2.2)%.4;for(let k=0;k<3;k++){const yy=y+.2+((k*.4+o)%1.2);sTop(x+.08,yy,x+.47,yy+.04,5.6,'#55555f');}}}
function gRack(x,y,len){sBox(x,y,x+len,y+.45,0,8,'#3b3f46');sBox(x,y,x+len,y+.45,24,30,'#3b3f46');for(let k=0;k<len*3;k++){const xx=x+.12+k*.33;for(const z of [8,30]){cyl(xx,y+.12,.07,z,z+5,'#1d1d22','#2a2a30');cyl(xx,y+.33,.07,z,z+5,'#1d1d22','#2a2a30');}}}
function gBench(x,y){sBox(x+.1,y,x+.45,y+1.3,0,2,'#3b3f46');sBox(x+.05,y,x+.5,y+1.3,10,14,'#8b1e2a');sBox(x+.15,y+.15,x+.2,y+1.15,2,10,'#8a8f98');sBox(x+.35,y+.15,x+.4,y+1.15,2,10,'#8a8f98');
  sBox(x-.15,y+.2,x-.1,y+.3,0,28,'#8a8f98');sBox(x+.65,y+.2,x+.7,y+.3,0,28,'#8a8f98');capsule(...P(x-.22,y+.25,28),...P(x+.77,y+.25,28),2.2,'#6b6f78');for(const xx of [x-.2,x+.75])cyl(xx,y+.25,.14,25,31,'#1d1d22','#2a2a30');}
function gMirror(x0,x1,z0,z1){poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],'#9fb4c8');poly([P(x0+.05,0,z0+2),P(x1-.05,0,z0+2),P(x1-.05,0,z1-2),P(x0+.05,0,z1-2)],'#c3d5e2');poly([P(x0+.1,0,z0+4),P(x0+.5,0,z0+4),P(x0+.3,0,z1-4),P(x0+.1,0,z1-4)],'rgba(255,255,255,.35)');}
function gNeon(x,z,txt,col,sz){const [a,b]=P(x,0,z);ctx.save();ctx.translate(a,b);ctx.transform(1,.5,0,1,0,0);ctx.shadowColor=col;ctx.shadowBlur=10;ctx.fillStyle=col;ctx.font=`900 ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,0,0);ctx.restore();}
function gText(x,y,z,txt,col,sz,onX){const [a,b]=onX?P(0,y,z):P(x,0,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.fillStyle=col;ctx.font=`900 ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,0,0);ctx.restore();}
function gLifter(x,y,ch,tt,k,o={}){const ph=(tt*1.6+k)%2;const up=ph<1;sPerson(x,y,ch,{pose:'stand',act:up?'cheer':null,front:o.front??true,right:o.right??true,shirt:o.shirt||'#2b2b33'});
  const [a,b]=P(x,y);const z=up?-58:-38;capsule(a-13,b+z,a+13,b+z,2,'#4a4e57');cyl(x-.18,y,.09,up?56:36,up?62:42,'#1d1d22','#2a2a30');cyl(x+.18,y,.09,up?56:36,up?62:42,'#1d1d22','#2a2a30');}
// ---- escena: gym low cost ----
SCENES['gym']=function(E){const {tt,night,npc,cp}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const W=11,D=8,WH=66;const h=S.t/60;const busy=h<8?.35:h<11?.7:h<17?.3:h<21.5?1:h<23.5?.5:.15;
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#3a3a42');topQuad(0,0,W,D,0,'#2e2e35');ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    // zona de suelo de goma negro y la de "funcional" con césped artificial
    topQuad(7.2,4.5,W,D,.2,'#4f8a46');for(let k=0;k<8;k++)sTop(7.2,4.5+k*.45,W,4.52+k*.45,.3,'#5aa04f');
    sBox(0,-.15,W,0,0,WH,'#3a3a42');sBox(-.15,-.15,0,D,0,WH,'#333339');
    // espejos en toda la pared del fondo; franja de neón
    gMirror(.3,10.7,6,46);poly([P(0,0,46),P(W,0,46),P(W,0,47.5),P(0,0,47.5)],'#b5ff3a');
    // pared izquierda: logo, normas, máquina de bebidas
    poly([P(0,.3,30),P(0,3.3,30),P(0,3.3,56),P(0,.3,56)],'#1f1f25');gText(0,1.8,47,'FITBARRIO',"#b5ff3a",9,true);gText(0,1.8,38,'24 h · sin excusas',"#dfe3e8",4.5,true);
    poly([P(0,3.8,22),P(0,5.6,22),P(0,5.6,44),P(0,3.8,44)],'#efe9dc');gText(0,4.7,38,'NORMAS',"#2b2b33",4,true);for(let k=0;k<4;k++)gText(0,4.7,34-k*3.2,['Trae toalla','Deja el peso en su sitio','No grites','Permanencia: 12 meses'][k],'#555',2.4,true);
    // máquina de bebidas
    sBox(0,6.2,.7,7.1,0,44,'#c0262d');poly([P(.7,6.3,8),P(.7,7.0,8),P(.7,7.0,36),P(.7,6.3,36)],night>.5?'#ffd98a':'#f4f1ea');};
  const decor=()=>{gNeon(5.5,56,'FITBARRIO',"#b5ff3a",11);gNeon(5.5,50.5,'low cost · 24h',"#7cd0ff",5);
    // tele con noticias/deporte en la esquina
    poly([P(9.3,0,50),P(10.8,0,50),P(10.8,0,60),P(9.3,0,60)],'#111');poly([P(9.4,0,51),P(10.7,0,51),P(10.7,0,59),P(9.4,0,59)],(Math.floor(tt*2)%2)?'#355':'#246');};
  // cintas al fondo mirando al espejo
  const ns=NPCS();const who=k=>ns[(k*5+3)%ns.length];
  for(let k=0;k<5;k++){const x=.7+k*1.1,y=.4;const on=busy>.3&&gH(k+Math.floor(S.day/2))<busy;add(x+.3,y+1.5,()=>{gTreadmill(x,y,on,tt);if(on)sPerson(x+.27,y+1.05,who(k),{pose:'walk',walkPh:tt*7+k,front:false,right:k%2===0,shirt:['#e85d3f','#5bc0be','#f0ad4e','#9b5de5','#eee'][k]});});}
  // racks de mancuernas y bancos
  add(.2,3.2,()=>gRack(.2,2.9,3));add(5,7.6,()=>gRack(4.6,7.3,4));
  for(let k=0;k<3;k++){const x=1.2+k*1.8,y=4.6;const on=gH(k*3+S.day)<busy*.8;add(x+.5,y+1.3,()=>{gBench(x,y);if(on)sPerson(x+.28,y+.65,who(k+7),{pose:'sit',act:'cheer',front:true,right:true,shirt:['#2b2b33','#5bc0be','#e85d3f'][k]});});}
  // zona funcional: kettlebells, balón, esterillas
  add(8.2,5.2,()=>{for(let k=0;k<3;k++)cyl(7.7+k*.5,5.1,.14,0,8,'#1d1d22','#2a2a30');cyl(9.6,6.6,.3,0,18,'#c0262d','#d8333c');sTop(8.0,6.8,9.2,7.6,.4,'#6a4fa0');sTop(9.6,5.0,10.6,5.8,.4,'#2b7fb0');});
  if(busy>.5)add(8.6,7.2,()=>sPerson(8.6,7.2,who(11),{pose:'stand',act:'cheer',front:true,right:false,shirt:'#f0ad4e'}));
  // el que vende batidos / el mostrador sin nadie
  add(10.2,1.4,()=>{sBox(9.6,.9,10.9,1.5,0,20,'#1f1f25');sBox(9.6,.9,10.9,1.5,20,21.5,'#b5ff3a');for(let k=0;k<4;k++)cyl(9.8+k*.27,1.15,.06,21.5,30,['#fff','#f0ad4e','#e85d3f','#5bc0be'][k],'#fff');if(h>=10&&h<20)sPerson(10.25,.45,{...who(2),style:'rapado'},{pose:'stand',act:'phone',front:true,right:false,shirt:'#b5ff3a'});});
  // Ana: alterna cinta, banco y pesas
  const ph=(tt*.5)%3;let ana;
  if(ph<1)ana={x:3.9,y:1.45,pose:'walk',walkPh:tt*7,front:false,right:true,act:null};
  else if(ph<2)ana={x:6.6,y:5.1,pose:'stand',act:((tt*1.6)%2<1)?'cheer':null,front:true,right:false};
  else ana={x:5.2,y:3.4,pose:'stand',act:((tt*1.3)%2<1)?'cheer':null,front:true,right:true};
  if(ph<1)add(3.9,1.5,()=>{gTreadmill(3.6,.4,true,tt);});
  const after=()=>{if(night>.4){const [a,b]=P(5.5,0,58);const g=ctx.createRadialGradient(a,b,0,a,b,160);g.addColorStop(0,'rgba(181,255,58,.10)');g.addColorStop(1,'rgba(181,255,58,0)');ctx.fillStyle=g;ctx.fillRect(a-200,b-80,400,240);}};
  return {W,D,floor:'#2e2e35',wall:'#3a3a42',out:false,tile:false,drawBase,decor,items:it,ana,after};};
// ---- escena: club bueno con piscina ----
SCENES['gymbueno']=function(E){const {tt,night,npc}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const W=12,D=9,WH=70;const h=S.t/60;const busy=h<8?.4:h<12?.6:h<17?.35:h<21?.9:.3;
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#8a7a66');topQuad(0,0,W,D,0,'#d8c9a8');ctx.strokeStyle='rgba(90,60,30,.12)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<D*3;k++){ctx.moveTo(...P(0,k/3));ctx.lineTo(...P(W,k/3));}ctx.stroke();
    // piscina: hueco azul con corcheras
    topQuad(.6,4.2,6.6,8.6,.05,'#9fc9d8');topQuad(.8,4.4,6.4,8.4,-6,'#2f8fbf');for(let k=0;k<30;k++){const x=.9+gH(k*3)*5.3,y=4.5+gH(k*7+1)*3.7;const w=Math.sin(tt*2+k)*.5+.5;isoEll(x,y,-5.5,.12+w*.1,'rgba(255,255,255,'+(.15+w*.2)+')');}
    for(const y of [5.5,6.6,7.7]){for(let k=0;k<14;k++)cyl(.9+k*.4,y,.05,-5.8,-4.6,k%2?'#e85d3f':'#fffdf8','#fff');}
    sBox(.6,4.2,6.6,4.35,0,1.5,'#c9c3b8');sBox(.6,8.45,6.6,8.6,0,1.5,'#c9c3b8');sBox(.6,4.2,.75,8.6,0,1.5,'#c9c3b8');sBox(6.45,4.2,6.6,8.6,0,1.5,'#c9c3b8');
    // escalerilla
    for(const x of [6.1,6.3])sBox(x,8.1,x+.04,8.14,-6,8,'#c0c6cc');
    sBox(0,-.15,W,0,0,WH,'#eef3f5');sBox(-.15,-.15,0,D,0,WH,'#e2eaee');
    // cristalera al fondo
    for(let x0=.4;x0<W-1;x0+=2.4){const x1=x0+2;poly([P(x0,0,10),P(x1,0,10),P(x1,0,58),P(x0,0,58)],night>.5?'#1f2742':'#bfe3f7');poly([P(x0+.2,0,12),P(x0+.7,0,12),P(x0+.5,0,56),P(x0+.2,0,56)],'rgba(255,255,255,.3)');poly([P(x0-.06,0,10),P(x0+.06,0,10),P(x0+.06,0,58),P(x0-.06,0,58)],'#8fa3b8');}
    poly([P(0,0,58),P(W,0,58),P(W,0,61),P(0,0,61)],'#2b7fb0');
    // pared izquierda: logo y vestuarios/sauna
    poly([P(0,.3,36),P(0,3.2,36),P(0,3.2,58),P(0,.3,58)],'#2b7fb0');gText(0,1.75,50,'CLUB AQUA',"#fff",9,true);gText(0,1.75,42,'wellness · fitness · spa',"#cfe8f5",4,true);
    poly([P(0,3.8,0),P(0,5.2,0),P(0,5.2,46),P(0,3.8,46)],'#c9b48a');gText(0,4.5,50,'SAUNA',"#8a6a4a",4.5,true);poly([P(0,5.8,0),P(0,7.2,0),P(0,7.2,46),P(0,5.8,46)],'#c9b48a');gText(0,6.5,50,'VESTUARIOS',"#8a6a4a",4,true);};
  const decor=()=>{gText(6,0,66,'CLUB AQUA',"#2b7fb0",10,false);};
  const ns=NPCS();const who=k=>ns[(k*7+1)%ns.length];
  // recepción con plantas y toallas
  add(10.4,1.2,()=>{sBox(9.4,.6,11.5,1.3,0,20,'#fffdf8');sBox(9.4,.6,11.5,1.3,20,21.5,'#2b7fb0');for(let k=0;k<3;k++)sBox(9.6+k*.5,.75,10.0+k*.5,1.15,21.5,26,'#fff');cyl(11.3,.95,.14,0,9,'#b5543c','#c27458');const [a,b]=P(11.3,.95,9);for(let k=0;k<5;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k)*5,b-8-Math.abs(Math.sin(k))*4,4,2.4,k,0,7);ctx.fill();}
    if(h>=7&&h<22)sPerson(10.4,.2,{...who(4),style:'coleta'},{pose:'stand',act:'type',front:true,right:false,shirt:'#2b7fb0'});});
  // cintas y elípticas buenas (más separadas) mirando la cristalera
  for(let k=0;k<4;k++){const x=7.2+k*1.15,y=.5;const on=gH(k+S.day)<busy;add(x+.3,y+1.5,()=>{gTreadmill(x,y,on,tt);if(on)sPerson(x+.27,y+1.05,who(k),{pose:'walk',walkPh:tt*6+k,front:false,right:true,shirt:['#fff','#5bc0be','#f0ad4e','#9b5de5'][k]});});}
  // clase dirigida: esterillas y monitora con micro
  const cls=(h>=18&&h<21)||(h>=10&&h<12);
  for(let k=0;k<6;k++){const x=7.4+(k%3)*1.3,y=4.8+Math.floor(k/3)*1.6;add(x+.5,y+.6,()=>{sTop(x,y,x+1.1,y+.6,.3,['#6a4fa0','#2b7fb0','#e85d3f'][k%3]);if(cls&&gH(k*2+S.day)<busy)sPerson(x+.55,y+.3,who(k+3),{pose:'sit',act:'cheer',front:true,right:k%2===0,shirt:'#fff'});});}
  if(cls)add(9.0,7.9,()=>sPerson(9.0,7.9,{...who(9),style:'coleta'},{pose:'stand',act:((tt*2)%2<1)?'cheer':'talk',front:false,right:true,shirt:'#e85d3f',prop:'🎧'}));
  // nadadores
  for(let k=0;k<3;k++){const ln=5.0+k*1.1;const on=gH(k*5+S.day)<busy*.9;if(!on)continue;add(3.5,ln,()=>{const t=(tt*.25+k*.3)%2;const x=1.2+(t<1?t:2-t)*4.8;isoEll(x,ln,-5.5,.3,'rgba(255,255,255,.5)');const [a,b]=P(x,ln,-5);circ(a,b-6,4,who(k+5).skin||'#c68a5c');circ(a,b-9,3.5,'#e85d3f');capsule(a-8,b-4,a+8,b-4,3,'rgba(240,120,80,.6)');});}
  // socorrista en silla alta
  add(.6,6.4,()=>{sBox(.15,6.2,.5,6.7,0,30,'#c9c3b8');sBox(.1,6.15,.55,6.75,30,33,'#e85d3f');sPerson(.33,6.45,who(8),{pose:'sit',act:'phone',front:true,right:true,shirt:'#e85d3f'});const [a,b]=P(.33,6.45,33);emoji('🛟',a+14,b-40,10);});
  // Ana: nada, o hace clase, o cinta
  const ph=(tt*.4)%3;let ana;
  if(ph<1){ana={x:3.4,y:3.85,pose:'stand',act:((tt*1.2)%2<1)?'cheer':null,front:true,right:true};const t=(tt*.3)%2;const x=1.2+(t<1?t:2-t)*4.8;add(x,6.1,()=>{isoEll(x,6.1,-5.5,.32,'rgba(255,255,255,.55)');const [a,b]=P(x,6.1,-5);circ(a,b-6,4.5,'#c68a5c');circ(a,b-9.5,3.8,'#2b7fb0');capsule(a-9,b-4,a+9,b-4,3.2,'rgba(240,160,120,.7)');});}
  else if(ph<2)ana={x:8.0,y:6.9,pose:'sit',act:((tt*1.4)%2<1)?'cheer':null,front:true,right:true};
  else ana={x:8.65,y:1.55,pose:'walk',walkPh:tt*6,front:false,right:true,act:null};
  if(ph>=2)add(8.65,1.6,()=>gTreadmill(8.35,.5,true,tt));
  const after=()=>{const [a,b]=P(3.6,6.4,-4);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(a,b,0,a,b,120);g.addColorStop(0,'rgba(120,200,255,.12)');g.addColorStop(1,'rgba(120,200,255,0)');ctx.fillStyle=g;ctx.fillRect(a-150,b-80,300,160);ctx.restore();};
  return {W,D,floor:'#d8c9a8',wall:'#eef3f5',out:false,tile:false,drawBase,decor,items:it,ana,after};};
// ---- el local político: retratos, libros y símbolos según la corriente ----
const POL_X={
  marxista:{col:'#c0262d',fg:'#f2c230',who:[['LENIN','bald'],['MARX','beard'],['ROSA LUXEMBURG','bun'],['GRAMSCI','glasses']],books:['EL CAPITAL','¿QUÉ HACER?','EL ESTADO Y LA REVOLUCIÓN','MANIFIESTO COMUNISTA','REFORMA O REVOLUCIÓN','CUADERNOS DE LA CÁRCEL','LA IDEOLOGÍA ALEMANA','LOS CONDENADOS DE LA TIERRA'],sym:'☭',banner:'PROLETARIOS DE TODOS LOS PAÍSES, UNÍOS'},
  anarquista:{col:'#1d1d1d',fg:'#c0262d',who:[['DURRUTI','cap'],['KROPOTKIN','beard'],['EMMA GOLDMAN','glasses'],['FEDERICA MONTSENY','bun']],books:['LA CONQUISTA DEL PAN','EL APOYO MUTUO','HOMENAJE A CATALUÑA','DIOS Y EL ESTADO','MUJERES LIBRES','EL ÚNICO Y SU PROPIEDAD'],sym:'Ⓐ',banner:'NI DIOS NI AMO NI PATRÓN'},
  ecologista:{col:'#2f7a3a',fg:'#e9c46a',who:[['BERTA CÁCERES','bun'],['CHICO MENDES','beard'],['RACHEL CARSON','short'],['VANDANA SHIVA','bun']],books:['PRIMAVERA SILENCIOSA','DECRECIMIENTO','LA COMUNA DE LA TIERRA','MENOS ES MÁS','ECOLOGÍA SOCIAL'],sym:'🌻',banner:'NO HAY JUSTICIA SOCIAL SIN JUSTICIA CLIMÁTICA'},
  socialdemocrata:{col:'#d1242f',fg:'#fff',who:[['OLOF PALME','short'],['PABLO IGLESIAS P.','beard'],['CLARA CAMPOAMOR','bun']],books:['EL ESTADO DEL BIENESTAR','LA TERCERA VÍA (CRÍTICA)','LOS AÑOS DEL PACTO'],sym:'🌹',banner:'TRABAJO, DERECHOS, DIGNIDAD'},
};
function polPortrait(y,z,name,kind,T){const w=.9,hgt=18;poly([P(0,y,z),P(0,y+w,z),P(0,y+w,z+hgt),P(0,y,z+hgt)],'#3b3247');poly([P(0,y+.05,z+1),P(0,y+w-.05,z+1),P(0,y+w-.05,z+hgt-1),P(0,y+.05,z+hgt-1)],T.col);
  const [a,b]=P(0,y+w/2,z+hgt*.58);ctx.save();ctx.translate(a,b);ctx.transform(1,-.5,0,1,0,0);const sk='#e9c9a8';
  // cara estilizada tipo cartel (duotono)
  ctx.fillStyle='#2b2533';ctx.beginPath();ctx.ellipse(0,2,5.2,6.4,0,0,7);ctx.fill();ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(0,1.5,4.2,5.2,0,0,7);ctx.fill();
  if(kind==='bald'){ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(0,-2.5,4.4,3.6,0,0,7);ctx.fill();ctx.fillStyle='#2b2533';ctx.fillRect(-4.2,-1,1.6,3);ctx.fillRect(2.6,-1,1.6,3);ctx.beginPath();ctx.moveTo(-2.2,4.5);ctx.lineTo(2.2,4.5);ctx.lineTo(0,8.2);ctx.fill();ctx.fillRect(-2.2,3.2,4.4,1);}
  else if(kind==='beard'){ctx.fillStyle='#2b2533';ctx.beginPath();ctx.ellipse(0,-2.5,5.4,4,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(0,6,5,4.6,0,0,7);ctx.fill();ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(0,1,3.6,3.4,0,0,7);ctx.fill();}
  else if(kind==='bun'){ctx.fillStyle='#2b2533';ctx.beginPath();ctx.ellipse(0,-2.8,4.8,3.2,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(0,-6,2.4,0,7);ctx.fill();}
  else if(kind==='glasses'){ctx.fillStyle='#2b2533';ctx.beginPath();ctx.ellipse(0,-2.2,5,3.6,0,0,7);ctx.fill();ctx.strokeStyle='#2b2533';ctx.lineWidth=.8;ctx.strokeRect(-3.8,0,3,2.4);ctx.strokeRect(.8,0,3,2.4);}
  else if(kind==='cap'){ctx.fillStyle='#2b2533';ctx.beginPath();ctx.ellipse(0,-3,5.4,2.6,0,0,7);ctx.fill();ctx.fillRect(-5.6,-3,11.2,1.6);}
  else{ctx.fillStyle='#2b2533';ctx.beginPath();ctx.ellipse(0,-2.6,4.6,3,0,0,7);ctx.fill();}
  ctx.fillStyle='#2b2533';ctx.fillRect(-1.6,-.2,1,1);ctx.fillRect(.6,-.2,1,1);
  ctx.restore();
  const [c,d]=P(0,y+w/2,z+2.6);ctx.save();ctx.translate(c,d);ctx.transform(1,-.5,0,1,0,0);ctx.fillStyle=T.fg;ctx.font='900 2.6px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,0,0);ctx.restore();}
{const _at=SCENES['ateneo'];SCENES['ateneo']=function(E){const r=_at.apply(this,arguments);try{const id=S.ideo;const T=POL_X[id];if(!T)return r;const {tt}=E;const add=(x,y,f)=>r.items.push({d:x+y,f});
    const dec=r.decor;r.decor=()=>{if(dec)dec();
      // galería de retratos en la pared de ladrillo, arriba
      T.who.forEach(([nm,kind],k)=>polPortrait(.6+k*1.08,58,nm,kind,T));
      // lema grande bajo los retratos
      const [a,b]=P(0,2.8,55.5);ctx.save();ctx.translate(a,b);ctx.transform(1,-.5,0,1,0,0);ctx.fillStyle=T.col;ctx.font='900 3px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(T.banner,0,0);ctx.restore();
      // símbolo grande en el muro del fondo, a la derecha de la pancarta
      const [c,d]=P(9.0,0,52);ctx.save();ctx.translate(c,d);ctx.transform(1,.5,0,1,0,0);ctx.fillStyle=T.col;ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();ctx.fillStyle=T.fg;ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(T.sym,0,.5);ctx.restore();};
    // mesa de libros de la editorial del local
    add(6.9,1.9,()=>{const x=6.2,y=1.5;sBox(x,y,x+1.5,y+.8,0,13,'#a0754c');sBox(x,y,x+1.5,y+.8,13,14,T.col);
      for(let k=0;k<6;k++){const bx=x+.08+(k%3)*.47,by=y+.08+Math.floor(k/3)*.38;const c=[T.col,'#f4f1ea','#2b2533','#e9c46a'][k%4];sBox(bx,by,bx+.4,by+.3,14,16+(k%2),c);}
      const [a,b]=P(x+.75,y+.9,16);label(T.books[Math.floor((tt/6)%T.books.length)],a,b-2,'rgba(255,253,248,.92)','#3b3247',6);
      const [p,q]=P(x+1.4,y+.1,14);ctx.save();ctx.fillStyle='#fffdf8';ctx.font='900 5px Nunito, sans-serif';ctx.textAlign='center';ctx.translate(p,q);ctx.transform(1,.5,-1,.5,0,0);ctx.fillText('LIBROS · 5 €',0,0);ctx.restore();});
    // busto/pila de periódicos y una bandera en pie
    add(9.4,2.3,()=>{cyl(9.3,2.3,.06,0,52,'#8a6a4a');const [a,b]=P(9.3,2.3,52);ctx.fillStyle=T.col;ctx.beginPath();ctx.moveTo(a,b);ctx.quadraticCurveTo(a+10,b+Math.sin(tt*2)*3,a+20,b+2);ctx.lineTo(a+20,b+14);ctx.quadraticCurveTo(a+10,b+12+Math.sin(tt*2)*3,a,b+13);ctx.fill();if(id==='anarquista'){ctx.fillStyle='#1d1d1d';ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a+20,b+2);ctx.lineTo(a,b+13);ctx.fill();}
      for(let k=0;k<4;k++)sBox(9.0,2.7+k*.02,9.6,3.1,k*1.2,k*1.2+1.2,k%2?'#efe9dc':'#e6e0d2');});
  }catch(e){console.error(e);}return r;};}
