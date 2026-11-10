// ---------- pantalla de calendario ----------
let calView=null;
function openCalendar(){const d=dateOf(S.day);calView={y:d.year,m:d.m};renderCal();menu.classList.add('open');}
function renderCal(){
  const {y,m}=calView,len=monthLen(y,m),off=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7,today=dateOf(S.day);
  let h=`<div class="calh"><button class="mini" id="calprev">◀</button><h2>${MONTHS[m]} ${y}</h2><button class="mini" id="calnext">▶</button></div>`;
  h+=`<div class="sub" style="text-align:center">Hoy: ${WDL[today.wd]} ${today.dm} de ${MONTHS[today.m].toLowerCase()} de ${today.year}</div>`;
  h+=`<div class="cal">${WDS.map(w=>`<div class="wd">${w}</div>`).join('')}`;
  for(let k=0;k<off;k++)h+=`<div class="cd blank"></div>`;
  for(let dd=1;dd<=len;dd++){const day=dayOfDate(y,m,dd);const pre=day<1;const t=pre?'weekend':dayType(day);const f=pre?null:festivo(day);const wd=(off+dd-1)%7;
    h+=`<div class="cd ${t} ${pre||day<S.day?'past':''} ${day===S.day?'today':''}" data-day="${day}" title="${f||DAYNAME[t]}">${wd===0&&!pre?'<span class="rent">🏠</span>':''}${dd}<br><span class="ic">${pre?'':DAYICON[t]}</span></div>`;}
  h+=`</div><div class="legend"><span>💼 Trabajo ${SHIFT.start}–${SHIFT.end} h</span><span>🌴 Fin de semana</span><span>🎉 Festivo</span><span>🏖️ Vacaciones</span><span>🏠 Alquiler/hipoteca (lunes)</span><span>💡 Facturas (día 1)</span></div>`;
  const nf=(()=>{for(let d=S.day;d<S.day+400;d++){const f=festivo(d);if(f){const D=dateOf(d);return `${f} · ${D.dm} de ${MONTHS[D.m].toLowerCase()}`;}}return '—';})();
  const dToMon=(7-dateOf(S.day).wd)%7||7;
  h+=`<h3>💼 Trabajo de Ana</h3>`;
  h+=`<div class="kv"><span>Horario</span><span>${daysLabel()}, ${SHIFT.start}:00–${SHIFT.end}:00</span></div>`;
  h+=`<div class="kv"><span>Hoy</span><span>${DAYICON[dayType(S.day)]} ${festivo(S.day)||DAYNAME[dayType(S.day)]}${dayType(S.day)==='work'?(S.lastWorkDay===S.day?' · ya fue':' · le toca ir'):''}</span></div>`;
  h+=`<div class="kv"><span>Reputación</span><span>${S.rep??70}/100 ${(S.rep??70)>=50?'👍':'⚠️ (no la ascienden)'}</span></div>`;
  h+=`<div class="kv"><span>Faltas</span><span>${S.absences||0}</span></div>`;
  h+=`<div class="kv"><span>Días de vacaciones</span><span>🏖️ ${S.vac||0} disponibles</span></div>`;
  h+=`<div class="kv"><span>Próximo festivo</span><span>${nf}</span></div>`;
  h+=`<div class="kv"><span>${S.owned?(S.mort?'Hipoteca semanal':'Vivienda'):'Alquiler semanal'}</span><span>${S.owned&&!S.mort?'pagada ✅':fmt(housingWeekly())+' · en '+dToMon+' día'+(dToMon>1?'s':'')}</span></div>`;
  h+=`<div class="kv"><span>💡 Facturas del mes</span><span>~${fmt(utilEstimate())} hasta ahora · se cobran el día 1</span></div>`;
  if(S.jobless)h+=`<div class="kv"><span>Empleo</span><span>📨 En paro${S.paroWeeks?` · paro ${S.paroWeeks} sem.`:''}</span></div>`;
  h+=`<div class="sub" style="font-size:11.5px;margin-top:6px">Toca un día de trabajo futuro para pedirlo de vacaciones (gana 1 cada 5 turnos). Llegar tarde o faltar baja la reputación; con poca reputación no hay ascensos y puede bajar de puesto.</div>`;
  h+=`<button class="btn" id="calclose">Cerrar</button>`;
  card.innerHTML=h;
  card.querySelector('#calprev').onclick=()=>{calView.m--;if(calView.m<0){calView.m=11;calView.y--;}renderCal();};
  card.querySelector('#calnext').onclick=()=>{calView.m++;if(calView.m>11){calView.m=0;calView.y++;}renderCal();};
  card.querySelector('#calclose').onclick=()=>{menu.classList.remove('open');save();};
  card.querySelectorAll('[data-day]').forEach(el=>el.onclick=()=>{const day=+el.dataset.day;if(day<=S.day){if(day===S.day)toast('Hoy no se puede cambiar');return;}
    const t=dayType(day);
    if(t==='vac'){S.vacDays=S.vacDays.filter(d=>d!==day);S.vac=(S.vac||0)+1;toast('Vacaciones anuladas: vuelve a ser día de trabajo');sfx('tap');}
    else if(t==='work'){if((S.vac||0)<1){toast('No quedan días de vacaciones: se ganan trabajando (1 cada 5 turnos)');sfx('bad');return;}S.vacDays.push(day);S.vac--;toast('🏖️ Día libre pedido');sfx('level');}
    else toast(`Ese día ya es ${DAYNAME[t].toLowerCase()}`);
    renderCal();});
}
document.getElementById('status').onclick=openCalendar;

menu.onclick=e=>{if(e.target===menu){menu.classList.remove('open');save();}};

const palette=document.getElementById('palette'),hint=document.getElementById('hint'),cats=document.getElementById('cats');locEl(palette);locEl(hint);locEl(cats);
function setMode(m){returnHeld();preview=null;mode=m;tool=null;hover=null;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.m===m));
  if(m==='build'&&wallMode===0){wallMode=1;wb.textContent=WALLICON[1];}
  buildPalette();}
function toolBtn(e,n,p,t,extra='',inner){return `<button class="tool ${extra}" data-t='${JSON.stringify(t)}'>${inner||`<div class="e">${e}</div>`}<div class="n">${n}</div>${p!=null?`<div class="p">${p?fmt(p):'gratis'}</div>`:''}</button>`;}
function floorSwatch(f){const F=FLOORS[f];return `<div class="dot" style="background:${F.c};${F.pat==='check'?`background-image:linear-gradient(45deg,rgba(0,0,0,.08) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.08) 75%);background-size:10px 10px;`:''}${F.water?'background-image:linear-gradient(180deg,#8fd3ff,#3a9ad9);':''}"></div>`;}
const BUILDCATS=[['est','🏗️ Estructura'],['suelo','🟫 Suelos'],['pint','🎨 Pintura']];
const BUYCATS=[['need','🍽️ Básicos'],['fun','🎉 Ocio'],['deco','🖼️ Deco'],['garden','🌳 Jardín']];
{const at=(k)=>{const j=BUYCATS.findIndex(c=>c[0]===k);return j<0?BUYCATS.length:j+1;};BUYCATS.splice(at('need'),0,['cocina','🍳 Cocina'],['bano','🛁 Baño'],['dorm','🛏️ Dormitorio'],['salon','🛋️ Salón']);BUYCATS.splice(at('fun'),0,['estudio','📐 Estudio']);}
function buildPalette(){
  let h='',ch='';
  if(mode==='live'){
    for(const [k,e,n] of CMDS)h+=`<button class="tool need" data-need="${k}"><div class="e nring"><span>${e}</span></div><div class="n">${n}</div></button>`;
    h+='<div class="sep"></div>';
    h+=`<button class="tool" id="workbtn"><div class="e">💼</div><div class="n">Trabajar</div><div class="p">+${fmt(salary())}</div></button>`;
    h+=`<button class="tool" id="outbtn"><div class="e">🚶</div><div class="n">Salir</div><div class="p" style="color:#7a6fd0">${ID().e}</div></button>`;
    h+=`<button class="tool" id="anabtn"><div class="e">📋</div><div class="n">Ana</div><div class="p" style="color:#7a6fd0">${CAREER[S.career].t}</div></button>`;
    hint.textContent='';
  } else {
    const list=mode==='build'?BUILDCATS:BUYCATS;const cur=cat[mode];
    ch=list.map(([k,n])=>`<button class="cat ${k===cur?'on':''}" data-c="${k}">${n}</button>`).join('')+(mode==='buy'?`<button class="cat" id="tierb" style="background:#fff3d6">${(buyTier===5?'🪚 Fabricar (Ana)':TIERS[buyTier].e+' '+TIERS[buyTier].n)}</button>`:'')+`<div class="spacer" style="flex:1"></div><button class="cat ur" id="undob" title="Deshacer">↶</button><button class="cat ur" id="redob" title="Rehacer">↷</button>`;
    if(mode==='build'){
      if(cur==='est'){
        h+=toolBtn('🏠','Habitación',null,{kind:'room'},'', `<div class="e">🏠</div>`);
        h+=toolBtn('🧱','Pared',Math.round(20*PM()),{kind:'wall'});
        h+=toolBtn('🚪','Puerta',Math.round(60*PM()),{kind:'door'});
        h+=toolBtn('🪟','Ventana',Math.round(80*PM()),{kind:'win'});
        h+=toolBtn('🪵','Valla',Math.round(12*PM()),{kind:'fence'});
        h+='<div class="sep"></div>'+toolBtn('🗑️','Borrar',null,{kind:'del'});
      } else if(cur==='suelo'){
        for(const f of FLOOR_ORDER)h+=toolBtn('',FLOORS[f].n,Math.round(FLOORS[f].p*PM()),{kind:'floor',v:f},'',floorSwatch(f));
      } else {
        WALLCOLS.forEach(([c,nm],v)=>{h+=toolBtn('',nm,Math.round(5*PM()),{kind:'paint',v},'',`<div class="dot" style="background:${c}"></div>`);});
      }
    } else {
      h+=toolBtn('✋','Mover',null,{kind:'move'})+toolBtn('↻','Girar',null,{kind:'rot'})+toolBtn('🗑️','Vender',null,{kind:'del'})+'<div class="sep"></div>';
      for(const [k,d] of Object.entries(OBJ))if(d.cat===cur){
        if(buyTier===5){const c=CRAFT[k];if(!c)continue;const ok=bancoIdx()!=null&&lvl(c[0])>=c[2];
          h+=`<button class="tool ${ok?'':'poor'}" data-t='${JSON.stringify({kind:'craft',v:k})}'><div class="e" style="${ok?'':'opacity:.45'}">${d.e||'🌿'}</div><div class="n">${d.n}</div><div class="p">${ok?fmt(craftMat(k)):'🔒 '+SKN(c[0])[1]+c[2]}</div></button>`;}
        else{const pr=priceOf(k,buyTier);const c=CRAFT[k];h+=toolBtn(d.e||'🌿',d.n,pr,{kind:'obj',v:k,q:buyTier},S.money<pr?'poor':'');}}
    }
    hint.textContent='';
  }
  cats.innerHTML=ch;palette.innerHTML=h;
  if(mode==='live'){qSig='';renderQueue(true);palette.querySelectorAll('[data-need]').forEach(b=>b.onclick=()=>enqueue({k:'need',need:b.dataset.need}));}
  cats.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{returnHeld();cat[mode]=b.dataset.c;tool=null;buildPalette();});
  const tb=document.getElementById('tierb');if(tb)tb.onclick=()=>{buyTier=buyTier>=5?2:buyTier+1;tool=null;toast(buyTier===5?'🪚 Encargos a Ana: ella fabrica el mueble en su banco de trabajo. Barato, pero la calidad depende de su oficio':`${TIERS[buyTier].e} Calidad ${TIERS[buyTier].n}: ${TIERS[buyTier].txt}`);buildPalette();};
  const ub=document.getElementById('undob');if(ub){ub.onclick=undo;document.getElementById('redob').onclick=redo;updateUR();}
  const wk=document.getElementById('workbtn');if(wk)wk.onclick=()=>{if(busyWithCmd()&&!S.sim.leaving)enqueue({k:'work'});else goWork();};
  const ab=document.getElementById('anabtn');if(ab)ab.onclick=openMenu;const ob=document.getElementById('outbtn');if(ob)ob.onclick=()=>openMenu('vida');
  palette.querySelectorAll('[data-t]').forEach(b=>{
    const t=JSON.parse(b.dataset.t);
    if(tool&&JSON.stringify(tool)===b.dataset.t)b.classList.add('on');
    b.onclick=()=>{returnHeld();tool=t;palette.querySelectorAll('.tool').forEach(x=>x.classList.toggle('on',x===b));toolHint();};
  });
}
let qSig='';
function planLabel(){
  if(S.job){const d=S.job.steps.filter(x=>x.done).length,t=S.job.steps.length;return `${S.job.who==='builder'?'👷':'🔨'} ${S.job.emoji} ${S.job.name} ${Math.round(d/t*100)}%${S.job.paused?' ⏸':''}`;}
  if(S.want&&S.autoHome){const need=jobPrice(S.want).mat+reserveMoney();return `💭 ${S.want.emoji} ${S.want.name} · ${fmt(Math.max(0,S.money))}/${fmt(need)}`;}
  return null;}
function currentLabel(){const s=S.sim;
  if(s.work>0)return s.outingActive?(OUT[s.outingActive]?OUT[s.outingActive].e+' Fuera':'🚶 Fuera'):'🚌 Trabajando';if(s.leaving)return '💼 Saliendo';
  if(s.use){const L=useLabel(s.use);return L.b+' '+L.v;}
  if(s.target!=null&&S.obj[s.target])return '🚶‍♀️ '+(OBJ[S.obj[s.target].t].e||'')+' '+OBJ[S.obj[s.target].t].n;
  if(s.path.length)return '🚶‍♀️ Caminando';return null;}
function renderQueue(force){
  if(mode!=='live')return;const s=S.sim;
  const cur=currentLabel(),q=(s.queue||[]).map(cmdLabel);
  const pl=planLabel();
  const sig=[cur,(s.use&&s.use.cmd)||s.cmd,...q,S.free,pl].join('|');
  if(!force&&sig===qSig)return;qSig=sig;
  let h='';
  if(cur)h+=`<button class="cat on" style="max-width:52%;overflow:hidden;text-overflow:ellipsis">${((s.use&&s.use.cmd)||s.cmd)?'👆 ':''}${cur}</button>`;
  for(const l of q)h+=`<button class="cat">${l}</button>`;
  if(cur||q.length)h+=`<button class="cat ur" id="cancelq" title="Cancelar">✕</button>`;
  if(pl)h+=`<button class="cat" id="planb" style="background:#fff3d6">${pl}</button>`;
  h+=`<div style="flex:1"></div><button class="cat" id="freeb" title="Que Ana decida sola">${S.free?'🤖 Libre: sí':'🤖 Libre: no'}</button>`;
  cats.innerHTML=h;
  const c=document.getElementById('cancelq');if(c)c.onclick=cancelAll;
  const pb=document.getElementById('planb');if(pb)pb.onclick=openMenu;
  document.getElementById('freeb').onclick=()=>{S.free=!S.free;toast(S.free?'Ana decide por su cuenta cuando no le das órdenes':'Ana solo hará lo que le mandes (¡vigila sus necesidades!)');renderQueue(true);};
}
function toolHint(){
  if(!tool)return;const k=tool.kind;
  const H={room:`Arrastra un rectángulo: levanta las paredes y pone suelo de ${FLOORS[lastFloor].n.toLowerCase()} (cambia el suelo en Suelos)`,
    wall:'Arrastra en línea recta para levantar un tramo de pared',fence:'Arrastra en línea recta para poner valla (no cierra habitaciones)',
    door:'Toca una pared o valla para convertirla en puerta',win:'Toca una pared para ponerle una ventana',
    del:'Toca o arrastra para borrar · devuelve la mitad',paint:'Toca o arrastra sobre las paredes para pintarlas',
    move:'Toca un mueble para cogerlo',rot:'Toca un mueble para girarlo 90° · los muebles se pegan solos a la pared que tienen detrás'};
  if(k==='floor'){lastFloor=tool.v;hint.textContent=`Arrastra un rectángulo para poner ${FLOORS[tool.v].n.toLowerCase()}${FLOORS[tool.v].water?' (Ana no puede pisarla)':''} · la herramienta Habitación usará este suelo`;return;}
  if(k==='craft'){const d=OBJ[tool.v],c=CRAFT[tool.v];hint.textContent=bancoIdx()==null?'Ana necesita un 🛠️ banco de trabajo (en Ocio) para fabricar':lvl(c[0])<c[2]?`🔒 ${d.n}: pide ${skLabel(c[0])} ${c[2]} · Ana tiene ${lvl(c[0])}`:`🪚 ${d.n}: materiales ${fmt(craftMat(tool.v))} · saldrá ${TIERS[craftEst(c[0])].e} ${TIERS[craftEst(c[0])].n} aprox. · toca dónde quieres ponerlo`;return;}
  if(k==='obj'){const d=OBJ[tool.v];const ci=CRAFT[tool.v];const sk=d.sk?` · entrena ${SKILLS.find(q=>q[0]===d.sk)[2]}`:'';const nd=d.need?' · '+Object.keys(d.need).map(k=>NEEDS.find(n=>n[0]===k)[1]).join(' '):` · decoración +${d.decor} a la habitación`;hint.textContent=`${d.n}${d.chair?' + 🪑 silla incluida (necesita un hueco al lado)':''} ${TIERS[buyTier].e} ${TIERS[buyTier].n}${nd}${sk}${ci?` · instalar: ${SKN(ci[0])[1]}${ci[1]}`:''} · ${TIERS[buyTier].txt}`;return;}
  hint.textContent=H[k]||'';
}
buildPalette();

let hudT=0,saveT=0,goalT=0,lastMoney=null;
let hudPorKey='';
function placeHud(){const b=document.getElementById('placebtn');const k=mode==='live'?awayKey():null;
  if(!k){b.classList.remove('on');if(viewPlace)leaveScene();return;}
  if(placeAuto&&!viewPlace)enterScene();
  b.classList.add('on');const t=viewPlace?`📍 ${sceneTitle(k)} · 🏠 Ver casa`:`📍 Ver a ${CH().name}: ${sceneTitle(k)}`;if(b.textContent!==t)b.textContent=t;}
document.getElementById('placebtn').onclick=()=>{if(viewPlace){leaveScene();placeAuto=false;}else{enterScene();placeAuto=true;}};
function hud(){
  const me=document.getElementById('money');me.textContent=fmt(S.money);me.style.color=S.money<0?'#d9605a':'#2f8a5a';
  const hh=Math.floor(S.t/60),mm=Math.floor(S.t%60);
  {const d=dateOf(S.day);document.getElementById('clock').textContent=`${S.weather?WX[S.weather.k].e+' ':''}${DAYICON[dayType(S.day)]} ${WDS[d.wd]} ${d.dm} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;}
  const m=mood(),s=S.sim;
  document.getElementById('mood').textContent=m>72?'😄':m>55?'🙂':m>38?'😐':m>22?'😟':'😫';
  let act='Pensando…';
  if(s.work>0)act=s.outingActive?'Fuera de casa':`En el trabajo · vuelve en ${Math.ceil(s.work/60)} h`;
  else if(S.sick>0)act='🤒 Enferma, de baja';
  else if(S.jobless)act='📨 En paro, buscando trabajo';
  else if(s.leaving)act='Saliendo hacia el trabajo';
  else if(s.use)act=useLabel(s.use).v;
  else if(s.path.length)act=s.target!=null?`Va a usar: ${OBJ[S.obj[s.target]?.t]?.n||'algo'}`:'Paseando';
  if((s.use&&s.use.cmd)||(s.cmd&&s.path.length))act='👆 '+act;
  else if(s.stuck&&!s.use&&!s.path.length)act='No sabe qué hacer: necesita ayuda ❓';
  if(!s.work){const [x,y]=simCell();const r=inb(x,y)?roomId[idx(x,y)]:-1;if(r>=0&&rooms[r])act+=` · ${rooms[r].name}`;}
  document.getElementById('act').textContent=act;
  if(mode==='buy'&&lastMoney!==Math.round(S.money)){palette.querySelectorAll('[data-t]').forEach(b=>{const t=JSON.parse(b.dataset.t);if(t.kind==='obj')b.classList.toggle('poor',S.money<OBJ[t.v].p);});}
  lastMoney=Math.round(S.money);
  if(mode==='live'){palette.querySelectorAll('[data-need]').forEach(b=>{const v=S.needs[b.dataset.need];const r=b.querySelector('.nring');r.style.setProperty('--p',Math.round(v));r.style.setProperty('--c',v>60?'#4cae7a':v>30?'#e3b341':'#d9605a');b.title=Math.round(v)+'%';b.classList.toggle('low',v<25);});renderQueue();}
  thinkTick();placeHud();
  {const nm=CH().name;const hn=document.getElementById('hname');if(hn.textContent!==nm)hn.textContent=nm;const ln=document.getElementById('line');const lt=S.lastLine?S.lastLine.ic+' '+S.lastLine.txt:'';if(ln.textContent!==lt)ln.textContent=lt;
   const key=CH().skin+CH().hair+CH().style+CH().g+CH().beard+CH().glasses+CH().shirt+(CH().faceSeed||'')+JSON.stringify(CH().rf||'')+CH().age+(CH().look||'')+(m>=74?3:m>=50?2:m>=28?1:0);if(key!==hudPorKey){hudPorKey=key;paintPortrait(document.getElementById('hudpor'),CH(),m,true);}
   const b=document.getElementById('badge');if(storyUnseen&&!unseen){b.style.display='block';b.textContent='📖';}}
}

let last=performance.now();
function loop(now){
  const dt=Math.min(0.1,(now-last)/1000);last=now;
  if(S&&S.cx&&!menu.classList.contains('open')){const de=document.getElementById('dlg');if(S.cx.dlg&&S.cx.dmode!=='ana'){if(!de||de.style.display==='none')showDlg();}else dlgTick();}
  if(speed>0&&!menu.classList.contains('open')&&!dlgBlocking()){let gm=dt*1.5*speed;while(gm>0){const st=Math.min(gm,1.5);update(st);gm-=st;}}
  updateCamera(dt);
  tickFX(dt);
  updateFacing();
  render();
  hudT+=dt;if(hudT>0.2){hudT=0;hud();}
  goalT+=dt;if(goalT>1){goalT=0;checkGoals();}
  saveT+=dt;if(saveT>5){saveT=0;save();}
  requestAnimationFrame(loop);
}
for(const i of findObjs((d,t)=>t==='compu'))withChair(i);
{if(S&&S.home&&['padres','habitacion','bueno'].includes(S.home.type)){const mv=(a,b)=>{const i=idx(...a),j=idx(...b);if(S.obj[i]&&S.obj[i].t==='fogon'&&!S.obj[j]){S.obj[j]=S.obj[i];S.obj[i]=null;}};if(S.home.type==='bueno')mv([6,11],[5,12]);else{const want={nevera:[5,10],fogon:[5,11],mesa:[7,11],silla:[8,12],sofa:[9,12],tele:[10,12]};const got={};for(let x=5;x<=10;x++)for(let y=10;y<=12;y++){const i=idx(x,y),q=S.obj[i];if(q&&!q.priv&&want[q.t]&&!got[q.t]){got[q.t]=q;S.obj[i]=null;}}for(const [t,[x,y]] of Object.entries(want)){const i=idx(x,y);if(got[t]&&!S.obj[i]){S.obj[i]=got[t];delete got[t];}}for(const q of Object.values(got)){for(let x=5;x<=10&&q;x++)for(let y=10;y<=12;y++){const i=idx(x,y);if(!S.obj[i]&&!(x===6||x===8&&y<12||y===10&&x>=8||x===10&&y===11||x===7&&y===12)){S.obj[i]=q;break;}}}mv([6,10],[5,11]);{const i=idx(10,10),j=idx(9,10);if(S.obj[i]&&S.obj[i].t==='tele'&&!S.obj[j]){S.obj[j]=S.obj[i];S.obj[i]=null;}}if(S.obj[idx(5,12)]&&S.obj[idx(5,12)].t==='silla'&&!S.obj[idx(8,12)]){S.obj[idx(8,12)]=S.obj[idx(5,12)];S.obj[idx(5,12)]=null;}}for(let i=0;i<N*N;i++){const q=S.obj[i];if(!q||OBJ[q.t].cat==='garden')continue;const x=i%N,y=i/N|0;for(let r=0;r<4;r++){const dx=[0,1,0,-1][r],dy=[-1,0,1,0][r];if(!inb(x+dx,y+dy))continue;const w=S.wall[idx(x+dx,y+dy)];if(w===1||w===3){q.r=r;break;}}}S.res=(S.res||[]).filter(r=>r.kind!=='mate');const [x,y]=simCell();if(!walkable(x,y)){S.sim.x=S.home.area[0]+.5;S.sim.y=S.home.area[1]+1.5;}S.sim.path=[];S.sim.stuck=0;}}
try{for(const p of S.people||[]){if(p.ch){p.ch.g=personG(p)==='x'?(p.ch.g||'x'):personG(p);fixLook(p.ch,p.ch.g);}}}catch(e){}
try{lookSweep();}catch(e){}try{uidSweep();}catch(e){}if(!S.track)S.track='oficina';setTrack(S.track);if(!S.ideo)S.ideo='apolitica';if(!S.pol)S.pol={xp:0,inf:0,stages:{},comp:2,red:0};S.pol.stages=S.pol.stages||{};W_();
if(!S.char)S.char={...DEFCHAR,shirt:(S.sim&&S.sim.shirt)||DEFCHAR.shirt};if(!S.people)initPeople();if(!S.weather)rollWeather();if(!S.today)newToday();storyState();if(!S.story.chap.start&&!firstRun)chapter('start','Una casa con eco',`${S.char.name} vive en esta casita de alquiler y trabaja de ${CAREER[S.career].t.toLowerCase()}. Su historia empieza a contarse hoy.`);
ensureSimFree();hud();
if(firstRun)setTimeout(()=>chooseDifficulty(false),300);
if(S&&S.char&&S.day>1&&!location.hash)setTimeout(()=>{if(!menu.classList.contains('open'))showTitle(false);},50);
requestAnimationFrame(loop);
addEventListener('visibilitychange',()=>{if(document.hidden)save();});

})();
