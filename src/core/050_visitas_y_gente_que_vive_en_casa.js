// ---------- visitas y gente que vive en casa ----------
function inviteHome(p,stay){if(S.sim.work>0)return toast(TXN.visitas.no_en_casa);if((S.res||[]).some(r=>r.pid===p.k))return toast(huecos(TXN.visitas.ya_aqui,{p:p.n}));
  const h=S.t/60;const until=stay?(S.day+1)*1440+9*60:S.day*1440+Math.min(23.9*60,S.t+180);
  S.res=S.res||[];const [sx,sy]=simCell();const e=bfs([sx,sy],(x,y)=>x===0||y===0||x===N-1||y===N-1);const ex=e&&e.length?e[e.length-1]:[sx,sy];
  S.res.push({kind:'guest',pid:p.k,x:ex[0]+.5,y:ex[1]+.5,path:[],phase:0,until,stay});talkTo(p);p.rel=Math.min(100,p.rel+6);if(['cita','rollo','pareja'].includes(p.stage))p.love=Math.min(100,p.love+6);
  tally('calls',p.n);toast(huecos(TXN.visitas.viene,{p:p.n,dormir:stay?TXN.visitas.viene_dormir:''}));
  if(stay&&['rollo','cita','pareja'].includes(p.stage))tell(huecos(TXN.visitas.se_quedo,{p:p.n,r:pickR(TXN.visitas.se_quedo_r)}),'🌙');}
function residents(){const list=[...(S.res||[])];const pt=liveIn();const h=S.t/60;const ptWork=pt&&dayType(S.day)==='work'&&h>8.2&&h<17.8;
  if(pt&&!ptWork&&!list.some(r=>r.pid===pt.k)){S.res=S.res||[];const r={kind:'partner',pid:pt.k,x:S.sim.x+1,y:S.sim.y,path:[],phase:0};const [x,y]=simCell();const n=neighborsOf(idx(x,y));if(n.length){r.x=n[0]%N+.5;r.y=(n[0]/N|0)+.5;}S.res.push(r);list.push(r);}
  if(pt&&ptWork)S.res=(S.res||[]).filter(r=>r.kind!=='partner');
  for(const [i,k] of (S.kids||[]).entries()){if(!(S.res||[]).some(r=>r.kid===i)){const [x,y]=simCell();S.res=S.res||[];S.res.push({kind:'kid',kid:i,x:x+.5,y:y+.5,path:[],phase:0});}}
  return S.res||[];}
function updateResidents(gm){
  const list=residents();const [ax,ay]=simCell();const home=!(S.sim.work>0);
  for(const r of list){if(!isFinite(r.x)||!isFinite(r.y)||r.x==null||r.y==null){let c=simCell();if(!walkable(c[0],c[1])){const f=bfs(c,(x,y)=>walkable(x,y));c=f&&f.length?f[f.length-1]:[N>>1,N>>1];}r.x=c[0]+.5;r.y=c[1]+.5;r.path=[];}r.phase=r.phase||0;if(r.path&&r.path.length){const [tx,ty]=r.path[0];if(!walkable(tx,ty)){r.path=[];continue;}npcMove(r,gm*(r.kind==='kid'?.8:1));continue;}
    r.next=(r.next||0)-gm;if(r.next>0)continue;r.next=6+Math.random()*10;
    const [cx,cy]=[Math.floor(r.x),Math.floor(r.y)];let goal;
    if(home&&(r.kind!=='kid'||Math.random()<.6)){const adj=neighborsOf(idx(ax,ay)).filter(j=>!(S.res||[]).some(o=>o!==r&&Math.floor(o.x)===j%N&&Math.floor(o.y)===(j/N|0)));if(adj.length){const j=adj.sort((a,b)=>Math.hypot(a%N-cx,(a/N|0)-cy)-Math.hypot(b%N-cx,(b/N|0)-cy))[0];goal=[j%N,j/N|0];}}
    if(!goal&&Math.random()<.4){for(let t=0;t<12;t++){const x=1+(Math.random()*(N-2)|0),y=1+(Math.random()*(N-2)|0);if(walkable(x,y)&&roomId[idx(x,y)]>=0){goal=[x,y];break;}}}
    if(goal&&(goal[0]!==cx||goal[1]!==cy)){const p=bfs([cx,cy],(x,y)=>x===goal[0]&&y===goal[1]);if(p)r.path=p;}}
  // compañía: sube lo social
  if(home&&list.length){S.needs.social=Math.min(100,S.needs.social+0.05*gm*list.length);for(const r of list){const p=r.pid&&S.people.find(q=>q.k===r.pid);if(p&&Math.random()<0.01*gm){p.rel=Math.min(100,p.rel+0.5);if(isPartner(p)||p.stage==='rollo')p.love=Math.min(100,p.love+0.3);p.last=S.day;}}}
  // la visita se va cuando toca
  S.res=(S.res||[]).filter(r=>!(r.kind==='guest'&&r.until<S.day*1440+S.t));
}
function drawResident(r){
  if(!isFinite(r.x)||!isFinite(r.y)||r.x==null)return;
  const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);const near=Math.hypot(r.x-S.sim.x,r.y-S.sim.y)<1.6&&!(S.sim.work>0);
  let ch,name,scale=1;if(r.kind==='kid'){const k=(S.kids||[])[r.kid];if(!k)return;ch=k.ch;name=k.n;scale=kidAge(k)<1?0.42:kidAge(k)<3?0.55:0.68;}else{const p=S.people.find(q=>q.k===r.pid);if(!p)return;ch=p.ch;name=p.n;}
  const saved=anaRT.phase;anaRT.phase=r.phase||0;let front=r.front,right=r.right;
  if(near&&!r.path.length){const [a,b]=w2v(S.sim.x,S.sim.y);right=(a-u)-(b-v)>0;front=(a-u)+(b-v)>-.01;}
  ctx.save();ctx.translate(bx,by);ctx.scale(scale,scale);
  if(r.kind==='kid'&&scale<.5){ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(0,-10,9,7,0,0,Math.PI*2);ctx.fill();circ(1,-18,6,ch.skin);circ(-.5,-19,1,'#3b2a20');circ(3,-19,1,'#3b2a20');}
  else drawAna(0,0,{ch,shirt:ch.shirt,mood:70,front,right,pose:r.path&&r.path.length?'walk':'stand',act:near&&!r.path.length&&r.kind!=='kid'?'talk':null});
  ctx.restore();anaRT.phase=saved;
  if(cam.z>0.7)label((r.kind==='kid'?'🧒 ':r.kind==='partner'?'❤️ ':'')+name,bx,by-(r.kind==='kid'?30:66),'rgba(255,253,248,.9)','#3b3247',8);
}
