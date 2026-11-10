<script>
(() => {
const N = 20, TW = 64, TH = 32, WALL_H = 54, LOW_H = 10;
const NEEDS = [
  ['hambre','🍔','Hambre',0.075],
  ['energia','⚡','Energía',0.055],
  ['higiene','🧼','Higiene',0.045],
  ['vejiga','🚽','Vejiga',0.09],
  ['diversion','🎉','Diversión',0.06],
  ['social','💬','Social',0.04],
];
const DECAY = Object.fromEntries(NEEDS.map(n=>[n[0],n[3]]));
const SKILLS = [['cocina','🍳','Cocina'],['logica','🧠','Lógica'],['carisma','🗣️','Carisma'],['musica','🎸','Música'],['carp','🪚','Carpintería'],['elec','⚡','Electrónica'],['font','🚰','Fontanería'],['alba','🧱','Albañilería'],['jard','🌱','Jardinería']];
let CAREER = [
  {t:'Becaria',pay:120,req:{}},
  {t:'Ayudante',pay:170,req:{shifts:3}},
  {t:'Técnica',pay:230,req:{shifts:6,logica:2}},
  {t:'Especialista',pay:310,req:{shifts:10,logica:3,carisma:2}},
  {t:'Coordinadora',pay:400,req:{shifts:15,logica:5,carisma:4}},
  {t:'Directora',pay:520,req:{shifts:22,logica:7,carisma:6}},
];

