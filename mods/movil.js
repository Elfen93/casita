// =================== EL MÓVIL: mensajes, llamadas, noticias, red social, banco ===================
const {movil:TXMV}=DATA;
const PH=()=>{if(!S.ph)S.ph={th:{},un:{},feed:[],next:0,bal:[],used:0,usedDay:0,posts:0};const p=S.ph;p.th=p.th||{};p.un=p.un||{};p.feed=p.feed||[];p.bal=p.bal||[];return p;};
const phNow=()=>S.day*1440+S.t;
const phHM=m=>{const t=((m%1440)+1440)%1440;return String(t/60|0).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');};
const kidW=()=>'hij'+oa();
function phPeople(){return (S.people||[]).filter(p=>p&&p.k&&p.stage!=='muerta');}
function phRole(p){if(p.k==='madre')return 'madre';if(isPartner(p)||p.stage==='rollo'||p.stage==='cita')return 'amor';if(p.k==='compi')return 'compi';if(p.k==='vecina')return 'vecina';if(p.k==='amiga'||p.stage==='amiga')return 'amiga';if(p.stage==='ex')return 'ex';return 'conocida';}
// --- plantillas: [texto, tipo de respuesta] (textos y respuestas en data/movil.json; aquí, cuándo salen y con qué peso) ---
function phTemplates(p){const r=phRole(p),h=S.t/60,L=[];
  const jl=S.jobless,str=S.strike&&S.strike.on,crisis=W_().crisis>=60,rent=!S.owned;const lo=LIFE().orient;const nov=lo==='hombres'?'novio':lo==='mujeres'?'novia':'novie';
  const V={kid:kidW(),nov};const hr=x=>typeof x==='string'?huecos(x,V):Array.isArray(x)?x.map(hr):x;const add=(d,w=1)=>L.push([huecos(d.t,V),d.r===undefined?'gen':typeof d.r==='string'?d.r:hr(d.r),w]);const T=TXMV.plantillas[r];
  if(r==='madre'){add(T.comido,2);add(T.domingo,1.5);add(T.audio,1.2);add(T.tia,1);add(T.luz,1);add(T.delgad,1);add(T.gatito,h<11?2:.3);
    if(jl)add(T.paro,2);
    if(rent)add(T.casero,crisis?1.5:.5);}
  else if(r==='amor'){add(T.haces,2);add(T.pienso,1.5);add(T.cenamos,h>=16&&h<21?2.5:.4);add(T.dormir,h>=19?1.5:.2);add(T.curro,1);add(T.perro,1);add(T.buenos_dias,h<11?2:.2);}
  else if(r==='compi'){add(T.jefe,2);add(T.recortes,crisis?2:.8);add(T.asamblea,S.office&&S.office.org>25?1.5:.6);add(T.meme,1.2);
    if(str)add(T.piquete,3);}
  else if(r==='vecina'){add(T.ascensor,1.5);add(T.reunion,1);add(T.carta,rent?.6:1.2);add(T.tupper,.8);}
  else if(r==='amiga'){add(T.canas,2);add(T.meme,1.5);add(T.alquiler,rent||crisis?1.6:.7);add(T.echo_menos,1.2);add(T.noticias,1);if(jl)add(T.curro_paro,2);}
  else if(r==='ex'){add(T.hola,1);add(T.peli,.6);}
  else{add(T.hola,1);add(T.quedar,1);add(T.enlace,.6);}
  return L;}
const PH_REP=DATA.interacciones.movil_respuestas;
function phRepOpts(k){const g=s=>s&&s.replace(/\{o\}/g,oa());return (Array.isArray(k)?k:(PH_REP[k]||PH_REP.gen)).map(([t,rel,act,back,say])=>{const q=t.match(/«([^»]+)»/);return [g(t),rel,act,g(back),say===undefined?(q?g(q[1]):null):g(say)];});}
function phPush(pk,m){const P=PH();const th=P.th[pk]||(P.th[pk]=[]);th.push(m);if(th.length>40)th.splice(0,th.length-40);}
function phIncoming(p,txt,k){phPush(p.k,{f:'t',t:txt,k,m:phNow(),open:!!(Array.isArray(k)||PH_REP[k])});const P=PH();P.un[p.k]=(P.un[p.k]||0)+1;phBadge();
  if(!phOpenNow())toast(huecos(TXMV.avisos.mensaje,{p:p.n,txt:txt.replace(/<[^>]+>/g,'').slice(0,46),mas:txt.length>46?'…':''}));else phRender();}
function phPick(L){let t=0;for(const x of L)t+=x[2];let r=Math.random()*t;for(const x of L){r-=x[2];if(r<=0)return x;}return L[0];}
function phTick(){if(!S||!S.people)return;const P=PH(),now=phNow(),h=S.t/60;
  if(!P.next){P.next=now+60+Math.random()*120;return;}
  if(now<P.next)return;
  const night=h<7.5||h>=23.5;P.next=now+(night?240:50+Math.random()*170);if(night)return;
  const ppl=phPeople().filter(p=>p.stage!=='ex'||Math.random()<.15);if(!ppl.length)return;
  // más mensajes de quien más te quiere
  const w=p=>(phRole(p)==='amor'?4:phRole(p)==='madre'?2.6:phRole(p)==='amiga'?2.2:phRole(p)==='compi'?(S.jobless?.4:1.6):phRole(p)==='vecina'?.8:.5)*(0.4+(p.rel||30)/100);
  let tot=ppl.reduce((a,p)=>a+w(p),0),r=Math.random()*tot,pp=ppl[0];for(const p of ppl){r-=w(p);if(r<=0){pp=p;break;}}
  const th=P.th[pp.k]||[];const lastOpen=th.length&&th[th.length-1].f==='t'&&th[th.length-1].open;if(lastOpen&&Math.random()<.85)return;
  const recent=th.slice(-8).map(m=>m.t);const cand=phTemplates(pp).filter(x=>!recent.includes(x[0]));if(!cand.length)return;const [txt,k]=phPick(cand);phIncoming(pp,txt,k);}
function phAnswer(pk,i,oi){const P=PH(),th=P.th[pk],m=th&&th[i];const p=(S.people||[]).find(q=>q.k===pk);if(!m||!m.open||!p)return;m.open=false;
  const [t,rel,act,back,say]=phRepOpts(m.k)[oi];if(say)phPush(pk,{f:'me',t:say,m:phNow()});else if(act!=='call')phPush(pk,{f:'sys',t:rel<0?'(visto)':'',m:phNow()});
  p.rel=Math.max(0,Math.min(100,(p.rel||30)+rel));p.last=S.day;if(rel>0)S.needs.social=Math.min(100,S.needs.social+3+rel);if(act==='love'&&p.love!=null)p.love=Math.min(100,p.love+3);
  if(back)setTimeout(()=>{if(!S)return;phPush(pk,{f:'t',t:back,m:phNow()});if(phOpenNow())phRender();else{PH().un[pk]=(PH().un[pk]||0)+1;phBadge();}},1400+Math.random()*2200);
  if(act==='call'){phCall(p);return;}
  if(act==='home'){phClose();inviteHome(p,false);return;}
  if(act==='stay'){phClose();inviteHome(p,true);return;}
  if(act==='out'){const why=outAvail('amigos');if(why&&why!=='solo en días libres'){toast(huecos(TXMV.avisos.no_puede,{why}));return;}phClose();S.outWith=p.k;S.dateOut=['cita','rollo','pareja','convive','casada'].includes(p.stage);doOut('amigos');return;}
  if(act==='org'&&S.office){S.office.org=Math.min(100,(S.office.org||0)+2);}
  if(act==='gossip'){const pt=partner()||(S.people||[]).find(q=>['cita','rollo'].includes(q.stage));setTimeout(()=>{phPush(pk,{f:'me',t:pt?huecos(TXMV.avisos.gossip_yo,{pt:pt.n}):TXMV.avisos.gossip_nada,m:phNow()});phIncoming(p,pt?huecos(TXMV.avisos.gossip_ella,{pt:pt.n,la:pt.g==='m'||pt.g==='o'?'o':'a'}):TXMV.avisos.gossip_ella_nada,'gen');},3500);}
  phRender();}
// --- llamadas ---
function phCall(p){phApp='call';phCallP=p.k;phCallT=performance.now();phRender();
  setTimeout(()=>{if(phApp!=='call'||phCallP!==p.k)return;try{callP(p);}catch(e){console.error(e);}
    phCallRes=huecos(TXMV.llamada.hablaron,{m:10+(Math.random()*35|0),tema:pickR(TXMV.llamada.temas)});phRender();},2200);}
// --- noticias ---
function phNews(){const w=W_(),G=(typeof GOVS!=='undefined'&&GOVS[w.gov])||null,c=w.crisis,out=[];const R=(s)=>{let x=0;for(const ch of s)x=(x*31+ch.charCodeAt(0))>>>0;return x;};const d=S.day;
  const pick=(arr,salt)=>arr[(R(salt+d)%arr.length)];
  const N=TXMV.noticias;
  if(G)out.push([N.gobierno.e,huecos(N.gobierno.t,{gob:G.n,frase:pick(N.gobierno.frases,'g')}),G.fx]);
  out.push(c>=65?N.crisis_alta:c>=40?N.crisis_media:N.crisis_baja);
  out.push([N.vivienda.e,pick(N.vivienda.frases,'h'),'']);
  if(w.mov>=50)out.push([N.movimiento.e,pick(N.movimiento.frases,'m'),N.movimiento.sub]);
  if(S.strike&&S.strike.on)out.push([N.huelga.e,huecos(N.huelga.t,{empresa:office().n}),N.huelga.sub]);
  if(w.elec!=null&&w.elec<20)out.push([N.elecciones.e,huecos(N.elecciones.t,{d:w.elec}),N.elecciones.sub]);
  out.push([N.futbol.e,pick(N.futbol.frases,'f'),'']);
  out.push([N.tiempo.e,huecos(N.tiempo.t,{tiempo:S.weather?huecos(N.tiempo.con,{e:WX[S.weather.k].e,t:S.weather.t}):N.tiempo.sin,frase:pick(N.tiempo.frases,'w')}),'']);
  return out;}
// --- red social ---
function phFeedDaily(){const P=PH();const ppl=phPeople();if(!ppl.length)return;const n=1+(Math.random()*3|0);
  const T=p=>pickR(TXMV.feed[phRole(p)]);
  for(let i=0;i<n;i++){const p=pickR(ppl);P.feed.unshift({pk:p.k,txt:T(p),d:S.day,likes:(Math.random()*12|0),liked:false});}
  if(P.feed.length>30)P.feed.length=30;
  P.bal.push([S.day,Math.round(S.money)]);if(P.bal.length>15)P.bal.splice(0,P.bal.length-15);}
function phPost(){const P=PH();if(P.lastPost===S.day){toast(TXMV.publicar.ya);return;}P.lastPost=S.day;
  const td=S.today||{},PB=TXMV.publicar,opts=[td.out?huecos(PB.salida,{out:String(td.out).replace(/<[^>]+>/g,'').slice(0,70)}):PB.tranquilo,S.jobless?PB.paro:PB.trabajo,S.ideo!=='apolitica'?PB.politico:PB.apolitico];
  const txt=pickR(opts);const fr=phPeople().length;const likes=Math.max(0,Math.round(fr*(.3+Math.random()*.6)+(lvl('carisma')||0)));
  P.feed.unshift({pk:'me',txt,d:S.day,likes,liked:false});if(P.feed.length>30)P.feed.length=30;
  S.needs.social=Math.min(100,S.needs.social+Math.min(14,likes*1.5));S.needs.diversion=Math.min(100,S.needs.diversion+4);
  const pt=partner();if(pt&&Math.random()<.25){setTimeout(()=>phIncoming(pt,TXMV.publicar.pareja,'gen'),2500);}
  else{const p=pickR(phPeople());if(p)setTimeout(()=>phIncoming(p,pickR(TXMV.publicar.amigos),'risa'),2000);}
  toast(huecos(TXMV.publicar.hecho,{likes}));phRender();}
// --- interfaz ---
let phFocus=false,phApp=null,phThread=null,phCallP=null,phCallT=0,phCallRes=null,phEl=null;
const phOpenNow=()=>!!(phEl&&phEl.classList.contains('on'));
function phBadge(){const b=document.getElementById('phbadge');if(!b||!S)return;const n=Object.values(PH().un).reduce((a,b)=>a+b,0);b.textContent=n>9?'9+':n;b.style.display=n?'flex':'none';}
function phOpen(app){if(!phEl){phEl=document.createElement('div');phEl.id='phone';document.body.appendChild(phEl);phEl.addEventListener('pointerdown',e=>{if(e.target===phEl)phClose();});}
  phApp=app||null;phThread=null;phEl.classList.add('on');S.sim.phoneUntil=phNow()+15;phRender();}
function phClose(){if(phEl)phEl.classList.remove('on');phApp=null;phThread=null;phCallRes=null;}
const APPS=TXMV.apps;
function phRender(){if(!phEl||!S)return;const P=PH();const n=CH().name;const UI=TXMV.ui;const now=phNow();S.sim.phoneUntil=Math.max(S.sim.phoneUntil||0,now+10);
  const bat=Math.max(5,100-((S.t/1440)*60|0));let h=`<div class="phf"><div class="phs"><span>${phHM(S.t)}</span><span class="phcam"></span><span>📶 ${bat}%</span></div><div class="phb">`;
  const back=`<button class="phback" data-ph="home">‹</button>`;
  const avatar=p=>p&&p.ch&&p.ch.look&&LOOK_SRC[p.ch.look]?`<img class="phav" src="${LOOK_SRC[p.ch.look]}">`:`<span class="phav phave">${p?(p.e||'🙂'):'🙂'}</span>`;
  if(!phApp){h+=`<div class="phwall"><div class="phclock">${phHM(S.t)}</div><div class="phdate">${huecos(UI.fecha,{sem:WDL[dateOf(S.day).wd],dm:dateOf(S.day).dm,mes:MONTHS[dateOf(S.day).m].toLowerCase()})}</div></div><div class="phgrid">`+APPS.map(([k,e,t,c])=>{const un=k==='msg'?Object.values(P.un).reduce((a,b)=>a+b,0):0;return `<button class="phapp" data-ph="${k}"><span style="background:${c}">${e}${un?`<i>${un}</i>`:''}</span><small>${t}</small></button>`;}).join('')+`</div>`;}
  else if(phApp==='msg'&&!phThread){h+=`<div class="phtop">${back}<b>${UI.mensajes}</b></div><div class="phlist">`;
    const ppl=phPeople().map(p=>{const th=P.th[p.k]||[];return {p,last:th[th.length-1]};}).sort((a,b)=>(b.last?b.last.m:-1)-(a.last?a.last.m:-1));
    for(const {p,last} of ppl)h+=`<button class="phrow" data-th="${p.k}">${avatar(p)}<span class="phrt"><b>${p.n}</b><small>${last?(last.f==='me'?UI.tu:'')+last.t.replace(/<[^>]+>/g,'').slice(0,38):UI.sin_mensajes}</small></span>${P.un[p.k]?`<i class="phun">${P.un[p.k]}</i>`:last?`<small class="phtm">${phHM(last.m)}</small>`:''}</button>`;
    h+=`</div>`;}
  else if(phApp==='msg'&&phThread){const p=(S.people||[]).find(q=>q.k===phThread);P.un[phThread]=0;phBadge();const th=P.th[phThread]||[];
    h+=`<div class="phtop"><button class="phback" data-ph="msg">‹</button>${avatar(p)}<b>${p?p.n:''}</b><button class="phic" data-callp="${phThread}">📞</button></div><div class="phchat" id="phchat">`;
    let lastD=null;th.forEach((m,i)=>{const d=Math.floor(m.m/1440);if(d!==lastD){lastD=d;h+=`<div class="phday">${d===S.day?UI.hoy:d===S.day-1?UI.ayer:huecos(UI.dia,{d})}</div>`;}
      if(m.f==='sys'){if(m.t)h+=`<div class="phday">✓✓ ${m.t}</div>`;}else h+=`<div class="phm ${m.f==='me'?'me':''}">${m.t}<small>${phHM(m.m)}</small></div>`;
      if(m.open&&i===th.length-1)h+=`<div class="phreps">${phRepOpts(m.k).map((o,oi)=>`<button data-rep="${i}:${oi}">${o[0]}</button>`).join('')}</div>`;});
    if(!th.length)h+=`<div class="phempty">${UI.vacio}</div>`;
    h+=`</div><div class="phcomp">${UI.rapidos.map(([t],i)=>`<button data-say="${i}">${t}</button>`).join('')}</div><form class="phwrite" id="phwrite"><input id="phin" maxlength="140" placeholder="${UI.escribe}" autocomplete="off"><button type="submit">➤</button></form>`;}
  else if(phApp==='call'){const p=phCallP&&(S.people||[]).find(q=>q.k===phCallP);
    if(p){h+=`<div class="phcallsc">${avatar(p)}<b>${p.n}</b><small>${phCallRes||UI.llamando}</small><button class="phhang" data-ph="callend">${phCallRes?UI.colgar:'📵'}</button></div>`;}
    else{h+=`<div class="phtop">${back}<b>${UI.contactos}</b></div><div class="phlist">`+phPeople().map(p=>`<button class="phrow" data-callp="${p.k}">${avatar(p)}<span class="phrt"><b>${p.n}</b><small>${p.r||''}</small></span><span class="phtm">📞</span></button>`).join('')+`</div>`;}}
  else if(phApp==='news'){h+=`<div class="phtop">${back}<b>${UI.noticias}</b></div><div class="phlist">`+phNews().map(([e,t,s])=>`<div class="phnews"><span>${e}</span><div><b>${t}</b>${s?`<small>${s}</small>`:''}</div></div>`).join('')+`</div>`;}
  else if(phApp==='red'){h+=`<div class="phtop">${back}<b>${UI.fotogram}</b><button class="phic" data-ph="post">➕</button></div><div class="phlist">`;
    if(!P.feed.length)h+=`<div class="phempty">${UI.sin_publicaciones}</div>`;
    P.feed.forEach((f,i)=>{const p=f.pk==='me'?null:(S.people||[]).find(q=>q.k===f.pk);const nm=f.pk==='me'?n:(p?p.n:UI.alguien);const e=(f.txt.match(/^\S+/)||['📷'])[0];
      h+=`<div class="phpost"><div class="phph">${f.pk==='me'?avatar({ch:CH()}):avatar(p)}<b>${nm}</b><small>${f.d===S.day?UI.hoy_min:huecos(UI.hace,{d:S.day-f.d})}</small></div><div class="phpic">${e}</div><div class="phcap">${f.txt.replace(/^\S+\s*/,'')}</div><button class="phlike${f.liked?' on':''}" data-like="${i}">${f.liked?'❤️':'🤍'} ${f.likes+(f.liked?1:0)}</button></div>`;});
    h+=`</div>`;}
  else if(phApp==='bank'){const sal=S.jobless?0:salary();const rent=housingWeekly();const rows=(P.bal||[]).slice(-7);const BK=UI.banco;
    h+=`<div class="phtop">${back}<b>${BK.titulo}</b></div><div class="phlist"><div class="phbal"><small>${BK.saldo}</small><b class="${S.money<0?'neg':''}">${fmt(Math.round(S.money))}</b><small>${S.money<0?BK.descubierto:BK.disponible}</small></div>`;
    h+=`<div class="phkv"><span>${BK.ingreso}</span><b>${sal?fmt(sal):'—'}</b></div><div class="phkv"><span>${S.owned?BK.hipoteca:BK.alquiler}</span><b>${rent?fmt(rent):'—'}</b></div><div class="phkv"><span>${BK.colchon}</span><b>${fmt(reserveMoney())}</b></div>`;
    if(rows.length>1){h+=`<div class="phday">${BK.ultimos}</div>`;for(let i=rows.length-1;i>0;i--){const d=rows[i][1]-rows[i-1][1];h+=`<div class="phkv"><span>${huecos(BK.dia,{d:rows[i][0]})}</span><b class="${d<0?'neg':'pos'}">${d>=0?'+':''}${fmt(d)}</b></div>`;}}
    h+=`</div>`;}
  h+=`</div><div class="phhome" data-ph="home"></div></div>`;
  phEl.innerHTML=h;const chat=phEl.querySelector('#phchat');if(chat)chat.scrollTop=chat.scrollHeight;
  phEl.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>{const k=b.dataset.ph;
    if(k==='home'){if(phApp==='call'&&phCallP){phCallP=null;phCallRes=null;}phApp=null;phThread=null;phRender();return;}
    if(k==='callend'){phCallP=null;phCallRes=null;phApp='call';phRender();return;}
    if(k==='post'){phPost();return;}
    if(k==='citas'){phClose();try{datingApp(false);}catch(e){console.error(e);}return;}
    if(k==='cal'){phClose();try{openCalendar();}catch(e){console.error(e);}return;}
    if(k==='curro'){phClose();openMenu('trabajo');return;}
    phApp=k;phThread=null;phCallP=null;phCallRes=null;phRender();});
  phEl.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{phThread=b.dataset.th;phRender();});
  phEl.querySelectorAll('[data-callp]').forEach(b=>b.onclick=()=>{const p=(S.people||[]).find(q=>q.k===b.dataset.callp);if(p)phCall(p);});
  phEl.querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{const [i,oi]=b.dataset.rep.split(':').map(Number);phAnswer(phThread,i,oi);});
  phEl.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>{const p=(S.people||[]).find(q=>q.k===phThread);if(!p)return;const i=+b.dataset.say;const t=UI.rapidos[i][1];
    const P2=PH();if(P2.lastSay&&P2.lastSay[p.k]===phNow()>>4){return;}P2.lastSay=P2.lastSay||{};P2.lastSay[p.k]=phNow()>>4;
    phPush(p.k,{f:'me',t,m:phNow()});p.last=S.day;S.needs.social=Math.min(100,S.needs.social+4);
    setTimeout(()=>{const k=i===1?'canas':i===2?(phRole(p)==='amor'?'amor':'carino'):'gen';const RP=TXMV.libre.rapidas,ans=huecos(i===1?(p.rel>40?RP.quedamos_si:RP.quedamos_no):i===2?(p.rel>50?RP.carino_si:RP.carino_no):pickR(RP.hola),{po:pO(p)});
      if(i===2){p.rel=Math.min(100,p.rel+(p.rel>50?3:-1));if(p.love!=null&&['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+2);}else p.rel=Math.min(100,p.rel+2);
      phIncoming(p,ans,i===1&&p.rel>40?'canas':'gen');},1500+Math.random()*2000);phRender();});
  {const f=phEl.querySelector('#phwrite');if(f){const inp=f.querySelector('#phin');f.onsubmit=e=>{e.preventDefault();const t=inp.value.trim();if(!t)return;const p=(S.people||[]).find(q=>q.k===phThread);if(!p)return;phFree(p,t);};if(phFocus){inp.focus();phFocus=false;}}}
  phEl.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const f=PH().feed[+b.dataset.like];if(!f||f.liked)return;f.liked=true;const p=(S.people||[]).find(q=>q.k===f.pk);if(p)p.rel=Math.min(100,p.rel+1);phRender();});
}
// botón 📱 en la barra lateral
{const side=document.getElementById('side');if(side&&!document.getElementById('phbtn')){const b=document.createElement('div');b.className='pill glass';b.id='phbtn';b.title=TXMV.avisos.titulo;b.innerHTML='📱<span class="badge" id="phbadge" style="display:none">0</span>';const mb=document.getElementById('menubtn');(mb?mb.after(b):side.prepend(b));b.onclick=()=>phOpenNow()?phClose():phOpen();}}
// cada minuto de juego: mensajes nuevos; cada día: red social y saldo
{const _up2=update;update=function(gm){const d0=S.day;const r=_up2.apply(this,arguments);try{phTick();if(S.day!==d0)phFeedDaily();if(phOpenNow()&&phApp==='call'&&phCallP&&!phCallRes){}
  if(S.sim.phoneUntil&&phNow()<S.sim.phoneUntil&&!S.sim.work&&!S.sim.use){S.needs.diversion=Math.min(100,S.needs.diversion+.05*gm);S.needs.social=Math.min(100,S.needs.social+.03*gm);}}catch(e){console.error(e);}return r;};}
// Ana mira el móvil cuando no tiene nada que hacer (y saca el móvil si lo estás usando tú)
{const _ao=anaOpts;anaOpts=function(){const o=_ao.apply(this,arguments);const s=S.sim;if(!o.act&&s.phoneUntil&&phNow()<s.phoneUntil&&!s.use&&!(s.path&&s.path.length))o.act='phone';return o;};}
{const _au2=autonomy;autonomy=function(){const s=S.sim,nd=S.needs,now=phNow();
  if(s.phoneUntil&&now<s.phoneUntil&&!phOpenNow()){if(['hambre','vejiga','energia','higiene'].some(k=>nd[k]<35))s.phoneUntil=0;else return;}
  if(!phOpenNow()&&Math.random()<.07&&S.t/60>=8&&S.t/60<23.5&&!['hambre','vejiga','energia','higiene'].some(k=>nd[k]<50)&&(nd.diversion<92||nd.social<92)){
    const P=PH();if(P.usedDay!==S.day){P.usedDay=S.day;P.used=0;}if(P.used<150){const m=10+Math.random()*20;P.used+=m;s.phoneUntil=now+m;
      if(P.used>=150&&throttled('enganche',3e5))tell(huecos(TXMV.avisos.enganche,{}),'📱');return;}}
  return _au2.apply(this,arguments);};}
// también la gente que vive en casa mira el móvil a ratos
{const _dr2=drawResident;drawResident=function(r){if(r.away)return;if(r.doing||(r.path&&r.path.length)||r.kind==='kid')return _dr2(r);const near=Math.hypot(r.x-S.sim.x,r.y-S.sim.y)<1.6&&!(S.sim.work>0);
  const slot=Math.floor(performance.now()/26000+(r.pid||'').length*1.7)%3;if(near||slot!==0)return _dr2(r);
  const p=r.pid&&S.people.find(q=>q.k===r.pid);if(!p)return _dr2(r);const ch=p.ch||personCh(p);const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);const sv=anaRT.phase;anaRT.phase=0;
  ctx.save();drawAna(bx,by,{ch,shirt:ch.shirt,mood:70,front:r.front!==false,right:!!r.right,pose:'stand',act:'phone'});ctx.restore();anaRT.phase=sv;if(cam.z>0.7)label((r.kind==='partner'?'❤️ ':'')+p.n,bx,by-66,'rgba(255,253,248,.9)','#3b3247',8);};}
// abrir el móvil también desde la app de citas antigua y con la tecla M
addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){phOpenNow()?phClose():phOpen();}});
setInterval(()=>{try{phBadge();if(phOpenNow()&&phApp!=='msg')phEl.querySelector('.phs span').textContent=phHM(S.t);}catch(e){}},1000);

// --- cuando escribes tú: entiende lo básico y contesta como quien es ---
function phFree(p,t){const P=PH();const th=P.th[p.k]||[];const last=th[th.length-1];if(last&&last.open)last.open=false;
  phPush(p.k,{f:'me',t,m:phNow()});phFocus=true;phRender();
  const r=phRole(p),k=t.toLowerCase();const has=(...w)=>w.some(x=>k.includes(x));
  let rel=1,love=0,act=null,ans;
  const warm=has('te quiero','te echo de menos','❤','😘','gracias','guap','cariño','mamá','mami','abrazo');const rude=has('pesad','déjame','dejame','paso','cállate','callate','mierda','joder','no me rayes','tonto','tonta');
  const plan=has('quedamos','cañas','cenar','cena','comer','vemos','tomar algo','salir','cine','domingo','vienes','vente','ven a casa','casa');const q=k.includes('?')||has('qué','que tal','cómo','como estás','como estas','dónde','donde');
  const money=has('dinero','pasta','alquiler','paro','euros','€','pagar','cobr','sueldo');const work=has('curro','trabajo','jefe','turno','horas');const sleep=has('dormir','quedarte','quedas a dormir','noche');
  const study=has('estudi','clase','examen','matricul','carrera','fp','universidad','curso');const sick=has('enfermo','enferma','malo','mala','fiebre','médico','medico');const decl=has('me gustas','sal conmigo','salir conmigo','novio','novia','pareja');const bye=has('adiós','adios','hasta luego','chao','me voy','buenas noches');
  const sorry=has('perdón','perdon','lo siento','perdona');const thanks=has('gracias');
  const V={kid:kidW(),po:pO(p),po2:p.g==='m'||p.g==='o'?'o':'a'},F=TXMV.libre,sel=o=>{const v=o[r]||o.otro;return huecos(Array.isArray(v)?pickR(v):v,V);};
  if(sorry){rel=3;if(r==='amor')love=2;ans=sel(F.perdon);}
  else if(thanks&&!plan){rel=2;ans=sel(F.gracias);}
  else if(study){rel=2;const C=(S.edu&&S.edu.cur);ans=sel(F.estudio);}
  else if(sick){rel=3;ans=sel(F.enfermo);}
  else if(decl&&r!=='amor'&&r!=='madre'){const ok=canLove(p)&&(p.rel||0)>=45;rel=ok?3:-3;ans=sel(ok?F.declaracion_si:F.declaracion_no);if(ok){p.chispa=(p.chispa||0)+1;p.chispaDay=S.day;}}
  else if(bye){rel=1;ans=sel(F.adios);}
  else if(rude){rel=-4;ans=sel(F.grosero);}
  else if(sleep&&r==='amor'){love=3;rel=4;act='stay';ans=sel(F.dormir);}
  else if(plan){rel=4;if(r==='amor')love=3;act=has('ven a casa','vente','casa')?'home':'out';ans=sel(F.plan);}
  else if(warm){rel=5;if(r==='amor')love=4;ans=sel(F.afecto);}
  else if(money){rel=2;ans=sel(F.dinero);}
  else if(work){rel=2;ans=sel(F.curro);}
  else if(q){rel=2;ans=sel(F.pregunta);}
  else{rel=1;ans=sel(F.resto);}
  p.rel=Math.max(0,Math.min(100,(p.rel||30)+rel));if(love&&p.love!=null)p.love=Math.min(100,p.love+love);p.last=S.day;if(rel>0)S.needs.social=Math.min(100,S.needs.social+3+rel);
  setTimeout(()=>{if(!S)return;phPush(p.k,{f:'t',t:ans,m:phNow()});if(phOpenNow())phRender();else{PH().un[p.k]=(PH().un[p.k]||0)+1;phBadge();}
    if(act==='stay'||act==='home'){setTimeout(()=>{if(!S.sim.work&&!(S.res||[]).some(x=>x.pid===p.k)){inviteHome(p,act==='stay');}},2500);}
    else if(act==='out'){const why=outAvail('amigos');if(!why||why==='solo en días libres'){setTimeout(()=>{if(S.sim.work>0)return;S.outWith=p.k;S.dateOut=['cita','rollo','pareja','convive','casada'].includes(p.stage);phClose();doOut('amigos');},2500);}else setTimeout(()=>phIncoming(p,pickR(TXMV.libre.sin_plan),'gen'),3000);}
  },1200+Math.random()*1800);}
// ---- Oury contesta solo si no lo haces tú: respuesta coherente con su carácter y la relación ----
function phAutoAnswer(){if(!S||S.phAuto===false)return;const P=PH();const now=phNow();const h=S.t/60;if(h<8||h>=23.5)return;const u=S.sim.use;if(u&&['cama','camamat','ducha','banera'].includes(u.type))return;
  for(const pk in P.th){const th=P.th[pk];const m=th[th.length-1];if(!m||m.f!=='t'||!m.open)continue;if(phOpenNow()&&phThread===pk)continue;// la estás leyendo tú
    const wait=T('ansiosa')?25:T('solitaria')?150:T('sociable')?40:80;if(now-m.m<wait)continue;
    const p=(S.people||[]).find(q=>q.k===pk);if(!p)continue;const opts=phRepOpts(m.k);if(!opts.length)continue;
    // elige: cariñosa si la relación es buena o es la pareja/madre; seca si va mal o es «genio/cínica»; nunca llamar ni montar planes solo
    const role=phRole(p);let pick=0;const warm=(p.rel||30)>=45||role==='amor'||role==='madre';const cold=T('genio')||T('cinica')||(p.rel||30)<25;
    const cands=opts.map((o,i)=>[o,i]).filter(([o])=>!['call','out','home','stay','gossip'].includes(o[2]));if(!cands.length)continue;
    const good=cands.filter(([o])=>o[1]>=3),mid=cands.filter(([o])=>o[1]>=0&&o[1]<3),bad=cands.filter(([o])=>o[1]<0);
    const pool=cold&&bad.length&&Math.random()<.5?bad:warm&&good.length?good:mid.length?mid:cands;pick=pickR(pool)[1];
    phAnswer(pk,th.length-1,pick);P.un[pk]=0;if(throttled('phauto',9e4))toast(huecos(TXMV.avisos.contesta,{p:p.n}));phBadge();return;}}
{const _up8=update;update=function(gm){const r=_up8.apply(this,arguments);try{if(S.t%7<gm)phAutoAnswer();}catch(e){console.error(e);}return r;};}
// ajuste: contestar yo siempre / que conteste Oury
{const _om3=openMenu;openMenu=function(...a){const r=_om3.apply(this,a);try{const sb=card.querySelector('#r3dbtn');if(sb&&!card.querySelector('#phautob')){const b=document.createElement('button');b.className=sb.className;b.id='phautob';b.textContent=huecos(S.phAuto===false?TXMV.avisos.auto_yo:TXMV.avisos.auto_ella,{});b.onclick=()=>{S.phAuto=S.phAuto===false?true:false;save();openMenu('ajustes');};sb.after(b);}}catch(e){}return r;};}
