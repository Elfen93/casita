// ---------- consecuencias nuevas ----------
Object.assign(CQ,{
  respuesta:()=>{if(S.jobless)return;const o=office();if(o.org>=25){tell(`Han ido juntas al despacho: cinco personas y una lista. ${bossS()} ha cedido en lo principal. No ha sido una huelga: ha sido un aviso.`,'✊');ex().exp.win++;o.griev=Math.max(0,(o.griev||0)-10);S.noOvertime=S.day+45;}else{tell(`Al final solo ${compiN()} y Ana fueron al despacho. ${bossS()} les escuchó «con mucho interés» y no cambió nada.`,'🥀');}},
  marcada:()=>{if(S.jobless)return;S.needs.energia=Math.max(0,S.needs.energia-15);tell(`Semana de turnos partidos y tareas que nadie quiere. ${compiN()} le ha dicho en voz baja: «te la tienen jurada».`,'👁️');},
  adelanto:d=>{S.money-=d.m;bumpMoney&&bumpMoney();if(S.owe>S.day&&Math.random()<.5)tell(`Nómina con ${fmt(d.m)} menos: el adelanto. ${bossS()} le ha pedido «un favor» este fin de semana. No ha podido decir que no.`,'🪝');},
  masgente:()=>{if(S.jobless)return;const o=office();if(o.org>=50){tell(`Ya son más de la mitad. En el vestuario alguien ha escrito en la pizarra: «cuando queráis».`,'✊');if(!S.strike&&Math.random()<.6)askDilemma('asamblea',{});}else tell('La cosa va lenta. Dos se han echado atrás: «yo tengo hipoteca».','🐢');},
  lodger:d=>{const p=P_(d.p);if(!p||S.lodger!==p.k)return;const w=huDonde(p);if(Math.random()<.6){S.lodger=null;tell(`${p.n} ha encontrado habitación. Ha dejado ${w[1]} y una nota: «gracias por no hacerme sentir que molestaba».`,'🫶');}else{tell(`${p.n} sigue durmiendo ${w[0]}. No encuentra nada por menos de ${fmt(Math.round(weeklyRent()*.8))} a la semana. Nadie lo menciona.`,'🛋️');schedule(21,'lodger',d);}},
  proveedor:()=>{if(Math.random()<.5){tell('Ha encontrado otro proveedor, más barato y más lejos. Dos horas de furgoneta cada martes.','🚚');S.needs.energia=Math.max(0,S.needs.energia-10);}else{tell('No hay otro proveedor: son todos el mismo con distinto nombre. Ha pagado la subida.','🏪');S.payMul=(S.payMul||1)*.92;}}});

// =================== ENTORNO: la calle donde vive Ana (decorado vivo, no interactuable) ===================
const ENT_ON=()=>S&&S.entorno!==false;
const wp=(x,y,z=0)=>{const [u,v]=w2v(x,y);return P(u,v,z);};
function wpoly(pts,col,stroke){poly(pts.map(p=>wp(p[0],p[1],p[2]||0)),col,stroke);}
function wbox(x0,y0,x1,y1,z0,z1,col){const [u0,v0,u1,v1]=vrect([x0,y0,x1,y1]);prism(u0,v0,u1,v1,z0,z1,col);return [u0,v0,u1,v1];}
function wflat(x0,y0,x1,y1,z,col){const [u0,v0,u1,v1]=vrect([x0,y0,x1,y1]);topQuad(u0,v0,u1,v1,z,col);}
const entGroup=(u0,v0,u1,v1)=>(u1<=0.01||v1<=0.01)?0:1;
const ENT_HOUSES=[
  {id:'vecina',r:[-9,2,-3,9],h:54,c:'#e8c9b0',roof:'#a5533e',door:'#5a3e2b',garden:[-9,9,-3,12],fence:1},
  {id:'ruiz',r:[3,-9,11,-3],h:54,c:'#cfd9bf',roof:'#5e7a4a',door:'#3b3f46',garden:[3,-3,11,-1],fence:1,kids:1},
  {id:'bloque',r:[13,-10,20,-3],h:118,c:'#d9cfc0',flat:1,balc:1},
  {id:'esquina',r:[-9,-9,-3,-3],park:1},
  {id:'bar',r:[-11,N+6.5,-4,N+11],h:50,c:'#d9a066',flat:1,sign:'Bar Manolo',shop:1,awning:'#c0392b'},
  {id:'local',r:[-2.5,N+6.5,5,N+11],h:48,c:'#c7d2d8',flat:1,sign:'Ultramarinos Pepi',shop:1,awning:'#2a9d8f',closable:1},
  {id:'pana',r:[6.5,N+6.5,13,N+11],h:48,c:'#f1e3d3',flat:1,sign:'Panadería',shop:1,awning:'#e9c46a'},
  {id:'casa3',r:[14.5,N+6.5,N+1,N+12],h:54,c:'#e1d4c2',roof:'#7a5a4a',door:'#5a3e2b'},
  {id:'casa4',r:[N+6.5,-2,N+12,6],h:54,c:'#dcc8d8',roof:'#6b4a6b',door:'#3b3f46',garden:[N+6.5,6,N+12,9],fence:1},
  {id:'casa5',r:[N+6.5,10,N+12,18],h:58,c:'#cfd6e0',roof:'#4a5a7a',door:'#5a3e2b',garden:[N+6.5,18,N+12,N+1],fence:1}];
const ENT_BG=[{r:[-22,-32,-15,-25],h:190,c:'#9fb4c8'},{r:[-11,-33,-4,-26],h:150,c:'#b8b0a4'},{r:[1,-34,8,-27],h:230,c:'#a9b6c6'},{r:[13,-33,20,-26],h:140,c:'#c4b8a8'},{r:[N+6,-32,N+13,-25],h:180,c:'#aab4bf'},{r:[N+16,-14,N+23,-7],h:90,c:'#c9c0b2',obra:1},{r:[-32,-14,-25,-7],h:120,c:'#b5a99a'},{r:[-33,0,-26,7],h:100,c:'#c0b6a8'},{r:[N+17,2,N+24,9],h:130,c:'#b0b8c4'},{r:[-33,12,-26,19],h:160,c:'#a8b0bc'}];
const ENT_STREET={y0:N+1.5,y1:N+4.5,x0:N+1.5,x1:N+4.5,far:-24,farB:N+6};
function entSeed(k){return hash((S.day||1)*31+k*7);}
