// ---------- creador de personaje ----------
let cre=null;
function openCreator(diff,edit){
  cre=edit?{...JSON.parse(JSON.stringify(CH())),traits:[...(S.traits||[])],ideo:S.ideo||'apolitica',comp:comp(),life:{...LIFE()}}:{...randomChar(),traits:[],ideo:pickR(IDEO_ORDER),comp:2,track:pickR(['oficina','super','hosteleria','cuidados'])};
  renderCreator(diff,edit);
}
function renderCreator(diff,edit){
  const sw=(key,list)=>`<div class="swatches">${list.map(c=>`<div class="sw${cre[key]===c?' on':''}" data-k="${key}" data-v="${c}" style="background:${c}"></div>`).join('')}</div>`;
  const chips=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${cre[key]===k?' sel':''}" data-k="${key}" data-v="${k}">${Array.isArray(v)?v[0]:v}</button>`).join('')}</div>`;
  let h=`<h2>${edit?TXN.creador.cambiar_aspecto:TXN.creador.crea_personaje}</h2>`;
  h+=`<div class="crepre${card.scrollTop>140&&menu.classList.contains('open')&&card.querySelector('#crePor')?' small notr':''}"><canvas id="crePor" width="240" height="240"></canvas><canvas id="creBody" width="150" height="240"></canvas></div>`;
  h+=`<div class="crow"><input id="crename" maxlength="16" value="${cre.name.replace(/"/g,'')}" placeholder="${TXN.creador.nombre}"></div><div class="chips" style="margin-top:4px"><button class="mini" id="crerand">${TXN.creador.todo_azar}</button><button class="mini" id="creface">${TXN.creador.otra_cara}</button></div>`;
  h+=`<div class="clab">${TXN.creador.pronombre}</div>${chips('g',PRON)}`;
  h+=`<div class="clab">${TXN.creador.edad}</div><div class="chips">${[20,24,27,32,38,45,55].map(a=>`<button class="mini${cre.age===a?' sel':''}" data-k="age" data-v="${a}">${a}</button>`).join('')}</div>`;
  h+=`<div class="clab">${TXN.creador.piel}</div>${sw('skin',SKINS)}`;
  {const RFc=rfOf(cre),fc=RFc.face;
  const rch=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${(fc[key]||(key==='estructura'?(cre.g==='f'?'suave':cre.g==='m'?'marcada':'media'):key==='expresion'?'neutra':''))===k?' sel':''}" data-rf="${key}" data-v="${k}">${v}</button>`).join('')}</div>`;
  h+=`<div class="clab">${TXN.creador.peinado}</div>`+HAIR_GROUPS.map(([gn,list])=>`<div class="sub" style="font-size:11px;margin:4px 0 2px">${gn}</div><div class="chips">${list.map(k=>`<button class="mini${cre.style===k?' sel':''}" data-k="style" data-v="${k}">${HAIRSTYLES[k]}</button>`).join('')}</div>`).join('');
  if(!['rapado','calvo','afro','rizos','twa','fade','hightop','cornrows','boxbraids','locs','twists','puffs','bantu','mono','coleta','trenzas'].includes(cre.style))h+=`<div class="chips"><span class="sub" style="font-size:11px;align-self:center">${TXN.creador.raya_label}</span>${TXN.creador.raya.map(([k,v])=>`<button class="mini${(cre.raya||'izq')===k?' sel':''}" data-k="raya" data-v="${k}">${v}</button>`).join('')}</div>`;
  h+=`<div class="clab">${TXN.creador.color_pelo}</div>${sw('hair',HAIRCOLS)}`;
  h+=`<div class="clab">${TXN.creador.barba}</div>${chips('beard',BEARDS)}`;
  h+=`<h3 style="margin-top:12px">${TXN.creador.cara}</h3>`;
  h+=`<div class="clab">${TXN.creador.forma}</div>${rch('forma',RF_OPTS.forma)}<div class="clab">${TXN.creador.rasgos}</div>${rch('estructura',RF_OPTS.estructura)}`;
  h+=`<div class="clab">${TXN.creador.ojos}</div>${rch('ojos',RF_OPTS.ojos)}${sw('eyes',EYECOLS)}`;
  h+=`<div class="clab">${TXN.creador.cejas}</div>${rch('cejas',RF_OPTS.cejas)}<div class="clab">${TXN.creador.nariz}</div>${rch('nariz',RF_OPTS.nariz)}<div class="clab">${TXN.creador.boca}</div>${rch('boca',RF_OPTS.boca)}<div class="clab">${TXN.creador.gesto}</div>${rch('expresion',RF_OPTS.expresion)}`;
  h+=`<div class="clab">${TXN.creador.ajuste_fino}</div><div class="rfs">${RF_SLIDERS.map(([k,n])=>`<label class="rfsl"><span>${n}</span><input type="range" min="0" max="100" value="${Math.round((fc[k]??.5)*100)}" data-rfs="${k}"></label>`).join('')}</div>`;
  h+=`<div class="clab">${TXN.creador.detalles}</div><div class="chips"><button class="mini${RFc.freck?' sel':''}" data-rx="freck">${TXN.creador.pecas}</button><button class="mini${RFc.mole?' sel':''}" data-rx="mole">${TXN.creador.lunar}</button><button class="mini${RFc.makeup?' sel':''}" data-rx="makeup">${TXN.creador.maquillaje}</button></div>`;
  h+=`<div class="chips"><span class="sub" style="font-size:11px;align-self:center">${TXN.creador.pendientes_label}</span>${TXN.creador.pendientes.map(([k,v])=>`<button class="mini${(RFc.earrings||'')===k?' sel':''}" data-ear="${k}">${v}</button>`).join('')}</div>`;
  h+=`<div class="chips"><span class="sub" style="font-size:11px;align-self:center">${TXN.creador.gafas_label}</span>${TXN.creador.gafas.map(([k,v])=>`<button class="mini${(cre.glasses?(RFc.gl||'pasta'):'no')===k?' sel':''}" data-gl="${k}">${v}</button>`).join('')}</div>`;}
  h+=`<div class="clab">${TXN.creador.complexion}</div>${chips('build',BUILDS)}`;
  h+=styleSection(cre);
  if(!edit){cre.home=cre.home||'casita';h+=`<div class="clab">${TXN.creador.donde_vive}</div><div class="chips">${HOME_ORDER.map(k=>`<button class="mini${cre.home===k?' sel':''}" data-k="home" data-v="${k}">${HOMES[k].e} ${HOMES[k].n}</button>`).join('')}</div><div class="sub" style="font-size:11.5px">${HOMES[cre.home].d}${HOMES[cre.home].cls>=3?TXN.creador.familia_dinero:''}</div>`;}
  if(!edit){h+=`<div class="clab">${TXN.creador.primer_trabajo}</div><div class="chips">${['oficina','super','hosteleria','obra','cuidados','reparto'].map(k=>`<button class="mini${cre.track===k?' sel':''}" data-k="track" data-v="${k}">${TRACKS[k].e} ${TRACKS[k].n}</button>`).join('')}<button class="mini${cre.track==='paro'?' sel':''}" data-k="track" data-v="paro">${TXN.creador.en_paro}</button></div><div class="sub" style="font-size:11.5px">${cre.track==='paro'?TXN.creador.paro_desc:TRACKS[cre.track].d}</div>`;}
  h+=`<div class="clab">${TXN.creador.ideas}</div><div class="chips">${IDEO_ORDER.map(k=>`<button class="mini${cre.ideo===k?' sel':''}" data-k="ideo" data-v="${k}">${IDEOS[k].e} ${L2(IDEOS[k].n)}</button>`).join('')}</div><div class="sub" style="font-size:11.5px">${IDEOS[cre.ideo].d}</div>${IDEOS[cre.ideo].fx.map(x=>`<div class="sub" style="font-size:11px">• ${x}</div>`).join('')}`;
  if(cre.ideo!=='apolitica')h+=`<div class="chips" style="margin-top:4px">${[1,2,3].map(n=>`<button class="mini${cre.comp===n?' sel':''}" data-k="comp" data-v="${n}">${L2(COMP[n])}</button>`).join('')}</div>`;
  {const L=cre.life||(cre.life=defaultLife(cre.g));const ch2=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${L[key]===k?' sel':''}" data-lf="${key}" data-v="${k}">${v}</button>`).join('')}</div>`;
    h+=`<div class="clab">${TXN.creador.atraen}</div>${ch2('orient',ORIENT)}<div class="clab">${TXN.creador.relaciones}</div>${ch2('rel',RELSTYLE)}<div class="clab">${TXN.creador.hijos}</div>${ch2('kids',KIDSW)}<div class="clab">${TXN.creador.boda}</div>${ch2('boda',BODAW)}`;}
  h+=`<div class="clab">${TXN.creador.personalidad} <span style="font-weight:700;text-transform:none;letter-spacing:0">· ${cre.traits.length}/${TRAIT_MAX}${cre.traits.length>=TRAIT_MAX?TXN.creador.quita_uno:''}</span></div>`+TRAIT_CATS.map(([cat,cn])=>{const ks=Object.entries(TRAITS).filter(([k,t])=>!t.hid&&(t.cat||'estilo')===cat);if(!ks.length)return '';return `<div class="sub" style="font-size:11px;margin:6px 0 2px">${cn}</div><div class="chips">${ks.map(([k,t])=>{const on=cre.traits.includes(k),full=!on&&cre.traits.length>=TRAIT_MAX&&!(t.no&&cre.traits.includes(t.no));return `<button class="mini tr${on?' sel':''}${full?' dim':''}" data-trait="${k}">${t.e} ${L2(t.n)}</button>`;}).join('')}</div>`;}).join('');
  if(cre.traits.length)h+=cre.traits.map(k=>`<div class="sub" style="font-size:11.5px">${TRAITS[k].e} ${TRAITS[k].d}</div>`).join('');
  h+=`<button class="btn" id="creok">${edit?TXN.creador.guardar:TXN.creador.empezar}</button><button class="btn grey" id="creback">${edit?TXN.creador.cancelar:TXN.creador.volver}</button>`;
  // el creador usa el género del borrador, no el de la partida
  const keep=card.scrollTop;const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');{const sv=S.char;S.char={...cre};const hh=L(h);S.char=sv;d.set.call(card,hh);}menu.classList.add('open');card.scrollTop=keep;requestAnimationFrame(()=>{const pp=card.querySelector('.crepre');if(pp)pp.classList.remove('notr');});
  card.onscroll=()=>{const p=card.querySelector('.crepre');if(p)p.classList.toggle('small',card.scrollTop>140);};
  const draw=()=>{paintPortrait(card.querySelector('#crePor'),cre,null);const bc=card.querySelector('#creBody'),bx=bc.getContext('2d');bx.setTransform(1,0,0,1,0,0);bx.clearRect(0,0,bc.width,bc.height);
    const old=ctx;ctx=bx;ctx.setTransform(3.3,0,0,3.3,bc.width/2-6,bc.height-14);anaRT.phase=0;drawAna(0,0,{ch:cre,shirt:cre.shirt,mood:72,front:true,right:true,pose:'stand'});ctx=old;};
  draw();
  const nm=card.querySelector('#crename');nm.oninput=()=>{cre.name=nm.value.trim()||TXN.creador.nombre_defecto;};
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
    if(edit){const oldName=S.char.name;S.char=chr;S.traits=traits;S.sim.shirt=chr.shirt;S.want=null;GRX=null;if(ideo!==S.ideo){tell(huecos(TXN.creador.cambia_ideas,{n:chr.name,x:IDEOS[ideo].n.toLowerCase()}),IDEOS[ideo].e);S.pol.xp=Math.round(S.pol.xp*0.3);}S.ideo=ideo;S.pol.comp=cmp;if(life)S.life=life;if(oldName!==chr.name)tell(huecos(TXN.creador.prefiere_nombre,{a:oldName,b:chr.name}).replace(TXN.creador.la_llamen,ga(TXN.creador.la_llamen,TXN.creador.lo_llamen,TXN.creador.le_llamen)),'✏️');save();openMenu('perfil');return;}
    S=newState(diff);S.char=chr;S.people=null;initPeople();if(home&&home!=='casita')applyHome(home);else S.home={type:'casita',area:[0,0,N-1,N-1],since:1,mates:[]};if(home==='bueno')S.money+=Math.round(HOMES.bueno.rent*Dm().rent*8);if(home==='chalet')S.money+=Math.round(HOMES.chalet.rent*Dm().rent*10);S.traits=traits;S.sim.shirt=chr.shirt;S.ideo=ideo;S.pol.comp=cmp;S.life=life||defaultLife(chr.g);startTrack(track==='paro'||!track?'oficina':track,true);if(track==='paro'){S.jobless=true;S.paroWeeks=0;S.office=null;S.seek=null;S.prevJob='paro';S.startJobless=true;}S.story=null;rollWeather();storyStart();if(track==='paro')tell(huecos(TXN.creador.empieza_paro,{n:chr.name}),'📭');save();undoStack=[];redoStack=[];dirty();menu.classList.remove('open');centerOnWorld(S.sim.x,S.sim.y);setMode('live');
    toast(huecos(TXN.creador.empieza_vida,{n:chr.name,e:Dm().e,d:Dm().n}),true);};
}
// en el creador los nombres de rasgos se muestran con el género del borrador
function L2(s){if(!cre||cre.g==='f')return s;return GW.includes(s)?gform(s,cre.g):s;}
document.getElementById('menubtn').onclick=()=>openMenu();

