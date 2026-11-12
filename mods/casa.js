// =================== LA CASA COBRA VIDA: actividades por objeto, progreso, calidad y colecciones ===================
const COL=()=>{if(!S.col)S.col={rec:[],lib:{},libDone:[],can:[],arte:[],cur:{},curDone:[],plat:0};const c=S.col;c.rec=c.rec||[];c.lib=c.lib||{};c.libDone=c.libDone||[];c.can=c.can||[];c.arte=c.arte||[];c.cur=c.cur||{};c.curDone=c.curDone||[];return c;};
const RECIPES=DATA.libros.recetas;
const BOOKS=[]; // los llena mods/libros.js con DATA.libros.en_casa
const COURSES=DATA.libros.cursos;
const SONGW=DATA.libros.canciones;
const ARTW=DATA.libros.prendas;
const Q=['💩','🙂','😋','🤩'],QN=['un desastre','normal','muy bueno','espectacular'];
function qRoll(sk,bonus=0){const l=sk?lvl(sk):3,r=Math.random()+bonus;const v=l*.28+r*1.6-.4;return v<.35?0:v<1.25?1:v<2.4?2:3;}
// [clave, emoji, nombre, minutos, habilidad, nivel mínimo, coste, ritmo de necesidades por minuto, final()]
const ACTV=DATA.objetos.actividades;
const ACT_DEF=(t,k)=>(ACTV[t]||[]).find(a=>a[0]===k);
const actLocked=a=>a[5]&&a[4]&&lvl(a[4])<a[5];
function curBook(){const C=COL();for(const [n,len] of BOOKS)if(!C.libDone.includes(n))return [n,len];return null;}
function curCourse(){const C=COL();for(const c of COURSES)if(!C.curDone.includes(c[0]))return c;return null;}
function homeMates(){return (S.res||[]).filter(r=>r.kind!=='kid').map(r=>(S.people||[]).find(p=>p.k===r.pid)).filter(Boolean);}
function actFinish(u,frac){const a=ACT_DEF(u.type,u.act);if(!a)return;const C=COL(),n=CH().name,o=oa(),x=u.i%N+.5,y=(u.i/N|0)+.5;const fx=a[8];const half=frac<.6;
  const ft=(t,c='#2e8b57')=>floatText(t,x,y,46,c);
  if(half){if(frac>.15)ft('🤷 a medias','#8a7f99');return;}
  const sk=a[4];if(sk)gainSkill(sk,a[3]*.25);
  switch(fx){
    case 'receta':case 'nueva':{const known=C.rec.length?C.rec:[];let r;
      if(fx==='nueva'){const cand=RECIPES.filter(([nm,lv])=>!known.includes(nm)&&lvl('cocina')>=lv);if(!cand.length){ft('📖 ya se sabe todas las de su nivel');break;}r=pickR(cand);}
      else{const nm=known.length?pickR(known):null;r=(nm&&RECIPES.find(q=>q[0]===nm))||RECIPES[0];}
      const q=qRoll('cocina',fx==='nueva'?-.3:.15);if(fx==='nueva'&&q>=1&&!known.includes(r[0])){known.push(r[0]);C.rec=known;tell(`${n} ha aprendido a hacer ${r[0].toLowerCase()} ${r[2]}. ${q>=2?'Le ha salido de diez a la primera.':'Mejorable, pero ya la tiene.'}`,'📖');}
      else if(fx==='nueva')tell(`${n} intentó ${r[0].toLowerCase()} y fue ${QN[q]}. ${pickR(['Se pidió una pizza.','Lo cenó igual, con dignidad.','El extractor aún lo recuerda.'])}`,'🔥');
      S.needs.hambre=Math.min(100,S.needs.hambre+[10,25,35,45][q]);S.needs.diversion=Math.min(100,S.needs.diversion+[0,5,10,18][q]);ft(`${r[2]} ${Q[q]} ${r[0]}`,q?'#2e8b57':'#c0392b');C.plat++;
      const m=homeMates();if(m.length&&q>=1){for(const p of m){p.rel=Math.min(100,p.rel+q*2);if(p.love!=null&&['pareja','convive','casada','cita','rollo'].includes(p.stage))p.love=Math.min(100,p.love+q);}
        if(throttled('cena'+S.day,8e4))tell(`${n} cocinó ${r[0].toLowerCase()} y comieron juntos con ${m.map(p=>p.n).join(' y ')}. ${q>=3?'Hubo aplausos.':q>=2?'Repitieron todos.':'Nadie se quejó, que ya es mucho.'}`,'🍽️');}
      break;}
    case 'tapers':{const q=qRoll('cocina');S.tapers=(S.tapers||0)+[2,4,5,6][q];ft(`🥡 ×${[2,4,5,6][q]} tápers`);tell(`${n} ha dejado tápers hechos para la semana. Comer fuera del curro cuesta un dineral.`,'🥡');break;}
    case 'sano':S.needs.energia=Math.min(100,S.needs.energia+6);ft('🥗 +energía');break;
    case 'mirar':{const lines=[S.money<50?'Un limón, una cerveza y esperanza.':'Hay cosas. Ninguna apetece.',S.pantry?`Verduras del huerto (${S.pantry}). Orgullo.`:'Mostaza caducada. Clásico.',S.tapers?`${S.tapers} tápers. Previsión.`:'La luz de la nevera ilumina su vida.'];ft('👀 '+pickR(lines),'#6b6e3c');break;}
    case 'libro':{const b=curBook();if(!b){ft('📚 ¡Se ha leído toda la librería!');break;}const prog=(C.lib[b[0]]||0)+a[3]*frac;C.lib[b[0]]=prog;
      if(prog>=b[1]){C.libDone.push(b[0]);delete C.lib[b[0]];gainSkill('logica',30);S.needs.diversion=Math.min(100,S.needs.diversion+20);ft(`📚 ¡Terminado! ${b[0]}`);tell(`${n} ha terminado «${b[0]}». ${pickR(['Le ha dejado pensand'+o+' días.','Lo recomendará a todo el mundo.','El final no le ha gustado nada.','Ahora quiere cambiar el mundo. Más.'])}`,'📚');}
      else ft(`📖 ${Math.round(prog/b[1]*100)}% de «${b[0].slice(0,22)}${b[0].length>22?'…':''}»`,'#3a5a9a');break;}
    case 'curso':{const c=curCourse();if(!c){ft('🎓 Ya tiene todos los cursos');break;}const prog=(C.cur[c[0]]||0)+a[3]*frac;C.cur[c[0]]=prog;gainSkill(c[2],a[3]*.3);
      if(prog>=c[1]){C.curDone.push(c[0]);delete C.cur[c[0]];gainSkill(c[2],40);ft(`🎓 Certificado: ${c[0]}`);tell(`${n} ha sacado el certificado de «${c[0]}». Gratis y a deshoras, que es como estudia la clase trabajadora.`,'🎓');S.rep=Math.min(100,(S.rep??60)+3);}
      else ft(`🎓 ${Math.round(prog/c[1]*100)}% · ${c[0]}`,'#3a5a9a');break;}
    case 'curro':ft('💼 mirando ofertas…','#6b6e3c');setTimeout(()=>{try{openMenu('trabajo');}catch(e){}},400);break;
    case 'cancion':{const q=qRoll('musica');const t=pickR(SONGW);C.can.push({t,q,d:S.day});ft(`🎵 «${t}» ${Q[q]}`,q?'#7d3aa8':'#c0392b');
      tell(q>=3?`${n} ha compuesto «${t}». Esta la cantaría el barrio entero.`:q>=2?`${n} ha compuesto «${t}». Tiene algo. Mucho.`:q>=1?`${n} ha compuesto «${t}». Correcta. Le falta una vuelta.`:`${n} intentó componer «${t}». Mejor no la toquemos en público.`,'🎵');if(q>=2)S.needs.diversion=Math.min(100,S.needs.diversion+15);break;}
    case 'concierto':{const m=homeMates();const q=qRoll('musica',.2);if(!m.length){ft('🎶 para sí mism'+o,'#7d3aa8');break;}for(const p of m)p.rel=Math.min(100,p.rel+1+q);
      const song=C.can.length?C.can.slice().sort((a,b)=>b.q-a.q)[0].t:null;tell(`${n} tocó ${song?'«'+song+'»':'unas canciones'} para ${m.map(p=>p.n).join(' y ')}. ${q>=2?'Hubo coros.':'Aplaudieron por educación.'}`,'🎶');ft('👏 '+Q[q]);break;}
    case 'guapo':S.glow=S.day*1440+S.t+240;ft('✨ hoy se ve guap'+o);break;
    case 'entrevista':S.intPrep=S.day;ft('👔 +confianza para entrevistas');break;
    case 'peli':{const m=homeMates();const pel=pickR(['una de miedo','una comedia romántica','un documental sobre una huelga','un clásico en blanco y negro','una de acción absurda']);if(m.length){for(const p of m){p.rel=Math.min(100,p.rel+3);if(p.love!=null&&['pareja','convive','casada','cita','rollo'].includes(p.stage))p.love=Math.min(100,p.love+3);}tell(`Noche de peli en el sofá con ${m.map(p=>p.n).join(' y ')}: ${pel}. ${pickR(['Manta compartida.','Se durmieron a la mitad.','Discutieron el final una hora.'])}`,'🍿');}ft('🍿 '+pel);break;}
    case 'serie':ft('📺 '+pickR(['«solo un capítulo más»','temporada terminada','spoiler evitado (de milagro)']));break;
    case 'noticias':{try{const nw=phNews();const h0=pickR(nw);ft('🗞️ '+h0[1].slice(0,46)+'…','#2c3a5c');}catch(e){}if(S.ideo!=='apolitica')S.pol.xp=(S.pol.xp||0)+1;break;}
    case 'futbol':ft(pickR(['⚽ ¡Golazo!','⚽ 0-0, qué tostón','⚽ ¡penalti injusto!']));break;
    case 'online':ft('🎧 '+pickR(['victoria épica','les han dado una paliza','un niño de 12 años le ha insultado']));break;
    case 'siesta':ft('😴 siesta reparadora','#3a5a9a');break;
    case 'techo':{const th=[`¿Y si lo deja todo y se va al pueblo?`,`Si cobrara lo que produce, viviría de lujo.`,`¿Cuándo fue la última vez que hizo algo por ${pickR(['ella','él','sí'])==='sí'?'sí mism'+o:'alguien'}?`,`Tiene que llamar a su madre.`,`El techo tiene una mancha con forma de Europa.`];tell(`${n} miró al techo un buen rato. ${pickR(th)}`,'💭');ft('💭');break;}
    case 'cantar':ft('🎤 '+pickR(['«¡Resistiréee!»','falsete de vecino enfadado','dueto con el grifo']),'#7d3aa8');break;
    case 'relax':S.needs.diversion=Math.min(100,S.needs.diversion+10);ft('🫧 relax total');break;
    case 'planta':ft('🌱 '+pickR(['la planta parece más contenta','le ha contado sus penas','dicen que funciona']));break;
    case 'arte':{const q=qRoll(null,.1);const t=pickR(ARTW);C.arte.push({t,q,d:S.day});const pr=[0,8,18,35][q];if(pr){S.money+=pr;ft(`✂️ ${t} ${Q[q]} · vendida +${fmt(pr)}`);tell(`${n} ha hecho ${t.toLowerCase()} y la ha vendido en la app de segunda mano por ${fmt(pr)}.`,'🧵');}else ft(`✂️ ${t} ${Q[q]} (para casa)`);break;}
    case 'bailar':ft('💃 '+pickR(['nadie mira, todo vale','paso nuevo inventado','la vecina de abajo golpea el techo']));break;
    case 'tertulia':{const m=homeMates();if(m.length){for(const p of m)p.rel=Math.min(100,p.rel+3);ft('🗣️ charla con '+m[0].n);}else ft('☕ café en soledad');break;}
    case 'plan':S.needs.diversion=Math.min(100,S.needs.diversion+5);ft('🗺️ semana organizada');break;
  }}
// --- motor: duración, ritmos y final ---
let actBarEl=null;
function actBar(u){if(!actBarEl){actBarEl=document.createElement('div');actBarEl.id='actbar';document.body.appendChild(actBarEl);}
  if(!u||!u.act||!u.actDur){actBarEl.classList.remove('on');return;}const a=ACT_DEF(u.type,u.act);if(!a){actBarEl.classList.remove('on');return;}
  const p=Math.min(1,(u.actT||0)/u.actDur);actBarEl.classList.add('on');actBarEl.innerHTML=`<span>${a[1]}</span><b>${a[2]}</b><i style="width:${Math.round(p*100)}%"></i>`;}
{const _su2=startUse;startUse=function(){const s=S.sim;const want=s.nextAct;s.nextAct=null;const r=_su2.apply(this,arguments);const u=s.use;
  try{if(u&&ACTV[u.type]){let k=want;
    if(!k&&!u.cmd&&Math.random()<.4){const opts=ACTV[u.type].filter(a=>!actLocked(a)&&a[3]>0&&(!a[6]||S.money>reserveMoney()+50)&&a[8]!=='curro'&&(a[8]||Object.keys(a[7]).length));if(opts.length)k=pickR(opts)[0];}
    const a=k&&ACT_DEF(u.type,k);if(a&&a[3]>0&&!actLocked(a)){if(a[6]){const c=Math.round(a[6]*PM());S.money-=c;floatText('-'+fmt(c),u.i%N+.5,(u.i/N|0)+.5,40,'#c0392b');}
      u.act=k;u.actT=0;u.actDur=a[3];if(!bedUse(u))u.goal='diversion';
      if(a[0]==='siesta'&&bedUse(u))u.nap=true;
      if(u.cmd||Math.random()<.5)popBubble(a[1]);}}}catch(e){console.error(e);}
  return r;};}
{const _up3=update;update=function(gm){const s=S.sim,u0=s.use;const had=u0&&u0.act&&u0.actDur;
  if(had){u0.actT=(u0.actT||0)+gm;const a=ACT_DEF(u0.type,u0.act);if(a){for(const k in a[7])S.needs[k]=Math.max(0,Math.min(100,S.needs[k]+a[7][k]*gm));}
    if(u0.actT>=u0.actDur){u0.done1=true;try{actFinish(u0,1);}catch(e){console.error(e);}
      // la comida no termina hasta llenar el estómago; lo demás, sí
      if(!(['fogon','encimera','nevera'].includes(u0.type)&&S.needs.hambre<70)){if(SHOWERS.has(u0.type))S.needs.higiene=Math.max(S.needs.higiene,u0.act==='rapida'?85:100);s.use=null;s.cmd=false;s.think=0;}else{u0.act=null;u0.goal='hambre';}}
    else if(Math.random()<gm*.012&&a)popBubble(a[1]);}
  const r=_up3.apply(this,arguments);
  if(had&&!u0.done1&&s.use===null&&!(s.path&&s.path.length)&&s.target==null&&!s.leaving&&!(s.work>0)&&S.obj[u0.i]&&S.obj[u0.i].t===u0.type&&usable(S.obj[u0.i])&&!['vejiga','hambre','energia'].some(n=>S.needs[n]<15)){s.use=u0;}// «ya está lleno» no corta una actividad a medias
  else if(had&&!u0.done1&&s.use!==u0){try{actFinish(u0,(u0.actT||0)/u0.actDur);}catch(e){console.error(e);}}
  if(performance.now()-(actBar.t||0)>250){actBar.t=performance.now();actBar(s.use);}
  return r;};}
{const _rc=runCmd;runCmd=function(c){if(c&&c.k==='obj'&&c.act)S.sim.nextAct=c.act;return _rc.apply(this,arguments);};}
{const _cl=cmdLabel;cmdLabel=function(c){if(c&&c.k==='obj'&&c.act){const o=S.obj[c.i];const a=o&&ACT_DEF(o.t,c.act);if(a)return a[1]+' '+a[2];}return _cl(c);};}
// --- menú al tocar un objeto ---
let lastPtr=[innerWidth/2,innerHeight/2];addEventListener('pointerdown',e=>{lastPtr=[e.clientX,e.clientY];},true);
let objMenuEl=null;function closeObjMenu(){if(objMenuEl)objMenuEl.classList.remove('on');}
function openObjMenu(i){const o=S.obj[i];const d=OBJ[o.t];const L=ACTV[o.t];if(!objMenuEl){objMenuEl=document.createElement('div');objMenuEl.id='objmenu';document.body.appendChild(objMenuEl);addEventListener('pointerdown',e=>{if(objMenuEl.classList.contains('on')&&!objMenuEl.contains(e.target))closeObjMenu();},true);}
  const C=COL();const extra=k=>{if(k==='leer'){const b=curBook();return b?`${b[0].slice(0,26)} · ${Math.round((C.lib[b[0]]||0)/b[1]*100)}%`:'librería terminada';}if(k==='curso'){const c=curCourse();return c?`${c[0]} · ${Math.round((C.cur[c[0]]||0)/c[1]*100)}%`:'todos hechos';}if(k==='receta')return C.rec.length?`${C.rec.length} receta${C.rec.length>1?'s':''} sabida${C.rec.length>1?'s':''}`:'aún no sabe recetas: improvisa';if(k==='nueva'){const n=RECIPES.filter(([nm,lv])=>!C.rec.includes(nm)&&lvl('cocina')>=lv).length;return n?`${n} a su alcance`:'sube cocina para más';}if(k==='componer')return `${C.can.length} canciones`;return '';};
  let h=`<div class="omt">${d.e||'🌿'} ${d.n}</div>`;
  for(const a of L){const lock=actLocked(a);const sk=a[4]&&SKILLS.find(q=>q[0]===a[4]);const ex=extra(a[0]);
    h+=`<button class="oma${lock?' lock':''}" data-oa="${a[0]}"><span>${a[1]}</span><span class="omn"><b>${a[2]}</b><small>${lock?`🔒 ${sk?sk[2]:''} ${a[5]}`:[a[3]?a[3]+' min':'',a[6]?fmt(Math.round(a[6]*PM())):'',ex].filter(Boolean).join(' · ')}</small></span></button>`;}
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');
  const W=objMenuEl.offsetWidth||230,H=objMenuEl.offsetHeight||200;let [x,y]=lastPtr;x=Math.max(8,Math.min(innerWidth-W-8,x-W/2));y=y+14+H>innerHeight-130?Math.max(60,y-H-14):y+14;objMenuEl.style.left=x+'px';objMenuEl.style.top=y+'px';
  objMenuEl.querySelectorAll('[data-oa]').forEach(b=>b.onclick=()=>{const a=ACT_DEF(o.t,b.dataset.oa);if(actLocked(a)){const sk=SKILLS.find(q=>q[0]===a[4]);toast(`🔒 Hace falta ${sk?sk[2]:''} ${a[5]} (tiene ${lvl(a[4])})`);sfx('bad');return;}closeObjMenu();enqueue({k:'obj',i,act:a[3]>0?a[0]:null});});}
{const _lt=liveTap;liveTap=function(x,y){try{if(!viewPlace&&inb(x,y)&&!(S.sim.work>0)){const ii=idx(x,y),o=S.obj[ii];if(o&&OBJ[o.t]&&OBJ[o.t].need&&usable(o)&&ACTV[o.t]){openObjMenu(ii);sfx('tap');return;}}}catch(e){console.error(e);}return _lt.apply(this,arguments);};}
// --- tápers: comer en el curro sin gastar ---
{const _gw=goWork;goWork=function(){const r=_gw.apply(this,arguments);try{if(S.tapers>0&&S.sim.work>0&&S.lastTaper!==S.day){S.lastTaper=S.day;S.tapers--;S.needs.hambre=Math.min(100,S.needs.hambre+15);}}catch(e){}return r;};}
// --- colección en el perfil ---
{const _om2=openMenu;openMenu=function(...a){const r=_om2.apply(this,a);try{if(menuTab==='perfil'){const C=COL();const btn=card.querySelector('#editchar');if(btn&&!card.querySelector('#colbox')){const box=document.createElement('div');box.id='colbox';
  const lst=(arr,f)=>arr.length?arr.map(f).join(''):'<span class="sub" style="font-size:11.5px">Nada todavía.</span>';
  box.innerHTML=`<h3>🏆 Lo que ha hecho en casa</h3><div class="colg"><div><b>📖 Recetas (${C.rec.length}/${RECIPES.length})</b>${lst(C.rec,n=>{const r=RECIPES.find(q=>q[0]===n)||['', '', '🍽️'];return `<span class="chipc">${r[2]} ${n}</span>`;})}</div>
  <div><b>📚 Libros (${C.libDone.length}/${BOOKS.length})</b>${lst(C.libDone,n=>`<span class="chipc">${(BOOKS.find(b=>b[0]===n)||[0,0,'📕'])[2]} ${n}</span>`)}</div>
  <div><b>🎵 Canciones (${C.can.length})</b>${lst(C.can.slice(-8),s=>`<span class="chipc">${Q[s.q]} «${s.t}»</span>`)}</div>
  <div><b>🎓 Cursos (${C.curDone.length}/${COURSES.length})</b>${lst(C.curDone,n=>`<span class="chipc">🎓 ${n}</span>`)}</div>
  <div><b>✂️ Hecho a mano (${C.arte.length})</b>${lst(C.arte.slice(-6),s=>`<span class="chipc">${Q[s.q]} ${s.t}</span>`)}</div>
  <div class="sub" style="font-size:11.5px">🍳 Platos cocinados: ${C.plat||0}${S.tapers?` · 🥡 Tápers en la nevera: ${S.tapers}`:''}</div></div>`;btn.before(box);}}}catch(e){console.error(e);}return r;};}
