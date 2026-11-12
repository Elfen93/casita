// ---------- arcos de cada ideología ----------
const ARCS=DATA.sucesos.nucleo_arcos;
// la lógica de cada etapa (c = condición, fx = efecto), unida por id a data/sucesos.json → nucleo_arcos
for(const [k,fns] of Object.entries({
  marxista:{m2:{c:()=>S.union&&S.union.member&&office().org>=35},
    m3:{c:()=>W_().mov>=40,fx:()=>{S.pol.inf+=10;}},
    m4:{c:()=>W_().crisis>=60&&W_().mov>=65,fx:()=>{S.pol.inf+=15;}}},
  anarquista:{a1:{fx:()=>{S.pol.mutual=true;}},
    a2:{fx:()=>{S.pol.tenant=true;}},
    a3:{c:()=>office().org>=30||W_().mov>=45,fx:()=>{S.pol.coopOK=true;}},
    a4:{c:()=>W_().crisis>=60&&W_().mov>=65,fx:()=>{S.pol.inf+=15;}}},
  socialdemocrata:{s2:{c:()=>S.union&&S.union.member,fx:()=>{S.pol.delegada=true;}},
    s3:{c:()=>S.pol.inf>=25,fx:()=>{S.pol.cand=true;}}},
  ecologista:{e2:{fx:()=>{S.pol.commons=true;}},
    e3:{fx:()=>{S.pol.coopEnergy=true;}},
    e4:{c:()=>W_().mov>=35,fx:()=>{S.pol.inf+=20;S.pol.cand=true;}}},
  liberal:{l2:{fx:()=>{S.pol.network=true;}},
    l3:{fx:()=>{S.pol.invest='fondos';}},
    l4:{c:()=>S.pol.inf>=25,fx:()=>{S.pol.cand=true;}}},
  libertaria:{b2:{fx:()=>{S.pol.hustle=true;}},
    b3:{fx:()=>{S.pol.invest='cripto';}},
    b4:{c:()=>S.track==='negocio'}},
  conservadora:{c1:{fx:()=>{S.pol.parish=true;}},
    c2:{c:()=>S.owned,fx:()=>{S.pol.inf+=5;}},
    c3:{c:()=>S.pol.inf>=25,fx:()=>{S.pol.cand=true;}}}}))porId(ARCS[k],fns);
ARCS.marxista.forEach(a=>{});
function arcTick(){
  const arc=ARCS[S.ideo];if(!arc)return;const p=S.pol;
  for(const st of arc){if(p.stages[st.id])continue;if(p.xp<st.at)break;if(st.c&&!st.c())continue;p.stages[st.id]=S.day;if(st.fx)st.fx();chapter('arc_'+st.id,st.t,st.x);break;}
}
