// ---------- utilidades ----------
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LEVEL_BOSS=/Encargad|Jef|Gerente|Supervisor|Coordinador|Director/;
function isBoss(){return !S.jobless&&!TR().self&&!TR().coop&&LEVEL_BOSS.test((CAREER[S.career]||{}).t||'');}
function classOf(){if(TR().self)return S.career>=1?'patrona':'autonoma';if(S.jobless)return 'parada';if(isBoss())return 'mando';if(S.rentier)return 'rentista';
  if(TR().gig||['super','hosteleria','reparto','cuidados','obra'].includes(S.track)&&S.career<=1)return 'precaria';return 'asalariada';}
const CLASSN=DATA.personas.clases;
const isLeft=k=>LEFT.includes(k||S.ideo),isRight=k=>RIGHT.includes(k||S.ideo);
const RICHJOB=new Set(['abogada','programadora','diseñadora']);
const ex=()=>S.cx||(S.cx={drift:{},why:{},exp:{stress:0,poor:0,rich:0,solid:0,betray:0,win:0,loss:0},contra:0,cq:[],dq:[],dlg:null,dmode:'preguntar',wk:{out:0,outK:{}},lastCareer:S.career,lastJobless:!!S.jobless,chapSeen:{},latent:null,mem:[]});
function remember(txt){const c=ex();c.mem.push({d:S.day,t:txt});if(c.mem.length>30)c.mem.shift();}
function schedule(days,k,data){ex().cq.push({d:S.day+Math.max(1,Math.round(days)),k,data:data||{}});}

