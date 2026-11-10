// ---------- higiene más realista y rutina de ducha que se aprende ----------
{const base=DECAY.higiene;Object.defineProperty(DECAY,'higiene',{get(){const se=typeof seasonOf==='function'?seasonOf():'pri';
  // de 100 a 40: invierno ~2,3 días, primavera/otoño ~1,8, verano ~1,3 (en casa; trabajando un poco más rápido)
  return se==='inv'?0.018:se==='ver'?0.032:0.023;},configurable:true});void base;}
const SHOWERS=new Set(['ducha','banera']);
{const _su=startUse;startUse=function(){const s=S.sim,i=s.target,o=i!=null&&S.obj[i];const r=_su.apply(this,arguments);
  try{if(o&&SHOWERS.has(o.t)){const h=S.t/60;const R=S.shw||(S.shw={m:0,n:0,last:0});const slot=h>=5&&h<13?'m':(h>=18||h<3)?'n':null;
    const prev=R.m===R.n?null:(R.m>R.n?'m':'n');if(slot)R[slot]=Math.min(12,R[slot]+1);if(slot){const o2=slot==='m'?'n':'m';R[o2]=Math.max(0,R[o2]-.5);}
    R.last=S.day*1440+S.t;const now=R.m===R.n?null:(R.m>R.n?'m':'n');
    if(now&&now!==prev&&Math.max(R.m,R.n)>=3)toast(`🚿 ${CH().name} ya tiene su rutina: se ducha ${now==='m'?'por la mañana':'por la noche'}`);}}catch(e){console.error(e);}
  return r;};}
function showerPref(){const R=S.shw||{m:0,n:0};if(R.m!==R.n)return R.m>R.n?'m':'n';return (S.track&&!S.jobless)?'m':'n';}
function routineShower(){const s=S.sim;if(s.leaving||s.use||s.target!=null||s.path&&s.path.length||s.work>0)return false;
  const h=S.t/60,nd=S.needs;const R=S.shw||{last:0};const since=(S.day*1440+S.t-(R.last||0))/60;if(nd.higiene>92||(since<14&&nd.higiene>50)||since<2)return false;
  if(nd.vejiga<20||nd.hambre<15)return false;
  const pref=showerPref();let ok=false;
  if(pref==='m'){ok=h>=6.2&&h<10.5;if(ok&&typeof shouldWork==='function'&&shouldWork()&&h>=7.6)ok=false;}
  else ok=h>=21&&h<23.6;
  // si se le pasó la suya, que no llegue al día siguiente hecha un desastre
  if(!ok&&((since>30&&nd.higiene<60)||nd.higiene<50)&&h>=7&&h<23.5)ok=true;
  if(!ok)return false;
  const r=bestObjFor('higiene');if(!r||!r.path)return false;go(r,'higiene',false);return true;}
{const _au=autonomy;autonomy=function(){try{if(routineShower())return;}catch(e){console.error(e);}return _au.apply(this,arguments);};}
// de noche: si aprieta la vejiga, se levanta a hacer pis en vez de mojar la cama
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const s=S.sim,u=s.use;if(u&&['cama','camamat','litera','colchon','sofacama'].includes(u.type)&&S.needs.vejiga<9&&!s.work){const b=bestObjFor('vejiga');if(b&&b.path){s.use=null;go(b,'vejiga',false);if(throttled('pisnoche',600000))tell(`${CH().name} se levantó medio dormid${oa()} a hacer pis.`,'🚽');}}}catch(e){}return r;};}
// ducha realista: 10-15 minutos, no una hora
OBJ.ducha.need.higiene=5;OBJ.banera.need.higiene=3.5;if(OBJ.lavabo&&OBJ.lavabo.need&&OBJ.lavabo.need.higiene)OBJ.lavabo.need.higiene=Math.max(OBJ.lavabo.need.higiene,2.5);
// energía en el trabajo: una jornada de 8 h debe gastar ~30 puntos (35 en la obra), no 50
{const _upE=update;update=function(gm){const s=S.sim;const work=s.work>0&&!s.outingActive;const e0=S.needs.energia;const r=_upE.apply(this,arguments);
  if(work){const d=e0-S.needs.energia;if(d>0){const f=S.track==='obra'?.65:.58;S.needs.energia=Math.max(3,e0-d*f*(T('deportista')?.9:1)*(T('perezosa')?1.1:1));}}return r;};}
// dormir recupera de verdad: 8 h de cama → ~95 % desde cero; mientras duerme no se cansa
OBJ.cama.need.energia=.19;OBJ.camamat.need.energia=.215;OBJ.litera.need.energia=.175;OBJ.colchon.need.energia=.13;if(OBJ.sofacama&&OBJ.sofacama.need)OBJ.sofacama.need.energia=Math.max(OBJ.sofacama.need.energia||0,.19);
{const _upS=update;update=function(gm){const s=S.sim;const u=s.use;const sleeping=u&&['cama','camamat','litera','colchon','sofacama'].includes(u.type)&&!(s.work>0);const e0=S.needs.energia;const r=_upS.apply(this,arguments);
  if(sleeping&&s.use===u){S.needs.energia=Math.min(100,S.needs.energia+DECAY.energia*(TRAIT_DECAY.energia?TRAIT_DECAY.energia():1)*gm);}return r;};}
