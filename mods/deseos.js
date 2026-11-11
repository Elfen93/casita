// =================== DESEOS CON LOS PIES EN EL SUELO: se quiere lo que se puede tener según dónde vive y lo que gana ===================
// una piscina de obra cuesta lo que cuesta: unos 3.000 € por casilla (6 casillas ≈ 18.000 €)
if(FLOORS[9]&&FLOORS[9].water)FLOORS[9].p=3000;
const GARDEN_T=new Set(['huerto','bancoj','barbacoa','fuente','arbol','seto','farola','flores']);
function wantOK(w){if(!w)return false;const own=S.owned;const all=HT().build==='all';const sp=spare();const t=w.steps&&w.steps[0]&&(w.steps[0].t||w.steps[0].v);
  if(w.key==='pool')return own&&all&&sp>=25000;
  if(w.key==='win'||w.key==='paint'||(w.key||'').startsWith('room'))return own||all;
  if(w.kind==='buy'&&GARDEN_T.has(t)&&!all)return false;
  if(w.kind==='buy'&&['banera','chimenea','lavavaj'].includes(t)&&!own&&!all)return false;
  if(w.kind==='buy'&&(t==='fuente'))return own&&sp>=3000;
  if(w.kind==='buy'&&(t==='barbacoa'))return all&&sp>=900;
  // lo que no es necesidad, solo si sobra de verdad: el doble de lo que cuesta
  const need=w.urgent||(w.why||'').match(/antes de que se rompa|está rota|para estudiar|para la mesa|para comer sentada|para sentarse al ordenador/)||(w.key||'').startsWith('fix')||w.key==='chairs';
  if(!need&&w.kind!=='fix'){const pr=jobPrice(w);const tot=pr.mat+(w.kind==='buy'?pr.labor*0:0);if(tot>0&&sp<tot*2)return false;}
  return true;}
{const _cw=chooseWant;chooseWant=function(){for(let k=0;k<6;k++){const w=_cw.apply(this,arguments);if(wantOK(w))return w;if(!w)return null;}return null;};}
