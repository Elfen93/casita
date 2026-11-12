// =================== COMER DE VERDAD: despensa, tres comidas, el descanso del curro, y lo que come se nota en el cuerpo ===================
const {comidas:TX_comidas}=DATA.textos_mods_ag;
const CM=()=>{if(!S.cm)S.cm={desp:6,nut:60,today:{},log:[],compra:0,spent:0};const c=S.cm;c.today=c.today||{};c.log=c.log||[];return c;};
const MEAL_Q=TX_comidas.calidad;
const mealSlot=()=>{const h=S.t/60;return h<11?'des':h<17?'com':'cen';};
const MEAL_N=TX_comidas.nombres;
function cmMeal(kind,q,note){const c=CM();const sl=mealSlot();c.today[sl]={k:kind,q,n:note||kind};c.log.push([S.day,sl,q]);if(c.log.length>60)c.log.shift();}
// ---- despensa: la compra semanal ----
const compraCost=()=>Math.round((typeof govFood==='function'?govFood():1)*hrs(7)*(1+(S.kids||[]).length*.35)*(liveIn()?1.4:1));
function hacerCompra(auto){const c=CM();const cost=compraCost();if(S.money<cost*.5){if(!auto)toast(TX_comidas.compra_no);return false;}const pay=Math.min(cost,Math.max(0,S.money));const units=Math.round(14*pay/cost);S.money-=pay;c.desp=Math.min(30,c.desp+units);c.compra=S.day;c.spent+=pay;bumpMoney();
  const n=CH().name;if(pay<cost)tell(huecos(TX_comidas.compra_media,{v:fmt(pay)}),'🛒');else if(Math.random()<.3)tell(huecos(pickR(TX_comidas.compra_semana),{v:fmt(pay)}),'🛒');else toast(huecos(TX_comidas.compra_toast,{v:fmt(pay),k:c.desp}));return true;}
{const _oc=outCost;outCost=function(k){if(k==='compra')return compraCost();return _oc.apply(this,arguments);};}
{const _ob=outBack;outBack=function(k){if(k==='compra'){hacerCompra(false);return;}
  const r=_ob.apply(this,arguments);try{if(k==='comedor')cmMeal('comedor',.7,TX_comidas.notas.comedor);if(k==='amigos')cmMeal('amigos',.5,TX_comidas.notas.amigos);}catch(e){}return r;};}
// en casa de la madre, la despensa es de la madre (y la llena ella)
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const c=CM();const T=S.home&&S.home.type;
    if(T==='padres'){c.desp=Math.max(c.desp,8);}
    else if(T==='calle'){c.desp=0;}
    else if(S.autoHome&&c.desp<=3&&S.money>compraCost()*.4&&dateOf(S.day).wd!==0&&!(S.sim.work>0)){hacerCompra(true);}
    // nutrición: lo que ha comido hoy
    const t=c.today;const meals=['des','com','cen'].map(k=>t[k]).filter(Boolean);const q=meals.reduce((a,m)=>a+m.q,0);const avg=meals.length?q/meals.length:0;const dayScore=Math.min(100,Math.round(avg*100*(meals.length>=3?1:meals.length===2?.9:meals.length===1?.6:0)));
    c.nut=Math.round(c.nut*.85+dayScore*.15);c.lastDay={...t};c.today={};
    // efectos: comer mal cansa, enferma y, con meses, anemia
    const H=typeof HP==='function'?HP():null;if(c.nut<45){S.needs.energia=Math.max(0,S.needs.energia-(c.nut<35?4:2));if(H&&c.nut<35&&!H.list.some(x=>x.k==='anemia')&&Math.random()<.012)H.list.push({k:'anemia',sev:1,since:S.day,dx:false});if(Math.random()<.02&&!S.sick){S.sick=1;tell(huecos(TX_comidas.estomago,{}),'🤒');}}
    else if(c.nut>=70){S.needs.energia=Math.min(100,S.needs.energia+2);S.fit=Math.min(100,(S.fit||0)+.3);}
  }catch(e){console.error(e);}return r;};}
// ---- cocinar gasta despensa y no cobra «por uso»; sin despensa, se come peor ----
{const _su=startUse;startUse=function(){const m0=S.money;const r=_su.apply(this,arguments);try{const u=S.sim.use;if(!u)return r;const c=CM();if(['fogon','nevera','encimera','micro','barbacoa'].includes(u.type)&&(u.goal==='hambre'||u.act)){const d=m0-S.money;
      if(c.desp>0){if(d>0&&d<hrs(3)){S.money+=d;}const use=u.type==='fogon'?(u.act==='tapers'?3:1):u.type==='micro'?0:u.type==='barbacoa'?2:.5;c.desp=Math.max(0,c.desp-use);u.desp=true;}
      else{u.desp=false;if(S.home&&S.home.type!=='calle'&&throttled('sinnevera',4e5))toast(huecos(TX_comidas.nevera_vacia,{}));}}}catch(e){}return r;};}
{const _af=actFinish;actFinish=function(u,frac){const r=_af.apply(this,arguments);try{if(frac<.6)return r;const a=ACT_DEF(u.type,u.act);const k=a&&(a[8]||a[0]);const q=MEAL_Q[k];if(q!=null&&['fogon','nevera','encimera','micro','barbacoa','parrilla'].includes(u.type)){const qq=u.desp===false&&q>.5?.4:q;cmMeal(k,qq,a[2]);}}catch(e){}return r;};}
// comer «por necesidad» sin acción (la IA va a la nevera/fogón sola): también cuenta
{const _up=update;update=function(gm){const u0=S.sim.use;const r=_up.apply(this,arguments);try{if(u0&&!S.sim.use&&!u0.act&&u0.goal==='hambre'&&['fogon','nevera','encimera','micro'].includes(u0.type)){const q=u0.type==='fogon'?(u0.desp===false?.4:(u0.home?.9:.7)):u0.type==='micro'?.75:u0.type==='encimera'?.5:.35;cmMeal(u0.type,q,u0.type==='fogon'?TX_comidas.notas.cocinado:TX_comidas.notas.picoteo);}}catch(e){}return r;};}
// comer fuera (bar) y la comida de camino
{const _fw=finishWork;finishWork=function(){const s=S.sim;const k=s.outingActive;const r=_fw.apply(this,arguments);try{if(k==='eat')cmMeal('bar',.7,TX_comidas.notas.bar);}catch(e){}return r;};}
// ---- el descanso del curro: siempre come algo. Táper, menú o máquina ----
{const _up2=update;update=function(gm){const r=_up2.apply(this,arguments);try{const s=S.sim;if(!(s.work>0)||s.outingActive||S.lastWorkDay!==S.day||s.lunch===S.day)return r;const h=S.t/60;const mid=(SHIFT.start+SHIFT.end)/2;const len=SHIFT.end-SHIFT.start;if(len<5||h<mid-.3)return r;s.lunch=S.day;const n=CH().name;const c=CM();
    if(S.tapers>0){S.tapers--;S.needs.hambre=Math.min(100,S.needs.hambre+45);cmMeal('taper',.8,TX_comidas.notas.taper);if(Math.random()<.15)tell(huecos(pickR(TX_comidas.descanso_taper),{}),'🥡');}
    else{const menu=hrs(1.3),maq=hrs(.35);const T0=TR();const rancho=['hosteleria','cuidados'].includes(S.track);
      if(rancho){S.needs.hambre=Math.min(100,S.needs.hambre+40);cmMeal('rancho',.55,TX_comidas.notas.rancho);if(Math.random()<.1)tell(TX_comidas.descanso_personal,'🍽️');}
      else if(S.money>=menu*3||(S.money>=menu&&Math.random()<.5)){bkAdd('Menú',-menu);S.needs.hambre=Math.min(100,S.needs.hambre+50);S.needs.social=Math.min(100,S.needs.social+6);cmMeal('menu',.7,TX_comidas.notas.menu);c.spent+=menu;if(Math.random()<.1)tell(huecos(TX_comidas.descanso_menu,{con:P_('compi')?P_('compi').n:TX_comidas.descanso_menu_gente,v:fmt(menu)}),'🍽️');}
      else if(S.money>=maq){bkAdd('Menú',-maq);S.needs.hambre=Math.min(100,S.needs.hambre+28);cmMeal('maquina',.3,TX_comidas.notas.maquina);if(Math.random()<.2)tell(huecos(TX_comidas.descanso_maquina,{v:fmt(maq)}),'🥪');}
      else{S.needs.hambre=Math.min(100,S.needs.hambre+10);cmMeal('maquina',.15,TX_comidas.notas.nada);tell(huecos(TX_comidas.descanso_nada,{v:fmt(Math.round(S.money))}),'☕');}}
    S.needs.energia=Math.min(100,S.needs.energia+4);}catch(e){}return r;};}
// el viejo «come fuera si hambre<35» ya no hace falta en el trabajo
{const _dp=depart;depart=function(){const r=_dp.apply(this,arguments);try{const s=S.sim;if(s.work>0&&!s.outingActive){s.ateAtWork=true;const c=CM();if(!c.today.des&&S.t/60<11){const T=S.home&&S.home.type;if(T==='padres'){cmMeal('casa_madre',.8,TX_comidas.notas.madre);S.needs.hambre=Math.min(100,S.needs.hambre+22);}else if(c.desp>0||T==='habitacion'){cmMeal('cafe',.5,TX_comidas.notas.tostada);S.needs.hambre=Math.min(100,S.needs.hambre+15);c.desp=Math.max(0,c.desp-.3);}else if(S.money>hrs(.4)){S.money-=hrs(.4);cmMeal('cafe',.4,TX_comidas.notas.cafe_bar);S.needs.hambre=Math.min(100,S.needs.hambre+10);}}}}catch(e){}return r;};}
// ---- la IA: tres comidas al día a sus horas, cocinando si hay con qué ----
{const _au=autonomy;autonomy=function(){try{const s=S.sim;const c=CM();const h=S.t/60;if(S.autoHome&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&!s.leaving){const sl=mealSlot();const win={des:[7.5,10.5],com:[13,16],cen:[19,23]}[sl];if(h>=win[0]&&h<win[1]&&!c.today[sl]&&S.needs.hambre<85&&Math.random()<.25){
      const F=(t,act)=>{const L=findObjs((d,tt)=>tt===t).filter(i=>usable(S.obj[i]));return L.length?{i:L[0],act}:null;};
      let pick=null;if(sl==='des')pick=F('cafetera','cafe')||F('encimera','bocata')||F('nevera','picar');
      else{if(c.desp>0&&lvl('cocina')>=1&&Math.random()<.7)pick=F('fogon','receta');if(!pick&&S.tapers>0)pick=F('micro','taper');if(!pick&&c.desp>0)pick=F('encimera','ensalada')||F('fogon','rapido');if(!pick)pick=F('encimera','bocata')||F('nevera','picar');
        if(!pick&&S.money>hrs(1.5)&&!outAvail('eat')&&Math.random()<.5){doOut('eat');return;}}
      if(pick){enqueue({k:'obj',i:pick.i,act:pick.act});return;}}}}catch(e){}return _au.apply(this,arguments);};}
// ---- UI ----
function cmBlock(){const c=CM();const t=c.today;const row=['des','com','cen'].map(k=>`${MEAL_N[k]} ${t[k]?'✓ <small>'+t[k].n+'</small>':'–'}`).join(' · ');const col=c.nut>=70?'#2e8b57':c.nut>=40?'#e9a23b':'#c0392b';const T=S.home&&S.home.type;
  const U=TX_comidas.ui;return `<h3>${U.titulo}</h3><div class="minibars"><i style="width:${c.nut}%;background:${col}"></i></div><div class="sub" style="font-size:12px"><b>${huecos(U.nutricion,{v:c.nut})}</b> · ${c.nut>=70?U.bien:c.nut>=40?U.rapido:U.mal}</div><div class="sub" style="font-size:12px">${huecos(U.hoy,{row})}</div><div class="sub" style="font-size:12px">${huecos(U.despensa,{x:T==='padres'?U.madre:T==='calle'?U.calle:huecos(U.comidas,{k:Math.round(c.desp)})})}${S.tapers?huecos(U.tapers,{k:S.tapers}):''}${c.compra?huecos(U.compra,{k:S.day-c.compra}):''}</div>${T!=='padres'&&T!=='calle'?`<button class="btn grey" id="cmcompra">${huecos(U.boton,{v:fmt(compraCost())})}</button>`:''}`;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return h.replace(`<h3>${TXHZ.salud.cuerpo}</h3>`,cmBlock()+`<h3>${TXHZ.salud.cuerpo}</h3>`);}catch(e){return h;}};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);try{const b=card.querySelector('#cmcompra');if(b)b.onclick=()=>{if(outAvail('compra')){toast(huecos(TX_comidas.compra_aviso,{t:outAvail('compra')}));return;}menu.classList.remove('open');doOut('compra');};}catch(e){}};}
