// ---------- pantalla de calendario ----------
let calView=null;
function openCalendar(){const d=dateOf(S.day);calView={y:d.year,m:d.m};renderCal();menu.classList.add('open');}
function renderCal(){
  const {y,m}=calView,len=monthLen(y,m),off=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7,today=dateOf(S.day);
  let h=`<div class="calh"><button class="mini" id="calprev">◀</button><h2>${MONTHS[m]} ${y}</h2><button class="mini" id="calnext">▶</button></div>`;
  h+=`<div class="sub" style="text-align:center">${huecos(TXN.calendario.hoy_fecha,{wd:WDL[today.wd],dm:today.dm,mes:MONTHS[today.m].toLowerCase(),y:today.year})}</div>`;
  h+=`<div class="cal">${WDS.map(w=>`<div class="wd">${w}</div>`).join('')}`;
  for(let k=0;k<off;k++)h+=`<div class="cd blank"></div>`;
  for(let dd=1;dd<=len;dd++){const day=dayOfDate(y,m,dd);const pre=day<1;const t=pre?'weekend':dayType(day);const f=pre?null:festivo(day);const wd=(off+dd-1)%7;
    h+=`<div class="cd ${t} ${pre||day<S.day?'past':''} ${day===S.day?'today':''}" data-day="${day}" title="${f||DAYNAME[t]}">${wd===0&&!pre?'<span class="rent">🏠</span>':''}${dd}<br><span class="ic">${pre?'':DAYICON[t]}</span></div>`;}
  h+=`</div><div class="legend"><span>${huecos(TXN.calendario.leyenda_trabajo,{a:SHIFT.start,b:SHIFT.end})}</span><span>${TXN.calendario.leyenda_finde}</span><span>${TXN.calendario.leyenda_festivo}</span><span>${TXN.calendario.leyenda_vac}</span><span>${TXN.calendario.leyenda_alquiler}</span><span>${TXN.calendario.leyenda_facturas}</span></div>`;
  const nf=(()=>{for(let d=S.day;d<S.day+400;d++){const f=festivo(d);if(f){const D=dateOf(d);return huecos(TXN.calendario.festivo_fecha,{f,dm:D.dm,mes:MONTHS[D.m].toLowerCase()});}}return '—';})();
  const dToMon=(7-dateOf(S.day).wd)%7||7;
  h+=`<h3>${TXN.calendario.trabajo_de_ana}</h3>`;
  h+=`<div class="kv"><span>${TXN.calendario.horario}</span><span>${daysLabel()}, ${SHIFT.start}:00–${SHIFT.end}:00</span></div>`;
  h+=`<div class="kv"><span>${TXN.calendario.hoy}</span><span>${DAYICON[dayType(S.day)]} ${festivo(S.day)||DAYNAME[dayType(S.day)]}${dayType(S.day)==='work'?(S.lastWorkDay===S.day?TXN.calendario.ya_fue:TXN.calendario.le_toca):''}</span></div>`;
  h+=(typeof REV==='function'&&REV()&&govPh()>=2)?`<div class="kv"><span>${TXN.calendario.reputacion}</span><span>${TXN.calendario.rep_asamblea}</span></div>`:`<div class="kv"><span>${TXN.calendario.reputacion}</span><span>${S.rep??70}/100 ${(S.rep??70)>=50?'👍':TXN.calendario.rep_sin_ascenso}</span></div>`;
  h+=`<div class="kv"><span>${TXN.calendario.faltas}</span><span>${S.absences||0}</span></div>`;
  h+=`<div class="kv"><span>${TXN.calendario.dias_vac}</span><span>${huecos(TXN.calendario.vac_disponibles,{v:S.vac||0})}</span></div>`;
  h+=`<div class="kv"><span>${TXN.calendario.prox_festivo}</span><span>${nf}</span></div>`;
  h+=`<div class="kv"><span>${S.owned?(S.mort?TXN.calendario.hipoteca_semanal:TXN.calendario.vivienda):TXN.calendario.alquiler_semanal}</span><span>${S.owned&&!S.mort?TXN.calendario.pagada:huecos(dToMon>1?TXN.calendario.cuota_en_dias:TXN.calendario.cuota_en_dia,{p:fmt(housingWeekly()),d:dToMon})}</span></div>`;
  h+=`<div class="kv"><span>${TXN.calendario.facturas}</span><span>${huecos(TXN.calendario.facturas_valor,{x:fmt(utilEstimate())})}</span></div>`;
  if(S.jobless)h+=`<div class="kv"><span>${TXN.calendario.empleo}</span><span>${S.paroWeeks?huecos(TXN.calendario.paro_sem,{w:S.paroWeeks}):TXN.calendario.paro}</span></div>`;
  h+=`<div class="sub" style="font-size:11.5px;margin-top:6px">${TXN.calendario.aviso_vac}</div>`;
  h+=`<button class="btn" id="calclose">${TXN.calendario.cerrar}</button>`;
  card.innerHTML=h;
  card.querySelector('#calprev').onclick=()=>{calView.m--;if(calView.m<0){calView.m=11;calView.y--;}renderCal();};
  card.querySelector('#calnext').onclick=()=>{calView.m++;if(calView.m>11){calView.m=0;calView.y++;}renderCal();};
  card.querySelector('#calclose').onclick=()=>{menu.classList.remove('open');save();};
  card.querySelectorAll('[data-day]').forEach(el=>el.onclick=()=>{const day=+el.dataset.day;if(day<=S.day){if(day===S.day)toast(TXN.calendario.hoy_no);return;}
    const t=dayType(day);
    if(t==='vac'){S.vacDays=S.vacDays.filter(d=>d!==day);S.vac=(S.vac||0)+1;toast(TXN.calendario.vac_anuladas);sfx('tap');}
    else if(t==='work'){if((S.vac||0)<1){toast(TXN.calendario.no_quedan_vac);sfx('bad');return;}S.vacDays.push(day);S.vac--;toast(TXN.calendario.dia_libre);sfx('level');}
    else toast(huecos(TXN.calendario.ese_dia,{x:DAYNAME[t].toLowerCase()}));
    renderCal();});
}
document.getElementById('status').onclick=openCalendar;

menu.onclick=e=>{if(e.target===menu){menu.classList.remove('open');save();}};

const palette=document.getElementById('palette'),hint=document.getElementById('hint'),cats=document.getElementById('cats');locEl(palette);locEl(hint);locEl(cats);
function setMode(m){returnHeld();preview=null;mode=m;tool=null;hover=null;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.m===m));
  if(m==='build'&&wallMode===0){wallMode=1;wb.textContent=WALLICON[1];}
  buildPalette();}
function toolBtn(e,n,p,t,extra='',inner){return `<button class="tool ${extra}" data-t='${JSON.stringify(t)}'>${inner||`<div class="e">${e}</div>`}<div class="n">${n}</div>${p!=null?`<div class="p">${p?fmt(p):TXN.calendario.gratis}</div>`:''}</button>`;}
function floorSwatch(f){const F=FLOORS[f];return `<div class="dot" style="background:${F.c};${F.pat==='check'?`background-image:linear-gradient(45deg,rgba(0,0,0,.08) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.08) 75%);background-size:10px 10px;`:''}${F.water?'background-image:linear-gradient(180deg,#8fd3ff,#3a9ad9);':''}"></div>`;}
const BUILDCATS=TXN.calendario.cats_obra.map(c=>[...c]);
const BUYCATS=TXN.calendario.cats_compra.map(c=>[...c]);
{const at=(k)=>{const j=BUYCATS.findIndex(c=>c[0]===k);return j<0?BUYCATS.length:j+1;};BUYCATS.splice(at('need'),0,...TXN.calendario.cats_hogar.map(c=>[...c]));BUYCATS.splice(at('fun'),0,...TXN.calendario.cats_estudio.map(c=>[...c]));}
function buildPalette(){
  let h='',ch='';
  if(mode==='live'){
    for(const [k,e,n] of CMDS)h+=`<button class="tool need" data-need="${k}"><div class="e nring"><span>${e}</span></div><div class="n">${n}</div></button>`;
    h+='<div class="sep"></div>';
    h+=`<button class="tool" id="workbtn"><div class="e">💼</div><div class="n">${TXN.calendario.trabajar}</div><div class="p">+${fmt(salary())}</div></button>`;
    h+=`<button class="tool" id="outbtn"><div class="e">🚶</div><div class="n">${TXN.calendario.salir}</div><div class="p" style="color:#7a6fd0">${ID().e}</div></button>`;
    h+=`<button class="tool" id="anabtn"><div class="e">📋</div><div class="n">${TXN.calendario.ana}</div><div class="p" style="color:#7a6fd0">${CAREER[S.career].t}</div></button>`;
    hint.textContent='';
  } else {
    const list=mode==='build'?BUILDCATS:BUYCATS;const cur=cat[mode];
    ch=list.map(([k,n])=>`<button class="cat ${k===cur?'on':''}" data-c="${k}">${n}</button>`).join('')+(mode==='buy'?`<button class="cat" id="tierb" style="background:#fff3d6">${(buyTier===5?TXN.calendario.fabricar:TIERS[buyTier].e+' '+TIERS[buyTier].n)}</button>`:'')+`<div class="spacer" style="flex:1"></div><button class="cat ur" id="undob" title="${TXN.calendario.deshacer}">↶</button><button class="cat ur" id="redob" title="${TXN.calendario.rehacer}">↷</button>`;
    if(mode==='build'){
      if(cur==='est'){
        h+=toolBtn('🏠',TXN.calendario.herr_habitacion,null,{kind:'room'},'', `<div class="e">🏠</div>`);
        h+=toolBtn('🧱',TXN.calendario.herr_pared,Math.round(20*PM()),{kind:'wall'});
        h+=toolBtn('🚪',TXN.calendario.herr_puerta,Math.round(60*PM()),{kind:'door'});
        h+=toolBtn('🪟',TXN.calendario.herr_ventana,Math.round(80*PM()),{kind:'win'});
        h+=toolBtn('🪵',TXN.calendario.herr_valla,Math.round(12*PM()),{kind:'fence'});
        h+='<div class="sep"></div>'+toolBtn('🗑️',TXN.calendario.herr_borrar,null,{kind:'del'});
      } else if(cur==='suelo'){
        for(const f of FLOOR_ORDER)h+=toolBtn('',FLOORS[f].n,Math.round(FLOORS[f].p*PM()),{kind:'floor',v:f},'',floorSwatch(f));
      } else {
        WALLCOLS.forEach(([c,nm],v)=>{h+=toolBtn('',nm,Math.round(5*PM()),{kind:'paint',v},'',`<div class="dot" style="background:${c}"></div>`);});
      }
    } else {
      h+=toolBtn('✋',TXN.calendario.herr_mover,null,{kind:'move'})+toolBtn('↻',TXN.calendario.herr_girar,null,{kind:'rot'})+toolBtn('🗑️',TXN.calendario.herr_vender,null,{kind:'del'})+'<div class="sep"></div>';
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
  const tb=document.getElementById('tierb');if(tb)tb.onclick=()=>{buyTier=buyTier>=5?2:buyTier+1;tool=null;toast(buyTier===5?TXN.calendario.tier_fabricar:huecos(TXN.calendario.tier_calidad,{e:TIERS[buyTier].e,n:TIERS[buyTier].n,txt:TIERS[buyTier].txt}));buildPalette();};
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
  if(s.work>0)return s.outingActive?(OUT[s.outingActive]?OUT[s.outingActive].e+' '+TXN.calendario.fuera:TXN.calendario.fuera_andando):TXN.calendario.trabajando;if(s.leaving)return TXN.calendario.saliendo;
  if(s.use){const L=useLabel(s.use);return L.b+' '+L.v;}
  if(s.target!=null&&S.obj[s.target])return '🚶‍♀️ '+(OBJ[S.obj[s.target].t].e||'')+' '+OBJ[S.obj[s.target].t].n;
  if(s.path.length)return TXN.calendario.caminando;return null;}
function renderQueue(force){
  if(mode!=='live')return;const s=S.sim;
  const cur=currentLabel(),q=(s.queue||[]).map(cmdLabel);
  const pl=planLabel();
  const sig=[cur,(s.use&&s.use.cmd)||s.cmd,...q,S.free,pl].join('|');
  if(!force&&sig===qSig)return;qSig=sig;
  let h='';
  if(cur)h+=`<button class="cat on" style="max-width:52%;overflow:hidden;text-overflow:ellipsis">${((s.use&&s.use.cmd)||s.cmd)?'👆 ':''}${cur}</button>`;
  for(const l of q)h+=`<button class="cat">${l}</button>`;
  if(cur||q.length)h+=`<button class="cat ur" id="cancelq" title="${TXN.calendario.cancelar}">✕</button>`;
  if(pl)h+=`<button class="cat" id="planb" style="background:#fff3d6">${pl}</button>`;
  h+=`<div style="flex:1"></div><button class="cat" id="freeb" title="${TXN.calendario.libre_titulo}">${S.free?TXN.calendario.libre_si:TXN.calendario.libre_no}</button>`;
  cats.innerHTML=h;
  const c=document.getElementById('cancelq');if(c)c.onclick=cancelAll;
  const pb=document.getElementById('planb');if(pb)pb.onclick=openMenu;
  document.getElementById('freeb').onclick=()=>{S.free=!S.free;toast(S.free?TXN.calendario.libre_on:TXN.calendario.libre_off);renderQueue(true);};
}
function toolHint(){
  if(!tool)return;const k=tool.kind;
  const H={room:huecos(TXN.calendario.h_room,{x:FLOORS[lastFloor].n.toLowerCase()}),
    wall:TXN.calendario.h_wall,fence:TXN.calendario.h_fence,
    door:TXN.calendario.h_door,win:TXN.calendario.h_win,
    del:TXN.calendario.h_del,paint:TXN.calendario.h_paint,
    move:TXN.calendario.h_move,rot:TXN.calendario.h_rot};
  if(k==='floor'){lastFloor=tool.v;hint.textContent=huecos(TXN.calendario.h_floor,{x:FLOORS[tool.v].n.toLowerCase(),agua:FLOORS[tool.v].water?TXN.calendario.h_floor_agua:''});return;}
  if(k==='craft'){const d=OBJ[tool.v],c=CRAFT[tool.v];hint.textContent=bancoIdx()==null?TXN.calendario.h_craft_banco:lvl(c[0])<c[2]?huecos(TXN.calendario.h_craft_pide,{x:d.n,sk:skLabel(c[0]),pide:c[2],tiene:lvl(c[0])}):huecos(TXN.calendario.h_craft_ok,{x:d.n,m:fmt(craftMat(tool.v)),e:TIERS[craftEst(c[0])].e,c:TIERS[craftEst(c[0])].n});return;}
  if(k==='obj'){const d=OBJ[tool.v];const ci=CRAFT[tool.v];const sk=d.sk?huecos(TXN.calendario.h_entrena,{x:SKILLS.find(q=>q[0]===d.sk)[2]}):'';const nd=d.need?' · '+Object.keys(d.need).map(k=>NEEDS.find(n=>n[0]===k)[1]).join(' '):huecos(TXN.calendario.h_decor,{d:d.decor});hint.textContent=`${d.n}${d.chair?TXN.calendario.h_silla:''} ${TIERS[buyTier].e} ${TIERS[buyTier].n}${nd}${sk}${ci?huecos(TXN.calendario.h_instalar,{x:SKN(ci[0])[1],n:ci[1]}):''} · ${TIERS[buyTier].txt}`;return;}
  hint.textContent=H[k]||'';
}
buildPalette();

let hudT=0,saveT=0,goalT=0,lastMoney=null;
let hudPorKey='';
function placeHud(){const b=document.getElementById('placebtn');const k=mode==='live'?awayKey():null;
  if(!k){b.classList.remove('on');if(viewPlace)leaveScene();return;}
  if(placeAuto&&!viewPlace)enterScene();
  b.classList.add('on');const t=viewPlace?huecos(TXN.calendario.ver_casa,{x:sceneTitle(k)}):huecos(TXN.calendario.ver_a,{n:CH().name,x:sceneTitle(k)});if(b.textContent!==t)b.textContent=t;}
document.getElementById('placebtn').onclick=()=>{if(viewPlace){leaveScene();placeAuto=false;}else{enterScene();placeAuto=true;}};
function hud(){
  const me=document.getElementById('money');me.textContent=fmt(S.money);me.style.color=S.money<0?'#d9605a':'#2f8a5a';
  const hh=Math.floor(S.t/60),mm=Math.floor(S.t%60);
  {const d=dateOf(S.day);document.getElementById('clock').textContent=`${S.weather?WX[S.weather.k].e+' ':''}${DAYICON[dayType(S.day)]} ${WDS[d.wd]} ${d.dm} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;}
  const m=mood(),s=S.sim;
  document.getElementById('mood').textContent=m>72?'😄':m>55?'🙂':m>38?'😐':m>22?'😟':'😫';
  let act=TXN.calendario.pensando;
  if(s.work>0)act=s.outingActive?TXN.calendario.act_fuera:huecos(TXN.calendario.act_trabajo,{h:Math.ceil(s.work/60)});
  else if(S.sick>0)act=TXN.calendario.act_enferma;
  else if(S.jobless)act=TXN.calendario.act_paro;
  else if(s.leaving)act=TXN.calendario.act_saliendo;
  else if(s.use)act=useLabel(s.use).v;
  else if(s.path.length)act=s.target!=null?huecos(TXN.calendario.act_va,{x:OBJ[S.obj[s.target]?.t]?.n||TXN.calendario.algo}):TXN.calendario.paseando;
  if((s.use&&s.use.cmd)||(s.cmd&&s.path.length))act='👆 '+act;
  else if(s.stuck&&!s.use&&!s.path.length)act=TXN.calendario.act_atascada;
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
if(!S.char)S.char={...DEFCHAR,shirt:(S.sim&&S.sim.shirt)||DEFCHAR.shirt};if(!S.people)initPeople();if(!S.weather)rollWeather();if(!S.today)newToday();storyState();if(!S.story.chap.start&&!firstRun)chapter('start',TXN.calendario.cap_inicio,huecos(TXN.calendario.cap_inicio_txt,{n:S.char.name,t:CAREER[S.career].t.toLowerCase()}));
ensureSimFree();hud();
if(firstRun)setTimeout(()=>chooseDifficulty(false),300);
if(S&&S.char&&S.day>1&&!location.hash)setTimeout(()=>{if(!menu.classList.contains('open'))showTitle(false);},50);
requestAnimationFrame(loop);
addEventListener('visibilitychange',()=>{if(document.hidden)save();});

})();
