// ---------- historia: diario, capítulos, personas y pensamientos ----------
let storyUnseen=0;
const capF=s=>s.charAt(0).toUpperCase()+s.slice(1);
function storyState(){if(!S.story)S.story={log:[],chap:{},n:0};return S.story;}
function tell(txt,ic='📖',kind='n'){
  const st=storyState();const t=L(txt);st.log.push({d:S.day,t:Math.round(S.t),ic,txt:t,k:kind});
  if(st.log.length>500)st.log.splice(0,st.log.length-500);
  S.lastLine={ic,txt:t.replace(/<[^>]+>/g,'')};storyUnseen++;
}
function chapter(id,title,txt){const st=storyState();if(st.chap[id])return;st.n++;st.chap[id]={n:st.n,d:S.day,title};
  tell(huecos(TXN.historia.capitulo,{cap:st.n,titulo:title,txt:txt}),'📕','c');setTimeout(()=>toast(huecos(TXN.historia.capitulo_aviso,{cap:st.n,titulo:title}),true),400);}
function newToday(){S.today={d:S.day,work:null,used:{},built:[],skills:[],ev:[],moodS:0,moodN:0,calls:[],harvest:0,weeds:0,out:null};}
function tally(k,v){const td=S.today;if(!td)return;if(k==='used')td.used[v]=(td.used[v]||0)+1;else if(Array.isArray(td[k])){if(!td[k].includes(v))td[k].push(v);}else td[k]=v;}
// personas de su vida
const FRIENDS=DATA.personas.amistades;
function initPeople(){const PP=DATA.personas;const f=pickR(FRIENDS),c=pickR(PP.companeros);
  S.people=[{k:'madre',n:pickR(PP.madres),r:TXN.historia.rol_madre,mi:'mamá',e:'👩‍🦳',rel:72},
    {k:'amiga',n:f[0],r:huecos(TXN.historia.rol_amiga,{g:f[1]}),mi:f[0],e:'🫶',rel:66,g:f[1]},
    {k:'vecina',n:pickR(PP.vecindario),r:TXN.historia.rol_vecina,mi:null,e:'🏘️',rel:35},
    {k:'compi',n:c[0],r:huecos(TXN.historia.rol_compi,{g:c[1]}),mi:c[0],e:'💼',rel:40,g:c[1]}];}
const P_=k=>(S.people||[]).find(p=>p.k===k);
function relLabel(r){return r>=80?TXN.historia.rel_muy_unidos:r>=60?TXN.historia.rel_buena:r>=40?TXN.historia.rel_bien:r>=22?TXN.historia.rel_distantes:TXN.historia.rel_apenas;}
function storyStart(){
  if(!S.people)initPeople();newToday();const c=CH(),D=Dm(),m=P_('madre');
  const money=D.money>=1000?TXN.historia.dinero_ahorros:D.money>=400?TXN.historia.dinero_algo:TXN.historia.dinero_poco;
  chapter('start',TXN.historia.inicio_titulo,huecos(TXN.historia.inicio,{nombre:c.name,edad:c.age,casa:HT().start,dinero:money,trabajo:S.jobless?TXN.historia.inicio_paro:huecos(TXN.historia.inicio_empleo,{puesto:CAREER[0].t.toLowerCase(),empresa:S.office?S.office.n:TXN.historia.inicio_empresa}),ideas:S.ideo&&S.ideo!=='apolitica'?huecos(TXN.historia.inicio_ideas,{ideologia:IDEOS[S.ideo].n.toLowerCase()}):'',madre:m?huecos(TXN.historia.inicio_madre,{p:m.n}):''}));
}
