const LOOKI={};const lookById=id=>LOOKS.find(l=>l.id===id);
const _lookWait=new Map();
function lookImg(id){let im=LOOKI[id];if(im)return im;const src=LOOK_SRC[id];if(!src)return null;im=new Image();im.onload=()=>{im._ok=1;for(const [c,a] of [..._lookWait]){if(a[1].look===id){_lookWait.delete(c);if(c.isConnected)paintPortrait(...a);}}if(typeof hudPorKey!=='undefined')hudPorKey='';};im.src=src;LOOKI[id]=im;return im;}
// aplica el aspecto de un look al personaje (cuerpo a juego con el retrato)
function applyLook(ch,id){const l=lookById(id);if(!l)return ch;ch.look=id;ch.g=l.g;ch.skin=l.skin;ch.hair=l.hair;ch.style=l.style;ch.beard=l.g==='f'?'no':(l.beard||'no');ch.glasses=!!l.glasses;if(l.eyes)ch.eyes=l.eyes;
  const [o,sh,pa,a2,sho,acc]=l.fit;ch.outfit=o;ch.shirt=sh;ch.pants=pa;ch.acc2=a2;ch.shoes=sho;ch.acc=[...acc];ch.capBack=false;delete ch.capc;ch.ofSig=ofSig(ch);return ch;}
{const _pp=paintPortrait;paintPortrait=function(c,ch,md=65,nobg){
  if(!c)return;if(ch&&ch.look&&LOOK_SRC[ch.look]){const im=lookImg(ch.look);const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);
    if(im&&im._ok){x.clearRect(0,0,c.width,c.height);const S0=im.width,cr=nobg?S0*.74:S0*.94,sx=(S0-cr)/2,sy=nobg?S0*.1:S0*.03;x.imageSmoothingQuality='high';x.drawImage(im,sx,sy,cr,cr,0,0,c.width,c.height);_lookWait.delete(c);return;}
    _lookWait.set(c,[c,ch,md,nobg]);}
  return _pp(c,ch,md,nobg);};}
// ---- vecinos con look: identidad completa ----
function lookUsed(){const s=new Set();for(const p of S.people||[])if(p.ch&&p.ch.look)s.add(p.ch.look);if(S.char&&S.char.look)s.add(S.char.look);return s;}
const _lum=h=>{const n=parseInt(h.slice(1),16);return ((n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11)/255;};
function pickLook(g,age,opt={}){const used=lookUsed();let c=LOOKS.filter(l=>!l.self&&!used.has(l.id)&&(g==='x'||l.g===g));
  if(age!=null)c=c.filter(l=>Math.abs(l.age-age)<=(opt.tol||12));
  if(opt.skin){const L0=_lum(opt.skin);c=c.filter(l=>Math.abs(_lum(l.skin)-L0)<.16);}
  if(!c.length)return null;c.sort((a,b)=>Math.abs(a.age-(age??a.age))-Math.abs(b.age-(age??b.age)));return pickR(c.slice(0,3));}
function lookPerson(p,full){const g=personG(p);let l;if(g==='x')return false;
  if(p.k==='madre'){l=window.creMom&&lookById(window.creMom)||pickLook('f',60,{tol:22});}
  else if(p.k==='vecina')l=pickLook(g,60,{tol:25});
  else{l=pickLook(g,p.age||CH().age||30,{tol:full?14:12});if(!l&&full&&!p.romantic)l=pickLook(g,null);}
  if(!l)return false;p.ch=applyLook(p.ch||personCh(p),l.id);p.ch.age=p.age=full||p.k==='vecina'?l.age:(p.age||l.age);p.ch.name=p.n;
  if(full){p.n=p.ch.name=l.n;p.job=l.job;if(l.ideo)p.ideo=l.ideo;}
  if(p.k==='madre'){p.age=p.ch.age=Math.max(l.age,(CH().age||27)+20);p.g='f';return true;}p.bio=l.bio;p.ltr=l.traits;p.g=l.g;return true;}
{const _np=newPerson;newPerson=function(where,romantic){const p=_np(where,romantic);p.romantic=!!romantic;
  const used=new Set([CH().name,...(S.people||[]).filter(q=>q!==p).map(q=>q.n)]);
  const ok=lookPerson(p,true);if(ok&&used.has(p.n)){/* nombre repetido: conserva el aleatorio */}
  delete p.romantic;if(ok)p.r=roleTxt(p);return p;};}
function lookSweep(){if(!S||!S.people)return;for(const p of S.people){if(p.ch&&p.ch.look)continue;if(p.noLook===S.day)continue;if(!lookPerson(p,false))p.noLook=S.day;}}
// ---- creador: elegir un look ----
{const _rc=renderCreator;renderCreator=function(diff,edit){_rc(diff,edit);
  const pre=card.querySelector('.crepre');if(!pre)return;const row=pre.nextElementSibling.nextElementSibling;
  const box=document.createElement('div');box.innerHTML=`<div class="clab">Look</div><div class="lookstrip"><button class="lk${cre.look?'':' on'}" data-lk=""><span>✏️</span><small>Cara a mano</small></button>${LOOKS.map(l=>`<button class="lk${cre.look===l.id?' on':''}" data-lk="${l.id}"><img src="${LOOK_SRC[l.id]}" alt=""><small>${l.self?'⭐ ':''}${l.n}</small></button>`).join('')}</div>${cre.look?'<div class="sub" style="font-size:11.5px">La cara viene del retrato. Piel, pelo y ropa del cuerpo se ajustan solos; puedes retocarlos abajo.</div>':''}`;
  row.after(box);const ls=box.querySelector('.lookstrip');const on=ls.querySelector('.on');if(on)ls.scrollLeft=Math.max(0,on.offsetLeft-ls.clientWidth/2+40);
  box.querySelectorAll('[data-lk]').forEach(b=>b.onclick=()=>{const id=b.dataset.lk;if(!id){delete cre.look;}else{const l=lookById(id);if(NAMES[cre.g].includes(cre.name)||LOOKS.some(q=>q.n===cre.name))cre.name=l.n;applyLook(cre,id);const ages=[20,24,27,32,38,45,55];cre.age=ages.reduce((a,b)=>Math.abs(b-l.age)<Math.abs(a-l.age)?b:a);}renderCreator(diff,edit);});
  if(cre.look){const h3=[...card.querySelectorAll('h3')].find(e=>e.textContent.includes('Cara'));if(h3){let e=h3;while(e&&!(e.classList.contains('clab')&&e.textContent.startsWith('Compl'))){const n=e.nextElementSibling;e.style.display='none';e=n;}}}
  card.querySelectorAll('[data-k="g"]').forEach(b=>{const o=b.onclick;b.onclick=()=>{if(cre.look&&lookById(cre.look).g!==b.dataset.v)delete cre.look;o();};});
};}
{const _oc=openCreator;openCreator=function(diff,edit){if(!edit){const l=pickR(LOOKS.filter(l=>!l.self));cre=null;_oc(diff,edit);if(cre&&!edit){applyLook(cre,l.id);cre.name=l.n;cre.age=[20,24,27,32,38,45,55].reduce((a,b)=>Math.abs(b-l.age)<Math.abs(a-l.age)?b:a);renderCreator(diff,edit);}return;}_oc(diff,edit);};}
{const _gt=genteTab;genteTab=function(...a){try{lookSweep();}catch(e){console.error(e);}return _gt.apply(this,a);};}
{const _ip=initPeople;initPeople=function(...a){const r=_ip.apply(this,a);try{lookSweep();}catch(e){console.error(e);}return r;};}
{const FEMN=new Set(['Carmen','Manoli','Rosa','Pilar','Maite','Concha','Lola','Isabel','Inés','Nur','Raquel','Mercedes','Dolores','Consuelo','Belén','Rocío','Pilar']);const _pg=personG;personG=function(p){if(!p.g&&FEMN.has(p.n))return 'f';return _pg(p);};}
// madre elegible en el creador
const MOM_LOOKS=()=>LOOKS.filter(l=>l.g==='f'&&l.age>=40);
{const _rc2=renderCreator;renderCreator=function(diff,edit){_rc2(diff,edit);
  const strip=card.querySelector('.lookstrip');if(!strip)return;const host=strip.parentElement;
  const cur=edit?((P_('madre')||{}).ch||{}).look||'':(window.creMom||'');
  const box=document.createElement('div');box.innerHTML=`<div class="clab">Su madre</div><div class="lookstrip"><button class="lk${cur?'':' on'}" data-mom=""><span>🎲</span><small>Al azar</small></button>${MOM_LOOKS().map(l=>`<button class="lk${cur===l.id?' on':''}" data-mom="${l.id}"><img src="${LOOK_SRC[l.id]}" alt=""><small>${l.n}</small></button>`).join('')}</div>`;
  host.after(box);
  box.querySelectorAll('[data-mom]').forEach(b=>b.onclick=()=>{const id=b.dataset.mom;window.creMom=id||null;
    if(edit){const m=P_('madre');if(m){if(id){const l=lookById(id);m.ch=applyLook(m.ch||personCh(m),id);m.ch.name=m.n;m.age=m.ch.age=Math.max(l.age,(CH().age||27)+20);m.bio=null;m.ltr=null;delete m.noLook;}else{delete m.ch;m.noLook=null;}save();}}
    renderCreator(diff,edit);});
};}
