// =================== EL FINAL: «¿qué será de Ana?» — el juego te hace la pregunta, con lo que hay ===================
function finalData(){const c=CH();const n=c.name;const age=c.age||27;const yrs=Math.max(0,(S.day-1)/365);const tr=S.track&&TRACKS[S.track];const lvlJob=S.career!=null&&typeof CAREER!=='undefined'&&CAREER[S.career]?CAREER[S.career].t:'';
  const E=typeof ED==='function'?ED():{lv:'eso',done:[],certs:[]};const M=typeof MT==='function'?MT():{an:60,dep:0,alc:0,dro:0};const H=typeof HP==='function'?HP():{list:[],peso:0,base:0};const G=typeof MG==='function'?MG():{};const L=typeof LB==='function'?LB():{pub:[],obras:[],inc:0,own:[]};
  const pt=partner();const md=P_('madre');const kids=S.kids||[];const friends=(S.people||[]).filter(p=>p.rel>=55&&!p.k.startsWith('p')&&p.k!=='madre').length;
  const homeK=(S.home&&S.home.type)||'casita';const owned=!!S.owned;const mort=S.mort;const salW=S.jobless?0:salary()*TR().days.length;const rentW=homeK==='padres'||homeK==='calle'?0:weeklyRent();
  const sav=S.money;const coti=Math.max(0,(S.shifts||0)-((S.fs&&S.fs.negroTot)||0));// turnos cotizados
  const union=!!(S.union&&S.union.member);const mov=W_().mov||0;const comp_=typeof comp==='function'?comp():0;
  return {n,age,yrs,tr,lvlJob,E,M,H,G,L,pt,md,kids,friends,homeK,owned,mort,salW,rentW,sav,coti,union,mov,comp:comp_,chaps:Object.values(storyState().chap).sort((a,b)=>a.n-b.n)};}
function finalText(){const D=finalData();const {n}=D;const o=oa();const el=o==='a'?'ella':o==='o'?'él':'elle';const mm=Math.max(1,Math.round(D.yrs*12));const yrs=D.yrs<1?`${mm} mes${mm>1?'es':''}`:`${D.yrs.toFixed(1)} años`;const sec=[];
  const add=(t,e,body)=>sec.push({t,e,body});
  // ---- trabajo y pensión ----
  {let b='';const pub=D.tr&&['funcion'].includes(S.track);const self=D.tr&&(D.tr.self||D.tr.auto||D.tr.gig);
    if(S.jobless)b+=`${n} está en paro. ${D.E.lv==='eso'?'Sin título, las ofertas que llegan son las mismas de siempre: turnos partidos, contratos de tres meses, "se valorará experiencia".':'Tiene formación; lo que no tiene es a nadie que le abra la puerta.'} `;
    else b+=`${n} trabaja de ${D.lvlJob.toLowerCase()} en ${D.tr?D.tr.n.toLowerCase():'lo que sale'}. ${self?'Como autónom'+o+': sin baja, sin paro, sin vacaciones pagadas. Cada mes empieza en cero.':pub?'Plaza fija: lo que para sus abuelos era normal, para su generación es un privilegio.':(S.rep??60)>=70?'Le valoran. Eso, en su sector, se traduce en más responsabilidad, no en más sueldo.':'Un contrato más. Cuando venga el siguiente recorte, la lista empieza por los que menos cobran.'} `;
    const pen=Math.round(D.salW*4.3*(S.jobless?.45:.62)*(D.coti>=150?1:D.coti>=60?.8:.6));
    b+=`<br><br>Si todo sigue igual, a los 67 cobrará unos <b>${fmt(pen)}</b> al mes de pensión${D.coti<60?' — si llega a cotizar lo suficiente; ahora mismo no':''}. ${D.owned&&!D.mort?'Con casa pagada, se puede vivir.':D.owned?'Con hipoteca hasta los '+(D.age+Math.round((D.mort.weeks||0)/52))+'.':'Pagando alquiler. '+(pen<D.rentW*4.3*1.4?'No sale. Lo sabe todo el mundo menos quien hace las leyes.':'Justo.')}`;
    if(S.record)b+=` Los antecedentes no prescriben en las entrevistas.`;
    add('Trabajo y lo que viene después','💼',b);}
  // ---- casa ----
  {let b='';const Hn=HOMES[D.homeK]?HOMES[D.homeK].n:'';if(D.homeK==='calle')b=`${n} no tiene casa. ${D.G.alb?'Conoce el albergue por su nombre.':''} Desde ahí, todo lo demás —trabajo, salud, gente— se desmorona en cadena. No es un accidente: es el diseño.`;
    else if(D.homeK==='padres')b=`${n} vive en casa de su madre, a los ${D.age}. ${D.md&&D.md.rel>=60?'Se llevan bien. Pero el día que su madre falte, ese cuarto desaparece con ella.':'No es por gusto. Un alquiler se lleva más de la mitad del sueldo.'}`;
    else if(D.owned)b=`${Hn}, ${D.mort?'del banco hasta dentro de '+Math.round((D.mort.weeks||0)/52)+' años':'suya'}. ${D.mort?'Un despido lo cambia todo; la cuota, no.':'Lo que la gente de su clase casi nunca consigue ya.'}`;
    else b=`${Hn}, de alquiler: <b>${fmt(D.rentW)}</b> a la semana${D.salW?' de '+fmt(D.salW)+' que gana':''}. ${D.rentW>D.salW*.45?'Más del 45 % del sueldo. A ese ritmo no se ahorra; se sobrevive.':'Cabe, mientras el casero no suba.'} ${D.G.evicted?'Ya la han desahuciado '+D.G.evicted+' vez'+(D.G.evicted>1?'es':'')+'.':''} ${D.G.wk>=3?'Lleva semanas sin pagar.':''}`;
    b+=`<br><br>Ahorros: <b>${fmt(Math.round(D.sav))}</b>. ${D.sav<0?'En números rojos: el banco cobra por eso.':D.sav<D.rentW*8?'Menos de dos meses de colchón. Una avería, un despido o una muela, y se acabó.':D.sav<D.rentW*40?'Unos meses de margen. Es más de lo que tiene la mayoría.':'Tiene margen. La pregunta es qué hará con él: comprar, o ayudar.'}`;
    add('Casa','🏠',b);}
  // ---- cuerpo y cabeza ----
  {let b='';const dx=D.H.list.filter(x=>x.dx).map(x=>HP_DEF[x.k].n.toLowerCase());const und=D.H.list.filter(x=>!x.dx).length;
    b+=dx.length?`Diagnosticad${o} de ${dx.join(', ')}. `:'Sin diagnósticos. ';if(und)b+=`Y ${und} cosa${und>1?'s':''} que no se ha mirado. `;
    const phys=['obra','super','hosteleria','cuidados','reparto','limpieza'].includes(S.track);if(phys)b+=`Su trabajo gasta el cuerpo: a los 55 la espalda, las rodillas o las manos pasarán factura, y la incapacidad se pelea en juzgados contra médicos de mutua. `;
    const ov=D.H.peso-D.H.base;if(ov>=10)b+=`El sobrepeso no viene de la voluntad sino del horario: comer a deshoras, dormir poco, no tener tiempo. `;
    b+=`<br><br>${D.M.dep?'Está en depresión. ':D.M.an<45?'Anda bajo de ánimo. ':'Anda bien de ánimo. '}${D.M.ther&&D.M.ther.on?(D.M.ther.pub?'Con psicóloga de la pública, cada mes y medio.':'Pagando terapia privada: '+fmt(hrs(7))+' a la semana.'):D.M.an<45?'Sin ayuda. La pública tiene lista de espera; la privada, tarifa.':''} ${D.M.alc>=3?'Bebe para aguantar. ':''}${D.M.dro>=3?'Consume. Y en su barrio, eso acaba en comisaría antes que en un centro de salud. ':''}${D.M.sober>=30?'Lleva '+D.M.sober+' días limpi'+o+'. ':''}`;
    add('Cuerpo y cabeza','🫀',b);}
  // ---- gente ----
  {let b='';if(D.pt)b+=`Con ${D.pt.n}${['convive','casada'].includes(D.pt.stage)?', viviendo juntos':''}. ${(D.pt.wear||0)>40?'La relación está gastada; el dinero y el cansancio se lo comen todo.':'Les va bien, que no es poco con la vida que llevan.'} `;else b+=`Sol${o}. `;
    if(D.kids.length)b+=`${D.kids.length===1?'Un hij'+(D.kids[0].g==='f'?'a':'o'):D.kids.length+' hijos'}: lo más caro y lo más suyo. La conciliación es una palabra; lo que hay es su madre, si puede, y turnos cambiados. `;
    b+=D.friends>=3?`Tiene gente: ${D.friends} personas a las que llamar a las tres de la mañana. Eso vale más que el sueldo.`:D.friends?`Un${o} amig${o} de verdad.`:`Nadie cerca. El aislamiento es lo primero que produce la precariedad y lo último que se nombra.`;
    if(D.md)b+=`<br><br>Su madre, ${D.md.age||65} años. ${D.md.rel>=60?'Se cuidan mutuamente. Cuando ella no pueda sola, será '+n+' quien deje horas de trabajo para cuidarla, sin que nadie se lo pague.':'Se hablan poco. Cuando ella necesite cuidados, el problema volverá igual.'} `;
    add('Gente','💞',b);}
  // ---- lo colectivo ----
  {let b='';const ch=storyState().chap;
    if(D.union)b+=`Afiliad${o} al sindicato. `;if(D.comp>=3)b+=`Militante. `;
    const did=[];if(ch.parado)did.push('paró un desahucio con el barrio');if(ch.huelga||ch.huelga1)did.push('fue a la huelga');if(S.rentStrike)did.push('está en huelga de alquileres');if(S.pol&&S.pol.delegada)did.push('es delegad'+o+' sindical');if(ch.vecina)did.push('se plantó en la puerta de una vecina');
    b+=did.length?`${n[0].toUpperCase()+n.slice(1)} ${did.join(', ')}. `:`${n} no se ha metido en nada colectivo. No es un reproche: cuando se trabaja diez horas, organizarse es un lujo. Pero sol${o} no se gana nada de lo de arriba. `;
    b+=`<br><br>El movimiento en el barrio está al <b>${Math.round(D.mov)} %</b>. ${D.mov>=60?'Hay fuerza: eso se nota en los alquileres, en los turnos, en que la policía entra con más cuidado.':D.mov>=35?'Hay algo. Falta que se junte.':'Cada uno en su casa, cada uno con su deuda. Así es como les gusta.'}`;
    add('Lo colectivo','✊',b);}
  // ---- el oficio ----
  if(D.L.pub.length||D.L.obras.length||D.L.libDone.length>=5){let b='';if(D.L.libDone.length)b+=`Ha leído ${D.L.libDone.length} libros. `;const ed=D.L.pub.filter(p=>p.how==='edit').length;if(ed)b+=`Ha publicado ${ed} con editorial. `;const caj=D.L.pub.filter(p=>p.how==='cajon').length;if(caj)b+=`${caj} en el cajón. `;if(D.L.obras.length)b+=`${D.L.obras.length} cuadros sin vender. `;b+=`Ha ganado ${fmt(Math.round(D.L.inc))} con ello: ${D.L.inc>D.salW*20?'más que algunos meses de sueldo. Raro.':'no vive de eso, ni vivirá. Lo hace igual, que es lo que lo hace valioso.'}`;add('El oficio','✍️',b);}
  // ---- veredicto ----
  {let b=`Después de ${yrs} en Casita, ${n} tiene ${D.age} años.<br><br>`;
    const score=(S.jobless?-2:D.tr&&D.tr.self?-1:1)+(D.owned?2:D.homeK==='calle'?-3:D.homeK==='padres'?-1:0)+(D.M.dep?-2:D.M.an>=60?1:0)+(D.H.list.length?-1:0)+(D.friends>=2?1:-1)+(D.sav>D.rentW*20?1:D.sav<0?-1:0)+(D.union||D.comp>=3?1:0);
    b+=score>=4?`Le va bien. Conviene recordar que la mayoría de la gente con su mismo esfuerzo no llega aquí: ha habido suerte, y ha habido gente. Lo que decida hacer con ese margen —guardarlo o compartirlo— es la pregunta que queda.`:
      score>=0?`Aguanta. Que es lo que hace casi todo el mundo: ni se hunde ni sale. El sistema está diseñado para exactamente esto: que llegues a fin de mes con lo justo para no plantarte.`:
      `Está mal, y no por lo que ha hecho. Lo que ha vivido —${S.jobless?'el paro, ':''}${D.homeK==='calle'?'la calle, ':''}${D.M.dep?'la depresión, ':''}${D.G.evicted?'el desahucio, ':''}${S.record?'la ficha policial, ':''}la factura que no llega— no son fallos personales. Son el precio que alguien cobra. Nombrarlo es el primer paso; el segundo no se da sol${o}.`;
    add('¿Qué será de '+n+'?','📜',b);}
  return sec;}
let finalEl=null;
function showFinal(auto){const sec=finalText();const D=finalData();if(!finalEl){finalEl=document.createElement('div');finalEl.id='finalwrap';document.body.appendChild(finalEl);}
  let h=`<div id="final"><h2>📜 ${auto?'Se cierra la historia':'¿Qué será de '+D.n+'?'}</h2><div class="sub">${auto?D.n+' se jubila. Esto es lo que ha quedado.':'Lo que hay ahora, y adónde lleva si nada cambia.'}</div>`;
  for(const s of sec)h+=`<h3>${s.e} ${s.t}</h3><p>${s.body}</p>`;
  h+=`<h3>📖 Capítulos</h3><p class="chaps">${D.chaps.map(c=>`<span>${c.n}. ${c.title}</span>`).join(' · ')||'—'}</p>`;
  h+=`<div class="fbtns">${auto?'':'<button class="btn" id="fcont">Seguir viviendo</button>'}<button class="btn red" id="fnew">Nueva partida</button></div></div>`;
  finalEl.innerHTML=h;finalEl.classList.add('on');try{speed=0;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',+x.dataset.s===0));}catch(e){}
  const fc=finalEl.querySelector('#fcont');if(fc)fc.onclick=()=>{finalEl.classList.remove('on');speed=1;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',+x.dataset.s===1));};
  finalEl.querySelector('#fnew').onclick=()=>{finalEl.classList.remove('on');chooseDifficulty(true);};}
// jubilación: a los 67 se cierra sola
{const _bc=birthdayCheck;birthdayCheck=function(){const a0=(S.char||{}).age;const r=_bc.apply(this,arguments);try{const a1=(S.char||{}).age;if(a1!==a0&&a1>=67&&!S.story.chap.jubilacion){chapter('jubilacion','Jubilación',`${CH().name} cumple 67. Se acabó, o eso dice el papel. ${S.jobless?'Llevaba tiempo sin trabajo; ahora al menos tiene nombre.':'En el trabajo le han hecho una tarta. Mañana su puesto lo cubre alguien con la mitad de sueldo.'}`);setTimeout(()=>showFinal(true),1500);}}catch(e){}return r;};}
// botón en Ajustes
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{const ng=card.querySelector('#newgame');if(ng&&!card.querySelector('#finalbtn')){const b=document.createElement('button');b.className='btn grey';b.id='finalbtn';b.textContent='📜 ¿Qué será de '+CH().name+'?';b.onclick=()=>{menu.classList.remove('open');showFinal(false);};ng.before(b);}}catch(e){}return r;};}
