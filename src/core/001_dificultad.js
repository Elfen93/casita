// ---------- dificultad ----------
const DIFF={
  facil:{n:'Fácil',e:'🌱',pay:1.35,price:0.85,rent:0.65,food:0,money:2000,goal:1,xp:1,shifts:1,skillAdd:0,desc:'Sueldos generosos y todo barato: la casa crece en pocos días.'},
  normal:{n:'Normal',e:'🙂',pay:1.15,price:1,rent:0.85,food:2,money:1000,goal:0.6,xp:0.7,shifts:4,skillAdd:0,desc:'Hay que ahorrar unas semanas para cada mejora; ascender lleva varias semanas.'},
  dificil:{n:'Difícil',e:'😓',pay:1.05,price:1,rent:0.95,food:3,money:500,goal:0.4,xp:0.45,shifts:8,skillAdd:1,desc:'Meses de ahorro para una reforma; cada ascenso pide más habilidad.'},
  realista:{n:'Realista',e:'🏚️',pay:1,price:1,rent:1,food:4,money:200,goal:0.25,xp:0.3,shifts:20,skillAdd:1,desc:'Como la vida misma: años de ahorro para ampliar la casa y meses para cada ascenso. Si no mejora sus habilidades, se estanca.'}};
DIFF.soul={n:'Soul Crusher',e:'💀',pay:1,price:1,rent:1.05,food:4,money:100,goal:0.15,xp:0.25,shifts:25,skillAdd:2,soul:true,desc:'Hiperrealista y cruel: precios e intereses que suben sin avisar, despidos, recortes, horas extra sin pagar, ascensos que se llevan otros y averías. Esforzarse no garantiza nada… aunque a veces sale bien: ofertas de otras empresas, negociar con carisma, trabajitos y algo de suerte.'};
const HOUSE={facil:{util:.8,house:6,down:.1,rate:.02,years:15,closing:.03},normal:{util:1.1,house:8,down:.15,rate:.03,years:20,closing:.06},dificil:{util:1.4,house:9,down:.2,rate:.04,years:25,closing:.08},realista:{util:1.7,house:10,down:.2,rate:.045,years:30,closing:.1},soul:{util:1.6,house:11,down:.25,rate:.05,years:30,closing:.12}};
const Hm=()=>HOUSE[(S&&S.diff)||'facil'];
const DIFF_ORDER=['facil','normal','dificil','realista','soul'];
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
const FLOORS = {
  0:{n:'Césped',c:'#8bbd72',p:0},
  1:{n:'Madera',c:'#d4a373',p:10,pat:'planks'},
  6:{n:'Parqué',c:'#8a5a3b',p:14,pat:'planks'},
  2:{n:'Baldosa',c:'#e3e9ec',p:12,pat:'check'},
  5:{n:'Mármol',c:'#efece6',p:22,pat:'marble'},
  3:{n:'Moqueta',c:'#b67fa0',p:15},
  4:{n:'Piedra',c:'#a3a9b0',p:8,pat:'check'},
  7:{n:'Grava',c:'#cfc6b6',p:5,pat:'dots'},
  8:{n:'Tierra',c:'#8b6a4a',p:3,pat:'rows'},
  9:{n:'Piscina',c:'#4fb3e8',p:45,water:true},
};
const FLOOR_ORDER=[1,6,2,5,3,4,7,8,9,0];
const WALLCOLS = [['#f3e6cf','Crema'],['#f4c7bd','Rosa'],['#bfe0d4','Menta'],['#c9d6f2','Cielo'],['#f2e2a0','Limón'],['#d8cfe8','Lila'],['#c98f6b','Ladrillo'],['#fbfbfb','Blanco'],['#6d7b8c','Pizarra'],['#2f3b4a','Noche']];
const OBJ = {
  nevera:{n:'Nevera',e:'🧊',p:400,h:48,c:'#e8eef2',ins:.14,need:{hambre:1.1},verb:'Picando algo',b:'🍽️',cat:'need'},
  fogon:{n:'Fogón',e:'🍳',p:300,h:24,c:'#8a8f98',ins:.1,need:{hambre:1.6},verb:'Cocinando',b:'🍳',sk:'cocina',cat:'need'},
  cama:{n:'Cama',e:'🛏️',p:450,h:16,c:'#6c8ebf',ins:.05,need:{energia:0.17},verb:'Durmiendo',b:'💤',cat:'need'},
  ducha:{n:'Ducha',e:'🚿',p:350,h:52,c:'#a9d6e5',ins:.1,need:{higiene:2},verb:'Duchándose',b:'🫧',cat:'need'},
  vater:{n:'Váter',e:'🚽',p:200,h:18,c:'#f4f4f4',ins:.22,need:{vejiga:4},verb:'En el baño',b:'🚽',cat:'need'},
  sofa:{n:'Sofá',e:'🛋️',p:350,h:18,c:'#c0705a',ins:.08,need:{diversion:0.45,energia:0.05},verb:'Tirada en el sofá',b:'😌',cat:'fun'},
  tele:{n:'Tele',e:'📺',p:450,h:30,c:'#3a414c',ins:.2,need:{diversion:0.9},verb:'Viendo la tele',b:'📺',cat:'fun'},
  libros:{n:'Librería',e:'📚',p:250,h:54,c:'#8b5a3c',ins:.12,need:{diversion:0.5},verb:'Leyendo',b:'📖',sk:'logica',cat:'fun'},
  compu:{n:'Ordenador',e:'💻',p:660,chair:true,h:24,c:'#7a6a58',ins:.12,need:{diversion:0.8,social:0.3},verb:'Programando',b:'💻',sk:'logica',cat:'fun'},
  guitarra:{n:'Guitarra',e:'🎸',p:220,h:6,c:'#d4a373',ins:.3,need:{diversion:0.8},verb:'Tocando la guitarra',b:'🎵',sk:'musica',cat:'fun'},
  telefono:{n:'Teléfono',e:'☎️',p:120,h:22,c:'#b23a48',ins:.32,need:{social:1.1},verb:'Charlando por teléfono',b:'💬',sk:'carisma',cat:'fun'},
  espejo:{n:'Espejo',e:'🪞',p:160,h:50,c:'#c7b299',ins:.36,need:{social:0.4},verb:'Ensayando discursos',b:'🗣️',sk:'carisma',cat:'fun'},
  silla:{n:'Silla',e:'🪑',p:60,h:16,c:'#a47148',ins:.25,decor:1,cat:'deco'},
  banco:{n:'Banco de trabajo',e:'🛠️',p:260,h:24,c:'#b08060',ins:.06,need:{diversion:0.35},verb:'Practicando bricolaje',b:'🛠️',cat:'fun',sk:'carp'},
  mesa:{n:'Mesa',e:'🍽️',p:180,h:22,c:'#a47148',ins:.06,decor:2,cat:'deco'},
  planta:{n:'Planta',e:'🪴',p:80,h:10,c:'#7a5230',ins:.3,decor:3,green:1,cat:'deco',need:{diversion:0.25},verb:'Cuidando la planta',b:'💧',sk:'jard'},
  lampara:{n:'Lámpara',e:'💡',p:90,h:40,c:'#e9c46a',ins:.36,decor:2,light:true,cat:'deco'},
  alfombra:{n:'Alfombra',e:'🟥',p:70,h:1,c:'#c45b5b',ins:.04,decor:2,flat:true,cat:'deco'},
  arbol:{n:'Árbol',e:'🌳',p:60,h:4,c:'#5a3e2b',ins:.4,decor:3,big:true,green:1,cat:'garden'},
  flores:{n:'Flores',e:'🌷',p:40,h:3,c:'#6b8f3a',ins:.25,decor:2,green:1,cat:'garden',need:{diversion:0.25},verb:'Regando las flores',b:'💧',sk:'jard'},
  seto:{n:'Seto',e:'',p:50,h:24,c:'#4f8a3c',ins:.08,decor:1,green:1,cat:'garden'},
  farola:{n:'Farola',e:'🏮',p:120,h:58,c:'#3b3f46',ins:.42,decor:1,light:true,cat:'garden'},
  huerto:{n:'Huerto',e:'🥕',p:70,h:8,c:'#6b4a2b',ins:.06,decor:2,green:1,cat:'garden',need:{diversion:0.3},verb:'Cuidando el huerto',b:'🥕',sk:'jard'},
  bancoj:{n:'Banco de jardín',e:'🪵',p:150,h:16,c:'#8a6a4a',ins:.12,decor:2,cat:'garden',need:{diversion:0.45,energia:0.04},verb:'Tomando el aire',b:'🍃'},
  barbacoa:{n:'Barbacoa',e:'🍖',p:220,h:24,c:'#3b3f46',ins:.18,decor:1,cat:'garden',need:{hambre:1.4,social:0.15},verb:'Haciendo una barbacoa',b:'🍖',sk:'cocina'},
  fuente:{n:'Fuente',e:'⛲',p:260,h:30,c:'#c9c3b8',ins:.06,decor:4,cat:'garden'},
};
const SHIRTS = ['#ff8a5b','#5bc0be','#9b5de5','#f15bb5','#00bb7f','#3a86ff'];
const KEY = 'casita-save-v1';

