// =================== TRATO: tratar con los vecinos del censo ===================
// Sobre mods/vecinos.js (conocer, ficha, charlar). Aquí se puede TRATAR: en la ficha salen 2–4 opciones según quién es y dónde está
// (su puesto de trabajo o el lugar), favores en los dos sentidos con memoria («te debe una», «le debes una»), cotilleo que descubre datos reales
// del censo, política (afinidad, y con carisma moverles un poco; organizar el bloque), romance con adultos libres y vecinos que te buscan.
// Todo el contenido (textos, tablas, efectos) está en data/trato.json; aquí solo la lógica. Estado: S.trato (se crea si falta).
// Menores de 18: nada romántico por ninguna vía (ficha, menú Gente, móvil, visitas, salidas, «quedarse a dormir»): lo cierra romPersona().
const TRD=()=>(DATA.trato)||{};
const TRF=()=>TRD().ficha||{};
const trT=(k,v)=>huecos(String(TRF()[k]!=null?TRF()[k]:''),v||{});
const TRK_ROM=['cita','rollo','pareja','convive','casada'];
const trObs=()=>typeof BM!=='undefined'&&!!BM.obs;
const TT=()=>{const t=(S.trato&&typeof S.trato==='object')?S.trato:(S.trato={});
  t.f=t.f||{};t.cd=t.cd||{};t.deudas=Array.isArray(t.deudas)?t.deudas:[];t.req=Array.isArray(t.req)?t.req:[];t.comp=Array.isArray(t.comp)?t.comp:[];
  t.sabe=t.sabe||{};t.ideo=t.ideo||{};t.pull=t.pull||{};t.bloque=t.bloque||{ids:[]};t.bloque.ids=t.bloque.ids||[];t.vmot=t.vmot||{};t.last=t.last||{};t.ask=t.ask||{};
  if(t.plan===undefined)t.plan=null;if(t.run===undefined)t.run=null;if(t.asam===undefined)t.asam=null;return t;};
const trFav=id=>{const t=TT();return t.f[id]||(t.f[id]={te:0,le:0,hist:[]});};
const trClamp=x=>Math.max(0,Math.min(100,x));
const trKey=v=>{const p=v&&v.trabajo&&v.trabajo.puesto;return Array.isArray(p)?p[0]:(p||'');};
const trPick=L=>{let t=0;for(const x of L)t+=x.w;let r=Math.random()*t;for(const x of L){r-=x.w;if(r<=0)return x;}return L[0];};
const trEdifOf=v=>{const C=DATA.personas||{},H=(C.hogares||{})[v.hogar];return H?{id:H.edificio,e:(C.edificios||{})[H.edificio],h:H}:null;};
const trIdeoOf=v=>TT().ideo[v.id]||v.ideo||'apolitica';
const trTienePareja=v=>(v.lazos||[]).filter(l=>l[1]==='pareja').map(l=>vecinoPorId(l[0])).filter(Boolean);
const trCria=v=>{for(const l of v.lazos||[])if(l[1]==='hija'||l[1]==='hijo'){const q=vecinoPorId(l[0]);if(q&&q.edad<12)return q;}return null;};
const trFrases=h=>String(h||'').split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«])/).map(s=>s.trim()).filter(Boolean);
const trDiasTxt=d=>d===S.day?trT('hoy'):d===S.day-1?trT('ayer'):trT('hace',{n:S.day-d});
function trAqui(){try{if(!viewPlace||trObs())return null;return awayKey()||null;}catch(e){return null;}}
// ---------- romance: orientación estable (del id), disponibilidad y menores ----------
function trOrient(v){const R=TRD().romance,r=pbH(v.id+'ori');let acc=0,t=R.orientacion[R.orientacion.length-1][0];for(const [k,w] of R.orientacion){acc+=w;if(r<acc){t=k;break;}}
  if(t==='nadie'||t==='ambos'||v.g==='x')return t==='nadie'?'nadie':'ambos';
  return t==='hetero'?(v.g==='f'?'hombres':'mujeres'):(v.g==='f'?'mujeres':'hombres');}
function trRomOk(v){const R=TRD().romance;return !!v&&typeof v.edad==='number'&&v.edad>=R.edad_min&&!trTienePareja(v).length&&Math.abs(v.edad-(CH().age||27))<=R.dif_edad;}
const trRomOkP=p=>{if(!p||p.vid==null)return true;const v=vecinoPorId(p.vid);return !!v&&!vcMenorP(p)&&(TRK_ROM.includes(p.stage)||trRomOk(v));};
function trEnsure(p){if(!p||p.vid==null)return p;const v=vecinoPorId(p.vid);if(!v)return p;
  if(vcMenorP(p)||vcMenor(v,18)){p.adult=false;delete p.orient;return p;}
  p.adult=true;if(TRK_ROM.includes(p.stage)||trRomOk(v))p.orient=trOrient(v);else delete p.orient;
  if(p.relStyle==null){p.relStyle=['estable','estable','libre','soltera'][Math.floor(pbH(v.id+'r')*4)];p.kids=['si','quiza','no'][Math.floor(pbH(v.id+'k')*3)];p.boda=['si','igual','no'][Math.floor(pbH(v.id+'b')*3)];p.spark=Math.round((pbH(v.id+'s')-.5)*20);}
  return p;}
{const _vc=vcConocer;vcConocer=function(){const r=_vc.apply(this,arguments);try{if(r)trEnsure(r);}catch(e){}return r;};}
{const _rt=roleTxt;roleTxt=function(p){if(p&&p.vid!=null){const v=vecinoPorId(p.vid);return ((v?vcOficio(v):'')||huecos(TXHZ.trato.vecin,{po:pO(p)})).toLowerCase()+', '+huecos(TXHZ.trato.edad_anos,{edad:p.age+''});}return _rt.apply(this,arguments);};}
{const _fl=flirt;flirt=function(p){if(p&&p.vid!=null){trEnsure(p);if(vcMenorP(p)){toast(TRD().romance.menor);return false;}
    if(!trRomOkP(p)){const v=vecinoPorId(p.vid),pa=v?trTienePareja(v):[];toast(pa.length?trT('tiene_pareja',{quien:pa[0].n}):huecos(TXHZ.trato.esta_interesad_esa_manera,{p:p.n,pO:pO(p)}));return false;}}
  return _fl.apply(this,arguments);};}
{const _ao=askOut;askOut=function(p){if(p&&p.vid!=null){trEnsure(p);if(vcMenorP(p)||!trRomOkP(p))return;}return _ao.apply(this,arguments);};}
{const _mi=moveIn;moveIn=function(p){if(p&&p.vid!=null){toast(huecos(TRD().romance.no_vive,{v:p.n}));return;}return _mi.apply(this,arguments);};}
{const _ih=inviteHome;inviteHome=function(p,stay){if(p&&p.vid!=null&&vcMenorP(p)){toast(TRD().romance.menor);return;}
  const r=_ih.apply(this,arguments);try{if(p&&p.vid!=null&&(S.res||[]).some(x=>x.pid===p.k))trVisitaLlega(p);}catch(e){console.error(e);}return r;};}
{const _pg=peGo;peGo=function(p,k){if(p&&vcMenorP(p)){toast(TRD().romance.menor);return;}return _pg.apply(this,arguments);};}
{const _do=doOut;doOut=function(k){try{const p=S.outWith&&(S.people||[]).find(q=>q.k===S.outWith);if(p&&vcMenorP(p)){S.outWith=null;S.dateOut=false;toast(TRD().romance.menor);return;}}catch(e){}return _do.apply(this,arguments);};}
// ¿caben opciones románticas con esta persona? Una sola respuesta para la lista de Gente, el menú de opciones, los gestos, las visitas y quedarse a dormir
// (las comprobaciones del núcleo llaman a romPersona): un vecino adulto libre (o que ya está contigo) como cualquier otra persona; un menor, nunca
{const _rp=romPersona;romPersona=function(p){if(p&&p.vid!=null){trEnsure(p);return p.adult!==false&&!vcMenorP(p)&&trRomOkP(p);}return _rp.apply(this,arguments);};}
{const _pc=puedeConvivir;puedeConvivir=function(p){return p&&p.vid!=null?false:_pc.apply(this,arguments);};}
// visitas: quien está en pareja o en citas con el personaje viene como pareja, no como vecino
{const _vs=vsCandidates;vsCandidates=function(){const L=_vs.apply(this,arguments);try{const pt=partner();
  for(const p of S.people||[]){if(p.vid==null||vcMenorP(p)||!TRK_ROM.includes(p.stage)||p.dead||(S.res||[]).some(r=>r.pid===p.k))continue;
    const i=L.findIndex(x=>x[0]===p);const e=(pt&&p.k===pt.k&&!liveIn())?[p,.4,'pareja']:(!pt&&['cita','rollo'].includes(p.stage))?[p,.25,'rollo']:null;
    if(i>=0)L.splice(i,1);if(e)L.push(e);}}catch(e){}return L;};}
// ---------- tarjeta de resultado ----------
function trCard(ic,title,line,ok,p,b,res){const x=res&&res.tags&&res.tags.length?`<span class="trfx">${res.tags.map(vcEsc).join(' · ')}</span>`:'';try{sfxCard(ic,vcEsc(title),vcEsc(line)+(res&&res.extra?`<span class="trex">${vcEsc(res.extra)}</span>`:'')+x,ok,p,b);}catch(e){console.error(e);}}
// ---------- efectos ----------
function trFx(fx,v,p,c){c=c||{};const F=TRF(),T=TT(),N=S.needs,res={tags:[],extra:''},tag=t=>res.tags.push(t);fx=fx||{};
  if(fx.rel)p.rel=trClamp((p.rel||0)+fx.rel);
  for(const k of ['social','diversion','hambre','energia'])if(fx[k]){N[k]=trClamp((N[k]||0)+fx[k]);tag(F.fx[k]+' '+(fx[k]>0?'+':'−')+Math.abs(Math.round(fx[k])));}
  if(fx.coste_h){const m=hrs(fx.coste_h);bkAdd(F.etiqueta_salida,-m);tag('−'+fmt(m));}
  if(fx.fiar_h){const m=hrs(fx.fiar_h);T.deudas.push({vid:v.id,amt:m,dl:S.day+7,dir:'le',why:c.why||''});tag(trT('le_debes_euros',{c:fmt(m)}));}
  if(fx.presta_h){const m=hrs(fx.presta_h);bkAdd(F.etiqueta_prestamo,m);T.deudas.push({vid:v.id,amt:m,dl:S.day+10,dir:'le',why:c.why||''});tag('+'+fmt(m)+' · '+trT('le_debes_euros',{c:fmt(m)}));}
  if(fx.presto_h){const m=hrs(fx.presto_h);bkAdd(F.etiqueta_presto,-m);T.deudas.push({vid:v.id,amt:m,dl:S.day+7,dir:'te',why:c.why||''});tag('−'+fmt(m)+' · '+trT('te_debe_euros',{c:fmt(m)}));}
  if(fx.pista){S.netBoost=Math.max(S.netBoost||0,S.day+14);tag(F.pista);}
  if(fx.despensa){S.pantry=(S.pantry||0)+fx.despensa;tag(trT('despensa',{n:fx.despensa}));}
  if(fx.agua){let n=0;for(const i of findObjs((d,t)=>t==='huerto')){const cr=S.obj[i]&&S.obj[i].crop;if(cr&&!cr.dead){cr.w=100;cr.wd=0;cr.dry=0;n++;}}if(n)tag(F.agua);}
  if(fx.hijos_hap){let n=0;for(const k of S.kids||[]){const a=kidAge(k);if(a>=3&&a<16){k.hap=Math.min(100,(k.hap||0)+fx.hijos_hap);n++;}}if(n)tag(F.hijos);}
  if(fx.mov){W_().mov=Math.min(100,(W_().mov||0)+fx.mov);tag(F.mov_nota);}
  if(fx.sol){try{solAdd(fx.sol,c.mem||'');tag(F.sol_nota);}catch(e){}}
  if(fx.te){trFav(v.id).te+=fx.te;tag(trFav(v.id).te>1?trT('te_debe_n',{n:trFav(v.id).te}):F.te_debe_una);}
  if(fx.chisme){const t=[];for(let i=0;i<fx.chisme;i++){const r=trChisme(v);if(r)t.push(r.txt);}res.extra=t.join(' ');}
  return res;}
// ---------- cotilleo: cuenta algo real del censo (historia o lazo) de quien no conoces del todo ----------
function trPool(v){const T=TT(),LZ=TRD().cotilleo.lazo_txt,out=[],seen=new Set();
  const add=(x,w)=>{if(!x||x.id===v.id||seen.has(x.id)||vcMenor(x,18))return;seen.add(x.id);const px=vcPer(x.id),rel=px?(px.rel||0):0,s=T.sabe[x.id]||{h:[],l:[]};
    if(!px||rel<VC_HIST)trFrases(x.historia).forEach((f,i)=>{if(!s.h.includes(i))out.push({x,k:'h',i,w});});
    if(!px||rel<VC_LAZOS)(x.lazos||[]).forEach((l,i)=>{const y=vecinoPorId(l[0]);if(y&&!vcMenor(y,18)&&LZ[l[1]]&&!s.l.includes(i))out.push({x,k:'l',i,w});});};
  for(const l of v.lazos||[])add(vecinoPorId(l[0]),3);
  const E=trEdifOf(v);if(E)for(const q of pbVec())if(q&&q.id!==v.id){const e2=trEdifOf(q);if(e2&&e2.id===E.id)add(q,2);}
  for(const q of pbVec())add(q,1);return out;}
function trChisme(v){const it=trPick((()=>{const L=trPool(v);return L.length?L:[null];})());if(!it)return null;
  const T=TT(),C=TRD().cotilleo,x=it.x,s=T.sabe[x.id]=T.sabe[x.id]||{h:[],l:[]};let txt;
  if(it.k==='h'){s.h.push(it.i);txt=huecos(pickR(C.historia),{v:v.n,x:x.n,frase:trFrases(x.historia)[it.i]});}
  else{s.l.push(it.i);const l=x.lazos[it.i],y=vecinoPorId(l[0]);txt=huecos(C.lazo_txt[l[1]][y.g==='m'?1:0],{x:x.n,y:y.n});}
  try{tell(huecos(C.diario,{x:x.n,v:v.n}),'🗣️');}catch(e){}return {x,txt,k:it.k};}
function trChismear(v,p){const T=TT(),ck=v.id+'|chisme';if(T.cd[ck]===S.day){toast(trT('ya_hoy'));return;}T.cd[ck]=S.day;const b=sxSnap(p),C=TRD().cotilleo;
  const r=trChisme(v);if(!r){const L=pickR(C.nada);p.rel=trClamp((p.rel||0)+1);trCard('🗣️',huecos(L[0],{v:v.n}),huecos(L[1],{v:v.n}),null,p,b);return;}
  p.rel=trClamp((p.rel||0)+2);S.needs.social=trClamp(S.needs.social+4);trCard('🗣️',huecos(pickR(C.titulo),{v:v.n}),r.txt,true,p,b,{tags:[trT('dicen')+': '+r.x.n]});}
function trDicen(v,p){const s=TT().sabe[v.id];if(!s||vcMenor(v,18))return '';const rel=p?(p.rel||0):0,LZ=TRD().cotilleo.lazo_txt;let h='';
  if(rel<VC_HIST&&s.h.length){const fr=trFrases(v.historia);h+=`<div class="vfh2">${vcEsc(s.h.slice().sort((a,b)=>a-b).map(i=>fr[i]).filter(Boolean).join(' '))}</div>`;}
  if(rel<VC_LAZOS&&s.l.length){h+=s.l.map(i=>{const l=(v.lazos||[])[i],y=l&&vecinoPorId(l[0]);return y&&LZ[l[1]]?`<div class="vfh2 trlz">· ${vcEsc(huecos(LZ[l[1]][y.g==='m'?1:0],{x:v.n,y:y.n}))}</div>`:'';}).join('');}
  return h?`<div class="vfsec">${vcEsc(trT('dicen'))}</div>${h}`:'';}
// ---------- acciones por oficio o por lugar ----------
const TR_REQ={
  huerto:()=>findObjs((d,t)=>t==='huerto').some(i=>{const c=S.obj[i]&&S.obj[i].crop;return c&&!c.dead;}),
  hijos_cole:()=>(S.kids||[]).some(k=>{const a=kidAge(k);return a>=3&&a<12;}),
  con_trabajo:()=>!S.jobless&&!!S.track,
  en_paro:()=>!!S.jobless,
  trabajo_dentro:v=>!!(v&&v.trabajo&&v.trabajo.lugar&&v.trabajo.lugar!=='fuera'),
  ella_hijos:v=>!!trCria(v),
  bloque:v=>{const E=trEdifOf(v);return !!(E&&E.e&&E.e.tipo==='bloque');},
  politica:()=>!!S.ideo&&S.ideo!=='apolitica',
  justa:()=>S.money<hrs(40),
  solvente:()=>S.money>=hrs(12)};
const trReqOk=(L,v,p)=>(L||[]).every(r=>TR_REQ[r]?!!TR_REQ[r](v,p):false);
function trAcciones(v,p){const k=trAqui();if(!k)return {acc:[],nota:''};const h=S.t/60,wd=dateOf(S.day).wd;
  if(!vecinosEn(k,h,wd).some(q=>q.v.id===v.id))return {acc:[],nota:''};const T=TT(),D=TRD();let L=[],origen='lugar',nota='';
  if(pbTrabaja(v,k,h,wd)&&D.oficios[trKey(v)]){const o=D.oficios[trKey(v)];L=o.acciones||[];origen='oficio';nota=o.nota||'';}
  else L=((D.lugares[k]||{}).acciones)||[];
  const acc=L.filter(a=>(p.rel||0)>=(a.rel||0)&&trReqOk(a.req,v,p)&&T.cd[v.id+'|'+origen+':'+a.id]!==S.day).map(a=>Object.assign({},a,{origen}));
  return {acc,nota:acc.length?'':nota};}
function trAccion(v,p,a){const T=TT(),ck=v.id+'|'+a.origen+':'+a.id;if(T.cd[ck]===S.day){toast(trT('ya_hoy'));return;}
  if(a.fx&&a.fx.coste_h&&S.money<hrs(a.fx.coste_h)){toast(trT('sin_dinero'));return;}
  T.cd[ck]=S.day;const b=sxSnap(p);
  const pr=a.p==null?1:Math.min(.95,a.p+(lvl('carisma')||0)*.03+((p.rel||0)-(a.rel||0))/300),ok=Math.random()<pr;
  const L=pickR(ok?a.ok:(a.ko||a.ok)),res=trFx(ok?a.fx:(a.fxko||{rel:-1}),v,p,{why:a.n,mem:a.n});const vars={v:v.n};
  p.last=S.day;try{tell(huecos(L[0],vars)+'. '+huecos(L[1],vars),a.e);}catch(e){}
  trCard(a.e,huecos(L[0],vars),huecos(L[1],vars),ok?true:null,p,b,res);}
// ---------- favores en los dos sentidos, con memoria ----------
const trFavVars=(v,id)=>{const f=TRD().favores[id],o={v:v.n,c:fmt(hrs(2.5))};if(id==='cuidar'){const k=trCria(v);o.k=k?k.n:TXHZ.trato.cria;}
  if(id==='firmar'){const E=trEdifOf(v);let x=null;if(E){const L=pbVec().filter(q=>q&&q.id!==v.id&&!vcMenor(q,18)&&(trEdifOf(q)||{}).id===E.id);if(L.length)x=L[Math.floor(pbH(v.id+'f')*L.length)];}o.x=x?x.n:TXHZ.trato.vecina_del_bloque;}return o;};
const trFavElegible=(id,v,p)=>{const f=TRD().favores[id];return !!f&&(p.rel||0)>=f.rel&&trReqOk(f.req,v,p);};
function trMemo(v,id){const f=trFav(v.id);f.hist.push([S.day,TRD().favores[id]?TRD().favores[id].mem:id]);if(f.hist.length>6)f.hist.shift();}
// pedir: probabilidad según relación, carisma y si te debe una (te la cobras)
function trPedir(v,p,id){const T=TT(),f=TRD().favores[id],ck=v.id+'|pedir';if(!f||!trFavElegible(id,v,p))return;if(T.cd[ck]===S.day){toast(trT('ya_hoy'));return;}T.cd[ck]=S.day;
  const fav=trFav(v.id),b=sxSnap(p),debe=fav.te>0,vars=trFavVars(v,id);
  const pr=Math.max(.15,Math.min(.95,.42+((p.rel||0)-f.rel)/120+(lvl('carisma')||0)*.04+(debe?.4:0)-(fav.le>1?.15:0)));const ok=Math.random()<pr;
  try{tell(huecos(trT('diario_favor_pide'),{n:CH().name,v:v.n,que:huecos(f.n,vars).toLowerCase()}),f.e);}catch(e){}
  if(!ok){p.rel=trClamp((p.rel||0)-1.5);const L=pickR(f.ko);trCard(f.e,huecos(L[0],vars),huecos(L[1],vars),false,p,b);return;}
  const res=trFx(f.fx,v,p,{why:huecos(f.n,vars),mem:huecos(f.n,vars)});let extra='';
  if(debe){fav.te--;extra=' '+trT('a_mano');}else{fav.le++;res.tags.push(fav.le>1?trT('le_debes_n',{n:fav.le}):TRF().le_debes_una);}
  trMemo(v,id);const L=pickR(f.ok);trCard(f.e,huecos(L[0],vars),huecos(L[1],vars)+extra,true,p,b,res);}
// que te pidan: llega por el móvil o al encontrarte; se responde en cualquiera de los dos sitios
function trPide(v,p,id,via){const T=TT(),f=TRD().favores[id];if(!f)return null;const vars=trFavVars(v,id),r={id,vid:v.id,day:S.day,dl:S.day+2,via,vars};T.req.push(r);T.ask[v.id]=S.day;T.last[p.k]=S.day;
  if(via==='msg'){const si=f.si,no=f.no;phIncoming(p,huecos(pickR(f.msg),vars),[[si[0],0,'tr:ok',huecos(si[1],vars),undefined],[no[0],-1,'tr:no',huecos(no[1],vars),undefined]]);}
  return r;}
function trAceptar(v,p,req){const T=TT(),f=TRD().favores[req.id];if(!f)return;
  if(req.id==='prestar'&&S.money<hrs(2.5)){toast(trT('sin_dinero'));return;}
  T.req=T.req.filter(r=>r!==req);try{tell(trT('diario_favor_si',{v:v.n}),f.e);}catch(e){}
  if(f.modo==='ya'){trCumple(v,p,f,req);return;}
  T.comp.push({id:req.id,vid:v.id,dl:S.day+1,vars:req.vars});trIrComp(v,p);}
function trRechazar(v,p,req){const T=TT(),f=TRD().favores[req.id];if(!f)return;T.req=T.req.filter(r=>r!==req);const b=sxSnap(p),res=trFx(f.fxno,v,p,{});
  try{tell(trT('diario_rechaza',{n:CH().name,v:v.n}),'🤷');}catch(e){}const L=pickR(f.rechazo);trCard('🤷',huecos(L[0],req.vars),huecos(L[1],req.vars),null,p,b,res);}
function trCumple(v,p,f,req){const b=sxSnap(p),vars=Object.assign({},req.vars||{},{v:v.n}),id=req.id,res=trFx(f.fx,v,p,{why:f.mem,mem:f.mem});
  trMemo(v,id);trFav(v.id).cum=(trFav(v.id).cum||0)+1;p.last=S.day;
  try{tell(trT('diario_cumple',{n:CH().name,v:v.n,que:f.mem}),f.e);}catch(e){}const L=pickR(f.ok);trCard(f.e,huecos(L[0],vars),huecos(L[1],vars),true,p,b,res);}
// los favores de ir a su casa (cuidar, mudanza) se cumplen yendo de verdad: sale la visita y, al volver, el resultado
function trIrComp(v,p){const T=TT(),c=T.comp.find(x=>x.vid===v.id);if(!c||trObs())return;
  if(S.sim.work>0){toast(trT('no_se_puede',{why:TXHZ.trato.ahora_estas_fuera}));return;}
  const why=outAvail('visita');if(why){toast(trT('no_se_puede',{why}));return;}
  T.run={vid:v.id,id:c.id};if(typeof menu!=='undefined')menu.classList.remove('open');S.outWith=p.k;S.dateOut=false;doOut('visita');}
{const _ob=outBack;outBack=function(k){const pk=S.outWith,T=S.trato;let asam=null,comp=null;
  try{if(k==='militancia'&&T&&T.asam&&pk){asam=T.asam;}
    if(k==='visita'&&pk&&T&&T.comp&&T.comp.length){const pp=(S.people||[]).find(q=>q.k===pk);comp=pp&&pp.vid!=null?T.comp.find(c=>c.vid===pp.vid):null;}}catch(e){}
  const r=_ob.apply(this,arguments);
  try{if(asam)trAsambleaFin(pk,asam);
    if(comp){TT().comp=TT().comp.filter(c=>c!==comp);TT().run=null;const v=vecinoPorId(comp.vid),p=vcPer(comp.vid),f=TRD().favores[comp.id];if(v&&p&&f)trCumple(v,p,f,comp);}
    else if(S.trato)S.trato.run=null;}catch(e){console.error(e);}
  return r;};}
// ---------- política: afinidad, discutir, y organizar el bloque ----------
function trDist(a,b){if(!a||!b||a==='apolitica'||b==='apolitica')return -1;if(a===b)return 0;const C=TRD().politica.cercanas;
  if((C[a]||[]).includes(b)||(C[b]||[]).includes(a))return 1;if((LEFT.includes(a)&&RIGHT.includes(b))||(RIGHT.includes(a)&&LEFT.includes(b)))return 3;return 2;}
function trPolitica(v,p){const T=TT(),ck=v.id+'|pol';if(T.cd[ck]===S.day){toast(trT('ya_hoy'));return;}T.cd[ck]=S.day;
  const P=TRD().politica,b=sxSnap(p),a=S.ideo,o=trIdeoOf(v),d=trDist(a,o),car=lvl('carisma')||0,vars={v:v.n};let key,fx,ok=true;
  if(d<0){key=(a==='apolitica'&&o==='apolitica')?'sin_ideas':'apolitica';fx={rel:1,social:3};}
  else if(d===0){key='igual';fx={rel:5,diversion:4,social:4};}
  else if(d===1){key='cerca';fx={rel:3,social:4};}
  else if(d===2){key='media';fx={rel:1.5,social:3};}
  else{const pr=Math.min(.8,.3+car*.07+(p.rel||0)/300);
    if(Math.random()<pr){key='lejos_bien';fx={rel:2,social:3};if(car>=3){T.pull[v.id]=(T.pull[v.id]||0)+1;if(T.pull[v.id]>=3){T.pull[v.id]=0;trMueve(v,p);key='mueve';fx={rel:3,social:3};}}}
    else{key='lejos_mal';fx={rel:-4,diversion:-4};ok=false;}}
  const res=trFx(fx,v,p,{}),L=pickR(P[key]);p.last=S.day;try{tell(trT('diario_pol',{n:CH().name,v:v.n}),'📢');}catch(e){}
  trCard('📢',huecos(L[0],vars),huecos(L[1],vars),key==='lejos_mal'?false:key==='sin_ideas'||key==='apolitica'?null:true,p,b,res);}
// con carisma, tres buenas charlas lo acercan un paso: a una ideología vecina que le quede más cerca de la tuya
function trMueve(v,p){const C=TRD().politica.cercanas,o=trIdeoOf(v),a=S.ideo,cand=[...(C[o]||[]),'apolitica'].filter(x=>x!==o);
  const dd=x=>x===a?0:x==='apolitica'?2:trDist(a,x);cand.sort((x,y)=>dd(x)-dd(y));const n=cand[0]||o;TT().ideo[v.id]=n;p.ideo=n;return n;}
const trBloqueOk=(v,p)=>{const B=TT().bloque,E=trEdifOf(v);return !S.owned&&!!E&&!!E.e&&E.e.tipo==='bloque'&&(p.rel||0)>=40&&!B.ids.includes(v.id)&&(!RIGHT.includes(trIdeoOf(v))||(p.rel||0)>=70);};
function trBloque(v,p){const T=TT(),B=T.bloque,P=TRD().politica,ck=v.id+'|bloque';if(T.cd[ck]===S.day){toast(trT('ya_hoy'));return;}T.cd[ck]=S.day;const b=sxSnap(p),o=trIdeoOf(v);
  const pr=Math.max(.2,Math.min(.9,.4+(p.rel||0)/200+(lvl('carisma')||0)*.04+(LEFT.includes(o)?.25:o==='apolitica'?0:-.1)));
  try{tell(trT('diario_bloque',{n:CH().name,v:v.n}),'🏘️');}catch(e){}
  if(Math.random()>=pr){const L=pickR(P.bloque_ko),res=trFx({rel:-1},v,p,{});trCard('🏘️',huecos(L[0],{v:v.n}),huecos(L[1],{v:v.n}),false,p,b,res);return;}
  B.ids.push(v.id);const res=trFx({rel:4,mov:.4,sol:.3},v,p,{mem:TXHZ.trato.apunto_al_sindicato_del_bloque}),L=pickR(P.bloque_ok);res.tags.unshift('🏘️ '+B.ids.length+'/3');
  trBloqueEfecto();trCard('🏘️',huecos(L[0],{v:v.n}),huecos(L[1],{v:v.n}),true,p,b,res);}
// con tres del bloque dentro hay sindicato de inquilinas (lo que ya mira el mundo: S.pol.tenant) y puede haber huelga de alquileres
function trBloqueEfecto(){const B=TT().bloque;if(B.ids.length<3||S.owned)return;S.pol=S.pol||{xp:0,inf:0,stages:{},comp:2,red:0};
  if(!S.pol.tenant){S.pol.tenant=true;W_().mov=Math.min(100,(W_().mov||0)+2);const c=TRD().politica.bloque_cap;try{chapter('bloque_org',c[0],c[1]);}catch(e){}}}
function trAsamblea(v,p){if(trObs())return;if(!S.ideo||S.ideo==='apolitica'){toast(huecos(TRD().politica.sin_ideas_asamblea,{}));return;}
  const why=outAvail('militancia');if(why){toast(trT('no_se_puede',{why}));return;}
  TT().asam={vid:v.id};if(typeof menu!=='undefined')menu.classList.remove('open');S.outWith=p.k;S.dateOut=false;doOut('militancia');}
function trAsambleaFin(pk,as){const T=TT(),p=(S.people||[]).find(q=>q.k===pk),v=p&&vecinoPorId(p.vid);T.asam=null;S.outWith=null;S.dateOut=false;if(!p||!v)return;
  const b=sxSnap(p),en=T.bloque.ids.includes(v.id),res=trFx({rel:6,mov:en?1.5:1,sol:.6,social:6},v,p,{mem:huecos(TXHZ.trato.fue_asamblea_con,{v:v.n})}),L=pickR(TRD().politica.asamblea);p.last=S.day;
  try{tell(trT('diario_asamblea',{n:CH().name,v:v.n}),'📢');}catch(e){}trCard('📢',huecos(L[0],{v:v.n}),huecos(L[1],{v:v.n}),true,p,b,res);}
// ---------- deudas ----------
function trPagar(v,p,i){const T=TT(),d=T.deudas[i];if(!d||d.dir!=='le'||d.vid!==v.id)return;if(S.money<d.amt){toast(trT('sin_dinero'));return;}
  const b=sxSnap(p);bkAdd(TRF().etiqueta_devolver,-d.amt);T.deudas.splice(i,1);p.rel=trClamp((p.rel||0)+3);const f=trFav(v.id);f.hist.push([S.day,TRF().mem_pagaste]);
  try{tell(trT('diario_devuelve',{n:CH().name,v:v.n,c:fmt(d.amt)}),'💶');}catch(e){}const L=TRF().pagado;trCard('💶',huecos(L[0],{v:v.n}),huecos(L[1],{v:v.n,c:fmt(d.amt)}),true,p,b,{tags:['−'+fmt(d.amt)]});}
function trDeudasDia(){const T=TT(),F=TRF();for(const d of T.deudas.slice()){const v=vecinoPorId(d.vid),p=vcPer(d.vid);if(!v||!p){T.deudas=T.deudas.filter(x=>x!==d);continue;}
  if(d.dir==='le'){if(S.day>=d.dl&&!d.msg){d.msg=1;phIncoming(p,huecos(F.msg_pagar,{v:v.n,c:fmt(d.amt)}),[F.msg_pagar_si,F.msg_pagar_luego]);}
    else if(S.day>d.dl+6&&!d.late){d.late=1;p.rel=trClamp((p.rel||0)-6);trFav(v.id).hist.push([S.day,TXHZ.trato.devolviste_tiempo]);try{tell(huecos(TXHZ.trato.ha_dicho_nada_debes_nota,{v:v.n}),'💶');}catch(e){}}}
  else if(S.day>=d.dl){if(Math.random()<.88||d.again){bkAdd(F.etiqueta_vuelve,d.amt);T.deudas=T.deudas.filter(x=>x!==d);p.rel=trClamp((p.rel||0)+3);trFav(v.id).hist.push([S.day,F.mem_te_pago]);
      try{tell(trT('diario_te_devuelve',{n:CH().name,v:v.n,c:fmt(d.amt)}),'💶');phIncoming(p,huecos(F.msg_te_devuelve,{v:v.n,c:fmt(d.amt)}),'gen');}catch(e){}}
    else{d.again=1;d.dl=S.day+3;phIncoming(p,huecos(F.msg_olvida,{v:v.n}),'gen');}}}}
// ---------- la ficha: memoria, petición pendiente y 2–4 opciones ----------
const TRUI={vid:null,mode:null};
function trMemoria(v,p){const T=TT(),F=TRF(),f=T.f[v.id]||{te:0,le:0,hist:[]};const L=[];
  if(f.te>0)L.push(`<b class="trup">${vcEsc(f.te===1?F.te_debe_una:trT('te_debe_n',{n:f.te}))}</b>`);
  if(f.le>0)L.push(`<b class="trdn">${vcEsc(f.le===1?F.le_debes_una:trT('le_debes_n',{n:f.le}))}</b>`);
  let h='';T.deudas.forEach((d,i)=>{if(d.vid!==v.id)return;const c=fmt(d.amt);
    if(d.dir==='le')h+=`<div class="trdeu"><span class="trdn">${vcEsc(trT('le_debes_euros',{c}))}</span><button class="mini" data-tr="pagar:${i}">${vcEsc(trT('devolver',{c}))}</button></div>`;
    else L.push(`<b class="trup">${vcEsc(trT('te_debe_euros',{c}))}</b>`);});
  if(f.te===0&&f.le===0&&(f.cum||0)>0&&!L.length)L.push(`<b>${vcEsc(F.a_mano)}</b>`);
  let x=L.length?`<div class="trmem">${L.join(' · ')}</div>`:'';x+=h;
  const u=f.hist&&f.hist[f.hist.length-1];if(u)x+=`<div class="vfpi trult">${vcEsc(trT('ultimo',{que:u[1]+' ('+trDiasTxt(u[0])+')'}))}</div>`;
  const rq=T.req.find(r=>r.vid===v.id),fv=rq&&TRD().favores[rq.id];
  if(fv)x+=`<div class="trq"><div><b>${vcEsc(F.te_pide)}</b> · ${vcEsc(huecos(fv.corto,rq.vars||{}))}</div><div class="trqb"><button class="btn" data-tr="req:ok">${vcEsc(F.cuenta)}</button><button class="btn grey" data-tr="req:no">${vcEsc(F.no_puedo)}</button></div></div>`;
  const cp=T.comp.find(c=>c.vid===v.id),fc=cp&&TRD().favores[cp.id];
  if(fc)x+=`<div class="trq"><div>${vcEsc(trT('prometido',{que:huecos(fc.corto,cp.vars||{}).toLowerCase()}))} <i>(${vcEsc(F.hasta)})</i></div><div class="trqb"><button class="btn" data-tr="comp:go">${vcEsc(F.ir_ya)}</button></div></div>`;
  return x;}
function trOpciones(v,p){const T=TT(),F=TRF(),D=TRD(),out=[];const {acc,nota}=trAcciones(v,p);
  for(const a of acc.slice(0,2))out.push({id:'a:'+a.origen+':'+a.id,t:huecos(TXHZ.trato.txt,{a_e:a.e,a:a.n})});
  const favs=Object.keys(D.favores).filter(id=>D.favores[id].dir==='pedir'&&trFavElegible(id,v,p));
  if(favs.length&&T.cd[v.id+'|pedir']!==S.day)out.push({id:'favor',t:F.pedir_favor});
  if(trRomOkP(p)&&p.adult!==false&&canLove(p)&&(p.rel||0)>=20&&!TRK_ROM.includes(p.stage)&&p.stage!=='ex')out.push({id:'lig',t:F.ligar});
  else if(p.adult!==false&&canLove(p)&&['cita','rollo','pareja'].includes(p.stage))out.push({id:'cita',t:F.cita});
  if((p.rel||0)>=25&&T.cd[v.id+'|chisme']!==S.day&&trPool(v).length)out.push({id:'chisme',t:F.chisme});
  if((p.rel||0)>=20&&T.cd[v.id+'|pol']!==S.day)out.push({id:'pol',t:F.politica});
  if(trBloqueOk(v,p)&&T.cd[v.id+'|bloque']!==S.day)out.push({id:'bloque',t:trT('bloque',{n:T.bloque.ids.length})});
  else if(S.ideo&&S.ideo!=='apolitica'&&(p.rel||0)>=55&&trDist(S.ideo,trIdeoOf(v))<=2&&(trDist(S.ideo,trIdeoOf(v))>=0||T.bloque.ids.includes(v.id)))out.push({id:'asam',t:F.asamblea});
  return {opts:out.slice(0,4),nota,favs};}
function trFichaExtra(v){if(vcMenor(v,18))return '';const p=vcPer(v.id);let h=trDicen(v,p);if(!p)return h;trEnsure(p);
  if(trObs())return h+`<div class="vfpi">${vcEsc(trT('solo_mirar'))}</div>`;
  h+=trMemoria(v,p);
  if(TT().bloque.ids.includes(v.id))h+=`<div class="vfpi">🏘️ ${vcEsc(TRF().bloque_en)}</div>`;
  if(TRUI.vid===v.id&&TRUI.mode==='favor'){const D=TRD();
    h+=`<div class="vfsec">${vcEsc(trT('pedir_titulo',{v:v.n}))}</div><div class="trb trb1">`;
    for(const id of Object.keys(D.favores)){const f=D.favores[id];if(f.dir!=='pedir'||!trFavElegible(id,v,p))continue;h+=`<button class="trbtn" data-tr="f:${id}">${f.e} ${vcEsc(huecos(f.n,trFavVars(v,id)))}</button>`;}
    return h+`<button class="trbtn trvolver" data-tr="volver">${vcEsc(TRF().volver)}</button></div>`;}
  const {opts,nota}=trOpciones(v,p);
  if(nota)h+=`<div class="vfpi trnota">${vcEsc(nota)}</div>`;
  if(opts.length)h+=`<div class="vfsec">${vcEsc(TRF().trato)}</div><div class="trb">${opts.map(o=>`<button class="trbtn" data-tr="${o.id}">${vcEsc(o.t)}</button>`).join('')}</div>`;
  return h;}
{const _vf=vcFicha;vcFicha=function(v){const h=_vf.apply(this,arguments);try{if(!v||vcMenor(v,12))return h;const x=trFichaExtra(v);if(!x)return h;const i=h.lastIndexOf('<div class="vfb">');return i<0?h+x:h.slice(0,i)+x+h.slice(i);}catch(e){console.error(e);return h;}};}
{const _vo=vcOpen;vcOpen=function(v){try{if(v&&TRUI.vid!==v.id){TRUI.vid=v.id;TRUI.mode=null;}if(v)trEncuentro(v);}catch(e){console.error(e);}
  const r=_vo.apply(this,arguments);try{if(v&&vcEl)vcEl.querySelectorAll('[data-tr]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();trClick(v,b.dataset.tr);});}catch(e){console.error(e);}return r;};}
const trFin=()=>{try{vcClose();if(typeof menu!=='undefined'&&menu.classList.contains('open')&&typeof openMenu==='function')openMenu('gente');}catch(e){}};
function trClick(v,code){if(trObs()){toast(trT('solo_mirar'));return;}const p=vcPer(v.id);if(!p)return;trEnsure(p);const [a,b,c]=code.split(':');
  if(a==='favor'){TRUI.mode='favor';vcOpen(v);return;}if(a==='volver'){TRUI.mode=null;vcOpen(v);return;}
  if(a==='a'){const o=trAcciones(v,p).acc.find(x=>x.origen===b&&x.id===c);if(!o){vcOpen(v);return;}trFin();trAccion(v,p,o);return;}
  if(a==='f'){TRUI.mode=null;trFin();trPedir(v,p,b);return;}
  if(a==='chisme'){trFin();trChismear(v,p);return;}
  if(a==='pol'){trFin();trPolitica(v,p);return;}
  if(a==='bloque'){trFin();trBloque(v,p);return;}
  if(a==='asam'){trFin();trAsamblea(v,p);return;}
  if(a==='lig'){trFin();flirt(p);return;}
  if(a==='cita'){trFin();const why=outAvail('amigos');if(why&&why!==TXN.politica.solo_libres){toast(trT('no_se_puede',{why}));return;}S.outWith=p.k;S.dateOut=true;doOut('amigos');return;}
  if(a==='pagar'){trFin();trPagar(v,p,+b);return;}
  if(a==='req'){const rq=TT().req.find(r=>r.vid===v.id);if(!rq){vcOpen(v);return;}trFin();(b==='ok'?trAceptar:trRechazar)(v,p,rq);return;}
  if(a==='comp'){trFin();trIrComp(v,p);return;}}
// a veces te piden algo en persona: al abrir la ficha de quien ya conoces (como mucho cada seis días y una petición a la vez)
function trEncuentro(v){if(trObs()||vcMenor(v,18))return;const p=vcPer(v.id);if(!p||(p.rel||0)<40)return;const T=TT();
  if(T.req.length>=2||T.req.some(r=>r.vid===v.id)||T.comp.some(c=>c.vid===v.id)||(T.ask[v.id]||-99)>S.day-6||TRK_ROM.includes(p.stage))return;
  const L=Object.keys(TRD().favores).filter(id=>TRD().favores[id].dir==='pide'&&trFavElegible(id,v,p));if(!L.length||Math.random()>.22)return;trPide(v,p,pickR(L),'enc');}
// ---------- el móvil: responder a lo que escribe un vecino ----------
{const _pa=phAnswer;phAnswer=function(pk,i,oi){let act=null;try{const m=(PH().th[pk]||[])[i];if(m&&m.open)act=(phRepOpts(m.k)[oi]||[])[2];}catch(e){}
  const r=_pa.apply(this,arguments);try{if(typeof act==='string'&&act.startsWith('tr:'))trAct(pk,act.slice(3));}catch(e){console.error(e);}return r;};}
function trAct(pk,code){const p=(S.people||[]).find(q=>q.k===pk),v=p&&vecinoPorId(p.vid);if(!p||!v)return;const T=TT();
  if(code==='ok'||code==='no'){const rq=T.req.find(r=>r.vid===v.id);if(!rq)return;if(code==='ok')trAceptar(v,p,rq);else trRechazar(v,p,rq);return;}
  if(code==='pagar'){const i=T.deudas.findIndex(d=>d.vid===v.id&&d.dir==='le');if(i>=0)trPagar(v,p,i);return;}
  if(code==='luego'){const d=T.deudas.find(d=>d.vid===v.id&&d.dir==='le');if(d){d.dl=S.day+4;d.msg=0;}return;}
  if(code==='curro'){const b=sxSnap(p),res=trFx({pista:1,rel:1},v,p,{});try{tell(trT('diario_curro',{v:v.n,n:CH().name}),'📣');}catch(e){}trCard('📣',v.n,trT('aviso_curro',{v:v.n}),true,p,b,res);return;}
  if(code==='chisme'){const r=trChisme(v);const b=sxSnap(p);if(r)trCard('🗣️',huecos(pickR(TRD().cotilleo.titulo),{v:v.n}),r.txt,true,p,b,{tags:[trT('dicen')+': '+r.x.n]});return;}
  if(code==='asamblea'){trAsamblea(v,p);return;}}
// ---------- Gente: lo que os debéis (la lista la pinta el núcleo, con los mismos botones que a cualquiera) ----------
function trNota(p){const f=TT().f[p.vid]||{},L=[];if(f.te>0)L.push(f.te===1?TRF().te_debe_una:trT('te_debe_n',{n:f.te}));if(f.le>0)L.push(f.le===1?TRF().le_debes_una:trT('le_debes_n',{n:f.le}));
  for(const d of TT().deudas)if(d.vid===p.vid)L.push(trT(d.dir==='le'?'le_debes_euros':'te_debe_euros',{c:fmt(d.amt)}));return L.join(' · ');}
{const _np=notaPersona;notaPersona=function(p){const r=_np.apply(this,arguments);try{if(p&&p.vid!=null&&!vcMenorP(p)){const n=trNota(p);if(n)return vcEsc(n);}}catch(e){}return r;};}
// ---------- vecinos que te buscan (mensaje o visita), a horas en que no trabajan ----------
function trLibreEn(v,h,wd){const t=v.trabajo;if(!(t&&Array.isArray(t.h)&&pbDia(t.dias,wd)))return true;return ![h-1.5,h,h+1].some(x=>pbIn(t.h[0],t.h[1],((x%24)+24)%24));}
function trHoraLibre(v,wd,win){let lo=win?win[0]:10,hi=win?win[1]:21.5;const t=v.trabajo;
  if(t&&Array.isArray(t.h)&&pbDia(t.dias,wd)){const a=t.h[0],b=t.h[1];if(b<=a)return null;const ws=[[lo,Math.min(hi,a-1)],[Math.max(lo,b+1.5),hi]].filter(w=>w[1]-w[0]>=.4);if(!ws.length)return null;const w=pickR(ws);return w[0]+Math.random()*(w[1]-w[0]);}
  return hi-lo>=.25?lo+Math.random()*(hi-lo):null;}
function trSitioCurro(v){const l=v.trabajo&&v.trabajo.lugar;return l&&l!=='fuera'&&PLACES[l]?placeName(l):TRD().buscan.sitio_curro;}
function trQuien(p){const o=(S.people||[]).find(q=>q.vid!=null&&q!==p&&!vcMenorP(q)&&(q.rel||0)>=30&&q.ideo&&q.ideo!=='apolitica');return o?o.n:TXHZ.trato.unas_vecinas;}
function trPlanDia(){const T=TT();T.plan=null;const wd=dateOf(S.day).wd,D=TRD(),B=D.buscan,C=[];
  for(const p of S.people||[]){if(p.vid==null||vcMenorP(p)||TRK_ROM.includes(p.stage)||p.dead)continue;const v=vecinoPorId(p.vid);if(!v)continue;const rel=p.rel||0;if(rel<35||rel>=85)continue;
    if((T.last[p.k]||-99)>S.day-4||T.req.some(r=>r.vid===v.id)||T.comp.some(c=>c.vid===v.id))continue;
    for(const [id,m] of Object.entries(B.mensajes)){if(rel<m.rel[0]||rel>=m.rel[1]||!trReqOk(m.req,v,p)||(m.dias&&!m.dias.includes(wd)))continue;const h=trHoraLibre(v,wd,m.h);if(h!=null)C.push({p,v,tipo:'msg',id,h,w:m.peso||1});}
    if((T.ask[v.id]||-99)<=S.day-6)for(const id of Object.keys(D.favores)){if(D.favores[id].dir!=='pide'||!trFavElegible(id,v,p))continue;const h=trHoraLibre(v,wd,[9,21]);if(h!=null)C.push({p,v,tipo:'pide',id,h,w:2});}
    if(rel>=45&&ownHome()&&!VS().plan&&!(S.res||[]).some(r=>r.pid===p.k)){const h=trHoraLibre(v,wd,[11,21]);if(h!=null)C.push({p,v,tipo:'visita',id:'',h,w:2.5});}}
  if(!C.length||Math.random()>.45)return;const x=trPick(C);T.last[x.p.k]=S.day;
  if(x.tipo==='visita'){const ms=Object.entries(B.visita).map(([id,m])=>({id,w:m.peso||1}));const m=trPick(ms);VS().plan={k:x.p.k,h:x.h,avisa:true,role:'amig'+oa(),asked:false};T.vmot[x.p.k]={id:m.id,day:S.day};return;}
  T.plan={vid:x.v.id,tipo:x.tipo,id:x.id,h:x.h,day:S.day};}
function trDisparo(){const T=TT(),pl=T.plan;if(!pl)return;T.plan=null;const p=vcPer(pl.vid),v=vecinoPorId(pl.vid);if(!p||!v||pl.day!==S.day)return;
  if(pl.tipo==='pide'){if(trFavElegible(pl.id,v,p)&&T.req.length<2)trPide(v,p,pl.id,'msg');return;}
  const m=TRD().buscan.mensajes[pl.id];if(!m)return;const vars={v:v.n,sitio:trSitioCurro(v),quien:trQuien(p)};T.last[p.k]=S.day;
  phIncoming(p,huecos(pickR(m.txt),vars),m.resp.map(r=>[r[0],r[1],r[2],r[3]==null?r[3]:huecos(r[3],vars),r[4]]));}
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const t=S&&S.trato;if(t&&t.plan&&S.t/60>=t.plan.h&&S.t/60<23.5)trDisparo();}catch(e){console.error(e);}return r;};}
// visitas de vecinos: el texto y lo que traen son de verdad concretos; el motivo se elige una vez por día
function trVisitaMot(p){const T=TT(),B=TRD().buscan.visita;let m=T.vmot[p.k];if(!m||m.day!==S.day||!B[m.id]){const id=trPick(Object.keys(B).map(k=>({id:k,w:B[k].peso||1}))).id;m=T.vmot[p.k]={id,day:S.day};}return m;}
{const _pi=phIncoming;phIncoming=function(p,txt,k){try{if(p&&p.vid!=null&&Array.isArray(k)&&k.some(o=>o&&o[2]==='home')&&!vcMenorP(p)){const m=trVisitaMot(p);txt=huecos(pickR(TRD().buscan.visita[m.id].txt),{v:p.n});}}catch(e){}return _pi.call(this,p,txt,k);};}
function trVisitaLlega(p){if(vcMenorP(p))return;const T=TT(),m=T.vmot[p.k];if(!m||m.day!==S.day)return;delete T.vmot[p.k];const M=TRD().buscan.visita[m.id],v=vecinoPorId(p.vid);if(!M||!v)return;
  const b=sxSnap(p),res=trFx(M.fx,v,p,{mem:M.ok[0][0]}),L=pickR(M.ok);p.last=S.day;trCard('🚪',huecos(L[0],{v:v.n}),huecos(L[1],{v:v.n}),true,p,b,res);}
// los vecinos con relación media vienen o escriben; las visitas de siempre se pasan a una hora en que no están en su puesto
function trAjustaVisita(){const V=VS(),pl=V.plan;if(!pl)return;const p=(S.people||[]).find(q=>q.k===pl.k);if(!p||p.vid==null)return;const v=vecinoPorId(p.vid);if(!v)return;
  if(vcMenorP(p)){V.plan=null;return;}const wd=dateOf(S.day).wd;if(trLibreEn(v,pl.h,wd))return;const h=trHoraLibre(v,wd,[11,21.5]);if(h==null)V.plan=null;else pl.h=h;}
// ---------- cada día ----------
function trDia(){const T=TT();for(const p of S.people||[])if(p.vid!=null)trEnsure(p);
  for(const k of Object.keys(T.cd))if(T.cd[k]<S.day-1)delete T.cd[k];
  for(const r of T.req.slice()){if(r.dl<S.day){T.req=T.req.filter(x=>x!==r);const v=vecinoPorId(r.vid),p=vcPer(r.vid);if(v&&p){p.rel=trClamp((p.rel||0)-2);try{tell(trT('diario_pide_exp',{v:v.n,n:CH().name}),'🤷');}catch(e){}}}}
  for(const c of T.comp.slice()){if(c.dl<S.day){T.comp=T.comp.filter(x=>x!==c);const v=vecinoPorId(c.vid),p=vcPer(c.vid),f=TRD().favores[c.id];if(v&&p&&f){trFx(f.fxko,v,p,{});trFav(v.id).hist.push([S.day,TRF().mem_fallaste]);
      try{tell(trT('diario_falla',{n:CH().name,v:v.n}),'😬');phIncoming(p,huecos(TRF().msg_falla,{v:v.n}),'gen');}catch(e){}}}}
  trDeudasDia();
  const B=T.bloque;if(B.ids.length>=3&&!S.owned){trBloqueEfecto();if(!S.rentStrike&&W_().mov>=20&&Math.random()<.15){S.rentStrike=true;const c=TRD().politica.bloque_huelga;try{chapter('inquilinas',c[0],c[1]);}catch(e){}}}
  trPlanDia();trAjustaVisita();}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{trDia();}catch(e){console.error(e);}return r;};}
// el colectivo: a quien te debe una, le toca ayudar antes que a nadie (mods/colectivo.js)
{const _sw=solWho;solWho=function(){try{const T=TT(),L=(S.people||[]).filter(p=>p.vid!=null&&(p.rel||0)>=35&&((T.f[p.vid]||{}).te||0)>0);if(L.length&&Math.random()<.7)return pickR(L);}catch(e){}return _sw.apply(this,arguments);};}
