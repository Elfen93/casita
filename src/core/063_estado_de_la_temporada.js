// ---------- estado de la temporada ----------
function TM(){if(!S.tmp){S.tmp=newSeason(1,S.day||1);if((S.day||1)>5){S.tmp.done.primer=S.day;S.tmp.done.semana=S.day;}}return S.tmp;}
function newSeason(n,start){const j=(a,b)=>a+Math.floor(Math.random()*(b-a+1));return {n,start,beats:{primer:2,semana:8,incidente:j(11,14),golpe:j(19,24),encrucijada:j(30,35),personal:j(41,46),eco:j(50,54),epilogo:60},done:{},choices:[],used:S.tmp?S.tmp.used:{},money0:Math.round(S.money),career0:S.career,track0:S.track,ideo0:S.ideo,jobless0:!!S.jobless};}
function useVar(key,list){const u=TM().used;u[key]=u[key]||[];let c=list.filter(v=>!u[key].includes(v.id));if(!c.length){u[key]=[];c=list;}const v=pickR(c);u[key].push(v.id);return v;}
function chose(txt){TM().choices.push(txt);}
function seasonDaily(){const t=TM();const d=S.day-t.start+1;
  for(const [k,at] of Object.entries(t.beats)){if(t.done[k]||d<at)continue;t.done[k]=S.day;try{BEATS[k]();}catch(e){console.error('beat',k,e);}break;}}
