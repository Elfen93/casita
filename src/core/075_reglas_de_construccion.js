// ---------- reglas de construcción ----------
{const _ap=apply;apply=function(x,y,t=tool,quiet){const r=_ap.apply(this,arguments);if(!r&&!quiet&&t&&HT().build!=='all'&&inb(x,y)){const i=idx(x,y);const own=inArea(x,y)&&!(S.obj[i]&&S.obj[i].priv);const tk=(S.home&&S.home.type)||'casita';
    if((!own||['wall','fence','door','win','floor'].includes(t.kind))&&throttled('ajeno',2500))toast(['wall','fence','door','win','floor'].includes(t.kind)?`🔒 En ${HOMES[tk].n.toLowerCase()} no se pueden hacer obras: las paredes no son tuyas`:tk==='padres'?'🔒 Eso es de tu madre: solo puedes tocar lo de tu cuarto':tk==='habitacion'?'🔒 Eso es de tus compañeros de piso: solo puedes tocar lo de tu cuarto':'🔒 Eso no es tuyo');}return r;};}
{const _ca=canApply;canApply=function(x,y,t){if(!_ca(x,y,t))return false;if(HT().build==='all')return true;const k=t.kind;
  if(k==='obj'||k==='move'||k==='rot'||k==='craft')return inArea(x,y)&&!(S.obj[idx(x,y)]&&S.obj[idx(x,y)].priv);
  if(k==='paint'){const a=homeArea();return x>=a[0]-1&&y>=a[1]-1&&x<=a[2]+1&&y<=a[3]+1;}
  if(k==='del'){const i=idx(x,y);return inArea(x,y)&&!!S.obj[i]&&!S.obj[i].priv&&!S.wall[i];}
  return false;};}
{const _ps=pickSpot;pickSpot=function(t,onlyRoom){if(HT().build==='all')return _ps.apply(this,arguments);const saved=S.wall.slice();const a=homeArea();
  // tapar temporalmente lo que no es suyo para que solo elija dentro de su espacio
  const blocked=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!inArea(x,y)&&!S.wall[i]&&!S.obj[i]){S.obj[i]={t:'silla',_tmp:1};blocked.push(i);}}
  try{return _ps.apply(this,arguments);}finally{for(const i of blocked)S.obj[i]=null;}};}
{const _pr=planRoom;planRoom=function(){return HT().build==='all'?_pr.apply(this,arguments):null;};const _pp=planPool;planPool=function(){return HT().build==='all'?_pp.apply(this,arguments):null;};const _pw=planWindows;planWindows=function(){return HT().build==='all'?_pw.apply(this,arguments):null;};}
{const _fo=findObjs;findObjs=function(pred){return _fo(pred).filter(i=>!(S.obj[i]&&S.obj[i].priv));};}
