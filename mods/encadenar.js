// =================== SALIR DESDE FUERA: del curro al gimnasio, del gimnasio a la asamblea; irse a mitad de algo ===================
const {encadenar:TX_encadenar}=DATA.textos_mods_ag;
const awayNow=()=>S.sim.work>0&&!S.jail;
{const _oa=outAvail;outAvail=function(k){const s=S.sim;if(awayNow()&&OUT[k]&&s.outingActive!==k){const w=s.work;s.work=0;try{const r=_oa.apply(this,arguments);return r;}finally{s.work=w;}}return _oa.apply(this,arguments);};}
function leaveNow(){const s=S.sim;const n=CH().name;if(s.outingActive){const k=s.outingActive;const left=s.work;const tot=s.awayTotal||1;const frac=1-Math.min(1,left/tot);s.outingActive=null;s.work=0;s.dest=null;s.route=null;
    if(k==='calabozo')return false;
    if(frac>=.35){if(k==='amigos')friendBack();else if(OUT[k])outBack(k);else if(k==='eat'){S.money-=mealOutCost();S.needs.hambre=Math.min(100,S.needs.hambre+40);}}
    else{S.outAcc=null;if(k==='amigos'&&S.outWith){const f=(S.people||[]).find(q=>q.k===S.outWith);if(f){f.rel=Math.max(0,f.rel-3);toast(huecos(TX_encadenar.plantado,{f:f.n}));}}}
    return true;}
  // en el trabajo: irse antes
  if(S.lastWorkDay===S.day&&!s.outingActive){const h=S.t/60;if(h<SHIFT.start+.5){toast(huecos(TX_encadenar.recien_llegado,{n}));return false;}
    const left=s.work;s.worked=Math.max(30,(s.worked||480)-Math.max(0,left-30));S.rep=Math.max(0,(S.rep??70)-(left>150?7:left>60?4:1));S.leftEarly=(S.leftEarly||0)+1;
    if(left>60)tell(huecos(TX_encadenar.se_va_antes,{n,h:Math.round(left/60*10)/10,x:huecos(pickR(TX_encadenar.excusas),{n})}),'🚪');
    finishWork();return true;}
  return false;}
{const _do=doOut;doOut=function(k){const s=S.sim;if(awayNow()&&OUT[k]){const from=s.outingActive?(OUT[s.outingActive]?outName(s.outingActive):'fuera'):'el trabajo';if(!leaveNow())return;
    // sin pasar por casa
    S.outDay=S.day;s.use=null;s.target=null;s.path=[];s.leaving=false;s.outing=null;s.work=OUT[k].dur;s.dest=destOf(k);s.route=null;s.awayTotal=s.work;s.outingActive=k;s.think=0;
    S.outManual=!S.outAuto;toast(huecos(TX_encadenar.directo,{e:OUT[k].e,n:CH().name,from:from.toLowerCase(),to:outName(k).toLowerCase()}));return;}
  return _do.apply(this,arguments);};}
// botón «volver a casa» cuando está fuera: cortar lo que esté haciendo
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const s=S.sim;if(awayNow()){const what=s.outingActive?(OUT[s.outingActive]?outName(s.outingActive):s.outingActive==='amigos'?'con amigos':'fuera'):'en el trabajo';const left=Math.round(s.work);return `<div class="sub" style="font-size:12px;margin:0 0 8px">📍 Ahora: ${what.toLowerCase()} · quedan ${left>=60?Math.round(left/60*10)/10+' h':left+' min'} <button class="mini" id="leavenow">🏠 Irse ya</button></div>`+h;}}catch(e){}return h;};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);try{const b=card.querySelector('#leavenow');if(b)b.onclick=()=>{menu.classList.remove('open');if(leaveNow()){cmIrCasa();}};}catch(e){}};}
// el «_vuelta» es solo el trayecto de vuelta
{const _fw=finishWork;finishWork=function(){const s=S.sim;if(s.outingActive==='_vuelta'){s.outingActive=null;s.work=0;s.dest=null;s.route=null;if(s.exit&&walkable(s.exit[0],s.exit[1])){s.x=s.exit[0]+.5;s.y=s.exit[1]+.5;}ensureSimFree();s.think=0;return;}return _fw.apply(this,arguments);};}
// la IA también encadena: del curro al gimnasio si es socia, o a la asamblea si toca
{const _au=autonomy;autonomy=function(){try{const s=S.sim;const h=S.t/60;if(S.autoHome&&awayNow()&&!s.outingActive&&S.lastWorkDay===S.day&&s.work<=35&&S.outDay!==S.day&&Math.random()<.15){const H=typeof HP==='function'?HP():null;const cands=[];if(H&&H.gymMember&&!outAvail('gimnasio'))cands.push('gimnasio');if(S.union&&S.union.member&&!outAvail('sindicato')&&Math.random()<.5)cands.push('sindicato');if(typeof comp==='function'&&comp()>=2&&!outAvail('militancia')&&Math.random()<.4)cands.push('militancia');if(cands.length&&S.needs.energia>30){s.work=0;S.lastWorkDay=S.day;finishWork();doOut(pickR(cands));return;}}}catch(e){}return _au.apply(this,arguments);};}
