// =================== VOCES: cada persona piensa a su manera, y lo que se comenta depende del sistema en el que vivís ===================
const IDEO_DIST=[['apolitica',30],['socialdemocrata',19],['conservadora',18],['liberal',10],['ecologista',7],['marxista',7],['anarquista',4],['libertaria',5]];
function ideoRand(old){let t=0;const L=IDEO_DIST.map(([k,w])=>[k,w*(old&&k==='conservadora'?1.6:old&&(k==='anarquista'||k==='libertaria')?.4:1)]);for(const x of L)t+=x[1];let r=Math.random()*t;for(const [k,w] of L){r-=w;if(r<=0)return k;}return 'apolitica';}
// la familia se parece: la madre tira hacia el bloque de quien la crió (o al revés)
const LEFTB=['marxista','anarquista','socialdemocrata','ecologista'];
function ideoFor(p){if(p.k==='madre'&&S.ideo&&S.ideo!=='apolitica'&&Math.random()<.55){return LEFTB.includes(S.ideo)?pickR(['socialdemocrata','socialdemocrata','marxista','ecologista']):pickR(['conservadora','conservadora','liberal']);}return ideoRand(p.k==='madre');}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{for(const p of S.people||[]){if(!p.ideo||!IDEOS[p.ideo])p.ideo=ideoFor(p);}}catch(e){}return r;};}
// en Gente se ve de qué pie cojea cada cual
{const _gt=genteTab;genteTab=function(){let h=_gt.apply(this,arguments);try{for(const p of S.people||[]){if(!p.ideo||!IDEOS[p.ideo])p.ideo=ideoFor(p);h=h.replace(`<b>${p.n}</b> <small></small>`,`<b>${p.n}</b> <small>${IDEOS[p.ideo].e} ${IDEOS[p.ideo].n.toLowerCase()}</small>`);}}catch(e){}return h;};}
// ---- lo que ya no pega con los consejos: se cambia o se calla ----
const revNow=()=>typeof REV==='function'&&REV();
const merNow=()=>{const w=W_();return w.gov==='mercado'&&!w.era;};
const CAPI_RX=/subid[oa] la luz|sube la luz|factura de la luz|el casero|la casera|desahuci|eur[ií]bor|hipoteca variable|comisi[oó]n|ERE\b|despid|horas extra|dividend|bolsa|IBEX|fondo de inversi|fondos buitre|patronal|cesta de la compra|pisos tur[ií]sticos|subida del alquiler|te ha subido/i;
const SAFE_RX=/asamblea|consejo|Banca Pública|caja común|comuna|delegad/i;
const REV_QUEJAS=[
  'Dos horas de cola en el economato por un paquete de café. Al final, achicoria.',
  'La asamblea de escalera ha durado tres horas para decidir quién friega el portal. Le ha tocado a quien no fue.',
  'En el economato no hay zapatos del 43. «La semana que viene», dicen. Llevan tres semanas.',
  'Ha vuelto a cortarse la luz dos horas: falta combustible por el bloqueo.',
  'El delegado de distrito ya no baja a las asambleas. Dicen que tiene «coordinación». Habrá que revocarlo.',
  'La vecina del cuarto vende en el portal tabaco del de antes. Más caro. Todo el mundo lo sabe.',
  'El autobús nuevo pasa cada diez minutos y es gratis. Va lleno, pero pasa.',
  'Han abierto la biblioteca hasta medianoche. Está llena de gente que antes no pisaba una.',
  'Clases de electricidad gratis en el ateneo los martes. Hay lista de espera.',
  'El cuñado de alguien dice en el bar que «con el mercado había de todo». Le recuerdan cuánto costaba.'];
const MER_QUEJAS=['Inauguran otra línea de tren. Los sueldos suben, pero el piso sigue siendo pequeño.','El comité de la fábrica ha aprobado el plan de producción. Nadie preguntó a la plantilla.','Otra nave nueva en el polígono. La de al lado sigue vacía.','La cámara nueva de la esquina «es por seguridad», dicen.'];
function revFix(t){if(typeof t!=='string'||SAFE_RX.test(t))return t;let x=t.replace(/El casero cobró el alquiler de la semana/g,'Cuota de vivienda de la semana').replace(/Alquiler semanal/g,'Cuota de vivienda').replace(/\bsu jefe\b/g,'el delegado').replace(/\bel jefe\b/g,'el delegado');
  if(CAPI_RX.test(x))return null;return x;}
{const _t=tell;tell=function(txt,ic,kind){try{if(revNow()){const x=revFix(txt);if(x===null){if(Math.random()<.5)return;return _t.call(this,pickR(REV_QUEJAS),'🗣️',kind);}txt=x;}}catch(e){}return _t.call(this,txt,ic,kind);};}
{const _to=toast;toast=function(msg,gold){try{if(revNow()){const x=revFix(msg);if(x===null)return;msg=x;}}catch(e){}return _to.call(this,msg,gold);};}
// ---- el móvil: lo que te escriben depende de quién es y del sistema ----
const VOZ={
  consejos:{apolitica:['Mientras haya cañas y fútbol, a mí me da igual quién mande.','Dicen que el bar de la esquina ahora es una cooperativa. La caña sigue igual de fría.'],
    conservadora:['Esto no va a durar, ya verás. Tu tío dice que se vuelve al pueblo.','Han puesto a una vecina de delegada de mi bloque. Una vecina, ¿te lo puedes creer?','Ayer no había ni aceite. Antes eso no pasaba.'],
    liberal:['Dos horas de cola para un móvil. Así no hay quien innove.','Echo de menos poder elegir entre diez marcas de algo. Aunque fueran iguales.'],
    libertaria:['Ahora es la asamblea la que me dice qué hacer. Antes era el jefe. Mucho cambio no veo.'],
    socialdemocrata:['El centro de salud me ha dado cita para el jueves. ¡Para el jueves!','Ojalá esto no se tuerza. Lo de la sanidad está funcionando.'],
    ecologista:['El huerto comunal de la plaza va genial. Tomates para medio barrio.','Han cerrado la incineradora. Se respira distinto.'],
    marxista:['Hay que defender lo conseguido: el bloqueo aprieta y algunos quieren volver atrás.','Asamblea mañana a las siete. Vienes, ¿no?'],
    anarquista:['Ojo con los delegados, que ya se están acomodando. Hay que rotar.','Esto es nuestro. No dejemos que se nos llene de comités.']},
  mercado:{conservadora:['Por lo menos hay orden y se hacen cosas.'],liberal:['Crecemos, pero el Estado lo controla todo. Rarísimo.'],marxista:['Esto no es lo que soñábamos, pero la gente come.'],anarquista:['Han cambiado de jefe, no de sistema.'],socialdemocrata:['Hay hospitales nuevos. Eso no se puede negar.'],apolitica:['El sueldo sube. Lo demás, ni idea.'],ecologista:['Mucha obra, mucho cemento. ¿Y el campo?'],libertaria:['Me vigila más el Estado que antes el banco.']},
  conservador:{conservadora:['Por fin gente seria gobernando.'],marxista:['Bajan impuestos a los de arriba y recortan la sanidad. Lo de siempre.'],socialdemocrata:['Han cerrado otra planta del hospital.'],liberal:['A ver si ahora se puede emprender sin papeleo.']},
  progresista:{conservadora:['Mucho prometer y luego nos suben los impuestos.'],marxista:['Mejor que lo anterior, pero se quedan cortos.'],liberal:['Con tanto impuesto se van a ir las empresas.'],socialdemocrata:['Han subido el salario mínimo. Algo es algo.']},
  austeridad:{apolitica:['Han cerrado el centro de salud por las tardes.'],marxista:['Recortes para pagar a los bancos. Tienen cara.'],conservadora:['Hay que apretarse el cinturón, qué le vamos a hacer.'],socialdemocrata:['Esto es insostenible. Mi hermana se ha ido a trabajar fuera.']}};
VOZ.comunas=VOZ.consejos;
{const _pt=phTemplates;phTemplates=function(p){const L=_pt.apply(this,arguments);try{let out=L;if(revNow())out=L.filter(x=>!(typeof x[0]==='string'&&CAPI_RX.test(x[0])&&!SAFE_RX.test(x[0])));
  const w=W_();const g=w.era||w.gov;const V=VOZ[g];if(V&&p.ideo){const lines=V[p.ideo]||[];for(const t of lines)out.push([t,'gen',1.5]);}if(out!==L){L.length=0;L.push(...out);}}catch(e){}return L;};}
// ---- las noticias del móvil ----
{const _pn=phNews;phNews=function(){const L=_pn.apply(this,arguments);try{if(revNow()){const keep=L.filter(x=>!CAPI_RX.test((x[1]||'')+' '+(x[2]||'')));const extra=[['🏛️',pickR(['El consejo de distrito aprueba abrir tres comedores más','Revocados dos delegados de transporte por no rendir cuentas','La asamblea de energía raciona la calefacción de madrugada']),''],['🚢',pickR(['El bloqueo retiene un barco con medicamentos','Acuerdo con varios puertos para traer combustible','Faltan piezas para los tractores; se fabrican en el taller del barrio']),''],['🗣️',pickR(REV_QUEJAS),'']];return extra.concat(keep).slice(0,6);}
  if(merNow()){return [['⭐',pickR(MER_QUEJAS),''],...L].slice(0,6);}}catch(e){}return L;};}
