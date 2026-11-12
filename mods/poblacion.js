// =================== POBLACIÓN: vecinos con nombre y gente en cada escena ===================
const pbH=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);h^=h>>>13;}return (h>>>0)/4294967296;};
const pbPick=(a,s)=>a[Math.floor(pbH(s)*a.length)%a.length];
function pbLook(v){const o=v.id,old=v.edad>=60;const g=v.g;
  return {name:v.n,g,skin:pbPick(SKINS,o+'s'),hair:old?'#bdbdbd':pbPick(HAIRCOLS.slice(0,6),o+'h'),
    style:g==='f'?pbPick(['melena','coleta','corto','mono','rizos'],o+'y'):pbPick(['corto','rapado','calvo','rizos'],o+'y'),
    beard:g==='m'&&pbH(o+'b')<.35?'corta':'no',glasses:old||pbH(o+'g')<.25,build:pbPick(['media','delgada','ancha'],o+'c'),
    shirt:pbPick(SHIRTC,o+'t'),pants:pbPick(PANTSC,o+'p'),eyes:'#3b2a20'};}
// hora punta de cada sitio: pk [[desde,hasta,nivel]], base, fin de semana (multiplicador), n mínimo y máximo, zona [x0,y0,x1,y1] en fracción del suelo
const POB={
 obra:{pk:[[8,15,1]],base:.1,we:.15,lo:4,hi:13,helmet:[8,15],R:[.08,.12,.95,.95]},
 super:{pk:[[9,14,.7],[17,20,1]],base:.3,we:.9,lo:4,hi:12,R:[.12,.3,.92,.95]},
 bar:{pk:[[8,11,.45],[13,15,1],[20,24,1]],base:.3,we:1,lo:4,hi:14,R:[.1,.35,.92,.95]},
 torre:{pk:[[8,10,.8],[13,15,.6],[17,19,.6]],base:.2,we:.15,lo:4,hi:10,R:[.12,.3,.92,.95]},
 residencia:{pk:[[10,13,.8],[17,19,.8]],base:.5,we:1,lo:4,hi:10,R:[.12,.3,.92,.95]},
 biblioteca:{pk:[[10,13,.7],[16,20,1]],base:.3,we:.5,lo:4,hi:10,R:[.12,.3,.92,.95]},
 parque:{pk:[[10,13,.8],[17,20,1]],base:.4,we:1,lo:5,hi:14,R:[.06,.1,.95,.95]},
 sindicato:{pk:[[17,21,1]],base:.3,we:.2,lo:4,hi:10,R:[.12,.3,.92,.95]},
 ateneo:{pk:[[18,22,1]],base:.3,we:.8,lo:4,hi:10,R:[.12,.3,.92,.95]},
 comedor:{pk:[[13,15.5,1],[20,21.5,.7]],base:.15,we:1,lo:4,hi:12,R:[.12,.3,.92,.95]},
 coop:{pk:[[9,14,.8],[17,19,.6]],base:.25,we:.5,lo:4,hi:10,R:[.12,.3,.92,.95]},
 sala:{pk:[[18,23,1]],base:.2,we:1,lo:4,hi:12,R:[.12,.3,.92,.95]},
 parroquia:{pk:[[11,13,.6],[18,20,.5]],base:.15,we:.8,lo:4,hi:10,R:[.15,.3,.9,.95]},
 comisaria:{pk:[[8,20,.5]],base:.3,we:.7,lo:4,hi:8,R:[.12,.3,.92,.95]},
 ayto:{pk:[[9,14,1]],base:.1,we:.1,lo:4,hi:9,R:[.12,.3,.92,.95]},
 tienda:{pk:[[10,14,.6],[17,20,1]],base:.3,we:.9,lo:4,hi:9,R:[.12,.3,.92,.95]},
 gym:{pk:[[7,9,1],[18,21,1]],base:.3,we:.7,lo:4,hi:11,R:[.1,.35,.92,.95]},
 gymbueno:{pk:[[7,9,1],[18,21,.9]],base:.3,we:.7,lo:4,hi:10,R:[.1,.35,.92,.95]}};
function pbLevel(c,h,wd){let l=c.base;for(const [a,b,n] of c.pk)if(h>=a&&h<b)l=Math.max(l,n);if(wd>=5)l*=c.we;return Math.max(0,Math.min(1,l));}
const pbVec=()=>(DATA.personas&&DATA.personas.vecinos)||[];
function vecinoPorId(id){return pbVec().find(v=>v&&v.id===id)||null;}
const pbIn=(a,b,h)=>typeof a==='number'&&typeof b==='number'&&(a<=b?h>=a&&h<b:(h>=a||h<b)); // admite tramos que cruzan la medianoche
const pbDia=(ds,wd)=>!Array.isArray(ds)||ds.includes(wd);
function pbTrabaja(v,key,h,wd){const t=v&&v.trabajo;return !!(t&&t.lugar===key&&Array.isArray(t.h)&&pbIn(t.h[0],t.h[1],h)&&pbDia(t.dias,wd));}
function vecinosEn(lugar,hora,diaSemana){const out=[];for(const v of pbVec()){if(!v)continue;
  if(pbTrabaja(v,lugar,hora,diaSemana)){out.push({v,motivo:'trabajo'});continue;}
  if(Array.isArray(v.donde)&&v.donde.some(d=>d&&d[0]===lugar&&pbIn(d[1],d[2],hora)&&pbDia(d[3],diaSemana)))out.push({v,motivo:'donde'});}
  return out;}
// escala por edad: ~0,5 a los 3, ~0,9 a los 16, 1 de adulto
const pbEscala=e=>typeof e!=='number'||e>=18?1:e<3?.42+e*.027:e<16?.5+(e-3)*.4/13:.9+(e-16)*.05;
const pbAdult=v=>typeof v.edad!=='number'||v.edad>=18;
const pbPuesto=v=>{const p=v.trabajo&&v.trabajo.puesto;return Array.isArray(p)?(v.g==='f'?p[0]:p[1]||p[0]):(typeof p==='string'?p:null);};
// puestos con sentido (tras el mostrador, en la caja)
const POST={bar:[[3.9,1.0],[5.2,1.0],[2.6,1.0]],super:[[2.0,6.5],[5.1,6.5],[8.3,6.5]]};
function pbFig(v,x,y,o){const ch=pbLook(v),e=v.edad,sc=pbEscala(e),[px,py]=P(x,y);const kid=typeof e==='number'&&e<10;
  const act=kid&&o.act==='phone'?null:o.act;const puesto=o.trabaja?pbPuesto(v):null;
  ctx.save();if(sc!==1){ctx.translate(px,py);ctx.scale(sc,sc);ctx.translate(-px,-py);}
  sPerson(x,y,ch,{pose:'stand',act,front:o.front,right:o.right,ph:o.ph,helmet:kid?false:o.helmet,vest:kid?false:o.vest,name:null});ctx.restore();
  const ny=py-64*sc-(puesto?9:0);ctx.save();ctx.globalAlpha=.85;label(v.n,px,ny,'rgba(255,253,248,.92)','#3b3247',8);
  if(puesto)label(puesto,px,ny+9,'rgba(255,240,200,.92)','#5a3a22',6);ctx.restore();}
function crowd(E,key,r){const c=POB[key];if(!c)return [];r=r||{};const W=r.W||8,D=r.D||6;const tt=E.tt||0;const h=S.t/60;const dt=typeof dateOf==='function'?dateOf(S.day):{wd:0};const wd=dt.wd;
  const hs=Math.floor(h),seed=key+'|'+S.day+'|'+hs;
  const hel=c.helmet&&h>=c.helmet[0]&&h<c.helmet[1];
  const parqueTarde=key==='parque'&&h>=17&&h<20;
  // quién sale: trabajadores primero; menores de 12 solo con una adulta de su hogar (salvo parque 17-20)
  let list=vecinosEn(key,h,wd).sort((a,b)=>(a.motivo==='trabajo'?0:1)-(b.motivo==='trabajo'?0:1)||(a.v.id<b.v.id?-1:1));
  const adultosH=new Set(list.filter(q=>pbAdult(q.v)&&q.v.hogar!=null).map(q=>q.v.hogar));
  list=list.filter(q=>{const v=q.v;if(pbAdult(v))return true;const conAdulta=v.hogar!=null&&adultosH.has(v.hogar);
    if(conAdulta)return true;return typeof v.edad==='number'&&v.edad>=12?true:parqueTarde;}).slice(0,12);
  const lv=pbLevel(c,h,wd);
  const n=Math.min(14,Math.max(4,Math.round(c.lo+(c.hi-c.lo)*lv),list.length+2));
  const ns=NPCS();const known=(Array.isArray(S.people)?S.people:[]).filter(p=>p&&p.ch&&p.n);
  const usados=new Set(list.map(q=>q.v.n));const ana=r.ana||{x:-9,y:-9};
  const x0=W*c.R[0],y0=D*c.R[1],x1=W*c.R[2],y1=D*c.R[3];const taken=[[ana.x,ana.y]];
  const spot=(s,gap)=>{for(let t=0;t<24;t++){const x=x0+pbH(s+'x'+t)*(x1-x0),y=y0+pbH(s+'y'+t)*(y1-y0);if(taken.every(q=>Math.hypot(q[0]-x,q[1]-y)>gap)){taken.push([x,y]);return [x,y];}}return null;};
  const out=[];let k=0;
  // unidades: cada hogar presente (adultas primero) forma un grupo; el resto, sueltos
  const units=[];const byH=new Map();
  for(const q of list){if(q.v.hogar==null){units.push([q]);continue;}if(!byH.has(q.v.hogar)){const u=[];byH.set(q.v.hogar,u);units.push(u);}byH.get(q.v.hogar).push(q);}
  for(const u of units)u.sort((a,b)=>(pbAdult(b.v)?1:0)-(pbAdult(a.v)?1:0)||(a.motivo==='trabajo'?-1:1));
  const posts=(POST[key]||[]).slice();const OFF=[[.75,0],[-.75,.1],[0,.75],[.7,.7]];
  for(const u of units){if(k>=14)break;
    const wk=u.find(q=>q.motivo==='trabajo'&&pbAdult(q.v));let ax,ay;
    if(wk&&posts.length){[ax,ay]=posts.shift();taken.push([ax,ay]);}
    else{const p=spot(seed+'u'+k+u[0].v.id,u.length>1?2:1.2);if(!p)continue;[ax,ay]=p;}
    ax=Math.min(Math.max(ax,.9),W-1.8);
    const ph=(tt*.9+pbH(seed+'p'+u[0].v.id)*5)%3;let ia=0;
    u.forEach((q,i)=>{if(k>=14)return;const v=q.v;const [dx,dy]=i===0?[0,0]:OFF[(i-1)%OFF.length];const x=Math.min(Math.max(ax+dx,.4),W-.8),y=ay+dy;const trab=q.motivo==='trabajo';
      const gr=u.length>1&&pbAdult(v);const right=i%2===0;
      const act=trab&&key==='obra'?'hammer':gr?(((ph<1.5)===(ia++%2===0))?'talk':null):(!trab&&pbH(seed+'ph'+v.id)<.4?'phone':null);
      const hh=(hel||(trab&&key==='obra'));
      out.push({x,y,f:()=>pbFig(v,x,y,{act,front:true,right,ph:tt*7,helmet:hh,vest:hh,trabaja:trab}),d:x+y,v,trab});k++;});}
  const kinds=['talk','wait','walk','talk','wait','walk','wait'];let gi=0;
  const nextPerson=kk=>{
    if(known.length&&pbH(seed+'k'+kk)<.2){const p=known[Math.floor(pbH(seed+'q'+kk)*known.length)%known.length];if(!usados.has(p.n)){usados.add(p.n);return {ch:{...p.ch,name:p.n},name:p.n};}} // cada conocido, una sola vez
    const b=ns[Math.floor(pbH(seed+'n'+kk)*ns.length)%ns.length]||{};return {ch:{...b,shirt:pbPick(SHIRTC,seed+'sh'+kk),pants:pbPick(PANTSC,seed+'pa'+kk)},name:null};};
  while(k<n){const kind=kinds[(gi+Math.floor(pbH(seed+'g'+gi)*3))%kinds.length];gi++;if(gi>40)break;
    const base=pbH(seed+'o'+gi);
    if(kind==='talk'&&k+2<=n){const p=spot(seed+'t'+gi,1.6);if(!p)continue;const A=nextPerson(k++),B=nextPerson(k++);const [x,y]=[Math.min(Math.max(p[0],.9),W-1.8),p[1]];
      const ph=(tt*.9+base*5)%3;
      for(const [Q,xx,rt] of [[A,x,true],[B,x+.8,false]])out.push({x:xx,y,f:()=>sPerson(xx,y,Q.ch,{pose:'stand',act:((ph<1.5)===rt)?'talk':null,front:true,right:rt,helmet:hel,vest:hel,name:Q.name}),d:xx+y});}
    else if(kind==='walk'){const p=spot(seed+'w'+gi,1.4);if(!p)continue;const A=nextPerson(k++);const ax=pbH(seed+'ax'+gi)<.5;const len=1.6+pbH(seed+'l'+gi)*1.8;
      const ex=ax?Math.min(p[0]+len,x1):p[0],ey=ax?p[1]:Math.min(p[1]+len,y1);const u=(tt*.12+base*2)%2,fr=u<1?u:2-u;const fw=u<1;
      const x=p[0]+(ex-p[0])*fr,y=p[1]+(ey-p[1])*fr;
      out.push({x,y,f:()=>sPerson(x,y,A.ch,{pose:'walk',ph:tt*7+gi,front:ax?fw:fw,right:ax?fw:!fw,helmet:hel,vest:hel,name:A.name}),d:x+y});}
    else{const p=spot(seed+'e'+gi,1.2);if(!p)continue;const A=nextPerson(k++);const [x,y]=p;const ph=base<.4?'phone':null;
      out.push({x,y,f:()=>sPerson(x,y,A.ch,{pose:'stand',act:ph,front:base<.7,right:base<.5,helmet:hel,vest:hel,name:A.name}),d:x+y});}}
  return out;}
const crowdItems=(E,key,r)=>crowd(E,key,r).map(o=>({d:o.d,f:o.f}));
for(const k of Object.keys(POB)){const _s=SCENES[k];if(!_s)continue;SCENES[k]=function(E){const r=_s.apply(this,arguments);try{if(r&&r.items)for(const o of crowdItems(E,k,r))r.items.push(o);}catch(e){}return r;};}
