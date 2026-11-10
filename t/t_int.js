setTimeout(()=>{try{
 const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' '));};
 S=newState('normal');S.char={...randomChar(),g:'m'};S.traits=[];S.ideo='apolitica';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=2000;
 const p=newPerson('bar',true);p.n='Marta';p.g='f';p.ch.g='f';if(!S.people.includes(p))S.people.push(p);setStage(p,'convive');p.love=80;p.rel=80;
 S.t=20*60;residents();const r=S.res.find(x=>x.pid===p.k);
 const log=[];const bed=findObjs((d,t)=>t==='cama')[0];const bx=bed%N+.5,by=(bed/N|0)+.5;
 // 1) sexo en casa: los dos andan
 const t0=GEST.cama.run(p);const d0=Math.hypot(r.x-bx,r.y-by);let arrived=null,anaArr=null;
 for(let k=0;k<60;k++){update(1);if(!arrived&&r.doing&&r.doing.act==='love')arrived=k;if(!anaArr&&S.sim.use&&S.sim.use.intimo)anaArr=k;}
 log.push('sexo: txt='+t0+' d0='+d0.toFixed(1)+' path0='+(r.plan?'plan':'noplan')+' partnerArrived@'+arrived+' ana@'+anaArr+' intimo='+JSON.stringify(S.intimo)+' bedMate='+(bedMate()&&bedMate().n)+' rpos='+r.x.toFixed(1)+','+r.y.toFixed(1)+' bed='+bx+','+by);
 for(let k=0;k<60;k++)update(1);log.push('después: use='+(S.sim.use&&S.sim.use.act)+' love='+p.love+' doing='+(r.doing&&r.doing.act));
 // 2) noche: la pareja va a la cama andando
 S.t=22*60+50;r.doing=null;r.plan=null;r.path=[];r.x=bx+3;r.y=by+2;S.sim.use=null;const pos=[];
 for(let k=0;k<120;k++){update(1);if(k%15===0)pos.push((S.t/60).toFixed(1)+':'+r.x.toFixed(1)+','+r.y.toFixed(1)+(r.doing?'/'+r.doing.act:'')+(r.path&&r.path.length?'/walk':'')+'|ana:'+(S.sim.use?S.sim.use.type:'-')+'/bm='+(bedMate()?1:0));}
 log.push('noche: '+pos.join(' '));
 // 3) sexo con la pareja fuera: la llama
 S.t=19*60;S.res=S.res.filter(x=>x.pid!==p.k);setStage(p,'pareja');S.sim.use=null;S.intimo=null;
 const t3=GEST.cama.run(p);let got=null;const tr=[];for(let k=0;k<200;k++){update(1);if(!got&&S.intimo)got=k;const rr=S.res.find(x=>x.pid===p.k);if(k%20===0)tr.push(k+':'+(rr?rr.x.toFixed(1)+','+rr.y.toFixed(1)+(rr.away?'A':'')+'/'+inArea(Math.floor(rr.x),Math.floor(rr.y)):'none')+'/p='+S.intimoPending+'/u='+(S.sim.use&&S.sim.use.act));}log.push('tr='+tr.join(' ')+' area='+JSON.stringify(S.home.area));
 log.push('llamada: '+t3+' pending='+S.intimoPending+' intimo@'+got+' res='+JSON.stringify((S.res.find(x=>x.pid===p.k)||{}).kind));
 // 4) gesto a distancia: besar cuando está lejos
 S.t=18*60+30;S.jobless=true;S.sim.work=0;S.sim.outingActive=null;S.intimo=null;S.sim.use=null;p.love=60;let r4=S.res.find(x=>x.pid===p.k);if(!r4){S.res.push({kind:'guest',pid:p.k,x:bx+4,y:by+3,path:[],phase:0,until:S.day*1440+S.t+300});r4=S.res[S.res.length-1];}if(r4){r4.doing=null;r4.plan=null;r4.path=[];r4.x=bx+4;r4.y=by+3;}
 const l0=p.love;const [sx,sy]=simCell();const cx=Math.floor(r4.x),cy=Math.floor(r4.y);const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));S.sim.path=path;S.sim.cmd=true;S.sim.gest={p:p.k,g:'besar'};
 let kissAt=null,dAt=null;for(let k=0;k<80;k++){update(1);if(!kissAt&&p.love>l0){kissAt=k;dAt=Math.hypot(r4.x-S.sim.x,r4.y-S.sim.y).toFixed(1);}}
 log.push('beso: at='+kissAt+' dist='+dAt+' gest='+JSON.stringify(S.sim.gest)+' d='+Math.hypot(r4.x-S.sim.x,r4.y-S.sim.y).toFixed(1)+' love='+p.love+' l0='+l0+' path0='+(path&&path.length)+' rdoing='+(r4.doing&&r4.doing.act)+' anapath='+(S.sim.path&&S.sim.path.length)+' use='+(S.sim.use&&S.sim.use.type));
 document.title='OK '+JSON.stringify({errs:errs.slice(0,4),werrs:window.__errs.slice(0,3),log});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
