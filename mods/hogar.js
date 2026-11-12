// =================== LA CASA VIVIDA: el calentador, el casero, los vecinos por la pared ===================
const HG=()=>{if(!S.hg)S.hg={boiler:0,boilerSince:0,fridge:0,wash:0,noise:0,visits:0,req:0,log:[]};return S.hg;};
const renting=()=>!S.owned&&S.home&&!['padres','calle'].includes(S.home.type);
// el calentador arreglado, por la vía que sea: se apunta y se avisa
const hgListo=()=>{const g=HG();g.boiler=0;g.fixBy=0;g.req=0;g.reqDay=0;g.plazoAsk=0;toast(DT.calentador.toast);};
const isWinter=()=>typeof seasonOf==='function'&&seasonOf(S.day)==='inv';
// ---- averías: calentador (invierno), nevera, lavadora ----
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const g=HG();const n=CH().name;const T=S.home&&S.home.type;if(!T||T==='calle')return r;const old=['infra','viejo','habitacion'].includes(T);
  // calentador
  if(!g.boiler&&Math.random()<(isWinter()?.012:.004)*(old?1.6:T==='bueno'||T==='chalet'?.4:1)){g.boiler=1;g.boilerSince=S.day;g.req=0;g.reqDay=0;g.plazoAsk=0;g.fixBy=0;tell(huecos(TXHZ.hogar.calentador_muerto,{enero:isWinter()?TXHZ.hogar.en_enero:'',quien:renting()?TXHZ.hogar.casero_mira:T==='padres'?TXHZ.hogar.primo_entiende:''}),'🚿');}
  if(g.boiler){const d=S.day-g.boilerSince;S.needs.higiene=Math.max(0,S.needs.higiene-2);if(isWinter()&&Math.random()<.04&&!S.sick){S.sick=1+(Math.random()*2|0);tell(huecos(TXHZ.hogar.ducha_invierno,{d,n}),'🤒');}
    if(renting()){if(g.req>=2&&!g.reqDay)g.reqDay=S.day;// partida antigua con burofax: el plazo cuenta desde hoy
      if(!g.reqDay&&(d===2||(d>2&&d%10===2)))askDilemma('calentador',{});// a los dos días, y cada diez mientras siga roto: reclamar, pagarlo, el sindicato o aguantar
      const fixP=.05+(S.rentStrike?.1:0)+(g.req>=2?.12:0)+(W_().mov>=55?.05:0);
      if(g.fixBy&&S.day>=g.fixBy){hgListo();tell(huecos(DT.calentador.fin_sindicato,{d}),'🚿');}
      else if(!g.fixBy&&Math.random()<fixP){const tx=g.req>=2?huecos(DT.calentador.fin_burofax,{d}):d>14?huecos(TXHZ.hogar.fontanero_por_fin,{d}):huecos(TXHZ.hogar.casero_arregla,{d});hgListo();tell(tx,'🚿');}
      else if(d===5||d===15||d===30)tell(pickR([huecos(TXHZ.hogar.casero_visto,{n}),TXHZ.hogar.casero_factura,huecos(TXHZ.hogar.gimnasio,{d,n,pago:HP().gymMember?'':TXHZ.hogar.gimnasio_pago})]),'🚿');
      // diez días después del burofax y sigue roto: el papel en la mano
      if(g.boiler&&g.reqDay&&!g.fixBy&&S.day-g.reqDay>=10&&(!g.plazoAsk||S.day-g.plazoAsk>=7)){g.plazoAsk=S.day;askDilemma('calentador_plazo',{});}}
    else if(T==='padres'){if(d>=3){hgListo();tell(huecos(TXHZ.hogar.primo_cambia,{c:fmt(hrs(20))}),'🚿');}}
    else{if(S.money>=hrs(45)&&(d>=2||Math.random()<.5)){hgListo();bkAdd('Arreglos',-hrs(45));tell(huecos(TXHZ.hogar.calentador_nuevo,{c:fmt(hrs(45))}),'🚿');}}}
  // nevera: la comida se estropea
  if(!g.fridge&&has('nevera')&&Math.random()<.004*(old?1.5:1)){g.fridge=1;S.pantry=0;S.tapers=0;tell(huecos(TXHZ.hogar.nevera_muere,{tapers:S.tapers?TXHZ.hogar.nevera_tapers:''}),'🧊');}
  if(g.fridge){S.needs.hambre=Math.max(0,S.needs.hambre-3);if(S.money>=hrs(30)&&Math.random()<.3){g.fridge=0;bkAdd('Arreglos',-hrs(30));tell(huecos(TXHZ.hogar.nevera_arreglada,{c:fmt(hrs(30)),casero:renting()?TXHZ.hogar.nevera_casero:''}),'🧊');}else if(Math.random()<.15)tell(TXHZ.hogar.sin_nevera,'🧊');}
  // lavadora: lavandería
  if(!g.wash&&has('lavadora')&&Math.random()<.003){g.wash=1;tell(TXHZ.hogar.lavadora_muere,'🧺');}
  if(g.wash){if(dateOf(S.day).wd===0){bkAdd('Otros',-hrs(1.5));toast(huecos(TXHZ.hogar.lavanderia,{c:fmt(hrs(1.5))}));}if(S.money>=hrs(25)&&Math.random()<.25){g.wash=0;bkAdd('Arreglos',-hrs(25));tell(huecos(TXHZ.hogar.lavadora_arreglada,{c:fmt(hrs(25))}),'🧺');}}
  // ---- el casero ----
  if(renting()){
    if(Math.random()<.015){g.visits++;const h=HOMES[T];tell(pickR([huecos(TXHZ.hogar.casero_entra,{n}),huecos(TXHZ.hogar.casero_pareja,{n}),huecos(TXHZ.hogar.casero_revisa,{n}),TXHZ.hogar.casero_mensaje]),'🔑');try{MT().an-=1;}catch(e){}S.needs.social=Math.max(0,S.needs.social-4);
      if(g.visits===3)chapter('casero',TXHZ.hogar.casero_titulo,huecos(TXHZ.hogar.casero_visitas,{n}));}
    // renovación: subida, o fuera
    const since=S.day-(S.home.since||0);if(since>0&&since%365===0){const up=1+.06+Math.random()*.12;if(S.rentStrike||W_().mov>=60){g.rencor=0;tell(huecos(TXHZ.hogar.renovacion_sindicato,{pct:Math.round((up-1)*100)}),'🏘️');S.rentMul=(S.rentMul||1)*1.03;}
      else if(g.rencor||Math.random()<.25){const rc=!!g.rencor;g.rencor=0;tell(rc?DT.calentador_plazo.pasa_renovar:huecos(TXHZ.hogar.no_renueva_carta,{n}),'📨');S.noRenew=S.day+90;try{MT().an-=5;}catch(e){}chapter('norenueva',TXHZ.hogar.no_renueva_titulo,huecos(TXHZ.hogar.no_renueva,{n,vac:oa()==='a'?'a':'o',ella:oa()==='a'?TXHZ.hogar.pron_ella:TXHZ.hogar.pron_el}));}
      else{S.rentMul=(S.rentMul||1)*up;tell(huecos(TXHZ.hogar.renovacion_sube,{pct:Math.round((up-1)*100)}),'📨');}}
    if(S.noRenew&&S.day>=S.noRenew){S.noRenew=null;try{if(typeof mgEvict==='function')mgEvict('casero');}catch(e){}}
    if(S.noRenew&&S.noRenew-S.day===30)tell(huecos(TXHZ.hogar.un_mes,{n}),'📨');
    // fianza al irse: lo gestiona moveHome; aquí, lo que no devuelven
  }
  // ---- vecinos ----
  if(T!=='chalet'&&T!=='casita'&&Math.random()<.05){const k=Math.random();if(k<.35){g.noise=S.day;tell(pickR([huecos(TXHZ.hogar.ruido_a,{que:pickR(TXHZ.hogar.ruido_que),n}),TXHZ.hogar.ruido_b]),'🔊');S.needs.energia=Math.max(0,S.needs.energia-8);}
    else if(k<.6)tell(pickR([huecos(TXHZ.hogar.vecina_nota,{n}),huecos(TXHZ.hogar.reunion,{que:pickR(TXHZ.hogar.reunion_que)}),TXHZ.hogar.camara]),'🏘️');
    else if(k<.8){tell(pickR([huecos(TXHZ.hogar.queja,{n,que:pickR(TXHZ.hogar.queja_que)}),huecos(TXHZ.hogar.derrama,{c:fmt(hrs(2))})]),'🏘️');S.needs.social=Math.max(0,S.needs.social-3);}
    else{const who=solWho&&solWho();if(who){tell(huecos(TXHZ.hogar.regalo,{quien:who.n,que:pickR(TXHZ.hogar.regalo_que)}),'🏘️');S.needs.social=Math.min(100,S.needs.social+8);}}}
  }catch(e){console.error(e);}return r;};}
// sin calentador, la ducha no limpia igual (y es horrible)
{const _su=startUse;startUse=function(){const r=_su.apply(this,arguments);try{const u=S.sim.use;if(u&&(u.type==='ducha'||u.type==='banera')&&HG().boiler){u.cold=true;if(throttled('cold',3e5))toast(TXHZ.hogar.ducha_fria_toast);}}catch(e){}return r;};}
{const _up=update;update=function(gm){const u=S.sim.use;const h0=S.needs.higiene;const r=_up.apply(this,arguments);try{if(u&&u.cold&&S.sim.use===u){const d=S.needs.higiene-h0;if(d>0)S.needs.higiene=h0+d*.5;S.needs.diversion=Math.max(0,S.needs.diversion-.3*gm);}}catch(e){}return r;};}
// perfil de casa: estado
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const g=HG();const L=[];if(g.boiler)L.push(huecos(TXHZ.hogar.vida_sin_agua,{d:S.day-g.boilerSince})+(renting()?g.fixBy?TXHZ.hogar.vida_fontanero:g.req>=2?' · '+huecos(DT.calentador.vida,{d:S.day-(g.reqDay||S.day),p:10})+(g.reqDay&&S.day-g.reqDay>=10?' · '+DT.calentador.vida_vencido:''):TXHZ.hogar.vida_casero:hgTipo()==='padres'?'':huecos(TXHZ.hogar.vida_arreglo,{c:fmt(hrs(45))})));if(g.fridge)L.push(TXHZ.hogar.vida_nevera);if(g.wash)L.push(TXHZ.hogar.vida_lavadora);if(S.noRenew)L.push(huecos(TXHZ.hogar.vida_renovar,{d:S.noRenew-S.day}));if(!L.length)return h;return `<h3>${TXHZ.hogar.vida_titulo}</h3><div class="sub" style="font-size:12px;color:#a04a3a">${L.join('<br>')}</div>${g.boiler&&renting()&&!g.fixBy?`<div style="padding:8px 0 12px"><button class="btn grey" id="hgcal">${TXHZ.hogar.vida_boton}</button></div>`:''}`+h;}catch(e){return h;}};}

// ---- el calentador roto de alquiler: la jugadora puede hacer algo ----
const hgTipo=()=>S.home&&S.home.type;
Object.assign(DLG,{calentador:{t:()=>DT.calentador.t,x:()=>huecos(DT.calentador.x,{d:Math.max(1,S.day-HG().boilerSince)}),
  o:()=>{const g=HG();const O=DT.calentador.o;const c=hrs(45),b=hrs(3);const sind=!!(S.rentStrike||(S.pol&&S.pol.tenant));return [
    {t:O[0].t,s:g.reqDay?huecos(O[0].s_ya,{d:S.day-g.reqDay}):huecos(O[0].s,{c:fmt(b)}),ok:()=>S.money>=b&&!g.reqDay,f:()=>{if(!g.boiler)return;bkAdd('Otros',-b);g.req=2;g.reqDay=S.day;tell(huecos(O[0].tell,{}),'📨');}},
    {t:huecos(O[1].t,{c:fmt(c)}),s:O[1].s,ok:()=>S.money>=c,f:()=>{if(!g.boiler)return;bkAdd('Arreglos',-c);hgListo();
      if(sind||Math.random()<.5){bkAdd('Alquiler',c);tell(huecos(O[1].tell_ok,{c:fmt(c)}),'🚿');}else{try{MT().an-=2;}catch(e){}tell(huecos(O[1].tell_ko,{c:fmt(c)}),'🚿');}}},
    ...(sind?[{t:O[2].t,s:O[2].s,f:()=>{if(!g.boiler)return;g.req=3;g.fixBy=S.day+2+(Math.random()*2|0);W_().mov=Math.min(100,W_().mov+1);tell(huecos(O[2].tell,{}),'🏘️');}}]:[]),
    {t:O[3].t,s:O[3].s,f:()=>{if(!g.boiler)return;tell(huecos(O[3].tell,{}),'🚿');}}];},
  auto:()=>(S.rentStrike||(S.pol&&S.pol.tenant))?2:S.money>=hrs(45)*3?1:S.money>=hrs(3)?0:2}});
Object.assign(DLG_CD,{calentador:3,calentador_plazo:3});
// ---- el burofax cumple su plazo: diez días después sigue roto y hay un papel con fecha ----
Object.assign(DLG,{calentador_plazo:{t:()=>DT.calentador_plazo.t,x:()=>huecos(DT.calentador_plazo.x,{d:Math.max(10,S.day-(HG().reqDay||S.day))}),
  o:()=>{const g=HG();const O=DT.calentador_plazo.o;const c=hrs(45);const sind=!!(S.rentStrike||(S.pol&&S.pol.tenant));const d=Math.max(10,S.day-(g.reqDay||S.day));return [
    {t:O[0].t,s:huecos(O[0].s,{c:fmt(c)}),ok:()=>S.money>=c,f:()=>{if(!g.boiler)return;bkAdd('Arreglos',-c);bkAdd('Alquiler',c);hgListo();if(Math.random()<.1)g.rencor=S.day;tell(huecos(O[0].tell,{c:fmt(c)}),'🚿');}},
    ...(sind?[{t:O[1].t,s:O[1].s,f:()=>{if(!g.boiler)return;g.req=3;g.fixBy=S.day+2+(Math.random()*2|0);W_().mov=Math.min(100,W_().mov+1);tell(huecos(O[1].tell,{}),'🏘️');}}]:[]),
    {t:O[2].t,s:huecos(O[2].s,{d}),f:()=>{if(!g.boiler)return;tell(huecos(O[2].tell,{}),'🚿');}}];},
  auto:()=>S.money>=hrs(45)*2?0:1}});// con holgura, lo arregla y lo descuenta; si no, el sindicato (si está) o esperar: la opción 1 en los dos casos
// el botón de Vida: abre la decisión ahora (de madrugada espera a que se despierte, como todas)
document.addEventListener('click',ev=>{const t=ev.target&&ev.target.closest&&ev.target.closest('#hgcal');if(!t)return;ev.stopPropagation();try{const c=ex();if(c.cool){delete c.cool.calentador;delete c.cool.calentador_plazo;}{const g=HG();askDilemma(g.reqDay&&S.day-g.reqDay>=10?'calentador_plazo':'calentador',{});}menu.classList.remove('open');const h=S.t/60;if(h<7.5||h>=23.5)toast(TXHZ.hogar.manana_calentador);else dlgTick();}catch(e){console.error(e);}},true);
