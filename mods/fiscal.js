// =================== IMPUESTOS DE VERDAD: nómina bruta/neta, IRPF por tramos, IVA, IBI, declaración y «tu año fiscal» ===================
const {fiscal:TX_fiscal}=DATA.textos_mods_ag;
// Modelo España 2026 simplificado. La moneda del juego es el euro.
const FS_EUR=()=>1;
const FS_SMI=DATA.gobiernos.smi_anual;
const FS_GOV=DATA.gobiernos.fiscal,FS_REF=FS_GOV.centro;
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
  if(S.owned&&d.m===9&&d.dm===1&&P.ibi>0){const v=Math.round(housePrice()*.003*P.ibi);if(v>0){bkAdd('Hacienda',-v);f.yr.ibi+=v;tell(huecos(TX_fiscal.ibi,{v:fmt(v),prop:ga(...TX_fiscal.ibi_prop),rebaja:P.k==='conservador'||P.k==='liberal'?TX_fiscal.ibi_rebajado:''}),'🏛️');}}
  // año nuevo: se cierra el anterior
  if(d.year!==f.yr.y){f.prev={...f.yr,done:false,gov:W_().gov};f.yr={y:d.year,bruto:0,ss:0,irpf:0,neto:0,emp:0,valor:0,iva:0,ibi:0,sind:0,shifts:0};
    if(f.prev.bruto>0)tell(huecos(TX_fiscal.anio_cerrado,{b:fmt(Math.round(f.prev.bruto)),c:fmt(Math.round(f.prev.neto))}),'🧾');}
  // la renta: abril
  if(f.prev&&!f.prev.done&&d.m>=3){f.prev.done=true;if(f.prev.bruto>0||(f.prev.aut||0)>0)fsDeclara(f.prev);}
}catch(e){console.error(e);}return r;};}
function fsDeclara(p){const E=FS_EUR();const A=(p.bruto+Math.max(0,(p.aut||0)-(p.cuota||0)))*E;const P=FS_GOV[p.gov]||FSP();const sind=p.sind*E;const t=fsTax(A,P,sind);const real=t.irpf/E;const res=Math.round(real-p.irpf);const n=CH().name;
  const why=[];if(p.shifts<fsShiftsYr()*.85)why.push(TX_fiscal.decl_porque_sin_ano);if(sind>0)why.push(huecos(TX_fiscal.decl_porque_sindicato,{v:fmt(Math.round(p.sind))}));if((S.kids||[]).length)why.push(TX_fiscal.decl_porque_hijos);
  S.fs.decl={y:p.y,real:Math.round(real),ret:Math.round(p.irpf),res,day:S.day};
  if(P.caja){tell(huecos(TX_fiscal.decl_caja,{}),'🧾');return;}
  if(Math.abs(res)<3){tell(TX_fiscal.decl_igual,'🧾');return;}
  if(res<0){bkAdd('Hacienda',-res);tell(huecos(TX_fiscal.decl_devuelven,{v:fmt(-res),porque:why.length?huecos(TX_fiscal.decl_porque,{lista:why.join(', ')}):''}),'🧾');}
  else{bkAdd('Hacienda',-res);tell(huecos(TX_fiscal.decl_paga,{v:fmt(res)}),'🧾');}}
// la compra: el IVA de los básicos entra en el precio
// (comidas.js multiplica por govFood(); aquí se encadena el IVA)
{const _gf=typeof govFood==='function'?govFood:()=>1;govFood=function(){return _gf()*govIvaFood();};}
// ---------- ventana: nómina e impuestos ----------
let fsEl=null;
function closeFs(){if(fsEl)fsEl.classList.remove('on');}
function openFs(){const f=FS();const P=FSP();const G=GOVS[W_().gov]||{};const n=CH().name;if(!fsEl){fsEl=document.createElement('div');fsEl.id='fsheet';document.body.appendChild(fsEl);}
  const row=(a,b,cls)=>`<div class="gvr"><span>${a}</span><b${cls?` style="color:${cls}"`:''}>${b}</b></div>`;const F=v=>fmt(Math.round(v));const pc=v=>(v*100).toFixed(1).replace('.',',')+' %';
  const U=TX_fiscal.ui;let h=`<div class="omt">${huecos(U.titulo,{})}</div><div class="sub" style="padding:0 8px 6px">${huecos(U.sub,{ge:G.e||'',gn:G.n||''})}</div>`;
  const sl=f.last;
  if(sl){h+=`<div class="gvbox"><div class="fst">${huecos(U.ultimo,{d:sl.day})}</div>`;
    h+=row(U.valor,F(sl.valor),'#2e8b57');h+=row(U.coste,F(sl.coste));if(sl.emp>0)h+=row(U.cot_emp,F(sl.emp));
    h+=row(U.bruto,F(sl.bruto));h+=row(P.caja?U.ss_caja:huecos(U.ss,{p:pc(sl.ssr)}),'−'+F(sl.ss),'#c0392b');h+=row(P.caja?U.aport:huecos(U.irpf_ret,{p:pc(sl.ret)}),'−'+F(sl.irpf),'#c0392b');
    h+=row(U.llega,F(sl.neto),'#3b3247');h+=`<div class="sub" style="font-size:11px;padding:4px 0">${huecos(U.de_cada,{a:Math.round(sl.neto/sl.valor*100),resto:P.caja?U.resto_caja:huecos(U.resto_estado,{a:Math.round((sl.ss+sl.irpf+sl.emp)/sl.valor*100),b:Math.round((sl.valor-sl.coste)/sl.valor*100)})})}</div></div>`;}
  else h+=`<div class="sub" style="padding:6px 8px">${U.sin_nomina}</div>`;
  const y=f.yr;const tot=y.ss+y.irpf+y.iva+y.ibi;
  h+=`<div class="gvbox"><div class="fst">${huecos(U.anio,{y:y.y,s:y.shifts})}</div>${row(U.r_bruto,F(y.bruto))}${row(U.r_ss,F(y.ss))}${row(U.r_irpf,F(y.irpf))}${row(U.r_iva,F(y.iva))}${y.ibi?row(U.r_ibi,F(y.ibi)):''}${row(U.r_total,F(tot),'#c0392b')}${y.bruto>0?row(U.r_efectivo,pc(tot/(y.bruto+y.iva))):''}</div>`;
  // el dueño de la empresa
  if(!P.caja&&S.office&&!TR().coop){const prof=3.2e6;const soc=prof*P.soc;const rest=prof-soc;const dist=rest*.1;const hold=rest*.9*P.hold;const ah=fsScale(dist,P.ah);const tAll=(soc+fsScale(rest,P.ah))/prof,tReal=(soc+hold+ah)/prof;
    const wk=sl?(sl.ss+sl.irpf+sl.emp)/sl.coste+(y.bruto>0?y.iva/(y.bruto+y.iva):.06):0;
    h+=`<div class="gvbox"><div class="fst">${huecos(U.dueno,{e:S.office.n})}</div><div class="sub" style="font-size:11.5px">${U.dueno_txt}</div>${row(U.dueno_todo,pc(tAll))}${row(U.dueno_real,pc(tReal),'#c0392b')}${sl?row(huecos(U.dueno_ella,{}),pc(wk),'#3b3247'):''}<div class="sub" style="font-size:11px">${huecos(U.dueno_pie,{})}</div></div>`;}
  // la declaración
  const dc=f.decl;h+=`<div class="gvbox"><div class="fst">${U.decl}</div>${dc?row(huecos(U.decl_anio,{y:dc.y}),dc.res<0?huecos(U.decl_devolvieron,{v:F(-dc.res)}):dc.res>0?huecos(U.decl_pago,{v:F(dc.res)}):U.decl_ni):`<div class="sub" style="font-size:11.5px">${U.decl_txt}</div>`}</div>`;
  // el sistema actual
  if(!P.caja){h+=`<div class="gvbox"><div class="fst">${U.sistema}</div>${row(U.tramos,huecos(U.tramos_dato,{t:P.tr.length,a:Math.round(P.tr[0][1]*100),b:Math.round(P.tr[P.tr.length-1][1]*100)}))}${row(U.exento,P.smiTo?huecos(U.exento_dato,{k:Math.round(P.smiTo/1000)}):U.sin_exencion)}${row(U.iva,[P.iva.sup,P.iva.red,P.iva.gen].map(v=>Math.round(v*100)+' %').join(' · '))}${row(U.capital,Math.round(P.ah[0][1]*100)+'–'+Math.round(P.ah[P.ah.length-1][1]*100)+' %')}${row(U.ibi,P.ibi===1?U.ibi_normal:P.ibi<1?U.ibi_rebajado:U.ibi_subido)}`;}
  else h+=`<div class="gvbox"><div class="fst">${U.sistema}</div>${row(U.caja_irpf,U.caja_irpf_dato)}${row(U.caja_sin,U.caja_sin_dato)}${row(U.iva,[P.iva.sup,P.iva.red,P.iva.gen].map(v=>Math.round(v*100)+' %').join(' · '))}`;
  h+=`<div class="sub" style="font-size:11.5px;padding-top:6px"><b>${U.gana}</b> ${P.gana}<br><b>${U.paga}</b> ${P.pierde}</div></div><div style="padding:6px"><button class="btn" id="fsclose">${U.cerrar}</button></div>`;
  fsEl.innerHTML=h;fsEl.classList.add('on');}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('#fsopen,#fsclose');if(!t)return;if(t.id==='fsopen')openFs();else closeFs();},true);
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{h=h.replace('<h3>🌍 El mundo</h3>',`<h3>🌍 El mundo</h3><button class="btn grey" id="fsopen">${TX_fiscal.ui.abrir}</button>`);}catch(e){}return h;};}

// =================== TRABAJO EN NEGRO ===================
const fsDlgEl=()=>{let e=document.getElementById('fsdlg');if(!e){e=document.createElement('div');e.id='fsdlg';document.body.appendChild(e);}return e;};
function fsAsk(title,txt,opts){const e=fsDlgEl();e.innerHTML=`<div class="omt">${title}</div><div class="sub" style="padding:4px 8px 8px;font-size:13px">${txt}</div><div style="display:flex;flex-direction:column;gap:6px;padding:4px 6px">${opts.map((o,i)=>`<button class="btn${i?' grey':''}" data-fsd="${i}">${o[0]}</button>`).join('')}</div>`;e.classList.add('on');e.querySelectorAll('[data-fsd]').forEach(b=>b.onclick=()=>{e.classList.remove('on');opts[+b.dataset.fsd][1]();if(typeof openMenu==='function'&&menu.classList.contains('open'))openMenu();});}
function fsNegroOK(){const w=W_();return !S.jobless&&!TR().self&&!TR().auto&&!TR().coop&&S.track!=='funcion'&&w.era!=='consejos'&&w.era!=='comunas';}
function fsNegroStop(why){const f=FS();if(!f.negro)return;f.negro=false;tell(why,'📄');}
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{fsNegroWeek();fsAutWeek();}catch(e){console.error(e);}return r;};}
function fsNegroWeek(){const f=FS();const w=W_();const n=CH().name;const jefe=S.office?S.office.n:TX_fiscal.la_empresa;
  if(f.negro&&!fsNegroOK()){fsNegroStop(TX_fiscal.negro_fin);return;}
  // la oferta
  if(!f.negro&&fsNegroOK()&&S.day-(f.negroAsk||-99)>40){const sec=['hosteleria','obra','cuidados','super'].includes(S.track)?.09:.03;if(Math.random()<sec*(1+TOX())*(w.crisis>55?1.5:1)){f.negroAsk=S.day;
    fsAsk(TX_fiscal.negro_oferta_titulo,huecos(TX_fiscal.negro_oferta,{jefe}),
      [[TX_fiscal.negro_acepta,()=>{f.negro=true;f.negroSince=S.day;tell(huecos(TX_fiscal.negro_desde,{}),'💶');}],
       [TX_fiscal.negro_rechaza,()=>{if(Math.random()<.25+TOX()*.3){S.rep=Math.max(0,(S.rep??60)-5);tell(huecos(TX_fiscal.negro_no_apunta,{}),'😒');}else tell(huecos(TX_fiscal.negro_no_nada,{}),'📄');}]]);}}
  if(!f.negro)return;
  // inspección de trabajo
  const pIns={progresista:.06,mercado:.05,austeridad:.02,conservador:.015,liberal:.01}[w.gov]||.03;
  if(Math.random()<pIns){if(Math.random()<.55){f.negro=false;tell(huecos(TX_fiscal.insp_multa,{jefe}),'🕵️');}
    else{f.negro=false;S.jobless=true;S.paroWeeks=0;tell(huecos(TX_fiscal.insp_despide,{}),'🕵️');}}}
// si echan a alguien que estaba en negro: sin paro
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const f=FS();if(f.negro&&S.jobless){f.negro=false;if(S.paroWeeks>0){S.paroWeeks=0;tell(huecos(TX_fiscal.negro_sin_paro,{sem:f.negroSince?huecos(TX_fiscal.negro_sin_paro_sem,{w:Math.round((S.day-f.negroSince)/7)}):''}),'📄');}}
  if(f.negro&&S.sick>0&&!f.negroSick){f.negroSick=1;tell(TX_fiscal.negro_sin_baja,'🩹');}if(!S.sick)f.negroSick=0;}catch(e){}return r;};}
function fsPedirAlta(){const f=FS();const o=office();const n=CH().name;const p=.35+(o.org||0)/200+(S.union&&S.union.member?.15:0);
  if(Math.random()<p){f.negro=false;tell(huecos(TX_fiscal.alta_ok,{del:S.union&&S.union.member?TX_fiscal.alta_ok_delegado:''}),'📄');}
  else if(Math.random()<.4){f.negro=false;S.jobless=true;S.paroWeeks=0;tell(huecos(TX_fiscal.alta_despide,{nec:ga(...TX_fiscal.alta_necesitaban)}),'📦');}
  else tell(huecos(TX_fiscal.alta_ya_veremos,{}),'📄');
  if(typeof openMenu==='function')openMenu();}
// =================== AUTÓNOMOS: cuota por tramos de rendimiento ===================
const FS_CUOTA=TX_fiscal.cuota_autonomos;
function fsCuotaEur(rendMes){for(const [lim,c] of FS_CUOTA)if(rendMes<=lim)return c;return 590;}
function fsAut(){const f=FS();f.au=f.au||{alta:false,since:null,hist:[],lastInc:0,warned:0};return f.au;}
function fsAutRendMes(){const a=fsAut();const E=FS_EUR();let v=0;if(TR().auto&&!S.jobless&&!TR().self)v+=salary()*(TR().days||[]).length*4.3;else if(TR().self&&S.biz)v+=Math.max(0,(S.biz.last||0))*4.3;
  const fl=a.hist.filter(x=>x[0]>S.day-90).reduce((s,x)=>s+x[1],0)/3;return (v+fl)*E;}
function fsCuota(){const a=fsAut();const w=W_();if(w.era==='consejos'||w.era==='comunas')return 0;const E=FS_EUR();let c=fsCuotaEur(fsAutRendMes());if(a.since!=null&&S.day-a.since<365)c=80;if(w.gov==='mercado')c*=.7;return Math.round(c/E);}
function fsAutWeek(){const a=fsAut();const n=CH().name;
  // lo que entra por escribir o pintar
  try{const C=LB();const inc=C.inc||0;if(inc>a.lastInc){a.hist.push([S.day,inc-a.lastInc]);a.lastInc=inc;}a.hist=a.hist.filter(x=>x[0]>S.day-365);}catch(e){}
  // el reparto y el negocio son autónomos desde el principio
  if((TR().auto||TR().self)&&!S.jobless&&!a.alta){a.alta=true;a.since=S.day;tell(huecos(TX_fiscal.aut_alta,{aut:ga(...TX_fiscal.autonoma)}),'📑');}
  // si gana con regularidad escribiendo o pintando: toca alta
  const fl=a.hist.reduce((s,x)=>s+x[1],0)*FS_EUR();
  if(!a.alta&&fl>=FS_SMI*.5&&S.day-a.warned>60){a.warned=S.day;
    fsAsk(TX_fiscal.aut_hobby_titulo,huecos(TX_fiscal.aut_hobby,{aut:ga(...TX_fiscal.autonoma)}),
      [[TX_fiscal.aut_darse_alta,()=>{a.alta=true;a.since=S.day;tell(huecos(TX_fiscal.aut_ya_es,{aut:ga(...TX_fiscal.autonoma),bien:ga(...TX_fiscal.aut_bienvenida)}),'📑');}],
       [TX_fiscal.aut_sin_alta,()=>{a.sin=S.day;tell(huecos(TX_fiscal.aut_sigue,{}),'🤞');}]]);}
  if(!a.alta&&a.sin&&Math.random()<.015){const atr=Math.round(fsCuotaEur(fl/12)*Math.min(12,Math.round((S.day-a.sin)/30))/FS_EUR());const multa=Math.round(atr*.5);bkAdd('Hacienda',-(atr+multa));a.alta=true;a.since=S.day-400;a.sin=null;tell(huecos(TX_fiscal.aut_insp,{a:fmt(atr),m:fmt(multa)}),'🕵️');}
  // la baja como autónoma si deja de haber actividad
  if(a.alta&&!TR().auto&&!TR().self&&fl<FS_SMI*.2){a.alta=false;tell(huecos(TX_fiscal.aut_baja,{aut:ga(...TX_fiscal.autonoma)}),'📑');}
  // la cuota, el día 1 de cada mes (se cobra en el lunes que cae en la primera semana)
  const d=dateOf(S.day);if(a.alta&&d.dm<=7&&a.paid!==d.m){a.paid=d.m;const c=fsCuota();if(c>0){bkAdd('Cuota autónomos',-c);const y=FS().yr;y.cuota=(y.cuota||0)+c;y.ss+=c;}}
  // la vieja cuota simbólica del núcleo se devuelve: ahora va por tramos
  if(TR().auto&&!S.jobless)S.money+=Math.round(4*PM());}
if(typeof BK_CAT!=='undefined')BK_CAT['Cuota autónomos']='deudas';
// en la ventana: negro y autónomos
{const _of=openFs;openFs=function(){_of.apply(this,arguments);try{const f=FS();const a=fsAut();const n=CH().name;let x='';
  if(f.negro)x+=`<div class="gvbox" style="border-color:#c0392b"><div class="fst">${TX_fiscal.ui_negro_titulo}</div><div class="sub" style="font-size:11.5px">${huecos(TX_fiscal.ui_negro_txt,{d:f.negroSince,t:f.negroTot||0})}</div><button class="btn grey" id="fsalta">${TX_fiscal.ui_negro_alta}</button></div>`;
  else if(f.negroTot)x+=`<div class="sub" style="font-size:11px;padding:2px 8px">${huecos(TX_fiscal.ui_negro_tot,{t:f.negroTot})}</div>`;
  if(a.alta){const c=fsCuota();x+=`<div class="gvbox"><div class="fst">${TX_fiscal.ui_aut_titulo}</div>`.replace('Autónoma',ga(...TX_fiscal.ui_aut_titulo_g))+`<div class="gvr"><span>${TX_fiscal.ui_aut_rend}</span><b>${huecos(TX_fiscal.ui_aut_rend_dato,{v:Math.round(fsAutRendMes())})}</b></div><div class="gvr"><span>${TX_fiscal.ui_aut_cuota}</span><b style="color:#c0392b">${huecos(TX_fiscal.ui_aut_cuota_dato,{c:fmt(c),plana:a.since!=null&&S.day-a.since<365?TX_fiscal.ui_aut_plana:''})}</b></div><div class="sub" style="font-size:11px">${TX_fiscal.ui_aut_txt}</div></div>`;}
  if(x){const box=fsEl.querySelector('#fsclose');box.parentElement.insertAdjacentHTML('beforebegin',x);const b=fsEl.querySelector('#fsalta');if(b)b.onclick=()=>{fsPedirAlta();openFs();};}}catch(e){console.error(e);}};}
