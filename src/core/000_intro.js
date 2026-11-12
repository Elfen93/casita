<script>
(() => {
// <<DATA>>
// une a una tabla de data/ la parte que es lógica (funciones), entrada a entrada
// texto con huecos: {clave} se cambia por v.clave; sin dato, {n} es el nombre del personaje y {o} la terminación de su género
function huecos(s,v){return s.replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:k==='n'?CH().name:k==='o'?oa():m);}
const TXN=DATA.textos_nucleo; // textos sueltos del núcleo, una sección por archivo (data/textos_nucleo.json)
// lo mismo para una lista de fichas con id: porId(lista,{id:{campo:función}})
function porId(lista,fns){for(const k in fns){const f=lista.find(x=>x.id===k);if(!f)throw new Error('porId: falta «'+k+'» en data/');Object.assign(f,fns[k]);}return lista;}
function conLogica(tabla,fns){for(const k in fns){if(!tabla[k])throw new Error('conLogica: falta «'+k+'» en data/');Object.assign(tabla[k],fns[k]);}return tabla;}
const N = 20, TW = 64, TH = 32, WALL_H = 54, LOW_H = 10;
const NEEDS = DATA.reglas.necesidades;
const DECAY = Object.fromEntries(NEEDS.map(n=>[n[0],n[3]]));
const SKILLS = DATA.profesiones.habilidades;
let CAREER = [
  {t:'Becaria',pay:120,req:{}},
  {t:'Ayudante',pay:170,req:{shifts:3}},
  {t:'Técnica',pay:230,req:{shifts:6,logica:2}},
  {t:'Especialista',pay:310,req:{shifts:10,logica:3,carisma:2}},
  {t:'Coordinadora',pay:400,req:{shifts:15,logica:5,carisma:4}},
  {t:'Directora',pay:520,req:{shifts:22,logica:7,carisma:6}},
];

