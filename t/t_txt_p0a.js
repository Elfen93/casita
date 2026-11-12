// OK p0a: textos de las tablas de sucesos del núcleo (consecuencias CQ, golpes, personal, incidentes, hitos, arcos, rasgos ocultos, aspiraciones y objetivos)
// ejecuta cada una con azar sembrado y compara el volcado (hash) con el hecho ANTES de mover los textos a data/ (ESPERADO).
// Además comprueba que los textos movidos están en DATA.sucesos / DATA.textos_nucleo y que ninguna cadena queda sin cerrar.
setTimeout(()=>{try{
 const ESPERADO='7e2305c3';
 let seed=1;const rs=n=>{seed=n;};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(Math.imul(h,33)+s.charCodeAt(i))>>>0;return h.toString(16);};
 const mk=(track,g,pre)=>{rs(77);S=newState('normal');S.char={...randomChar(),g:g||'f'};if(S.char.g==='f')S.char.beard='no';S.traits=['sociable'];S.ideo='marxista';S.pol.comp=2;initPeople();applyHome('habitacion');startTrack(track||'super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';if(pre)pre();};
 const pk=()=>S.people.find(p=>p.k!=='madre'&&p.k!=='compi').k;
 const log=[];tell=(a,b)=>{log.push('tell|'+a+'|'+b);};toast=(a,b)=>{log.push('toast|'+a+'|'+b);};chapter=(a,b,c)=>{log.push('chapter|'+a+'|'+b+'|'+c);};remember=(a)=>{log.push('rem|'+a);};chose=(a)=>{log.push('chose|'+a);};
 const R={};const errs=[];
 // cada caso: fresco, con semilla, y vuelca log + un resumen del estado
 const caso=(key,pre,fn,tr,g,sd)=>{try{mk(tr,g,pre);log.length=0;rs(sd||11);let r;try{r=fn();}catch(e){r='ERR '+e.message;}
   R[key]={r:r===undefined?null:(typeof r==='function'?'ƒ':r),log:log.slice(),est:[Math.round(S.money),S.career,S.jobless,S.paroWeeks,S.ally,!!S.court,S.payMul,S.noOvertime,(S.cx&&S.cx.exp)?Object.values(S.cx.exp).join(','):'',(S.cx&&S.cx.cq)?S.cx.cq.length:0,P_('madre')&&P_('madre').rel,(P_('compi')||{}).rel,S.lodger||null,S.rentMul||null]};
  }catch(e){errs.push(key+': '+e.message);}};
 // ---- consecuencias ----
 const cqk=Object.keys(CQ);
 const grupos=[['a',()=>{S.jobless=false;S.ally=true;S.money=5000;office().org=60;},0],['b',()=>{S.jobless=true;S.money=-50;office().org=10;},0],['c',()=>{S.jobless=false;S.ally=false;S.money=100;office().org=30;},0]];
 for(const k of cqk)for(const [lab,pre] of grupos)for(const sd of [3,21,50]){
  const ex2=(k==='lodger')?()=>{const p=P_(pk());S.lodger=p.k;return CQ.lodger({p:p.k});}:()=>CQ[k]({p:pk(),m:300,cost:90});
  caso('cq.'+k+'.'+lab+sd,pre,ex2,'negocio',lab==='b'?'m':'f',sd);
  caso('cq2.'+k+'.'+lab+sd,()=>{pre();if(k==='devolver'){S.money=100;}},ex2,'super','x',sd);}
 // ---- golpes ----
 for(const g of GOLPES)for(const sd of [4,9]){
  caso('golpe.'+g.id+sd,()=>{},()=>{const m=Math.round(g.m()*PM());const x=g.x(m);const c=g.c?g.c():null;g.fx(m);return [m,x,c];},'super','f',sd);}
 // ---- personal ----
 for(const p of PERSONAL)for(const sd of [4,9,30]){
  caso('pers.'+p.id+'.cab'+sd,()=>{},()=>[p.c?p.c():null,p.t(),p.x(),p.auto()],'super','f',sd);
  const n=(()=>{try{mk('super','f');return p.o().length;}catch(e){return 0;}})();
  for(let i=0;i<n;i++)for(const [lab,pre] of [['a',()=>{S.money=3000;}],['b',()=>{S.money=20;}]]){
   caso('pers.'+p.id+'.o'+i+lab+sd,pre,()=>{const o=p.o()[i];const ok=o.ok?o.ok():null;o.f();return [o.t,o.s===undefined?null:o.s,ok];},'super','f',sd);}}
 // ---- incidentes ----
 for(const [tr,V] of Object.entries(INCID))for(const g of ['f','m','x'])for(const v of V){
  caso('inc.'+tr+'.'+v.id+g,()=>{},()=>[v.x(),INC_TXT(v.id)],tr==='oficina'||tr==='super'||INCID[tr]?(['negocio','coop'].includes(tr)?tr:tr):'super',g);}
 // ---- hitos ----
 for(const k of Object.keys(BEATS))for(const tr of ['super','negocio','coop','reparto','oficina'])for(const sd of [5,17]){
  caso('beat.'+k+'.'+tr+sd,()=>{TM().n=1;TM().money0=3000;TM().track0='super';TM().career0=0;TM().jobless0=false;TM().ideo0='liberal';TM().choices=['Ayudó','Se negó','Aceptó'];TM().used={};},()=>{
    const o=[];const ask=askDilemma;try{askDilemma=(a,b)=>{o.push('ask '+a+JSON.stringify(b));};return [BEATS[k](),o];}finally{askDilemma=ask;}},tr,'f',sd);}
 for(const tox of [.2,.5,.8])for(const tr of ['super','negocio','coop','reparto'])caso('beat.primer.tox'+tox+tr,()=>{TM().n=1;office().tox=tox;S.office.tox=tox;},()=>BEATS.primer(),tr,'m',3);
 for(const m of [20,500,9000])for(const jl of [false,true])caso('beat.semana'+m+jl,()=>{S.money=m;S.jobless=jl;},()=>BEATS.semana(),'super','f',3);
 // ---- arcos ----
 for(const id of Object.keys(ARCS))caso('arc.'+id,()=>{S.ideo=id;S.pol.xp=500;S.pol.stages={};S.union={member:true};office().org=80;W_().mov=90;W_().crisis=90;S.owned=true;S.pol.inf=40;},()=>{const o=[];for(let i=0;i<9;i++){log.push('--');arcTick();}return ARCS[id].map(a=>[a.id,a.at,a.t,a.x]);},id==='libertaria'?'negocio':'super','f',3);
 // ---- rasgos ocultos ----
 for(const k of Object.keys(HID))for(const sd of [3,8,40]){
  caso('hid.'+k+sd,()=>{S.strike={on:true};S.money=50;S.jobless=false;},()=>{const h=HID[k];const p=S.people.find(q=>q.k==='compi')||S.people[0];p.ideo='conservadora';p.hid=[k];const r=[h.n,h.e,h.neg,h.pos,h.why,h.d?h.d(p):null,h.w?h.w(p):null,h.rev?h.rev(p):null,h.cond?h.cond(p):null,h.txt?h.txt(p):null];if(h.onRev)h.onRev(p);if(h.fx)h.fx(p);return r;},'super','f',sd);}
 // ---- aspiraciones y objetivos ----
 for(const a of ASP)for(const g of ['f','m']){caso('asp.'+a.id+g,()=>{},()=>[a.c,a.e,a.t(),a.r,a.w?a.w():null],'super',g,3);}
 for(const g of GOALS)caso('goal.'+g.id,()=>{},()=>[g.t,g.r]);
 // ---- prueba de qué pasa al cumplir un objetivo ----
 const js=JSON.stringify(R);const h=hash(js);
 // ---- los textos de los que dependen están en data ----
 const faltan=[];const sec=(DATA.sucesos||{});
 for(const s of ['nucleo_consecuencias','nucleo_golpes','nucleo_personal','nucleo_incidentes','nucleo_hitos','nucleo_arcos','nucleo_rasgos_ocultos','nucleo_aspiraciones','nucleo_objetivos'])if(!sec[s])faltan.push(s);
 // huecos sin cerrar en ningún texto de las salidas
 const huecosSueltos=[];for(const [k,v] of Object.entries(R)){const s=JSON.stringify(v);const m=s.match(/\{[a-zñ_]+\}/g);if(m)huecosSueltos.push(k+':'+m.slice(0,2).join(''));}
 document.title=(h===ESPERADO?'OK':'ERR distinto')+' h='+h+' casos='+Object.keys(R).length+' errs='+errs.length+' conERR='+Object.values(R).filter(v=>typeof v.r==='string'&&v.r.startsWith('ERR')).length+' conLog='+Object.values(R).filter(v=>v.log.length).length+(errs.length?JSON.stringify(errs.slice(0,3)):'')+' faltan='+faltan.join(',')+' huecos='+huecosSueltos.slice(0,5).join(';');
 window.__R=R;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
