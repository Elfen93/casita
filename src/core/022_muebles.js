// ---------- muebles ----------
// Cada mueble se dibuja en coordenadas locales (a: de lado a lado, b: de atrás (0) hacia delante (1)).
// Se gira según su orientación y, si tiene una pared detrás, se desplaza hasta tocarla.
const BACKD={silla:.28,banco:.1,nevera:.18,fogon:.1,cama:.06,sofa:.1,vater:.16,ducha:.06,tele:.3,libros:.32,compu:.2,espejo:.44,telefono:.28};
const WDIR=[[0,-1],[1,0],[0,1],[-1,0]];
const solidAt=(x,y)=>inb(x,y)&&(S.wall[idx(x,y)]===1||S.wall[idx(x,y)]===3);
function autoDir(x,y){for(let r=0;r<4;r++){const [dx,dy]=WDIR[r];if(solidAt(x+dx,y+dy))return r;}return 0;}
const FR={X:0,Y:0,R:0,sx:0,sy:0};
function setFrame(vx,vy,t,r,wx,wy){
  r=r||0;FR.X=vx;FR.Y=vy;FR.R=(r+rot)%4;let sh=0;
  if(BACKD[t]!=null&&wx!=null){const [dx,dy]=WDIR[r];if(solidAt(wx+dx,wy+dy))sh=BACKD[t]+0.355;}
  FR.sx=[0,1,0,-1][FR.R]*sh;FR.sy=[-1,0,1,0][FR.R]*sh;
}
function Lv(a,b){const X=FR.X+FR.sx,Y=FR.Y+FR.sy;switch(FR.R){case 1:return [X+1-b,Y+a];case 2:return [X+1-a,Y+1-b];case 3:return [X+b,Y+1-a];default:return [X+a,Y+b];}}
function Ldir(da,db){switch(FR.R){case 1:return [-db,da];case 2:return [-da,-db];case 3:return [db,-da];default:return [da,db];}}
const lvis=(da,db)=>{const [x,y]=Ldir(da,db);return x>0.5||y>0.5;};
const LP=(a,b,z)=>{const [x,y]=Lv(a,b);return P(x,y,z);};
function lp(a0,b0,a1,b1,z0,z1,col){const [p,q]=Lv(a0,b0),[r,s]=Lv(a1,b1);prism(Math.min(p,r),Math.min(q,s),Math.max(p,r),Math.max(q,s),z0,z1,col);}
function lfB(a0,a1,b,za,zb,col,dir=1){if(!lvis(0,dir))return;poly([LP(a0,b,za),LP(a1,b,za),LP(a1,b,zb),LP(a0,b,zb)],col);}
function lfA(a,b0,b1,za,zb,col,dir=1){if(!lvis(dir,0))return;poly([LP(a,b0,za),LP(a,b1,za),LP(a,b1,zb),LP(a,b0,zb)],col);}
function ltop(a0,b0,a1,b1,z,col){poly([LP(a0,b0,z),LP(a1,b0,z),LP(a1,b1,z),LP(a0,b1,z)],col);}
function lcyl(a,b,r,z0,z1,col,top){const [x,y]=Lv(a,b);cyl(x,y,r,z0,z1,col,top);}
const ldepth=(a,b)=>{const [x,y]=Lv(a,b);return x+y;};
function layers(list){list.sort((p,q)=>p[0]-q[0]);for(const [,f] of list)f();}
function frontFacing(){const [du,dv]=Ldir(0,1);return {right:du-dv>0,front:du+dv>0};}

function drawObj(vx,vy,o,i,ghost,wx,wy){
  const d=OBJ[o.t]; if(!d) return;
  setFrame(vx,vy,o.t,o.r,wx,wy);
  const tt=performance.now()/1000,s=S.sim;
  const inUse=!ghost&&i!=null&&s.use&&s.use.i===i&&!s.work;
  const an=!ghost&&i!=null&&animOf(i);
  ctx.save();
  if(an&&an.k==='obj')ctx.translate(0,-dropOffset(an.t));
  const night=nightFactor();
  const anaOn=(a,b,z,mod)=>()=>{const [bx,by]=LP(a,b,z);const op=anaOpts();Object.assign(op,frontFacing(),{noShadow:true},mod||{});bubbleAt=drawAna(bx,by,op);};
  switch(o.t){
  case 'huerto':case 'bancoj':case 'barbacoa':case 'fuente':drawGardenObj(o,i,tt);break;
  case 'nevera':{
    lp(.18,.18,.82,.82,0,50,'#eef3f6');
    lp(.18,.18,.82,.82,49,50.5,'#f8fbfc');
    lfB(.18,.82,.821,32.6,33.6,'#b8c4cc');lfA(.821,.18,.82,32.6,33.6,'#aab6be');
    lfB(.68,.72,.822,37,46,'#9aa5ad');lfB(.68,.72,.822,18,29,'#9aa5ad');
    if(inUse){lfB(.22,.78,.823,3,31,'#fff6cf');lfB(.3,.7,.824,16,17,'#cfe3ea');circ(...LP(.4,.825,22),2,'#e86a6a');circ(...LP(.6,.825,8),2.4,'#7cc46a');
      poly([LP(.18,.82,2),LP(.18,1.3,2),LP(.18,1.3,32),LP(.18,.82,32)],'#e2e9ee');}
    break;}
  case 'fogon':{
    lp(.1,.1,.9,.9,0,24,'#ece6dc');lp(.1,.1,.9,.9,23,25,'#d9d2c6');
    ltop(.16,.16,.84,.84,25.2,'#2b2f36');
    for(const [a,b] of [[.33,.33],[.67,.33],[.33,.67],[.67,.67]]){const [x,y]=LP(a,b,25.4);ctx.strokeStyle=inUse&&b<.5?`rgb(255,${90+Math.sin(tt*9+a*9)*30|0},40)`:'#555';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y,5,2.5,0,0,Math.PI*2);ctx.stroke();}
    lfB(.2,.8,.9,4,18,'#3a3f47');lfB(.26,.74,.901,7,15,inUse?'#ffb36b':'#59606b');lfB(.3,.7,.902,19,20.5,'#9aa5ad');
    if(inUse){lcyl(.33,.33,.13,25.5,29,'#30343b','#6b4a2b');const [x,y]=LP(.33,.33,29.5);circ(x+Math.sin(tt*7)*2,y,1.5,'#e9c46a');}
    break;}
  case 'cama':{
    const blanket='#6c8ebf';
    lp(.06,.06,.94,.94,0,9,'#9b6b43');
    lp(.1,.15,.9,.9,9,15,'#fbfaf6');
    const br=inUse?Math.sin(tt*1.6)*0.8:0;
    const L=[];
    L.push([ldepth(.5,.1),()=>{lp(.06,.06,.94,.15,0,28,'#8a5d39');lp(.06,.06,.94,.15,28,30,'#a4744d');}]);
    L.push([ldepth(.5,.27),()=>lp(.22,.18,.78,.36,15,inUse?19:20,'#ffffff')]);
    const _sl=inUse?bedSleepers(i):null;if(_sl)bedSleepLayers(L,_sl,blanket,tt);
    if(inUse&&!_sl)L.push([ldepth(.5,.3)+.001,()=>{const [hx,hy]=LP(.5,.29,22);ctx.fillStyle=CH().style==='calvo'?CH().skin:CH().hair;ctx.beginPath();ctx.ellipse(hx,hy-1,10,6,0,0,Math.PI*2);ctx.fill();circ(hx,hy+2,7,CH().skin);ctx.fillStyle='#3b3247';ctx.fillRect(hx-4,hy+2,3,1);ctx.fillRect(hx+1.5,hy+2,3,1);bubbleAt=[hx,hy-14];}]);
    if(!_sl)L.push([ldepth(.5,.66),()=>{
      lp(.1,.42,.9,.92,15,inUse?18+br:17.5,blanket);
      if(inUse){const [bx,by]=LP(.5,.64,18+br);ctx.fillStyle=shade(blanket,1.08);ctx.beginPath();ctx.ellipse(bx,by,14,6,0,0,Math.PI*2);ctx.fill();}
      lp(.1,.42,.9,.5,15,inUse?19+br:18.5,'#eaf0fa');}]);
    layers(L);
    break;}
  case 'sofa':{
    const c='#c0705a';
    lp(.06,.1,.94,.92,0,8,shade(c,.85));
    const L=[];
    L.push([ldepth(.5,.2),()=>{lp(.06,.1,.94,.3,8,30,c);lp(.18,.24,.48,.32,14,28,shade(c,1.1));lp(.52,.24,.82,.32,14,28,shade(c,1.1));}]);
    L.push([ldepth(.13,.61),()=>lp(.06,.3,.2,.92,8,19,c)]);
    L.push([ldepth(.5,.61),()=>lp(.2,.32,.8,.9,8,13,shade(c,1.05))]);
    if(inUse&&sofaDoze())L.push([ldepth(.5,.61)+.01,()=>sofaNap(tt)]);else if(inUse)L.push([ldepth(.5,.61)+.01,anaOn(.5,.55,13,{pose:'sit',act:Math.sin(tt*.5)>.6?'watch':null})]);
    L.push([ldepth(.87,.61),()=>lp(.8,.3,.94,.92,8,19,c)]);
    layers(L);
    break;}
  case 'vater':{
    const L=[];
    L.push([ldepth(.5,.25),()=>{lp(.3,.16,.7,.34,0,30,'#f4f6f7');lp(.28,.14,.72,.36,30,32,'#e6eaec');}]);
    L.push([ldepth(.5,.6),()=>{lcyl(.5,.6,.21,0,13,'#f4f6f7','#e3e7ea');const [x,y]=LP(.5,.6,13.2);ctx.fillStyle='#a8d8ef';ctx.beginPath();ctx.ellipse(x,y,7,3.6,0,0,Math.PI*2);ctx.fill();}]);
    if(inUse)L.push([ldepth(.5,.6)+.01,anaOn(.5,.6,13,{pose:'sit'})]);
    layers(L);
    break;}
  case 'ducha':{
    lp(.06,.06,.94,.94,0,4,'#e7eef2');
    const [dx,dy]=LP(.5,.5,4.2);circ(dx,dy,1.6,'#9aa7b1');
    const fog=inUse?'rgba(225,238,245,.5)':'rgba(190,225,245,.25)';
    const pane=(pts,col)=>()=>{poly(pts,col);};
    const L=[];
    L.push([ldepth(.5,.06),pane([LP(.06,.06,4),LP(.94,.06,4),LP(.94,.06,58),LP(.06,.06,58)],'rgba(170,200,215,.35)')]);
    L.push([ldepth(.06,.5),pane([LP(.06,.06,4),LP(.06,.94,4),LP(.06,.94,58),LP(.06,.06,58)],'rgba(150,185,200,.35)')]);
    L.push([ldepth(.15,.15),()=>{lp(.12,.12,.17,.17,4,60,'#9aa7b1');const [a,b]=LP(.15,.15,58),[e,g]=LP(.42,.38,56);capsule(a,b,e,g,2,'#9aa7b1');ctx.fillStyle='#c5ced5';ctx.beginPath();ctx.ellipse(e,g+2,6,3,0,0,Math.PI*2);ctx.fill();}]);
    if(inUse)L.push([ldepth(.55,.6),anaOn(.55,.6,4,{act:'shower'})]);
    L.push([ldepth(.5,.94),pane([LP(.06,.94,4),LP(.94,.94,4),LP(.94,.94,54),LP(.06,.94,54)],fog)]);
    L.push([ldepth(.94,.5),pane([LP(.94,.06,4),LP(.94,.94,4),LP(.94,.94,54),LP(.94,.06,54)],fog)]);
    L.push([ldepth(.94,.94)+.01,()=>lp(.92,.92,.96,.96,4,56,'#c5ced5')]);
    layers(L);
    break;}
  case 'tele':{
    lp(.08,.3,.92,.85,0,13,'#7a5236');lfB(.12,.48,.85,3,11,'#6a4630');lfB(.52,.88,.85,3,11,'#6a4630');
    lp(.4,.45,.6,.55,13,16,'#222');
    lp(.1,.42,.9,.48,16,42,'#1c1f24');
    if(inUse){const hue=(tt*40)%360,fl=0.75+Math.sin(tt*13)*0.08+Math.sin(tt*7.1)*0.07;
      lfB(.13,.87,.481,18,40,`hsl(${hue},55%,${45*fl+20}%)`);lfB(.13,.5,.482,18,26,`hsl(${(hue+120)%360},60%,55%)`);lfB(.55,.8,.482,30,37,`hsl(${(hue+220)%360},60%,65%)`);}
    else lfB(.13,.87,.481,18,40,'#27303d');
    break;}
  case 'libros':{
    lp(.1,.32,.9,.72,0,58,'#8b5a3c');lp(.08,.3,.92,.74,58,60,'#9c6845');
    if(lvis(0,1)){
      lfB(.14,.86,.72,3,54,'#5e3b26');
      const cols=['#c0392b','#2e86de','#f6b93b','#10ac84','#8e44ad','#e67e22','#ecf0f1','#34495e'];
      for(let sh=0;sh<3;sh++){const z=4+sh*17;lfB(.14,.86,.721,z+15,z+16.5,'#8b5a3c');
        let a=.16;for(let k=0;k<9&&a<.83;k++){const r=hash((i||1)*7+sh*13+k);const w=.05+r*.035,hgt=9+r*5;lfB(a,Math.min(.84,a+w),.722,z,z+hgt,cols[(k+sh*3+((i||0)%5))%cols.length]);a+=w+.008;}}
    }
    break;}
  case 'compu':{
    for(const [a,b] of [[.1,.25],[.86,.25],[.1,.72],[.86,.72]])lp(a,b,a+.04,b+.04,0,21,'#5e4a3a');
    lp(.06,.2,.94,.8,21,25,'#b08060');
    lp(.46,.3,.54,.36,25,29,'#2b2b2b');
    lp(.22,.28,.78,.34,29,47,'#222');
    if(inUse){lfB(.25,.75,.341,31,45,'#1d3557');for(let k=0;k<5;k++){const w=.08+hash(k+Math.floor(tt*3))*.25;lfB(.28,.28+w,.342,42-k*2.6,43-k*2.6,['#5bc0be','#f6c453','#e86a6a','#9fe3b0','#fff'][k]);}}
    else lfB(.25,.75,.341,31,45,'#27303d');
    ltop(.3,.5,.7,.62,25.3,'#d9d9d9');
    break;}
  case 'guitarra':{
    lp(.38,.55,.62,.62,0,3,'#3b3f46');
    if(!inUse){const [gx,gy]=LP(.5,.5,6);ctx.save();ctx.translate(gx,gy);
      ctx.fillStyle='#d4873b';ctx.beginPath();ctx.ellipse(0,-6,8,9,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(0,-17,6,6.5,0,0,Math.PI*2);ctx.fill();
      circ(0,-11,2.4,'#3a2516');ctx.fillStyle='#5a3825';ctx.fillRect(-1.3,-38,2.6,22);ctx.fillRect(-2.5,-43,5,6);ctx.restore();}
    break;}
  case 'telefono':{
    for(const [a,b] of [[.3,.3],[.66,.3],[.3,.66],[.66,.66]])lp(a,b,a+.04,b+.04,0,16,'#7a5230');
    lp(.28,.28,.72,.72,16,20,'#a47148');
    lp(.38,.4,.62,.6,20,25,'#b23a48');
    if(!inUse)lp(.36,.42,.64,.5,25,28,'#8f2235');
    break;}
  case 'espejo':{
    lp(.28,.5,.32,.62,0,6,'#a88752');lp(.68,.5,.72,.62,0,6,'#a88752');
    lp(.2,.44,.8,.5,4,60,'#c7a46b');
    if(lvis(0,1)){const g=ctx.createLinearGradient(...LP(.24,.5,56),...LP(.76,.5,8));g.addColorStop(0,'#eef4f8');g.addColorStop(1,'#a9bccb');
      lfB(.24,.76,.501,8,56,g);
      const sh=((tt*0.25)%1.6)-0.3;if(sh>0&&sh<1){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=3;ctx.beginPath();const [a,b]=LP(.24+sh*.4,.502,10),[e,f]=LP(.36+sh*.4,.502,54);ctx.moveTo(a,b);ctx.lineTo(e,f);ctx.stroke();}}
    break;}
  case 'silla':{
    const c=O_COL(o,'#a47148');
    for(const [a,b] of [[.3,.32],[.66,.32],[.3,.68],[.66,.68]])lp(a,b,a+.04,b+.04,0,9,shade(c,.8));
    const L=[];L.push([ldepth(.5,.29),()=>lp(.28,.26,.72,.32,9,27,c)]);L.push([ldepth(.5,.52),()=>lp(.28,.3,.72,.72,9,11.5,shade(c,1.08))]);
    if(s.use&&s.use.seat===i&&!s.work&&!ghost){const ti=s.use.i;L.push([ldepth(.5,.52)+.01,()=>{const [bx,by]=LP(.5,.52,11.5);const [u0,v0]=w2v((i%N)+.5,(i/N|0)+.5),[u1,v1]=w2v((ti%N)+.5,(ti/N|0)+.5);const du=u1-u0,dv=v1-v0;const op=anaOpts();Object.assign(op,{pose:'sit',noShadow:true,right:du-dv>0,front:du+dv>0,act:s.use.type==='compu'?'type':s.use.type==='_meal'?'eat':(ACTS[s.use.type]||null)});bubbleAt=drawAna(bx,by,op);}]);}
    layers(L);
    break;}
  case 'banco':{
    for(const [a,b] of [[.08,.22],[.88,.22],[.08,.74],[.88,.74]])lp(a,b,a+.05,b+.05,0,21,'#8a5d39');
    lp(.08,.24,.93,.78,6,8,'#9c6b45');
    lp(.06,.2,.94,.8,21,25,'#c49a6c');
    lp(.06,.12,.94,.17,21,48,'#d9c3a0');
    lfB(.2,.24,.171,30,44,'#5f6670');lfB(.32,.48,.171,40,42,'#8a5a2b');lfB(.55,.75,.171,33,35,'#c0392b');lfB(.8,.86,.171,28,44,'#3b3f46');
    lp(.7,.55,.86,.7,25,30,'#5f6670');ltop(.2,.45,.5,.6,25.2,'#e7d3b0');
    break;}
  case 'mesa':{
    for(const [a,b] of [[.1,.1],[.84,.1],[.1,.84],[.84,.84]])lp(a,b,a+.06,b+.06,0,20,'#7a5230');
    lp(.06,.06,.94,.94,20,24,'#a47148');
    lcyl(.5,.5,.07,24,32,'#5bc0be');const [fx,fy]=LP(.5,.5,34);circ(fx-2,fy,2.4,'#ff8fab');circ(fx+2,fy-1,2.4,'#ffd166');
    if(s.use&&s.use.type==='_meal'&&s.use.i===i&&!ghost){const se=s.use.seat;const sa=se!=null?[(se%N)-(i%N),((se/N|0)-(i/N|0))]:[0,1];const [px,py]=P(...(()=>{const [u,v]=w2v((i%N)+.5+sa[0]*.25,(i/N|0)+.5+sa[1]*.25);return [u,v];})(),24.5);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(px,py,7,3.5,0,0,Math.PI*2);ctx.fill();circ(px-1,py-.5,2.2,'#e07a3f');circ(px+2,py,1.6,'#7cc46a');}
    break;}
  case 'planta':{
    lcyl(.5,.5,.17,0,12,'#c0683f','#5a3e2b');
    const sw=Math.sin(tt*1.5+(i||0))*1.4;const [px,py]=LP(.5,.5,12);
    for(const [lx,ly,r] of [[-7,-6,-0.6],[7,-6,0.6],[-3,-13,-0.25],[4,-14,0.3],[0,-9,0]]){ctx.save();ctx.translate(px+lx*.6+sw*(ly/-14),py+ly*.5);ctx.rotate(r+sw*0.03);ctx.fillStyle=r<0?'#4f9a48':'#62b35a';ctx.beginPath();ctx.ellipse(0,-5,3.4,8,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    break;}
  case 'lampara':{
    lcyl(.5,.5,.12,0,2,'#3b3f46');lp(.48,.48,.52,.52,2,34,'#3b3f46');
    const on=night>0.2;lcyl(.5,.5,.17,32,44,on?'#ffe7a8':'#f3e1b0',on?'#fff4cf':'#f6e8c3');
    break;}
  case 'alfombra':{
    ltop(.04,.04,.96,.96,1,'#c45b5b');ltop(.12,.12,.88,.88,1.1,'#e9c46a');ltop(.2,.2,.8,.8,1.2,'#c45b5b');
    poly([LP(.5,.25,1.3),LP(.75,.5,1.3),LP(.5,.75,1.3),LP(.25,.5,1.3)],'#f4e3b5');
    break;}
  case 'arbol':{
    lp(.44,.44,.56,.56,0,28,'#7a5230');
    const sw=Math.sin(tt*1.1+(i||0)*1.7)*1.8;const [tx,ty]=LP(.5,.5,0);
    const se=seasonOf(),pal={pri:['#4f9a43','#5cae4c','#5cae4c','#6cbf58','#82cf6a'],ver:['#3f8a3a','#4a9a43','#4a9a43','#58ac4e','#6cbc5e'],oto:['#b4552a','#c9702e','#d98b2e','#e3a53a','#ebbd4e'],inv:null}[se];
    if(!pal){ctx.strokeStyle='#6b4a2e';ctx.lineCap='round';for(const [a,l,w] of [[-2.2,22,3],[-1.1,24,2.6],[-1.6,30,2.2],[-0.6,20,2],[-2.6,16,1.8]]){const bx=tx+sw*.3,by=ty-26;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(a)*l,by+Math.sin(a)*l);ctx.stroke();}
      if(S.snow>0){ctx.fillStyle='rgba(255,255,255,.9)';for(const [a,l] of [[-2.2,22],[-1.1,24],[-1.6,30]])circ(tx+Math.cos(a)*l*.8,ty-27+Math.sin(a)*l*.8,2.4,'#fff');}}
    else{for(const [k,[bx,by,r]] of [[0,-38,20],[-10,-46,14],[10,-47,14],[0,-56,15],[-4,-62,9]].entries())circ(tx+bx+sw*(-by/60),ty+by,r,pal[k]);
      circ(tx-6+sw,ty-58,5,'rgba(255,255,255,.12)');
      if(se==='pri')for(let k=0;k<7;k++)circ(tx+(hash((i||1)*5+k)-.5)*34+sw,ty-40-hash((i||1)*3+k)*26,1.8,'#ffc0d6');
      if(S.snow>0){ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(tx+sw*.9,ty-68,9,4,0,0,Math.PI*2);ctx.ellipse(tx-10+sw,ty-57,7,3,0,0,Math.PI*2);ctx.fill();}}
    break;}
  case 'flores':{
    ltop(.2,.2,.8,.8,1,'#6b4a2b');
    const cols=['#ff6b9d','#ffd166','#ffffff','#c77dff','#ff8a5b'];
    const se=seasonOf(),bloom=se==='pri'||se==='ver'?1:se==='oto'?0.4:0;
    for(let k=0;k<6;k++){const a=hash((i||1)*3+k),b=hash((i||1)*7+k*5);const [fx,fy]=LP(.25+a*.5,.25+b*.5,1);const sw=Math.sin(tt*2+k)*1.2;
      capsule(fx,fy,fx+sw,fy-(bloom?9:5),1.2,se==='inv'?'#6f7f4a':'#4f8a3c');if(bloom>0&&Math.abs(hash(k*7+(i||1)))<bloom){circ(fx+sw,fy-10,2.8,se==='oto'?mixHex(cols[k%cols.length],'#a0703a',.45):cols[k%cols.length]);circ(fx+sw,fy-10,1,'#ffe066');}}
    if(S.snow>0)ltop(.2,.2,.8,.8,3,'rgba(255,255,255,.75)');
    break;}
  case 'seto':{
    lp(.06,.06,.94,.94,0,20,'#4f8a3c');
    for(let k=0;k<5;k++){const a=hash((i||1)+k*11),b=hash((i||1)*5+k*3);const [bx,by]=LP(.2+a*.6,.2+b*.6,20);circ(bx,by,6+a*2,k%2?'#5c9c47':'#4a8238');}
    break;}
  case 'farola':{
    lcyl(.5,.5,.1,0,3,'#2f3338');lp(.47,.47,.53,.53,3,58,'#3b3f46');
    const on=night>0.2;lp(.42,.42,.58,.58,58,68,on?'#ffd27a':'#e8e0c8');lp(.4,.4,.6,.6,68,71,'#2f3338');
    break;}
  default:{if(MDRAW&&MDRAW[o.t]){MDRAW[o.t](o,i,tt,inUse,anaOn,night,ghost,wx,wy);break;}lp(d.ins,d.ins,1-d.ins,1-d.ins,0,d.h,d.c);const [ex,ey]=LP(.5,.5,d.h);emoji(d.e,ex,ey-6,24);}
  }
  if(!ghost&&o.c!=null&&!OUTDOOR.has(o.t)&&!d.flat){
    const c=o.c,[x,y]=LP(.5,.5,(d.h||20)+3);
    if(c<=0){emoji('⚠️',x,y-16+Math.sin(tt*4)*2,15);}
    else if(c<45){ctx.fillStyle=`rgba(80,55,30,${(45-c)/45*0.4})`;for(let k=0;k<3;k++){const a=hash((i||0)*5+k);ctx.beginPath();ctx.ellipse(x-8+a*16,y+hash(k+(i||0))*6-3,3+a*2,1.6,0,0,Math.PI*2);ctx.fill();}
      if(c<25){ctx.strokeStyle='rgba(60,40,30,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6,y-1);ctx.lineTo(x-2,y+2);ctx.lineTo(x+1,y);ctx.lineTo(x+6,y+3);ctx.stroke();}}
  }
  if(!ghost&&o.q===4&&!d.flat){const ph=(tt*0.7+(i||0)*0.37)%3;if(ph<0.4){const [x,y]=LP(.78,.22,(d.h||20)+2);const rr=4.5*Math.sin(ph/0.4*Math.PI);ctx.strokeStyle='rgba(255,226,120,.95)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-rr,y);ctx.lineTo(x+rr,y);ctx.moveTo(x,y-rr);ctx.lineTo(x,y+rr);ctx.stroke();}}
  ctx.restore();
}

