// =================== HOGARES: la casa de la gente, por dentro (la salida «Ir a su casa») ===================
{const _d=destOf;destOf=function(k){if(k==='visita')return 'hogar';return _d.apply(this,arguments);};}
{const _r=routeTo;routeTo=function(f,k){return _r.call(this,f,k==='hogar'?'casaV':k);};}
{const _o=doorOf;doorOf=function(k){return _o.call(this,k==='hogar'?'casaV':k);};}
{const _pn=placeName;placeName=function(k){if(k!=='hogar')return _pn.apply(this,arguments);try{const p=hgVisitado();if(!p)return 'Casa de alguien';const h=hogarDe(p);let s='Casa de '+p.n;if(h.censo){const a=[h.hogar.puerta,h.edificio&&h.edificio.n].filter(Boolean);if(a.length)s+=' · '+a.join(' · ');}return s;}catch(e){return 'Casa de alguien';}};}
const hgVisitado=()=>(S.people||[]).find(q=>q.k===S.outWith)||P_('madre')||(S.people||[])[0]||null;
// ---------- el censo (todo opcional) ----------
const hgCen=()=>{const D=DATA.personas||{};return {ed:D.edificios||{},ho:D.hogares||{},ve:D.vecinos||[]};};
let hgIdx=null;function hgVec(id){const v=hgCen().ve;if(!hgIdx||hgIdx.a!==v||hgIdx.n!==v.length){hgIdx={a:v,n:v.length,m:new Map(v.map(q=>[q.id,q]))};}return hgIdx.m.get(id);}
function hgStr(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0)%900000;}
const hgGen=g=>g==='f'||g==='a'?'f':g==='m'||g==='o'?'m':null;
function hogarDe(p){const C=hgCen();let hid=p&&p.hogar;if(hid==null&&p&&p.id!=null){const v=hgVec(p.id);hid=v&&v.hogar;}
  const H=hid!=null?C.ho[hid]:null;
  if(H){const E=C.ed[H.edificio]||null;const miembros=(H.miembros||[]).map(hgVec).filter(Boolean);return {hogar:{...H,id:hid},edificio:E,miembros,censo:true};}
  const k=(p&&(p.k||p.n))||'x',sd=hgStr(k);const oc=String((p&&(p.oficio&&p.oficio.join?p.oficio.join(' '):p.oficio))||'');
  let cls=p&&typeof p.cls==='number'?p.cls:({madre:1,amiga:2,vecina:1,compi:2}[k]);
  if(cls==null)cls=/médic|ingenier|abogad|direct|arquitect|program|profes|notari/i.test(oc)?3:/camarer|limpi|repart|obrer|cajer|peón|temporer|cuidad/i.test(oc)?1:2;
  const bloque=k==='madre'?true:svH(sd)<.65,n=k==='madre'?0:Math.floor(svH(sd+1)*3);
  const miembros=[];const g0=svH(sd+2)<.5?'f':'m';
  if(n>=1)miembros.push({id:null,anon:true,g:g0==='f'?'m':'f',edad:30+Math.floor(svH(sd+3)*20)});
  if(n>=2)miembros.push({id:null,anon:true,g:svH(sd+4)<.5?'f':'m',edad:3+Math.floor(svH(sd+5)*8)});
  const tipo=n===0?'sola':n===1?'pareja':'familia';
  return {hogar:{id:'_'+k,n:'Casa de '+((p&&p.n)||''),edificio:null,puerta:null,cls,tipo,miembros:[]},edificio:{tipo:bloque?'bloque':'casa',plantas:bloque?4:1,n:''},miembros,censo:false};}
// ---------- quién está fuera a esa hora (trabajo y «donde») ----------
function hgFuera(v,day,h){const wd=dateOf(day).wd;const at=(a,b)=>a<=b?(h>=a&&h<b):(h>=a||h<b);const dd=d=>!Array.isArray(d)||d.includes(wd);
  const T=v.trabajo;if(T&&T.h&&dd(T.dias)&&at(T.h[0],T.h[1]))return T.lugar||'trabajo';
  for(const d of (v.donde||[]))if(dd(d[3])&&at(d[1],d[2]))return d[0];
  if(v.anon&&v.edad<65&&wd<5&&at(9,14))return 'fuera';
  return null;}
const hgCat=e=>e<12?'kid':e<18?'teen':e>=65?'old':'adult';
const hgSc=e=>e<4?.6:e<8?.72:e<12?.84:e<15?.92:e<18?.97:1;
function hgChar(seed,g,edad){const kind=edad>=65?'old':edad<12?'kid':'adult';const o=svChar(seed,kind);const f=g==='f'||(g==null&&svH(seed*3+9)<.5);o.g=f?'f':'m';
  if(kind==='old'){o.style=f?'mono':'corto';if(f)o.beard=undefined;}else if(kind==='kid')o.style=f?'coleta':'corto';else{o.style=f?['melena','coleta','rizos','afro'][Math.floor(svH(seed+5)*4)]:['corto','rizos','corto','rapado'][Math.floor(svH(seed+5)*4)];if(f)o.beard=undefined;}return o;}
// los presentes en la casa a esta hora: [{n,edad,g,cat,ch,v}]
function hgPresentes(p,hd,day,h){const out=[];const quien=(hd.miembros||[]);
  quien.forEach((v,i)=>{if(v.id!=null&&(v.id===p.id||v.n===p.n))return;if(v.anon&&false)return;if(hgFuera(v,day,h))return;const e=v.edad==null?35:v.edad;const g=hgGen(v.g)||(v.g==='x'?null:null);
    out.push({n:v.anon?null:v.n,edad:e,cat:hgCat(e),ch:hgChar(v.anon?hgStr((p.k||p.n)+i):hgStr(v.id!=null?v.id:v.n),g,e),v});});
  return out;}
// ---------- primitivas ----------
const hgQ=(y,x0,x1,z0,z1,c)=>faceY(x0,x1,y,z0,z1,c),hgR=(x,y0,y1,z0,z1,c)=>faceX(x,y0,y1,z0,z1,c);
const hgBox=(x0,y0,x1,y1,z0,z1,c)=>sBox(x0,y0,x1,y1,z0,z1,c);
function hgPer(x,y,m,o){const sc=hgSc(m.edad);const [a,b]=P(x,y);ctx.save();if(sc<1){ctx.translate(a,b);ctx.scale(sc,sc);ctx.translate(-a,-b);}
  sPerson(x,y,m.ch,{front:true,right:true,...o});ctx.restore();
  if(m.n){ctx.save();ctx.globalAlpha=.92;label(m.n,a,b-((o.pose==='sit'?58:66)*sc)-2,'rgba(255,253,248,.92)','#3b3247',8);ctx.restore();}}
function hgSteam(x,y,z,tt){const [a,b]=P(x,y,z);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.2;for(let k=0;k<2;k++){ctx.beginPath();const ph=tt*2+k*2;ctx.moveTo(a+k*3-1.5,b);ctx.bezierCurveTo(a+k*3-4+Math.sin(ph)*2,b-5,a+k*3+3+Math.cos(ph)*2,b-9,a+k*3-1+Math.sin(ph+1)*2,b-14);ctx.stroke();}}
// ---------- distribución ----------
const HGL={
  piso:{W:13,D:9,sofa:[1.5,4.9],seats:[2.2,3.3,4.4],coffee:[2.5,4.5,2.7,3.5],tv:[5.6,7.9],butaca:[6.3,3.4],table:[10.3,5.2],cook:[[10.0,1.5],[8.9,1.5]],play:[[5.2,6.3],[6.7,7.1],[7.6,5.7],[5.6,7.8]],stand:[[8.0,3.3],[12.1,3.0],[3.4,5.4]],estufa:[5.1,2.1],rack:[2.0,6.9],plant:[12.2,7.6],hum:'back'},
  casa:{W:15,D:10,sofa:[1.8,5.2],seats:[2.5,3.6,4.7],coffee:[2.8,4.8,2.8,3.6],tv:[6.0,8.6],butaca:[6.6,3.6],table:[6.8,7.0],cook:[[1.8,6.0],[1.8,4.8]],play:[[8.6,3.4],[9.3,4.6],[7.9,4.8],[9.2,2.6]],stand:[[3.5,5.6],[9.3,6.8],[1.8,8.4]],estufa:[5.6,2.2],rack:[3.6,8.6],plant:[9.4,8.9],hum:'left'}};
// ---------- la escena ----------
SCENES['hogar']=function(E){const {tt,night}=E;const h=E.h!=null?E.h:S.t/60;const p=hgVisitado();if(!p)return null;const hd=hogarDe(p);const H=hd.hogar,cls=Math.max(0,Math.min(4,H.cls|0));
  const bloque=hd.edificio?hd.edificio.tipo!=='casa':!!H.puerta;const L=bloque?HGL.piso:HGL.casa,W=L.W,D=L.D,WH=66;const wk=dayType(S.day)!=='work';
  const it=[],add=(x,y,f)=>it.push({d:x+y,f});const mini=cls<=1,rico=cls>=3;
  const pres=hgPresentes(p,hd,S.day,h);const dorm=h>=23||h<7;
  const allAges=[...pres,...(hd.miembros||[])].map(m=>m.edad);const peques=(hd.miembros||[]).some(m=>(m.edad==null?35:m.edad)<12);
  const gente=[...(hd.miembros||[]).map(m=>m.edad),(p.age||p.edad||(p.k==='madre'?68:34))];const mayores=gente.some(e=>e>=65);const comp=H.tipo==='compartido';
  // roles
  const cook=pres.findIndex(m=>m.cat==='adult'),cookI=cook>=0?cook:pres.findIndex(m=>m.cat!=='kid');
  const pools={table:[[0,-1,-1],[1,-1,-1],[0,1,1],[1,1,1]].map(([a,b,s])=>[L.table[0]+(a?.65:-.65),L.table[1]+s*1.05,s<0]),cook:L.cook.slice(),play:L.play.slice(),stand:L.stand.slice(),tv:[[L.butaca[0],L.butaca[1],'b'],[L.seats[2],.95,'s']]};
  const asign=[];const roleOf=(m,i)=>{const c=m.cat;if(dorm)return null;if(c==='kid'&&m.edad<9&&h>=21)return null;if(c==='kid'&&h>=22)return null;
    if(h<9)return i===cookI&&h<8.3?'cook':'eat';
    if(h<12)return c==='kid'?'play':c==='old'?'tv':'sofa';
    if(h<14)return i===cookI?'cook':c==='kid'?'play':c==='old'?'tv':'sofa';
    if(h<15.5)return 'eat';
    if(h<18.5)return c==='kid'?(wk?'play':'study'):c==='teen'?(wk?'sofa':'study'):c==='old'?'tv':'sofa';
    if(h<20)return c==='kid'?'play':c==='old'?'tv':'sofa';
    if(h<21)return i===cookI?'cook':c==='kid'?'play':c==='old'?'tv':'sofa';
    if(h<21.5)return 'eat';return 'tv';};
  pres.forEach((m,i)=>{let r=roleOf(m,i);if(!r)return;let s=null;
    if(r==='cook'){s=pools.cook.shift();if(s)asign.push({m,r,x:s[0],y:s[1],pose:'stand',act:'stir',front:false,right:false});else r='stand';}
    else if(r==='eat'||r==='study'){s=pools.table.shift();if(s)asign.push({m,r,x:s[0],y:s[1],pose:'sit',act:r==='study'?(m.cat==='teen'?'type':'book'):'eat',front:s[2],right:s[0]>L.table[0]});else r='stand';}
    else if(r==='play'){s=pools.play.shift();if(s)asign.push({m,r,x:s[0],y:s[1],pose:'stand',act:null,front:true,right:i%2===0,prop:['🧸','⚽','🚗','🎨'][i%4]});else r='stand';}
    else if(r==='tv'||r==='sofa'){const j=pools.tv.findIndex(q=>r==='tv'?true:q[2]==='s');if(j>=0){s=pools.tv.splice(j,1)[0];asign.push({m,r:'tv',x:s[0],y:s[1],pose:'sit',act:r==='sofa'&&svH(hgStr(m.n||i)+h|0)<.6?'phone':null,front:s[2]==='s',right:true,butaca:s[2]==='b'});}else r='stand';}
    if(r==='stand'){s=pools.stand.shift()||[L.stand[0][0]+i*.4,L.stand[0][1]+.5];asign.push({m,r,x:s[0],y:s[1],pose:'stand',act:'phone',front:true,right:false});}});
  const tvOn=!dorm&&(asign.some(a=>a.r==='tv')||(h>=21.5&&h<23));const cocinando=asign.some(a=>a.r==='cook');
  const sky=svSky(night),lluvia=['lluvia','tormenta'].includes((S.weather||{}).k);
  // ---------- base ----------
  const piso=mini?'#b9a78f':cls===2?'#cdb99b':'#c9a574';const pared=mini?'#e3dac4':cls===2?'#efe6d6':cls===3?'#e8ecee':'#f1ede4';const paredB=shade(pared,.93);
  const winX=bloque?[1.6,4.8]:[1.9,5.1];
  const ventana=()=>{const [x0,x1]=winX,z0=24,z1=58;hgQ(0,x0-.15,x1+.15,z0-2,z1+2,'#f4f2ec');
    if(bloque&&cls<=2){hgQ(0,x0,x1,z0,z1,night>.5?'#2b2f45':'#c9a97a');const n=3,w=(x1-x0)/n;for(let k=0;k<n;k++){for(const zz of [30,45])hgQ(0,x0+.12+k*w,x0+.12+k*w+.5,zz,zz+8,night>.5&&svH(k*3+zz+S.day)<.5?'#f3d98a':'#74889a');}
      hgQ(0,x0,x1,z1-3,z1,sky);const a=P(x0,0,50),b=P(x1,0,46);ctx.strokeStyle='#6b5a44';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();for(let k=0;k<5;k++){const t=(k+.5)/5;const c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];ctx.fillStyle=['#e05a4f','#f1f1f1','#4f8fe0','#e9c46a','#f1f1f1'][k];ctx.fillRect(c[0]-2.5,c[1],5,k%2?9:7);}}
    else{hgQ(0,x0,x1,z0,z1,sky);const bc=night>.5?'#3a4160':'#a9b4bf';for(let k=0;k<3;k++){const xa=x0+k*(x1-x0)/3;poly([P(xa,0,z0),P(xa+(x1-x0)/3-.1,0,z0),P(xa+(x1-x0)/3-.1,0,z0+10+svH(k+7)*14),P(xa,0,z0+10+svH(k+7)*14)],shade(bc,1-k*.05));}
      const [ta,tb]=P(x0+.7,0,z0);ctx.fillStyle=night>.5?'#1f4a33':'#4e9a52';ctx.beginPath();ctx.arc(ta,tb-11,9,0,7);ctx.fill();hgQ(0,x0+.62,x0+.78,z0,z0+8,'#6b4a2e');
      if(rico){const a=P(x0,0,z0+5),b=P(x1,0,z0+5);capsule(a[0],a[1],b[0],b[1],2,'#2f3338');}}
    if(lluvia){ctx.strokeStyle='rgba(60,80,110,.55)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<10;k++){const xx=x0+(x1-x0)*svH(k+20),zz=z1-((tt*30+svH(k+30)*(z1-z0))%(z1-z0));ctx.moveTo(...P(xx,0,zz));ctx.lineTo(...P(xx-.05,0,zz-4));}ctx.stroke();}
    hgQ(0,(x0+x1)/2-.05,(x0+x1)/2+.05,z0,z1,'#f4f2ec');
    if(!mini){hgQ(0,x0-.1,x0+.35,z0-2,z1+3,rico?'#d8c3a5':'#c98f7c');hgQ(0,x1-.35,x1+.1,z0-2,z1+3,rico?'#d8c3a5':'#c98f7c');}};
  const humedad=()=>{if(!mini)return;ctx.save();ctx.globalAlpha=.5;const blot=(pts,c)=>poly(pts,c);
    if(L.hum==='back'){blot([P(W-.2,0,64),P(W-3.4,0,64),P(W-3.0,0,58),P(W-3.9,0,52),P(W-2.2,0,48),P(W-1.6,0,53),P(W-.2,0,44)],'#6d7b5e');blot([P(W-.2,0,40),P(W-1.2,0,40),P(W-1.0,0,34),P(W-.2,0,36)],'#6d7b5e');}
    else{blot([P(0,D-.2,64),P(0,D-3.2,64),P(0,D-2.7,57),P(0,D-3.6,52),P(0,D-1.9,47),P(0,D-.2,45)],'#6d7b5e');}
    ctx.restore();};
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#6d5c4a');
    if(bloque){topQuad(0,0,W,D,0,piso);}else{topQuad(0,0,10,D,0,piso);topQuad(10,0,W,D,0,'#b9704f');}
    ctx.strokeStyle=mini?'rgba(80,60,40,.14)':'rgba(70,50,30,.12)';ctx.lineWidth=1;ctx.beginPath();const lim=bloque?W:10;
    if(rico){for(let k=1;k<D*2;k++){ctx.moveTo(...P(0,k/2));ctx.lineTo(...P(lim,k/2));}}else{for(let k=1;k<lim;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(lim,k));}}ctx.stroke();
    if(!bloque){ctx.strokeStyle='rgba(60,30,20,.2)';ctx.beginPath();for(let k=11;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(10,k));ctx.lineTo(...P(W,k));}ctx.stroke();}
    if(bloque)topQuad(0,2.4,1.4,D,.2,shade(piso,.86));
    sBox(0,-.15,bloque?W:10,0,0,WH,pared);sBox(-.15,-.15,0,D,0,WH,paredB);
    if(!bloque){sBox(10,-.15,W,0,0,26,'#d9b48a');hgQ(0,10.1,W-.1,26,40,'#4e9a52');}
    hgQ(0,0,bloque?W:10,0,6,shade(pared,.82));hgR(0,0,D,0,6,shade(paredB,.82));ventana();humedad();
    if(!bloque){const y0=.8,y1=2.8;hgR(0,y0-.1,y1+.1,26,56,'#f4f2ec');hgR(0,y0,y1,28,54,sky);hgR(0,y0,y1,28,34,night>.5?'#1f4a33':'#6aa86a');}
    if(bloque){// puertas del pasillo
      hgR(0,2.8,4.1,0,54,'#7a5436');hgR(0,3.2,3.7,30,34,'#d8c07a');for(const [a,b] of [[5.0,6.0],[6.8,7.8]])hgR(0,a,b,0,52,mini?'#a89270':'#c9b08a');}
    if(!bloque){hgR(0,8.2,9.4,0,54,'#7a5436');}
    // cuadro y detalles
    if(bloque){const x=rico?9.0:7.2;if(mini)hgQ(0,5.7,6.5,36,50,'#f4efe1');else hgQ(0,x,x+1.2,36,54,rico?'#2f3338':'#e8c27a');}
    // fogones y cocina (según distribución)
    cocina();};
  const cocina=()=>{
    if(bloque){const cm=mini?'#cfc6b0':rico?'#ece9e2':'#d9d3c4',enc=rico?'#e8e4dc':'#8b8f94';
      sBox(8.2,.1,12.0,1.0,0,20,cm);topQuad(8.2,.1,12.0,1.0,20,enc);
      sBox(8.2,.1,12.0,.65,40,58,mini?'#b99a74':rico?'#3a4a5a':'#e9e4da');
      sBox(12.0,.1,12.9,1.1,0,60,mini?'#d9d2bf':'#e8ecee');}
    else{const cm=mini?'#cfc6b0':rico?'#ece9e2':'#d9d3c4';
      sBox(.1,3.5,1.0,7.3,0,20,cm);topQuad(.1,3.5,1.0,7.3,20,rico?'#e8e4dc':'#8b8f94');sBox(.1,3.5,.65,7.3,40,58,mini?'#b99a74':rico?'#3a4a5a':'#e9e4da');
      sBox(.1,2.6,1.1,3.5,0,60,mini?'#d9d2bf':'#e8ecee');}};
  const decor=()=>{};
  // sofá y mesita (siempre tras los muebles de pared)
  const sx0=L.sofa[0],sx1=L.sofa[1],sofaC=mini?'#8a6a52':cls===2?'#5d7ea1':'#6e7480';
  add(sx0-.3,.9,()=>{sBox(sx0,.15,sx1,1.55,0,10,sofaC);sBox(sx0,.15,sx1,.55,10,28,shade(sofaC,.9));sBox(sx0,.15,sx0+.4,1.55,10,18,shade(sofaC,.8));sBox(sx1-.4,.15,sx1,1.55,10,18,shade(sofaC,.8));
    if(mini){poly([P(sx0+1.2,1.55,6),P(sx0+2.0,1.55,6),P(sx0+2.0,1.55,9),P(sx0+1.2,1.55,9)],'#a98c70');sBox(sx1-1.4,.6,sx1-.45,1.5,10,12,'#c9a24a');}
    else{sBox(sx0+.5,.6,sx0+1.1,1.1,10,17,rico?'#e0a96d':'#c0504d');sBox(sx1-1.1,.6,sx1-.5,1.1,10,17,rico?'#9bb6a1':'#e9c46a');}});
  const cof=L.coffee;
  add(cof[1]+cof[3]-1,0,()=>{if(rico)topQuad(cof[0]-.5,cof[2]-.4,cof[1]+.5,cof[3]+.5,.3,'#8a6f5a');else if(!mini)topQuad(cof[0]-.4,cof[2]-.3,cof[1]+.4,cof[3]+.4,.3,'#b0524a');
    sBox(cof[0],cof[2],cof[1],cof[3],0,8,mini?'#8a6a48':rico?'#e8e4dc':'#a37a52');topQuad(cof[0],cof[2],cof[1],cof[3],8,mini?'#a98c68':rico?'#f4f1ea':'#b98c60');
    for(const [cx,cy] of [[cof[0]+.5,(cof[2]+cof[3])/2],[cof[1]-.5,(cof[2]+cof[3])/2]]){cyl(cx,cy,.14,8,12,'#fffdf8','#5a3820');hgSteam(cx,cy,12,tt);}
    if(!rico)sBox(cof[0]+.85,cof[2]+.2,cof[0]+1.35,cof[2]+.6,8,9.5,'#e9d3a3');});
  // tele
  const [t0,t1]=L.tv;add(t1+.2,.9,()=>{sBox(t0,.15,t1,.95,0,14,mini?'#7a5a3a':rico?'#2f3338':'#a37a52');const w=mini?1.2:rico?2.4:1.8,hh=mini?20:rico?26:22,tx=(t0+t1)/2-w/2;
    if(mini)sBox(tx,.25,tx+w,.85,14,14+hh,'#8b8f94');else sBox(tx,.35,tx+w,.55,14,14+hh,'#111418');
    const yf=mini?.85:.55,pad=mini?.12:.06;const sc=tvOn?['#6fa8dc','#e9c46a','#7bc47f'][Math.floor(tt/12)%3]:'#15181c';hgQ(yf,tx+pad,tx+w-pad,16,12+hh,sc);if(tvOn){hgQ(yf,tx+pad+.1,tx+w*.6,18,24,'rgba(255,255,255,.35)');}
    if(rico){const ac=P(t0+.2,0,50);ctx.fillStyle='#f4f6f8';ctx.fillRect(ac[0]-10,ac[1]-4,(t1-t0+.1)*TW/2*1.1,9);hgQ(0,t0,t1,50,60,'#f4f6f8');hgQ(.02,t0+.2,t1-.2,51,53,'#a9c7e0');hgQ(0,t0,t1,48,50,'rgba(150,200,240,.3)');}});
  // butaca (con manta y andador si hay mayores)
  add(L.butaca[0]+.6,L.butaca[1]+.6,()=>{const [bx,by]=L.butaca,c=mini?'#8a5a44':rico?'#b0845a':'#9b6a4a';sBox(bx-.6,by-.55,bx+.6,by+.55,0,9,c);sBox(bx-.6,by-.55,bx+.6,by-.2,9,26,shade(c,.9));sBox(bx-.6,by-.55,bx-.35,by+.55,9,16,shade(c,.8));sBox(bx+.35,by-.55,bx+.6,by+.55,9,16,shade(c,.8));
    if(mayores){sBox(bx-.35,by-.2,bx+.35,by+.5,9,11,'#d98c6a');sBox(bx-.35,by+.1,bx+.35,by+.28,9.2,11.2,'#a85a3a');}});
  if(mayores)add(L.butaca[0]+1.9,L.butaca[1]+.8,()=>{const [bx,by]=L.butaca;const x=bx+1.5,y=by+.5;const q=(dx,dy,z)=>P(x+dx,y+dy,z);ctx.strokeStyle='#aab2ba';ctx.lineWidth=1.6;ctx.beginPath();for(const [dx,dy] of [[-.3,-.25],[.3,-.25],[-.3,.25],[.3,.25]]){ctx.moveTo(...q(dx,dy,0));ctx.lineTo(...q(dx,dy,20));}ctx.moveTo(...q(-.3,-.25,20));ctx.lineTo(...q(.3,-.25,20));ctx.lineTo(...q(.3,.25,20));ctx.lineTo(...q(-.3,.25,20));ctx.closePath();ctx.stroke();});
  // mesa del comedor, sillas y platos
  const [tcx,tcy]=L.table;const seated=asign.filter(a=>a.pose==='sit'&&a.x>=tcx-1&&a.x<=tcx+1&&Math.abs(a.y-tcy)>.5);
  add(tcx,tcy,()=>{sBox(tcx-1.25,tcy-.6,tcx+1.25,tcy+.6,0,16,mini?'#8a6a48':'#a37a52');topQuad(tcx-1.25,tcy-.6,tcx+1.25,tcy+.6,16,mini?'#b9a27c':rico?'#d8c3a5':'#c9a574');
    sBox(tcx-.3,tcy-.15,tcx+.3,tcy+.15,16,17,'#e9e4da');
    for(const a of seated){const py=tcy+(a.y<tcy?-.35:.35);const px=a.x;if(a.r==='eat'){cyl(px,py,.2,16,17,'#fffdf8','#f4efe1');cyl(px,py,.09,17,17.6,'#d98c6a','#e9a98c');}else sBox(px-.22,py-.16,px+.22,py+.16,16,17,'#f4efe1');}
    if(!comp&&!mini)sBox(tcx-.1,tcy-.1,tcx+.1,tcy+.1,17,22,'#6aa86a');});
  const sillas=[[-.65,-1.05],[.65,-1.05],[-.65,1.05],[.65,1.05]];sillas.forEach(([dx,dy],i)=>add(tcx+dx+.2,tcy+dy+.2,()=>svChair(tcx+dx,tcy+dy,comp?['#c0392b','#3a86ff','#e9c46a','#00bb7f'][i]:mini?'#a98c68':'#8a6f5a')));
  // fogón con olla, nevera con dibujos
  if(bloque){add(10.2,1.1,()=>{for(const [dx,dy] of [[-.25,.3],[.25,.3],[-.25,.7],[.25,.7]])cyl(10.1+dx,dy,.12,20,21,'#2a2a30','#3a3a44');if(cocinando){cyl(10.1,.5,.28,21,29,'#9aa3ad','#b8c0c8');hgSteam(10.1,.5,29,tt);}if(rico){hgBox(9.3,.1,11.0,.6,48,54,'#c9ced4');}});
    add(12.9,1.3,()=>{if(peques){for(const [dx,z,c,e] of [[.15,40,'#ffe28a','🌈'],[.55,34,'#bfe3f7','🏠'],[.35,48,'#f7c6d0','🐱']]){hgQ(1.1,12.0+dx,12.0+dx+.38,z,z+9,c);const [a,b]=P(12.0+dx+.19,1.1,z+4.5);emoji(e,a,b,7);}}
      if(!peques){hgQ(1.1,12.2,12.6,38,46,'#fffdf8');hgQ(1.1,12.3,12.5,26,34,mini?'#c27458':'#7bc47f');}});}
  else{add(1.3,3.2,()=>{if(peques){for(const [dy,z,c,e] of [[.15,40,'#ffe28a','🌈'],[.5,34,'#bfe3f7','🏠'],[.4,48,'#f7c6d0','🐱']]){hgR(1.1,2.6+dy,2.6+dy+.34,z,z+9,c);const [a,b]=P(1.1,2.6+dy+.17,z+4.5);emoji(e,a,b,7);}}else hgR(1.1,2.8,3.2,36,46,'#fffdf8');});
    add(1.3,6.2,()=>{for(const [dy] of [[5.7],[6.2]])cyl(1.2,dy,.12,20,21,'#2a2a30','#3a3a44');if(cocinando){cyl(1.2,6.0,.28,21,29,'#9aa3ad','#b8c0c8');hgSteam(1.2,6.0,29,tt);}});}
  // huella del nivel
  if(mini){add(L.estufa[0],L.estufa[1],()=>{cyl(L.estufa[0],L.estufa[1],.3,0,26,'#d8582b','#e7714a');cyl(L.estufa[0],L.estufa[1],.2,26,27,'#7a2a1a','#c0392b');hgBox(L.estufa[0]-.28,L.estufa[1]+.05,L.estufa[0]-.1,L.estufa[1]+.2,2,10,'#d8c07a');});
    add(L.rack[0]+1.2,L.rack[1]+.4,()=>{const [rx,ry]=L.rack;ctx.strokeStyle='#aab2ba';ctx.lineWidth=1.6;ctx.beginPath();for(const [dx,dy] of [[0,0],[2.2,0],[0,.9],[2.2,.9]]){ctx.moveTo(...P(rx+dx,ry+dy,0));ctx.lineTo(...P(rx+dx,ry+dy,26));}for(const dy of [0,.9]){ctx.moveTo(...P(rx,ry+dy,26));ctx.lineTo(...P(rx+2.2,ry+dy,26));}ctx.stroke();
      const cols=['#e05a4f','#f1f1f1','#4f8fe0','#e9c46a','#7bc47f','#f1f1f1','#c46ab8'];for(let k=0;k<7;k++){const q=P(rx+.2+k*.3,ry+(k%2?.9:0),26);ctx.fillStyle=cols[k];ctx.fillRect(q[0]-3,q[1],6,k%3===0?13:10);}});}
  else{if(rico)add(L.plant[0],L.plant[1],()=>{cyl(L.plant[0],L.plant[1],.35,0,12,'#e8e4dc','#f4f1ea');const [a,b]=P(L.plant[0],L.plant[1],12);for(let k=0;k<8;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k*1.1)*8,b-8-k*3.2,6,3.2,k*.6,0,7);ctx.fill();}});
    add(L.stand[2][0],L.stand[2][1]+.2,()=>{const [lx,ly]=[L.sofa[1]+.5,.7];cyl(lx,ly,.18,0,3,'#2f3338','#3a3f46');cyl(lx,ly,.04,3,48,'#2f3338','#3a3f46');cyl(lx,ly,.3,48,56,'#f4e9c8','#fff6d8');});}
  if(!mini&&!rico&&false){}
  // juguetes
  if(peques){const [px,py]=L.play[0];add(px+.8,py+.6,()=>{topQuad(px-.9,py-.7,px+2.0,py+1.5,.4,'#e9b7a0');for(const [dx,dy,c] of [[0,0,'#e05a4f'],[.55,.2,'#4f8fe0'],[.25,.7,'#e9c46a'],[1.1,.9,'#7bc47f']])sBox(px+dx,py+dy,px+dx+.3,py+dy+.3,.4,5.5,c);const [a,b]=P(px+1.5,py+.3,1);emoji('🚂',a,b-3,11);});
    add(L.stand[1][0],L.stand[1][1]+.5,()=>{const [a,b]=P(L.stand[1][0]+.5,L.stand[1][1],0);emoji('🎒',a,b-6,13);});}
  // piso compartido: bicis, palés
  if(comp){add(1.1,8.2,()=>{const bx=bloque?.8:L.stand[2][0]-1,by=bloque?7.6:L.stand[2][1]+1;for(const k of [0,1]){const yy=by+k*1.1;ctx.strokeStyle=k?'#3a86ff':'#c0392b';ctx.lineWidth=1.8;for(const dy of [0,.9]){const [a,b]=P(bx,yy+dy,8);ctx.beginPath();ctx.arc(a,b,8,0,7);ctx.stroke();}const f1=P(bx,yy,8),f2=P(bx,yy+.9,8),f3=P(bx,yy+.45,18);ctx.beginPath();ctx.moveTo(...f1);ctx.lineTo(...f3);ctx.lineTo(...f2);ctx.stroke();}});
    add(bloque?.9:L.stand[2][0]-1,bloque?5.2:L.stand[2][1]-2,()=>{const sx=bloque?.1:L.stand[2][0]-1.4,sy=bloque?4.3:L.stand[2][1]-3;for(const z of [0,16,32])hgBox(sx,sy,sx+.6,sy+1.9,z,z+3,'#c9a26b');hgBox(sx,sy,sx+.5,sy+.2,0,35,'#b58a52');hgBox(sx,sy+1.7,sx+.5,sy+1.9,0,35,'#b58a52');for(const [dy,z,c] of [[.3,3,'#6aa86a'],[1.0,3,'#e9c46a'],[.5,19,'#c0392b'],[1.2,19,'#3a86ff']])hgBox(sx+.1,sy+dy,sx+.4,sy+dy+.4,z,z+8,c);});}
  // gente
  for(const a of asign)add(a.x+a.y+(a.butaca?1.6:a.pose==='sit'?.5:.1),0,()=>{if(a.pose==='sit'&&a.butaca===false)svChair(a.x,a.y,'#a98c68');hgPer(a.x,a.y-(a.pose==='sit'?.02:0),a.m,{pose:a.pose,act:a.act,front:a.front,right:a.right,prop:a.prop,ph:tt*5});});
  // la visita: el personaje y la persona visitada, en el sofá, con café
  const pe=p.age||p.edad||(p.k==='madre'?68:34);const g0=hgGen(p.g)||(p.k==='madre'?'f':null);const vis={n:p.n,edad:pe,ch:hgChar(hgStr(p.k||p.n),g0,pe)};
  if(!dorm)add(L.seats[1]+.2,1.2,()=>hgPer(L.seats[1],.93,vis,{pose:'sit',act:null,front:true,right:false,ph:tt*3}));
  // lámpara de pie (siempre una luz)
  const lamp=[L.sofa[0]-.35,1.0];add(lamp[0]+.2,lamp[1]+.2,()=>{cyl(lamp[0],lamp[1],.18,0,3,'#2f3338','#3a3f46');cyl(lamp[0],lamp[1],.04,3,50,'#2f3338','#3a3f46');cyl(lamp[0],lamp[1],.32,50,60,'#f4e9c8','#fff6d8');});
  // patio de la casa baja
  if(!bloque){add(11.5,3.2,()=>{for(const [x,y,c] of [[10.8,.6,'#b5543c'],[12.4,.6,'#c27458'],[14.0,.6,'#b5543c'],[10.9,9.2,'#c27458']]){cyl(x,y,.3,0,9,c,shade(c,1.1));const [a,b]=P(x,y,9);for(let k=0;k<6;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k*1.3)*6,b-6-Math.abs(Math.sin(k))*6,5,2.8,k,0,7);ctx.fill();}if(x===12.4){ctx.fillStyle='#e05a4f';ctx.beginPath();ctx.arc(a+3,b-13,2.2,0,7);ctx.fill();}}
      cyl(12.6,5.6,.7,0,16,'#d7d2c6','#e9e4da');svChair(11.6,5.6,'#3f8a6a');svChair(13.6,5.6,'#3f8a6a');});
    add(10.1,2.2,()=>{for(const y of [2.2,5.6]){hgBox(9.95,y-.08,10.15,y+.08,0,56,'#f4f2ec');}hgBox(9.95,2.2,10.15,5.6,54,57,'#f4f2ec');hgR(10.05,2.4,3.9,2,52,'rgba(190,225,245,.28)');});
    add(12.2,8.6,()=>{const a=P(10.4,8.4,52),b=P(14.4,8.4,50);ctx.strokeStyle='#6b5a44';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();for(let k=0;k<4;k++){const t=(k+.5)/4;ctx.fillStyle=['#e05a4f','#f1f1f1','#4f8fe0','#e9c46a'][k];ctx.fillRect(a[0]+(b[0]-a[0])*t-3,a[1]+(b[1]-a[1])*t,6,10);}hgBox(10.3,8.3,10.5,8.5,0,52,'#9aa3ad');hgBox(14.3,8.3,14.5,8.5,0,50,'#9aa3ad');});}
  // ana
  const ana={x:L.seats[0],y:.93,pose:'sit',front:true,right:true,act:null};
  const lampPos=P(lamp[0],lamp[1],54);
  const after=()=>{const f=dorm?.5:night>.3?.25:0;if(f||dorm){ctx.fillStyle=`rgba(20,28,60,${dorm?.34:.14+night*.14})`;ctx.fillRect(-2400,-2400,4800,4800);}
    if(dorm||night>.3||h>=18||(lluvia&&h>=16)){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(lampPos[0],lampPos[1],4,lampPos[0],lampPos[1],150);g.addColorStop(0,'rgba(255,200,110,.5)');g.addColorStop(1,'rgba(255,200,110,0)');ctx.fillStyle=g;ctx.fillRect(lampPos[0]-160,lampPos[1]-160,320,320);ctx.restore();}};
  return {W,D,floor:piso,wall:pared,out:false,tile:false,drawBase,decor,items:it,ana,after};};
// ---------- la salida «Ir a su casa»: el rótulo ya sale de placeName('hogar'); nada que guardar ----------
