setTimeout(()=>{try{const F=[];let N=0;const ok=(c,m)=>{N++;if(!c)F.push(m);};
 S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.money=90000;bkInstall();
 document.querySelectorAll('.diffov,#diffov,#intro,#welcome').forEach(e=>e.remove());
 const K='grado_enf',P=EDU_PROGS[K],pm=PM(),c0=P.cost,s0=JSON.stringify(P.sched);
 const lastBk=()=>{const L=BKS().log;return L[L.length-1];};
 // --- pública (sin elegir: por defecto)
 S.edu={lv:'bach',done:[],certs:[],cur:null};let m=S.money;
 ok(eduStart(K),'matrícula pública falla');const pub=ED().cur;const cobraPub=m-S.money;
 ok(cobraPub===Math.round(c0*pm),'pública cobra '+cobraPub+' y debería '+Math.round(c0*pm));
 ok(pub.centro==='publica','centro pública: '+pub.centro);
 ok(lastBk()&&lastBk()[3]==='Matrícula'&&lastBk()[2]===-cobraPub,'bkAdd pública: '+JSON.stringify(lastBk()));
 ok(!BKS().log.some(e=>e[3]==='Otros'&&e[2]===-cobraPub),'queda un apunte «Otros» de la matrícula');
 ok(destOf('clase')==='uni_publica','destOf pública: '+destOf('clase'));
 const needPub=pub.need;
 S.t=10*60;S.day=262;ok(eduInClassHours(),'pública: a las 10 es clase');S.t=17*60;ok(!eduInClassHours(),'pública: a las 17 no es clase');
 ok(P.cost===c0&&JSON.stringify(P.sched)===s0,'el programa público se ha quedado cambiado');
 // título y horas: terminar
 pub.h=pub.need;eduFinish();ok(ED().done.includes(K)&&ED().lv==='grado','la pública da el título');
 // --- privada
 S.edu={lv:'bach',done:[],certs:[],cur:null};m=S.money;UNI.pick='privada';
 ok(eduStart(K),'matrícula privada falla');const pri=ED().cur;const cobraPri=m-S.money;
 ok(cobraPri===Math.round(c0*UNI_D.mult.grado*pm),'privada cobra '+cobraPri);
 ok(cobraPri/cobraPub>=6&&cobraPri/cobraPub<=10,'razón privada/pública '+(cobraPri/cobraPub));
 ok(pri.centro==='privada','centro privada: '+pri.centro);
 ok(lastBk()&&lastBk()[3]==='Matrícula'&&lastBk()[2]===-cobraPri,'bkAdd privada: '+JSON.stringify(lastBk()));
 ok(destOf('clase')==='uni_privada','destOf privada: '+destOf('clase'));
 ok(pri.need===needPub,'mismas horas de estudio: '+pri.need+' vs '+needPub);
 ok(UNI.pick===null,'UNI.pick no se limpia');
 S.t=17*60;ok(eduInClassHours(),'privada: a las 17 es clase');S.t=10*60;ok(!eduInClassHours(),'privada: a las 10 no es clase');
 ok(P.cost===c0&&JSON.stringify(P.sched)===s0,'el programa se ha quedado con valores de la privada');
 pri.h=pri.need;eduFinish();ok(ED().done.includes(K)&&ED().lv==='grado','la privada da el mismo título');
 // sin dinero para la privada, con dinero para la pública
 S.edu={lv:'bach',done:[],certs:[],cur:null};S.money=Math.round(c0*pm)+50;UNI.pick='privada';ok(!eduStart(K)&&!ED().cur,'sin dinero no se matricula en la privada');UNI.pick=null;ok(eduStart(K),'con dinero para la pública sí');
 // --- matrícula antigua sin campo
 S.money=90000;S.edu={lv:'bach',done:[],certs:[],cur:{k:K,h:0,need:100,since:S.day,miss:0}};
 ok(destOf('clase')==='uni_publica','matrícula antigua → pública: '+destOf('clase'));S.t=10*60;ok(eduInClassHours(),'matrícula antigua usa horario público');
 // --- máster y programas que no son de la uni
 S.edu={lv:'grado',done:['grado_enf'],certs:[],cur:null};UNI.pick='privada';m=S.money;ok(eduStart('master'),'máster privado');ok(m-S.money===Math.round(EDU_PROGS.master.cost*UNI_D.mult.master*pm),'máster privado cobra '+(m-S.money));ok(destOf('clase')==='uni_privada','máster → privada');eduDrop();
 S.edu={lv:'eso',done:[],certs:[],cur:{k:'fpm_elec',h:0,need:100,since:S.day,miss:0}};ok(destOf('clase')==='biblioteca','FP sigue yendo a la biblioteca: '+destOf('clase'));
 // --- el censo
 const ir=pbVec().find(v=>v.id==='irene');ok(ir&&ir.estudia==='uni'&&ir.centro==='uni_publica','irene lleva centro');
 const en=(l,h,wd)=>vecinosEn(l,h,wd).some(q=>q.v.id==='irene'&&q.motivo==='clase');
 ok(en('uni_publica',10,1),'irene en la pública a las 10');ok(!en('uni_publica',20,1),'irene no está a las 20');ok(!en('uni_publica',10,6),'irene no está el domingo');ok(!en('uni_privada',18,1),'irene no está en la privada');
 ir.centro='uni_privada';ok(en('uni_privada',18,1)&&!en('uni_publica',10,1),'irene en la privada a las 18');ir.centro='uni_publica';
 // --- exámenes
 S.day=323;ok(uniExamen(),'enero día 17 hay exámenes');S.day=262;ok(!uniExamen(),'noviembre no');
 // --- escenas: todas las variantes dibujan y la gran aula tiene gente
 S.edu={lv:'bach',done:[],certs:[],cur:{k:K,h:0,need:100,since:S.day,miss:0,centro:'privada'}};
 const s=S.sim;s.work=100;s.awayTotal=300;s.outingActive='clase';
 for(const [key,vs] of [['uni_publica',['aula','pasillo','exterior','cerrada']],['uni_privada',['aula','exterior','cerrada']]])for(const v of vs)for(const dia of [262,323]){S.day=dia;S.t=10*60;UNI.force=v;s.dest=key;let sc=null;try{sc=buildScene(key,3,0);}catch(e){}ok(sc&&sc.items&&sc.items.length>0,key+' '+v+' no dibuja');
   if(key==='uni_publica'&&v==='aula'&&dia===262)ok(sc.items.length>=75,'aula pública con '+sc.items.length+' figuras');
   if(key==='uni_privada'&&v==='aula'&&dia===262)ok(sc.items.length>=20,'aula privada con '+sc.items.length);}
 UNI.force=null;
 // --- ir a clase de verdad
 S.day=262;S.t=10*60;S.edu={lv:'bach',done:[],certs:[],cur:{k:K,h:0,need:3200,since:S.day,miss:0}};s.work=0;s.outingActive=null;s.leaving=false;s.dest=null;S.money=90000;
 const r=doOut('clase');for(let i=0;i<30;i++)update(1);ok(S.sim.dest==='uni_publica'||awayKey()==='_calle','doOut clase → '+S.sim.dest+' r='+r);
 ok(!!PLACES.uni_publica&&!!PLACES.uni_privada,'faltan los lugares');
 const A=PLACES.uni_publica.r,B=PLACES.uni_privada.r;for(const k in PLACES){if(k==='uni_publica'||k==='uni_privada')continue;const q=PLACES[k].r;if(!q)continue;for(const X of [A,B])ok(X[2]<=q[0]||q[2]<=X[0]||X[3]<=q[1]||q[3]<=X[1],'solapa con '+k);}
 ok(A[2]<=B[0]||B[2]<=A[0]||A[3]<=B[1]||B[3]<=A[1],'las dos universidades se solapan');
 document.title=(F.length?'FAIL ':'OK ')+'uni checks='+N+' fails='+F.length+' errs='+window.__errs.length+' '+F.slice(0,4).join(' | ')+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},1200);
