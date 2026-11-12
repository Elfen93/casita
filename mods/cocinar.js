// =================== PRIMERO SE COCINA, LUEGO SE COME: el plato se come al terminar, en la mesa o de pie ===================
const {cocinar:TX_cocinar}=DATA.textos_mods_ag;
const COOK_T=new Set(['fogon','barbacoa','encimera','micro']);
const isCook=u=>u&&COOK_T.has(u.type)&&u.goal!=='_comer'&&(u.goal==='hambre'||u.act);
{const _up=update;update=function(gm){const s=S.sim,nd=S.needs;const u=s.use;
  // cocinando: lo que «llena» el fogón va al plato, no a la tripa
  if(isCook(u)){const v=S.plato||0;nd.hambre+=v;const h0=nd.hambre;const r=_up.apply(this,arguments);try{const d=nd.hambre-h0;nd.hambre=Math.max(0,h0-v);S.plato=v+Math.max(0,d);
      if(s.use!==u&&S.plato>0){S.platoT=S.t;if(s.use&&s.use.type==='_meal'){}else if(s.mealJ!=null){}else if(!s.use){s.use={type:u.type,i:u.i,t:0,goal:'_comer',cmd:true};}}}catch(e){}return r;}
  // comiendo de pie: lo que da el fogón sale del plato
  if(u&&u.goal==='_comer'){const h0=nd.hambre;const r=_up.apply(this,arguments);try{const d=nd.hambre-h0;let p=S.plato||0;if(d>0){if(d>p){nd.hambre-=d-p;p=0;}else p-=d;}S.plato=p;if(p<=0.5&&s.use===u){S.plato=0;s.use=null;s.think=0;popBubble('😋');}}catch(e){}return r;}
  const r=_up.apply(this,arguments);
  try{const p=S.plato||0;if(p>0){const m=s.use;
    if(m&&m.type==='_meal'){const left=Math.max(1,(m.dur||28)-m.t);const add=Math.min(p,p*gm/left);nd.hambre=Math.min(100,nd.hambre+add);S.plato=p-add;}
    else if(s.mealJ==null&&S.t-(S.platoT||S.t)>6){nd.hambre=Math.min(100,nd.hambre+p);S.plato=0;}}}catch(e){}
  return r;};}
{const _ul=useLabel;useLabel=function(u){try{if(u&&u.goal==='_comer'){const mesa=findObjs((d,t)=>t==='mesa'||!!d.table).length;return {b:'🍽️',v:mesa?TX_cocinar.de_pie.con_mesa:TX_cocinar.de_pie.sin_mesa};}}catch(e){}return _ul.apply(this,arguments);};}
