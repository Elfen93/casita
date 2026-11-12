// =================== VECINOS: conocer a la gente del censo (ficha, presentarse, lazos) ===================
// El censo (DATA.personas.vecinos) ya puebla las escenas. Aquí se pueden tratar: tocar a uno abre su ficha; presentarse lo pasa a S.people
// con la clave estable 'v_'+id (y `vid`, `hogar`, `age`...). Lo que se sabe de él crece con la relación: oficio al conocerle,
// su historia con relación >= 35 y sus lazos con >= 55 (y cada lazo se puede «conocer a través de»). Los textos están en data/interacciones.json → vecinos_ficha.
// Menores: a los de menos de 12 no se les presenta nadie (la ficha dice de quién son); a los de menos de 18 nunca se les ofrece nada romántico ni salir a tomar algo:
// no llevan `orient` (canLove da falso), `adult:false`, y quedan fuera de móvil, llamadas al azar y visitas al azar.
const VCF=()=>(DATA.interacciones&&DATA.interacciones.vecinos_ficha)||{};
const VC_HIST=35,VC_LAZOS=55;
const vcT=(k,v)=>huecos(String(VCF()[k]!=null?VCF()[k]:''),v||{});
const vcK=id=>'v_'+id;
const vcPer=id=>(Array.isArray(S&&S.people)?S.people:[]).find(p=>p&&p.k===vcK(id))||null;
const vcMenor=(v,e)=>!!v&&typeof v.edad==='number'&&v.edad<e;
const vcMenorP=p=>!!p&&p.vid!=null&&typeof p.age==='number'&&p.age<18;
const vcEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const vcCap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const vcLista=a=>a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' '+TXHZ.vecinos.y+' '+a[a.length-1];
const vcEdad=v=>typeof v.edad!=='number'?'':v.edad<1?VCF().bebe:vcT('edad',{e:v.edad});
function vcOficio(v){const o=v.oficio;if(Array.isArray(o)&&o.length)return vcCap((v.g==='m'?(o[1]||o[0]):o[0])||'');
  const e=v.estudia&&(VCF().estudia||{})[v.estudia];return e||'';}
function vcSitio(v){const C=DATA.personas||{},H=(C.hogares||{})[v.hogar],E=H&&(C.edificios||{})[H.edificio];if(!E||!E.n)return '';return E.n+(H.puerta?' · '+H.puerta:'');}
const vcResumen=v=>[vcOficio(v),vcSitio(v)].filter(Boolean).join(' · ');
// aspecto: el mismo que se ve en las escenas (pbLook), sobre el personaje base; estable y sin gastar azar
function vcCh(v){const ch=Object.assign({},DEFCHAR,pbLook(v));ch.age=v.edad;ch.faceSeed='v_'+v.id;ch.bday=[Math.floor(pbH(v.id+'m')*12),1+Math.floor(pbH(v.id+'d')*28)];delete ch.look;return ch;}
// de quién es una criatura: «hija de Nuria», «nieta de Marisa» o, si no hay lazo, con quién vive
function vcDeQuien(v){const L=v.lazos||[],g=v.g==='m'?1:0,nom=id=>{const q=vecinoPorId(id);return q&&q.n;};
  const pad=L.filter(l=>l[1]==='madre'||l[1]==='padre').map(l=>nom(l[0])).filter(Boolean);
  if(pad.length)return huecos(VCF().hijo_de[g],{quien:vcLista(pad)});
  const abu=L.filter(l=>l[1]==='abuela'||l[1]==='abuelo').map(l=>nom(l[0])).filter(Boolean);
  if(abu.length)return huecos(VCF().nieto_de[g],{quien:vcLista(abu)});
  const H=((DATA.personas||{}).hogares||{})[v.hogar],ad=H?(H.miembros||[]).map(vecinoPorId).filter(q=>q&&q.id!==v.id&&!vcMenor(q,18)).map(q=>q.n):[];
  return ad.length?vcT('vive_con',{quien:vcLista(ad)}):vcT('sin_familia');}
// probabilidad de caer bien: carisma, afinidad de ideas y, si te lo presenta alguien, mucho más
function vcProb(v,via){let c=.42+(lvl('carisma')||0)*.05;
  try{const a=S.ideo,b=v.ideo;if(a&&b){if(a===b&&a!=='apolitica')c+=.12;else if((LEFT.includes(a)&&RIGHT.includes(b))||(RIGHT.includes(a)&&LEFT.includes(b)))c-=.12;}}catch(e){}
  if(via)c+=.28;return Math.max(.15,Math.min(.92,c));}
// presentarse: pasa a S.people (una sola vez) y deja una tarjeta con lo que ha pasado
function vcConocer(v,o){if(typeof BM!=='undefined'&&BM.obs){toast(TXHZ.vecinos.desde_mapa_solo_mira_ve);return;}o=o||{};if(!v)return null;const ya=vcPer(v.id);if(ya)return ya;if(vcMenor(v,12))return null;
  const via=o.via||null,ok=Math.random()<vcProb(v,via);
  const rel=Math.round(((ok?16+Math.random()*8:6+Math.random()*4)+(via?8:0))*10)/10;
  const p={k:vcK(v.id),vid:v.id,hogar:v.hogar,n:v.n,g:v.g,age:v.edad,ch:vcCh(v),ideo:v.ideo||'apolitica',rel,love:0,stage:'conocida',
    e:'🙂',r:vcResumen(v),mi:null,met:TXHZ.vecinos.barrio,metDay:S.day,last:S.day,adult:!vcMenor(v,18),spark:0};
  if(via)p.via=via.id;
  S.people=Array.isArray(S.people)?S.people:[];S.people.push(p);
  S.needs.social=Math.min(100,(S.needs.social||0)+(ok?6:2));
  const vp=via?vcPer(via.id):null;if(vp)vp.rel=Math.min(100,(vp.rel||0)+1.5);
  const L=pickR(VCF()[via?(ok?'via_bien':'via_saludo'):(ok?'bien':'saludo')]||[['','']]);const vars={v:v.n,via:via?via.n:''};
  try{tell(via?vcT('diario_via',vars)+' '+huecos(L[1],vars):vcT('diario_conoce',{n:CH().name,v:v.n,linea:huecos(L[1],vars)}),'🤝');}catch(e){}
  try{sfxCard(ok?'🤝':'👋',huecos(L[0],vars),huecos(L[1],vars),ok?true:null,p,{rel:0,stage:p.stage});}catch(e){}
  return p;}
// charlar un rato con alguien ya conocido (una vez al día): sube la relación y avisa si se ha soltado
function vcCharla(p){if(typeof BM!=='undefined'&&BM.obs){toast(TXHZ.vecinos.desde_mapa_solo_mira_ve);return;}if(!p||vcMenorP(p))return false;const v=vecinoPorId(p.vid);if(!v)return false;
  const D=S.vcharla=S.vcharla||{};if(D[p.k]===S.day){toast(vcT('charla_hoy'));return false;}D[p.k]=S.day;
  const r0=p.rel||0,b={rel:r0,stage:p.stage};p.rel=Math.min(100,r0+2+Math.min(4,(lvl('carisma')||0)*.4)+Math.random()*1.5);p.last=S.day;
  S.needs.social=Math.min(100,(S.needs.social||0)+6);
  const L=pickR(VCF().charla||[['','']]),vars={v:v.n};let linea=huecos(L[1],vars);
  if(r0<VC_HIST&&p.rel>=VC_HIST)linea+=' '+vcT('sube_historia');else if(r0<VC_LAZOS&&p.rel>=VC_LAZOS)linea+=' '+vcT('sube_lazos');
  try{tell(vcT('diario_charla',{n:CH().name,v:v.n}),'💬');}catch(e){}
  try{sfxCard('💬',huecos(L[0],vars),linea,true,p,b);}catch(e){}return true;}
// ---------- la ficha ----------
let vcEl=null;
const vcClose=()=>{if(vcEl)vcEl.classList.remove('on');};
function vcFicha(v){const p=vcPer(v.id),m12=vcMenor(v,12),m18=vcMenor(v,18),f=VCF(),rel=p?Math.round(p.rel||0):0;
  let h=`<div class="vfh"><canvas class="vfp" width="144" height="144"></canvas><div class="vft"><b>${vcEsc(v.n)}</b><div class="vfs">${vcEsc([vcEdad(v),m12?'':vcOficio(v)].filter(Boolean).join(' · '))}</div>`;
  if(m12)h+=`<div class="vfq">${vcEsc(vcDeQuien(v))}</div>`;
  else if(p){const s=vcSitio(v);if(s)h+=`<div class="vfs">${huecos(TXHZ.vecinos.vive,{vcEsc:vcEsc(s)})}</div>`;}
  h+=`</div></div>`;
  if(m12)return h+`<div class="vfb"><button class="btn grey" data-vfc="1">${f.cerrar}</button></div>`;
  if(v.d)h+=`<div class="vfd">${vcEsc(v.d)}</div>`;
  if(p){h+=`<div class="vfbar"><span>${TXHZ.vecinos.relacion}</span><div class="bar"><i style="width:${rel}%"></i></div><b>${rel}</b></div>`;
    if(rel>=VC_HIST&&v.historia)h+=`<div class="vfsec">${f.historia_titulo}</div><div class="vfh2">${vcEsc(v.historia)}</div>`;else h+=`<div class="vfpi">${f.pista_historia}</div>`;
    if(rel>=VC_LAZOS){const rows=(v.lazos||[]).map(([id,t])=>{const o=vecinoPorId(id),lb=(f.lazo||{})[t];if(!o||!lb)return '';
        const act=vcPer(o.id)?`<i>${f.via_ya}</i>`:!vcMenor(o,12)?`<button class="mini" data-vfv="${o.id}">${f.via[o.g==='m'?1:0]}</button>`:'';
        return `<div class="vfl"><span>${lb[o.g==='m'?1:0]}: <b>${vcEsc(o.n)}</b></span>${act}</div>`;}).join('');
      if(rows)h+=`<div class="vfsec">${f.lazos_titulo}</div>${rows}`;}
    else if(rel>=VC_HIST)h+=`<div class="vfpi">${f.pista_lazos}</div>`;}
  h+=`<div class="vfb">`;
  if(!p)h+=`<button class="btn" data-vfp="1">${f.presentarse}</button>`;
  else if(!m18)h+=`<button class="btn" data-vfh="1">${f.charlar}</button>`;
  else h+=`<button class="btn" data-vfg="1">${f.ir_casa}</button>`;
  return h+`<button class="btn grey" data-vfc="1">${f.cerrar}</button></div>`;}
function vcOpen(v){if(!v)return;if(!vcEl){vcEl=document.createElement('div');vcEl.id='vecficha';document.body.appendChild(vcEl);
    addEventListener('pointerdown',e=>{if(vcEl.classList.contains('on')&&!vcEl.contains(e.target))vcClose();},true);}
  vcEl.innerHTML=vcFicha(v);vcEl.classList.add('on');
  const cv=vcEl.querySelector('.vfp');try{paintPortrait(cv,(vcPer(v.id)||{}).ch||vcCh(v),65);}catch(e){}
  const re=()=>{if(typeof menu!=='undefined'&&menu.classList.contains('open')&&typeof openMenu==='function')openMenu('gente');};
  vcEl.querySelectorAll('[data-vfc]').forEach(b=>b.onclick=vcClose);
  const bp=vcEl.querySelector('[data-vfp]');if(bp)bp.onclick=()=>{vcClose();vcConocer(v);};
  const bh=vcEl.querySelector('[data-vfh]');if(bh)bh.onclick=()=>{vcClose();vcCharla(vcPer(v.id));re();};
  const bg=vcEl.querySelector('[data-vfg]');if(bg)bg.onclick=()=>{vcClose();const p=vcPer(v.id);if(typeof menu!=='undefined')menu.classList.remove('open');if(p)peGo(p,'visita');};
  vcEl.querySelectorAll('[data-vfv]').forEach(b=>b.onclick=()=>{const o=vecinoPorId(b.dataset.vfv);if(o){vcClose();vcConocer(o,{via:v});re();}});}
// ---------- el toque en la escena: a un vecino con nombre (su figura o su rótulo) ----------
function vcHit(px,py){try{if(typeof RT==='undefined')return null;
  for(const q of RT.last||[]){if(q.vid==null||q.ana)continue;if(px>=q.x0-3&&px<=q.x1+3&&py>=q.y0-3&&py<=q.y1+3)return vecinoPorId(q.vid);}
  let best=null,bd=1e9;for(const q of RT.names||[]){if(q.vid==null||q.ana)continue;const h=RT.heads[q.id];if(!h)continue;const s=h.w/15||1;
    const x0=h.x-9*s-8,x1=h.x+9*s+8,y0=h.y-6,y1=h.y+58*s+6;if(px<x0||px>x1||py<y0||py>y1)continue;
    const d=Math.hypot(px-h.x,(py-(h.y+26*s))*.6);if(d<bd){bd=d;best=q;}}
  return best?vecinoPorId(best.vid):null;}catch(e){return null;}}
{const _lt=liveTap;liveTap=function(x,y){try{if(viewPlace){const v=vcHit(lastPtr[0],lastPtr[1]);if(v){sfx('tap');vcOpen(v);return;}}}catch(e){console.error(e);}return _lt.apply(this,arguments);};}
// ---------- no estar en dos sitios: con quien está de visita en tu casa o contigo de salida, no sale en su puesto ----------
function vcOcupados(){const s=new Set();for(const p of Array.isArray(S&&S.people)?S.people:[]){if(!p||p.vid==null)continue;
  if((S.outWith===p.k&&S.sim&&S.sim.work>0)||(S.res||[]).some(r=>r.pid===p.k&&!r.away))s.add(p.vid);}return s;}
{const _ve=vecinosEn;vecinosEn=function(){const out=_ve.apply(this,arguments);try{const oc=vcOcupados();return oc.size?out.filter(q=>!oc.has(q.v.id)):out;}catch(e){return out;}};}
// ---------- pestaña Gente: oficio y dónde vive, y la ficha; a menores, solo la ficha ----------
{const _lp=lookPerson;lookPerson=function(p){if(p&&p.vid!=null)return false;return _lp.apply(this,arguments);};} // el retrato ilustrado cambiaría la cara que ya se ve en la calle
{const _gt=genteTab;genteTab=function(){try{for(const p of S.people||[])if(p&&p.vid!=null){const v=vecinoPorId(p.vid);if(v)p.r=vcResumen(v);}}catch(e){}
  let h=_gt.apply(this,arguments);
  try{h=h.replace(/<div class="pbtn">([\s\S]*?)<\/div>/g,(m,inner)=>{const mm=/data-p="(v_[^"]+)"/.exec(inner);if(!mm)return m;
    const p=(S.people||[]).find(q=>q&&q.k===mm[1]);if(!p||p.vid==null)return m;
    const fb=`<button class="mini pmenu" data-vf="${p.vid}">${vcT('ficha')}</button>`;
    return vcMenorP(p)?`<div class="pbtn">${fb}</div>`:`<div class="pbtn">${fb}${inner}</div>`;});}catch(e){}
  return h;};}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-vf]');if(!b)return;ev.stopPropagation();vcOpen(vecinoPorId(b.dataset.vf));},true);
// ---------- menores fuera de lo que empieza solo: móvil, llamadas y visitas al azar ----------
{const _pp=phPeople;phPeople=function(){return _pp.apply(this,arguments).filter(p=>!vcMenorP(p));};}
{const _pc=phoneCall;phoneCall=function(){const all=S.people;if(!Array.isArray(all))return _pc.apply(this,arguments);S.people=all.filter(p=>!vcMenorP(p));try{return _pc.apply(this,arguments);}finally{S.people=all;}};}
{const _vs=vsCandidates;vsCandidates=function(){return _vs.apply(this,arguments).filter(x=>!(x&&vcMenorP(x[0])));};}
