// ---------- muñecos 3D: personaje procedural low-poly (three.js) ----------
const C3D=(()=>{
const T=window.THREE;
const mats=new Map();
function M(col,o={}){const k=col+JSON.stringify(o);let m=mats.get(k);if(!m){m=new T.MeshStandardMaterial({color:new T.Color(col),roughness:o.r??.78,metalness:o.m??0,flatShading:!!o.flat});mats.set(k,m);}return m;}
const G={};// cache de geometrías
const geo=(k,f)=>G[k]||(G[k]=f());
const caps=(r,l)=>geo('c'+r+'_'+l,()=>new T.CapsuleGeometry(r,l,4,10));
const sph=(r,w=14,h=10)=>geo('s'+r+'_'+w,()=>new T.SphereGeometry(r,w,h));
const box=(a,b,c)=>geo('b'+a+b+c,()=>new T.BoxGeometry(a,b,c));
function mesh(g,m,x=0,y=0,z=0,p){const o=new T.Mesh(g,m);o.position.set(x,y,z);if(p)p.add(o);o.castShadow=false;return o;}
function grp(p,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);if(p)p.add(g);return g;}
function shadeC(hex,f){const c=new T.Color(hex);c.multiplyScalar(f);return '#'+c.getHexString();}
function lathe(prof,seg=18){return new T.LatheGeometry(prof.map(([r,y])=>new T.Vector2(r,y)),seg);}
// segmento de miembro entre dos radios (cono redondeado), apunta hacia -y
function limbSeg(r0,r1,len){return geo('l'+r0+'_'+r1+'_'+len,()=>{const g=new T.CylinderGeometry(r0,r1,len,12,1,false);g.translate(0,-len/2,0);return g;});}
const SLEEVE={basico:'short',hiphop:'long',mono:'long',chandal:'long',traje:'long',obrero:'long',vestido:'none',falda:'short',vaquera:'long',punk:'long',punto:'long',deporte:'short'};

function build(ch){
  const fem=ch.g==='f',bw=({delgada:.9,media:1,ancha:1.14})[ch.build]||1,age=ch.age||27;
  const skin=ch.skin||'#efc39b',hair=age>=62&&ch.hair!=='#bdbdbd'?'#b8b8b8':(ch.hair||'#3e2a1e');
  const of=ch.outfit||'basico',top=ch.shirt||'#ff8a5b',bot=ch.pants||'#3d405b',a2=ch.acc2||shadeC(top,.7),shoes=ch.shoes||'#2c2833';
  const mSkin=M(skin,{r:.62}),mTop=M(top,{r:.85}),mBot=M(bot,{r:.88}),mHair=M(hair,{r:.55}),mShoe=M(shoes,{r:.6}),mA2=M(a2,{r:.8});
  const root=new T.Group(),R={root,fem,bw};
  // ---- cadera y torso ----
  const hips=R.hips=grp(root,0,.88,0);
  const sx=bw*(fem?1:1.06),sz=.66*bw;
  const pelvis=mesh(lathe(fem?[[0,-.06],[.11,-.055],[.155,-.01],[.16,.06],[.13,.14]]:[[0,-.06],[.11,-.055],[.145,-.01],[.145,.07],[.14,.14]]),mBot,0,0,0,hips);pelvis.scale.set(sx,1,sz);
  const chest=R.chest=grp(hips,0,.1,0);
  const torsoP=fem?[[.125,0],[.118,.08],[.15,.2],[.158,.28],[.15,.36],[.16,.4],[.12,.45],[.05,.47]]:[[.135,0],[.135,.08],[.162,.2],[.178,.3],[.185,.37],[.17,.42],[.12,.46],[.05,.48]];
  const torso=mesh(lathe(torsoP),of==='vestido'?mTop:mTop,0,0,0,chest);torso.scale.set(sx,1,sz);
  
  // falda / vestido
  if(of==='falda'||of==='vestido'){const sk=mesh(geo('skirt',()=>{const g=new T.CylinderGeometry(.15,.25,.36,16,1,true);g.translate(0,-.15,0);return g;}),of==='falda'?mBot:mTop,0,.02,0,hips);sk.scale.set(bw,1,.8*bw);sk.material=sk.material.clone();sk.material.side=T.DoubleSide;}
  // cuello y cabeza
  const neck=mesh(limbSeg(.05,.055,.08),mSkin,0,.53,0,chest);neck.position.y=.53;neck.rotation.x=Math.PI;
  const head=R.head=grp(chest,0,.6,.005);head.scale.setScalar(1.28);
  buildHead(head,ch,{fem,skin,hair,mSkin,mHair,age});
  // cuello de prenda
  if(of==='hiphop'){const hood=mesh(geo('hood',()=>new T.TorusGeometry(.085,.035,8,16)),mTop,0,.47,-.03,chest);hood.rotation.x=Math.PI/2.4;}
  if(of==='traje'||of==='chandal'||of==='punto'){const c=mesh(geo('collar',()=>new T.TorusGeometry(.06,.018,6,14)),of==='traje'?M('#f3f0e8'):mTop,0,.475,0,chest);c.rotation.x=Math.PI/2;}
  if(of==='traje'){mesh(box(.022,.16,.012),mA2,0,.38,.105*bw,chest);}
  if(of==='obrero'||of==='chandal'){/* rayas / bandas */for(const s of[-1,1]){const st=mesh(box(.012,.3,.012),mA2,s*.075*bw,.27,.107*bw,chest);}}
  if((ch.acc||[]).includes('cadena')){const c=mesh(geo('chain',()=>new T.TorusGeometry(.075,.007,6,24)),M('#e2b33c',{r:.3,m:.8}),0,.45,.03,chest);c.rotation.x=Math.PI/2.3;}
  // ---- piernas ----
  const sleeve=SLEEVE[of]||'short';
  R.legs=[];
  for(const s of[-1,1]){const th=grp(hips,s*.085*bw,-.02,0);
    const legMat=(of==='vestido'||of==='falda')?mSkin:mBot;
    mesh(limbSeg(.078*bw,.058*bw,.41),legMat,0,0,0,th);mesh(sph(.078*bw),legMat,0,0,0,th);
    const kn=grp(th,0,-.41,0);mesh(sph(.058*bw),of==='deporte'?mSkin:legMat,0,0,0,kn);
    mesh(limbSeg(.058*bw,.045*bw,.4),of==='deporte'?mSkin:legMat,0,0,0,kn);
    const an=grp(kn,0,-.4,0);const f=mesh(caps(.047,.1),mShoe,0,-.025,.045,an);f.rotation.x=Math.PI/2;f.scale.set(1.15,1,.85);
    R.legs.push({th,kn,an,s});}
  // ---- brazos ----
  R.arms=[];
  for(const s of[-1,1]){const sh=grp(chest,s*(fem?.15:.175)*bw,.4,0);
    mesh(sph(.058*bw),sleeve==='none'?mSkin:mTop,0,0,0,sh);
    const ua=sleeve==='none'?mSkin:mTop;
    if(sleeve==='short'){mesh(limbSeg(.058*bw,.053*bw,.12),mTop,0,0,0,sh);const lo=mesh(limbSeg(.047*bw,.044*bw,.13),mSkin,0,-.12,0,sh);}
    else mesh(limbSeg(.056*bw,.047*bw,.25),ua,0,0,0,sh);
    const el=grp(sh,0,-.25,0);mesh(sph(.045*bw),sleeve==='long'?ua:mSkin,0,0,0,el);
    mesh(limbSeg(.044*bw,.036*bw,.21),sleeve==='long'?(of==='punk'||of==='vaquera'?mA2:ua):mSkin,0,0,0,el);
    const hand=mesh(sph(.042),mSkin,0,-.24,0,el);hand.scale.set(.8,1.15,.9);const hg=grp(el,0,-.26,0);
    R.arms.push({sh,el,s,hg});}
  R.props={};
  if(ch.helmet){const hm=mesh(sph(.125,16,8),M('#f6c90e',{r:.5}),0,.06,0,head);hm.scale.set(1,.7,1.05);mesh(geo('brim',()=>new T.CylinderGeometry(.15,.15,.012,18)),M('#f6c90e',{r:.5}),0,.045,0,head);}
  if(ch.vest){const v=mesh(lathe(torsoP.slice(1,6).map(([r,y])=>[r+.014,y])),M(ch.vest===true?'#ff7a1a':ch.vest,{r:.6}),0,0,0,chest);v.scale.set(sx,1,sz);for(const yy of[.17,.27]){const b=mesh(geo('vb',()=>new T.TorusGeometry(.17,.012,4,20)),M('#e9e4dc',{r:.4}),0,yy,0,chest);b.rotation.x=Math.PI/2;b.scale.set(sx,sz*1.05,1);}}
  if(of==='punk'||of==='vaquera'){// chaqueta abierta
    const j=mesh(lathe(torsoP.map(([r,y])=>[r+.012,y])),mA2,0,0,0,chest);j.scale.set(sx,1,sz);j.material=M(a2,{r:.7});
    // abertura delantera: un "panel" de camiseta encima
    const pn=mesh(box(.07*bw,.34,.02),mTop,0,.24,.118*bw,chest);}
  if((ch.acc||[]).includes('gorra')){const cap=mesh(sph(.118,16,8),M(ch.capc||a2),0,.07,0,head);cap.scale.set(1,.62,1.05);const v=mesh(box(.15,.012,.1),M(ch.capc||a2),0,.055,ch.capBack?-.15:.13,head);}
  if((ch.acc||[]).includes('gorro')){const cap=mesh(sph(.12,16,8),M(ch.capc||a2,{r:1}),0,.06,0,head);cap.scale.set(1,.85,1.05);}
  root.userData.R=R;return R;
}
function buildHead(head,ch,{fem,skin,hair,mSkin,mHair,age}){
  const sk=mesh(sph(.105,20,16),mSkin,0,0,0,head);sk.scale.set(.9,1.05,.97);
  // mandíbula
  const jaw=mesh(sph(.085,16,12),mSkin,0,-.045,.012,head);jaw.scale.set(fem?.92:1.02,.85,.95);
  // orejas
  for(const s of[-1,1]){const e=mesh(sph(.026,8,6),mSkin,s*.094,-.005,-.005,head);e.scale.set(.5,1,.8);}
  // nariz
  const n=mesh(sph(.022,10,8),M(shadeC(skin,.94),{r:.6}),0,-.02,.106,head);n.scale.set(fem?.85:1.05,1,.9);
  // ojos
  const white=M('#f6f3ee',{r:.3}),iris=M(ch.eyes||'#3b2a20',{r:.25});
  for(const s of[-1,1]){const w=mesh(sph(.019,10,8),white,s*.037,.012,.091,head);w.scale.set(1.15,.8,.6);
    const i=mesh(sph(.012,10,8),iris,s*.037,.011,.101,head);i.scale.set(1,1,.6);
    const lid=mesh(sph(.021,10,6),mSkin,s*.037,.022,.089,head);lid.scale.set(1.15,.45,.6);
    const br=mesh(box(.036,fem?.006:.01,.012),M(shadeC(hair,.85)),s*.039,.046,.1,head);br.rotation.z=-s*.12;br.rotation.y=s*.25;}
  // boca
  const lips=M(fem?'#b4585e':shadeC(skin,.72),{r:.5});const m=mesh(box(.04,.01,.014),lips,0,-.056,.097,head);
  if(fem&&ch.makeup!==false){const l2=mesh(sph(.019,10,6),lips,0,-.058,.093,head);l2.scale.set(1.3,.4,.5);}
  // pelo
  hairStyle(head,ch.style||'corto',mHair,hair,fem&&age<50);
  // barba
  const bd=ch.beard;if(bd&&bd!=='no'&&!fem){const mb=M(age>=58?'#b8b8b8':hair,{r:.9});
    if(bd==='bigote'||bd==='candado'||bd==='perilla'){if(bd!=='perilla'){const b=mesh(box(.05,.012,.02),mb,0,-.043,.098,head);}if(bd!=='bigote'){const p=mesh(sph(.022,10,8),mb,0,-.09,.072,head);p.scale.set(1,.8,.7);}}
    else{const b=mesh(sph(.088,16,12,),mb,0,-.05,.01,head);b.scale.set(1.04,bd==='larga'?1.2:.85,1);b.position.y=bd==='larga'?-.075:-.055;
      if(bd==='sombra'){b.material=M(shadeC(skin,.8),{r:.9});}
      const mo=mesh(box(.05,.012,.02),mb,0,-.043,.098,head);}}
  if(ch.glasses){const gm=M('#1d1b20',{r:.4});for(const s of[-1,1]){const r=mesh(geo('gl',()=>new T.TorusGeometry(.021,.0035,6,16)),gm,s*.038,.012,.104,head);}mesh(box(.02,.004,.004),gm,0,.016,.106,head);}
  if(fem||ch.earrings){const em=M('#e2b33c',{r:.3,m:.8});for(const s of[-1,1]){if(fem&&Math.abs((ch.name||'a').charCodeAt(0)%3)===0)continue;mesh(sph(.008,6,6),em,s*.098,-.03,0,head);}}
}
// --- peinados ---
function bumpy(r,n,seed,amp){const g=new T.SphereGeometry(r,n,Math.round(n*.7));const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const k=1+amp*Math.sin(x*61+seed)*Math.sin(y*57+seed*2)*Math.sin(z*53+seed*3);p.setXYZ(i,x*k,y*k,z*k);}g.computeVertexNormals();return g;}
function capG(cut=.38,r=.112){return geo('cap'+cut+r,()=>{const g=new T.SphereGeometry(r,20,14,0,Math.PI*2,0,Math.PI*cut);return g;});}
function hairStyle(h,st,m,col,fem){
  const cap=(cut=.4,dy=.01,sz=1,r=.112)=>{const c=mesh(capG(cut,r),m,0,dy,-.004,h);c.scale.set(.93*sz,1.05,1.01*sz);c.rotation.x=-.18;return c;};
  const strand=(x,y,z,len,r,rx=0,rz=0)=>{const s=mesh(caps(r,len),m,x,y,z,h);s.rotation.set(rx,0,rz);return s;};
  switch(st){
    case 'calvo':{const c=mesh(geo('ring',()=>new T.TorusGeometry(.093,.018,6,20,Math.PI*1.25)),m,0,.005,-.01,h);c.rotation.set(Math.PI/2,0,-Math.PI*.12+Math.PI);break;}
    case 'rapado':case 'fade':{const c=cap(st==='fade'?.33:.36,.012,1.005);if(st==='fade'){const t=mesh(sph(.1,16,10),m,0,.045,-.005,h);t.scale.set(.9,.55,.95);}break;}
    case 'corto':{cap(.42,.012);const t=mesh(sph(.1,16,10),m,0,.05,.0,h);t.scale.set(.95,.55,1);break;}
    case 'tupe':{cap(.4,.012);const t=mesh(sph(.07,12,10),m,0,.085,.05,h);t.scale.set(1.2,.75,.9);t.rotation.x=-.4;break;}
    case 'hightop':{cap(.33);const t=mesh(geo('ht',()=>new T.CylinderGeometry(.085,.09,.12,16)),m,0,.12,-.01,h);break;}
    case 'twa':case 'afro':case 'puffs':{if(st==='puffs'){cap(.42);for(const s of[-1,1])mesh(bumpy(.065,14,s*3,.07),m,s*.085,.085,-.02,h);break;}
      const r=st==='afro'?.175:.122;const a=mesh(bumpy(r,22,1.7,st==='afro'?.05:.04),m,0,st==='afro'?.04:.018,-.02,h);a.scale.set(1,st==='afro'?.92:.95,st==='afro'?.98:1);
      // despeja la cara
      break;}
    case 'twists':case 'locs':{cap(.36,.012);const n=st==='twists'?26:22;const R0=st==='twists'?.098:.1;
      for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2,ring=i%2;const yy=.06+ring*.02;const rr=R0*(ring?.62:.9);const x=Math.sin(a)*rr,z=Math.cos(a)*rr*.95-.01;
        if(st==='twists'){const s=mesh(bumpy(.03,10,i,.15),m,x,yy+.035,z,h);s.scale.set(1,1.1,1);}
        else{const len=z<-.02?.24:.1;const s=strand(x,yy-len/2+.02,z,len,.016,z<0?-.25:.2,-x*2);}}
      if(st==='twists'){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;mesh(bumpy(.032,10,i+9,.15),m,Math.sin(a)*.03,.11,Math.cos(a)*.03,h);}}
      break;}
    case 'cornrows':{const c=cap(.4,.012);for(let i=-3;i<=3;i++){const r=mesh(geo('cr',()=>new T.TorusGeometry(.108,.0085,5,18,Math.PI*1.1)),m,i*.022,.0,-.004,h);r.rotation.set(0,Math.PI/2,Math.PI*.45);r.scale.set(1,1.02,.95);}break;}
    case 'boxbraids':{cap(.42,.012);for(let i=0;i<22;i++){const a=Math.PI*.35+(i/21)*Math.PI*1.3;const x=Math.sin(a)*.1,z=Math.cos(a)*.095-.01;strand(x,-.12,z,.32,.011,0,-x*.6);}
      const pt=mesh(bumpy(.06,12,2,.1),m,0,.1,-.06,h);break;}
    case 'coleta':{cap(.45,.012);const p=strand(0,-.05,-.13,.2,.033,.35,0);mesh(sph(.025),m,0,.04,-.11,h);break;}
    case 'mono':{cap(.45,.012);mesh(bumpy(.05,14,4,.06),m,0,.1,-.07,h);break;}
    case 'trenzas':{cap(.45,.012);for(const s of[-1,1]){for(let k=0;k<5;k++)mesh(sph(.022,8,6),m,s*.085,-.06-k*.04,-.035,h);}break;}
    case 'rizos':{cap(.45,.01,1.02);const n=fem?34:16;for(let i=0;i<n;i++){const a=Math.PI*.42+((i*0.618)%1)*Math.PI*1.16;const y=fem?.07-((i*7)%10)*.032:.06-((i*7)%4)*.02;const rr=.105+(fem?.02:0);
        mesh(bumpy(fem?.04:.035,10,i,.12),m,Math.sin(a)*rr,y,Math.cos(a)*rr*.95-.015,h);}
      if(!fem)mesh(bumpy(.09,16,2,.08),m,0,.06,0,h).scale.set(1.05,.6,1.05);
      else{const b=mesh(bumpy(.12,16,5,.08),m,0,-.05,-.06,h);b.scale.set(1.15,1.25,.7);}
      break;}
    case 'bob':case 'media':case 'melena':case 'larga':case 'ondas':case 'flequillo':{cap(.45,.012,1.03);
      const len=st==='bob'?.15:st==='media'?.2:st==='melena'?.27:.36;
      const g=geo('shell'+len,()=>{const g=new T.CylinderGeometry(.112,st==='bob'?.118:.13,len,22,1,true,Math.PI*.3,Math.PI*1.4);g.translate(0,-len/2,0);return g;});
      const sh=mesh(g,m,0,.03,-.012,h);sh.scale.set(.98,1,.98);sh.material=M(col,{r:.55});
      const back=mesh(box(.2,len,.04),m,0,.03-len/2,-.085,h);
      if(st==='ondas'||st==='melena'||st==='larga'){for(let i=0;i<6;i++){const a=Math.PI*.6+i/5*Math.PI*.8;mesh(bumpy(.04,8,i,.15),m,Math.sin(a)*.11,.03-len*.85,Math.cos(a)*.1,h);}}
      if(st==='flequillo'||st==='bob'){const f=mesh(box(.16,.04,.03),m,0,.07,.092,h);f.rotation.x=.25;}
      break;}
    default:{cap(.42,.012);}
  }
}
// ---- objetos en la mano ----
function prop(R,k){if(R.props[k])return R.props[k];const g=new T.Group();const pm=(c,o)=>M(c,o||{r:.6});
  switch(k){case 'phone':mesh(box(.035,.07,.008),pm('#1d1b20',{r:.3}),0,-.02,.02,g);break;
    case 'book':mesh(box(.13,.1,.02),pm('#c0392b'),0,0,.0,g);mesh(box(.12,.092,.022),pm('#f3f0e8'),.004,0,0,g);break;
    case 'hammer':mesh(limbSeg(.01,.01,.2),pm('#8a5a32'),0,.05,0,g).rotation.x=Math.PI/2;mesh(box(.03,.03,.09),pm('#5e6670',{r:.3,m:.6}),0,.0,.15,g);break;
    case 'brush':mesh(limbSeg(.008,.008,.18),pm('#8a5a32'),0,.02,0,g).rotation.x=Math.PI/2;mesh(box(.03,.02,.04),pm('#3a86ff'),0,0,.16,g);break;
    case 'shovel':{const h=mesh(limbSeg(.012,.012,.7),pm('#8a5a32'),0,.25,0,g);mesh(box(.12,.16,.015),pm('#7b7f87',{r:.4,m:.5}),0,-.5,0,g);break;}
    case 'can':mesh(geo('can',()=>new T.CylinderGeometry(.05,.055,.1,12)),pm('#3f6b55'),0,-.05,.03,g);break;
    case 'spoon':mesh(limbSeg(.007,.007,.16),pm('#d9c4a0'),0,.02,0,g).rotation.x=Math.PI/2;break;
    case 'guitar':{mesh(geo('gb',()=>{const q=new T.CylinderGeometry(.12,.12,.06,16);q.rotateX(Math.PI/2);return q;}),pm('#b9824f'),0,0,0,g);mesh(box(.035,.32,.02),pm('#4a2c1c'),0,.2,0,g);mesh(geo('gh',()=>{const q=new T.CylinderGeometry(.035,.035,.065,10);q.rotateX(Math.PI/2);return q;}),pm('#2b1d14'),0,0,.002,g);break;}
  }
  R.props[k]=g;return g;}
const ACTS={type:{L:[.9,.9],R:[.9,.9]},work:{L:[.9,.9],R:[.9,.9]},eat:{L:[.6,.9],R:[.9,1.6,'spoon',1]},stir:{L:[.6,.9],R:[1,1.2,'spoon',1]},comedor:{L:[.6,.9],R:[.9,1.6,'spoon',1]},
  book:{L:[.85,1.45],R:[.85,1.45,'book']},phone:{L:[.1,.2],R:[.4,2.45,'phone']},strum:{L:[.75,1.25],R:[.45,1.15,null,2],guitar:1},
  paint:{L:[.1,.2],R:[1.35,.3,'brush',1]},hammer:{L:[.5,.8],R:[1.5,.8,'hammer',3]},dig:{L:[.85,.6],R:[.75,.9,'shovel',3]},water:{L:[.1,.2],R:[.8,.3,'can']},
  cheer:{L:[2.8,.3,null,4],R:[2.8,.3,null,4]},manifestacion:{L:[.1,.2],R:[2.9,.2,null,4]},militancia:{L:[.1,.2],R:[2.6,.4,null,4]},
  talk:{L:[.2,.5],R:[.6,1.1,null,1]},amigos:{L:[.2,.5],R:[.6,1.1,null,1]},networking:{L:[.6,1.4],R:[.6,1.1,null,1]},voluntariado:{L:[.9,.9],R:[.9,.9]},
  shower:{L:[2.3,2.1,null,1],R:[2.3,2.1,null,1]}};
// ---- pose ----
function pose(R,p){const {pose:ps='stand',ph=0,t=0,act=null}=p;
  const walk=ps==='walk',sit=ps==='sit',lie=ps==='lie';
  const r=R.root;r.rotation.set(0,0,0);r.position.set(0,0,0);R.hips.position.y=.88;R.hips.rotation.set(0,0,0);R.chest.rotation.set(0,0,0);R.head.rotation.set(0,0,0);
  for(const L of R.legs){let a=0,k=0,f=0;
    if(walk){const s=Math.sin(ph+(L.s>0?0:Math.PI));a=s*.36;k=Math.max(0,-Math.cos(ph+(L.s>0?0:Math.PI)))*.75+.05;f=-a*.3;}
    else if(sit){a=1.5;k=1.5;}
    else{a=L.s*.02;k=.03;}
    L.th.rotation.set(-a,0,L.s*(sit?.04:.03));L.kn.rotation.x=k;L.an.rotation.x=f-(sit?0:0);}
  if(walk){R.hips.position.y=.88-Math.abs(Math.cos(ph))*.025+.012;R.hips.rotation.y=Math.sin(ph)*.12;R.chest.rotation.y=-Math.sin(ph)*.2;R.chest.rotation.x=.04;}
  if(sit){R.hips.position.y=.44;}
  const br=Math.sin(t*1.6)*.006;R.chest.position.y=.1+br;
  for(const A of R.arms){let a=0,e=.12,z=A.s*.12;
    if(walk){a=-Math.sin(ph+(A.s>0?0:Math.PI))*.45;e=.25+Math.max(0,a)*.4;}
    else{a=Math.sin(t*1.1+A.s)*.03;}
    const AC=act&&ACTS[act];if(sit&&!AC){a=.55;e=.55;}
    if(AC){const q=A.s>0?AC.R:AC.L;a=q[0];e=q[1];z=A.s*.08;const w=q[3]||0;
      if(w===1)a+=Math.sin(t*5+A.s)*.12;if(w===2)e+=Math.sin(t*9)*.25;if(w===3){a+=Math.sin(t*6)*.45;}if(w===4){a+=Math.sin(t*4)*.2;z=A.s*.3;}}
    A.sh.rotation.set(-a,0,z);A.el.rotation.x=-e;
    for(const k in R.props)R.props[k].visible=false;}
  {const AC=act&&ACTS[act];const hr=R.arms.find(A=>A.s>0);if(AC&&AC.R[2]){const g=prop(R,AC.R[2]);if(g.parent!==hr.hg)hr.hg.add(g);g.visible=true;}
   if(AC&&AC.guitar){const g=prop(R,'guitar');if(g.parent!==R.chest){R.chest.add(g);g.position.set(-.02,.2,.13);g.rotation.set(0,0,-1.0);}g.visible=true;}}
  R.head.rotation.y=walk?Math.sin(ph)*.05:Math.sin(t*.4)*.12;R.head.rotation.x=p.sad?.18:Math.sin(t*.7)*.02;
  if(lie){r.rotation.x=-Math.PI/2;r.position.set(0,.18,.9);for(const A of R.arms){A.sh.rotation.set(0,0,A.s*.15);A.el.rotation.x=0;}for(const L of R.legs){L.th.rotation.set(0,0,L.s*.03);L.kn.rotation.x=0;}R.hips.position.y=.88;}
}
// ---- render a canvas 2D ----
let rd=null,scn=null,cam=null;const cache=new Map();
function ensure(){if(rd)return;const cv=document.createElement('canvas');rd=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,preserveDrawingBuffer:true});rd.setPixelRatio(1);rd.outputColorSpace=T.SRGBColorSpace;rd.toneMapping=T.NoToneMapping;
  scn=new T.Scene();const hemi=new T.HemisphereLight('#fff6ea','#5a5068',1.35);scn.add(hemi);const key=new T.DirectionalLight('#fff1dc',2.1);key.position.set(-2,3,3.2);scn.add(key);const rim=new T.DirectionalLight('#bcd2ff',.9);rim.position.set(3,2,-3);scn.add(rim);const fill=new T.DirectionalLight('#ffffff',.35);fill.position.set(2,1,3);scn.add(fill);
  cam=new T.OrthographicCamera(-1,1,1,-1,.1,20);const el=Math.atan(.5);cam.position.set(0,Math.sin(el)*8,Math.cos(el)*8);cam.lookAt(0,0,0);}
function sig(ch){return [ch.g,ch.skin,ch.hair,ch.style,ch.beard,ch.glasses,ch.build,ch.outfit,ch.shirt,ch.pants,ch.acc2,ch.shoes,(ch.acc||[]).join(),ch.capc,ch.capBack,ch.eyes,ch.age>=62?1:0,ch.earrings,ch.helmet,ch.vest,ch.g==='f'&&ch.age<50,ch.name&&ch.name.charCodeAt(0)%3].join('|');}
function model(ch){const k=sig(ch);let R=cache.get(k);if(!R){R=build(ch);cache.set(k,R);if(cache.size>40){const f=cache.keys().next().value;cache.delete(f);}}return R;}
// dibuja en ctx2d con los pies en (x,y); px = píxeles por metro; yaw en radianes (0 = mirando a cámara)
const FC=new Map();let fcN=0;
function draw(ctx2,ch,x,y,px,o={},sc=1){ensure();
  // caché de fotogramas: la pose se cuantiza (12 pasos por zancada, 4 fps en reposo)
  const walk=o.pose==='walk';const TW2=Math.PI*2;const pb=walk?Math.round(((o.ph||0)%TW2+TW2)%TW2/TW2*12)%12:0;const tb=Math.floor((o.t||0)*4)%(o.act?24:16);
  const W0=Math.ceil(px*1.7),H0=Math.ceil(px*2.3);const fk=sig(ch)+'|'+(o.pose||'s')+'|'+(o.yaw||0).toFixed(2)+'|'+(o.act||'')+'|'+pb+'|'+tb+'|'+W0+'|'+(o.sad?1:0);
  let F=FC.get(fk);if(F){FC.delete(fk);FC.set(fk,F);ctx2.drawImage(F,x-F.width/2/sc,y-F.height*.85/sc,F.width/sc,F.height/sc);return;}
  const o2={...o};if(walk)o2.ph=pb/12*TW2;o2.t=tb/4;
  drawRaw(ctx2,ch,x,y,px,o2,sc);
  const src=rd.domElement;F=document.createElement('canvas');F.width=src.width;F.height=src.height;F.getContext('2d').drawImage(src,0,0);FC.set(fk,F);
  if(FC.size>220){const k=FC.keys().next().value;FC.delete(k);}}
function drawRaw(ctx2,ch,x,y,px,o={},sc=1){const R=model(ch);scn.add(R.root);pose(R,o);R.root.rotation.y=(o.yaw||0)+(o.lie?0:0);if(o.lie)R.root.rotation.z=0;
  const W=Math.ceil(px*1.7),H=Math.ceil(px*2.3);const sz=rd.getSize(new T.Vector2());if(sz.x!==W||sz.y!==H)rd.setSize(W,H,false);
  const cw=rd.domElement.width,chh=rd.domElement.height;const hw=cw/2/px,hh=chh/px;
  // los pies (origen) quedan a 85% de la altura del lienzo
  cam.left=-hw;cam.right=hw;cam.top=hh*.85;cam.bottom=-hh*.15;cam.updateProjectionMatrix();
  rd.setClearColor(0,0);rd.clear();rd.render(scn,cam);scn.remove(R.root);
  ctx2.drawImage(rd.domElement,0,0,cw,chh,x-cw/2/sc,y-chh*.85/sc,cw/sc,chh/sc);}
function ok(){try{ensure();return !!rd;}catch(e){return false;}}
return {build,pose,draw,model,sig,ok};
})();
