// =================== MI SEMANA: un horario como el de la vida real, y Ana lo cumple (si la vida la deja) ===================
const AG=()=>{if(!S.ag)S.ag={plan:{},done:{},on:true};S.ag.plan=S.ag.plan||{};S.ag.done=S.ag.done||{};return S.ag;};
const AG_SLOTS=[[7,'7:00'],[9,'9:00'],[11,'11:00'],[13,'13:00'],[15,'15:00'],[17,'17:00'],[18.5,'18:30'],[20,'20:00'],[21.5,'21:30']];
// qué se puede planear: salidas y cosas de casa (estas necesitan el mueble)
const AG_ITEMS=[
  ['gimnasio','🏋️','Gimnasio','out'],['calistenia','🤸','Barras del parque','out'],['deporte','🏃','Salir a correr','out'],['sindicato','✊','Asamblea sindical','out'],['militancia','🏴','Reunión política','out'],['clase','🎓','Ir a clase','out'],['biblioteca','📚','Biblioteca','out'],['amigos','🍻','Quedar con amigos','out'],['terapia','🧠','Terapia','out'],['voluntariado','🤲','Voluntariado','out'],['misa','⛪','Misa y vermú','out'],['libreria','📖','Librería','out'],['mercadillo','📦','Mercadillo','out'],['networking','🥂','Afterwork','out'],
  ['estudiar','📝','Estudiar en casa','home',['escritorio','libros','compu'],'estudiar'],['escribir','✍️','Escribir','home',['escritorio','compu'],'escribir'],['pintar','🎨','Pintar','home',['caballete'],'pintar'],['leer','📖','Leer','home',['estant','libros','butaca','sofa'],'leer'],['tapers','🥡','Tápers para la semana','home',['fogon'],'tapers'],['limpiar','🧽','Limpiar','home',['fogon','vater','nevera'],'limpiar'],['curso','🎓','Curso online','home',['compu','escritorio'],'curso'],['practicar','🎸','Practicar música','home',['guitarra','piano'],'practicar'],['madre','☎️','Llamar a su madre','home',['telefono'],'madre'],['siesta','😴','Siesta','home',['cama','camamat','sofa'],'siesta'],['peli','🍿','Peli','home',['sofa'],'peli'],['huerto','🥕','Cuidar el huerto','home',['huerto'],'cuidar'],['cuento','🧒','Rato con los críos','kid'],['nada','🛋️','Libre','free']];
const agItem=k=>AG_ITEMS.find(x=>x[0]===k);
function agAvail(it){if(it[3]==='out')return !!OUT[it[0]]&&!(OUT[it[0]].req&&!OUT[it[0]].req());if(it[3]==='home')return findObjs((d,t)=>it[4].includes(t)&&ACTV[t]&&ACTV[t].some(a=>a[0]===it[5])).length>0;if(it[3]==='kid')return (S.kids||[]).length>0;return true;}
// ---- ejecutar ----
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const A=AG();if(!A.on)return r;const h=S.t/60;const wd=dateOf(S.day).wd;const s=S.sim;
    for(let si=0;si<AG_SLOTS.length;si++){const [st,lab]=AG_SLOTS[si];const key=wd+':'+st;const k=A.plan[key];if(!k||k==='nada')continue;const nx=si+1<AG_SLOTS.length?AG_SLOTS[si+1][0]:24;if(h<st||h>=nx)continue;const dk=S.day+':'+st;if(A.done[dk])continue;
      const it=agItem(k);if(!it)continue;
      if(it[3]==='out'){if(s.work>0&&!s.outingActive)continue;/* en el trabajo: no se va a mitad por la agenda */const why=outAvail(k);if(why){if(h>=nx-.1){A.done[dk]=1;if(throttled('ag'+k,6e5))toast(`🗓️ ${it[2]}: ${why}`);}continue;}A.done[dk]=1;if(s.outingActive==='clase'){try{const C=ED().cur;if(C){C.miss=(C.miss||0)+1;tell(`${CH().name} se ha ido de clase a ${outName(k).toLowerCase()}. Lo tenía en el horario.`,'🎓');}}catch(e){}}doOut(k);toast(`🗓️ ${it[1]} ${it[2]}`);}
      else if(it[3]==='home'){if(s.work>0)continue;const objs=findObjs((d,t)=>it[4].includes(t)&&ACTV[t]&&ACTV[t].some(a=>a[0]===it[5])).filter(i=>usable(S.obj[i]));if(!objs.length){A.done[dk]=1;continue;}
        if(['hambre','vejiga'].some(n=>S.needs[n]<15))continue;A.done[dk]=1;s.use=null;s.path=[];s.target=null;s.cmd=false;s.queue=[];enqueue({k:'obj',i:objs[0],act:it[5]});toast(`🗓️ ${it[1]} ${it[2]}`);}
      else if(it[3]==='kid'){if(s.work>0)continue;const rr=(S.res||[]).find(x=>x.kind==='kid'&&!x.away);if(!rr){A.done[dk]=1;continue;}A.done[dk]=1;S.kidAct={r:rr.kid,k:'jugar',m:30,t:0};const cx=Math.floor(rr.x),cy=Math.floor(rr.y);const [sx,sy]=simCell();const p=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(p){s.path=p;s.target=null;s.use=null;s.cmd=true;}toast(`🗓️ ${it[1]} ${it[2]}`);}}
    // limpiar lo viejo
    if(h<.1)for(const dk in A.done)if(+dk.split(':')[0]<S.day-1)delete A.done[dk];}catch(e){console.error(e);}return r;};}
// ---- UI: pestaña dentro de Vida ----
let agEl=null;function closeAg(){if(agEl)agEl.classList.remove('on');}
function openAg(wd){const A=AG();if(wd==null)wd=A.wd??dateOf(S.day).wd;A.wd=wd;if(!agEl){agEl=document.createElement('div');agEl.id='agenda';document.body.appendChild(agEl);}
  const T0=TR();const work=!S.jobless&&T0.days.includes(wd);const sh=T0.sh;
  let h=`<div class="omt">📅 Mi semana <label style="float:right;font-weight:400;font-size:12px"><input type="checkbox" id="agon" ${A.on?'checked':''}> seguirla</label></div><div class="agdays">${WDS.map((d,i)=>`<button class="${i===wd?'on':''}" data-wd="${i}">${d}${Object.keys(A.plan).some(k=>k.startsWith(i+':')&&A.plan[k]!=='nada')?' •':''}</button>`).join('')}</div>`;
  if(work)h+=`<div class="sub" style="font-size:11px;padding:0 8px 4px">Cada cosa empieza en cuanto se puede dentro de su franja (una asamblea a las 18:00 cabe en la franja de las 17:00).</div><div class="sub" style="font-size:11.5px;padding:2px 8px 6px">💼 Trabajo de ${sh[0]}:00 a ${sh[1]}:00${typeof ED==='function'&&ED().cur&&EDU_PROGS[ED().cur.k].days.includes(wd)?' · 🎓 clase de '+EDU_PROGS[ED().cur.k].sched[0]+' a '+EDU_PROGS[ED().cur.k].sched[1]:''}</div>`;
  const items=AG_ITEMS.filter(agAvail);
  for(const [st,lab] of AG_SLOTS){const key=wd+':'+st;const cur=A.plan[key]||'nada';const Ecur=typeof ED==='function'&&ED().cur;const Ep=Ecur&&EDU_PROGS[Ecur.k];const inClass=Ep&&Ep.days.includes(wd)&&st>=Ep.sched[0]-.5&&st<Ep.sched[1];const inWork=work&&st>=sh[0]-1&&st<sh[1];
    h+=`<div class="agrow${inWork?' dim':''}"><span class="agt">${lab}</span>${inWork?'<span class="sub" style="font-size:11.5px">trabajo</span>':`${inClass?'<span class="sub" style="font-size:11px">🎓 clase · </span>':''}<select data-key="${key}">${items.map(it=>`<option value="${it[0]}" ${it[0]===cur?'selected':''}>${it[1]} ${it[2]}</option>`).join('')}</select>`}</div>`;}
  h+=`<div style="display:flex;gap:6px;padding:8px 6px 2px;flex-wrap:wrap"><button class="btn grey" id="agcopy">Copiar a todos los días laborables</button><button class="btn grey" id="agclear">Vaciar el día</button><button class="btn" id="agclose">Listo</button></div>`;
  agEl.innerHTML=h;agEl.classList.add('on');
  agEl.querySelectorAll('[data-wd]').forEach(b=>b.onclick=()=>openAg(+b.dataset.wd));
  agEl.querySelectorAll('select').forEach(s=>s.onchange=()=>{A.plan[s.dataset.key]=s.value;});
  agEl.querySelector('#agon').onchange=e=>{A.on=e.target.checked;};
  agEl.querySelector('#agcopy').onclick=()=>{for(let d=0;d<7;d++){if(d===wd||!T0.days.includes(d)===!T0.days.includes(wd)){for(const [st] of AG_SLOTS)A.plan[d+':'+st]=A.plan[wd+':'+st]||'nada';}}toast('📅 Copiado');openAg(wd);};
  agEl.querySelector('#agclear').onclick=()=>{for(const [st] of AG_SLOTS)delete A.plan[wd+':'+st];openAg(wd);};
  agEl.querySelector('#agclose').onclick=closeAg;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const A=AG();const wd=dateOf(S.day).wd;const today=AG_SLOTS.map(([st,lab])=>[lab,A.plan[wd+':'+st]]).filter(x=>x[1]&&x[1]!=='nada').map(([lab,k])=>{const it=agItem(k);return it?lab+' '+it[1]:'';}).filter(Boolean);
    return `<h3>📅 Mi semana</h3><div class="sub" style="font-size:12px">${today.length?'Hoy: '+today.join(' · '):'Hoy no hay nada planeado.'}${A.on?'':' · <b>en pausa</b>'}</div><button class="btn grey" id="agopen">📅 Montar el horario</button>`+h;}catch(e){return h;}};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);try{const b=card.querySelector('#agopen');if(b)b.onclick=()=>{menu.classList.remove('open');openAg();};}catch(e){}};}
