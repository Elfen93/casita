// ---------- creador de personaje ----------
let cre=null;
function openCreator(diff,edit){
  cre=edit?{...JSON.parse(JSON.stringify(CH())),traits:[...(S.traits||[])],ideo:S.ideo||'apolitica',comp:comp(),life:{...LIFE()}}:{...randomChar(),traits:[],ideo:pickR(IDEO_ORDER),comp:2,track:pickR(['oficina','super','hosteleria','cuidados'])};
  renderCreator(diff,edit);
}
function renderCreator(diff,edit){
  const sw=(key,list)=>`<div class="swatches">${list.map(c=>`<div class="sw${cre[key]===c?' on':''}" data-k="${key}" data-v="${c}" style="background:${c}"></div>`).join('')}</div>`;
  const chips=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${cre[key]===k?' sel':''}" data-k="${key}" data-v="${k}">${Array.isArray(v)?v[0]:v}</button>`).join('')}</div>`;
  let h=`<h2>${edit?'Cambiar aspecto':'Crea tu personaje'}</h2>`;
  h+=`<div class="crepre${card.scrollTop>140&&menu.classList.contains('open')&&card.querySelector('#crePor')?' small notr':''}"><canvas id="crePor" width="240" height="240"></canvas><canvas id="creBody" width="150" height="240"></canvas></div>`;
  h+=`<div class="crow"><input id="crename" maxlength="16" value="${cre.name.replace(/"/g,'')}" placeholder="Nombre"></div><div class="chips" style="margin-top:4px"><button class="mini" id="crerand">🎲 Todo al azar</button><button class="mini" id="creface">🙂 Otra cara</button></div>`;
  h+=`<div class="clab">Pronombre</div>${chips('g',PRON)}`;
  h+=`<div class="clab">Edad</div><div class="chips">${[20,24,27,32,38,45,55].map(a=>`<button class="mini${cre.age===a?' sel':''}" data-k="age" data-v="${a}">${a}</button>`).join('')}</div>`;
  h+=`<div class="clab">Piel</div>${sw('skin',SKINS)}`;
  {const RFc=rfOf(cre),fc=RFc.face;
  const rch=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${(fc[key]||(key==='estructura'?(cre.g==='f'?'suave':cre.g==='m'?'marcada':'media'):key==='expresion'?'neutra':''))===k?' sel':''}" data-rf="${key}" data-v="${k}">${v}</button>`).join('')}</div>`;
  h+=`<div class="clab">Peinado</div>`+HAIR_GROUPS.map(([gn,list])=>`<div class="sub" style="font-size:11px;margin:4px 0 2px">${gn}</div><div class="chips">${list.map(k=>`<button class="mini${cre.style===k?' sel':''}" data-k="style" data-v="${k}">${HAIRSTYLES[k]}</button>`).join('')}</div>`).join('');
  if(!['rapado','calvo','afro','rizos','twa','fade','hightop','cornrows','boxbraids','locs','twists','puffs','bantu','mono','coleta','trenzas'].includes(cre.style))h+=`<div class="chips"><span class="sub" style="font-size:11px;align-self:center">Raya:</span>${[['izq','Izquierda'],['centro','En medio'],['der','Derecha']].map(([k,v])=>`<button class="mini${(cre.raya||'izq')===k?' sel':''}" data-k="raya" data-v="${k}">${v}</button>`).join('')}</div>`;
  h+=`<div class="clab">Color de pelo</div>${sw('hair',HAIRCOLS)}`;
  h+=`<div class="clab">Barba y bigote</div>${chips('beard',BEARDS)}`;
  h+=`<h3 style="margin-top:12px">🧑 Cara</h3>`;
  h+=`<div class="clab">Forma</div>${rch('forma',RF_OPTS.forma)}<div class="clab">Rasgos</div>${rch('estructura',RF_OPTS.estructura)}`;
  h+=`<div class="clab">Ojos</div>${rch('ojos',RF_OPTS.ojos)}${sw('eyes',EYECOLS)}`;
  h+=`<div class="clab">Cejas</div>${rch('cejas',RF_OPTS.cejas)}<div class="clab">Nariz</div>${rch('nariz',RF_OPTS.nariz)}<div class="clab">Boca</div>${rch('boca',RF_OPTS.boca)}<div class="clab">Gesto</div>${rch('expresion',RF_OPTS.expresion)}`;
  h+=`<div class="clab">Ajuste fino</div><div class="rfs">${RF_SLIDERS.map(([k,n])=>`<label class="rfsl"><span>${n}</span><input type="range" min="0" max="100" value="${Math.round((fc[k]??.5)*100)}" data-rfs="${k}"></label>`).join('')}</div>`;
  h+=`<div class="clab">Detalles</div><div class="chips"><button class="mini${RFc.freck?' sel':''}" data-rx="freck">Pecas</button><button class="mini${RFc.mole?' sel':''}" data-rx="mole">Lunar</button><button class="mini${RFc.makeup?' sel':''}" data-rx="makeup">💄 Maquillaje</button></div>`;
  h+=`<div class="chips"><span class="sub" style="font-size:11px;align-self:center">Pendientes:</span>${[['','No'],['aro','Aros'],['bola','Botón']].map(([k,v])=>`<button class="mini${(RFc.earrings||'')===k?' sel':''}" data-ear="${k}">${v}</button>`).join('')}</div>`;
  h+=`<div class="chips"><span class="sub" style="font-size:11px;align-self:center">Gafas:</span>${[['no','No'],['pasta','Pasta'],['metal','Metal'],['redondas','Redondas']].map(([k,v])=>`<button class="mini${(cre.glasses?(RFc.gl||'pasta'):'no')===k?' sel':''}" data-gl="${k}">${v}</button>`).join('')}</div>`;}
  h+=`<div class="clab">Complexión</div>${chips('build',BUILDS)}`;
  h+=styleSection(cre);
  if(!edit){cre.home=cre.home||'casita';h+=`<div class="clab">Dónde vive al empezar</div><div class="chips">${HOME_ORDER.map(k=>`<button class="mini${cre.home===k?' sel':''}" data-k="home" data-v="${k}">${HOMES[k].e} ${HOMES[k].n}</button>`).join('')}</div><div class="sub" style="font-size:11.5px">${HOMES[cre.home].d}${HOMES[cre.home].cls>=3?' Viene de familia con dinero: empieza con más ahorros.':''}</div>`;}
  if(!edit){h+=`<div class="clab">Primer trabajo</div><div class="chips">${['oficina','super','hosteleria','obra','cuidados','reparto'].map(k=>`<button class="mini${cre.track===k?' sel':''}" data-k="track" data-v="${k}">${TRACKS[k].e} ${TRACKS[k].n}</button>`).join('')}<button class="mini${cre.track==='paro'?' sel':''}" data-k="track" data-v="paro">📭 En el paro</button></div><div class="sub" style="font-size:11.5px">${cre.track==='paro'?'Empieza sin trabajo y sin prestación: nunca ha cotizado lo suficiente. Tendrá que buscarse la vida desde el primer día.':TRACKS[cre.track].d}</div>`;}
  h+=`<div class="clab">Ideas políticas</div><div class="chips">${IDEO_ORDER.map(k=>`<button class="mini${cre.ideo===k?' sel':''}" data-k="ideo" data-v="${k}">${IDEOS[k].e} ${L2(IDEOS[k].n)}</button>`).join('')}</div><div class="sub" style="font-size:11.5px">${IDEOS[cre.ideo].d}</div>${IDEOS[cre.ideo].fx.map(x=>`<div class="sub" style="font-size:11px">• ${x}</div>`).join('')}`;
  if(cre.ideo!=='apolitica')h+=`<div class="chips" style="margin-top:4px">${[1,2,3].map(n=>`<button class="mini${cre.comp===n?' sel':''}" data-k="comp" data-v="${n}">${L2(COMP[n])}</button>`).join('')}</div>`;
  {const L=cre.life||(cre.life=defaultLife(cre.g));const ch2=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${L[key]===k?' sel':''}" data-lf="${key}" data-v="${k}">${v}</button>`).join('')}</div>`;
    h+=`<div class="clab">Le atraen</div>${ch2('orient',ORIENT)}<div class="clab">Relaciones</div>${ch2('rel',RELSTYLE)}<div class="clab">Hijos</div>${ch2('kids',KIDSW)}<div class="clab">Boda</div>${ch2('boda',BODAW)}`;}
  h+=`<div class="clab">Personalidad <span style="font-weight:700;text-transform:none;letter-spacing:0">· ${cre.traits.length}/${TRAIT_MAX}${cre.traits.length>=TRAIT_MAX?' (quita uno para cambiar)':''}</span></div>`+TRAIT_CATS.map(([cat,cn])=>{const ks=Object.entries(TRAITS).filter(([k,t])=>!t.hid&&(t.cat||'estilo')===cat);if(!ks.length)return '';return `<div class="sub" style="font-size:11px;margin:6px 0 2px">${cn}</div><div class="chips">${ks.map(([k,t])=>{const on=cre.traits.includes(k),full=!on&&cre.traits.length>=TRAIT_MAX&&!(t.no&&cre.traits.includes(t.no));return `<button class="mini tr${on?' sel':''}${full?' dim':''}" data-trait="${k}">${t.e} ${L2(t.n)}</button>`;}).join('')}</div>`;}).join('');
  if(cre.traits.length)h+=cre.traits.map(k=>`<div class="sub" style="font-size:11.5px">${TRAITS[k].e} ${TRAITS[k].d}</div>`).join('');
  h+=`<button class="btn" id="creok">${edit?'💾 Guardar':'✅ Empezar la historia'}</button><button class="btn grey" id="creback">${edit?'Cancelar':'← Volver'}</button>`;
  // el creador usa el género del borrador, no el de la partida
  const keep=card.scrollTop;const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');{const sv=S.char;S.char={...cre};const hh=L(h);S.char=sv;d.set.call(card,hh);}menu.classList.add('open');card.scrollTop=keep;requestAnimationFrame(()=>{const pp=card.querySelector('.crepre');if(pp)pp.classList.remove('notr');});
  card.onscroll=()=>{const p=card.querySelector('.crepre');if(p)p.classList.toggle('small',card.scrollTop>140);};
  const draw=()=>{paintPortrait(card.querySelector('#crePor'),cre,null);const bc=card.querySelector('#creBody'),bx=bc.getContext('2d');bx.setTransform(1,0,0,1,0,0);bx.clearRect(0,0,bc.width,bc.height);
    const old=ctx;ctx=bx;ctx.setTransform(3.3,0,0,3.3,bc.width/2-6,bc.height-14);anaRT.phase=0;drawAna(0,0,{ch:cre,shirt:cre.shirt,mood:72,front:true,right:true,pose:'stand'});ctx=old;};
  draw();
  const nm=card.querySelector('#crename');nm.oninput=()=>{cre.name=nm.value.trim()||'Ana';};
  card.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;let v=b.dataset.v;if(k==='age'||k==='comp')v=+v;if(k==='glasses')v=!cre.glasses;
    if(k==='g'&&cre.g!==v&&NAMES[cre.g].includes(cre.name)){cre.name=pickR(NAMES[v]);}
    if(k==='g'&&v==='f'&&cre.beard!=='no')cre.beard='no';
    cre[k]=v;renderCreator(diff,edit);});
  card.querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>{rfOf(cre).face[b.dataset.rf]=b.dataset.v;renderCreator(diff,edit);});
  card.querySelectorAll('[data-rfs]').forEach(r=>{r.oninput=()=>{rfOf(cre).face[r.dataset.rfs]=r.value/100;paintPortrait(card.querySelector('#crePor'),cre,null);};});
  card.querySelectorAll('[data-rx]').forEach(b=>b.onclick=()=>{const R=rfOf(cre),k=b.dataset.rx;R[k]=k==='mole'?(R.mole?null:'der'):!R[k];renderCreator(diff,edit);});
  card.querySelectorAll('[data-ear]').forEach(b=>b.onclick=()=>{rfOf(cre).earrings=b.dataset.ear||null;renderCreator(diff,edit);});
  card.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{const v=b.dataset.gl;cre.glasses=v!=='no';if(v!=='no')rfOf(cre).gl=v;renderCreator(diff,edit);});
  card.querySelectorAll('[data-lf]').forEach(b=>b.onclick=()=>{cre.life[b.dataset.lf]=b.dataset.v;renderCreator(diff,edit);});
  card.querySelectorAll('[data-trait]').forEach(b=>b.onclick=()=>{const k=b.dataset.trait;let tr=cre.traits;
    if(tr.includes(k))tr=tr.filter(x=>x!==k);else{if(TRAITS[k].no)tr=tr.filter(x=>x!==TRAITS[k].no);if(tr.length>=TRAIT_MAX){b.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'none'}],{duration:200});return;}tr.push(k);}cre.traits=tr;renderCreator(diff,edit);});
  card.querySelector('#creface').onclick=()=>{cre.faceSeed=Math.random().toString(36).slice(2);delete cre.face;delete cre.rf;renderCreator(diff,edit);};
  card.querySelector('#crerand').onclick=()=>{const t=cre.traits;cre={...randomChar(),traits:t,ideo:cre.ideo,comp:cre.comp,track:cre.track};renderCreator(diff,edit);};
  card.querySelector('#creback').onclick=()=>edit?openMenu('perfil'):chooseDifficulty(true);
  card.querySelector('#creok').onclick=()=>{
    cre.name=(nm.value.trim()||cre.name).slice(0,16);const {traits,ideo,comp:cmp,track,life,home,...chr}=cre;
    if(edit){const oldName=S.char.name;S.char=chr;S.traits=traits;S.sim.shirt=chr.shirt;S.want=null;GRX=null;if(ideo!==S.ideo){tell(`${chr.name} ha cambiado de ideas: ahora se siente ${IDEOS[ideo].n.toLowerCase()}.`,IDEOS[ideo].e);S.pol.xp=Math.round(S.pol.xp*0.3);}S.ideo=ideo;S.pol.comp=cmp;if(life)S.life=life;if(oldName!==chr.name)tell(`Desde hoy, ${oldName} prefiere que la llamen ${chr.name}.`.replace('la llamen',ga('la llamen','lo llamen','le llamen')),'✏️');save();openMenu('perfil');return;}
    S=newState(diff);S.char=chr;S.people=null;initPeople();if(home&&home!=='casita')applyHome(home);else S.home={type:'casita',area:[0,0,N-1,N-1],since:1,mates:[]};if(home==='bueno')S.money+=Math.round(HOMES.bueno.rent*Dm().rent*8);if(home==='chalet')S.money+=Math.round(HOMES.chalet.rent*Dm().rent*10);S.traits=traits;S.sim.shirt=chr.shirt;S.ideo=ideo;S.pol.comp=cmp;S.life=life||defaultLife(chr.g);startTrack(track==='paro'||!track?'oficina':track,true);if(track==='paro'){S.jobless=true;S.paroWeeks=0;S.office=null;S.seek=null;S.prevJob='paro';S.startJobless=true;}S.story=null;rollWeather();storyStart();if(track==='paro')tell(`${chr.name} empieza sin trabajo. Ha impreso veinte currículums y tiene la tarde libre para repartirlos.`,'📭');save();undoStack=[];redoStack=[];dirty();menu.classList.remove('open');centerOnWorld(S.sim.x,S.sim.y);setMode('live');
    toast(`🏡 Empieza la vida de ${chr.name} · ${Dm().e} ${Dm().n}`,true);};
}
// en el creador los nombres de rasgos se muestran con el género del borrador
function L2(s){if(!cre||cre.g==='f')return s;return GW.includes(s)?gform(s,cre.g):s;}
document.getElementById('menubtn').onclick=()=>openMenu();

