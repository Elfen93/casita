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
  tell(`<b>Capítulo ${st.n} · ${title}.</b> ${txt}`,'📕','c');setTimeout(()=>toast(`📕 Capítulo ${st.n}: ${title}`,true),400);}
function newToday(){S.today={d:S.day,work:null,used:{},built:[],skills:[],ev:[],moodS:0,moodN:0,calls:[],harvest:0,weeds:0,out:null};}
function tally(k,v){const td=S.today;if(!td)return;if(k==='used')td.used[v]=(td.used[v]||0)+1;else if(Array.isArray(td[k])){if(!td[k].includes(v))td[k].push(v);}else td[k]=v;}
// personas de su vida
const FRIENDS=DATA.personas.amistades;
function initPeople(){const PP=DATA.personas;const f=pickR(FRIENDS),c=pickR(PP.companeros);
  S.people=[{k:'madre',n:pickR(PP.madres),r:'su madre',mi:'mamá',e:'👩‍🦳',rel:72},
    {k:'amiga',n:f[0],r:`su mejor amig${f[1]}`,mi:f[0],e:'🫶',rel:66,g:f[1]},
    {k:'vecina',n:pickR(PP.vecindario),r:'del piso de al lado',mi:null,e:'🏘️',rel:35},
    {k:'compi',n:c[0],r:`su compañer${c[1]} de trabajo`,mi:c[0],e:'💼',rel:40,g:c[1]}];}
const P_=k=>(S.people||[]).find(p=>p.k===k);
function relLabel(r){return r>=80?'muy unidos':r>=60?'buena relación':r>=40?'se llevan bien':r>=22?'algo distantes':'apenas se hablan';}
function storyStart(){
  if(!S.people)initPeople();newToday();const c=CH(),D=Dm(),m=P_('madre');
  const money=D.money>=1000?'unos ahorros y muchas ganas':D.money>=400?'algo ahorrado y bastante incertidumbre':'lo que cabe en una maleta y una cuenta casi vacía';
  chapter('start','Una casa con eco',`${c.name} tiene ${c.age} años y ${HT().start}. Llega con ${money}. ${S.jobless?'No tiene trabajo: mañana empieza a buscar.':`Mañana empieza de ${CAREER[0].t.toLowerCase()} en ${S.office?S.office.n:'una empresa del centro'}.`} ${S.ideo&&S.ideo!=='apolitica'?`En la maleta, entre la ropa, lleva sus ideas: es ${IDEOS[S.ideo].n.toLowerCase()} y no piensa esconderlo.`:''} ${m?`${m.n}, su madre, le ha dicho por teléfono que se cuide.`:''}`);
}
