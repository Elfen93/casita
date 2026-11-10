// =================== MIS LIBROS: autores, reseñas, elegir qué leer, y lo que cada libro deja ===================
const BOOK_META={
  'Cien años de soledad':['Gabriel García Márquez','Macondo, cien años, una familia. Se lee como quien escucha a una abuela que no miente.'],
  'Las uvas de la ira':['John Steinbeck','Los Joad pierden la tierra y cruzan el país buscando curro. Es de 1939 y es hoy.'],
  'Una novela negra de kiosko':['Autor anónimo','Un detective, una rubia, un crimen. Se lee en dos tardes y se olvida en una.'],
  'Nada, de Carmen Laforet':['Carmen Laforet','Andrea llega a Barcelona con una maleta y una beca. Hambre, familia rara, y una ciudad que no da nada.'],
  'La colmena':['Camilo José Cela','Trescientos personajes en un Madrid de posguerra que huele a café malo. Nadie es protagonista; nadie se salva.'],
  'Tiempo de silencio':['Luis Martín-Santos','Un investigador baja a las chabolas de Madrid. Lo que encuentra no cabe en el laboratorio.'],
  'Los santos inocentes':['Miguel Delibes','Una familia de jornaleros sirve a los señores de un cortijo. Milana bonita.'],
  'Crónica de una muerte anunciada':['Gabriel García Márquez','Todo el pueblo sabía que iban a matar a Santiago Nasar. Nadie hizo nada.'],
  'Beloved':['Toni Morrison','Una madre, una casa embrujada y lo que la esclavitud deja dentro. Duele y es necesaria.'],
  'Trilogía de la ocupación':['Patrick Modiano','París ocupada, gente que desaparece, memoria que falla. Corta, rara, se queda.'],
  'El capital (versión cómic)':['Karl Marx (adaptación)','La mercancía, la plusvalía, de dónde sale el beneficio. Con dibujos, que ya era hora.'],
  'La mano invisible (que te quita el sueldo)':['Varios','Economía para quien cobra por horas. Explica por qué «el mercado» siempre decide lo mismo.'],
  'Historia del movimiento obrero':['Varios','Doscientos años de huelgas, cooperativas y palos. Lo que no sale en el libro del cole.'],
  'Chavs: la demonización de la clase obrera':['Owen Jones','Cómo se consiguió que ser pobre pareciera culpa de los pobres. Reino Unido, pero suena cerca.'],
  'Feminismo para el 99 %':['Arruzza, Bhattacharya y Fraser','Un manifiesto corto: el feminismo o es de las trabajadoras o es de las directivas.'],
  'Los condenados de la tierra':['Frantz Fanon','Colonialismo, violencia, descolonizar la cabeza. Denso y luminoso.'],
  'Poesía de Gloria Fuertes':['Gloria Fuertes','Poemas de barrio con ternura y mala leche. Se leen en voz alta, mejor.'],
  'Manual de fontanería para torpes':['Varios','Latiguillos, sifones, por qué gotea. Se amortiza en la primera avería.'],
  'Electricidad doméstica sin sustos':['Varios','Diferencial, magnetotérmico, qué es lo que salta. Con lo justo para no electrocutarse.'],
  'El arte de cocinar con poco':['Varios','Legumbre, arroz, huevos, lo que hay. Recetas para fin de mes, sin vergüenza.'],
  'Carpintería de banco':['Varios','Ensambles, lijado, barniz. Para hacerse los muebles en vez de comprarlos a plazos.'],
  'Huerto urbano en macetas':['Varios','Tomates en el balcón, lechugas en cajas de fruta. Lo que cabe en 40 metros.'],
  'Cómo hablar en público sin morir':['Varios','Voz, pausas, manos. Para asambleas, entrevistas y el día que haya que decirle algo al jefe.'],
  'Lógica para la vida diaria':['Varios','Falacias, estadística para el periódico, cómo te engañan con porcentajes.'],
  'Armonía para guitarristas de barrio':['Varios','Acordes, cadencias, por qué suena bien. Sin solfeo.'],
  'Mientras escribo':['Stephen King','Memorias y caja de herramientas. «Escribe con la puerta cerrada, reescribe con la puerta abierta».'],
  'El oficio de escribir: cuadernos':['Varios','Diarios de escritores sobre el trabajo diario. Nadie escribe inspirado; se escribe cansado.'],
  'Cómo no escribir una novela':['Mittelmark y Newman','Doscientos errores con ejemplos ridículos. Se aprende riéndose de uno mismo.'],
  'Taller de escritura: 52 ejercicios':['Varios','Uno por semana. Describir una cocina, escribir un diálogo sin decir quién habla.'],
  'Dibujo: la mano y el ojo':['Varios','Mirar antes de dibujar. Ejercicios de línea, proporción y sombra.'],
  'Color: teoría y práctica':['Varios','Mezclas, temperatura, por qué ese azul no funciona al lado de ese rojo.'],
  'Composición para pintores':['Varios','Dónde poner las cosas en el cuadro y por qué. Con muchos ejemplos malos corregidos.'],
  'Cuadernos de Van Gogh (cartas)':['Vincent van Gogh','Cartas a su hermano Theo: dinero, pintura, dudas. Vendió un cuadro en vida.'],
};
// más libros: para que la estantería tenga de dónde elegir
BOOKCAT.push(
  ['El guardián entre el centeno',260,'📕','novela',10,{wr:.4}],['Rebelión en la granja',140,'📗','novela',8,{wr:.4}],['Fortunata y Jacinta',700,'📘','novela',18,{wr:.8}],['El camino',200,'📙','novela',9,{wr:.4}],['Patria',500,'📔','novela',14,{wr:.5}],['La plaza del Diamante',240,'📒','novela',10,{wr:.6}],['Intemperie',200,'📕','novela',10,{wr:.5}],['Lo que hay',180,'📗','novela',9,{wr:.4}],
  ['Trabajos de mierda',320,'📙','ensayo',13,{}],['Capitalismo caníbal',300,'📘','ensayo',14,{}],['La doctrina del shock',540,'📕','ensayo',16,{}],['Los hijos de los días',220,'📔','ensayo',11,{}],['Nosotros, los de abajo',260,'📒','ensayo',12,{}],
  ['Reparaciones de bici en casa',160,'🚲','manual',12,{sk:'carp'}],['Cocina de aprovechamiento',180,'🍲','manual',11,{sk:'cocina'}],['Primeros auxilios en casa',140,'🩹','manual',12,{sk:'carisma'}],
);
Object.assign(BOOK_META,{
  'El guardián entre el centeno':['J. D. Salinger','Holden, dieciséis años, tres días en Nueva York odiando a los farsantes. Todo el mundo tiene uno a esa edad.'],
  'Rebelión en la granja':['George Orwell','Los animales echan al granjero y los cerdos se ponen el sombrero. Corta y afilada.'],
  'Fortunata y Jacinta':['Benito Pérez Galdós','Madrid, dos mujeres, un señorito inútil. Setecientas páginas que se leen solas.'],
  'El camino':['Miguel Delibes','Daniel el Mochuelo, once años, la última noche antes de irse a la ciudad a «progresar».'],
  'Patria':['Fernando Aramburu','Dos familias de un pueblo vasco, treinta años, lo que no se dice. Larga y agarra.'],
  'La plaza del Diamante':['Mercè Rodoreda','Natàlia, Barcelona, la guerra, el hambre y las palomas. Sencilla y devastadora.'],
  'Intemperie':['Jesús Carrasco','Un niño huye por un campo seco. Un cabrero lo encuentra. Casi sin nombres, casi sin agua.'],
  'Lo que hay':['Sara Barquinero (apócrifo)','Una chica, un piso compartido, un trabajo de mierda y lo que hay. Corta, de ahora.'],
  'Trabajos de mierda':['David Graeber','Por qué la mitad de los empleos de oficina no sirven para nada y todo el mundo lo sabe.'],
  'Capitalismo caníbal':['Nancy Fraser','El sistema se come lo que necesita para funcionar: cuidados, naturaleza, democracia.'],
  'La doctrina del shock':['Naomi Klein','Cómo se aprovechan las catástrofes para privatizar. Chile, Irak, Nueva Orleans.'],
  'Los hijos de los días':['Eduardo Galeano','Un texto corto por cada día del año. Historias que no salen en los libros de historia.'],
  'Nosotros, los de abajo':['Varios','Testimonios de gente del barrio: la obra, la limpieza, el paro. Sin firma famosa.'],
  'Reparaciones de bici en casa':['Varios','Pinchazos, frenos, cadena. Para no pagar 40 por lo que cuesta 4.'],
  'Cocina de aprovechamiento':['Varios','Lo que sobra, convertido en cena. Croquetas de todo.'],
  'Primeros auxilios en casa':['Varios','Quemaduras, cortes, atragantamientos. Lo que conviene saber cuando la ambulancia tarda.'],
});
const bookAuthor=n=>(BOOK_META[n]||['Varios',''])[0];const bookBlurb=n=>(BOOK_META[n]||['',''])[1];
const bookSrc=n=>{const C=LB();if(C.lent===n)return 'biblioteca';if(BOOKS.some(b=>b[0]===n))return 'de casa';const t=(C.tx||[]).find(x=>x[0]==='libro'&&x[3]===n);return t?t[4]||'comprado':C.own.includes(n)?'comprado':'';};
// apuntar de dónde viene cada compra
{const _s=openShop;openShop=function(kind){_s.apply(this,arguments);try{shopEl.querySelectorAll('[data-buy]').forEach(bt=>{const prev=bt.onclick;bt.onclick=()=>{const n=bt.dataset.buy;prev();const C=LB();const t=C.tx[C.tx.length-1];if(t&&t[0]==='libro'&&!t[3]){t[3]=n;t[4]=kind==='mercadillo'?'mercadillo':'librería';}};});}catch(e){}};}
const bookFx=n=>{const b=BK(n);if(!b)return '';const fx=b[5]||{};const L=[];if(fx.wr)L.push('✍️ escribir');if(fx.art)L.push('🎨 pintar');if(fx.sk){const s=SKILLS.find(q=>q[0]===fx.sk);if(s)L.push(s[1]+' '+s[2]);}if(b[3]==='ensayo')L.push('🧠 ideas');if(b[3]==='novela'&&!fx.wr)L.push('📖');return L.join(' · ');};
// ---- la ventana «Mis libros» ----
let libEl=null,libTab='leyendo';function closeLib(){if(libEl)libEl.classList.remove('on');}
function openLib(tab){const C=LB();if(tab)libTab=tab;if(!libEl){libEl=document.createElement('div');libEl.id='libros';document.body.appendChild(libEl);}
  const all=[...new Set([...BOOKS.map(b=>b[0]),...C.own,...(C.lent?[C.lent]:[])])];const done=all.filter(n=>C.libDone.includes(n));const unread=all.filter(n=>!C.libDone.includes(n));const cur=C.reading&&unread.includes(C.reading)?C.reading:null;
  const list=libTab==='leyendo'?unread:libTab==='leidos'?done:BOOKCAT.map(b=>b[0]).filter(n=>!all.includes(n));
  let h=`<div class="omt">📚 Mis libros <span style="font-weight:400;font-size:11px;color:#8a8294">${done.length} leídos · ${unread.length} por leer</span></div><div class="libtabs">${[['leyendo','Por leer'],['leidos','Leídos'],['buscar','Qué hay por ahí']].map(([k,t])=>`<button class="${libTab===k?'on':''}" data-lt="${k}">${t}</button>`).join('')}</div>`;
  if(!list.length)h+=`<div class="sub" style="padding:10px">${libTab==='leyendo'?'Nada por leer. Librería, mercadillo o biblioteca.':libTab==='leidos'?'Todavía ninguno. Cada uno cuenta.':'Ya lo tiene todo.'}</div>`;
  for(const n of list){const b=BK(n);if(!b)continue;const pr=Math.round((C.lib[n]||0)/b[1]*100);const isCur=n===cur;
    h+=`<div class="libbook${isCur?' cur':''}"><div class="libcov" style="background:${{novela:'#7a4fa0',ensayo:'#c0262d',manual:'#2e8b57',oficio:'#e9a23b'}[b[3]]||'#888'}">${b[2]}</div><div class="libinfo"><b>${n}</b><small>${bookAuthor(n)} · ${Math.round(b[1]/60*10)/10} h${bookSrc(n)?' · '+bookSrc(n):''}${libTab==='buscar'?' · '+fmt(bookPrice(b[4])):''}</small><div class="libblurb">${bookBlurb(n)}</div><div class="libfx">${bookFx(n)}${libTab==='leyendo'&&pr?' · <b>'+pr+'%</b>':''}${isCur?' · <b style="color:#7a4fa0">leyendo ahora</b>':''}</div>${libTab==='leyendo'&&!isCur?`<button class="mini" data-read="${n}">📖 Leer este</button>`:libTab==='leidos'?`<button class="mini" data-reread="${n}">🔁 Releer</button>`:''}</div></div>`;}
  h+=`<div style="display:flex;gap:6px;padding:8px 6px 2px"><button class="btn grey" id="libgo">🚶 Ir a la librería</button><button class="btn grey" id="libpres">🏛️ Biblioteca</button><button class="btn" id="libclose">Listo</button></div>`;
  libEl.innerHTML=h;libEl.classList.add('on');
  libEl.querySelectorAll('[data-lt]').forEach(b=>b.onclick=()=>openLib(b.dataset.lt));
  libEl.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>{C.reading=b.dataset.read;toast('📖 Ahora lee «'+C.reading+'»');openLib();});
  libEl.querySelectorAll('[data-reread]').forEach(b=>b.onclick=()=>{const n=b.dataset.reread;C.libDone=C.libDone.filter(x=>x!==n);C.lib[n]=0;C.reread=C.reread||{};C.reread[n]=(C.reread[n]||0)+1;C.reading=n;toast('🔁 Vuelve a «'+n+'»'+(BK(n)&&BK(n)[5]&&BK(n)[5].sk?'. Esta vez con libreta.':''));openLib('leyendo');});
  libEl.querySelector('#libclose').onclick=closeLib;libEl.querySelector('#libgo').onclick=()=>{closeLib();menu.classList.remove('open');if(outAvail('libreria'))toast('Librería: '+outAvail('libreria'));else doOut('libreria');};libEl.querySelector('#libpres').onclick=()=>{closeLib();menu.classList.remove('open');if(outAvail('presta'))toast('Biblioteca: '+outAvail('presta'));else doOut('presta');};}
// «Elegir qué leer» abre la ventana
pickBookMenu=function(){openLib('leyendo');};
// reseña al terminar
{const _af=actFinish;actFinish=function(u,frac){const C=LB();const before=C.libDone.length;const r=_af.apply(this,arguments);try{if(C.libDone.length>before){const n=C.libDone[C.libDone.length-1];const b=BK(n);const op=pickR(b&&b[3]==='manual'?[`«${n}»: subrayado, con la esquina doblada en tres páginas. De los que se quedan en la cocina.`,`Terminado «${n}». Ya sabe hacer dos cosas que antes pagaba.`]:b&&b[3]==='ensayo'?[`«${n}»: ${CH().name} ha cerrado el libro con rabia buena. Mañana lo cuenta en el descanso.`,`Terminado «${n}». Hay frases que ha apuntado en el móvil para no olvidarlas.`,`«${n}» explica cosas que ${CH().name} ya sabía por vivirlas. Ponerles nombre ayuda.`]:[`Terminado «${n}». ${CH().name} se ha quedado un rato mirando la pared.`,`«${n}»: le ha gustado tanto que no va a prestárselo a nadie.`,`Ha terminado «${n}» en el bus, y se ha pasado la parada.`,`«${n}»: el final no le ha convencido. Lo discutirá con quien lo haya leído.`]);tell(op,'📚');}}catch(e){}return r;};}
// botón en Vida
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const C=LB();const cur=curBook();return h.replace('<h3>📚 Libros</h3>',`<h3>📚 Libros</h3><div class="sub" style="font-size:12px">${cur?'Leyendo «'+cur[0]+'» ('+Math.round((C.lib[cur[0]]||0)/cur[1]*100)+'%)':'Nada entre manos'} · ${C.libDone.length} leídos</div><button class="btn grey" id="libopen">📚 Mis libros</button>`);}catch(e){return h;}};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);try{const b=card.querySelector('#libopen');if(b)b.onclick=()=>{menu.classList.remove('open');openLib('leyendo');};}catch(e){}};}
// lo que enseña un manual se nota mientras se lee, no solo al acabar; y lo ya leído cuenta
{const _af=actFinish;actFinish=function(u,frac){const C=LB();const b0=curBook();const p0=b0?(C.lib[b0[0]]||0):0;const r=_af.apply(this,arguments);try{if(b0&&frac>=.6){const b=BK(b0[0]);const fx=b&&b[5]||{};const p1=C.libDone.includes(b0[0])?b0[1]:(C.lib[b0[0]]||0);const d=Math.max(0,p1-p0);if(d>0){const rr=1;if(fx.sk)gainSkill(fx.sk,d*.35*rr);if(fx.wr)C.wr=Math.min(10,C.wr+fx.wr*d/b0[1]*.5);if(fx.art)C.art=Math.min(10,C.art+fx.art*d/b0[1]*.5);if(fx.sk&&Math.random()<.3)floatText('📖 +'+SKILLS.find(q=>q[0]===fx.sk)[2].toLowerCase(),S.sim.x,S.sim.y,46,'#2e8b57');}}}catch(e){}return r;};}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const C=LB();C.fxDone=C.fxDone||{};for(const n of C.libDone){if(C.fxDone[n])continue;C.fxDone[n]=1;const b=BK(n);const fx=b&&b[5]||{};if(fx.sk&&!C.fxAll){gainSkill(fx.sk,90);}if(fx.wr&&!C.fxAll)C.wr=Math.min(10,C.wr+fx.wr);if(fx.art&&!C.fxAll)C.art=Math.min(10,C.art+fx.art);}C.fxAll=1;}catch(e){}return r;};}
