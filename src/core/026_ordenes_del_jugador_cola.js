// ---------- órdenes del jugador (cola) ----------
const CMDS=DATA.reglas.ordenes;
function busyWithCmd(){const s=S.sim;return (s.use&&s.use.cmd)||(s.cmd&&(s.path.length||s.target!=null))||s.leaving;}
function enqueue(c){
  const s=S.sim;s.queue=s.queue||[];
  if(s.work>0){toast(TXN.ordenes.trabajando);return;}
  if(s.queue.length>=4){toast(TXN.ordenes.cola_llena);sfx('bad');return;}
  if(!busyWithCmd()&&!s.queue.length){ // corta lo que hacía por su cuenta
    s.use=null;s.path=[];s.target=null;s.cmd=false;s.queue.push(c);
  } else {s.queue.push(c);toast(huecos(TXN.ordenes.cola_anadido,{orden:cmdLabel(c)}));}
  sfx('tap');renderQueue(true);
}
function cmdLabel(c){if(c.k==='need'){const m=CMDS.find(x=>x[0]===c.need);return m[1]+' '+m[2];}if(c.k==='obj'){const o=S.obj[c.i];return o?(OBJ[o.t].e||'🌿')+' '+OBJ[o.t].n:'—';}if(c.k==='work')return '💼 Trabajar';return '?';}
function runCmd(c){
  const s=S.sim;
  if(c.k==='work'){goWork();return;}
  if(c.k==='need'){
    const r=bestObjFor(c.need);
    if(r.path){go(r,c.need,true);return;}
    if(r.none)toast(huecos(TXN.ordenes.sin_objeto,{necesidad:NEEDNAME[c.need],compra:HINT[c.need]}));
    else toast(huecos(TXN.ordenes.no_llega,{objeto:OBJ[S.obj[r.obj].t].n}));
    sfx('bad');return;
  }
  if(c.k==='obj'){const o=S.obj[c.i];if(!o){toast(TXN.ordenes.objeto_perdido);return;}goUse(c.i,false,true);}
}
function cancelAll(){const s=S.sim;if(s.work>0)return;s.queue=[];s.use=null;s.path=[];s.target=null;s.cmd=false;s.leaving=false;s.think=20;sfx('undo');renderQueue(true);}
function ensureSimFree(){
  const s=S.sim;if(s.work>0)return;const [cx,cy]=simCell();
  if(walkable(cx,cy))return;
  let best=null,bd=1e9;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(walkable(x,y)){const d=Math.abs(x-cx)+Math.abs(y-cy);if(d<bd){bd=d;best=[x,y];}}
  if(best){s.x=best[0]+.5;s.y=best[1]+.5;s.path=[];s.target=null;}
}
function decorNear(){let sum=0;const [cx,cy]=simCell();for(let y=cy-3;y<=cy+3;y++)for(let x=cx-3;x<=cx+3;x++)if(inb(x,y)){const o=S.obj[idx(x,y)];if(o&&OBJ[o.t]?.decor)sum+=OBJ[o.t].decor;}return Math.min(10,sum);}
function envBonus(){computeRooms();const [x,y]=simCell();if(!inb(x,y))return 0;const r=roomId[idx(x,y)];return r>=0&&rooms[r]?rooms[r].q:decorNear();}
function mood(){let a=0;for(const [n] of NEEDS)a+=S.needs[n];return a/NEEDS.length+(S.sim.work?0:envBonus());}
const salary=()=>Math.round(CAREER[S.career].pay*Dm().pay*(S.payMul||1));
function popBubble(e){anaRT.pop={e,until:performance.now()+1800};}

function update(gm){
  const s=S.sim, nd=S.needs;
  const before=S.t; S.t+=gm;
  if(S.today&&Math.floor(before/30)!==Math.floor(S.t/30)){S.today.moodS+=mood();S.today.moodN++;}
  if(Math.floor(before/60)!==Math.floor(S.t/60)&&S.free&&!s.work&&!s.leaving&&!s.cmd&&!(s.queue&&s.queue.length)&&!(s.use&&(s.use.cmd||s.use.type==='_build'||bedUse(s.use)||!['diversion','social'].includes(s.use.goal||primaryNeed(s.use.type))))&&!(S.job&&S.job.cmd)){if(maybeOuting()){s.use=null;}else if(S.autoHome&&!(S.res||[]).some(r=>r.kind==='guest')&&S.needs.social<60&&S.t/60>=16&&S.t/60<21&&(dayType(S.day)!=='work'||S.lastWorkDay===S.day)&&Math.random()<.12){const c=(S.people||[]).filter(p=>p.stage!=='ex'&&p.k!=='compi'&&!(liveIn()===p)).sort((a,b)=>(isPartner(b)||b.stage==='rollo'?50:0)+b.rel-((isPartner(a)||a.stage==='rollo'?50:0)+a.rel))[0];if(c)inviteHome(c,(isPartner(c)||c.stage==='rollo')&&Math.random()<.6);}}
  if(before<8*60&&S.t>=8*60&&dateOf(S.day).wd===0){payRent();weeklyEvents();worldWeekly();unionWeekly();bizWeekly();autoSeek();socialWeekly();conexWeekly();if(onLeave()&&!TR().auto&&!S.jobless){const pay=Math.round(salary()*5);S.money+=pay;tell(huecos(TXN.ordenes.prestacion_nacimiento,{pago:fmt(pay)}),'👶');}if(TR().auto&&!S.jobless){S.money-=Math.round(4*PM());}S.fit=Math.max(0,(S.fit||0)-3);if(S.pol.commons)S.pantry=(S.pantry||0)+2;if(S.autoHome&&!S.opos?.on&&!S.oposPassed&&S.track!=='funcion'&&isI('conservadora','socialdemocrata','apolitica')&&Dm().money<=500&&Math.random()<.04){S.opos={on:true,h:0,exam:S.day+90};tell(TXN.ordenes.oposiciones.replace('no la puedan',ga('no la puedan','no lo puedan','no le puedan')),'📚');}}
  if(before<9*60&&S.t>=9*60&&dateOf(S.day).dm===1&&S.day>1)payUtilities();
  utilTick(gm);
  if(before<(SHIFT.start+3)*60&&S.t>=(SHIFT.start+3)*60&&dayType(S.day)==='work'&&S.lastWorkDay!==S.day&&!s.work&&!s.leaving&&!S.jobless&&!(S.sick>0)&&!noWorkToday()){S.lastWorkDay=S.day;S.absences=(S.absences||0)+1;S.rep=Math.max(0,(S.rep??70)-15);toast(huecos(TXN.ordenes.falta_trabajo,{rep:S.rep}),true);sfx('bad');
    if(S.rep<15&&S.career>0&&S.diff!=='facil'){S.career--;S.rep=40;setTimeout(()=>toast(huecos(TXN.ordenes.falta_baja,{puesto:CAREER[S.career].t}),true),900);}}
  if(S.t>=1440){S.t-=1440;writeDiary();S.day++;rollWeather();dailyEvents();gardenDaily();peopleDaily();newToday();birthdayCheck();milestones();jobStory();dailySociety();socialDaily();conexDaily();seasonDaily();try{aspDaily();}catch(e){}S.distract=Math.random()<0.35?0.4+Math.random()*0.7:0;const d=dateOf(S.day),dt=dayType(S.day);toast(huecos(TXN.ordenes.fecha,{dia:WDL[d.wd],num:d.dm,mes:MONTHS[d.m],icono:DAYICON[dt],nombre:festivo(S.day)||DAYNAME[dt]}));if(S.t>=8*60&&d.wd===0)payRent();}
  updateNPC(gm);updateResidents(gm);
  if(s.work>0){
    const mult=s.outingActive?{hambre:1,energia:1,higiene:1,vejiga:0.6,diversion:0.6,social:0.5}:{hambre:1.1,energia:1.3*(TR().burn||1)*(S.track==='obra'?1.15:1),higiene:1.3,vejiga:0.4,diversion:1.6,social:0.3};
    for(const [n] of NEEDS)nd[n]=Math.max(3,nd[n]-DECAY[n]*mult[n]*gm);
    if(!s.outingActive){const xm=isI('liberal')?1.2:1;gainSkill('logica',gm*0.015*xm);gainSkill('carisma',gm*0.01*xm);if(S.track==='obra')gainSkill('alba',gm*0.02);if(S.track==='hosteleria')gainSkill('cocina',gm*0.015);if(S.track==='arte')gainSkill('musica',gm*0.02);if(S.track==='tech')gainSkill('logica',gm*0.01);} // la experiencia en el trabajo también enseña
    if(!s.outingActive&&nd.hambre<35&&!s.ateAtWork){s.ateAtWork=true;const c=Math.round(mealOutCost()*0.7);nd.hambre=Math.min(100,nd.hambre+55);S.money-=c;}
    s.work-=gm; if(s.work<=0)finishWork(); return;
  }
  let serving={};
  if(s.use){
    if(s.use.type==='_suelo')serving={energia:0.1};
    else if(s.use.type==='_meal'){const b=traitBoost('_meal');serving={diversion:0.35*b,social:0.06,hambre:0.15};}
    else if(s.use.type==='_weed')serving={diversion:0.2*(T('naturaleza')?1.6:1)};
    else if(s.use.type!=='_build'){const d=OBJ[s.use.type],o=S.obj[s.use.i];const boost=(d?.sk?1+0.1*lvl(d.sk):1)*(o?TIERS[o.q??3].eff*condFactor(o):1)*(s.use.type==='compu'?(s.use.seat!=null?1.1:0.6):1)*traitBoost(s.use.type);for(const k in (d?.need||{}))serving[k]=d.need[k]*boost;}
  }
  for(const [n] of NEEDS){ if(serving[n]) nd[n]=Math.min(100,nd[n]+serving[n]*gm); else nd[n]=Math.max(0,nd[n]-DECAY[n]*gm*(bedUse(s.use)?0.5:1)*(TRAIT_DECAY[n]?TRAIT_DECAY[n]():1)); }
  if(nd.vejiga<=0){nd.vejiga=100;nd.higiene=Math.max(0,nd.higiene-45);toast(TXN.ordenes.accidente_bano);sfx('bad');s.use=null;s.path=[];s.target=null;s.leaving=false;}
  if(nd.energia<=0&&!serving.energia){s.path=[];s.target=null;s.leaving=false;s.use={type:'_suelo',t:0};toast(TXN.ordenes.dormida_suelo);sfx('bad');}
  // a la hora de salir al trabajo deja lo que esté haciendo por ocio (o la obra) y se va
  if(S.free&&!s.leaving&&shouldWork()&&S.t/60>=leaveTime()){
    const g=s.use?(s.use.goal||primaryNeed(s.use.type)):null;
    if(s.use&&!s.use.cmd&&(s.use.type==='_build'||s.use.type==='_meal'||g==='diversion'||g==='social')){s.use=null;s.think=0;}
    if(!s.use&&!s.cmd&&(s.path.length||s.target!=null||s.buildJ!=null||s.mealJ!=null)){const tg=s.target!=null&&S.obj[s.target]?primaryNeed(S.obj[s.target].t):null;if(!tg||tg==='diversion'||tg==='social'){s.path=[];s.target=null;s.buildJ=null;s.mealJ=null;s.think=0;}}
  }
  if(s.use&&s.use.type==='_build'){
    s.use.t+=gm;gainSkill(s.use.sk||'carp',gm*0.9);
    const job=S.job,st=job&&job.steps[s.use.j];
    if(!st||st.done){s.use=null;s.think=0;return;}
    if(s.use.t>=s.use.dur){const j=s.use.j;s.use=null;s.think=0;S.stats.diy++;execStep(job,j,false);}
    else if(!s.use.cmd&&['vejiga','hambre','energia'].some(n=>nd[n]<20)){s.use=null;s.think=0;}
    return;
  }
  if(s.use){
    s.use.t+=gm;
    if(s.use.type==='_weed'){gainSkill('jard',gm*0.08);if(s.use.t>=s.use.dur||['vejiga','hambre'].some(n=>nd[n]<15)){if(s.use.t>=s.use.dur)pullWeeds(s.use.i);s.use=null;s.think=0;}return;}
    if(s.use.type==='_meal'){if(!S.obj[s.use.i]||s.use.t>=s.use.dur){if(s.use.t>=s.use.dur)popBubble('😋');s.use=null;s.think=0;}return;}
    if(s.use.type!=='_suelo'){const o=S.obj[s.use.i];if(!o||o.t!==s.use.type||!usable(o)){s.use=null;return;}
      if(!OBJ[o.t].green)o.c=condOf(o)-gm*0.009*TIERS[o.q??3].wear*(WEARMUL[o.t]??1)*(Dm().soul?1.6:1);
      if(o.c<=0){o.c=0;const x=s.use.i%N+.5,y=(s.use.i/N|0)+.5;s.use=null;s.cmd=false;s.think=0;dirty();burst('spark',x,y,25,14,.9,{vz:140,life:.8,col:'#ffe066'});burst('smoke',x,y,30,5,.3,{vz:20,life:1.4});
        toast(huecos(TXN.ordenes.roto,{objeto:OBJ[o.t].n.toLowerCase()}),true);sfx('bad');popBubble('😱');return;}
      if(o.c<30&&throttled('worn'+s.use.i,120000))toast(huecos(TXN.ordenes.gastado,{objeto:OBJ[o.t].n,pct:Math.round(o.c)}));}
    const d=OBJ[s.use.type];
    if(S.opos&&S.opos.on&&(s.use.type==='libros'||s.use.type==='compu'))S.opos.h+=gm/60;
    const tsk=s.use.trainSk||(d&&d.sk);if(tsk)gainSkill(tsk,gm*(d.need.diversion||d.need.social?1:0.8)*(s.use.type==='planta'||s.use.type==='flores'?0.3:1));
    const goal=s.use.goal||primaryNeed(s.use.type)||'energia';
    const gv=nd[goal];
    let done = s.use.type==='_suelo' ? nd.energia>=45 : (gv>=99||s.use.t>720);
    if(s.use.type==='huerto')done=done||s.use.t>=40;if(s.use.type==='bancoj')done=done||s.use.t>=70;if(s.use.type==='barbacoa'&&goal==='hambre')done=gv>=95||s.use.t>=90;
    if(bedUse(s.use)){const h=S.t/60;
      if(s.use.nap)done=nd.energia>=99||s.use.t>=150; // siesta: como mucho 2 h y media
      else if(h>=Math.min(6.5,SHIFT.leave-0.6)&&h<20){if(dayType(S.day)==='work'&&S.lastWorkDay!==S.day&&SHIFT.start<12&&!noWorkToday()){done=true;if(done&&throttled('alarm'+S.day,60000)){toast(TXN.ordenes.despertador);sfx('tap');}}else done=nd.energia>=85||h>=10.5;} // por la mañana se levanta cuando ha descansado (o a las 9:30 como tarde)
      else done=false; // de noche sigue durmiendo aunque ya esté descansada
    }
    // Solo interrumpe si ya recuperó bastante y otra necesidad está en estado crítico.
    let urgent=false;
    if(!s.use.cmd&&s.use.type!=='_suelo'&&!done){
      const fun=goal==='diversion'||goal==='social';
      const lim=fun?25:10;
      // solo cuentan las necesidades físicas críticas que tienen solución en casa
      urgent=(fun||gv>=60)&&['vejiga','hambre','energia'].some(n=>n!==goal&&!serving[n]&&nd[n]<lim&&findObjs(d=>d.need&&d.need[n]).length);
      if(!urgent&&goal!=='vejiga'&&nd.vejiga<6&&!serving.vejiga)urgent=true;
    }
    if(done||urgent){
      if(done&&(s.use.type==='fogon'||s.use.type==='nevera')&&goal==='hambre'){ // después de cocinar, a comer sentada si hay mesa con silla
        const ms=findObjs((d,t)=>t==='mesa'||!!d.table).filter(i=>seatFor(i)!=null);const rr=ms.length?pathToObj(ms):null;
        if(rr){s.use=null;s.cmd=false;s.path=rr.path;s.target=null;s.mealJ=rr.obj;if(!rr.path.length)startMeal();return;}
        if(s.use.type==='fogon'&&!has('mesa')&&throttled('nomesa',200000))toast(TXN.ordenes.come_de_pie);}
      if(done&&s.use.type==='fogon')popBubble(lvl('cocina')>=3?'😋':'🙂');
      else if(done&&s.use.type==='ducha')popBubble('✨');
      else if(done&&bedUse(s.use))popBubble('☀️');
      s.use=null;s.cmd=false;s.think=0;
    }
    return;
  }
  if(s.path.length){
    const [tx,ty]=s.path[0];
    if(!walkable(tx,ty)){
      if(s.target!=null&&S.obj[s.target]){const r=pathToObj([s.target]);if(r){s.path=r.path;if(!r.path.length)startUse();return;}}
      s.path=[];s.target=null;s.cmd=false;s.think=0;if(s.leaving)goWork(true);return;}
    const dx=tx+.5-s.x,dy=ty+.5-s.y,dist=Math.hypot(dx,dy);
    const lastWp=s.path.length===1;
    anaRT.vel=Math.min(0.62,(anaRT.vel||0.15)+0.09*gm);
    if(lastWp)anaRT.vel=Math.min(anaRT.vel,0.18+dist*0.8);
    const step=anaRT.vel*gm;
    if(dist>0.001){const nx=dx/dist,ny=dy/dist;const od=anaRT.dir||[nx,ny];anaRT.dir=[od[0]+(nx-od[0])*Math.min(1,gm*0.8),od[1]+(ny-od[1])*Math.min(1,gm*0.8)];}
    anaRT.moving=true;anaRT.phase+=Math.min(step,dist)*11;
    if(dist<=step||(!lastWp&&dist<0.3)){
      if(lastWp){s.x=tx+.5;s.y=ty+.5;}else{const m=Math.min(step,dist);if(dist>0.001){s.x+=dx/dist*m;s.y+=dy/dist*m;}}
      s.path.shift();
      if(!s.path.length){anaRT.moving=false;anaRT.vel=0.15;if(s.leaving)depart();else if(s.target!=null)startUse();else if(s.buildJ!=null)startBuild();else if(s.mealJ!=null)startMeal();else if(s.weedJ!=null)startWeed();else s.cmd=false;}}
    else{s.x+=dx/dist*step;s.y+=dy/dist*step;}
    return;
  }
  anaRT.moving=false;
  if(s.leaving){depart();return;}
  if(s.target!=null){startUse();if(s.use)return;}
  if(s.queue&&s.queue.length){runCmd(s.queue.shift());return;}
  if(s.buildJ!=null){startBuild();if(s.use)return;}
  if(!S.free){s.stuck=false;if(S.job&&S.job.cmd&&S.job.who==='ana')doJobStep();return;}
  s.think-=gm; if(s.think<=0){s.think=10;autonomy();}
}
function payRent(){
  if(S.owned){payMortgage();return;}
  const rent=weeklyRent()-partnerShare(weeklyRent());
  S.money-=rent;bumpMoney();
  toast(S.money<0?huecos(TXN.ordenes.alquiler_rojos,{renta:fmt(rent)}):huecos(TXN.ordenes.alquiler_cobrado,{renta:fmt(rent)}),true);
}
