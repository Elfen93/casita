const {fregar:TX_fregar}=DATA.textos_mods_ag;
const mknob=(a,b,z,col='#e9c46a')=>{if(lvis(0,1)){const [x,y]=LP(a,b,z);circ(x,y,1.3,col);}};
// =================== FREGAR: cocinar ensucia; los platos se acumulan; se friega en el fregadero (o donde se pueda) ===================
if(typeof MUEB_NEW!=='undefined')MUEB_NEW.push('fregadero');if(typeof BACKD!=='undefined')BACKD.fregadero=.06;
MDRAW.fregadero=(o,i,tt,u)=>{const cab=O_COL(o,'#ece6d8'),top=o.q===4?'#efece6':'#c9c3b8';
  lp(.04,.1,.96,.92,0,22,cab);lp(.02,.06,.98,.95,22,25,top);lfB(.08,.48,.921,3,19,shade(cab,.95));lfB(.52,.92,.921,3,19,shade(cab,.95));mknob(.44,.922,15,'#9aa5ad');mknob(.56,.922,15,'#9aa5ad');
  ltop(.2,.25,.8,.75,25.2,'#a9b3ba');ltop(.24,.29,.76,.71,24.6,'#8d979e');
  lp(.47,.12,.53,.18,25,38,'#b8c2c8');lp(.47,.12,.53,.36,36,39,'#b8c2c8');
  const n=Math.min(6,Math.round(S.sucios||0));for(let k=0;k<n;k++){const [x,y]=LP(.35+(k%3)*.13,.4+(k>2?.16:0),26+k*.6);circ(x,y,2.4,'#f4f1ea');}};
// cada comida cocinada deja platos
{const _up=update;update=function(gm){const u0=S.sim.use;const r=_up.apply(this,arguments);try{const u=S.sim.use;
  if(u0&&u0!==u&&['fogon','encimera','micro','barbacoa'].includes(u0.type)&&(u0.goal==='hambre'||u0.act)&&u0.act!=='fregar'&&u0.goal!=='_comer'){S.sucios=Math.min(20,(S.sucios||0)+(u0.type==='fogon'?(u0.act==='tapers'?4:2):1));}}catch(e){}return r;};}
// fregar limpia
{const _af=actFinish;actFinish=function(u,frac){if(u&&(u.act==='fregar'||(u.act==='poner'&&u.type==='lavavaj'))&&ACTV[u.type]){const n=CH().name;const was=Math.round(S.sucios||0);if(frac>=.6){S.sucios=0;if(u.type==='lavavaj')tell(huecos(TX_fregar.lavavajillas_puesto,{was}),'🫧');else if(was>=6&&Math.random()<.4)tell(huecos(TX_fregar.fregado,{n,was}),'🧽');}else S.sucios=Math.max(0,(S.sucios||0)-was*frac);popBubble('✨');return;}return _af.apply(this,arguments);};}
// sin platos limpios no se cocina: primero fregar
function fregarDonde(){const f=findObjs((d,t)=>t==='lavavaj').concat(findObjs((d,t)=>t==='fregadero'),findObjs((d,t)=>t==='encimera'),findObjs((d,t)=>t==='lavabo'));return f[0];}
{const _su=startUse;startUse=function(){const s=S.sim;const i=s.target;try{const o=i!=null&&S.obj[i];if(o&&['fogon','encimera'].includes(o.t)&&(S.sucios||0)>=8&&s.act!=='fregar'){const j=fregarDonde();if(j!=null){s.target=null;s.path=[];toast(TX_fregar.primero_fregar);enqueue({k:'obj',i:j,act:S.obj[j].t==='lavavaj'?'poner':'fregar'});return;}}}catch(e){}return _su.apply(this,arguments);};}
// solo: friega cuando se acumula y está en casa sin mucho que hacer
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const sc=S.sucios||0;const ms=(S.home&&S.home.mates)||[];if(sc>=10&&ms.length&&Math.random()<.5){const p=(S.people||[]).find(x=>x.k===ms[0]);if(p){p.rel=Math.max(0,(p.rel||50)-4);tell(huecos(TX_fregar.nota_nevera,{p:p.n}),'📝');}}
  if(sc>=12&&Math.random()<.3){S.needs.higiene=Math.max(0,S.needs.higiene-8);tell(TX_fregar.cocina_huele,'🪰');}}catch(e){}return r;};}
{let _last=0;const _up2=update;update=function(gm){const r=_up2.apply(this,arguments);try{const s=S.sim;if(S.autoHome&&(S.sucios||0)>=4&&!s.use&&!(s.work>0)&&!s.leaving&&!s.path.length&&!(s.queue&&s.queue.length)&&S.needs.energia>30&&S.t-_last>180&&S.t/60>8&&S.t/60<22){_last=S.t;const j=fregarDonde();if(j!=null)enqueue({k:'obj',i:j,act:S.obj[j].t==='lavavaj'?'poner':'fregar'});}}catch(e){}return r;};}
{const _ul=useLabel;useLabel=function(u){try{if(u&&(u.act==='fregar'||(u.act==='poner'&&u.type==='lavavaj')))return {b:'🧽',v:u.type==='lavavaj'?TX_fregar.uso.lavavaj:u.type==='lavabo'?TX_fregar.uso.lavabo:TX_fregar.uso.otro};}catch(e){}return _ul.apply(this,arguments);};}

{const _su=startUse;startUse=function(){const s=S.sim;const i=s.target;const o=i!=null&&S.obj[i];const want=s.nextAct;
  if(o&&(o.t==='fregadero'||o.t==='lavavaj')){if((S.sucios||0)<.5){s.target=null;s.nextAct=null;s.cmd=false;toast(TX_fregar.nada_que_fregar);return;}if(!want)s.nextAct=o.t==='lavavaj'?'poner':'fregar';}
  if(o&&(o.t==='encimera'||o.t==='lavabo')&&want==='fregar'&&(S.sucios||0)<.5){s.target=null;s.nextAct=null;s.cmd=false;toast(TX_fregar.nada_que_fregar);return;}
  return _su.apply(this,arguments);};}
