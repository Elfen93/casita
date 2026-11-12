// =================== CONVIVENCIA: la gente de casa habla entre sí y con Ana por su cuenta ===================
const CV_LINES=DATA.interacciones.convivencia_frases;
const CV_PAIR=DATA.interacciones.convivencia_dialogos;
function cvRole(p){if(!p)return 'x';if(p.k==='madre')return 'madre';if(['pareja','convive','casada','rollo','cita'].includes(p.stage))return 'pareja';return 'guest';}
function cvSay(r,txt,ms){r.bub={t:txt,until:performance.now()+(ms||2600)};}
function cvAnaSay(txt){try{popBubble(txt);}catch(e){}}
let cvNext=0;
function cvTick(force){const now=performance.now();if(now<cvNext&&!force)return;cvNext=now+6000+Math.random()*9000;if(!S||!S.res||S.sim.work>0)return;
  const h=S.t/60;if(h<7.5||h>=23.5)return;const here=(S.res||[]).filter(r=>!r.away&&r.kind!=='kid'&&!(r.doing&&r.doing.act==='sleep')&&!(r.doing&&r.doing.act==='love'));if(!here.length)return;
  const anaBusy=S.sim.use&&['cama','camamat','ducha','banera','vater'].includes(S.sim.use.type);
  // 1) dos residentes cerca: hablan entre ellos
  if(here.length>=2&&(force||Math.random()<.45)){for(let i=0;i<here.length;i++)for(let j=i+1;j<here.length;j++){const a=here[i],b=here[j];if(Math.hypot(a.x-b.x,a.y-b.y)<2.6){const [q1,q2]=pickR(CV_PAIR);cvSay(a,q1);setTimeout(()=>cvSay(b,q2),1500);
      const pa=(S.people||[]).find(p=>p.k===a.pid),pb=(S.people||[]).find(p=>p.k===b.pid);if(pa&&pb){pa.rel2=pa.rel2||{};pa.rel2[pb.k]=Math.min(100,(pa.rel2[pb.k]||30)+1);}return;}}}
  // 2) alguien cerca de Ana: le dice algo y Ana contesta
  if(anaBusy)return;const near=here.filter(r=>Math.hypot(r.x-S.sim.x,r.y-S.sim.y)<2.4&&!(r.doing&&r.doing.pose==='lie'));if(!near.length)return;
  const r=pickR(near);const p=(S.people||[]).find(q=>q.k===r.pid);if(!p)return;const role=cvRole(p);const L=CV_LINES[role==='madre'?'madre':r.kind==='mate'?'mate':role]||CV_LINES.x;const [q1,q2]=pickR(L);
  cvSay(r,q1.replace('{o}',oa()));setTimeout(()=>{if(S&&!(S.sim.work>0))cvAnaSay(q2);},1400);
  p.rel=Math.min(100,(p.rel||30)+.5);S.needs.social=Math.min(100,S.needs.social+1.5);}
{const _loopDraw=drawResident;let cvLast=0;drawResident=function(r){const o=_loopDraw(r);try{if(performance.now()-cvLast>900){cvLast=performance.now();cvTick();}}catch(e){}return o;};}
// burbujas de residentes (si no existe ya el dibujo en relaciones.js)
if(typeof bubbleFor!=='function'){window.bubbleFor=function(p,txt){const r=(S.res||[]).find(x=>x.pid===p.k);if(r)r.bub={t:txt,until:performance.now()+2200};};}
// 3) sentarse juntos: si Ana está en el sofá, la pareja o la madre prefieren el mismo sofá / la silla de al lado
{const _rc=rvChoose;rvChoose=function(r){const u=S.sim.use;if(u&&['sofa','sofacama','silla','mesacoc'].includes(u.type)&&!(S.sim.work>0)&&Math.random()<.5&&!r.doing){const p=(S.people||[]).find(q=>q.k===r.pid);const role=cvRole(p);
    if(role==='pareja'||role==='madre'||r.kind==='mate'){const types=u.type==='silla'||u.type==='mesacoc'?['silla','mesacoc']:['sofa','sofacama','sillon','butaca'];const objs=rvObjs(r,(d,t)=>types.includes(t)).filter(i=>!rvBusy(i,r)&&Math.hypot(i%N-u.i%N,(i/N|0)-(u.i/N|0))<=2.2);
      if(objs.length){const cx=Math.floor(r.x),cy=Math.floor(r.y);const tgt=new Map();for(const i of objs){const ox=i%N,oy=i/N|0;for(const [a,b] of [[ox+1,oy],[ox-1,oy],[ox,oy+1],[ox,oy-1]])if(walkable(a,b))tgt.set(a+','+b,i);}
        const p0=tgt.has(cx+','+cy)?[]:bfs([cx,cy],(x,y)=>tgt.has(x+','+y));if(p0){const end=p0.length?p0[p0.length-1]:[cx,cy];const i=tgt.get(end[0]+','+end[1]);r.path=p0;r.plan={i,act:u.type==='silla'||u.type==='mesacoc'?'eat':'talk',pose:'sit',dur:30+Math.random()*30,t:S.obj[i].t};return true;}}}}
  return _rc.apply(this,arguments);};}
// 4) la pareja/madre viene a saludar cuando Ana vuelve del curro
{const _ob2=outBack;outBack=function(k){const r=_ob2.apply(this,arguments);try{cvGreet();}catch(e){}return r;};}
function cvGreet(){for(const r of S.res||[]){if(r.away||r.kind==='kid'||(r.doing&&r.doing.act==='sleep'))continue;const p=(S.people||[]).find(q=>q.k===r.pid);if(!p)continue;const role=cvRole(p);if(role==='pareja'||role==='madre'||r.kind==='mate'){setTimeout(()=>cvSay(r,pickR(role==='madre'?['¡Ya estás aquí! ¿Has comido?','Hola, hij'+oa()+'.','¿Qué tal el día?']:role==='pareja'?['¡Hola! 😘','¿Qué tal, amor?','Ya era hora 🥰']:['Ey.','¿Qué pasa?','Hay comida en la nevera.'])),800+Math.random()*1500);}}}
