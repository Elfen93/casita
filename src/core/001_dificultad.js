// ---------- dificultad ----------
const DIFF=DATA.reglas.dificultades;
const HOUSE=DATA.viviendas.compra;
const Hm=()=>HOUSE[(S&&S.diff)||'facil'];
const DIFF_ORDER=DATA.reglas.dificultades_orden;
const Dm=()=>DIFF[(S&&S.diff)||'facil'];
const MK=()=>(Dm().soul&&S.market)?S.market:{price:1,util:1,rate:1};
const PM=()=>Dm().price*MK().price;
// requisitos reales de cada puesto según la dificultad; si sus habilidades superan lo pedido, asciende antes
function reqOf(c){
  const D=Dm(),lv=CAREER.indexOf(c),r={};
  for(const [k] of SKILLS)if(c.req[k])r[k]=Math.min(10,c.req[k]+D.skillAdd);
  if(lv===1&&D.skillAdd>0&&!r.logica)r.logica=D.skillAdd;
  const base=Math.round((c.req.shifts||0)*D.shifts);
  const ks=Object.keys(r);const surplus=ks.length?Math.min(...ks.map(k=>lvl(k)-r[k])):0;
  r.baseShifts=base;r.shifts=surplus>0?Math.round(base*Math.max(0.6,1-0.1*surplus)):base;r.fast=surplus>0;
  return r;
}
const FLOORS = DATA.objetos.suelos;
const FLOOR_ORDER=DATA.objetos.suelos_orden;
const WALLCOLS = DATA.objetos.paredes;
const OBJ = DATA.objetos.objetos;
const SHIRTS = ['#ff8a5b','#5bc0be','#9b5de5','#f15bb5','#00bb7f','#3a86ff'];
const KEY = 'casita-save-v1';

