// dilemas (DLG): textos de t, x, opciones (t, s) y frases de sus efectos (tell, toast, chapter, remember, chose), con azar sembrado
setTimeout(()=>{try{
 let seed=1;const rs=n=>{seed=n;};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(Math.imul(h,33)+s.charCodeAt(i))>>>0;return h.toString(16);};
 const mk=(track,g,pre)=>{rs(77);S=newState('normal');S.char={...randomChar(),g:g||'f'};if(S.char.g==='f')S.char.beard='no';S.traits=['sociable'];S.ideo='marxista';S.pol.comp=2;initPeople();applyHome('habitacion');startTrack(track||'super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';if(pre)pre();};
 const pk=()=>S.people.find(p=>p.k!=='madre'&&p.k!=='compi').k;
 const iv=()=>Object.values(INCID).flat();const gv=()=>GOLPES.map(g=>g.id);const pv=()=>PERSONAL.map(p=>p.id);
 const nopeople=()=>{S.people=S.people.filter(p=>p.k!=='madre'&&p.k!=='compi');};
 const conv=()=>{const p=S.people.find(p=>p.k!=='madre'&&p.k!=='compi');p.stage='convive';};
 const abu=()=>{const m=P_('madre');m.rel=90;m.dead=false;m.age=60;};
 const C=[]; // [id, etiqueta, pista, datos, track, género]
 const add=(id,lab,pre,dat,tr,g)=>C.push({id,lab,pre,dat,tr,g});
 add('ideo','a',()=>{},()=>({to:'liberal'}));add('ideo','b',()=>{S.ideo='apolitica';},()=>({to:'anarquista'}));
 add('crisis','a',()=>{},()=>({p:pk()}));add('crisis','b',()=>{P_(pk()).wearWhy='los turnos';},()=>({p:pk()}));add('crisis','c',()=>{},()=>({p:'nadie'}));
 for(const cl of ['mando','patrona','rentista','parada','otra'])add('contra',cl,()=>{},()=>({cl}));
 add('ascenso','a',()=>{},()=>({}));add('despedir','a',()=>{},()=>({}));
 add('piquete','a',()=>{S.money=5000;},()=>({}));add('piquete','b',()=>{S.money=10;},()=>({}));
 add('prestamo','a',()=>{},()=>({p:pk(),m:300}));add('prestamo','b',()=>{},()=>({p:'nadie',m:300}));
 add('militancia','a',()=>{},()=>({p:pk()}));add('militancia','b',()=>{},()=>({p:'nadie'}));
 for(const tr of ['negocio','coop','super'])for(let i=0;i<3;i++)add('incidente',tr+i,()=>{},()=>({v:iv()[i*2].id}),tr);
 for(const g of ['m','x'])for(let i=0;i<3;i++)add('incidente','base'+g+i,()=>{},()=>({v:iv()[i*2].id}),'super',g);
 for(const v of [0,1,2,3])add('golpe','v'+v,()=>{S.jobless=false;},()=>({v:gv()[v%gv().length],m:400}));
 add('golpe','sinmadre',()=>{nopeople();S.jobless=true;},()=>({v:gv()[0],m:400}));
 add('asamblea','a',()=>{office().org=60;},()=>({}));add('asamblea','b',()=>{office().org=20;},()=>({}));
 add('envenenado','a',()=>{S.career=0;},()=>({}));add('envenenado','m',()=>{S.career=0;},()=>({}),'super','m');
 for(const s of [.8,.1,.5])add('oferta','s'+s,()=>{makeOffer();S.offer.seen=s;},()=>({}));
 for(const g of ['f','m','x'])add('entrevista',g,()=>{},()=>({}),'super',g);
 add('cliente','a',()=>{},()=>({}),'negocio');add('cliente','b',()=>{},()=>({}),'coop');
 add('personal','a',()=>{},()=>({v:pv()[0]}));add('personal','b',()=>{},()=>({v:pv()[1]}));
 for(const g of ['f','m','x']){add('j_hora',g,()=>{JN().extra=4;},()=>({}),'super',g);add('j_cliente',g,()=>{},()=>({}),'super',g);}
 add('j_cubrir','a',()=>{},()=>({}));add('j_cubrir','b',()=>{nopeople();},()=>({}));
 add('j_turno','a',()=>{},()=>({}));add('j_turno','b',()=>{conv();},()=>({}));
 add('j_riesgo','a',()=>{},()=>({}));add('j_chivato','a',()=>{},()=>({}));
 add('cr_recoger','a',()=>{},()=>({k:'Leo'}));add('cr_recoger','b',()=>{abu();conv();},()=>({k:'Leo'}));add('cr_recoger','c',()=>{abu();},()=>({k:'Leo'}));add('cr_recoger','d',()=>{conv();P_(pk()).n='Dani';},()=>({k:'Leo'}));
 add('cr_recoger','e',()=>{conv();P_(pk()).n='Marta';},()=>({k:'Leo'}));
 const cal=(sind)=>()=>{const g=HG();g.boiler=1;g.boilerSince=S.day-3;S.money=5000;if(sind)S.pol.tenant=true;};add('calentador','a',cal(0),()=>({}));add('calentador','b',cal(1),()=>({}));
 const R={};const errs={};const ids=Object.keys(DLG);const bad=new Set();
 const log=[];const stub={};for(const f of ['tell','toast','chapter','remember','chose']){stub[f]=globalThis[f];}
 tell=(a,b)=>{log.push('tell|'+a+'|'+b);};toast=(a)=>{log.push('toast|'+a);};chapter=(a,b,c)=>{log.push('chapter|'+a+'|'+b+'|'+c);};remember=(a)=>{log.push('rem|'+a);};chose=(a)=>{log.push('chose|'+a);};
 for(const c of C){const key=c.id+'#'+c.lab;
  try{
   mk(c.tr,c.g,c.pre);const d=c.dat();const D=DLG[c.id];const r={};
   rs(5);r.t=D.t(d);rs(5);r.x=D.x(d);rs(5);const os=D.o(d);r.o=os.map(o=>[o.t,o.s===undefined?null:o.s]);
   rs(5);r.auto=D.auto(d);
   r.f=[];
   for(let i=0;i<os.length;i++){
    try{mk(c.tr,c.g,c.pre);const d2=c.dat();log.length=0;rs(9);const o2=DLG[c.id].o(d2);rs(11);o2[i].f();r.f.push(log.join('¦'));}catch(e){r.f.push('ERR '+e.message);}
   }
   R[key]=r;
  }catch(e){errs[key]=e.message+' '+(e.stack||'').slice(0,200);bad.add(c.id);}
 }
 const js=JSON.stringify(R);
 const okIds=ids.filter(i=>!bad.has(i)&&C.some(c=>c.id===i)).length;
 const ferr=Object.entries(R).filter(([k,r])=>r.f.some(x=>String(x).startsWith('ERR'))).map(([k])=>k);
 document.title='OK n='+okIds+' de '+ids.length+' h='+hash(js)+' casos='+Object.keys(R).length+' errs='+JSON.stringify(errs).slice(0,300)+' ferr='+ferr.join(',')+' empty='+Object.entries(R).filter(([k,r])=>r.f.every(x=>!x)).map(([k])=>k).slice(0,5);
 window.__dlgR=R;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
