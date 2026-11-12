// ---------- objetivos ----------
const GOALS=DATA.sucesos.nucleo_objetivos.lista; // texto y premio de cada objetivo en data/sucesos.json; aquí, cuándo se cumple
porId(GOALS,{
  room1:{ok:()=>{computeRooms();return rooms.length>=2;}},
  work1:{ok:()=>S.shifts>=1},
  windows:{ok:()=>count(i=>S.wall[i]===3)>=3},
  paint:{ok:()=>count(i=>S.wall[i]&&S.wall[i]!==4&&S.wcol[i]>0)>=10},
  fogon:{ok:()=>S.skills.cocina>20},
  fence:{ok:()=>count(i=>S.wall[i]===4)>=12},
  deco:{ok:()=>count(i=>S.obj[i]&&OBJ[S.obj[i].t].green)>=6},
  rooms3:{ok:()=>{computeRooms();return new Set(rooms.filter(r=>ZONE_ORDER.includes(r.purpose)).map(r=>r.purpose)).size>=3;}},
  star4:{ok:()=>{computeRooms();return rooms.some(r=>r.stars>=4);}},
  pool:{ok:()=>count(i=>FLOORS[S.floor[i]].water)>=6},
  happy:{ok:()=>!S.sim.work&&mood()>72},
  promo:{ok:()=>S.career>=1},
  big:{ok:()=>{computeRooms();return rooms.reduce((a,r)=>a+r.cells.length,0)*4>=100;}},
  star5:{ok:()=>{computeRooms();return rooms.some(r=>r.stars>=5);}},
  value:{ok:()=>houseValue()>=100000},
  diy:{ok:()=>S.stats.diy>=1},
  hire:{ok:()=>S.stats.hired>=1},
  craft1:{ok:()=>(S.stats.crafted||0)>=1},
  diy5:{ok:()=>['carp','elec','font','alba','jard'].some(k=>lvl(k)>=4)},
  premium:{ok:()=>count(i=>S.obj[i]&&S.obj[i].q===4)>=3},
  boss:{ok:()=>S.career>=CAREER.length-1}});
let unseen=0;
function checkGoals(){
  for(const g of GOALS){if(S.goals[g.id])continue;if(g.ok()){S.goals[g.id]=1;S.needs.diversion=Math.min(100,S.needs.diversion+15);if(typeof MT==='function')MT().an=Math.min(100,MT().an+4);unseen++;if(!S.sim.work)confetti(S.sim.x,S.sim.y,50);toast(huecos(DATA.sucesos.nucleo_objetivos.toast,{t:g.t}),true);sfx('level');}}
  const b=document.getElementById('badge');b.style.display=unseen?'block':'none';b.textContent=unseen;
}

