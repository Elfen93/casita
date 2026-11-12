// ---------- efectos ----------
{const _xp=traitXP;traitXP=function(k){let m=_xp(k);if(T('multitarea'))m*=1.15;if(T('curiosa')&&k==='logica')m*=1.35;if(T('dondegentes')&&k==='carisma')m*=1.6;if(T('milideas')&&(k==='musica'||k==='logica'))m*=1.2;return m;};}
{const _b=traitBoost;traitBoost=function(type){let b=_b(type);if(T('casera')&&['sofa','tele','fogon','libros','compu','guitarra','planta'].includes(type))b*=1.3;if(T('curiosa')&&(type==='libros'||type==='compu'))b*=1.25;return b;};}
{const dE=TRAIT_DECAY.energia;TRAIT_DECAY.energia=()=>{let f=dE();if(T('deportista'))f*=.9;const h=S.t/60;if(T('nocturna'))f*=h>=21||h<2?.75:h>=6&&h<11?1.3:1;if(T('madrugadora'))f*=h>=5&&h<12?.8:h>=21?1.3:1;return f;};
 const dS=TRAIT_DECAY.social;TRAIT_DECAY.social=()=>dS()*(T('independiente')?.7:1)*(T('fiestera')?1.2:1);}
{const _m=mood;mood=function(){let v=_m();if(T('optimista'))v=v+(100-v)*.08;if(T('pesimista'))v-=4;return v;};}
{const _lt=leaveTime;leaveTime=function(){let t=_lt();if(T('madrugadora'))t-=.25;if(T('nocturna')&&Math.random()<.25)t+=.3;if(T('multitarea')&&Math.random()<.08)t+=.4;return t;};}
// salir más o menos
{const _out=maybeOuting;maybeOuting=function(){if(T('casera')&&Math.random()<.45)return false;if(T('fiestera')&&!outAvail('amigos')&&Math.random()<.12&&S.outDay!==S.day){const nd=S.needs;if(nd.energia>30&&nd.hambre>25&&outCost('amigos')<=spare()){doOut('amigos');return true;}}
  if(T('deportista')&&!outAvail('deporte')&&Math.random()<.1&&S.outDay!==S.day&&!['lluvia','tormenta','nieve'].includes((S.weather||{}).k)&&S.needs.energia>35){doOut('deporte');return true;}return _out.apply(this,arguments);};}
// cambiar de ideas
{const _dw=driftWeekly;driftWeekly=function(){if(T('tozuda')){const c=ex();for(const k in c.drift)if(k!==S.ideo)c.drift[k]*=.85;}return _dw.apply(this,arguments);};}
// amor
{const _f=flirt;flirt=function(p){if((T('dondegentes')||T('impulsiva'))&&p&&p.love!=null)p.love=Math.min(100,p.love+(T('dondegentes')?6:3));return _f.apply(this,arguments);};}
{const _bu=breakUp;breakUp=function(p){const r=_bu.apply(this,arguments);if(T('romantica')){S.needs.diversion=Math.max(0,S.needs.diversion-30);ex().exp.stress++;}if(T('independiente'))S.needs.social=Math.min(100,S.needs.social+15);return r;};}
{const _tk=talkTo;talkTo=function(p){_tk.apply(this,arguments);if(T('romantica')&&p&&['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+2);if(T('dondegentes')&&p)p.rel=Math.min(100,p.rel+3);};}
// pedir aumento
{const _ar=askRaise;askRaise=function(manual){if(T('dondegentes')||T('impulsiva')){const ch=S.skills&&S.skills.carisma;}const save=ID().neg;if(T('dondegentes'))IDEOS[S.ideo||'apolitica'].neg=save+.05;try{return _ar.apply(this,arguments);}finally{IDEOS[S.ideo||'apolitica'].neg=save;}};}
// Mil ideas / constante: los planes
function ideasWeekly(){
  if(T('milideas')&&S.want&&Math.random()<.35){const old=S.want.name;S.want=null;tell(huecos(pickR(TXN.efectos.milideas_aparca),{old}),'💡');}
  if(T('milideas')&&Math.random()<.25){S.needs.diversion=Math.min(100,S.needs.diversion+10);gainSkill(pickR(['logica','musica','carisma']),1.5);}
  if(T('multitarea')&&Math.random()<.18)tell(pickR(TXN.efectos.multitarea_dia),'🔀');
  if(T('pesimista')&&S.money>0)S.money+=Math.round(weeklyRent()*.03);}
{const _cw=conexWeekly;conexWeekly=function(){_cw.apply(this,arguments);try{ideasWeekly();}catch(e){console.error(e);}};}
// pensamientos
{const _tc=thoughtCandidates;thoughtCandidates=function(){const c=_tc.apply(this,arguments);const add=(t,w=1)=>c.push([t,w]);
  if(T('milideas'))add(pickR(TXN.efectos.pensa_milideas),.8);
  if(T('multitarea'))add(pickR(TXN.efectos.pensa_multitarea),.6);
  if(T('independiente'))add(pickR(TXN.efectos.pensa_independiente),.4);
  if(T('dondegentes')&&T('solitaria'))add(TXN.efectos.pensa_gente,.6);
  if(T('optimista'))add(TXN.efectos.pensa_optimista,.4);if(T('pesimista'))add(TXN.efectos.pensa_pesimista,.4);
  if(T('nocturna')&&S.t/60<9)add(TXN.efectos.pensa_cafe,1);if(T('madrugadora')&&S.t/60<8)add(TXN.efectos.pensa_madrugadora,.8);
  return c;};}

// =================== ASPIRACIONES: objetivos que salen del personaje ===================
const ASP_N=5;
const aspS=()=>{if(!S.asp)S.asp={active:[],done:{},base:{},next:0};return S.asp;};
const stat=k=>(S.stats&&S.stats[k])||0;
const chapDone=pre=>Object.keys(storyState().chap).some(k=>k===pre||k.startsWith(pre));
const relCount=n=>(S.people||[]).filter(p=>p.stage!=='ex'&&/^p/.test(p.k)&&p.rel>=n).length;
const ASPD=DATA.sucesos.nucleo_aspiraciones; // categoría, emoji, premio y texto de cada aspiración (data/sucesos.json); aquí, la lógica
const ASP=ASPD.lista,ASPS=ASPD.sin,ASPT=Object.fromEntries(ASP.map(a=>[a.id,a.t]));
porId(ASP,{
  ascenso:{t:()=>huecos(ASPT.ascenso,{x:S.office?office().n:ASPS.ascenso}),w:()=>S.career+1<CAREER.length&&!S.jobless&&!TR().gig?(T('trabajadora')?3:isLeft()&&comp()>=3?.3:1):0,start:()=>S.career,ok:b=>S.career>b},
  cima:{t:()=>huecos(ASPT.cima,{x:L(CAREER[CAREER.length-1].t).toLowerCase()}),w:()=>T('trabajadora')||isI('liberal','libertaria')?1.5:.2,ok:()=>S.career>=CAREER.length-1},
  huir:{t:()=>huecos(ASPT.huir,{x:S.office?office().n:ASPS.huir}),w:()=>!S.jobless&&!TR().self&&TOX()>.6?3:0,start:()=>S.office?office().n:'',ok:b=>S.office&&office().n!==b&&!S.jobless},
  aumento:{t:()=>ASPT.aumento,w:()=>!S.jobless&&!TR().self?(T('dondegentes')||T('impulsiva')?2:1):0,start:()=>S.payMul||1,ok:b=>(S.payMul||1)>b*1.02},
  trabajo:{t:()=>ASPT.trabajo,w:()=>S.jobless?6:0,ok:()=>!S.jobless},
  opos:{t:()=>ASPT.opos,w:()=>S.opos&&S.opos.on?4:isI('conservadora','socialdemocrata')&&T('constante')?.8:0,ok:()=>!!S.oposPassed},
  negocio:{t:()=>ASPT.negocio,w:()=>S.track!=='negocio'&&(isI('libertaria','liberal')||T('milideas')||T('impulsiva'))?1.4:0,ok:()=>S.track==='negocio'},
  coop:{t:()=>ASPT.coop,w:()=>S.track!=='coop'&&isI('anarquista','ecologista')?1.6:0,ok:()=>S.track==='coop'},
  puntual:{t:()=>ASPT.puntual,w:()=>!S.jobless&&(T('despistada')||T('nocturna'))?1.5:0,start:()=>[S.absences||0,S.day],ok:b=>(S.absences||0)===b[0]&&S.day-b[1]>=30},
  // ---- dinero ----
  colchon:{t:()=>huecos(ASPT.colchon,{x:fmt(weeklyRent()*8)}),w:()=>S.money<weeklyRent()*8?(T('ahorradora')||T('pesimista')?3:1):0,ok:()=>S.money>=weeklyRent()*8},
  rojos:{t:()=>ASPT.rojos,w:()=>S.money<0?6:0,ok:()=>S.money>=weeklyRent()},
  casa:{t:()=>ASPT.casa,w:()=>!S.owned?(isI('conservadora','liberal')||T('ahorradora')?2:.4):0,ok:()=>!!S.owned},
  capricho:{t:()=>ASPT.capricho,w:()=>T('derrochadora')||T('impulsiva')?2:.3,start:()=>count(i=>S.obj[i]&&S.obj[i].q===4),ok:b=>count(i=>S.obj[i]&&S.obj[i].q===4)>b},
  // ---- gente ----
  amigos3:{t:()=>ASPT.amigos3,w:()=>relCount(60)<3?(T('sociable')||T('fiestera')?3:T('solitaria')?.4:1):0,ok:()=>relCount(60)>=3},
  unaamiga:{t:()=>ASPT.unaamiga,w:()=>T('solitaria')&&relCount(70)<1?2:0,ok:()=>relCount(70)>=1},
  pareja:{t:()=>ASPT.pareja,w:()=>{const L_=LIFE();return !partner()&&L_.orient!=='nadie'&&L_.rel==='estable'?(T('romantica')?3:1.5):0;},ok:()=>!!partner()},
  juntos:{t:()=>{const p=partner();return huecos(ASPT.juntos,{x:p?p.n:ASPS.juntos});},w:()=>{const p=partner();return p&&p.stage==='pareja'&&LIFE().rel==='estable'?2:0;},ok:()=>!!liveIn()},
  boda:{t:()=>{const p=partner();return huecos(ASPT.boda,{x:p?p.n:ASPS.boda});},w:()=>{const p=partner();return p&&p.stage==='convive'&&LIFE().boda==='si'?2:0;},ok:()=>{const p=partner();return p&&p.stage==='casada';}},
  hijo:{t:()=>ASPT.hijo,w:()=>LIFE().kids==='si'&&!(S.kids||[]).length?((CH().age||27)>=30?2.5:1):0,ok:()=>(S.kids||[]).length>0||!!S.baby},
  madre:{t:()=>{const m=P_('madre');return huecos(ASPT.madre,{x:m?m.n:ASPS.madre});},w:()=>{const m=P_('madre');return m&&m.rel<50?2.5:0;},ok:()=>{const m=P_('madre');return m&&m.rel>=70;}},
  vecina:{t:()=>{const v=P_('vecina');return huecos(ASPT.vecina,{x:v?v.n:ASPS.vecina});},w:()=>{const v=P_('vecina');return v&&v.rel<60?.8:0;},ok:()=>{const v=P_('vecina');return v&&v.rel>=70;}},
  soltera:{t:()=>ASPT.soltera,w:()=>!partner()&&(T('independiente')||LIFE().rel==='soltera')?2:0,start:()=>S.day,ok:b=>!partner()&&S.day-b>=60&&mood()>55},
  fiestas:{t:()=>ASPT.fiestas,w:()=>T('fiestera')||T('sociable')?2:.3,start:()=>stat('outAmigos'),ok:b=>stat('outAmigos')-b>=10},
  // ---- política ----
  afiliarse:{t:()=>ASPT.afiliarse,w:()=>!(S.union&&S.union.member)&&!TR().self&&(isLeft()||isI('socialdemocrata'))?2.5:0,ok:()=>!!(S.union&&S.union.member)},
  huelgaW:{t:()=>ASPT.huelgaW,w:()=>isLeft()&&comp()>=2&&!TR().self?2.5:0,ok:()=>chapDone('huelgaW')},
  organizar:{t:()=>huecos(ASPT.organizar,{x:S.office?office().n:ASPS.organizar}),w:()=>isLeft()&&!S.jobless&&!TR().self&&office().org<50?2:0,ok:()=>!S.jobless&&office().org>=50},
  influencia:{t:()=>ASPT.influencia,w:()=>S.ideo!=='apolitica'&&(S.pol.inf||0)<30&&comp()>=2?(T('lider')?2.5:1):0,ok:()=>(S.pol.inf||0)>=30},
  concejala:{t:()=>ASPT.concejala,w:()=>isI('socialdemocrata','conservadora','liberal','ecologista')&&!S.pol.cand?1.2:0,ok:()=>!!S.pol.cand},
  desahucio:{t:()=>ASPT.desahucio,w:()=>isI('anarquista','marxista')?1.2:0,ok:()=>chapDone('desahucio')},
  convencer:{t:()=>{const p=partner();return huecos(ASPT.convencer,{x:p?p.n:ASPS.convencer});},w:()=>{const p=partner();return p&&S.ideo!=='apolitica'&&p.ideo!==S.ideo&&comp()>=2?1.5:0;},ok:()=>{const p=partner();return p&&p.ideo===S.ideo;}},
  despolitizar:{t:()=>ASPT.despolitizar,w:()=>T('cinica')&&S.ideo!=='apolitica'?1.5:0,start:()=>S.day,ok:b=>S.day-b>=30},
  // ---- cabeza y aficiones ----
  musica:{t:()=>ASPT.musica,w:()=>lvl('musica')<5?(T('artista')?3:T('milideas')?1:.2):0,ok:()=>lvl('musica')>=5},
  cocina:{t:()=>ASPT.cocina,w:()=>lvl('cocina')<5?(T('cocinillas')?3:T('casera')?1.2:.3):0,ok:()=>lvl('cocina')>=5},
  logica:{t:()=>ASPT.logica,w:()=>lvl('logica')<6?(T('curiosa')?3:T('milideas')?1.2:.3):0,ok:()=>lvl('logica')>=6},
  carisma:{t:()=>ASPT.carisma,w:()=>lvl('carisma')<6?(T('dondegentes')||T('lider')?2:.5):0,ok:()=>lvl('carisma')>=6},
  forma:{t:()=>ASPT.forma,w:()=>(S.fit||0)<60?(T('deportista')?3:.4):0,ok:()=>(S.fit||0)>=60},
  huerto:{t:()=>ASPT.huerto,w:()=>T('naturaleza')||isI('ecologista')?2:.3,start:()=>stat('harvest'),ok:b=>stat('harvest')-b>=10},
  manitas:{t:()=>ASPT.manitas,w:()=>T('manitas')?2.5:T('multitarea')?1:.3,ok:()=>['carp','elec','font','alba','jard'].some(k=>lvl(k)>=5)},
  todoterreno:{t:()=>ASPT.todoterreno,w:()=>T('multitarea')?3:0,ok:()=>SKILLS.filter(([k])=>lvl(k)>=3).length>=5},
  acabar:{t:()=>ASPT.acabar,w:()=>T('milideas')?3:0,start:()=>stat('built'),ok:b=>stat('built')>b},
  obra:{t:()=>S.want?huecos(ASPT.obra,{x:S.want.name.toLowerCase()}):ASPS.obra,w:()=>T('constante')||T('casera')?2:.6,start:()=>stat('built'),ok:b=>stat('built')>b},
  // ---- ánimo ----
  semana:{t:()=>ASPT.semana,w:()=>T('pesimista')||T('ansiosa')||T('cinica')?2:.6,start:()=>S.day,ok:b=>(S.asp.streak||0)>=7&&S.day-b>=7},
  descanso:{t:()=>ASPT.descanso,w:()=>!S.jobless&&(S.vac||0)>=3?1:0,start:()=>(S.vacDays||[]).length,ok:b=>(S.vacDays||[]).length>b}});
const ASP_CAT=ASPD.categorias;
function aspFill(){const A=aspS();A.active=A.active.filter(id=>ASP.some(a=>a.id===id));
  while(A.active.length<ASP_N){const used=new Set(A.active),cats=new Set(A.active.map(id=>ASP.find(a=>a.id===id).c));
    const cand=ASP.filter(a=>!used.has(a.id)&&!(A.done[a.id]&&S.day-A.done[a.id]<60)).map(a=>{let w=0;try{w=a.w();}catch(e){}if(w>0&&cats.has(a.c))w*=.45;if(w>0){try{if(!a.start&&a.ok())w=0;}catch(e){w=0;}}return [a,w];}).filter(x=>x[1]>0);
    if(!cand.length)break;let tot=cand.reduce((s,x)=>s+x[1],0),r=Math.random()*tot,pick=cand[0][0];for(const [a,w] of cand){r-=w;if(r<=0){pick=a;break;}}
    A.active.push(pick.id);A.base[pick.id]=pick.start?pick.start():null;}}
function aspCheck(){const A=aspS();if(!A.active.length)aspFill();
  for(const id of [...A.active]){const a=ASP.find(x=>x.id===id);if(!a)continue;let ok=false;try{ok=a.ok(A.base[id]);}catch(e){}
    if(ok){A.active=A.active.filter(x=>x!==id);A.done[id]=S.day;A.count=(A.count||0)+1;const gr=Math.round(WP()*a.r*Dm().goal*1.4);S.money+=gr;bumpMoney();unseen++;if(!S.sim.work)confetti(S.sim.x,S.sim.y,50);
      tell(huecos(TXN.efectos.asp_conseguida,{t:a.t()}),a.e,'big');toast(huecos(TXN.efectos.asp_toast,{t:a.t()}),true);sfx('level');aspFill();}}
  // abandonar los que ya no tienen sentido
  for(const id of [...A.active]){const a=ASP.find(x=>x.id===id);let w=1;try{w=a.w();}catch(e){}if(w===0&&!a.start){A.active=A.active.filter(x=>x!==id);aspFill();}}}
function aspDaily(){const A=aspS();A.streak=mood()>62?(A.streak||0)+1:0;if(T('milideas')&&A.active.length&&Math.random()<.05){const id=A.active[Math.random()*A.active.length|0];A.active=A.active.filter(x=>x!==id);aspFill();}}
// contadores que usan las aspiraciones
{const _go=goOut;goOut=function(k){if(k==='amigos'){S.stats=S.stats||{};S.stats.outAmigos=(S.stats.outAmigos||0)+1;}return _go.apply(this,arguments);};}
function aspBlock(){const A=aspS();aspFill();let h=`<h3>${huecos(TXN.efectos.ui_quiere,{n:CH().name})}</h3><div class="sub" style="font-size:11.5px;margin-bottom:4px">${TXN.efectos.ui_quiere_sub}</div>`;
  for(const id of A.active){const a=ASP.find(x=>x.id===id);if(!a)continue;h+=`<div class="goal"><span>${a.e}</span><span>${a.t()}</span><span class="r">+${fmt(Math.round(WP()*a.r*Dm().goal*1.4))}</span></div>`;}
  const n=A.count||0;if(n)h+=`<div class="sub" style="font-size:11.5px">${huecos(TXN.efectos.ui_cumplidas,{k:n,s:n>1?'s':''})}</div>`;
  const house=GOALS.filter(g=>!S.goals[g.id]).slice(0,3);
  if(house.length)h+=`<h3>${TXN.efectos.ui_ideas_casa}</h3>`+house.map(g=>`<div class="goal"><span>⬜</span><span>${g.t}</span><span class="r">+${fmt(Math.round(g.r*Dm().goal))}</span></div>`).join('')+`<div class="sub" style="font-size:11.5px">${huecos(TXN.efectos.ui_hechas,{a:GOALS.filter(g=>S.goals[g.id]).length,b:GOALS.length})}</div>`;
  return h;}
{const _ty=tally;tally=function(k,v){S.stats=S.stats||{};if(k==='built')S.stats.built=(S.stats.built||0)+1;if(k==='harvest'){const prev=(S.today&&S.today.harvest)||0;S.stats.harvest=(S.stats.harvest||0)+Math.max(0,(v||0)-prev);}return _ty.apply(this,arguments);};}
{const _cg=checkGoals;checkGoals=function(){try{aspCheck();}catch(e){console.error(e);}return _cg.apply(this,arguments);};}

// =================== VIVIENDA: de la habitación compartida al chalet ===================
const HOMES=DATA.viviendas.viviendas;
const HOME_ORDER=DATA.viviendas.orden;
const HT=()=>HOMES[(S&&S.home&&S.home.type)||'casita'];
const homeArea=()=>(S&&S.home&&S.home.area)||[0,0,N-1,N-1];
function inArea(x,y){const a=homeArea();return x>=a[0]&&y>=a[1]&&x<=a[2]&&y<=a[3];}
