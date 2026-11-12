// ---------- oficios: quién sabe hacer qué ----------
// [oficio, nivel para instalar/montar uno comprado, nivel para fabricarlo desde cero]
const CRAFT=DATA.profesiones.oficio_por_objeto;
const SKN=k=>SKILLS.find(x=>x[0]===k);
const skLabel=k=>{const x=SKN(k);return x[1]+' '+x[2];};
function stepReq(st){
  switch(st.k){
    case 'floor':return ['alba',st.v===5?2:0];
    case 'water':return ['alba',4];
    case 'wall':case 'paint':return ['alba',0];
    case 'door':return ['carp',1];
    case 'win':return ['alba',2];
    case 'obj':{const c=CRAFT[st.v];if(st.crafted)return [c?c[0]:'carp',0];return c?[c[0],c[1]]:['carp',0];}
    case 'replace':{const o=S.obj[st.i];const c=o&&CRAFT[o.t];return c?[c[0],c[1]]:['carp',0];}
    case 'move':{const c=CRAFT[st.v];return c?[c[0],c[1]]:['carp',0];}
    case 'undoor':return ['alba',0];case 'rezone':return ['alba',0];case 'clear':return ['jard',0];
    case 'fix':{const o=S.obj[st.i];const c=o&&CRAFT[o.t];return c?[c[0],c[1]+(c[2]>=8?1:0)]:['carp',0];}
    case 'craft':{const c=CRAFT[st.v];return [c[0],c[2]];}
  }
  return ['carp',0];
}
function jobReq(job){let miss=null;for(const st of job.steps){if(st.done)continue;const [k,l]=stepReq(st);if(lvl(k)<l&&(!miss||l-lvl(k)>miss[2]))miss=[k,l,l-lvl(k)];}return miss;}
function craftTier(k){const l=lvl(k),r=Math.random();if(l<=1)return r<.5?0:1;if(l<=3)return r<.5?1:2;if(l<=5)return 2;if(l<=7)return 3;if(l<=9)return r<.5?3:4;return 4;}
const craftEst=k=>[0,1,1,2,2,2,3,3,3,4,4][Math.min(10,lvl(k))];
const craftMat=t=>Math.round(OBJ[t].p*0.35*PM());
function bancoIdx(){return findObjs((d,t)=>t==='banco').find(i=>usable(S.obj[i]));}
const canCraft=t=>{const c=CRAFT[t];return !!c&&bancoIdx()!=null&&lvl(c[0])>=c[2];};
function craftJob(t,i,cmd){const b=bancoIdx();if(b==null)return null;
  return {key:'craft-'+t,name:'Fabricar '+OBJ[t].n.toLowerCase(),emoji:'🪚',why:'en su banco',kind:'craft',steps:[{k:'craft',v:t,i:b},{k:'obj',v:t,i:i??null,crafted:true,q:2}],cmd:!!cmd};}
function canAnaDo(st){const [k,l]=stepReq(st);return lvl(k)>=l;}

