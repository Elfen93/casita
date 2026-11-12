// =================== LO COLECTIVO SE NOTA: lo que das vuelve, con nombre y apellidos ===================
const {colectivo:TX_colectivo}=DATA.textos_mods_ag;
const SOL=()=>{if(!S.sol)S.sol={fav:0,seen:0,log:[],owed:0};return S.sol;};
function solAdd(n,why){const s=SOL();s.fav=Math.min(12,s.fav+n);if(why)s.log.push([S.day,why]);if(s.log.length>12)s.log.shift();}
// lo que cuenta: actos de solidaridad (dilemas), asambleas, piquetes, parar desahucios
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const s=SOL();const e=ex().exp.solid||0;if(e>s.seen){solAdd((e-s.seen)*1.5,'se plantó por alguien');s.seen=e;}
  const ch=storyState().chap;if(ch.parado&&!s.parado){s.parado=1;solAdd(3,'paró un desahucio');}if(S.union&&S.union.member&&dateOf(S.day).wd===0)solAdd(.15);if(S.rentStrike&&dateOf(S.day).wd===0)solAdd(.2);
  solBack();}catch(e){console.error(e);}return r;};}
{const _ob=outBack;outBack=function(k){const r=_ob.apply(this,arguments);try{if(['sindicato','militancia','piquete','voluntariado','manifestacion'].includes(k))solAdd(k==='piquete'?.8:k==='voluntariado'?.5:.3);}catch(e){}return r;};}
function solWho(){const ps=(S.people||[]).filter(p=>p.rel>=35&&p.k!=='madre');const v=P_('vecina'),c=P_('compi');const pool=[];if(v&&v.rel>=40)pool.push(v);if(c&&c.rel>=40)pool.push(c);for(const p of ps)if(!pool.includes(p))pool.push(p);return pool.length?pickR(pool.slice(0,4)):null;}
// ---- vuelve: cuando hace falta, alguien aparece ----
function solBack(){const s=SOL();if(s.fav<1)return;const n=CH().name;const o=oa();const nd=S.needs;const G=typeof MG==='function'?MG():{};const who=solWho();const union=S.union&&S.union.member;
  // en números rojos: un préstamo sin intereses
  if(S.money<-50&&!s.loanDay&&who&&s.fav>=1&&Math.random()<.35){const v=Math.round(Math.min(-S.money+40,hrs(40)));bkAdd('Préstamo',v);s.owed+=v;s.loanDay=S.day;s.loanWho=who.n;s.fav-=1;tell(huecos(TX_colectivo.prestamo,{who:who.n,v:fmt(v)}),'🤝');toast(huecos(TX_colectivo.prestamo_toast,{who:who.n,v:fmt(v)}),true);return;}
  // enferm@: alguien trae comida
  if(S.sick&&who&&nd.hambre<45&&Math.random()<.4&&s.fav>=.5){nd.hambre=Math.min(100,nd.hambre+40);nd.social=Math.min(100,nd.social+15);s.fav-=.5;tell(huecos(pickR(TX_colectivo.comida),{who:who.n}),'🤝');return;}
  // en paro: alguien pasa una oferta
  if(S.jobless&&!(S.netBoost>S.day)&&who&&s.fav>=1&&Math.random()<.12){S.netBoost=S.day+14;s.fav-=1;tell(huecos(TX_colectivo.oferta,{who:who.n}),'🤝');return;}
  // desahucio en marcha: el sindicato de vivienda / la abogada
  if(G.wk>=5&&!s.lawyer&&(union||s.fav>=3)){s.lawyer=S.day;G.wk=Math.max(2,G.wk-3);s.fav-=2;tell(union?TX_colectivo.abogada_sindicato:huecos(TX_colectivo.abogada_via,{via:who?who.n:TX_colectivo.abogada_via_barrio}),'⚖️');return;}
  // en la calle: un sofá
  if(typeof homeless==='function'&&homeless()&&who&&s.fav>=2&&!s.sofa&&Math.random()<.2){s.sofa=S.day;s.fav-=2;applyHome('habitacion');computeRooms();S.rentMul=0;S.sofaUntil=S.day+45;if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);if(G.calle)G.calle=null;chapter('sofa',huecos(TX_colectivo.sofa_cap,{who:who.n}),huecos(TX_colectivo.sofa_txt,{who:who.n}));toast(huecos(TX_colectivo.sofa_toast,{who:who.n}),true);return;}
  // multa o policía: alguien graba, alguien testifica
  if(S.jail>0&&!s.jailed&&(union||s.fav>=2)){s.jailed=S.day;s.fav-=1;S.jail=Math.max(0,S.jail-Math.min(S.jail,2));tell(union?TX_colectivo.comisaria_sindicato:TX_colectivo.comisaria_video,'✊');return;}
  // caja de resistencia en huelga
  if(S.strike&&S.strike.on&&S.strike.join&&dateOf(S.day).wd===0&&s.fav>=1){const v=hrs(12);bkAdd('Ayuda',v);s.fav-=.3;toast(huecos(TX_colectivo.caja,{v:fmt(v)}));return;}}
// devolver lo prestado cuando se puede
{const _dl2=dailyEvents;dailyEvents=function(){const r=_dl2.apply(this,arguments);try{const s=SOL();if(s.owed>0&&S.money>s.owed+hrs(30)&&Math.random()<.3){bkAdd('Cuota',-s.owed);tell(huecos(TX_colectivo.devuelve,{quien:s.loanWho||TX_colectivo.devuelve_quien,v:fmt(s.owed)}),'🤝');s.owed=0;s.loanDay=null;solAdd(.5);}
  if(S.sofaUntil&&S.day>=S.sofaUntil){S.sofaUntil=null;S.rentMul=1;tell(huecos(TX_colectivo.sofa_fin,{}),'🔑');}}catch(e){}return r;};}
// el barrio organizado también se nota en lo pequeño
{const _pr=payRent;payRent=function(){if(S.sofaUntil&&S.day<S.sofaUntil)return;return _pr.apply(this,arguments);};}
// ---- UI ----
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const s=SOL();let x=`<h3>${TX_colectivo.red_titulo}</h3><div class="sub" style="font-size:12px">${s.fav>=3?TX_colectivo.red_mucho:s.fav>=1?TX_colectivo.red_algo:TX_colectivo.red_nada}${s.owed?huecos(TX_colectivo.red_debe,{v:fmt(s.owed),quien:s.loanWho||TX_colectivo.red_debe_alguien}):''}</div>`;if(s.log.length)x+=`<div class="sub" style="font-size:11.5px">${s.log.slice(-3).map(l=>l[1]).join(' · ')}</div>`;return x+h;}catch(e){return h;}};}
