// data/ → DATA → tablas del juego: que estén enganchadas y completas
setTimeout(()=>{try{
 const bad=[];const ok=(c,m)=>{if(!c)bad.push(m);};
 ok(typeof DATA==='object'&&Object.keys(DATA).length>=11,'DATA sin archivos');
 // las tablas son las de data/, no copias
 ok(PLACES===DATA.lugares.lugares,'PLACES');ok(OUT===DATA.lugares.salidas,'OUT');ok(HOMES===DATA.viviendas.viviendas,'HOMES');
 ok(TRACKS===DATA.profesiones.sectores,'TRACKS');ok(OBJ===DATA.objetos.objetos,'OBJ');ok(ACTV===DATA.objetos.actividades,'ACTV');
 ok(BOOKCAT===DATA.libros.catalogo,'BOOKCAT');ok(EDU_PROGS===DATA.estudios.programas,'EDU_PROGS');ok(GEST===DATA.interacciones.gestos,'GEST');
 ok(IDEOS===DATA.ideologias.ideologias,'IDEOS');ok(GOVS===DATA.gobiernos.gobiernos,'GOVS');ok(FS_GOV===DATA.gobiernos.fiscal,'FS_GOV');ok(NEEDS===DATA.reglas.necesidades,'NEEDS');
 // la lógica que se queda en el código está unida a su ficha
 for(const k of ['sindicato','militancia','manifestacion','comedor','piquete','clase','gimnasio','terapia','albergue'])ok(typeof OUT[k].req==='function','OUT.'+k+'.req');
 for(const k in GEST)ok(GEST[k].n&&GEST[k].e&&typeof GEST[k].ok==='function'&&typeof GEST[k].run==='function','GEST.'+k);
 for(const k in LAT)ok(LAT[k].n===TRAITS[k].n&&typeof LAT[k].rev==='function','LAT.'+k);
 ok(VOZ.comunas===VOZ.consejos,'VOZ.comunas');ok(FS_REF===FS_GOV.centro&&FS_SMI>0,'FS_REF');
 // lo que antes añadían los módulos al cargar ahora viene ya en los datos
 ok(PLACES.gym&&PLACES.gymbueno&&OBJ.caballete&&OBJ.fregadero&&OUT.compra&&OUT.parque&&HOMES.calle&&GOVS.mercado&&FS_GOV.mercado&&FS_GOV.comunas,'faltan fichas de módulos');
 ok(ACTV.cama.length===5&&ACTV.fregadero.length===1&&ACTV.libros.some(a=>a[0]==='estudiar'),'ACTV incompleto');
 ok(BOOKS.length===DATA.libros.en_casa.length&&BOOKS.every(b=>b[1]>0),'BOOKS');
 // y el juego arranca y vive con ellos
 const errs=[];console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,200));};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';S.pol.comp=2;initPeople();applyHome('habitacion');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 ok(S.people.length>=4&&DATA.personas.madres.includes(P_('madre').n),'gente inicial');
 for(let k=0;k<480*20;k++){update(3);dlgTick();}
 for(const [k] of MTABS)openMenu(k);menu.classList.remove('open');
 document.title=(bad.length||errs.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad,errs:errs.slice(0,5),werrs:__errs.slice(0,5),dia:S.day,secciones:Object.values(DATA).reduce((a,f)=>a+Object.keys(f).length,0)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
