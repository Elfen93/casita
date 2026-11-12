// conocer a los vecinos del censo: presentarse, ficha, lazos, menores, casa del censo, escenas, partidas antiguas
let _sd=11;Math.random=()=>{_sd=(Math.imul(_sd,1664525)+1013904223)>>>0;return _sd/4294967296;};
setTimeout(()=>{try{window.__errs=window.__errs||[];const fails=[];const chk=(c,m)=>{if(!c)fails.push(m);};const info={};
 const oe=console.error;const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='socialdemocrata';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.weather={k:'sol',t:20};
 const V=DATA.personas.vecinos,vid=id=>V.find(v=>v.id===id);
 const nPre=S.people.length;
 // 1. tres adultos de hogares distintos
 const adultos=[];const hs=new Set();for(const v of V){if(v.edad>=18&&v.edad<65&&v.trabajo&&!hs.has(v.hogar)&&adultos.length<3){hs.add(v.hogar);adultos.push(v);}}
 chk(adultos.length===3,'3 adultos');
 for(const v of adultos){chk(!vcPer(v.id),'ya conocido '+v.id);const p=vcConocer(v);chk(p&&p.k==='v_'+v.id,'clave '+v.id);
  chk(S.people.filter(q=>q.k==='v_'+v.id).length===1,'una vez '+v.id);const p2=vcConocer(v);chk(p2===p&&S.people.filter(q=>q.vid===v.id).length===1,'sin duplicar '+v.id);
  chk(p.vid===v.id&&p.hogar===v.hogar&&p.n===v.n&&p.g===v.g&&p.age===v.edad,'campos '+v.id);chk(p.rel>0&&p.rel<36,'relación baja '+p.rel);
  chk(p.ideo===(v.ideo||'apolitica'),'ideo '+v.id);const lk=pbLook(v);chk(p.ch.skin===lk.skin&&p.ch.hair===lk.hair&&p.ch.shirt===lk.shirt&&p.ch.style===lk.style&&p.ch.beard===lk.beard,'aspecto '+v.id);
  chk(p.stage==='conocida'&&(p.orient==null)===!trRomOk(v),'romance solo si es adulta libre (T-122) '+v.id);chk(/·/.test(p.r)||p.r.length>3,'resumen '+p.r);}
 chk(S.people.length===nPre+3,'3 más en la lista');
 info.hogares=adultos.map(v=>v.hogar).join(',');
 // 2. nadie en dos sitios: con él de salida o en tu casa no sale en su puesto
 const v0=adultos[0],p0=vcPer(v0.id);const T=v0.trabajo;let wd=T.dias[0];while(dateOf(S.day).wd!==wd)S.day++;S.t=((T.h[0]+T.h[1])/2)*60;const h0=S.t/60;
 const aqui=()=>vecinosEn(T.lugar,h0,wd).some(q=>q.v.id===v0.id);
 chk(aqui(),'en su puesto');S.sim.work=100;S.outWith=p0.k;chk(!aqui(),'de salida con él no sale');S.outWith=null;S.sim.work=0;
 S.res=[{kind:'guest',pid:p0.k,x:1,y:1,path:[],phase:0,until:S.day*1440+S.t+120}];chk(!aqui(),'de visita en casa no sale');S.res=[];chk(aqui(),'vuelve a su puesto');
 // 3. su casa del censo con su familia
 const hog=DATA.personas.hogares,famH=Object.keys(hog).find(id=>{const ms=hog[id].miembros.map(vid);return ms.filter(q=>q.edad>=18).length>=2&&ms.length>=3&&ms.every(q=>!q.trabajo||q.edad>=18);});
 const vf=vid(hog[famH].miembros.find(m=>vid(m).edad>=18));const pf=vcConocer(vf);const he=hogarDe(pf);
 chk(he.censo&&he.hogar.id===famH&&he.miembros.length===hog[famH].miembros.length,'hogarDe censo');
 const s=S.sim;S.day=dateOf(S.day).wd===6?S.day:(()=>{let d=S.day;while(dateOf(d).wd!==6)d++;return d;})();S.t=19*60;S.outWith=pf.k;s.work=100;s.awayTotal=160;s.dest='hogar';s.outingActive='visita';
 chk(destOf('visita')==='hogar','destOf');chk(/^Casa de /.test(placeName('hogar')),'rótulo casa');
 drawScene('hogar',3,0);const nom=RT.names.map(q=>q.name);const fam=he.miembros.filter(m=>m.id!==vf.id).map(m=>m.n);
 info.casa=nom.join(',');chk(fam.some(n=>nom.includes(n)),'se ve a su familia: '+nom.join(',')+' / '+fam.join(','));
 chk(RT.names.some(q=>q.vid!=null),'figuras de la casa con vid');
 S.outWith=null;s.work=0;s.outingActive=null;s.dest=null;
 // 4. menores
 const peque=vid('alba'),teen=vid('pablo'),bebe=vid('leo');
 for(const k of [peque,bebe]){chk(vcConocer(k)===null&&!vcPer(k.id),'menor de 12 no se presenta '+k.id);const f=vcFicha(k);chk(!/data-vfp/.test(f)&&!/data-vfh/.test(f)&&/data-vfc/.test(f),'ficha de niña sin botón de presentar');
  chk(!/Presentarse/.test(f),'sin Presentarse');}
 const fa=vcFicha(peque);chk(/Hija de Nuria/.test(fa),'«Hija de Nuria»: '+fa.replace(/<[^>]+>/g,'|').slice(0,200));chk(!fa.includes(peque.d),'sin frase en la ficha de niña');
 chk(/Hijo de Tamara y Joel/.test(vcFicha(bebe)),'bebé: de quién');
 const ft=vcFicha(teen);chk(/data-vfp/.test(ft),'adolescente: se le puede presentar');
 const pt=vcConocer(teen);chk(pt&&pt.adult===false&&pt.age===14&&!canLove(pt),'adolescente conocido sin romance');
 pt.rel=60;const ft2=vcFicha(teen);chk(!/data-vfh/.test(ft2)&&/data-vfg/.test(ft2),'adolescente: sin charla suelta');chk(!/ligar|cita|pareja de|salir|romant|beso/i.test(ft2.replace(/Su pareja: <b>[^<]*<\/b>/,'')),'sin romance en su ficha');
 const gt=genteTab();const bloque=(gt.match(new RegExp('<div class="pbtn">(?:(?!</div>)[\\s\\S])*data-vf="pablo"(?:(?!</div>)[\\s\\S])*</div>'))||[''])[0];
 chk(bloque&&!/data-act|data-pm/.test(bloque),'Gente: al adolescente solo la ficha: '+bloque.slice(0,200));chk(/data-vf="paca"|data-vf="/.test(gt),'Gente: botón de ficha');
 chk(!phPeople().some(q=>q.vid==='pablo'),'adolescente fuera del móvil');pt.rel=70;chk(!vsCandidates().some(c=>c[0]===pt),'adolescente fuera de las visitas al azar');
 // 5. lazos: oficio → historia (35) → lazos (55) → conocer a través de
 const pa=vcConocer(vid('paca'))||vcPer('paca'),va=vid('paca');
 const txt=f=>f.replace(/<[^>]+>/g,' ');
 pa.rel=20;let f1=vcFicha(va);chk(!f1.includes(vcEsc(va.historia))&&!/data-vfv/.test(f1)&&f1.includes(vcOficio(va)),'rel 20: solo oficio');
 pa.rel=40;f1=vcFicha(va);chk(f1.includes(vcEsc(va.historia))&&!/data-vfv/.test(f1),'rel 40: historia, sin lazos');
 pa.rel=60;f1=vcFicha(va);chk(f1.includes(vcEsc(va.historia))&&/Su pareja: <b>Julián/.test(f1)&&/data-vfv="julian"/.test(f1)&&/data-vfv="pili"/.test(f1),'rel 60: lazos y presentar: '+txt(f1).slice(0,300));
 const antes=S.people.length;const lz=vcConocer(vid('pili'),{via:va});chk(lz&&lz.via==='paca'&&lz.rel>=14&&S.people.length===antes+1,'conocido a través de Paca');
 chk(/Ya os conocéis/.test(vcFicha(va))&&!/data-vfv="pili"/.test(vcFicha(va)),'ficha: ya conocida');
 // probabilidad: a través de alguien es mejor
 chk(vcProb(vid('julian'),va)>vcProb(vid('julian'),null)+.2,'a través de alguien, más fácil');
 // 6. partida antigua: S.people sin vid, y un hogar sin censo, no dan errores
 const keep=S.people;S.people=keep.filter(q=>q.vid==null);S.people.push({k:'p901',n:'Vieja',g:'f',age:40,rel:30,love:0,stage:'conocida',r:'',ch:randomChar('f')});
 try{genteTab();vecinosEn('bar',20,4);vcOcupados();phPeople();vsCandidates();crowd({tt:0},'bar',{W:10,D:8});}catch(e){fails.push('partida antigua: '+e.message);}
 S.people=keep;
 // 7. tocar en la escena: ficha de un vecino con nombre; fuera de él, lo de siempre
 let d=S.day;while(dateOf(d).wd!==4)d++;S.day=d;S.t=20*60;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;s.outingActive='bar';s.dest='bar';mode='live';menu.classList.remove('open');enterScene();hud();
 const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 setTimeout(()=>{try{
  const con=RT.names.filter(q=>q.vid!=null);info.nombres=RT.names.length;info.conVid=con.length;chk(con.length>0,'hay vecinos con nombre en el bar');
  if(con.length){const q=con[0],h=RT.heads[q.id];lastPtr=[h.x,h.y+h.h*1.5];const v=vcHit(lastPtr[0],lastPtr[1]);chk(v&&v.id,'vcHit');liveTap(0,0);
   const el=document.getElementById('vecficha');chk(el&&el.classList.contains('on'),'se abre la ficha al tocar');
   const ok=el&&el.textContent.includes(vecinoPorId(q.vid).n);chk(ok,'ficha del vecino tocado');
   const lab=(RT.last||[]).find(l=>l.vid!=null);if(lab){el.classList.remove('on');lastPtr=[(lab.x0+lab.x1)/2,(lab.y0+lab.y1)/2];liveTap(0,0);chk(el.classList.contains('on'),'tocar el rótulo abre la ficha');}
   el.classList.remove('on');lastPtr=[3,3];chk(vcHit(3,3)===null,'fuera de las figuras no hay vecino');liveTap(0,0);chk(!el.classList.contains('on'),'el toque de siempre no abre ficha');}
  console.error=oe;
  const errs2=errs.filter(e=>!/^Q3D model/.test(e));document.title=(fails.length||errs2.length||window.__errs.length)?'FALLA '+JSON.stringify({fails,errs:errs2.slice(0,3),w:window.__errs.slice(0,2)}):'OK '+JSON.stringify({errs:errs2,werrs:window.__errs,info});
 }catch(e){console.error=oe;document.title='ERR '+e.message+' '+e.stack.slice(0,400);}},1200);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
