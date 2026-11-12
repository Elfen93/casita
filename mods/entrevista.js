// =================== LA ENTREVISTA: las preguntas ilegales dependen de a quién tienen delante ===================
const {entrevista:TX_entrevista}=DATA.textos_mods_ag;
function skinDark(c){const s=(c.skin||'#eee').toLowerCase();const m=s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);if(!m)return false;const l=(parseInt(m[1],16)*.3+parseInt(m[2],16)*.59+parseInt(m[3],16)*.11);return l<150;}
function entrevQ(){const c=CH();const g=c.g;const dark=skinDark(c);const age=c.age||27;const qs=[];
  if(g==='f')qs.push(TX_entrevista.q_hijos);else if(g==='x')qs.push(TX_entrevista.q_x);else qs.push(age>=45?TX_entrevista.q_edad:TX_entrevista.q_cargas);
  if(dark)qs.push(TX_entrevista.q_origen);qs.push(huecos(TX_entrevista.q_sindicado,{}));if(g==='m'&&!dark&&age<45)qs.push(TX_entrevista.q_antecedentes);
  const L=qs.slice(0,3);return huecos(TX_entrevista.preguntan,{lista:L.slice(0,-1).join(', '),ult:L[L.length-1]});}
function entrevYes(){const c=CH();const g=c.g;const dark=skinDark(c);return g==='f'?TX_entrevista.si_f:g==='x'?TX_entrevista.si_x:dark?TX_entrevista.si_oscuro:TX_entrevista.si_otro;}
