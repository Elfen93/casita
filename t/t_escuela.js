// colegio, concertado e instituto: quién está dónde y las dos salidas (recoger del cole, tutoría)
setTimeout(()=>{try{
 const log=[];let fail=0;const ck=(c,m)=>{if(!c){fail++;if(log.length<14)log.push('FALLA '+m);}};
 const told=[];{const _t=tell;tell=function(){told.push(String(arguments[0]));return _t.apply(this,arguments);};}
 const fresh=()=>{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.jobless=true;S.weather={k:'sol',t:20};S.t=7*60;};
 const fill=()=>{for(const k in S.needs)S.needs[k]=100;};
 const dayFor=(wd,from)=>{let d=from||40;while(dateOf(d).wd!==wd||festivo(d))d++;return d;};
 const ESC=['colegio','concertado','instituto'];
 // ---------- (a) el censo ----------
 fresh();const V=DATA.personas.vecinos,PL=Object.keys(PLACES);
 const alumnos=V.filter(v=>v.estudia==='cole'||v.estudia==='instituto');
 ck(ESC.every(k=>PLACES[k]),'faltan lugares');ck(alumnos.length>=10,'pocos alumnos: '+alumnos.length);
 for(const v of alumnos)ck(ESC.includes(v.centro),v.id+' sin centro');
 for(const v of V.filter(v=>v.estudia==='fp'||!v.estudia))ck(!v.centro,v.id+' no debería tener centro'); // quien estudia uni lleva su campus (mods/universidad.js)
 ck(V.some(v=>v.centro==='concertado'),'nadie en el concertado');ck(V.some(v=>v.centro==='colegio'),'nadie en el cole público');ck(V.some(v=>v.centro==='instituto'),'nadie en el instituto');
 ck(V.filter(v=>v.trabajo&&ESC.includes(v.trabajo.lugar)).length>=3,'poco personal');
 let enClase=0,vistoEnCentro=0;
 for(let wd=0;wd<7;wd++){S.day=dayFor(wd);if(wd>=5){while(dateOf(S.day).wd!==wd)S.day++;}
  for(let h=0;h<24;h+=.25){S.t=h*60;const donde={};
   for(const k of PL){for(const q of vecinosEn(k,h,wd)){if(donde[q.v.id])ck(false,`${q.v.id} a la vez en ${donde[q.v.id]} y ${k} (${wd} ${h})`);donde[q.v.id]=k;}}
   for(const v of alumnos){const clase=v.estudia==='cole'?(h>=9&&h<14):(h>=8.5&&h<14.5);
    if(wd<5&&clase){enClase++;ck(donde[v.id]===v.centro,`${v.id} debería estar en ${v.centro} (${wd} ${h}) y está en ${donde[v.id]}`);}
    if(donde[v.id]===v.centro){vistoEnCentro++;ck(wd<5&&h>=8&&h<16.5,`${v.id} en su centro fuera de horario (${wd} ${h})`);}
    if(donde[v.id]&&donde[v.id]!==v.centro)ck(!(wd<5&&clase),`${v.id} en ${donde[v.id]} en horas de clase`);}
   if(h<7.75||h>=17.5||wd>=5)for(const k of ESC)ck(vecinosEn(k,h,wd).length===0,`gente en ${k} fuera de horario (${wd} ${h})`);}}
 ck(enClase>200&&vistoEnCentro>200,'pocas comprobaciones '+enClase+'/'+vistoEnCentro);
 // festivo entre semana: cerrado
 {let d=1;while(!(festivo(d)&&dateOf(d).wd<5))d++;S.day=d;for(const k of ESC)for(const h of [9,11,13])ck(vecinosEn(k,h,dateOf(d).wd).length===0,`gente en ${k} en festivo`);}
 // mediodía de un laborable: hay gente en cada centro
 S.day=dayFor(2);for(const k of ESC)ck(vecinosEn(k,10,2).length>=2,'centro vacío a media mañana: '+k);
 // ---------- (b) las salidas ----------
 const run=(maxTicks,stop,want)=>{const seen={};for(let k=0;k<maxTicks;k++){if(k%40===0)fill();update(3);const s=S.sim;if(s.outingActive===want){seen.out=want;seen.dest=s.dest;}if(stop()){seen.k=k;break;}}return seen;};
 const kid=(a,g)=>({n:'Nora',g:g||'f',born:S.day-60*a-3,ch:{...randomChar(),g:g||'f',name:'Nora',beard:'no'}});
 // sin criaturas
 fresh();S.day=dayFor(2);S.t=14*60;fill();S.kids=[];
 ck(outAvail('cole')==='no toca','sin crías, cole: '+outAvail('cole'));ck(outAvail('tutoria')==='no toca','sin crías, tutoría: '+outAvail('tutoria'));
 S.kids=[kid(2)];ck(outAvail('cole')==='no toca','de 2 años no hay cole');ck(outAvail('tutoria')==='no toca','de 2 años no hay tutoría');
 S.kids=[kid(20)];ck(outAvail('tutoria')==='no toca','de 20 años no hay tutoría');
 // con una criatura de cinco años
 fresh();S.day=dayFor(2);S.t=14*60;fill();S.kids=[kid(5)];
 ck(outAvail('cole')===null,'cole disponible a las 14: '+outAvail('cole'));ck(outAvail('tutoria')!==null,'tutoría no es a las 14: '+outAvail('tutoria'));
 ck(ESC.includes(destOf('cole')),'destino del cole: '+destOf('cole'));ck(ESC.includes(destOf('tutoria')),'destino de la tutoría: '+destOf('tutoria'));
 const hap0=S.kids[0].hap??70;let n0=told.length;
 doOut('cole');let r=run(200,()=>S.sim.outingActive===null&&S.sim.work<=0&&!S.sim.leaving&&S.sim.outing==null&&told.length>n0,'cole');
 ck(r.out==='cole','cole sale: '+r.out);ck(ESC.includes(r.dest),'cole va al centro: '+r.dest);ck(!S.sim.outingActive,'cole vuelve');ck(told.length>n0,'cole cuenta algo');
 ck((S.kids[0].hap||0)>hap0,'cole sube el vínculo');ck(S.kids[0].recDay===S.day,'cole anota la recogida');
 // hace falta que el centro dibuje la escena
 S.sim.work=40;S.sim.awayTotal=40;S.sim.dest=destOf('cole');S.sim.outingActive='cole';S.sim.escKid=0;S.t=14*60;
 for(const k of ESC){try{const sc=buildScene(k,1,0);ck(sc&&sc.items&&sc.items.length>=1,'escena vacía '+k);}catch(e){ck(false,'escena '+k+': '+e.message);}}
 S.sim.work=0;S.sim.outingActive=null;
 // tutoría: de 16 a 18, una vez cada 30 días
 S.t=16.5*60;fill();ck(outAvail('tutoria')===null,'tutoría disponible a las 16:30: '+outAvail('tutoria'));ck(outAvail('cole')!==null,'cole ya no es a las 16:30: '+outAvail('cole'));
 n0=told.length;const hap1=S.kids[0].hap;doOut('tutoria');r=run(200,()=>!S.sim.outingActive&&S.sim.work<=0&&told.length>n0,'tutoria');
 ck(r.out==='tutoria','tutoría sale: '+r.out);ck(ESC.includes(r.dest),'tutoría va al centro: '+r.dest);ck(told.length>n0,'tutoría cuenta algo');ck(S.kids[0].hap>hap1,'tutoría sube el vínculo');
 S.t=16.5*60;S.sim.work=0;S.sim.outingActive=null;ck(outAvail('tutoria')==='no toca','tutoría dos veces seguidas: '+outAvail('tutoria'));
 S.day=dayFor(2,S.day+31);S.t=16.5*60;fill();ck(outAvail('tutoria')===null,'tutoría a los 31 días: '+outAvail('tutoria'));
 // festivo, fin de semana y enferma
 {let d=1;while(!(festivo(d)&&dateOf(d).wd<5))d++;S.day=d;S.t=14.5*60;ck(outAvail('cole')!==null,'cole en festivo: '+outAvail('cole'));}
 S.day=dayFor(5,S.day);S.t=14.5*60;ck(outAvail('cole')!==null,'cole en sábado: '+outAvail('cole'));
 S.day=dayFor(3,S.day);S.t=14.5*60;S.kids[0].sick=2;ck(outAvail('cole')==='no toca','cole con la criatura enferma');S.kids[0].sick=0;
 // una de doce años: instituto
 S.kids=[kid(13)];S.day=dayFor(1,S.day);S.t=16.5*60;fill();ck(outAvail('cole')==='no toca','a los 13 no hay recoger');ck(outAvail('tutoria')===null,'tutoría a los 13: '+outAvail('tutoria'));ck(['instituto','concertado'].includes(destOf('tutoria')),'destino a los 13: '+destOf('tutoria'));
 // el texto del diario sigue la mirada: nada de dinero, nada de «Ana» a pelo
 for(const t of told.filter(x=>/Nora/.test(x)))ck(!/ Ana\b/.test(t)&&!/€/.test(t),'texto con dinero o con Ana: '+t.slice(0,60));
 ck(window.__errs.length===0,'errores JS: '+(window.__errs[0]||''));
 document.title=(fail?'ERR ':'OK ')+'errs:'+fail+' enClase:'+enClase+' enCentro:'+vistoEnCentro+' '+log.join(' | ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
