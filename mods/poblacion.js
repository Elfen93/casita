// =================== POBLACIÓN: vecinos con nombre y gente en cada escena ===================
const VECINOS=DATA.personas.vecinos||[];
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
function pbHere(key,h,wd){return VECINOS.filter(v=>v.donde.some(d=>d[0]===key&&h>=d[1]&&h<d[2]&&d[3].includes(wd)));}
function crowd(E,key,r){const c=POB[key];if(!c)return [];r=r||{};const W=r.W||8,D=r.D||6;const tt=E.tt||0;const h=S.t/60;const dt=typeof dateOf==='function'?dateOf(S.day):{wd:0};const wd=dt.wd;
  const hs=Math.floor(h),seed=key+'|'+S.day+'|'+hs;
  const named=pbHere(key,h,wd).slice(0,8);const lv=pbLevel(c,h,wd);
  const n=Math.min(14,Math.max(4,Math.round(c.lo+(c.hi-c.lo)*lv),named.length+2));
  const ns=NPCS();const known=(Array.isArray(S.people)?S.people:[]).filter(p=>p&&p.ch&&p.n);
  const usados=new Set(named.map(v=>v.n));const ana=r.ana||{x:-9,y:-9};
  const nextPerson=k=>{if(named.length&&k<named.length){const v=named[k];return {ch:pbLook(v),name:v.n,v};}
    if(known.length&&pbH(seed+'k'+k)<.2){const p=known[Math.floor(pbH(seed+'q'+k)*known.length)%known.length];if(!usados.has(p.n)){usados.add(p.n);return {ch:{...p.ch,name:p.n},name:p.n};}} // cada conocido, una sola vez
    const b=ns[Math.floor(pbH(seed+'n'+k)*ns.length)%ns.length]||{};return {ch:{...b,shirt:pbPick(SHIRTC,seed+'sh'+k),pants:pbPick(PANTSC,seed+'pa'+k)},name:null};};
  const x0=W*c.R[0],y0=D*c.R[1],x1=W*c.R[2],y1=D*c.R[3];const taken=[[ana.x,ana.y]];
  const spot=(s,gap)=>{for(let t=0;t<24;t++){const x=x0+pbH(s+'x'+t)*(x1-x0),y=y0+pbH(s+'y'+t)*(y1-y0);if(taken.every(q=>Math.hypot(q[0]-x,q[1]-y)>gap)){taken.push([x,y]);return [x,y];}}return null;};
  const hel=c.helmet&&h>=c.helmet[0]&&h<c.helmet[1];
  const out=[];let k=0,gi=0;const kinds=['talk','wait','walk','talk','wait','walk','wait'];
  while(k<n){const kind=kinds[(gi+Math.floor(pbH(seed+'g'+gi)*3))%kinds.length];gi++;if(gi>40)break;
    const need=kind==='talk'?2:1;if(k+need>n&&kind==='talk'){if(k>=n)break;}
    const base=pbH(seed+'o'+gi);
    if(kind==='talk'&&k+2<=n){const p=spot(seed+'t'+gi,1.6);if(!p)continue;const A=nextPerson(k++),B=nextPerson(k++);const [x,y]=[Math.min(Math.max(p[0],.9),W-1.8),p[1]];
      const ph=(tt*.9+base*5)%3;
      for(const [Q,xx,rt] of [[A,x,true],[B,x+.8,false]])out.push({x:xx,y,f:()=>sPerson(xx,y,Q.ch,{pose:'stand',act:((ph<1.5)===rt)?'talk':null,front:true,right:rt,helmet:hel,vest:hel,name:Q.name}),d:xx+y});}
    else if(kind==='walk'){const p=spot(seed+'w'+gi,1.4);if(!p)continue;const A=nextPerson(k++);const ax=pbH(seed+'ax'+gi)<.5;const len=1.6+pbH(seed+'l'+gi)*1.8;
      const ex=ax?Math.min(p[0]+len,x1):p[0],ey=ax?p[1]:Math.min(p[1]+len,y1);const u=(tt*.12+base*2)%2,fr=u<1?u:2-u;const fw=u<1;
      const x=p[0]+(ex-p[0])*fr,y=p[1]+(ey-p[1])*fr;
      out.push({x,y,f:()=>sPerson(x,y,A.ch,{pose:'walk',ph:tt*7+gi,front:ax?fw:fw,right:ax?fw:!fw,helmet:hel,vest:hel,name:A.name}),d:x+y});}
    else{const p=spot(seed+'e'+gi,1.2);if(!p)continue;const A=nextPerson(k++);const [x,y]=p;const ph=A.name?'phone':(base<.4?'phone':null);
      out.push({x,y,f:()=>sPerson(x,y,A.ch,{pose:'stand',act:ph,front:base<.7,right:base<.5,helmet:hel,vest:hel,name:A.name}),d:x+y});}}
  return out;}
const crowdItems=(E,key,r)=>crowd(E,key,r).map(o=>({d:o.d,f:o.f}));
for(const k of Object.keys(POB)){const _s=SCENES[k];if(!_s)continue;SCENES[k]=function(E){const r=_s.apply(this,arguments);try{if(r&&r.items)for(const o of crowdItems(E,k,r))r.items.push(o);}catch(e){}return r;};}
