// ---------- el golpe: dinero ----------
const GT=DATA.sucesos.nucleo_golpes;
const GOLPES=[
  {id:'alquiler',m:()=>weeklyRent()*GT.alquiler.k/PM(),c:()=>!S.owned,x:m=>huecos(GT.alquiler.x,{m:fmt(m)}),fx:m=>{S.rentMul=(S.rentMul||1)*(1+m/Math.max(1,weeklyRent()));}},
  {id:'caldera',m:()=>WP()*(GT.caldera.a+Math.random()*GT.caldera.v)/PM(),x:m=>huecos(GT.caldera.x,{m:fmt(m)}),fx:m=>{S.money-=m;}},
  {id:'muela',m:()=>WP()*(GT.muela.a+Math.random()*GT.muela.v)/PM(),x:m=>huecos(GT.muela.x,{m:fmt(m)}),fx:m=>{S.money-=m;}},
  {id:'luz',m:()=>WP()*(GT.luz.a+Math.random()*GT.luz.v)/PM(),x:m=>huecos(GT.luz.x,{m:fmt(m)}),fx:m=>{S.money-=m;}},
  {id:'multa',m:()=>WP()*(GT.multa.a+Math.random()*GT.multa.v)/PM(),x:m=>huecos(GT.multa.x,{m:fmt(m)}),fx:m=>{S.money-=m;}}];
