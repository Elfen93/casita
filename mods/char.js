// ---------- personaje: aspecto, nombre y pronombres ----------
const SKINS=['#f7dcc8','#efc39b','#e0aa7e','#c68a5c','#9a623c','#6a3f25'];
const HAIRCOLS=['#1d1714','#3e2a1e','#5a3825','#8a5a32','#d1ab68','#a63d1f','#bdbdbd','#4f6fd1','#c4568f'];
const EYECOLS=['#3b2a20','#6b4a2a','#5b7a3a','#4a74a8','#2b2b2b'];
const HAIRSTYLES={coleta:'Coleta',melena:'Melena',media:'Media melena',corto:'Corto',rizos:'Rizos',afro:'Afro',mono:'Moño',rapado:'Rapado',calvo:'Calvo'};
const BEARDS={no:'Sin barba',sombra:'Sombra',corta:'Barba corta',larga:'Barba larga',bigote:'Bigote'};
const BUILDS={delgada:['Delgada',0.86],media:['Media',1],ancha:['Ancha',1.16]};
const PANTSC=['#3d405b','#2f3e5c','#5a4636','#2b2b2b','#6b705c','#8c4b5a','#c9b79c'];
const SHIRTC=['#ff8a5b','#5bc0be','#9b5de5','#f15bb5','#00bb7f','#3a86ff','#e9c46a','#f4f1ea','#3b3f46','#c0392b'];
const PRON={f:'Ella',m:'Él',x:'Elle'};
const NAMES={f:['Ana','Lucía','Marta','Carmen','Inés','Nora','Sara','Paula','Alba','Julia','Aitana','Valeria'],m:['Pablo','Hugo','Diego','Javier','Mario','Iker','Óscar','Raúl','Leo','Bruno','Adrián','Marcos'],x:['Alex','Sam','Noa','Ari','Cris','Dani','Eli','Robin','Andy','Sasha']};
const DEFCHAR={name:'Ana',g:'f',skin:'#efc39b',hair:'#5a3825',style:'coleta',beard:'no',glasses:false,build:'media',shirt:'#ff8a5b',pants:'#3d405b',eyes:'#3b2a20',age:27,bday:[5,14]};
const CH=()=>(S&&S.char)||DEFCHAR;
const ga=(f,m,x)=>{const g=CH().g;return g==='m'?m:g==='x'?(x??m):f;};
const oa=()=>ga('a','o','e');
const pickR=a=>a[Math.random()*a.length|0];
function randomChar(){
  const r=Math.random(),g=r<.46?'f':r<.9?'m':'x';
  const st=g==='f'?pickR(['coleta','melena','media','rizos','mono','corto','afro','melena','coleta']):g==='m'?pickR(['corto','corto','rapado','rizos','calvo','media','afro']):pickR(['corto','media','rizos','rapado','mono','afro']);
  const age=22+(Math.random()*20|0);
  return {name:pickR(NAMES[g]),g,skin:pickR(SKINS),hair:age>38&&Math.random()<.3?'#bdbdbd':pickR(HAIRCOLS.slice(0,7)),style:st,beard:g==='m'&&Math.random()<.55?pickR(['sombra','corta','larga','bigote']):'no',glasses:Math.random()<.3,build:pickR(['delgada','media','media','ancha']),
    shirt:pickR(SHIRTC),pants:pickR(PANTSC),eyes:pickR(EYECOLS),age,bday:[Math.random()*12|0,1+(Math.random()*28|0)]};
}
// los textos están escritos para Ana: se adaptan al nombre y al género del personaje
const GW=['Becaria','Técnica','Coordinadora','Directora','Propietaria','propietaria','dueña','enferma','Enferma','cansada','agotada','dormida','sentada','Tirada','tirada','quemada','marcada','equilibrada','contenta','despedida','Bienvenida','Trabajadora','Perezosa','Ahorradora','Derrochadora','Solitaria','Ordenada','Despistada','preocupada','orgullosa','ocupada','sentadita','tumbada','Tumbada','mojada','encantada','harta'];
function gform(w,g){if(w==='Técnica')return g==='m'?'Técnico':'Técnique';if(w==='dueña')return g==='m'?'dueño':'dueñe';if(/ora$/.test(w))return g==='m'?w.slice(0,-1):w.slice(0,-1)+'e';return w.slice(0,-1)+(g==='m'?'o':'e');}
let GRX=null;
function L(s){
  if(s==null||!S||!S.char)return s;const c=S.char;s=String(s);
  if(c.name!=='Ana')s=s.replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])Ana(?![A-Za-zÁÉÍÓÚáéíóúñÑ])/g,(m,a)=>a+c.name);
  if(c.g!=='f'){if(!GRX)GRX=new RegExp('(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])('+GW.join('|')+')(?![A-Za-zÁÉÍÓÚáéíóúñÑ])','g');
    s=s.replace(GRX,(m,a,w)=>a+gform(w,c.g)).replace(/no la ascienden/g,'no le ascienden').replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])ella(?![A-Za-zÁÉÍÓÚáéíóúñÑ])/g,(m,a)=>a+(c.g==='m'?'él':'elle'));}
  return s;
}
function locEl(el){if(!el||el._loc)return;el._loc=1;
  for(const [p,proto] of [['textContent',Node.prototype],['innerHTML',Element.prototype]]){const d=Object.getOwnPropertyDescriptor(proto,p);
    Object.defineProperty(el,p,{get(){return d.get.call(this);},set(v){d.set.call(this,L(v));},configurable:true});}}

// codo/rodilla: cinemática inversa de dos segmentos
function ik2(sx,sy,ex,ey,l1,l2){
  const dx=ex-sx,dy=ey-sy,d=Math.max(0.001,Math.min(Math.hypot(dx,dy),l1+l2-0.01));
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
  const n=Math.hypot(dx,dy)||1;
  const mx=sx+dx/n*a,my=sy+dy/n*a;const p1=[mx-dy/n*h,my+dx/n*h],p2=[mx+dy/n*h,my-dx/n*h];
  return p1[1]+(-p1[0])*0.15>p2[1]+(-p2[0])*0.15?p1:p2; // el codo cae hacia abajo y atrás
}
function drawAna(bx,by,o){
  const tt=performance.now()/1000,C=o.ch||{};
  const skin=o.skin||C.skin||SKIN,hair=o.hair||C.hair||HAIR,pants=o.pants||C.pants||PANTS,style=o.style||C.style||'coleta',beard=o.beard||C.beard||'no',fem=(o.g||C.g||'f')==='f',glasses=o.glasses??C.glasses,eyes=C.eyes||'#3b2a20';
  const bw=(BUILDS[o.build||C.build]||BUILDS.media)[1];
  ctx.save();ctx.translate(bx,by);if(!o.right)ctx.scale(-1,1);
  const walk=o.pose==='walk',sit=o.pose==='sit';
  const ph=anaRT.phase,sw=walk?Math.sin(ph):0;
  const bob=walk?Math.abs(Math.cos(ph))*1.5:Math.sin(tt*2.2)*0.35;
  if(!o.noShadow){ctx.save();ctx.scale(1,.42);const g=ctx.createRadialGradient(0,0,1,0,0,12);g.addColorStop(0,'rgba(20,10,40,.34)');g.addColorStop(1,'rgba(20,10,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.restore();}
  const hipY=sit?-6:-20-bob,shY=hipY-16,front=o.front,act=o.act;
  const pD=shade(pants,.76),shoe='#2a2630';
  const shoeAt=(x,y)=>{ctx.fillStyle=shoe;ctx.beginPath();ctx.ellipse(x+1.3,y+.4,3.2,1.8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.ellipse(x+2,y-.4,1.5,.55,0,0,Math.PI*2);ctx.fill();};
  // piernas
  if(sit){for(const [dx,c] of [[-2,pD],[2.2,pants]]){capsule(dx,hipY,dx+8,hipY+1.5,5.2*bw,c);capsule(dx+8,hipY+1.5,dx+9,hipY+10,4.2*bw,c);shoeAt(dx+9,hipY+11);}}
  else{
    for(const [x,a,c,ofs] of [[-2.3*bw,sw*0.5,pD,0],[2.3*bw,-sw*0.5,pants,Math.PI]]){
      const lift=walk?Math.max(0,Math.sin(ph+ofs))*2.2:0;
      const fx=x+Math.sin(a)*19,fy=hipY+Math.cos(a)*19-lift;
      const d=Math.hypot(fx-x,fy-hipY),bend=Math.sqrt(Math.max(0,96-d*d/4))+0.3;const kx=(x+fx)/2+bend,ky=(hipY+fy)/2;
      capsule(x,hipY,kx,ky,5.4*bw,c);capsule(kx,ky,fx,fy,4.4*bw,c);shoeAt(fx,fy);}
  }
  const shW=(fem?5.4:6.6)*bw,waW=(fem?4.1:5.3)*bw,hiW=(fem?5.6:5.2)*bw;
  const SHX=shW-1.3;
  const sleeve=shade(o.shirt,.92);
  const armDraw=(sx,sy,ex,ey,back)=>{
    const R=13.2,d=Math.hypot(ex-sx,ey-sy);if(d>R){ex=sx+(ex-sx)/d*R;ey=sy+(ey-sy)/d*R;}
    const [elx,ely]=ik2(sx,sy,ex,ey,6.7,6.7);
    const sk=back?shade(skin,.86):skin,sh=back?shade(o.shirt,.78):sleeve;
    capsule(sx,sy,elx,ely,3.4*bw,sk);
    capsule(sx,sy,sx+(elx-sx)*.6,sy+(ely-sy)*.6,4.6*bw,sh);
    capsule(elx,ely,ex,ey,3.0*bw,sk);
    circ(ex,ey,1.9,sk);return [ex,ey];};
  // brazo de atrás
  {let ex,ey;const sx=-SHX,sy=shY+1.5;
    if(act==='type'){ex=8+Math.sin(tt*20)*1.2;ey=shY+9;}
    else if(act==='strum'){ex=11;ey=shY+4;}
    else if(act==='shower'){ex=-3+Math.sin(tt*9)*2;ey=shY-9;}
    else if(act==='cheer'){ex=-9;ey=shY-12;}
    else if(act==='stir'||act==='eat'||act==='book'){ex=5;ey=shY+9;}
    else{const b=walk?sw*0.6:Math.sin(tt*1.1)*0.03;ex=sx+Math.sin(b)*-12.8;ey=sy+Math.cos(b)*12.8;}
    armDraw(sx,sy,ex,ey,true);}
  // pelo largo por detrás del cuerpo
  const hx=1.3,hy=shY-7.6+(o.sad?1:0);
  const hairG=(y0,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(hair,1.22));g.addColorStop(1,shade(hair,.85));return g;};
  const backHair=()=>{ctx.fillStyle=hairG(hy-7,shY+9);
    if(style==='melena'){ctx.beginPath();ctx.moveTo(hx-6.4,hy-2);ctx.quadraticCurveTo(hx-8.4,shY+6,hx-5.5,shY+9.5);ctx.lineTo(hx+3.5,shY+9.5);ctx.quadraticCurveTo(hx+6.5,shY+4,hx+6.2,hy);ctx.closePath();ctx.fill();}
    else if(style==='media'){ctx.beginPath();ctx.moveTo(hx-6.2,hy-2);ctx.quadraticCurveTo(hx-7.4,hy+6,hx-5,hy+7.5);ctx.lineTo(hx+4.5,hy+7.5);ctx.quadraticCurveTo(hx+6.6,hy+5,hx+6.1,hy);ctx.closePath();ctx.fill();}
    else if(style==='afro'){circ(hx-.4,hy-1.6,9.4,shade(hair,.95));}
    else if(style==='rizos'){for(let k=0;k<9;k++){const a=Math.PI*0.55+k*0.25;circ(hx+Math.cos(a)*6.6,hy-1+Math.sin(a)*6.4,2.8,k%2?shade(hair,1.08):hair);}}};
  backHair();
  // torso
  {ctx.fillStyle=pants;roundRect(-hiW,hipY-4,hiW*2,6,2.5);ctx.fill();
    const g=ctx.createLinearGradient(-shW,0,shW,0);g.addColorStop(0,shade(o.shirt,1.12));g.addColorStop(.55,o.shirt);g.addColorStop(1,shade(o.shirt,.8));
    const br=1+Math.sin(tt*2.2)*0.012;
    ctx.save();ctx.translate(0,hipY);ctx.scale(1,br);ctx.translate(0,-hipY);
    ctx.fillStyle=g;ctx.beginPath();
    ctx.moveTo(-shW,shY+2);ctx.quadraticCurveTo(-shW,shY-.6,-shW+2.6,shY-.9);ctx.lineTo(shW-2.6,shY-.9);ctx.quadraticCurveTo(shW,shY-.6,shW,shY+2);
    ctx.quadraticCurveTo(waW+.6,shY+8,waW,hipY-6);ctx.quadraticCurveTo(hiW,hipY-3.5,hiW,hipY-1.4);ctx.lineTo(-hiW,hipY-1.4);ctx.quadraticCurveTo(-hiW,hipY-3.5,-waW,hipY-6);ctx.quadraticCurveTo(-waW-.6,shY+8,-shW,shY+2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.09)';ctx.fillRect(-hiW,hipY-3.2,hiW*2,1.4);
    if(front){if(fem){ctx.fillStyle='rgba(0,0,0,.07)';ctx.beginPath();ctx.ellipse(-1.2,shY+6.3,2.4,1.1,0,0,Math.PI);ctx.fill();ctx.beginPath();ctx.ellipse(3.2,shY+6.3,2.4,1.1,0,0,Math.PI);ctx.fill();}
      ctx.fillStyle=shade(skin,.92);ctx.beginPath();ctx.moveTo(-1.2,shY-.9);ctx.lineTo(1.6,shY+2.6);ctx.lineTo(4.3,shY-.9);ctx.fill();}
    if(o.vest){ctx.fillStyle='#eef3f4';ctx.fillRect(-shW,shY+6,shW*2,1.8);ctx.fillRect(-waW,shY+11,waW*2,1.8);}
    ctx.restore();}
  // cuello
  ctx.fillStyle=shade(skin,.82);roundRect(hx-2.2,shY-3.5,4.4,4.5,1.5);ctx.fill();
  // cabeza
  if(style==='coleta'){const pt=Math.sin(tt*3+(walk?ph:0))*0.22;ctx.save();ctx.translate(hx-5.2,hy-2.5);ctx.rotate(0.45+pt);ctx.fillStyle=hairG(-2,10);ctx.beginPath();ctx.ellipse(-.6,5.2,2.4,6,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(style==='mono'&&!front)circ(hx-1.5,hy-6.3,3,shade(hair,1.05));
  const fg=ctx.createRadialGradient(hx+1.6,hy-1.6,1,hx,hy,7.6);fg.addColorStop(0,shade(skin,1.07));fg.addColorStop(1,shade(skin,.84));
  if(front){
    ctx.fillStyle=shade(skin,.88);ctx.beginPath();ctx.ellipse(hx-4.5,hy+.6,1.4,2.1,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(hx-5.2,hy-1);ctx.bezierCurveTo(hx-5.6,hy-8.4,hx+5.8,hy-8.4,hx+5.4,hy-1);ctx.bezierCurveTo(hx+5.4,hy+3.6,hx+3.6,hy+6.6,hx+1.2,hy+6.8);ctx.bezierCurveTo(hx-2.2,hy+6.6,hx-5.2,hy+3.6,hx-5.2,hy-1);ctx.fill();
    // barba
    if(beard!=='no'){ctx.fillStyle=beard==='sombra'?'rgba(40,30,30,.2)':shade(hair,.92);
      if(beard==='bigote'){ctx.beginPath();ctx.ellipse(hx+2.3,hy+3.4,2.3,.85,0,0,Math.PI*2);ctx.fill();}
      else{const by2=beard==='larga'?hy+9.5:hy+7.2;ctx.beginPath();ctx.moveTo(hx-5,hy+.5);ctx.quadraticCurveTo(hx-4.6,by2,hx+1.2,by2);ctx.quadraticCurveTo(hx+5.6,by2-1,hx+5.3,hy+.5);ctx.lineTo(hx+4.6,hy+2.2);ctx.quadraticCurveTo(hx+1.4,hy+2.4,hx-4,hy+2.2);ctx.closePath();ctx.fill();}}
    // ojos (vista de tres cuartos)
    const blink=(tt%4.1)<0.13||o.sleep;const e1=hx-.4,e2=hx+3.6,ey=hy+.2;
    if(blink){ctx.strokeStyle='#3b3247';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(e1-1.2,ey+.3);ctx.lineTo(e1+1.2,ey+.3);ctx.moveTo(e2-1.1,ey+.3);ctx.lineTo(e2+1.1,ey+.3);ctx.stroke();}
    else{for(const [ex2,rx] of [[e1,1.35],[e2,1.2]]){ctx.fillStyle='#fbfaf7';ctx.beginPath();ctx.ellipse(ex2,ey,rx,.95,0,0,Math.PI*2);ctx.fill();circ(ex2+.3,ey,.78,eyes);circ(ex2+.35,ey,.35,'#111');ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(ex2+.45,ey-.45,.4,.4);
      ctx.strokeStyle='rgba(40,25,25,.75)';ctx.lineWidth=.55;ctx.beginPath();ctx.ellipse(ex2,ey,rx,.95,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}}
    // cejas
    ctx.strokeStyle=shade(hair,.7);ctx.lineWidth=fem?.6:.85;ctx.lineCap='round';const sad=o.sad?.7:0;
    ctx.beginPath();ctx.moveTo(e1-1.4,ey-2.1+sad*-.2);ctx.quadraticCurveTo(e1,ey-2.7,e1+1.3,ey-2.2-sad);ctx.moveTo(e2-1.2,ey-2.2-sad);ctx.quadraticCurveTo(e2,ey-2.7,e2+1.3,ey-2.1);ctx.stroke();
    // nariz
    ctx.strokeStyle=shade(skin,.7);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(hx+2.2,hy+.6);ctx.quadraticCurveTo(hx+3.4,hy+2.4,hx+2.4,hy+2.8);ctx.stroke();
    // mejillas
    if(fem||o.mood>60){ctx.fillStyle='rgba(235,110,100,.16)';ctx.beginPath();ctx.ellipse(hx-2,hy+2.6,1.6,1,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hx+5,hy+2.6,1.1,.9,0,0,Math.PI*2);ctx.fill();}
    // boca
    const lip=fem?'#b9534f':shade(skin,.62),mx=hx+1.9,my=hy+4.3;ctx.strokeStyle=lip;ctx.lineWidth=.8;ctx.beginPath();
    if(act==='eat'&&Math.sin(tt*6)>0){ctx.fillStyle='#6b2b2b';ctx.ellipse(mx,my,1.1,.9,0,0,Math.PI*2);ctx.fill();}
    else if(act==='talk'||act==='phone'){ctx.fillStyle='#6b2b2b';ctx.ellipse(mx,my,1.1,0.4+Math.abs(Math.sin(tt*10))*1,0,0,Math.PI*2);ctx.fill();}
    else if(o.mood>62){ctx.arc(mx,my-1.2,1.9,0.22*Math.PI,0.78*Math.PI);ctx.stroke();}
    else if(o.mood>32){ctx.moveTo(mx-1.4,my);ctx.quadraticCurveTo(mx,my+.3,mx+1.4,my);ctx.stroke();}
    else{ctx.arc(mx,my+1.6,1.7,1.25*Math.PI,1.75*Math.PI);ctx.stroke();}
    if(glasses){ctx.strokeStyle='#2b2b33';ctx.lineWidth=.55;ctx.beginPath();ctx.ellipse(e1,ey,1.9,1.5,0,0,Math.PI*2);ctx.moveTo(e2+1.8,ey);ctx.ellipse(e2,ey,1.8,1.5,0,0,Math.PI*2);ctx.moveTo(e1+1.9,ey-.2);ctx.lineTo(e2-1.8,ey-.2);ctx.moveTo(e1-1.9,ey-.3);ctx.lineTo(hx-4.6,ey-.6);ctx.stroke();}
    // pelo de delante
    if(style!=='calvo'){
      ctx.fillStyle=style==='rapado'?shade(hair,1)+'':hairG(hy-8,hy+2);if(style==='rapado')ctx.globalAlpha=.55;
      ctx.beginPath();ctx.moveTo(hx-5.6,hy+1);ctx.bezierCurveTo(hx-7,hy-9.4,hx+6.6,hy-9.6,hx+5.8,hy-2);
      if(style==='corto'||style==='rapado'){ctx.quadraticCurveTo(hx+4,hy-4.6,hx+1,hy-4.4);ctx.quadraticCurveTo(hx-2.6,hy-4.8,hx-4.4,hy-2.6);ctx.lineTo(hx-4.8,hy+1);}
      else if(style==='rizos'||style==='afro'){for(let k=0;k<5;k++){const xx=hx+5.2-k*2.4;ctx.quadraticCurveTo(xx-.4,hy-2.4,xx-1.2,hy-4);}ctx.lineTo(hx-5.2,hy+1);}
      else{ctx.quadraticCurveTo(hx+4.4,hy-6,hx-.2,hy-4.6);ctx.quadraticCurveTo(hx-3.6,hy-3.4,hx-4.6,hy+1.6);}
      ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      if(style==='melena'||style==='media'){ctx.fillStyle=hairG(hy-4,hy+8);ctx.beginPath();ctx.moveTo(hx-5.8,hy-3);ctx.quadraticCurveTo(hx-7,hy+5,hx-5.4,style==='melena'?shY+5:hy+7);ctx.lineTo(hx-3.8,hy+3);ctx.closePath();ctx.fill();}
      if(style==='afro'){for(let k=0;k<6;k++){const a=Math.PI*1.05+k*0.18;circ(hx+Math.cos(a)*7.4,hy-1.5+Math.sin(a)*7.6,2.6,k%2?shade(hair,1.12):hair);}}
      if(style==='mono')circ(hx-.4,hy-8.4,2.9,hairG(hy-11,hy-5));
      ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.ellipse(hx+1.5,hy-6.3,2.6,.9,-0.2,0,Math.PI*2);ctx.fill();}
  } else {
    ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(hx,hy-.6,5.5,6.6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=shade(skin,.86);ctx.beginPath();ctx.ellipse(hx+4.9,hy+.5,1.3,2,0,0,Math.PI*2);ctx.fill();
    if(style!=='calvo'){ctx.fillStyle=hairG(hy-8,hy+5);if(style==='rapado')ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(hx-.2,hy-1.3,5.9,6.6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      if(style==='afro')circ(hx-.2,hy-1.6,8.6,hair);
      if(style==='rizos')for(let k=0;k<8;k++){const a=k/8*Math.PI*2;circ(hx+Math.cos(a)*5.2,hy-1.5+Math.sin(a)*5.6,2.4,k%2?shade(hair,1.1):hair);}
      if(style==='melena'){ctx.fillStyle=hairG(hy,shY+8);ctx.beginPath();ctx.moveTo(hx-5.8,hy);ctx.quadraticCurveTo(hx-6.5,shY+7,hx-4,shY+8.5);ctx.lineTo(hx+4.5,shY+8.5);ctx.quadraticCurveTo(hx+6.5,shY+6,hx+5.8,hy);ctx.closePath();ctx.fill();}
      if(style==='media'){ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(hx,hy+3.5,6,4.6,0,0,Math.PI*2);ctx.fill();}
      if(style==='mono')circ(hx-.4,hy-7.6,3.1,shade(hair,1.08));
      ctx.fillStyle='rgba(255,255,255,.13)';ctx.beginPath();ctx.ellipse(hx-1.8,hy-4.2,2.4,1.2,0,0,Math.PI*2);ctx.fill();}
  }
  if(o.helmet){ctx.fillStyle='#f6c90e';ctx.beginPath();ctx.arc(hx,hy-2.8,7.4,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(hx-9,hy-3.3,18,2.2);ctx.fillStyle='#ffe066';ctx.fillRect(hx-1,hy-10,2.3,7);}
  // brazo de delante
  let ex,ey,ang=0;const sx=SHX,sy=shY+1.5;
  if(act==='eat'){const k=(Math.sin(tt*3)+1)/2;ex=6+k*-1;ey=shY+12-k*13;}
  else if(act==='stir'){ex=11+Math.cos(tt*7)*3;ey=shY+8+Math.sin(tt*7)*1.5;}
  else if(act==='type'){ex=10+Math.cos(tt*22)*1.2;ey=shY+9;}
  else if(act==='book'){ex=10;ey=shY+6;}
  else if(act==='phone'){ex=hx+5.5;ey=hy+2;}
  else if(act==='talk'){ex=10+Math.sin(tt*4)*3;ey=shY+2+Math.cos(tt*5)*4;}
  else if(act==='strum'){ex=4;ey=shY+11+Math.sin(tt*14)*3;}
  else if(act==='shower'){ex=7+Math.sin(tt*9+1)*2;ey=shY-9;}
  else if(act==='cheer'){ex=9;ey=shY-12;}
  else if(act==='watch'){ex=4;ey=shY+11;}
  else if(act==='hammer'){const k=Math.pow(Math.abs(Math.sin(tt*5)),0.6);ang=-1.25+k*1.65;ex=5+Math.cos(ang)*11;ey=shY+1+Math.sin(ang)*11;}
  else if(act==='paint'){ex=11;ey=shY-2+Math.sin(tt*5)*7;}
  else if(act==='dig'){const k=Math.abs(Math.sin(tt*4));ex=10;ey=shY+11+k*3;}
  else{const b=walk?-sw*0.6:Math.sin(tt*1.3)*0.04;ex=sx+Math.sin(b)*12.8;ey=sy+Math.cos(b)*12.8;}
  if(act==='strum'){ctx.save();ctx.translate(2,shY+9);ctx.rotate(-0.55);
    ctx.fillStyle='#d4873b';ctx.beginPath();ctx.ellipse(0,0,6.5,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(6,0,4.5,3.8,0,0,Math.PI*2);ctx.fill();
    circ(3,0,1.6,'#3a2516');ctx.fillStyle='#5a3825';ctx.fillRect(9,-1.2,13,2.4);ctx.fillRect(21,-2,4,4);ctx.restore();}
  if(act==='book'){ctx.fillStyle='#c0392b';ctx.fillRect(7,shY+1,8,7);ctx.fillStyle='#fff';ctx.fillRect(8,shY+2,6,5);ctx.fillStyle='#ddd';ctx.fillRect(10.8,shY+2,.6,5);}
  [ex,ey]=armDraw(sx,sy,ex,ey,false);
  if(act==='hammer'){const hx2=ex+Math.cos(ang)*8,hy2=ey+Math.sin(ang)*8;capsule(ex,ey,hx2,hy2,1.8,'#8a5a2b');ctx.save();ctx.translate(hx2,hy2);ctx.rotate(ang);ctx.fillStyle='#5f6670';ctx.fillRect(-2,-4.5,4.5,9);ctx.restore();}
  if(act==='paint'){capsule(ex,ey,ex+2,ey-8,1.6,'#8a5a2b');ctx.fillStyle=o.paintCol||'#f4c7bd';ctx.fillRect(ex-2,ey-13,9,5);}
  if(act==='phone'){ctx.fillStyle='#2b2b33';ctx.save();ctx.translate(ex,ey);ctx.rotate(-0.9);roundRect(-1.6,-4.5,3.2,8,1);ctx.fill();ctx.restore();}
  if(act==='eat'){circ(ex+2,ey-1,2.2,'#e9c46a');}
  if(act==='dig'){capsule(ex,ey,ex+3,ey+7,1.4,'#8a5a2b');ctx.fillStyle='#8a8f98';ctx.beginPath();ctx.ellipse(ex+3.5,ey+8.5,2,1.2,0.5,0,Math.PI*2);ctx.fill();}
  if(act==='water'){ctx.fillStyle='#3fa7a2';roundRect(ex-1,ey-1,7,5,1.5);ctx.fill();capsule(ex+6,ey,ex+10,ey-2,1.2,'#3fa7a2');}
  ctx.restore();
  return [bx,by+hy-12];
}
// retrato detallado (panel, creador y tarjeta de arriba)
function paintPortrait(c,ch,md=65,nobg){
  const x=c.getContext('2d'),k=c.width/100;x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,100,100);
  const skin=ch.skin,hair=ch.hair,bw=(BUILDS[ch.build]||BUILDS.media)[1],fem=ch.g==='f',st=ch.style,old=(ch.age||27)>=45;
  const E=(cx,cy,rx,ry,col,r=0)=>{x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,rx,ry,r,0,Math.PI*2);x.fill();};
  const HG=(y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(hair,1.3));g.addColorStop(1,shade(hair,.82));return g;};
  if(!nobg){x.save();x.beginPath();x.arc(50,50,50,0,Math.PI*2);x.clip();const bg=x.createLinearGradient(0,0,0,100);bg.addColorStop(0,'#fde9d8');bg.addColorStop(1,'#e6dcf3');x.fillStyle=bg;x.fillRect(0,0,100,100);}
  // pelo de atrás
  x.fillStyle=HG(15,95);
  if(st==='melena'){x.beginPath();x.moveTo(26,40);x.quadraticCurveTo(20,80,28,96);x.lineTo(72,96);x.quadraticCurveTo(80,80,74,40);x.closePath();x.fill();}
  else if(st==='media'){x.beginPath();x.moveTo(27,40);x.quadraticCurveTo(24,66,30,74);x.lineTo(70,74);x.quadraticCurveTo(76,66,73,40);x.closePath();x.fill();}
  else if(st==='afro'){E(50,40,33,30,shade(hair,.95));}
  else if(st==='rizos'){for(let i=0;i<16;i++){const a=Math.PI*(0.05+i/15*0.9)+Math.PI;E(50+Math.cos(a)*24,44+Math.sin(a)*24,8,8,i%2?shade(hair,1.1):hair);}for(let i=0;i<6;i++)E(29+(i%2)*42,52+i*3.5,7,7,hair);}
  else if(st==='coleta'){E(73,58,6,14,HG(44,74),-0.3);}
  else if(st==='mono'){E(50,15,10,9,HG(6,24));}
  // hombros y camiseta
  const sw=(fem?29:34)*bw;const sg=x.createLinearGradient(50-sw,0,50+sw,0);sg.addColorStop(0,shade(ch.shirt,1.12));sg.addColorStop(1,shade(ch.shirt,.78));
  x.fillStyle=shade(skin,.85);x.fillRect(42,58,16,20);
  x.fillStyle=sg;x.beginPath();x.moveTo(50-sw-8,104);x.quadraticCurveTo(50-sw-2,79,40,75);x.quadraticCurveTo(50,86,60,75);x.quadraticCurveTo(50+sw+2,79,50+sw+8,104);x.closePath();x.fill();
  x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.moveTo(41,75.5);x.quadraticCurveTo(50,86,59,75.5);x.quadraticCurveTo(50,82,41,75.5);x.fill();
  // orejas y cara
  E(31.5,50,3.6,5.6,shade(skin,.88));E(68.5,50,3.6,5.6,shade(skin,.88));
  const fg=x.createRadialGradient(46,42,3,50,50,26);fg.addColorStop(0,shade(skin,1.08));fg.addColorStop(1,shade(skin,.86));x.fillStyle=fg;
  const jw=fem?0:2;x.beginPath();x.moveTo(32,44);x.bezierCurveTo(31,20,69,20,68,44);x.bezierCurveTo(68,58+jw,60,70,50,71);x.bezierCurveTo(40,70,32,58+jw,32,44);x.fill();
  if(old){x.strokeStyle='rgba(120,70,60,.25)';x.lineWidth=.7;x.beginPath();x.moveTo(38,58);x.quadraticCurveTo(40,62,43,63);x.moveTo(62,58);x.quadraticCurveTo(60,62,57,63);x.moveTo(41,36);x.lineTo(46,35.5);x.moveTo(54,35.5);x.lineTo(59,36);x.stroke();}
  // barba
  if(ch.beard&&ch.beard!=='no'){x.fillStyle=ch.beard==='sombra'?'rgba(40,30,30,.18)':shade(hair,.9);
    if(ch.beard==='bigote'){x.beginPath();x.moveTo(42,60);x.quadraticCurveTo(50,56,58,60);x.quadraticCurveTo(50,59,42,60);x.fill();}
    else{const by=ch.beard==='larga'?84:73;x.beginPath();x.moveTo(32,48);x.quadraticCurveTo(33,by,50,by);x.quadraticCurveTo(67,by,68,48);x.lineTo(65,52);x.quadraticCurveTo(62,62,57,60);x.quadraticCurveTo(50,57,43,60);x.quadraticCurveTo(38,62,35,52);x.closePath();x.fill();}}
  // ojos
  const eyeY=48;for(const ex of [41.5,58.5]){E(ex,eyeY,4.2,2.7,'#fbfaf7');E(ex+.3,eyeY,2.3,2.3,ch.eyes||'#3b2a20');E(ex+.3,eyeY,1.1,1.1,'#111');E(ex+1,eyeY-.9,.7,.7,'rgba(255,255,255,.95)');
    x.strokeStyle='rgba(40,25,25,.85)';x.lineWidth=fem?1.2:.9;x.beginPath();x.ellipse(ex,eyeY,4.2,2.7,0,Math.PI*1.02,Math.PI*1.98);x.stroke();
    if(fem){x.beginPath();x.moveTo(ex+3.8,eyeY-1.4);x.lineTo(ex+5,eyeY-2.4);x.stroke();}}
  // cejas
  const sad=md<35?2:0,happy=md>70?-.6:0;x.strokeStyle=shade(hair,.65);x.lineCap='round';x.lineWidth=fem?1.5:2.3;
  x.beginPath();x.moveTo(36.5,43+happy);x.quadraticCurveTo(41,40.5+happy,45.5,42-sad);x.moveTo(54.5,42-sad);x.quadraticCurveTo(59,40.5+happy,63.5,43+happy);x.stroke();
  // nariz
  x.strokeStyle=shade(skin,.68);x.lineWidth=1;x.beginPath();x.moveTo(50,49);x.quadraticCurveTo(48,55,47.5,56.5);x.quadraticCurveTo(50,58.5,53,56.5);x.stroke();
  // mejillas
  x.fillStyle=`rgba(230,110,100,${fem?.16:.08})`;E(39,57,4,2.4,x.fillStyle);E(61,57,4,2.4,x.fillStyle);
  // boca
  const lip=fem?'#c2574f':shade(skin,.6);x.strokeStyle=lip;x.lineWidth=1.6;x.beginPath();
  if(md>68){x.moveTo(43.5,62);x.quadraticCurveTo(50,67.5,56.5,62);x.stroke();if(fem){x.fillStyle=shade(lip,1.1);x.beginPath();x.moveTo(44.5,62.6);x.quadraticCurveTo(50,66.8,55.5,62.6);x.quadraticCurveTo(50,64.3,44.5,62.6);x.fill();}}
  else if(md>38){x.moveTo(45,63);x.quadraticCurveTo(50,64.3,55,63);x.stroke();}
  else{x.moveTo(45,64.5);x.quadraticCurveTo(50,61.5,55,64.5);x.stroke();}
  // pelo de delante
  if(st!=='calvo'){x.fillStyle=HG(16,46);if(st==='rapado')x.globalAlpha=.5;
    x.beginPath();x.moveTo(30.5,47);x.bezierCurveTo(26,13,74,13,69.5,47);
    if(st==='corto'||st==='rapado'){x.quadraticCurveTo(67,32,58,30);x.quadraticCurveTo(46,33,36,29.5);x.quadraticCurveTo(32,34,30.5,47);}
    else if(st==='rizos'||st==='afro'){for(let i=0;i<7;i++){const xx=68-i*6;x.quadraticCurveTo(xx-1,33,xx-4,29);}x.lineTo(30.5,47);}
    else if(st==='coleta'||st==='mono'){x.quadraticCurveTo(66,30,54,28);x.quadraticCurveTo(38,30,30.5,47);}
    else{x.quadraticCurveTo(64,28,50,30);x.quadraticCurveTo(36,34,30.5,47);}
    x.closePath();x.fill();x.globalAlpha=1;
    if(st==='melena'||st==='media'){x.fillStyle=HG(30,80);x.beginPath();x.moveTo(30.5,40);x.quadraticCurveTo(26,64,29,st==='melena'?82:72);x.lineTo(34,64);x.quadraticCurveTo(32,50,34,40);x.closePath();x.fill();x.beginPath();x.moveTo(69.5,40);x.quadraticCurveTo(74,64,71,st==='melena'?82:72);x.lineTo(66,64);x.quadraticCurveTo(68,50,66,40);x.closePath();x.fill();}
    if(st==='afro'||st==='rizos')for(let i=0;i<7;i++)E(32+i*6,26-Math.sin(i/6*Math.PI)*6,5.5,5,i%2?shade(hair,1.12):hair);
    x.fillStyle='rgba(255,255,255,.16)';x.beginPath();x.ellipse(44,22,8,2.4,-0.25,0,Math.PI*2);x.fill();}
  if(ch.glasses){x.strokeStyle='#2b2b33';x.lineWidth=1.4;x.beginPath();x.ellipse(41.5,48,6.2,4.8,0,0,Math.PI*2);x.moveTo(64.7,48);x.ellipse(58.5,48,6.2,4.8,0,0,Math.PI*2);x.moveTo(47.7,47);x.quadraticCurveTo(50,45.8,52.3,47);x.moveTo(35.3,47);x.lineTo(31,46);x.moveTo(64.7,47);x.lineTo(69,46);x.stroke();x.fillStyle='rgba(200,230,255,.12)';E(41.5,48,6,4.6,x.fillStyle);E(58.5,48,6,4.6,x.fillStyle);}
  if(!nobg)x.restore();
}
