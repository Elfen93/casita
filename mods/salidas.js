// =================== SALIDAS NUEVAS EN «VIDA»: todo lo que los módulos añaden a OUT, agrupado ===================
const OUT_GROUPS=DATA.lugares.salidas_grupos;
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{let x='';for(const [t,ks] of OUT_GROUPS){let rows='';for(const k of ks){const o=OUT[k];if(!o)continue;if(o.req&&!o.req())continue;const why=outAvail(k);const c=outCost(k);rows+=`<div class="outrow"><span class="oe">${o.e}</span><span class="ot"><b>${o.n}</b><small>${o.why}${c?' · '+fmt(c):''}</small></span><button class="mini" data-out="${k}" ${why?'disabled style="opacity:.45"':''}>${why||TXHZ.salidas.ir_ahora}</button></div>`;}
    if(rows)x+=`<h3>${t}</h3>`+rows;}
  if(x)h+=x;}catch(e){console.error(e);}return h;};}
