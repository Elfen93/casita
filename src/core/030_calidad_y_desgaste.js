// ---------- calidad y desgaste ----------
const TIERS=[{n:'Muy mala',e:'🪵',price:0.25,eff:0.55,wear:2.8,decor:-1,txt:'casera, hecha por una principiante'},{n:'Mala',e:'🔩',price:0.4,eff:0.7,wear:2.1,decor:0,txt:'casera y con fallos'},{n:'Básico',e:'🥉',price:0.6,eff:0.8,wear:1.7,decor:0,txt:'barato, rinde menos y se gasta rápido'},{n:'Normal',e:'🥈',price:1,eff:1,wear:1,decor:0,txt:'equilibrado'},{n:'Premium',e:'🥇',price:1.9,eff:1.3,wear:0.45,decor:2,txt:'caro, rinde +30%, dura el doble y decora'}];
let buyTier=3; // 2 Básico · 3 Normal · 4 Premium · 5 = que lo fabrique Ana
const priceOf=(t,q)=>Math.round(OBJ[t].p*TIERS[q??3].price*PM()*(S.shortage>S.day?1.3:1));
const condOf=o=>o.c==null?100:o.c;
const usable=o=>o&&condOf(o)>0;
const condFactor=o=>0.55+0.45*Math.min(1,condOf(o)/50);
function sellValue(o){return Math.round(priceOf(o.t,o.q)*0.5*(0.3+0.7*condOf(o)/100));}
function gainSkill(k,amt){const b=skillInfo(S.skills[k]).lv;S.skills[k]+=amt*Dm().xp*traitXP(k);const a=skillInfo(S.skills[k]).lv;
  if(a>b){const nm=SKILLS.find(x=>x[0]===k);tally('skills',`${nm[2]} (nivel ${a})`);if(a===5||a===10)tell(`${a===10?'Ya domina':'Empieza a dominar'} ${nm[2].toLowerCase()}: nivel ${a}.`,nm[1]);toast(`⭐ Ana subió ${nm[2]} a nivel ${a}`,true);sfx('level');popBubble('⭐');const s=S.sim;for(let q=0;q<5;q++)emit('emoji',s.x+(Math.random()-.5)*.6,s.y+(Math.random()-.5)*.6,40+q*6,{vz:30,life:1.5,txt:'⭐',size:.8});}}
// los muebles que se usan durante horas se gastan más despacio por minuto
const WEARMUL={cama:0.09,sofa:0.35,compu:0.4,tele:0.4,libros:0.45,guitarra:0.45,banco:0.5,telefono:0.6,espejo:0.6};
const ELECTRIC=new Set(['tele','compu','nevera','fogon','telefono','lampara','farola']);
function replaceWant(i,q,why){const o=S.obj[i];return {key:'rep-'+i,name:'Cambiar '+OBJ[o.t].n.toLowerCase(),emoji:'🔁',why:why||'',kind:'fix',steps:[{k:'replace',i,q}]};}
function addJobStep(step,name,emoji,cmd){
  if(S.job){if(S.job.steps.some(st=>!st.done&&st.i===step.i&&(st.k==='fix'||st.k==='replace')))return;const n=nextStep(S.job);S.job.steps.splice(n<0?S.job.steps.length:n,0,step);S.job.total++;}
  else S.job={key:step.k+'-'+step.i,name,emoji,why:'',kind:'fix',steps:[step],who:'ana',total:1,cmd:!!cmd};
}
function orderReplace(i,cmd){const o=S.obj[i];if(!o)return;addJobStep({k:'replace',i,q:buyTier},'Cambiar '+OBJ[o.t].n.toLowerCase(),'🔁',cmd);}
function hireFor(i,kind){ // el jugador llama a un técnico
  const o=S.obj[i];if(!o)return;const st=kind==='replace'?{k:'replace',i,q:buyTier}:{k:'fix',i};
  const job={key:st.k+'-'+i,name:(kind==='replace'?'Cambiar ':'Arreglar ')+OBJ[o.t].n.toLowerCase(),emoji:kind==='replace'?'🔁':'🔧',why:'',kind:'fix',steps:[st],total:1,cmd:true};
  const p=jobPrice(job);if(S.money<p.mat+p.labor){toast(`No llega el dinero: hacen falta ${fmt(p.mat+p.labor)}`);sfx('bad');return;}
  if(S.job){toast('Ya hay una obra en marcha; espera a que termine o cancélala');return;}
  S.job={...job,who:'builder'};if(!spawnBuilder()){S.job.who='ana';toast('No llega nadie hasta allí: lo intentará Ana');return;}
  S.money-=p.labor;bumpMoney();S.stats.hired++;toast(`🧰 Viene ${S.npc.name}, de la cooperativa · ${fmt(p.labor)}`,true);
}
function addFixStep(i,cmd){
  const o=S.obj[i];if(!o)return;
  if(S.job){if(S.job.steps.some(st=>!st.done&&st.k==='fix'&&st.i===i))return;const n=nextStep(S.job);S.job.steps.splice(n<0?S.job.steps.length:n,0,{k:'fix',i});S.job.total++;}
  else S.job={key:'fix-'+i,name:'Arreglar '+OBJ[o.t].n.toLowerCase(),emoji:'🔧',why:'',kind:'fix',steps:[{k:'fix',i}],who:'ana',total:1,cmd:!!cmd};
}
