// =================== LA HUELGA SE VE: banda roja arriba, cuenta de días, piquete a un toque ===================
let strikeEl=null;
function strikeBar(){const st=S.strike;if(!strikeEl){strikeEl=document.createElement('div');strikeEl.id='strikebar';document.body.appendChild(strikeEl);strikeEl.onclick=e=>{const f=e.target.closest('[data-a="fold"]');if(f&&S.strike){S.strike.mini=S.strike.mini===S.day?-1:S.day;strikeBar();return;}const b=e.target.closest('button');if(!b)return;if(b.dataset.a==='piquete'){if(outAvail('piquete'))toast(huecos(TXHZ.huelga.piquete_no,{why:outAvail('piquete')}));else doOut('piquete');}if(b.dataset.a==='vida'){openMenu('trabajo');}};}
  if(!st||!st.on){strikeEl.classList.remove('on');return;}
  const day=S.day-(st.start||S.day)+1;const join=st.join;const h=S.t/60;const can=!outAvail('piquete');const pq=join&&h>=6.5&&h<11&&dayType(S.day)==='work';
  const mini=st.mini===S.day;strikeEl.classList.toggle('mini',mini);
  const txt=join?huecos(TXHZ.huelga.huelga,{day,x:st.total||'?'}):huecos(TXHZ.huelga.hay_huelga_dia,{day});
  strikeEl.innerHTML=`<span data-a="fold">${txt}${mini?'':join?` · sin sueldo`:` · ${CH().name} va a trabajar`}</span>${!mini&&pq?`<button data-a="piquete" ${can?'':'disabled'}>🪧 ${can?'Al piquete':'Piquete 7–11h'}</button>`:''}${!mini&&!join?`<button data-a="vida">💼</button>`:''}${mini?'':'<b data-a="fold" class="sbx">✕</b>'}`;
  strikeEl.classList.toggle('scab',!join);strikeEl.classList.add('on');}
{const _up=update;let _n=0;update=function(gm){const r=_up.apply(this,arguments);try{if((++_n&15)===0)strikeBar();}catch(e){}return r;};}
{const _fw=typeof callStrike==='function'?callStrike:null;if(_fw)callStrike=function(){const r=_fw.apply(this,arguments);try{strikeBar();if(S.strike&&S.strike.on){sfx('level');toast(TXHZ.huelga.huelga2,true);}}catch(e){}return r;};}
// el HUD de Ana: estado
{const _ul=useLabel;useLabel=function(u){try{if(S.strike&&S.strike.on&&S.strike.join&&!(S.sim.work>0)&&dayType(S.day)==='work'&&S.t/60>=SHIFT.start&&S.t/60<SHIFT.end){const r=_ul.apply(this,arguments);return {b:'✊',v:huecos(TXHZ.huelga.en_huelga,{x:r&&r.v?r.v.toLowerCase():TXHZ.huelga.casa})};}}catch(e){}return _ul.apply(this,arguments);};}
// aviso a las 6:45 y al piquete a las 7, sola
{const _up2=update;update=function(gm){const r=_up2.apply(this,arguments);try{const st=S.strike;if(!st||!st.on||!st.join)return r;const h=S.t/60;const s=S.sim;
    if(h>=6.7&&h<6.8&&st.warnDay!==S.day){st.warnDay=S.day;toast(huecos(TXHZ.huelga.piquete_7_puerta_va,{x:S.office?S.office.n:TXHZ.huelga.empresa}),true);sfx('tap');}
    if(h>=7&&h<9.5&&st.goDay!==S.day&&!(s.work>0)&&!s.leaving&&dayType(S.day)==='work'){const why=outAvail('piquete');if(!why){st.goDay=S.day;doOut('piquete');}else if(h>=9.4){st.goDay=S.day;toast(huecos(TXHZ.huelga.no_piquete,{why}));}}
  }catch(e){}return r;};}
