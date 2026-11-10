// ---------- el golpe: dinero ----------
const GOLPES=[
  {id:'alquiler',m:()=>weeklyRent()*.12/PM(),c:()=>!S.owned,x:m=>`Carta del casero: el alquiler sube ${fmt(m)} a la semana «por actualización del mercado». Nadie ha arreglado la persiana.`,fx:m=>{S.rentMul=(S.rentMul||1)*(1+m/Math.max(1,weeklyRent()));}},
  {id:'caldera',m:()=>WP()*(.45+Math.random()*.3)/PM(),x:m=>`La caldera ha muerto. El casero dice que «el mantenimiento es cosa del inquilino». Arreglarla: ${fmt(m)}.`,fx:m=>{S.money-=m;}},
  {id:'muela',m:()=>WP()*(.35+Math.random()*.45)/PM(),x:m=>`Dolor de muelas desde el martes. El dentista: ${fmt(m)}. La sanidad pública no cubre la boca; por lo visto no es parte del cuerpo.`,fx:m=>{S.money-=m;}},
  {id:'luz',m:()=>WP()*(.22+Math.random()*.2)/PM(),x:m=>`Factura de la luz: ${fmt(m)}, el doble que el mes pasado. La compañía ha ganado mil millones este trimestre.`,fx:m=>{S.money-=m;}},
  {id:'multa',m:()=>WP()*(.22+Math.random()*.25)/PM(),x:m=>`Multa de ${fmt(m)} por aparcar donde aparca todo el barrio. A la furgoneta de la obra de al lado no se la ponen nunca.`,fx:m=>{S.money-=m;}}];
