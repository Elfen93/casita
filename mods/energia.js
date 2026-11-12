// =================== ENERGÍA CON SENTIDO: nadie se duerme en la acera; si no puede más, vuelve a casa y se mete en la cama ===================
const {energia:TX_energia}=DATA.textos_mods_ag;
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const s=S.sim,nd=S.needs;const E=S.en=S.en||{};const n=CH().name;
  // fuera: si está reventado, se vuelve antes
  if(s.work>0&&s.outingActive&&s.outingActive!=='calabozo'&&nd.energia<12&&E.cut!==s.outingActive+S.day){E.cut=s.outingActive+S.day;s.work=Math.min(s.work,25);toast(huecos(TX_energia.reventado,{rev:ga(...TX_energia.reventado_g)}));}
  // en casa: con poca energía, a la cama antes de caer redondo
  if(!(s.work>0)&&!s.leaving&&nd.energia<14&&!(s.use&&(bedUse(s.use)||s.use.type==='_suelo'))&&S.t-(E.bed||-99)>20){const q=s.queue||[];if(!q.some(x=>x.need==='energia')){E.bed=S.t;s.use=null;s.path=[];enqueue({k:'need',need:'energia'});}}
}catch(e){}return r;};}
// al volver tarde y cansado, directo a dormir
{const _fw=finishWork;finishWork=function(){const was=S.sim.outingActive;const r=_fw.apply(this,arguments);try{const h=S.t/60;if(S.needs.energia<25&&(h>=21||h<5||S.needs.energia<15)){S.sim.use=null;enqueue({k:'need',need:'energia'});}}catch(e){}return r;};}
