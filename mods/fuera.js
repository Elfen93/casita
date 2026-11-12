// =================== FUERA DE CASA, LAS NECESIDADES SE MUEVEN EN VIVO (no todo al volver) ===================
const OUT_LIVE=DATA.lugares.salidas_necesidades;
{const _up=update;update=function(gm){const s=S.sim;const k=s.outingActive;const r=_up.apply(this,arguments);try{if(k&&OUT_LIVE[k]&&s.work>0){const L=OUT_LIVE[k];const acc=S.outAcc=S.outAcc||{k,v:{}};if(acc.k!==k){acc.k=k;acc.v={};}
    for(const n in L){const v=L[n]*gm;const b=S.needs[n];S.needs[n]=Math.max(0,Math.min(100,b+v));acc.v[n]=(acc.v[n]||0)+(S.needs[n]-b);}}}catch(e){}return r;};}
// al volver, lo que ya se ha ido sumando por el camino no se suma dos veces
{const _ob=outBack;outBack=function(k){const acc=S.outAcc&&S.outAcc.k===k?S.outAcc.v:null;S.outAcc=null;if(!acc)return _ob.apply(this,arguments);const b={...S.needs};const r=_ob.apply(this,arguments);try{for(const n in acc){const d=S.needs[n]-b[n];if((d>0&&acc[n]>0)||(d<0&&acc[n]<0)){const keep=d-acc[n];S.needs[n]=Math.max(0,Math.min(100,b[n]+(Math.sign(d)===Math.sign(keep)?keep:0)));}}}catch(e){}return r;};}
