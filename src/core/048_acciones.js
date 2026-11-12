// ---------- acciones ----------
function talkTo(p){p.rel=Math.min(100,p.rel+10);if(['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+3*compatOf(p)/60);S.needs.social=Math.min(100,S.needs.social+18);p.last=S.day;if(p.rel>=50&&p.stage==='conocida')setStage(p,'amiga');}
function callP(p){if(S.sim.work>0)return toast(TXN.acciones.llamar_no);talkTo(p);tally('calls',p.n);toast(huecos(TXN.acciones.llamar,{n:CH().name,p:p.n}));}
function flirt(p){
  if(!canLove(p)){toast(huecos(TXN.acciones.flirt_no_interesa,{p:p.n,o:pO(p),n:CH().name}));return false;}
  const pt=partner();if(pt&&pt!==p&&!S.openRel){toast(huecos(TXN.acciones.ya_tiene_pareja,{n:CH().name}));return false;}
  const c=compatOf(p),chance=Math.min(.9,(p.love+p.rel*.4+c*.5)/140+lvl('carisma')*.03);
  if(Math.random()<chance){setStage(p,p.relStyle==='libre'&&LIFE().rel==='libre'?'rollo':'cita');p.love=Math.min(100,p.love+15);
    if(p.stage==='rollo')chapter('rollo1',TXN.acciones.cap_rollo1_t,huecos(TXN.acciones.cap_rollo1,{n:CH().name,p:p.n}));
    else chapter('cita1',TXN.acciones.cap_cita1_t,huecos(TXN.acciones.cap_cita1,{n:CH().name,p:p.n,rol:roleTxt(p)}));
    toast(huecos(TXN.acciones.flirt_si,{p:p.n}),true);sfx('level');popBubble('💘');return true;}
  p.rel=Math.max(0,p.rel-6);S.needs.diversion=Math.max(0,S.needs.diversion-15);tell(huecos(TXN.acciones.flirt_no,{n:CH().name,p:p.n,r:huecos(pickR(TXN.acciones.flirt_no_r),{})}),'🙈');toast(huecos(TXN.acciones.flirt_no_labor,{p:p.n}));return false;}
function askOut(p){if(p.love<60){toast(huecos(TXN.acciones.pedir_pronto,{p:p.n,n:CH().name}));return;}
  if(p.relStyle==='soltera'&&Math.random()<.6){tell(huecos(TXN.acciones.pedir_soltera,{p:p.n}),'💔');p.love-=15;p.refused=(p.refused||0)+1;return;}
  setStage(p,'pareja');chapter('pareja1',TXN.acciones.cap_pareja1_t,huecos(TXN.acciones.cap_pareja1,{n:CH().name,p:p.n}));toast(huecos(TXN.acciones.pedir_si,{n:CH().name,p:p.n}),true);sfx('level');popBubble('❤️');}
function moveIn(p){if(p.love<70||S.day-(p.stageDay||0)<20){toast(TXN.acciones.convivir_pronto);return;}
  const beds=findObjs((d,t)=>t==='cama'||!!d.bed).length;setStage(p,'convive');chapter('convive',TXN.acciones.cap_convive_t,huecos(TXN.acciones.cap_convive,{p:p.n,n:CH().name,cama:beds?'':TXN.acciones.cap_convive_cama}));toast(huecos(TXN.acciones.convivir_si,{p:p.n,n:CH().name}),true);}
function wedding(p,kind){const cost=kind==='grande'?Math.round(1600*PM()):kind==='sencilla'?Math.round(350*PM()):Math.round(40*PM());
  if(S.money<cost&&kind!=='hecho'){toast(huecos(TXN.acciones.boda_sin_dinero,{tipo:kind,coste:fmt(cost)}));return;}
  S.money-=cost;bumpMoney();setStage(p,'casada');p.love=Math.min(100,p.love+15);for(const q of S.people||[])if(q.k==='madre'||q.k==='amiga')q.rel=Math.min(100,q.rel+10);
  chapter('boda',kind==='hecho'?TXN.acciones.cap_boda_hecho_t:TXN.acciones.cap_boda_t,kind==='hecho'?huecos(TXN.acciones.cap_boda_hecho,{n:CH().name,p:p.n}):kind==='grande'?huecos(TXN.acciones.cap_boda_grande,{coste:fmt(cost)}):huecos(TXN.acciones.cap_boda_sencilla,{madre:P_('madre')?huecos(TXN.acciones.cap_boda_madre,{m:P_('madre').n}):''}));
  toast(kind==='hecho'?huecos(TXN.acciones.boda_hecho,{p:p.n}):huecos(TXN.acciones.boda_casados,{n:CH().name,p:p.n}),true);sfx('level');popBubble('💍');}
function breakUp(p,why){const was=p.stage;setStage(p,'ex');p.love=0;p.rel=Math.max(5,p.rel-30);S.needs.diversion=Math.max(0,S.needs.diversion-40);S.needs.social=Math.max(0,S.needs.social-20);
  S.res=(S.res||[]).filter(r=>r.pid!==p.k);
  if(was==='convive'||was==='casada'){chapter('ruptura',TXN.acciones.cap_ruptura_t,huecos(TXN.acciones.cap_ruptura,{p:p.n,n:CH().name,why:why?': '+why:'',ninos:(S.kids||[]).length?TXN.acciones.cap_ruptura_ninos:''}));}
  else tell(huecos(TXN.acciones.ruptura,{n:CH().name,p:p.n,why:why?': '+why:''}),'💔');toast(huecos(TXN.acciones.ruptura_toast,{n:CH().name,p:p.n}),true);}
// hijos: embarazo, adopción o clínica
function canCarry(g){return g==='f'||g==='x';}
function tryBaby(p){const L=LIFE();if(S.baby){toast(TXN.acciones.bebe_en_camino);return;}
  if(p&&p.kids==='no'){tell(huecos(TXN.acciones.bebe_no_quiere,{p:p.n}),'💬');p.love-=8;return;}
  const c=CH();let mode;if(p){mode=canCarry(c.g)&&p.g==='m'?'ana':canCarry(p.g)&&c.g==='m'?'pareja':'adopcion';}else mode=canCarry(c.g)?'clinica':'adopcion';
  const cost=mode==='adopcion'?Math.round(900*PM()):mode==='clinica'?Math.round(1200*PM()):0;if(S.money<cost){toast(huecos(TXN.acciones.bebe_sin_dinero,{coste:fmt(cost),para:mode==='adopcion'?TXN.acciones.bebe_adopcion:TXN.acciones.bebe_clinica}));return;}
  S.money-=cost;S.baby={mode,start:S.day,due:S.day+(mode==='adopcion'?55:38),with:p?p.k:null};
  chapter('bebe1',mode==='adopcion'?TXN.acciones.cap_bebe_papeles:TXN.acciones.cap_bebe_positivo,mode==='adopcion'?huecos(TXN.acciones.cap_bebe_adopcion,{c:c.name,con:p?huecos(TXN.acciones.cap_bebe_con,{p:p.n}):''}):mode==='clinica'?huecos(TXN.acciones.cap_bebe_clinica,{c:c.name,padre:ga('madre','padre','madre o padre')}):huecos(TXN.acciones.cap_bebe_positivo_txt,{quien:mode==='ana'?c.name:p.n,o:mode==='ana'?oa():pO(p)}));
  toast(mode==='adopcion'?TXN.acciones.bebe_tramites:TXN.acciones.bebe_viene,true);sfx('level');}
const KIDNAMES=DATA.personas.nombres_peques;
function babyBorn(){const b=S.baby;S.baby=null;const g=pickR(['f','m']);const n=pickR(KIDNAMES[g]);const p=b.with?(S.people||[]).find(q=>q.k===b.with):null;
  const ch={...randomChar(),g,name:n,skin:Math.random()<.5?CH().skin:(p?p.ch.skin:CH().skin),hair:Math.random()<.5?CH().hair:(p?p.ch.hair:CH().hair),style:g==='f'?pickR(['coleta','media','rizos']):pickR(['corto','rizos']),beard:'no',glasses:false};
  S.kids=S.kids||[];S.kids.push({n,g,born:S.day,ch});S.leaveUntil=S.day+16;
  chapter('nace_'+S.kids.length,`${n}`,huecos(TXN.acciones.cap_nace,{llega:b.mode==='adopcion'?huecos(TXN.acciones.cap_nace_adopcion,{n}):huecos(TXN.acciones.cap_nace_parto,{n}),c:CH().name,paran:p?huecos(TXN.acciones.cap_nace_paran,{p:p.n}):TXN.acciones.cap_nace_para,o:g==='f'?'a':'o'}));
  toast(huecos(TXN.acciones.bienvenido,{o:g==='f'?'a':'o',n}),true);sfx('level');popBubble('👶');
  if(Dm().soul&&!TR().self&&Math.random()<.25)setTimeout(()=>tell(TXN.acciones.permiso_turno,'😒'),10);}
const kidAge=k=>Math.floor((S.day-k.born)/60); // un año de crío cada 60 días de juego
const onLeave=()=>S.leaveUntil>S.day;
