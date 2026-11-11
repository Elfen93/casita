// =================== IMPUESTOS DE VERDAD: nómina bruta/neta, IRPF por tramos, IVA, IBI, declaración y «tu año fiscal» ===================
// Modelo España 2026 simplificado. La moneda del juego es el euro.
const FS_SMI=17094,FS_EUR=()=>1;
const FS_REF={k:'centro',tr:[[12450,.19],[20200,.24],[35200,.30],[60000,.37],[300000,.45],[1e12,.47]],ssw:.065,sse:.315,min:5550,smiTo:FS_SMI,iva:{sup:.04,red:.10,gen:.21},ah:[[6000,.19],[50000,.21],[200000,.23],[300000,.27],[1e12,.30]],ibi:1,soc:.15,hold:.0125,
  gana:'Nadie en especial: es el sistema tal como está.',pierde:'Quien vive de su sueldo paga por nómina y por IVA; quien vive de rentas, bastante menos.'};
const FS_GOV={centro:FS_REF,
  conservador:{...FS_REF,k:'conservador',tr:[[12450,.19],[20200,.24],[35200,.29],[60000,.35],[1e12,.43]],min:6000,ah:[[6000,.19],[1e12,.21]],ibi:.7,soc:.12,
    gana:'Rentas altas, herencias, propietarias, empresas. Algo las clases medias altas.',pierde:'Con sueldo bajo casi no se nota la bajada; sí se notan los recortes que vienen después.'},
  liberal:{...FS_REF,k:'liberal',tr:[[15000,.15],[1e12,.25]],min:7000,ah:[[1e12,.19]],ibi:.6,soc:.10,hold:0,
    gana:'Quien más gana: el tipo casi único premia a los sueldos y patrimonios altos.',pierde:'Los servicios: menos recaudación, más copago y más espera.'},
  austeridad:{...FS_REF,k:'austeridad',ssw:.07,min:5150,smiTo:0,iva:{sup:.05,red:.12,gen:.23},ibi:1.2,
    gana:'Los acreedores: se paga la deuda primero.',pierde:'Todo el mundo por IVA, y los sueldos bajos, que vuelven a pagar IRPF.'},
  progresista:{...FS_REF,k:'progresista',tr:[[12450,.18],[20200,.23],[35200,.30],[60000,.38],[100000,.46],[300000,.49],[1e12,.52]],smiTo:20000,iva:{sup:0,red:.10,gen:.21},ah:[[6000,.21],[50000,.23],[200000,.27],[1e12,.30]],ibi:1.1,soc:.19,hold:.025,
    gana:'Sueldos bajos y medios, inquilinas, quien usa lo público.',pierde:'Rentas altas, grandes patrimonios, banca y energéticas (que intentarán repercutirlo).'},
  consejos:{...FS_REF,k:'consejos',caja:true,ssw:.06,sse:0,iva:{sup:0,red:.04,gen:.10},ibi:0,soc:0,hold:0,ah:[[1e12,0]],
    gana:'Quien trabaja: sin IRPF hasta un sueldo alto, sin IVA en lo básico.',pierde:'Ya no hay dueños ni rentistas a quien cobrar; la caja común depende de que se produzca.'}};
FS_GOV.comunas={...FS_GOV.consejos,k:'comunas'};
const FSP=()=>FS_GOV[W_().gov]||FS_REF;
const FS=()=>{if(!S.fs)S.fs={yr:null,prev:null,last:null,decl:null};const f=S.fs;const y=dateOf(S.day).year;if(!f.yr)f.yr={y,bruto:0,ss:0,irpf:0,neto:0,emp:0,valor:0,iva:0,ibi:0,sind:0,shifts:0};return f;};
function fsScale(base,tr){let c=0,lo=0;for(const [hi,r] of tr){if(base<=lo)break;c+=(Math.min(base,hi)-lo)*r;lo=hi;}return c;}
const fsKids=()=>{const n=(S.kids||[]).length;return [2400,2700,4000,4500].slice(0,n).reduce((a,b)=>a+b,0)+Math.max(0,n-4)*4500;};
// impuestos de un año de trabajo (euros): cotización y cuota de IRPF
function fsTax(A,P,ded){P=P||FSP();ded=ded||0;
  if(P.caja){const ss=A*P.ssw;const irpf=A<=18000?0:A<=45000?(A-18000)*.10:2700+(A-45000)*.25;return {ss,irpf};}
  const ss=Math.min(A,61214)*P.ssw;const rn=A-ss-2000-ded;const red=rn<=14852?7302:rn<19747?7302-1.75*(rn-14852):0;const base=Math.max(0,rn-red);
  let irpf=Math.max(0,fsScale(base,P.tr)-fsScale(Math.min(base,P.min+fsKids()),P.tr));
  if(P.smiTo){if(A<=P.smiTo)irpf=0;else if(A<P.smiTo+1200)irpf*=(A-P.smiTo)/1200;}
  return {ss,irpf};}
const fsShiftsYr=()=>Math.max(1,(TR().days||[0,1,2,3,4]).length*49);
// lo que se cobra hoy (neto con el sistema de referencia y año completo) → bruto equivalente
const _fsC=new Map();
function fsGrossYr(netShift){const k=Math.round(netShift)+'|'+(S.kids||[]).length;if(_fsC.has(k))return _fsC.get(k);const N=netShift*fsShiftsYr()*FS_EUR();let lo=N,hi=N*2.2;
  for(let i=0;i<40;i++){const m=(lo+hi)/2;const t=fsTax(m,FS_REF);if(m-t.ss-t.irpf<N)lo=m;else hi=m;}if(_fsC.size>300)_fsC.clear();_fsC.set(k,hi);return hi;}
// nómina de un turno con el gobierno actual
function fsSlip(netRef){const A=fsGrossYr(netRef);const P=FSP();const t=fsTax(A,P);const n=fsShiftsYr(),E=FS_EUR();const g=A/n/E;
  const ss=t.ss/n/E,irpf=t.irpf/n/E,emp=g*P.sse,neto=g-ss-irpf;return {bruto:g,ss,irpf,neto,emp,coste:g+emp,valor:(g+emp)*2.4,ret:t.irpf/A,ssr:t.ss/A,A};}
// el sueldo neto que llega depende del gobierno
{const _pf=payFactor;payFactor=function(){const f=_pf.apply(this,arguments);try{if(S.jobless||TR().self||TR().auto)return f;const base=salary()*f;if(!(base>0))return f;const s=fsSlip(base);return f*(S.fs&&S.fs.negro?s.bruto*.92:s.neto)/base;}catch(e){return f;}};}
// cada turno: la nómina, y lo que va al año fiscal
{const _fw=finishWork;finishWork=function(){const s0=S.shifts,m0=S.money;const self=TR().self;let pre=null;try{if(!S.jobless&&!self&&!TR().auto){const f=FS();const base=salary()*(_fsBase());pre=fsSlip(base);}}catch(e){}
  const r=_fw.apply(this,arguments);
  try{if(!pre&&S.shifts>s0&&TR().auto){FS().yr.aut=(FS().yr.aut||0)+Math.max(0,S.money-m0);}if(pre&&S.fs.negro&&S.shifts>s0){const y=FS().yr;const got=Math.max(0,S.money-m0);S.fs.last={bruto:got,ss:0,irpf:0,neto:got,emp:0,coste:got,valor:got*2.6,ret:0,ssr:0,day:S.day,gov:W_().gov,negro:true};y.negro=(y.negro||0)+1;S.fs.negroTot=(S.fs.negroTot||0)+1;y.valor+=got*2.6;pre=null;}
  if(pre&&S.shifts>s0){const got=S.money-m0;const k=pre.neto>0?Math.max(0,got)/pre.neto:1;const y=FS().yr;const sl={};for(const q of ['bruto','ss','irpf','neto','emp','coste','valor'])sl[q]=pre[q]*k;sl.ret=pre.ret;sl.ssr=pre.ssr;sl.day=S.day;sl.gov=W_().gov;S.fs.last=sl;
    y.bruto+=sl.bruto;y.ss+=sl.ss;y.irpf+=sl.irpf;y.neto+=sl.neto;y.emp+=sl.emp;y.valor+=sl.valor;y.shifts++;}}catch(e){}return r;};}
function _fsBase(){let f=1;try{const g=govPay();f=g;}catch(e){}return f;}
// IVA: los básicos cambian de precio con el gobierno; el resto se apunta
const fsIvaFood=P=>.6*P.iva.sup+.4*P.iva.red;
function govIvaFood(){const P=FSP();return (1+fsIvaFood(P))/(1+fsIvaFood(FS_REF));}
function fsIvaOf(ctx,v,P){const c=BK_CAT[ctx]||'otros';if(['ingresos','ahorro','deudas','familia'].includes(c)||ctx==='Alquiler'||ctx==='Hipoteca')return 0;
  const r=ctx==='Compra'?fsIvaFood(P):ctx==='Menú'||ctx==='Café'||ctx==='Comida'?P.iva.red:ctx==='Libros'?P.iva.sup:ctx==='Médico'||ctx==='Terapia'?0:P.iva.gen;return Math.abs(v)*r/(1+r);}
// año a año: IVA del día anterior, cuota sindical, IBI, cambio de año y declaración
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const f=FS();const P=FSP();const d=dateOf(S.day);const n=CH().name;
  const L=BKS().log;for(let i=L.length-1;i>=0&&i>L.length-80;i--){const e=L[i];if(e[0]<S.day-1)break;if(e[0]===S.day-1&&e[2]<0)f.yr.iva+=fsIvaOf(e[3],e[2],P);}
  if(S.union&&S.union.member&&typeof unionFee==='function')f.yr.sind+=unionFee()/30;
  // IBI, el recibo de otoño
  if(S.owned&&d.m===9&&d.dm===1&&P.ibi>0){const v=Math.round(housePrice()*.003*P.ibi);if(v>0){bkAdd('Hacienda',-v);f.yr.ibi+=v;tell(`Recibo del IBI: ${fmt(v)}. Ser propietaria también se paga cada año.${P.k==='conservador'||P.k==='liberal'?' Este año, rebajado.':''}`.replace('propietaria',ga('propietaria','propietario','propietarie')),'🏛️');}}
  // año nuevo: se cierra el anterior
  if(d.year!==f.yr.y){f.prev={...f.yr,done:false,gov:W_().gov};f.yr={y:d.year,bruto:0,ss:0,irpf:0,neto:0,emp:0,valor:0,iva:0,ibi:0,sind:0,shifts:0};
    if(f.prev.bruto>0)tell(`Año fiscal cerrado. ${n} ganó ${fmt(Math.round(f.prev.bruto))} brutos y le llegaron ${fmt(Math.round(f.prev.neto))}. La declaración, en abril.`,'🧾');}
  // la renta: abril
  if(f.prev&&!f.prev.done&&d.m>=3){f.prev.done=true;if(f.prev.bruto>0||(f.prev.aut||0)>0)fsDeclara(f.prev);}
}catch(e){console.error(e);}return r;};}
function fsDeclara(p){const E=FS_EUR();const A=(p.bruto+Math.max(0,(p.aut||0)-(p.cuota||0)))*E;const P=FS_GOV[p.gov]||FSP();const sind=p.sind*E;const t=fsTax(A,P,sind);const real=t.irpf/E;const res=Math.round(real-p.irpf);const n=CH().name;
  const why=[];if(p.shifts<fsShiftsYr()*.85)why.push('no trabajó el año entero y le retuvieron como si sí');if(sind>0)why.push(`la cuota del sindicato (${fmt(Math.round(p.sind))}) desgrava`);if((S.kids||[]).length)why.push('los críos rebajan la cuota');
  S.fs.decl={y:p.y,real:Math.round(real),ret:Math.round(p.irpf),res,day:S.day};
  if(P.caja){tell(`Este año no hay declaración: la caja común se liquida sola en asamblea. ${n} ha ido a mirar en qué se gastó: hospital, comedores y el autobús nuevo.`,'🧾');return;}
  if(Math.abs(res)<3){tell(`Declaración de la renta: ni pagar ni devolver. Retuvieron lo justo.`,'🧾');return;}
  if(res<0){bkAdd('Hacienda',-res);tell(`Declaración de la renta: le devuelven ${fmt(-res)}. ${why.length?'Porque '+why.join(', ')+'.':''} Es su propio dinero, prestado un año a Hacienda sin intereses.`,'🧾');}
  else{bkAdd('Hacienda',-res);tell(`Declaración de la renta: le sale a pagar ${fmt(res)}. ${n} lo mira tres veces. Está bien hecha.`,'🧾');}}
// la compra: el IVA de los básicos entra en el precio
// (comidas.js multiplica por govFood(); aquí se encadena el IVA)
{const _gf=typeof govFood==='function'?govFood:()=>1;govFood=function(){return _gf()*govIvaFood();};}
// ---------- ventana: nómina e impuestos ----------
let fsEl=null;
function closeFs(){if(fsEl)fsEl.classList.remove('on');}
function openFs(){const f=FS();const P=FSP();const G=GOVS[W_().gov]||{};const n=CH().name;if(!fsEl){fsEl=document.createElement('div');fsEl.id='fsheet';document.body.appendChild(fsEl);}
  const row=(a,b,cls)=>`<div class="gvr"><span>${a}</span><b${cls?` style="color:${cls}"`:''}>${b}</b></div>`;const F=v=>fmt(Math.round(v));const pc=v=>(v*100).toFixed(1).replace('.',',')+' %';
  let h=`<div class="omt">🧾 Nómina e impuestos de ${n}</div><div class="sub" style="padding:0 8px 6px">${G.e||''} ${G.n||''}. Tramos y cotizaciones de 2026.</div>`;
  const sl=f.last;
  if(sl){h+=`<div class="gvbox"><div class="fst">Último turno (día ${sl.day})</div>`;
    h+=row('🏭 Valor que produjo',F(sl.valor),'#2e8b57');h+=row('💼 Lo que le cuesta a la empresa',F(sl.coste));if(sl.emp>0)h+=row('  · cotización de la empresa',F(sl.emp));
    h+=row('📄 Sueldo bruto',F(sl.bruto));h+=row(P.caja?'🤝 Caja común (salud, pensiones)':'🏥 Seguridad Social ('+pc(sl.ssr)+')','−'+F(sl.ss),'#c0392b');h+=row(P.caja?'🤝 Aportación progresiva':'🏛️ Retención de IRPF ('+pc(sl.ret)+')','−'+F(sl.irpf),'#c0392b');
    h+=row('💶 Le llega',F(sl.neto),'#3b3247');h+=`<div class="sub" style="font-size:11px;padding:4px 0">De cada 100 que produce, le llegan ${Math.round(sl.neto/sl.valor*100)}. ${P.caja?'El resto se decide en asamblea.':'Al Estado van '+Math.round((sl.ss+sl.irpf+sl.emp)/sl.valor*100)+'; a la empresa, '+Math.round((sl.valor-sl.coste)/sl.valor*100)+'.'}</div></div>`;}
  else h+=`<div class="sub" style="padding:6px 8px">Todavía no hay nómina este año.</div>`;
  const y=f.yr;const tot=y.ss+y.irpf+y.iva+y.ibi;
  h+=`<div class="gvbox"><div class="fst">Este año (${y.y}) · ${y.shifts} turnos</div>${row('Bruto',F(y.bruto))}${row('Seguridad Social',F(y.ss))}${row('IRPF retenido',F(y.irpf))}${row('IVA pagado al comprar (aprox.)',F(y.iva))}${y.ibi?row('IBI',F(y.ibi)):''}${row('Total en impuestos y cotizaciones',F(tot),'#c0392b')}${y.bruto>0?row('Su tipo efectivo',pc(tot/(y.bruto+y.iva))):''}</div>`;
  // el dueño de la empresa
  if(!P.caja&&S.office&&!TR().coop){const prof=3.2e6;const soc=prof*P.soc;const rest=prof-soc;const dist=rest*.1;const hold=rest*.9*P.hold;const ah=fsScale(dist,P.ah);const tAll=(soc+fsScale(rest,P.ah))/prof,tReal=(soc+hold+ah)/prof;
    const wk=sl?(sl.ss+sl.irpf+sl.emp)/sl.coste+(y.bruto>0?y.iva/(y.bruto+y.iva):.06):0;
    h+=`<div class="gvbox"><div class="fst">¿Y el dueño de ${S.office.n}?</div><div class="sub" style="font-size:11.5px">Vive de los beneficios de la empresa: unos 3,2 millones al año. Paga sociedades y, si los cobra, impuesto del ahorro (que tiene su propia escala, más baja que la del trabajo en lo alto).</div>${row('Si lo cobrara todo',pc(tAll))}${row('Como lo hace: lo deja en una sociedad patrimonial',pc(tReal),'#c0392b')}${sl?row(n+', contando cotizaciones e IVA',pc(wk),'#3b3247'):''}<div class="sub" style="font-size:11px">La sociedad patrimonial es legal: el dinero se queda en una empresa suya y casi no tributa hasta que lo saca. ${n} no tiene dónde dejar su nómina.</div></div>`;}
  // la declaración
  const dc=f.decl;h+=`<div class="gvbox"><div class="fst">Declaración de la renta</div>${dc?row(`Año ${dc.y}`,dc.res<0?'le devolvieron '+F(-dc.res):dc.res>0?'pagó '+F(dc.res):'ni pagar ni devolver'):`<div class="sub" style="font-size:11.5px">En abril se liquida el año anterior. Si no trabajó el año entero, si está en el sindicato o tiene críos, suele salir a devolver.</div>`}</div>`;
  // el sistema actual
  if(!P.caja){h+=`<div class="gvbox"><div class="fst">El sistema ahora</div>${row('Tramos de IRPF',P.tr.length+' · del '+Math.round(P.tr[0][1]*100)+' al '+Math.round(P.tr[P.tr.length-1][1]*100)+' %')}${row('No paga IRPF por debajo de',P.smiTo?Math.round(P.smiTo/1000)+'.000 € al año':'nada: sin exención')}${row('IVA básicos / reducido / general',[P.iva.sup,P.iva.red,P.iva.gen].map(v=>Math.round(v*100)+' %').join(' · '))}${row('Rentas del capital',Math.round(P.ah[0][1]*100)+'–'+Math.round(P.ah[P.ah.length-1][1]*100)+' %')}${row('IBI',P.ibi===1?'normal':P.ibi<1?'rebajado':'subido')}`;}
  else h+=`<div class="gvbox"><div class="fst">El sistema ahora</div>${row('IRPF','sustituido por aportación a la caja común')}${row('Sin aportar por debajo de','18.000 € al año')}${row('IVA básicos / reducido / general',[P.iva.sup,P.iva.red,P.iva.gen].map(v=>Math.round(v*100)+' %').join(' · '))}`;
  h+=`<div class="sub" style="font-size:11.5px;padding-top:6px"><b>A quién beneficia:</b> ${P.gana}<br><b>Quién lo paga:</b> ${P.pierde}</div></div><div style="padding:6px"><button class="btn" id="fsclose">Cerrar</button></div>`;
  fsEl.innerHTML=h;fsEl.classList.add('on');}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('#fsopen,#fsclose');if(!t)return;if(t.id==='fsopen')openFs();else closeFs();},true);
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{h=h.replace('<h3>🌍 El mundo</h3>',`<h3>🌍 El mundo</h3><button class="btn grey" id="fsopen">🧾 Nómina e impuestos</button>`);}catch(e){}return h;};}

// =================== TRABAJO EN NEGRO ===================
const fsDlgEl=()=>{let e=document.getElementById('fsdlg');if(!e){e=document.createElement('div');e.id='fsdlg';document.body.appendChild(e);}return e;};
function fsAsk(title,txt,opts){const e=fsDlgEl();e.innerHTML=`<div class="omt">${title}</div><div class="sub" style="padding:4px 8px 8px;font-size:13px">${txt}</div><div style="display:flex;flex-direction:column;gap:6px;padding:4px 6px">${opts.map((o,i)=>`<button class="btn${i?' grey':''}" data-fsd="${i}">${o[0]}</button>`).join('')}</div>`;e.classList.add('on');e.querySelectorAll('[data-fsd]').forEach(b=>b.onclick=()=>{e.classList.remove('on');opts[+b.dataset.fsd][1]();if(typeof openMenu==='function'&&menu.classList.contains('open'))openMenu();});}
function fsNegroOK(){const w=W_();return !S.jobless&&!TR().self&&!TR().auto&&!TR().coop&&S.track!=='funcion'&&w.era!=='consejos'&&w.era!=='comunas';}
function fsNegroStop(why){const f=FS();if(!f.negro)return;f.negro=false;tell(why,'📄');}
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{fsNegroWeek();fsAutWeek();}catch(e){console.error(e);}return r;};}
function fsNegroWeek(){const f=FS();const w=W_();const n=CH().name;const jefe=S.office?S.office.n:'la empresa';
  if(f.negro&&!fsNegroOK()){fsNegroStop('Se acabó cobrar en negro.');return;}
  // la oferta
  if(!f.negro&&fsNegroOK()&&S.day-(f.negroAsk||-99)>40){const sec=['hosteleria','obra','cuidados','super'].includes(S.track)?.09:.03;if(Math.random()<sec*(1+TOX())*(w.crisis>55?1.5:1)){f.negroAsk=S.day;
    fsAsk('💶 «Te lo pago en mano»',`En ${jefe} te proponen dejar de tener contrato y cobrar en negro. «Te llevas más limpio y nos ahorramos papeles.» Más dinero cada semana; pero sin Seguridad Social: sin paro si te echan, sin baja si te pasa algo, y esos días no cuentan para la pensión.`,
      [['Aceptar: cobrar en B',()=>{f.negro=true;f.negroSince=S.day;tell(`${n} cobra en negro desde hoy. El sobre llega los viernes. Oficialmente, no trabaja en ningún sitio.`,'💶');}],
       ['No: quiero contrato',()=>{if(Math.random()<.25+TOX()*.3){S.rep=Math.max(0,(S.rep??60)-5);tell(`${n} ha dicho que no. El encargado lo ha apuntado. «Hay cola de gente que diría que sí.»`,'😒');}else tell(`${n} ha dicho que no. Por esta vez, no ha pasado nada.`,'📄');}]]);}}
  if(!f.negro)return;
  // inspección de trabajo
  const pIns={progresista:.06,mercado:.05,austeridad:.02,conservador:.015,liberal:.01}[w.gov]||.03;
  if(Math.random()<pIns){if(Math.random()<.55){f.negro=false;tell(`Inspección de trabajo en ${jefe}. A la empresa le cae una multa y tiene que dar de alta a todo el mundo. ${n} vuelve a tener contrato. Al encargado no le ha hecho gracia.`,'🕵️');}
    else{f.negro=false;S.jobless=true;S.paroWeeks=0;tell(`Inspección de trabajo. La empresa paga la multa y despide a quien estaba en negro, «para evitar problemas». ${n} se va a la calle sin paro: oficialmente nunca trabajó allí.`,'🕵️');}}}
// si echan a alguien que estaba en negro: sin paro
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const f=FS();if(f.negro&&S.jobless){f.negro=false;if(S.paroWeeks>0){S.paroWeeks=0;tell(`Sin contrato no hay paro. ${CH().name} ha ido al SEPE: «no consta ninguna relación laboral». ${f.negroSince?Math.round((S.day-f.negroSince)/7)+' semanas trabajadas que no existen.':''}`,'📄');}}
  if(f.negro&&S.sick>0&&!f.negroSick){f.negroSick=1;tell(`Sin contrato, la baja no existe. ${CH().name} no cobra los días que no puede ir. Y si fue en el trabajo, «se cayó en casa».`,'🩹');}if(!S.sick)f.negroSick=0;}catch(e){}return r;};}
function fsPedirAlta(){const f=FS();const o=office();const n=CH().name;const p=.35+(o.org||0)/200+(S.union&&S.union.member?.15:0);
  if(Math.random()<p){f.negro=false;tell(`${n} ha pedido el alta. ${S.union&&S.union.member?'Con el delegado sindical delante, ':''}la empresa ha cedido: vuelve a tener contrato.`,'📄');}
  else if(Math.random()<.4){f.negro=false;S.jobless=true;S.paroWeeks=0;tell(`${n} ha pedido el alta. Al día siguiente ya no la necesitaban. Sin contrato, ni despido ni paro.`.replace('no la necesitaban',ga('no la necesitaban','no lo necesitaban','no le necesitaban')),'📦');}
  else tell(`${n} ha pedido el alta. «Ya veremos», dice el encargado. Sigue en negro.`,'📄');
  if(typeof openMenu==='function')openMenu();}
// =================== AUTÓNOMOS: cuota por tramos de rendimiento ===================
const FS_CUOTA=[[670,200],[900,220],[1166,260],[1300,291],[1700,294],[1850,350],[2030,370],[2330,390],[2760,415],[3190,440],[3620,465],[4050,490],[6000,530],[1e9,590]];
function fsCuotaEur(rendMes){for(const [lim,c] of FS_CUOTA)if(rendMes<=lim)return c;return 590;}
function fsAut(){const f=FS();f.au=f.au||{alta:false,since:null,hist:[],lastInc:0,warned:0};return f.au;}
function fsAutRendMes(){const a=fsAut();const E=FS_EUR();let v=0;if(TR().auto&&!S.jobless&&!TR().self)v+=salary()*(TR().days||[]).length*4.3;else if(TR().self&&S.biz)v+=Math.max(0,(S.biz.last||0))*4.3;
  const fl=a.hist.filter(x=>x[0]>S.day-90).reduce((s,x)=>s+x[1],0)/3;return (v+fl)*E;}
function fsCuota(){const a=fsAut();const w=W_();if(w.era==='consejos'||w.era==='comunas')return 0;const E=FS_EUR();let c=fsCuotaEur(fsAutRendMes());if(a.since!=null&&S.day-a.since<365)c=80;if(w.gov==='mercado')c*=.7;return Math.round(c/E);}
function fsAutWeek(){const a=fsAut();const n=CH().name;
  // lo que entra por escribir o pintar
  try{const C=LB();const inc=C.inc||0;if(inc>a.lastInc){a.hist.push([S.day,inc-a.lastInc]);a.lastInc=inc;}a.hist=a.hist.filter(x=>x[0]>S.day-365);}catch(e){}
  // el reparto y el negocio son autónomos desde el principio
  if((TR().auto||TR().self)&&!S.jobless&&!a.alta){a.alta=true;a.since=S.day;tell(`${n} se ha dado de alta como autónoma. El primer año, tarifa plana: 80 € al mes. Luego, según lo que gane.`.replace('autónoma',ga('autónoma','autónomo','autónome')),'📑');}
  // si gana con regularidad escribiendo o pintando: toca alta
  const fl=a.hist.reduce((s,x)=>s+x[1],0)*FS_EUR();
  if(!a.alta&&fl>=FS_SMI*.5&&S.day-a.warned>60){a.warned=S.day;
    fsAsk('📑 Ya no es un hobby',`Lo que ${n} gana escribiendo o pintando ya es habitual. Hacienda y la Seguridad Social consideran que es una actividad: toca darse de alta como autónoma y pagar cuota cada mes (el primer año, tarifa plana de 80 €).`.replace('autónoma',ga('autónoma','autónomo','autónome')),
      [['Darse de alta',()=>{a.alta=true;a.since=S.day;tell(`${n} ya es autónoma. Factura, IVA trimestral y cuota. Bienvenida a la burocracia.`.replace('autónoma',ga('autónoma','autónomo','autónome')).replace('Bienvenida',ga('Bienvenida','Bienvenido','Bienvenide')),'📑');}],
       ['Seguir sin alta (y cruzar los dedos)',()=>{a.sin=S.day;tell(`${n} sigue cobrando sin estar de alta. Si llega una inspección, habrá que pagar las cuotas atrasadas y una multa.`,'🤞');}]]);}
  if(!a.alta&&a.sin&&Math.random()<.015){const atr=Math.round(fsCuotaEur(fl/12)*Math.min(12,Math.round((S.day-a.sin)/30))/FS_EUR());const multa=Math.round(atr*.5);bkAdd('Hacienda',-(atr+multa));a.alta=true;a.since=S.day-400;a.sin=null;tell(`Inspección: ${n} tenía ingresos sin estar de alta. Cuotas atrasadas (${fmt(atr)}) y multa (${fmt(multa)}). Ahora, de alta y sin tarifa plana.`,'🕵️');}
  // la baja como autónoma si deja de haber actividad
  if(a.alta&&!TR().auto&&!TR().self&&fl<FS_SMI*.2){a.alta=false;tell(`${n} se ha dado de baja como autónoma: ya no le compensa.`.replace('autónoma',ga('autónoma','autónomo','autónome')),'📑');}
  // la cuota, el día 1 de cada mes (se cobra en el lunes que cae en la primera semana)
  const d=dateOf(S.day);if(a.alta&&d.dm<=7&&a.paid!==d.m){a.paid=d.m;const c=fsCuota();if(c>0){bkAdd('Cuota autónomos',-c);const y=FS().yr;y.cuota=(y.cuota||0)+c;y.ss+=c;}}
  // la vieja cuota simbólica del núcleo se devuelve: ahora va por tramos
  if(TR().auto&&!S.jobless)S.money+=Math.round(4*PM());}
if(typeof BK_CAT!=='undefined')BK_CAT['Cuota autónomos']='deudas';
// en la ventana: negro y autónomos
{const _of=openFs;openFs=function(){_of.apply(this,arguments);try{const f=FS();const a=fsAut();const n=CH().name;let x='';
  if(f.negro)x+=`<div class="gvbox" style="border-color:#c0392b"><div class="fst">💶 Cobrando en negro</div><div class="sub" style="font-size:11.5px">Desde el día ${f.negroSince}. Sin Seguridad Social: sin paro, sin baja, y ${f.negroTot||0} turnos que no cuentan para la pensión.</div><button class="btn grey" id="fsalta">📄 Pedir que me den de alta</button></div>`;
  else if(f.negroTot)x+=`<div class="sub" style="font-size:11px;padding:2px 8px">${f.negroTot} turnos trabajados en negro: no cuentan para la pensión.</div>`;
  if(a.alta){const c=fsCuota();x+=`<div class="gvbox"><div class="fst">📑 Autónoma</div>`.replace('Autónoma',ga('Autónoma','Autónomo','Autónome'))+`<div class="gvr"><span>Rendimiento estimado</span><b>${Math.round(fsAutRendMes())} €/mes</b></div><div class="gvr"><span>Cuota a la Seguridad Social</span><b style="color:#c0392b">${fmt(c)}/mes${a.since!=null&&S.day-a.since<365?' (tarifa plana)':''}</b></div><div class="sub" style="font-size:11px">Por tramos: gana poco y paga mucho en proporción (200 € al mes por debajo de 670 €); gana mucho y paga como mucho 590 €. El IRPF de lo que gane se liquida en la renta.</div></div>`;}
  if(x){const box=fsEl.querySelector('#fsclose');box.parentElement.insertAdjacentHTML('beforebegin',x);const b=fsEl.querySelector('#fsalta');if(b)b.onclick=()=>{fsPedirAlta();openFs();};}}catch(e){console.error(e);}};}
