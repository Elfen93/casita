// ---------- arcos de cada ideología ----------
const ARCS={
  marxista:[{at:4,id:'m1',t:'Conciencia de clase',x:'Ha empezado a ir a reuniones. Ha descubierto que lo que le pasa en el trabajo no es mala suerte: tiene nombre.'},
    {at:15,id:'m2',t:'La plantilla',c:()=>S.union&&S.union.member&&office().org>=35,x:'Ya no está sola en el trabajo: hay un grupo de compañeras que se reúnen en el descanso.'},
    {at:35,id:'m3',t:'El barrio',c:()=>W_().mov>=40,x:'La lucha sale del trabajo: asambleas de barrio, sindicato de inquilinas, cajas de resistencia.',fx:()=>{S.pol.inf+=10;}},
    {at:60,id:'m4',t:'La hora de las asambleas',c:()=>W_().crisis>=60&&W_().mov>=65,x:'La crisis lo arrasa todo y la gente ya no tiene miedo. Su nombre suena en las asambleas.',fx:()=>{S.pol.inf+=15;}}],
  anarquista:[{at:4,id:'a1',t:'Apoyo mutuo',x:'En el ateneo nadie manda. Se reparten comida, herramientas y turnos para cuidar a quien lo necesita.',fx:()=>{S.pol.mutual=true;}},
    {at:18,id:'a2',t:'Sindicato de inquilinas',x:'Con sus vecinas ha formado un sindicato de inquilinas. Si suben el alquiler, no pagarán la subida.',fx:()=>{S.pol.tenant=true;}},
    {at:38,id:'a3',t:'La cooperativa',c:()=>office().org>=30||W_().mov>=45,x:'Con varias compañeras ha montado una cooperativa: sin jefes, se reparte lo que se gana.',fx:()=>{S.pol.coopOK=true;}},
    {at:60,id:'a4',t:'Redes en la tormenta',c:()=>W_().crisis>=60&&W_().mov>=65,x:'Las redes de apoyo mutuo sostienen medio barrio. Ya no piden permiso.',fx:()=>{S.pol.inf+=15;}}],
  socialdemocrata:[{at:4,id:'s1',t:'Afiliada',x:'Se ha afiliado a la agrupación local. Mucha reunión, mucho café, alguna buena idea.'},
    {at:15,id:'s2',t:'Delegada',c:()=>S.union&&S.union.member,x:'La han elegido delegada sindical. Negocia por toda la plantilla y no la pueden despedir así como así.',fx:()=>{S.pol.delegada=true;}},
    {at:32,id:'s3',t:'En las listas',c:()=>S.pol.inf>=25,x:'La agrupación la quiere en las listas municipales. Ahora toca convencer al barrio.',fx:()=>{S.pol.cand=true;}}],
  ecologista:[{at:4,id:'e1',t:'El colectivo',x:'Se ha unido a un colectivo ecologista. Bicis, semillas y mucha paciencia.'},
    {at:15,id:'e2',t:'Huerto comunitario',x:'Han convertido un solar abandonado en un huerto comunitario. Cada semana vuelve con verduras.',fx:()=>{S.pol.commons=true;}},
    {at:30,id:'e3',t:'Cooperativa energética',x:'Se ha pasado a una cooperativa de energía renovable. La factura de la luz baja y la conciencia también descansa.',fx:()=>{S.pol.coopEnergy=true;}},
    {at:50,id:'e4',t:'La campaña',c:()=>W_().mov>=35,x:'Han parado una macrogranja que iban a construir al lado del río. Medio pueblo salió a la calle.',fx:()=>{S.pol.inf+=20;S.pol.cand=true;}}],
  liberal:[{at:4,id:'l1',t:'Mentalidad de crecimiento',x:'Ha empezado a ir a eventos de networking. Tarjetas, sonrisas y LinkedIn.'},
    {at:15,id:'l2',t:'Red de contactos',x:'Su red de contactos empieza a dar frutos: le llegan ofertas sin buscarlas.',fx:()=>{S.pol.network=true;}},
    {at:25,id:'l3',t:'Cartera indexada',x:'Ha abierto una cartera de fondos indexados. Cada mes aparta una parte, pase lo que pase.',fx:()=>{S.pol.invest='fondos';}},
    {at:45,id:'l4',t:'En las listas',c:()=>S.pol.inf>=25,x:'El partido liberal local le ha ofrecido ir en las listas municipales.',fx:()=>{S.pol.cand=true;}}],
  libertaria:[{at:4,id:'b1',t:'Hazte a ti misma',x:'Ha dejado de esperar nada de nadie. Si hay que buscarse la vida, se la busca.'},
    {at:12,id:'b2',t:'El side hustle',x:'Ahora tiene trabajitos por su cuenta casi cada semana.',fx:()=>{S.pol.hustle=true;}},
    {at:22,id:'b3',t:'Cripto',x:'Ha metido sus ahorros en cripto. Mira el gráfico antes de desayunar.',fx:()=>{S.pol.invest='cripto';}},
    {at:40,id:'b4',t:'Sin jefe',c:()=>S.track==='negocio',x:'Tiene su propio negocio. Nadie le dice a qué hora entrar; nadie le paga si no vende.'}],
  conservadora:[{at:4,id:'c1',t:'Raíces',x:'Ha vuelto a ir a la parroquia y a la asociación de vecinos. Gente de toda la vida.',fx:()=>{S.pol.parish=true;}},
    {at:18,id:'c2',t:'Patrimonio',c:()=>S.owned,x:'Tiene su casa. Lo que es suyo, es suyo.',fx:()=>{S.pol.inf+=5;}},
    {at:32,id:'c3',t:'En las listas',c:()=>S.pol.inf>=25,x:'La asociación la ha propuesto para ir en las listas municipales del barrio.',fx:()=>{S.pol.cand=true;}}]};
ARCS.marxista.forEach(a=>{});
function arcTick(){
  const arc=ARCS[S.ideo];if(!arc)return;const p=S.pol;
  for(const st of arc){if(p.stages[st.id])continue;if(p.xp<st.at)break;if(st.c&&!st.c())continue;p.stages[st.id]=S.day;if(st.fx)st.fx();chapter('arc_'+st.id,st.t,st.x);break;}
}
