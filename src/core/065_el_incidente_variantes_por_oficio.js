// ---------- el incidente: variantes por oficio ----------
const IT=DATA.sucesos.nucleo_incidentes;
const INCID={
  super:[{id:'horas',x:()=>huecos(IT.super.horas,{fin:SHIFT.end,b:bossT()})},{id:'caja',x:()=>huecos(IT.super.caja,{m:fmt(Math.round(WP()*.06)),B:cap(bossT())})},{id:'turnos',x:()=>IT.super.turnos}],
  oficina:[{id:'viernes',x:()=>huecos(IT.oficina.viernes,{B:cap(bossT())})},{id:'merito',x:()=>huecos(IT.oficina.merito,{B:cap(bossT()),c:compiN()})},{id:'conexion',x:()=>huecos(IT.oficina.conexion,{B:cap(bossT())})}],
  hosteleria:[{id:'propinas',x:()=>huecos(IT.hosteleria.propinas,{b:bossT(),m:fmt(Math.round(WP()*.1)),c:compiN()})},{id:'doble',x:()=>huecos(IT.hosteleria.doble,{B:cap(bossT())})},{id:'cliente',x:()=>huecos(IT.hosteleria.cliente,{B:cap(bossT())})}],
  obra:[{id:'arnes',x:()=>huecos(IT.obra.arnes,{B:cap(bossT())})},{id:'lluvia',x:()=>huecos(IT.obra.lluvia,{B:cap(bossT())})},{id:'horas',x:()=>IT.obra.horas}],
  cuidados:[{id:'doble',x:()=>huecos(IT.cuidados.doble,{c:compiN()})},{id:'ratio',x:()=>IT.cuidados.ratio},{id:'guantes',x:()=>huecos(IT.cuidados.guantes,{B:cap(bossT())})}],
  tech:[{id:'sprint',x:()=>huecos(IT.tech.sprint,{B:cap(bossT())})},{id:'guardia',x:()=>IT.tech.guardia}],
  funcion:[{id:'plazas',x:()=>huecos(IT.funcion.plazas,{B:cap(bossT())})},{id:'ventanilla',x:()=>IT.funcion.ventanilla}],
  reparto:[{id:'lluvia',x:()=>IT.reparto.lluvia},{id:'accidente',x:()=>IT.reparto.accidente}],
  arte:[{id:'consumo',x:()=>huecos(IT.arte.consumo,{B:cap(bossT())})},{id:'bolo',x:()=>IT.arte.bolo}],
  negocio:[{id:'proveedor',x:()=>IT.negocio.proveedor},{id:'alquiler',x:()=>IT.negocio.alquiler}],
  coop:[{id:'asamblea',x:()=>huecos(IT.coop.asamblea,{c:compiN()})}]};
const INC_TXT=k=>{for(const V of Object.values(INCID)){const v=V.find(x=>x.id===k);if(v)return v.x();}return '';};
