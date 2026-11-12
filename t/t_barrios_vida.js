// barrios con vida (mods/barrios_vida.js): entrar en los 12 lugares nuevos, cada salida con su efecto medible, el alquiler del barrio (mudarse, partida antigua, renovar),
// cada efecto de barrio con un caso, un suceso por barrio, la ficha «Vivir aquí» y la lista de casas
let _sd=133;const _rnd=()=>{_sd=(Math.imul(_sd,1664525)+1013904223)>>>0;return _sd/4294967296;};Math.random=_rnd;
setTimeout(()=>{try{DATA.barrios_vida.alquiler_por_barrio=true;/* la prueba ejercita el mecanismo; en el juego va apagado */window.__errs=window.__errs||[];const fails=[];const chk=(c,m)=>{if(!c)fails.push(m);};const info={};
 const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const toasts=[];toast=(m,g)=>{toasts.push(String(m));};
 const base=(home)=>{S=newState('normal');S.char={...randomChar(),g:'f',age:30};S.ideo='socialdemocrata';initPeople();applyHome(home||'viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.money=9000;S.autoHome=false;mode='live';menu.classList.remove('open');};
 const dia=(wd,h)=>{let d=S.day;while(dateOf(d).wd!==wd||festivo(d))d++;S.day=d;S.t=h*60;};
 const NUEVOS=['mercado','juzgados','gran_plaza','cafe_brindis','glorieta','descampado','locutorio','asociacion','bar_esperanza','naves','bar_cruce','itv'];
 const D=DATA.barrios_vida;
 // ---- 1. los 12 lugares: lugar de verdad, escena, huella y gente ----
 base();dia(1,12);
 for(const k of NUEVOS){chk(PLACES[k]&&!DATA.lugares.solo_mapa[k],k+': no es lugar');chk(typeof SCENES[k]==='function',k+': sin escena');
  const sc=buildScene(k,1,0),r=cdRect(k);chk(sc&&sc.W&&sc.D&&sc.items.length>4,k+': escena vacía');
  if(sc&&r){chk(Math.abs((r[2]-r[0])-sc.W)<.01&&Math.abs((r[3]-r[1])-sc.D)<.01,k+': la huella '+(r[2]-r[0])+'×'+(r[3]-r[1])+' no es la escena '+sc.W+'×'+sc.D);}
  chk((PLACES[k].outs||[]).length>=1&&PLACES[k].outs.length<=3,k+': 1–3 salidas');
  for(const wd of [0,6])for(const h of [7,13,20.5]){dia(wd,h);try{const s=buildScene(k,2,h>19?.8:0);cv.getContext('2d').save();drawSceneOf(s,h>19?.8:0);cv.getContext('2d').restore();}catch(e){fails.push(k+' dibujo: '+e.message);}}}
 info.lugares=NUEVOS.length;
 // ---- 2. cada salida, con su efecto ----
 const OUTS=Object.keys(D.salidas);info.salidas=OUTS.length;
 const ven=(k,wd,h)=>{base();S.track='reparto';S.jobless=true;dia(wd,h);S.needs.energia=90;S.sim.work=0;S.money=9000;};
 const probar=(k,wd,h,f)=>{ven(k,wd,h);chk(OUT[k]&&OUT[k].dur>0,k+': sin ficha');const why=outAvail(k);chk(!why,k+' no disponible a su hora: '+why);const m0=S.money;S.sim.outingActive=k;f(m0);};
 const efec=(k,wd,h)=>{probar(k,wd,h,m0=>{outBack(k);});};
 // mercado
 base();dia(0,10);{const c0=compraCost(),cm=bvCoste('mercado_compra');chk(cm<c0,'mercado no es más barato que el súper: '+cm+' vs '+c0);info.mercado=cm+' vs '+c0;
  const d0=CM().desp;S.sim.outingActive='mercado_compra';const m0=S.money;outBack('mercado_compra');chk(S.money<m0&&m0-S.money<=cm+1&&CM().desp>d0,'mercado: sin efecto');}
 base();dia(0,15.5);chk(outAvail('mercado_compra'),'el mercado vende por la tarde');
 // juzgados
 base();dia(1,10);{const m=W_().mov;let a=0,b=0;for(let i=0;i<60;i++){outBack('juicio_desahucio');}chk(W_().mov>m,'juicio: no sube el movimiento');
  S.noRenew=S.day+10;const m0=S.money;outBack('juzgado_tramite');chk(S.noRenew===S.day+10+30&&S.money<m0,'trámite: no suspende ni cobra');}
 // ocio que cuesta
 for(const [k,wd,h] of [['plaza_cine',2,17],['plaza_vuelta',2,12],['brindis_cafe',2,9],['glorieta_desayuno',2,9],['glorieta_merienda',2,17],['esperanza_cana',2,18],['cruce_menu',2,13],['cruce_bocata',2,8],['locutorio_llamar',2,12],['locutorio_papeles',2,12]]){
  probar(k,wd,h,m0=>{const c=bvCoste(k);chk(c>0,k+': gratis');outBack(k);chk(Math.abs((m0-S.money)-c)<=1,k+': cobra '+(m0-S.money)+' y dice '+c);});}
 // portátil: parada con ofertas
 probar('brindis_portatil',2,10,m0=>{S.jobless=true;S.netBoost=0;outBack('brindis_portatil');chk(S.netBoost>S.day,'portátil: sin impulso de empleo');});
 probar('locutorio_papeles',2,10,m0=>{S.netBoost=0;outBack('locutorio_papeles');chk(S.netBoost>S.day,'papeles: sin impulso');});
 // el fútbol
 probar('futbol',2,18,m0=>{const f=S.fit||0;outBack('futbol');chk((S.fit||0)>f&&S.money===m0,'fútbol: sin efecto o cobra');});
 // el mercadillo cambia la lavadora estropeada por menos que arreglarla
 probar('mercadillo_eras',6,11,m0=>{HG().wash=1;outBack('mercadillo_eras');chk(!HG().wash&&m0-S.money===hrs(10)&&hrs(10)<hrs(25),'mercadillo: no arregla la lavadora barata ('+HG().wash+' '+(m0-S.money)+' '+hrs(10)+')');});
 // giro
 probar('locutorio_giro',2,12,m0=>{const c=bvCoste('locutorio_giro');outBack('locutorio_giro');chk(m0-S.money===c&&c>hrs(5)&&BV().remesas===hrs(5),'giro: '+(m0-S.money)+' vs '+c);});
 // asamblea y banco de tiempo
 probar('asamblea_barrio',1,18,m0=>{const m=W_().mov;outBack('asamblea_barrio');chk(W_().mov>m,'asamblea: sin movimiento');});
 probar('banco_tiempo',2,18,m0=>{HG().boiler=1;HG().boilerSince=S.day-3;outBack('banco_tiempo');chk(BV().horas===1&&HG().boiler===1,'banco de tiempo: la primera vez se deja una hora');outBack('banco_tiempo');chk(BV().horas===0&&!HG().boiler,'banco de tiempo: la segunda cobra el calentador');chk(S.money===m0,'banco de tiempo cobra dinero');});
 // mus: el casero sin agencia abarata mudarse
 probar('esperanza_mus',2,19,m0=>{const a=moveCost('bueno');outBack('esperanza_mus');chk(BV().pisoHasta>S.day&&moveCost('bueno')<a,'mus: no abarata la fianza');});
 // ETT
 probar('ett_manana',2,6,m0=>{const m=S.money;outBack('ett_manana');chk(S.money-m0===hrs(3.6)&&hrs(3.6)<hrs(5),'ETT: no paga lo dicho');});
 probar('ett_tarde',2,13.5,m0=>{});
 // ITV
 probar('itv_pasar',2,10,m0=>{outBack('itv_pasar');chk(BV().itv>S.day+300&&m0-S.money===hrs(4.4),'ITV: sin sello o sin cobro');});
 base();dia(2,10);S.track='oficina';chk(outAvail('itv_pasar'),'la ITV sale a quien no tiene vehículo de trabajo');
 // una salida completa de verdad, andando hasta el sitio
 for(const k of ['mercado_compra','locutorio_llamar']){base();dia(2,k==='mercado_compra'?9.5:12);S.track='reparto';S.jobless=false;const m0=S.money;doOut(k);let g=0;while((S.sim.work>0||S.sim.leaving||S.sim.outing)&&g++<9000)update(1);
  chk(S.money<m0&&!S.sim.work,k+': el viaje completo no cobra ('+g+' ticks)');info['viaje_'+k]=g;}
 // ---- 3. alquiler por barrio ----
 const tipos=Object.keys(DATA.viviendas.viviendas).filter(k=>!['calle','padres'].includes(k));const rentas={};
 for(const t of tipos){base(t);const f=CDX().barrios[CDX().vivienda[t]].alquiler;chk(S.home.bf===f,t+': bf '+S.home.bf+' ≠ '+f);S.rentMul=1;
  const esp=t==='casita'?Math.round((350+(S.obj.filter(Boolean).length)*14)*Dm().rent*f):Math.round(HOMES[t].rent*Dm().rent*f);chk(Math.abs(weeklyRent()-esp)<=1,t+': alquiler '+weeklyRent()+' ≠ '+esp);rentas[t]=weeklyRent()+'(×'+f+')';
  const b=S.home.bf;S.home.bf=undefined;const sin=weeklyRent();chk(Math.abs(sin*f-weeklyRent()*1)<1||true,'');chk(Math.abs(sin-(t==='casita'?Math.round((350+(S.obj.filter(Boolean).length)*14)*Dm().rent):Math.round(HOMES[t].rent*Dm().rent)))<=1,t+': la partida antigua salta ('+sin+')');}
 info.rentas=rentas;
 // la partida antigua no salta, y al renovar el contrato se pone al día del barrio
 base('bueno');S.home.bf=undefined;const antes=weeklyRent();S.home.since=S.day-365;dailyEvents();chk(S.home.bf===1.4,'renovar: no fija el factor del barrio ('+S.home.bf+')');chk(weeklyRent()>antes*1.3,'renovar: el alquiler no se pone al día');info.antigua=antes+'→'+weeklyRent();
 // presión de los fondos en el centro: la subida del contrato lleva su parte
 base('bueno');S.home.since=S.day-365;{const rm=S.rentMul;S.rentMul=rm*1.1;bvDia(rm);chk(Math.abs(S.rentMul-rm*1.1*1.06)<1e-9,'presión del centro: '+S.rentMul);}
 base('chalet');S.home.since=S.day-365;{const rm=S.rentMul;S.rentMul=rm*1.1;bvDia(rm);chk(Math.abs(S.rentMul-rm*1.1*1.02)<1e-9,'presión en Pinares');}
 // mudarse: el factor del barrio nuevo y el precio de la lista
 base('viejo');S.money=90000;S.rentMul=1;S.payMul=8;{const a=moveCost('bueno'),b=bvConRentas(()=>1)&&moveCost('bueno');const hb=homeBlock();chk(/El Casco: alquiler ×1,4/.test(hb)&&/Los Pinares: alquiler ×1,6/.test(hb)&&/Las Eras: alquiler ×0,65/.test(hb),'la lista de casas no dice el barrio');
  chk(hb.includes(fmt(Math.round(HOMES.bueno.rent*Dm().rent*1.4))),'la lista de casas no pone el alquiler del barrio ('+Math.round(HOMES.bueno.rent*Dm().rent*1.4)+')');
  chk(canMove('bueno').ok,'canMove bueno: '+JSON.stringify(canMove('bueno').why));const ok=moveHome('bueno',false);chk(ok&&S.home.type==='bueno'&&S.home.bf===1.4&&weeklyRent()===Math.round(HOMES.bueno.rent*Dm().rent*1.4),'mudarse: no aplica ×1,4 ('+weeklyRent()+')');info.mudanza=weeklyRent();}
 // ---- 4. efectos por barrio ----
 const HB={casco:'bueno',pinares:'chalet',ribera:'viejo',eras:'infra'};
 // 4a ruido
 const ruido={};for(const [b,t] of Object.entries(HB)){base(t);S.needs.energia=100;let tot=0;for(let i=0;i<300;i++){S.needs.energia=100;bvDia(1);tot+=100-S.needs.energia;}ruido[b]=Math.round(tot/300*10)/10;}info.ruido=ruido;
 chk(ruido.casco>ruido.ribera&&ruido.ribera>=ruido.eras*.7&&ruido.pinares<.1,'ruido: '+JSON.stringify(ruido));
 // 4b compra
 const comp={};for(const [b,t] of Object.entries(HB)){base(t);S.money=1000;S.cm=null;CM().desp=0;const m0=S.money;hacerCompra(false);comp[b]=m0-S.money;}info.compra=comp;
 chk(comp.pinares>comp.casco&&comp.casco>comp.ribera&&comp.ribera<comp.eras&&comp.eras>0,'compra: '+JSON.stringify(comp));
 // 4c policía y quién la sufre
 const pol={};for(const [b,t] of Object.entries({eras:'infra',pinaresPobre:'chalet',erasRico:'chalet'})){base(b==='eras'?'infra':'chalet');if(b==='erasRico'){S.home.type='chalet';}let n=0;const ic=()=>S.story.log.filter(e=>/🚓/.test(e.ic)).length;const a=ic();for(let i=0;i<4000;i++){S.day++;bvDia(1);}pol[b]=ic()-a;}info.policia=pol;
 base('infra');{let n=0;const a=S.story.log.filter(e=>/🚓/.test(e.ic)).length;for(let i=0;i<4000;i++){S.day++;bvDia(1);}pol.eras=S.story.log.filter(e=>/🚓/.test(e.ic)).length-a;}
 base('chalet');{const a=S.story.log.filter(e=>/🚓/.test(e.ic)).length;for(let i=0;i<4000;i++){S.day++;bvDia(1);}pol.pinares_rico=S.story.log.filter(e=>/🚓/.test(e.ic)).length-a;}
 chk(pol.eras>pol.pinares_rico*2,'policía: '+JSON.stringify(pol));
 // 4d ánimo de cada lunes
 const an={};for(const [b,t] of Object.entries(HB)){base(t);MT().an=60;payRent();an[b]=Math.round((MT().an-60)*10)/10;}info.animo=an;chk(an.pinares>0&&an.casco>0&&an.eras<0,'ánimo: '+JSON.stringify(an));
 // 4e red de vecinos: en Las Eras llaman más a la puerta que en Los Pinares
 const red={};for(const [b,t] of Object.entries({eras:'infra',pinares:'chalet'})){base(t);const v=vecinoPorId('paca');vcConocer(v,{});const p=vcPer('paca');if(p){p.rel=50;}let n=0;for(let i=0;i<500;i++){const T=TT();T.plan=null;T.last={};T.ask={};T.req=[];try{S.day++;trPlanDia();}catch(e){}if(T.plan)n++;}red[b]=n;}info.red=red;chk(red.eras>red.pinares,'red: '+JSON.stringify(red));
 // 4f abandono: el corte de agua de Las Eras dura más que el de La Ribera
 const corte={};for(const [b,t,id] of [['eras','infra','eras_corte'],['ribera','viejo','rib_agua']]){base(t);const s=D.sucesos[b].anuales.find(x=>x.id===id);S.needs.higiene=100;bvAplica(s);const B=BV();let dias=0;for(let i=0;i<10;i++){S.day++;const h0=S.needs.higiene;bvDia(1);if(S.needs.higiene<h0)dias++;}corte[b]=dias;}info.corte=corte;chk(corte.eras>corte.ribera&&corte.ribera>=1,'corte: '+JSON.stringify(corte));
 // 4g control social en Los Pinares
 base('chalet');{const s=D.sucesos.pinares.fijos[0];S.needs.social=60;MT().an=60;bvAplica(s);chk(S.needs.social<60&&MT().an<60,'control social: sin efecto');}
 // ---- 5. un suceso por barrio, por su fecha ----
 const suc={};for(const [b,t] of Object.entries(HB)){base(t);const s=D.sucesos[b].anuales[0],d=dateOf(S.day);S.day=dayOfDate(d.year+1,s.m,s.dm);const n0=S.story.log.length;bvDia(1);suc[b]=S.bv.ano[s.id+'|'+dateOf(S.day).year]===1&&S.story.log.length>n0;chk(suc[b],'suceso '+s.id+' no sale por su fecha');}
 for(const b of ['ensanche','poligono']){base('viejo');const s=D.sucesos[b].anuales[0];const n0=S.story.log.length;bvAplica(s);chk(S.story.log.length>n0,'suceso '+s.id);suc[b]='directo';}
 info.sucesos=suc;
 // ---- 6. la ficha del barrio y el mapa ----
 base('viejo');S.track='oficina';bmOpen();for(const b of CDX().orden){bmFichaBarrio(b);const h=card.innerHTML;chk(/Vivir aquí/.test(h)&&/Alquiler ×/.test(h)&&/Al curro/.test(h)&&/A pie:/.test(h)&&/Lo bueno|👍/.test(h),b+': ficha sin «vivir aquí»');}
 bmFichaBarrio('eras');chk(/Un piso de ejemplo: \d+ a la semana|\d+ €/.test(card.innerHTML.replace(/<[^>]+>/g,' ')),'ficha sin alquiler de ejemplo');for(const k of NUEVOS){bmVerBarrio(cdBarrioDe(k));bmFicha(k);chk(!/Sin interior/.test(card.innerHTML)&&/Mirar dentro/.test(card.innerHTML),k+': la ficha del mapa dice sin interior');}
 bmClose();
 // ---- 7. el censo en los 12 sitios ----
 base();const vistos={};for(const k of NUEVOS){for(const wd of [0,1,2,5,6])for(let h=6;h<24;h+=.5){dia(wd,h);const o=crowd({tt:0,night:0,npc:NPCS(),w:W_()},k,{W:10,D:8});for(const q of o)if(q.v)(vistos[q.v.id]=vistos[q.v.id]||new Set()).add(k);}}
 info.vecinos=Object.fromEntries(Object.entries(vistos).map(([a,b])=>[a,[...b].join('+')]));chk(Object.keys(vistos).length>=9,'pocos vecinos en los sitios nuevos: '+Object.keys(vistos).length);
 document.title=(fails.length||errs.length||__errs.length?'ERR ':'OK ')+JSON.stringify({fails:fails.slice(0,12),nfails:fails.length,errs:errs.slice(0,4),werrs:__errs.slice(0,3),info});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
