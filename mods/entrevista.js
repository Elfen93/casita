// =================== LA ENTREVISTA: las preguntas ilegales dependen de a quién tienen delante ===================
function skinDark(c){const s=(c.skin||'#eee').toLowerCase();const m=s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);if(!m)return false;const l=(parseInt(m[1],16)*.3+parseInt(m[2],16)*.59+parseInt(m[3],16)*.11);return l<150;}
function entrevQ(){const c=CH();const g=c.g;const dark=skinDark(c);const age=c.age||27;const qs=[];
  if(g==='f')qs.push('si tiene hijos o piensa tenerlos');else if(g==='x')qs.push('«qué es exactamente», mirando el formulario');else qs.push(age>=45?'si «aguantará el ritmo» a su edad':'si tiene «cargas familiares»');
  if(dark)qs.push('de dónde es «de verdad»');qs.push('si está sindicad'+oa());if(g==='m'&&!dark&&age<45)qs.push('si tiene antecedentes');
  const L=qs.slice(0,3);return 'Le preguntan '+L.slice(0,-1).join(', ')+' y '+L[L.length-1]+'.';}
function entrevYes(){const c=CH();const g=c.g;const dark=skinDark(c);return g==='f'?`Ha dicho que no tiene hijos ni planes de tenerlos y que la política «no va con ella». Empieza el lunes.`:g==='x'?`Ha contestado a todo con una sonrisa que le ha costado el día. Empieza el lunes.`:dark?`Ha dicho que es «de aquí de toda la vida», que no tiene cargas y que lo del sindicato «ni idea». Empieza el lunes.`:`Ha dicho que no tiene cargas, ni antecedentes, ni sindicato, ni opiniones. Empieza el lunes.`;}
