setTimeout(()=>{try{
 const log=[];let fail=0;const ck=(c,m)=>{if(!c){fail++;log.push('FALLA '+m);}};
 const fresh=()=>{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.jobless=true;S.weather={k:'sol',t:20};S.t=7*60;const H=HP();H.list=[{k:'hiper',sev:1,since:S.day-30,dx:false}];return H;};
 const fill=()=>{for(const k in S.needs)S.needs[k]=100;};
 const run=(maxTicks,stop,want)=>{const seen={dest:null,out:null};for(let k=0;k<maxTicks;k++){if(k%40===0)fill();update(3);const s=S.sim;if(s.outingActive){seen.wasAway=true;if(!seen.out||s.outingActive===want){seen.out=s.outingActive;seen.dest=s.dest;}}if(stop()){seen.k=k;break;}}return seen;};
 // (a1) cita en la pública: sale a 'ambulatorio' y el efecto de la visita es el de siempre
 let H=fresh();hpAsk(false);ck(H.cita>S.day,'cita puesta');const d0=S.day;
 let r=run(480*20,()=>H.list[0].dx,'medico');
 ck(r.out==='medico','sale con medico: '+r.out);ck(r.dest==='ambulatorio','destino ambulatorio: '+r.dest);ck(H.list[0].dx===true,'diagnosticada');ck(!H.citaDue,'citaDue limpia');ck(!H.cita,'cita limpia');ck(S.sick>=2,'baja por hiper');ck(!S.sim.outingActive,'ha vuelto');
 const waited=S.day-d0;
 // (a2) privada: dura 45 min
 H=fresh();H.mutua=true;hpAsk(true);r=run(480*6,()=>H.list[0].dx,'medico');ck(r.out==='medico','privada sale: '+r.out);ck(OUT.medico.dur===45,'45 min en privada: '+OUT.medico.dur);ck(H.list[0].dx===true,'privada diagnostica');
 H=fresh();hpAsk(false);run(480*20,()=>H.list[0].dx);ck(OUT.medico.dur===90,'90 min en pública: '+OUT.medico.dur);
 // (a3) si no puede salir ese día (cárcel), la cita no se pierde
 H=fresh();hpAsk(false);S.jail=40;r=run(480*20,()=>H.list[0].dx);ck(H.list[0].dx===true,'cita resuelta estando en la cárcel');ck(r.out!=='medico','no salió');
 // (b) oficina de empleo
 H=fresh();while(dateOf(S.day).wd>3)S.day++;S.t=9.5*60;S.jobless=true;S.sim.work=0;S.sim.outingActive=null;fill();
 ck(destOf('ssociales')==='sepe','ssociales se ve en sepe');ck(destOf('sepe')==='sepe','dest sepe');ck(destOf('medico')==='ambulatorio','dest medico');
 ck(outAvail('sepe')===null,'sepe disponible en paro: '+outAvail('sepe'));
 const nb0=S.netBoost||0;doOut('sepe');let sp=false;r=run(200,()=>{if(S.sim.outingActive==='sepe')sp=true;return sp&&!S.sim.outingActive;},'sepe');
 // ya hecho el bucle completo: comprobar
 ck(r.out==='sepe'&&r.dest==='sepe','sepe sale y va: '+r.out+' '+r.dest);ck(!S.sim.outingActive,'sepe vuelve');ck(S.netBoost>S.day-1&&S.netBoost>nb0,'empujón a la búsqueda: '+S.netBoost);
 S.jobless=false;ck(outAvail('sepe')!==null,'con trabajo no disponible: '+outAvail('sepe'));
 // (c) la médica llama en la puerta: el bocadillo lleva el número de la pantalla durante buena parte del ciclo
 {const labs=[];const _l=label,_t=svText;label=function(t){labs.push(String(t));return _l.apply(this,arguments);};let con=0,tot=0,ok=true;
  const pantalla=[];svText=function(x,y,z,t){pantalla.push(String(t));return _t.apply(this,arguments);};
  S.day=60;S.t=10*60;for(let q=0;q<36;q++){const tt=q*.5+.25;labs.length=0;pantalla.length=0;drawScene('ambulatorio',tt,0);tot++;const b=labs.find(x=>/^Número \d+$/.test(x));if(b){con++;if(!pantalla.includes(b.slice(7)))ok=false;}}
  label=_l;svText=_t;ck(con/tot>=.7,'médica llamando en '+con+'/'+tot+' instantes');ck(ok,'el número del bocadillo no coincide con la pantalla');}
 ck(window.__errs.length===0,'errores JS: '+(window.__errs[0]||''));
 document.title=(fail?'ERR ':'OK ')+'errs:'+fail+' espera:'+waited+'d '+log.join(' | ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
