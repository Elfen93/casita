// ---------- objetivos ----------
const GOALS = [
  {id:'room1',t:'Construye una habitación nueva con la herramienta Habitación',r:100,ok:()=>{computeRooms();return rooms.length>=2;}},
  {id:'work1',t:'Ve a trabajar por primera vez',r:80,ok:()=>S.shifts>=1},
  {id:'windows',t:'Instala 3 ventanas',r:150,ok:()=>count(i=>S.wall[i]===3)>=3},
  {id:'paint',t:'Pinta 10 paredes de color',r:100,ok:()=>count(i=>S.wall[i]&&S.wall[i]!==4&&S.wcol[i]>0)>=10},
  {id:'fogon',t:'Compra un fogón y cocina algo',r:100,ok:()=>S.skills.cocina>20},
  {id:'fence',t:'Rodea el jardín con 12 tramos de valla',r:120,ok:()=>count(i=>S.wall[i]===4)>=12},
  {id:'deco',t:'Pon 6 plantas, setos, flores o árboles',r:150,ok:()=>count(i=>S.obj[i]&&OBJ[S.obj[i].t].green)>=6},
  {id:'rooms3',t:'Ten 3 habitaciones distintas (baño, cocina, dormitorio…)',r:250,ok:()=>{computeRooms();return new Set(rooms.filter(r=>ZONE_ORDER.includes(r.purpose)).map(r=>r.purpose)).size>=3;}},
  {id:'star4',t:'Consigue una habitación de ★★★★',r:250,ok:()=>{computeRooms();return rooms.some(r=>r.stars>=4);}},
  {id:'pool',t:'Construye una piscina de 6 casillas',r:200,ok:()=>count(i=>FLOORS[S.floor[i]].water)>=6},
  {id:'happy',t:'Pon a Ana de muy buen humor 😄',r:120,ok:()=>!S.sim.work&&mood()>72},
  {id:'promo',t:'Consigue un ascenso',r:200,ok:()=>S.career>=1},
  {id:'big',t:'Casa de 100 m² o más',r:300,ok:()=>{computeRooms();return rooms.reduce((a,r)=>a+r.cells.length,0)*4>=100;}},
  {id:'star5',t:'Consigue una habitación de ★★★★★',r:400,ok:()=>{computeRooms();return rooms.some(r=>r.stars>=5);}},
  {id:'value',t:'Casa valorada en 100.000 €',r:500,ok:()=>houseValue()>=100000},
  {id:'diy',t:'Ana monta o construye algo ella sola',r:100,ok:()=>S.stats.diy>=1},
  {id:'hire',t:'Contrata a alguien de la cooperativa',r:100,ok:()=>S.stats.hired>=1},
  {id:'craft1',t:'Ana fabrica su primer mueble en el banco',r:150,ok:()=>(S.stats.crafted||0)>=1},
  {id:'diy5',t:'Nivel 4 en algún oficio',r:250,ok:()=>['carp','elec','font','alba','jard'].some(k=>lvl(k)>=4)},
  {id:'premium',t:'Ten 3 muebles Premium 🥇',r:300,ok:()=>count(i=>S.obj[i]&&S.obj[i].q===4)>=3},
  {id:'boss',t:'Ana llega a Directora',r:1000,ok:()=>S.career>=CAREER.length-1},
];
let unseen=0;
function checkGoals(){
  for(const g of GOALS){if(S.goals[g.id])continue;if(g.ok()){S.goals[g.id]=1;S.needs.diversion=Math.min(100,S.needs.diversion+15);if(typeof MT==='function')MT().an=Math.min(100,MT().an+4);unseen++;if(!S.sim.work)confetti(S.sim.x,S.sim.y,50);toast(`🏆 Objetivo: ${g.t}`,true);sfx('level');}}
  const b=document.getElementById('badge');b.style.display=unseen?'block':'none';b.textContent=unseen;
}

