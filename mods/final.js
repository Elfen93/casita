// =================== EL FINAL: «¿qué será de Ana?» — el juego te hace la pregunta, con lo que hay ===================
const {final:TX_final}=DATA.textos_mods_ag;
function finalData(){const c=CH();const n=c.name;const age=c.age||27;const yrs=Math.max(0,(S.day-1)/365);const tr=S.track&&TRACKS[S.track];const lvlJob=S.career!=null&&typeof CAREER!=='undefined'&&CAREER[S.career]?CAREER[S.career].t:'';
  const E=typeof ED==='function'?ED():{lv:'eso',done:[],certs:[]};const M=typeof MT==='function'?MT():{an:60,dep:0,alc:0,dro:0};const H=typeof HP==='function'?HP():{list:[],peso:0,base:0};const G=typeof MG==='function'?MG():{};const L=typeof LB==='function'?LB():{pub:[],obras:[],inc:0,own:[]};
  const pt=partner();const md=P_('madre');const kids=S.kids||[];const friends=(S.people||[]).filter(p=>p.rel>=55&&!p.k.startsWith('p')&&p.k!=='madre').length;
  const homeK=(S.home&&S.home.type)||'casita';const owned=!!S.owned;const mort=S.mort;const salW=S.jobless?0:salary()*TR().days.length;const rentW=homeK==='padres'||homeK==='calle'?0:weeklyRent();
  const sav=S.money;const coti=Math.max(0,(S.shifts||0)-((S.fs&&S.fs.negroTot)||0));// turnos cotizados
  const union=!!(S.union&&S.union.member);const mov=W_().mov||0;const comp_=typeof comp==='function'?comp():0;
  return {n,age,yrs,tr,lvlJob,E,M,H,G,L,pt,md,kids,friends,homeK,owned,mort,salW,rentW,sav,coti,union,mov,comp:comp_,chaps:Object.values(storyState().chap).sort((a,b)=>a.n-b.n)};}
function finalText(){const D=finalData();const {n}=D;const o=oa();const el=o==='a'?'ella':o==='o'?'él':'elle';const mm=Math.max(1,Math.round(D.yrs*12));const yrs=D.yrs<1?huecos(TX_final.yrs_meses,{k:mm,es:mm>1?'es':''}):huecos(TX_final.yrs_anios,{k:D.yrs.toFixed(1)});const sec=[];
  const add=(t,e,body)=>sec.push({t,e,body});const X=TX_final,H=huecos;
  // ---- trabajo y pensión ----
  {let b='';const pub=D.tr&&['funcion'].includes(S.track);const self=D.tr&&(D.tr.self||D.tr.auto||D.tr.gig);
    if(S.jobless)b+=H(X.paro,{x:D.E.lv==='eso'?X.paro_eso:X.paro_formacion});
    else b+=H(X.trabaja,{puesto:D.lvlJob.toLowerCase(),sector:D.tr?D.tr.n.toLowerCase():X.trabaja_sector,x:self?H(X.t_autonomo,{}):pub?X.t_plaza:(S.rep??60)>=70?X.t_valoran:X.t_contrato});
    const pen=Math.round(D.salW*4.3*(S.jobless?.45:.62)*(D.coti>=150?1:D.coti>=60?.8:.6));
    b+='<br><br>'+H(X.pension,{v:'<b>'+fmt(pen)+'</b>',poca:D.coti<60?X.pension_poca:'',cierre:D.owned&&!D.mort?X.pension_casa:D.owned?H(X.pension_hipoteca,{a:D.age+Math.round((D.mort.weeks||0)/52)}):H(X.pension_alquiler,{x:pen<D.rentW*4.3*1.4?X.pension_no_sale:X.pension_justo})});
    if(S.record)b+=X.antecedentes;
    add(X.tit.trabajo,'💼',b);}
  // ---- casa ----
  {let b='';const Hn=HOMES[D.homeK]?HOMES[D.homeK].n:'';if(D.homeK==='calle')b=H(X.c_calle,{alb:D.G.alb?X.c_albergue:''});
    else if(D.homeK==='padres')b=H(X.c_padres,{a:D.age,x:D.md&&D.md.rel>=60?X.c_padres_bien:X.c_padres_mal});
    else if(D.owned)b=H(X.c_propia,{h:Hn,estado:D.mort?H(X.c_propia_banco,{a:Math.round((D.mort.weeks||0)/52)}):X.c_propia_suya,fin:D.mort?X.c_propia_banco_fin:X.c_propia_suya_fin});
    else b=H(X.c_alquiler,{h:Hn,r:'<b>'+fmt(D.rentW)+'</b>',gana:D.salW?H(X.c_gana,{s:fmt(D.salW)}):'',x:D.rentW>D.salW*.45?X.c_mucho:X.c_cabe,desah:D.G.evicted?H(X.c_desahucio,{k:D.G.evicted,es:D.G.evicted>1?'es':''}):'',pagar:D.G.wk>=3?X.c_sin_pagar:''});
    b+='<br><br>'+H(X.c_ahorros,{v:'<b>'+fmt(Math.round(D.sav))+'</b>',x:D.sav<0?X.c_rojos:D.sav<D.rentW*8?X.c_poco:D.sav<D.rentW*40?X.c_meses:X.c_margen});
    add(X.tit.casa,'🏠',b);}
  // ---- cuerpo y cabeza ----
  {let b='';const dx=D.H.list.filter(x=>x.dx).map(x=>HP_DEF[x.k].n.toLowerCase());const und=D.H.list.filter(x=>!x.dx).length;
    b+=dx.length?H(X.k_diag,{lista:dx.join(', ')}):X.k_sin_diag;if(und)b+=H(X.k_sin_mirar,{k:und,s:und>1?'s':''});
    const phys=['obra','super','hosteleria','cuidados','reparto','limpieza'].includes(S.track);if(phys)b+=X.k_fisico;
    const ov=D.H.peso-D.H.base;if(ov>=10)b+=X.k_peso;
    b+=`<br><br>${D.M.dep?X.k_dep:D.M.an<45?X.k_bajo:X.k_bien}${D.M.ther&&D.M.ther.on?(D.M.ther.pub?X.k_terapia_pub:H(X.k_terapia_priv,{v:fmt(hrs(7))})):D.M.an<45?X.k_sin_ayuda:''} ${D.M.alc>=3?X.k_alc:''}${D.M.dro>=3?X.k_dro:''}${D.M.sober>=30?H(X.k_sober,{k:D.M.sober}):''}`;
    add(X.tit.cuerpo,'🫀',b);}
  // ---- gente ----
  {let b='';if(D.pt)b+=H(X.g_pareja,{p:D.pt.n,juntos:['convive','casada'].includes(D.pt.stage)?X.g_juntos:'',x:(D.pt.wear||0)>40?X.g_gastada:X.g_bien});else b+=H(X.g_sola,{});
    if(D.kids.length)b+=H(X.g_hijos,{x:D.kids.length===1?H(X.g_un_hijo,{ao:D.kids[0].g==='f'?'a':'o'}):H(X.g_hijos_k,{k:D.kids.length})});
    b+=D.friends>=3?H(X.g_gente,{k:D.friends}):D.friends?H(X.g_amigo,{}):X.g_nadie;
    if(D.md)b+='<br><br>'+H(X.g_madre,{a:D.md.age||65,x:D.md.rel>=60?H(X.g_madre_bien,{}):X.g_madre_mal});
    add(X.tit.gente,'💞',b);}
  // ---- lo colectivo ----
  {let b='';const ch=storyState().chap;
    if(D.union)b+=H(X.s_afiliado,{});if(D.comp>=3)b+=X.s_militante;
    const did=[];if(ch.parado)did.push(X.s_hizo.parado);if(ch.huelga||ch.huelga1)did.push(X.s_hizo.huelga);if(S.rentStrike)did.push(X.s_hizo.alquileres);if(S.pol&&S.pol.delegada)did.push(H(X.s_hizo.delegada,{}));if(ch.vecina)did.push(X.s_hizo.vecina);
    b+=did.length?H(X.s_lista,{N:n[0].toUpperCase()+n.slice(1),lista:did.join(', ')}):H(X.s_nada,{});
    b+='<br><br>'+H(X.s_mov,{v:'<b>'+Math.round(D.mov)+' %</b>',x:D.mov>=60?X.s_mov_fuerza:D.mov>=35?X.s_mov_algo:X.s_mov_nada});
    add(X.tit.colectivo,'✊',b);}
  // ---- el oficio ----
  if(D.L.pub.length||D.L.obras.length||D.L.libDone.length>=5){let b='';if(D.L.libDone.length)b+=H(X.o_libros,{k:D.L.libDone.length});const ed=D.L.pub.filter(p=>p.how==='edit').length;if(ed)b+=H(X.o_editorial,{k:ed});const caj=D.L.pub.filter(p=>p.how==='cajon').length;if(caj)b+=H(X.o_cajon,{k:caj});if(D.L.obras.length)b+=H(X.o_cuadros,{k:D.L.obras.length});b+=H(X.o_ganado,{v:fmt(Math.round(D.L.inc)),x:D.L.inc>D.salW*20?X.o_mas:X.o_menos});add(X.tit.oficio,'✍️',b);}
  // ---- veredicto ----
  {let b=H(X.v_intro,{yrs,a:D.age})+'<br><br>';
    const score=(S.jobless?-2:D.tr&&D.tr.self?-1:1)+(D.owned?2:D.homeK==='calle'?-3:D.homeK==='padres'?-1:0)+(D.M.dep?-2:D.M.an>=60?1:0)+(D.H.list.length?-1:0)+(D.friends>=2?1:-1)+(D.sav>D.rentW*20?1:D.sav<0?-1:0)+(D.union||D.comp>=3?1:0);
    b+=score>=4?X.v_bien:
      score>=0?X.v_aguanta:
      H(X.v_mal,{lista:(S.jobless?X.v_mal_lista.paro:'')+(D.homeK==='calle'?X.v_mal_lista.calle:'')+(D.M.dep?X.v_mal_lista.dep:'')+(D.G.evicted?X.v_mal_lista.desahucio:'')+(S.record?X.v_mal_lista.ficha:'')});
    add(H(X.tit.veredicto,{}),'📜',b);}
  return sec;}
let finalEl=null;
function showFinal(auto){const sec=finalText();const D=finalData();if(!finalEl){finalEl=document.createElement('div');finalEl.id='finalwrap';document.body.appendChild(finalEl);}
  let h=`<div id="final"><h2>📜 ${auto?TX_final.ui_cierra:huecos(TX_final.ui_titulo,{n:D.n})}</h2><div class="sub">${auto?huecos(TX_final.ui_jubila,{n:D.n}):TX_final.ui_sub}</div>`;
  for(const s of sec)h+=`<h3>${s.e} ${s.t}</h3><p>${s.body}</p>`;
  h+=`<h3>${TX_final.ui_caps}</h3><p class="chaps">${D.chaps.map(c=>`<span>${c.n}. ${c.title}</span>`).join(' · ')||'—'}</p>`;
  h+=`<div class="fbtns">${auto?'':'<button class="btn" id="fcont">'+TX_final.ui_seguir+'</button>'}<button class="btn red" id="fnew">${TX_final.ui_nueva}</button></div></div>`;
  finalEl.innerHTML=h;finalEl.classList.add('on');try{speed=0;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',+x.dataset.s===0));}catch(e){}
  const fc=finalEl.querySelector('#fcont');if(fc)fc.onclick=()=>{finalEl.classList.remove('on');speed=1;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',+x.dataset.s===1));};
  finalEl.querySelector('#fnew').onclick=()=>{finalEl.classList.remove('on');chooseDifficulty(true);};}
// jubilación: a los 67 se cierra sola
{const _bc=birthdayCheck;birthdayCheck=function(){const a0=(S.char||{}).age;const r=_bc.apply(this,arguments);try{const a1=(S.char||{}).age;if(a1!==a0&&a1>=67&&!S.story.chap.jubilacion){chapter('jubilacion',TX_final.jub_titulo,huecos(TX_final.jub_texto,{x:S.jobless?TX_final.jub_paro:TX_final.jub_tarta}));setTimeout(()=>showFinal(true),1500);}}catch(e){}return r;};}
// botón en Ajustes
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{const ng=card.querySelector('#newgame');if(ng&&!card.querySelector('#finalbtn')){const b=document.createElement('button');b.className='btn grey';b.id='finalbtn';b.textContent=huecos(TX_final.boton,{});b.onclick=()=>{menu.classList.remove('open');showFinal(false);};ng.before(b);}}catch(e){}return r;};}
