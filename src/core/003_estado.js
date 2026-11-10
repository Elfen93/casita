// ---------- estado ----------
let S;
function newState(diff){
  const s = {floor:Array(N*N).fill(0), wall:Array(N*N).fill(0), wcol:Array(N*N).fill(0), obj:Array(N*N).fill(null),
    diff:diff||'facil', money:DIFF[diff||'facil'].money, t:8*60, day:1, shifts:0, career:0, skills:{cocina:0,logica:0,carisma:0,musica:0,carp:0,elec:0,font:0,alba:0,jard:0}, tv2:true, goals:{}, sound:true, held:null, job:null, want:null, traits:[], zone:Array(N*N).fill(0), rep:70, vac:2, vacDays:[], absences:0, wantDay:0, autoHome:true, lastWorkDay:0, npc:null, stats:{diy:0,hired:0,fixed:0,crafted:0},
    needs:{hambre:80,energia:75,higiene:70,vejiga:60,diversion:60,social:55},
    sim:{x:8.5,y:8.5,path:[],target:null,use:null,work:0,think:0,shirt:SHIRTS[0],queue:[]},free:true,
    hints:{},char:{...DEFCHAR},pantry:0,weeds:[],track:'oficina',ideo:'apolitica',pol:{xp:0,inf:0,stages:{},comp:2,red:0},union:null};
  const I=(x,y)=>y*N+x;
  for(let x=6;x<=11;x++)for(let y=6;y<=10;y++){
    if(x===6||x===11||y===6||y===10) s.wall[I(x,y)]=1; else s.floor[I(x,y)]=1;
  }
  s.wall[I(8,10)]=2; s.floor[I(8,10)]=1; s.wall[I(11,8)]=3;
  s.obj[I(7,7)]={t:'cama'}; s.obj[I(10,7)]={t:'nevera'}; s.obj[I(7,9)]={t:'ducha'}; s.obj[I(10,9)]={t:'vater'};
  for(let y=11;y<N;y++) s.floor[I(8,y)]=4;
  s.obj[I(3,4)]={t:'arbol'}; s.obj[I(15,12)]={t:'arbol'}; s.obj[I(7,11)]={t:'flores'}; s.obj[I(16,5)]={t:'arbol'};
  return s;
}
function migrate(s){
  if(s.floor.length===256){ // terreno antiguo 16x16 → 20x20
    const O=2,old=s,remap=a=>{const r=Array(N*N).fill(a===old.obj?null:0);for(let y=0;y<16;y++)for(let x=0;x<16;x++)r[(y+O)*N+x+O]=a[y*16+x];return r;};
    s.floor=remap(old.floor);s.wall=remap(old.wall);s.obj=remap(old.obj);s.wcol=old.wcol?remap(old.wcol):Array(N*N).fill(0);
    s.sim.x+=O;s.sim.y+=O;s.sim.path=[];s.sim.target=null;s.sim.use=null;s.sim.exit=null;s.held=null;
  }
  s.wcol=s.wcol||Array(N*N).fill(0);
  s.skills=Object.assign({cocina:0,logica:0,carisma:0,musica:0,carp:0,elec:0,font:0,alba:0,jard:0},s.skills||{});
  if(s.skills.manitas){s.skills.carp+=s.skills.manitas*0.6;s.skills.alba+=s.skills.manitas*0.6;delete s.skills.manitas;}
  if(!s.tv2){for(const o of s.obj)if(o&&o.q!=null)o.q+=2;s.tv2=true;}
  if(s.autoHome===undefined)s.autoHome=true;s.traits=s.traits||[];s.diff=s.diff||'facil';if(s.rep==null)s.rep=70;if(s.vac==null)s.vac=2;s.vacDays=s.vacDays||[];s.zone=s.zone||Array(N*N).fill(0);s.stats=Object.assign({diy:0,hired:0,fixed:0},s.stats||{});s.job=s.job||null;s.want=null;s.npc=s.npc||null;s.lastWorkDay=s.lastWorkDay||0;
  for(const o of s.obj)if(o){if(o.q==null)o.q=3;if(o.c==null)o.c=100;}
  s.career=s.career||0; s.goals=s.goals||{}; if(s.sound===undefined)s.sound=true;
  s.hints=s.hints||{}; delete s.sim.name; delete s.sim.pop; s.sim.path=s.sim.path||[]; s.sim.queue=s.sim.queue||[]; if(s.free===undefined)s.free=true;
  for(let i=0;i<N*N;i++){const o=s.obj[i];if(o&&o.r==null){const x=i%N,y=i/N|0;o.r=0;for(let r=0;r<4;r++){const dx=[0,1,0,-1][r],dy=[-1,0,1,0][r];const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<N&&ny<N&&(s.wall[ny*N+nx]===1||s.wall[ny*N+nx]===3)){o.r=r;break;}}}}
  if(s.held){const i=s.held.from;if(!s.obj[i]&&!s.wall[i])s.obj[i]={t:s.held.t};else s.money+=OBJ[s.held.t].p;s.held=null;}
  return s;
}
function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw){ const s=JSON.parse(raw); if(s&&s.floor&&(s.floor.length===N*N||s.floor.length===256)) return migrate(s); } }catch(e){}
  return null;
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
let firstRun=false;
S = load() || (firstRun=true,newState());

