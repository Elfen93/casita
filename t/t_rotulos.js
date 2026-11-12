// rótulos: en las 18 escenas, todas sus variantes y tres horas, ningún par de rótulos pintados se solapa, todos caen dentro de la pantalla
// (bajo los paneles de arriba, los avisos y por encima de la barra de abajo), ninguno tapa una cabeza y el del personaje siempre sale.
setTimeout(()=>{try{window.__errs=window.__errs||[];const ce=console.error;console.error=(...a)=>{window.__errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' ').slice(0,300));};
S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
const ks=['obra','super','bar','torre','residencia','biblioteca','parque','sindicato','ateneo','comedor','coop','sala','parroquia','comisaria','ayto','tienda','gym','gymbueno'];
const bad=[];let runs=0,labels=0,grupos=0,puestos=0,maxk=0;const to=document.getElementById('toasts');
for(const k of ks){const vars=[...(k==='comedor'?[]:[null]),...(((PLACES[k]&&PLACES[k].outs)||[]))];
 for(const oa of vars)for(const h of [9,14,18,20]){
  S.day=Math.max(S.day,1);while(dateOf(S.day).wd!==(h===14?2:(h===9?1:h===18?3:4)))S.day++;S.t=h*60;HP().gymGood=(k==='gymbueno');
  const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=oa;s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;menu.classList.remove('open');
  // avisos emergentes de mentira, como los carteles de «Objetivo»
  if(to){to.innerHTML='';if(h!==9)for(let i=0;i<2;i++){const d=document.createElement('div');d.className='toast';d.style.cssText='display:block;height:30px;margin:4px auto;width:300px';d.textContent='Objetivo '+i;to.appendChild(d);}}
  RT.ui=null;render();runs++;
  const L=RT.last,A=RT.lastArea,tag=`${k}/${oa||'work'}/${h}`;if(!A){bad.push(tag+' sin área');continue;}
  labels+=L.length;for(const p of L){if(p.grupo)grupos++;if(p.puesto)puestos++;}
  const me=CH().name;if(!L.some(p=>p.ana))bad.push(tag+' falta el rótulo del personaje '+me+' '+JSON.stringify(RT.ana)+' top'+(A.top|0)+' heads'+RT.lastHeads.length+' lab'+L.map(p=>p.name).join(','));
  for(let i=0;i<L.length;i++){const p=L[i];
   if(p.x0<0||p.x1>A.Wd||p.y0<A.top||p.y1>A.bot)bad.push(`${tag} fuera de pantalla ${p.name} [${p.x0|0},${p.y0|0},${p.x1|0},${p.y1|0}] top${A.top|0} bot${A.bot|0}`);
   for(const u of A.ui)if(p.x0<u[2]&&p.x1>u[0]&&p.y0<u[3]&&p.y1>u[1])bad.push(`${tag} bajo la interfaz ${p.name}`);
   for(let j=i+1;j<L.length;j++){const q=L[j];if(p.x0<q.x1&&p.x1>q.x0&&p.y0<q.y1&&p.y1>q.y0)bad.push(`${tag} se pisan ${p.name} y ${q.name}`);}
   for(const hd of RT.lastHeads){if(p.x0<hd.x+hd.w/2&&p.x1>hd.x-hd.w/2&&p.y0<hd.y+hd.h&&p.y1>hd.y)bad.push(`${tag} ${p.name} tapa una cabeza`);}
   if(p.x1-p.x0<RT.lastFs*1.5)bad.push(`${tag} rótulo vacío ${p.name}`);}
 }}
if(to)to.innerHTML='';
document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({runs,labels,grupos,puestos,nbad:bad.length,bad:[...new Set(bad)].slice(0,6),errs:__errs.slice(0,3)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
