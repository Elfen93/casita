// =================== IMPUESTOS DE VERDAD: nómina bruta/neta, IRPF por tramos, IVA, IBI, declaración y «tu año fiscal» ===================
// Modelo España 2026 simplificado. Se calcula en euros anuales y se traduce a § del juego: 1 hora de salario mínimo (HW) ↔ 8,22 €.
const FS_SMI=17094,FS_EUR=()=>8.22/HW();
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
{const _pf=payFactor;payFactor=function(){const f=_pf.apply(this,arguments);try{if(S.jobless||TR().self)return f;const base=salary()*f;if(!(base>0))return f;const s=fsSlip(base);return f*s.neto/base;}catch(e){return f;}};}
// cada turno: la nómina, y lo que va al año fiscal
{const _fw=finishWork;finishWork=function(){const s0=S.shifts,m0=S.money;const self=TR().self;let pre=null;try{if(!S.jobless&&!self){const f=FS();const base=salary()*(_fsBase());pre=fsSlip(base);}}catch(e){}
  const r=_fw.apply(this,arguments);
  try{if(pre&&S.shifts>s0){const got=S.money-m0;const k=pre.neto>0?Math.max(0,got)/pre.neto:1;const y=FS().yr;const sl={};for(const q of ['bruto','ss','irpf','neto','emp','coste','valor'])sl[q]=pre[q]*k;sl.ret=pre.ret;sl.ssr=pre.ssr;sl.day=S.day;sl.gov=W_().gov;S.fs.last=sl;
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
  if(f.prev&&!f.prev.done&&d.m>=3){f.prev.done=true;if(f.prev.bruto>0)fsDeclara(f.prev);}
}catch(e){console.error(e);}return r;};}
function fsDeclara(p){const E=FS_EUR();const A=p.bruto*E;const P=FS_GOV[p.gov]||FSP();const sind=p.sind*E;const t=fsTax(A,P,sind);const real=t.irpf/E;const res=Math.round(real-p.irpf);const n=CH().name;
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
  let h=`<div class="omt">🧾 Nómina e impuestos de ${n}</div><div class="sub" style="padding:0 8px 6px">${G.e||''} ${G.n||''}. Las cifras están en § del juego; por dentro se calcula con euros de verdad (tramos de 2026).</div>`;
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
