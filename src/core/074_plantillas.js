// ---------- plantillas ----------
function homeTemplate(type){
  const fl=Array(N*N).fill(0),wl=Array(N*N).fill(0),wc=Array(N*N).fill(0),ob=Array(N*N).fill(null);const I=(x,y)=>y*N+x;
  const rect=(x0,y0,x1,y1,f,col)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){if(x===x0||x===x1||y===y0||y===y1){if(!wl[I(x,y)])wl[I(x,y)]=1;if(col!=null)wc[I(x,y)]=col;}else fl[I(x,y)]=f;}};
  const door=(x,y)=>{wl[I(x,y)]=2;fl[I(x,y)]=fl[I(x,y)]||1;},win=(x,y)=>{wl[I(x,y)]=3;};
  const o=(x,y,t,q=3,ex={})=>{ob[I(x,y)]={t,q,c:ex.c??100,...ex};};
  const path=(x,y0,y1)=>{for(let y=y0;y<=y1;y++)fl[I(x,y)]=4;};
  let area=[0,0,N-1,N-1],sim=[8.5,8.5],mates=[];
  if(type==='casita'){rect(6,6,11,10,1);door(8,10);win(11,8);o(7,7,'cama');o(10,7,'nevera');o(7,9,'ducha');o(10,9,'vater');path(8,11,N-1);o(3,4,'arbol');o(15,12,'arbol');o(7,11,'flores');o(16,5,'arbol');}
  else if(type==='infra'){rect(7,7,11,11,4,8);door(9,11);win(11,9);o(8,8,'cama',1,{c:55});o(10,8,'nevera',1,{c:50});o(8,10,'ducha',1,{c:45});o(10,10,'vater',1,{c:55});path(9,12,N-1);area=[8,8,10,10];sim=[9.5,9.5];}
  else if(type==='habitacion'||type==='padres'){rect(4,5,15,13,1);
    rect(4,5,8,9,1);door(6,9);rect(8,5,12,9,1);door(10,9);rect(12,5,15,9,2);door(13,9);rect(11,9,15,13,1);door(11,11);door(7,13);path(7,14,N-1);
    for(const [x,y] of [[4,7],[10,5],[4,11],[15,11],[14,5],[6,5]])win(x,y);
    for(let x=5;x<=10;x++)for(let y=10;y<=12;y++)fl[I(x,y)]=x<=6?2:1;
    o(5,6,'cama',type==='padres'?2:2);
    const pv=type==='padres'?'madre':'mate';
    o(11,6,'cama',3,{priv:pv});o(9,6,'lampara',2,{priv:pv});o(14,6,'ducha',2);o(13,6,'vater',2);o(14,8,'espejo',2);
    o(5,10,'nevera',2);o(5,11,'fogon',2);o(7,11,'mesa',2);o(8,12,'silla',2);o(9,12,'sofa',2);o(10,12,'tele',2);
    o(14,12,'cama',type==='padres'?3:2,{priv:pv});o(12,10,type==='padres'?'libros':'guitarra',2,{priv:pv});
    area=[5,6,7,8];sim=[6.5,7.5];mates=type==='padres'?['madre']:['m1','m2'];}
  else if(type==='viejo'){rect(5,6,14,13,1);rect(5,6,10,10,3);door(8,10);rect(10,6,14,10,2);door(11,10);door(9,13);path(9,14,N-1);
    for(const [x,y] of [[5,8],[14,11],[7,6],[5,11],[14,8]])win(x,y);for(let x=6;x<=13;x++)for(let y=11;y<=12;y++)fl[I(x,y)]=x<=8?2:1;
    o(6,7,'cama',2,{c:70});o(9,7,'libros',1,{c:60});o(12,7,'ducha',2,{c:65});o(13,7,'vater',2,{c:70});o(13,9,'espejo',1);o(6,11,'nevera',2,{c:60});o(7,11,'fogon',2,{c:65});o(10,11,'mesa',2);o(12,12,'sofa',1,{c:55});o(13,12,'tele',1,{c:60});
    area=[6,7,13,12];sim=[9.5,11.5];}
  else if(type==='bueno'){rect(4,5,15,14,6);rect(4,5,8,10,6);door(6,10);rect(8,5,12,10,6);door(10,10);rect(12,5,15,10,5);door(13,10);door(9,14);path(9,15,N-1);
    for(const [x,y] of [[6,5],[10,5],[4,7],[4,12],[15,12],[14,5],[15,8],[12,14]])win(x,y);for(let x=5;x<=7;x++)for(let y=11;y<=13;y++)fl[I(x,y)]=5;
    o(5,6,'cama',4);o(7,8,'lampara',3);o(9,6,'compu',3);o(11,6,'libros',4);o(13,6,'ducha',4);o(14,6,'vater',3);o(14,9,'espejo',3);
    o(5,11,'nevera',4);o(5,12,'fogon',4);o(7,13,'mesa',3);o(10,12,'sofa',4);o(12,11,'tele',4);o(14,13,'planta',3);o(11,13,'alfombra',3);o(14,11,'telefono',3);o(5,13,'planta',3);
    area=[5,6,14,13];sim=[9.5,12.5];}
  else if(type==='chalet'){rect(3,3,16,12,6);rect(3,3,8,7,6);door(5,7);rect(8,3,12,7,6);door(10,7);rect(12,3,16,7,5);door(14,7);rect(11,7,16,12,5);door(11,9);door(7,12);path(7,13,N-1);
    for(const [x,y] of [[5,3],[10,3],[14,3],[3,5],[3,9],[16,5],[16,10],[9,12],[13,12]])win(x,y);
    o(4,4,'cama',4);o(6,4,'lampara',4);o(9,4,'cama',4);o(11,5,'compu',4);o(13,4,'ducha',4);o(15,4,'vater',4);o(15,6,'espejo',4);
    o(4,8,'sofa',4);o(4,10,'tele',4);o(7,9,'alfombra',4);o(9,8,'libros',4);o(9,11,'planta',4);o(12,8,'nevera',4);o(13,8,'fogon',4);o(14,10,'mesa',4);o(15,8,'planta',3);
    for(let x=11;x<=15;x++)for(let y=14;y<=16;y++)fl[I(x,y)]=9;
    o(3,15,'arbol');o(17,4,'arbol');o(17,10,'arbol');o(2,9,'arbol');o(5,15,'barbacoa',4);o(8,16,'bancoj',4);o(9,14,'flores');o(17,14,'flores');o(2,13,'seto');o(3,13,'seto');
    sim=[6.5,9.5];}
  // muebles de espaldas a la pared
  for(let i=0;i<N*N;i++){const q=ob[i];if(!q)continue;const x=i%N,y=i/N|0;for(let r=0;r<4;r++){const dx=[0,1,0,-1][r],dy=[-1,0,1,0][r];const w=wl[(y+dy)*N+x+dx];if(w===1||w===3){q.r=r;break;}}if(q.r==null)q.r=0;}
  return {fl,wl,wc,ob,area,sim,mates};}
function applyHome(type){const T0=homeTemplate(type);S.floor=T0.fl;S.wall=T0.wl;S.wcol=T0.wc;S.obj=T0.ob;S.zone=Array(N*N).fill(0);S.weeds=[];
  S.home={type,area:T0.area,since:S.day,mates:[]};S.sim.x=T0.sim[0];S.sim.y=T0.sim[1];S.sim.path=[];S.sim.use=null;S.sim.target=null;S.sim.queue=[];S.held=null;S.job=null;S.want=null;S.npc=null;
  S.res=(S.res||[]).filter(r=>r.kind==='partner'||r.kind==='kid');S.rentMul=1;
  for(const k of T0.mates){if(k==='madre')S.home.mates.push('madre');else{const p=newMate();S.home.mates.push(p.k);}}
  if(typeof GRX!=='undefined')GRX=null;dirty();if(typeof undoStack!=='undefined'){undoStack=[];redoStack=[];}}
const MATE_JOBS=DATA.personas.oficios_piso;
function newMate(){const ch=randomChar();ch.age=20+(Math.random()*12|0);const p={k:'mate'+(S.pid=(S.pid||100)+1),n:ch.name,g:ch.g,ch,age:ch.age,ideo:pickR(IDEO_ORDER),orient:'ambos',relStyle:'libre',kids:'quiza',boda:'igual',job:'compañera',rel:25,love:0,stage:'conocida',met:'el piso',metDay:S.day,spark:0,e:'🛋️',mate:true,mjob:pickR(MATE_JOBS)[ch.g==='m'?1:0],hid:null};
  p.r=`comparte piso · ${p.mjob}`;S.people=S.people||[];S.people.push(p);return p;}
